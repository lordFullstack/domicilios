import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Product, Restaurant } from '@/shared/types'

vi.mock('@/shared/hooks/useDeliveryFee', () => ({
  useDeliveryFee: () => ({ fee: 0 }),
  deliveryFeeLabel: () => 'Envío gratis',
}))
vi.mock('@/hooks/useLocalData', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}))

// CartContext arrastra el cliente de Supabase; solo se necesita la constante.
vi.mock('../CartContext', () => ({ MAX_ITEM_QUANTITY: 99 }))

import { RestaurantGridCard } from './RestaurantGridCard'
import { FeaturedProductStrip } from './FeaturedProductStrip'
import { MenuProductCard } from './MenuProductCard'
import { RestaurantCardsSkeleton } from '@/shared/components/RestaurantCardsSkeleton'

const restaurant: Restaurant = {
  id: 'r1', owner_id: 'o', name: 'Asados', description: '', address: '', phone: '',
  status: 'open', approved: true, category: 'Asados', rating_avg: 4.9, rating_count: 7, created_at: '',
}

const product = {
  id: 'p1', restaurant_id: 'r1', name: 'Costilla bbq', description: '200 gms de costilla al barril\nsegunda línea',
  price: 28000, category: 'Platos', available: true, image_url: null,
} as unknown as Product

const noop = () => {}

/** Ningún interactivo (button/a) puede tener otro interactivo dentro. */
const nestedInteractives = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('button, a')).filter((el) => el.querySelector('button, a, [role="button"]'))

describe('RestaurantGridCard (LOOP_VISUAL_10)', () => {
  const renderCard = () =>
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RestaurantGridCard restaurant={restaurant} />
      </MemoryRouter>
    )

  it('es un <article> con el corazón como HERMANO del botón principal (sin anidar interactivos)', () => {
    const { container } = renderCard()
    expect(container.querySelector('article')).not.toBeNull()
    expect(container.querySelector('[role="button"]')).toBeNull()
    expect(nestedInteractives(container)).toEqual([])
    const main = screen.getByRole('button', { name: 'Asados' })
    const heart = screen.getByLabelText('Guardar Asados en favoritos')
    expect(main.contains(heart)).toBe(false)
    expect(main.parentElement).toBe(heart.parentElement)
  })

  it('la foto es 16:9 y la card usa card-surface + rounded-3xl', () => {
    const { container } = renderCard()
    expect(container.querySelector('.aspect-video')).not.toBeNull()
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeNull()
    const article = container.querySelector('article')!
    expect(article.className).toContain('card-surface')
    expect(article.className).toContain('rounded-3xl')
  })
})

describe('FeaturedProductStrip (LOOP_VISUAL_10)', () => {
  const renderStrip = () =>
    render(
      <FeaturedProductStrip
        products={[product]}
        restaurantIsOpen
        getQuantity={() => 0}
        onOpenDetail={noop}
        onAdd={() => true}
      />
    )

  it('foto 4:3, precio tabular y "+" hermano del botón de detalle', () => {
    const { container } = renderStrip()
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).not.toBeNull()
    expect(screen.getByText('$28.000').className).toContain('tabular-nums')
    expect(nestedInteractives(container)).toEqual([])
    const detail = screen.getByRole('button', { name: /Ver detalles de Costilla bbq/ })
    const add = screen.getByRole('button', { name: /Agregar Costilla bbq al carrito/ })
    expect(detail.contains(add)).toBe(false)
    expect(container.querySelector('li')!.className).toContain('card-surface')
  })
})

describe('MenuProductCard (LOOP_VISUAL_10)', () => {
  const renderRow = (p: Product) =>
    render(
      <ul>
        <MenuProductCard product={p} restaurantIsOpen quantity={0} onOpenDetail={noop} onAdd={() => true} onDecrement={noop} />
      </ul>
    )

  it('metadata: primera línea de la descripción, a 1 línea (line-clamp-1)', () => {
    renderRow(product)
    const meta = screen.getByText('200 gms de costilla al barril')
    expect(meta.className).toContain('line-clamp-1')
    expect(screen.queryByText(/segunda línea/)).toBeNull()
  })

  it('metadata: sin descripción cae a la categoría; nunca inventa peso ni tiempo', () => {
    const { container } = renderRow({ ...product, description: '' })
    expect(screen.getByText('Platos').className).toContain('line-clamp-1')
    expect(container.textContent).not.toMatch(/\d+\s?g\b|\bmin\b/)
  })

  it('precio tabular y "+" de 44x44 hermano del botón de detalle', () => {
    const { container } = renderRow(product)
    expect(screen.getByText('$28.000').className).toContain('tabular-nums')
    expect(nestedInteractives(container)).toEqual([])
    const add = screen.getByRole('button', { name: /Agregar Costilla bbq al carrito/ })
    expect(add.className).toContain('h-11')
    expect(add.className).toContain('w-11')
    expect(container.querySelector('article')!.className).toContain('card-surface')
  })
})

describe('RestaurantCardsSkeleton (LOOP_VISUAL_10)', () => {
  it('usa la misma geometría 16:9 que RestaurantGridCard', () => {
    const { container } = render(<RestaurantCardsSkeleton count={2} />)
    expect(container.querySelectorAll('.aspect-video')).toHaveLength(2)
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeNull()
  })
})
