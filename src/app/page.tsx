
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Gavel, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-headline font-bold mb-4">
          Welcome to ReverseAuctionPro
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          The premier platform where sellers compete, and buyers save. Experience the power of reverse auctions for your procurement needs.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </section>

      {/* What is a Reverse Auction? Section */}
      <section className="max-w-5xl w-full">
         <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-80 w-full rounded-lg overflow-hidden">
                <Image src="https://placehold.co/600x400.png" alt="Reverse auction concept" layout="fill" objectFit="cover" data-ai-hint="business meeting negotiation" />
            </div>
            <div className="text-left space-y-4">
                 <h2 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <Gavel className="w-8 h-8 text-primary" /> What is a Reverse Auction?
                 </h2>
                 <p className="text-muted-foreground">
                    Unlike traditional auctions where buyers outbid each other, a reverse auction is a role-reversal. Multiple sellers compete to win a buyer's business by offering progressively lower prices for a specific good or service.
                 </p>
                 <p className="text-muted-foreground">
                    This model drives down costs and increases transparency, making it an ideal solution for businesses looking to optimize their procurement process and find the best value.
                 </p>
            </div>
        </div>
      </section>
      
      {/* Achievements Section */}
      <section className="w-full max-w-5xl">
        <h2 className="text-3xl font-headline font-bold mb-8">Our Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="items-center">
              <Award className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Trusted by 1,000+ Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">From startups to Fortune 500s, businesses rely on us for their critical procurement needs.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center">
              <Target className="w-12 h-12 text-primary mb-2" />
              <CardTitle>$50M+ in Client Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Our competitive bidding environment has saved our clients millions on services and supplies.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center">
              <TrendingUp className="w-12 h-12 text-primary mb-2" />
              <CardTitle>25% Average Cost Reduction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">On average, contracts awarded through our platform are 25% lower than initial estimates.</p>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  );
}
