import { useCallback, useState } from 'react'

// Apariencia del panel del domiciliario: oscuro (por defecto) o claro. Se recuerda en su teléfono.
const KEY = 'delivery_theme'

export type DriverTheme = 'dark' | 'light'

const read = (): DriverTheme => {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/** Clases del contenedor raíz de cada pantalla del domiciliario según el tema. */
export const driverRootClass = (theme: DriverTheme) =>
  theme === 'dark' ? 'dark bg-night-950' : 'theme-pulse bg-surface-soft'

export const useDriverTheme = () => {
  const [theme, setThemeState] = useState<DriverTheme>(read)

  const setTheme = useCallback((next: DriverTheme) => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* sin almacenamiento: vale solo mientras la pantalla esté abierta */
    }
  }, [])

  return { theme, setTheme, isDark: theme === 'dark', rootClass: driverRootClass(theme) }
}
