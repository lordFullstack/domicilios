import { useState, useMemo } from 'react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { UserEditModal } from '../components/UserEditModal'
import { ClientDetailPanel } from '../components/ClientDetailPanel'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { Card } from '@/shared/components/Card'
import { USER_ROLES } from '@/config/constants'
import { User } from '@/shared/types'

export const AdminClientsPage = () => {
  const { users, loading, error, editUser, toggleActive, changePassword } = useAdminUsers()
  const { allOrders } = useAdminOrders()
  const { restaurants } = useAdminRestaurants()

  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [editingClient, setEditingClient] = useState<User | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null)
  const [toggling, setToggling] = useState(false)

  const restaurantsById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants])

  const clients = useMemo(() => users.filter((u) => u.role === USER_ROLES.CLIENT), [users])

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone || '').includes(term)
    )
  }, [clients, search])

  const ordersByClient = useMemo(() => {
    const map = new Map<string, typeof allOrders>()
    for (const order of allOrders) {
      const list = map.get(order.user_id) || []
      list.push(order)
      map.set(order.user_id, list)
    }
    return map
  }, [allOrders])

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return
    setToggling(true)
    try {
      await toggleActive(confirmTarget.id, !confirmTarget.active)
      setConfirmTarget(null)
      setSelectedClient(null)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Clientes</h1>
        <p className="text-sm text-gray-500 mb-6">
          {filteredClients.length} de {clients.length} cliente(s)
        </p>

        <input
          type="search"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar clientes"
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm mb-6"
        />

        {loading && <p className="text-gray-500 text-sm">Cargando clientes...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && filteredClients.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-12 border border-gray-100 rounded-2xl bg-white">
            {clients.length === 0 ? 'Todavía no hay clientes registrados.' : 'Ningún cliente coincide con esta búsqueda.'}
          </p>
        )}

        {!loading && filteredClients.length > 0 && (
          <div className="grid gap-3">
            {filteredClients.map((client) => {
              const clientOrders = ordersByClient.get(client.id) || []
              return (
                <Card key={client.id} hoverable onClick={() => setSelectedClient(client)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {client.avatar_url ? (
                          <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-bold text-gray-300">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-secondary truncate">{client.name}</p>
                        <p className="text-xs text-gray-500 truncate">{client.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-secondary">{clientOrders.length} pedidos</p>
                      <span
                        className={`text-xs font-semibold ${client.active ? 'text-success' : 'text-danger'}`}
                      >
                        {client.active ? 'Activo' : 'Desactivado'}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {selectedClient && (
        <ClientDetailPanel
          client={selectedClient}
          orders={ordersByClient.get(selectedClient.id) || []}
          restaurantsById={restaurantsById}
          onClose={() => setSelectedClient(null)}
          onEdit={() => setEditingClient(selectedClient)}
          onToggleActive={() => setConfirmTarget(selectedClient)}
        />
      )}

      {editingClient && (
        <UserEditModal
          user={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={(updates) => editUser(editingClient.id, updates)}
          onResetPassword={(pwd) => changePassword(editingClient.id, pwd)}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.active ? 'Desactivar cliente' : 'Activar cliente'}
        message={
          confirmTarget?.active
            ? `${confirmTarget?.name} no podrá iniciar sesión mientras esté desactivado. Su historial se conserva.`
            : `${confirmTarget?.name} podrá volver a iniciar sesión.`
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
