
"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CountdownTimer from "@/components/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { Bell, DollarSign, Gavel, History, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useAuctions, Auction } from "@/context/AuctionContext";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type Bid = {
  user: string;
  amount: number;
  time: Date;
};

export default function AuctionPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { getAuctionById } = useAuctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [auction, setAuction] = useState<Auction | undefined | null>(null);

  const [isFinished, setIsFinished] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentLowestBid, setCurrentLowestBid] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchAuction = useCallback(async (id: string) => {
    setPageLoading(true);
    const fetchedAuction = await getAuctionById(id);
    setAuction(fetchedAuction);
    if (fetchedAuction) {
        // In a real app, bids would be fetched for the auction
        // For now, let's keep mock bids or an empty array
        setBids([]);
        setCurrentLowestBid(fetchedAuction.currentLowestBid);
        if (fetchedAuction.endTime) {
            setIsFinished(new Date() > new Date(fetchedAuction.endTime));
        }
    }
    setPageLoading(false);
  }, [getAuctionById]);

  useEffect(() => {
    if (params.id) {
        fetchAuction(params.id as string);
    }
  }, [params.id, fetchAuction]);


  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLowestBid === null) return;
    
    if(!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to place a bid.",
        });
        router.push('/login');
        return;
    }

    const newBid = parseFloat(bidAmount);
    if (isNaN(newBid) || newBid <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Bid",
            description: "Please enter a valid bid amount.",
        });
        return;
    }

    if (newBid >= currentLowestBid) {
      toast({
        variant: "destructive",
        title: "Invalid Bid",
        description: `Your bid must be lower than the current lowest bid of $${currentLowestBid.toLocaleString()}.`,
      });
      return;
    }

    const newBidEntry = { user: user.displayName || "You", amount: newBid, time: new Date() };
    setBids(prevBids => [newBidEntry, ...prevBids]);
    setCurrentLowestBid(newBid);
    setBidAmount("");
    toast({
      title: "Bid Placed!",
      description: `Your bid of $${newBid.toLocaleString()} has been successfully submitted.`,
    });
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

  if (auction === undefined) {
    return <div>Auction not found</div>;
  }
  
  const winner = bids.length > 0 ? bids.sort((a,b) => a.amount - b.amount)[0] : null;

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
                    {bids.map((bid, index) => (
                        <li key={index} className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                            <div className="flex items-center">
                                <User className="h-5 w-5 mr-3 text-muted-foreground"/>
                                <span className="font-medium">{bid.user}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">${bid.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{bid.time.toLocaleTimeString()}</p>
                            </div>
                        </li>
                    ))}
                    {bids.length === 0 && <p className="text-center text-muted-foreground">No bids yet.</p>}
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
             {currentLowestBid !== null && (
                <div className="text-center bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-primary font-medium">Current Lowest Bid</p>
                    <p className="text-4xl font-bold text-primary">${currentLowestBid.toLocaleString()}</p>
                </div>
              )}

            <div className="text-center border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
                <div className="text-xl font-bold">
                    <CountdownTimer endTime={auction.endTime} onExpire={() => setIsFinished(true)} />
                </div>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
                <Users className="h-4 w-4" /> <span>{bids.length} bidders</span>
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
                <form onSubmit={handleBidSubmit} className="space-y-3">
                    <h3 className="font-semibold font-headline text-center">Place Your Bid</h3>
                    <div>
                        <Label htmlFor="bid" className="sr-only">Bid Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                id="bid" 
                                type="number" 
                                placeholder="Enter your bid" 
                                className="pl-10 text-lg h-12"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                required 
                                disabled={currentLowestBid === null || !user}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg" disabled={currentLowestBid === null || !user}>
                        {user ? "Submit Bid" : "Login to Bid"}
                    </Button>
                </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
