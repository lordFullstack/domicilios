import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Illustration, ILLUSTRATION_SIZES, type IllustrationName } from './index'
import { PALETTE } from './types'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { OrderSuccessView } from '@/features/client/components/OrderSuccessView'

const NAMES: IllustrationName[] = ['idle', 'success', 'emptyCart', 'noResults', 'confused', 'sad']

const { authState, navigateSpy } = vi.hoisted(() => ({
  authState: { isAuthenticated: false, loading: false },
  navigateSpy: vi.fn(),
}))
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateSpy }
})

describe('Illustration', () => {
  it.each(NAMES)('%s: viewBox 240, decorativa y con el nombre correcto', (name) => {
    const { container } = render(<Illustration name={name} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 240 240')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('data-illustration')).toBe(name)
  })

  it('aplica el tamaño según size sin cambiar el viewBox', () => {
    const { container } = render(<Illustration name="idle" size="lg" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe(String(ILLUSTRATION_SIZES.lg))
    expect(svg.getAttribute('viewBox')).toBe('0 0 240 240')
  })

  it.each(NAMES)('%s: los trazos secundarios usan stroke-width 1.75 (o un múltiplo del mismo grosor)', (name) => {
    const { container } = render(<Illustration name={name} />)
    // Fuera del cohete (que escala su trazo para quedar en 1.75 reales),
    // todo trazo directo del lienzo es 1.75 o el mango de la lupa (2.4×).
    const direct = Array.from(container.querySelectorAll('svg > [stroke-width]'))
    const widths = direct.map((n) => Number(n.getAttribute('stroke-width')))
    widths.forEach((w) => expect([1.75, 1.75 * 2.4]).toContain(w))
  })

  it('usa solo colores de la paleta de marca', () => {
    const allowed = new Set<string>(Object.values(PALETTE).map((c) => c.toUpperCase()))
    NAMES.forEach((name) => {
      const { container, unmount } = render(<Illustration name={name} />)
      container.querySelectorAll('[fill],[stroke],[stop-color]').forEach((n) => {
        ;['fill', 'stroke', 'stop-color'].forEach((attr) => {
          const v = n.getAttribute(attr)
          if (v && v !== 'none' && !v.startsWith('url(')) expect(allowed).toContain(v.toUpperCase())
        })
      })
      unmount()
    })
  })

  it('no repite ids aunque haya varias ilustraciones en la misma pantalla', () => {
    const { container } = render(
      <>
        {NAMES.map((n) => (
          <Illustration key={n} name={n} />
        ))}
      </>
    )
    const ids = Array.from(container.querySelectorAll('[id]')).map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Integración de ilustraciones', () => {
  it('EmptyState muestra la ilustración (obligatoria) y anuncia como status', () => {
    const { container } = render(<EmptyState illustration="emptyCart" title="Vacío" />)
    expect(container.querySelector('[data-illustration="emptyCart"]')).not.toBeNull()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('ErrorBoundary muestra RocketSad', () => {
    const Boom = () => {
      throw new Error('boom')
    }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    expect(container.querySelector('[data-illustration="sad"]')).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('OrderSuccessView muestra RocketSuccess', () => {
    const { container } = render(
      <OrderSuccessView orderId="abcdef123456" restaurantName="Asados" total={28000} onViewOrder={() => {}} onKeepShopping={() => {}} />
    )
    expect(container.querySelector('[data-illustration="success"]')).not.toBeNull()
  })
})

describe('NotFound', () => {
  it('sin sesión: botón "Iniciar sesión" lleva a /login', async () => {
    const { NotFound } = await import('@/shared/pages/NotFound')
    authState.isAuthenticated = false
    const { container } = render(<MemoryRouter><NotFound /></MemoryRouter>)
    expect(container.querySelector('[data-illustration="confused"]')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(navigateSpy).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('con sesión: botón "Volver al inicio" lleva a /app/home', async () => {
    const { NotFound } = await import('@/shared/pages/NotFound')
    authState.isAuthenticated = true
    render(<MemoryRouter><NotFound /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Volver al inicio' }))
    expect(navigateSpy).toHaveBeenCalledWith('/app/home', { replace: true })
  })
})
