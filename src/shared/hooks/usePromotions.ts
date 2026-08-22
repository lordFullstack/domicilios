import { useState, useEffect } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { Promotion, PromotionType } from '@/shared/types'

/**
 * Trae las promociones activas y vigentes de un tipo dado.
 * El filtro de "activo y en fecha" lo hace la política RLS
 * `promotions_select_active_or_admin`, no este hook — así que
 * cualquier fila que llegue aquí ya es segura de mostrar.
 */
export const usePromotions = (type: PromotionType) => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('type', type)
        .order('display_order', { ascending: true })

      if (!cancelled) {
        if (error) {
          console.error(`Error cargando promociones (${type}):`, error)
          setPromotions([])
        } else {
          setPromotions((data || []) as Promotion[])
        }
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [type])

  return { promotions, loading }
}
