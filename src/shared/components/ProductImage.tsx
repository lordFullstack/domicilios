import { useState } from 'react'

interface ProductImageProps {
  imageUrl?: string
  alt: string
  className?: string
  emojiClassName?: string
}

// Los productos pueden tener una foto real (URL de Supabase Storage) o,
// como respaldo rápido, un emoji guardado directo en image_url.
// Este componente decide cuál mostrar sin que cada pantalla lo repita.
export const ProductImage = ({ imageUrl, alt, className, emojiClassName }: ProductImageProps) => {
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

  // Emoji decorativo: si `alt` trae texto, se expone como nombre accesible.
  return (
    <span className={emojiClassName} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      {isRealPhoto ? '🍽️' : imageUrl || '🍽️'}
    </span>
  )
}
