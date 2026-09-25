import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const rpc = vi.fn()
const query = {
  select: () => query,
  order: () => query,
  eq: () => query,
  maybeSingle: () => Promise.resolve({ data: null }),
  then: (res: (v: { data: unknown[]; error: null }) => void) => res({ data: [], error: null }),
}
vi.mock('@/shared/utils/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
    from: () => query,
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: vi.fn(),
  },
}))
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))

import { useOrders, createOrderErrorMessage } from './useLocalData'

describe('createOrder (RPC)', () => {
  beforeEach(() => {
    rpc.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('manda solo producto y cantidad: ni precios ni total', async () => {
    rpc.mockResolvedValue({ data: { id: 'o1', total: 75000 }, error: null })
    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let res: Awaited<ReturnType<typeof result.current.createOrder>> | undefined
    await act(async () => {
      res = await result.current.createOrder({
        restaurant_id: 'r1',
        delivery_address: 'Calle 15 #10-20',
        special_instructions: 'Casa azul',
        payment_method: 'cash_on_delivery',
        items: [{ product_id: 'p1', quantity: 2 }],
      })
    })

    expect(rpc).toHaveBeenCalledWith('create_order', {
      p_restaurant_id: 'r1',
      p_delivery_address: 'Calle 15 #10-20',
      p_special_instructions: 'Casa azul',
      p_payment_method: 'cash_on_delivery',
      p_items: [{ product_id: 'p1', quantity: 2 }],
      p_client_order_id: null,
      p_cash_amount: null,
      p_notes_to_restaurant: null,
    })
    expect(JSON.stringify(rpc.mock.calls[0])).not.toMatch(/unit_price|total/)
    expect(res?.order?.total).toBe(75000)
  })

  it('envía p_client_order_id cuando se le pasa la llave', async () => {
    rpc.mockResolvedValue({ data: { id: 'o1', total: 1000 }, error: null })
    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.createOrder({
        restaurant_id: 'r1', delivery_address: 'Calle 15 #10-20', payment_method: 'cash_on_delivery',
        items: [{ product_id: 'p1', quantity: 1 }],
        client_order_id: '11111111-1111-4111-8111-111111111111',
      })
    })
    expect(rpc.mock.calls[0][1].p_client_order_id).toBe('11111111-1111-4111-8111-111111111111')
  })

  it('envía p_cash_amount cuando el cliente declara con cuánto paga', async () => {
    rpc.mockResolvedValue({ data: { id: 'o1', total: 30000 }, error: null })
    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.createOrder({
        restaurant_id: 'r1', delivery_address: 'Calle 15 #10-20', payment_method: 'cash_on_delivery',
        items: [{ product_id: 'p1', quantity: 1 }], cash_amount: 50000,
      })
    })
    expect(rpc.mock.calls[0][1].p_cash_amount).toBe(50000)
    expect(JSON.stringify(rpc.mock.calls[0])).not.toMatch(/unit_price|"total"/)
  })

  it('envía p_notes_to_restaurant cuando hay nota', async () => {
    rpc.mockResolvedValue({ data: { id: 'o1', total: 1000 }, error: null })
    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.createOrder({
        restaurant_id: 'r1', delivery_address: 'Calle 15 #10-20', payment_method: 'cash_on_delivery',
        items: [{ product_id: 'p1', quantity: 1 }], notes_to_restaurant: 'sin cebolla',
      })
    })
    expect(rpc.mock.calls[0][1].p_notes_to_restaurant).toBe('sin cebolla')
  })

  it('devuelve el código del error para que el checkout elija la pantalla', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'invalid_cash_amount' } })
    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let res: Awaited<ReturnType<typeof result.current.createOrder>> | undefined
    await act(async () => {
      res = await result.current.createOrder({
        restaurant_id: 'r1', delivery_address: 'Calle 15 #10-20', payment_method: 'cash_on_delivery',
        items: [{ product_id: 'p1', quantity: 1 }], cash_amount: 10,
      })
    })
    expect(res?.order).toBeNull()
  })

  it('traduce el error del servidor a un mensaje para el cliente', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'invalid_products' } })
    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let res: Awaited<ReturnType<typeof result.current.createOrder>> | undefined
    await act(async () => {
      res = await result.current.createOrder({
        restaurant_id: 'r1', delivery_address: 'Calle 15 #10-20', payment_method: 'cash_on_delivery',
        items: [{ product_id: 'p1', quantity: 1 }],
      })
    })
    expect(res?.order).toBeNull()
    expect(res?.error).toBe('Uno o más productos ya no están disponibles. Revisa tu carrito.')
  })
})

describe('createOrderErrorMessage', () => {
  it('mapea cada código conocido y tiene un genérico', () => {
    expect(createOrderErrorMessage('restaurant_closed')).toMatch(/acaba de cerrar/)
    expect(createOrderErrorMessage('invalid_quantity')).toMatch(/máximo 99/)
    expect(createOrderErrorMessage('algo raro')).toMatch(/No pudimos confirmar/)
    expect(createOrderErrorMessage(undefined)).toMatch(/No pudimos confirmar/)
  })
})
