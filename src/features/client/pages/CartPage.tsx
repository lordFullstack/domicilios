import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Minus } from 'lucide-react'
import { useCart, useProductById } from '@/hooks/useLocalData'
import { Button } from '@/shared/components/Button'
import { BottomNav } from '@/shared/components/BottomNav'
import { ROUTES } from '@/config/constants'

export const CartPage = () => {
  const navigate = useNavigate()
  const { cart, removeItem, updateQuantity, getTotal } = useCart()

  const changeQty = (productId: string, delta: number, currentQty: number) => {
    const next = currentQty + delta
    if (next <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, next)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
        <div className="px-5 pt-6 flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-secondary">Tu carrito</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-20">
          <span className="text-5xl mb-4">🛒</span>
          <p className="font-display font-bold mb-1 text-secondary">Tu carrito está vacío</p>
          <p className="text-sm text-gray-400 mb-6">Agrega productos para verlos aquí</p>
          <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Ver restaurantes</Button>
        </div>

        <BottomNav />
      </div>
    )
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-40">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Tu carrito</h1>
      </div>

      {/* Items */}
      <div className="px-5 flex flex-col gap-3 mb-6">
        {cart.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onChangeQty={changeQty}
          />
        ))}
      </div>

      {/* Resumen fijo abajo */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Subtotal</span>
          <span>${total.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>Envío</span>
          <span className="text-green-600 font-semibold">Gratis</span>
        </div>
        <div className="flex justify-between font-display font-bold mb-4 text-secondary">
          <span>Total</span>
          <span className="text-primary">${total.toLocaleString('es-CO')}</span>
        </div>
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate(ROUTES.CLIENT_CHECKOUT)}
        >
          Confirmar Pedido
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}

// Componente auxiliar: fila de producto en el carrito
const CartItemRow = ({
  item,
  onChangeQty,
}: {
  item: { productId: string; quantity: number; unitPrice: number }
  onChangeQty: (productId: string, delta: number, currentQty: number) => void
}) => {
  const { product } = useProductById(item.productId)

  if (!product) return null

  return (
    <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-3">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
        {product.image_url}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
        <p className="text-xs font-bold text-primary">
          ${product.price.toLocaleString('es-CO')}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1 flex-shrink-0">
        <button
          onClick={() => onChangeQty(item.productId, -1, item.quantity)}
          className="w-6 h-6 rounded-full bg-white shadow-card flex items-center justify-center"
        >
          <Minus className="w-3 h-3 text-secondary" />
        </button>
        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => onChangeQty(item.productId, 1, item.quantity)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-primary"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
