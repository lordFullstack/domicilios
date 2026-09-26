import clsx from 'clsx'

interface SwitchTrackProps {
  on: boolean
  className?: string
}

/**
 * Pista + bolita de un interruptor (solo dibujo: el botón que lo contiene lleva `role="switch"`,
 * `aria-checked` y el texto del estado). La bolita se ancla a la IZQUIERDA de la pista con `left-0.5` y se
 * desplaza exactamente `pista − bolita − 2×margen` (48 − 24 − 4 = 20px = translate-x-5), así nunca se sale.
 */
export const SwitchTrack = ({ on, className }: SwitchTrackProps) => (
  <span
    aria-hidden="true"
    className={clsx(
      'relative inline-block h-7 w-12 flex-shrink-0 rounded-full transition-colors',
      on ? 'bg-success' : 'bg-gray-500',
      className
    )}
  >
    <span
      className={clsx(
        // bg-[#FFFFFF] y no bg-white: el tema noche remapea bg-white a azul-noche y la bolita debe ser siempre blanca.
        'absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-[#FFFFFF] shadow-sm transition-transform',
        on ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </span>
)
