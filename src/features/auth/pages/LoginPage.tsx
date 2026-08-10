import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Card } from '@/shared/components/Card'
import { RocketMark } from '@/shared/components/RocketMark'
import { ROUTES } from '@/config/constants'

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
      await login(email, password)
      navigate(ROUTES.CLIENT_HOME)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary relative overflow-hidden flex flex-col">
      {/* Nubes decorativas (igual que el mockup de marca) */}
      <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 right-0 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Hero de marca */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
          <RocketMark size={36} />
        </div>
        <p className="text-xs font-semibold tracking-widest text-accent mb-0.5">DOMICILIOS</p>
        <h1 className="font-display text-3xl font-extrabold text-white mb-2">RIOHACHA</h1>
        <p className="text-[11px] tracking-widest text-white/60 font-medium">
          RÁPIDO · SEGURO · CONFIABLE
        </p>
      </div>

      {/* Hoja blanca con el formulario */}
      <div className="relative z-10 flex-1 flex items-end">
        <Card className="w-full rounded-b-none rounded-t-3xl max-w-md mx-auto p-6 pb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-bold text-secondary mb-1">Inicia sesión</h2>
            <p className="text-gray-500 text-sm">Entra a tu cuenta para pedir</p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
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
            <Button type="submit" fullWidth loading={loading}>
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{' '}
              <a href={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
                Regístrate aquí
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
