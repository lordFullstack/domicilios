import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const { navigateSpy, promos } = vi.hoisted(() => ({
  navigateSpy: vi.fn(),
  promos: { list: [{ id: 'pr1', title: 'Combo', subtitle: 'Hoy', image_url: null, restaurant_id: 'r1' }] as unknown[] },
}))

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => navigateSpy,
}))
vi.mock('@/shared/hooks/usePromotions', () => ({ usePromotions: () => ({ promotions: promos.list, loading: false }) }))
// RestaurantGrid arrastra hooks de Supabase; aquí solo importa el encabezado de la sección.
vi.mock('./RestaurantGrid', () => ({ RestaurantGrid: () => <ul data-testid="grid" /> }))

import { RestaurantsGrid } from './RestaurantsGrid'
import { FeaturedSection } from './FeaturedSection'
import type { Restaurant } from '@/shared/types'

// Fuentes crudas para las reglas de ritmo/títulos.
const raw = import.meta.glob<string>('/src/features/client/components/*.tsx', { query: '?raw', import: 'default', eager: true })
const src = (name: string) => raw[`/src/features/client/components/${name}.tsx`] as string

const restaurants = [{ id: 'r1', name: 'Asados' } as Restaurant]
const wrap = (ui: React.ReactNode) =>
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>)

describe('títulos de sección del Home (LOOP_VISUAL_09)', () => {
  it('RestaurantsGrid: h2 en text-lg font-display', () => {
    wrap(<RestaurantsGrid restaurants={restaurants} loading={false} error={null} onRetry={() => {}} />)
    const h2 = screen.getByRole('heading', { level: 2, name: 'Restaurantes cerca de ti' })
    expect(h2.className).toContain('text-lg')
    expect(h2.className).toContain('font-display')
    expect(h2.className).not.toContain('text-sm')
  })

  it.each(['carousel', 'promoGrid'] as const)('FeaturedSection %s: h2 en text-lg font-display', (variant) => {
    wrap(<FeaturedSection type="featured_product" title="Promos" variant={variant} />)
    const h2 = screen.getByRole('heading', { level: 2, name: 'Promos' })
    expect(h2.className).toContain('text-lg')
    expect(h2.className).toContain('font-display')
  })

  it('CategoryScroller: título de sección en text-lg font-display', () => {
    expect(src('CategoryScroller')).toMatch(/<h2 className="font-display text-lg font-bold[^"]*">Categorías/)
  })
})

describe('"Ver todo →" (LOOP_VISUAL_09)', () => {
  it('solo en Restaurantes cerca de ti: aria-label y navega a /app/restaurants', () => {
    wrap(<RestaurantsGrid restaurants={restaurants} loading={false} error={null} onRetry={() => {}} />)
    const btn = screen.getByRole('button', { name: 'Ver todos los restaurantes' })
    expect(btn).toHaveTextContent('Ver todo')
    fireEvent.click(btn)
    expect(navigateSpy).toHaveBeenCalledWith('/app/restaurants')
  })

  it('un solo CTA hacia Restaurantes: ya no existe el botón duplicado al final de la lista', () => {
    wrap(<RestaurantsGrid restaurants={restaurants} loading={false} error={null} onRetry={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.queryByText(/Riohacha/)).not.toBeInTheDocument()
    expect(src('RestaurantsGrid')).not.toContain('Ver todos los restaurantes de Riohacha')
  })

  it('no aparece mientras carga, con error ni sin restaurantes', () => {
    for (const props of [
      { restaurants: [], loading: true, error: null },
      { restaurants: [], loading: false, error: 'x' },
      { restaurants: [], loading: false, error: null },
    ]) {
      const { unmount } = wrap(<RestaurantsGrid {...props} onRetry={() => {}} />)
      expect(screen.queryByRole('button', { name: 'Ver todos los restaurantes' })).not.toBeInTheDocument()
      unmount()
    }
  })

  it('FeaturedSection conserva su "Ver todas >" interno y no gana un "Ver todo →"', () => {
    wrap(<FeaturedSection type="featured_product" title="Promos" variant="promoGrid" />)
    expect(screen.getByRole('button', { name: /Ver todas/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ver todo\b/ })).not.toBeInTheDocument()
    expect(src('FeaturedSection')).not.toContain('Ver todo →')
  })
})

describe('chevron de dirección (LOOP_VISUAL_09)', () => {
  it('queda el TODO(LOOP_CLIENT_06) y ningún aria-label de "cambiar dirección" en el código', () => {
    const header = src('HomeHeader')
    expect(header).toContain('TODO(LOOP_CLIENT_06)')
    expect(header).toMatch(/<ChevronDown[^>]*aria-hidden="true"/)
    expect(header).not.toMatch(/Cambiar dirección/i)
  })
})

describe('ritmo entre secciones (LOOP_VISUAL_09)', () => {
  const SECTIONS = ['SearchBar', 'HomeHeroBanner', 'CategoryScroller', 'ActiveOrderCard', 'PromoBanner', 'FeaturedSection']

  it.each(SECTIONS)('%s: separación entre secciones mayores de mb-8, sin mb-6 sueltos', (name) => {
    expect(src(name)).toContain('mb-8')
    expect(src(name)).not.toMatch(/\bmb-6\b/)
  })

  it('el título dentro de la sección se separa con mb-4', () => {
    expect(src('CategoryScroller')).toMatch(/text-secondary mb-4 px-5">Categorías/)
    expect(src('FeaturedSection')).toMatch(/mb-4/)
    expect(src('RestaurantsGrid')).toMatch(/mb-4 flex items-center justify-between/)
  })

  it('la insignia "Oferta" conserva coral y gana presencia (padding y sombra)', () => {
    const s = src('FeaturedSection')
    const badge = s.match(/<span className="([^"]*bg-coral[^"]*)"/)?.[1] ?? ''
    expect(badge).toContain('bg-coral')
    expect(badge).toContain('text-xs')
    expect(badge).toContain('px-3')
    expect(badge).toContain('shadow-sm')
  })
})
