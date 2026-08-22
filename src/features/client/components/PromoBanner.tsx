import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePromotions } from '@/shared/hooks/usePromotions'
import { ROUTES } from '@/config/constants'

const AUTO_ROTATE_MS = 5000

// Carrusel de banners promocionales en la parte superior del Inicio del cliente.
// Si no hay banners activos, no se muestra nada (el diseño original tenía un
// banner fijo hardcodeado "Envío gratis hoy" — ahora lo gestiona el Admin).
export const PromoBanner = () => {
  const { promotions, loading } = usePromotions('banner')
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (promotions.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % promotions.length)
    }, AUTO_ROTATE_MS)
    return () => clearInterval(timer)
  }, [promotions.length])

  if (loading || promotions.length === 0) return null

  const current = promotions[index]

  const handleClick = () => {
    if (current.restaurant_id) {
      navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', current.restaurant_id))
    }
  }

  return (
    <div className="mx-5 mb-6">
      <button
        onClick={handleClick}
        disabled={!current.restaurant_id}
        className="w-full text-left rounded-2xl overflow-hidden relative bg-primary/10 active:scale-[0.98] transition-transform"
      >
        {current.image_url ? (
          <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${current.image_url})` }}>
            <div className="h-full bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-4">
              <p className="font-display font-bold text-sm text-white">{current.title}</p>
              {current.subtitle && <p className="text-xs text-white/80">{current.subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-display font-bold text-sm text-primary">{current.title}</p>
              {current.subtitle && <p className="text-xs text-gray-500">{current.subtitle}</p>}
            </div>
            <span className="text-3xl">🎉</span>
          </div>
        )}
      </button>

      {promotions.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
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
