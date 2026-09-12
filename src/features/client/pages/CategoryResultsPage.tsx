import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, UtensilsCrossed } from 'lucide-react'
import { useProductsByCategory } from '@/hooks/useLocalData'
import { AppShell } from '@/shared/components/AppShell'
import { BottomNav } from '@/shared/components/BottomNav'
import { Skeleton } from '@/shared/components/Skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { ROUTES, RESTAURANT_CATEGORIES } from '@/config/constants'

// Resultado de tocar un botón de categoría (🍕 Pizza, 🍔 Burgers, etc.) en el
// home del cliente. Es una búsqueda rápida por palabra clave: no filtra
// restaurantes primero, muestra directamente los productos que coinciden,
// cada uno con el nombre del restaurante al que pertenece — así funciona
// igual con un solo restaurante hoy y escala cuando haya varios.
export const CategoryResultsPage = () => {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const { items, loading } = useProductsByCategory(category || '')

  const categoryInfo = RESTAURANT_CATEGORIES.find((c) => c.value === category)

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          aria-label="Volver al inicio"
          className="touch-target focus-ring w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-display text-xl font-bold text-secondary">
          {categoryInfo?.emoji} {categoryInfo?.label || 'Resultados'}
        </h1>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                <Skeleton className="w-16 h-16 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {items.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', product.restaurant.id))}
                className="focus-ring flex items-center gap-3 text-left rounded-2xl border border-gray-100 shadow-card p-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 truncate">{product.restaurant.name}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    ${product.price.toLocaleString('es-CO')}
                  </p>
                </div>
                <span
                  className={`text-xs flex-shrink-0 ${
                    product.restaurant.status === 'open' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {product.restaurant.status === 'open' ? 'Abierto' : 'Cerrado'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="No encontramos productos"
            description={`Todavía no hay productos de ${categoryInfo?.label.toLowerCase() || 'esta categoría'} disponibles.`}
          />
        )}
      </div>

      <BottomNav />
    </AppShell>
  )
}

