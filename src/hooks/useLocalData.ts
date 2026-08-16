/**
 * Hooks de datos — Supabase real
 *
 * Mismos nombres/firmas que la versión anterior basada en localStorage,
 * para no tener que tocar cada pantalla que ya los consume.
 * El carrito (useCart) sigue siendo local: es estado efímero de sesión,
 * no necesita tabla en la base de datos.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { useAuth } from '@/shared/hooks/useAuth'
import { Restaurant, Product, Order } from '@/shared/types'

// ============================================
// HOOK: useRestaurants
// ============================================

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name')

      if (cancelled) return
      if (error) {
        setError('Error cargando restaurantes')
        console.error(error)
      } else {
        setRestaurants(data || [])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
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
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (cancelled) return
      if (error) {
        setError('Error cargando restaurante')
        console.error(error)
      } else {
        setRestaurant(data)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return { restaurant, loading, error }
}

// ============================================
// HOOK: useProducts (con CRUD)
// ============================================

export const useProducts = (restaurantId?: string) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('name')
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }
    const { data, error } = await query

    if (error) {
      setError('Error cargando productos')
      console.error(error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    reload()
  }, [reload])

  const createProduct = async (product: {
    restaurant_id: string
    name: string
    description: string
    price: number
    image_url: string
    available: boolean
  }) => {
    const { error } = await supabase.from('products').insert(product)
    if (error) {
      console.error('Error creating product:', error)
      setError('Error al crear producto')
      return false
    }
    await reload()
    return true
  }

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', productId)
    if (error) {
      console.error('Error updating product:', error)
      setError('Error al actualizar producto')
      return false
    }
    await reload()
    return true
  }

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      console.error('Error deleting product:', error)
      setError('Error al eliminar producto')
      return false
    }
    await reload()
    return true
  }

  const toggleAvailability = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return false
    return updateProduct(productId, { available: !product.available })
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
  }
}

// ============================================
// HOOK: useProductById
// ============================================

export const useProductById = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (cancelled) return
      if (error) {
        setError('Error cargando producto')
        console.error(error)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return { product, loading, error }
}

// ============================================
// HOOK: useOrders (con CRUD)
// ============================================

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query

    if (error) {
      setError('Error cargando órdenes')
      console.error(error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  const createOrder = async (
    order: {
      user_id: string
      restaurant_id: string
      total: number
      status: string
      delivery_address: string
      special_instructions?: string
      payment_method?: string
    },
    items: { product_id: string; quantity: number; unit_price: number }[]
  ) => {
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (orderError || !newOrder) {
      console.error('Error creating order:', orderError)
      setError('Error al crear orden')
      return false
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items.map((item) => ({ ...item, order_id: newOrder.id })))

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
      }
    }

    await reload()
    return true
  }

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
    if (error) {
      console.error('Error updating order:', error)
      setError('Error al actualizar orden')
      return false
    }
    await reload()
    return true
  }

  const getOrdersByRestaurant = (restaurantId: string) => {
    return orders.filter((o) => o.restaurant_id === restaurantId)
  }

  const getOrdersByDelivery = (deliveryId: string) => {
    return orders.filter((o) => o.delivery_person_id === deliveryId)
  }

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    getOrdersByRestaurant,
    getOrdersByDelivery,
  }
}

// ============================================
// HOOK: useCart (sigue local — carrito efímero de sesión)
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
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('favorites')
      .select('restaurant_id')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error loading favorites:', error)
    } else {
      setFavorites((data || []).map((f: { restaurant_id: string }) => f.restaurant_id))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  const toggleFavorite = async (restaurantId: string) => {
    if (!user) return false
    const isFav = favorites.includes(restaurantId)

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
      if (error) {
        console.error('Error removing favorite:', error)
        return false
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, restaurant_id: restaurantId })
      if (error) {
        console.error('Error adding favorite:', error)
        return false
      }
    }
    await reload()
    return true
  }

  const isFavorite = (restaurantId: string) => favorites.includes(restaurantId)

  return { favorites, loading, toggleFavorite, isFavorite }
}
