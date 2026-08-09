import { createContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/shared/types'
import { mockSupabase, getAuthUser, getCurrentUserProfile } from '@/services/mockSupabase'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { initializeMockData } from '@/data/mockData'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Inicializar datos mock en primera carga
  useEffect(() => {
    const isInitialized = localStorageService.get('app_initialized')
    if (!isInitialized) {
      initializeMockData()
      localStorageService.set('app_initialized', true)
      console.log('✅ App inicializada con datos mock')
    }
  }, [])

  // Verificar sesión existente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await getAuthUser()
        if (authUser) {
          const profile = await getCurrentUserProfile(authUser.id)
          setUser(profile)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Suscribirse a cambios de autenticación
    const subscription = mockSupabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await getCurrentUserProfile(session.user.id)
          setUser(profile)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await mockSupabase.auth.signInWithPassword(
        email,
        password
      )

      if (error) throw error

      if (data?.user) {
        const profile = await getCurrentUserProfile(data.user.id)
        setUser(profile)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: string) => {
    setLoading(true)
    try {
      const { data, error } = await mockSupabase.auth.signUp(email, password)

      if (error) throw error

      if (data?.user) {
        // Actualizar datos del usuario
        const users = localStorageService.get(STORAGE_KEYS.USERS) || []
        const updatedUsers = users.map((u: User) => {
          if (u.id === data.user.id) {
            return { ...u, name, role }
          }
          return u
        })
        localStorageService.set(STORAGE_KEYS.USERS, updatedUsers)

        // Actualizar usuario actual
        const profile = await getCurrentUserProfile(data.user.id)
        setUser(profile)
      }
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await mockSupabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
