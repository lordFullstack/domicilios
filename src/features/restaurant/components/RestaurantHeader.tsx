import { MapPin, Camera, Loader2 } from 'lucide-react'
import { NotificationBell } from '@/shared/components/NotificationBell'
import { ImageOverlay } from '@/shared/components/ImageOverlay'
import { SwitchTrack } from '@/shared/components/SwitchTrack'
import type { Restaurant } from '@/shared/types'

interface RestaurantHeaderProps {
  restaurant: Pick<Restaurant, 'name' | 'address' | 'cover_url' | 'image_url' | 'status'>
  uploadingCover: boolean
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  togglingStatus: boolean
  onToggleStatus: () => void
}

/**
 * Cabecera oscura del panel del restaurante (tema "pulse"): nombre, dirección, portada opcional y el
 * interruptor Abierto/Cerrado. Las métricas se montan encima con un margen negativo (RestaurantStats).
 */
export const RestaurantHeader = ({ restaurant, uploadingCover, onCoverChange, togglingStatus, onToggleStatus }: RestaurantHeaderProps) => {
  const open = restaurant.status === 'open'
  return (
    <div
      className="relative overflow-hidden bg-night-950 bg-cover bg-center px-5 pt-6 pb-14 rounded-b-3xl md:max-w-4xl md:mx-auto md:mt-8 md:rounded-3xl"
      style={restaurant.cover_url ? { backgroundImage: `url(${restaurant.cover_url})` } : undefined}
    >
      {restaurant.cover_url ? (
        <ImageOverlay variant="bottom-soft" />
      ) : (
        <>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-pulse/40 blur-2xl" aria-hidden="true" />
          <div className="absolute -left-10 bottom-0 w-32 h-32 rounded-full bg-pulse-soft/20 blur-2xl" aria-hidden="true" />
        </>
      )}

      <div className="relative flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0 backdrop-blur-sm">
          {restaurant.image_url || '🍽️'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold text-white truncate">{restaurant.name}</h1>
          <p className="flex items-center gap-1 text-xs text-white/80 mt-0.5 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {restaurant.address}
          </p>
        </div>
        <label className="relative w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition-transform">
          {uploadingCover ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="w-4 h-4 text-white" aria-hidden="true" />
          )}
          <span className="sr-only">Cambiar portada</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onCoverChange}
            disabled={uploadingCover}
          />
        </label>
        <NotificationBell variant="light" />
      </div>

      <button
        onClick={onToggleStatus}
        disabled={togglingStatus}
        role="switch"
        aria-checked={open}
        className="focus-ring relative w-full flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3 mt-4 active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className={`w-2 h-2 rounded-full ${open ? 'bg-success' : 'bg-gray-400'}`} />
          {open ? 'Abierto — recibiendo pedidos' : 'Cerrado — no recibes pedidos'}
        </span>
        <SwitchTrack on={open} />
      </button>
    </div>
  )
}
