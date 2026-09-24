import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { Restaurant } from '@/shared/types'
import stylesRaw from '../../styles.css?raw'

vi.mock('@/shared/hooks/useDeliveryFee', () => ({
  useDeliveryFee: () => ({ fee: 0 }),
  deliveryFeeLabel: () => 'Envío gratis',
}))

import { GrainOverlay } from './GrainOverlay'
import { RestaurantHero } from '@/features/client/components/RestaurantHero'
import { HomeHeroBanner } from '@/features/client/components/HomeHeroBanner'
import { MemoryRouter } from 'react-router-dom'

const raw = import.meta.glob<string>(['/src/shared/components/BottomNav.tsx', '/src/shared/components/ConnectionBanner.tsx', '/src/shared/components/Toast.tsx', '/src/shared/components/UpdatePrompt.tsx', '/src/shared/components/BottomSheet.tsx', '/src/shared/components/NotificationBell.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const src = (name: string) => raw[`/src/shared/components/${name}.tsx`] as string

const base: Restaurant = {
  id: 'r1', owner_id: 'o', name: 'Asados', description: '', address: '', phone: '',
  status: 'open', approved: true, category: 'Asados', rating_avg: 4.5, rating_count: 3, created_at: '',
}
const renderHero = (r: Partial<Restaurant>) =>
  render(<RestaurantHero restaurant={{ ...base, ...r }} isOpen isFavorite={false} favPending={false} onBack={() => {}} onToggleFavorite={() => {}} />)

describe('<GrainOverlay /> (LOOP_VISUAL_06)', () => {
  it('es decorativo (aria-hidden), no bloquea clicks y no se anima', () => {
    const { container } = render(<GrainOverlay />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveClass('pointer-events-none', 'absolute', 'inset-0', 'grain-overlay')
    expect(el.className).not.toMatch(/animate-|transition/)
  })

  it('.grain-overlay: SVG inline con feTurbulence, opacidad 0.03–0.05, blend overlay/soft-light, sin animación', () => {
    const rule = stylesRaw.match(/\.grain-overlay\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toContain('data:image/svg+xml')
    expect(rule).toContain('feTurbulence')
    const opacity = Number(rule.match(/opacity:\s*([\d.]+)/)?.[1])
    expect(opacity).toBeGreaterThanOrEqual(0.03)
    expect(opacity).toBeLessThanOrEqual(0.05)
    expect(rule).toMatch(/mix-blend-mode:\s*(overlay|soft-light)/)
    expect(rule).not.toMatch(/animation|transition/)
  })
})

describe('dónde va el grano (LOOP_VISUAL_06)', () => {
  it('hero del Home (degradado atardecer): sí', () => {
    const { container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomeHeroBanner />
      </MemoryRouter>
    )
    expect(container.querySelector('[data-grain]')).not.toBeNull()
  })

  it('hero del restaurante SIN foto (fondo de marca): sí', () => {
    const { container } = renderHero({ cover_url: null, image_url: '🍗' } as Partial<Restaurant>)
    expect(container.querySelector('[data-grain]')).not.toBeNull()
  })

  it('hero del restaurante sin nada (ícono de respaldo): sí', () => {
    const { container } = renderHero({ cover_url: null, image_url: null } as unknown as Partial<Restaurant>)
    expect(container.querySelector('[data-grain]')).not.toBeNull()
  })

  it('hero del restaurante con portada: NUNCA (es una foto)', () => {
    const { container } = renderHero({ cover_url: 'https://x.test/portada.jpg' } as Partial<Restaurant>)
    expect(container.querySelector('[data-grain]')).toBeNull()
  })

  it('hero del restaurante con foto en image_url (sin portada): NUNCA', () => {
    const { container } = renderHero({ cover_url: null, image_url: 'https://x.test/logo.jpg' } as Partial<Restaurant>)
    expect(container.querySelector('[data-grain]')).toBeNull()
  })
})

describe('BottomNav y capas (LOOP_VISUAL_06)', () => {
  it('BottomNav usa shadow-bottom-nav (y ya no shadow-bottom-sheet) sobre .glass, en z-40', () => {
    const s = src('BottomNav')
    expect(s).toContain('shadow-bottom-nav')
    expect(s).not.toContain('shadow-bottom-sheet')
    expect(s).toMatch(/glass shadow-bottom-nav[^`"]*z-40/)
  })

  it('los avisos superiores (ConnectionBanner, Toast, UpdatePrompt) están en z-60', () => {
    ;['ConnectionBanner', 'Toast', 'UpdatePrompt'].forEach((n) => {
      expect(src(n), n).toContain('z-60')
      expect(src(n), n).not.toMatch(/\bz-50\b/)
    })
  })

  it('modales y dropdown siguen en z-50 (BottomSheet, dropdown de notificaciones)', () => {
    expect(src('BottomSheet')).toMatch(/\bz-50\b/)
    expect(src('NotificationBell')).toMatch(/\bz-50\b/)
  })
})

describe('mesh-hero (LOOP_VISUAL_06)', () => {
  it('ya no hay referencias en el código fuente', () => {
    const all = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.*'], { query: '?raw', import: 'default', eager: true })
    const refs = Object.entries(all).filter(([, s]) => s.includes('mesh-hero')).map(([f]) => f)
    expect(refs).toEqual([])
  })
})
