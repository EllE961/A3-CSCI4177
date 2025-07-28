"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { cartService, type CartItemsResponse, type CartTotals } from '@/lib/api/cart-service'
import { useAuth } from './auth-provider'

interface CartContextType {
  cart: CartItemsResponse | null
  totals: CartTotals | null
  loading: boolean
  refreshCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItemsResponse | null>(null)
  const [totals, setTotals] = useState<CartTotals | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Queue for cart operations to prevent race conditions
  const operationQueue = useRef<Promise<any>>(Promise.resolve())
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const refreshCart = async () => {
    if (!user || user.role !== 'consumer') {
      setCart(null)
      setTotals(null)
      setLoading(false)
      return
    }

    // Cancel any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }

    try {
      const [cartData, totalsData] = await Promise.all([
        cartService.getCart(),
        cartService.getCartTotals()
      ])
      setCart(cartData)
      setTotals(totalsData)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced refresh to avoid multiple refreshes when adding items quickly
  const debouncedRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    refreshTimeoutRef.current = setTimeout(() => {
      refreshCart()
    }, 300)
  }

  useEffect(() => {
    refreshCart()
  }, [user])

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user || user.role !== 'consumer') return

    // Queue the operation to prevent race conditions
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        // Optimistic update - increment the count immediately
        setTotals(prev => prev ? { ...prev, totalItems: prev.totalItems + quantity } : null)
        
        await cartService.addToCart({ productId, quantity })
        
        // Immediately refresh cart to show new items
        await refreshCart()
      } catch (error) {
        // On error, immediately refresh to get correct state
        await refreshCart()
        throw error
      }
    })

    return operationQueue.current
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        await cartService.updateCartItem(itemId, { quantity })
        debouncedRefresh()
      } catch (error) {
        await refreshCart()
        throw error
      }
    })

    return operationQueue.current
  }

  const removeItem = async (itemId: string) => {
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        // Optimistic update - decrement count
        const item = cart?.items.find(i => i.itemId === itemId)
        if (item && totals) {
          setTotals(prev => prev ? { ...prev, totalItems: Math.max(0, prev.totalItems - item.quantity) } : null)
        }
        
        await cartService.removeFromCart(itemId)
        debouncedRefresh()
      } catch (error) {
        await refreshCart()
        throw error
      }
    })

    return operationQueue.current
  }

  const clearCart = async () => {
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        await cartService.clearCart()
        setCart(null)
        setTotals(null)
      } catch (error) {
        await refreshCart()
        throw error
      }
    })

    return operationQueue.current
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  return (
    <CartContext.Provider value={{
      cart,
      totals,
      loading,
      refreshCart,
      addToCart,
      addItem: addToCart,
      updateQuantity,
      removeItem,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}