import { useEffect, useState } from 'react'

export type ConnectionState = 'online' | 'offline' | 'syncing'

// Estado de conexión para toda la app: 🟢 online / 🟡 syncing (recién
// recuperó señal, dando tiempo a que los hooks de datos recarguen) / 🔴
// offline. El estado 'syncing' dura unos segundos tras reconectar, solo
// como indicador visual — no espera a ninguna sincronización real.
export const useOnlineStatus = () => {
  const [state, setState] = useState<ConnectionState>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  )

  useEffect(() => {
    let syncingTimeout: ReturnType<typeof setTimeout> | undefined

    const handleOnline = () => {
      setState('syncing')
      syncingTimeout = setTimeout(() => setState('online'), 2500)
    }
    const handleOffline = () => {
      if (syncingTimeout) clearTimeout(syncingTimeout)
      setState('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (syncingTimeout) clearTimeout(syncingTimeout)
    }
  }, [])

  return state
}
