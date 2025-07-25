
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase/firebase';

export interface Auction {
  id: string;
  title: string;
  description: string;
  currentLowestBid: number;
  startTime: Date;
  endTime: Date;
  imageUrl: string;
  imageHint: string;
}

export interface AuctionData {
  title: string;
  description: string;
  currentLowestBid: number;
  startTime: Timestamp;
  endTime: Timestamp;
  imageUrl: string;
  imageHint: string;
}


interface AuctionContextType {
  auctions: Auction[];
  addAuction: (auction: Omit<Auction, 'id'>) => Promise<void>;
  getAuctionById: (id: string) => Promise<Auction | undefined>;
  loading: boolean;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: ReactNode }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "auctions"));
      const auctionsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as AuctionData;
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
        }
      });
      setAuctions(auctionsData);
      setLoading(false);
    };

    fetchAuctions();
  }, []);

  const addAuction = async (auction: Omit<Auction, 'id'>) => {
    const auctionData = {
        ...auction,
        startTime: Timestamp.fromDate(auction.startTime),
        endTime: Timestamp.fromDate(auction.endTime),
    }
    const docRef = await addDoc(collection(db, "auctions"), auctionData);
    setAuctions(prevAuctions => [{...auction, id: docRef.id}, ...prevAuctions]);
  };

  const getAuctionById = async (id: string) => {
    setLoading(true);
    const docRef = doc(db, "auctions", id);
    const docSnap = await getDoc(docRef);
    setLoading(false);

    if (docSnap.exists()) {
      const data = docSnap.data() as AuctionData;
      return {
          id: docSnap.id,
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
      };
    } else {
      return undefined;
    }
  };

  return (
    <AuctionContext.Provider value={{ auctions, addAuction, getAuctionById, loading }}>
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
