import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollSpy } from './useScrollSpy'

type Cb = (entries: { isIntersecting: boolean; target: { id: string } }[]) => void
let trigger: Cb = () => {}

beforeEach(() => {
  ;['a', 'b', 'c'].forEach((id) => {
    const el = document.createElement('section')
    el.id = id
    document.body.appendChild(el)
  })
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: Cb) {
        trigger = cb
      }
      observe() {}
      disconnect() {}
    }
  )
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

const at = (id: string, isIntersecting: boolean) => ({ isIntersecting, target: { id } })

describe('useScrollSpy', () => {
  it('arranca en la primera sección y sigue a la visible más arriba', () => {
    const { result } = renderHook(() => useScrollSpy(['a', 'b', 'c'], 100))
    expect(result.current.activeId).toBe('a')
    act(() => trigger([at('a', false), at('b', true), at('c', true)]))
    expect(result.current.activeId).toBe('b')
  })

  it('select() fija el chip y pausa el spy durante el scroll programático', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useScrollSpy(['a', 'b', 'c'], 100))
    act(() => result.current.select('c', 800))
    act(() => trigger([at('b', true)])) // sección intermedia durante el scroll
    expect(result.current.activeId).toBe('c')
    vi.advanceTimersByTime(900)
    act(() => trigger([at('b', false), at('c', true)]))
    expect(result.current.activeId).toBe('c')
    vi.useRealTimers()
  })

  it('no hace nada si no está habilitado', () => {
    const { result } = renderHook(() => useScrollSpy(['a', 'b'], 100, false))
    expect(result.current.activeId).toBe('a')
  })
})
