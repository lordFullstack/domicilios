import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getOrCreate, clear, generateUuid, cartSignature, orderSignature } from './clientOrderId'

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

describe('orderSignature (D2): cualquier dato del pedido cambia la llave', () => {
  const base = {
    restaurantId: 'r1',
    items: [{ productId: 'p1', quantity: 1 }],
    paymentMethod: 'cash_on_delivery',
    cashAmount: 50000,
    notes: 'sin cebolla',
    address: 'Calle 15 #10-20',
  }

  it('los mismos datos dan la misma firma (aunque cambie el orden de los items o sobren espacios)', () => {
    const a = orderSignature({ ...base, items: [{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 2 }] })
    const b = orderSignature({
      ...base,
      items: [{ productId: 'p2', quantity: 2 }, { productId: 'p1', quantity: 1 }],
      notes: '  sin cebolla ',
      address: ' Calle 15 #10-20 ',
    })
    expect(a).toBe(b)
  })

  it.each([
    ['restaurante', { restaurantId: 'r2' }],
    ['items', { items: [{ productId: 'p1', quantity: 2 }] }],
    ['método de pago', { paymentMethod: 'online' }],
    ['monto en efectivo', { cashAmount: 60000 }],
    ['notas', { notes: 'con cebolla' }],
    ['dirección', { address: 'Calle 16 #10-20' }],
  ])('cambiar %s => firma distinta', (_name, change) => {
    expect(orderSignature({ ...base, ...change })).not.toBe(orderSignature(base))
  })

  it('efectivo vacío/null y notas vacías se normalizan igual', () => {
    expect(orderSignature({ ...base, cashAmount: null, notes: '' })).toBe(orderSignature({ ...base, cashAmount: undefined, notes: undefined }))
  })
})
