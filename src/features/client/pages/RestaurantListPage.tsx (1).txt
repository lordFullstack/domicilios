import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRestaurants } from '@/hooks/useLocalData'
import { RestaurantCard } from '../components/RestaurantCard'
import { Card } from '@/shared/components/Card'
import { ROUTES } from '@/config/constants'

export const RestaurantListPage = () => {
  const navigate = useNavigate()
  const { restaurants, loading } = useRestaurants()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [onlyOpen, setOnlyOpen] = useState(false)

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const q = search.trim().toLowerCase()
      const matchesQuery = !q ||
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false)
      const matchesOpen = !onlyOpen || r.status === 'open'
      return matchesQuery && matchesOpen
    })
  }, [restaurants, search, onlyOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero navy */}
      <div className="bg-secondary rounded-b-[28px] px-4 pt-6 pb-6 md:rounded-b-none">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(ROUTES.CLIENT_HOME)} className="text-white/80 font-semibold mb-4 hover:text-white">
            ← Atrás
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            🏪 Restaurantes
          </h1>

          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5">
            <span className="text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o dirección..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 text-sm">✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setOnlyOpen((v) => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              onlyOpen
                ? 'bg-secondary text-white border-secondary'
                : 'bg-white text-secondary border-gray-200'
            }`}
          >
            🟢 Solo abiertos
          </button>
          <span className="text-xs text-gray-500 font-medium">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Cargando restaurantes...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-16">
              <p className="font-semibold text-secondary mb-1">Sin resultados</p>
              <p className="text-gray-600 text-sm">Prueba con otra búsqueda o quita el filtro</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
