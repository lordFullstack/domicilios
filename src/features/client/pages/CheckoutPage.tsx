import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, WifiOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { EMPTY_COPY } from '@/shared/constants/stateCopy'
import { useOrders, useRestaurantById, useProductById, useProducts } from '@/hooks/useLocalData'
import { useCartContext } from '@/shared/hooks/useCartContext'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { ROUTES, PAYMENT_METHOD } from '@/config/constants'
import { PaymentMethod } from '@/shared/types'
import { formatCOP } from '@/shared/utils/money'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { AddressSheet, AddressDraft } from '../components/AddressSheet'
import { AddressCard } from '../components/AddressCard'
import { OrderSuccessView } from '../components/OrderSuccessView'
import { CheckoutError } from '../components/CheckoutError'
import { PaymentMethodSelector } from '../components/PaymentMethodSelector'
import { OrderNotesField } from '../components/OrderNotesField'
import { CashAmountField, parseCashInput, cashAmountError } from '../components/CashAmountField'
import { CheckoutSummary } from '../components/CheckoutSummary'
import { classifyCheckoutError, type CheckoutFailure } from '../utils/checkoutError'
import { useDeliveryFee } from '@/shared/hooks/useDeliveryFee'
import * as clientOrderId from '../utils/clientOrderId'

