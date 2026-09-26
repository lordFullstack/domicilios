import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/shared/components/Button'
import { ERROR_COPY } from '@/shared/constants/stateCopy'
import { useAuth } from '@/shared/hooks/useAuth'
import { SupportLink } from '@/shared/components/SupportLink'

/**
 * Pantalla para cuentas con `profiles.active = false`: restaurantes y
 * domiciliarios nuevos (esperan la aprobación del admin) o cuentas
 * desactivadas. Solo ofrece cerrar sesión.
 */
export const AccountInactiveScreen = () => {
  const { logout } = useAuth()
  const copy = ERROR_COPY.accountInactive
  return (
    <ErrorState
      fullScreen
      illustration={copy.illustration}
      title={copy.title}
      description={copy.description}
      action={
        <div className="flex flex-col items-center gap-2">
          <SupportLink message="Hola, mi cuenta en Domicilios Riohacha sigue en revisión." label="Escribir a soporte" />
          <Button variant="tertiary" onClick={() => void logout()}>
            {copy.cta}
          </Button>
        </div>
      }
    />
  )
}
