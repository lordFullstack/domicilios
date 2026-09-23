import { useEffect, useState } from 'react'

/**
 * `true` cuando el sentinela (colocado al final del hero) ya salió por
 * arriba de la pantalla → momento de mostrar el header compacto.
 * IntersectionObserver: sin listeners de scroll ni cálculos por frame.
 *
 * `sentinelRef` es un callback ref: el hero se monta después de cargar,
 * así que el observer se crea cuando el nodo existe de verdad.
 */
export const useStickyHeader = <T extends HTMLElement = HTMLDivElement>() => {
  const [node, setNode] = useState<T | null>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      // Solo "compacto" si el sentinela quedó ARRIBA (no si está abajo).
      setCompact(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { sentinelRef: setNode, compact }
}
