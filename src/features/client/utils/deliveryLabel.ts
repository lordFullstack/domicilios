import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'

/**
 * La app solo opera en Riohacha (single-tenant, un restaurante real).
 * No existe tabla `addresses` ni campo ciudad: la única "dirección activa"
 * real es la última que el cliente usó en Checkout, que CheckoutPage guarda
 * en localStorage (LAST_DELIVERY_ADDRESS: street/complement/reference).
 *
 * Antes el Home adivinaba la ubicación por GPS o por IP (ipapi.co), y por
 * IP salía la ciudad desde donde se conectaba el usuario (ej. Montelíbano),
 * contradiciendo el resto de la app.
 */
export const SERVICE_CITY = 'Riohacha'

interface StoredAddress {
  street?: unknown
}

/** Texto de "Entregar en": "{calle}, Riohacha" o solo "Riohacha". */
export const buildDeliveryLabel = (stored: StoredAddress | null | undefined): string => {
  const street = typeof stored?.street === 'string' ? stored.street.trim() : ''
  return street ? `${street}, ${SERVICE_CITY}` : SERVICE_CITY
}

export const getDeliveryLabel = (): string =>
  buildDeliveryLabel(localStorageService.get(STORAGE_KEYS.LAST_DELIVERY_ADDRESS))
