import { useState, useEffect, useCallback } from 'react'
import { Restaurant } from '@/shared/types'
import {
  fetchAllRestaurants,
  updateRestaurantAdmin,
  setRestaurantApproved,
} from '../services/admin.service'

export const useAdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllRestaurants()
      setRestaurants(data)
    } catch (err) {
      console.error('Error cargando restaurantes:', err)
      setError('No se pudieron cargar los restaurantes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const editRestaurant = async (id: string, updates: Partial<Restaurant>) => {
    await updateRestaurantAdmin(id, updates)
    await reload()
  }

  const toggleApproved = async (id: string, approved: boolean) => {
    await setRestaurantApproved(id, approved)
    await reload()
  }

  return { restaurants, loading, error, reload, editRestaurant, toggleApproved }
}
