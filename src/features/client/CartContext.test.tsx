import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

vi.mock('@/shared/utils/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ in: (_: string, ids: string[]) => Promise.resolve({ data: ids.map((id) => ({ id })) }) }) }),
  },
}))

import { CartProvider, MAX_ITEM_QUANTITY } from './CartContext'
import { useCartContext } from '@/shared/hooks/useCartContext'

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>

describe('CartContext', () => {
  beforeEach(() => localStorage.clear())

  it('addItem no muta el estado anterior', async () => {
    const { result } = renderHook(() => useCartContext(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.addItem('p1', 1000)
    })
    const before = result.current.cart
    const itemBefore = before[0]
    act(() => {
      result.current.addItem('p1', 1000)
    })
    expect(itemBefore.quantity).toBe(1) // el objeto viejo quedó intacto
    expect(result.current.cart[0].quantity).toBe(2)
    expect(result.current.cart).not.toBe(before)
  })

  it('clear() + addItem() en el mismo evento deja solo el producto nuevo ("Vaciar y agregar")', async () => {
    const { result } = renderHook(() => useCartContext(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.addItem('otro-restaurante', 5000, 2)
    })
    act(() => {
      result.current.clear()
      result.current.addItem('nuevo', 3000)
    })
    expect(result.current.cart).toEqual([{ productId: 'nuevo', quantity: 1, unitPrice: 3000 }])
  })

  it(`no pasa de ${MAX_ITEM_QUANTITY} unidades por producto`, async () => {
    const { result } = renderHook(() => useCartContext(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.addItem('p1', 1000, 98)
      result.current.addItem('p1', 1000, 5)
    })
    expect(result.current.cart[0].quantity).toBe(MAX_ITEM_QUANTITY)
  })
})
