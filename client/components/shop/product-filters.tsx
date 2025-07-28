"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { ProductQuery } from "@/lib/api/product-service"

interface ProductFiltersProps {
  onFilterChange: (filters: ProductQuery) => void
  initialFilters?: ProductQuery
}

const categories = [
  "Electronics",
  "Fashion", 
  "Home & Garden",
  "Books",
  "Sports",
  "Accessories",
  "Gaming",
  "Art & Crafts"
]

export function ProductFilters({ onFilterChange, initialFilters = {} }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || "")
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || "")
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || "")

  const handleApplyFilters = () => {
    const filters: ProductQuery = {}
    
    if (selectedCategory) {
      filters.category = selectedCategory.toLowerCase()
    }
    
    if (minPrice) {
      filters.minPrice = parseFloat(minPrice)
    }
    
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice)
    }
    
    onFilterChange(filters)
  }

  const handleClearFilters = () => {
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    onFilterChange({})
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategory === category.toLowerCase()}
                onCheckedChange={(checked) => {
                  setSelectedCategory(checked ? category.toLowerCase() : "")
                }}
              />
              <Label
                htmlFor={category}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="min-price" className="text-sm">
              Min Price
            </Label>
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="max-price" className="text-sm">
              Max Price
            </Label>
            <Input
              id="max-price"
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={handleClearFilters} variant="outline" className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  )
}