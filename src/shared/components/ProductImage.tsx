import { useState } from 'react'
import { Icon } from '@/shared/icons'

interface ProductImageProps {
  imageUrl?: string
  alt: string
  className?: string
  emojiClassName?: string
  /** Tamaño del ícono de respaldo (sin foto ni emoji). */
  fallbackIconSize?: number
}

// Los productos pueden tener una foto real (URL de Supabase Storage) o,
// como respaldo rápido, un emoji guardado directo en image_url.
// Este componente decide cuál mostrar sin que cada pantalla lo repita.
export const ProductImage = ({ imageUrl, alt, className, emojiClassName, fallbackIconSize = 28 }: ProductImageProps) => {
  // Si la URL falla (archivo borrado del Storage, sin red), cae al emoji
  // de respaldo en vez de mostrar el ícono de imagen rota del navegador.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const isRealPhoto = !!imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))

  if (isRealPhoto && failedUrl !== imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(imageUrl)}
        className={className || 'w-full h-full object-cover'}
      />
    )
  }

  const a11y = { role: alt ? 'img' : undefined, 'aria-label': alt || undefined, 'aria-hidden': alt ? undefined : true }

  // Emoji que eligió el restaurante: es CONTENIDO (no UI), se respeta.
  if (imageUrl && !isRealPhoto) {
    return (
      <span className={emojiClassName} {...a11y}>
        {imageUrl}
      </span>
    )
  }

  // Sin foto, o la foto no cargó: ícono propio en vez del emoji 🍽️.
  return (
    <span className={emojiClassName} {...a11y}>
      <Icon name="restaurants" size={fallbackIconSize} className="text-gray-400" />
    </span>
  )
}
