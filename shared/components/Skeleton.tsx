import { HTMLAttributes } from 'react'
import clsx from 'clsx'

/**
 * Bloque de "shimmer" para estados de carga. Genérico — se puede reutilizar
 * en cualquier pantalla (no solo el Home), armando skeletons a medida
 * combinando varios con distintos tamaños/formas.
 */
export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('animate-pulse bg-gray-100 rounded-xl', className)}
    {...props}
  />
)
