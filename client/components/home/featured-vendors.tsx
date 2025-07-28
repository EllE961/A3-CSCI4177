"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, ArrowRight, Star, Package, MapPin, Shield } from "lucide-react"
import { vendorService } from "@/lib/api/vendor-service"
import { productService } from "@/lib/api/product-service"
import type { Vendor, VendorQuery } from "@/lib/api/vendor-service"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export function FeaturedVendors() {
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const query: VendorQuery = {
          page: 1,
          limit: 6,
          sort: 'createdAt:desc'
        }
        
        const response = await vendorService.getVendors(query)
        
        // Fetch product counts for each vendor - same as shop page
        const vendorsWithCounts = await Promise.all(
          response.vendors.map(async (vendor) => {
            try {
              const productData = await productService.getVendorProducts(vendor.vendorId, { limit: 1 })
              return {
                ...vendor,
                totalProducts: productData.total || 0
              }
            } catch (error) {
              console.error(`Failed to fetch products for vendor ${vendor.vendorId}:`, error)
              return vendor
            }
          })
        )
        
        setVendors(vendorsWithCounts)
      } catch (error) {
        console.error('Failed to fetch vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Shops Available Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We're working on bringing amazing shops to our platform. Check back soon!
        </p>
        <Link href="/products">
          <Button className="group">
            Browse All Products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {vendors.slice(0, 5).map((vendor) => (
        <motion.div key={vendor._id} variants={itemVariants}>
          <Link href={`/shop/${vendor.vendorId}`}>
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
              {/* Banner Image */}
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                {vendor.bannerUrl || vendor.storeBannerUrl ? (
                  <Image
                    src={vendor.bannerUrl || vendor.storeBannerUrl || ''}
                    alt={`${vendor.storeName} banner`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
                    <div className="absolute inset-0 bg-grid-white/10" />
                  </div>
                )}
                
                {/* Verified Badge */}
                {vendor.isApproved && (
                  <Badge className="absolute top-2 right-2 bg-green-500/90 text-white border-0">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <CardContent className="relative p-0">
                {/* Shop Profile - Logo floating over banner */}
                <div className="px-5 pt-12 pb-5">
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-8">
                    <div className="w-16 h-16 rounded-full border-4 border-background overflow-hidden bg-background shadow-lg">
                      {vendor.logoUrl ? (
                        <Image
                          src={vendor.logoUrl}
                          alt={vendor.storeName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Store className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Shop Info - Below the logo */}
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                      {vendor.storeName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{vendor.location}</span>
                      </div>
                      {vendor.rating > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                
                  {/* Description */}
                  {vendor.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {vendor.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{vendor.totalProducts || 0}</span>
                        <span>products</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="group/btn">
                      <span className="text-sm">Visit Shop</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
      
      {/* View All Card */}
      <motion.div variants={itemVariants}>
        <Link href="/shop" className="h-full block">
          <Card className="group h-full min-h-[320px] hover:shadow-xl transition-all duration-300 border-dashed border-2 hover:border-primary/50">
            <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Discover More Shops</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">
                Explore our complete collection of verified vendors and shops
              </p>
              <Button className="group/btn">
                View All Shops
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  )
}