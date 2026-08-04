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
          const profile = await getCurrentUserProfile(session.user.id)
          setUser(profile)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        const profile = await getCurrentUserProfile(data.user.id)
        setUser(profile)
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: string) => {
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        // Crear perfil en tabla users
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              name,
              role,
            }
          ])
        
        if (profileError) throw profileError
        
        const profile = await getCurrentUserProfile(authData.user.id)
        setUser(profile)
      }
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
