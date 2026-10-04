import { supabase } from '@/shared/utils/supabase'
import type { Errand, NewErrandInput } from '../types'
import type { PreparedImage } from '../utils/image'

/**
 * Transiciones de Domi. Igual que los pedidos: todo cambio pasa por una función del servidor
 * (SECURITY DEFINER) que valida rol, propiedad, estado y concurrencia. No hay `errands.update()`.
 */

export interface ErrandActionResult {
  ok: boolean
  errand: Errand | null
  /** Código estable de la RPC (p. ej. `no_domis_available`). */
  code?: string
  /** Mensaje listo para mostrar al usuario. */
  reason?: string
}

export const ERRAND_ACTION_ERRORS: Record<string, string> = {
  not_authenticated: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  not_authorized: 'No tienes permiso para hacer esto. Si crees que es un error, escríbenos.',
  no_domis_available: 'No hay Domis disponibles en este momento. Intenta de nuevo en unos minutos.',
  too_many_errands: 'Ya tienes 3 Domis en curso. Espera a que termine alguno para pedir otro.',
  invalid_type: 'Elige un tipo de Domi válido.',
  invalid_budget: 'Revisa el presupuesto máximo: debe ser mayor a cero y no pasar el tope permitido.',
  invalid_photo: 'No pudimos usar la foto. Intenta con otra.',
  errand_unavailable: 'Este Domi ya no está disponible.',
  errand_not_found: 'Este Domi ya no está disponible.',
  errand_not_assigned: 'Este Domi ya no está asignado a ti.',
  errand_expired: 'Se acabó el tiempo para responder este Domi.',
  invalid_transition: 'El Domi cambió de estado. Actualizamos la pantalla.',
  quote_expired: 'Se acabó el tiempo para responder la cotización.',
  quote_not_found: 'Esta cotización ya no está disponible.',
  note_required: 'Escribe una nota (mínimo 3 letras).',
  invalid_amount: 'Revisa el monto: debe ser un valor válido.',
  requote_limit: 'Ya cotizaste dos veces este Domi. Acepta el precio mínimo o suelta el Domi.',
  over_budget: 'La compra supera el presupuesto máximo del cliente.',
  receipt_required: 'Sube la foto de la factura para continuar.',
  delivery_busy: 'Ya tienes una entrega en camino. Termínala para aceptar otra.',
  invalid_location: 'La ubicación no es válida.',
}

const FALLBACK_MESSAGE = 'No pudimos completar la acción. Intenta de nuevo.'

// El mensaje de Postgres trae el código dentro del texto: se busca por coincidencia.
const CODES = Object.keys(ERRAND_ACTION_ERRORS)

export const errandErrorCode = (raw?: string) => CODES.find((c) => raw?.includes(c))

export const errandErrorMessage = (raw?: string) => {
  const code = errandErrorCode(raw)
  return code ? ERRAND_ACTION_ERRORS[code] : FALLBACK_MESSAGE
}

const callErrandRpc = async (fn: string, args: Record<string, unknown>): Promise<ErrandActionResult> => {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    console.error(`Error en ${fn}:`, error)
    return { ok: false, errand: null, code: errandErrorCode(error.message), reason: errandErrorMessage(error.message) }
  }
  return { ok: true, errand: (data as Errand | null) ?? null }
}

// ---------------- Archivos (bucket privado errand-files) ----------------

/** Ruta: <uid de quien sube>/<errand_id>/<nombre>.<ext>. Lo exige la política del bucket. */
export const errandFilePath = (uid: string, errandId: string, name: 'request' | 'receipt', ext: string) =>
  `${uid}/${errandId}/${name}-${Date.now()}.${ext}`

export const uploadErrandFile = async (path: string, image: PreparedImage): Promise<boolean> => {
  const { error } = await supabase.storage
    .from('errand-files')
    .upload(path, image.blob, { contentType: image.contentType, upsert: false })
  if (error) console.error('Error subiendo archivo del Domi:', error)
  return !error
}

/** URL temporal (1 h) para ver una foto privada. */
export const getErrandFileUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage.from('errand-files').createSignedUrl(path, 3600)
  if (error) {
    console.error('Error firmando archivo del Domi:', error)
    return null
  }
  return data.signedUrl
}

// ---------------- Cliente ----------------

export const clientCreateErrand = (input: NewErrandInput) =>
  callErrandRpc('client_create_errand', {
    p_errand_id: input.id,
    p_type: input.type,
    p_description: input.description,
    p_photo_path: input.photoPath,
    p_pickup_address: input.pickupAddress,
    p_pickup_notes: input.pickupNotes || null,
    p_dropoff_address: input.dropoffAddress,
    p_dropoff_notes: input.dropoffNotes || null,
    p_max_budget: input.maxBudget,
  })

export const clientCancelErrand = (errandId: string) => callErrandRpc('client_cancel_errand', { p_errand_id: errandId })

export const clientRespondQuote = (errandId: string, approve: boolean, note?: string) =>
  callErrandRpc('client_respond_errand_quote', { p_errand_id: errandId, p_approve: approve, p_note: note ?? null })

// ---------------- Admin ----------------

/** Cancela un Domi atascado (domi desaparecido, cliente que no responde). Avisa a las dos partes. */
export const adminCancelErrand = (errandId: string) => callErrandRpc('admin_cancel_errand', { p_errand_id: errandId })

// ---------------- Domiciliario ----------------

export const deliveryAcceptErrand = (errandId: string) => callErrandRpc('delivery_errand_accept', { p_errand_id: errandId })

export const deliveryQuoteErrand = (errandId: string, amount: number, note: string) =>
  callErrandRpc('delivery_errand_quote', { p_errand_id: errandId, p_amount: amount, p_note: note })

export const deliveryRejectErrand = (errandId: string) => callErrandRpc('delivery_errand_reject', { p_errand_id: errandId })

export const deliveryErrandPickedUp = (errandId: string, purchaseAmount?: number, receiptPath?: string) =>
  callErrandRpc('delivery_errand_picked_up', {
    p_errand_id: errandId,
    p_purchase_amount: purchaseAmount ?? null,
    p_receipt_path: receiptPath ?? null,
  })

export const deliveryStartErrandDelivery = (errandId: string) =>
  callErrandRpc('delivery_errand_start_delivery', { p_errand_id: errandId })

export const deliveryCompleteErrand = (errandId: string) => callErrandRpc('delivery_errand_complete', { p_errand_id: errandId })

/** GPS: silencioso (se manda muy seguido); devuelve si el servidor lo aceptó. */
export const deliveryUpdateErrandLocation = async (errandId: string, lat: number, lng: number): Promise<boolean> => {
  const { error } = await supabase.rpc('delivery_errand_update_location', { p_errand_id: errandId, p_lat: lat, p_lng: lng })
  if (error) console.error('Error actualizando ubicación del Domi:', error)
  return !error
}
