import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { Order, OrderStatus } from '@/shared/types'
import { fetchAllOrders } from '../services/admin.service'
import { filterOrdersByPeriod, Period } from './useAdminStats'

interface UpdateResult {
  ok: boolean
  reason?: 'conflict' | 'error'
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [restaurantFilter, setRestaurantFilter] = useState<string | 'all'>('all')
  const [period, setPeriod] = useState<Period>('all')
  const [search, setSearch] = useState('')

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
    const term = search.trim().toLowerCase()
    const byPeriod = filterOrdersByPeriod(orders, period)
    return byPeriod.filter((o) => {
      const statusOk = statusFilter === 'all' || o.status === statusFilter
      const restaurantOk = restaurantFilter === 'all' || o.restaurant_id === restaurantFilter
      const searchOk =
        !term ||
        o.id.toLowerCase().includes(term) ||
        (o.delivery_address || '').toLowerCase().includes(term)
      return statusOk && restaurantOk && searchOk
    })
  }, [orders, statusFilter, restaurantFilter, period, search])

  /**
   * Update "seguro": solo aplica si el pedido sigue en el estado que el
   * admin vio al abrirlo. Si alguien más (cliente, restaurante,
   * domiciliario) lo cambió mientras el panel estaba abierto, esto no
   * pisa ese cambio silenciosamente — devuelve 'conflict' para que la UI
   * avise y recargue. Mismo espíritu que acceptOrder() del domiciliario.
   */
  const updateOrderSafely = useCallback(
    async (orderId: string, expectedStatus: string, updates: Record<string, unknown>): Promise<UpdateResult> => {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .eq('status', expectedStatus)
        .select()
        .maybeSingle()

      if (updateError) {
        console.error('Error actualizando orden:', updateError)
        return { ok: false, reason: 'error' }
      }
      if (!data) {
        await reload()
        return { ok: false, reason: 'conflict' }
      }
      await reload()
      return { ok: true }
    },
    [reload]
  )

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
    period,
    setPeriod,
    search,
    setSearch,
    updateOrderSafely,
  }
}
