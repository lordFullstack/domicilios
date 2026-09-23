import type { ReactNode } from 'react'
import type { IllustrationName } from './types'

interface ArtProps {
  name: IllustrationName
  className?: string
  size?: number
  children: ReactNode
}

/** Lienzo común: viewBox 240x240, decorativo, sin metadata. */
export const Art = ({ name, className, size = 240, children }: ArtProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 240"
    width={size}
    height={size}
    fill="none"
    aria-hidden="true"
    focusable="false"
    data-illustration={name}
    className={className}
  >
    {children}
  </svg>
)
