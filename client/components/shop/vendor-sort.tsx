"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VendorSortProps {
  onSortChange: (sort: string) => void
}

export function VendorSort({ onSortChange }: VendorSortProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select onValueChange={onSortChange} defaultValue="rating:desc">
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating:desc">Highest Rated</SelectItem>
          <SelectItem value="rating:asc">Lowest Rated</SelectItem>
          <SelectItem value="name:asc">Name (A-Z)</SelectItem>
          <SelectItem value="name:desc">Name (Z-A)</SelectItem>
          <SelectItem value="createdAt:desc">Newest First</SelectItem>
          <SelectItem value="createdAt:asc">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}