"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import type { Product } from "@/lib/api/product-service"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    
    if (!user) {
      toast.error("Please sign in to add items to cart")
      return
    }
    
    if (user.role !== 'consumer') {
      toast.error("Only consumers can add items to cart")
      return
    }
    
    try {
      await addToCart(product.productId, 1)
      toast.success("Added to cart!")
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error("Failed to add to cart")
    }
  }
  
  const productImage = product.thumbnail || product.images?.[0] || "/placeholder.jpg"
  const isOutOfStock = product.quantityInStock === 0

  return (
    <Link href={`/products/${product.productId}`} className="h-full">
      <Card className="group h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              {product.vendorName && (
                <p className="text-sm text-muted-foreground line-clamp-1">by {product.vendorName}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="space-y-1">
                <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                <div className="flex items-center gap-1">
                  <Star className={`h-4 w-4 ${(product.averageRating ?? 0) > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  <span className="text-sm text-muted-foreground">
                    {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} ({product.reviewCount || 0})
                  </span>
                </div>
              </div>
              
              <Badge variant="secondary" className="capitalize shrink-0">
                {product.category}
              </Badge>
            </div>
            
            {product.quantityInStock > 0 && product.quantityInStock <= 5 && (
              <p className="text-sm text-orange-600 font-medium pt-2">
                Only {product.quantityInStock} left in stock!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}