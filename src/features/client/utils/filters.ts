import { Restaurant, RestaurantCategory } from '@/shared/types'
import { RESTAURANT_CATEGORIES } from '@/config/constants'
import { normalizeText } from '@/shared/utils/format'

/**
 * Solo criterios con dato real en `restaurants`. Cercanía, tiempo de
 * entrega y "envío gratis primero" NO existen: no hay coordenadas del
 * restaurante, ni campo de tiempo, ni delivery_fee (hoy todo es gratis).
 */
export type SortOption = 'recommended' | 'rating' | 'name'

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'name', label: 'Nombre (A-Z)' },
]

export interface RestaurantFilters {
  category?: RestaurantCategory
  onlyOpen: boolean
  sortBy: SortOption
}

export const DEFAULT_FILTERS: RestaurantFilters = {
  category: undefined,
  onlyOpen: false,
  sortBy: 'recommended',
}

/** Filtros "de chip" activos (categoría + abiertos). El sort no cuenta. */
export const countActiveFilters = (filters: RestaurantFilters) =>
  (filters.category ? 1 : 0) + (filters.onlyOpen ? 1 : 0)

// Texto normalizado por restaurante, calculado UNA vez por objeto (la lista
// se recarga como objetos nuevos, así que el cache se invalida solo).
const haystackCache = new WeakMap<Restaurant, string>()
const haystackOf = (r: Restaurant) => {
  let h = haystackCache.get(r)
  if (h === undefined) {
    h = normalizeText(`${r.name} ${r.category} ${r.description || ''}`)
    haystackCache.set(r, h)
  }
  return h
}

export const filterRestaurants = (
  restaurants: Restaurant[],
  search: string,
  filters: RestaurantFilters
): Restaurant[] => {
  const term = normalizeText(search)
  return restaurants.filter((r) => {
    if (term && !haystackOf(r).includes(term)) return false
    if (filters.category && r.category !== filters.category) return false
    if (filters.onlyOpen && r.status !== 'open') return false
    return true
  })
}

const byName = (a: Restaurant, b: Restaurant) => a.name.localeCompare(b.name, 'es')

/**
 * 'recommended' conserva el orden en que llegan (el backend ya ordena por
 * rating_avg desc + name). 'rating' pone primero a los que tienen votos
 * reales: un restaurante nuevo con 0 votos no le gana a uno con 4.5 de 30.
 */
export const sortRestaurants = (restaurants: Restaurant[], sortBy: SortOption): Restaurant[] => {
  if (sortBy === 'recommended') return [...restaurants]
  return [...restaurants].sort((a, b) => {
    if (sortBy === 'name') return byName(a, b)
    const aRated = a.rating_count > 0 ? 1 : 0
    const bRated = b.rating_count > 0 ? 1 : 0
    if (aRated !== bRated) return bRated - aRated
    if (b.rating_avg !== a.rating_avg) return b.rating_avg - a.rating_avg
    if (b.rating_count !== a.rating_count) return b.rating_count - a.rating_count
    return byName(a, b)
  })
}

/**
 * Filtra y ordena una lista ya cargada. Todo CLIENT-SIDE a propósito:
 * `useRestaurants` trae la lista completa (no hay paginación en backend) y
 * el volumen es de unidades (single-tenant). Filtrar en memoria cuesta
 * < 16 ms y 0 requests, así que no hay debounce ni AbortController.
 * Si algún día pasan de ~200 restaurantes, migrar a una RPC en un LOOP
 * dedicado — y NO filtrar en ambos lados a la vez.
 */
export const filterAndSortRestaurants = (
  restaurants: Restaurant[],
  search: string,
  filters: RestaurantFilters
): Restaurant[] => sortRestaurants(filterRestaurants(restaurants, search, filters), filters.sortBy)

// ------------------------------------------------------------------
// URL (deep links): ?q= ?cat= ?open=1 ?sort=
// ------------------------------------------------------------------

export interface RestaurantQuery {
  search: string
  filters: RestaurantFilters
}

const SORT_VALUES = SORT_OPTIONS.map((o) => o.value)

/** Params inválidos se ignoran en silencio: una URL editada a mano nunca crashea. */
export const parseRestaurantQuery = (params: URLSearchParams): RestaurantQuery => {
  const catParam = normalizeText(params.get('cat'))
  const category = RESTAURANT_CATEGORIES.find((c) => normalizeText(c.value) === catParam)?.value as
    | RestaurantCategory
    | undefined
  const sortParam = params.get('sort') as SortOption | null

  return {
    search: params.get('q') ?? '',
    filters: {
      category,
      onlyOpen: params.get('open') === '1',
      sortBy: sortParam && SORT_VALUES.includes(sortParam) ? sortParam : DEFAULT_FILTERS.sortBy,
    },
  }
}

/** Los valores por defecto NO se escriben: URL limpia. */
export const buildRestaurantQuery = ({ search, filters }: RestaurantQuery): URLSearchParams => {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (filters.category) params.set('cat', normalizeText(filters.category))
  if (filters.onlyOpen) params.set('open', '1')
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) params.set('sort', filters.sortBy)
  return params
}
