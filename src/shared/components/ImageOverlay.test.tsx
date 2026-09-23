import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ImageOverlay } from './ImageOverlay'

describe('<ImageOverlay />', () => {
  it('bottom-gradient usa el mismo degradado que el Hero', () => {
    const { container } = render(<ImageOverlay variant="bottom-gradient" />)
    expect(container.firstChild).toHaveClass('bg-gradient-to-t')
    expect(container.firstChild).toHaveClass('from-black/90')
  })

  it('full-soft y full-strong son overlays planos de distinta densidad', () => {
    const soft = render(<ImageOverlay variant="full-soft" />)
    const strong = render(<ImageOverlay variant="full-strong" />)
    expect(soft.container.firstChild).toHaveClass('bg-black/15')
    expect(strong.container.firstChild).toHaveClass('bg-black/45')
  })

  it('es decorativo (aria-hidden) y no bloquea clicks', () => {
    const { container } = render(<ImageOverlay variant="bottom-gradient" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstChild).toHaveClass('pointer-events-none')
  })
})
