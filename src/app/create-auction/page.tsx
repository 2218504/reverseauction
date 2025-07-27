
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  KeyRound,
  Sparkles,
  Calendar,
  IndianRupee,
  FileText,
  Clock,
} from "lucide-react";
import { useAuctions } from "@/context/AuctionContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function CreateAuctionPage() {
  const router = useRouter();
  const { addAuction } = useAuctions();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "You do not have permission to create an auction.",
      });
      router.push("/auctions");
    }
  }, [user, isAdmin, authLoading, router, toast]);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [minDateTime, setMinDateTime] = useState("");

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
      const parsedStartPrice = parseFloat(startPrice);
      const newAuction = {
        title,
        description,
        openingBid: parsedStartPrice,
        currentLowestBid: parsedStartPrice,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        secretKey: secretKey || null,
      };
      await addAuction(newAuction);
      toast({
        title: "Auction Created",
        description: "Your new auction has been created successfully.",
      });
      router.push("/auctions");
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 backdrop-blur-sm transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-gradient-x"></div>
          <CardTitle className="text-4xl font-headline flex items-center gap-3 relative z-10 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-in slide-in-from-top duration-700">
            Create New Auction
            <Sparkles className="text-primary h-8 w-8 animate-pulse" />
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground relative z-10 animate-in slide-in-from-top duration-700 delay-100">
            Fill out the details below to create a new auction and start
            receiving bids.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3 group animate-in slide-in-from-left duration-500 delay-200">
              <Label
                htmlFor="title"
                className="text-base font-semibold flex items-center gap-2 text-gray-700 group-hover:text-primary transition-colors duration-300"
              >
                <FileText className="h-4 w-4" />
                Auction Title
              </Label>
              <Input
                id="title"
                placeholder=""
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12 text-base border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg transform hover:scale-[1.01]"
              />
            </div>

            <div className="space-y-3 group animate-in slide-in-from-left duration-500 delay-300">
              <Label
                htmlFor="description"
                className="text-base font-semibold flex items-center gap-2 text-gray-700 group-hover:text-primary transition-colors duration-300"
              >
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[120px] text-base border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg transform hover:scale-[1.01] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom duration-500 delay-400">
              <div className="space-y-3 group">
                <Label
                  htmlFor="startPrice"
                  className="text-base font-semibold flex items-center gap-2 text-gray-700 group-hover:text-primary transition-colors duration-300"
                >
                  <IndianRupee className="h-4 w-4" />
                  Starting Price (Max Bid)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-primary z-10">
                    ₹
                  </span>
                  <Input
                    id="startPrice"
                    type="number"
                    placeholder=""
                    className="h-12 pl-12 text-base border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg transform hover:scale-[1.01]"
                    value={startPrice}
                    onChange={(e) => setStartPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <Label
                  htmlFor="startTime"
                  className="text-base font-semibold flex items-center gap-2 text-gray-700 group-hover:text-primary transition-colors duration-300"
                >
                  <Calendar className="h-4 w-4" />
                  Start Date & Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  min={minDateTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg transform hover:scale-[1.01]"
                />
              </div>

              <div className="space-y-3 group md:col-span-2">
                <Label
                  htmlFor="endTime"
                  className="text-base font-semibold flex items-center gap-2 text-gray-700 group-hover:text-primary transition-colors duration-300"
                >
                  <Clock className="h-4 w-4" />
                  End Date & Time
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  min={startTime || minDateTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg transform hover:scale-[1.01]"
                />
              </div>
            </div>

            <div className="space-y-3 group animate-in slide-in-from-right duration-500 delay-500">
              <Label
                htmlFor="secretKey"
                className="text-base font-semibold flex items-center gap-2 text-gray-700 group-hover:text-primary transition-colors duration-300"
              >
                <KeyRound className="h-4 w-4" />
                Secret Key (Optional)
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                <Input
                  id="secretKey"
                  placeholder=""
                  className="h-12 pl-12 text-base border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg transform hover:scale-[1.01]"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 animate-in fade-in duration-300 delay-700">
                <span className="w-1 h-1 bg-primary rounded-full"></span>
                If you set a key, only users with the key can view and bid.
              </p>
            </div>

            <div className="pt-6 animate-in slide-in-from-bottom duration-500 delay-600">
              <Button
                type="submit"
                className="w-full md:w-auto h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:hover:scale-100 disabled:hover:translate-y-0 group"
                disabled={loading}
              >
                <span className="flex items-center gap-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Auction...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                      Create Auction
                    </>
                  )}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
