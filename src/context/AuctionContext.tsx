
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, Timestamp, updateDoc, writeBatch, query, onSnapshot, orderBy, where, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from '@/lib/firebase/firebase';
import { useAuth } from './AuthContext';

export type AuctionStatus = 'live' | 'starting-soon' | 'completed';

export interface Review {
  id?: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName: string;
  reviewedUserId: string;
  time: Date;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  currentLowestBid: number;
  startTime: Date;
  endTime: Date;
  status: AuctionStatus;
  winnerId?: string;
  secretKey?: string | null;
  winnerReview?: Review;
  adminReview?: Review;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuctionData {
  title: string;
  description: string;
  currentLowestBid: number;
  startTime: Timestamp;
  endTime: Timestamp;
  status: AuctionStatus;
  winnerId?: string;
  secretKey?: string | null;
  winnerReview?: Review;
  adminReview?: Review;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Bid {
  id: string;
  userId: string;
  user: string;
  amount: number;
  time: Date;
  auctionId: string;
  auctionTitle: string;
}

export interface BidData {
    userId: string;
    user: string;
    amount: number;
    time: Timestamp;
    auctionId: string;
    auctionTitle: string;
}


interface AuctionContextType {
  auctions: Auction[];
  addAuction: (auction: Omit<Auction, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getAuctionById: (id: string) => Promise<Auction | undefined>;
  updateAuctionStatus: (id: string, status: AuctionStatus) => Promise<void>;
  submitBid: (auctionId: string, bidData: Omit<Bid, 'id' | 'time' | 'auctionId' | 'auctionTitle' | 'auctionId' | 'auctionTitle'>, currentLowestBid: number) => Promise<void>;
  getBidsForAuction: (auctionId: string, callback: (bids: Bid[]) => void) => () => void;
  getBidsForUser: (userId: string) => Promise<Bid[]>;
  deleteAuction: (id: string) => Promise<void>;
  listenToAuction: (id: string, callback: (auction: Auction | null) => void) => () => void;
  submitReview: (auctionId: string, reviewData: { [key: string]: Review }) => Promise<void>;
  getReviewsForUser: (userId: string) => Promise<Review[]>;
  loading: boolean;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

const getStatus = (startTime: Date, endTime: Date): AuctionStatus => {
  const now = new Date();
  if (now < startTime) return 'starting-soon';
  if (now >= endTime) return 'completed';
  return 'live';
}

export const AuctionProvider = ({ children }: { children: ReactNode }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();


  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "auctions"), orderBy("startTime", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const auctionsData = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data() as AuctionData;
            const startTime = data.startTime.toDate();
            const endTime = data.endTime.toDate();
            
            return {
                id: docSnapshot.id,
                ...data,
                startTime,
                endTime,
                status: getStatus(startTime, endTime),
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt?.toDate() || data.createdAt.toDate(),
            }
        });
        setAuctions(auctionsData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effect to update statuses in real-time on the client
  useEffect(() => {
    const interval = setInterval(() => {
        setAuctions(prevAuctions => {
            let hasChanged = false;
            const updatedAuctions = prevAuctions.map(auction => {
                const newStatus = getStatus(auction.startTime, auction.endTime);
                if (auction.status !== newStatus) {
                    hasChanged = true;
                    // Note: We don't update the DB here anymore to avoid race conditions.
                    // The primary status update should happen on the action that triggers it,
                    // or a dedicated backend process. This client-side update is for UI reactivity.
                    return { ...auction, status: newStatus };
                }
                return auction;
            });

            return hasChanged ? updatedAuctions : prevAuctions;
        });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const addAuction = async (auction: Omit<Auction, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const status = getStatus(auction.startTime, auction.endTime);
    
    const auctionData = {
        ...auction,
        startTime: Timestamp.fromDate(auction.startTime),
        endTime: Timestamp.fromDate(auction.endTime),
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }
    await addDoc(collection(db, "auctions"), auctionData);
  };
  
  const updateAuctionStatus = async (id: string, status: AuctionStatus) => {
      const auctionRef = doc(db, 'auctions', id);
      const auctionInState = auctions.find(a => a.id === id);

      // Prevent re-updating if status is already correct in DB or state
      if (auctionInState?.status === 'completed' && status === 'completed') return;

      const updateData: {status: AuctionStatus, winnerId?: string, updatedAt: any} = { status, updatedAt: serverTimestamp() };

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
      const createdAt = data.createdAt.toDate();
      const updatedAt = data.updatedAt?.toDate() || data.createdAt?.toDate();
      const status = getStatus(startTime, endTime);
      
      return {
          id: docSnap.id,
          ...data,
          startTime,
          endTime,
          status,
          createdAt,
          updatedAt,
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
        const createdAt = data.createdAt.toDate();
        const updatedAt = data.updatedAt?.toDate() || data.createdAt?.toDate();
        
        callback({
          id: docSnap.id,
          ...data,
          startTime,
          endTime,
          status: getStatus(startTime, endTime),
          createdAt,
          updatedAt,
        });
      } else {
        callback(null); // Document does not exist or was deleted
      }
    });

    return unsubscribe;
  };

  const submitBid = async (auctionId: string, bidData: Omit<Bid, 'id' | 'time' | 'auctionId' | 'auctionTitle'>, currentLowestBid: number) => {
    if (!user) throw new Error("User not authenticated");

    const auctionDoc = await getDoc(doc(db, 'auctions', auctionId));
    if (!auctionDoc.exists()) throw new Error("Auction not found");
    const auctionTitle = auctionDoc.data().title;
    
    const bidPayload = {
      ...bidData,
      time: Timestamp.fromDate(new Date()),
      auctionId: auctionId,
      auctionTitle: auctionTitle,
    };
    
    // Check if user already has a bid, if so, update it. Otherwise, create a new one.
    const userBidsQuery = query(collection(db, "auctions", auctionId, "bids"), where("userId", "==", user.uid));
    const userBidsSnapshot = await getDocs(userBidsQuery);

    const batch = writeBatch(db);
    if (!userBidsSnapshot.empty) {
        // User has an existing bid, update it
        const bidDocRef = userBidsSnapshot.docs[0].ref;
        batch.update(bidDocRef, bidPayload);
    } else {
        // New bid for this user
        const newBidRef = doc(collection(db, "auctions", auctionId, "bids"));
        batch.set(newBidRef, bidPayload);
    }

    const auctionRef = doc(db, "auctions", auctionId);
    batch.update(auctionRef, { currentLowestBid: bidData.amount, updatedAt: serverTimestamp() });
    
    await batch.commit();
  };

  const getBidsForAuction = (auctionId: string, callback: (bids: Bid[]) => void) => {
    const q = query(collection(db, "auctions", auctionId, "bids"), orderBy('amount', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bids = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data() as BidData;
            return { id: docSnapshot.id, ...data, time: data.time.toDate() };
        });
        callback(bids);
    });

    return unsubscribe;
  };

  const getBidsForUser = useCallback(async (userId: string): Promise<Bid[]> => {
    const allBids: Bid[] = [];
    if (!auctions.length) return [];
    
    for (const auction of auctions) {
        const bidsQuery = query(collection(db, "auctions", auction.id, "bids"), where("userId", "==", userId));
        const bidsSnapshot = await getDocs(bidsQuery);
        bidsSnapshot.forEach(bidDoc => {
            const data = bidDoc.data() as BidData;
            allBids.push({ id: bidDoc.id, ...data, time: data.time.toDate() });
        });
    }

    return allBids.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [auctions]);

  const deleteAuction = async (id: string) => {
    const batch = writeBatch(db);

    const bidsRef = collection(db, 'auctions', id, 'bids');
    const bidsSnapshot = await getDocs(bidsRef);
    bidsSnapshot.forEach((bidDoc) => { batch.delete(bidDoc.ref); });

    const messagesRef = collection(db, 'auctions', id, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    messagesSnapshot.forEach((msgDoc) => { batch.delete(msgDoc.ref); });

    const auctionRef = doc(db, 'auctions', id);
    batch.delete(auctionRef);
    
    await batch.commit();
  };
  
  const submitReview = async (auctionId: string, reviewData: { [key: string]: Review }) => {
    const auctionRef = doc(db, 'auctions', auctionId);
    await updateDoc(auctionRef, { ...reviewData, updatedAt: serverTimestamp() });
  };

  const getReviewsForUser = useCallback(async (userId: string): Promise<Review[]> => {
    const allReviews: Review[] = [];
    const qWinner = query(collection(db, 'auctions'), where('winnerId', '==', userId));
    const winnerSnapshot = await getDocs(qWinner);
    winnerSnapshot.forEach(doc => {
        const data = doc.data() as AuctionData;
        if (data.adminReview) allReviews.push({ id: doc.id, ...data.adminReview });
    });

    if(userId === 'admin'){ // A special case to get reviews for the admin
        const allAuctionsSnapshot = await getDocs(collection(db, 'auctions'));
        allAuctionsSnapshot.forEach(doc => {
            const data = doc.data() as AuctionData;
            if(data.winnerReview) allReviews.push({ id: doc.id, ...data.winnerReview });
        });
    }

    return allReviews.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, []);


  return (
    <AuctionContext.Provider value={{ auctions, addAuction, getAuctionById, updateAuctionStatus, submitBid, getBidsForAuction, deleteAuction, listenToAuction, loading, getBidsForUser, submitReview, getReviewsForUser }}>
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
