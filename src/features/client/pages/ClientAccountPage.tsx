import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, Check } from 'lucide-react'
import { Icon as BrandIcon } from '@/shared/icons'
import { useAuth } from '@/shared/hooks/useAuth'
import { useNotifications } from '@/hooks/useLocalData'
import { AppShell } from '@/shared/components/AppShell'
import { BottomNav } from '@/shared/components/BottomNav'
import { LogoutConfirmSheet } from '@/shared/components/LogoutConfirmSheet'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { InstallAppCard } from '@/shared/components/InstallAppCard'
import { SupportLink } from '@/shared/components/SupportLink'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Avatar } from '@/shared/components/Avatar'
import { ROUTES } from '@/config/constants'
import { formatFullName } from '@/shared/utils/format'

export const ClientAccountPage = () => {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  // Solo render: el valor en backend no se reescribe. Si el usuario edita,
  // se respeta exactamente lo que escriba (sin capitalizar en vivo).
  const displayName = formatFullName(user?.name)
  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoutSheetOpen, setLogoutSheetOpen] = useState(false)

  // Contra displayName (no user.name): si no, "jose" → "José" contaría como
  // cambio y el botón Guardar aparecería sin que el usuario tocara nada.
  const hasChanges = name.trim().length > 0 && name.trim() !== displayName

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
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Avatar src={user?.avatar_url} name={displayName || user?.email} size="lg" />
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold text-secondary truncate">
            {displayName || 'Mi cuenta'}
          </h1>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Mi perfil */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">MI PERFIL</h2>
        <div className="card-surface--flat bg-white rounded-2xl p-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />

          {error && <p className="text-danger text-sm mt-2">{error}</p>}

          {hasChanges && (
            <Button variant="solid" size="sm" loading={saving} onClick={handleSave} className="mt-3">
              {saved ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="h-4 w-4" aria-hidden="true" /> Guardado
                </span>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Configuración */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">CONFIGURACIÓN</h2>
        <SupportLink className="w-full mb-3" />
        <InstallAppCard />
        <NotificationPermissionCard />

        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="focus-ring w-full flex items-center justify-between card-surface--flat bg-white rounded-2xl p-4 mt-2"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <BrandIcon name="bell" size="sm" className="text-gray-500" />
            Notificaciones
            {unreadCount > 0 && (
              <span className="bg-danger text-white text-xs font-bold tabular-nums rounded-full min-w-6 h-6 px-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={() => navigate(ROUTES.CLIENT_ORDERS)}
          className="focus-ring w-full flex items-center justify-between card-surface--flat bg-white rounded-2xl p-4 mt-2"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <BrandIcon name="orders" size="sm" className="text-gray-500" />
            Mis pedidos
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Cerrar sesión */}
      <div className="px-5">
        <button
          onClick={() => setLogoutSheetOpen(true)}
          className="focus-ring w-full flex items-center gap-2 card-surface--flat bg-white rounded-2xl p-4 text-danger font-semibold text-sm"
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
