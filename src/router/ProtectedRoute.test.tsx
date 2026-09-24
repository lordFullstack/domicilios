import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const logout = vi.fn()
let authState: { isAuthenticated: boolean; loading: boolean; user: { role: string; active: boolean } | null }
vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({ ...authState, logout }),
}))

import { ProtectedRoute } from './ProtectedRoute'

const renderRoute = (allowedRoles?: string[]) =>
  render(
    <MemoryRouter>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <p>contenido protegido</p>
      </ProtectedRoute>
    </MemoryRouter>
  )

describe('<ProtectedRoute /> — cuentas sin activar (LOOP_SECURITY_00B)', () => {
  beforeEach(() => {
    logout.mockReset()
    authState = { isAuthenticated: true, loading: false, user: { role: 'delivery', active: true } }
  })

  it('una cuenta activa ve el contenido', () => {
    renderRoute(['delivery'])
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it.each(['delivery', 'restaurant', 'client'])('una cuenta %s inactiva ve la pantalla de revisión, no el contenido', (role) => {
    authState.user = { role, active: false }
    renderRoute([role])
    expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument()
    expect(screen.getByText('Tu cuenta está en revisión')).toBeInTheDocument()
  })

  it('la cuenta inactiva solo ofrece cerrar sesión', () => {
    authState.user = { role: 'delivery', active: false }
    renderRoute(['delivery'])
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('un admin nunca queda bloqueado por la regla', () => {
    authState.user = { role: 'admin', active: false }
    renderRoute(['admin'])
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it('una cuenta inactiva no puede saltar la pantalla entrando a una ruta de otro rol', () => {
    authState.user = { role: 'delivery', active: false }
    renderRoute(['admin'])
    expect(screen.getByText('Tu cuenta está en revisión')).toBeInTheDocument()
  })
})
