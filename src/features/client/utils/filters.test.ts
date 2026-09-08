import { describe, it, expect } from 'vitest'
import { filterAndSortRestaurants, countActiveFilters, DEFAULT_FILTERS } from './filters'
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
  it('sin filtros ni búsqueda, devuelve todos ordenados por mejor calificación', () => {
    const result = filterAndSortRestaurants(restaurants, '', DEFAULT_FILTERS)
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
