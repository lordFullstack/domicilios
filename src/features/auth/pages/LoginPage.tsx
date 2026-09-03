import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Bot } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ROUTES, USER_ROLES } from '@/config/constants'

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
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-secondary text-center">
          Domicilios Riohacha
        </h1>
        <p className="text-gray-400 text-sm mt-1">Tu comida favorita, en minutos</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-sm mt-4">
        <a href={ROUTES.FORGOT_PASSWORD} className="text-gray-400">
          ¿Olvidaste tu contraseña?
        </a>
      </p>

      <p className="text-center text-sm text-gray-400 mt-2">
        ¿No tienes cuenta?{' '}
        <a href={ROUTES.REGISTER} className="text-primary font-semibold">
          Regístrate aquí
        </a>
      </p>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-300 mt-8">
        <Bot className="w-3.5 h-3.5" />
        by Jorge Ghisays y Claude
      </p>
    </div>
  )
}
