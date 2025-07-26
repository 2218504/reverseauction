
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Auction } from "@/context/AuctionContext";
import type { ProfileUser } from "@/context/AuthContext";

interface AuctionStatusChartProps {
  auctions: Auction[];
}

const COLORS = {
    'live': '#2563eb', // blue-600
    'completed': '#475569', // slate-600
    'starting-soon': '#f59e0b', // amber-500
};

export function AuctionStatusChart({ auctions }: AuctionStatusChartProps) {
  const statusCounts = auctions.reduce((acc, auction) => {
    acc[auction.status] = (acc[auction.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(statusCounts).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    count: statusCounts[status],
    fill: COLORS[status as keyof typeof COLORS] || '#cccccc'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auctions by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="count"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


interface UserRegistrationChartProps {
    users: ProfileUser[];
}

export function UserRegistrationChart({ users }: UserRegistrationChartProps) {
    const userCountsByDay = users.reduce((acc, user) => {
        if(user.createdAt){
            const date = new Date(user.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const data = Object.keys(userCountsByDay).sort().map(date => ({
        date,
        count: userCountsByDay[date]
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Registrations</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Bar dataKey="count" fill="#8884d8" name="New Users" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
