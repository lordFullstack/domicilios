import { describe, it, expect } from 'vitest'
import {
  filterAndSortRestaurants,
  filterRestaurants,
  sortRestaurants,
  countActiveFilters,
  parseRestaurantQuery,
  buildRestaurantQuery,
  DEFAULT_FILTERS,
} from './filters'
import { Restaurant } from '@/shared/types'

const makeRestaurant = (overrides: Partial<Restaurant>): Restaurant => ({
  id: overrides.id || 'r1',
  owner_id: 'owner-1',
  name: 'Restaurante',
  description: '',
  address: 'Calle 1',
  phone: '3000000000',
  status: 'open',
  approved: true,
  category: 'Asados',
  rating_avg: 0,
  rating_count: 0,
  created_at: new Date().toISOString(),
  ...overrides,
})

const restaurants: Restaurant[] = [
  makeRestaurant({ id: '1', name: 'Asados El Fogón', category: 'Asados', status: 'open', rating_avg: 4.8, rating_count: 20 }),
  makeRestaurant({ id: '2', name: 'Pizza Bella', category: 'Pizza', status: 'closed', rating_avg: 4.5, rating_count: 10 }),
  makeRestaurant({ id: '3', name: 'Burger House', category: 'Burgers', status: 'open', rating_avg: 4.9, rating_count: 5 }),
]

describe('filterAndSortRestaurants', () => {
  it('sin filtros ni búsqueda (recomendados), respeta el orden del backend', () => {
    const result = filterAndSortRestaurants(restaurants, '', DEFAULT_FILTERS)
    expect(result.map((r) => r.id)).toEqual(['1', '2', '3'])
  })

  it('sortBy "rating" ordena por mejor calificación', () => {
    const result = filterAndSortRestaurants(restaurants, '', { ...DEFAULT_FILTERS, sortBy: 'rating' })
    expect(result.map((r) => r.id)).toEqual(['3', '1', '2']) // 4.9, 4.8, 4.5
  })

  it('busca por nombre sin importar mayúsculas/minúsculas', () => {
    const result = filterAndSortRestaurants(restaurants, 'pizza', DEFAULT_FILTERS)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('busca también por categoría', () => {
    const result = filterAndSortRestaurants(restaurants, 'burgers', DEFAULT_FILTERS)
    expect(result.map((r) => r.id)).toEqual(['3'])
  })

  it('filtra por categoría exacta', () => {
    const result = filterAndSortRestaurants(restaurants, '', { ...DEFAULT_FILTERS, category: 'Asados' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filtra solo abiertos', () => {
    const result = filterAndSortRestaurants(restaurants, '', { ...DEFAULT_FILTERS, onlyOpen: true })
    expect(result.every((r) => r.status === 'open')).toBe(true)
    expect(result).toHaveLength(2)
  })

  it('ordena alfabéticamente cuando sortBy es "name"', () => {
    const result = filterAndSortRestaurants(restaurants, '', { ...DEFAULT_FILTERS, sortBy: 'name' })
    expect(result.map((r) => r.name)).toEqual(['Asados El Fogón', 'Burger House', 'Pizza Bella'])
  })

  it('búsqueda + filtro combinados que no coinciden con nada devuelve array vacío', () => {
    const result = filterAndSortRestaurants(restaurants, 'pizza', { ...DEFAULT_FILTERS, onlyOpen: true })
    expect(result).toEqual([])
  })
})

describe('countActiveFilters', () => {
  it('cuenta 0 cuando no hay filtros activos', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0)
  })

  it('cuenta categoría y onlyOpen como 2 filtros activos', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, category: 'Pizza', onlyOpen: true })).toBe(2)
  })
})

describe('búsqueda normalizada', () => {
  const list = [
    makeRestaurant({ id: 'p', name: 'Pizza Palace', category: 'Pizza' }),
    makeRestaurant({ id: 'c', name: 'Pa Comer Express', category: 'Asados', description: 'Arepas y chicharrón' }),
  ]

  it.each(['PIZZA', 'pizzá', '  Pizza  '])('"%s" encuentra "Pizza Palace"', (q) => {
    expect(filterRestaurants(list, q, DEFAULT_FILTERS).map((r) => r.id)).toEqual(['p'])
  })

  it('"pa comer" encuentra el restaurante', () => {
    expect(filterRestaurants(list, 'pa comer', DEFAULT_FILTERS).map((r) => r.id)).toEqual(['c'])
  })

  it('busca también en la descripción, sin tildes', () => {
    expect(filterRestaurants(list, 'chicharron', DEFAULT_FILTERS).map((r) => r.id)).toEqual(['c'])
  })

  it('búsqueda vacía devuelve todos', () => {
    expect(filterRestaurants(list, '   ', DEFAULT_FILTERS)).toHaveLength(2)
  })

  it('abiertos + categoría = intersección', () => {
    const r = filterAndSortRestaurants(restaurants, '', { ...DEFAULT_FILTERS, onlyOpen: true, category: 'Pizza' })
    expect(r).toEqual([]) // la única pizza está cerrada
  })
})

describe('sortRestaurants', () => {
  const list = [
    makeRestaurant({ id: 'nuevo', name: 'Zeta', rating_avg: 5, rating_count: 0 }),
    makeRestaurant({ id: 'a', name: 'Alfa', rating_avg: 4.5, rating_count: 30 }),
    makeRestaurant({ id: 'b', name: 'Beta', rating_avg: 4.5, rating_count: 10 }),
  ]

  it('recommended conserva el orden del backend', () => {
    expect(sortRestaurants(list, 'recommended').map((r) => r.id)).toEqual(['nuevo', 'a', 'b'])
  })

  it('rating: con votos primero, luego promedio y cantidad de votos', () => {
    expect(sortRestaurants(list, 'rating').map((r) => r.id)).toEqual(['a', 'b', 'nuevo'])
  })

  it('name: alfabético', () => {
    expect(sortRestaurants(list, 'name').map((r) => r.name)).toEqual(['Alfa', 'Beta', 'Zeta'])
  })

  it('no muta la lista original', () => {
    const copy = [...list]
    sortRestaurants(list, 'name')
    expect(list).toEqual(copy)
  })
})

describe('URL ↔ filtros', () => {
  it('lee ?q ?cat ?open ?sort', () => {
    const q = parseRestaurantQuery(new URLSearchParams('q=pizza&cat=pizza&open=1&sort=rating'))
    expect(q).toEqual({ search: 'pizza', filters: { category: 'Pizza', onlyOpen: true, sortBy: 'rating' } })
  })

  it('ignora valores inválidos sin romper', () => {
    const q = parseRestaurantQuery(new URLSearchParams('cat=tacos&open=si&sort=cercania'))
    expect(q).toEqual({ search: '', filters: DEFAULT_FILTERS })
  })

  it('no escribe valores por defecto (URL limpia)', () => {
    expect(buildRestaurantQuery({ search: '', filters: DEFAULT_FILTERS }).toString()).toBe('')
  })

  it('ida y vuelta conserva los filtros', () => {
    const original = { search: 'pa comer', filters: { category: 'Mariscos' as const, onlyOpen: true, sortBy: 'name' as const } }
    expect(parseRestaurantQuery(buildRestaurantQuery(original))).toEqual(original)
  })
})
