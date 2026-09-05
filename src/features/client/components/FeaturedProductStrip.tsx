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
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p
            id="featured-products-title"
            className="font-display text-base font-bold text-secondary"
          >
            🔥 Recomendados
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Opciones para decidir más rápido
          </p>
        </div>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {products.map((product) => {
          const canAdd = product.available && restaurantIsOpen

          return (
            <article
              key={product.id}
              className="w-[156px] flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => onOpenDetail(product)}
                className="focus-ring block w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="h-28 w-full overflow-hidden bg-gray-50">
                  <ProductImage imageUrl={product.image_url} alt={product.name} />
                </div>

                <div className="p-3">
                  <p className="truncate font-display text-sm font-bold text-secondary">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {formatCOP(product.price)}
                  </p>
                </div>
              </button>

              {canAdd && (
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={() => onQuickAdd(product)}
                    className="focus-ring flex h-9 w-full items-center justify-center gap-1 rounded-full bg-primary text-sm font-semibold text-white active:scale-[0.98] transition-transform"
                  >
                    <Plus className="h-4 w-4" />
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
