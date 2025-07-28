"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { orderService } from "@/lib/api/order-service"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Package, Truck, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import type { Order } from "@/lib/api/order-service"

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500" },
  processing: { label: "Processing", icon: Package, color: "bg-blue-500" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-purple-500" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500" },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Order['status'] | 'all'>('all')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchOrders()
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders(user!.userId)
      setOrders(data.sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      ))
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

  const getOrdersByStatus = (status: Order['status']) => 
    orders.filter(order => order.status === status).length

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

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <Package className="h-24 w-24 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">No orders yet</h1>
            <p className="text-muted-foreground">Start shopping to see your orders here</p>
          </div>
          <div className="pt-4">
            <Link href="/products">
              <Button size="lg">
                Start Shopping
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
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid grid-cols-6 w-full max-w-2xl mb-8">
              <TabsTrigger value="all">
                All ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({getOrdersByStatus('pending')})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({getOrdersByStatus('processing')})
              </TabsTrigger>
              <TabsTrigger value="shipped">
                Shipped ({getOrdersByStatus('shipped')})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({getOrdersByStatus('delivered')})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({getOrdersByStatus('cancelled')})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No {activeTab} orders</p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order, index) => {
                  const StatusIcon = statusConfig[order.status].icon
                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">Order #{order.orderId}</h3>
                                <Badge 
                                  variant="secondary"
                                  className={`${statusConfig[order.status].color} text-white`}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[order.status].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Placed on {new Date(order.createdAt!).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.productId} className="flex justify-between text-sm">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                              </div>
                            ))}
                            
                            <div className="pt-3 border-t">
                              <div className="flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold">${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                            
                            {order.status === 'delivered' && (
                              <div className="pt-3">
                                <Button variant="outline" size="sm" className="w-full">
                                  Leave a Review
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}