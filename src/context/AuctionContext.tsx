
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const mockAuctions: Auction[] = [
  {
    id: "1",
    title: "Government Contract for Office Supplies",
    description: "Seeking bids for a 12-month contract to supply standard office materials.",
    currentLowestBid: 15000,
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Started yesterday
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "office supplies"
  },
  {
    id: "2",
    title: "Website Redesign Project",
    description: "Complete overhaul of a corporate website. Seeking experienced development agencies.",
    currentLowestBid: 8500,
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Starts tomorrow
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "web design"
  },
  {
    id: "3",
    title: "Landscaping Services for Business Park",
    description: "Year-round landscaping and maintenance services for a 5-acre business park.",
    currentLowestBid: 22000,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ended yesterday
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "landscaping park"
  },
  {
    id: "4",
    title: "Janitorial Services Contract",
    description: "Nightly cleaning services for a 50,000 sq ft office building.",
    currentLowestBid: 7800,
    startTime: new Date(Date.now()), // Starts now
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "cleaning service"
  },
];


interface AuctionContextType {
  auctions: Auction[];
  addAuction: (auction: Auction) => void;
  getAuctionById: (id: string) => Auction | undefined;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: ReactNode }) => {
  const [auctions, setAuctions] = useState<Auction[]>(mockAuctions);

  const addAuction = (auction: Auction) => {
    setAuctions(prevAuctions => [auction, ...prevAuctions]);
  };

  const getAuctionById = (id: string) => {
    return auctions.find(auction => auction.id === id);
  };

  return (
    <AuctionContext.Provider value={{ auctions, addAuction, getAuctionById }}>
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
