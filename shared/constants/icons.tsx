/**
 * Iconos Semánticos de Domicilios Riohacha
 *
 * Centraliza el set de iconos usados en toda la app para mantener
 * consistencia visual (reemplaza el uso de emojis como iconos).
 *
 * Uso:
 *   import { OrderStatusIcon, NavIcon } from '@/shared/constants/icons'
 *   <OrderStatusIcon status="preparing" className="w-5 h-5" />
 */

import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  PartyPopper,
  XCircle,
  Home,
  UtensilsCrossed,
  ShoppingCart,
  ClipboardList,
  User,
  Store,
  ShieldCheck,
  Heart,
  Plus,
  Minus,
  Trash2,
  Pencil,
  MapPin,
  Phone,
  type LucideIcon,
} from 'lucide-react'
import { ORDER_STATUS, USER_ROLES } from '@/config/constants'

// ============================================
// ICONOS POR ESTADO DE ORDEN
// ============================================

export const ORDER_STATUS_ICONS: Record<string, LucideIcon> = {
  [ORDER_STATUS.PENDING]: Clock,
  [ORDER_STATUS.CONFIRMED]: CheckCircle2,
  [ORDER_STATUS.PREPARING]: ChefHat,
  [ORDER_STATUS.READY]: PackageCheck,
  [ORDER_STATUS.IN_DELIVERY]: Bike,
  [ORDER_STATUS.DELIVERED]: PartyPopper,
  [ORDER_STATUS.CANCELLED]: XCircle,
}

interface OrderStatusIconProps {
  status: string
  className?: string
}

export const OrderStatusIcon = ({ status, className = 'w-5 h-5' }: OrderStatusIconProps) => {
  const Icon = ORDER_STATUS_ICONS[status] || Clock
  return <Icon className={className} />
}

// ============================================
// ICONOS POR ROL DE USUARIO
// ============================================

export const ROLE_ICONS: Record<string, LucideIcon> = {
  [USER_ROLES.CLIENT]: User,
  [USER_ROLES.RESTAURANT]: Store,
  [USER_ROLES.DELIVERY]: Bike,
  [USER_ROLES.ADMIN]: ShieldCheck,
}

interface RoleIconProps {
  role: string
  className?: string
}

export const RoleIcon = ({ role, className = 'w-5 h-5' }: RoleIconProps) => {
  const Icon = ROLE_ICONS[role] || User
  return <Icon className={className} />
}

// ============================================
// ICONOS DE NAVEGACIÓN (para bottom nav / sidebar)
// ============================================

export const NAV_ICONS = {
  home: Home,
  restaurants: UtensilsCrossed,
  cart: ShoppingCart,
  orders: ClipboardList,
  profile: User,
} as const

// ============================================
// ICONOS DE ACCIÓN (uso directo)
// ============================================

export const ActionIcons = {
  favorite: Heart,
  add: Plus,
  remove: Minus,
  delete: Trash2,
  edit: Pencil,
  location: MapPin,
  phone: Phone,
}
