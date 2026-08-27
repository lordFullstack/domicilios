import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search as SearchIcon } from 'lucide-react'
import { useRestaurants } from '@/hooks/useLocalData'
import { AppShell } from '@/shared/components/AppShell'
import { BottomNav } from '@/shared/components/BottomNav'
import { RestaurantCardsSkeleton } from '@/shared/components/RestaurantCardsSkeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/config/constants'
import { ExploreSearchInput } from '../components/ExploreSearchInput'
import { ExploreFilterChips } from '../components/ExploreFilterChips'
import { ExploreFilterSheet } from '../components/ExploreFilterSheet'
import { RestaurantGridCard } from '../components/RestaurantGridCard'
import { CartFloatingBar } from '../components/CartFloatingBar'
import { DEFAULT_FILTERS, countActiveFilters, filterAndSortRestaurants } from '../utils/filters'

// "Explorar" — búsqueda + filtros sobre la lista de restaurantes.
// Todo el filtrado/orden es client-side (ver utils/filters.ts): useRestaurants
// ya trae la lista completa a memoria, así que no hace falta debounce ni
// una query nueva por cada tecla o cada filtro tocado.
export const RestaurantListPage = () => {
  const navigate = useNavigate()
  const { restaurants, loading, error, reload } = useRestaurants({ approvedOnly: true })

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sheetOpen, setSheetOpen] = useState(false)

  const results = useMemo(
    () => filterAndSortRestaurants(restaurants, search, filters),
    [restaurants, search, filters]
  )

  const hasActiveSearchOrFilters = search.trim().length > 0 || countActiveFilters(filters) > 0

  const clearAll = () => {
    setSearch('')
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <AppShell>
      {/* Header compacto */}
      <div className="px-5 pt-6 flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          aria-label="Volver al inicio"
          className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Restaurantes</h1>
      </div>

      <ExploreSearchInput value={search} onChange={setSearch} />
      <ExploreFilterChips
        filters={filters}
        onChange={setFilters}
        onOpenSheet={() => setSheetOpen(true)}
      />

      <h2 className="font-display font-bold text-sm text-gray-700 mb-3 px-5">
        {search.trim() ? `Resultados para "${search.trim()}"` : 'Cerca de ti'}
      </h2>

      {loading ? (
        <RestaurantCardsSkeleton />
      ) : error ? (
        <EmptyState
          icon={SearchIcon}
          title="No pudimos completar la búsqueda"
          description="Revisa tu conexión e intenta de nuevo."
          action={<Button variant="outline" onClick={reload}>Intentar nuevamente</Button>}
        />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-5">
          {results.map((restaurant) => (
            <RestaurantGridCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="No encontramos resultados"
          description={
            hasActiveSearchOrFilters
              ? 'Prueba con otro término o cambia los filtros.'
              : 'Todavía no hay restaurantes disponibles.'
          }
          action={
            hasActiveSearchOrFilters ? (
              <Button variant="outline" onClick={clearAll}>Limpiar filtros</Button>
            ) : undefined
          }
        />
      )}

      <ExploreFilterSheet
        open={sheetOpen}
        filters={filters}
        onClose={() => setSheetOpen(false)}
        onApply={setFilters}
      />

      <CartFloatingBar />
      <BottomNav />
    </AppShell>
  )
}
