"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { orderService } from "@/lib/api/order-service"
import { productService } from "@/lib/api/product-service"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Store,
  Home,
  Settings
} from "lucide-react"
import type { Order } from "@/lib/api/order-service"
import type { Product } from "@/lib/api/product-service"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  pendingOrders: number
  revenueChange: number
  ordersChange: number
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    revenueChange: 12.5,
    ordersChange: 8.2
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch vendor's products
      const vendorProducts = await productService.getVendorProducts(user!.userId)
      setProducts(vendorProducts.products)

      // Fetch all orders (vendor sees their own orders)
      const allOrders = await orderService.getOrders()
      
      // Calculate stats
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)
      const pendingOrders = allOrders.filter(order => order.status === 'pending').length
      
      setStats({
        totalRevenue,
        totalOrders: allOrders.length,
        totalProducts: vendorProducts.products.length,
        pendingOrders,
        revenueChange: 12.5, // Mock data
        ordersChange: 8.2 // Mock data
      })
      
      // Get recent orders (last 5)
      setRecentOrders(allOrders.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
              <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.username}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Marketplace
                </Button>
              </Link>
              <Link href={`/shop/${user?.userId}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  My Store
                </Button>
              </Link>
              <Link href="/vendor/products/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stats.revenueChange > 0 ? "text-green-600" : "text-red-600"}>
                    {stats.revenueChange > 0 ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}
                    {Math.abs(stats.revenueChange)}%
                  </span>
                  {" "}from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stats.ordersChange > 0 ? "text-green-600" : "text-red-600"}>
                    {stats.ordersChange > 0 ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}
                    {Math.abs(stats.ordersChange)}%
                  </span>
                  {" "}from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Products in your catalog
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Orders awaiting processing
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Link href="/vendor/orders">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/vendor/products" className="block">
                    <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-base">Manage Products</p>
                            <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove items</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/vendor/orders" className="block">
                    <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-base">View Orders</p>
                            <p className="text-sm text-muted-foreground mt-1">Process customer orders</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/vendor/analytics" className="block">
                    <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-base">View Analytics</p>
                            <p className="text-sm text-muted-foreground mt-1">Track performance metrics</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/vendor/profile" className="block">
                    <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Settings className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-base">Store Profile</p>
                            <p className="text-sm text-muted-foreground mt-1">Manage store settings</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}