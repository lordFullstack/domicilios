import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { deliverySetShift } from '@/services/orderActions.service'

/**
 * Turno del domiciliario ("En turno" / "Fuera de turno"). La lectura viene de
 * su perfil y el cambio se hace por la RPC `delivery_set_shift`.
 */
export const useDriverShift = (userId?: string) => {
  const [onShift, setOnShift] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase
      .from('profiles')
      .select('on_shift')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setOnShift(data?.on_shift === true)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const toggle = useCallback(async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    const res = await deliverySetShift(!onShift)
    if (res.ok) setOnShift(res.onShift)
    else setError(res.reason ?? null)
    setSaving(false)
  }, [onShift, saving])

  return { onShift, loading, saving, error, toggle }
}
