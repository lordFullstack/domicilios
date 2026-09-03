import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import { CartProvider } from '@/features/client/CartContext'
import { Router } from '@/router'
import { unlockNotificationAudio } from '@/shared/utils/notificationSound'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { ConnectionBanner } from '@/shared/components/ConnectionBanner'
import { UpdatePrompt } from '@/shared/components/UpdatePrompt'
import '@/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})

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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <ConnectionBanner />
            <UpdatePrompt />
            <Router />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
