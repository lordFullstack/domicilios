import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Devuelve el id de la sección visible más arriba en pantalla, con un solo
 * IntersectionObserver para todas (nada de listeners de scroll).
 *
 * `topOffsetPx`: alto de lo que queda pegado arriba (header compacto +
 * chips); una sección cuenta como "activa" cuando su título pasa por
 * debajo de eso.
 *
 * `enabled`: las secciones solo existen en el DOM cuando terminó de cargar
 * todo (antes se ve el skeleton); sin esto el observer no encontraba nada.
 *
 * `select(id)`: al tocar un chip se hace scroll programático atravesando
 * otras secciones; sin pausa, el chip activo "saltaría" por cada una.
 */
export const useScrollSpy = (ids: string[], topOffsetPx: number, enabled = true) => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)
  const visible = useRef(new Set<string>())
  const pausedUntil = useRef(0)
  const idsKey = ids.join('|')

  useEffect(() => {
    if (!enabled || ids.length === 0 || typeof IntersectionObserver === 'undefined') return
    visible.current.clear()
    setActiveId((cur) => (cur && ids.includes(cur) ? cur : ids[0]))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.current.add(e.target.id)
          else visible.current.delete(e.target.id)
        })
        if (Date.now() < pausedUntil.current) return
        const first = ids.find((id) => visible.current.has(id))
        if (first) setActiveId(first)
      },
      // Franja "de lectura": desde debajo del header hasta el 40% superior.
      { rootMargin: `-${topOffsetPx}px 0px -60% 0px`, threshold: 0 }
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // idsKey representa `ids` (un array nuevo en cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, topOffsetPx, enabled])

  const select = useCallback((id: string, pauseMs = 800) => {
    pausedUntil.current = Date.now() + pauseMs
    setActiveId(id)
  }, [])

  return { activeId, select }
}
