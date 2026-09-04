import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Order, User } from '@/shared/types'
import { ORDER_STATUS, PAYMENT_METHOD } from '@/config/constants'
import { OrderItemsList } from '@/shared/components/OrderItemsList'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'

const STATUS_OPTIONS = Object.values(ORDER_STATUS)

interface OrderDetailPanelProps {
  order: Order
  restaurantName: string
  client?: User
  deliveryPeople: User[]
  onClose: () => void
  onUpdate: (
    expectedStatus: string,
    updates: Record<string, unknown>
  ) => Promise<{ ok: boolean; reason?: 'conflict' | 'error' }>
}

export const OrderDetailPanel = ({
  order,
  restaurantName,
  client,
  deliveryPeople,
  onClose,
  onUpdate,
}: OrderDetailPanelProps) => {
  const [status, setStatus] = useState(order.status)
  const [deliveryPersonId, setDeliveryPersonId] = useState(order.delivery_person_id || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  // Si cambia el pedido que se está viendo (o llega actualizado por
  // reload), sincroniza los selects con el valor real.
  useEffect(() => {
    setStatus(order.status)
    setDeliveryPersonId(order.delivery_person_id || '')
  }, [order.id, order.status, order.delivery_person_id])

  const hasChanges = status !== order.status || deliveryPersonId !== (order.delivery_person_id || '')

  const applyChanges = async () => {
    setSaving(true)
    setMessage(null)
    const result = await onUpdate(order.status, {
      status,
      delivery_person_id: deliveryPersonId || null,
    })
    setSaving(false)

    if (result.ok) {
      setMessage({ text: '✓ Pedido actualizado', error: false })
    } else if (result.reason === 'conflict') {
      setMessage({
        text: 'Este pedido cambió mientras lo tenías abierto (alguien más lo actualizó). Se refrescó con el estado real — revisa antes de volver a intentar.',
        error: true,
      })
    } else {
      setMessage({ text: 'No se pudo actualizar. Intenta de nuevo.', error: true })
    }
  }

  const handleSave = () => {
    if (status === ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.CANCELLED) {
      setConfirmCancel(true)
      return
    }
    applyChanges()
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-label="Detalle del pedido"
        className="absolute inset-x-0 bottom-0 rounded-t-3xl max-h-[88vh] bg-white shadow-bottom-sheet overflow-y-auto safe-bottom md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-full md:max-w-md md:rounded-none md:max-h-full md:shadow-floating"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 className="font-display font-bold text-lg text-secondary">
              #{order.id.substring(0, 8).toUpperCase()}
            </h3>
            <p className="text-xs text-gray-400">
              Actualizado: {new Date(order.updated_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="focus-ring w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {message && (
            <div
              className={`text-sm font-semibold rounded-2xl p-3 flex items-start gap-2 ${
                message.error ? 'bg-red-50 text-danger' : 'bg-green-50 text-green-700'
              }`}
            >
              {message.error && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">RESTAURANTE</p>
            <p className="text-sm font-semibold text-secondary">{restaurantName}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">CLIENTE</p>
            <p className="text-sm font-semibold text-secondary">{client?.name || 'Desconocido'}</p>
            <p className="text-xs text-gray-400">{client?.email}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">ENTREGA</p>
            <p className="text-sm text-secondary">{order.delivery_address}</p>
            {order.special_instructions && (
              <p className="text-xs text-gray-400 italic mt-1">"{order.special_instructions}"</p>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-2">PRODUCTOS</p>
            <OrderItemsList orderId={order.id} />
            <div className="flex justify-between font-display font-bold text-secondary mt-2 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary">{formatCOP(order.total)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">PAGO</p>
            <p className="text-sm text-secondary">
              {order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY ? 'Efectivo/datáfono' : 'En línea'}
              {' · '}
              {order.payment_status === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-2">
              INTERVENCIÓN MANUAL (ADMIN)
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white mb-4"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Domiciliario asignado</label>
            <select
              value={deliveryPersonId}
              onChange={(e) => setDeliveryPersonId(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white"
            >
              <option value="">Sin asignar</option>
              {deliveryPeople.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {confirmCancel ? (
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="text-sm font-semibold text-danger mb-3">
                ¿Cancelar este pedido? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setConfirmCancel(false)}>
                  Volver
                </Button>
                <Button
                  fullWidth
                  loading={saving}
                  className="!bg-danger"
                  onClick={() => {
                    setConfirmCancel(false)
                    applyChanges()
                  }}
                >
                  Confirmar cancelación
                </Button>
              </div>
            </div>
          ) : (
            <Button fullWidth size="lg" loading={saving} disabled={!hasChanges || saving} onClick={handleSave}>
              Guardar cambios
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
