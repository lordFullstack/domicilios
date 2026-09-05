import { Plus } from 'lucide-react'

import { Product } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { formatCOP } from '@/shared/utils/money'

interface FeaturedProductStripProps {
  products: Product[]
  restaurantIsOpen: boolean
  onOpenDetail: (product: Product) => void
  onQuickAdd: (product: Product) => void
}

export const FeaturedProductStrip = ({
  products,
  restaurantIsOpen,
  onOpenDetail,
  onQuickAdd,
}: FeaturedProductStripProps) => {
  if (products.length === 0) return null

  return (
    <section className="mb-5" aria-labelledby="featured-products-title">
      <p
        id="featured-products-title"
        className="mb-2 font-display text-base font-bold text-secondary"
      >
        🔥 Recomendados
      </p>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {products.map((product) => {
          const canAdd = product.available && restaurantIsOpen

          return (
            <article
              key={product.id}
              className="w-[136px] flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => onOpenDetail(product)}
                className="focus-ring block w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="h-20 w-full overflow-hidden bg-gray-50">
                  <ProductImage imageUrl={product.image_url} alt={product.name} />
                </div>

                <div className="p-2">
                  <p className="truncate font-display text-xs font-bold text-secondary">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-primary">
                    {formatCOP(product.price)}
                  </p>
                </div>
              </button>

              {canAdd && (
                <div className="px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => onQuickAdd(product)}
                    className="focus-ring flex h-8 w-full items-center justify-center gap-1 rounded-full bg-primary text-xs font-semibold text-white active:scale-[0.98] transition-transform"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
