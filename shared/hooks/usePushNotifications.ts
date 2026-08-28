import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { isPushSupported, subscribeToPush } from '@/services/pushNotifications.service'

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

export const usePushNotifications = () => {
  const { user } = useAuth()
  const [permission, setPermission] = useState<PushPermissionState>('default')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as PushPermissionState)
  }, [])

  const activate = useCallback(async () => {
    if (!user) return
    setSubscribing(true)
    try {
      const result = await subscribeToPush(user.id)
      setPermission(result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'unsupported')
    } finally {
      setSubscribing(false)
    }
  }, [user])

  return { permission, subscribing, activate }
}
