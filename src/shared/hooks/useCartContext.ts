import { useContext } from 'react'
import { CartContext } from '@/features/client/CartContext'

export const useCartContext = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCartContext debe ser usado dentro de CartProvider')
  }

  return context
}
