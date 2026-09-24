import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('<Spinner /> (LOOP_VISUAL_08)', () => {
  it('es decorativo (aria-hidden) y gira', () => {
    const { container } = render(<Spinner />)
    const el = container.querySelector('[data-spinner]')!
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.getAttribute('class')).toContain('animate-spin')
  })

  it.each([
    ['sm', 'h-4'],
    ['md', 'h-6'],
    ['lg', 'h-8'],
  ] as const)('tamaño %s → %s', (size, cls) => {
    const { container } = render(<Spinner size={size} />)
    expect(container.querySelector('[data-spinner]')!.getAttribute('class')).toContain(cls)
  })

  it('es el Loader2 de lucide (un solo estilo)', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg.lucide-loader-circle, svg.lucide-loader-2')).not.toBeNull()
  })
})
