import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/config/constants'

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">Bienvenido a Loop Maestro</h1>
          <p>Pide comida de tus restaurantes favoritos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>
            <h2 className="text-xl font-bold mb-2">🍔 Ver Restaurantes</h2>
            <p className="text-gray-600 mb-4">Explora todos los restaurantes disponibles</p>
            <Button fullWidth variant="primary">Ir a restaurantes</Button>
          </Card>

          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_ORDERS)}>
            <h2 className="text-xl font-bold mb-2">📦 Mis Pedidos</h2>
            <p className="text-gray-600 mb-4">Ver historial y estado de tus órdenes</p>
            <Button fullWidth variant="secondary">Ver pedidos</Button>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-bold mb-4">📋 Próximamente</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Búsqueda avanzada de restaurantes</li>
            <li>✅ Favoritos y recomendaciones</li>
            <li>✅ Seguimiento en tiempo real</li>
            <li>✅ Múltiples métodos de pago</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
