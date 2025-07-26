
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAuctions, Bid, Auction } from '@/context/AuctionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trophy } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';

interface ProfileUser {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    wonAuctions?: string[];
}

export default function ProfilePage() {
    const { userId } = useParams();
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();
    const { getBidsForUser, auctions, loading: auctionsLoading } = useAuctions();

    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
    const [userBids, setUserBids] = useState<Bid[]>([]);
    const [wonAuctionDetails, setWonAuctionDetails] = useState<Auction[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;
            setLoadingProfile(true);

            // Fetch user document
            const userDocRef = doc(db, 'users', userId as string);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as ProfileUser;
                setProfileUser(userData);

                // Fetch bids
                const bids = await getBidsForUser(userId as string);
                setUserBids(bids);
                
                // Fetch details of won auctions
                if (userData.wonAuctions && userData.wonAuctions.length > 0 && auctions.length > 0) {
                   const wonDetails = auctions.filter(a => userData.wonAuctions?.includes(a.id));
                   setWonAuctionDetails(wonDetails);
                }

            } else {
                // User not found
                router.push('/');
            }
            setLoadingProfile(false);
        };

        if (!authLoading && auctions.length > 0) {
            fetchProfileData();
        }

    }, [userId, router, getBidsForUser, authLoading, auctions]);

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    
    const isLoading = authLoading || loadingProfile || auctionsLoading;

    if (isLoading) {
        return (
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
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!profileUser) {
        return <div>User not found.</div>;
    }

    const uniqueBids = userBids
        .filter((bid, index, self) => 
            index === self.findIndex((b) => b.auctionId === bid.auctionId)
        )
        .filter(bid => auctions.some(a => a.id === bid.auctionId)); // Only show bids for existing auctions


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={profileUser.photoURL} alt={profileUser.displayName} />
                        <AvatarFallback>{getInitials(profileUser.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl font-headline">{profileUser.displayName}</CardTitle>
                        <CardDescription className="text-lg">{profileUser.email}</CardDescription>
                    </div>
                </CardHeader>
            </Card>

            {wonAuctionDetails.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><Trophy className="text-amber-500" /> Won Auctions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {wonAuctionDetails.map(auction => (
                                <Link href={`/auctions/${auction.id}`} key={auction.id} className="border rounded-lg p-4 hover:bg-secondary transition-colors">
                                    <p className="font-semibold">{auction.title}</p>
                                    <p className="text-sm text-muted-foreground">Won on {auction.endTime.toLocaleDateString()}</p>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                const totalBidsForAuction = userBids.filter(b => b.auctionId === bid.auctionId).length;
                                 return (
                                    <TableRow key={bid.id}>
                                        <TableCell className="font-medium">{bid.auctionTitle}</TableCell>
                                        <TableCell className="text-center">
                                            {auction && (
                                                <Badge variant={auction.status === 'live' ? 'default' : auction.status === 'completed' ? 'secondary' : 'outline'}>
                                                    {auction.winnerId === userId ? 'Won' : auction.status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">{totalBidsForAuction}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/auctions/${bid.auctionId}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No bids placed yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
