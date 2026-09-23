import { describe, it, expect } from 'vitest'
import { supabaseImageUrl } from './supabaseImage'

const URL_ = 'https://x.supabase.co/storage/v1/object/public/covers/a.jpg?t=1'

describe('supabaseImageUrl', () => {
  it('nunca pide solo width: sin height Supabase deja el alto original (bug del efecto lupa)', () => {
    const out = new URL(supabaseImageUrl(URL_, { width: 400 }))
    expect(out.searchParams.get('width')).toBe('400')
    expect(out.searchParams.get('height')).toBe('400')
  })

  it('respeta width y height explícitos y pide resize=cover', () => {
    const out = new URL(supabaseImageUrl(URL_, { width: 400, height: 300 }))
    expect(out.searchParams.get('height')).toBe('300')
    expect(out.searchParams.get('resize')).toBe('cover')
  })

  it('conserva el ?t= existente y usa /render/image/', () => {
    const out = supabaseImageUrl(URL_, { width: 100, height: 100 })
    expect(out).toContain('/storage/v1/render/image/public/covers/a.jpg?t=1&')
  })

  it('no toca URLs que no son de Supabase Storage', () => {
    expect(supabaseImageUrl('https://otro.com/a.jpg', { width: 100 })).toBe('https://otro.com/a.jpg')
  })
})
