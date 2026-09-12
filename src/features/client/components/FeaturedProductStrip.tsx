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
              className="relative w-[152px] flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => onOpenDetail(product)}
                className="focus-ring block w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="h-24 w-full overflow-hidden bg-gray-50">
                  <ProductImage imageUrl={product.image_url} alt={product.name} />
                </div>

                <div className="p-2.5 pr-12">
                  <p className="truncate font-display text-xs font-bold text-secondary">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-coral">
                    {formatCOP(product.price)}
                  </p>
                </div>
              </button>

              {canAdd && (
                <button
                  type="button"
                  onClick={() => onQuickAdd(product)}
                  aria-label={`Agregar ${product.name}`}
                  className="focus-ring absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md active:scale-90 transition-transform"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
