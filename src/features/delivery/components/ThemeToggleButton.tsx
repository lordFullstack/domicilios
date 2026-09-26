import { Moon, Sun } from 'lucide-react'
import type { DriverTheme } from '../hooks/useDriverTheme'

interface ThemeToggleButtonProps {
  theme: DriverTheme
  onChange: (theme: DriverTheme) => void
}

/** Botón rápido sol/luna del panel: cambia entre claro y oscuro con un toque (útil al pasar del sol a la noche). */
export const ThemeToggleButton = ({ theme, onChange }: ThemeToggleButtonProps) => {
  const toLight = theme === 'dark'
  const Icon = toLight ? Sun : Moon
  return (
    <button
      type="button"
      onClick={() => onChange(toLight ? 'light' : 'dark')}
      aria-label={toLight ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="focus-ring touch-target flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-secondary active:scale-90 transition-transform"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
