"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { orderService } from "@/lib/api/order-service"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin,
  CreditCard,
  Calendar,
  ArrowLeft,
  Copy
} from "lucide-react"
import type { Order, OrderTracking } from "@/lib/api/order-service"

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500" },
  processing: { label: "Processing", icon: Package, color: "bg-blue-500" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-purple-500" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500" },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchOrderDetails()
  }, [user, router, params.id])

  const fetchOrderDetails = async () => {
    try {
      const [orderData, trackingData] = await Promise.all([
        orderService.getOrder(params.id as string),
        orderService.getOrderTracking(params.id as string)
      ])
      setOrder(orderData)
      setTracking(trackingData)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return

    setCancelling(true)
    try {
      const updatedOrder = await orderService.cancelOrder(order._id)
      setOrder(updatedOrder)
      toast.success('Order cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderId)
      toast.success('Order ID copied to clipboard')
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status].icon

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order Details</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Order #{order.orderId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyOrderId}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Badge 
                variant="secondary"
                className={`${statusConfig[order.status].color} text-white px-4 py-2`}
              >
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusConfig[order.status].label}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src="/placeholder-product.jpg"
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Tracking */}
              {tracking && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tracking.trackingNumber && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-mono">{tracking.trackingNumber}</p>
                        {tracking.carrier && (
                          <p className="text-sm text-muted-foreground mt-1">
                            via {tracking.carrier}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {tracking.estimatedDelivery && (
                      <div className="mb-6">
                        <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                        <p className="font-medium">
                          {new Date(tracking.estimatedDelivery).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {tracking.updates.map((update, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${
                              index === 0 ? 'bg-primary' : 'bg-gray-300'
                            }`} />
                            {index < tracking.updates.length - 1 && (
                              <div className="w-0.5 h-16 bg-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className="font-medium">{update.status}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(update.timestamp).toLocaleString()}
                            </p>
                            {update.location && (
                              <p className="text-sm text-muted-foreground">{update.location}</p>
                            )}
                            {update.description && (
                              <p className="text-sm mt-1">{update.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Payment Method: {order.paymentMethod}<br />
                    Status: <Badge variant="outline" className="ml-1">
                      {order.paymentStatus}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              {/* Order Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Order Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {new Date(order.createdAt!).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              {order.status === 'pending' && (
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}