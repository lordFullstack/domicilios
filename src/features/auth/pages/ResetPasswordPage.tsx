import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/shared/utils/supabase'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ROUTES } from '@/config/constants'

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  // Supabase procesa el token del link (?code= o #access_token=) al cargar
  // la página y dispara PASSWORD_RECOVERY. Hasta que eso pase, no sabemos
  // si el link es válido, así que arrancamos en 'checking'.
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      }
    })

    // Si el evento ya se disparó antes de montar este componente (carrera
    // posible), revisamos si ya hay una sesión de recuperación activa.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus((s) => (s === 'checking' ? 'ready' : s))
    })

    // El link de recuperación expira o puede ser inválido/reusado; si tras
    // unos segundos no llegó el evento, asumimos que el link no es válido.
    const timeout = setTimeout(() => {
      setStatus((s) => (s === 'checking' ? 'invalid' : s))
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      // Por seguridad, no dejamos la sesión de recuperación activa
      // ni asumimos a qué dashboard debe ir por rol: mandamos a login limpio.
      await supabase.auth.signOut()
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2500)
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto text-center">
        <h1 className="font-display text-xl font-bold text-secondary mb-2">
          Enlace inválido o vencido
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Este enlace de recuperación ya no es válido. Solicita uno nuevo.
        </p>
        <a href={ROUTES.FORGOT_PASSWORD} className="text-primary font-semibold text-sm">
          Solicitar nuevo enlace
        </a>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mb-4 mx-auto">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-xl font-bold text-secondary mb-2">
          Contraseña actualizada
        </h1>
        <p className="text-gray-500 text-sm">Redirigiendo a inicio de sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-secondary text-center">
          Nueva contraseña
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Guardar nueva contraseña
        </Button>
      </form>
    </div>
  )
}
