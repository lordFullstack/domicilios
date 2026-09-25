import { useCallback, useEffect, useState } from 'react'

const BEEP_EVERY_MS = 4000

// Los navegadores móviles solo dejan sonar audio después de un toque en la pantalla, y en iPhone el
// Web Audio se silencia con el interruptor de silencio. Se usa un <audio> normal (volumen de medios,
// más fiable en Android e iOS) con un pitido generado en memoria (sin archivos), y Web Audio como
// respaldo. Un mismo elemento, una vez reproducido con un toque, puede volver a sonar solo.
const makeBeepUrl = (): string => {
  const rate = 22050
  const samples = Math.floor(rate * 0.6)
  const buf = new ArrayBuffer(44 + samples * 2)
  const v = new DataView(buf)
  const str = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF'); v.setUint32(4, 36 + samples * 2, true); str(8, 'WAVEfmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i++) {
    const t = i / rate
    // Dos pitidos cortos con entrada y salida suaves (sin "clic").
    const local = t < 0.27 ? t : t >= 0.33 && t < 0.6 ? t - 0.33 : -1
    const env = local < 0 ? 0 : Math.min(1, local / 0.02, (0.27 - local) / 0.03)
    v.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * 880 * t) * env * 0.85 * 32767), true)
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

let beepEl: HTMLAudioElement | null = null
let sharedCtx: AudioContext | null = null

const getEl = (): HTMLAudioElement | null => {
  if (beepEl) return beepEl
  try {
    beepEl = new Audio(makeBeepUrl())
    beepEl.preload = 'auto'
  } catch {
    beepEl = null
  }
  return beepEl
}

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

const webAudioBeep = async (): Promise<boolean> => {
  const ctx = getCtx()
  if (!ctx) return false
  try {
    await ctx.resume()
    if (ctx.state !== 'running') return false
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
    return true
  } catch {
    return false
  }
}

/** Hace sonar el pitido una vez. Devuelve false si el navegador lo bloquea (falta un toque). */
export const playBeep = async (): Promise<boolean> => {
  const el = getEl()
  if (el) {
    try {
      el.currentTime = 0
      const p = el.play() as Promise<void> | undefined
      if (p && typeof p.then === 'function') await p
      return true
    } catch {
      /* bloqueado: se prueba Web Audio */
    }
  }
  return webAudioBeep()
}

/** Debe llamarse desde un gesto del usuario (toque): habilita el audio SIN sonar (silenciado). */
export const primeAudio = async (): Promise<boolean> => {
  const el = getEl()
  if (!el) return false
  try {
    el.muted = true
    const p = el.play() as Promise<void> | undefined
    if (p && typeof p.then === 'function') await p
    el.pause()
    el.currentTime = 0
    return true
  } catch {
    return false
  } finally {
    el.muted = false
  }
}

/**
 * Suena y vibra cada pocos segundos mientras `active` (hay pedidos por confirmar).
 * Devuelve `audioBlocked` (el navegador aún no permite sonar) y `enableSound` (para el botón).
 */
export const useOrderAlarm = (active: boolean) => {
  const [audioBlocked, setAudioBlocked] = useState(false)

  const enableSound = useCallback(async () => {
    setAudioBlocked(!(await playBeep()))
  }, [])

  // El primer toque en cualquier parte de la pantalla desbloquea el audio.
  useEffect(() => {
    const onGesture = () => {
      void primeAudio().then((ok) => ok && setAudioBlocked(false))
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
      void playBeep().then((ok) => setAudioBlocked(!ok))
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
