export const MAX_NOTES_LENGTH = 150 // mismo tope que el RPC create_order (notes_too_long)

interface OrderNotesFieldProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Nota para el restaurante ("sin cebolla"), separada de la referencia de la dirección. No deja
 * escribir más de 150 caracteres; el contador es visible pero no se anuncia en cada tecla.
 */
export const OrderNotesField = ({ value, onChange }: OrderNotesFieldProps) => (
  <div>
    <label htmlFor="order-notes" className="block text-xs font-bold text-gray-500 tracking-wide mb-2">
      NOTA PARA EL RESTAURANTE (OPCIONAL)
    </label>
    <textarea
      id="order-notes"
      rows={2}
      maxLength={MAX_NOTES_LENGTH}
      placeholder="Ej: sin cebolla, salsa aparte"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby="order-notes-count"
      className="focus-ring w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm resize-none"
    />
    <p id="order-notes-count" className="text-xs text-gray-500 text-right tabular-nums mt-1">
      {value.length}/{MAX_NOTES_LENGTH}
    </p>
  </div>
)
