import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, Star, Clock, Plus } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { ProductImage } from '@/shared/components/ProductImage'
import { useRestaurantById, useProducts, useCart } from '@/hooks/useLocalData'
import { ROUTES, PRODUCT_CATEGORIES } from '@/config/constants'

export const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { restaurant, loading: restaurantLoading } = useRestaurantById(id || '')
  const { products, loading: productsLoading } = useProducts(id)
  const { cart, addItem, getTotal } = useCart()

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const availableCategories = useMemo(
    () => PRODUCT_CATEGORIES.filter((cat) => products.some((p) => p.category === cat)),
    [products]
  )
  const [activeCategory, setActiveCategory] = useState<string>('')

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeCategory as any)) {
      setActiveCategory(availableCategories[0])
    }
  }, [availableCategories, activeCategory])

  const filteredProducts = products.filter((p) => p.category === activeCategory)

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando restaurante...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">Restaurante no encontrado</p>
          <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  // Un restaurante suspendido por Admin no debe poder recibir pedidos,
  // aunque el cliente tenga el link directo (favoritos, historial, etc.)
  if (!restaurant.approved) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-3">⛔</p>
          <p className="font-display font-bold text-secondary mb-1">Restaurante no disponible</p>
          <p className="text-gray-400 text-sm mb-4">
            Este restaurante está temporalmente suspendido y no puede recibir pedidos.
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-28 relative">
      {/* Hero */}
      <div className="h-40 bg-primary/10 relative overflow-hidden">
        {restaurant.cover_url ? (
          <>
            <img src={restaurant.cover_url} alt={restaurant.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {restaurant.image_url}
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-card"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
      </div>

      {/* Info */}
      <div className="px-5 pt-4">
        <h1 className="font-display text-xl font-bold text-secondary">{restaurant.name}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 mb-1">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {restaurant.rating_count > 0 ? restaurant.rating_avg : 'Nuevo'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            25-35 min
          </span>
          <span className={restaurant.status === 'open' ? 'text-green-600' : 'text-red-500'}>
            {restaurant.status === 'open' ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">{restaurant.description}</p>
      </div>

      {/* Menú */}
      <div className="px-5">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Menú</h2>

        {productsLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Cargando menú...</p>
        ) : products.length > 0 ? (
          <>
            {/* Pestañas de categoría */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-1 px-1 no-scrollbar">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center gap-3 border border-gray-100 rounded-2xl p-3 ${
                    !product.available ? 'opacity-50' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    <ProductImage imageUrl={product.image_url} alt={product.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 truncate">{product.description}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      ${product.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                  {product.available ? (
                    <button
                      onClick={() => addItem(product.id, product.price, 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-primary flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 flex-shrink-0">Agotado</span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No hay productos disponibles</p>
        )}
      </div>

      {/* Barra flotante de carrito */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate(ROUTES.CLIENT_CART)}
          className="fixed bottom-24 left-5 right-5 max-w-md mx-auto text-white rounded-full py-3 px-5 flex items-center justify-between shadow-lg active:scale-95 transition-transform bg-primary"
        >
          <span className="text-sm font-semibold">{cartCount} items en el carrito</span>
          <span className="text-sm font-bold">${getTotal().toLocaleString('es-CO')}</span>
        </button>
      )}
    </div>
  )
}
