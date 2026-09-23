import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Estado "recién agregado" (~600 ms) para el check del botón "+".
 * Lo usan la fila del menú y la tarjeta de recomendados: mismo feedback
 * en ambos lugares. Vibración corta si el dispositivo la soporta.
 */
export const useAddedFlash = (durationMs = 600) => {
  const [flash, setFlash] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timer.current), [])

  const trigger = useCallback(() => {
    clearTimeout(timer.current)
    setFlash(true)
    if (typeof navigator !== 'undefined') navigator.vibrate?.(10)
    timer.current = setTimeout(() => setFlash(false), durationMs)
  }, [durationMs])

  return { flash, trigger }
}
