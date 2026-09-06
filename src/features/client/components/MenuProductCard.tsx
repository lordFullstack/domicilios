import { Plus } from 'lucide-react'
import { Product } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { formatCOP } from '@/shared/utils/money'

interface MenuProductCardProps {
  product: Product
  restaurantIsOpen: boolean
  onOpenDetail: (product: Product) => void
  onQuickAdd: (product: Product) => void
}

export const MenuProductCard = ({
  product,
  restaurantIsOpen,
  onOpenDetail,
  onQuickAdd,
}: MenuProductCardProps) => {
  const canAdd = product.available && restaurantIsOpen

  return (
    <button
      onClick={() => onOpenDetail(product)}
      className={`focus-ring w-full flex items-center gap-3 border border-gray-100 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform ${
        !product.available ? 'opacity-50' : ''
      }`}
    >
      <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
        <ProductImage imageUrl={product.image_url} alt={product.name} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
        <p className="text-xs text-gray-500 truncate">{product.description}</p>
        <p className="text-sm font-bold text-primary mt-1">{formatCOP(product.price)}</p>
      </div>
      {canAdd ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Agregar ${product.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onQuickAdd(product)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation()
              onQuickAdd(product)
            }
          }}
          className="touch-target focus-ring w-9 h-9 rounded-full flex items-center justify-center text-white bg-primary flex-shrink-0 active:scale-90 transition-transform"
        >
          <Plus className="w-4 h-4" />
        </span>
      ) : (
        <span className="text-xs text-gray-500 flex-shrink-0">
          {!product.available ? 'Agotado' : 'Cerrado'}
        </span>
      )}
    </button>
  )
}
