import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react'
import { useProductById, useRestaurantById, useProducts } from '@/hooks/useLocalData'
import { useCartContext } from '@/shared/hooks/useCartContext'
import { Button } from '@/shared/components/Button'
import { ProductImage } from '@/shared/components/ProductImage'
import { BottomNav } from '@/shared/components/BottomNav'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { EmptyState } from '@/shared/components/EmptyState'
import { EMPTY_COPY } from '@/shared/constants/stateCopy'
import { formatCOP } from '@/shared/utils/money'
import { ROUTES } from '@/config/constants'
import { Product } from '@/shared/types'
import { useDeliveryFee } from '@/shared/hooks/useDeliveryFee'
import { DeliveryFeeRow } from '../components/DeliveryFeeRow'

export const CartPage = () => {
  const navigate = useNavigate()
  const { cart, removeItem, updateQuantity, clear, getTotal } = useCartContext()
  const { fee: deliveryFee } = useDeliveryFee()
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  // El carrito no guarda restaurant_id por ítem — se infiere del primer
  // producto, mismo patrón usado en RestaurantDetailPage y CheckoutPage.
  const { product: firstProduct } = useProductById(cart[0]?.productId || '')
  const { restaurant } = useRestaurantById(firstProduct?.restaurant_id || '')

  // Antes cada fila del carrito llamaba a useProductById() por su cuenta
  // (una consulta a Supabase por producto — con 5 productos, 5 consultas
  // en paralelo). Como el carrito ya solo admite un restaurante a la vez,
  // una sola consulta de TODO su menú alcanza para resolver todas las
  // filas de una.
  const { products: restaurantProducts } = useProducts(restaurant?.id)
  const productById = new Map(restaurantProducts.map((p) => [p.id, p]))

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
      <div className="min-h-screen bg-white max-w-md mx-auto safe-left safe-right pb-24">
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
          illustration={EMPTY_COPY.cart.illustration}
          title={EMPTY_COPY.cart.title}
          description={EMPTY_COPY.cart.description}
          action={<Button variant="gradient" onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>{EMPTY_COPY.cart.cta}</Button>}
        />

        <BottomNav />
      </div>
    )
  }

  const subtotal = getTotal()
  const total = subtotal + (deliveryFee ?? 0)

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto safe-left safe-right pb-44">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-secondary">Tu carrito</h1>
        </div>
        <button
          onClick={() => setClearConfirmOpen(true)}
          aria-label="Vaciar carrito"
          className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-danger active:scale-90 transition-transform"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <BottomSheet
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="¿Vaciar el carrito?"
      >
        <p className="text-sm text-gray-500 mb-5 -mt-2">
          Se eliminarán los {cart.length} {cart.length === 1 ? 'producto' : 'productos'} de tu carrito.
        </p>
        <div className="flex gap-3">
          <Button variant="tertiary" onClick={() => setClearConfirmOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clear()
              setClearConfirmOpen(false)
            }}
            className="flex-1"
          >
            Vaciar
          </Button>
        </div>
      </BottomSheet>

      {restaurant && (
        <p className="px-5 text-xs text-gray-500 mb-4">
          Pedido de <span className="font-semibold text-secondary">{restaurant.name}</span>
        </p>
      )}

      {/* Items */}
      <div className="px-5 flex flex-col gap-3 mb-2">
        {cart.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            product={productById.get(item.productId) || null}
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
          <span className="tabular-nums">{formatCOP(subtotal)}</span>
        </div>
        <DeliveryFeeRow fee={deliveryFee} className="mb-3" />
        <div className="flex items-baseline justify-between font-display font-bold mb-4 text-secondary">
          <span>Total</span>
          <span className="text-display font-extrabold tabular-nums text-brand-700">{formatCOP(total)}</span>
        </div>
        <Button
          variant="gradient"
          fullWidth
          size="lg"
          onClick={() => navigate(ROUTES.CLIENT_CHECKOUT)}
        >
          Continuar al pago →
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}

// Componente auxiliar: fila de producto en el carrito
const CartItemRow = ({
  item,
  product,
  onChangeQty,
  onRemove,
}: {
  item: { productId: string; quantity: number; unitPrice: number }
  product: Product | null
  onChangeQty: (productId: string, delta: number, currentQty: number) => void
  onRemove: () => void
}) => {
  if (!product) return null

  // El nombre va en su propia fila a todo el ancho — antes compartía fila
  // con la imagen, el stepper y el botón de eliminar, y el navegador le
  // dejaba ~41px reales de ancho (medido en vivo): nombres como "costilla
  // bbq" quedaban truncados a "cos…" justo en la pantalla donde el
  // usuario confirma qué está a punto de pagar.
  return (
    <div className="flex items-start gap-3 hairline rounded-2xl p-3">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
        <ProductImage imageUrl={product.image_url} alt={product.name} width={48} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p className="font-semibold text-sm text-secondary line-clamp-2">{product.name}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-ink font-semibold tabular-nums">{formatCOP(product.price)}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-1.5 py-1">
              <button
                onClick={() => onChangeQty(item.productId, -1, item.quantity)}
                aria-label="Disminuir cantidad"
                className="touch-target focus-ring w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus className="w-3 h-3 text-secondary" />
              </button>
              <span className="text-sm font-semibold w-4 text-center tabular-nums text-secondary">{item.quantity}</span>
              <button
                onClick={() => onChangeQty(item.productId, 1, item.quantity)}
                aria-label="Aumentar cantidad"
                className="touch-target focus-ring w-8 h-8 rounded-full flex items-center justify-center text-white bg-brand-700 active:scale-90 transition-transform"
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
        </div>
      </div>
    </div>
  )
}
