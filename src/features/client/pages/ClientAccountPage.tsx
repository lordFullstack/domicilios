import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, Bell } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { AppShell } from '@/shared/components/AppShell'
import { BottomNav } from '@/shared/components/BottomNav'
import { LogoutConfirmSheet } from '@/shared/components/LogoutConfirmSheet'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { InstallAppCard } from '@/shared/components/InstallAppCard'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/config/constants'

export const ClientAccountPage = () => {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoutSheetOpen, setLogoutSheetOpen] = useState(false)

  const hasChanges = name.trim().length > 0 && name !== user?.name

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateProfile({ name: name.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-2">
        <h1 className="font-display text-xl font-bold text-secondary">Mi cuenta</h1>
      </div>

      {/* Mi perfil */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-bold text-gray-400 tracking-wide mb-2">MI PERFIL</h2>
        <div className="border border-gray-100 rounded-2xl p-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-xs text-gray-400 mt-2">{user?.email}</p>

          {error && <p className="text-danger text-xs mt-2">{error}</p>}

          {hasChanges && (
            <Button size="sm" loading={saving} onClick={handleSave} className="mt-3">
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </Button>
          )}
        </div>
      </div>

      {/* Configuración */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-bold text-gray-400 tracking-wide mb-2">CONFIGURACIÓN</h2>
        <InstallAppCard />
        <NotificationPermissionCard />

        <button
          onClick={() => navigate(ROUTES.CLIENT_ORDERS)}
          className="focus-ring w-full flex items-center justify-between border border-gray-100 rounded-2xl p-4 mt-2"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Bell className="w-4 h-4 text-gray-400" />
            Mis pedidos
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Cerrar sesión */}
      <div className="px-5">
        <button
          onClick={() => setLogoutSheetOpen(true)}
          className="focus-ring w-full flex items-center gap-2 border border-gray-100 rounded-2xl p-4 text-danger font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <LogoutConfirmSheet
        open={logoutSheetOpen}
        onClose={() => setLogoutSheetOpen(false)}
        onConfirm={handleLogout}
      />

      <BottomNav />
    </AppShell>
  )
}
