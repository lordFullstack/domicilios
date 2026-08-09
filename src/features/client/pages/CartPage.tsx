import { useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useLocalData'
import { useProductById } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/config/constants'

export const CartPage = () => {
  const navigate = useNavigate()
  const { cart, removeItem, updateQuantity, clear, getTotal } = useCart()

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-primary font-semibold mb-8">
            ← Atrás
          </button>

          <Card>
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🛒</p>
              <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">Agrega productos para ver tus artículos aquí</p>
              <Button onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>
                Ir a restaurantes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary font-semibold mb-8">
          ← Atrás
        </button>

        <h1 className="text-3xl font-bold mb-6">🛒 Mi Carrito</h1>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>

        {/* Resumen */}
        <Card className="mb-6">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          <Button 
            fullWidth 
            variant="primary" 
            size="lg" 
            className="mb-3"
            onClick={() => navigate(ROUTES.CLIENT_CHECKOUT)}
          >
            Proceder a Pagar
          </Button>
          <Button fullWidth variant="outline" onClick={() => clear()}>
            Limpiar Carrito
          </Button>
        </Card>

        <Button fullWidth variant="ghost" onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>
          Continuar Comprando
        </Button>
      </div>
    </div>
  )
}

// Componente auxiliar
const CartItem = ({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: any
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, qty: number) => void
}) => {
  const { product } = useProductById(item.productId)

  if (!product) return null

  return (
    <Card>
      <div className="flex gap-4">
        <div className="text-4xl">{product.image_url}</div>
        <div className="flex-1">
          <h3 className="font-bold mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3">${product.price.toLocaleString('es-CO')}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-gray-100 rounded p-1">
              <button
                onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                className="px-2 py-1 hover:bg-gray-200 rounded"
              >
                −
              </button>
              <span className="px-3 font-semibold">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                className="px-2 py-1 hover:bg-gray-200 rounded"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <p className="font-bold">
                ${(product.price * item.quantity).toLocaleString('es-CO')}
              </p>
              <button
                onClick={() => onRemove(item.productId)}
                className="text-sm text-danger hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
