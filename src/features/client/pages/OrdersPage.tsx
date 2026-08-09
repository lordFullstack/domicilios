import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { OrderCard } from '../components/OrderCard'
import { ROUTES } from '@/config/constants'

export const OrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { orders, loading } = useOrders(user?.id)

  const successMessage = (location.state as any)?.message

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-8">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(ROUTES.CLIENT_HOME)} className="mb-4 hover:opacity-80">
            ← Atrás
          </button>
          <h1 className="text-3xl font-bold">📦 Mis Órdenes</h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mensaje de éxito */}
        {successMessage && (
          <Card className="mb-6 bg-success/10 border border-success/20">
            <p className="text-success font-semibold">{successMessage}</p>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando órdenes...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(ROUTES.CLIENT_ORDER.replace(':id', order.id))}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📭</p>
              <h2 className="text-2xl font-bold mb-2">No tienes órdenes</h2>
              <p className="text-gray-600 mb-6">Realiza tu primera orden ahora</p>
              <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>
                Ir a restaurantes
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
