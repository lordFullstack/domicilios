import { Bot } from 'lucide-react'
import { ROUTES } from '@/config/constants'

/**
 * Pie de la pantalla de Login: enlace a registro + crédito.
 * Contenido idéntico al anterior, solo con tratamiento visual actualizado.
 */
export const LoginFooter = () => {
  return (
    <>
      <p className="text-center text-sm text-gray-500 mt-6">
        ¿No tienes cuenta?{' '}
        <a
          href={ROUTES.REGISTER}
          className="text-primary font-semibold hover:text-primary-dark transition-colors"
        >
          Regístrate aquí
        </a>
      </p>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-300 mt-8">
        <Bot className="w-3.5 h-3.5" />
        by Jorge Ghisays y Claude
      </p>
    </>
  )
}
