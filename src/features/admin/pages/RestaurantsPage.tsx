import { useState, useMemo } from 'react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { RestaurantSidePanel } from '../components/RestaurantSidePanel'
import { RestaurantFilters, ApprovalFilter, StatusFilter } from '../components/RestaurantFilters'
import { RestaurantsTable } from '../components/RestaurantsTable'
import { RestaurantsCardList } from '../components/RestaurantsCardList'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { Restaurant } from '@/shared/types'

export const AdminRestaurantsPage = () => {
  const { restaurants, loading, error, editRestaurant, toggleApproved } = useAdminRestaurants()
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Restaurant | null>(null)
  const [toggling, setToggling] = useState(false)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [approval, setApproval] = useState<ApprovalFilter>('all')

  const filteredRestaurants = useMemo(() => {
    const term = search.trim().toLowerCase()
    return restaurants.filter((r) => {
      if (term && !r.name.toLowerCase().includes(term)) return false
      if (category !== 'all' && r.category !== category) return false
      if (status !== 'all' && r.status !== status) return false
      if (approval === 'approved' && !r.approved) return false
      if (approval === 'suspended' && r.approved) return false
      return true
    })
  }, [restaurants, search, category, status, approval])

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return
    setToggling(true)
    try {
      await toggleApproved(confirmTarget.id, !confirmTarget.approved)
      setConfirmTarget(null)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Restaurantes</h1>
        <p className="text-sm text-gray-500 mb-6">
          {filteredRestaurants.length} de {restaurants.length} restaurante(s)
        </p>

        {loading && <p className="text-gray-400 text-sm">Cargando restaurantes...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && (
          <>
            <RestaurantFilters
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              status={status}
              onStatusChange={setStatus}
              approval={approval}
              onApprovalChange={setApproval}
            />

            {filteredRestaurants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-12 border border-gray-100 rounded-2xl">
                {restaurants.length === 0
                  ? 'No hay restaurantes registrados todavía.'
                  : 'Ningún restaurante coincide con estos filtros.'}
              </p>
            ) : (
              <>
                <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden px-4">
                  <RestaurantsTable
                    restaurants={filteredRestaurants}
                    onEdit={setEditingRestaurant}
                    onToggleApproval={setConfirmTarget}
                  />
                </div>
                <div className="md:hidden">
                  <RestaurantsCardList
                    restaurants={filteredRestaurants}
                    onEdit={setEditingRestaurant}
                    onToggleApproval={setConfirmTarget}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {editingRestaurant && (
        <RestaurantSidePanel
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSave={(updates) => editRestaurant(editingRestaurant.id, updates)}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.approved ? 'Suspender restaurante' : 'Aprobar restaurante'}
        message={
          confirmTarget?.approved
            ? `${confirmTarget?.name} dejará de recibir pedidos aunque el dueño lo marque como abierto.`
            : `${confirmTarget?.name} podrá operar en la plataforma nuevamente.`
        }
        confirmLabel={confirmTarget?.approved ? 'Suspender' : 'Aprobar'}
        danger={!!confirmTarget?.approved}
        loading={toggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}
