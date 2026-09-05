import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/shared/utils/supabase'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ROUTES } from '@/config/constants'
import { getAuthErrorMessage } from '../utils/authErrors'

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [checkingLink, setCheckingLink] = useState(true)
  const [validLink, setValidLink] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // El link del correo hace que Supabase establezca automáticamente una
    // sesión de recuperación al cargar la página (lee el token del hash de
    // la URL). Si no hay sesión, el link ya venció o es inválido — no
    // dejamos avanzar al formulario.
    supabase.auth.getSession().then(({ data }) => {
      setValidLink(!!data.session)
      setCheckingLink(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'No pudimos actualizar tu contraseña. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  if (checkingLink) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Verificando link...</p>
      </div>
    )
  }

  if (!validLink) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 max-w-md mx-auto text-center">
        <p className="font-display font-bold text-secondary mb-2">Este link ya no es válido</p>
        <p className="text-sm text-gray-500 mb-6">
          Puede haber vencido o ya haberse usado. Pide uno nuevo.
        </p>
        <Button onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>Pedir nuevo link</Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h1 className="font-display text-xl font-bold text-secondary mb-2">¡Listo!</h1>
        <p className="text-sm text-gray-500 mb-6">Tu contraseña se actualizó correctamente.</p>
        <Button onClick={() => navigate(ROUTES.LOGIN)}>Iniciar sesión</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-xl font-bold text-secondary text-center">
          Crea una nueva contraseña
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-2xl mb-4" role="alert">{error}</div>
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
          Guardar contraseña
        </Button>
      </form>
    </div>
  )
}
