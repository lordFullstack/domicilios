import { HTMLAttributes } from 'react'
import clsx from 'clsx'

/** Contenido centrado con padding horizontal consistente. */
export const Container = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('px-5', className)} {...props}>
    {children}
  </div>
)

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Espaciado vertical entre hijos: 8 / 16 / 24 / 32px. */
  gap?: 2 | 4 | 6 | 8
}

// Clases literales (no template strings) para que Tailwind las detecte al escanear el contenido.
const gapClasses = {
  2: 'gap-2',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
} as const

/** Espaciado vertical consistente entre elementos hijos. */
export const Stack = ({ gap = 4, className, children, ...props }: StackProps) => (
  <div className={clsx('flex flex-col', gapClasses[gap], className)} {...props}>
    {children}
  </div>
)

/**
 * Grid tipo Bento: una celda grande arriba, dos pequeñas abajo.
 *   ┌───────────────┐
 *   │     LARGE     │
 *   ├───────┬───────┤
 *   │ SMALL │ SMALL │
 *   └───────┴───────┘
 * Infraestructura para futuros módulos de Home — todavía no se usa
 * en ninguna pantalla (se deja preparado para el siguiente LOOP).
 */
interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  large: React.ReactNode
  small: [React.ReactNode, React.ReactNode]
}

export const BentoGrid = ({ large, small, className, ...props }: BentoGridProps) => (
  <div className={clsx('grid grid-cols-2 gap-3', className)} {...props}>
    <div className="col-span-2">{large}</div>
    <div>{small[0]}</div>
    <div>{small[1]}</div>
  </div>
)
