import { useState, useMemo } from 'react'
import { Star } from 'lucide-react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { UserEditModal } from '../components/UserEditModal'
import { DeliveryPersonDetailPanel } from '../components/DeliveryPersonDetailPanel'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { Card } from '@/shared/components/Card'
import { USER_ROLES, ORDER_STATUS } from '@/config/constants'
import { User } from '@/shared/types'

type QuickFilter = 'all' | 'active_now' | 'disabled'

export const AdminDeliveryPeoplePage = () => {
  const { users, loading, error, editUser, toggleActive, changePassword } = useAdminUsers()
  const { allOrders } = useAdminOrders()
  const { restaurants } = useAdminRestaurants()

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [selected, setSelected] = useState<User | null>(null)
  const [editing, setEditing] = useState<User | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null)
  const [toggling, setToggling] = useState(false)

  const restaurantsById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants])
  const deliveryPeople = useMemo(() => users.filter((u) => u.role === USER_ROLES.DELIVERY), [users])

  const ordersByDelivery = useMemo(() => {
    const map = new Map<string, typeof allOrders>()
    for (const order of allOrders) {
      if (!order.delivery_person_id) continue
      const list = map.get(order.delivery_person_id) || []
      list.push(order)
      map.set(order.delivery_person_id, list)
    }
    return map
  }, [allOrders])

  const filteredList = useMemo(() => {
    const term = search.trim().toLowerCase()
    return deliveryPeople.filter((d) => {
      const matchesSearch =
        !term || d.name.toLowerCase().includes(term) || d.email.toLowerCase().includes(term) || (d.phone || '').includes(term)
      if (!matchesSearch) return false

      const orders = ordersByDelivery.get(d.id) || []
      const hasActive = orders.some((o) => o.status === ORDER_STATUS.IN_DELIVERY)

      if (quickFilter === 'active_now') return hasActive
      if (quickFilter === 'disabled') return !d.active
      return true
    })
  }, [deliveryPeople, search, quickFilter, ordersByDelivery])

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return
    setToggling(true)
    try {
      await toggleActive(confirmTarget.id, !confirmTarget.active)
      setConfirmTarget(null)
      setSelected(null)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Domiciliarios</h1>
        <p className="text-sm text-gray-500 mb-6">
          {filteredList.length} de {deliveryPeople.length} domiciliario(s)
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar domiciliarios"
            className="flex-1 max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm"
          />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {[
              { value: 'all' as QuickFilter, label: 'Todos' },
              { value: 'active_now' as QuickFilter, label: '🛵 Con entrega activa' },
              { value: 'disabled' as QuickFilter, label: 'Desactivados' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuickFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  quickFilter === opt.value ? 'bg-white text-secondary shadow-card' : 'text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-gray-400 text-sm">Cargando domiciliarios...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && filteredList.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12 border border-gray-100 rounded-2xl bg-white">
            {deliveryPeople.length === 0
              ? 'Todavía no hay domiciliarios registrados.'
              : 'Ningún domiciliario coincide con este filtro.'}
          </p>
        )}

        {!loading && filteredList.length > 0 && (
          <div className="grid gap-3">
            {filteredList.map((d) => {
              const orders = ordersByDelivery.get(d.id) || []
              const delivered = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length
              const active = orders.filter((o) => o.status === ORDER_STATUS.IN_DELIVERY).length
              return (
                <Card key={d.id} hoverable onClick={() => setSelected(d)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {d.avatar_url ? (
                          <img src={d.avatar_url} alt={d.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-bold text-gray-300">
                            {d.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-secondary truncate">{d.name}</p>
                        <p className="text-xs text-gray-400 capitalize truncate">
                          {d.vehicle_type || 'Sin vehículo'} {d.vehicle_plate && `· ${d.vehicle_plate}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-secondary">
                        {delivered} entregas {active > 0 && `· 🛵 ${active} activa`}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        {d.rating_count > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-gray-500">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {d.rating_avg.toFixed(1)}
                          </span>
                        )}
                        <span className={`text-xs font-semibold ${d.active ? 'text-success' : 'text-danger'}`}>
                          {d.active ? 'Activo' : 'Desactivado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <DeliveryPersonDetailPanel
          deliveryPerson={selected}
          orders={ordersByDelivery.get(selected.id) || []}
          restaurantsById={restaurantsById}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onToggleActive={() => setConfirmTarget(selected)}
        />
      )}

      {editing && (
        <UserEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(updates) => editUser(editing.id, updates)}
          onResetPassword={(pwd) => changePassword(editing.id, pwd)}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.active ? 'Desactivar domiciliario' : 'Activar domiciliario'}
        message={
          confirmTarget?.active
            ? `${confirmTarget?.name} no podrá iniciar sesión ni aceptar pedidos mientras esté desactivado.`
            : `${confirmTarget?.name} podrá volver a iniciar sesión y aceptar pedidos.`
        }
        confirmLabel={confirmTarget?.active ? 'Desactivar' : 'Activar'}
        danger={!!confirmTarget?.active}
        loading={toggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}
