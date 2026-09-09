import { Bot } from 'lucide-react'
import { ROUTES } from '@/config/constants'

/**
 * Pie de la pantalla de Registro: enlace a Login + crédito.
 * Contenido idéntico al anterior (RegisterPage), solo con
 * tratamiento visual actualizado para igualar al del Login.
 */
export const RegisterFooter = () => {
  return (
    <>
      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Ya tienes cuenta?{' '}
        <a
          href={ROUTES.LOGIN}
          className="text-primary font-semibold hover:text-primary-dark transition-colors"
        >
          Inicia sesión
        </a>
      </p>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-300 mt-8">
        <Bot className="w-3.5 h-3.5" />
        by Jorge Ghisays y Claude
      </p>
    </>
  )
}
