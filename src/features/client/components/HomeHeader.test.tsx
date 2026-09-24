import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const authState = { user: null as null | { name: string } }
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }))
vi.mock('@/hooks/useLocalData', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 4, markAsRead: vi.fn(), markAllAsRead: vi.fn() }),
}))

import { HomeHeader } from './HomeHeader'

const renderHeader = (props: { showGreeting?: boolean } = {}) =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <HomeHeader {...props} />
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

  describe('LOOP_VISUAL_09: header compacto y showGreeting', () => {
    it('showGreeting (por defecto): un solo h1 visible, en text-display, y "¿Qué quieres comer hoy?"', () => {
      authState.user = { name: 'ana' }
      renderHeader()
      const h1s = screen.getAllByRole('heading', { level: 1 })
      expect(h1s).toHaveLength(1)
      expect(h1s[0].className).toContain('text-display')
      expect(h1s[0].className).not.toContain('sr-only')
      expect(screen.getByText('¿Qué quieres comer hoy?')).toBeInTheDocument()
    })

    it('showGreeting=false: el h1 es sr-only "Inicio" y no hay saludo visible', () => {
      authState.user = { name: 'ana' }
      renderHeader({ showGreeting: false })
      const h1s = screen.getAllByRole('heading', { level: 1 })
      expect(h1s).toHaveLength(1)
      expect(h1s[0]).toHaveTextContent('Inicio')
      expect(h1s[0].className).toContain('sr-only')
      expect(screen.queryByText(/Hola, Ana/)).not.toBeInTheDocument()
      expect(screen.queryByText('¿Qué quieres comer hoy?')).not.toBeInTheDocument()
    })

    it('el chevron de la dirección es decorativo: aria-hidden y sin aria-label', () => {
      const { container } = renderHeader()
      const chevron = container.querySelector('svg.lucide-chevron-down')
      expect(chevron).not.toBeNull()
      expect(chevron).toHaveAttribute('aria-hidden', 'true')
      expect(chevron).not.toHaveAttribute('aria-label')
      expect(screen.queryByLabelText(/cambiar dirección/i)).not.toBeInTheDocument()
    })

    it('la línea de dirección ya no reserva 48px (no es un control) y "Tu comida, más cerca" se conserva', () => {
      const { container } = renderHeader()
      expect(container.innerHTML).not.toContain('min-h-[48px]')
      expect(screen.getByText('Tu comida, más cerca')).toBeInTheDocument()
    })
  })
})
