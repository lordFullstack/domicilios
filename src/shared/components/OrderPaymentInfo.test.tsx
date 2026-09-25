import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderPaymentInfo } from './OrderPaymentInfo'

const cashOrder = (extra: Record<string, unknown> = {}) => ({
  payment_method: 'cash_on_delivery' as const,
  total: 30000,
  cash_amount: 50000,
  notes_to_restaurant: null,
  ...extra,
})

describe('OrderPaymentInfo', () => {
  it('domiciliario: cobrar el total, con cuánto paga y el cambio a llevar', () => {
    render(<OrderPaymentInfo order={cashOrder()} audience="delivery" />)
    expect(screen.getByText('COBRAR EN EFECTIVO')).toBeInTheDocument()
    expect(screen.getByText(/\$30\.000 · Paga con \$50\.000/)).toBeInTheDocument()
    expect(screen.getByText('Cambio a devolver: $20.000')).toBeInTheDocument()
  })

  it('domiciliario: sin monto declarado avisa que lleve cambio', () => {
    render(<OrderPaymentInfo order={cashOrder({ cash_amount: null })} audience="delivery" />)
    expect(screen.getByText('No indicó con cuánto paga: lleva cambio.')).toBeInTheDocument()
  })

  it('pago exacto: sin cambio', () => {
    render(<OrderPaymentInfo order={cashOrder({ cash_amount: 30000 })} audience="restaurant" />)
    expect(screen.getByText('Pago exacto: sin cambio.')).toBeInTheDocument()
  })

  it('restaurante: ve la nota del cliente', () => {
    render(<OrderPaymentInfo order={cashOrder({ notes_to_restaurant: 'sin cebolla' })} audience="restaurant" />)
    expect(screen.getByText('NOTA DEL CLIENTE')).toBeInTheDocument()
    expect(screen.getByText('sin cebolla')).toBeInTheDocument()
  })

  it('admin y cliente ven ambos datos', () => {
    for (const audience of ['admin', 'client'] as const) {
      const { unmount } = render(<OrderPaymentInfo order={cashOrder({ notes_to_restaurant: 'salsa aparte' })} audience={audience} />)
      expect(screen.getByText('salsa aparte')).toBeInTheDocument()
      expect(screen.getByText('Cambio a devolver: $20.000')).toBeInTheDocument()
      unmount()
    }
  })

  it('pago en línea sin nota: no renderiza nada', () => {
    const { container } = render(
      <OrderPaymentInfo order={{ payment_method: 'online', total: 1000, cash_amount: null, notes_to_restaurant: null }} audience="admin" />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('pago en línea con nota: solo la nota, sin efectivo', () => {
    render(<OrderPaymentInfo order={{ payment_method: 'online', total: 1000, cash_amount: null, notes_to_restaurant: 'hola' }} audience="restaurant" />)
    expect(screen.getByText('hola')).toBeInTheDocument()
    expect(screen.queryByText(/efectivo/i)).not.toBeInTheDocument()
  })
})
