import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductImage } from './ProductImage'

describe('<ProductImage />', () => {
  it('cae al placeholder si la foto no carga', () => {
    render(<ProductImage imageUrl="https://x.test/rota.jpg" alt="Costilla BBQ" />)
    fireEvent.error(screen.getByRole('img', { name: 'Costilla BBQ' }))
    const fallback = screen.getByRole('img', { name: 'Costilla BBQ' })
    expect(fallback.tagName).toBe('SPAN')
    expect(fallback).toHaveTextContent('🍽️')
  })

  it('emoji decorativo cuando alt está vacío', () => {
    render(<ProductImage imageUrl="🍕" alt="" />)
    expect(screen.getByText('🍕')).toHaveAttribute('aria-hidden', 'true')
  })
})
