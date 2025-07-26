
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowRight, Trash2 } from 'lucide-react';
import CountdownTimer from './countdown-timer';
import type { Auction } from '@/context/AuctionContext';
import { useAuth } from '@/context/AuthContext';

export { type Auction };

interface AuctionCardProps {
  auction: Auction;
  onDelete?: () => void;
}

export function AuctionCard({ auction, onDelete }: AuctionCardProps) {
  const { isAdmin } = useAuth();
  const isCompleted = auction.status === 'completed';
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isCompleted ? 'opacity-70 bg-secondary/50' : ''}`}>
      <div className="relative">
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
        
        {isAdmin && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete auction</span>
          </Button>
        )}
      </div>

      <CardHeader>
        <CardTitle className="font-headline text-xl mb-2">{auction.title}</CardTitle>
        <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         <div className="flex items-center text-sm text-muted-foreground mb-4">
          <DollarSign className="mr-2 h-4 w-4" />
          <span>Starting Price: ${auction.currentLowestBid.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/auctions/${auction.id}`}>
            View Auction <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
