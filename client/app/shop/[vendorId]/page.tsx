"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { productService } from "@/lib/api/product-service"
import { vendorService } from "@/lib/api/vendor-service"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Package, 
  Store,
  Calendar,
  ShoppingBag,
  MessageCircle,
  Shield,
  Mail,
  AlertTriangle,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Phone,
  ExternalLink,
  Github,
  Linkedin,
  Youtube,
  Hash,
  Video,
  Camera
} from "lucide-react"
import type { Product } from "@/lib/api/product-service"
import type { Vendor } from "@/lib/api/vendor-service"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
}

export default function VendorProductsPage() {
  const params = useParams()
  const vendorId = params.vendorId as string
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
    email: ""
  })
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vendor products
        const productData = await productService.getVendorProducts(vendorId)
        setProducts(productData.products)
        
        // Create a vendor object for display
        const tempVendor: Vendor = {
          _id: vendorId,
          vendorId: vendorId,
          storeName: "Vendor Shop",
          location: "Online",
          rating: 4.5,
          totalProducts: productData.total || productData.products.length,
          createdAt: new Date().toISOString()
        }
        
        // Try to get vendor data from session storage first
        let vendorDataFound = false
        if (typeof window !== 'undefined') {
          const vendorInfo = sessionStorage.getItem(`vendor_${vendorId}`)
          if (vendorInfo) {
            const parsedVendor = JSON.parse(vendorInfo)
            tempVendor.storeName = parsedVendor.storeName || tempVendor.storeName
            tempVendor.location = parsedVendor.location || tempVendor.location
            tempVendor.logoUrl = parsedVendor.logoUrl
            tempVendor.bannerUrl = parsedVendor.bannerUrl
            tempVendor.rating = parsedVendor.rating || tempVendor.rating
            tempVendor.phoneNumber = parsedVendor.phoneNumber
            tempVendor.socialLinks = parsedVendor.socialLinks
            vendorDataFound = true
          }
        }
        
        // If no vendor data in session storage, fetch from API
        if (!vendorDataFound) {
          try {
            const vendorData = await vendorService.getVendorById(vendorId)
            
            if (vendorData) {
              tempVendor.storeName = vendorData.storeName
              tempVendor.location = vendorData.location
              tempVendor.logoUrl = vendorData.logoUrl
              tempVendor.bannerUrl = vendorData.bannerUrl || vendorData.storeBannerUrl
              tempVendor.rating = vendorData.rating || 4.5
              tempVendor.phoneNumber = vendorData.phoneNumber
              tempVendor.socialLinks = vendorData.socialLinks
            }
          } catch (error) {
            console.error('Failed to fetch vendor profile:', error)
          }
        }
        
        setVendor(tempVendor)
      } catch (error) {
        console.error('Failed to fetch vendor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [vendorId])

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))]
  
  // Filter products by category
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  // Helper function to get social media icon and type
  const getSocialIcon = (url: string) => {
    const lowerUrl = url.toLowerCase()
    
    // Major social media platforms with specific icons
    if (lowerUrl.includes('facebook.com')) return { icon: Facebook, type: 'Facebook' }
    if (lowerUrl.includes('instagram.com')) return { icon: Instagram, type: 'Instagram' }
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { icon: Twitter, type: 'X (Twitter)' }
    if (lowerUrl.includes('github.com')) return { icon: Github, type: 'GitHub' }
    if (lowerUrl.includes('linkedin.com')) return { icon: Linkedin, type: 'LinkedIn' }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return { icon: Youtube, type: 'YouTube' }
    
    // Use alternative icons for platforms without specific Lucide icons
    if (lowerUrl.includes('threads.net')) return { icon: Hash, type: 'Threads' }
    if (lowerUrl.includes('tiktok.com')) return { icon: Video, type: 'TikTok' }
    if (lowerUrl.includes('twitch.tv')) return { icon: Video, type: 'Twitch' }
    if (lowerUrl.includes('snapchat.com')) return { icon: Camera, type: 'Snapchat' }
    if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me')) return { icon: MessageCircle, type: 'WhatsApp' }
    if (lowerUrl.includes('telegram.org') || lowerUrl.includes('t.me')) return { icon: MessageCircle, type: 'Telegram' }
    if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) return { icon: MessageCircle, type: 'Discord' }
    
    // Other platforms
    if (lowerUrl.includes('pinterest.com')) return { icon: Globe, type: 'Pinterest' }
    if (lowerUrl.includes('reddit.com')) return { icon: Globe, type: 'Reddit' }
    
    // Default
    return { icon: Globe, type: 'Website' }
  }

  const handleReportSubmit = async () => {
    if (!reportForm.reason || !reportForm.description || !reportForm.email) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmittingReport(true)
    try {
      // In production, this would call an API to submit the report
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success("Report submitted successfully. We'll review it within 24-48 hours.")
      setReportDialogOpen(false)
      setReportForm({ reason: "", description: "", email: "" })
    } catch (error) {
      toast.error("Failed to submit report. Please try again.")
    } finally {
      setIsSubmittingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Banner Skeleton */}
        <Skeleton className="h-64 w-full" />
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
          <div className="flex items-end gap-6 mb-8">
            <Skeleton className="h-32 w-32 rounded-xl" />
            <div className="flex-1 pb-4">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
          <p className="text-muted-foreground mb-6">This shop doesn't exist or has been removed.</p>
          <Link href="/shop">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shops
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shop Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        {vendor.bannerUrl ? (
          <Image
            src={vendor.bannerUrl}
            alt={`${vendor.storeName} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        )}
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link href="/shop">
            <Button variant="secondary" size="sm" className="shadow-lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shops
            </Button>
          </Link>
        </div>
      </div>

      {/* Shop Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-card rounded-xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Shop Logo */}
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-xl overflow-hidden bg-muted shrink-0 ring-4 ring-background shadow-xl">
              {vendor.logoUrl ? (
                <Image
                  src={vendor.logoUrl}
                  alt={vendor.storeName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Store className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{vendor.storeName}</h1>
                  {vendor.description && (
                    <p className="text-muted-foreground mb-4 max-w-2xl">{vendor.description}</p>
                  )}
                  
                  {/* Shop Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{vendor.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{(Number(vendor.rating) || 0).toFixed(1)}</span>
                      <span className="text-muted-foreground">rating</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{vendor.totalProducts} products</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Member since {new Date(vendor.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Contact {vendor.storeName}</h4>
                        
                        <div className="space-y-2">
                          {vendor.phoneNumber && (
                            <a
                              href={`tel:${vendor.phoneNumber}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{vendor.phoneNumber}</span>
                            </a>
                          )}
                          
                          {vendor.socialLinks && vendor.socialLinks.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Social Media</p>
                              
                              <div className="space-y-2">
                                {vendor.socialLinks.map((link, index) => {
                                  const { icon: Icon, type } = getSocialIcon(link)
                                  return (
                                    <a
                                      key={index}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                      <Icon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm capitalize">{type}</span>
                                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                                    </a>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {!vendor.phoneNumber && (!vendor.socialLinks || vendor.socialLinks.length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No contact information available
                            </p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button variant="outline" size="sm" onClick={() => setReportDialogOpen(true)}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Verified Seller
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <ShoppingBag className="h-3 w-3" />
              {products.filter(p => p.quantityInStock > 0).length} Items in Stock
            </Badge>
            {vendor.rating >= 4.5 && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Top Rated
              </Badge>
            )}
          </div>
        </div>

        {/* Products Section with Tabs */}
        <Tabs defaultValue="products" className="space-y-6 pb-16">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Category Filter */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === "all" ? "All Products" : category}
                    {category === "all" ? (
                      <Badge variant="secondary" className="ml-2">
                        {products.length}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">
                        {products.filter(p => p.category === category).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-muted/50 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No products in this category</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.productId} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">About {vendor.storeName}</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {vendor.description || `Welcome to ${vendor.storeName}! We're dedicated to providing quality products and excellent customer service. Browse our collection and find exactly what you're looking for.`}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Secure Shopping</h4>
                  <p className="text-sm text-muted-foreground">Your transactions are protected</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Fast Shipping</h4>
                  <p className="text-sm text-muted-foreground">Quick and reliable delivery</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Customer Support</h4>
                  <p className="text-sm text-muted-foreground">We're here to help</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report {vendor.storeName}</DialogTitle>
            <DialogDescription>
              Please provide details about your concern. All reports are reviewed by our team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for report *</Label>
              <Select
                value={reportForm.reason}
                onValueChange={(value) => setReportForm({ ...reportForm, reason: value })}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fake-products">Fake or counterfeit products</SelectItem>
                  <SelectItem value="misleading">Misleading information</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="scam">Suspected scam</SelectItem>
                  <SelectItem value="copyright">Copyright infringement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about your concern..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={reportForm.email}
                onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                We may contact you for additional information if needed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              disabled={isSubmittingReport}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={isSubmittingReport}
            >
              {isSubmittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}