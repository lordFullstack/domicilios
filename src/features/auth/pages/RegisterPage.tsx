import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Card } from '@/shared/components/Card'
import { ROUTES, USER_ROLES } from '@/config/constants'

export const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(USER_ROLES.CLIENT)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()

  const initialRole = searchParams.get('role') || USER_ROLES.CLIENT

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
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Loop Maestro</h1>
          <p className="text-gray-600">Crea tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
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
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value={USER_ROLES.CLIENT}>Cliente</option>
              <option value={USER_ROLES.RESTAURANT}>Restaurante</option>
              <option value={USER_ROLES.DELIVERY}>Domiciliario</option>
            </select>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Registrarse
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <a href={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
              Inicia sesión
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}
