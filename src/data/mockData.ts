/**
 * Datos Mock para Testing
 * Usuarios, restaurantes, productos de prueba
 */

import { User, Restaurant, Product, Order } from '@/shared/types'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'

// ============================================
// USUARIOS MOCK
// ============================================

export const MOCK_USERS: User[] = [
  {
    id: 'user-client-1',
    email: 'cliente@test.com',
    name: 'Juan Cliente',
    phone: '+57 300 1234567',
    role: 'client',
    avatar_url: '👨',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-client-2',
    email: 'maria@test.com',
    name: 'María González',
    phone: '+57 301 7654321',
    role: 'client',
    avatar_url: '👩',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-restaurant-1',
    email: 'restaurante@test.com',
    name: 'Dueño Restaurante',
    phone: '+57 302 1111111',
    role: 'restaurant',
    avatar_url: '👨‍🍳',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-delivery-1',
    email: 'delivery@test.com',
    name: 'Carlos Domiciliario',
    phone: '+57 303 2222222',
    role: 'delivery',
    avatar_url: '🚴',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-admin-1',
    email: 'admin@test.com',
    name: 'Administrador',
    phone: '+57 304 3333333',
    role: 'admin',
    avatar_url: '👔',
    created_at: new Date().toISOString(),
  },
]

// ============================================
// RESTAURANTES MOCK
// ============================================

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    owner_id: 'user-restaurant-1',
    name: 'Pizza Italia',
    description: 'Las mejores pizzas artesanales de la ciudad',
    image_url: '🍕',
    address: 'Cra 7 #123, Bogotá',
    phone: '+57 305 4444444',
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rest-2',
    owner_id: 'user-restaurant-1',
    name: 'Burger House',
    description: 'Hamburguesas premium con ingredientes frescos',
    image_url: '🍔',
    address: 'Cra 8 #456, Bogotá',
    phone: '+57 306 5555555',
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rest-3',
    owner_id: 'user-restaurant-1',
    name: 'Sushi Tokyo',
    description: 'Comida japonesa auténtica',
    image_url: '🍣',
    address: 'Cra 9 #789, Bogotá',
    phone: '+57 307 6666666',
    status: 'open',
    created_at: new Date().toISOString(),
  },
]

// ============================================
// PRODUCTOS MOCK
// ============================================

export const MOCK_PRODUCTS: Product[] = [
  // Pizza Italia
  {
    id: 'prod-1',
    restaurant_id: 'rest-1',
    name: 'Pizza Margarita',
    description: 'Tomate, mozzarella, albahaca',
    price: 28000,
    image_url: '🍕',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    restaurant_id: 'rest-1',
    name: 'Pizza Pepperoni',
    description: 'Mozzarella y pepperoni',
    price: 32000,
    image_url: '🍕',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    restaurant_id: 'rest-1',
    name: 'Pizza Hawaiana',
    description: 'Jamón y piña',
    price: 35000,
    image_url: '🍍',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    restaurant_id: 'rest-1',
    name: 'Coca Cola 2L',
    description: 'Bebida refrescante',
    price: 8000,
    image_url: '🥤',
    available: true,
    created_at: new Date().toISOString(),
  },

  // Burger House
  {
    id: 'prod-5',
    restaurant_id: 'rest-2',
    name: 'Burger Clásico',
    description: 'Carne, queso, lechuga, tomate',
    price: 25000,
    image_url: '🍔',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    restaurant_id: 'rest-2',
    name: 'Burger Doble',
    description: 'Dos carnes, doble queso',
    price: 35000,
    image_url: '🍔',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    restaurant_id: 'rest-2',
    name: 'Papas Fritas Medianas',
    description: 'Papas crujientes y doradas',
    price: 8000,
    image_url: '🍟',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    restaurant_id: 'rest-2',
    name: 'Alitas BBQ',
    description: '6 alitas con salsa BBQ',
    price: 22000,
    image_url: '🍗',
    available: true,
    created_at: new Date().toISOString(),
  },

  // Sushi Tokyo
  {
    id: 'prod-9',
    restaurant_id: 'rest-3',
    name: 'Roll California',
    description: 'Cangrejo, aguacate, pepino',
    price: 28000,
    image_url: '🍣',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    restaurant_id: 'rest-3',
    name: 'Roll Philadelphia',
    description: 'Salmón, cream cheese, aguacate',
    price: 32000,
    image_url: '🍣',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    restaurant_id: 'rest-3',
    name: 'Sashimi Salmón',
    description: '6 piezas de salmón',
    price: 35000,
    image_url: '🐟',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    restaurant_id: 'rest-3',
    name: 'Tempura de Camarones',
    description: 'Camarones rebozados y fritos',
    price: 28000,
    image_url: '🍤',
    available: true,
    created_at: new Date().toISOString(),
  },
]

// ============================================
// ÓRDENES MOCK (de ejemplo)
// ============================================

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    user_id: 'user-client-1',
    restaurant_id: 'rest-1',
    total: 60000,
    status: 'delivered',
    delivery_person_id: 'user-delivery-1',
    delivery_address: 'Cra 10 #100, Bogotá',
    special_instructions: 'Sin cebolla',
    created_at: new Date(Date.now() - 86400000).toISOString(), // Hace 1 día
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'order-2',
    user_id: 'user-client-2',
    restaurant_id: 'rest-2',
    total: 45000,
    status: 'confirmed',
    delivery_person_id: undefined,
    delivery_address: 'Cra 11 #200, Bogotá',
    special_instructions: '',
    created_at: new Date(Date.now() - 3600000).toISOString(), // Hace 1 hora
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
]

// ============================================
// INICIALIZAR DATOS EN STORAGE
// ============================================

export const initializeMockData = () => {
  // Guardar usuarios
  localStorageService.set(STORAGE_KEYS.USERS, MOCK_USERS)

  // Guardar restaurantes
  localStorageService.set(STORAGE_KEYS.RESTAURANTS, MOCK_RESTAURANTS)

  // Guardar productos
  localStorageService.set(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS)

  console.log('✅ Datos mock inicializados en localStorage')
}

// ============================================
// USUARIOS DE PRUEBA (para login)
// ============================================

export const TEST_ACCOUNTS = {
  client: {
    email: 'cliente@test.com',
    password: 'password123',
    description: 'Cliente - Compra comida',
  },
  restaurant: {
    email: 'restaurante@test.com',
    password: 'password123',
    description: 'Restaurante - Recibe órdenes',
  },
  delivery: {
    email: 'delivery@test.com',
    password: 'password123',
    description: 'Domiciliario - Entrega comida',
  },
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    description: 'Admin - Gestiona todo',
  },
}
