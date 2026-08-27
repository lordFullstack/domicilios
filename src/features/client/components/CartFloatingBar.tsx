import { useNavigate } from 'react-router-dom'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useLocalData'
import { ROUTES } from '@/config/constants'

/**
 * CTA flotante que aparece solo cuando hay productos en el carrito.
 * Se posiciona justo encima del BottomNav (que mide ~64px + safe-area),
 * por eso el bottom-24 en vez de bottom-0.
 */
export const CartFloatingBar = () => {
  const navigate = useNavigate()
  const { cart, getTotal } = useCart()

  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  if (count === 0) return null

  return (
    <div className="fixed bottom-24 left-0 right-0 px-5 z-30 animate-fade-slide-up max-w-md mx-auto">
      <button
        onClick={() => navigate(ROUTES.CLIENT_CART)}
        className="focus-ring w-full flex items-center justify-between bg-primary text-white rounded-2xl px-4 py-3.5 shadow-floating active:scale-[0.98] transition-transform"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag className="w-4 h-4" />
          {count} {count === 1 ? 'producto' : 'productos'} · ${getTotal().toLocaleString('es-CO')}
        </span>
        <span className="flex items-center gap-0.5 text-sm font-semibold">
          Ver <ChevronRight className="w-4 h-4" />
        </span>
      </button>
    </div>
  )
}
