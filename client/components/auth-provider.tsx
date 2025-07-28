"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, type User } from '@/lib/api/auth-service'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (username: string, email: string, password: string, role?: 'consumer' | 'vendor') => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const storedToken = authService.getToken()
      if (!storedToken) {
        setLoading(false)
        return
      }

      // Validate token and get user data
      const validation = await authService.validateToken()
      if (validation.valid) {
        const userData = await authService.getMe()
        setUser(userData)
        setToken(storedToken)
      } else {
        // Token is invalid, clear it
        authService.clearToken()
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      authService.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      const userData = {
        userId: response.user.userId,
        username: response.user.username,
        email: email, // API doesn't return email in login response
        role: response.user.role as 'consumer' | 'vendor' | 'admin'
      }
      setUser(userData)
      setToken(response.token)
      
      // Refresh user data to get complete profile
      await refreshUser()
      
      return userData
    } catch (error) {
      throw error
    }
  }

  const signUp = async (
    username: string, 
    email: string, 
    password: string, 
    role: 'consumer' | 'vendor' = 'consumer'
  ) => {
    try {
      const response = await authService.register({
        username,
        email,
        password,
        role
      })
      
      // After successful registration, sign in the user
      await signIn(email, password)
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (token) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      authService.clearToken()
    }
  }

  const refreshUser = async () => {
    try {
      if (token) {
        const userData = await authService.getMe()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, sign out
      await signOut()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signOut,
    logout: signOut, // Alias for signOut
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for getting auth session data (compatible with existing code)
export function useAuthSession() {
  const { user, loading } = useAuth()
  
  return {
    data: user ? {
      user: {
        id: user.userId,
        name: user.username,
        email: user.email,
        role: user.role,
        image: null // Not provided by your API
      }
    } : null,
    status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated'
  }
} 