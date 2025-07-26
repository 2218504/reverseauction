
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CountdownTimer from "@/components/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { Bell, Gavel, History, KeyRound, Lock, Send, Star, Trash2, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useAuctions, Auction, Bid } from "@/context/AuctionContext";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AuctionChat from "@/components/auction-chat";

export default function AuctionPage() {
  const params = useParams();
  const auctionId = params.id as string;
  const { toast } = useToast();
  const { getAuctionById, updateAuctionStatus, submitBid, getBidsForAuction, listenToAuction, submitReview } = useAuctions();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const [auction, setAuction] = useState<Auction | undefined | null>(undefined);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const previousBidsRef = useRef<Bid[]>([]);

  // Real-time listener for auction document
  useEffect(() => {
    if (!auctionId) return;
    
    setPageLoading(true);
    const unsubscribe = listenToAuction(auctionId, (fetchedAuction) => {
      if (fetchedAuction) {
        setAuction(fetchedAuction);
        if (fetchedAuction.status === 'completed') {
          setIsFinished(true);
        } else {
          setIsFinished(new Date() > new Date(fetchedAuction.endTime));
        }
        if (!fetchedAuction.secretKey) {
            setIsAuthorized(true);
        }
      } else {
        setAuction(null); // Auction was deleted or doesn't exist
      }
      setPageLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [auctionId, listenToAuction]);
  
  // Set up real-time listener for bids and handle notifications
  useEffect(() => {
    if (!auctionId) return;

    const unsubscribe = getBidsForAuction(auctionId, (newBids) => {
        setBids(newBids);
        
        const previousBids = previousBidsRef.current;
        if (user && newBids.length > 0 && previousBids.length > 0) {
            const myPreviousHighestBid = previousBids.find(b => b.userId === user.uid);
            const currentLowestBidder = newBids[0];
            
            if (myPreviousHighestBid && myPreviousHighestBid.id === previousBids[0]?.id && currentLowestBidder.userId !== user.uid) {
                toast({
                    title: "You've been outbid!",
                    description: `The new lowest bid is ₹${currentLowestBidder.amount.toLocaleString()}. Place a new bid to win!`,
                });
            }
        }
        
        previousBidsRef.current = newBids;
    });

    return () => unsubscribe();
  }, [auctionId, getBidsForAuction, user, toast]);

  const handleExpire = () => {
    if (auction && auction.status !== 'completed') {
        setIsFinished(true);
        updateAuctionStatus(auction.id, 'completed');
    }
  };
  
  const winner = isFinished && bids.length > 0 ? bids[0] : null;
  const hasUserBid = user ? bids.some(bid => bid.userId === user.uid) : false;
  const userCurrentBid = user ? bids.find(bid => bid.userId === user.uid) : null;
  const uniqueBidders = new Set(bids.map(bid => bid.userId)).size;
  const uniqueBidderUsers = Array.from(new Set(bids.map(bid => bid.userId))).map(userId => {
    return bids.find(bid => bid.userId === userId)?.user || 'Unknown';
  });

  useEffect(() => {
    if (userCurrentBid) {
      setBidAmount(userCurrentBid.amount.toString());
    }
  }, [userCurrentBid]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction || !user || isSubmitting || isAdmin) return;

    setIsSubmitting(true);

    const newBidAmount = parseFloat(bidAmount);
    if (isNaN(newBidAmount) || newBidAmount <= 0) {
        toast({ variant: "destructive", title: "Invalid Bid", description: "Please enter a valid bid amount." });
        setIsSubmitting(false);
        return;
    }
    
    if (bids.length > 0 && newBidAmount >= bids[0].amount) {
      toast({ variant: "destructive", title: "Invalid Bid", description: `Your bid must be lower than the current lowest bid.` });
      setIsSubmitting(false);
      return;
    }

    try {
      await submitBid(auction.id, { userId: user.uid, user: user.displayName || "Anonymous", amount: newBidAmount }, auction.currentLowestBid);
      toast({ title: "Bid Placed!", description: `Your bid of ₹${newBidAmount.toLocaleString()} has been successfully submitted.` });
    } catch (error: any) {
        console.error("Failed to submit bid:", error);
        toast({ variant: "destructive", title: "Bid Failed", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auction?.secretKey === secretKey) {
        setIsAuthorized(true);
        sessionStorage.setItem(`auction_key_${auctionId}`, secretKey);
    } else {
        toast({ variant: 'destructive', title: 'Invalid Secret Key', description: 'The key you entered is incorrect.' });
    }
  };

   useEffect(() => {
    if (auction?.secretKey) {
        const storedKey = sessionStorage.getItem(`auction_key_${auctionId}`);
        if (storedKey === auction.secretKey) { setIsAuthorized(true); }
    } else if (auction) {
        setIsAuthorized(true);
    }
  }, [auction, auctionId]);
  
  if (pageLoading || authLoading) return <AuctionPageSkeleton />;

  if (auction === null) {
     return (
      <Card className="col-span-3"><CardHeader className="items-center text-center">
        <Trash2 className="h-16 w-16 text-destructive mb-4" />
        <CardTitle className="text-2xl font-headline">Auction Deleted</CardTitle>
        <CardDescription>Sorry, this auction is no longer available as it has been deleted by an administrator.</CardDescription>
      </CardHeader></Card>
    );
  }

  if (!auction) return <Card><CardHeader><CardTitle>Auction Not Found</CardTitle><CardDescription>The auction you are looking for does not exist.</CardDescription></CardHeader></Card>;

  if (auction.secretKey && !isAuthorized && !isAdmin) {
    return (
        <Card className="max-w-md mx-auto"><CardHeader className="text-center">
            <Lock className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-2xl">Private Auction</CardTitle>
            <CardDescription>This auction is private. Please enter the secret key to view it.</CardDescription>
        </CardHeader><CardContent>
            <form onSubmit={handleKeySubmit} className="space-y-4">
                <div>
                    <Label htmlFor="secretKey" className="sr-only">Secret Key</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="secretKey" type="password" placeholder="Enter secret key" className="pl-10" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
                    </div>
                </div>
                <Button type="submit" className="w-full">Unlock Auction</Button>
            </form>
        </CardContent></Card>
    )
  }
  
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {auction.secretKey && <Lock className="h-8 w-8 text-muted-foreground" title="Private Auction" />}
              <h1 className="text-4xl font-headline font-bold">{auction.title}</h1>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{auction.description}</p>
          </CardContent>
        </Card>

        <AuctionChat auctionId={auction.id} />
        
        {isAdmin && (
            <Card><CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><History /> Bid History</CardTitle>
            </CardHeader><CardContent>
                <ul className="space-y-4">
                    {bids.map(bid => (
                      <li key={bid.id} className={`flex justify-between items-center p-3 rounded-md bg-secondary/50`}>
                        <div className="flex items-center"><User className="h-5 w-5 mr-3 text-muted-foreground"/><span className="font-medium">{bid.user}</span></div>
                        <div className="text-right">
                            <p className={`font-bold text-lg`}>₹{bid.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{bid.time.toLocaleTimeString()}</p>
                        </div>
                      </li>
                    ))}
                    {bids.length === 0 && <p className="text-center text-muted-foreground py-4">No bids yet. Be the first!</p>}
                </ul>
            </CardContent></Card>
        )}
      </div>

      <div className="space-y-6 md:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><Gavel />Auction Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && (
                <div className="text-center bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-primary font-medium">Current Lowest Bid</p>
                    <p className="text-3xl font-bold text-primary">₹{(bids.length > 0 ? bids[0].amount : auction.currentLowestBid).toLocaleString()}</p>
                </div>
            )}
              
            <div className="text-center border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {auction.status === 'live' && 'Time Remaining'}
                  {auction.status === 'starting-soon' && 'Time Until Start'}
                </p>
                <div className="text-xl font-bold"><CountdownTimer startTime={auction.startTime} endTime={auction.endTime} onExpire={handleExpire} /></div>
            </div>

            <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
                <Users className="h-4 w-4" />
                 {isAdmin ? (
                    <Dialog><DialogTrigger asChild><span className="cursor-pointer hover:underline">{uniqueBidders} {uniqueBidders === 1 ? 'bidder' : 'bidders'}</span></DialogTrigger><DialogContent>
                        <DialogHeader><DialogTitle>Auction Participants ({uniqueBidders})</DialogTitle></DialogHeader>
                        <ul className="space-y-2 mt-4">
                          {uniqueBidderUsers.map((bidderName, index) => (
                            <li key={index} className="flex items-center gap-3 bg-secondary p-2 rounded-md"><User className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{bidderName}</span></li>
                          ))}
                          {uniqueBidders === 0 && <p className="text-center text-muted-foreground">No bidders yet.</p>}
                        </ul>
                    </DialogContent></Dialog>
                ) : ( <span>{uniqueBidders} {uniqueBidders === 1 ? 'bidder' : 'bidders'}</span> )}
            </div>
            <Separator />
            
            {isFinished ? (
                 <Alert className={ winner && user && winner.userId === user.uid ? 'border-green-500 text-green-700' : (hasUserBid ? 'border-destructive/50 text-destructive' : 'border-border') }>
                    <Bell className={ winner && user && winner.userId === user.uid ? '!text-green-700' : (hasUserBid ? '!text-destructive' : 'text-foreground') } />
                    <AlertTitle className={`font-headline ${ winner && user && winner.userId === user.uid ? 'text-green-800' : (hasUserBid ? 'text-destructive' : 'text-foreground') }`}>Auction Ended!</AlertTitle>
                    <AlertDescription>
                      <WinnerMessage auction={auction} winner={winner} user={user} hasUserBid={hasUserBid} isAdmin={isAdmin} />
                    </AlertDescription>
                    {((user && winner && winner.userId === user.uid && !auction.winnerReview) || (isAdmin && winner && !auction.adminReview)) && (
                        <ReviewDialog auction={auction} winner={winner} isAdmin={isAdmin} user={user} onSubmit={submitReview} />
                    )}
                </Alert>
            ) : isAdmin ? (
                <div className="text-center text-muted-foreground p-4 bg-secondary/50 rounded-lg"><p>Admins cannot participate in bidding.</p></div>
            ) : (
                <div className="space-y-3">
                    {userCurrentBid && (
                      <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Your Current Bid</p>
                        <p className="text-2xl font-bold text-blue-700">₹{userCurrentBid.amount.toLocaleString()}</p>
                      </div>
                    )}
                    <form onSubmit={handleBidSubmit} className="space-y-3">
                        <h3 className="font-semibold font-headline text-center">{userCurrentBid ? "Update Your Bid" : "Place Your Bid"}</h3>
                        <div>
                            <Label htmlFor="bid" className="sr-only">Bid Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">₹</span>
                                <Input id="bid" type="number" step="any" placeholder={ userCurrentBid ? `Lower than ₹${userCurrentBid.amount.toLocaleString()}` : 'Enter your bid amount' } className="pl-10 text-lg h-12" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required disabled={isSubmitting || !user || auction.status !== 'live'} />
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

const WinnerMessage = ({ auction, winner, user, hasUserBid, isAdmin }: { auction: Auction, winner: Bid | null, user: any, hasUserBid: boolean, isAdmin: boolean }) => {
    if (!winner) return "The auction has concluded, but there were no bids.";
    if (isAdmin) return <>The winner is <span className="font-bold">{winner.user}</span> with a bid of <span className="font-bold">₹{winner.amount.toLocaleString()}</span>.</>;
    if (user && winner.userId === user.uid) return <>Congratulations! You won the auction with a bid of <span className="font-bold">₹{winner.amount.toLocaleString()}</span>.</>;
    if (user && winner.userId !== user.uid && hasUserBid) return <>Unfortunately, you did not win. The winning bid was <span className="font-bold">₹{winner.amount.toLocaleString()}</span>.</>;
    return "The auction has concluded.";
};

const ReviewDialog = ({ auction, winner, isAdmin, user, onSubmit }: { auction: Auction, winner: Bid, isAdmin: boolean, user: any, onSubmit: (auctionId: string, review: any) => void }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleReviewSubmit = async () => {
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Invalid Rating', description: 'Please select a rating from 1 to 5.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const review = {
                rating,
                comment,
                reviewerId: user.uid,
                reviewerName: user.displayName,
                reviewedUserId: isAdmin ? winner.userId : 'admin', // Admin reviews winner, winner reviews admin
                time: new Date(),
            };
            const reviewField = isAdmin ? 'adminReview' : 'winnerReview';
            await onSubmit(auction.id, { [reviewField]: review });
            toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your review.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="mt-4 w-full">Leave a Review</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Review Your Experience</DialogTitle>
                    <DialogDescription>Your feedback is valuable for the community.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex justify-center items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-8 w-8 cursor-pointer ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} onClick={() => setRating(star)} />
                        ))}
                    </div>
                    <Textarea placeholder="Add a public comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button onClick={handleReviewSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AuctionPageSkeleton = () => (
    <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <Card><CardHeader><Skeleton className="h-10 w-3/4" /><Skeleton className="h-4 w-1/4" /></CardHeader><CardContent>
                <Skeleton className="h-24 w-full" />
            </CardContent></Card>
        </div>
        <div className="space-y-6 md:col-span-1">
             <Card className="sticky top-24"><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-6 w-1/4 mx-auto" /><Separator />
                <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
            </CardContent></Card>
        </div>
    </div>
);

    