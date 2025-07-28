"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { vendorService } from "@/lib/api/vendor-service"
import { productService } from "@/lib/api/product-service"
import { VendorCard } from "@/components/shop/vendor-card"
import { VendorFilters } from "@/components/shop/vendor-filters"
import { VendorSort } from "@/components/shop/vendor-sort"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Store } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Vendor, VendorQuery } from "@/lib/api/vendor-service"

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

export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<VendorQuery>({})

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const query: VendorQuery = {
        page,
        limit: 12,
        ...filters,
      }

      // Apply URL params
      const category = searchParams.get('category')
      if (category) query.category = category

      const search = searchParams.get('search')
      if (search) query.search = search

      const response = await vendorService.getVendors(query)
      
      // Fetch product counts for each vendor
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
      
      // Client-side filtering for product range only (backend doesn't support this)
      let filteredVendors = vendorsWithCounts
      
      // Product range filter (still client-side)
      // @ts-ignore
      if (filters.productRange) {
        filteredVendors = filteredVendors.filter(vendor => {
          const count = vendor.totalProducts || 0
          // @ts-ignore
          switch(filters.productRange) {
            case 'small': return count >= 1 && count <= 10
            case 'medium': return count >= 11 && count <= 50
            case 'large': return count > 50
            default: return true
          }
        })
      }
      
      setVendors(filteredVendors)
      setTotalPages(response.pages)
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters, searchParams])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery }))
    setPage(1)
  }

  const handleFilterChange = (newFilters: VendorQuery) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort: sort as VendorQuery['sort'] }))
    setPage(1)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">
                {searchParams.get('category') ? (
                  <>
                    <span className="capitalize">{searchParams.get('category')}</span>
                    <span className="text-muted-foreground text-2xl ml-2">Shops</span>
                  </>
                ) : (
                  'Explore Shops'
                )}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {searchParams.get('category') 
                ? `Discover trusted ${searchParams.get('category')} shops with quality products`
                : 'Browse through our curated selection of verified vendors and shops'
              }
            </p>
          </motion.div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              <VendorFilters onFilterChange={handleFilterChange} initialFilters={filters} />
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="lg:col-span-3">
            {/* Mobile Filter & Sort */}
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <VendorFilters onFilterChange={handleFilterChange} initialFilters={filters} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              <VendorSort onSortChange={handleSortChange} />
            </div>

            {/* Results count and category breadcrumb */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {searchParams.get('category') && (
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                      All Shops
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium capitalize">{searchParams.get('category')}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Showing {vendors.length} {searchParams.get('category') && `${searchParams.get('category')} `}shops
                </p>
              </div>
              {searchParams.get('category') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setFilters({})
                    router.push('/shop')
                  }}
                  className="text-xs"
                >
                  Clear Filter
                </Button>
              )}
            </div>

            {/* Vendors */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-16">
                <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No shops found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {vendors.map((vendor) => (
                  <motion.div key={vendor._id} variants={itemVariants}>
                    <VendorCard vendor={vendor} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}