import { useState } from 'react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { UserEditModal } from '../components/UserEditModal'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { User } from '@/shared/types'

const ROLE_LABELS: Record<string, string> = {
  client: '🧑 Cliente',
  restaurant: '🏪 Restaurante',
  delivery: '🚴 Domiciliario',
  admin: '👔 Admin',
}

export const AdminUsersPage = () => {
  const { users, loading, error, editUser, toggleActive, changePassword } = useAdminUsers()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null)
  const [toggling, setToggling] = useState(false)
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return
    setToggling(true)
    try {
      await toggleActive(confirmTarget.id, !confirmTarget.active)
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
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Usuarios</h1>
        <p className="text-sm text-gray-500 mb-6">
          {users.length} usuarios registrados en la plataforma
        </p>

        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm mb-5"
        />

        {loading && <p className="text-gray-400 text-sm">Cargando usuarios...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Correo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Rol</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-secondary">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">{ROLE_LABELS[u.role] || u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {u.active ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingUser(u)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmTarget(u)}>
                        {u.active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updates) => editUser(editingUser.id, updates)}
          onResetPassword={(pwd) => changePassword(editingUser.id, pwd)}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.active ? 'Desactivar usuario' : 'Activar usuario'}
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
