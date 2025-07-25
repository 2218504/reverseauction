
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, KeyRound } from 'lucide-react';
import { useAuctions } from '@/context/AuctionContext';

export default function CreateAuctionPage() {
  const router = useRouter();
  const { addAuction } = useAuctions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAuction = {
      id: Date.now().toString(),
      title,
      description,
      currentLowestBid: parseFloat(startPrice),
      endTime: new Date(endTime),
      imageUrl: "https://placehold.co/600x400.png",
      imageHint: "newly created auction"
    };
    addAuction(newAuction);
    router.push('/');
  };

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
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="startPrice" type="number" placeholder="25000" className="pl-10" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} required/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Date & Time</Label>
                <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
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
            <Button type="submit" className="w-full md:w-auto">Create Auction</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
