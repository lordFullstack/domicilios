import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon, Drop, ICON_NAMES, CATEGORY_ICON, CATEGORY_DROP_CLASS } from './index'
import { iconToSvgString } from './svgString'
import { RESTAURANT_CATEGORIES } from '@/config/constants'

describe('Icon', () => {
  it.each(ICON_NAMES)('"%s" renderiza en la grilla 24 con trazo 1.75 y oculto al lector', (name) => {
    const { container } = render(<Icon name={name} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('stroke-width')).toBe('1.75')
    expect(svg.getAttribute('stroke')).toBe('currentColor')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.querySelectorAll('path, circle, rect').length).toBeGreaterThan(0)
  })

  it('tamaños con nombre y en px', () => {
    const { container, rerender } = render(<Icon name="home" size="xs" />)
    expect(container.querySelector('svg')!.getAttribute('width')).toBe('16')
    rerender(<Icon name="home" size={40} />)
    expect(container.querySelector('svg')!.getAttribute('width')).toBe('40')
  })

  it('con title se expone como imagen con nombre accesible', () => {
    const { getByRole } = render(<Icon name="moto" title="Domiciliario en camino" />)
    expect(getByRole('img', { name: 'Domiciliario en camino' })).toBeInTheDocument()
  })

  it('la variante activa usa los tokens de styles.css, no hex sueltos', () => {
    const { container } = render(<Icon name="home" variant="active" />)
    const style = container.querySelector('svg')!.getAttribute('style') || ''
    expect(style).toContain('var(--icon-tint)')
    expect(style).toContain('var(--icon-accent)')
  })
})

describe('categorías', () => {
  it('toda categoría real tiene ícono y gota de color', () => {
    RESTAURANT_CATEGORIES.forEach((c) => {
      expect(ICON_NAMES).toContain(CATEGORY_ICON[c.value])
      expect(CATEGORY_DROP_CLASS[c.value]).toMatch(/^bg-category-/)
    })
  })
})

describe('Drop', () => {
  it('usa la forma de marca y es decorativa', () => {
    const { container } = render(<Drop size={56}><Icon name="pizza" /></Drop>)
    const drop = container.firstElementChild as HTMLElement
    expect(drop.className).toContain('rounded-drop')
    expect(drop.getAttribute('aria-hidden')).toBe('true')
    expect(drop.style.width).toBe('56px')
  })
})

describe('iconToSvgString', () => {
  it('produce SVG plano con color explícito (para Leaflet)', () => {
    const html = iconToSvgString({ name: 'moto', size: 20, color: '#FFFFFF' })
    expect(html.startsWith('<svg color="#FFFFFF"')).toBe(true)
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).toContain('<circle cx="6" cy="17.5" r="2.75"></circle>')
    // se puede parsear como SVG válido
    const doc = new DOMParser().parseFromString(html, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
  })
})
