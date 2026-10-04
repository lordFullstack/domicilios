import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { useAuth } from '@/shared/hooks/useAuth'
import { setErrandSettingsCache } from '@/features/errands/hooks/useErrands'

// Mismos límites que los CHECK de app_settings (Domi).
export const ERRAND_LIMITS = {
  minFee: { min: 1000, max: 100000, label: 'Tarifa mínima' },
  maxBudget: { min: 10000, max: 1000000, label: 'Tope de compra' },
  quoteSeconds: { min: 30, max: 900, label: 'Tiempo del cliente para responder' },
  maxRounds: { min: 1, max: 10, label: 'Rondas de búsqueda' },
} as const

export interface ErrandAdminSettings {
  minFee: number
  maxBudget: number
  quoteSeconds: number
  maxRounds: number
}

export const isValidErrandSetting = (key: keyof typeof ERRAND_LIMITS, n: number) =>
  Number.isInteger(n) && n >= ERRAND_LIMITS[key].min && n <= ERRAND_LIMITS[key].max

export const isValidErrandSettings = (s: ErrandAdminSettings) =>
  (Object.keys(ERRAND_LIMITS) as (keyof typeof ERRAND_LIMITS)[]).every((k) => isValidErrandSetting(k, s[k]))

/** Ajustes del servicio Domi (app_settings). RLS: solo el admin actualiza. */
export const useErrandSettingsAdmin = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<ErrandAdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('app_settings')
      .select('errand_min_fee, errand_max_budget, errand_quote_seconds, errand_max_rounds')
      .eq('id', true)
      .maybeSingle()
    if (err || !data) {
      console.error('Error cargando ajustes de Domi:', err)
      setError('No pudimos cargar los ajustes de Domi')
    } else {
      setError(null)
      setSettings({
        minFee: data.errand_min_fee,
        maxBudget: data.errand_max_budget,
        quoteSeconds: data.errand_quote_seconds,
        maxRounds: data.errand_max_rounds,
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = async (next: ErrandAdminSettings): Promise<boolean> => {
    if (!isValidErrandSettings(next)) return false
    const { error: err } = await supabase
      .from('app_settings')
      .update({
        errand_min_fee: next.minFee,
        errand_max_budget: next.maxBudget,
        errand_quote_seconds: next.quoteSeconds,
        errand_max_rounds: next.maxRounds,
        updated_by: user?.id ?? null,
      })
      .eq('id', true)
    if (err) {
      console.error('Error guardando ajustes de Domi:', err)
      return false
    }
    setSettings(next)
    setErrandSettingsCache({ minFee: next.minFee, maxBudget: next.maxBudget, quoteSeconds: next.quoteSeconds })
    return true
  }

  return { settings, loading, error, reload, save }
}
