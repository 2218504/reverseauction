"use client";
import { AuctionCard } from "@/components/auction-card";
import { useAuctions } from "@/context/AuctionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
import {
  Filter,
  X,
  Gavel,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
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

  // Check if user has admin or auctioneer role
  const isAdminOrAuctioneer =
    user?.role === "admin" || user?.role === "auctioneer";

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

  const liveAuctions = useMemo(
    () => auctions.filter((a) => a.status === "live"),
    [auctions]
  );
  const startingSoonAuctions = useMemo(
    () => auctions.filter((a) => a.status === "starting-soon"),
    [auctions]
  );
  const completedAuctions = useMemo(
    () => auctions.filter((a) => a.status === "completed"),
    [auctions]
  );

  // Filter completed auctions by starting date
  const filteredCompletedAuctions = useMemo(() => {
    let filtered = completedAuctions;

    // Apply date filtering if starting date is set
    if (startingDate) {
      filtered = filtered.filter((auction) => {
        const auctionStartDate = new Date(auction.startTime);
        const filterDate = new Date(startingDate);
        filterDate.setHours(0, 0, 0, 0);
        const auctionDateOnly = new Date(auctionStartDate);
        auctionDateOnly.setHours(0, 0, 0, 0);
        return auctionDateOnly.getTime() === filterDate.getTime();
      });
    }

    if (!showAllCompleted && !startingDate) {
      return filtered.slice(0, 6);
    }

    return filtered;
  }, [completedAuctions, startingDate, showAllCompleted]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Hero Section Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <Skeleton className="h-12 w-12 rounded-full mb-4 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-2xl" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm font-semibold mb-6">
            <Gavel className="h-4 w-4" />
            Live Auction Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Discover Amazing
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Auction Deals
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of bidders in our live auctions. Find unique items,
            great deals, and exciting opportunities.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {liveAuctions.length}
              </h3>
              <p className="text-red-600 font-semibold">Live Auctions</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {startingSoonAuctions.length}
              </h3>
              <p className="text-orange-600 font-semibold">Starting Soon</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {completedAuctions.length}
              </h3>
              <p className="text-green-600 font-semibold">Completed</p>
            </div>
          </div>

          {/* CTA for Create Auction */}
          {isAdminOrAuctioneer && (
            <div className="mb-8">
              <Button
                onClick={() => router.push("/create-auction")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create New Auction
              </Button>
            </div>
          )}
        </div>

        {/* Auction Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/70 backdrop-blur-sm border border-gray-200 p-2 rounded-2xl shadow-lg">
              <TabsTrigger
                value="live"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-bold bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-300 py-3 px-6 rounded-xl font-semibold"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                    {liveAuctions.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="starting-soon"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-bold bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-300 py-3 px-6 rounded-xl font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Starting Soon</span>
                  <span className="sm:hidden">Soon</span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold">
                    {startingSoonAuctions.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-bold bg-transparent text-gray-600 hover:bg-gray-100 transition-all duration-300 py-3 px-6 rounded-xl font-semibold"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed</span>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                    {completedAuctions.length}
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Live Auctions */}
          <TabsContent value="live" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Live Auctions
              </h2>
              <p className="text-gray-600">
                {liveAuctions.length > 0
                  ? `${liveAuctions.length} auction${
                      liveAuctions.length > 1 ? "s" : ""
                    } currently active`
                  : "No live auctions at the moment"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveAuctions.length > 0 ? (
                liveAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onDelete={() => handleOpenDeleteDialog(auction)}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 px-4">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                      <Gavel className="h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      No Live Auctions
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      There are no live auctions at the moment. Check back soon
                      or browse upcoming auctions.
                    </p>
                    {isAdminOrAuctioneer && (
                      <Button
                        onClick={() => router.push("/create-auction")}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Your First Auction
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Starting Soon Auctions */}
          <TabsContent value="starting-soon" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Clock className="h-6 w-6 text-orange-500" />
                Starting Soon
              </h2>
              <p className="text-gray-600">
                {startingSoonAuctions.length > 0
                  ? `${startingSoonAuctions.length} auction${
                      startingSoonAuctions.length > 1 ? "s" : ""
                    } starting soon`
                  : "No auctions starting soon"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {startingSoonAuctions.length > 0 ? (
                startingSoonAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onDelete={() => handleOpenDeleteDialog(auction)}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 px-4">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                      <Clock className="h-12 w-12 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      No Upcoming Auctions
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      No auctions are scheduled to start soon. Keep checking for
                      new opportunities.
                    </p>
                    {isAdminOrAuctioneer && (
                      <Button
                        onClick={() => router.push("/create-auction")}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Schedule an Auction
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Completed Auctions */}
          <TabsContent value="completed" className="mt-8">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    Completed Auctions
                  </h2>
                  <p className="text-gray-600">
                    Browse through auction history and results
                  </p>
                </div>

                <div className="text-sm text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-full">
                  {filteredCompletedAuctions.length} of{" "}
                  {completedAuctions.length} auctions
                </div>
              </div>

              {/* Filter Controls */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDateFilter(!showDateFilter)}
                      className="flex items-center gap-2 rounded-xl border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                    >
                      <Filter className="h-4 w-4" />
                      Filter by Date
                    </Button>

                    {startingDate && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-full text-sm border border-blue-200">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {new Date(startingDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearDateFilter}
                          className="h-auto p-0 text-blue-600 hover:text-blue-800 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Filter Panel */}
                {showDateFilter && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                      <div className="flex-1 max-w-xs">
                        <Label
                          htmlFor="starting-date"
                          className="text-sm font-semibold mb-3 block text-gray-700"
                        >
                          Show auctions that started on:
                        </Label>
                        <Input
                          id="starting-date"
                          type="date"
                          value={tempStartingDate}
                          onChange={(e) => setTempStartingDate(e.target.value)}
                          className="w-full rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDateFilter(false)}
                          className="rounded-xl border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={applyDateFilter}
                          disabled={!tempStartingDate}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Apply Filter
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Auctions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCompletedAuctions.length > 0 ? (
                filteredCompletedAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onDelete={() => handleOpenDeleteDialog(auction)}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 px-4">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      No Completed Auctions
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {startingDate
                        ? "No completed auctions found that started on the selected date."
                        : "No completed auctions found. Check back after some auctions finish."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Show More/Less Button */}
            {completedAuctions.length > 6 && !startingDate && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                  className="min-w-[200px] rounded-xl border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-semibold"
                >
                  {showAllCompleted
                    ? `Show Less (${completedAuctions.length - 6} hidden)`
                    : `Show All (${completedAuctions.length - 6} more)`}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="mx-4 max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete the
              auction "{selectedAuction?.title}" and all associated bids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:w-auto rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Auction"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
