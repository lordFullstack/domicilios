import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Icon as BrandIcon } from '@/shared/icons'
import { useNotifications } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { requestNotificationPermission } from '@/shared/utils/notificationSound'
import { getNotificationTarget } from '@/shared/utils/notificationLinks'
import { ROUTES } from '@/config/constants'
import { EmptyState } from './EmptyState'
import { EMPTY_COPY } from '@/shared/constants/stateCopy'

const timeAgo = (dateStr: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000))
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.round(hours / 24)} d`
}

/** El número visible es decorativo: el conteo real va en el aria-label. */
export const bellLabel = (count: number) =>
  count <= 0
    ? 'Notificaciones'
    : count > 99
      ? 'Notificaciones, más de 99 sin leer'
      : `Notificaciones, ${count} sin leer`

interface NotificationBellProps {
  // Color del ícono/badge cuando el fondo detrás es oscuro (ej: hero del dashboard)
  variant?: 'light' | 'dark'
}

export const NotificationBell = ({ variant = 'dark' }: NotificationBellProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleNotificationClick = async (id: string, orderId?: string | null) => {
    await markAsRead(id)
    setOpen(false)
    if (!user) return
    const target = getNotificationTarget(user.role, orderId)
    if (target) navigate(target)
  }

  const iconColor = variant === 'light' ? 'text-white' : 'text-secondary'

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de 48×48 (área táctil) con el círculo visual de 36px de
          siempre adentro; el -m-1.5 compensa para no mover el header. */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          requestNotificationPermission()
        }}
        aria-label={bellLabel(unreadCount)}
        aria-expanded={open}
        aria-haspopup="true"
        className="focus-ring relative w-12 h-12 -m-1.5 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            variant === 'light' ? 'bg-white/10' : 'bg-gray-50'
          }`}
        >
          <BrandIcon name="bell" size={20} className={iconColor} />
        </span>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 min-w-5 h-5 px-1 bg-danger rounded-full flex items-center justify-center text-xs font-bold tabular-nums text-white border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-w-[85vw] bg-white rounded-2xl shadow-card-hover border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="font-display font-bold text-sm text-secondary">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Check className="w-3 h-3" aria-hidden="true" />
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState
                size="sm"
                illustration={EMPTY_COPY.notificationsAll.illustration}
                title={EMPTY_COPY.notificationsAll.title}
                description={EMPTY_COPY.notificationsAll.description}
              />
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.order_id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                    n.read ? 'bg-white' : 'bg-danger/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-secondary">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                      <p className="text-xs text-gray-500 tabular-nums mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate(ROUTES.NOTIFICATIONS)
            }}
            className="w-full text-center py-3 text-xs font-semibold text-primary border-t border-gray-50"
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  )
}
