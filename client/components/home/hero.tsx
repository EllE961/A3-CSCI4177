"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Users, 
  Star,
  Package,
  Globe,
  Search,
  ChevronDown,
  ShoppingBag,
  Store
} from "lucide-react"

const HERO_STATS = [
  { label: "Verified Sellers", value: "10K+", icon: Shield },
  { label: "Happy Customers", value: "250K+", icon: Users },
  { label: "Products", value: "1M+", icon: Package },
  { label: "Countries", value: "50+", icon: Globe }
]



const ROTATING_TEXT = [
  "unique products",
  "verified sellers", 
  "amazing deals",
  "quality items",
  "trusted brands"
]

export function Hero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const { user, loading } = useAuth()
  const isAuthenticated = !!user
  const isVendor = user?.role === 'vendor'
  const isConsumer = user?.role === 'consumer'

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % ROTATING_TEXT.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent),linear-gradient(0deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent)] bg-[length:75px_75px]" />
      </div>



      {/* Main Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex justify-center pt-16">
              <Badge 
                variant="outline" 
                className="bg-background/80 backdrop-blur-sm border-primary/20 text-primary px-6 py-2 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Trusted by 250K+ shoppers worldwide
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Discover Amazing
              </span>
              <br />
              <div className="relative h-[1.2em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTextIndex}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                  >
                    {ROTATING_TEXT[currentTextIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>

            <motion.p 
              className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {isVendor ? (
                <>
                  Welcome back to your marketplace! Manage your store, track orders, 
                  and grow your business with powerful tools designed for success.
                </>
              ) : (
                <>
                  Connect with verified independent sellers from around the world. 
                  Experience premium quality, authentic products, and exceptional service 
                  in one revolutionary marketplace.
                </>
              )}
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md sm:max-w-none mx-auto"
          >
            {loading ? (
              // Show loading state while checking auth
              <div className="h-14 w-48 bg-muted animate-pulse rounded-2xl" />
            ) : isVendor ? (
              // Vendor-specific buttons
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-2xl hover:shadow-primary/25 transition-all duration-300 group text-lg font-semibold"
                  >
                    <Link href="/vendor">
                      <Store className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Go to Dashboard
                      <motion.div
                        className="ml-3"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild 
                    variant="outline"
                    size="lg" 
                    className="h-14 px-8 rounded-2xl border-2 border-border/50 hover:border-primary/50 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 group text-lg font-semibold"
                  >
                    <Link href="/products">
                      <ShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Browse Marketplace
                    </Link>
                  </Button>
                </motion.div>
              </>
            ) : isConsumer ? (
              // Consumer-specific buttons
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-2xl hover:shadow-primary/25 transition-all duration-300 group text-lg font-semibold"
                  >
                    <Link href="/products">
                      <ShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Browse Products
                      <motion.div
                        className="ml-3"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </>
            ) : (
              // Not logged in user buttons
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-2xl hover:shadow-primary/25 transition-all duration-300 group text-lg font-semibold"
                  >
                    <Link href="/auth/register">
                      <Search className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Get Started
                      <motion.div
                        className="ml-3"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild 
                    variant="outline"
                    size="lg" 
                    className="h-14 px-8 rounded-2xl border-2 border-border/50 hover:border-primary/50 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 group text-lg font-semibold"
                  >
                    <Link href="/auth/login">
                      <Users className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Sign In
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {HERO_STATS.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <CardContent className="p-6 text-center">
                        <motion.div
                          className="flex justify-center mb-3"
                          whileHover={{ rotate: 12, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </motion.div>
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="pt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center text-muted-foreground cursor-pointer hover:text-primary transition-colors duration-300"
            >
              <span className="text-sm font-medium mb-2">Explore More</span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}
