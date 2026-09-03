import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * `beforeinstallprompt` solo lo dispara Chrome/Edge/Android (no Safari/iOS
 * — ahí la instalación es manual vía "Compartir → Agregar a inicio", ya
 * cubierta con las meta tags de apple-mobile-web-app-* en index.html).
 * Este hook no simula nada: si el navegador no manda el evento, `canInstall`
 * simplemente queda en `false` y no se muestra ningún botón.
 */
export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Ya instalada y corriendo en modo standalone — no tiene sentido
    // ofrecer instalarla de nuevo.
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (isStandalone) setInstalled(true)

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome
  }, [deferredPrompt])

  return { canInstall: !!deferredPrompt && !installed, promptInstall }
}
