import { productApi } from './api-client'

/* ---------- Types ---------- */

// Service health
export interface ServiceHealthResponse {
  service: string
  status: string
  uptime_seconds: string
  checked_at: string
  message: string
}

export interface Product {
  productId: string
  name: string
  description: string
  price: number
  quantityInStock: number
  category: string
  vendorId: string
  vendorName?: string
  images?: string[]
  thumbnail?: string
  tags?: string[]
  averageRating?: number
  reviewCount?: number
  rating?: number
  isPublished?: boolean
  createdAt?: string
  updatedAt?: string
  stock?: number
}

export interface Review {
  _id?: string
  reviewId?: string
  productId: string
  userId: string
  userName?: string
  username?: string
  rating: number
  comment: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  vendorId?: string
  tags?: string | string[]
  sort?:
    | 'price'
    | '-price'
    | 'averageRating'
    | '-averageRating'
    | 'createdAt'
    | '-createdAt'
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

export interface CreateProductDto {
  name: string
  description: string
  price: number
  quantityInStock: number
  category: string
  vendorId?: string
  vendorName?: string
  images?: string[]
  tags?: string[]
  isPublished?: boolean
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  addImages?: string[]
  deleteImages?: string[]
}

export interface CreateReviewDto {
  rating: number
  comment: string
}

/* ---------- Service ---------- */

class ProductService {
  // Health endpoint
  async getHealth(): Promise<ServiceHealthResponse> {
    return productApi.get<ServiceHealthResponse>('/health')
  }

  async getProducts(query?: ProductQuery): Promise<ProductsResponse> {
    const params = new URLSearchParams()
  
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return
  
        if (key === 'search') {
          params.append('name', String(value))          
          return
        }
  
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      })
    }
  
    const qs = params.toString()
    const endpoint = qs ? `?${qs}` : ''
    return productApi.get<ProductsResponse>(endpoint)
  }
  

  async getProduct(id: string): Promise<Product> {
    return productApi.get<Product>(`/${id}`)
  }

  async getVendorProducts(vendorId: string, query?: ProductQuery): Promise<ProductsResponse> {
    const params = new URLSearchParams()

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    const qs = params.toString()
    const endpoint = qs ? `/vendor/${vendorId}?${qs}` : `/vendor/${vendorId}`

    return productApi.get<ProductsResponse>(endpoint)
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    return productApi.post<Product>('/', data)
  }

  async createProductWithImages(formData: FormData): Promise<any> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Failed to create product')
    }

    return response.json()
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return productApi.put<Product>(`/${id}`, data)
  }

  async deleteProduct(id: string): Promise<void> {
    await productApi.delete<void>(`/${id}`)
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    return productApi.patch<Product>(`/${id}/decrement-stock`, { quantity })
  }

  // Review endpoints
  async getProductReviews(productId: string, page = 1, limit = 10): Promise<Review[]> {
    const response = await productApi.get<{
      reviews: Review[]
      page: number
      limit: number
      total: number
    }>(`/${productId}/reviews?page=${page}&limit=${limit}`)
    
    return response.reviews || []
  }

  async createReview(productId: string, data: CreateReviewDto): Promise<Review> {
    return productApi.post<Review>(`/${productId}/reviews`, data)
  }

  async updateReview(
    productId: string,
    reviewId: string,
    data: CreateReviewDto
  ): Promise<Review> {
    return productApi.put<Review>(`/${productId}/reviews/${reviewId}`, data)
  }

  async deleteReview(productId: string, reviewId: string): Promise<void> {
    await productApi.delete<void>(`/${productId}/reviews/${reviewId}`)
  }
}

export const productService = new ProductService()
