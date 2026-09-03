import { useState } from 'react'
import { Rocket, MailCheck } from 'lucide-react'
import { supabase } from '@/shared/utils/supabase'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ROUTES } from '@/config/constants'

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      })
      if (error) throw error
      // Siempre mostramos éxito, exista o no el email, para no revelar
      // qué correos están registrados (evita enumeración de usuarios).
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el correo de recuperación')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 mx-auto">
          <MailCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-xl font-bold text-secondary mb-2">
          Revisa tu correo
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Si <strong>{email}</strong> está registrado, te enviamos un enlace para
          restablecer tu contraseña. Revisa también la carpeta de spam.
        </p>
        <a href={ROUTES.LOGIN} className="text-primary font-semibold text-sm">
          Volver a iniciar sesión
        </a>
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
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-gray-400 text-sm mt-1 text-center">
          Escribe tu email y te enviamos un enlace para recuperarla
        </p>
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
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Enviar enlace de recuperación
        </Button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        <a href={ROUTES.LOGIN} className="text-primary font-semibold">
          Volver a iniciar sesión
        </a>
      </p>
    </div>
  )
}
