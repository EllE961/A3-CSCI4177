"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { productService } from "@/lib/api/product-service"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  Package,
  DollarSign,
  BarChart3,
  RefreshCw,
  PlusCircle,
  Eye,
  ArrowLeft
} from "lucide-react"
import type { Product } from "@/lib/api/product-service"

export default function VendorProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [stockUpdateDialog, setStockUpdateDialog] = useState<{
    open: boolean
    product: Product | null
  }>({ open: false, product: null })
  const [stockQuantity, setStockQuantity] = useState<string>("")
  const [isUpdatingStock, setIsUpdatingStock] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (user.role !== 'vendor' && user.role !== 'admin') {
      router.push('/')
      toast.error('Access denied. Vendor account required.')
      return
    }

    fetchProducts()
  }, [user, router])

  const fetchProducts = async () => {
    try {
      const response = await productService.getVendorProducts(user!.userId)
      // console.log('Vendor products response:', response)
      // console.log('First product data:', JSON.stringify(response.products?.[0], null, 2))
      setProducts(response.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeletingId(productId)
    try {
      await productService.deleteProduct(productId)
      setProducts(products.filter(p => p.productId !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdateStock = async () => {
    if (!stockUpdateDialog.product || !stockQuantity) return

    const newQuantity = parseInt(stockQuantity)
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    setIsUpdatingStock(true)
    try {
      await productService.updateProduct(stockUpdateDialog.product.productId, {
        quantityInStock: newQuantity
      })
      
      setProducts(products.map(p => 
        p.productId === stockUpdateDialog.product!.productId 
          ? { ...p, quantityInStock: newQuantity }
          : p
      ))
      
      toast.success('Stock updated successfully')
      setStockUpdateDialog({ open: false, product: null })
      setStockQuantity("")
    } catch (error) {
      console.error('Failed to update stock:', error)
      toast.error('Failed to update stock')
    } finally {
      setIsUpdatingStock(false)
    }
  }

  const openStockUpdateDialog = (product: Product) => {
    setStockUpdateDialog({ open: true, product })
    setStockQuantity(product.quantityInStock.toString())
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalValue = products.reduce((sum, product) => {
    const price = Number(product.price) || 0
    const stock = Number(product.quantityInStock) || 0
    return sum + (price * stock)
  }, 0)
  
  const totalStock = products.reduce((sum, product) => {
    const stock = Number(product.quantityInStock) || 0
    return sum + stock
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded w-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setLoading(true)
                  fetchProducts()
                }}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Link href="/vendor/products/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No products found' : 'No products yet'}
                  </p>
                  {!searchQuery && (
                    <Link href="/vendor/products/new">
                      <Button variant="outline" className="mt-4">
                        Add Your First Product
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={product.images?.[0] || "/placeholder-product.jpg"}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.averageRating ? `★ ${product.averageRating.toFixed(1)}` : 'No ratings'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="secondary" className="capitalize">
                              {product.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Uncategorized</span>
                          )}
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={product.quantityInStock === 0 ? 'text-red-600 font-medium' : ''}>
                            {product.quantityInStock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.quantityInStock > 0 ? "default" : "destructive"}>
                            {product.quantityInStock > 0 ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/vendor/products/${product.productId}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View product details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openStockUpdateDialog(product)}
                              title="Quick stock update"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  disabled={deletingId === product.productId}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/vendor/products/${product.productId}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/vendor/products/${product.productId}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openStockUpdateDialog(product)}
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Update Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteProduct(product.productId)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Update Dialog */}
        <Dialog 
          open={stockUpdateDialog.open} 
          onOpenChange={(open) => {
            if (!open) {
              setStockUpdateDialog({ open: false, product: null })
              setStockQuantity("")
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock Quantity</DialogTitle>
              <DialogDescription>
                {stockUpdateDialog.product && (
                  <>
                    Update stock for <strong>{stockUpdateDialog.product.name}</strong>
                    <br />
                    Current stock: {stockUpdateDialog.product.quantityInStock} units
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stock-quantity">New Stock Quantity</Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Enter new stock quantity"
                  disabled={isUpdatingStock}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStockUpdateDialog({ open: false, product: null })
                  setStockQuantity("")
                }}
                disabled={isUpdatingStock}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStock}
                disabled={isUpdatingStock || !stockQuantity}
              >
                {isUpdatingStock ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Stock'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}