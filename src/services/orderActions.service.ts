import { supabase } from '@/shared/utils/supabase'
import { triggerOrderPushNotification } from '@/services/pushNotifications.service'
import type { Order } from '@/shared/types'

/**
 * Transiciones de pedido (LOOP_SECURITY_01). Todo cambio de estado, la
 * asignación de domiciliario y el GPS pasan por RPC del servidor: el
 * navegador solo pide la acción, y la base valida rol, propiedad, estado y
 * concurrencia. NO hay `orders.update()` en estos flujos.
 */

export interface OrderActionResult {
  ok: boolean
  order: Order | null
  /** Código estable de la RPC (p. ej. `no_delivery_available`). */
  code?: string
  /** Mensaje listo para mostrar al usuario. */
  reason?: string
}

export const ORDER_ACTION_ERRORS: Record<string, string> = {
  not_authenticated: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  not_authorized: 'No tienes permiso para hacer esto. Si crees que es un error, escríbenos.',
  order_not_found: 'Este pedido ya no está disponible.',
  invalid_transition: 'El pedido cambió de estado. Actualizamos la pantalla.',
  no_delivery_available: 'No hay domiciliarios disponibles en este momento. Intenta de nuevo en unos minutos.',
  order_unavailable: 'Este pedido ya fue asignado o cambió de estado.',
  delivery_busy: 'Ya tienes una entrega en camino. Termínala para aceptar otra.',
  order_not_assigned: 'Este pedido ya no está asignado a ti.',
  invalid_location: 'La ubicación no es válida.',
}

const FALLBACK_MESSAGE = 'No pudimos completar la acción. Intenta de nuevo.'

const errorCode = (raw?: string) => Object.keys(ORDER_ACTION_ERRORS).find((c) => raw?.includes(c))

export const orderActionErrorMessage = (raw?: string) => {
  const code = errorCode(raw)
  return code ? ORDER_ACTION_ERRORS[code] : FALLBACK_MESSAGE
}

const callOrderRpc = async (fn: string, args: Record<string, unknown>): Promise<OrderActionResult> => {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    console.error(`Error en ${fn}:`, error)
    return { ok: false, order: null, code: errorCode(error.message), reason: orderActionErrorMessage(error.message) }
  }
  return { ok: true, order: (data as Order | null) ?? null }
}

// Los avisos push los sigue disparando el navegador de quien actúa (hasta
// LOOP_SECURITY_02): fire-and-forget, un fallo aquí nunca rompe la acción.
const notifyAssigned = (order: Order | null) => {
  if (order?.delivery_person_id) void triggerOrderPushNotification(order.delivery_person_id, 'assigned', order.id)
}

// ---------------- Restaurante ----------------

export const restaurantAdvanceOrder = (orderId: string) =>
  callOrderRpc('restaurant_advance_order', { p_order_id: orderId })

export const restaurantCancelOrder = (orderId: string) =>
  callOrderRpc('restaurant_cancel_order', { p_order_id: orderId })

export const restaurantAssignDelivery = async (orderId: string) => {
  const res = await callOrderRpc('restaurant_assign_delivery', { p_order_id: orderId })
  if (res.ok) notifyAssigned(res.order)
  return res
}

export const restaurantRetryAssignment = async (orderId: string) => {
  const res = await callOrderRpc('restaurant_retry_assignment', { p_order_id: orderId })
  if (res.ok) notifyAssigned(res.order)
  return res
}

/**
 * "Enviar": asigna al siguiente domiciliario disponible. Si nadie es elegible
 * en la ronda actual (p. ej. todos rechazaron), abre una nueva ronda una vez.
 */
export const restaurantSendOrder = async (orderId: string) => {
  const first = await restaurantAssignDelivery(orderId)
  if (first.ok || first.code !== 'no_delivery_available') return first
  return restaurantRetryAssignment(orderId)
}

// ---------------- Domiciliario ----------------

export const deliverySetShift = async (onShift: boolean): Promise<{ ok: boolean; onShift: boolean; reason?: string }> => {
  const { data, error } = await supabase.rpc('delivery_set_shift', { p_on_shift: onShift })
  if (error) {
    console.error('Error en delivery_set_shift:', error)
    return { ok: false, onShift: !onShift, reason: orderActionErrorMessage(error.message) }
  }
  return { ok: true, onShift: data === true }
}

export const deliveryAcceptOrder = async (orderId: string) => {
  const res = await callOrderRpc('delivery_accept_order', { p_order_id: orderId })
  if (res.ok && res.order) void triggerOrderPushNotification(res.order.user_id, 'in_delivery', res.order.id)
  return res
}

export const deliveryRejectOrder = async (orderId: string) => {
  const res = await callOrderRpc('delivery_reject_order', { p_order_id: orderId })
  if (res.ok) notifyAssigned(res.order) // si se reasignó a otro, se le avisa
  return res
}

export const deliveryCompleteOrder = async (orderId: string) => {
  const res = await callOrderRpc('delivery_complete_order', { p_order_id: orderId })
  if (res.ok && res.order) void triggerOrderPushNotification(res.order.user_id, 'delivered', res.order.id)
  return res
}

/** GPS: silencioso (se manda muy seguido); devuelve si el servidor lo aceptó. */
export const deliveryUpdateLocation = async (orderId: string, lat: number, lng: number): Promise<boolean> => {
  const { error } = await supabase.rpc('delivery_update_location', { p_order_id: orderId, p_lat: lat, p_lng: lng })
  if (error) console.error('Error actualizando ubicación:', error)
  return !error
}

// ---------------- Cliente ----------------

export const clientCancelOrder = (orderId: string) =>
  callOrderRpc('client_cancel_order', { p_order_id: orderId })
