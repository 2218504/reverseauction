
"use client";
import { AuctionCard } from "@/components/auction-card";
import { useAuctions } from "@/context/AuctionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Auction } from "@/context/AuctionContext";


export default function AuctionsPage() {
  const { auctions, loading: auctionsLoading, deleteAuction } = useAuctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const loading = authLoading || auctionsLoading;

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleOpenDeleteDialog = (auction: Auction) => {
    setSelectedAuction(auction);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAuction) return;

    setIsDeleting(true);
    try {
      await deleteAuction(selectedAuction.id);
      toast({
        title: "Auction Deleted",
        description: "The auction has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the auction.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedAuction(null);
    }
  };


  if (loading) {
     return (
        <div>
          <h1 className="text-4xl font-headline font-bold mb-8 text-center">Auctions</h1>
           <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 p-1 h-auto rounded-lg">
              <TabsTrigger 
                value="live"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium text-gray-600 dark:text-gray-300 transition-all py-2 px-4 rounded-md"
              >
                Live
              </TabsTrigger>
              <TabsTrigger 
                value="starting-soon"
                 className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium text-gray-600 dark:text-gray-300 transition-all py-2 px-4 rounded-md"
              >
                Starting Soon
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                 className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium text-gray-600 dark:text-gray-300 transition-all py-2 px-4 rounded-md"
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
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">Auctions</h1>
        
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 p-1 h-auto rounded-lg">
            <TabsTrigger 
              value="live"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium text-gray-600 dark:text-gray-300 transition-all py-2 px-4 rounded-md"
            >
              Live ({liveAuctions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="starting-soon"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium text-gray-600 dark:text-gray-300 transition-all py-2 px-4 rounded-md"
            >
              Starting Soon ({startingSoonAuctions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium text-gray-600 dark:text-gray-300 transition-all py-2 px-4 rounded-md"
            >
              Completed ({completedAuctions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {liveAuctions.length > 0 ? (
                  liveAuctions.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} onDelete={() => handleOpenDeleteDialog(auction)} />
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
                    <AuctionCard key={auction.id} auction={auction} onDelete={() => handleOpenDeleteDialog(auction)} />
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
                    <AuctionCard key={auction.id} auction={auction} onDelete={() => handleOpenDeleteDialog(auction)} />
                  ))
                ) : (
                  <div className="text-center col-span-full text-muted-foreground py-10">
                    <p className="text-lg">No completed auctions.</p>
                  </div>
                )}
              </div>
          </TabsContent>
        </Tabs>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the auction
                  and all associated bids.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
