import { useState } from 'react'
import { X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './Button'

// registerType: 'prompt' en vite.config.ts hace que el Service Worker NUEVO
// espere en segundo plano en vez de reemplazar la app a mitad de una sesión
// (lo que podría cortar un pedido en curso). Este componente le da al
// usuario el control: sigue usando la versión actual hasta que él decide
// actualizar.
export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Revisa si hay una versión nueva cada vez que la app vuelve a
      // primer plano (el usuario reabre la app tras tenerla en segundo plano).
      registration &&
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // cada hora, mientras la app esté abierta
    },
  })

  const [dismissed, setDismissed] = useState(false)

  if (!needRefresh || dismissed) return null

  // Arriba y descartable: abajo tapaba justo la barra del carrito y los
  // CTAs de pago, que viven en la franja inferior de todas las pantallas.
  return (
    <div
      className="fixed left-4 right-4 z-50 max-w-md mx-auto bg-secondary text-white rounded-2xl py-2.5 pl-4 pr-2 shadow-floating flex items-center justify-between gap-2 animate-fade-slide-up"
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      role="status"
    >
      <p className="text-sm flex-1">Hay una nueva versión disponible.</p>
      <Button size="sm" onClick={() => updateServiceWorker(true)}>
        Actualizar
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso de actualización"
        className="touch-target focus-ring w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
