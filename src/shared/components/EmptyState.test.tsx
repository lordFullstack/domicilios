import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('<EmptyState />', () => {
  it('renderiza el título siempre', () => {
    render(<EmptyState illustration="noResults" title="No encontramos restaurantes" />)
    expect(screen.getByText('No encontramos restaurantes')).toBeInTheDocument()
  })

  it('la descripción es opcional — no rompe si no se pasa', () => {
    render(<EmptyState illustration="idle" title="Vacío" />)
    expect(screen.getByText('Vacío')).toBeInTheDocument()
  })

  it('renderiza la descripción cuando se pasa', () => {
    render(<EmptyState illustration="idle" title="Vacío" description="Prueba otra búsqueda" />)
    expect(screen.getByText('Prueba otra búsqueda')).toBeInTheDocument()
  })

  it('renderiza la acción (botón) cuando se pasa', () => {
    render(<EmptyState illustration="idle" title="Vacío" action={<button>Reintentar</button>} />)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('no renderiza ninguna acción si no se pasa (no hay botón fantasma)', () => {
    render(<EmptyState illustration="idle" title="Vacío" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  describe('LOOP_VISUAL_08', () => {
    it('muestra la ilustración del cohete (decorativa) y anuncia como status', () => {
      const { container } = render(<EmptyState illustration="idle" title="Vacío" />)
      const svg = container.querySelector('[data-illustration="idle"]')
      expect(svg).not.toBeNull()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('size="sm" usa la ilustración chica (120px) y menos padding', () => {
      const { container } = render(<EmptyState illustration="idle" title="Vacío" size="sm" />)
      expect(container.querySelector('[data-illustration="idle"]')).toHaveAttribute('width', '120')
      expect(screen.getByRole('status').className).toContain('py-6')
    })

    it('size por defecto (md) usa la ilustración de 180px', () => {
      const { container } = render(<EmptyState illustration="idle" title="Vacío" />)
      expect(container.querySelector('[data-illustration="idle"]')).toHaveAttribute('width', '180')
    })
  })
})
