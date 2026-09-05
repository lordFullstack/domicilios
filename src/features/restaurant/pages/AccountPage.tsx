import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, Store } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRestaurants } from '@/hooks/useLocalData'
import { BottomNav } from '@/shared/components/BottomNav'
import { LogoutConfirmSheet } from '@/shared/components/LogoutConfirmSheet'
import { NotificationPermissionCard } from '@/shared/components/NotificationPermissionCard'
import { InstallAppCard } from '@/shared/components/InstallAppCard'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/config/constants'

export const RestaurantAccountPage = () => {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { restaurants, loading: loadingRestaurants } = useRestaurants()
  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id)

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
    <div className="min-h-screen bg-white max-w-md md:max-w-2xl mx-auto pb-24 md:pl-0 md:pt-8 md:px-8">
      <div className="px-5 pt-6 pb-2 md:px-0">
        <h1 className="font-display text-xl font-bold text-secondary">Mi cuenta</h1>
      </div>

      {/* Mi perfil (personal) — separado a propósito de los datos del negocio */}
      <div className="px-5 md:px-0 mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">MI PERFIL</h2>
        <div className="border border-gray-100 rounded-2xl p-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-xs text-gray-500 mt-2">{user?.email}</p>

          {error && <p className="text-danger text-xs mt-2">{error}</p>}

          {hasChanges && (
            <Button size="sm" loading={saving} onClick={handleSave} className="mt-3">
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </Button>
          )}
        </div>
      </div>

      {/* Mi negocio — la edición completa (portada, abrir/cerrar) sigue
          viviendo en el Dashboard; acá solo hay un acceso directo con una
          vista previa real, para no duplicar esa lógica. */}
      <div className="px-5 md:px-0 mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">MI NEGOCIO</h2>
        <button
          onClick={() => navigate(ROUTES.RESTAURANT_DASHBOARD)}
          className="focus-ring w-full flex items-center gap-3 border border-gray-100 rounded-2xl p-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-secondary truncate">
              {loadingRestaurants ? 'Cargando...' : myRestaurant?.name || 'Configurar negocio'}
            </p>
            <p className="text-xs text-gray-500">
              {loadingRestaurants
                ? ''
                : myRestaurant
                  ? `${myRestaurant.category} · ${myRestaurant.status === 'open' ? 'Abierto' : 'Cerrado'}`
                  : 'Editar portada, horario y datos'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </button>
      </div>

      {/* Configuración */}
      <div className="px-5 md:px-0 mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">CONFIGURACIÓN</h2>
        <InstallAppCard />
        <NotificationPermissionCard />
      </div>

      {/* Cerrar sesión */}
      <div className="px-5 md:px-0">
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

      <BottomNav role="restaurant" />
    </div>
  )
}
