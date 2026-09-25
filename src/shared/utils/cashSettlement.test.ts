import { describe, it, expect } from 'vitest'
import { bogotaDay, computeSettlement, expectedCashOnHand } from './cashSettlement'
import type { Order } from '@/shared/types'

const order = (extra: Partial<Order>): Order =>
  ({
    id: 'o', user_id: 'u', restaurant_id: 'r', total: 30000, delivery_fee: 5000, status: 'delivered',
    payment_method: 'cash_on_delivery', payment_status: 'paid', delivery_address: 'x',
    created_at: '2026-09-25T15:00:00Z', updated_at: '2026-09-25T17:00:00Z', ...extra,
  }) as Order

describe('bogotaDay', () => {
  it('usa la hora de Colombia (UTC-5), no la del navegador', () => {
    expect(bogotaDay('2026-09-25T17:00:00Z')).toBe('2026-09-25')
    expect(bogotaDay('2026-09-26T03:00:00Z')).toBe('2026-09-25') // 22:00 del 25 en Bogotá
    expect(bogotaDay('2026-09-26T05:00:00Z')).toBe('2026-09-26') // 00:00 del 26 en Bogotá
  })
})

describe('computeSettlement', () => {
  it('efectivo: cobra el total, adelanta el subtotal y gana la tarifa', () => {
    const s = computeSettlement([order({}), order({ id: 'o2', total: 21000, delivery_fee: 5000 })], '2026-09-25')
    expect(s).toEqual({ deliveries: 2, cashDeliveries: 2, collected: 51000, paidToRestaurants: 41000, earnings: 10000 })
  })

  it('el efectivo esperado en mano = base + ganancia (cobrado − adelantado)', () => {
    const s = computeSettlement([order({}), order({ id: 'o2', total: 21000 })], '2026-09-25')
    expect(expectedCashOnHand(50000, s)).toBe(60000)
  })

  it('ignora pedidos no entregados y de otros días', () => {
    const s = computeSettlement(
      [
        order({ status: 'cancelled' }),
        order({ id: 'a', status: 'in_delivery' }),
        order({ id: 'b', updated_at: '2026-09-24T17:00:00Z' }),
        order({ id: 'c' }),
      ],
      '2026-09-25'
    )
    expect(s.deliveries).toBe(1)
    expect(s.collected).toBe(30000)
  })

  it('pago en línea: gana la tarifa pero no maneja efectivo', () => {
    const s = computeSettlement([order({ payment_method: 'online' })], '2026-09-25')
    expect(s).toEqual({ deliveries: 1, cashDeliveries: 0, collected: 0, paidToRestaurants: 0, earnings: 5000 })
  })

  it('sin pedidos: todo en cero', () => {
    expect(computeSettlement([], '2026-09-25')).toEqual({ deliveries: 0, cashDeliveries: 0, collected: 0, paidToRestaurants: 0, earnings: 0 })
  })
})
