import { Fragment, isValidElement, type ReactNode } from 'react'
import { GLYPHS, type IconName, type GlyphPartKind } from './glyphs'
import type { IconVariant } from './Icon'

/**
 * SVG como string, para lugares que no renderizan React (marcadores de
 * Leaflet: L.divIcon({ html })).
 *
 * Serializador propio de ~30 líneas a propósito: react-dom/server sumaba
 * ~190 KB al precache de la PWA solo para esto.
 */
const ATTR: Record<string, string> = { strokeDasharray: 'stroke-dasharray' }

const serialize = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') return ''
  if (Array.isArray(node)) return node.map(serialize).join('')
  if (!isValidElement(node)) return ''
  const { children, ...props } = node.props as Record<string, unknown> & { children?: ReactNode }
  if (node.type === Fragment) return serialize(children)
  const attrs = Object.entries(props)
    .map(([k, v]) => ` ${ATTR[k] ?? k}="${String(v)}"`)
    .join('')
  return `<${String(node.type)}${attrs}>${serialize(children)}</${String(node.type)}>`
}

const PART_ATTRS = (variant: IconVariant): Record<GlyphPartKind, string> => {
  const accent = variant === 'line' ? 'currentColor' : '#F4652C' // = --icon-accent
  const fill = variant === 'active' ? '#FFE3D1' : variant === 'onDrop' ? '#FFFFFF' : 'none' // = --icon-tint
  const bg = variant === 'active' || variant === 'onDrop' ? '#FFFFFF' : 'none'
  return {
    fill: `fill="${fill}"`,
    line: 'fill="none"',
    bg: `fill="${bg}"`,
    dot: 'fill="currentColor" stroke="none"',
    accent: `fill="none" stroke="${accent}"`,
  }
}

interface SvgStringOptions {
  name: IconName
  size?: number
  variant?: IconVariant
  color?: string
}

export const iconToSvgString = ({ name, size = 24, variant = 'line', color = 'currentColor' }: SvgStringOptions): string => {
  const attrs = PART_ATTRS(variant)
  const parts = GLYPHS[name].map(([kind, el]) => `<g ${attrs[kind]}>${serialize(el)}</g>`).join('')
  return (
    `<svg color="${color}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon="${name}">${parts}</svg>`
  )
}
