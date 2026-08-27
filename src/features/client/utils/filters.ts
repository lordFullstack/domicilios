import { Restaurant, RestaurantCategory } from '@/shared/types'

export type SortOption = 'rating' | 'name'

export interface RestaurantFilters {
  category?: RestaurantCategory
  onlyOpen: boolean
  sortBy: SortOption
}

export const DEFAULT_FILTERS: RestaurantFilters = {
  category: undefined,
  onlyOpen: false,
  sortBy: 'rating',
}

export const countActiveFilters = (filters: RestaurantFilters) =>
  (filters.category ? 1 : 0) + (filters.onlyOpen ? 1 : 0)

/**
 * Filtra y ordena una lista ya cargada de restaurantes. Todo client-side:
 * `useRestaurants` ya trae la lista completa a memoria (no hay paginación
 * en el backend), así que no tiene sentido lanzar una query nueva por cada
 * tecla o cada filtro — se filtra el array que ya está en RAM.
 */
export const filterAndSortRestaurants = (
  restaurants: Restaurant[],
  search: string,
  filters: RestaurantFilters
): Restaurant[] => {
  const term = search.trim().toLowerCase()

  let result = restaurants.filter((r) => {
    if (term && !r.name.toLowerCase().includes(term) && !r.category.toLowerCase().includes(term)) {
      return false
    }
    if (filters.category && r.category !== filters.category) return false
    if (filters.onlyOpen && r.status !== 'open') return false
    return true
  })

  result = [...result].sort((a, b) => {
    if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
    // 'rating': mejor calificados primero; empate se rompe alfabéticamente
    // (igual que el orden por defecto que ya trae useRestaurants del backend).
    if (b.rating_avg !== a.rating_avg) return b.rating_avg - a.rating_avg
    return a.name.localeCompare(b.name)
  })

  return result
}
