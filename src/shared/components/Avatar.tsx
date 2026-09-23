import { supabaseImageUrl } from '@/shared/utils/supabaseImage'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_PX: Record<NonNullable<AvatarProps['size']>, number> = {
  sm: 32,
  md: 48,
  lg: 72,
  xl: 96,
}

const TEXT_SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'text-xs',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

/**
 * Foto de perfil con foto real o inicial sobre el degradado de marca.
 * Antes cada pantalla (Cuenta, seguimiento del domiciliario) resolvía esto
 * a su manera, con tamaños y colores distintos.
 */
export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const px = SIZE_PX[size]
  const initial = Array.from(name || '?')[0]?.toUpperCase() || '?'

  return (
    <div
      style={{ width: px, height: px }}
      className={`flex-shrink-0 rounded-full overflow-hidden ring-1 ring-white/70 ${className || ''}`}
    >
      {src ? (
        <img
          src={supabaseImageUrl(src, { width: px * 2 })}
          alt={name || ''}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className={`flex h-full w-full items-center justify-center bg-brand-gradient font-display font-bold text-white ${TEXT_SIZE[size]}`}
        >
          {initial}
        </div>
      )}
    </div>
  )
}
