import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Product, Restaurant } from '@/shared/types'

const restaurant: Restaurant = {
  id: 'r1', owner_id: 'o', name: 'Asados', description: '', address: '', phone: '',
  status: 'open', approved: true, category: 'Asados', rating_avg: 4.9, rating_count: 7, created_at: '',
}
const product = (o: Partial<Product>): Product => ({
  id: 'p', restaurant_id: 'r1', name: 'P', description: '', price: 28000, category: 'Platos',
  available: true, created_at: '', ...o,
})

const rq = { restaurant: restaurant as Restaurant | null, loading: false, error: null as string | null, fromCache: false, cachedAt: null, reload: vi.fn() }
const pq = { products: [] as Product[], loading: false, error: null as string | null, fromCache: false, cachedAt: null, reload: vi.fn() }
let promos: { product_id: string; active: boolean }[] = []
let firstCartProduct: Product | null = null

vi.mock('@/hooks/useLocalData', () => ({
  useRestaurantById: () => rq,
  useProducts: () => pq,
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
  useProductById: () => ({ product: firstCartProduct }),
}))
vi.mock('@/shared/hooks/usePromotions', () => ({ usePromotions: () => ({ promotions: promos, loading: false }) }))
vi.mock('@/shared/utils/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ in: (_: string, ids: string[]) => Promise.resolve({ data: ids.map((id) => ({ id })) }) }) }) },
}))

import { CartProvider } from '../CartContext'
import { useCartContext } from '@/shared/hooks/useCartContext'
import { RestaurantDetailPage } from './RestaurantDetailPage'

let cartSnapshot: { productId: string; quantity: number }[] = []
const CartSpy = () => {
  cartSnapshot = useCartContext().cart
  return null
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/app/restaurant/r1']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>
        <Routes>
          <Route path="/app/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/app/restaurants" element={<p>Explorar</p>} />
        </Routes>
        <CartSpy />
      </CartProvider>
    </MemoryRouter>
  )

describe('<RestaurantDetailPage />', () => {
  beforeEach(() => {
    localStorage.clear()
    Element.prototype.scrollIntoView = vi.fn()
    rq.restaurant = { ...restaurant }
    rq.loading = false
    rq.error = null
    rq.reload.mockClear()
    pq.products = [
      product({ id: 'costilla', name: 'Costilla BBQ', category: 'Platos' }),
      product({ id: 'agotado', name: 'Chuzo', category: 'Platos', available: false }),
      product({ id: 'limonada', name: 'Limonada', price: 6000, category: 'Bebidas' }),
    ]
    pq.loading = false
    pq.error = null
    promos = []
    firstCartProduct = null
  })

  it('muestra todas las categorías como secciones y el rating accesible', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Platos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bebidas' })).toBeInTheDocument()
    expect(screen.getAllByText('Calificación 4.9 de 5, 7 reseñas').length).toBeGreaterThan(0)
  })

  it('"+" agrega directo al carrito con aria-label que incluye el precio', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Costilla BBQ al carrito, $28.000' }))
    expect(cartSnapshot).toEqual([expect.objectContaining({ productId: 'costilla', quantity: 1 })])
    expect(await screen.findByText('Costilla BBQ agregado al carrito')).toBeInTheDocument()
    // pasa a stepper
    expect(screen.getByRole('button', { name: 'Quitar Costilla BBQ del carrito' })).toBeInTheDocument()
  })

  it('producto agotado queda deshabilitado con motivo', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Chuzo: agotado' })).toBeDisabled()
  })

  it('restaurante cerrado: banner y botones deshabilitados, menú visible', () => {
    rq.restaurant = { ...restaurant, status: 'closed' }
    renderPage()
    expect(screen.getByText(/Cerrado por ahora/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Costilla BBQ: cerrado' })).toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Bebidas' })).toBeInTheDocument()
  })

  it('tap en chip hace scroll a su sección', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Bebidas' }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('recomendados ocultos sin promociones y visibles con una del restaurante', () => {
    const { unmount } = renderPage()
    expect(screen.queryByRole('heading', { name: 'Recomendados' })).not.toBeInTheDocument()
    unmount()
    promos = [{ product_id: 'limonada', active: true }]
    renderPage()
    expect(screen.getByRole('heading', { name: 'Recomendados' })).toBeInTheDocument()
  })

  it('404 ofrece "Explorar restaurantes"', () => {
    rq.restaurant = null
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Explorar restaurantes' }))
    expect(screen.getByText('Explorar')).toBeInTheDocument()
  })

  it('error de red: "Reintentar" llama reload() sin recargar la app', () => {
    rq.restaurant = null
    rq.error = 'x'
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(rq.reload).toHaveBeenCalled()
  })

  it('"Vaciar y agregar" deja solo el producto nuevo', async () => {
    localStorage.setItem('cart', JSON.stringify({ key: 'cart', value: [{ productId: 'x', quantity: 3, unitPrice: 1 }] }))
    firstCartProduct = product({ id: 'x', restaurant_id: 'otro' })
    renderPage()
    await waitFor(() => expect(cartSnapshot).toHaveLength(1))
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Costilla BBQ al carrito, $28.000' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Vaciar y agregar' }))
    expect(cartSnapshot).toEqual([expect.objectContaining({ productId: 'costilla', quantity: 1 })])
  })
})
