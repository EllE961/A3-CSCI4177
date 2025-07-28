import { cartApi } from './api-client'

/* ---------- Types ---------- */

// Service health
export interface ServiceHealthResponse {
  service: string
  status: string
  uptime_seconds: string
  checked_at: string
  message: string
}

// Cart item
export interface CartItem {
  itemId: string
  productId: string
  productName: string
  price: number
  quantity: number
  vendorId?: string
  vendorName?: string
  addedAt?: string
  productImage?: string  // Added for client-side enrichment
  availableStock?: number  // Added for client-side enrichment
  _links?: {
    product: string
    update: string
    remove: string
  }
}

// Paginated items response
export interface CartItemsResponse {
  page: number
  limit: number
  totalItems: number
  items: CartItem[]
}

// Cart totals
export interface CartTotals {
  totalItems: number
  subtotal: number
  estimatedTax: number
  total: number
  currency: string
}

// DTOs
export interface AddToCartDto {
  productId: string
  quantity: number
}

export interface UpdateCartItemDto {
  quantity: number
}

/* ---------- Service ---------- */

class CartService {
  /* Health */
  async getHealth(): Promise<ServiceHealthResponse> {
    return cartApi.get<ServiceHealthResponse>('/health')
  }

  /* Retrieval */
  async getCart(page = 1, limit = 50): Promise<CartItemsResponse> {
    return cartApi.get<CartItemsResponse>(`/?page=${page}&limit=${limit}`)
  }

  async getCartTotals(): Promise<CartTotals> {
    return cartApi.get<CartTotals>('/totals')
  }

  /* Manage items */
  async addToCart(data: AddToCartDto): Promise<CartItemsResponse> {
    return cartApi.post<CartItemsResponse>('/items', data)
  }

  async updateCartItem(
    itemId: string,
    data: UpdateCartItemDto
  ): Promise<CartItemsResponse> {
    return cartApi.put<CartItemsResponse>(`/items/${itemId}`, data)
  }

  async removeFromCart(itemId: string): Promise<CartItemsResponse> {
    return cartApi.delete<CartItemsResponse>(`/items/${itemId}`)
  }

  async clearCart(): Promise<{ message: string }> {
    return cartApi.delete<{ message: string }>('/clear')
  }

  /* Admin */
  async clearExpiredCarts(
    days = 7
  ): Promise<{ message: string; deletedCount: number }> {
    return cartApi.delete<{ message: string; deletedCount: number }>(
      `/admin/clear-expired?days=${days}`
    )
  }
}

export const cartService = new CartService()
