"use client"

import { useEffect, useState, useRef  } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { productService } from "@/lib/api/product-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import type { CartItemsResponse, CartItem, CartTotals } from "@/lib/api/cart-service"

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const { cart, totals, loading, updateQuantity: updateCartQuantity, removeItem: removeCartItem, clearCart: clearCartItems } = useCart()
  const [enrichedItems, setEnrichedItems] = useState<CartItem[]>([])
  const [loadingImages, setLoadingImages] = useState(true)

  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({})
  const updateTimers = useRef<Record<string, NodeJS.Timeout>>({})


  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (user.role !== 'consumer') {
      router.push('/')
      toast.error('Only consumers can access the cart')
      return
    }
  }, [user, authLoading, router])

  // Fetch product images for cart items
  useEffect(() => {
    const fetchProductImages = async () => {
      if (!cart?.items || cart.items.length === 0) {
        setLoadingImages(false)
        return
      }

      try {
        // Fetch product details for all items in parallel
        const productPromises = cart.items.map(item => 
          productService.getProduct(item.productId).catch(() => null)
        )
        
        const products = await Promise.all(productPromises)
        
        // Enrich cart items with product images
        const enriched = cart.items.map((item, index) => {
          const product = products[index]
          return {
            ...item,
            productImage: product?.thumbnail || product?.images?.[0] || undefined,
            availableStock: product?.quantityInStock ?? Infinity   // ← add stock info
          }
        })
        
        setEnrichedItems(enriched)
      } catch (error) {
        console.error('Failed to fetch product images:', error)
        // Use original cart items without images
        setEnrichedItems(cart.items)
      } finally {
        setLoadingImages(false)
      }
    }

    fetchProductImages()
  }, [cart?.items])

  useEffect(() => {
    const initial = Object.fromEntries(
      cart?.items.map(i => [i.itemId, i.quantity]) ?? []
    )
    setTempQuantities(initial)
  }, [cart?.items])

  const handleQuantityChange = (itemId: string, newQty: number) => {
  const stock = (enrichedItems.find(e => e.itemId === itemId)?.availableStock) ?? Infinity
  if (newQty < 1 || newQty > stock) return
  setTempQuantities(q => ({ ...q, [itemId]: newQty }))

  if (updateTimers.current[itemId]) clearTimeout(updateTimers.current[itemId])

  updateTimers.current[itemId] = setTimeout(async () => {
    try {
      await updateCartQuantity(itemId, newQty)
      toast.success('Cart updated')
    } catch {
      toast.error('Failed to update quantity')
    }
  }, 800)
}

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId)
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCartItems()
      toast.success('Cart cleared')
    } catch (error) {
      toast.error('Failed to clear cart')
    }
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }
  
  // Don't render cart content until auth check is complete
  if (!user || user.role !== 'consumer') {
    return null
  }

  // Show loading state while cart is loading
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-10 bg-muted rounded w-24" />
            </div>
            
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Cart items skeleton */}
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border rounded-lg p-6">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="flex justify-between items-end">
                          <div className="h-10 bg-muted rounded w-32" />
                          <div className="h-6 bg-muted rounded w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary skeleton */}
              <div className="mt-8 lg:mt-0">
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-32" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-4 bg-muted rounded w-16" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-4 bg-muted rounded w-16" />
                    </div>
                  </div>
                  <div className="h-px bg-muted" />
                  <div className="flex justify-between">
                    <div className="h-5 bg-muted rounded w-16" />
                    <div className="h-5 bg-muted rounded w-20" />
                  </div>
                  <div className="h-12 bg-muted rounded w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some products to get started</p>
          </div>
          <div className="pt-4">
            <Link href="/products">
              <Button size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart ({totals?.totalItems || 0} items)</h1>
            <Button variant="outline" size="sm" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {(loadingImages ? cart.items : enrichedItems).map((item) => {
                const enrichedItem = enrichedItems.find(ei => ei.itemId === item.itemId) || item
                return (
                  <Card key={item.itemId}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Link href={`/products/${item.productId}`} className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-80 transition-opacity">
                          {enrichedItem.productImage ? (
                            <Image
                              src={enrichedItem.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <ShoppingBag className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </Link>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/products/${item.productId}`} className="hover:underline">
                              <h3 className="font-semibold">{item.productName}</h3>
                            </Link>
                            {item.vendorName && (
                              <p className="text-sm text-muted-foreground">by {item.vendorName}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.itemId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-end justify-between mt-4">
                          {(() => {
                            const qty   = tempQuantities[item.itemId] ?? item.quantity
                            const stock = enrichedItem.availableStock ?? Infinity

                            return (
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.itemId, qty - 1)}
                                  disabled={qty <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                  value={qty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    if (!isNaN(val) && val > 0 && val <= stock) {
                                      handleQuantityChange(item.itemId, val)
                                    }
                                  }}
                                  className="w-16 text-center border-0 focus-visible:ring-0"
                                />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.itemId, qty + 1)}
                                  disabled={qty >= stock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })()}
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <Card className="sticky top-20">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${totals?.subtotal.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${totals?.estimatedTax.toFixed(2) || '0.00'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${totals?.total.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  <Link href="/checkout" className="block">
                    <Button size="lg" className="w-full">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link href="/products" className="block">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}