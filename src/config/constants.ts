import { Pizza, Sandwich, Fish, IceCream2, CupSoda, Beef, Shrimp } from 'lucide-react'

export const APP_NAME = 'Domicilios Riohacha'
export const APP_VERSION = '0.1.0'

export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Shared (todos los roles)
  NOTIFICATIONS: '/notifications',
  
  // Client
  CLIENT_HOME: '/app/home',
  CLIENT_RESTAURANTS: '/app/restaurants',
  CLIENT_RESTAURANT: '/app/restaurant/:id',
  CLIENT_CART: '/app/cart',
  CLIENT_CHECKOUT: '/app/checkout',
  CLIENT_ORDERS: '/app/orders',
  CLIENT_ORDER: '/app/order/:id',
  CLIENT_CATEGORY: '/app/category/:category',
  CLIENT_ACCOUNT: '/app/account',
  
  // Restaurant
  RESTAURANT_DASHBOARD: '/restaurant/dashboard',
  RESTAURANT_ORDERS: '/restaurant/orders',
  RESTAURANT_PRODUCTS: '/restaurant/products',
  RESTAURANT_ACCOUNT: '/restaurant/account',
  
  // Delivery
  DELIVERY_DASHBOARD: '/delivery/dashboard',
  DELIVERY_AVAILABLE: '/delivery/available',
  DELIVERY_ACTIVE: '/delivery/active',
  DELIVERY_PROFILE: '/delivery/profile',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_RESTAURANTS: '/admin/restaurants',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_DELIVERY: '/admin/delivery',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PROMOTIONS: '/admin/promotions',
} as const

// `icon` es el ícono real (usado en Home); `emoji` se mantiene para las
// pantallas que todavía no migraron de emoji-como-ícono (admin, filtros
// de explorar) y así no romperlas con este cambio.
export const RESTAURANT_CATEGORIES = [
  { value: 'Pizza', label: 'Pizza', emoji: '🍕', icon: Pizza },
  { value: 'Burgers', label: 'Burgers', emoji: '🍔', icon: Sandwich },
  { value: 'Sushi', label: 'Sushi', emoji: '🍣', icon: Fish },
  { value: 'Postres', label: 'Postres', emoji: '🍰', icon: IceCream2 },
  { value: 'Bebidas', label: 'Bebidas', emoji: '🥤', icon: CupSoda },
  { value: 'Asados', label: 'Asados', emoji: '🍗', icon: Beef },
  // Riohacha es ciudad costera — mariscos es una categoría real del
  // mercado local que faltaba junto a las genéricas de cualquier app
  // de domicilios.
  { value: 'Mariscos', label: 'Mariscos', emoji: '🦐', icon: Shrimp },
] as const

export const USER_ROLES = {
  CLIENT: 'client',
  RESTAURANT: 'restaurant',
  DELIVERY: 'delivery',
  ADMIN: 'admin',
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  IN_DELIVERY: 'in_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const PRODUCT_CATEGORIES = ['Entradas', 'Platos', 'Bebidas', 'Postres', 'Adicionales'] as const

export const PAYMENT_METHOD = {
  CASH_ON_DELIVERY: 'cash_on_delivery',
  ONLINE: 'online',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const
