import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, LogOut, User, Menu, X, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  // Role-based access control
  const isAdminOrAuctioneer = user?.role === "admin" || user?.role === "user";
  const isAdmin = user?.role === "admin";

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isActivePath = (path: string) => pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-gradient-to-r from-white via-slate-50 to-white shadow-lg border-b border-slate-200/50 sticky top-0 z-50 backdrop-blur-sm dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 dark:border-slate-800/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group transition-all duration-300 hover:scale-105 hover:drop-shadow-md"
          >
            <div className="relative">
              <Gavel className="h-6 w-6 sm:h-8 sm:w-8 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:text-blue-600" />
              <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-lg sm:text-2xl font-black text-gray-800 dark:text-gray-200 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
              ReverseAuction
            </span>
          </Link>

          {/* Desktop Navigation Menu */}
          {user && (
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                href="/auctions"
                className={`relative px-4 xl:px-6 py-2 xl:py-3 text-sm xl:text-base font-bold transition-all duration-300 rounded-xl hover:scale-110 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 group ${
                  isActivePath("/auctions")
                    ? "text-blue-600 bg-blue-50 shadow-md dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="relative z-10">Auctions</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Link>

              {isAdminOrAuctioneer && (
                <Link
                  href="/create-auction"
                  className={`relative px-4 xl:px-6 py-2 xl:py-3 text-sm xl:text-base font-bold transition-all duration-300 rounded-xl hover:scale-110 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-lg hover:text-emerald-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400 group ${
                    isActivePath("/create-auction")
                      ? "text-emerald-600 bg-emerald-50 shadow-md dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="relative z-10">Create Auction</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`relative px-4 xl:px-6 py-2 xl:py-3 text-sm xl:text-base font-bold transition-all duration-300 rounded-xl hover:scale-110 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-lg hover:text-purple-600 dark:hover:bg-purple-900/50 dark:hover:text-purple-400 group ${
                    isActivePath("/admin")
                      ? "text-purple-600 bg-purple-50 shadow-md dark:bg-purple-900/50 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="relative z-10">Admin</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              )}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu for authenticated users */}
            {user && (
              <div className="lg:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
                  >
                    <SheetHeader>
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-left flex items-center gap-2">
                          <Gavel className="h-5 w-5 text-blue-600" />
                          Navigation
                        </SheetTitle>
                      </div>
                    </SheetHeader>
                    <div className="mt-8 space-y-3">
                      <Link
                        href="/auctions"
                        onClick={closeMobileMenu}
                        className={`flex items-center w-full p-4 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                          isActivePath("/auctions")
                            ? "bg-blue-50 text-blue-600 shadow-md dark:bg-blue-900/50 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400"
                        }`}
                      >
                        <Gavel className="h-5 w-5 mr-3" />
                        Auctions
                      </Link>

                      {isAdminOrAuctioneer && (
                        <Link
                          href="/create-auction"
                          onClick={closeMobileMenu}
                          className={`flex items-center w-full p-4 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                            isActivePath("/create-auction")
                              ? "bg-emerald-50 text-emerald-600 shadow-md dark:bg-emerald-900/50 dark:text-emerald-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400"
                          }`}
                        >
                          <div className="h-5 w-5 mr-3 bg-emerald-600 rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              +
                            </span>
                          </div>
                          Create Auction
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMobileMenu}
                          className={`flex items-center w-full p-4 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                            isActivePath("/admin")
                              ? "bg-purple-50 text-purple-600 shadow-md dark:bg-purple-900/50 dark:text-purple-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/50 dark:hover:text-purple-400"
                          }`}
                        >
                          <div className="h-5 w-5 mr-3 bg-purple-600 rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">⚙</span>
                          </div>
                          Admin
                        </Link>
                      )}

                      {/* User Info in Mobile Menu */}
                      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user.photoURL ?? ""}
                              alt={user.displayName ?? "User"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                              {user.role || "user"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                           <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center w-full p-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200 cursor-pointer">
                                 <Sun className="h-4 w-4 mr-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                 <Moon className="absolute h-4 w-4 mr-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                 <span>Theme</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                      <DropdownMenuItem onClick={() => {setTheme("light"); closeMobileMenu()}}>Light</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {setTheme("dark"); closeMobileMenu()}}>Dark</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {setTheme("system"); closeMobileMenu()}}>System</DropdownMenuItem>
                                  </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <Link
                            href={`/profile/${user.uid}`}
                            onClick={closeMobileMenu}
                            className="flex items-center w-full p-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Profile
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              closeMobileMenu();
                            }}
                            className="flex items-center w-full p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {/* Desktop User Menu */}
            {loading ? (
              <Skeleton className="h-10 w-20 sm:h-12 sm:w-28 rounded-xl" />
            ) : user ? (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg group"
                    >
                      <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300">
                        <AvatarImage
                          src={user.photoURL ?? ""}
                          alt={user.displayName ?? "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm sm:text-lg">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-gray-900/95"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-2">
                        <p className="text-base font-bold leading-none text-gray-800 dark:text-gray-200">
                          {user.displayName}
                        </p>
                        <p className="text-sm leading-none text-gray-500 dark:text-gray-400 font-medium">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-blue-600 dark:text-blue-400 font-semibold capitalize">
                          {user.role || "user"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center p-3 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer group">
                           <Sun className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
                           <Moon className="absolute h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
                           <span className="dark:text-white">Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/profile/${user.uid}`}
                        className="flex items-center p-3 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer group"
                      >
                        <User className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center p-3 font-semibold hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer group"
                    >
                      <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="font-bold text-sm sm:text-base text-white px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl border-0"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="font-bold text-sm sm:text-base px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl border-0"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile User Avatar (when logged in) */}
            {user && (
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-md group"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300">
                        <AvatarImage
                          src={user.photoURL ?? ""}
                          alt={user.displayName ?? "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-gray-900/95 mr-4"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-gray-800 dark:text-gray-200 truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs leading-none text-gray-500 dark:text-gray-400 font-medium truncate">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-blue-600 dark:text-blue-400 font-semibold capitalize">
                          {user.role || "user"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center p-3 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer">
                           <Sun className="h-4 w-4 mr-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                           <Moon className="absolute h-4 w-4 mr-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                           <span>Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/profile/${user.uid}`}
                        className="flex items-center p-3 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer"
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center p-3 font-medium hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
