import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, User, ArrowRight } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { UserRole } from '@/shared/types'
import { getAuthErrorMessage } from '../utils/authErrors'
import { RegisterHero } from '../components/RegisterHero'
import { AuthInput } from '../components/AuthInput'
import { AuthPasswordInput } from '../components/AuthPasswordInput'
import { AuthRoleSelector } from '../components/AuthRoleSelector'
import { RegisterFooter } from '../components/RegisterFooter'

const ROUTE_BY_ROLE: Record<string, string> = {
  [USER_ROLES.CLIENT]: ROUTES.CLIENT_HOME,
  [USER_ROLES.RESTAURANT]: ROUTES.RESTAURANT_DASHBOARD,
  [USER_ROLES.DELIVERY]: ROUTES.DELIVERY_DASHBOARD,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
}

export const RegisterPage = () => {
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) || USER_ROLES.CLIENT

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>(initialRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(email, password, name, role)
      navigate(ROUTE_BY_ROLE[role] || ROUTES.CLIENT_HOME)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'No pudimos crear tu cuenta. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:grid md:grid-cols-2">
      <RegisterHero />

      <div className="relative z-10 -mt-8 md:mt-0 flex flex-col justify-center bg-white rounded-t-[2rem] md:rounded-none px-6 sm:px-8 md:px-12 lg:px-16 py-8 md:py-16 safe-bottom">
        <div className="w-full max-w-[400px] mx-auto animate-fade-slide-up">
          <div className="mb-6 md:mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-secondary">
              Crea tu cuenta
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Regístrate y empieza a pedir tu comida favorita
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-2xl mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              icon={User}
              label="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
            <AuthInput
              icon={Mail}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <AuthPasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <AuthRoleSelector value={role} onChange={setRole} />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 shadow-lg shadow-primary/25 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Crear cuenta</span>
              {!loading && <ArrowRight className="w-4 h-4 shrink-0" />}
            </Button>
          </form>

          <RegisterFooter />
        </div>
      </div>
    </div>
  )
}
