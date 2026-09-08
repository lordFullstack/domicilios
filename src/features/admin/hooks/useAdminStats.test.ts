import { describe, it, expect } from 'vitest'
import { filterOrdersByPeriod } from './useAdminStats'
import { Order } from '@/shared/types'

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const makeOrder = (created_at: string): Order => ({
  id: crypto.randomUUID(),
  user_id: 'u1',
  restaurant_id: 'r1',
  total: 20000,
  status: 'delivered',
  delivery_address: 'Calle 1',
  payment_method: 'cash_on_delivery',
  payment_status: 'paid',
  created_at,
  updated_at: created_at,
})

describe('filterOrdersByPeriod', () => {
  const orders = [
    makeOrder(daysAgo(0)), // hoy
    makeOrder(daysAgo(3)), // dentro de 7 días
    makeOrder(daysAgo(10)), // dentro de 30 días, fuera de 7
    makeOrder(daysAgo(60)), // fuera de todo excepto 'all'
  ]

  it('"all" devuelve todos los pedidos sin filtrar', () => {
    expect(filterOrdersByPeriod(orders, 'all')).toHaveLength(4)
  })

  it('"today" solo devuelve pedidos de hoy', () => {
    expect(filterOrdersByPeriod(orders, 'today')).toHaveLength(1)
  })

  it('"7d" devuelve pedidos de los últimos 7 días', () => {
    expect(filterOrdersByPeriod(orders, '7d')).toHaveLength(2)
  })

  it('"30d" devuelve pedidos de los últimos 30 días', () => {
    expect(filterOrdersByPeriod(orders, '30d')).toHaveLength(3)
  })

  it('con lista vacía nunca rompe, devuelve vacío', () => {
    expect(filterOrdersByPeriod([], '7d')).toEqual([])
  })
})
