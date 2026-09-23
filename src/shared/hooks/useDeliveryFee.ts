import { useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'
import { formatCOP } from '@/shared/utils/money'

/**
 * Tarifa de domicilio (COP) que fija el Admin en `app_settings` — lo que
 * cobra el domiciliario por entrega. Es la misma para todos los pedidos.
 *
 * Caché a nivel de módulo: la leen muchas tarjetas a la vez (Home,
 * Restaurantes, detalle, carrito) y así se consulta UNA vez por sesión.
 *
 * OJO: esto es solo para MOSTRAR. El cobro real lo decide el servidor en
 * `create_order`, que lee la tarifa vigente al momento de confirmar.
 */
let cached: number | null = null
let inflight: Promise<number | null> | null = null
const listeners = new Set<(fee: number | null) => void>()

const publish = (fee: number | null) => {
  cached = fee
  listeners.forEach((l) => l(fee))
}

export const fetchDeliveryFee = (force = false): Promise<number | null> => {
  if (!force && cached !== null) return Promise.resolve(cached)
  if (!force && inflight) return inflight
  inflight = (async () => {
    const { data, error } = await supabase.from('app_settings').select('delivery_fee').eq('id', true).maybeSingle()
    inflight = null
    if (error || !data) {
      if (error) console.error('Error cargando tarifa de domicilio:', error)
      return cached
    }
    publish(data.delivery_fee)
    return data.delivery_fee
  })()
  return inflight
}

/** Para el panel Admin: refleja un cambio guardado sin recargar la app. */
export const setDeliveryFeeCache = (fee: number) => publish(fee)

/** `fee` es null mientras carga o si no se pudo leer. */
export const useDeliveryFee = () => {
  const [fee, setFee] = useState<number | null>(cached)

  useEffect(() => {
    listeners.add(setFee)
    fetchDeliveryFee()
    return () => {
      listeners.delete(setFee)
    }
  }, [])

  return { fee }
}

/** Test-only: reinicia la caché del módulo. */
export const __resetDeliveryFeeCache = () => {
  cached = null
  inflight = null
}

/** Texto corto para tarjetas y hero: "Envío gratis" / "Envío $3.000" / null si no se sabe. */
export const deliveryFeeLabel = (fee: number | null): string | null => {
  if (fee === null) return null
  if (fee === 0) return 'Envío gratis'
  return `Envío ${formatCOP(fee)}`
}
