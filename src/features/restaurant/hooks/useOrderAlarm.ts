import { useEffect } from 'react'

const BEEP_EVERY_MS = 4000

// Un pitido corto con Web Audio (sin archivos ni dependencias). El navegador puede bloquear el
// audio hasta que la persona toque la pantalla: por eso también hay vibración y la alerta visual.
const beep = (ctx: AudioContext) => {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.4)
}

/** Suena y vibra cada pocos segundos mientras `active` (hay pedidos por confirmar). */
export const useOrderAlarm = (active: boolean) => {
  useEffect(() => {
    if (!active) return
    let ctx: AudioContext | null = null
    const ring = () => {
      try {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (Ctor) {
          ctx = ctx ?? new Ctor()
          void ctx.resume().then(() => ctx && beep(ctx)).catch(() => {})
        }
      } catch {
        /* sin audio: queda la alerta visual */
      }
      try {
        navigator.vibrate?.([200, 100, 200])
      } catch {
        /* sin vibración */
      }
    }
    ring()
    const timer = setInterval(ring, BEEP_EVERY_MS)
    return () => {
      clearInterval(timer)
      void ctx?.close().catch(() => {})
    }
  }, [active])
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
