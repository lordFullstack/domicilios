import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export const QuantitySelector = ({ value, onChange, min = 1, max }: QuantitySelectorProps) => {
  const canDecrease = value > min
  const canIncrease = max === undefined || value < max

  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1">
      <button
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        aria-label="Disminuir cantidad"
        className="touch-target focus-ring w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 disabled:active:scale-100"
      >
        <Minus className="w-4 h-4 text-secondary" />
      </button>
      <span className="text-base font-bold text-secondary w-6 text-center" aria-live="polite">
        {value}
      </span>
      <button
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        aria-label="Aumentar cantidad"
        className="touch-target focus-ring w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 disabled:active:scale-100"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}
