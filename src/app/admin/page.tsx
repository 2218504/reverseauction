
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";


const mockUsers = [
  { id: 'USR001', name: 'Alice Johnson', email: 'alice@example.com', auctions: 5, status: 'Active' },
  { id: 'USR002', name: 'Bob Williams', email: 'bob@example.com', auctions: 2, status: 'Active' },
  { id: 'USR003', name: 'Charlie Brown', email: 'charlie@example.com', auctions: 8, status: 'Suspended' },
  { id: 'USR004', name: 'Diana Prince', email: 'diana@example.com', auctions: 1, status: 'Active' },
];

export default function AdminDashboard() {
  const { auctions, loading: auctionsLoading, deleteAuction } = useAuctions();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

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
  }


  if (auctionsLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Admin Dashboard</CardTitle>
                <CardDescription>Manage auctions and users across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-96 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Admin Dashboard</CardTitle>
        <CardDescription>Manage auctions and users across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auctions">
          <TabsList>
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="auctions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Auction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell className="font-medium">{auction.id}</TableCell>
                        <TableCell>{auction.title}</TableCell>
                        <TableCell>
                          <Badge variant={auction.status === 'live' ? 'default' : auction.status === 'completed' ? 'secondary' : 'outline'}>{auction.status}</Badge>
                        </TableCell>
                        <TableCell>{auction.endTime.toLocaleString()}</TableCell>
                        <TableCell>{auction.winnerId || 'N/A'}</TableCell>
                         <TableCell>
                           <AdminActionMenu 
                            onDelete={() => handleDeleteAuction(auction.id)}
                            isDeleting={isDeleting}
                           />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Auctions Joined</TableHead>
                      <TableHead>Status</TableHead>
                       <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.auctions}</TableCell>
                        <TableCell>
                           <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                        </TableCell>
                         <TableCell>
                           <AdminActionMenu onDelete={() => {}} isDeleting={false} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function AdminActionMenu({ onDelete, isDeleting }: { onDelete: () => void, isDeleting: boolean }) {
    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
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
                <AlertDialogAction onClick={onDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
