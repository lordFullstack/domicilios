import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDriverTheme, driverRootClass } from './useDriverTheme'

describe('useDriverTheme', () => {
  beforeEach(() => localStorage.clear())

  it('por defecto es oscuro', () => {
    const { result } = renderHook(() => useDriverTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(result.current.rootClass).toContain('dark')
  })

  it('cambia a claro y lo recuerda al volver a abrir', () => {
    const first = renderHook(() => useDriverTheme())
    act(() => first.result.current.setTheme('light'))
    expect(first.result.current.theme).toBe('light')
    expect(localStorage.getItem('delivery_theme')).toBe('light')
    first.unmount()
    expect(renderHook(() => useDriverTheme()).result.current.theme).toBe('light')
  })

  it('un valor corrupto vuelve al oscuro', () => {
    localStorage.setItem('delivery_theme', 'raro')
    expect(renderHook(() => useDriverTheme()).result.current.theme).toBe('dark')
  })

  it('el tema claro usa el violeta del restaurante y no la capa oscura', () => {
    expect(driverRootClass('light')).toContain('theme-pulse')
    expect(driverRootClass('light')).not.toMatch(/\bdark\b/)
    expect(driverRootClass('dark')).toMatch(/\bdark\b/)
  })
})
