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
  const isRealPhoto = !!imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))

  if (isRealPhoto) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className || 'w-full h-full object-cover'}
      />
    )
  }

  return (
    <span className={emojiClassName}>
      {imageUrl || '🍽️'}
    </span>
  )
}
