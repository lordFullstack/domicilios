import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { BottomSheet } from '@/shared/components/BottomSheet'

interface ErrandRatingSheetProps {
  open: boolean
  driverName?: string | null
  submitting: boolean
  onSubmit: (rating: number, comment?: string) => void
  onClose: () => void
}

/** Solo se califica al domi (no hay restaurante). */
export const ErrandRatingSheet = ({ open, driverName, submitting, onSubmit, onClose }: ErrandRatingSheetProps) => {
  const [value, setValue] = useState(0)
  const [comment, setComment] = useState('')

  return (
    <BottomSheet open={open} onClose={onClose} title="¿Cómo te fue con tu Domi?">
      <p className="-mt-2 mb-4 text-sm text-gray-500">{driverName ? `Califica a ${driverName}` : 'Tu opinión ayuda a otros clientes'}</p>

      <div className="mb-5 flex gap-1" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            onClick={() => setValue(n)}
            className="focus-ring rounded p-0.5"
          >
            <Star className={`h-8 w-8 ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
          </button>
        ))}
      </div>

      <textarea
        aria-label="Comentario (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 300))}
        placeholder="Comentario (opcional)"
        rows={2}
        className="mb-5 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <div className="flex gap-3">
        <Button variant="tertiary" onClick={onClose} className="flex-1">
          Ahora no
        </Button>
        <Button variant="solid" onClick={() => onSubmit(value, comment)} disabled={value === 0 || submitting} loading={submitting} className="flex-1">
          Enviar
        </Button>
      </div>
    </BottomSheet>
  )
}
