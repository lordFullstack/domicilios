import { useState, useEffect } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'

export interface AddressDraft {
  street: string
  complement: string
  reference: string
}

interface AddressSheetProps {
  open: boolean
  initialDraft: AddressDraft
  onClose: () => void
  onSave: (draft: AddressDraft) => void
}

/**
 * No existe una tabla `addresses` en el backend — `orders` solo tiene
 * `delivery_address` (texto libre) y `special_instructions`. Esta sheet
 * junta "Dirección" + "Complemento" en delivery_address, y usa
 * "Referencia" como special_instructions. No se inventó ninguna tabla ni
 * columna nueva.
 */
export const AddressSheet = ({ open, initialDraft, onClose, onSave }: AddressSheetProps) => {
  const [draft, setDraft] = useState(initialDraft)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(initialDraft)
      setTouched(false)
    }
  }, [open, initialDraft])

  const isValid = draft.street.trim().length >= 5

  const handleSave = () => {
    setTouched(true)
    if (!isValid) return
    onSave(draft)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Dirección de entrega">
      <div className="flex flex-col gap-4">
        <div>
          <Input
            label="Dirección"
            placeholder="Calle / carrera, número..."
            value={draft.street}
            onChange={(e) => setDraft({ ...draft, street: e.target.value })}
          />
          {touched && !isValid && (
            <p className="text-xs text-danger mt-1">
              Escribe una dirección más específica (mínimo 5 caracteres).
            </p>
          )}
        </div>

        <Input
          label="Complemento (opcional)"
          placeholder="Apartamento, casa, torre..."
          value={draft.complement}
          onChange={(e) => setDraft({ ...draft, complement: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia (opcional)
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Cerca de... / punto de referencia para el domiciliario"
            value={draft.reference}
            onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
            rows={2}
          />
        </div>

        <Button fullWidth size="lg" onClick={handleSave}>
          Guardar dirección
        </Button>
      </div>
    </BottomSheet>
  )
}
