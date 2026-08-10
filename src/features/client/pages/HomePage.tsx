import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useRestaurants } from '@/hooks/useLocalData'
import { RestaurantCard } from '../components/RestaurantCard'
import { ROUTES } from '@/config/constants'

export const HomePage = () => {
  const navigate = useNavigate()
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-secondary mb-2">🍕 Domicilios Riohacha</h1>
          <p className="text-lg text-gray-500">Comida deliciosa entregada rápido</p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_CART)}>
            <h2 className="text-xl font-bold mb-2">🛒 Mi Carrito</h2>
            <p className="text-gray-600 mb-4">Ver y editar tus productos</p>
            <Button fullWidth variant="primary">Ir al carrito</Button>
          </Card>

          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_ORDERS)}>
            <h2 className="text-xl font-bold mb-2">📦 Mis Pedidos</h2>
            <p className="text-gray-600 mb-4">Ver historial y estado</p>
            <Button fullWidth variant="secondary">Ver pedidos</Button>
          </Card>
        </div>

        {/* Restaurantes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🏪 Restaurantes Disponibles</h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando restaurantes...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600 text-center py-8">No hay restaurantes disponibles</p>
            </Card>
          )}
        </div>

        {/* Información */}
        <Card>
          <h2 className="text-xl font-bold mb-4">✨ ¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-bold text-primary mb-1">1️⃣ Elige</p>
              <p className="text-gray-600">Selecciona tu restaurante favorito</p>
            </div>
            <div>
              <p className="font-bold text-primary mb-1">2️⃣ Ordena</p>
              <p className="text-gray-600">Agrega productos a tu carrito</p>
            </div>
            <div>
              <p className="font-bold text-primary mb-1">3️⃣ Recibe</p>
              <p className="text-gray-600">Tu comida en tu puerta</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
