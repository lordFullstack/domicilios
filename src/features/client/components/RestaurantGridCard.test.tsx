import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Restaurant } from '@/shared/types'

vi.mock('@/shared/hooks/useDeliveryFee', () => ({
  useDeliveryFee: () => ({ fee: 0 }),
  deliveryFeeLabel: (fee: number | null) => (fee === 0 ? 'Envío gratis' : null),
}))
vi.mock('@/hooks/useLocalData', () => ({
  useFavorites: () => ({ isFavorite: (id: string) => id === 'fav', toggleFavorite: vi.fn() }),
}))

const navigate = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}))

import { RestaurantGridCard } from './RestaurantGridCard'

const base: Restaurant = {
  id: 'r1', owner_id: 'o', name: 'Asados', description: '', address: '', phone: '',
  status: 'open', approved: true, category: 'Asados', rating_avg: 0, rating_count: 0, created_at: '',
}

const renderCard = (r: Restaurant) =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RestaurantGridCard restaurant={r} />
    </MemoryRouter>
  )

describe('<RestaurantGridCard />', () => {
  it('corazón no favorito: aria-pressed=false y label de acción', () => {
    renderCard(base)
    const heart = screen.getByLabelText('Guardar Asados en favoritos')
    expect(heart).toHaveAttribute('aria-pressed', 'false')
  })

  it('corazón favorito: aria-pressed=true', () => {
    renderCard({ ...base, id: 'fav' })
    expect(screen.getByLabelText('Quitar Asados de favoritos')).toHaveAttribute('aria-pressed', 'true')
  })

  it('la tarjeta se abre con Espacio', () => {
    renderCard(base)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Asados' }), { key: ' ' })
    expect(navigate).toHaveBeenCalledWith('/app/restaurant/r1')
  })

  it('anuncia cuando está cerrado', () => {
    renderCard({ ...base, status: 'closed' })
    expect(screen.getByRole('button', { name: 'Asados, cerrado' })).toBeInTheDocument()
  })
})
