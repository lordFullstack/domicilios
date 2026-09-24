interface ShiftToggleProps {
  onShift: boolean
  loading?: boolean
  saving?: boolean
  disabled?: boolean
  error?: string | null
  onToggle: () => void
}

/**
 * "En turno / Fuera de turno" (LOOP_SECURITY_01). Solo los domiciliarios en
 * turno reciben pedidos asignados automáticamente.
 */
export const ShiftToggle = ({ onShift, loading, saving, disabled, error, onToggle }: ShiftToggleProps) => (
  <div className="px-5 mb-4">
    <button
      type="button"
      role="switch"
      aria-checked={onShift}
      aria-label="En turno"
      disabled={loading || saving || disabled}
      onClick={onToggle}
      className="focus-ring touch-target w-full flex items-center justify-between gap-3 border border-gray-100 rounded-2xl px-4 py-3 text-left disabled:opacity-60"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <span className={`w-2 h-2 rounded-full ${onShift ? 'bg-success' : 'bg-gray-400'}`} />
          {loading ? 'Cargando turno…' : onShift ? 'En turno — recibiendo pedidos' : 'Fuera de turno'}
        </span>
        <span className="block text-xs text-gray-500 mt-0.5">
          {onShift ? 'Te asignaremos pedidos cuando estés libre.' : 'Actívalo para recibir pedidos.'}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${onShift ? 'bg-success' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${onShift ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
    {error && (
      <p className="text-sm text-danger font-semibold mt-2" role="alert">
        {error}
      </p>
    )}
  </div>
)
