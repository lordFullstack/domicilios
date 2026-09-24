import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EMPTY_COPY, ERROR_COPY } from '@/shared/constants/stateCopy'
import { OfflineDataBadge } from '@/shared/components/OfflineDataBadge'
import { Toast } from '@/shared/components/Toast'
import { useRestaurantById, useProducts, useFavorites } from '@/hooks/useLocalData'
import { usePromotions } from '@/shared/hooks/usePromotions'
import { normalizeText } from '@/shared/utils/format'
import { ROUTES, PRODUCT_CATEGORIES } from '@/config/constants'
import { Product } from '@/shared/types'
import { RestaurantDetailSkeleton, MenuListSkeleton } from '../components/RestaurantDetailSkeleton'
import { RestaurantHero } from '../components/RestaurantHero'
import { RestaurantCompactHeader } from '../components/RestaurantCompactHeader'
import { RestaurantClosedBanner } from '../components/RestaurantClosedBanner'
import { MenuCategoryNav } from '../components/MenuCategoryNav'
import { MenuSection } from '../components/MenuSection'
import { MenuProductCard } from '../components/MenuProductCard'
import { FeaturedProductStrip } from '../components/FeaturedProductStrip'
import { ProductDetailSheet } from '../components/ProductDetailSheet'
import { CartSwitchSheet } from '../components/CartSwitchSheet'
import { CartFloatingBar } from '../components/CartFloatingBar'
import { useMenuCart } from '../hooks/useMenuCart'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useStickyHeader } from '../hooks/useStickyHeader'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'

const MAX_FEATURED = 6
// Header compacto (3.5rem) + chips (~3.5rem) + aire; en px para el observer.
const SPY_TOP_OFFSET = 120

const FullScreen = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white max-w-md mx-auto safe-left safe-right flex items-center justify-center px-6">
    {children}
  </div>
)

