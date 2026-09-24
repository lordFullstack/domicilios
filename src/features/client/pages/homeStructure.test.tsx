import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import type { Order } from '@/shared/types'

// Estructura del Home (LOOP_VISUAL_09): cada hijo se sustituye por un marcador
// para comprobar ORDEN y variante (con / sin pedido activo), no su contenido.
const { state } = vi.hoisted(() => ({ state: { orders: [] as Partial<Order>[] } }))

vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('@/hooks/useLocalData', () => ({
  useRestaurants: () => ({ restaurants: [], loading: false, error: null, reload: vi.fn() }),
  useOrders: () => ({ orders: state.orders }),
}))
vi.mock('@/shared/components/AppShell', () => ({ AppShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }))
vi.mock('@/shared/components/BottomNav', () => ({ BottomNav: () => <nav data-testid="bottom-nav" /> }))
vi.mock('../components/CartFloatingBar', () => ({ CartFloatingBar: () => <div data-testid="cart-bar" /> }))
vi.mock('../components/HomeHeader', () => ({
  HomeHeader: ({ showGreeting = true }: { showGreeting?: boolean }) => (
    <header data-testid="header" data-greeting={String(showGreeting)}>
      {showGreeting ? <h1>Saludo</h1> : <h1 className="sr-only">Inicio</h1>}
    </header>
  ),
}))
vi.mock('../components/SearchBar', () => ({ SearchBar: () => <div data-testid="search" /> }))
vi.mock('../components/HomeHeroBanner', () => ({ HomeHeroBanner: () => <div data-testid="hero" /> }))
vi.mock('../components/CategoryScroller', () => ({ CategoryScroller: () => <div data-testid="categories" /> }))
vi.mock('../components/ActiveOrderCard', () => ({ ActiveOrderCard: () => <div data-testid="active-order" /> }))
vi.mock('../components/PromoBanner', () => ({ PromoBanner: () => <div data-testid="promo-banner" /> }))
vi.mock('../components/FeaturedSection', () => ({
  FeaturedSection: ({ type }: { type: string }) => <div data-testid={`featured-${type}`} />,
}))
vi.mock('../components/RestaurantsGrid', () => ({ RestaurantsGrid: () => <div data-testid="restaurants" /> }))

import { ClientDashboardPage } from './ClientDashboardPage'

const order = (status: string): Partial<Order> => ({ id: `o-${status}`, status: status as Order['status'] })

const order_of = () =>
  Array.from(render(<ClientDashboardPage />).container.querySelectorAll('[data-testid]')).map((n) =>
    n.getAttribute('data-testid')
  )

describe('ClientDashboardPage (LOOP_VISUAL_09)', () => {
  beforeEach(() => {
    state.orders = []
  })

  it('SIN pedido activo: header → búsqueda → hero → categorías → promos → restaurantes', () => {
    expect(order_of()).toEqual([
      'header',
      'search',
      'hero',
      'categories',
      'promo-banner',
      'featured-featured_product',
      'featured-featured_restaurant',
      'restaurants',
      'cart-bar',
      'bottom-nav',
    ])
  })

  it('SIN pedido activo: el saludo es visible (showGreeting=true) y el h1 no es sr-only', () => {
    const { container } = render(<ClientDashboardPage />)
    expect(container.querySelector('[data-testid="header"]')).toHaveAttribute('data-greeting', 'true')
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('h1')).not.toHaveClass('sr-only')
  })

  it('CON pedido activo: el pedido va justo después del header, antes de la búsqueda, y no hay hero', () => {
    state.orders = [order('preparing')]
    expect(order_of()).toEqual([
      'header',
      'active-order',
      'search',
      'categories',
      'promo-banner',
      'featured-featured_product',
      'featured-featured_restaurant',
      'restaurants',
      'cart-bar',
      'bottom-nav',
    ])
  })

  it('CON pedido activo: showGreeting=false y un único h1 sr-only "Inicio"', () => {
    state.orders = [order('in_delivery')]
    const { container } = render(<ClientDashboardPage />)
    expect(container.querySelector('[data-testid="header"]')).toHaveAttribute('data-greeting', 'false')
    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveClass('sr-only')
    expect(h1s[0]).toHaveTextContent('Inicio')
  })

  it.each(['delivered', 'cancelled'])('un pedido %s (estado terminal) NO cuenta como activo', (status) => {
    state.orders = [order(status)]
    const ids = order_of()
    expect(ids).not.toContain('active-order')
    expect(ids).toContain('hero')
  })

  it('usa el pedido no terminal más reciente aunque haya terminales antes', () => {
    state.orders = [order('delivered'), order('pending')]
    expect(order_of()).toContain('active-order')
  })

  it('las promos siempre van antes de "Restaurantes cerca de ti"', () => {
    for (const orders of [[], [order('confirmed')]]) {
      state.orders = orders
      const ids = order_of()
      expect(ids.indexOf('promo-banner')).toBeLessThan(ids.indexOf('restaurants'))
      expect(ids.indexOf('featured-featured_restaurant')).toBeLessThan(ids.indexOf('restaurants'))
    }
  })
})
