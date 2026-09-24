// Lógica pura de send-push (sin dependencias de Deno): se prueba con vitest.
// LOOP_SECURITY_02: la función solo obedece a una notificación que el sistema ya creó.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ParseResult = { ok: true; notificationId: string } | { ok: false; error: string }

/**
 * El cuerpo de la petición debe ser exactamente `{ "notification_id": "<uuid>" }`.
 * Se rechaza cualquier otro formato (incluido el antiguo `{ userId, type, orderId }`):
 * el llamante no puede elegir destinatario ni texto.
 */
export const parseRequest = (raw: unknown): ParseResult => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: 'Cuerpo inválido' }
  }
  const keys = Object.keys(raw)
  if (keys.length !== 1 || keys[0] !== 'notification_id') {
    return { ok: false, error: 'Formato no soportado: solo se acepta { notification_id }' }
  }
  const id = (raw as Record<string, unknown>).notification_id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return { ok: false, error: 'notification_id inválido' }
  }
  return { ok: true, notificationId: id }
}

export interface NotificationRow {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  order_id: string | null
}

/** Pantalla que abre el push, según el rol del destinatario (la app ya tiene estas rutas). */
export const pathFor = (role: string | null | undefined, orderId: string | null): string => {
  if (role === 'restaurant') return '/restaurant/orders'
  if (role === 'delivery') return '/delivery/active'
  return orderId ? `/app/order/${orderId}` : '/app'
}

/** Payload del push: sale SOLO de la fila de notifications (título, cuerpo, pedido) y del rol. */
export const buildPayload = (n: NotificationRow, role: string | null | undefined) =>
  JSON.stringify({
    title: n.title,
    body: n.body,
    url: pathFor(role, n.order_id),
    orderId: n.order_id,
  })
