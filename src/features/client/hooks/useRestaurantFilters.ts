import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  RestaurantFilters,
  DEFAULT_FILTERS,
  parseRestaurantQuery,
  buildRestaurantQuery,
} from '../utils/filters'

/**
 * Búsqueda + filtros + orden de la pantalla Restaurantes, con la URL como
 * única fuente de verdad (?q ?cat ?open ?sort). Así funcionan compartir el
 * link, refresh y el botón Atrás sin estado duplicado en useState.
 *
 * - Chips / sort → entrada nueva en el historial (Atrás deshace el filtro).
 * - Escribir en la búsqueda → `replace`, para no crear un paso de
 *   historial por cada tecla. Por eso no hace falta debounce.
 */
export const useRestaurantFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const key = searchParams.toString()

  // Memo por el string de la URL: objeto estable entre renders mientras la
  // URL no cambie (lo necesitan useMemo/useEffect de quien lo consume).
  const { search: urlSearch, filters } = useMemo(
    () => parseRestaurantQuery(new URLSearchParams(key)),
    [key]
  )

  // El input NO se controla directo con la URL: con v7_startTransition la
  // navegación es diferida y un input controlado por ella pierde teclas o
  // salta el cursor. El texto vive en estado local (filtrado inmediato) y
  // la URL se actualiza detrás.
  const [search, setSearchState] = useState(urlSearch)
  const lastWritten = useRef(urlSearch)

  // Cambio de ?q que NO vino de escribir (Atrás, link compartido, limpiar).
  useEffect(() => {
    if (urlSearch !== lastWritten.current) {
      lastWritten.current = urlSearch
      setSearchState(urlSearch)
    }
  }, [urlSearch])

  const setSearch = useCallback(
    (next: string) => {
      setSearchState(next)
      lastWritten.current = next
      setSearchParams(buildRestaurantQuery({ search: next, filters }), { replace: true })
    },
    [filters, setSearchParams]
  )

  const setFilters = useCallback(
    (next: RestaurantFilters) => {
      setSearchParams(buildRestaurantQuery({ search, filters: next }))
    },
    [search, setSearchParams]
  )

  const clearAll = useCallback(() => {
    setSearchState('')
    lastWritten.current = ''
    setSearchParams(buildRestaurantQuery({ search: '', filters: DEFAULT_FILTERS }))
  }, [setSearchParams])

  return { search, filters, setSearch, setFilters, clearAll }
}