export const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const reducedMotion = usePrefersReducedMotion()

  const restaurantQuery = useRestaurantById(id || '')
  const { restaurant } = restaurantQuery
  const productsQuery = useProducts(id)
  const { products } = productsQuery
  const { promotions } = usePromotions('featured_product')
  const { isFavorite, toggleFavorite } = useFavorites()
  const [favPending, setFavPending] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null)

  const showToast = (message: string, error = false) => {
    setToast({ message, error })
    setTimeout(() => setToast(null), 2000)
  }

  const menuCart = useMenuCart(restaurant, (product) => showToast(`${product.name} agregado al carrito`))
  const { sentinelRef, compact } = useStickyHeader()

  // Todas las categorías con productos, en el orden de PRODUCT_CATEGORIES.
  const sections = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((cat) => ({
        id: `menu-${normalizeText(cat)}`,
        label: cat as string,
        items: products.filter((p) => p.category === cat),
      })).filter((s) => s.items.length > 0),
    [products]
  )
  const menuReady = !restaurantQuery.loading && !productsQuery.loading && !!restaurant
  const { activeId, select } = useScrollSpy(sections.map((s) => s.id), SPY_TOP_OFFSET, menuReady)

  // Recomendados = productos destacados por el Admin que son de este restaurante.
  const featured = useMemo(() => {
    const ids = new Set(promotions.filter((p) => p.active && p.product_id).map((p) => p.product_id))
    return products.filter((p) => ids.has(p.id)).slice(0, MAX_FEATURED)
  }, [promotions, products])

  const goToSection = (sectionId: string) => {
    select(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const handleToggleFavorite = async () => {
    if (!restaurant || favPending) return
    setFavPending(true)
    const ok = await toggleFavorite(restaurant.id)
    setFavPending(false)
    if (!ok) showToast('No pudimos guardar tu favorito', true)
  }

  if (restaurantQuery.loading) return <RestaurantDetailSkeleton />

  // Error real de carga (sin internet y sin caché) — distinto de "no existe".
  if (!restaurant && restaurantQuery.error) {
    return (
      <FullScreen>
        <ErrorState
          illustration={ERROR_COPY.restaurantLoad.illustration}
          title={ERROR_COPY.restaurantLoad.title}
          description={ERROR_COPY.restaurantLoad.description}
          action={<Button variant="gradient" onClick={restaurantQuery.reload}>{ERROR_COPY.restaurantLoad.cta}</Button>}
        />
      </FullScreen>
    )
  }

  if (!restaurant) {
    return (
      <FullScreen>
        <ErrorState
          illustration={ERROR_COPY.restaurantNotFound.illustration}
          title={ERROR_COPY.restaurantNotFound.title}
          description={ERROR_COPY.restaurantNotFound.description}
          action={
            <div className="flex flex-col gap-2">
              <Button variant="gradient" onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>{ERROR_COPY.restaurantNotFound.cta}</Button>
              <Button variant="ghost" onClick={() => navigate(ROUTES.CLIENT_HOME)}>
                Volver al inicio
              </Button>
            </div>
          }
        />
      </FullScreen>
    )
  }

  // Un restaurante suspendido por Admin no debe poder recibir pedidos,
  // aunque el cliente tenga el link directo (favoritos, historial, etc.)
  if (!restaurant.approved) {
    return (
      <FullScreen>
        <ErrorState
          illustration={ERROR_COPY.restaurantUnavailable.illustration}
          title={ERROR_COPY.restaurantUnavailable.title}
          description={ERROR_COPY.restaurantUnavailable.description}
          action={<Button variant="gradient" onClick={() => navigate(ROUTES.CLIENT_HOME)}>{ERROR_COPY.restaurantUnavailable.cta}</Button>}
        />
      </FullScreen>
    )
  }

  const isOpen = restaurant.status === 'open'
  const cardProps = {
    restaurantIsOpen: isOpen,
    onOpenDetail: setDetailProduct,
    onAdd: (p: Product) => menuCart.add(p),
  }

  const renderMenu = () => {
    if (productsQuery.loading) return <MenuListSkeleton />
    if (productsQuery.error && products.length === 0) {
      return (
        <ErrorState
          illustration={ERROR_COPY.menuLoad.illustration}
          title={ERROR_COPY.menuLoad.title}
          description={ERROR_COPY.menuLoad.description}
          retryLabel={ERROR_COPY.menuLoad.cta}
          onRetry={productsQuery.reload}
        />
      )
    }
    if (products.length === 0) {
      return (
        <EmptyState
          illustration={EMPTY_COPY.emptyMenu.illustration}
          title={EMPTY_COPY.emptyMenu.title}
          description={EMPTY_COPY.emptyMenu.description}
          action={<Button variant="tertiary" onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}>{EMPTY_COPY.emptyMenu.cta}</Button>}
        />
      )
    }
    return (
      <>
        <MenuCategoryNav categories={sections} activeId={activeId} onSelect={goToSection} />
        <FeaturedProductStrip products={featured} getQuantity={menuCart.getQuantity} {...cardProps} />
        {sections.map((section) => (
          <MenuSection key={section.id} id={section.id} title={section.label}>
            {section.items.map((product) => (
              <MenuProductCard
                key={product.id}
                product={product}
                quantity={menuCart.getQuantity(product.id)}
                onDecrement={menuCart.decrement}
                {...cardProps}
              />
            ))}
          </MenuSection>
        ))}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-44 relative safe-left safe-right">
      <Toast message={toast?.message ?? null} variant={toast?.error ? 'error' : 'success'} />
      <RestaurantCompactHeader restaurant={restaurant} visible={compact} onBack={() => navigate(-1)} />

      <RestaurantHero
        restaurant={restaurant}
        isOpen={isOpen}
        isFavorite={isFavorite(restaurant.id)}
        favPending={favPending}
        onBack={() => navigate(-1)}
        onToggleFavorite={handleToggleFavorite}
      />
      {/* Sentinela: cuando sale por arriba, aparece el header compacto. */}
      <div ref={sentinelRef} aria-hidden="true" />

      {restaurant.description && (
        <p className="px-5 pt-3 text-sm text-gray-500 line-clamp-2">{restaurant.description}</p>
      )}
      {!isOpen && <RestaurantClosedBanner />}
      {(restaurantQuery.fromCache || productsQuery.fromCache) && (
        <div className="px-5 pt-3">
          <OfflineDataBadge
            cachedAt={Math.max(restaurantQuery.cachedAt || 0, productsQuery.cachedAt || 0) || null}
          />
        </div>
      )}

      <div className="px-5 pt-4">{renderMenu()}</div>

      <ProductDetailSheet
        product={detailProduct}
        open={!!detailProduct}
        restaurantIsOpen={isOpen}
        onClose={() => setDetailProduct(null)}
        onAdd={(product, quantity) => {
          setDetailProduct(null)
          menuCart.add(product, quantity)
        }}
      />
      <CartFloatingBar />
      <CartSwitchSheet
        open={menuCart.switchPending}
        onCancel={menuCart.cancelSwitch}
        onConfirm={menuCart.confirmSwitch}
      />
    </div>
  )
}
