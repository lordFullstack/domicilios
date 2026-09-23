import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { useAuth } from '@/shared/hooks/useAuth'
import { setDeliveryFeeCache } from '@/shared/hooks/useDeliveryFee'

export const MAX_DELIVERY_FEE = 100000 // mismo tope que el CHECK de app_settings

interface FeeSettings {
  delivery_fee: number
  updated_at: string
}

/**
 * Lectura/escritura de la tarifa de domicilio para el Admin.
 * RLS: todos leen `app_settings`, solo `is_admin()` actualiza.
 */
export const useDeliveryFeeSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<FeeSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('app_settings')
      .select('delivery_fee, updated_at')
      .eq('id', true)
      .maybeSingle()
    if (error || !data) {
      console.error('Error cargando tarifa de domicilio:', error)
      setError('No pudimos cargar la tarifa de domicilio')
    } else {
      setError(null)
      setSettings(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const saveFee = async (fee: number): Promise<boolean> => {
    if (!Number.isInteger(fee) || fee < 0 || fee > MAX_DELIVERY_FEE) return false
    const { data, error } = await supabase
      .from('app_settings')
      .update({ delivery_fee: fee, updated_by: user?.id ?? null })
      .eq('id', true)
      .select('delivery_fee, updated_at')
      .maybeSingle()
    // Sin fila devuelta = RLS bloqueó el update (no es admin).
    if (error || !data) {
      console.error('Error guardando tarifa de domicilio:', error)
      return false
    }
    setSettings(data)
    setDeliveryFeeCache(data.delivery_fee)
    return true
  }

  return { settings, loading, error, reload, saveFee }
}
