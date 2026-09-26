import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurants, useProducts, updateRestaurant } from '@/hooks/useLocalData'
import { restaurantAdvanceOrder, restaurantCancelOrder, restaurantSendOrder } from '@/services/orderActions.service'
import { supabase } from '@/shared/utils/supabase'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { BottomNav } from '@/shared/components/BottomNav'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { RestaurantHeader } from '../components/RestaurantHeader'
import { RestaurantOrderCard } from '../components/RestaurantOrderCard'
import { RestaurantStats } from '../components/RestaurantStats'
import { useOrderAlarm, useWakeLock } from '../hooks/useOrderAlarm'
import { CreateRestaurantPage } from './CreateRestaurantPage'
import { ORDER_STATUS, ROUTES } from '@/config/constants'
import { Order, OrderStatus } from '@/shared/types'

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
    <div className="theme-pulse min-h-screen bg-surface-soft max-w-md mx-auto pb-24 md:max-w-none md:mx-0 md:pl-60 md:pb-10">
      <NotificationPermissionCard />

      <RestaurantHeader
        restaurant={myRestaurant}
        uploadingCover={uploadingCover}
        onCoverChange={handleCoverChange}
        togglingStatus={togglingStatus}
        onToggleStatus={handleToggleStatus}
      />

      <RestaurantStats
        pending={pendingOrders.length}
        active={activeOrders.length}
        deliveredToday={deliveredToday.length}
        revenueToday={revenueToday}
      />

      <div className="mt-2" />
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
              <RestaurantOrderCard
                key={order.id}
                order={order}
                busy={processingId === order.id}
                disabled={!!processingId}
                onAdvance={() => handleAdvanceStatus(order)}
                onCancel={() => handleCancelOrder(order)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav role="restaurant" />
    </div>
  )
}
