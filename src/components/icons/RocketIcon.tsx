import { motion } from "motion/react"

type RocketVariant = "primary" | "premium" | "tech"

interface RocketIconProps {
  variant?: RocketVariant
  className?: string
  animate?: boolean // si true, aplica animación de flotación sutil
}

/**
 * Sistema de icono de cohete — 3 variantes
 *
 * - primary (5C-BOLD): trazo grueso, sólido, para botones y CTAs principales
 * - premium (5A): estilo elegante con degradado, para secciones destacadas
 * - tech (5B): estilo outline/línea fina, para estados técnicos (spinner, loading)
 */
export function RocketIcon({
  variant = "primary",
  className = "w-8 h-8",
  animate = false,
}: RocketIconProps) {
  const svgContent = {
    primary: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cuerpo del cohete - trazo grueso y sólido */}
        <path
          d="M24 4C24 4 32 10 32 24C32 30 30 34 24 40C18 34 16 30 16 24C16 10 24 4 24 4Z"
          fill="currentColor"
        />
        {/* Ventana */}
        <circle cx="24" cy="20" r="4" fill="white" fillOpacity="0.9" />
        {/* Aletas */}
        <path d="M16 28L8 38L16 36V28Z" fill="currentColor" />
        <path d="M32 28L40 38L32 36V28Z" fill="currentColor" />
        {/* Fuego/propulsión */}
        <path
          d="M20 38C20 38 22 44 24 44C26 44 28 38 28 38"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
    premium: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="premiumGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2F5EFF" />
            <stop offset="1" stopColor="#7C9CFF" />
          </linearGradient>
        </defs>
        {/* Cuerpo estilizado con degradado y curvas suaves */}
        <path
          d="M24 3C24 3 33 9 33 23C33 29.5 30.5 34 24 41C17.5 34 15 29.5 15 23C15 9 24 3 24 3Z"
          fill="url(#premiumGrad)"
        />
        <circle cx="24" cy="19" r="3.5" fill="white" fillOpacity="0.95" />
        <circle cx="24" cy="19" r="3.5" stroke="#2F5EFF" strokeWidth="0.5" fillOpacity="0.2" />
        {/* Aletas finas y elegantes */}
        <path d="M15 27L6 37L15 34.5V27Z" fill="url(#premiumGrad)" fillOpacity="0.85" />
        <path d="M33 27L42 37L33 34.5V27Z" fill="url(#premiumGrad)" fillOpacity="0.85" />
        {/* Destello decorativo */}
        <circle cx="14" cy="12" r="1" fill="#7C9CFF" />
        <circle cx="35" cy="16" r="1.2" fill="#7C9CFF" />
      </svg>
    ),
    tech: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cuerpo en outline, ideal para spinner/loading */}
        <path
          d="M24 4C24 4 32 10 32 24C32 30 30 34 24 40C18 34 16 30 16 24C16 10 24 4 24 4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M16 28L8 38L16 36V28Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 28L40 38L32 36V28Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        {/* Línea punteada tipo "circuito" para reforzar sensación tech */}
        <path
          d="M20 38C20 38 22 44 24 44C26 44 28 38 28 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    ),
  }

  if (!animate) {
    return <div className={className}>{svgContent[variant]}</div>
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {svgContent[variant]}
    </motion.div>
  )
}

export default RocketIcon
