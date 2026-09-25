// Causa de un fallo del checkout, a partir del código que devuelve la RPC create_order.
// Decide qué pantalla y qué salida ve el cliente (LOOP_CLIENT_05C, D5).

export type CheckoutFailure = 'session' | 'validation' | 'closed' | 'cart' | 'network'

const BY_CODE: Record<string, CheckoutFailure> = {
  not_authenticated: 'session',
  invalid_address: 'validation',
  invalid_payment_method: 'validation',
  invalid_cash_amount: 'validation',
  notes_too_long: 'validation',
  restaurant_unavailable: 'closed',
  restaurant_closed: 'closed',
  empty_cart: 'cart',
  invalid_quantity: 'cart',
  invalid_products: 'cart',
}

/** Sin código conocido (red caída, error inesperado) => 'network': se ofrece reintentar. */
export const classifyCheckoutError = (code?: string | null): CheckoutFailure =>
  (code && BY_CODE[code]) || 'network'
