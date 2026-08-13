import { useNavigate, useLocation } from 'react-router-dom'
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList, LucideIcon } from 'lucide-react'
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

interface BottomNavProps {
  role?: 'client' | 'restaurant'
}

export const BottomNav = ({ role = 'client' }: BottomNavProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart } = useCart()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const items = role === 'restaurant' ? RESTAURANT_ITEMS : CLIENT_ITEMS

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-40">
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
                color={isActive ? '#FF441F' : '#9CA3AF'}
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
  )
}
