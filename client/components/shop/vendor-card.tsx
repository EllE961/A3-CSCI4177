"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Package } from "lucide-react"
import type { Vendor } from "@/lib/api/vendor-service"

interface VendorCardProps {
  vendor: Vendor
}

export function VendorCard({ vendor }: VendorCardProps) {
  const handleClick = () => {
    // Store vendor info in sessionStorage for the product page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`vendor_${vendor.vendorId}`, JSON.stringify({
        storeName: vendor.storeName,
        location: vendor.location,
        logoUrl: vendor.logoUrl,
        bannerUrl: vendor.bannerUrl,
        rating: vendor.rating,
        phoneNumber: vendor.phoneNumber,
        socialLinks: vendor.socialLinks
      }))
    }
  }

  return (
    <Link href={`/shop/${vendor.vendorId}`} className="h-full" onClick={handleClick}>
      <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Banner Image */}
        <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0">
          {vendor.bannerUrl && (
            <Image
              src={vendor.bannerUrl}
              alt={`${vendor.storeName} banner`}
              fill
              className="object-cover"
            />
          )}
          {/* Logo */}
          <div className="absolute -bottom-10 left-6">
            <div className="relative h-20 w-20 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
              {vendor.logoUrl ? (
                <Image
                  src={vendor.logoUrl}
                  alt={vendor.storeName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {vendor.storeName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-14 pb-6 flex-1 flex flex-col">
          {/* Store Name & Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {vendor.storeName}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
            {vendor.description || "Welcome to our store!"}
          </p>

          {/* Location & Products */}
          <div className="flex items-center justify-between text-sm mt-auto">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{vendor.location}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{vendor.totalProducts} products</span>
            </div>
          </div>

          {/* Categories */}
          {vendor.categories && vendor.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {vendor.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs capitalize">
                  {category}
                </Badge>
              ))}
              {vendor.categories.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{vendor.categories.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}