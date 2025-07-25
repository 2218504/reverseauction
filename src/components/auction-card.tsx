
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowRight } from 'lucide-react';
import CountdownTimer from './countdown-timer';
import type { Auction } from '@/context/AuctionContext';

export { type Auction };

export function AuctionCard({ auction }: { auction: Auction }) {
  const isCompleted = auction.status === 'completed';
  
  return (
    <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isCompleted ? 'opacity-70 bg-secondary/50' : ''}`}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={auction.imageUrl}
            alt={auction.title}
            fill
            className="object-cover"
            data-ai-hint={auction.imageHint}
          />
           {isCompleted && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-xl">Completed</span></div>}
        </div>
        <div className="p-6">
          <CardTitle className="font-headline text-xl mb-2">{auction.title}</CardTitle>
          <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <div className="flex items-center text-lg font-bold text-primary mb-4">
          <DollarSign className="mr-2 h-5 w-5" />
          <span>{isCompleted ? 'Final' : 'Current'} Bid: ${auction.currentLowestBid.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} />
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
