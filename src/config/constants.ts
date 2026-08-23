export const APP_NAME = 'Domicilios Riohacha'
export const APP_VERSION = '0.1.0'

export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Client
  CLIENT_HOME: '/app/home',
  CLIENT_RESTAURANTS: '/app/restaurants',
  CLIENT_RESTAURANT: '/app/restaurant/:id',
  CLIENT_CART: '/app/cart',
  CLIENT_CHECKOUT: '/app/checkout',
  CLIENT_ORDERS: '/app/orders',
  CLIENT_ORDER: '/app/order/:id',
  
  // Restaurant
  RESTAURANT_DASHBOARD: '/restaurant/dashboard',
  RESTAURANT_ORDERS: '/restaurant/orders',
  RESTAURANT_PRODUCTS: '/restaurant/products',
  
  // Delivery
  DELIVERY_DASHBOARD: '/delivery/dashboard',
  DELIVERY_AVAILABLE: '/delivery/available',
  DELIVERY_ACTIVE: '/delivery/active',
  DELIVERY_PROFILE: '/delivery/profile',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_RESTAURANTS: '/admin/restaurants',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PROMOTIONS: '/admin/promotions',
} as const

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
