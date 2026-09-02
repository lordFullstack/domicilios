import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, UserCircle, Store, UtensilsCrossed, Bike, BarChart3, ClipboardList, Megaphone, LogOut } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/config/constants'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD },
  { icon: Users, label: 'Usuarios', path: ROUTES.ADMIN_USERS },
  { icon: UserCircle, label: 'Clientes', path: ROUTES.ADMIN_CLIENTS },
  { icon: Store, label: 'Restaurantes', path: ROUTES.ADMIN_RESTAURANTS },
  { icon: UtensilsCrossed, label: 'Menú', path: ROUTES.ADMIN_PRODUCTS },
  { icon: Bike, label: 'Domiciliarios', path: ROUTES.ADMIN_DELIVERY },
  { icon: BarChart3, label: 'Finanzas', path: ROUTES.ADMIN_REPORTS },
  { icon: ClipboardList, label: 'Órdenes', path: ROUTES.ADMIN_ORDERS },
  { icon: Megaphone, label: 'Promociones', path: ROUTES.ADMIN_PROMOTIONS },
]

// Panel de Admin: explícitamente NO mobile-first (decisión de Jorge).
// Se asume uso desde computador, por eso es un sidebar fijo simple,
// no la BottomNav que usan Cliente/Restaurante/Domiciliario.
export const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-secondary text-white z-40">
      <div className="px-5 py-6">
        <span className="font-display font-bold text-lg">🚀 Admin</span>
        <p className="text-xs text-gray-400 mt-0.5">pa comer express</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 mx-3 mb-6 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
    </div>
  )
}

// Barra superior simple para pantallas pequeñas — el Admin no tiene
// mobile-first, pero sí necesita poder navegar aunque abras el link en el celular.
export const AdminMobileNav = () => {
  const navigate = useNavigate()

  return (
    <div className="md:hidden flex items-center justify-between bg-secondary text-white px-4 pb-3 safe-top">
      <span className="font-display font-bold text-sm">🚀 Admin</span>
      <select
        onChange={(e) => navigate(e.target.value)}
        className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border-none"
        defaultValue=""
      >
        <option value="" disabled>
          Ir a...
        </option>
        {NAV_ITEMS.map(({ label, path }) => (
          <option key={path} value={path} className="text-black">
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
