export interface ApiConfig {
  baseUrl: string
  headers?: Record<string, string>
}

export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Get auth token
    const token = localStorage.getItem('token')
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers as Record<string, string>,
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData?.error || errorData?.message || `HTTP ${response.status}`)
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API clients for each service
export const productApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/product` || 'http://gateway:8080/api/product',  
})

export const cartApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/cart` || 'http://gateway:8080/api/cart',
})

export const orderApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/orders` || 'http://gateway:8080/api/order',
})

export const paymentApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments` || 'http://gateway:8080/api/payment',
})

export const userApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/user` || 'http://gateway:8080/api/user',
})

export const authApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/auth` || 'http://gateway:8080/api/auth',
})

export const analyticsApi = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/analytics` || 'http://gateway:8080/api/analytics',
})