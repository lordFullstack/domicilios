import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { usePromotions } from '@/shared/hooks/usePromotions'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'
import { ImageOverlay } from '@/shared/components/ImageOverlay'
import { ROUTES } from '@/config/constants'

const AUTO_ROTATE_MS = 5000

// Carrusel de banners promocionales en la parte superior del Inicio del cliente.
// Si no hay banners activos, no se muestra nada (el diseño original tenía un
// banner fijo hardcodeado "Envío gratis hoy" — ahora lo gestiona el Admin).
export const PromoBanner = () => {
  const { promotions, loading } = usePromotions('banner')
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  // Se pausa mientras el usuario lo toca/enfoca (WCAG 2.2.2) y no rota
  // nunca con prefers-reduced-motion: el bloque CSS de reduced motion no
  // puede frenar un setInterval de JS.
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (promotions.length <= 1 || paused || reducedMotion) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % promotions.length)
    }, AUTO_ROTATE_MS)
    return () => clearInterval(timer)
  }, [promotions.length, paused, reducedMotion])

  if (loading || promotions.length === 0) return null

  const current = promotions[index % promotions.length]

  const handleClick = () => {
    if (current.restaurant_id) {
      navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', current.restaurant_id))
    }
  }

  return (
    <div
      className="mx-5 mb-8"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Promociones"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={!current.restaurant_id}
        className="card-surface focus-ring w-full text-left rounded-3xl overflow-hidden relative bg-primary/10 disabled:cursor-default"
      >
        {current.image_url ? (
          <div className="relative h-28 bg-cover bg-center" style={{ backgroundImage: `url(${current.image_url})` }}>
            {/* Overlay hermano (ImageOverlay) y el texto encima. */}
            <ImageOverlay variant="bottom-soft" />
            <div className="relative flex h-full flex-col justify-end p-4">
              <p className="font-display font-bold text-sm text-white">{current.title}</p>
              {current.subtitle && <p className="text-xs text-white/80">{current.subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-brand-gradient">
            <div>
              <p className="font-display font-bold text-sm text-white">{current.title}</p>
              {current.subtitle && <p className="text-xs text-white/80">{current.subtitle}</p>}
            </div>
            <Sparkles className="w-6 h-6 text-white/70 flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </div>
        )}
      </button>

      {promotions.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2" aria-hidden="true">
          {promotions.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
