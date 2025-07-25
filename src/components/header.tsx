
import Link from 'next/link';
import { Gavel, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Gavel className="h-7 w-7 text-primary" />
            <span className="text-xl font-headline font-bold text-gray-800">ReverseAuctionPro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Auctions
            </Link>
            {isAdmin && (
              <Link href="/create-auction" className="text-muted-foreground hover:text-primary transition-colors">
                Create Auction
              </Link>
            )}
            {isAdmin && (
                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                Admin
                </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={logout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
