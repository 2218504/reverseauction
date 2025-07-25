import { AuctionCard, type Auction } from "@/components/auction-card";

const mockAuctions: Auction[] = [
  {
    id: "1",
    title: "Government Contract for Office Supplies",
    description: "Seeking bids for a 12-month contract to supply standard office materials.",
    currentLowestBid: 15000,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "office supplies"
  },
  {
    id: "2",
    title: "Website Redesign Project",
    description: "Complete overhaul of a corporate website. Seeking experienced development agencies.",
    currentLowestBid: 8500,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "web design"
  },
  {
    id: "3",
    title: "Landscaping Services for Business Park",
    description: "Year-round landscaping and maintenance services for a 5-acre business park.",
    currentLowestBid: 22000,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "landscaping park"
  },
  {
    id: "4",
    title: "Janitorial Services Contract",
    description: "Nightly cleaning services for a 50,000 sq ft office building.",
    currentLowestBid: 7800,
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "cleaning service"
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Active Auctions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockAuctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}
