import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Banknote, CreditCard } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useCart, useOrders, useRestaurantById, useProductById } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES, ORDER_STATUS, PAYMENT_METHOD } from '@/config/constants'
import { PaymentMethod } from '@/shared/types'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, clear, getTotal } = useCart()
  const { createOrder } = useOrders()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PAYMENT_METHOD.CASH_ON_DELIVERY
  )
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    specialInstructions: '',
  })

  const firstProduct = useProductById(cart[0]?.productId || '')
  const { restaurant } = useRestaurantById(firstProduct.product?.restaurant_id || '')

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center px-8 text-center">
        <span className="text-5xl mb-4">🛒</span>
        <p className="font-display font-bold mb-1 text-secondary">Tu carrito está vacío</p>
        <p className="text-sm text-gray-400 mb-6">No hay productos para ordenar</p>
        <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Ir a restaurantes</Button>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

      const order = {
        user_id: user.id,
        restaurant_id: restaurant.id,
        total: getTotal(),
        status: ORDER_STATUS.PENDING,
        delivery_address: formData.deliveryAddress,
        special_instructions: formData.specialInstructions,
        payment_method: paymentMethod,
      }

      const items = cart.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))

      const success = await createOrder(order, items)
      if (!success) throw new Error('Error al crear la orden')

      clear()
      navigate(ROUTES.CLIENT_ORDERS, {
        state: { message: '¡Orden creada exitosamente!' },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Confirmar Orden</h1>
      </div>

      <div className="px-5">
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl p-3">
            {error}
          </div>
        )}

        {/* Resumen */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <span className="text-2xl">{restaurant?.image_url}</span>
            <p className="font-display font-bold text-sm text-secondary">{restaurant?.name}</p>
          </div>

          <div className="flex flex-col gap-1.5 mb-3">
            {cart.map((item) => (
              <CheckoutItemRow key={item.productId} item={item} />
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Envío</span>
              <span className="text-green-600 font-semibold">Gratis</span>
            </div>
            <div className="flex justify-between font-display font-bold text-secondary pt-1">
              <span>Total</span>
              <span className="text-primary">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Método de pago */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Método de pago</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod(PAYMENT_METHOD.CASH_ON_DELIVERY)}
              className={`flex items-center gap-3 border rounded-2xl p-3 text-left transition-colors ${
                paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY
                  ? 'border-primary bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Banknote className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-secondary">
                  Efectivo o datáfono al domiciliario
                </p>
                <p className="text-xs text-gray-400">Pagas al recibir tu pedido</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              />
            </button>

            <button
              type="button"
              disabled
              className="flex items-center gap-3 border border-gray-100 rounded-2xl p-3 text-left opacity-50 cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-400">Pagar en línea</p>
                <p className="text-xs text-gray-400">Tarjeta, PSE, Nequi — próximamente</p>
              </div>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <Input
            label="Dirección de entrega"
            placeholder="Ej: Cra 10 #100, Apto 501"
            value={formData.deliveryAddress}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instrucciones especiales
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50"
              placeholder="Ej: Sin picante, dejar en portería..."
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? 'Creando orden...' : 'Confirmar Pedido'}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center px-4">
          Tu orden será procesada inmediatamente. El restaurante y el domiciliario recibirán la notificación.
        </p>
      </div>
    </div>
  )
}

// Componente auxiliar: fila de producto en el resumen del checkout.
// Extraído aparte para que useProductById se llame de forma consistente
// (nunca dentro de un .map() en el componente padre).
const CheckoutItemRow = ({
  item,
}: {
  item: { productId: string; quantity: number; unitPrice: number }
}) => {
  const { product } = useProductById(item.productId)
  if (!product) return null

  return (
    <div className="flex justify-between text-sm text-gray-500">
      <span>
        {product.name} x{item.quantity}
      </span>
      <span className="font-semibold text-secondary">
        ${(product.price * item.quantity).toLocaleString('es-CO')}
      </span>
    </div>
  )
}
