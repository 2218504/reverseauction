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
  
  const loading = authLoading || auctionsLoading;

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
     return (
        <div>
          <h1 className="text-4xl font-headline font-bold mb-8 text-center">Auctions</h1>
           <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-transparent p-1 h-auto">
              <TabsTrigger 
                value="live"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-medium bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-200 py-3 px-6 rounded-md"
              >
                Live
              </TabsTrigger>
              <TabsTrigger 
                value="starting-soon"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-medium bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-200 py-3 px-6 rounded-md"
              >
                Starting Soon
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-medium bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-200 py-3 px-6 rounded-md"
              >
                Completed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="mt-8">
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
            </TabsContent>
           </Tabs>
        </div>
     )
  }
  
  if (!user) {
    return null;
  }
  
  const liveAuctions = auctions.filter(a => a.status === 'live');
  const startingSoonAuctions = auctions.filter(a => a.status === 'starting-soon');
  const completedAuctions = auctions.filter(a => a.status === 'completed');

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Auctions</h1>
      
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-transparent p-1 h-auto">
          <TabsTrigger 
            value="live"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-medium bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-200 py-3 px-6 rounded-md"
          >
            Live ({liveAuctions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="starting-soon"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-medium bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-200 py-3 px-6 rounded-md"
          >
            Starting Soon ({startingSoonAuctions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-medium bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-200 py-3 px-6 rounded-md"
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
                <div className="text-center col-span-full text-muted-foreground py-10">
                  <p className="text-lg">No live auctions at the moment.</p>
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
                 <div className="text-center col-span-full text-muted-foreground py-10">
                   <p className="text-lg">No auctions are starting soon.</p>
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
                <div className="text-center col-span-full text-muted-foreground py-10">
                  <p className="text-lg">No completed auctions.</p>
                </div>
              )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}