import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const rpc = vi.fn()
vi.mock('@/shared/utils/supabase', () => ({ supabase: { rpc: (...a: unknown[]) => rpc(...a) } }))

import { useCountdown, formatCountdown, secondsUntil, resetServerClock, serverNow } from './useCountdown'

describe('cuenta regresiva (hora del servidor)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-25T12:00:00Z'))
    resetServerClock()
    rpc.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it('formatea m:ss y no baja de 0', () => {
    expect(formatCountdown(105)).toBe('1:45')
    expect(formatCountdown(7)).toBe('0:07')
    expect(secondsUntil('2026-09-25T12:00:10Z', Date.parse('2026-09-25T12:00:20Z'))).toBe(0)
  })

  it('sin plazo no cuenta', () => {
    const { result } = renderHook(() => useCountdown(null))
    expect(result.current).toEqual({ secondsLeft: null, expired: false, label: '' })
  })

  it('llega a 0 y marca vencido', async () => {
    rpc.mockResolvedValue({ data: '2026-09-25T12:00:00Z', error: null })
    const { result } = renderHook(() => useCountdown('2026-09-25T12:00:03Z'))
    await act(async () => {})
    expect(result.current.secondsLeft).toBe(3)
    await act(async () => { vi.advanceTimersByTime(3000) })
    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.expired).toBe(true)
  })

  it('corrige el desfase del reloj del celular con la hora del servidor', async () => {
    // El servidor dice que son las 12:00:00 pero el celular va 60 s adelantado.
    vi.setSystemTime(new Date('2026-09-25T12:01:00Z'))
    rpc.mockResolvedValue({ data: '2026-09-25T12:00:00Z', error: null })
    const { result } = renderHook(() => useCountdown('2026-09-25T12:02:00Z'))
    await act(async () => {})
    expect(Math.abs(serverNow() - Date.parse('2026-09-25T12:00:00Z'))).toBeLessThan(50)
    expect(result.current.secondsLeft).toBe(120)
  })
})
