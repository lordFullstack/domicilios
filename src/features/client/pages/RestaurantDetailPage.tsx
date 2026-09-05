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
import { FeaturedProductStrip } from '../components/FeaturedProductStrip'
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
  const { cart, addItem, removeItem, updateQuantity, clear } = useCart()
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

  // No presentamos esto como "los más vendidos": el modelo actual no
  // tiene una métrica de ventas. Por eso la etiqueta visual es "Recomendados".
  const featuredProducts = useMemo(
    () => products.filter((product) => product.available).slice(0, 3),
    [products]
  )

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

  const getProductQuantity = (productId: string) =>
    cart.find((item) => item.productId === productId)?.quantity ?? 0

  const handleIncrement = (product: Product) => {
    handleAdd(product, 1)
  }

  const handleDecrement = (product: Product) => {
    const currentQuantity = getProductQuantity(product.id)

    if (currentQuantity <= 1) {
      removeItem(product.id)
      return
    }

    updateQuantity(product.id, currentQuantity - 1)
  }

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

      {/* Hero — la info del restaurante vive integrada al banner (overlay),
          no repetida debajo (spec LOOP_MENU_UX_01.1). */}
      <div className="relative h-64 overflow-hidden bg-primary/10">
        {restaurant.cover_url ? (
          <img
            src={restaurant.cover_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            {restaurant.image_url}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

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

        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end gap-3">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/70 bg-white flex items-center justify-center text-3xl shadow-md">
              {restaurant.cover_url ? (
                <img src={restaurant.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                restaurant.image_url
              )}
            </div>
            <div className="min-w-0 flex-1 pb-0.5">
              <h1 className="font-display text-xl font-bold text-white truncate drop-shadow">
                {restaurant.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/90">
                <span>⭐ {restaurant.rating_count > 0 ? restaurant.rating_avg.toFixed(1) : 'Nuevo'}</span>
                <span>· 25-35 min</span>
                <span>· {restaurant.category}</span>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Badge variant={restaurantIsOpen ? 'success' : 'danger'}>
              {restaurantIsOpen ? '🟢 Abierto' : '🔴 Cerrado'}
            </Badge>
          </div>

          <p className="mt-2 text-xs text-white/85 line-clamp-2">{restaurant.description}</p>
        </div>
      </div>

      {(restaurantFromCache || productsFromCache) && (
        <div className="px-5 pt-3">
          <OfflineDataBadge cachedAt={Math.max(restaurantCachedAt || 0, productsCachedAt || 0) || null} />
        </div>
      )}

      {/* Menú */}
      <div className="px-5 pt-4">
        <h2 className="font-display text-lg font-bold text-secondary mb-3">
          Menú
        </h2>

        {productsLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Categorías */}
            <div className="sticky top-0 z-20 -mx-5 mb-5 bg-white/95 px-5 py-2 backdrop-blur">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`focus-ring min-h-10 flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recomendados */}
            <FeaturedProductStrip
              products={featuredProducts}
              restaurantIsOpen={restaurantIsOpen}
              onOpenDetail={setDetailProduct}
              onQuickAdd={handleQuickAdd}
            />

            {/* Productos */}
            <section aria-labelledby="active-category-title">
              <h3
                id="active-category-title"
                className="mb-3 font-display text-base font-bold text-secondary"
              >
                {activeCategory}
              </h3>

              <div className="flex flex-col gap-3">
                {filteredProducts.map((product) => (
                  <MenuProductCard
                    key={product.id}
                    product={product}
                    restaurantIsOpen={restaurantIsOpen}
                    quantity={getProductQuantity(product.id)}
                    onOpenDetail={setDetailProduct}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                  />
                ))}
              </div>
            </section>
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
