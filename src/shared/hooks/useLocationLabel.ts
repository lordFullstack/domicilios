import { useEffect, useState } from 'react'

/**
 * Última red de seguridad si falla tanto el GPS como la geolocalización
 * por IP (sin internet, servicios caídos, etc.) — la app hoy solo cubre
 * Riohacha, así que es un valor razonable y nunca debería verse en
 * condiciones normales.
 */
const FALLBACK_LOCATION = 'Riohacha, La Guajira'

type LocationSource = 'gps' | 'ip' | 'fallback'

interface LocationLabelState {
  label: string
  loading: boolean
  source: LocationSource
}

interface NominatimAddress {
  suburb?: string
  neighbourhood?: string
  city_district?: string
  town?: string
  village?: string
  city?: string
  county?: string
}

const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&accept-language=es`
    )
    if (!res.ok) return null
    const data = (await res.json()) as { address?: NominatimAddress; display_name?: string }
    const addr = data.address || {}
    const barrio = addr.suburb || addr.neighbourhood || addr.city_district
    const ciudad = addr.city || addr.town || addr.village || addr.county

    if (barrio && ciudad) return `${barrio}, ${ciudad}`
    if (ciudad) return ciudad
    return data.display_name?.split(',').slice(0, 2).join(',').trim() || null
  } catch {
    return null
  }
}

/**
 * Respaldo cuando el cliente no da permiso de GPS (o falla): geolocalización
 * aproximada por IP, así igual mostramos su ciudad real en vez de caer
 * directo al texto fijo.
 */
const locateByIp = async (): Promise<string | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    const data = (await res.json()) as { city?: string; region?: string }
    if (data.city && data.region) return `${data.city}, ${data.region}`
    return data.city || null
  } catch {
    return null
  }
}

/**
 * Resuelve la ubicación real del cliente para mostrarla en el header del
 * Home: primero intenta GPS (preciso, a nivel de barrio), y si el usuario
 * no da permiso o el GPS falla, cae a geolocalización por IP (a nivel de
 * ciudad). Solo si ambas fallan se usa el texto fijo de respaldo.
 */
export const useLocationLabel = (): LocationLabelState => {
  const [state, setState] = useState<LocationLabelState>({
    label: FALLBACK_LOCATION,
    loading: true,
    source: 'fallback',
  })

  useEffect(() => {
    let cancelled = false

    const resolveByIp = async () => {
      const label = await locateByIp()
      if (cancelled) return
      setState({
        label: label || FALLBACK_LOCATION,
        loading: false,
        source: label ? 'ip' : 'fallback',
      })
    }

    if (!('geolocation' in navigator)) {
      resolveByIp()
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const label = await reverseGeocode(position.coords.latitude, position.coords.longitude)
        if (cancelled) return
        if (label) {
          setState({ label, loading: false, source: 'gps' })
        } else {
          resolveByIp()
        }
      },
      () => {
        resolveByIp()
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    )

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
