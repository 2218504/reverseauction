"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CountdownTimer from "@/components/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { Bell, DollarSign, Gavel, History, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const mockAuction = {
  id: "1",
  title: "Government Contract for Office Supplies",
  description: "We are seeking competitive bids for a 12-month contract to supply a full range of standard office materials for a government facility. The contract includes paper, writing instruments, toner cartridges, and other common consumables. Bidders must demonstrate capacity for timely delivery and quality assurance.",
  currentLowestBid: 15000,
  endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
  imageUrl: "https://placehold.co/800x600.png",
  imageHint: "office supplies contract",
  bids: [
    { user: "Supplier Inc.", amount: 15500, time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { user: "OfficeMax Pro", amount: 15200, time: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { user: "PencilPushers LLC", amount: 15000, time: new Date(Date.now() - 30 * 60 * 1000) },
  ],
};

type Bid = {
  user: string;
  amount: number;
  time: Date;
};

export default function AuctionPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [isFinished, setIsFinished] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<Bid[]>(mockAuction.bids);
  const [currentLowestBid, setCurrentLowestBid] = useState(mockAuction.currentLowestBid);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBid = parseFloat(bidAmount);
    if (!newBid || newBid >= currentLowestBid) {
      toast({
        variant: "destructive",
        title: "Invalid Bid",
        description: `Your bid must be lower than the current lowest bid of $${currentLowestBid.toLocaleString()}.`,
      });
      return;
    }

    const newBidEntry = { user: "You", amount: newBid, time: new Date() };
    setBids([newBidEntry, ...bids]);
    setCurrentLowestBid(newBid);
    setBidAmount("");
    toast({
      title: "Bid Placed!",
      description: `Your bid of $${newBid.toLocaleString()} has been successfully submitted.`,
    });
  };
  
  const winner = bids.length > 0 ? bids.sort((a,b) => a.amount - b.amount)[0] : null;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <h1 className="text-4xl font-headline font-bold">{mockAuction.title}</h1>
            <CardDescription>Auction ID: {params.id}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
                <Image src={mockAuction.imageUrl} alt={mockAuction.title} layout="fill" objectFit="cover" data-ai-hint={mockAuction.imageHint} />
            </div>
            <p className="text-muted-foreground">{mockAuction.description}</p>
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
                <p className="text-4xl font-bold text-primary">${currentLowestBid.toLocaleString()}</p>
            </div>

            <div className="text-center border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
                <div className="text-2xl font-bold">
                    <CountdownTimer endTime={mockAuction.endTime} onExpire={() => setIsFinished(true)} />
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
                        The winner is <span className="font-bold">{winner?.user}</span> with a bid of <span className="font-bold">${winner?.amount.toLocaleString()}</span>.
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
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg">
                        Submit Bid
                    </Button>
                </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
