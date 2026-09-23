import { usePushNotifications } from '@/shared/hooks/usePushNotifications'
import { Icon, Drop } from '@/shared/icons'

// Se muestra en pantallas donde tiene sentido pedir el permiso con contexto
// (ej: justo después de confirmar un pedido, o en "Mis Órdenes") — nunca al
// abrir la app por primera vez sin que el usuario haya hecho nada todavía.
// No vuelve a aparecer una vez que el usuario ya decidió (granted o denied),
// ni si el navegador no soporta push.
export const NotificationPermissionCard = () => {
  const { permission, subscribing, activate } = usePushNotifications()

  if (permission !== 'default') return null

  return (
    <div className="mx-5 mb-4 rounded-2xl bg-primary/5 border border-primary/10 p-4">
      <div className="flex items-start gap-3 mb-3">
        <Drop size={36} className="bg-icon-tint text-brand-700">
          <Icon name="bell" size={20} variant="onDrop" />
        </Drop>
        <p className="text-sm text-secondary">Activa las notificaciones para recibir actualizaciones de tus pedidos.</p>
      </div>
      <button
        onClick={activate}
        disabled={subscribing}
        className="text-sm font-semibold text-primary active:opacity-70"
      >
        {subscribing ? 'Activando...' : 'Activar notificaciones'}
      </button>
    </div>
  )
}
