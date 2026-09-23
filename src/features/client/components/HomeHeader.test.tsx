import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const authState = { user: null as null | { name: string } }
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }))
vi.mock('@/hooks/useLocalData', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 4, markAsRead: vi.fn(), markAllAsRead: vi.fn() }),
}))

import { HomeHeader } from './HomeHeader'

const renderHeader = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <HomeHeader />
    </MemoryRouter>
  )

describe('<HomeHeader />', () => {
  beforeEach(() => {
    localStorage.clear()
    authState.user = null
  })

  it('renderiza el nombre capitalizado y con tilde', () => {
    authState.user = { name: 'jose luis perez' }
    renderHeader()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('¡Hola, José!')
  })

  it('muestra "Bienvenido" sin usuario', () => {
    renderHeader()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bienvenido')
  })

  it('el 👋 es decorativo', () => {
    authState.user = { name: 'maria' }
    renderHeader()
    expect(screen.getByText('👋')).toHaveAttribute('aria-hidden', 'true')
  })

  it('entrega en Riohacha si no hay dirección guardada', () => {
    renderHeader()
    expect(screen.getByText('Riohacha')).toBeInTheDocument()
  })

  it('usa la última dirección de Checkout', () => {
    localStorage.setItem(
      'last_delivery_address',
      JSON.stringify({ key: 'last_delivery_address', value: { street: 'Calle 15 #10-20', complement: '', reference: '' } })
    )
    renderHeader()
    expect(screen.getByText('Calle 15 #10-20, Riohacha')).toBeInTheDocument()
  })

  it('"Entregar en" ya no es un botón sin acción', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: /entregar en/i })).not.toBeInTheDocument()
  })

  it('la campana anuncia el conteo de no leídas', () => {
    renderHeader()
    expect(screen.getByLabelText('Notificaciones, 4 sin leer')).toBeInTheDocument()
  })
})
