import { useEffect } from 'react'
import { AuthProvider } from '@/features/auth/AuthContext'
import { CartProvider } from '@/features/client/CartContext'
import { Router } from '@/router'
import { unlockNotificationAudio } from '@/shared/utils/notificationSound'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { ConnectionBanner } from '@/shared/components/ConnectionBanner'
import { UpdatePrompt } from '@/shared/components/UpdatePrompt'
import '@/styles.css'

export const App = () => {
  useEffect(() => {
    // El navegador bloquea el audio hasta que el usuario interactúa por
    // primera vez con la página — este listener lo desbloquea apenas
    // toque/haga clic en cualquier parte, y luego se quita solo.
    const handleFirstInteraction = () => {
      unlockNotificationAudio()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)
    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* CartProvider vive aquí (LOOP_09 — QA funcional): antes NO
            estaba montado en ningún lugar del árbol, así que cada
            pantalla que llamaba a useCart() (BottomNav, CartFloatingBar,
            RestaurantDetailPage, CartPage, CheckoutPage, OrderDetailPage)
            tenía su propia copia de estado leída de localStorage solo al
            montarse — el caso de bug que el propio CartContext.tsx ya
            documentaba, pero que nunca se terminó de conectar. Con el
            Provider real montado y todos los consumidores usando
            useCartContext(), un solo estado compartido. */}
        <CartProvider>
          <ConnectionBanner />
          <UpdatePrompt />
          <Router />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
