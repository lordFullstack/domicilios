import { useState } from 'react'
import { Product, Restaurant } from '@/shared/types'
import { useCartContext } from '@/shared/hooks/useCartContext'
import { useProductById } from '@/hooks/useLocalData'

/**
 * Agregar/quitar desde el menú de UN restaurante, con la confirmación de
 * "cambiar de restaurante" si el carrito ya tiene productos de otro.
 * Sacado de RestaurantDetailPage (que pasaba de 300 líneas).
 */
export const useMenuCart = (restaurant: Restaurant | null, onAdded: (product: Product) => void) => {
  const { cart, addItem, removeItem, updateQuantity, clear } = useCartContext()
  const [pendingAdd, setPendingAdd] = useState<{ product: Product; quantity: number } | null>(null)

  // El carrito no guarda restaurant_id por ítem (ver CheckoutPage): se
  // infiere del primer producto. Cuesta una query; se resuelve en 3B
  // guardando restaurantId en el carrito.
  const { product: firstCartProduct } = useProductById(cart[0]?.productId || '')
  const cartRestaurantId = cart.length > 0 ? firstCartProduct?.restaurant_id : undefined

  const getQuantity = (productId: string) => cart.find((i) => i.productId === productId)?.quantity ?? 0

  const commit = (product: Product, quantity: number) => {
    addItem(product.id, product.price, quantity)
    onAdded(product)
  }

  /** true si se agregó ya; false si quedó esperando la confirmación. */
  const add = (product: Product, quantity = 1): boolean => {
    if (cartRestaurantId && restaurant && cartRestaurantId !== restaurant.id) {
      setPendingAdd({ product, quantity })
      return false
    }
    commit(product, quantity)
    return true
  }

  const decrement = (product: Product) => {
    const current = getQuantity(product.id)
    if (current <= 1) removeItem(product.id)
    else updateQuantity(product.id, current - 1)
  }

  const confirmSwitch = () => {
    clear()
    if (pendingAdd) commit(pendingAdd.product, pendingAdd.quantity)
    setPendingAdd(null)
  }

  return {
    getQuantity,
    add,
    decrement,
    switchPending: !!pendingAdd,
    confirmSwitch,
    cancelSwitch: () => setPendingAdd(null),
  }
}
