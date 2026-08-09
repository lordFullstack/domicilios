import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useRestaurantById, useProducts } from '@/hooks/useLocalData'
import { ProductCard } from '../components/ProductCard'
import { ROUTES } from '@/config/constants'

export const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { restaurant, loading: restaurantLoading } = useRestaurantById(id || '')
  const { products, loading: productsLoading } = useProducts(id)

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando restaurante...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Restaurante no encontrado</p>
          <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Restaurante */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="text-primary font-semibold mb-4">
            ← Atrás
          </button>

          <div className="flex gap-6 items-start">
            {/* Imagen */}
            <div className="text-6xl bg-gray-100 p-8 rounded-lg">{restaurant.image_url}</div>

            {/* Información */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">📍 Dirección:</span> {restaurant.address}
                </p>
                <p>
                  <span className="font-semibold">📞 Teléfono:</span> {restaurant.phone}
                </p>
                <p>
                  <span className="font-semibold">🕐 Estado:</span>{' '}
                  {restaurant.status === 'open' ? (
                    <span className="text-success">🟢 Abierto</span>
                  ) : (
                    <span className="text-danger">🔴 Cerrado</span>
                  )}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="primary" fullWidth>
                  Realizar Pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú de Productos */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">🍽️ Menú</h2>

        {productsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando menú...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => {
                  console.log('Producto seleccionado:', prod)
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-gray-600 text-center py-8">No hay productos disponibles</p>
          </Card>
        )}
      </div>

      {/* Botón Flotante Carrito */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => navigate(ROUTES.CLIENT_CART)}
          className="rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg"
        >
          🛒
        </Button>
      </div>
    </div>
  )
}
