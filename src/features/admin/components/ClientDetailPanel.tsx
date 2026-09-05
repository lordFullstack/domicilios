import { useMemo } from 'react'
import { X, MapPin } from 'lucide-react'
import { User, Order } from '@/shared/types'
import { ORDER_STATUS } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import { Button } from '@/shared/components/Button'

interface ClientDetailPanelProps {
  client: User
  orders: Order[] // ya filtradas por este cliente
  restaurantsById: Map<string, { name: string }>
  onClose: () => void
  onEdit: () => void
  onToggleActive: () => void
}

const STATUS_BADGE: Record<string, string> = {
  [ORDER_STATUS.DELIVERED]: 'bg-success/10 text-success',
  [ORDER_STATUS.CANCELLED]: 'bg-danger/10 text-danger',
}

export const ClientDetailPanel = ({
  client,
  orders,
  restaurantsById,
  onClose,
  onEdit,
  onToggleActive,
}: ClientDetailPanelProps) => {
  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED)
    const totalSpent = delivered.reduce((sum, o) => sum + Number(o.total), 0)
    const lastOrder = orders[0] // ya vienen ordenados por created_at desc

    // Direcciones reales que este cliente ha usado en sus pedidos — no es
    // una libreta de direcciones guardadas (esa tabla no existe), son las
    // que efectivamente escribió al hacer checkout.
    const addresses = Array.from(new Set(orders.map((o) => o.delivery_address).filter(Boolean)))

    return { totalOrders: orders.length, delivered: delivered.length, totalSpent, lastOrder, addresses }
  }, [orders])

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-label="Detalle del cliente"
        className="absolute inset-x-0 bottom-0 rounded-t-3xl max-h-[88vh] bg-white shadow-bottom-sheet overflow-y-auto safe-bottom md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-full md:max-w-md md:rounded-none md:max-h-full md:shadow-floating"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {client.avatar_url ? (
                <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-gray-300">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-secondary truncate">{client.name}</h3>
              <p className="text-xs text-gray-500 truncate">{client.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-wide mb-1">PERFIL</p>
            <p className="text-sm text-secondary">{client.phone || 'Sin teléfono registrado'}</p>
            <p className="text-xs text-gray-500">
              Miembro desde{' '}
              {new Date(client.created_at).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                client.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}
            >
              {client.active ? 'Activo' : 'Desactivado'}
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 tracking-wide mb-2">ACTIVIDAD</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-gray-100 rounded-xl p-2 text-center">
                <p className="font-display font-bold text-secondary">{stats.totalOrders}</p>
                <p className="text-[11px] text-gray-500">Pedidos</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-2 text-center">
                <p className="font-display font-bold text-secondary">{stats.delivered}</p>
                <p className="text-[11px] text-gray-500">Entregados</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-2 text-center">
                <p className="font-display font-bold text-primary text-sm">{formatCOP(stats.totalSpent)}</p>
                <p className="text-[11px] text-gray-500">Total gastado</p>
              </div>
            </div>
            {stats.lastOrder && (
              <p className="text-xs text-gray-500 mt-2">
                Último pedido: {new Date(stats.lastOrder.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {stats.addresses.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 tracking-wide mb-2">
                DIRECCIONES USADAS EN PEDIDOS
              </p>
              <div className="flex flex-col gap-1.5">
                {stats.addresses.slice(0, 5).map((addr) => (
                  <p key={addr} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5" />
                    {addr}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-500 tracking-wide mb-2">PEDIDOS RECIENTES</p>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">Este cliente todavía no ha hecho pedidos.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-secondary">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {restaurantsById.get(order.restaurant_id)?.name || 'Restaurante'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-secondary">{formatCOP(order.total)}</p>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-500'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" fullWidth onClick={onEdit}>
              Editar perfil
            </Button>
            <Button variant="outline" fullWidth onClick={onToggleActive}>
              {client.active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
