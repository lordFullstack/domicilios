import { describe, it, expect, vi, beforeEach } from 'vitest'

const rpc = vi.fn()
vi.mock('@/shared/utils/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => rpc(...args) },
}))
const push = vi.fn()
vi.mock('@/services/pushNotifications.service', () => ({
  triggerOrderPushNotification: (...args: unknown[]) => push(...args),
}))

import {
  orderActionErrorMessage,
  restaurantAdvanceOrder,
  restaurantAssignDelivery,
  restaurantCancelOrder,
  restaurantSendOrder,
  deliverySetShift,
  deliveryAcceptOrder,
  deliveryRejectOrder,
  deliveryCompleteOrder,
  deliveryUpdateLocation,
  clientCancelOrder,
} from './orderActions.service'

const order = (extra: Record<string, unknown> = {}) => ({ id: 'o1', user_id: 'u1', delivery_person_id: null, ...extra })

describe('orderActions (RPC del servidor — LOOP_SECURITY_01)', () => {
  beforeEach(() => {
    rpc.mockReset()
    push.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('cada acción llama a su RPC con p_order_id (nunca a orders.update)', async () => {
    rpc.mockResolvedValue({ data: order(), error: null })
    await restaurantAdvanceOrder('o1')
    await restaurantCancelOrder('o1')
    await deliveryCompleteOrder('o1')
    await clientCancelOrder('o1')
    expect(rpc.mock.calls.map((c) => c[0])).toEqual([
      'restaurant_advance_order',
      'restaurant_cancel_order',
      'delivery_complete_order',
      'client_cancel_order',
    ])
    expect(rpc.mock.calls.every((c) => JSON.stringify(c[1]) === JSON.stringify({ p_order_id: 'o1' }))).toBe(true)
  })

  it('traduce los códigos de error del servidor a mensajes para el usuario', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'delivery_busy' } })
    const res = await deliveryAcceptOrder('o1')
    expect(res).toMatchObject({ ok: false, code: 'delivery_busy' })
    expect(res.reason).toMatch(/entrega en camino/)
    expect(orderActionErrorMessage('algo raro')).toMatch(/No pudimos completar/)
    expect(orderActionErrorMessage(undefined)).toMatch(/No pudimos completar/)
  })

  it('asignar avisa por push al domiciliario asignado', async () => {
    rpc.mockResolvedValue({ data: order({ delivery_person_id: 'd1' }), error: null })
    const res = await restaurantAssignDelivery('o1')
    expect(res.ok).toBe(true)
    expect(push).toHaveBeenCalledWith('d1', 'assigned', 'o1')
  })

  it('"Enviar": si nadie es elegible, abre UNA nueva ronda', async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'no_delivery_available' } })
      .mockResolvedValueOnce({ data: order({ delivery_person_id: 'd2' }), error: null })
    const res = await restaurantSendOrder('o1')
    expect(rpc.mock.calls.map((c) => c[0])).toEqual(['restaurant_assign_delivery', 'restaurant_retry_assignment'])
    expect(res.ok).toBe(true)
  })

  it('"Enviar": otro error no abre nueva ronda', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'order_unavailable' } })
    const res = await restaurantSendOrder('o1')
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(res.code).toBe('order_unavailable')
  })

  it('aceptar y completar avisan al cliente; rechazar avisa solo si se reasignó', async () => {
    rpc.mockResolvedValueOnce({ data: order(), error: null })
    await deliveryAcceptOrder('o1')
    expect(push).toHaveBeenLastCalledWith('u1', 'in_delivery', 'o1')

    rpc.mockResolvedValueOnce({ data: order(), error: null })
    await deliveryCompleteOrder('o1')
    expect(push).toHaveBeenLastCalledWith('u1', 'delivered', 'o1')

    push.mockReset()
    rpc.mockResolvedValueOnce({ data: order({ delivery_person_id: null }), error: null })
    await deliveryRejectOrder('o1')
    expect(push).not.toHaveBeenCalled()

    rpc.mockResolvedValueOnce({ data: order({ delivery_person_id: 'd2' }), error: null })
    await deliveryRejectOrder('o1')
    expect(push).toHaveBeenCalledWith('d2', 'assigned', 'o1')
  })

  it('turno: manda p_on_shift y devuelve el valor del servidor', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    expect(await deliverySetShift(true)).toEqual({ ok: true, onShift: true })
    expect(rpc).toHaveBeenCalledWith('delivery_set_shift', { p_on_shift: true })
    rpc.mockResolvedValue({ data: null, error: { message: 'not_authorized' } })
    const res = await deliverySetShift(true)
    expect(res.ok).toBe(false)
    expect(res.onShift).toBe(false)
  })

  it('ubicación: manda lat/lng por RPC y devuelve si fue aceptada', async () => {
    rpc.mockResolvedValue({ data: null, error: null })
    expect(await deliveryUpdateLocation('o1', 11.54, -72.91)).toBe(true)
    expect(rpc).toHaveBeenCalledWith('delivery_update_location', { p_order_id: 'o1', p_lat: 11.54, p_lng: -72.91 })
    rpc.mockResolvedValue({ data: null, error: { message: 'invalid_location' } })
    expect(await deliveryUpdateLocation('o1', 95, 0)).toBe(false)
  })
})
