import { USER_ROLES, ORDER_STATUS } from '@/config/constants'

// User
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  vehicle_type?: 'moto' | 'bici' | null
  vehicle_plate?: string | null
  created_at: string
}

// Restaurant
export interface Restaurant {
  id: string
  owner_id: string
  name: string
  description: string
  image_url?: string
  cover_url?: string | null
  address: string
  phone: string
  status: 'open' | 'closed'
  created_at: string
}

// Product
export type ProductCategory = 'Entradas' | 'Platos' | 'Bebidas' | 'Postres' | 'Adicionales'

export interface Product {
  id: string
  restaurant_id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: ProductCategory
  available: boolean
  created_at: string
}

// Order
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export type PaymentMethod = 'cash_on_delivery' | 'online'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Order {
  id: string
  user_id: string
  restaurant_id: string
  total: number
  status: OrderStatus
  delivery_person_id?: string
  delivery_address: string
  special_instructions?: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  current_lat?: number | null
  current_lng?: number | null
  location_updated_at?: string | null
  created_at: string
  updated_at: string
}

// Cart
export interface CartItem {
  product_id: string
  quantity: number
  unit_price: number
}

export type CartState = Map<string, CartItem>

// API Response
export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    message: string
    code: string
  }
}

// Notification
export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  order_id?: string | null
  read: boolean
  created_at: string
}
