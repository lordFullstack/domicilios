import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { OrdersFilters } from '../components/OrdersFilters'
import { OrdersTable } from '../components/OrdersTable'
import { OrdersCardList } from '../components/OrdersCardList'
import { OrderDetailPanel } from '../components/OrderDetailPanel'
import { USER_ROLES } from '@/config/constants'
import { Order } from '@/shared/types'
import { AdminListSkeleton } from '../components/AdminListSkeleton'
import { AdminErrandsPanel } from '../components/AdminErrandsPanel'

export const AdminOrdersPage = () => {
  const {
    orders,
    allOrders,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    restaurantFilter,
    setRestaurantFilter,
    period,
    setPeriod,
    search,
    setSearch,
    updateOrderSafely,
  } = useAdminOrders()
  const { users } = useAdminUsers()
  const { restaurants } = useAdminRestaurants()

  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [params, setParams] = useSearchParams()
  const tab: 'orders' | 'domis' = params.get('tab') === 'domis' ? 'domis' : 'orders'

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const restaurantsById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants])
  const deliveryPeople = useMemo(() => users.filter((u) => u.role === USER_ROLES.DELIVERY), [users])

  // fetchAllOrders() tiene un límite de 200 filas — mismo aviso que ya
  // usamos en el Dashboard, para no mostrar un total que parece exacto.
  const mayBeIncomplete = period === 'all' && allOrders.length >= 200

  // Mantiene sincronizado el panel de detalle si `orders` se refresca
  // (ej. tras guardar) — así el panel siempre muestra el estado real.
  const liveDetailOrder = detailOrder ? orders.find((o) => o.id === detailOrder.id) || detailOrder : null

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-3">Pedidos</h1>

        {/* Pedidos de restaurantes / Domis (mandados) */}
        <div className="mb-4 flex w-fit gap-1 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Tipo de pedido">
          {([
            ['orders', 'Pedidos'],
            ['domis', '🛵 Domis'],
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
          <AdminErrandsPanel usersById={usersById} />
        ) : (
          <>
        <p className="text-sm text-gray-500 mb-1">
          {orders.length} de {allOrders.length} pedido(s)
        </p>
        {mayBeIncomplete && (
          <p className="text-xs text-warning-strong mb-4">
            Mostrando hasta 200 pedidos más recientes — el total real podría ser mayor.
          </p>
        )}

        {loading && <AdminListSkeleton />}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && (
          <>
            <OrdersFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              restaurantFilter={restaurantFilter}
              onRestaurantChange={setRestaurantFilter}
              restaurants={restaurants}
              period={period}
              onPeriodChange={setPeriod}
            />

            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12 border border-gray-100 rounded-2xl bg-white">
                {allOrders.length === 0 ? 'Todavía no hay pedidos.' : 'Ningún pedido coincide con estos filtros.'}
              </p>
            ) : (
              <>
                <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-x-auto px-4">
                  <OrdersTable
                    orders={orders}
                    usersById={usersById}
                    restaurantsById={restaurantsById}
                    onOpenDetail={setDetailOrder}
                  />
                </div>
                <div className="md:hidden">
                  <OrdersCardList
                    orders={orders}
                    usersById={usersById}
                    restaurantsById={restaurantsById}
                    onOpenDetail={setDetailOrder}
                  />
                </div>
              </>
            )}
          </>
        )}
          </>
        )}
      </div>

      {liveDetailOrder && (
        <OrderDetailPanel
          order={liveDetailOrder}
          restaurantName={restaurantsById.get(liveDetailOrder.restaurant_id)?.name || 'Restaurante'}
          client={usersById.get(liveDetailOrder.user_id)}
          deliveryPeople={deliveryPeople}
          onClose={() => setDetailOrder(null)}
          onUpdate={(expectedStatus, updates) => updateOrderSafely(liveDetailOrder.id, expectedStatus, updates)}
        />
      )}
    </div>
  )
}
