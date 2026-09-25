import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CheckoutError } from './CheckoutError'
import type { CheckoutFailure } from '../utils/checkoutError'

const setup = (kind: CheckoutFailure) => {
  const onRetry = vi.fn()
  const onReview = vi.fn()
  const onNavigate = vi.fn()
  render(<CheckoutError kind={kind} onRetry={onRetry} onReview={onReview} onNavigate={onNavigate} />)
  return { onRetry, onReview, onNavigate }
}

describe('CheckoutError: cada causa tiene su salida y dice que el carrito sigue guardado', () => {
  it('sesión expirada -> Iniciar sesión', () => {
    const { onNavigate } = setup('session')
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })

  it('red / desconocido -> Reintentar', () => {
    const { onRetry } = setup('network')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('validación del servidor -> Revisar mi pedido (vuelve al formulario)', () => {
    const { onReview } = setup('validation')
    fireEvent.click(screen.getByRole('button', { name: 'Revisar mi pedido' }))
    expect(onReview).toHaveBeenCalledTimes(1)
  })

  it('restaurante cerrado -> Volver a restaurantes', () => {
    const { onNavigate } = setup('closed')
    fireEvent.click(screen.getByRole('button', { name: 'Volver a restaurantes' }))
    expect(onNavigate).toHaveBeenCalledWith('/app/restaurants')
  })

  it('productos no disponibles -> Revisar mi carrito', () => {
    const { onNavigate } = setup('cart')
    fireEvent.click(screen.getByRole('button', { name: 'Revisar mi carrito' }))
    expect(onNavigate).toHaveBeenCalledWith('/app/cart')
  })

  it.each(['session', 'network', 'validation', 'closed', 'cart'] as const)('%s: es una alerta y menciona el carrito guardado', (kind) => {
    setup(kind)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/carrito sigue guardado/i)).toBeInTheDocument()
  })
})
