"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { productService } from "@/lib/api/product-service"
import { vendorService } from "@/lib/api/vendor-service"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Star, Package } from "lucide-react"
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vendor products
        const productData = await productService.getVendorProducts(vendorId)
        setProducts(productData.products)
        
        // Create a temporary vendor object for display
        // In production, this would come from a public vendor API
        const tempVendor: Vendor = {
          _id: vendorId,
          vendorId: vendorId,
          storeName: "Vendor Shop", // This will be updated if we can get it from localStorage
          location: "Online",
          rating: 4.5,
          totalProducts: productData.total || productData.products.length,
          createdAt: new Date().toISOString()
        }
        
        // Check if vendor info was passed from the shop listing page
        if (typeof window !== 'undefined') {
          const vendorInfo = sessionStorage.getItem(`vendor_${vendorId}`)
          if (vendorInfo) {
            const parsedVendor = JSON.parse(vendorInfo)
            tempVendor.storeName = parsedVendor.storeName || tempVendor.storeName
            tempVendor.location = parsedVendor.location || tempVendor.location
            tempVendor.logoUrl = parsedVendor.logoUrl
            tempVendor.bannerUrl = parsedVendor.bannerUrl
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-muted/50 h-48" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
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
          <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
          <p className="text-muted-foreground mb-4">This shop doesn't exist or has been removed.</p>
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
    <div className="min-h-screen">
      {/* Shop Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all shops
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{vendor.storeName}</h1>
              {vendor.description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{vendor.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.totalProducts} products</span>
                </div>
              </div>

              {vendor.categories && vendor.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {vendor.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="capitalize">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Products ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No products available</p>
            <p className="text-sm text-muted-foreground mt-2">
              This shop hasn't added any products yet.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product.productId} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}