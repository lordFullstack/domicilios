// Llave de idempotencia del checkout (orders.client_order_id).
// Se mantiene mientras el carrito no cambie, incluso tras recargar la página
// o reintentar un envío fallido; así el servidor devuelve el mismo pedido en
// vez de crear uno duplicado. Se limpia solo tras un pedido exitoso.

const STORAGE_KEY = 'checkout_client_order_id'

type Stored = { id: string; sig: string }

export const generateUuid = (): string => {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  const b = new Uint8Array(16)
  c.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40 // versión 4
  b[8] = (b[8] & 0x3f) | 0x80 // variante RFC 4122
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

// Firma del carrito: mismos productos y cantidades => misma firma.
export const cartSignature = (items: { productId: string; quantity: number }[]): string =>
  items
    .map((i) => `${i.productId}:${i.quantity}`)
    .sort()
    .join('|')

const read = (): Stored | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.id === 'string' && typeof parsed?.sig === 'string' ? parsed : null
  } catch {
    return null
  }
}

export const getOrCreate = (sig: string): { id: string } => {
  const stored = read()
  if (stored && stored.sig === sig) return { id: stored.id }
  const id = generateUuid()
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id, sig }))
  } catch {
    // sessionStorage no disponible: la llave vive solo en esta llamada.
  }
  return { id }
}

export const clear = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // nada que limpiar
  }
}
