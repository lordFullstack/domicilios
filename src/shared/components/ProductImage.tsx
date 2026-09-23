import { useState } from 'react'
import { Icon } from '@/shared/icons'
import { supabaseImageUrl } from '@/shared/utils/supabaseImage'

interface ProductImageProps {
  imageUrl?: string
  alt: string
  className?: string
  emojiClassName?: string
  /** Tamaño del ícono de respaldo (sin foto ni emoji). */
  fallbackIconSize?: number
  /**
   * Ancho y alto reales del contenedor (px). Se usan para pedirle a
   * Supabase una versión redimensionada en vez del archivo original — sin
   * esto, una tarjeta de 80px de ancho descargaba la misma foto de 2-3 MB
   * que el hero. `height` es importante: pedir solo `width` deja el alto
   * del archivo original sin escalar (fotos de celular en vertical vienen
   * con alturas de 3000-4000px), y el recorte por CSS termina mostrando
   * una franja mínima ampliada en vez de la foto completa. Si no se pasa
   * `height`, se asume cuadrado — mejor que dejarlo en el original, pero
   * hay que pasarlo siempre que el contenedor no sea cuadrado.
   */
  width?: number
  height?: number
}

// Los productos pueden tener una foto real (URL de Supabase Storage) o,
// como respaldo rápido, un emoji guardado directo en image_url.
// Este componente decide cuál mostrar sin que cada pantalla lo repita.
export const ProductImage = ({ imageUrl, alt, className, emojiClassName, fallbackIconSize = 28, width, height }: ProductImageProps) => {
  // Si la URL falla (archivo borrado del Storage, sin red), cae al emoji
  // de respaldo en vez de mostrar el ícono de imagen rota del navegador.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  // Antes la foto aparecía de golpe al terminar de bajar (flash sobre el
  // fondo blanco/gris del contenedor). Ahora arranca en opacity-0 sobre un
  // degradado suave de marca y hace fade-in al cargar; con reduced motion,
  // el bloque global de styles.css ya deja la transición casi instantánea.
  const [loaded, setLoaded] = useState(false)
  const isRealPhoto = !!imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))

  if (isRealPhoto && failedUrl !== imageUrl) {
    // @2x: en pantallas retina un contenedor de 80px real pinta ~160px
    // físicos. Pedir el doble del ancho declarado evita que se vea borrosa.
    const src = supabaseImageUrl(imageUrl, {
      width: width ? width * 2 : undefined,
      height: height ? height * 2 : undefined,
    })
    return (
      <span className="relative block h-full w-full overflow-hidden bg-brand-gradient-soft">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailedUrl(imageUrl)}
          className={`${className || 'w-full h-full object-cover'} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </span>
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
