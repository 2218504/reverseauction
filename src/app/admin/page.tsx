"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Users,
  Gavel,
  TrendingUp,
  Clock,
  Trophy,
  Star,
  Eye,
  Edit3,
  Trash2,
  Activity,
  Calendar,
  IndianRupee,
  Award,
  UserCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuctions } from "@/context/AuctionContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  AuctionStatusChart,
  UserRegistrationChart,
} from "@/components/admin-charts";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const { auctions, loading: auctionsLoading, deleteAuction } = useAuctions();
  const { allUsers, loading: authLoading, getAllUsers } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("auctions");

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleDeleteAuction = async (auctionId: string) => {
    setIsDeleting(true);
    try {
      await deleteAuction(auctionId);
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
    }
  };

  const loading = auctionsLoading || authLoading;

  // Filter auctions based on search
  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter users based on search
  const filteredUsers = allUsers.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculations
  const totalAuctions = auctions.length;
  const activeAuctions = auctions.filter((a) => a.status === "live").length;
  const completedAuctions = auctions.filter(
    (a) => a.status === "completed"
  ).length;
  const totalUsers = allUsers.length;
  const adminUsers = allUsers.filter((u) => u.role === "admin").length;
  const regularUsers = allUsers.filter((u) => u.role === "user").length;

  // Get bids count for each auction (simulated - you'll need to implement this based on your bids collection)
  const getBidsCount = (auctionId: string) => {
    // This should query your bids collection for this auction
    // For now, returning a random number for demonstration
    return Math.floor(Math.random() * 20) + 1;
  };

  // Calculate profit (difference between opening bid and final bid)
  const calculateProfit = (openingBid: number, finalBid: number) => {
    return openingBid - finalBid;
  };

  // Recent activity data
  const recentAuctions = auctions
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4 animate-in slide-in-from-top duration-500">
        <div className="relative">
          <h1 className="text-5xl font-headline font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage auctions, users, and view comprehensive platform analytics with
          real-time insights.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom duration-500 delay-100">
        <StatsCard
          title="Total Auctions"
          value={totalAuctions}
          icon={Gavel}
          trend="+12% from last month"
          color="blue"
        />
        <StatsCard
          title="Active Auctions"
          value={activeAuctions}
          icon={Activity}
          trend="Currently running"
          color="green"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          trend="+8% from last month"
          color="purple"
        />
        <StatsCard
          title="Completed Auctions"
          value={completedAuctions}
          icon={Trophy}
          trend="Success rate 94%"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 animate-in slide-in-from-left duration-500 delay-200">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 animate-in slide-in-from-left duration-500 delay-200">
          <div className="transform hover:scale-105 transition-all duration-300">
            <AuctionStatusChart auctions={auctions} />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <UserRegistrationChart users={allUsers} />
          </div>
        </div>
      )}

      {/* Recent Activity Card */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 animate-in slide-in-from-right duration-500 delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest auctions and platform activity with winner details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAuctions.map((auction, index) => (
              <div
                key={auction.id}
                className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-left border border-gray-200/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center border-2 border-primary/20">
                    <Gavel className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-base text-gray-900">
                        {auction.title}
                      </p>
                      <Badge
                        variant={
                          auction.status === "live" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {auction.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {auction.createdAt
                          ? new Date(auction.createdAt).toLocaleDateString()
                          : "Recent"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-green-600">
                        <IndianRupee className="h-3 w-3" />
                        {auction.currentLowestBid?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {auction.winnerId ? (
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <div className="text-right">
                        <p className="text-xs text-yellow-600 font-medium">
                          Won by
                        </p>
                        <p className="text-sm font-bold text-yellow-800">
                          {allUsers.find((u) => u.uid === auction.winnerId)
                            ?.displayName || "Unknown User"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      <p className="text-xs text-gray-500">No winner yet</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Management Section */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 animate-in slide-in-from-bottom duration-500 delay-400">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-2 h-11">
                <TabsTrigger
                  value="auctions"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Gavel className="h-4 w-4" />
                  Auctions ({totalAuctions})
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Users className="h-4 w-4" />
                  Users ({totalUsers})
                </TabsTrigger>
              </TabsList>

              {/* Search and Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 h-10"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="auctions" className="mt-0">
              <Card className="border-2 border-gray-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Auction Management
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage all platform auctions with detailed
                    insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-semibold">
                            Auction Name
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            Opening Bid
                          </TableHead>
                          <TableHead className="font-semibold">
                            Deal Closed At
                          </TableHead>
                          <TableHead className="font-semibold">
                            Profit Gained
                          </TableHead>
                          <TableHead className="font-semibold">
                            Participants
                          </TableHead>
                          <TableHead className="font-semibold">
                            Winner
                          </TableHead>
                          <TableHead className="font-semibold">
                            Review
                          </TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAuctions.map((auction, index) => {
                          const openingBid = 1000000; // You should get this from your auction data
                          const finalBid =
                            auction.currentLowestBid || openingBid;
                          const profit = calculateProfit(openingBid, finalBid);
                          const participantCount = getBidsCount(auction.id);
                          const winner = allUsers.find(
                            (u) => u.uid === auction.winnerId
                          );

                          return (
                            <TableRow
                              key={auction.id}
                              className="hover:bg-gray-50/50 transition-colors duration-200 animate-in slide-in-from-left"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="font-bold text-base text-gray-900 max-w-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  {auction.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    auction.status === "live"
                                      ? "default"
                                      : auction.status === "completed"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="animate-pulse-slow"
                                >
                                  {auction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-red-600">
                                ₹{openingBid.toLocaleString()}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">
                                ₹{finalBid.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div
                                  className={`font-bold ${
                                    profit > 0
                                      ? "text-green-600"
                                      : profit < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {profit > 0 && "+"}₹
                                  {Math.abs(profit).toLocaleString()}
                                  <div className="text-xs text-muted-foreground font-normal">
                                    {profit > 0
                                      ? "Saved"
                                      : profit < 0
                                      ? "Over budget"
                                      : "On budget"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="font-semibold text-blue-600">
                                    {participantCount}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    bidders
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {winner ? (
                                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                    <div>
                                      <p className="font-bold text-yellow-800 text-sm">
                                        {winner.displayName}
                                      </p>
                                      <p className="text-xs text-yellow-600">
                                        {winner.email}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm bg-gray-100 px-2 py-1 rounded">
                                    No winner
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {auction.winnerReview ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < auction.winnerReview.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600">
                                      {auction.winnerReview.rating}/5
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    No review
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <AdminActionMenu
                                  onDelete={() =>
                                    handleDeleteAuction(auction.id)
                                  }
                                  isDeleting={isDeleting}
                                  itemType="auction"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <Card className="border-2 border-gray-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and monitor user activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="font-semibold">
                            Auctions Won
                          </TableHead>
                          <TableHead className="font-semibold">
                            Joined
                          </TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user, index) => (
                          <TableRow
                            key={user.uid}
                            className="hover:bg-gray-50/50 transition-colors duration-200 animate-in slide-in-from-left"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-mono text-sm bg-gray-50 rounded">
                              {user.uid.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                                  {user.displayName?.charAt(0).toUpperCase()}
                                </div>
                                {user.displayName}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="flex items-center gap-1 w-fit"
                              >
                                {user.role === "admin" ? (
                                  <UserCheck className="h-3 w-3" />
                                ) : (
                                  <Users className="h-3 w-3" />
                                )}
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold">
                                  {user.wonAuctions
                                    ? user.wonAuctions.length
                                    : 0}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "Unknown"}
                            </TableCell>
                            <TableCell>
                              <AdminActionMenu
                                onDelete={() => {}}
                                isDeleting={false}
                                itemType="user"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  trend: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 bg-blue-50",
    green: "from-green-500 to-green-600 bg-green-50",
    purple: "from-purple-500 to-purple-600 bg-purple-50",
    orange: "from-orange-500 to-orange-600 bg-orange-50",
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/30"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
              colorClasses[color].split(" ")[0]
            } ${
              colorClasses[color].split(" ")[1]
            } flex items-center justify-center shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminActionMenu({
  onDelete,
  isDeleting,
  itemType,
}: {
  onDelete: () => void;
  isDeleting: boolean;
  itemType: "auction" | "user";
}) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-semibold">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          {itemType === "auction" && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            {itemType}
            {itemType === "auction" && " and all associated bids"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
