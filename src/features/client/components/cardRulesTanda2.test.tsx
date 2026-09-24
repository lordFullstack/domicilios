import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Order } from '@/shared/types'

const { navigateSpy, promos } = vi.hoisted(() => ({
  navigateSpy: vi.fn(),
  promos: {
    list: [{ id: 'pr1', title: 'Combo', subtitle: 'Hoy', image_url: null, restaurant_id: 'r1' }] as unknown[],
  },
}))

vi.mock('@/hooks/useLocalData', () => ({
  useRestaurantById: () => ({ restaurant: { name: 'Asados', image_url: null } }),
}))
vi.mock('@/shared/hooks/usePromotions', () => ({
  usePromotions: () => ({ promotions: promos.list, loading: false }),
}))
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => navigateSpy,
}))

import { OrderCard } from './OrderCard'
import { ActiveOrderCard } from './ActiveOrderCard'
import { FeaturedSection } from './FeaturedSection'
import { PromoBanner } from './PromoBanner'
import { ProductImage } from '@/shared/components/ProductImage'

const order = {
  id: 'abcdef1234567890', restaurant_id: 'r1', status: 'pending', total: 68000,
  delivery_address: 'Calle 23-7', delivery_person_id: null, created_at: '2026-09-22T12:32:00Z',
} as unknown as Order

const wrap = (ui: React.ReactNode) =>
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>)

describe('OrderCard (LOOP_VISUAL_10)', () => {
  it('usa card-surface, rounded-3xl, y ID/fecha y total con tabular-nums', () => {
    const { container } = wrap(<OrderCard order={order} onClick={() => {}} />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('card-surface')
    expect(card.className).toContain('rounded-3xl')
    expect(screen.getByText(/#ABCDEF12/).className).toContain('tabular-nums')
    expect(screen.getByText('$68.000').className).toContain('tabular-nums')
    expect(screen.getByText('Pendiente')).toBeInTheDocument() // estado con texto, no solo color
  })
})

describe('ActiveOrderCard (LOOP_VISUAL_10)', () => {
  it('es un <button> nativo (no div role=button) y abre el pedido', () => {
    const { container } = wrap(<ActiveOrderCard order={order} />)
    expect(container.querySelector('[role="button"]')).toBeNull()
    fireEvent.click(screen.getByRole('button'))
    expect(navigateSpy).toHaveBeenCalledWith('/app/order/abcdef1234567890')
  })
})

describe('Promos (LOOP_VISUAL_10)', () => {
  it.each(['carousel', 'promoGrid'] as const)('FeaturedSection %s: card-surface, rounded-3xl y sin div/p dentro del botón', (variant) => {
    const { container } = wrap(<FeaturedSection type="featured_product" title="Promos" variant={variant} />)
    const card = container.querySelector('button.card-surface') as HTMLElement
    expect(card).not.toBeNull()
    expect(card.className).toContain('rounded-3xl')
    expect(card.querySelector('div, p')).toBeNull()
  })

  it('PromoBanner usa card-surface y rounded-3xl', () => {
    promos.list = [{ id: 'b1', title: 'Envío gratis', subtitle: '', image_url: null, restaurant_id: 'r1' }]
    const { container } = wrap(<PromoBanner />)
    const btn = container.querySelector('button.card-surface') as HTMLElement
    expect(btn.className).toContain('rounded-3xl')
  })
})

describe('ProductImage fallback (LOOP_VISUAL_10)', () => {
  it('fallback="rocket" muestra el RocketMark de marca cuando no hay foto', () => {
    const { container } = render(<ProductImage alt="" fallback="rocket" emojiClassName="x" />)
    expect(container.querySelector('img[src*="rocket-icon-transparent"]')).not.toBeNull()
  })

  it('por defecto conserva el ícono gris (sin cohete)', () => {
    const { container } = render(<ProductImage alt="" emojiClassName="x" />)
    expect(container.querySelector('img[src*="rocket"]')).toBeNull()
  })

  it('una foto que falla cae al cohete', () => {
    const { container } = render(<ProductImage imageUrl="https://x.test/a.jpg" alt="" fallback="rocket" emojiClassName="x" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img[src*="rocket-icon-transparent"]')).not.toBeNull()
  })
})
