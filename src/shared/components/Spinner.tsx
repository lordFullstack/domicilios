import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

/**
 * El único spinner de la app (LOOP_VISUAL_08). Es decorativo (aria-hidden):
 * el texto accesible lo da el contenedor (LoadingState, role="status").
 * Con prefers-reduced-motion el bloque global de styles.css detiene el giro.
 */
export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <Loader2 aria-hidden="true" data-spinner className={clsx(SIZES[size], 'animate-spin text-brand-700', className)} />
)
