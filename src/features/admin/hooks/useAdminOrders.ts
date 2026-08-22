import { useState, useEffect, useCallback, useMemo } from 'react'
import { Order, OrderStatus } from '@/shared/types'
import { fetchAllOrders } from '../services/admin.service'

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [restaurantFilter, setRestaurantFilter] = useState<string | 'all'>('all')

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllOrders()
      setOrders(data)
    } catch (err) {
      console.error('Error cargando órdenes:', err)
      setError('No se pudieron cargar las órdenes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusOk = statusFilter === 'all' || o.status === statusFilter
      const restaurantOk = restaurantFilter === 'all' || o.restaurant_id === restaurantFilter
      return statusOk && restaurantOk
    })
  }, [orders, statusFilter, restaurantFilter])

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    reload,
    statusFilter,
    setStatusFilter,
    restaurantFilter,
    setRestaurantFilter,
  }
}
