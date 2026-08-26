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
import { offlineCache } from '@/services/offlineCache.service'
import { triggerOrderPushNotification } from '@/services/pushNotifications.service'
import { useAuth } from '@/shared/hooks/useAuth'
import { playNotificationSound, showBrowserNotification } from '@/shared/utils/notificationSound'
import { Restaurant, Product, Order, AppNotification, OrderRating } from '@/shared/types'
import { ORDER_STATUS } from '@/config/constants'

// ============================================
// HOOK: useOrderItems
// ============================================
// Trae qué productos (nombre, cantidad, precio) tiene una orden puntual.
// Esto faltaba: se guardaba en order_items pero nadie lo consultaba —
// por eso ni el restaurante ni el cliente veían qué se pidió.

export const useOrderItems = (orderId?: string) => {
  const [items, setItems] = useState<
    { id: string; product_id: string; quantity: number; unit_price: number; product_name: string; product_image: string | null }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('order_items')
        .select('id, product_id, quantity, unit_price, products(name, image_url)')
        .eq('order_id', orderId)

      if (!cancelled) {
        if (error) {
          console.error('Error cargando items de la orden:', error)
          setItems([])
        } else {
          setItems(
            (data || []).map((row: any) => ({
              id: row.id,
              product_id: row.product_id,
              quantity: row.quantity,
              unit_price: row.unit_price,
              product_name: row.products?.name || 'Producto',
              product_image: row.products?.image_url || null,
            }))
          )
        }
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orderId])

  return { items, loading }
}

// ============================================
// HOOK: useDeliveryPersonProfile
// ============================================
// Trae los datos públicos del domiciliario (nombre, foto, vehículo) para
// mostrárselos al cliente mientras su pedido va en camino.

export const useDeliveryPersonProfile = (userId?: string | null) => {
  const [profile, setProfile] = useState<{
    name: string
    avatar_url?: string | null
    phone?: string | null
    vehicle_type?: string | null
    vehicle_plate?: string | null
  } | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }
    let cancelled = false
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_url, phone, vehicle_type, vehicle_plate')
        .eq('id', userId)
        .maybeSingle()
      if (!cancelled) setProfile(data)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  return profile
}

// ============================================
// HOOK: useNotifications
// ============================================
// Campanita in-app: trae las notificaciones del usuario logueado y se
// actualiza sola en tiempo real cuando llega una nueva (nuevo pedido,
// cambio de estado, entrega asignada — generadas por trigger en Supabase).

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error) setNotifications(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const notif = payload.new as AppNotification
          setNotifications((prev) => [notif, ...prev])
          playNotificationSound()
          showBrowserNotification(notif.title, notif.body)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
  }

  const markAllAsRead = async () => {
    if (!user) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, reload }
}

// ============================================
// HOOK: useRestaurants
// ============================================

// approvedOnly: usado por las vistas de Cliente para que un restaurante
// suspendido por Admin (restaurants.approved = false) desaparezca del
// home/listado, mientras que el dueño del restaurante sigue pudiendo
// entrar a su propio panel sin este filtro (por eso es opcional).
export const useRestaurants = (options?: { approvedOnly?: boolean }) => {
  const approvedOnly = options?.approvedOnly ?? false
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('restaurants').select('*')

    if (approvedOnly) {
      // Mejor calificados primero; luego alfabético para restaurantes nuevos sin calificar
      query = query.eq('approved', true).order('rating_avg', { ascending: false }).order('name')
    } else {
      query = query.order('name')
    }

    const { data, error } = await query

    if (error) {
      setError('Error cargando restaurantes')
      console.error(error)
    } else {
      setRestaurants(data || [])
    }
    setLoading(false)
  }, [approvedOnly])

  useEffect(() => {
    reload()
  }, [reload])

  return { restaurants, loading, error, reload }
}

// ============================================
// HOOK: useProductsByCategory
// ============================================
// Búsqueda rápida por categoría (botones de emoji del home del cliente).
// Trae productos disponibles de restaurantes aprobados cuya categoría
// principal coincide, junto con el nombre del restaurante al que pertenecen
// (necesario porque un mismo botón puede mostrar productos de varios
// restaurantes una vez la plataforma tenga más de uno).

export interface ProductWithRestaurant extends Product {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'image_url' | 'status'>
}

export const useProductsByCategory = (category: string) => {
  const [items, setItems] = useState<ProductWithRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*, restaurant:restaurants!inner(id,name,image_url,status)')
      .eq('restaurant.category', category)
      .eq('restaurant.approved', true)
      .eq('available', true)
      .order('name')

    if (error) {
      setError('Error cargando productos')
      console.error(error)
    } else {
      setItems((data as unknown as ProductWithRestaurant[]) || [])
    }
    setLoading(false)
  }, [category])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, loading, error, reload }
}

// ============================================
// FUNCIÓN: updateRestaurant
// ============================================

