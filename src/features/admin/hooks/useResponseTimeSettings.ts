import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { useAuth } from '@/shared/hooks/useAuth'

// Mismos límites que los CHECK de app_settings (LOOP_FLOW_01).
export const MIN_RESPONSE_SECONDS = 30
export const MAX_RESPONSE_SECONDS = 900

export interface ResponseTimes {
  restaurant_confirm_seconds: number
  delivery_accept_seconds: number
  updated_at: string
}

export const isValidResponseSeconds = (n: number) =>
  Number.isInteger(n) && n >= MIN_RESPONSE_SECONDS && n <= MAX_RESPONSE_SECONDS

/** Tiempos de respuesta (restaurante confirma / domiciliario acepta). RLS: solo admin actualiza. */
export const useResponseTimeSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<ResponseTimes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('app_settings')
      .select('restaurant_confirm_seconds, delivery_accept_seconds, updated_at')
      .eq('id', true)
      .maybeSingle()
    if (error || !data) {
      console.error('Error cargando tiempos de respuesta:', error)
      setError('No pudimos cargar los tiempos de respuesta')
    } else {
      setError(null)
      setSettings(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const save = async (restaurantSeconds: number, deliverySeconds: number): Promise<boolean> => {
    if (!isValidResponseSeconds(restaurantSeconds) || !isValidResponseSeconds(deliverySeconds)) return false
    const { data, error } = await supabase
      .from('app_settings')
      .update({
        restaurant_confirm_seconds: restaurantSeconds,
        delivery_accept_seconds: deliverySeconds,
        updated_by: user?.id ?? null,
      })
      .eq('id', true)
      .select('restaurant_confirm_seconds, delivery_accept_seconds, updated_at')
      .maybeSingle()
    if (error || !data) {
      console.error('Error guardando tiempos de respuesta:', error)
      return false
    }
    setSettings(data)
    return true
  }

  return { settings, loading, error, reload, save }
}
