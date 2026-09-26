import { Moon, Sun, type LucideIcon } from 'lucide-react'
import type { DriverTheme } from '../hooks/useDriverTheme'

interface AppearanceSelectorProps {
  theme: DriverTheme
  onChange: (theme: DriverTheme) => void
}

const OPTIONS: { value: DriverTheme; label: string; icon: LucideIcon }[] = [
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'light', label: 'Claro', icon: Sun },
]

/** "Apariencia" del perfil del domiciliario: oscuro (noche, menos brillo) o claro (mejor bajo el sol). */
export const AppearanceSelector = ({ theme, onChange }: AppearanceSelectorProps) => (
  <div role="radiogroup" aria-labelledby="appearance-label">
    <p id="appearance-label" className="block text-sm font-medium text-gray-700 mb-2">Apariencia</p>
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const checked = theme === value
        return (
          <label
            key={value}
            className={`flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-semibold transition-colors ${
              checked ? 'border-primary bg-primary/10 text-primary' : 'border-gray-100 text-gray-500'
            }`}
          >
            <input
              type="radio"
              name="driver-theme"
              value={value}
              checked={checked}
              onChange={() => onChange(value)}
              className="sr-only"
            />
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </label>
        )
      })}
    </div>
    <p className="mt-2 text-xs text-gray-500">Se guarda en este teléfono. Al sol suele leerse mejor el modo claro.</p>
  </div>
)
