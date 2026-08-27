import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart, useProductById, useRestaurantById } from '@/hooks/useLocalData'
import { Button } from '@/shared/components/Button'
import { ProductImage } from '@/shared/components/ProductImage'
import { BottomNav } from '@/shared/components/BottomNav'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatCOP } from '@/shared/utils/money'
import { ROUTES } from '@/config/constants'

export const CartPage = () => {
  const navigate = useNavigate()
  const { cart, removeItem, updateQuantity, getTotal } = useCart()

  // El carrito no guarda restaurant_id por ítem — se infiere del primer
  // producto, mismo patrón usado en RestaurantDetailPage y CheckoutPage.
  const { product: firstProduct } = useProductById(cart[0]?.productId || '')
  const { restaurant } = useRestaurantById(firstProduct?.restaurant_id || '')

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
            className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-secondary">Tu carrito</h1>
        </div>

        <EmptyState
          icon={ShoppingBag}
          title="Tu carrito está vacío"
          description="Explora restaurantes y encuentra algo delicioso."
          action={<Button onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>Explorar restaurantes</Button>}
        />

        <BottomNav />
      </div>
    )
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-44">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate(-1)}
          className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Tu carrito</h1>
      </div>

      {restaurant && (
        <p className="px-5 text-xs text-gray-400 mb-4">
          Pedido de <span className="font-semibold text-secondary">{restaurant.image_url} {restaurant.name}</span>
        </p>
      )}

      {/* Items */}
      <div className="px-5 flex flex-col gap-3 mb-2">
        {cart.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onChangeQty={changeQty}
            onRemove={() => removeItem(item.productId)}
          />
        ))}
      </div>

      {restaurant && (
        <div className="px-5 mb-6">
          <button
            onClick={() => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id))}
            className="focus-ring text-sm font-semibold text-primary py-2"
          >
            Agregar más productos →
          </button>
        </div>
      )}

      {/* Resumen fijo abajo */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-5 pt-4 pb-6 safe-bottom">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Subtotal</span>
          <span>{formatCOP(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>Envío</span>
          <span className="text-success font-semibold">Gratis</span>
        </div>
        <div className="flex justify-between font-display font-bold mb-4 text-secondary">
          <span>Total</span>
          <span className="text-primary">{formatCOP(total)}</span>
        </div>
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate(ROUTES.CLIENT_CHECKOUT)}
        >
          Continuar
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
  onRemove,
}: {
  item: { productId: string; quantity: number; unitPrice: number }
  onChangeQty: (productId: string, delta: number, currentQty: number) => void
  onRemove: () => void
}) => {
  const { product } = useProductById(item.productId)

  if (!product) return null

  return (
    <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-3">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
        <ProductImage imageUrl={product.image_url} alt={product.name} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
        <p className="text-xs font-bold text-primary">{formatCOP(product.price)}</p>
      </div>
      <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-1.5 py-1 flex-shrink-0">
        <button
          onClick={() => onChangeQty(item.productId, -1, item.quantity)}
          aria-label="Disminuir cantidad"
          className="touch-target focus-ring w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
        >
          <Minus className="w-3 h-3 text-secondary" />
        </button>
        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => onChangeQty(item.productId, 1, item.quantity)}
          aria-label="Aumentar cantidad"
          className="touch-target focus-ring w-8 h-8 rounded-full flex items-center justify-center text-white bg-primary active:scale-90 transition-transform"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Eliminar ${product.name} del carrito`}
        className="touch-target focus-ring w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-danger active:scale-90 transition-transform flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
