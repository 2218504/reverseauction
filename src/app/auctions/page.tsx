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


  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, router]);

  const liveAuctions = auctions.filter(a => a.status === 'live');
  const startingSoonAuctions = auctions.filter(a => a.status === 'starting-soon');
  const completedAuctions = auctions.filter(a => a.status === 'completed');

  // DEBUG: Log filtered results
  console.log("Live auctions:", liveAuctions);
  console.log("Starting soon auctions:", startingSoonAuctions);
  console.log("Completed auctions:", completedAuctions);

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
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-gray-200 p-1 rounded-lg">
          <TabsTrigger 
            value="live" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 data-[state=active]:shadow-lg font-medium transition-all duration-300 rounded-md px-4 py-2"
          >
            Live ({liveAuctions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="starting-soon"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 data-[state=active]:shadow-lg font-medium transition-all duration-300 rounded-md px-4 py-2"
          >
            Starting Soon ({startingSoonAuctions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 data-[state=active]:shadow-lg font-medium transition-all duration-300 rounded-md px-4 py-2"
          >
            Completed ({completedAuctions.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveAuctions.length > 0 ? (
                liveAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))
              ) : (
                <div className="text-center col-span-full text-muted-foreground">
                  <p>No live auctions at the moment.</p>
                  <p className="text-xs mt-2">Total auctions available: {auctions?.length || 0}</p>
                </div>
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
                 <div className="text-center col-span-full text-muted-foreground">
                   <p>No auctions are starting soon.</p>
                   <p className="text-xs mt-2">Total auctions available: {auctions?.length || 0}</p>
                 </div>
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
                <div className="text-center col-span-full text-muted-foreground">
                  <p>No completed auctions.</p>
                  <p className="text-xs mt-2">Total auctions available: {auctions?.length || 0}</p>
                </div>
              )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}