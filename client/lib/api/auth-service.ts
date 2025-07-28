import { authApi } from './api-client'

// Types matching your API responses
export interface User {
  userId: string
  username: string
  email: string
  role: 'consumer' | 'vendor' | 'admin'
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  token: string
  user: {
    userId: string
    username: string
    email: string
    role: string
  }
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role: 'consumer' | 'vendor' | 'admin'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ApiError {
  error: string
}

class AuthService {
  async register(data: RegisterRequest): Promise<{ message: string; user: User }> {
    try {
      return await authApi.post<{ message: string; user: User }>('/register', data)
    } catch (err: any) {
      if (err?.message) throw err
      throw { error: 'Registration failed.' }
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post<AuthResponse>('/login', data)
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      return response
    } catch (err: any) {
      if (err?.message) throw err
      throw { error: 'Login failed.' }
    }
  }

  async logout(): Promise<void> {
    try {
      await authApi.post<void>('/logout')
      // Clear token from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (err: any) {
      if (err?.error) throw err
      throw { error: 'Logout failed.' }
    }
  }

  async getMe(): Promise<User> {
    try {
      return await authApi.get<User>('/me')
    } catch (err: any) {
      if (err?.error) throw err
      throw { error: 'Failed to fetch user profile.' }
    }
  }

  async validateToken(): Promise<{
    valid: boolean
    userId: string
    role: string
    exp: number
  }> {
    try {
      return await authApi.get<{ valid: boolean; userId: string; role: string; exp: number }>('/validate')
    } catch (err: any) {
      if (err?.error) throw err
      throw { error: 'Token validation failed.' }
    }
  }

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    try {
      const response = await authApi.put<{ message: string; token: string }>('/password', {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword
      })
      
      // Update token if provided
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      
      return response
    } catch (err: any) {
      if (err?.message) throw err
      throw { error: 'Password change failed.' }
    }
  }

  // Utility methods
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  getCurrentUser(): { userId: string; username: string; email: string; role: string } | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}



export const authService = new AuthService()