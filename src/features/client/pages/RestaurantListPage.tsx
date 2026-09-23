import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Store } from 'lucide-react'
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
import { RestaurantGrid } from '../components/RestaurantGrid'
import { RestaurantLoadError } from '../components/RestaurantLoadError'
import { CartFloatingBar } from '../components/CartFloatingBar'
import { useRestaurantFilters } from '../hooks/useRestaurantFilters'
import { countActiveFilters, filterAndSortRestaurants } from '../utils/filters'

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

// "Restaurantes" — búsqueda + filtros + orden sobre la lista completa.
// Filtrado 100% client-side (ver utils/filters.ts) y estado en la URL
// (ver hooks/useRestaurantFilters.ts): ?q ?cat ?open ?sort.
export const RestaurantListPage = () => {
  const navigate = useNavigate()
  const { restaurants, loading, error, errorKind, reload } = useRestaurants({ approvedOnly: true })
  const { search, filters, setSearch, setFilters, clearAll } = useRestaurantFilters()
  const [sheetOpen, setSheetOpen] = useState(false)

  const results = useMemo(
    () => filterAndSortRestaurants(restaurants, search, filters),
    [restaurants, search, filters]
  )

  const term = search.trim()
  const activeCount = countActiveFilters(filters) + (term ? 1 : 0)
  const hasData = restaurants.length > 0
  const initialLoading = loading && !hasData

  const counter = initialLoading || (error && !hasData)
    ? ''
    : term
      ? `${plural(results.length, 'resultado', 'resultados')} para "${term}"`
      : plural(results.length, 'restaurante', 'restaurantes')

  const renderBody = () => {
    if (initialLoading) return <RestaurantCardsSkeleton />
    if (error) return <RestaurantLoadError kind={errorKind} onRetry={reload} retrying={loading} />
    if (!hasData) {
      return (
        <EmptyState
          icon={Store}
          title="Todavía no hay restaurantes disponibles"
          description="Estamos sumando restaurantes en Riohacha. Vuelve pronto."
        />
      )
    }
    if (results.length === 0) {
      return (
        <EmptyState
          illustration="noResults"
          title="No encontramos restaurantes con esos filtros"
          description={term ? `Nada coincide con "${term}". Prueba otra palabra o quita filtros.` : 'Prueba quitando algún filtro.'}
          action={<Button variant="tertiary" onClick={clearAll}>Limpiar filtros</Button>}
        />
      )
    }
    return <RestaurantGrid restaurants={results} />
  }

  return (
    <AppShell>
      <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))] flex items-center gap-3 mb-1">
        <button
          type="button"
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          aria-label="Volver al inicio"
          className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" aria-hidden="true" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Restaurantes</h1>
      </div>

      <ExploreSearchInput value={search} onChange={setSearch} />
      <ExploreFilterChips filters={filters} onChange={setFilters} onOpenSheet={() => setSheetOpen(true)} />

      {/* Contador vivo: se anuncia al filtrar. Siempre montado (una live
          region que aparece de golpe no se anuncia) y con altura fija
          para no mover el grid mientras carga. */}
      <div className="flex items-center justify-between gap-3 px-5 mb-3 min-h-[1.5rem]">
        <h2
          aria-live="polite"
          aria-atomic="true"
          className="font-display font-bold text-sm text-gray-700 truncate"
        >
          {counter}
        </h2>
        {activeCount >= 2 && hasData && (
          <button
            type="button"
            onClick={clearAll}
            className="focus-ring flex-shrink-0 text-xs font-semibold text-primary rounded-lg px-2 min-h-[44px] -my-2.5"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div aria-busy={loading}>{renderBody()}</div>

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
