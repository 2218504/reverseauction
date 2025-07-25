
"use client";
import { AuctionCard } from "@/components/auction-card";
import { useAuctions } from "@/context/AuctionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuctionsPage() {
  const { auctions, loading: auctionsLoading } = useAuctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const now = new Date();

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, router]);

  const liveAuctions = auctions.filter(a => new Date(a.startTime) <= now && new Date(a.endTime) > now);
  const startingSoonAuctions = auctions.filter(a => new Date(a.startTime) > now);
  const completedAuctions = auctions.filter(a => new Date(a.endTime) <= now);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
  
  const loading = authLoading || auctionsLoading;

  if (loading) {
     return (
        <div>
          <h1 className="text-4xl font-headline font-bold mb-8 text-center">Auctions</h1>
           <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="starting-soon">Starting Soon</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="mt-8">
                {renderSkeletons()}
            </TabsContent>
           </Tabs>
        </div>
     )
  }
  
  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Auctions</h1>
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="starting-soon">Starting Soon</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveAuctions.length > 0 ? (
                liveAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))
              ) : (
                <p className="text-center col-span-full text-muted-foreground">No live auctions at the moment.</p>
              )}
            </div>
        </TabsContent>
        <TabsContent value="starting-soon" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {startingSoonAuctions.length > 0 ? (
                startingSoonAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))
              ) : (
                 <p className="text-center col-span-full text-muted-foreground">No auctions are starting soon.</p>
              )}
            </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedAuctions.length > 0 ? (
                completedAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))
              ) : (
                <p className="text-center col-span-full text-muted-foreground">No completed auctions.</p>
              )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
