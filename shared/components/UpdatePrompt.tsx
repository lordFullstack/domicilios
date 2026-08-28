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

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto bg-secondary text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
      <p className="text-sm">Hay una nueva versión disponible.</p>
      <Button size="sm" onClick={() => updateServiceWorker(true)}>
        Actualizar
      </Button>
    </div>
  )
}
