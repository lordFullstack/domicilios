/**
 * Servicio de Almacenamiento Local
 * Gestiona datos en localStorage e IndexedDB
 */

const DB_NAME = 'loop-maestro-mvp'
const DB_VERSION = 1

// Tipos de almacenamiento
export interface StorageItem {
  key: string
  value: any
  timestamp?: number
}

// ============================================
// LOCALSTORAGE SERVICE
// ============================================

export const localStorageService = {
  /**
   * Guardar datos en localStorage
   */
  set: (key: string, value: any) => {
    try {
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(item))
      return true
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Obtener datos de localStorage
   */
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      const parsed = JSON.parse(item)
      return parsed.value
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return null
    }
  },

  /**
   * Eliminar datos de localStorage
   */
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Limpiar todo localStorage
   */
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  /**
   * Verificar si existe una clave
   */
  has: (key: string) => {
    return localStorage.getItem(key) !== null
  },

  /**
   * Obtener todas las claves
   */
  keys: () => {
    return Object.keys(localStorage)
  },
}

// ============================================
// INDEXEDDB SERVICE (para datos más grandes)
// ============================================

export const indexedDBService = {
  /**
   * Abrir conexión a IndexedDB
   */
  openDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Crear stores si no existen
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('orderItems')) {
          db.createObjectStore('orderItems', { keyPath: 'id' })
        }
      }
    })
  },

  /**
   * Guardar datos en IndexedDB
   */
  set: async (storeName: string, data: any) => {
    try {
      const db = await indexedDBService.openDB()
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(true)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error saving to IndexedDB (${storeName}):`, error)
      return false
    }
  },

  /**
   * Obtener datos de IndexedDB
   */
  get: async (storeName: string, key: string) => {
    try {
      const db = await indexedDBService.openDB()
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error reading from IndexedDB (${storeName}):`, error)
      return null
    }
  },

  /**
   * Obtener todos los datos de un store
   */
  getAll: async (storeName: string) => {
    try {
      const db = await indexedDBService.openDB()
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error reading all from IndexedDB (${storeName}):`, error)
      return []
    }
  },

  /**
   * Eliminar datos de IndexedDB
   */
  delete: async (storeName: string, key: string) => {
    try {
      const db = await indexedDBService.openDB()
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(true)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error deleting from IndexedDB (${storeName}):`, error)
      return false
    }
  },

  /**
   * Limpiar un store completo
   */
  clear: async (storeName: string) => {
    try {
      const db = await indexedDBService.openDB()
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(true)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error clearing IndexedDB (${storeName}):`, error)
      return false
    }
  },
}

// ============================================
// STORAGE KEYS (constantes)
// ============================================

export const STORAGE_KEYS = {
  // Auth
  AUTH_USER: 'auth_user',
  AUTH_SESSION: 'auth_session',
  AUTH_TOKEN: 'auth_token',

  // Usuarios
  USERS: 'users',
  CURRENT_USER: 'current_user',

  // Restaurantes
  RESTAURANTS: 'restaurants',
  RESTAURANT_FAVORITES: 'restaurant_favorites',

  // Productos
  PRODUCTS: 'products',

  // Carrito
  CART: 'cart',

  // Órdenes (IndexedDB)
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',

  // Preferences
  USER_PREFERENCES: 'user_preferences',
}
