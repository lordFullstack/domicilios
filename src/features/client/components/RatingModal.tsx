import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/shared/components/Button'

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

  if (!open) return null

  const canSubmit = restaurantRating > 0

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 max-w-sm w-full">
        <h3 className="font-display font-bold text-lg text-secondary mb-1">¿Cómo estuvo tu pedido?</h3>
        <p className="text-sm text-gray-500 mb-5">Tu opinión ayuda a otros clientes</p>

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
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none mb-5 focus:outline-none focus:border-primary"
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
      </div>
    </div>
  )
}
