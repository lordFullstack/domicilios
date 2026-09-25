import { useCallback, useEffect, useState } from 'react'

const BEEP_EVERY_MS = 4000

// Los navegadores móviles (Android e iOS) solo dejan sonar el audio después de que la persona toca
// la pantalla. Se usa UN AudioContext compartido que se "desbloquea" en el primer toque y se avisa
// con un botón "Activar sonido" mientras siga bloqueado (QA FLOW_01: el sonido no sonaba).
let sharedCtx: AudioContext | null = null

const getCtx = (): AudioContext | null => {
  if (sharedCtx) return sharedCtx
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (Ctor) sharedCtx = new Ctor()
  } catch {
    sharedCtx = null
  }
  return sharedCtx
}

const beep = (ctx: AudioContext) => {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.5)
}

/** Debe llamarse desde un gesto del usuario (toque): desbloquea el audio y suena una vez. */
export const unlockAudio = async (): Promise<boolean> => {
  const ctx = getCtx()
  if (!ctx) return false
  try {
    await ctx.resume()
    if (ctx.state === 'running') {
      beep(ctx)
      return true
    }
  } catch {
    /* sigue bloqueado */
  }
  return false
}

/**
 * Suena y vibra cada pocos segundos mientras `active` (hay pedidos por confirmar).
 * Devuelve `audioBlocked` (el navegador aún no permite sonar) y `enableSound` (para el botón).
 */
export const useOrderAlarm = (active: boolean) => {
  const [audioBlocked, setAudioBlocked] = useState(false)

  const enableSound = useCallback(async () => {
    setAudioBlocked(!(await unlockAudio()))
  }, [])

  // El primer toque en cualquier parte de la pantalla desbloquea el audio.
  useEffect(() => {
    const onGesture = () => {
      void unlockAudio().then((ok) => ok && setAudioBlocked(false))
    }
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const ring = () => {
      const ctx = getCtx()
      if (ctx) {
        void ctx
          .resume()
          .then(() => {
            if (ctx.state === 'running') {
              beep(ctx)
              setAudioBlocked(false)
            } else {
              setAudioBlocked(true)
            }
          })
          .catch(() => setAudioBlocked(true))
      }
      try {
        navigator.vibrate?.([200, 100, 200])
      } catch {
        /* sin vibración (iOS no la soporta) */
      }
    }
    ring()
    const timer = setInterval(ring, BEEP_EVERY_MS)
    return () => clearInterval(timer)
  }, [active])

  return { audioBlocked, enableSound }
}

/** Mantiene la pantalla encendida mientras el panel está abierto (Wake Lock, si el navegador lo soporta). */
export const useWakeLock = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) void l.release().catch(() => {})
        else lock = l
      } catch {
        /* denegado o sin batería: no es crítico */
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire()
    }
    void acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
  }, [enabled])
}
