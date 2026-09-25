import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurants, useProducts, updateRestaurant } from '@/hooks/useLocalData'
import { restaurantAdvanceOrder, restaurantCancelOrder, restaurantSendOrder } from '@/services/orderActions.service'
import { supabase } from '@/shared/utils/supabase'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { ImageOverlay } from '@/shared/components/ImageOverlay'
import { BottomNav } from '@/shared/components/BottomNav'
import { NotificationBell } from '@/shared/components/NotificationBell'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { OrderItemsList } from '@/shared/components/OrderItemsList'
import { RestaurantOrderActions } from '../components/RestaurantOrderActions'
import { DeadlineCountdown } from '@/shared/components/DeadlineCountdown'
import { useOrderAlarm, useWakeLock } from '../hooks/useOrderAlarm'
import { CreateRestaurantPage } from './CreateRestaurantPage'
import { ORDER_STATUS, ROUTES } from '@/config/constants'
import { Order, OrderStatus } from '@/shared/types'

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmada',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.READY]: 'Lista',
  [ORDER_STATUS.IN_DELIVERY]: 'En camino',
  [ORDER_STATUS.DELIVERED]: 'Entregada',
  [ORDER_STATUS.CANCELLED]: 'Cancelada',
}

export const RestaurantDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants, loading: loadingRestaurants, reload: reloadRestaurants } = useRestaurants()
  const { getOrdersByRestaurant, reload } = useOrders()

  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id)
  const { products } = useProducts(myRestaurant?.id)

  const myOrders = myRestaurant ? getOrdersByRestaurant(myRestaurant.id) : []
  // Transiciones por RPC del servidor (LOOP_SECURITY_01): una acción a la vez.
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const pendingOrders = myOrders.filter((o) => o.status === ORDER_STATUS.PENDING)
  const activeOrders = myOrders.filter(
    (o) => !([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] as OrderStatus[]).includes(o.status)
  )
  // Pedidos listos que nadie aceptó: el restaurante los ve y puede buscar otra vez.
  const unassignedReady = myOrders.filter((o) => o.status === ORDER_STATUS.READY && !o.delivery_person_id)
  // Sonido repetido mientras haya pedidos por confirmar, y pantalla encendida (LOOP_FLOW_01).
  const { audioBlocked, enableSound } = useOrderAlarm(pendingOrders.length > 0)
  useWakeLock(!!myRestaurant)
  const deliveredToday = myOrders.filter((o) => {
    const today = new Date().toDateString()
    return o.status === ORDER_STATUS.DELIVERED && new Date(o.updated_at).toDateString() === today
  })
  const revenueToday = deliveredToday.reduce((sum, o) => sum + o.total, 0)

  const runOrderAction = async (order: Order, action: (id: string) => Promise<{ ok: boolean; reason?: string }>) => {
    if (processingId) return
    setProcessingId(order.id)
    setActionError(null)
    const result = await action(order.id)
    await reload()
    setProcessingId(null)
    if (!result.ok) {
      setActionError(result.reason ?? 'No pudimos actualizar el pedido. Intenta de nuevo.')
      setTimeout(() => setActionError(null), 5000)
    }
  }

  // "Enviar" (pedido listo) = el servidor asigna al siguiente domiciliario disponible.
  const handleAdvanceStatus = (order: Order) =>
    runOrderAction(order, order.status === ORDER_STATUS.READY ? restaurantSendOrder : restaurantAdvanceOrder)

  const handleCancelOrder = (order: Order) => runOrderAction(order, restaurantCancelOrder)

  const handleToggleStatus = async () => {
    if (!myRestaurant || togglingStatus) return
    setTogglingStatus(true)
    try {
      await updateRestaurant(myRestaurant.id, {
        status: myRestaurant.status === 'open' ? 'closed' : 'open',
      })
      await reloadRestaurants()
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !myRestaurant) return

    if (file.size > 5 * 1024 * 1024) {
      alert('La foto no puede pesar más de 5MB')
      return
    }

    setUploadingCover(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${myRestaurant.id}/cover.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('restaurant-covers')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('restaurant-covers').getPublicUrl(path)
      await updateRestaurant(myRestaurant.id, { cover_url: `${data.publicUrl}?t=${Date.now()}` })
      await reloadRestaurants()
    } catch (err) {
      console.error(err)
      alert('No se pudo subir la portada. Intenta de nuevo.')
    } finally {
      setUploadingCover(false)
    }
  }

  if (loadingRestaurants) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (!myRestaurant) {
    return <CreateRestaurantPage onCreated={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24 md:max-w-none md:mx-0 md:pl-60 md:pb-10">
      <NotificationPermissionCard />

      {/* Hero del restaurante */}
      <div
        className="mx-5 mt-5 mb-4 rounded-3xl p-5 relative overflow-hidden bg-secondary bg-cover bg-center md:max-w-4xl md:mx-auto md:mt-8"
        style={myRestaurant.cover_url ? { backgroundImage: `url(${myRestaurant.cover_url})` } : undefined}
      >
        {!myRestaurant.cover_url && (
          <>
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary/20 rounded-full" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-primary/10 rounded-full" />
          </>
        )}
        {myRestaurant.cover_url && (
          <ImageOverlay variant="bottom-soft" />
        )}

        <div className="relative flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0 backdrop-blur-sm">
            {myRestaurant.image_url || '🍽️'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-white truncate">
              {myRestaurant.name}
            </h1>
            <p className="flex items-center gap-1 text-xs text-white/70 mt-0.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {myRestaurant.address}
            </p>
          </div>
          <label className="relative w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition-transform">
            {uploadingCover ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleCoverChange}
              disabled={uploadingCover}
            />
          </label>
          <NotificationBell variant="light" />
        </div>

        <button
          onClick={handleToggleStatus}
          disabled={togglingStatus}
          className="relative w-full flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3 mt-4 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span
              className={`w-2 h-2 rounded-full ${
                myRestaurant.status === 'open' ? 'bg-success' : 'bg-gray-400'
              }`}
            />
            {myRestaurant.status === 'open' ? 'Abierto — recibiendo pedidos' : 'Cerrado — no recibes pedidos'}
          </span>
          <span
            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
              myRestaurant.status === 'open' ? 'bg-success' : 'bg-gray-500'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                myRestaurant.status === 'open' ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {!myRestaurant.approved && (
        <div className="mx-5 mb-4 bg-warning/10 text-warning-strong text-sm font-semibold rounded-2xl p-3 md:max-w-4xl md:mx-auto" role="status">
          Tu restaurante está en revisión. Aparecerá para los clientes cuando un administrador lo apruebe.
        </div>
      )}

      {actionError && (
        <div className="mx-5 mb-4 bg-red-50 text-danger text-sm font-semibold rounded-2xl p-3 md:max-w-4xl md:mx-auto" role="alert">
          {actionError}
        </div>
      )}

      <div className="mx-5 mb-2 md:max-w-4xl md:mx-auto">
        <button type="button" onClick={enableSound} className="focus-ring min-h-[44px] text-sm font-semibold text-primary underline">
          🔔 Probar sonido
        </button>
      </div>

      {audioBlocked && (
        <div className="mx-5 mb-4 md:max-w-4xl md:mx-auto">
          <Button fullWidth variant="primary" onClick={enableSound}>
            🔔 Activar sonido de pedidos nuevos
          </Button>
        </div>
      )}

      {unassignedReady.length > 0 && (
        <div className="mx-5 mb-4 bg-warning/10 text-warning-strong text-sm font-semibold rounded-2xl p-3 md:max-w-4xl md:mx-auto" role="alert">
          {unassignedReady.length === 1
            ? 'Un pedido listo no tiene domiciliario. Toca "Enviar" en la orden para buscar otra vez.'
            : `${unassignedReady.length} pedidos listos no tienen domiciliario. Toca "Enviar" en cada orden para buscar otra vez.`}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-4 md:grid-cols-4 md:max-w-4xl md:mx-auto md:px-0">
        <Card className="text-center py-4">
          <p className="text-2xl font-display font-bold text-warning-strong">{pendingOrders.length}</p>
          <p className="text-gray-500 text-xs mt-1">Pendientes</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-display font-bold text-primary">{activeOrders.length}</p>
          <p className="text-gray-500 text-xs mt-1">Activas</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-display font-bold text-success-strong">{deliveredToday.length}</p>
          <p className="text-gray-500 text-xs mt-1">Entregadas hoy</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-lg font-display font-bold text-primary">
            ${revenueToday.toLocaleString('es-CO')}
          </p>
          <p className="text-gray-500 text-xs mt-1">Ingresos hoy</p>
        </Card>
      </div>

      {/* Info rápida */}
      <div className="px-5 mb-6 flex flex-col gap-3 md:max-w-4xl md:mx-auto md:px-0">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-bold text-sm text-secondary">Menú</p>
            <span className="text-xs text-gray-500">
              {products.length} productos · {products.filter((p) => p.available).length} activos
            </span>
          </div>
          <Button fullWidth variant="outline" size="sm" onClick={() => navigate(ROUTES.RESTAURANT_PRODUCTS)}>
            Gestionar menú
          </Button>
        </Card>
      </div>

      {/* Órdenes Activas */}
      <div className="px-5 md:max-w-4xl md:mx-auto md:px-0">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Órdenes Activas</h2>

        {activeOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No hay órdenes activas en este momento</p>
        ) : (
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-secondary">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                {order.status === ORDER_STATUS.PENDING && order.confirm_deadline && (
                  <DeadlineCountdown deadline={order.confirm_deadline} prefix="Responde en" className="mb-1" />
                )}
                <p className="text-xs text-gray-500 mb-1">{order.delivery_address}</p>
                {order.special_instructions && (
                  <p className="text-xs text-gray-500 italic mb-1">"{order.special_instructions}"</p>
                )}

                <div className="bg-gray-50 rounded-xl p-2.5 my-2">
                  <OrderItemsList orderId={order.id} />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-display font-bold text-primary">
                    ${order.total.toLocaleString('es-CO')}
                  </p>
                  <span className="text-xs text-gray-500">
                    {order.payment_method === 'cash_on_delivery' ? '💵 Contra entrega' : '💳 Pagado en línea'}
                  </span>
                </div>

                <RestaurantOrderActions
                  order={order}
                  busy={processingId === order.id}
                  disabled={!!processingId}
                  onAdvance={() => handleAdvanceStatus(order)}
                  onCancel={() => handleCancelOrder(order)}
                />
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="restaurant" />
    </div>
  )
}
