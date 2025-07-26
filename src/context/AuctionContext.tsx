
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, Timestamp, updateDoc, writeBatch, query, onSnapshot, orderBy, where, deleteDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/firebase';
import { useAuth } from './AuthContext';

export type AuctionStatus = 'live' | 'starting-soon' | 'completed';

export interface Auction {
  id: string;
  title: string;
  description: string;
  currentLowestBid: number;
  startTime: Date;
  endTime: Date;
  imageUrl: string;
  imageHint: string;
  status: AuctionStatus;
  winnerId?: string;
}

export interface AuctionData {
  title: string;
  description: string;
  currentLowestBid: number;
  startTime: Timestamp;
  endTime: Timestamp;
  imageUrl: string;
  imageHint: string;
  status: AuctionStatus;
  winnerId?: string;
}

export interface Bid {
  id: string;
  userId: string;
  user: string;
  amount: number;
  time: Date;
}

export interface BidData {
    userId: string;
    user: string;
    amount: number;
    time: Timestamp;
}


interface AuctionContextType {
  auctions: Auction[];
  addAuction: (auction: Omit<Auction, 'id' | 'status'>) => Promise<void>;
  getAuctionById: (id: string) => Promise<Auction | undefined>;
  updateAuctionStatus: (id: string, status: AuctionStatus) => Promise<void>;
  submitBid: (auctionId: string, bidData: Omit<Bid, 'id' | 'time'> & { time: Date | Timestamp }, currentLowestBid: number) => Promise<void>;
  getBidsForAuction: (auctionId: string, callback: (bids: Bid[]) => void) => () => void;
  deleteAuction: (id: string) => Promise<void>;
  listenToAuction: (id: string, callback: (auction: Auction | null) => void) => () => void;
  loading: boolean;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: ReactNode }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getStatus = (startTime: Date, endTime: Date): AuctionStatus => {
    const now = new Date();
    if (now < startTime) return 'starting-soon';
    if (now > endTime) return 'completed';
    return 'live';
  }

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "auctions"), orderBy("startTime", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const auctionsData = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data() as AuctionData;
            const startTime = data.startTime.toDate();
            const endTime = data.endTime.toDate();
            const status = getStatus(startTime, endTime);
            
            if (status !== data.status && data.status !== 'completed') {
                const auctionRef = doc(db, 'auctions', docSnapshot.id);
                updateDoc(auctionRef, { status });
            }

            return {
                id: docSnapshot.id,
                ...data,
                startTime,
                endTime,
                status,
            }
        });
        setAuctions(auctionsData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const addAuction = async (auction: Omit<Auction, 'id' | 'status'>) => {
    const status = getStatus(auction.startTime, auction.endTime);
    
    const auctionData = {
        ...auction,
        startTime: Timestamp.fromDate(auction.startTime),
        endTime: Timestamp.fromDate(auction.endTime),
        status,
    }
    await addDoc(collection(db, "auctions"), auctionData);
  };
  
  const updateAuctionStatus = async (id: string, status: AuctionStatus) => {
      const auctionRef = doc(db, 'auctions', id);
      const updateData: {status: AuctionStatus, winnerId?: string} = { status };

      if (status === 'completed') {
        const bidsQuery = query(collection(db, "auctions", id, "bids"), orderBy("amount", "asc"), where("amount", ">", 0));
        const bidsSnapshot = await getDocs(bidsQuery);
        if (!bidsSnapshot.empty) {
            const winningBid = bidsSnapshot.docs[0].data() as BidData;
            updateData.winnerId = winningBid.userId;

            const userRef = doc(db, 'users', winningBid.userId);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()){
                const userData = userSnap.data();
                const wonAuctions = userData.wonAuctions || [];
                if(!wonAuctions.includes(id)){
                    await updateDoc(userRef, {
                        wonAuctions: [...wonAuctions, id]
                    });
                }
            }
        }
      }
      
      await updateDoc(auctionRef, updateData);
  }

  const getAuctionById = async (id: string) => {
    setLoading(true);
    const docRef = doc(db, "auctions", id);
    const docSnap = await getDoc(docRef);
    setLoading(false);

    if (docSnap.exists()) {
      const data = docSnap.data() as AuctionData;
      const startTime = data.startTime.toDate();
      const endTime = data.endTime.toDate();
      const status = getStatus(startTime, endTime);
      
      if (status !== data.status && data.status !== 'completed') {
          updateDoc(docRef, { status });
      }

      return {
          id: docSnap.id,
          ...data,
          startTime,
          endTime,
          status,
      };
    } else {
      return undefined;
    }
  };
  
  const listenToAuction = (id: string, callback: (auction: Auction | null) => void) => {
    const docRef = doc(db, 'auctions', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AuctionData;
        const startTime = data.startTime.toDate();
        const endTime = data.endTime.toDate();
        const status = getStatus(startTime, endTime);

        if (status !== data.status && data.status !== 'completed') {
          updateDoc(docRef, { status });
        }

        callback({
          id: docSnap.id,
          ...data,
          startTime,
          endTime,
          status,
        });
      } else {
        callback(null); // Document does not exist or was deleted
      }
    });

    return unsubscribe;
  };


  const submitBid = async (auctionId: string, bidData: Omit<Bid, 'id' | 'time'> & { time: Date | Timestamp }, currentLowestBid: number) => {
      if (!user) throw new Error("User not authenticated");

      const batch = writeBatch(db);
      
      const bidPayload = {
          ...bidData,
          time: Timestamp.fromDate(new Date()),
      }

      const newBidRef = doc(collection(db, "auctions", auctionId, "bids"));
      batch.set(newBidRef, bidPayload);

      const auctionRef = doc(db, "auctions", auctionId);
      batch.update(auctionRef, { currentLowestBid: bidData.amount });
      
      await batch.commit();
  }

  const getBidsForAuction = (auctionId: string, callback: (bids: Bid[]) => void) => {
    const q = query(collection(db, "auctions", auctionId, "bids"), orderBy('amount', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bids = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data() as BidData;
            return {
                id: docSnapshot.id,
                ...data,
                time: data.time.toDate(),
            };
        });
        callback(bids);
    });

    return unsubscribe;
  };

  const deleteAuction = async (id: string) => {
    // First, delete all bids in the subcollection
    const bidsRef = collection(db, 'auctions', id, 'bids');
    const bidsSnapshot = await getDocs(bidsRef);
    const batch = writeBatch(db);
    bidsSnapshot.forEach((bidDoc) => {
        batch.delete(bidDoc.ref);
    });
    await batch.commit();

    // Then, delete the auction document itself
    const auctionRef = doc(db, 'auctions', id);
    await deleteDoc(auctionRef);
  }


  return (
    <AuctionContext.Provider value={{ auctions, addAuction, getAuctionById, updateAuctionStatus, submitBid, getBidsForAuction, deleteAuction, listenToAuction, loading }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuctions = () => {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuctions must be used within an AuctionProvider');
  }
  return context;
};
