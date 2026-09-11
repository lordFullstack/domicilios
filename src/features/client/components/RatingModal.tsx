import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { BottomSheet } from '@/shared/components/BottomSheet'

interface RatingModalProps {
  open: boolean
  restaurantName: string
  hasDeliveryPerson: boolean
  submitting: boolean
  onSubmit: (restaurantRating: number, deliveryRating?: number, comment?: string) => void
  onClose: () => void
}

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
        <Star
          className={`w-7 h-7 ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      </button>
    ))}
  </div>
)

// Se muestra cuando un pedido pasa a "Entregada". El cliente califica al
// restaurante (obligatorio) y, si el pedido tuvo un domiciliario asignado,
// también lo califica a él (opcional). El comentario es opcional.
// Migrado a BottomSheet (LOOP_07) — antes era un overlay hecho a mano;
// ahora hereda cierre con Escape, bloqueo de scroll y role="dialog".
export const RatingModal = ({
  open,
  restaurantName,
  hasDeliveryPerson,
  submitting,
  onSubmit,
  onClose,
}: RatingModalProps) => {
  const [restaurantRating, setRestaurantRating] = useState(0)
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [comment, setComment] = useState('')

  const canSubmit = restaurantRating > 0

  return (
    <BottomSheet open={open} onClose={onClose} title="¿Cómo estuvo tu pedido?">
      <p className="text-sm text-gray-500 mb-5 -mt-2">Tu opinión ayuda a otros clientes</p>

      <div className="mb-5">
        <p className="text-sm font-semibold text-secondary mb-2">{restaurantName}</p>
        <StarPicker value={restaurantRating} onChange={setRestaurantRating} />
      </div>

      {hasDeliveryPerson && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-secondary mb-2">Tu domiciliario</p>
          <StarPicker value={deliveryRating} onChange={setDeliveryRating} />
        </div>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario (opcional)"
        rows={2}
        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none mb-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Ahora no
        </Button>
        <Button
          onClick={() => onSubmit(restaurantRating, deliveryRating || undefined, comment)}
          disabled={!canSubmit || submitting}
          className="flex-1"
        >
          {submitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </BottomSheet>
  )
}
