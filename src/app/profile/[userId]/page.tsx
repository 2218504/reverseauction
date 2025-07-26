
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, ProfileUser } from '@/context/AuthContext';
import { useAuctions, Bid, Auction, Review } from '@/context/AuctionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const { userId } = useParams();
    const router = useRouter();
    const { user: authUser, loading: authLoading, getUserProfile } = useAuth();
    const { getBidsForUser, auctions, loading: auctionsLoading, getReviewsForUser } = useAuctions();

    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
    const [userBids, setUserBids] = useState<Bid[]>([]);
    const [wonAuctionDetails, setWonAuctionDetails] = useState<Auction[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId || !auctions.length) return;
            setLoadingProfile(true);
            
            const fetchedProfile = await getUserProfile(userId as string);

            if (fetchedProfile) {
                setProfileUser(fetchedProfile);
                const bids = await getBidsForUser(userId as string);
                setUserBids(bids);
                const userReviews = await getReviewsForUser(userId as string);
                setReviews(userReviews);
                
                if (fetchedProfile.wonAuctions && fetchedProfile.wonAuctions.length > 0) {
                   const wonDetails = auctions.filter(a => fetchedProfile.wonAuctions?.includes(a.id));
                   setWonAuctionDetails(wonDetails);
                }

            } else {
                router.push('/');
            }
            setLoadingProfile(false);
        };

        if (!authLoading && !auctionsLoading) {
            fetchProfileData();
        }

    }, [userId, router, getUserProfile, getBidsForUser, getReviewsForUser, authLoading, auctions, auctionsLoading]);


    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    const isLoading = authLoading || loadingProfile || auctionsLoading;

    if (isLoading) return <ProfileSkeleton />;

    if (!profileUser) return <div>User not found.</div>;

    const uniqueBids = userBids
        .filter(bid => auctions.some(a => a.id === bid.auctionId))
        .filter((bid, index, self) => index === self.findIndex((b) => b.auctionId === bid.auctionId));

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={profileUser.photoURL} alt={profileUser.displayName} />
                        <AvatarFallback>{getInitials(profileUser.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-3xl font-headline">{profileUser.displayName}</CardTitle>
                        <CardDescription className="text-lg">{profileUser.email}</CardDescription>
                    </div>
                     {reviews.length > 0 && (
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                            <span>{averageRating.toFixed(1)}</span>
                            <span className="text-sm font-normal text-muted-foreground">({reviews.length} reviews)</span>
                        </div>
                    )}
                </CardHeader>
            </Card>

             <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><Trophy className="text-amber-500" /> Won Auctions ({wonAuctionDetails.length})</CardTitle></CardHeader>
                    <CardContent>
                        {wonAuctionDetails.length > 0 ? (
                            <div className="space-y-2">
                                {wonAuctionDetails.map(auction => (
                                    <Link href={`/auctions/${auction.id}`} key={auction.id} className="block border rounded-lg p-3 hover:bg-secondary transition-colors">
                                        <p className="font-semibold">{auction.title}</p>
                                        <p className="text-sm text-muted-foreground">Won on {auction.endTime.toLocaleDateString()}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : <p className="text-muted-foreground text-center py-4">No auctions won yet.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><Star /> Reviews ({reviews.length})</CardTitle></CardHeader>
                    <CardContent>
                        {reviews.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {reviews.map(review => (
                                    <div key={review.id} className="border-b pb-3 last:border-b-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(review.reviewerName)}</AvatarFallback></Avatar>
                                                <span className="font-semibold">{review.reviewerName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />)}
                                            </div>
                                        </div>
                                        {review.comment && <p className="text-muted-foreground mt-2 pl-10 text-sm">"{review.comment}"</p>}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-muted-foreground text-center py-4">No reviews yet.</p>}
                    </CardContent>
                </Card>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Bid History</CardTitle>
                    <CardDescription>A record of all auctions this user has participated in.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Auction Title</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Bids Placed</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uniqueBids.length > 0 ? uniqueBids.map(bid => {
                                const auction = auctions.find(a => a.id === bid.auctionId);
                                if (!auction) return null;
                                const totalBidsForAuction = userBids.filter(b => b.auctionId === bid.auctionId).length;
                                 return (
                                    <TableRow key={bid.id}>
                                        <TableCell className="font-medium">{auction.title}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={auction.status === 'live' ? 'default' : auction.status === 'completed' ? 'secondary' : 'outline'}>
                                                {auction.winnerId === userId ? 'Won' : auction.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{totalBidsForAuction}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/auctions/${bid.auctionId}`}><ArrowRight className="h-4 w-4" /></Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24">No bids placed yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

const ProfileSkeleton = () => (
    <div className="space-y-8">
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </CardHeader>
        </Card>
        <div className="grid md:grid-cols-2 gap-8">
            <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
        <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
    </div>
);
