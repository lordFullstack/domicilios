import { useMemo } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRestaurants, useOrders } from '@/hooks/useLocalData'
import { AppShell } from '@/shared/components/AppShell'
import { BottomNav } from '@/shared/components/BottomNav'
import { HomeHeader } from '../components/HomeHeader'
import { SearchBar } from '../components/SearchBar'
import { HomeHeroBanner } from '../components/HomeHeroBanner'
import { CategoryScroller } from '../components/CategoryScroller'
import { PromoBanner } from '../components/PromoBanner'
import { FeaturedSection } from '../components/FeaturedSection'
import { RestaurantsGrid } from '../components/RestaurantsGrid'
import { ActiveOrderCard } from '../components/ActiveOrderCard'
import { CartFloatingBar } from '../components/CartFloatingBar'
import { ORDER_STATUS } from '@/config/constants'

const TERMINAL_STATUSES: string[] = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]

export const ClientDashboardPage = () => {
  const { user } = useAuth()
  const { restaurants, loading, error, reload } = useRestaurants({ approvedOnly: true })
  const { orders } = useOrders(user?.id)

  // El pedido activo más reciente (si existe). `orders` ya viene ordenado
  // por created_at descendente desde useOrders, así que el primero que no
  // esté en un estado terminal es el que se muestra.
  const activeOrder = useMemo(
    () => orders.find((o) => !TERMINAL_STATUSES.includes(o.status)),
    [orders]
  )

  return (
    <AppShell>
      {/* Home adaptativo: con un pedido en curso, ese pedido es el protagonista
          (va arriba) y se omiten el saludo visible y el hero para no competir
          con él; el h1 sigue existiendo, solo para lectores de pantalla. */}
      <HomeHeader showGreeting={!activeOrder} />
      {activeOrder && <ActiveOrderCard order={activeOrder} />}
      <SearchBar />
      {!activeOrder && <HomeHeroBanner />}
      <CategoryScroller />

      <PromoBanner />
      <FeaturedSection type="featured_product" title="Platos que te pueden gustar" variant="promoGrid" />
      <FeaturedSection type="featured_restaurant" title="Recomendados para ti" />

      <RestaurantsGrid
        restaurants={restaurants}
        loading={loading}
        error={error}
        onRetry={reload}
      />

      <CartFloatingBar />
      <BottomNav />
    </AppShell>
  )
}
