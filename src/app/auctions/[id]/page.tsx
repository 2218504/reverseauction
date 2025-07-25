
"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CountdownTimer from "@/components/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { Bell, DollarSign, Gavel, History, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useAuctions, Auction, AuctionStatus, Bid } from "@/context/AuctionContext";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function AuctionPage({ params }: { params: { id: string } }) {
  const { id: auctionId } = params;
  const { toast } = useToast();
  const { getAuctionById, updateAuctionStatus, submitBid, getBidsForAuction } = useAuctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [auction, setAuction] = useState<Auction | undefined | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isInitialized = useRef(false);

  // Fetch auction data once
  useEffect(() => {
    if (!auctionId || isInitialized.current) return;
    
    const fetchAuction = async () => {
      setPageLoading(true);
      try {
        const fetchedAuction = await getAuctionById(auctionId);
        if (fetchedAuction) {
          setAuction(fetchedAuction);
          if (fetchedAuction.status === 'completed') {
              setIsFinished(true);
          } else {
              setIsFinished(new Date() > new Date(fetchedAuction.endTime));
          }
        } else {
           setAuction(null); // Auction not found
        }
        isInitialized.current = true;
      } catch (error) {
        console.error('Error fetching auction:', error);
        toast({ variant: 'destructive', title: "Error", description: "Could not load auction data."})
      } finally {
        setPageLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId, getAuctionById, toast]);

  // Set up real-time listener for bids
  useEffect(() => {
    if (!auctionId) return;

    const unsubscribe = getBidsForAuction(auctionId, (newBids) => {
      setBids(newBids);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [auctionId, getBidsForAuction]);


  const handleExpire = useCallback(() => {
    if (auction && auction.status !== 'completed') {
        setIsFinished(true);
        updateAuctionStatus(auction.id, 'completed');
    }
  }, [auction, updateAuctionStatus]);
  
  // Derived state from bids and auction
  const userCurrentBid = user ? bids.find(bid => bid.userId === user.uid) : null;
  const uniqueBidders = new Set(bids.map(bid => bid.userId)).size;
  const winner = isFinished && bids.length > 0 ? bids[0] : null; // Bids are sorted by amount asc

  // Update bid input when user has an existing bid
  useEffect(() => {
    if (userCurrentBid) {
      setBidAmount(userCurrentBid.amount.toString());
    }
  }, [userCurrentBid]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction || !user || isSubmitting) return;

    setIsSubmitting(true);

    const newBidAmount = parseFloat(bidAmount);
    if (isNaN(newBidAmount) || newBidAmount <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Bid",
            description: "Please enter a valid bid amount.",
        });
        setIsSubmitting(false);
        return;
    }
    
    // Reverse auction logic: bid must be lower than the current lowest bid
    if (newBidAmount >= auction.currentLowestBid) {
      toast({
        variant: "destructive",
        title: "Invalid Bid",
        description: `Your bid must be lower than the current lowest bid of $${auction.currentLowestBid.toLocaleString()}.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const bidData = {
        userId: user.uid,
        user: user.displayName || "Anonymous",
        amount: newBidAmount,
      };

      await submitBid(auction.id, bidData, auction.currentLowestBid);
      
      toast({
        title: "Bid Placed!",
        description: `Your bid of $${newBidAmount.toLocaleString()} has been successfully submitted.`,
      });

      // After successful submission, we let the real-time listener update the state.
      // We don't need to manually clear the input, it will be updated by the useEffect for userCurrentBid
      
    } catch (error: any) {
        console.error("Failed to submit bid:", error);
        toast({
            variant: "destructive",
            title: "Bid Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (pageLoading || authLoading) {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-96 w-full rounded-lg mb-6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6 md:col-span-1">
                 <Card className="sticky top-24">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-6 w-1/4 mx-auto" />
                        <Separator />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
  }

  if (!auction) {
    return <Card><CardHeader><CardTitle>Auction Not Found</CardTitle><CardDescription>The auction you are looking for does not exist or may have been deleted.</CardDescription></CardHeader></Card>;
  }
  
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <h1 className="text-4xl font-headline font-bold">{auction.title}</h1>
            <CardDescription>Auction ID: {auction.id}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
                <Image src={auction.imageUrl} alt={auction.title} fill objectFit="cover" data-ai-hint={auction.imageHint} />
            </div>
            <p className="text-muted-foreground">{auction.description}</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><History /> Bid History</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {bids.map((bid) => {
                        const isUserBid = user && bid.userId === user.uid;
                        return (
                          <li 
                            key={bid.id} 
                            className={`flex justify-between items-center p-3 rounded-md ${
                              isUserBid 
                                ? 'bg-blue-50 border-2 border-blue-200' 
                                : 'bg-secondary/50'
                            }`}
                          >
                            <div className="flex items-center">
                                <User className="h-5 w-5 mr-3 text-muted-foreground"/>
                                <span className="font-medium">
                                  {bid.user}
                                  {isUserBid && <span className="text-blue-600 ml-1">(You)</span>}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${isUserBid ? 'text-blue-600' : ''}`}>
                                  ${bid.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">{bid.time.toLocaleTimeString()}</p>
                            </div>
                          </li>
                        );
                      })}
                    {bids.length === 0 && <p className="text-center text-muted-foreground py-4">No bids yet. Be the first!</p>}
                </ul>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6 md:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Gavel />
              Auction Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary font-medium">Current Lowest Bid</p>
                <p className="text-4xl font-bold text-primary">${auction.currentLowestBid.toLocaleString()}</p>
            </div>
              
            <div className="text-center border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {auction.status === 'live' && 'Time Remaining'}
                  {auction.status === 'starting-soon' && 'Time Until Start'}
                  {auction.status === 'completed' && 'Auction Ended'}
                </p>
                <div className="text-xl font-bold">
                    <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} onExpire={handleExpire} />
                </div>
            </div>

            <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
                <Users className="h-4 w-4" /> 
                <span>{uniqueBidders} {uniqueBidders === 1 ? 'bidder' : 'bidders'}</span>
            </div>

            <Separator />
            
            {isFinished ? (
                 <Alert className="border-green-500 text-green-700">
                    <Bell className="h-4 w-4 !text-green-700" />
                    <AlertTitle className="font-headline text-green-800">Auction Ended!</AlertTitle>
                    <AlertDescription>
                        {winner ? (
                          <>The winner is <span className="font-bold">{winner?.user}</span> with a bid of <span className="font-bold">${winner?.amount.toLocaleString()}</span>.</>
                        ) : "No bids were placed."}
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-3">
                    {userCurrentBid && (
                      <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Your Current Bid</p>
                        <p className="text-2xl font-bold text-blue-700">${userCurrentBid.amount.toLocaleString()}</p>
                      </div>
                    )}
                    
                    <form onSubmit={handleBidSubmit} className="space-y-3">
                        <h3 className="font-semibold font-headline text-center">
                          {userCurrentBid ? "Update Your Bid" : "Place Your Bid"}
                        </h3>
                        <div>
                            <Label htmlFor="bid" className="sr-only">Bid Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    id="bid" 
                                    type="number" 
                                    step="any"
                                    placeholder={userCurrentBid ? `Lower than $${userCurrentBid.amount.toLocaleString()}` : `Lower than $${auction.currentLowestBid.toLocaleString()}`}
                                    className="pl-10 text-lg h-12"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    required 
                                    disabled={isSubmitting || !user || auction.status !== 'live'}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !user || auction.status !== 'live'}>
                            {isSubmitting ? 'Submitting...' : !user ? "Login to Bid" : auction.status !== 'live' ? "Auction Not Live" : userCurrentBid ? "Update Bid" : "Submit Bid"}
                        </Button>
                    </form>
                </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
