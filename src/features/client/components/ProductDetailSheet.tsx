import { useState, useEffect } from 'react'
import { Product } from '@/shared/types'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { ProductImage } from '@/shared/components/ProductImage'
import { QuantitySelector } from '@/shared/components/QuantitySelector'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'

interface ProductDetailSheetProps {
  product: Product | null
  open: boolean
  restaurantIsOpen: boolean
  onClose: () => void
  onAdd: (product: Product, quantity: number) => void
}

/**
 * El modelo `Product` real (ver shared/types) solo tiene: nombre, descripción,
 * precio, imagen, categoría y disponibilidad — no hay variants/modifiers/
 * addons en el backend. Por eso esta sheet solo personaliza cantidad; no se
 * inventó un sistema de tamaños/extras que no existe.
 */
export const ProductDetailSheet = ({
  product,
  open,
  restaurantIsOpen,
  onClose,
  onAdd,
}: ProductDetailSheetProps) => {
  const [quantity, setQuantity] = useState(1)

  // Reinicia la cantidad cada vez que se abre un producto nuevo.
  useEffect(() => {
    if (open) setQuantity(1)
  }, [open, product?.id])

  if (!product) return null

  const isUnavailable = !product.available
  const canAdd = !isUnavailable && restaurantIsOpen
  const total = product.price * quantity

  const ctaLabel = !restaurantIsOpen
    ? 'Restaurante cerrado'
    : isUnavailable
      ? 'Agotado'
      : `Agregar · ${formatCOP(total)}`

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div>
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center mb-4">
          <ProductImage
            imageUrl={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            emojiClassName="text-6xl"
          />
        </div>

        <h2 className="font-display font-bold text-lg text-secondary mb-1">{product.name}</h2>
        <p className="font-bold text-primary mb-3">{formatCOP(product.price)}</p>

        {product.description && (
          <p className="text-sm text-gray-500 mb-5">{product.description}</p>
        )}

        {isUnavailable && (
          <p className="text-sm font-semibold text-danger mb-4">
            Este producto está agotado por ahora.
          </p>
        )}
        {!restaurantIsOpen && !isUnavailable && (
          <p className="text-sm font-semibold text-danger mb-4">
            El restaurante está cerrado en este momento.
          </p>
        )}

        {canAdd && (
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-semibold text-secondary">Cantidad</span>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!canAdd}
          onClick={() => canAdd && onAdd(product, quantity)}
        >
          {ctaLabel}
        </Button>
      </div>
    </BottomSheet>
  )
}
