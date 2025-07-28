"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { productService } from "@/lib/api/product-service"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Star, 
  Store,
  Package,
  Shield,
  Truck,
  ChevronRight
} from "lucide-react"
import type { Product, Review } from "@/lib/api/product-service"
import { vendorService } from "@/lib/api/vendor-service"

export default function ProductDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { cart, addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [vendorName, setVendorName] = useState<string>("")
  
  const isVendor = user?.role === 'vendor'
  const isConsumer = user?.role === 'consumer'
  const isOwnProduct = isVendor && product?.vendorId === user?.userId

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          productService.getProduct(params.id as string),
          productService.getProductReviews(params.id as string)
        ])
        setProduct(productData)
        setReviews(reviewsData)
        
        // Fetch vendor info if vendorName is not available
        if (productData.vendorName) {
          setVendorName(productData.vendorName)
        } else if (productData.vendorId) {
          try {
            const vendorData = await vendorService.getVendorById(productData.vendorId)
            if (vendorData) {
              setVendorName(vendorData.storeName)
            }
          } catch (error) {
            console.error('Failed to fetch vendor info:', error)
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart")
      return
    }
    
    if (user.role !== 'consumer') {
      toast.error("Only consumers can add items to cart")
      return
    }

    if (!product) return
    if (quantity > maxAddable) {
      toast.error(`Only ${maxAddable} left in stock (including items in your cart)`)
      return
    }
    try {
      await addItem(product.productId, quantity)
      toast.success(`Added ${quantity} item(s) to cart!`)
    } catch (error) {
      toast.error("Failed to add to cart")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-8 flex items-center gap-2">
            <div className="h-4 bg-muted animate-pulse rounded w-16" />
            <div className="h-4 bg-muted animate-pulse rounded w-4" />
            <div className="h-4 bg-muted animate-pulse rounded w-16" />
            <div className="h-4 bg-muted animate-pulse rounded w-4" />
            <div className="h-4 bg-muted animate-pulse rounded w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image gallery skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>

            {/* Product info skeleton */}
            <div className="space-y-6">
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-3/4 mb-2" />
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="h-6 bg-muted animate-pulse rounded w-20" />
                </div>
              </div>

              {/* Rating skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-5 bg-muted animate-pulse rounded w-28" />
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
              </div>

              {/* Price skeleton */}
              <div className="h-8 bg-muted animate-pulse rounded w-24" />

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>

              {/* Add to cart skeleton */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 bg-muted animate-pulse rounded w-32" />
                  <div className="h-12 bg-muted animate-pulse rounded flex-1" />
                </div>
              </div>

              {/* Features skeleton */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-6 w-6 bg-muted animate-pulse rounded mx-auto mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-20 mx-auto" />
                    <div className="h-3 bg-muted animate-pulse rounded w-16 mx-auto mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="mt-16">
            <div className="flex gap-4 mb-6">
              <div className="h-10 bg-muted animate-pulse rounded w-32" />
              <div className="h-10 bg-muted animate-pulse rounded w-40" />
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : ["/placeholder-product.jpg"]
  const isOutOfStock = product.quantityInStock === 0
  const currentCartQty =
  cart?.items.find(i => i.productId === product.productId)?.quantity ?? 0
  const maxAddable       = Math.max(0, product.quantityInStock - currentCartQty)
  const isSoldOutForUser = maxAddable === 0

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            {vendorName && product.vendorId ? (
              <>
                <Link href={`/shop/${product.vendorId}`} className="hover:text-primary">{vendorName}</Link>
                <span className="mx-2">/</span>
              </>
            ) : (
              <>
                <Link href="/shop" className="hover:text-primary">Shop</Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Vendor viewing own product notice */}
          {isOwnProduct && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <Store className="inline h-4 w-4 mr-2" />
                You are viewing your own product. Consumer features like purchasing and reviews are disabled in vendor mode.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xl px-6 py-3">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  {(vendorName || product.vendorName) && (
                    <Link 
                      href={`/shop/${product.vendorId}`}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Store className="h-4 w-4" />
                      {vendorName || product.vendorName}
                    </Link>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                </div>
              </div>

              {/* Rating */}
              {product.averageRating !== undefined && product.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.averageRating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.averageRating.toFixed(1)} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="text-3xl font-bold">${product.price.toFixed(2)}</div>

              {/* Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Add to Cart - Only show for consumers */}
              {!isVendor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={isSoldOutForUser}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        value={quantity}
                        onChange={(e) => {
                             const v = parseInt(e.target.value) || 1
                             setQuantity(Math.min(Math.max(1, v), maxAddable))
                           }}
                        className="w-16 text-center border-0 focus-visible:ring-0"
                        disabled={isSoldOutForUser}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(prev => Math.min(maxAddable, prev + 1))}
                        disabled={isSoldOutForUser || quantity >= maxAddable}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={isSoldOutForUser}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                  
                  {maxAddable > 0 && maxAddable <= 5 && (
                    <p className="text-sm text-orange-600 font-medium">
                      Only {maxAddable} more left!
                    </p>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    As a vendor, you cannot purchase products. Switch to a consumer account to shop.
                  </p>
                </div>
              )}

              {/* Vendor Info Card */}
              {(vendorName || product.vendorName) && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <Link 
                      href={`/shop/${product.vendorId}`}
                      className="flex items-center justify-between hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{vendorName || product.vendorName}</p>
                          <p className="text-sm text-muted-foreground">Visit Store</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% secure</p>
                </div>
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-16">
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">
                          {isVendor 
                            ? "No reviews yet for this product." 
                            : "No reviews yet. Be the first to review!"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review.reviewId || review._id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{review.userName || review.username || 'Anonymous'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Information</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Standard shipping: 5-7 business days</li>
                        <li>• Express shipping: 2-3 business days</li>
                        <li>• Free shipping on orders over $50</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Return Policy</h3>
                      <p className="text-sm text-muted-foreground">
                        We accept returns within 30 days of delivery. Items must be unused and in original packaging.
                        Refunds will be processed within 5-7 business days after we receive the returned item.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  )
}