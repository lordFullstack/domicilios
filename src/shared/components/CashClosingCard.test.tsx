import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CashClosingCard } from './CashClosingCard'
import type { Order } from '@/shared/types'

const order = (extra: Partial<Order> = {}): Order =>
  ({
    id: 'o1', user_id: 'u', restaurant_id: 'r', total: 30000, delivery_fee: 5000, status: 'delivered',
    payment_method: 'cash_on_delivery', payment_status: 'paid', delivery_address: 'x',
    created_at: '2026-09-25T15:00:00Z', updated_at: '2026-09-25T17:00:00Z', ...extra,
  }) as Order

describe('CashClosingCard', () => {
  beforeEach(() => localStorage.clear())

  it('muestra cobrado, pagado a restaurantes y la ganancia del día', () => {
    render(<CashClosingCard orders={[order()]} day="2026-09-25" />)
    expect(screen.getByText('Cuadre del día')).toBeInTheDocument()
    expect(screen.getByText('$30.000')).toBeInTheDocument() // cobrado
    expect(screen.getByText('$25.000')).toBeInTheDocument() // pagado al restaurante
    expect(screen.getByText('$5.000')).toBeInTheDocument() // ganancia
  })

  it('vista de admin: sin campo de base', () => {
    render(<CashClosingCard orders={[order()]} day="2026-09-25" />)
    expect(screen.queryByLabelText(/mi base de hoy/i)).not.toBeInTheDocument()
  })

  it('domiciliario: con la base calcula el efectivo que debe tener en mano y la recuerda', () => {
    const { unmount } = render(<CashClosingCard orders={[order()]} day="2026-09-25" baseStorageKey="k1" />)
    fireEvent.change(screen.getByLabelText(/mi base de hoy/i), { target: { value: '50000' } })
    expect(screen.getByText('Debes tener en mano').nextSibling).toHaveTextContent('$55.000')
    unmount()
    render(<CashClosingCard orders={[order()]} day="2026-09-25" baseStorageKey="k1" />)
    expect(screen.getByLabelText(/mi base de hoy/i)).toHaveValue('50.000')
  })

  it('sin pedidos ese día: ceros', () => {
    render(<CashClosingCard orders={[order({ updated_at: '2026-09-20T17:00:00Z' })]} day="2026-09-25" />)
    expect(screen.getByText('0 (0 en efectivo)')).toBeInTheDocument()
  })
})
