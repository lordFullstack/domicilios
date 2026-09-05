import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, Heart, AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { OfflineDataBadge } from '@/shared/components/OfflineDataBadge'
import { Toast } from '@/shared/components/Toast'
import { BottomSheet } from '@/shared/components/BottomSheet'
import {
  useRestaurantById,
  useProducts,
  useCart,
  useFavorites,
  useProductById,
} from '@/hooks/useLocalData'
import { ROUTES, PRODUCT_CATEGORIES } from '@/config/constants'
import { Product } from '@/shared/types'
import { RestaurantDetailSkeleton } from '../components/RestaurantDetailSkeleton'
import { MenuProductCard } from '../components/MenuProductCard'
import { ProductDetailSheet } from '../components/ProductDetailSheet'
import { CartFloatingBar } from '../components/CartFloatingBar'

export const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
    fromCache: restaurantFromCache,
    cachedAt: restaurantCachedAt,
  } = useRestaurantById(id || '')
  const {
    products,
    loading: productsLoading,
    fromCache: productsFromCache,
    cachedAt: productsCachedAt,
  } = useProducts(id)
  const { cart, addItem, clear } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [favPending, setFavPending] = useState(false)

  // El carrito no guarda restaurant_id por ítem (ver CheckoutPage, que usa
  // el mismo truco): se infiere mirando a qué restaurante pertenece el
  // primer producto que ya está en el carrito.
  const { product: firstCartProduct } = useProductById(cart[0]?.productId || '')
  const cartRestaurantId = cart.length > 0 ? firstCartProduct?.restaurant_id : undefined

  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [pendingAdd, setPendingAdd] = useState<{ product: Product; quantity: number } | null>(null)
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 2000)
  }

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
  const restaurantIsOpen = restaurant?.status === 'open'

  const actuallyAdd = (product: Product, quantity: number) => {
    addItem(product.id, product.price, quantity)
    setDetailProduct(null)
    showToast(`✓ ${product.name} agregado al carrito`)
  }

  const handleAdd = (product: Product, quantity: number) => {
    if (cartRestaurantId && restaurant && cartRestaurantId !== restaurant.id) {
      setPendingAdd({ product, quantity })
      setDetailProduct(null)
      setSwitchConfirmOpen(true)
      return
    }
    actuallyAdd(product, quantity)
  }

  const handleQuickAdd = (product: Product) => handleAdd(product, 1)

  const confirmSwitch = () => {
    clear()
    if (pendingAdd) actuallyAdd(pendingAdd.product, pendingAdd.quantity)
    setPendingAdd(null)
    setSwitchConfirmOpen(false)
  }

  const cancelSwitch = () => {
    setPendingAdd(null)
    setSwitchConfirmOpen(false)
  }

  const handleToggleFavorite = async () => {
    if (!restaurant || favPending) return
    setFavPending(true)
    await toggleFavorite(restaurant.id)
    setFavPending(false)
  }

  if (restaurantLoading) {
    return <RestaurantDetailSkeleton />
  }

  // Error real de carga (sin internet y sin caché) — distinto de "no existe".
  if (!restaurant && restaurantError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <EmptyState
          icon={AlertTriangle}
          title="No pudimos cargar este restaurante"
          description="Revisa tu conexión e intenta de nuevo."
          action={<Button onClick={() => window.location.reload()}>Intentar nuevamente</Button>}
        />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Restaurante no encontrado</p>
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
          <p className="text-gray-500 text-sm mb-4">
            Este restaurante está temporalmente suspendido y no puede recibir pedidos.
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT_HOME)}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-28 relative safe-left safe-right">
      <Toast message={toastMessage} />

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
          aria-label="Volver"
          className="touch-target focus-ring absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <button
          onClick={handleToggleFavorite}
          disabled={favPending}
          aria-label={isFavorite(restaurant.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="touch-target focus-ring absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"
        >
          <Heart
            className="w-4 h-4"
            fill={isFavorite(restaurant.id) ? '#E11D48' : 'none'}
            color={isFavorite(restaurant.id) ? '#E11D48' : '#1A1A1A'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="px-5 pt-4">
        <h1 className="font-display text-xl font-bold text-secondary">{restaurant.name}</h1>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mb-1">
          <span>⭐ {restaurant.rating_count > 0 ? restaurant.rating_avg.toFixed(1) : 'Nuevo'}</span>
          <span>· 25-35 min</span>
          <span>· {restaurant.category}</span>
        </div>
        <div className="mb-2">
          <Badge variant={restaurantIsOpen ? 'success' : 'danger'}>
            {restaurantIsOpen ? '🟢 Abierto' : '🔴 Cerrado'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mb-4">{restaurant.description}</p>
        {(restaurantFromCache || productsFromCache) && (
          <OfflineDataBadge cachedAt={Math.max(restaurantCachedAt || 0, productsCachedAt || 0) || null} />
        )}
      </div>

      {/* Menú */}
      <div className="px-5">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Menú</h2>

        {productsLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Pestañas de categoría */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-1 px-1 no-scrollbar">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`focus-ring flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${
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
                <MenuProductCard
                  key={product.id}
                  product={product}
                  restaurantIsOpen={restaurantIsOpen}
                  onOpenDetail={setDetailProduct}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="Sin productos disponibles"
            description="Este restaurante todavía no tiene productos disponibles."
          />
        )}
      </div>

      <ProductDetailSheet
        product={detailProduct}
        open={!!detailProduct}
        restaurantIsOpen={restaurantIsOpen}
        onClose={() => setDetailProduct(null)}
        onAdd={handleAdd}
      />

      <CartFloatingBar />

      {/* Confirmación al mezclar productos de otro restaurante — el carrito
          actual (ver useCart) solo soporta un restaurante a la vez. */}
      <BottomSheet open={switchConfirmOpen} onClose={cancelSwitch} title="¿Cambiar de restaurante?">
        <p className="text-sm text-gray-500 mb-5">
          Tu carrito tiene productos de otro restaurante. Si continúas, vamos a vaciarlo y agregar
          este producto en su lugar.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={cancelSwitch} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={confirmSwitch} className="flex-1">
            Vaciar y agregar
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
