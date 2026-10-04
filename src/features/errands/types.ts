// Domi (mandados). Nombre técnico en código y BD: `errands` (para no confundirlo con el rol
// domiciliario / `delivery_person_id`). Diseño: docs/domi/.

export type ErrandType = 'purchase' | 'pickup'

export type ErrandStatus =
  | 'searching'
  | 'quoted'
  | 'accepted'
  | 'picked_up'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled'
  | 'expired'

export type ErrandCancelReason = 'customer' | 'no_domis' | 'admin'

export interface Errand {
  id: string
  client_id: string
  delivery_person_id: string | null
  type: ErrandType
  description: string
  /** Ruta en el bucket privado `errand-files`. */
  photo_url: string | null
  pickup_address: string
  pickup_notes: string | null
  dropoff_address: string
  dropoff_notes: string | null
  /** Solo en Domi de compra: lo máximo que el cliente deja gastar. */
  max_budget: number | null
  /** Lo que el domi pagó de verdad (factura). */
  purchase_amount: number | null
  /** Ruta de la foto de la factura en `errand-files`. */
  receipt_url: string | null
  /** Tarifa congelada al aprobarse; null mientras se busca/cotiza. */
  fee: number | null
  status: ErrandStatus
  assignment_round: number
  /** Plazo del servidor: oferta al domi (searching) o respuesta del cliente a una cotización (quoted). */
  accept_deadline: string | null
  current_lat: number | null
  current_lng: number | null
  location_updated_at: string | null
  cancel_reason: ErrandCancelReason | null
  created_at: string
  updated_at: string
}

export type ErrandQuoteStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface ErrandQuote {
  id: string
  errand_id: string
  driver_id: string
  amount: number
  driver_note: string
  status: ErrandQuoteStatus
  client_note: string | null
  created_at: string
  responded_at: string | null
}

export interface ErrandRating {
  id: string
  errand_id: string
  client_id: string
  delivery_person_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface NewErrandInput {
  id: string
  type: ErrandType
  description: string
  photoPath: string | null
  pickupAddress: string
  pickupNotes: string
  dropoffAddress: string
  dropoffNotes: string
  maxBudget: number | null
}
