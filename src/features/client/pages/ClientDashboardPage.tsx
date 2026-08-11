import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { RocketMark } from '@/shared/components/RocketMark'
import { useRestaurants, useOrders } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { RestaurantCard } from '../components/RestaurantCard'
import { OrderCard } from '../components/OrderCard'
import { ROUTES, ORDER_STATUS } from '@/config/constants'
import { OrderStatus } from '@/shared/types'

export const ClientDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()
  const { orders } = useOrders(user?.id)
  const [search, setSearch] = useState('')

  // Estadísticas
  const totalOrders = orders.length
  const deliveredOrders = orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length
  const activeOrders = orders.filter(o =>
    !([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] as OrderStatus[]).includes(o.status)
  ).length
  const totalSpent = orders
    .filter(o => o.status === ORDER_STATUS.DELIVERED)
    .reduce((sum, o) => sum + o.total, 0)

  const recentOrders = orders.slice(0, 3)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(search.trim() ? `${ROUTES.CLIENT_RESTAURANTS}?q=${encodeURIComponent(search.trim())}` : ROUTES.CLIENT_RESTAURANTS)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero navy */}
      <div className="bg-secondary rounded-b-[28px] px-4 pt-6 pb-6 md:rounded-b-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <RocketMark size={34} />
            <span className="text-white/70 text-xs font-semibold tracking-widest">DOMICILIOS RIOHACHA</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
            Hola, {user?.name?.split(' ')[0] || 'bienvenido'} 👋
          </h1>
          <p className="text-white/70 mb-5">¿Qué quieres ordenar hoy?</p>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5">
            <span className="text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurantes..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900"
            />
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Estadísticas — grid compacto de 2x2 en mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="!p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalOrders}</p>
            <p className="text-gray-600 text-xs mt-0.5">📦 Órdenes</p>
          </Card>
          <Card className="!p-3 text-center">
            <p className="text-2xl font-bold text-success">{deliveredOrders}</p>
            <p className="text-gray-600 text-xs mt-0.5">✅ Entregadas</p>
          </Card>
          <Card className="!p-3 text-center">
            <p className="text-2xl font-bold text-warning">{activeOrders}</p>
            <p className="text-gray-600 text-xs mt-0.5">🔄 En progreso</p>
          </Card>
          <Card className="!p-3 text-center">
            <p className="text-xl font-bold text-primary">${totalSpent.toLocaleString('es-CO')}</p>
            <p className="text-gray-600 text-xs mt-0.5">💰 Gastado</p>
          </Card>
        </div>

        {/* Accesos rápidos — fila compacta tipo chips */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 border border-gray-100 hover:shadow-card transition-shadow"
          >
            <span className="text-2xl">🍕</span>
            <span className="text-xs font-semibold text-secondary">Ordenar</span>
          </button>
          <button
            onClick={() => navigate(ROUTES.CLIENT_ORDERS)}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 border border-gray-100 hover:shadow-card transition-shadow"
          >
            <span className="text-2xl">📦</span>
            <span className="text-xs font-semibold text-secondary">Mis órdenes</span>
          </button>
          <button
            onClick={() => navigate(ROUTES.CLIENT_CART)}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 border border-gray-100 hover:shadow-card transition-shadow"
          >
            <span className="text-2xl">🛒</span>
            <span className="text-xs font-semibold text-secondary">Carrito</span>
          </button>
        </div>

        {/* Órdenes Recientes */}
        {recentOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold text-secondary mb-3">Órdenes recientes</h2>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => navigate(ROUTES.CLIENT_ORDER.replace(':id', order.id))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Restaurantes Destacados */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-display font-bold text-secondary">⭐ Restaurantes populares</h2>
            <button onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)} className="text-primary text-sm font-semibold">
              Ver todos
            </button>
          </div>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.slice(0, 3).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600 text-center py-8">No hay restaurantes disponibles</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
