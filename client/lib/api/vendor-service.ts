import { userApi } from './api-client'

export interface Vendor {
  _id: string
  vendorId: string
  storeName: string
  description?: string
  location: string
  rating: number
  totalProducts: number
  logoUrl?: string
  bannerUrl?: string
  storeBannerUrl?: string
  categories?: string[]
  createdAt: string
  phoneNumber?: string
  socialLinks?: string[]
  isApproved?: boolean
}

export interface VendorQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  minRating?: number
  sort?: 'name:asc' | 'name:desc' | 'createdAt:asc' | 'createdAt:desc' | 'rating:asc' | 'rating:desc'
}

interface VendorResponse {
  vendors: Vendor[]
  total: number
  page: number
  pages: number
}

class VendorService {
  async getVendors(query: VendorQuery = {}): Promise<VendorResponse> {
    try {
      const params = new URLSearchParams()
      
      if (query.page) params.append('page', query.page.toString())
      if (query.limit) params.append('limit', query.limit.toString())
      if (query.search) params.append('search', query.search)
      if (query.minRating) params.append('minRating', query.minRating.toString())
      if (query.sort) params.append('sort', query.sort)
      
      const queryString = params.toString()
      const endpoint = queryString ? `/vendors/public?${queryString}` : '/vendors/public'
      
      const response = await userApi.get<VendorResponse>(endpoint)
      return response
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
      return {
        vendors: [],
        total: 0,
        page: query.page || 1,
        pages: 0
      }
    }
  }

  async getVendorById(vendorId: string): Promise<Vendor | null> {
    try {
      const response = await userApi.get<{ vendor: Vendor }>(`/vendors/public/${vendorId}`)
      return response.vendor
    } catch (error) {
      console.error('Failed to fetch vendor:', error)
      return null
    }
  }

}

export const vendorService = new VendorService()