import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getOrCreate, clear, generateUuid, cartSignature } from './clientOrderId'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('clientOrderId', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('genera un UUID nuevo y lo persiste en sessionStorage', () => {
    const { id } = getOrCreate('a:1')
    expect(id).toMatch(UUID_V4)
    expect(JSON.parse(sessionStorage.getItem('checkout_client_order_id')!)).toEqual({ id, sig: 'a:1' })
  })

  it('con la misma firma devuelve el mismo id (reintento / recarga)', () => {
    const first = getOrCreate('a:1')
    expect(getOrCreate('a:1').id).toBe(first.id)
  })

  it('si la firma cambia, regenera el id', () => {
    const first = getOrCreate('a:1')
    const second = getOrCreate('a:2')
    expect(second.id).not.toBe(first.id)
    expect(getOrCreate('a:2').id).toBe(second.id)
  })

  it('clear() borra la llave; el siguiente getOrCreate genera otra', () => {
    const first = getOrCreate('a:1')
    clear()
    expect(sessionStorage.getItem('checkout_client_order_id')).toBeNull()
    expect(getOrCreate('a:1').id).not.toBe(first.id)
  })

  it('ignora un valor corrupto en sessionStorage', () => {
    sessionStorage.setItem('checkout_client_order_id', '{no-json')
    expect(getOrCreate('a:1').id).toMatch(UUID_V4)
  })

  it('fallback v4 con getRandomValues cuando no hay randomUUID', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (a: Uint8Array) => {
        a.forEach((_, i) => (a[i] = (i * 37 + 11) & 0xff))
        return a
      },
    })
    expect(generateUuid()).toMatch(UUID_V4)
  })

  it('cartSignature no depende del orden de los items', () => {
    const a = cartSignature([{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 2 }])
    const b = cartSignature([{ productId: 'p2', quantity: 2 }, { productId: 'p1', quantity: 1 }])
    expect(a).toBe(b)
    expect(cartSignature([{ productId: 'p1', quantity: 2 }])).not.toBe(cartSignature([{ productId: 'p1', quantity: 1 }]))
  })
})
