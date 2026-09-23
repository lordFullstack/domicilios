import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { name: 'jose' }, logout: vi.fn() }) }))
vi.mock('@/shared/hooks/useCartContext', () => ({ useCartContext: () => ({ cart: [{ productId: 'p', quantity: 2, unitPrice: 1 }], getTotal: () => 2 }) }))
vi.mock('@/hooks/useLocalData', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 0, markAsRead: vi.fn(), markAllAsRead: vi.fn() }),
}))

import { BottomNav } from '@/shared/components/BottomNav'
import { CategoryScroller } from './components/CategoryScroller'
import { ExploreFilterChips } from './components/ExploreFilterChips'
import { HomeHeader } from './components/HomeHeader'
import { ConnectionBanner } from '@/shared/components/ConnectionBanner'
import { DEFAULT_FILTERS } from './utils/filters'

// Emojis usados como ÍCONOS de UI (no cuenta 👋 del saludo, que es copy).
const UI_EMOJI = /[🍕🍔🍣🍰🥤🍗🦐🟢🔴🟡🔔📍😕🛵🏪🍽🛒✅✓]/u
const router = (ui: React.ReactNode, path = '/app/home') => (
  <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    {ui}
  </MemoryRouter>
)

describe('Iconografía propia en el cliente', () => {
  it('BottomNav: íconos propios y gota en la pestaña activa', () => {
    const { container } = render(router(<BottomNav />))
    expect(container.querySelectorAll('svg[data-icon]').length).toBe(5)
    const active = screen.getByRole('button', { name: 'Inicio' })
    expect(active).toHaveAttribute('aria-current', 'page')
    expect(active.querySelector('.rounded-drop')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Carrito, 2 productos' }).querySelector('.rounded-drop')).toBeNull()
  })

  it('CategoryScroller: cada categoría en su gota de color', () => {
    const { container } = render(router(<CategoryScroller />))
    const drops = container.querySelectorAll('.rounded-drop')
    expect(drops.length).toBe(7)
    drops.forEach((d) => expect(d.className).toMatch(/bg-category-/))
    expect(container.textContent).not.toMatch(UI_EMOJI)
  })

  it('Chips de filtro sin emojis', () => {
    const { container } = render(<ExploreFilterChips filters={DEFAULT_FILTERS} onChange={vi.fn()} onOpenSheet={vi.fn()} />)
    expect(container.textContent).not.toMatch(UI_EMOJI)
    expect(container.querySelector('svg[data-icon="grill"]')).not.toBeNull()
  })

  it('Header del Home: cohete en gota y ubicación con ícono propio', () => {
    const { container } = render(router(<HomeHeader />))
    expect(container.querySelector('svg[data-icon="rocket"]')).not.toBeNull()
    expect(container.querySelector('svg[data-icon="pin"]')).not.toBeNull()
    expect(container.querySelector('svg[data-icon="bell"]')).not.toBeNull()
  })

  it('Banner de conexión sin emojis', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { container } = render(<ConnectionBanner />)
    expect(container.textContent).toMatch(/Sin conexión/)
    expect(container.textContent).not.toMatch(UI_EMOJI)
    spy.mockRestore()
  })
})
