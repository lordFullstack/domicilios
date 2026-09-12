import { ReactNode } from 'react'
import clsx from 'clsx'
import { useCartContext } from '@/shared/hooks/useCartContext'

interface AppShellProps {
  children: ReactNode
  /** Oculta el espacio reservado para la navegación inferior (ej. checkout, detalle a pantalla completa). */
  hideNav?: boolean
  /** Color de fondo del shell. Por defecto blanco, igual que las páginas actuales. */
  background?: 'white' | 'surface'
  className?: string
}

/**
 * Contenedor base para pantallas móviles (Cliente, Restaurante, Domiciliario).
 * No reemplaza el layout de las páginas existentes — es infraestructura para
 * que las páginas nuevas (o refactors futuros) lo adopten de forma incremental.
 *
 * El padding inferior reserva espacio para el BottomNav (pb-24) y, cuando
 * hay productos en el carrito, además para CartFloatingBar (pb-44) — si no,
 * esa barra flotante queda tapando el último contenido de la pantalla.
 *
 * Uso:
 *   <AppShell>
 *     ...contenido...
 *     <BottomNav />
 *   </AppShell>
 */
export const AppShell = ({
  children,
  hideNav = false,
  background = 'white',
  className,
}: AppShellProps) => {
  const { cart } = useCartContext()
  const hasFloatingCart = !hideNav && cart.length > 0

  return (
    <div
      className={clsx(
        'min-h-screen max-w-md mx-auto safe-left safe-right',
        background === 'white' ? 'bg-white' : 'bg-surface',
        !hideNav && (hasFloatingCart ? 'pb-44' : 'pb-24'),
        className
      )}
    >
      {children}
    </div>
  )
}
