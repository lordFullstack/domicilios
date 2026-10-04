import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
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
import { ErrandCard } from '@/features/errands/components/ErrandCard'
import { useMyErrands } from '@/features/errands/hooks/useErrands'
import { ROUTES } from '@/config/constants'

export const OrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { orders, loading, fromCache, cachedAt } = useOrders(user?.id)
  const { errands, loading: errandsLoading, error: errandsError } = useMyErrands(user?.id)
  const [params, setParams] = useSearchParams()
  const tab: 'orders' | 'domis' = params.get('tab') === 'domis' ? 'domis' : 'orders'

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

      {/* Pedidos de restaurantes / Domis (mandados) */}
      <div className="mx-5 mb-4 flex w-fit gap-1 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Tipo de pedido">
        {([
          ['orders', 'Pedidos'],
          ['domis', 'Domis'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams(key === 'orders' ? {} : { tab: key }, { replace: true })}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === key ? 'bg-white text-secondary shadow-card' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'domis' ? (
        <div className="px-5" role="tabpanel">
          {errandsLoading ? (
            <LoadingState label="Cargando Domis" className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </LoadingState>
          ) : errandsError ? (
            <p className="py-8 text-center text-sm text-gray-500" role="alert">{errandsError}</p>
          ) : errands.length > 0 ? (
            <div className="flex flex-col gap-3">
              {errands.map((errand) => (
                <ErrandCard key={errand.id} errand={errand} onClick={() => navigate(ROUTES.DOMI_DETAIL.replace(':id', errand.id))} />
              ))}
            </div>
          ) : (
            <EmptyState
              illustration="idle"
              title="Aún no has pedido un Domi"
              description="Pídele un mandado a un domiciliario: compras o recogidas, sin restaurante."
              action={<Button variant="gradient" onClick={() => navigate(ROUTES.DOMI)}>Pide tu Domi</Button>}
            />
          )}
        </div>
      ) : (
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
      )}

      <BottomNav />
    </div>
  )
}
