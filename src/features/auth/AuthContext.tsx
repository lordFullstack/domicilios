import { createContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/shared/types'
import { supabase, getAuthUser, getCurrentUserProfile } from '@/shared/utils/supabase'

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          try {
            const profile = await getCurrentUserProfile(session.user.id)
            setUser(profile)
          } catch (error) {
            console.error('Error loading profile:', error)
          }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      })

      if (error) throw error

      if (data?.user) {
        // El trigger handle_new_user crea el perfil automáticamente con name/role
        // desde raw_user_meta_data. Puede tomar un instante en propagarse.
        let profile = null
        for (let i = 0; i < 5 && !profile; i++) {
          try {
            profile = await getCurrentUserProfile(data.user.id)
          } catch {
            await new Promise((r) => setTimeout(r, 400))
          }
        }
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
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
