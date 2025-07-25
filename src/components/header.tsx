
import Link from 'next/link';
import { Gavel, User, LogOut, CircleUserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

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
              <>
                <Link href="/create-auction" className="text-muted-foreground hover:text-primary transition-colors">
                  Create Auction
                </Link>
                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                  Admin
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                           <Avatar>
                             <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                             <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                           </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
