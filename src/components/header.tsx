import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "./ui/skeleton";

export default function Header() {
  const { user, logout, isAdmin, loading } = useAuth();
  const pathname = usePathname();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isActivePath = (path: string) => pathname === path;

  return (
    <header className="bg-gradient-to-r from-white via-slate-50 to-white shadow-lg border-b border-slate-200/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105 hover:drop-shadow-md"
          >
            <div className="relative">
              <Gavel className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:text-blue-600" />
              <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
              ReverseAuction
            </span>
          </Link>

          {/* Navigation Menu */}
          {user && (
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/auctions"
                className={`relative px-6 py-3 text-base font-bold transition-all duration-300 rounded-xl hover:scale-110 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:text-blue-600 group ${
                  isActivePath("/auctions")
                    ? "text-blue-600 bg-blue-50 shadow-md"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <span className="relative z-10">Auctions</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Link>

              {isAdmin && (
                <>
                  <Link
                    href="/create-auction"
                    className={`relative px-6 py-3 text-base font-bold transition-all duration-300 rounded-xl hover:scale-110 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-lg hover:text-emerald-600 group ${
                      isActivePath("/create-auction")
                        ? "text-emerald-600 bg-emerald-50 shadow-md"
                        : "text-gray-700 hover:text-emerald-600"
                    }`}
                  >
                    <span className="relative z-10">Create Auction</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>

                  <Link
                    href="/admin"
                    className={`relative px-6 py-3 text-base font-bold transition-all duration-300 rounded-xl hover:scale-110 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-lg hover:text-purple-600 group ${
                      isActivePath("/admin")
                        ? "text-purple-600 bg-purple-50 shadow-md"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                  >
                    <span className="relative z-10">Admin</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <Skeleton className="h-12 w-28 rounded-xl" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg group"
                  >
                    <Avatar className="h-11 w-11 ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300">
                      <AvatarImage
                        src={user.photoURL ?? ""}
                        alt={user.displayName ?? "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 shadow-xl border-0 bg-white/95 backdrop-blur-md"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-base font-bold leading-none text-gray-800">
                        {user.displayName}
                      </p>
                      <p className="text-sm leading-none text-gray-500 font-medium">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/profile/${user.uid}`}
                      className="flex items-center p-3 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer group"
                    >
                      <User className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center p-3 font-semibold hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer group"
                  >
                    <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="font-bold text-base px-6 py-3 hover:scale-105 hover:bg-slate-100 hover:text-slate-800 transition-all duration-300 rounded-xl"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="font-bold text-base px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl border-0"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
