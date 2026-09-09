import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { getAuthErrorMessage } from '../utils/authErrors'
import { LoginHero } from '../components/LoginHero'
import { LoginInput } from '../components/LoginInput'
import { LoginPasswordInput } from '../components/LoginPasswordInput'
import { LoginFooter } from '../components/LoginFooter'

const ROUTE_BY_ROLE: Record<string, string> = {
  [USER_ROLES.CLIENT]: ROUTES.CLIENT_HOME,
  [USER_ROLES.RESTAURANT]: ROUTES.RESTAURANT_DASHBOARD,
  [USER_ROLES.DELIVERY]: ROUTES.DELIVERY_DASHBOARD,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
}

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const profile = await login(email, password)
      navigate(ROUTE_BY_ROLE[profile?.role || ''] || ROUTES.CLIENT_HOME)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'No pudimos iniciar sesión. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:grid md:grid-cols-2">
      <LoginHero />

      <div className="relative z-10 -mt-8 md:mt-0 flex flex-col justify-center bg-white rounded-t-[2rem] md:rounded-none px-6 sm:px-8 md:px-12 lg:px-16 py-8 md:py-16 safe-bottom">
        <div className="w-full max-w-[400px] mx-auto animate-fade-slide-up">
          <div className="mb-6 md:mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-secondary">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Ingresa tus datos para continuar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-2xl mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <LoginInput
              icon={Mail}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <LoginPasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div className="text-right -mt-1">
              <a
                href={ROUTES.FORGOT_PASSWORD}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 shadow-lg shadow-primary/25 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Iniciar sesión</span>
              {!loading && <ArrowRight className="w-4 h-4 shrink-0" />}
            </Button>
          </form>

          <LoginFooter />
        </div>
      </div>
    </div>
  )
}
