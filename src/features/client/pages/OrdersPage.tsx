import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders } from '@/hooks/useLocalData'
import { Button } from '@/shared/components/Button'
import { BottomNav } from '@/shared/components/BottomNav'
import { Skeleton } from '@/shared/components/Skeleton'
import { LoadingState } from '@/shared/components/LoadingState'
import { EmptyState } from '@/shared/components/EmptyState'
import { EMPTY_COPY } from '@/shared/constants/stateCopy'
import { OrderCard } from '../components/OrderCard'
import { OfflineDataBadge } from '@/shared/components/OfflineDataBadge'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { ROUTES } from '@/config/constants'

export const OrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { orders, loading, fromCache, cachedAt } = useOrders(user?.id)

  const successMessage = (location.state as any)?.message

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto safe-left safe-right pb-24">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          aria-label="Volver al inicio"
          className="touch-target focus-ring w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Mis Órdenes</h1>
      </div>

      {/* Contenido */}
      <div className="px-5">
        {successMessage && (
          <div className="mb-4 bg-success/10 text-success-strong text-sm font-semibold rounded-2xl p-3">
            {successMessage}
          </div>
        )}

        {fromCache && <OfflineDataBadge cachedAt={cachedAt} />}
        <NotificationPermissionCard />

        {loading ? (
          <LoadingState label="Cargando pedidos" className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 p-4">
                <Skeleton className="w-12 h-12 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </LoadingState>
        ) : orders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(ROUTES.CLIENT_ORDER.replace(':id', order.id))}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            illustration={EMPTY_COPY.orders.illustration}
            title={EMPTY_COPY.orders.title}
            description={EMPTY_COPY.orders.description}
            action={<Button variant="gradient" onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>{EMPTY_COPY.orders.cta}</Button>}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
