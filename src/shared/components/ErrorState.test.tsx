import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from './ErrorState'

describe('<ErrorState /> (LOOP_VISUAL_08)', () => {
  it('es un alert con título, descripción e ilustración decorativa (sad por defecto)', () => {
    const { container } = render(
      <ErrorState title="Algo salió mal" description="Intenta de nuevo en unos segundos" onRetry={() => {}} />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Intenta de nuevo en unos segundos')).toBeInTheDocument()
    const svg = container.querySelector('[data-illustration="sad"]')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('"Reintentar" llama al handler', () => {
    const onRetry = vi.fn()
    render(<ErrorState title="x" onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('el texto del botón se puede cambiar y retrying lo deshabilita', () => {
    render(<ErrorState title="x" onRetry={() => {}} retryLabel="Probar otra vez" retrying />)
    expect(screen.getByRole('button', { name: /Probar otra vez/ })).toBeDisabled()
  })

  it('acepta una acción propia (navegar) en vez de reintentar', () => {
    render(<ErrorState illustration="confused" title="No encontramos" action={<button>Volver al inicio</button>} />)
    expect(screen.getByRole('button', { name: 'Volver al inicio' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })

  it('usa la ilustración indicada (confused)', () => {
    const { container } = render(<ErrorState illustration="confused" title="x" action={<span />} />)
    expect(container.querySelector('[data-illustration="confused"]')).not.toBeNull()
  })

  it('fullScreen: el título es el h1; en línea es un párrafo (sin h1)', () => {
    const { rerender } = render(<ErrorState fullScreen title="Algo salió mal" onRetry={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Algo salió mal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('text-xl')
    rerender(<ErrorState title="Algo salió mal" onRetry={() => {}} />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
