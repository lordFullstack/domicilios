import { useNavigate, useLocation } from 'react-router-dom'
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList, User, Rocket, LucideIcon } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useCart } from '@/hooks/useLocalData'
import { ROUTES } from '@/config/constants'

interface NavItem {
  icon: LucideIcon
  label: string
  path: string
  cartBadge?: boolean
}

const CLIENT_ITEMS: NavItem[] = [
  { icon: Home, label: 'Inicio', path: ROUTES.CLIENT_HOME },
  { icon: UtensilsCrossed, label: 'Restaurantes', path: ROUTES.CLIENT_RESTAURANTS },
  { icon: ShoppingCart, label: 'Carrito', path: ROUTES.CLIENT_CART, cartBadge: true },
  { icon: ClipboardList, label: 'Pedidos', path: ROUTES.CLIENT_ORDERS },
]

const RESTAURANT_ITEMS: NavItem[] = [
  { icon: Home, label: 'Panel', path: ROUTES.RESTAURANT_DASHBOARD },
  { icon: ClipboardList, label: 'Órdenes', path: ROUTES.RESTAURANT_ORDERS },
  { icon: UtensilsCrossed, label: 'Menú', path: ROUTES.RESTAURANT_PRODUCTS },
]

const DELIVERY_ITEMS: NavItem[] = [
  { icon: Home, label: 'Panel', path: ROUTES.DELIVERY_DASHBOARD },
  { icon: User, label: 'Perfil', path: ROUTES.DELIVERY_PROFILE },
]

interface BottomNavProps {
  role?: 'client' | 'restaurant' | 'delivery'
}

export const BottomNav = ({ role = 'client' }: BottomNavProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const items = role === 'restaurant' ? RESTAURANT_ITEMS : role === 'delivery' ? DELIVERY_ITEMS : CLIENT_ITEMS

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  // El dueño de restaurante casi siempre trabaja desde un computador —
  // en pantallas anchas (md+) esta barra pasa a ser un menú lateral fijo.
  // Cliente y domiciliario siguen siendo apps de celular, sin cambios.
  const isSidebarCapable = role === 'restaurant'

  return (
    <>
      {/* Barra inferior — siempre en celular; en restaurante, solo hasta md */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 safe-bottom z-40 ${
          isSidebarCapable ? 'md:hidden' : ''
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          {items.map(({ icon: Icon, label, path, cartBadge }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1 py-1 px-3 relative"
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? '#2F5EFF' : '#9CA3AF'}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
                {cartBadge && cartCount > 0 && (
                  <span className="absolute -top-0.5 right-1 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Barra lateral — solo restaurante, solo desde md hacia arriba */}
      {isSidebarCapable && (
        <div className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-60 md:border-r md:border-gray-100 md:bg-white md:z-40">
          <div className="flex items-center gap-2 px-6 py-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-secondary text-sm">Domicilios Riohacha</span>
          </div>

          <nav className="flex-1 px-3">
            {items.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold mb-1 transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </button>
              )
            })}
          </nav>

          <div className="px-3 pb-6">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-semibold text-secondary truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-danger hover:bg-red-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  )
}
