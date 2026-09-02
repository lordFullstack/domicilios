import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'
import { useNotifications } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { getNotificationIcon, getNotificationTarget } from '@/shared/utils/notificationLinks'

const timeAgo = (dateStr: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000))
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.round(hours / 24)} d`
}

type Tab = 'unread' | 'all'

export const NotificationsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [tab, setTab] = useState<Tab>('unread')

  const visible = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const handleClick = async (id: string, orderId?: string | null) => {
    await markAsRead(id)
    if (!user) return
    const target = getNotificationTarget(user.role, orderId)
    if (target) navigate(target)
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-10 safe-bottom">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="touch-target focus-ring w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-secondary">Notificaciones</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <Check className="w-3.5 h-3.5" />
            Marcar todas leídas
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mx-5 mb-4 w-fit">
        <button
          onClick={() => setTab('unread')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'unread' ? 'bg-white text-secondary shadow-card' : 'text-gray-500'
          }`}
        >
          No leídas{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'all' ? 'bg-white text-secondary shadow-card' : 'text-gray-500'
          }`}
        >
          Todas
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Cargando...</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12 px-5">
          {tab === 'unread' ? 'No tienes notificaciones sin leer.' : 'Todavía no tienes notificaciones.'}
        </p>
      ) : (
        <div className="px-5 flex flex-col gap-2">
          {visible.map((n) => {
            const Icon = getNotificationIcon(n.title)
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.order_id)}
                className={`focus-ring text-left rounded-2xl p-3 flex items-start gap-3 transition-colors ${
                  n.read ? 'bg-white border border-gray-100' : 'bg-primary/5 border border-primary/10'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-secondary">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
