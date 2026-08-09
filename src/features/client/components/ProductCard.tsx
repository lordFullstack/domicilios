import { useState } from 'react'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useCart } from '@/hooks/useLocalData'
import { Product } from '@/shared/types'

interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
}

export const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    const success = addItem(product.id, product.price, quantity)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleSelect = () => {
    onSelect?.(product)
  }

  return (
    <Card
      hoverable
      onClick={handleSelect}
      className={`overflow-hidden cursor-pointer transition-all ${
        !product.available ? 'opacity-50' : ''
      }`}
    >
      {/* Imagen del producto */}
      <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-5xl">
        {product.image_url}
      </div>

      {/* Contenido */}
      <div className="mt-3">
        {/* Nombre y precio */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 flex-1">{product.name}</h3>
          <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
            ${product.price.toLocaleString('es-CO')}
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

        {/* Controles */}
        {product.available ? (
          <div className="space-y-2">
            {/* Selector de cantidad */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(Math.max(1, quantity - 1))
                }}
                className="px-2 py-1 hover:bg-gray-200 rounded"
              >
                −
              </button>
              <span className="flex-1 text-center font-semibold">{quantity}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(quantity + 1)
                }}
                className="px-2 py-1 hover:bg-gray-200 rounded"
              >
                +
              </button>
            </div>

            {/* Botón agregar */}
            <Button
              fullWidth
              variant={added ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleAddToCart}
            >
              {added ? '✅ Agregado' : '🛒 Agregar'}
            </Button>
          </div>
        ) : (
          <Button fullWidth variant="outline" disabled size="sm">
            No disponible
          </Button>
        )}
      </div>
    </Card>
  )
}
