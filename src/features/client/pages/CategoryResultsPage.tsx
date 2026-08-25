import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useProductsByCategory } from '@/hooks/useLocalData'
import { BottomNav } from '@/shared/components/BottomNav'
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
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-display text-xl font-bold text-secondary">
          {categoryInfo?.emoji} {categoryInfo?.label || 'Resultados'}
        </h1>
      </div>

      <div className="px-5">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Buscando productos...</p>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {items.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', product.restaurant.id))}
                className="flex items-center gap-3 text-left rounded-2xl border border-gray-100 shadow-card p-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 truncate">{product.restaurant.name}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    ${product.price.toLocaleString('es-CO')}
                  </p>
                </div>
                <span
                  className={`text-xs flex-shrink-0 ${
                    product.restaurant.status === 'open' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {product.restaurant.status === 'open' ? 'Abierto' : 'Cerrado'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">
            No hay productos de {categoryInfo?.label.toLowerCase()} disponibles todavía
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
