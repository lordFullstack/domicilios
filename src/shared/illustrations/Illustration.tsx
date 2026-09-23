import type { ComponentType } from 'react'
import { RocketIdle } from './RocketIdle'
import { RocketSuccess } from './RocketSuccess'
import { RocketEmptyCart } from './RocketEmptyCart'
import { RocketNoResults } from './RocketNoResults'
import { RocketConfused } from './RocketConfused'
import { RocketSad } from './RocketSad'
import { ILLUSTRATION_SIZES, type IllustrationArtProps, type IllustrationName, type IllustrationSize } from './types'

const ART: Record<IllustrationName, ComponentType<IllustrationArtProps>> = {
  idle: RocketIdle,
  success: RocketSuccess,
  emptyCart: RocketEmptyCart,
  noResults: RocketNoResults,
  confused: RocketConfused,
  sad: RocketSad,
}

interface IllustrationProps {
  name: IllustrationName
  size?: IllustrationSize
  className?: string
}

/**
 * Ilustración de marca (120–240px). Es decorativa (aria-hidden): el mensaje
 * lo da siempre el texto de al lado. Distinta de los íconos de 24px del pack
 * `@/shared/icons`, de los que parte la silueta del cohete.
 */
export const Illustration = ({ name, size = 'md', className }: IllustrationProps) => {
  const Art = ART[name]
  return <Art size={ILLUSTRATION_SIZES[size]} className={`mx-auto flex-shrink-0 ${className || ''}`.trim()} />
}
