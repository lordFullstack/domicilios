import { createContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'

interface CartItem {
  productId: string
  quantity: number
  unitPrice: number
}

interface CartContextType {
  cart: CartItem[]
  loading: boolean
  addItem: (productId: string, unitPrice: number, quantity?: number) => boolean
  removeItem: (productId: string) => boolean
  updateQuantity: (productId: string, quantity: number) => boolean
  clear: () => boolean
  getTotal: () => number
}

/** Tope por producto: evita overflow visual y pedidos absurdos por error. */
export const MAX_ITEM_QUANTITY = 99

export const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

/**
 * Carrito como Context compartido (mismo patrón que AuthContext).
 *
 * Antes vivía como estado local dentro del hook useCart(), y cada
 * componente que lo llamaba (la página del menú, CartFloatingBar,
 * BottomNav, etc.) tenía su propia copia de `cart` leída de localStorage
 * solo al montarse. Resultado: al agregar un producto desde la página del
 * menú, esa instancia se actualizaba pero CartFloatingBar (otra instancia
 * del mismo hook) no se enteraba y seguía mostrando 0 — por eso la barra
 * flotante no aparecía ahí, y solo se veía al navegar a otra pantalla
 * donde el componente se montaba de nuevo y sí leía el localStorage ya
 * actualizado. Con un único Provider en el árbol, todos los consumidores
 * comparten el mismo estado y se actualizan al mismo tiempo.
 */
export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCartState] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fuente de verdad síncrona: varias operaciones seguidas en el mismo
  // evento (ej. "Vaciar y agregar" = clear() + addItem()) leían el `cart`
  // del render anterior; addItem volvía a meter los productos que clear()
  // acababa de borrar. Todas las operaciones leen de aquí.
  const cartRef = useRef<CartItem[]>([])
  const setCart = (next: CartItem[]) => {
    cartRef.current = next
    setCartState(next)
  }

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
      // Inmutable: antes hacía `existing.quantity += quantity`, que mutaba
      // el objeto del estado anterior (React podía no enterarse del cambio
      // y cualquier copia vieja del carrito quedaba alterada).
      const exists = cartRef.current.some((item) => item.productId === productId)
      const updated = exists
        ? cartRef.current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, item.quantity + quantity) }
              : item
          )
        : [...cartRef.current, { productId, quantity: Math.min(MAX_ITEM_QUANTITY, quantity), unitPrice }]

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
      const updated = cartRef.current.filter((item) => item.productId !== productId)
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
      const updated = cartRef.current.map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, quantity) }
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

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, removeItem, updateQuantity, clear, getTotal }}
    >
      {children}
    </CartContext.Provider>
  )
}
