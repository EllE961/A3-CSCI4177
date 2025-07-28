"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthSession, useAuth } from "@/components/auth-provider";
import {
  Menu,
  X,
  User,
  ChevronDown,
  ShoppingCart,
  Package,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/currency-selector";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart-provider";

export function Header() {
  const { data: session } = useAuthSession();
  const { signOut } = useAuth();
  const { totals } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  if (!mounted) {
    return null; // or a skeleton header
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-gray-300 dark:border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-background/80 shadow-md"
          : "bg-gradient-to-r from-gray-50/30 via-gray-50/60 to-gray-50/30 dark:from-background/0 dark:via-background/50 dark:to-background/0"
      )}
    >
      {/* Main Header - Centered container with proper max-width */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo Section - Enhanced with animation */}
            <div className="flex-shrink-0 min-w-0">
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  className="relative h-9 w-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-primary/25 transition-all duration-300"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-primary-foreground font-bold text-sm">
                    SS
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <motion.div
                  className="hidden sm:block"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="font-bold text-lg whitespace-nowrap bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                    ShopSphere
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">
                Shops
              </Link>
              <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                Categories
              </Link>
              {session?.user?.role === 'vendor' && (
                <Link href="/vendor" className="text-sm font-medium hover:text-primary transition-colors">
                  Vendor Dashboard
                </Link>
              )}
              {session?.user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right Actions - Fixed width */}
            <div className="flex-shrink-0 min-w-0">
              <div className="flex items-center gap-2">
                {/* Enhanced Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Cart Button for Consumers */}
                  {session?.user?.role === 'consumer' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="relative h-10 w-10 rounded-xl hover:bg-primary/10"
                      >
                        <Link href="/cart">
                          <ShoppingCart className="h-5 w-5" />
                          {totals && totals.totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                              {totals.totalItems > 99 ? '99+' : totals.totalItems}
                            </span>
                          )}
                          <span className="sr-only">Cart ({totals?.totalItems || 0} items)</span>
                        </Link>
                      </Button>
                    </motion.div>
                  )}

                  {/* Currency Selector */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="rounded-xl hover:bg-primary/5 transition-colors duration-200">
                      <CurrencySelector />
                    </div>
                  </motion.div>

                  {/* Enhanced Theme Toggle */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="rounded-xl hover:bg-primary/5 transition-colors duration-200">
                      <ThemeToggle />
                    </div>
                  </motion.div>

                  {/* Enhanced User Menu or Auth Buttons */}
                  {session ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="relative h-10 w-10 rounded-xl flex-shrink-0 hover:bg-primary/10 transition-all duration-200 group"
                          >
                            <div className="relative">
                              <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                                <AvatarImage
                                  src={session.user?.image || ""}
                                  alt={session.user?.name || ""}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                                  {session.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              {/* Online indicator */}
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56"
                          align="end"
                          forceMount
                        >
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {session.user?.name}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {session.user?.email}
                              </p>
                              <Badge variant="secondary" className="mt-1 w-fit capitalize">
                                {session.user?.role}
                              </Badge>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Role-based menu items */}
                          {session.user?.role === 'consumer' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href="/consumer/profile">
                                  <User className="mr-2 h-4 w-4" />
                                  My Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/orders">
                                  <Package className="mr-2 h-4 w-4" />
                                  My Orders
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/cart">
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Cart
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {session.user?.role === 'vendor' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href="/vendor">
                                  <Store className="mr-2 h-4 w-4" />
                                  Dashboard
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/vendor/products">
                                  <Package className="mr-2 h-4 w-4" />
                                  My Products
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/vendor/orders">
                                  <ShoppingBag className="mr-2 h-4 w-4" />
                                  Orders
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {session.user?.role === 'admin' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href="/admin">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Admin Panel
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/admin/vendors">
                                  <Store className="mr-2 h-4 w-4" />
                                  Manage Vendors
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="hidden lg:flex items-center gap-2 flex-shrink-0"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <Button
                        variant="outline"
                        asChild
                        size="sm"
                        className="rounded-xl h-9 px-4 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                      >
                        <Link href="/auth/login">
                          <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">Login</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="rounded-xl h-9 px-4 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 group"
                      >
                        <Link href="/auth/register">
                          <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="h-4 w-4 mr-2 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                              <span className="text-xs font-bold">+</span>
                            </div>
                            <span className="font-semibold">Sign up</span>
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  )}

                  {/* Enhanced Mobile Menu Toggle */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden flex-shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-200"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <motion.div
                        animate={{ rotate: isMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isMenuOpen ? (
                          <X className="h-5 w-5" />
                        ) : (
                          <Menu className="h-5 w-5" />
                        )}
                      </motion.div>
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-gray-300 dark:border-border/50 bg-gray-50/95 dark:bg-background/95 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-2">
                <Link 
                  href="/shop" 
                  className="text-base font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shops
                </Link>
                <Link 
                  href="/products" 
                  className="text-base font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  href="/categories" 
                  className="text-base font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </Link>
                {session?.user?.role === 'consumer' && (
                  <>
                    <Link 
                      href="/consumer/profile" 
                      className="text-base font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      href="/cart" 
                      className="text-base font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cart
                    </Link>
                    <Link 
                      href="/orders" 
                      className="text-base font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  </>
                )}
                {session?.user?.role === 'vendor' && (
                  <Link 
                    href="/vendor" 
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Vendor Dashboard
                  </Link>
                )}
                {session?.user?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </nav>

              {/* Enhanced Auth buttons for non-logged in users */}
              {!session && (
                <motion.div
                  className="flex flex-col gap-3 pt-4 border-t border-gray-300 dark:border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    asChild
                    className="justify-start gap-3 h-12 rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Login</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="justify-start gap-3 h-12 rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                        <span className="text-sm font-bold">+</span>
                      </div>
                      <span className="font-semibold">Sign up</span>
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
