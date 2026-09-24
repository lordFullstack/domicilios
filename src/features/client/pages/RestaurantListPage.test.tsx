import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import type { Restaurant } from '@/shared/types'

const make = (o: Partial<Restaurant>): Restaurant => ({
  id: 'x', owner_id: 'o', name: 'X', description: '', address: '', phone: '',
  status: 'open', approved: true, category: 'Asados', rating_avg: 0, rating_count: 0, created_at: '',
  ...o,
})

const state = {
  restaurants: [] as Restaurant[],
  loading: false,
  error: null as string | null,
  errorKind: null as null | 'network' | 'permission' | 'unknown',
  reload: vi.fn(),
}

vi.mock('@/shared/hooks/useDeliveryFee', () => ({
  useDeliveryFee: () => ({ fee: 0 }),
  deliveryFeeLabel: (fee: number | null) => (fee === 0 ? 'Envío gratis' : null),
}))
vi.mock('@/hooks/useLocalData', () => ({
  useRestaurants: () => state,
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}))
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: null, logout: vi.fn() }) }))
vi.mock('@/shared/hooks/useCartContext', () => ({ useCartContext: () => ({ cart: [], getTotal: () => 0 }) }))

import { RestaurantListPage } from './RestaurantListPage'

let currentSearch = ''
const LocationSpy = () => {
  currentSearch = useLocation().search
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>atras-test</button>
}

const renderAt = (url = '/app/restaurants') =>
  render(
    <MemoryRouter initialEntries={[url]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RestaurantListPage />
      <LocationSpy />
    </MemoryRouter>
  )

const names = () =>
  within(screen.getByRole('list'))
    .getAllByRole('listitem')
    .map((li) => li.textContent)

describe('<RestaurantListPage />', () => {
  beforeEach(() => {
    state.restaurants = [
      make({ id: '1', name: 'Pizza Palace', category: 'Pizza', status: 'open' }),
      make({ id: '2', name: 'Pizza Cerrada', category: 'Pizza', status: 'closed' }),
      make({ id: '3', name: 'Asados El Fogón', category: 'Asados', status: 'open' }),
    ]
    state.loading = false
    state.error = null
    state.errorKind = null
    state.reload.mockClear()
  })

  it('muestra todos y el contador', () => {
    renderAt()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('3 restaurantes')
    expect(names()).toHaveLength(3)
  })

  it('escribir en la búsqueda filtra, actualiza el contador y la URL', async () => {
    renderAt()
    fireEvent.change(screen.getByLabelText('Buscar restaurantes'), { target: { value: 'pizzá' } })
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2 resultados para "pizzá"')
    expect(await screen.findByText(/Pizza Palace/)).toBeInTheDocument()
    expect(currentSearch).toContain('q=pizz')
  })

  it('chip "Abiertos" deja solo abiertos y escribe ?open=1', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: /Abiertos/ }))
    expect(names().some((n) => n?.includes('Pizza Cerrada'))).toBe(false)
    expect(currentSearch).toBe('?open=1')
  })

  it('Atrás deshace el último filtro', async () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: /Abiertos/ }))
    expect(currentSearch).toBe('?open=1')
    fireEvent.click(screen.getByRole('button', { name: 'atras-test' }))
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('3 restaurantes')
    expect(currentSearch).toBe('')
  })

  it('deep link ?cat=pizza&open=1 aplica filtros y activa chips', () => {
    renderAt('/app/restaurants?cat=pizza&open=1')
    expect(screen.getByRole('button', { name: /Abiertos/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Pizza' })).toHaveAttribute('aria-pressed', 'true')
    expect(names()).toHaveLength(1)
  })

  it('sin resultados → empty state con "Limpiar filtros" que vuelve a todos', () => {
    renderAt('/app/restaurants?q=sushi')
    expect(screen.getByRole('status')).toHaveTextContent('Sin resultados')
    expect(screen.getByRole('status')).toHaveTextContent('Prueba con otros filtros o cambia la búsqueda')
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(names()).toHaveLength(3)
    expect(currentSearch).toBe('')
  })

  it('"Limpiar filtros" inline aparece con 2 o más filtros', () => {
    renderAt('/app/restaurants?cat=pizza')
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Abiertos/ }))
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()
  })

  it('carga inicial → skeleton con role="status"', () => {
    state.restaurants = []
    state.loading = true
    renderAt()
    expect(screen.getByRole('status', { name: 'Cargando restaurantes' })).toBeInTheDocument()
  })

  it('error de red → alerta con Reintentar', () => {
    state.restaurants = []
    state.error = 'x'
    state.errorKind = 'network'
    renderAt()
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar los restaurantes')
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa tu conexión e intenta de nuevo')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(state.reload).toHaveBeenCalled()
  })

  it('error de permisos tiene copy propio', () => {
    state.restaurants = []
    state.error = 'x'
    state.errorKind = 'permission'
    renderAt()
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos verificar tu sesión')
  })

  it('catálogo vacío → empty state sin CTA de filtros', () => {
    state.restaurants = []
    renderAt()
    expect(screen.getByRole('status')).toHaveTextContent('Aún no hay restaurantes en tu zona')
    expect(screen.getByRole('status')).toHaveTextContent('Estamos trabajando para traer más opciones')
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument()
  })
})
