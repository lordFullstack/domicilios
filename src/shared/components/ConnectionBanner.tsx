import { useOnlineStatus } from '../hooks/useOnlineStatus'

// Se muestra pegado arriba, debajo del notch (safe-area). Solo aparece
// cuando algo requiere avisar al usuario — en estado 'online' normal no
// ocupa espacio ni pantalla.
export const ConnectionBanner = () => {
  const status = useOnlineStatus()

  if (status === 'online') return null

  const config =
    status === 'offline'
      ? {
          bg: 'bg-red-500',
          text: '🔴 Sin conexión — algunas funciones están limitadas',
        }
      : {
          bg: 'bg-yellow-500',
          text: '🟡 Conexión restaurada — sincronizando...',
        }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${config.bg} text-white text-xs font-medium text-center py-2 px-4`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
    >
      {config.text}
    </div>
  )
}
