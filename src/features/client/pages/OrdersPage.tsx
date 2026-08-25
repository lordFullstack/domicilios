import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders } from '@/hooks/useLocalData'
import { Button } from '@/shared/components/Button'
import { BottomNav } from '@/shared/components/BottomNav'
import { OrderCard } from '../components/OrderCard'
import { ROUTES } from '@/config/constants'

export const OrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { orders, loading } = useOrders(user?.id)

  const successMessage = (location.state as any)?.message

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Mis Órdenes</h1>
      </div>

      {/* Contenido */}
      <div className="px-5">
        {successMessage && (
          <div className="mb-4 bg-green-50 text-green-700 text-sm font-semibold rounded-2xl p-3">
            {successMessage}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Cargando órdenes...</p>
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
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-display font-bold mb-1 text-secondary">No tienes órdenes</p>
            <p className="text-sm text-gray-400 mb-6">Realiza tu primera orden ahora</p>
            <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Ir a restaurantes</Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
