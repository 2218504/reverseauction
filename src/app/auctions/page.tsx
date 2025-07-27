"use client";
import { AuctionCard } from "@/components/auction-card";
import { useAuctions } from "@/context/AuctionContext";
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
  ChevronLeft,
} from "lucide-react";
import type { Auction } from "@/context/AuctionContext";

type ViewType = "overview" | "live" | "starting-soon" | "completed";

export default function AuctionsPage() {
  const { auctions, loading: auctionsLoading, deleteAuction } = useAuctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<ViewType>("overview");
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

  const handleCardClick = (viewType: ViewType) => {
    setCurrentView(viewType);
    // Reset filters when switching views
    if (viewType !== "completed") {
      setStartingDate("");
      setTempStartingDate("");
      setShowDateFilter(false);
      setShowAllCompleted(false);
    }
  };

  const getCurrentAuctions = () => {
    switch (currentView) {
      case "live":
        return liveAuctions;
      case "starting-soon":
        return startingSoonAuctions;
      case "completed":
        return filteredCompletedAuctions;
      default:
        return [];
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case "live":
        return {
          title: "Live Auctions",
          subtitle: `${liveAuctions.length} auction${
            liveAuctions.length > 1 ? "s" : ""
          } currently active`,
          icon: (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          ),
          color: "red",
        };
      case "starting-soon":
        return {
          title: "Starting Soon",
          subtitle: `${startingSoonAuctions.length} auction${
            startingSoonAuctions.length > 1 ? "s" : ""
          } starting soon`,
          icon: <Clock className="h-6 w-6 text-orange-500" />,
          color: "orange",
        };
      case "completed":
        return {
          title: "Completed Auctions",
          subtitle: "Browse through auction history and results",
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          color: "green",
        };
      default:
        return null;
    }
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

  // Overview view - showing the main landing page
  if (currentView === "overview") {
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

            {/* Clickable Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <button
                onClick={() => handleCardClick("live")}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100 hover:border-red-300 hover:scale-105 transform cursor-pointer group"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {liveAuctions.length}
                </h3>
                <p className="text-red-600 font-semibold">Live Auctions</p>
                <p className="text-xs text-gray-500 mt-2">Click to view all</p>
              </button>

              <button
                onClick={() => handleCardClick("starting-soon")}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-300 hover:scale-105 transform cursor-pointer group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {startingSoonAuctions.length}
                </h3>
                <p className="text-orange-600 font-semibold">Starting Soon</p>
                <p className="text-xs text-gray-500 mt-2">Click to view all</p>
              </button>

              <button
                onClick={() => handleCardClick("completed")}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 hover:scale-105 transform cursor-pointer group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {completedAuctions.length}
                </h3>
                <p className="text-green-600 font-semibold">Completed</p>
                <p className="text-xs text-gray-500 mt-2">Click to view all</p>
              </button>
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
        </div>
      </div>
    );
  }

  // Detail view for specific auction type
  const viewInfo = getViewTitle();
  const currentAuctions = getCurrentAuctions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("overview")}
            className="mb-6 p-2 hover:bg-white/70 rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Overview
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                {viewInfo?.icon}
                {viewInfo?.title}
              </h1>
              <p className="text-gray-600">{viewInfo?.subtitle}</p>
            </div>

            {currentView !== "completed" && (
              <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                {currentAuctions.length} auction
                {currentAuctions.length !== 1 ? "s" : ""}
              </div>
            )}

            {currentView === "completed" && (
              <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                {filteredCompletedAuctions.length} of {completedAuctions.length}{" "}
                auctions
              </div>
            )}
          </div>
        </div>

        {/* Completed auctions filter controls */}
        {currentView === "completed" && (
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
        )}

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentAuctions.length > 0 ? (
            currentAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onDelete={() => handleOpenDeleteDialog(auction)}
              />
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-16 px-4">
                <div
                  className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${
                    currentView === "live"
                      ? "from-red-100 to-red-200"
                      : currentView === "starting-soon"
                      ? "from-orange-100 to-orange-200"
                      : "from-green-100 to-green-200"
                  } rounded-full flex items-center justify-center`}
                >
                  {currentView === "live" && (
                    <Gavel className="h-12 w-12 text-red-500" />
                  )}
                  {currentView === "starting-soon" && (
                    <Clock className="h-12 w-12 text-orange-500" />
                  )}
                  {currentView === "completed" && (
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentView === "live" && "No Live Auctions"}
                  {currentView === "starting-soon" && "No Upcoming Auctions"}
                  {currentView === "completed" && "No Completed Auctions"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {currentView === "live" &&
                    "There are no live auctions at the moment. Check back soon or browse upcoming auctions."}
                  {currentView === "starting-soon" &&
                    "No auctions are scheduled to start soon. Keep checking for new opportunities."}
                  {currentView === "completed" &&
                    (startingDate
                      ? "No completed auctions found that started on the selected date."
                      : "No completed auctions found. Check back after some auctions finish.")}
                </p>
                {isAdminOrAuctioneer && (
                  <Button
                    onClick={() => router.push("/create-auction")}
                    className={`bg-gradient-to-r ${
                      currentView === "live"
                        ? "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : currentView === "starting-soon"
                        ? "from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                        : "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    } text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {currentView === "starting-soon"
                      ? "Schedule an Auction"
                      : "Create Auction"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Show More/Less Button for completed auctions */}
        {currentView === "completed" &&
          completedAuctions.length > 6 &&
          !startingDate && (
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
