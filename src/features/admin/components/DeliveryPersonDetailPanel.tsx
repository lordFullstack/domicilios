import { useMemo } from 'react'
import { X, Phone, Star, MapPin } from 'lucide-react'
import { User, Order } from '@/shared/types'
import { ORDER_STATUS } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import { DeliveryLiveMap } from '@/shared/components/DeliveryLiveMap'
import { Button } from '@/shared/components/Button'

interface DeliveryPersonDetailPanelProps {
  deliveryPerson: User
  orders: Order[] // ya filtradas por este domiciliario
  restaurantsById: Map<string, { name: string }>
  onClose: () => void
  onEdit: () => void
  onToggleActive: () => void
}

const STATUS_BADGE: Record<string, string> = {
  [ORDER_STATUS.DELIVERED]: 'bg-success/10 text-success',
  [ORDER_STATUS.CANCELLED]: 'bg-danger/10 text-danger',
  [ORDER_STATUS.IN_DELIVERY]: 'bg-warning/10 text-warning',
}

export const DeliveryPersonDetailPanel = ({
  deliveryPerson,
  orders,
  restaurantsById,
  onClose,
  onEdit,
  onToggleActive,
}: DeliveryPersonDetailPanelProps) => {
  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED)
    const active = orders.filter((o) => o.status === ORDER_STATUS.IN_DELIVERY)
    const deliveredValue = delivered.reduce((sum, o) => sum + Number(o.total), 0)
    return { totalDeliveries: delivered.length, activeOrders: active, deliveredValue }
  }, [orders])

  // Solo mostramos mapa si hay una entrega en curso CON ubicación real
  // publicada — nunca una posición "última conocida" fuera de una entrega,
  // porque esa infraestructura no existe (current_lat/lng vive en la
  // orden, no en el perfil).
  const activeOrderWithLocation = stats.activeOrders.find((o) => o.current_lat && o.current_lng)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-label="Detalle del domiciliario"
        className="absolute inset-x-0 bottom-0 rounded-t-3xl max-h-[88vh] bg-white shadow-bottom-sheet overflow-y-auto safe-bottom md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-full md:max-w-md md:rounded-none md:max-h-full md:shadow-floating"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {deliveryPerson.avatar_url ? (
                <img src={deliveryPerson.avatar_url} alt={deliveryPerson.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-gray-300">
                  {deliveryPerson.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-secondary truncate">{deliveryPerson.name}</h3>
              <p className="text-xs text-gray-400 truncate">{deliveryPerson.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="focus-ring w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">PERFIL</p>
            <div className="flex items-center gap-2 text-sm text-secondary mb-1">
              {deliveryPerson.phone && (
                <a href={`tel:${deliveryPerson.phone}`} className="flex items-center gap-1 text-primary font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  {deliveryPerson.phone}
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500 capitalize">
              {deliveryPerson.vehicle_type || 'Vehículo sin especificar'}
              {deliveryPerson.vehicle_plate && ` · ${deliveryPerson.vehicle_plate}`}
            </p>
            {deliveryPerson.rating_count ? (
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {deliveryPerson.rating_avg?.toFixed(1)} ({deliveryPerson.rating_count} calificaciones)
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Todavía sin calificaciones</p>
            )}
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                deliveryPerson.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}
            >
              {deliveryPerson.active ? 'Activo' : 'Desactivado'}
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-2">MÉTRICAS</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-gray-100 rounded-xl p-2 text-center">
                <p className="font-display font-bold text-secondary">{stats.totalDeliveries}</p>
                <p className="text-[11px] text-gray-400">Entregas</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-2 text-center">
                <p className="font-display font-bold text-warning">{stats.activeOrders.length}</p>
                <p className="text-[11px] text-gray-400">En camino</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-2 text-center">
                <p className="font-display font-bold text-primary text-sm">{formatCOP(stats.deliveredValue)}</p>
                <p className="text-[11px] text-gray-400">Valor entregado</p>
              </div>
            </div>
          </div>

          {stats.activeOrders.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-wide mb-2">ENTREGA EN CURSO</p>
              {activeOrderWithLocation ? (
                <DeliveryLiveMap
                  lat={activeOrderWithLocation.current_lat!}
                  lng={activeOrderWithLocation.current_lng!}
                  updatedAt={activeOrderWithLocation.location_updated_at || ''}
                />
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 text-center flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-300" />
                  <p className="text-xs text-gray-400">Sin ubicación publicada todavía</p>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-2">PEDIDOS ASIGNADOS</p>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no tiene pedidos asignados.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-secondary">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
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
              {deliveryPerson.active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
