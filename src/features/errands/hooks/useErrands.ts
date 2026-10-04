import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { getErrandFileUrl } from '../services/errandActions.service'
import type { Errand, ErrandQuote, ErrandRating } from '../types'

/**
 * Respaldo del tiempo real: en el celular el WebSocket se duerme con la app en segundo plano
 * (y deja de avisar cuando una fila deja de ser visible para el usuario). Se recarga al volver
 * a la app / recuperar la red y cada 20 s mientras la pantalla está visible.
 */
const useRefreshFallback = (refresh: () => void) => {
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const timer = setInterval(tick, 20000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('online', tick)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('online', tick)
      window.removeEventListener('focus', tick)
    }
  }, [refresh])
}

// ============================================
// Mis Domis (cliente) o los asignados a mí (domiciliario): lo decide RLS
// ============================================

export const useMyErrands = (userId?: string) => {
  const [errands, setErrands] = useState<Errand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (silent: boolean) => {
      if (!userId) {
        setErrands([])
        setLoading(false)
        return
      }
      if (!silent) setLoading(true)
      const { data, error: err } = await supabase
        .from('errands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (err) {
        console.error('Error cargando Domis:', err)
        setError('No pudimos cargar tus Domis.')
      } else {
        setErrands((data as Errand[]) ?? [])
        setError(null)
      }
      setLoading(false)
    },
    [userId]
  )

  const reload = useCallback(() => load(false), [load])
  const silentReload = useCallback(() => load(true), [load])

  useEffect(() => {
    void reload()
  }, [reload])

  useRefreshFallback(silentReload)

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`errands-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'errands' }, () => void silentReload())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void silentReload()
      })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, silentReload])

  return { errands, loading, error, reload, silentReload }
}

// ============================================
// Un Domi con sus cotizaciones, en tiempo real
// ============================================

export const useErrand = (errandId?: string) => {
  const [errand, setErrand] = useState<Errand | null>(null)
  const [quotes, setQuotes] = useState<ErrandQuote[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (silent: boolean) => {
      if (!errandId) return
      if (!silent) setLoading(true)
      const [{ data: row }, { data: quoteRows }] = await Promise.all([
        supabase.from('errands').select('*').eq('id', errandId).maybeSingle(),
        supabase.from('errand_quotes').select('*').eq('errand_id', errandId).order('created_at', { ascending: true }),
      ])
      setErrand((row as Errand | null) ?? null)
      setQuotes((quoteRows as ErrandQuote[]) ?? [])
      setLoading(false)
    },
    [errandId]
  )

  const reload = useCallback(() => load(false), [load])
  const silentReload = useCallback(() => load(true), [load])

  useEffect(() => {
    void reload()
  }, [reload])

  useRefreshFallback(silentReload)

  useEffect(() => {
    if (!errandId) return
    const channel = supabase
      .channel(`errand-${errandId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'errands', filter: `id=eq.${errandId}` }, (payload) => {
        // La ubicación en vivo llega por aquí cada ~10 s: se aplica la fila sin volver a consultar.
        if (payload.eventType === 'UPDATE') setErrand(payload.new as Errand)
        else void silentReload()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'errand_quotes', filter: `errand_id=eq.${errandId}` }, () => {
        void silentReload()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void silentReload()
      })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [errandId, silentReload])

  return { errand, quotes, loading, reload, silentReload }
}

// ============================================
// ¿Hay Domis en turno? (gris el botón si no)
// ============================================

export const useDomisAvailable = () => {
  const [count, setCount] = useState<number | null>(null)

  const load = useCallback(async () => {
    const { count: n, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'delivery')
      .eq('active', true)
      .eq('on_shift', true)
    if (!error) setCount(n ?? 0)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useRefreshFallback(load)

  return { count, available: count === null ? null : count > 0, reload: load }
}

// ============================================
// Ajustes del servicio (app_settings)
// ============================================

export interface ErrandSettings {
  minFee: number
  maxBudget: number
  quoteSeconds: number
}

const DEFAULT_SETTINGS: ErrandSettings = { minFee: 5000, maxBudget: 100000, quoteSeconds: 120 }
let cachedSettings: ErrandSettings | null = null

export const useErrandSettings = () => {
  const [settings, setSettings] = useState<ErrandSettings>(cachedSettings ?? DEFAULT_SETTINGS)

  useEffect(() => {
    if (cachedSettings) return
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('errand_min_fee, errand_max_budget, errand_quote_seconds')
        .eq('id', true)
        .maybeSingle()
      if (!data || cancelled) return
      cachedSettings = { minFee: data.errand_min_fee, maxBudget: data.errand_max_budget, quoteSeconds: data.errand_quote_seconds }
      setSettings(cachedSettings)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}

// ============================================
// Datos públicos de la otra persona (domi o cliente)
// ============================================

export interface PublicProfile {
  id: string
  name: string
  avatar_url: string | null
  phone: string | null
  vehicle_type: string | null
  vehicle_plate: string | null
  rating_avg: number
  rating_count: number
}

export const usePublicProfile = (userId?: string | null) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, phone, vehicle_type, vehicle_plate, rating_avg, rating_count')
        .eq('id', userId)
        .maybeSingle()
      if (!cancelled) setProfile((data as PublicProfile | null) ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  return profile
}

// ============================================
// Foto privada (URL firmada)
// ============================================

export const useErrandFileUrl = (path?: string | null) => {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }
    let cancelled = false
    void getErrandFileUrl(path).then((signed) => {
      if (!cancelled) setUrl(signed)
    })
    return () => {
      cancelled = true
    }
  }, [path])

  return url
}

// ============================================
// Calificación al domi
// ============================================

export const useErrandRating = (errand?: Errand | null) => {
  const [rating, setRating] = useState<ErrandRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const errandId = errand?.id
  useEffect(() => {
    if (!errandId) {
      setLoading(false)
      return
    }
    let cancelled = false
    void (async () => {
      const { data } = await supabase.from('errand_ratings').select('*').eq('errand_id', errandId).maybeSingle()
      if (!cancelled) {
        setRating((data as ErrandRating | null) ?? null)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [errandId])

  const submitRating = async (value: number, comment?: string): Promise<boolean> => {
    if (!errand || !errand.delivery_person_id || submitting) return false
    setSubmitting(true)
    const { data, error } = await supabase
      .from('errand_ratings')
      .insert({
        errand_id: errand.id,
        client_id: errand.client_id,
        delivery_person_id: errand.delivery_person_id,
        rating: value,
        comment: comment?.trim() || null,
      })
      .select('*')
      .single()
    setSubmitting(false)
    if (error) {
      console.error('Error guardando calificación del Domi:', error)
      return false
    }
    setRating(data as ErrandRating)
    return true
  }

  return { rating, loading, submitting, submitRating }
}
