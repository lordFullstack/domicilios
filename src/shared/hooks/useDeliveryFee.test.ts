import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const maybeSingle = vi.fn()
const from = vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }))
vi.mock('@/shared/utils/supabase', () => ({ supabase: { from: () => from() } }))

import { useDeliveryFee, deliveryFeeLabel, setDeliveryFeeCache, __resetDeliveryFeeCache } from './useDeliveryFee'

describe('useDeliveryFee', () => {
  beforeEach(() => {
    __resetDeliveryFeeCache()
    from.mockClear()
    maybeSingle.mockResolvedValue({ data: { delivery_fee: 3000 }, error: null })
  })

  it('lee la tarifa UNA vez aunque la usen varios componentes', async () => {
    const a = renderHook(() => useDeliveryFee())
    const b = renderHook(() => useDeliveryFee())
    await waitFor(() => expect(a.result.current.fee).toBe(3000))
    expect(b.result.current.fee).toBe(3000)
    expect(from).toHaveBeenCalledTimes(1)
  })

  it('un cambio guardado por el Admin llega a todos los que la muestran', async () => {
    const { result } = renderHook(() => useDeliveryFee())
    await waitFor(() => expect(result.current.fee).toBe(3000))
    act(() => setDeliveryFeeCache(4500))
    expect(result.current.fee).toBe(4500)
  })

  it('si falla la lectura queda en null (no promete "gratis")', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'x' } })
    const { result } = renderHook(() => useDeliveryFee())
    await waitFor(() => expect(from).toHaveBeenCalled())
    expect(result.current.fee).toBeNull()
  })
})

describe('deliveryFeeLabel', () => {
  it('gratis / valor / desconocido', () => {
    expect(deliveryFeeLabel(0)).toBe('Envío gratis')
    expect(deliveryFeeLabel(3000)).toBe('Envío $3.000')
    expect(deliveryFeeLabel(null)).toBeNull()
  })
})
