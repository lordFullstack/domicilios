import { useMemo } from 'react'
import { User, Restaurant, Order } from '@/shared/types'
import { ORDER_STATUS, USER_ROLES } from '@/config/constants'

const PLATFORM_FEE_RATE = 0.15

/**
 * Deriva las estadísticas del dashboard a partir de los datos ya cargados
 * por useAdminUsers / useAdminRestaurants / useAdminOrders — no hace
 * peticiones propias, solo calcula.
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
    const platformFee = totalRevenue * PLATFORM_FEE_RATE

    const ordersByRestaurant = restaurants.map((r) => {
      const restOrders = orders.filter((o) => o.restaurant_id === r.id)
      const revenue = restOrders
        .filter((o) => o.status === ORDER_STATUS.DELIVERED)
        .reduce((sum, o) => sum + Number(o.total), 0)
      return { restaurant: r, totalOrders: restOrders.length, revenue }
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
      platformFee,
      ordersByRestaurant,
    }
  }, [users, restaurants, orders])
}
