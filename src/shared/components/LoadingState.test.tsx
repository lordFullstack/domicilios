import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from './LoadingState'
import { Skeleton } from './Skeleton'

describe('<LoadingState /> (LOOP_VISUAL_08)', () => {
  it('sin children muestra el Spinner único dentro de un status con nombre accesible', () => {
    const { container } = render(<LoadingState label="Cargando pedidos" />)
    expect(screen.getByRole('status', { name: 'Cargando pedidos' })).toBeInTheDocument()
    expect(container.querySelector('[data-spinner]')).not.toBeNull()
  })

  it('con children (skeleton) no muestra spinner', () => {
    const { container } = render(
      <LoadingState label="Cargando menú">
        <Skeleton className="h-4 w-1/2" />
      </LoadingState>
    )
    expect(screen.getByRole('status', { name: 'Cargando menú' })).toBeInTheDocument()
    expect(container.querySelector('[data-spinner]')).toBeNull()
  })

  it('fullScreen centra el estado en toda la pantalla', () => {
    render(<LoadingState fullScreen />)
    const cls = screen.getByRole('status').className
    expect(cls).toContain('min-h-screen')
    expect(cls).toContain('items-center')
  })

  it('label por defecto: "Cargando"', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })
})
