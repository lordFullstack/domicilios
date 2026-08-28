import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Restaurant, Product, Order } from '@/shared/types'

// Caché de solo lectura para navegación offline: guarda la ÚLTIMA versión
// vista de cada restaurante, sus productos y los pedidos del cliente. No es
// una cola de sincronización — nada que el usuario escriba aquí se envía al
// backend (eso lo bloqueamos explícitamente en Checkout). Solo permite
// seguir viendo lo que ya se cargó antes de perder conexión.

interface OfflineCacheDB extends DBSchema {
  restaurants: {
    key: string
    value: Restaurant & { _cachedAt: number }
  }
  products: {
    key: string // restaurantId
    value: { restaurantId: string; items: Product[]; _cachedAt: number }
  }
  orders: {
    key: string // userId
    value: { userId: string; items: Order[]; _cachedAt: number }
  }
}

const DB_NAME = 'pa-comer-offline-cache'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<OfflineCacheDB>> | null = null

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('restaurants')) {
          db.createObjectStore('restaurants', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'restaurantId' })
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'userId' })
        }
      },
    })
  }
  return dbPromise
}

export const offlineCache = {
  async saveRestaurant(restaurant: Restaurant) {
    try {
      const db = await getDB()
      await db.put('restaurants', { ...restaurant, _cachedAt: Date.now() })
    } catch (e) {
      console.error('offlineCache: error guardando restaurante', e)
    }
  },

  async getRestaurant(id: string): Promise<{ data: Restaurant; cachedAt: number } | null> {
    try {
      const db = await getDB()
      const row = await db.get('restaurants', id)
      if (!row) return null
      const { _cachedAt, ...data } = row
      return { data, cachedAt: _cachedAt }
    } catch (e) {
      console.error('offlineCache: error leyendo restaurante', e)
      return null
    }
  },

  async saveProducts(restaurantId: string, items: Product[]) {
    try {
      const db = await getDB()
      await db.put('products', { restaurantId, items, _cachedAt: Date.now() })
    } catch (e) {
      console.error('offlineCache: error guardando productos', e)
    }
  },

  async getProducts(restaurantId: string): Promise<{ data: Product[]; cachedAt: number } | null> {
    try {
      const db = await getDB()
      const row = await db.get('products', restaurantId)
      if (!row) return null
      return { data: row.items, cachedAt: row._cachedAt }
    } catch (e) {
      console.error('offlineCache: error leyendo productos', e)
      return null
    }
  },

  async saveOrders(userId: string, items: Order[]) {
    try {
      const db = await getDB()
      await db.put('orders', { userId, items, _cachedAt: Date.now() })
    } catch (e) {
      console.error('offlineCache: error guardando pedidos', e)
    }
  },

  async getOrders(userId: string): Promise<{ data: Order[]; cachedAt: number } | null> {
    try {
      const db = await getDB()
      const row = await db.get('orders', userId)
      if (!row) return null
      return { data: row.items, cachedAt: row._cachedAt }
    } catch (e) {
      console.error('offlineCache: error leyendo pedidos', e)
      return null
    }
  },

  // Se llama al cerrar sesión: este dispositivo puede ser compartido
  // (ej. una tablet del restaurante), así que no debe quedar nada del
  // usuario anterior disponible para quien inicie sesión después.
  async clearAll() {
    try {
      const db = await getDB()
      await Promise.all([
        db.clear('restaurants'),
        db.clear('products'),
        db.clear('orders'),
      ])
    } catch (e) {
      console.error('offlineCache: error limpiando caché', e)
    }
  },
}
