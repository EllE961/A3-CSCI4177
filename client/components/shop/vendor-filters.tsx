"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star, Package } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import type { VendorQuery } from "@/lib/api/vendor-service"

interface VendorFiltersProps {
  onFilterChange: (filters: VendorQuery) => void
  initialFilters?: VendorQuery
}

// Categories filter removed as requested

export function VendorFilters({ onFilterChange, initialFilters = {} }: VendorFiltersProps) {
  const [filters, setFilters] = useState<VendorQuery>(initialFilters)
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [productRange, setProductRange] = useState<string>("")

  const handleRatingClick = (rating: number) => {
    // If clicking the same rating, clear it
    const newRating = selectedRating === rating ? 0 : rating
    setSelectedRating(newRating)
    
    const newFilters = { ...filters }
    if (newRating > 0) {
      newFilters.minRating = newRating
    } else {
      delete newFilters.minRating
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleProductRangeChange = (range: string) => {
    setProductRange(range)
    const newFilters = { ...filters }
    // @ts-ignore - Adding custom filter
    newFilters.productRange = range || undefined
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setSelectedRating(0)
    setHoveredRating(0)
    setProductRange("")
    setFilters({})
    onFilterChange({})
  }

  const hasActiveFilters = selectedRating > 0 || productRange

  return (
    <div className="space-y-6">
      {/* Rating */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Minimum Rating
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label={`Filter by ${star} stars minimum`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoveredRating || selectedRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-2 text-sm font-medium">
                {selectedRating}+ stars
              </span>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Click stars to set minimum rating
          </p>
        </div>
      </div>

      <Separator />

      {/* Shop Size */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Shop Size
        </h3>
        <RadioGroup value={productRange} onValueChange={handleProductRangeChange}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="size-all" />
              <Label htmlFor="size-all" className="text-sm font-normal cursor-pointer">
                All sizes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="size-small" />
              <Label htmlFor="size-small" className="text-sm font-normal cursor-pointer">
                Small (1-10 products)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="size-medium" />
              <Label htmlFor="size-medium" className="text-sm font-normal cursor-pointer">
                Medium (11-50 products)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="size-large" />
              <Label htmlFor="size-large" className="text-sm font-normal cursor-pointer">
                Large (50+ products)
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  )
}