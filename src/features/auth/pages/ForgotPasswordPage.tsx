import { useState } from 'react'
import { Rocket, ChevronLeft, MailCheck } from 'lucide-react'
import { supabase } from '@/shared/utils/supabase'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ROUTES } from '@/config/constants'
import { getAuthErrorMessage } from '../utils/authErrors'

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      })
      // Deliberado: Supabase no informa si el correo existe o no, y
      // nosotros tampoco lo hacemos — mostrar "no existe esa cuenta"
      // le regalaría a cualquiera una forma de comprobar qué correos
      // están registrados en la plataforma.
      setSent(true)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'No pudimos enviar el correo. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <MailCheck className="w-7 h-7 text-success" />
        </div>
        <h1 className="font-display text-xl font-bold text-secondary mb-2">Revisa tu correo</h1>
        <p className="text-sm text-gray-500 mb-6">
          Si <strong className="text-secondary">{email}</strong> tiene una cuenta con nosotros, te
          enviamos un link para restablecer tu contraseña.
        </p>
        <a href={ROUTES.LOGIN} className="text-primary font-semibold text-sm">
          Volver a iniciar sesión
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto">
      <a href={ROUTES.LOGIN} className="flex items-center gap-1 text-sm text-gray-500 mb-8">
        <ChevronLeft className="w-4 h-4" />
        Volver
      </a>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-xl font-bold text-secondary text-center">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-gray-500 text-sm mt-1 text-center">
          Te mandamos un link para crear una nueva.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-2xl mb-4" role="alert">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Enviar link
        </Button>
      </form>
    </div>
  )
}
