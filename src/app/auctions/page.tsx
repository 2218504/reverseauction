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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Filter, X } from "lucide-react";
import type { Auction } from "@/context/AuctionContext";

export default function AuctionsPage() {
  const { auctions, loading: auctionsLoading, deleteAuction } = useAuctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  // Completed auctions filters
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startingDate, setStartingDate] = useState("");
  const [tempStartingDate, setTempStartingDate] = useState("");

  const loading = authLoading || auctionsLoading;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
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

  // Filter completed auctions by starting date
  const filterCompletedAuctions = (auctions: Auction[]) => {
    let filtered = auctions;

    // Apply date filtering if starting date is set
    if (startingDate) {
      filtered = auctions.filter((auction) => {
        // Use startTime field from your database
        const auctionStartDate = new Date(auction.startTime);
        const filterDate = new Date(startingDate);

        // Set both dates to start of day for exact date comparison
        filterDate.setHours(0, 0, 0, 0);
        const auctionDateOnly = new Date(auctionStartDate);
        auctionDateOnly.setHours(0, 0, 0, 0);

        // Show auctions that started exactly on the selected date
        return auctionDateOnly.getTime() === filterDate.getTime();
      });
    }

    // Apply limit: show only 3 by default unless "show all" is clicked or date filter is active
    if (!showAllCompleted && !startingDate) {
      return filtered.slice(0, 3);
    }

    return filtered;
  };

  const applyDateFilter = () => {
    setStartingDate(tempStartingDate);
    setShowDateFilter(false);
  };

  const clearDateFilter = () => {
    setStartingDate("");
    setTempStartingDate("");
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">
          Auctions
        </h1>
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
    );
  }

  if (!user) {
    return null;
  }

  const liveAuctions = auctions.filter((a) => a.status === "live");
  const startingSoonAuctions = auctions.filter(
    (a) => a.status === "starting-soon"
  );
  const completedAuctions = auctions.filter((a) => a.status === "completed");
  const filteredCompletedAuctions = filterCompletedAuctions(completedAuctions);

  return (
    <div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">
          Auctions
        </h1>

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
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onDelete={() => handleOpenDeleteDialog(auction)}
                  />
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
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onDelete={() => handleOpenDeleteDialog(auction)}
                  />
                ))
              ) : (
                <div className="text-center col-span-full text-muted-foreground py-10">
                  <p className="text-lg">No auctions are starting soon.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-8">
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filter by Date
                  </Button>

                  {startingDate && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <span>
                        On: {new Date(startingDate).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDateFilter}
                        className="h-auto p-0 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {filteredCompletedAuctions.length} of{" "}
                  {completedAuctions.length} auctions
                </div>
              </div>

              {/* Date Filter Panel */}
              {showDateFilter && (
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-xs">
                      <Label
                        htmlFor="starting-date"
                        className="text-sm font-medium mb-2 block"
                      >
                        Show auctions that started on:
                      </Label>
                      <Input
                        id="starting-date"
                        type="date"
                        value={tempStartingDate}
                        onChange={(e) => setTempStartingDate(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDateFilter(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyDateFilter}
                        disabled={!tempStartingDate}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Apply Filter
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Auctions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCompletedAuctions.length > 0 ? (
                  filteredCompletedAuctions.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onDelete={() => handleOpenDeleteDialog(auction)}
                    />
                  ))
                ) : (
                  <div className="text-center col-span-full text-muted-foreground py-10">
                    <p className="text-lg">
                      {startingDate
                        ? "No completed auctions found that started on the selected date."
                        : "No completed auctions."}
                    </p>
                  </div>
                )}
              </div>

              {/* Show More/Less Button */}
              {completedAuctions.length > 3 && !startingDate && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="min-w-[140px]"
                  >
                    {showAllCompleted
                      ? `Show Less (${completedAuctions.length - 3} hidden)`
                      : `Show All (${completedAuctions.length - 3} more)`}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              auction and all associated bids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
