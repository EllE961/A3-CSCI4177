import { orderApi } from './api-client'

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  _id: string
  orderId: string
  parentOrderId?: string
  userId: string
  vendorId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt?: string
  updatedAt?: string
}

export interface CreateOrderDto {
  parentOrderId: string // From payment service
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
}

export interface UpdateOrderStatusDto {
  status: Order['status']
}

export interface OrderTracking {
  orderId: string
  status: Order['status']
  estimatedDelivery?: string
  trackingNumber?: string
  carrier?: string
  updates: Array<{
    status: string
    timestamp: string
    location?: string
    description?: string
  }>
}

class OrderService {
  async createOrder(data: CreateOrderDto): Promise<Order[]> {
    return orderApi.post<Order[]>('/', data)
  }

  async getOrders(): Promise<Order[]> {
    return orderApi.get<Order[]>('/')
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return orderApi.get<Order[]>(`/user/${userId}`)
  }

  async getOrdersByParentId(parentOrderId: string): Promise<Order[]> {
    return orderApi.get<Order[]>(`/parent/${parentOrderId}`)
  }

  async getOrder(id: string): Promise<Order> {
    return orderApi.get<Order>(`/${id}`)
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusDto): Promise<Order> {
    return orderApi.put<Order>(`/${id}/status`, data)
  }

  async cancelOrder(id: string): Promise<Order> {
    return orderApi.post<Order>(`/${id}/cancel`)
  }

  async getOrderTracking(id: string): Promise<OrderTracking> {
    return orderApi.get<OrderTracking>(`/${id}/tracking`)
  }
}

export const orderService = new OrderService()