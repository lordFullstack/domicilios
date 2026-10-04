import { ShoppingBag, RefreshCw, Bike, Bell, Package, LucideIcon } from 'lucide-react'
import { ROUTES, USER_ROLES } from '@/config/constants'

/**
 * La tabla `notifications` solo tiene un `type` real hoy ('order') — no
 * hay una taxonomía más fina en el backend. El título sí es un texto real
 * y estable (lo escribe el trigger `handle_order_notification()`), así
 * que lo usamos para elegir un ícono con sentido sin inventar una columna
 * nueva.
 */
export const getNotificationIcon = (title: string): LucideIcon => {
  if (title.includes('Domi')) return Package
  if (title.includes('Cotización')) return Package
  if (title.includes('Nuevo pedido')) return ShoppingBag
  if (title.includes('Entrega asignada')) return Bike
  if (title.includes('Actualización')) return RefreshCw
  return Bell
}

/**
 * A dónde navegar al tocar una notificación, según el rol de quien la
 * recibe. No existe una pantalla de "detalle de pedido" dedicada para
 * Restaurante/Domiciliario (solo listados), así que el deep-link llega
 * hasta donde realmente hay una pantalla — no se inventa una ruta.
 */
export const getNotificationTarget = (role: string, orderId?: string | null, errandId?: string | null): string | null => {
  // Domi (mandado): el cliente abre su seguimiento; el domiciliario, su panel.
  if (errandId) {
    if (role === USER_ROLES.CLIENT) return ROUTES.DOMI_DETAIL.replace(':id', errandId)
    if (role === USER_ROLES.DELIVERY) return ROUTES.DELIVERY_DASHBOARD
    return null
  }
  if (!orderId) return null
  if (role === USER_ROLES.CLIENT) return ROUTES.CLIENT_ORDER.replace(':id', orderId)
  if (role === USER_ROLES.RESTAURANT) return ROUTES.RESTAURANT_ORDERS
  if (role === USER_ROLES.DELIVERY) return ROUTES.DELIVERY_DASHBOARD
  if (role === USER_ROLES.ADMIN) return ROUTES.ADMIN_ORDERS
  return null
}
