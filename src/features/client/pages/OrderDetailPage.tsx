import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, XCircle, Star, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Toast } from '@/shared/components/Toast'
import {
  useOrders,
  useOrderItems,
  useRestaurantById,
  useOrderLocation,
  useDeliveryPersonProfile,
  useOrderRating,
  useProducts,
  useCart,
  useProductById,
} from '@/hooks/useLocalData'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { OrderStatusHero } from '../components/OrderStatusHero'
import { OrderStatusTimeline } from '../components/OrderStatusTimeline'
import { DeliveryTrackingSection } from '../components/DeliveryTrackingSection'
import { OrderSummaryCard } from '../components/OrderSummaryCard'
import { OrderDetailSheet } from '../components/OrderDetailSheet'
import { CancelOrderSheet } from '../components/CancelOrderSheet'
import { RatingModal } from '../components/RatingModal'
import { ORDER_STATUS, ROUTES } from '@/config/constants'


export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders, loading, updateOrder } = useOrders()
  const connectionStatus = useOnlineStatus()
  const isOffline = connectionStatus === 'offline'

  const order = orders.find((o) => o.id === id)
  const { restaurant } = useRestaurantById(order?.restaurant_id || '')
  const isInDelivery = order?.status === ORDER_STATUS.IN_DELIVERY
  const isDelivered = order?.status === ORDER_STATUS.DELIVERED
  const canCancel = order?.status === ORDER_STATUS.PENDING || order?.status === ORDER_STATUS.CONFIRMED
  const liveLocation = useOrderLocation(isInDelivery ? order?.id : undefined)
  const deliveryPerson = useDeliveryPersonProfile(isInDelivery ? order?.delivery_person_id : undefined)
  const { rating, loading: ratingLoading, submitting, submitRating } = useOrderRating(order)
  const { items: orderItems } = useOrderItems(order?.id)

  // Para "Volver a pedir": productos actuales del restaurante (con
  // disponibilidad real) y el carrito, para detectar si ya tiene
  // productos de otro restaurante (mismo patrón que RestaurantDetailPage).
  const { products } = useProducts(order?.restaurant_id)
  const { cart, addItem, clear } = useCart()
  const { product: firstCartProduct } = useProductById(cart[0]?.productId || '')
  const cartRestaurantId = cart.length > 0 ? firstCartProduct?.restaurant_id : undefined

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [reorderConfirmOpen, setReorderConfirmOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando orden...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
        <p className="text-gray-500 text-sm mb-4">Orden no encontrada</p>
        <Button onClick={() => navigate(ROUTES.CLIENT_ORDERS)}>Volver a mis órdenes</Button>
      </div>
    )
  }

  const isCancelled = order.status === ORDER_STATUS.CANCELLED

  const createdDate = new Date(order.created_at)
  const formattedDate = createdDate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = createdDate.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const lastUpdateTime = new Date(order.updated_at).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleCancelConfirm = async () => {
    setCancelling(true)
    setCancelError(null)
    const ok = await updateOrder(order.id, { status: ORDER_STATUS.CANCELLED })
    setCancelling(false)
    if (ok) {
      setCancelSheetOpen(false)
    } else {
      setCancelError('No pudimos cancelar el pedido. Intenta nuevamente.')
    }
  }

  const actuallyReorder = () => {
    let added = 0
    let skipped = 0
    orderItems.forEach((item) => {
      const product = products.find((p) => p.id === item.product_id)
      if (product && product.available) {
        addItem(product.id, product.price, item.quantity)
        added++
      } else {
        skipped++
      }
    })
    setReorderConfirmOpen(false)
    if (added === 0) {
      showToast('Ninguno de estos productos está disponible ahora mismo.')
      return
    }
    showToast(
      skipped > 0
        ? `Se agregaron ${added} productos · ${skipped} ya no están disponibles`
        : `✓ ${added} productos agregados a tu carrito`
    )
    navigate(ROUTES.CLIENT_CART)
  }

  const handleReorder = () => {
    if (orderItems.length === 0) return
    if (cartRestaurantId && cartRestaurantId !== order.restaurant_id) {
      setReorderConfirmOpen(true)
      return
    }
    actuallyReorder()
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-10">
      <Toast message={toastMessage} />

      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.CLIENT_ORDERS)}
          className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-secondary">
            #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500">
            {formattedDate} · {formattedTime}
          </p>
        </div>
      </div>

      {/* Indicador de conexión — honesto: nunca simula tiempo real */}
      <div className="px-5 pb-1">
        {isOffline ? (
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <WifiOff className="w-3 h-3" />
            Sin conexión · mostrando el último estado conocido ({lastUpdateTime})
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Wifi className="w-3 h-3 text-success" />
            Actualizado en tiempo real
          </p>
        )}
      </div>

      <div className="px-5">
        {!isCancelled && <OrderStatusHero status={order.status} />}

        {/* Tracker de estado */}
        {isCancelled ? (
          <div className="bg-red-50 rounded-2xl p-6 text-center mb-4" role="alert">
            <XCircle className="w-10 h-10 text-danger mx-auto mb-2" />
            <p className="font-display font-bold text-danger">Esta orden fue cancelada</p>
          </div>
        ) : (
          <OrderStatusTimeline status={order.status} />
        )}

        {/* Mapa en vivo del domiciliario — solo si hay ubicación real */}
        {isInDelivery && (
          <DeliveryTrackingSection deliveryPerson={deliveryPerson} liveLocation={liveLocation} />
        )}

        <OrderSummaryCard
          restaurantEmoji={restaurant?.image_url}
          restaurantName={restaurant?.name}
          itemCount={orderItems.length}
          total={order.total}
          onViewDetails={() => setDetailSheetOpen(true)}
        />

        {/* Acciones según estado */}
        {canCancel && (
          <Button variant="outline" fullWidth onClick={() => setCancelSheetOpen(true)} className="mb-4">
            Cancelar pedido
          </Button>
        )}

        {isDelivered && !ratingLoading && (
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={handleReorder}
            >
              <RotateCcw className="w-4 h-4" />
              Volver a pedir
            </Button>

            {rating ? (
              <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-gray-500">
                  Calificaste este pedido con {rating.restaurant_rating}/5 al restaurante
                  {rating.delivery_rating ? ` y ${rating.delivery_rating}/5 al domiciliario` : ''}. ¡Gracias!
                </p>
              </div>
            ) : (
              <Button onClick={() => setShowRatingModal(true)} fullWidth>
                Calificar este pedido
              </Button>
            )}
          </div>
        )}
      </div>

      <OrderDetailSheet open={detailSheetOpen} onClose={() => setDetailSheetOpen(false)} order={order} />

      <CancelOrderSheet
        open={cancelSheetOpen}
        cancelling={cancelling}
        error={cancelError}
        onClose={() => setCancelSheetOpen(false)}
        onConfirm={handleCancelConfirm}
      />

      {/* Confirmación al reordenar si el carrito tiene productos de otro
          restaurante — mismo patrón que RestaurantDetailPage. */}
      <BottomSheet
        open={reorderConfirmOpen}
        onClose={() => setReorderConfirmOpen(false)}
        title="¿Cambiar de restaurante?"
      >
        <p className="text-sm text-gray-500 mb-5">
          Tu carrito tiene productos de otro restaurante. Si continúas, vamos a vaciarlo y agregar
          este pedido en su lugar.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setReorderConfirmOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              clear()
              actuallyReorder()
            }}
            className="flex-1"
          >
            Vaciar y agregar
          </Button>
        </div>
      </BottomSheet>

      <RatingModal
        open={showRatingModal}
        restaurantName={restaurant?.name || 'el restaurante'}
        hasDeliveryPerson={!!order.delivery_person_id}
        submitting={submitting}
        onClose={() => setShowRatingModal(false)}
        onSubmit={async (restaurantRating, deliveryRating, comment) => {
          const ok = await submitRating(restaurantRating, deliveryRating, comment)
          if (ok) setShowRatingModal(false)
        }}
      />
    </div>
  )
}
