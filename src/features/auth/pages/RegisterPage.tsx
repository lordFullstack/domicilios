import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bike } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { UserRole } from '@/shared/types'

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
      navigate(ROUTES.CLIENT_HOME)
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Bike className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-secondary text-center">
          Crea tu cuenta
        </h1>
        <p className="text-gray-400 text-sm mt-1">Únete a Domicilios Riohacha</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          required
        />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de cuenta
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary"
          >
            <option value={USER_ROLES.CLIENT}>Cliente</option>
            <option value={USER_ROLES.RESTAURANT}>Restaurante</option>
            <option value={USER_ROLES.DELIVERY}>Domiciliario</option>
          </select>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Registrarse
        </Button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿Ya tienes cuenta?{' '}
        <a href={ROUTES.LOGIN} className="text-primary font-semibold">
          Inicia sesión
        </a>
      </p>
    </div>
  )
}
