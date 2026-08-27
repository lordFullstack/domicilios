import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Banknote, CreditCard, WifiOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { useCart, useOrders, useRestaurantById, useProductById } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { ROUTES, ORDER_STATUS, PAYMENT_METHOD } from '@/config/constants'
import { PaymentMethod } from '@/shared/types'
import { formatCOP } from '@/shared/utils/money'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { AddressSheet, AddressDraft } from '../components/AddressSheet'
import { AddressCard } from '../components/AddressCard'
import { OrderSuccessView } from '../components/OrderSuccessView'

const EMPTY_ADDRESS: AddressDraft = { street: '', complement: '', reference: '' }

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, clear, getTotal } = useCart()
  const { createOrder } = useOrders()
  const connectionStatus = useOnlineStatus()
  const isOffline = connectionStatus === 'offline'

  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [createdOrder, setCreatedOrder] = useState<{ id: string; restaurantName: string; total: number } | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CASH_ON_DELIVERY)
  const [address, setAddress] = useState<AddressDraft>(
    () => localStorageService.get(STORAGE_KEYS.LAST_DELIVERY_ADDRESS) || EMPTY_ADDRESS
  )
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)

  const firstProduct = useProductById(cart[0]?.productId || '')
  const { restaurant, loading: restaurantLoading } = useRestaurantById(firstProduct.product?.restaurant_id || '')
  const checkoutInfoReady = !firstProduct.loading && !restaurantLoading && !!restaurant

  const hasAddress = address.street.trim().length >= 5

  if (cart.length === 0 && submitState !== 'success') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center px-8 text-center">
        <span className="text-5xl mb-4">🛒</span>
        <p className="font-display font-bold mb-1 text-secondary">Tu carrito está vacío</p>
        <p className="text-sm text-gray-400 mb-6">No hay productos para ordenar</p>
        <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Ir a restaurantes</Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Freno extra contra doble-tap además del disabled del botón.
    if (submitState === 'submitting') return

    setSubmitState('submitting')
    setError(null)

    try {
      if (isOffline) {
        throw new Error('Necesitamos conexión a internet para confirmar tu pedido. Tu carrito está guardado.')
      }
      if (!hasAddress) {
        throw new Error('Agrega una dirección de entrega para continuar.')
      }
      if (!checkoutInfoReady || !restaurant || !user) {
        throw new Error('Aún estamos cargando la información del restaurante. Intenta de nuevo en un momento.')
      }

      const deliveryAddress = address.complement
        ? `${address.street}, ${address.complement}`
        : address.street

      const order = {
        user_id: user.id,
        restaurant_id: restaurant.id,
        total: getTotal(),
        status: ORDER_STATUS.PENDING,
        delivery_address: deliveryAddress,
        special_instructions: address.reference,
        payment_method: paymentMethod,
      }

      const items = cart.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))

      const newOrder = await createOrder(order, items)
      if (!newOrder) throw new Error('No pudimos confirmar tu pedido. Tu carrito sigue guardado.')

      // Solo se guarda localmente para autocompletar la próxima vez — no es
      // una tabla de direcciones en el backend.
      localStorageService.set(STORAGE_KEYS.LAST_DELIVERY_ADDRESS, address)

      setCreatedOrder({ id: newOrder.id, restaurantName: restaurant.name, total: order.total })
      clear()
      setSubmitState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos confirmar tu pedido. Tu carrito sigue guardado.')
      setSubmitState('error')
    }
  }

  if (submitState === 'success' && createdOrder) {
    return (
      <OrderSuccessView
        orderId={createdOrder.id}
        restaurantName={createdOrder.restaurantName}
        total={createdOrder.total}
        onViewOrder={() => navigate(ROUTES.CLIENT_ORDER.replace(':id', createdOrder.id))}
        onKeepShopping={() => navigate(ROUTES.CLIENT_HOME)}
      />
    )
  }

  const total = getTotal()
  const isSubmitting = submitState === 'submitting'

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-36">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Confirmar pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 flex flex-col gap-5">
        {error && (
          <div className="bg-red-50 text-danger text-sm font-semibold rounded-2xl p-3">{error}</div>
        )}

        {/* ENTREGA */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 tracking-wide mb-2">ENTREGA</h2>
          <AddressCard draft={address} onEdit={() => setAddressSheetOpen(true)} />
        </div>

        {/* MÉTODO */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 tracking-wide mb-2">MÉTODO DE PAGO</h2>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod(PAYMENT_METHOD.CASH_ON_DELIVERY)}
              className={`focus-ring flex items-center gap-3 border rounded-2xl p-3 text-left transition-colors min-h-[48px] ${
                paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Banknote className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-secondary">Efectivo o datáfono</p>
                <p className="text-xs text-gray-400">Pagas al recibir tu pedido</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              />
            </button>

            <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-3 opacity-50">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-400">Pagar en línea</p>
                <p className="text-xs text-gray-400">Tarjeta, PSE, Nequi</p>
              </div>
              <Badge variant="default">Próximamente</Badge>
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 tracking-wide mb-2">RESUMEN</h2>
          <div className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              <span className="text-xl">{restaurant?.image_url}</span>
              <p className="font-display font-bold text-sm text-secondary">{restaurant?.name}</p>
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              {cart.map((item) => (
                <CheckoutItemRow key={item.productId} item={item} />
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCOP(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className="text-success font-semibold">Gratis</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center px-4">
          Tu pedido será procesado inmediatamente. El restaurante y el domiciliario recibirán la notificación.
        </p>
      </form>

      {/* CTA fijo abajo, con el total siempre visible */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-5 pt-3 pb-5 safe-bottom">
        {isOffline && (
          <div className="flex items-center gap-2 bg-red-50 text-danger text-xs font-semibold rounded-xl p-2.5 mb-3">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            Sin conexión — tu carrito está guardado
          </div>
        )}
        <div className="flex justify-between font-display font-bold mb-3 text-secondary">
          <span>Total</span>
          <span className="text-primary">{formatCOP(total)}</span>
        </div>
        <Button
          onClick={handleSubmit}
          fullWidth
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || !checkoutInfoReady || isOffline || !hasAddress}
        >
          {isOffline
            ? 'Sin conexión'
            : !checkoutInfoReady
              ? 'Cargando...'
              : isSubmitting
                ? 'Procesando pedido...'
                : !hasAddress
                  ? 'Agrega una dirección'
                  : `Confirmar pedido · ${formatCOP(total)}`}
        </Button>
      </div>

      <AddressSheet
        open={addressSheetOpen}
        initialDraft={address}
        onClose={() => setAddressSheetOpen(false)}
        onSave={setAddress}
      />
    </div>
  )
}

// Componente auxiliar: fila de producto en el resumen del checkout.
const CheckoutItemRow = ({
  item,
}: {
  item: { productId: string; quantity: number; unitPrice: number }
}) => {
  const { product } = useProductById(item.productId)
  if (!product) return null

  return (
    <div className="flex justify-between text-sm text-gray-500">
      <span>
        {product.name} x{item.quantity}
      </span>
      <span className="font-semibold text-secondary">
        {formatCOP(product.price * item.quantity)}
      </span>
    </div>
  )
}
