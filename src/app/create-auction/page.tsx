
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { KeyRound } from 'lucide-react';
import { useAuctions } from '@/context/AuctionContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function CreateAuctionPage() {
  const router = useRouter();
  const { addAuction } = useAuctions();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "You do not have permission to create an auction.",
      });
      router.push('/auctions');
    }
  }, [user, isAdmin, authLoading, router, toast]);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    setMinDateTime(getMinDateTime());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startPrice || !startTime || !endTime) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out all required fields.",
        });
        return;
    }
    setLoading(true);
    try {
      const newAuction = {
        title,
        description,
        currentLowestBid: parseFloat(startPrice),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        imageUrl: "https://placehold.co/600x400.png",
        imageHint: "newly created auction"
      };
      await addAuction(newAuction);
      toast({
        title: "Auction Created",
        description: "Your new auction has been created successfully.",
      });
      router.push('/auctions');
    } catch (error) {
       console.error("Failed to create auction:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the auction. Please try again.",
      });
    } finally {
        setLoading(false);
    }
  };
  
  if (authLoading || !isAdmin) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Create New Auction</CardTitle>
          <CardDescription>Fill out the details below to start a new reverse auction.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Auction Title</Label>
              <Input id="title" placeholder="e.g., Landscaping Services for Business Park" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Provide a detailed description of the services or goods required." value={description} onChange={(e) => setDescription(e.target.value)} required/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="startPrice">Starting Price (Max Bid)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">₹</span>
                  <Input id="startPrice" type="number" placeholder="25000" className="pl-10" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} required/>
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="startTime">Start Date & Time</Label>
                  <Input id="startTime" type="datetime-local" value={startTime} min={minDateTime} onChange={(e) => setStartTime(e.target.value)} required/>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endTime">End Date & Time</Label>
                <Input id="endTime" type="datetime-local" value={endTime} min={startTime || minDateTime} onChange={(e) => setEndTime(e.target.value)} required/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key (Optional)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="secretKey" placeholder="A secret key to make the auction private" className="pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">If you set a key, only users with the key can view and bid.</p>
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    