import { useState } from 'react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { RestaurantEditModal } from '../components/RestaurantEditModal'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Restaurant } from '@/shared/types'

export const AdminRestaurantsPage = () => {
  const { restaurants, loading, error, editRestaurant, toggleApproved } = useAdminRestaurants()
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Restaurant | null>(null)
  const [toggling, setToggling] = useState(false)

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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Restaurantes</h1>
        <p className="text-sm text-gray-500 mb-6">
          {restaurants.length} restaurante(s) asociados a la plataforma
        </p>

        {loading && <p className="text-gray-400 text-sm">Cargando restaurantes...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {restaurants.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display font-bold text-secondary">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'open' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {r.status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.approved ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {r.approved ? 'Aprobado' : 'Suspendido'}
                    </span>
                  </div>
                </div>

                {r.description && <p className="text-sm text-gray-500 mb-3">{r.description}</p>}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => setEditingRestaurant(r)}>
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" fullWidth onClick={() => setConfirmTarget(r)}>
                    {r.approved ? 'Suspender' : 'Aprobar'}
                  </Button>
                </div>
              </Card>
            ))}
            {restaurants.length === 0 && (
              <p className="text-gray-400 text-sm col-span-2 text-center py-8">
                No hay restaurantes registrados todavía.
              </p>
            )}
          </div>
        )}
      </div>

      {editingRestaurant && (
        <RestaurantEditModal
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
