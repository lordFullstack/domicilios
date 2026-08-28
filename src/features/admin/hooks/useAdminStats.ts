import { useMemo } from 'react'
import { User, Restaurant, Order } from '@/shared/types'
import { ORDER_STATUS, USER_ROLES } from '@/config/constants'

export type Period = 'today' | '7d' | '30d' | 'all'

// Antes existía un `PLATFORM_FEE_RATE = 0.15` que calculaba una "comisión
// de plataforma" de la nada — no hay ninguna columna de comisión en ningún
// lado del backend (ni en `orders` ni en `restaurants`). Se quitó por
// completo en vez de seguir mostrando un número inventado (mismo problema
// que encontramos con "ganancias" del domiciliario en el LOOP anterior).

export const filterOrdersByPeriod = (orders: Order[], period: Period): Order[] => {
  if (period === 'all') return orders
  const now = new Date()
  const cutoff = new Date(now)
  if (period === 'today') {
    cutoff.setHours(0, 0, 0, 0)
  } else if (period === '7d') {
    cutoff.setDate(cutoff.getDate() - 7)
  } else {
    cutoff.setDate(cutoff.getDate() - 30)
  }
  return orders.filter((o) => new Date(o.created_at) >= cutoff)
}

/**
 * Deriva las estadísticas del dashboard a partir de los datos ya cargados
 * por useAdminUsers / useAdminRestaurants / useAdminOrders — no hace
 * peticiones propias, solo calcula sobre datos reales.
 */
export const useAdminStats = (users: User[], restaurants: Restaurant[], orders: Order[]) => {
  return useMemo(() => {
    const totalClients = users.filter((u) => u.role === USER_ROLES.CLIENT).length
    const totalRestaurantOwners = users.filter((u) => u.role === USER_ROLES.RESTAURANT).length
    const totalDelivery = users.filter((u) => u.role === USER_ROLES.DELIVERY).length

    const deliveredOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED)
    const activeOrders = orders.filter(
      (o) => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED
    )
    const cancelledOrders = orders.filter((o) => o.status === ORDER_STATUS.CANCELLED)

    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const averageTicket = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0
    const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0

    const ordersByRestaurant = restaurants.map((r) => {
      const restOrders = orders.filter((o) => o.restaurant_id === r.id)
      const revenue = restOrders
        .filter((o) => o.status === ORDER_STATUS.DELIVERED)
        .reduce((sum, o) => sum + Number(o.total), 0)
      return { restaurant: r, totalOrders: restOrders.length, revenue }
    })

    // Pedidos por día (últimos 7 días reales, con conteo en 0 si no hubo
    // ninguno — no se inventan datos entre medio).
    const ordersByDay = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date()
      day.setDate(day.getDate() - (6 - i))
      const dayKey = day.toDateString()
      const count = orders.filter((o) => new Date(o.created_at).toDateString() === dayKey).length
      return {
        label: day.toLocaleDateString('es-CO', { weekday: 'short' }),
        count,
      }
    })

    return {
      totalUsers: users.length,
      totalClients,
      totalRestaurantOwners,
      totalDelivery,
      totalOrders: orders.length,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageTicket,
      cancellationRate,
      ordersByRestaurant,
      ordersByDay,
    }
  }, [users, restaurants, orders])
}
