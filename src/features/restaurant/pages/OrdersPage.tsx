import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurants } from '@/hooks/useLocalData'
import { BottomNav } from '@/shared/components/BottomNav'
import { OrderItemsList } from '@/shared/components/OrderItemsList'
import { CreateRestaurantPage } from './CreateRestaurantPage'
import { ROUTES, ORDER_STATUS } from '@/config/constants'

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmada',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.READY]: 'Lista',
  [ORDER_STATUS.IN_DELIVERY]: 'En camino',
  [ORDER_STATUS.DELIVERED]: 'Entregada',
  [ORDER_STATUS.CANCELLED]: 'Cancelada',
}

export const RestaurantOrdersPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()
  const { getOrdersByRestaurant } = useOrders()

  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id)
  const myOrders = myRestaurant ? getOrdersByRestaurant(myRestaurant.id) : []
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!myRestaurant) {
    return <CreateRestaurantPage onCreated={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24 md:max-w-none md:mx-0 md:pl-60 md:pb-10">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 md:max-w-4xl md:mx-auto md:px-0 md:pt-8">
        <button
          onClick={() => navigate(ROUTES.RESTAURANT_DASHBOARD)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center md:hidden"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Historial de Órdenes</h1>
      </div>

      <div className="px-5 md:max-w-4xl md:mx-auto md:px-0">
        {myOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-16">Aún no hay órdenes registradas</p>
        ) : (
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {myOrders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-2xl p-3">
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-secondary">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{order.delivery_address}</p>
                    <p className="text-xs text-gray-300">
                      {new Date(order.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {STATUS_LABELS[order.status]}
                      </p>
                      <p className="font-bold text-primary text-sm">
                        ${order.total.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-300 transition-transform ${
                        expandedId === order.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedId === order.id && (
                  <div className="bg-gray-50 rounded-xl p-2.5 mt-3">
                    <OrderItemsList orderId={order.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="restaurant" />
    </div>
  )
}