export const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>) => {
  const { error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', restaurantId)

  if (error) {
    console.error('Error actualizando restaurante:', error)
    throw new Error('No se pudo actualizar el restaurante')
  }
}

// ============================================
// FUNCIÓN: createRestaurant
// ============================================

export const createRestaurant = async (restaurant: {
  owner_id: string
  name: string
  description: string
  address: string
  phone: string
}) => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert([{ ...restaurant, status: 'open' }])
    .select()
    .single()

  if (error) {
    console.error('Error creando restaurante:', error)
    throw new Error('No se pudo crear el restaurante. Intenta de nuevo.')
  }
  return data
}

// ============================================
// HOOK: useRestaurantById
// ============================================

export const useRestaurantById = (id: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

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
        // Sin internet (u otro fallo de red): intenta mostrar la última
        // versión de este restaurante que el cliente ya vio.
        const cached = await offlineCache.getRestaurant(id)
        if (cached) {
          setRestaurant(cached.data)
          setFromCache(true)
          setError(null)
        } else {
          setError('Error cargando restaurante')
          console.error(error)
        }
      } else {
        setRestaurant(data)
        setFromCache(false)
        if (data) offlineCache.saveRestaurant(data)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return { restaurant, loading, error, fromCache }
}

// ============================================
// HOOK: useProducts (con CRUD)
// ============================================

export const useProducts = (restaurantId?: string) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('name')
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }
    const { data, error } = await query

    if (error) {
      // Sin internet: si este es el menú de un restaurante puntual, intenta
      // mostrar la última versión que el cliente ya vio de ese menú.
      const cached = restaurantId ? await offlineCache.getProducts(restaurantId) : null
      if (cached) {
        setProducts(cached.data)
        setFromCache(true)
        setError(null)
      } else {
        setError('Error cargando productos')
        console.error(error)
      }
    } else {
      setProducts(data || [])
      setFromCache(false)
      if (restaurantId && data) offlineCache.saveProducts(restaurantId, data)
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
    fromCache,
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
// FUNCIÓN: getAvailableDeliveryPerson
// ============================================
// Busca un domiciliario (role = 'delivery') que no tenga ninguna
// orden actualmente en camino ('in_delivery'). Si todos están
// ocupados, devuelve null en vez de forzar una asignación.

export const getAvailableDeliveryPerson = async (): Promise<string | null> => {
  const { data: deliveryPeople, error: peopleError } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'delivery')
    .order('name')

  if (peopleError) {
    console.error('Error cargando domiciliarios:', peopleError)
    return null
  }
  if (!deliveryPeople || deliveryPeople.length === 0) {
    return null
  }

  const { data: activeOrders, error: ordersError } = await supabase
    .from('orders')
    .select('delivery_person_id')
    .eq('status', 'in_delivery')

  if (ordersError) {
    console.error('Error revisando órdenes en camino:', ordersError)
    return null
  }

  const busyIds = new Set((activeOrders || []).map((o) => o.delivery_person_id))
  const free = deliveryPeople.find((p) => !busyIds.has(p.id))

  return free ? free.id : null
}

// ============================================
// FUNCIÓN: updateOrderLocation
// ============================================
// Actualización liviana de solo la ubicación, sin recargar toda la
// lista de órdenes cada vez (el GPS manda esto muy seguido).

