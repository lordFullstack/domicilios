import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useCart } from '@/hooks/useLocalData'
import { useOrders } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRestaurantById, useProductById } from '@/hooks/useLocalData'
import { ROUTES, ORDER_STATUS } from '@/config/constants'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, clear, getTotal } = useCart()
  const { createOrder } = useOrders()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    specialInstructions: '',
  })

  // Obtener restaurante de primer producto en carrito
  const firstProduct = useProductById(cart[0]?.productId || '')
  const { restaurant } = useRestaurantById(firstProduct.product?.restaurant_id || '')

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🛒</p>
              <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">No hay productos para ordenar</p>
              <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>
                Ir a restaurantes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.deliveryAddress.trim()) {
        throw new Error('La dirección de entrega es requerida')
      }

      if (!restaurant || !user) {
        throw new Error('Información de restaurante o usuario no disponible')
      }

      // Crear orden
      const orderId = `order-${Date.now()}`
      const now = new Date().toISOString()

      const order = {
        id: orderId,
        user_id: user.id,
        restaurant_id: restaurant.id,
        total: getTotal(),
        status: ORDER_STATUS.PENDING,
        delivery_person_id: undefined,
        delivery_address: formData.deliveryAddress,
        special_instructions: formData.specialInstructions,
        created_at: now,
        updated_at: now,
      }

      // Guardar orden
      const success = createOrder(order)

      if (!success) {
        throw new Error('Error al crear la orden')
      }

      // Limpiar carrito
      clear()

      // Redirigir a órdenes
      navigate(ROUTES.CLIENT_ORDERS, { 
        state: { 
          message: '✅ ¡Orden creada exitosamente!',
          orderId 
        } 
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary font-semibold mb-8">
          ← Atrás
        </button>

        <h1 className="text-3xl font-bold mb-6">✅ Confirmar Orden</h1>

        {error && (
          <Card className="mb-6 bg-danger/10 border border-danger/20">
            <p className="text-danger font-semibold">❌ {error}</p>
          </Card>
        )}

        {/* Resumen de orden */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold mb-4">📦 Resumen de Orden</h2>

          {/* Restaurante */}
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-gray-600">Restaurante</p>
            <p className="text-lg font-bold">
              {restaurant?.image_url} {restaurant?.name}
            </p>
          </div>

          {/* Items */}
          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-600 font-semibold mb-3">Items</p>
            {cart.map((item) => {
              const { product } = useProductById(item.productId)
              if (!product) return null
              return (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {product.name} x{item.quantity}
                  </span>
                  <span className="font-semibold">
                    ${(product.price * item.quantity).toLocaleString('es-CO')}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Totales */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío:</span>
              <span className="text-success">Gratis</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </Card>

        {/* Formulario de entrega */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold mb-4">📍 Información de Entrega</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dirección */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Dirección de Entrega *
              </label>
              <Input
                placeholder="Ej: Cra 10 #100, Apto 501"
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Instrucciones especiales */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Instrucciones Especiales
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                placeholder="Ej: Sin picante, dejar en portería, etc"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                fullWidth
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                fullWidth
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? '⏳ Creando orden...' : '✅ Crear Orden'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info adicional */}
        <Card className="bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Nota:</strong> Tu orden será procesada inmediatamente. El restaurante
            y el domiciliario recibirán la notificación.
          </p>
        </Card>
      </div>
    </div>
  )
}
