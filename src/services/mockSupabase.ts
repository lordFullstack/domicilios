/**
 * Cliente Mock de Supabase
 * Simula operaciones de Supabase usando localStorage/IndexedDB
 * Permite desarrollo sin dependencia de backend real
 */

import { localStorageService, STORAGE_KEYS } from './storage.service'
import { User } from '@/shared/types'

// ============================================
// TIPOS
// ============================================

interface AuthUser {
  id: string
  email: string
}

interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
}

// ============================================
// MOCK SUPABASE CLIENT
// ============================================

export const mockSupabase = {
  // ============================================
  // AUTH
  // ============================================

  auth: {
    /**
     * Simular signUp
     */
    signUp: async (email: string, _password: string) => {
      try {
        // Validar que no exista el usuario
        const users = localStorageService.get(STORAGE_KEYS.USERS) || []
        const userExists = users.some((u: User) => u.email === email)

        if (userExists) {
          return {
            data: null,
            error: new Error('Usuario ya existe'),
          }
        }

        // Crear nuevo usuario
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'client',
          created_at: new Date().toISOString(),
        }

        // Guardar usuario
        const updatedUsers = [...users, newUser]
        localStorageService.set(STORAGE_KEYS.USERS, updatedUsers)

        // Crear sesión
        const session: AuthSession = {
          user: {
            id: newUser.id,
            email: newUser.email,
          },
          access_token: `token-${Date.now()}`,
          refresh_token: `refresh-${Date.now()}`,
        }

        localStorageService.set(STORAGE_KEYS.AUTH_SESSION, session)
        localStorageService.set(STORAGE_KEYS.CURRENT_USER, newUser)

        return {
          data: { user: newUser },
          error: null,
        }
      } catch (error) {
        return {
          data: null,
          error,
        }
      }
    },

    /**
     * Simular signInWithPassword
     */
    signInWithPassword: async (email: string, _password: string) => {
      try {
        // Buscar usuario
        const users = localStorageService.get(STORAGE_KEYS.USERS) || []
        const user = users.find((u: User) => u.email === email)

        if (!user) {
          return {
            data: null,
            error: new Error('Credenciales inválidas'),
          }
        }

        // En mock, cualquier password es válida (solo para testing)
        // En producción, aquí iría validación real

        // Crear sesión
        const session: AuthSession = {
          user: {
            id: user.id,
            email: user.email,
          },
          access_token: `token-${Date.now()}`,
          refresh_token: `refresh-${Date.now()}`,
        }

        localStorageService.set(STORAGE_KEYS.AUTH_SESSION, session)
        localStorageService.set(STORAGE_KEYS.CURRENT_USER, user)

        return {
          data: { user, session },
          error: null,
        }
      } catch (error) {
        return {
          data: null,
          error,
        }
      }
    },

    /**
     * Simular getUser
     */
    getUser: async () => {
      try {
        const session = localStorageService.get(STORAGE_KEYS.AUTH_SESSION)
        if (!session) {
          return {
            data: { user: null },
            error: null,
          }
        }

        return {
          data: { user: session.user },
          error: null,
        }
      } catch (error) {
        return {
          data: { user: null },
          error,
        }
      }
    },

    /**
     * Simular signOut
     */
    signOut: async () => {
      try {
        localStorageService.remove(STORAGE_KEYS.AUTH_SESSION)
        localStorageService.remove(STORAGE_KEYS.CURRENT_USER)
        return { error: null }
      } catch (error) {
        return { error }
      }
    },

    /**
     * Listener de cambios de autenticación
     */
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simular cambios de sesión
      const checkSession = () => {
        const session = localStorageService.get(STORAGE_KEYS.AUTH_SESSION)
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
      }

      checkSession()

      // Retornar función para desuscribirse
      return {
        unsubscribe: () => {
          // Cleanup
        },
      }
    },
  },

  // ============================================
  // DATABASE (TABLAS)
  // ============================================

  from: (tableName: string) => {
    return {
      /**
       * SELECT
       */
      select: (_columns: string = '*') => {
        return {
          eq: (field: string, value: any) => {
            return {
              single: async () => {
                try {
                  const data = localStorageService.get(STORAGE_KEYS[tableName as keyof typeof STORAGE_KEYS] || tableName)
                  if (!data) return { data: null, error: null }

                  const items = Array.isArray(data) ? data : [data]
                  const item = items.find((d: any) => d[field] === value)

                  return {
                    data: item || null,
                    error: null,
                  }
                } catch (error) {
                  return { data: null, error }
                }
              },

              async: async () => {
                try {
                  const data = localStorageService.get(STORAGE_KEYS[tableName as keyof typeof STORAGE_KEYS] || tableName)
                  if (!data) return { data: [], error: null }

                  const items = Array.isArray(data) ? data : [data]
                  const filtered = items.filter((d: any) => d[field] === value)

                  return {
                    data: filtered,
                    error: null,
                  }
                } catch (error) {
                  return { data: [], error }
                }
              },
            }
          },

          async: async () => {
            try {
              const data = localStorageService.get(STORAGE_KEYS[tableName as keyof typeof STORAGE_KEYS] || tableName)
              return {
                data: data || [],
                error: null,
              }
            } catch (error) {
              return { data: [], error }
            }
          },
        }
      },

      /**
       * INSERT
       */
      insert: async (values: any) => {
        try {
          const storageKey = STORAGE_KEYS[tableName as keyof typeof STORAGE_KEYS] || tableName
          const data = localStorageService.get(storageKey) || []
          const items = Array.isArray(data) ? data : [data]

          const newItems = Array.isArray(values) ? values : [values]
          const updated = [...items, ...newItems]

          localStorageService.set(storageKey, updated)

          return {
            data: values,
            error: null,
          }
        } catch (error) {
          return { data: null, error }
        }
      },

      /**
       * UPDATE
       */
      update: (updates: any) => {
        return {
          eq: async (field: string, value: any) => {
            try {
              const storageKey = STORAGE_KEYS[tableName as keyof typeof STORAGE_KEYS] || tableName
              const data = localStorageService.get(storageKey) || []
              const items = Array.isArray(data) ? data : [data]

              const updated = items.map((item: any) => {
                if (item[field] === value) {
                  return { ...item, ...updates }
                }
                return item
              })

              localStorageService.set(storageKey, updated)

              return {
                data: updated.filter((item: any) => item[field] === value),
                error: null,
              }
            } catch (error) {
              return { data: null, error }
            }
          },
        }
      },

      /**
       * DELETE
       */
      delete: () => {
        return {
          eq: async (field: string, value: any) => {
            try {
              const storageKey = STORAGE_KEYS[tableName as keyof typeof STORAGE_KEYS] || tableName
              const data = localStorageService.get(storageKey) || []
              const items = Array.isArray(data) ? data : [data]

              const updated = items.filter((item: any) => item[field] !== value)

              localStorageService.set(storageKey, updated)

              return {
                data: null,
                error: null,
              }
            } catch (error) {
              return { data: null, error }
            }
          },
        }
      },
    }
  },
}

// ============================================
// HELPERS PARA COMPATIBILIDAD
// ============================================

export const getCurrentUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const user = localStorageService.get(STORAGE_KEYS.CURRENT_USER)
    if (user && user.id === userId) {
      return user
    }

    const users = localStorageService.get(STORAGE_KEYS.USERS) || []
    return users.find((u: User) => u.id === userId) || null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const getAuthUser = async () => {
  try {
    const session = localStorageService.get(STORAGE_KEYS.AUTH_SESSION)
    if (!session) return null
    return {
      id: session.user.id,
      email: session.user.email,
    }
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

export const signOut = async () => {
  try {
    localStorageService.remove(STORAGE_KEYS.AUTH_SESSION)
    localStorageService.remove(STORAGE_KEYS.CURRENT_USER)
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
