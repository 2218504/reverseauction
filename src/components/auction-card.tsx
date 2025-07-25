import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowRight } from 'lucide-react';
import CountdownTimer from './countdown-timer';

export interface Auction {
  id: string;
  title: string;
  description: string;
  currentLowestBid: number;
  endTime: Date;
  imageUrl: string;
  imageHint: string;
}

export function AuctionCard({ auction }: { auction: Auction }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={auction.imageUrl}
            alt={auction.title}
            fill
            className="object-cover"
            data-ai-hint={auction.imageHint}
          />
        </div>
        <div className="p-6">
          <CardTitle className="font-headline text-xl mb-2">{auction.title}</CardTitle>
          <CardDescription>{auction.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <div className="flex items-center text-lg font-bold text-primary mb-4">
          <DollarSign className="mr-2 h-5 w-5" />
          <span>Current Bid: ${auction.currentLowestBid.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <CountdownTimer endTime={auction.endTime} />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/auctions/${auction.id}`}>
            View Auction <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
