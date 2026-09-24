import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShiftToggle } from './ShiftToggle'

describe('<ShiftToggle /> (LOOP_SECURITY_01)', () => {
  it('es un switch accesible que refleja el turno', () => {
    const { rerender } = render(<ShiftToggle onShift={false} onToggle={() => {}} />)
    expect(screen.getByRole('switch', { name: 'En turno' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Fuera de turno')).toBeInTheDocument()
    rerender(<ShiftToggle onShift onToggle={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('En turno — recibiendo pedidos')).toBeInTheDocument()
  })

  it('al tocarlo llama a onToggle', () => {
    const onToggle = vi.fn()
    render(<ShiftToggle onShift={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('se deshabilita mientras carga, guarda o sin conexión', () => {
    const { rerender } = render(<ShiftToggle onShift={false} loading onToggle={() => {}} />)
    expect(screen.getByRole('switch')).toBeDisabled()
    rerender(<ShiftToggle onShift={false} saving onToggle={() => {}} />)
    expect(screen.getByRole('switch')).toBeDisabled()
    rerender(<ShiftToggle onShift={false} disabled onToggle={() => {}} />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('muestra el error del servidor como alerta', () => {
    render(<ShiftToggle onShift={false} error="No tienes permiso para hacer esto." onToggle={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No tienes permiso')
  })
})
