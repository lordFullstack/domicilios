import { useEffect, useState } from 'react'
import { supabase } from '@/shared/utils/supabase'

// Cuenta regresiva basada en la hora del SERVIDOR (LOOP_FLOW_01, D3): el reloj del celular puede
// estar adelantado o atrasado, así que se mide una vez su desfase contra `server_time()`.
let clockOffsetMs = 0
let syncing: Promise<void> | null = null
let synced = false

export const syncServerClock = (): Promise<void> => {
  if (synced) return Promise.resolve()
  if (syncing) return syncing
  syncing = (async () => {
    const t0 = Date.now()
    const { data, error } = await supabase.rpc('server_time')
    const t1 = Date.now()
    if (!error && data) {
      clockOffsetMs = new Date(data as string).getTime() - (t0 + t1) / 2
      synced = true
    }
    syncing = null
  })()
  return syncing
}

export const serverNow = () => Date.now() + clockOffsetMs

/** Solo para pruebas. */
export const resetServerClock = () => {
  clockOffsetMs = 0
  syncing = null
  synced = false
}

export const secondsUntil = (deadline: string, now: number) =>
  Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000))

export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Segundos que faltan para `deadline` (null si no hay plazo). Se actualiza cada segundo. */
export const useCountdown = (deadline?: string | null) => {
  const [now, setNow] = useState(serverNow)

  useEffect(() => {
    if (!deadline) return
    let alive = true
    void syncServerClock().then(() => alive && setNow(serverNow()))
    setNow(serverNow())
    const timer = setInterval(() => setNow(serverNow()), 1000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [deadline])

  if (!deadline) return { secondsLeft: null, expired: false, label: '' }
  const secondsLeft = secondsUntil(deadline, now)
  return { secondsLeft, expired: secondsLeft === 0, label: formatCountdown(secondsLeft) }
}
