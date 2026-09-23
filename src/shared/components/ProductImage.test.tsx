import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductImage } from './ProductImage'

describe('<ProductImage />', () => {
  it('cae al placeholder si la foto no carga', () => {
    render(<ProductImage imageUrl="https://x.test/rota.jpg" alt="Costilla BBQ" />)
    fireEvent.error(screen.getByRole('img', { name: 'Costilla BBQ' }))
    const fallback = screen.getByRole('img', { name: 'Costilla BBQ' })
    expect(fallback.tagName).toBe('SPAN')
    // Respaldo con ícono propio (ya no el emoji 🍽️)
    expect(fallback.querySelector('svg[data-icon="restaurants"]')).not.toBeNull()
  })

  it('sin imagen muestra el ícono de respaldo', () => {
    const { container } = render(<ProductImage imageUrl={undefined} alt="" />)
    expect(container.querySelector('svg[data-icon="restaurants"]')).not.toBeNull()
  })

  it('emoji guardado por el restaurante se respeta (es contenido)', () => {
    render(<ProductImage imageUrl="🍕" alt="" />)
    expect(screen.getByText('🍕')).toBeInTheDocument()
  })

  it('emoji decorativo cuando alt está vacío', () => {
    render(<ProductImage imageUrl="🍕" alt="" />)
    expect(screen.getByText('🍕')).toHaveAttribute('aria-hidden', 'true')
  })

  it('arranca en opacity-0 y pasa a opacity-100 al cargar (fade-in)', () => {
    render(<ProductImage imageUrl="https://x.test/foto.jpg" alt="Costilla BBQ" />)
    const img = screen.getByRole('img', { name: 'Costilla BBQ' })
    expect(img.className).toContain('opacity-0')
    fireEvent.load(img)
    expect(img.className).toContain('opacity-100')
  })

  it('pide la foto redimensionada a Supabase cuando se pasa width', () => {
    render(
      <ProductImage
        imageUrl="https://x.test/storage/v1/object/public/covers/a.jpg"
        alt="Costilla BBQ"
        width={100}
      />
    )
    const img = screen.getByRole('img', { name: 'Costilla BBQ' }) as HTMLImageElement
    expect(img.src).toContain('/storage/v1/render/image/public/covers/a.jpg')
    expect(img.src).toContain('width=200') // @2x
  })
})
