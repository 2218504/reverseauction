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

const mockAuctions = [
  { id: 'AUC1001', title: 'Website Redesign', status: 'Active', endTime: '2024-08-15 17:00', bids: 12, winner: 'N/A' },
  { id: 'AUC1002', title: 'Office Supplies', status: 'Active', endTime: '2024-08-12 12:00', bids: 8, winner: 'N/A' },
  { id: 'AUC1003', title: 'Landscaping Contract', status: 'Ended', endTime: '2024-08-01 10:00', bids: 21, winner: 'GreenThumb Inc.' },
  { id: 'AUC1004', title: 'Janitorial Services', status: 'Ended', endTime: '2024-07-28 18:00', bids: 5, winner: 'SparkleClean LLC' },
];

const mockUsers = [
  { id: 'USR001', name: 'Alice Johnson', email: 'alice@example.com', auctions: 5, status: 'Active' },
  { id: 'USR002', name: 'Bob Williams', email: 'bob@example.com', auctions: 2, status: 'Active' },
  { id: 'USR003', name: 'Charlie Brown', email: 'charlie@example.com', auctions: 8, status: 'Suspended' },
  { id: 'USR004', name: 'Diana Prince', email: 'diana@example.com', auctions: 1, status: 'Active' },
];

export default function AdminDashboard() {
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
                      <TableHead>Bids</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAuctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell className="font-medium">{auction.id}</TableCell>
                        <TableCell>{auction.title}</TableCell>
                        <TableCell>
                          <Badge variant={auction.status === 'Active' ? 'default' : 'secondary'}>{auction.status}</Badge>
                        </TableCell>
                        <TableCell>{auction.endTime}</TableCell>
                        <TableCell>{auction.bids}</TableCell>
                        <TableCell>{auction.winner}</TableCell>
                         <TableCell>
                           <AdminActionMenu />
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
                           <AdminActionMenu />
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

function AdminActionMenu() {
    return (
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
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
