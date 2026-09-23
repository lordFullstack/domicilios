import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('<Avatar />', () => {
  it('sin src muestra la inicial sobre el degradado de marca', () => {
    const { container } = render(<Avatar name="José Luis" />)
    expect(screen.getByText('J')).toBeInTheDocument()
    expect(container.querySelector('.bg-brand-gradient')).not.toBeNull()
  })

  it('sin nombre ni src muestra "?"', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('con src muestra una imagen circular con el nombre como alt', () => {
    render(<Avatar src="https://x.test/foto.jpg" name="José Luis" />)
    const img = screen.getByRole('img', { name: 'José Luis' })
    expect(img.tagName).toBe('IMG')
  })

  it('aplica el tamaño correcto en px por variante', () => {
    const { container: sm } = render(<Avatar name="A" size="sm" />)
    const { container: xl } = render(<Avatar name="A" size="xl" />)
    expect((sm.firstChild as HTMLElement).style.width).toBe('32px')
    expect((xl.firstChild as HTMLElement).style.width).toBe('96px')
  })
})
