
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/firebase';

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


interface AuctionContextType {
  auctions: Auction[];
  addAuction: (auction: Omit<Auction, 'id' | 'status'>) => Promise<void>;
  getAuctionById: (id: string) => Promise<Auction | undefined>;
  updateAuctionStatus: (id: string, status: AuctionStatus) => Promise<void>;
  loading: boolean;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: ReactNode }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatus = (startTime: Date, endTime: Date): AuctionStatus => {
    const now = new Date();
    if (now < startTime) return 'starting-soon';
    if (now > endTime) return 'completed';
    return 'live';
  }

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "auctions"));
      const auctionsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as AuctionData;
        const startTime = data.startTime.toDate();
        const endTime = data.endTime.toDate();
        return {
          id: doc.id,
          ...data,
          startTime,
          endTime,
          // Recalculate status on fetch in case time has passed
          status: getStatus(startTime, endTime),
        }
      });
      setAuctions(auctionsData);
      setLoading(false);
    };

    fetchAuctions();
  }, []);

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
      return {
          id: docSnap.id,
          ...data,
          startTime,
          endTime,
          status: getStatus(startTime, endTime),
      };
    } else {
      return undefined;
    }
  };

  return (
    <AuctionContext.Provider value={{ auctions, addAuction, getAuctionById, updateAuctionStatus, loading }}>
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
