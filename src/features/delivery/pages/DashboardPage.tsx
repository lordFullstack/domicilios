import { useEffect, useRef, useState } from 'react'
import { MapPin, MapPinOff, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurantById, updateOrderLocation } from '@/hooks/useLocalData'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { BottomNav } from '@/shared/components/BottomNav'
import { NotificationBell } from '@/shared/components/NotificationBell'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { Toast } from '@/shared/components/Toast'
import { DeliveryStatsGrid } from '../components/DeliveryStatsGrid'
import { DeliveryOrderCard } from '../components/DeliveryOrderCard'
import { DeliveryOrderDetailSheet } from '../components/DeliveryOrderDetailSheet'
import { ActiveDeliveryBar } from '../components/ActiveDeliveryBar'
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '@/config/constants'
import { Order } from '@/shared/types'
import { formatCOP } from '@/shared/utils/money'

// Cada cuántos milisegundos se manda la ubicación al servidor mientras
// hay una entrega activa. No hace falta mandarla en cada pulso del GPS.
const LOCATION_UPDATE_INTERVAL_MS = 10000

export const DeliveryDashboard = () => {
  const { user } = useAuth()
  const { orders, updateOrder, acceptOrder, getOrdersByDelivery } = useOrders()
  const connectionStatus = useOnlineStatus()
  const isOffline = connectionStatus === 'offline'

  const [locationError, setLocationError] = useState<string | null>(null)
  const [sharingLocation, setSharingLocation] = useState(false)
  const lastSentAtRef = useRef(0)

  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  // Evita doble-tap: mientras se procesa una acción sobre un pedido puntual,
  // se deshabilita esa acción (no toda la pantalla).
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const availableOrders = orders.filter(
    (o) => o.status === ORDER_STATUS.READY && !o.delivery_person_id
  )

  const myDeliveries = user ? getOrdersByDelivery(user.id) : []
  const activeDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.IN_DELIVERY)
  const completedDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.DELIVERED)
  const activeOrder = activeDeliveries[0]
  const { restaurant: activeRestaurant } = useRestaurantById(activeOrder?.restaurant_id || '')

  // Mientras haya una entrega activa, comparte la ubicación del celular
  // para que el cliente pueda ver en un mapa por dónde va su pedido.
  useEffect(() => {
    if (!activeOrder || !('geolocation' in navigator)) {
      setSharingLocation(false)
      return
    }

    setLocationError(null)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setSharingLocation(true)
        setLocationError(null)
        const now = Date.now()
        if (now - lastSentAtRef.current < LOCATION_UPDATE_INTERVAL_MS) return
        lastSentAtRef.current = now
        updateOrderLocation(activeOrder.id, position.coords.latitude, position.coords.longitude)
      },
      (err) => {
        setSharingLocation(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Activa el permiso de ubicación para que el cliente pueda ver por dónde vas.'
            : 'No se pudo obtener tu ubicación. Revisa el GPS del celular.'
        )
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      setSharingLocation(false)
    }
  }, [activeOrder])

  const todayCompleted = completedDeliveries.filter((o) => {
    const today = new Date().toDateString()
    return new Date(o.updated_at).toDateString() === today
  })

  const handleAcceptOrder = async (order: Order) => {
    if (!user || processingOrderId) return
    setProcessingOrderId(order.id)
    const result = await acceptOrder(order.id, user.id)
    setProcessingOrderId(null)

    if (result.ok) {
      setDetailOrder(null)
      showToast('✓ Pedido aceptado — dirígete al restaurante')
    } else if (result.reason === 'taken') {
      setDetailOrder(null)
      showToast('Este pedido ya fue tomado por otro domiciliario')
    } else {
      showToast('No pudimos aceptar el pedido. Intenta de nuevo.')
    }
  }

  const handleCompleteDelivery = async (order: Order) => {
    if (processingOrderId) return
    setProcessingOrderId(order.id)
    const updates: Partial<Order> = { status: ORDER_STATUS.DELIVERED }
    // Si es efectivo/datáfono, el domiciliario cobra al entregar → marcar pagado
    if (order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY) {
      updates.payment_status = PAYMENT_STATUS.PAID
    }
    const ok = await updateOrder(order.id, updates)
    setProcessingOrderId(null)

    if (ok) {
      setDetailOrder(null)
      showToast('✓ Entrega completada')
    } else {
      showToast('No pudimos marcar la entrega. Intenta de nuevo.')
    }
  }

  // El sheet de detalle sirve tanto para pedidos disponibles (acción:
  // aceptar) como para la entrega activa (acción: marcar entregada).
  const detailIsActive = detailOrder?.status === ORDER_STATUS.IN_DELIVERY
  const detailActionLabel = detailIsActive ? 'Marcar como entregada' : 'Aceptar entrega'
  const detailActionDisabled =
    isOffline || !!processingOrderId || (!detailIsActive && activeDeliveries.length > 0)

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      <Toast message={toastMessage} />

      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-6 pb-1">
        <div>
          <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
          <h1 className="font-display text-xl font-bold text-secondary">🚴 Panel de Domiciliario</h1>
          <p className="text-sm text-gray-500">Hola {user?.name?.split(' ')[0]}, aquí tus entregas</p>
        </div>
        <NotificationBell />
      </div>

      <div className="px-5 pb-3">
        {isOffline ? (
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <WifiOff className="w-3 h-3" />
            Sin conexión — no podés aceptar ni completar entregas ahora
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Wifi className="w-3 h-3 text-success" />
            Conectado en tiempo real
          </p>
        )}
      </div>

      <div className="px-5">
        <NotificationPermissionCard />
      </div>

      <DeliveryStatsGrid
        availableCount={availableOrders.length}
        activeCount={activeDeliveries.length}
        completedToday={todayCompleted}
      />

      {/* Entrega activa */}
      {activeDeliveries.length > 0 && (
        <div className="px-5 mb-6">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Mi Entrega Actual</h2>

          {locationError ? (
            <div className="flex items-center gap-2 bg-red-50 text-danger text-xs font-semibold rounded-2xl p-3 mb-3" role="alert">
              <MapPinOff className="w-4 h-4 flex-shrink-0" />
              {locationError}
            </div>
          ) : sharingLocation ? (
            <div className="flex items-center gap-2 bg-green-50 text-success text-xs font-semibold rounded-2xl p-3 mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              Compartiendo tu ubicación con el cliente
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            {activeDeliveries.map((order) => (
              <DeliveryOrderCard key={order.id} order={order} onOpenDetail={setDetailOrder} />
            ))}
          </div>
        </div>
      )}

      {/* Órdenes disponibles */}
      <div className="px-5 mb-6">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Órdenes Disponibles</h2>

        {availableOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No hay órdenes disponibles en este momento</p>
        ) : (
          <div className="flex flex-col gap-3">
            {availableOrders.map((order) => (
              <DeliveryOrderCard key={order.id} order={order} onOpenDetail={setDetailOrder} />
            ))}
          </div>
        )}
      </div>

      {/* Historial reciente */}
      {completedDeliveries.length > 0 && (
        <div className="px-5">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Historial Reciente</h2>
          <div className="flex flex-col gap-2">
            {completedDeliveries.slice(0, 5).map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-2xl p-3 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-secondary">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{order.delivery_address}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-success font-semibold text-xs">Entregada</p>
                  <p className="text-xs text-gray-500">{formatCOP(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DeliveryOrderDetailSheet
        order={detailOrder}
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        actionLabel={detailActionLabel}
        actionLoading={processingOrderId === detailOrder?.id}
        actionDisabled={detailActionDisabled}
        onAction={() => {
          if (!detailOrder) return
          detailIsActive ? handleCompleteDelivery(detailOrder) : handleAcceptOrder(detailOrder)
        }}
      />

      {/* CTA sticky de la entrega activa — accesible con el pulgar sin
          tener que scrollear ni abrir el sheet. */}
      {activeOrder && !detailOrder && (
        <ActiveDeliveryBar
          restaurantName={activeRestaurant?.name}
          loading={processingOrderId === activeOrder.id}
          disabled={isOffline || !!processingOrderId}
          onComplete={() => handleCompleteDelivery(activeOrder)}
        />
      )}

      <BottomNav role="delivery" />
    </div>
  )
}