const EMPTY_ADDRESS: AddressDraft = { street: '', complement: '', reference: '' }

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, clear, getTotal } = useCartContext()
  const { fee: deliveryFee } = useDeliveryFee()
  const { createOrder } = useOrders()
  const connectionStatus = useOnlineStatus()
  const isOffline = connectionStatus === 'offline'

  // Freno síncrono contra doble envío (setState es asíncrono).
  const inFlightRef = useRef(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  // Errores previos al envío (sin dirección, sin conexión): en línea. Fallos del servidor: `failure`.
  const [error, setError] = useState<string | null>(null)
  const [failure, setFailure] = useState<CheckoutFailure | null>(null)
  const [createdOrder, setCreatedOrder] = useState<{ id: string; restaurantName: string; total: number } | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CASH_ON_DELIVERY)
  const [address, setAddress] = useState<AddressDraft>(
    () => localStorageService.get(STORAGE_KEYS.LAST_DELIVERY_ADDRESS) || EMPTY_ADDRESS
  )
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)
  const [cashInput, setCashInput] = useState('')
  const [notes, setNotes] = useState('')

  const firstProduct = useProductById(cart[0]?.productId || '')
  const { restaurant, loading: restaurantLoading } = useRestaurantById(firstProduct.product?.restaurant_id || '')
  const checkoutInfoReady = !firstProduct.loading && !restaurantLoading && !!restaurant

  // Antes cada línea del resumen (CheckoutItemRow) llamaba a
  // useProductById() por su cuenta — una consulta por producto. El
  // carrito ya está limitado a un solo restaurante, así que una sola
  // consulta de todo su menú resuelve todas las líneas.
  const { products: restaurantProducts } = useProducts(restaurant?.id)
  const productById = new Map(restaurantProducts.map((p) => [p.id, p]))

  const hasAddress = address.street.trim().length >= 5

  // Total mostrado (el servidor lo recalcula y vuelve a validar el efectivo).
  const total = getTotal() + (deliveryFee ?? 0)
  const isCash = paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY
  const cashAmount = isCash ? parseCashInput(cashInput) : null
  const cashInvalid = cashAmountError(cashAmount, total) !== null

  // El error solo se limpiaba al reintentar el submit — si el usuario
  // arreglaba la causa (agregaba dirección, volvía a tener conexión) el
  // banner rojo se quedaba en pantalla justo encima de un botón ya
  // habilitado, contradiciendo la propia UI.
  useEffect(() => {
    if (error && hasAddress && !isOffline && checkoutInfoReady) {
      setError(null)
    }
  }, [error, hasAddress, isOffline, checkoutInfoReady])

  if (cart.length === 0 && submitState !== 'success') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-secondary">Confirmar pedido</h1>
        </div>
        <EmptyState
          illustration={EMPTY_COPY.cart.illustration}
          title={EMPTY_COPY.cart.title}
          description={EMPTY_COPY.cart.description}
          action={<Button variant="gradient" onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>{EMPTY_COPY.cart.cta}</Button>}
        />
      </div>
    )
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    // Freno extra contra doble-tap además del disabled del botón.
    if (inFlightRef.current || submitState === 'submitting') return

    // Antes de enviar: se quedan en línea (el botón ya lo comunica).
    if (isOffline) return setError('Necesitamos conexión a internet para confirmar tu pedido. Tu carrito está guardado.')
    if (!hasAddress) return setError('Agrega una dirección de entrega para continuar.')
    if (cashInvalid) return setError('Revisa con cuánto vas a pagar: debe cubrir el total de tu pedido.')
    if (!checkoutInfoReady || !restaurant || !user) {
      return setError('Aún estamos cargando la información del restaurante. Intenta de nuevo en un momento.')
    }

    inFlightRef.current = true
    setSubmitState('submitting')
    setError(null)
    setFailure(null)

    try {
      const deliveryAddress = address.complement
        ? `${address.street}, ${address.complement}`
        : address.street

      // Sin precios ni total: los calcula el servidor (RPC create_order).
      const { order: newOrder, code } = await createOrder({
        restaurant_id: restaurant.id,
        delivery_address: deliveryAddress,
        special_instructions: address.reference,
        payment_method: paymentMethod,
        items: cart.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
        // Misma llave mientras el carrito no cambie: un reintento devuelve el mismo pedido.
        cash_amount: cashAmount,
        notes_to_restaurant: notes.trim() || null,
        client_order_id: clientOrderId.getOrCreate(
          clientOrderId.orderSignature({
            restaurantId: restaurant.id,
            items: cart,
            paymentMethod,
            cashAmount,
            notes,
            address: [deliveryAddress, address.reference].join(' | '),
          })
        ).id,
      })
      if (!newOrder) {
        setFailure(classifyCheckoutError(code))
        setSubmitState('error')
        return
      }

      // Solo se guarda localmente para autocompletar la próxima vez — no es
      // una tabla de direcciones en el backend.
      localStorageService.set(STORAGE_KEYS.LAST_DELIVERY_ADDRESS, address)

      // Total del SERVIDOR (incluye la tarifa vigente al confirmar).
      setCreatedOrder({ id: newOrder.id, restaurantName: restaurant.name, total: Number(newOrder.total) })
      clientOrderId.clear()
      clear()
      setSubmitState('success')
    } catch (err) {
      console.error('Error confirmando el pedido:', err)
      setFailure('network')
      setSubmitState('error')
    } finally {
      inFlightRef.current = false
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

  if (failure) {
    return (
      <CheckoutError
        kind={failure}
        onRetry={() => void handleSubmit()}
        onReview={() => setFailure(null)}
        onNavigate={(path) => navigate(path)}
      />
    )
  }

  const subtotal = getTotal()
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
          <div className="bg-red-50 text-danger text-sm font-semibold rounded-2xl p-3" role="alert">{error}</div>
        )}

        {/* ENTREGA */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">ENTREGA</h2>
          <AddressCard draft={address} onEdit={() => setAddressSheetOpen(true)} />
        </div>

        <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

        {isCash && <CashAmountField total={total} value={cashInput} onChange={setCashInput} />}

        <OrderNotesField value={notes} onChange={setNotes} />

        <CheckoutSummary
          restaurant={restaurant}
          cart={cart}
          productById={productById}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
        />

        <p className="text-xs text-gray-500 text-center px-4">
          Tu pedido será procesado inmediatamente. El restaurante y el domiciliario recibirán la notificación.
        </p>
      </form>

      {/* CTA fijo abajo, con el total siempre visible */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-5 pt-3 pb-5 safe-bottom">
        {isOffline && (
          <div className="flex items-center gap-2 bg-red-50 text-danger text-sm font-semibold rounded-xl p-2.5 mb-3" role="alert">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            Sin conexión — tu carrito está guardado
          </div>
        )}
        <div className="flex items-baseline justify-between font-display font-bold mb-3 text-secondary">
          <span>Total</span>
          <span className="text-display font-extrabold tabular-nums text-brand-700">{formatCOP(total)}</span>
        </div>
        <Button
          variant="gradient"
          onClick={handleSubmit}
          fullWidth
          size="lg"
          className="tabular-nums"
          loading={isSubmitting}
          disabled={isSubmitting || !checkoutInfoReady || isOffline || !hasAddress || cashInvalid}
        >
          {isOffline
            ? 'Sin conexión'
            : !checkoutInfoReady
              ? 'Cargando...'
              : isSubmitting
                ? 'Procesando pedido...'
                : !hasAddress
                  ? 'Agrega una dirección'
                  : cashInvalid
                    ? 'Revisa con cuánto pagas'
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
