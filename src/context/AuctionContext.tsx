
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, Timestamp, updateDoc, writeBatch, query, onSnapshot, orderBy } from "firebase/firestore";
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

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "auctions"));
    const auctionsData = querySnapshot.docs.map(doc => {
      const data = doc.data() as AuctionData;
      const startTime = data.startTime.toDate();
      const endTime = data.endTime.toDate();
      const status = getStatus(startTime, endTime);
      
      // If status changed, update it in DB
      if (status !== data.status) {
          const auctionRef = doc(db, 'auctions', doc.id);
          updateDoc(auctionRef, { status });
      }

      return {
        id: doc.id,
        ...data,
        startTime,
        endTime,
        status,
      }
    });
    setAuctions(auctionsData);
    setLoading(false);
  }, []);


  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const addAuction = async (auction: Omit<Auction, 'id' | 'status'>) => {
    const status = getStatus(auction.startTime, auction.endTime);
    
    const auctionData = {
        ...auction,
        startTime: Timestamp.fromDate(auction.startTime),
        endTime: Timestamp.fromDate(auction.endTime),
        status,
    }
    const docRef = await addDoc(collection(db, "auctions"), auctionData);
    setAuctions(prevAuctions => [{...auction, id: docRef.id, status}, ...prevAuctions]);
  };
  
  const updateAuctionStatus = async (id: string, status: AuctionStatus) => {
      const auctionRef = doc(db, 'auctions', id);
      await updateDoc(auctionRef, { status });
      setAuctions(prev => prev.map(a => a.id === id ? {...a, status} : a));
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
      
      if (status !== data.status) {
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

  const submitBid = async (auctionId: string, bidData: Omit<Bid, 'id' | 'time'> & { time: Date | Timestamp }, currentLowestBid: number) => {
      if (!user) throw new Error("User not authenticated");

      const batch = writeBatch(db);
      
      const bidPayload = {
          ...bidData,
          time: Timestamp.fromDate(new Date()),
      }

      // Add bid to subcollection
      const newBidRef = doc(collection(db, "auctions", auctionId, "bids"));
      batch.set(newBidRef, bidPayload);

      // Update currentLowestBid on auction document if this bid is lower
      if (bidData.amount < currentLowestBid) {
          const auctionRef = doc(db, "auctions", auctionId);
          batch.update(auctionRef, { currentLowestBid: bidData.amount });
      }
      
      await batch.commit();

      // Update local state for immediate UI feedback
      setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, currentLowestBid: Math.min(a.currentLowestBid, bidData.amount)} : a));
  }

  const getBidsForAuction = (auctionId: string, callback: (bids: Bid[]) => void) => {
    const q = query(collection(db, "auctions", auctionId, "bids"), orderBy('amount', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bids = querySnapshot.docs.map(doc => {
            const data = doc.data() as BidData;
            return {
                id: doc.id,
                ...data,
                time: data.time.toDate(),
            };
        });
        callback(bids);
    });

    return unsubscribe; // Return the unsubscribe function to be called on cleanup
  };


  return (
    <AuctionContext.Provider value={{ auctions, addAuction, getAuctionById, updateAuctionStatus, submitBid, getBidsForAuction, loading }}>
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
