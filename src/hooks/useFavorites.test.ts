import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Supabase simulado: select devuelve ['a']; insert/delete según `writeError`.
let writeError: { message: string } | null = null
const chain = {
  select: () => ({ eq: () => Promise.resolve({ data: [{ restaurant_id: 'a' }], error: null }) }),
  insert: () => Promise.resolve({ error: writeError }),
  delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: writeError }) }) }),
}
vi.mock('@/shared/utils/supabase', () => ({ supabase: { from: () => chain } }))
const user = { id: 'u1' }
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ user }) }))

import { useFavorites } from './useLocalData'

describe('useFavorites (optimista)', () => {
  beforeEach(() => {
    writeError = null
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('marca favorito al instante y lo conserva si Supabase responde bien', async () => {
    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.toggleFavorite('b')
    })
    expect(ok).toBe(true)
    expect(result.current.isFavorite('b')).toBe(true)
  })

  it('hace rollback si Supabase falla', async () => {
    writeError = { message: 'boom' }
    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.toggleFavorite('a') // intentar quitar
    })
    expect(ok).toBe(false)
    expect(result.current.isFavorite('a')).toBe(true) // volvió
  })
})
