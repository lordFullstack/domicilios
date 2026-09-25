import { describe, it, expect } from 'vitest'
import { classifyCheckoutError } from './checkoutError'

describe('classifyCheckoutError', () => {
  it('cada código de la RPC lleva a su causa', () => {
    expect(classifyCheckoutError('not_authenticated')).toBe('session')
    expect(classifyCheckoutError('invalid_address')).toBe('validation')
    expect(classifyCheckoutError('invalid_payment_method')).toBe('validation')
    expect(classifyCheckoutError('invalid_cash_amount')).toBe('validation')
    expect(classifyCheckoutError('notes_too_long')).toBe('validation')
    expect(classifyCheckoutError('restaurant_closed')).toBe('closed')
    expect(classifyCheckoutError('restaurant_unavailable')).toBe('closed')
    expect(classifyCheckoutError('empty_cart')).toBe('cart')
    expect(classifyCheckoutError('invalid_quantity')).toBe('cart')
    expect(classifyCheckoutError('invalid_products')).toBe('cart')
  })

  it('sin código o desconocido => red (reintentar)', () => {
    expect(classifyCheckoutError(undefined)).toBe('network')
    expect(classifyCheckoutError(null)).toBe('network')
    expect(classifyCheckoutError('algo raro')).toBe('network')
  })
})
