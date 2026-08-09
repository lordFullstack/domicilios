/**
 * Hook useLocalData
 * Obtiene datos del almacenamiento local (localStorage/IndexedDB)
 */

import { useState, useEffect } from 'react'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { Restaurant, Product, Order } from '@/shared/types'

// ============================================
// HOOK: useRestaurants
// ============================================

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const data = localStorageService.get(STORAGE_KEYS.RESTAURANTS)
      setRestaurants(data || [])
    } catch (err) {
      setError('Error cargando restaurantes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { restaurants, loading, error }
}

// ============================================
// HOOK: useRestaurantById
// ============================================

export const useRestaurantById = (id: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const restaurants = localStorageService.get(STORAGE_KEYS.RESTAURANTS) || []
      const found = restaurants.find((r: Restaurant) => r.id === id)
      setRestaurant(found || null)
    } catch (err) {
      setError('Error cargando restaurante')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  return { restaurant, loading, error }
}

// ============================================
// HOOK: useProducts
// ============================================

export const useProducts = (restaurantId?: string) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      let data = localStorageService.get(STORAGE_KEYS.PRODUCTS) || []

      if (restaurantId) {
        data = data.filter((p: Product) => p.restaurant_id === restaurantId)
      }

      setProducts(data)
    } catch (err) {
      setError('Error cargando productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  return { products, loading, error }
}

// ============================================
// HOOK: useProductById
// ============================================

export const useProductById = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const products = localStorageService.get(STORAGE_KEYS.PRODUCTS) || []
      const found = products.find((p: Product) => p.id === id)
      setProduct(found || null)
    } catch (err) {
      setError('Error cargando producto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  return { product, loading, error }
}

// ============================================
// HOOK: useOrders
// ============================================

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      let data = localStorageService.get(STORAGE_KEYS.ORDERS) || []

      if (userId) {
        data = data.filter((o: Order) => o.user_id === userId)
      }

      // Ordenar por fecha descendente (más recientes primero)
      data = data.sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setOrders(data)
    } catch (err) {
      setError('Error cargando órdenes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const createOrder = (order: Order) => {
    try {
      const current = localStorageService.get(STORAGE_KEYS.ORDERS) || []
      const updated = [...current, order]
      localStorageService.set(STORAGE_KEYS.ORDERS, updated)
      
      // Actualizar estado local
      setOrders(prev => [order, ...prev])
      return true
    } catch (err) {
      console.error('Error creating order:', err)
      setError('Error al crear orden')
      return false
    }
  }

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    try {
      const current = localStorageService.get(STORAGE_KEYS.ORDERS) || []
      const updated = current.map((o: Order) => {
        if (o.id === orderId) {
          return { ...o, ...updates, updated_at: new Date().toISOString() }
        }
        return o
      })
      localStorageService.set(STORAGE_KEYS.ORDERS, updated)
      setOrders(updated.sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
      return true
    } catch (err) {
      console.error('Error updating order:', err)
      setError('Error al actualizar orden')
      return false
    }
  }

  const getOrdersByRestaurant = (restaurantId: string) => {
    return orders.filter((o: Order) => o.restaurant_id === restaurantId)
  }

  const getOrdersByDelivery = (deliveryId: string) => {
    return orders.filter((o: Order) => o.delivery_person_id === deliveryId)
  }

  return { 
    orders, 
    loading, 
    error, 
    createOrder, 
    updateOrder,
    getOrdersByRestaurant,
    getOrdersByDelivery
  }
}

// ============================================
// HOOK: useCart
// ============================================

interface CartItem {
  productId: string
  quantity: number
  unitPrice: number
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const data = localStorageService.get(STORAGE_KEYS.CART) || []
      setCart(data)
    } catch (err) {
      console.error('Error loading cart:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = (productId: string, unitPrice: number, quantity: number = 1) => {
    try {
      const updated = [...cart]
      const existing = updated.find((item) => item.productId === productId)

      if (existing) {
        existing.quantity += quantity
      } else {
        updated.push({ productId, quantity, unitPrice })
      }

      localStorageService.set(STORAGE_KEYS.CART, updated)
      setCart(updated)
      return true
    } catch (err) {
      console.error('Error adding to cart:', err)
      return false
    }
  }

  const removeItem = (productId: string) => {
    try {
      const updated = cart.filter((item) => item.productId !== productId)
      localStorageService.set(STORAGE_KEYS.CART, updated)
      setCart(updated)
      return true
    } catch (err) {
      console.error('Error removing from cart:', err)
      return false
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    try {
      const updated = cart.map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity }
        }
        return item
      })
      localStorageService.set(STORAGE_KEYS.CART, updated)
      setCart(updated)
      return true
    } catch (err) {
      console.error('Error updating quantity:', err)
      return false
    }
  }

  const clear = () => {
    try {
      localStorageService.set(STORAGE_KEYS.CART, [])
      setCart([])
      return true
    } catch (err) {
      console.error('Error clearing cart:', err)
      return false
    }
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  }

  return {
    cart,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    getTotal,
  }
}

// ============================================
// HOOK: useFavorites
// ============================================

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const data = localStorageService.get(STORAGE_KEYS.RESTAURANT_FAVORITES) || []
      setFavorites(data)
    } catch (err) {
      console.error('Error loading favorites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = (restaurantId: string) => {
    try {
      const updated = favorites.includes(restaurantId)
        ? favorites.filter((id) => id !== restaurantId)
        : [...favorites, restaurantId]

      localStorageService.set(STORAGE_KEYS.RESTAURANT_FAVORITES, updated)
      setFavorites(updated)
      return true
    } catch (err) {
      console.error('Error toggling favorite:', err)
      return false
    }
  }

  const isFavorite = (restaurantId: string) => {
    return favorites.includes(restaurantId)
  }

  return { favorites, loading, toggleFavorite, isFavorite }
}