export const updateOrderLocation = async (orderId: string, lat: number, lng: number) => {
  const { error } = await supabase
    .from('orders')
    .update({
      current_lat: lat,
      current_lng: lng,
      location_updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    console.error('Error actualizando ubicación:', error)
  }
}

// ============================================
// HOOK: useOrderLocation
// ============================================
// Sigue la ubicación en vivo de UNA orden puntual (la del domiciliario
// asignado), sin recargar la lista completa de órdenes en cada tick de GPS.

export const useOrderLocation = (orderId: string | undefined) => {
  const [location, setLocation] = useState<{ lat: number; lng: number; updatedAt: string } | null>(null)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false

    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('current_lat, current_lng, location_updated_at')
        .eq('id', orderId)
        .maybeSingle()

      if (!cancelled && data?.current_lat != null && data?.current_lng != null) {
        setLocation({ lat: data.current_lat, lng: data.current_lng, updatedAt: data.location_updated_at })
      }
    }
    load()

    const channel = supabase
      .channel(`order-location-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          const row = payload.new as any
          if (row.current_lat != null && row.current_lng != null) {
            setLocation({ lat: row.current_lat, lng: row.current_lng, updatedAt: row.location_updated_at })
          }
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return location
}

// ============================================
// HOOK: useOrders (con CRUD)
// ============================================

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query

    if (error) {
      // Sin internet: solo tiene sentido cachear "mis pedidos" (con
      // userId) — la lista completa de Admin no se guarda offline.
      const cached = userId ? await offlineCache.getOrders(userId) : null
      if (cached) {
        setOrders(cached.data)
        setFromCache(true)
        setError(null)
      } else {
        setError('Error cargando órdenes')
        console.error(error)
      }
    } else {
      setOrders(data || [])
      setFromCache(false)
      if (userId && data) offlineCache.saveOrders(userId, data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  // Tiempo real: cualquier cambio en 'orders' (nueva orden, cambio de
  // estado, etc.) recarga la lista automáticamente, sin que el usuario
  // tenga que refrescar la página.
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        reload()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

    // Avisa al restaurante que tiene un pedido nuevo por aceptar. No se
    // espera esta llamada ni se deja que un fallo aquí rompa la creación
    // del pedido — el pedido ya quedó guardado, la notificación es un plus.
    supabase
      .from('restaurants')
      .select('owner_id')
      .eq('id', order.restaurant_id)
      .maybeSingle()
      .then(({ data: restaurantRow }) => {
        if (restaurantRow?.owner_id) {
          triggerOrderPushNotification(restaurantRow.owner_id, 'new_order', newOrder.id)
        }
      })

    await reload()
    return true
  }

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    const previous = orders.find((o) => o.id === orderId)

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
    if (error) {
      console.error('Error updating order:', error)
      setError('Error al actualizar orden')
      return false
    }

    // Decide a quién avisar según qué cambió. Se compara contra el pedido
    // que ya teníamos en memoria porque `updates` solo trae los campos que
    // cambiaron, no el pedido completo.
    if (previous) {
      const newDeliveryPersonId = updates.delivery_person_id ?? previous.delivery_person_id
      if (updates.delivery_person_id && updates.delivery_person_id !== previous.delivery_person_id) {
        triggerOrderPushNotification(updates.delivery_person_id, 'assigned', orderId)
      }
      if (updates.status === ORDER_STATUS.READY && newDeliveryPersonId) {
        triggerOrderPushNotification(newDeliveryPersonId, 'ready', orderId)
      }
      if (updates.status === ORDER_STATUS.IN_DELIVERY) {
        triggerOrderPushNotification(previous.user_id, 'in_delivery', orderId)
      }
      if (updates.status === ORDER_STATUS.DELIVERED) {
        triggerOrderPushNotification(previous.user_id, 'delivered', orderId)
      }
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
    fromCache,
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
    let cancelled = false

    const loadAndValidate = async () => {
      try {
        const data: CartItem[] = localStorageService.get(STORAGE_KEYS.CART) || []

        if (data.length === 0) {
          setCart([])
          return
        }

        // Auto-limpieza: el carrito vive en el celular (localStorage), no
        // en la base de datos, así que si un producto guardado ahí ya no
        // existe (borrado, restaurante eliminado, etc.), había quedado un
        // "saldo fantasma" — un total sumando productos que ya no aparecen.
        // Aquí se valida contra la base de datos real y se descarta lo huérfano.
        const productIds = data.map((item) => item.productId)
        const { data: existingProducts } = await supabase
          .from('products')
          .select('id')
          .in('id', productIds)

        if (cancelled) return

        const validIds = new Set((existingProducts || []).map((p) => p.id))
        const cleaned = data.filter((item) => validIds.has(item.productId))

        if (cleaned.length !== data.length) {
          localStorageService.set(STORAGE_KEYS.CART, cleaned)
        }
        setCart(cleaned)
      } catch (err) {
        console.error('Error loading cart:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAndValidate()
    return () => {
      cancelled = true
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

// ============================================
// HOOK: useOrderRating
// ============================================
// Calificación del cliente al restaurante (obligatoria) y al domiciliario
// (opcional, solo si el pedido tuvo uno asignado). Una calificación por
// pedido — la RLS en `order_ratings` también lo obliga a nivel de base de
// datos (client_id debe ser el dueño del pedido, y el pedido debe estar
// 'delivered').

export const useOrderRating = (order?: Order) => {
  const { user } = useAuth()
  const [rating, setRating] = useState<OrderRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const reload = useCallback(async () => {
    if (!order) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('order_ratings')
      .select('*')
      .eq('order_id', order.id)
      .maybeSingle()

    if (error) {
      console.error('Error cargando calificación:', error)
    } else {
      setRating(data)
    }
    setLoading(false)
  }, [order])

  useEffect(() => {
    reload()
  }, [reload])

  const submitRating = async (restaurantRating: number, deliveryRating?: number, comment?: string) => {
    if (!order || !user) return false
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('order_ratings')
        .insert({
          order_id: order.id,
          client_id: user.id,
          restaurant_id: order.restaurant_id,
          delivery_person_id: order.delivery_person_id || null,
          restaurant_rating: restaurantRating,
          delivery_rating: order.delivery_person_id ? deliveryRating ?? null : null,
          comment: comment || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error guardando calificación:', error)
        return false
      }
      setRating(data)
      return true
    } finally {
      setSubmitting(false)
    }
  }

  return { rating, loading, submitting, submitRating }
}
