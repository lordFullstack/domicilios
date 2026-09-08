import { describe, it, expect } from 'vitest'
import { getAuthErrorMessage } from './authErrors'

describe('getAuthErrorMessage', () => {
  it('traduce un mensaje conocido de Supabase a español', () => {
    const err = new Error('Invalid login credentials')
    expect(getAuthErrorMessage(err, 'fallback')).toBe('Correo o contraseña incorrectos.')
  })

  it('usa el fallback si el mensaje no está en la lista conocida', () => {
    const err = new Error('some internal postgres constraint violation xyz')
    expect(getAuthErrorMessage(err, 'No pudimos procesar tu solicitud.')).toBe(
      'No pudimos procesar tu solicitud.'
    )
  })

  it('nunca reproduce el mensaje técnico crudo cuando no es conocido (seguridad)', () => {
    const err = new Error('duplicate key value violates unique constraint "profiles_pkey"')
    const result = getAuthErrorMessage(err, 'Ocurrió un error.')
    expect(result).not.toContain('constraint')
    expect(result).not.toContain('profiles_pkey')
  })

  it('usa el fallback si el error no es una instancia de Error', () => {
    expect(getAuthErrorMessage('texto plano', 'fallback seguro')).toBe('fallback seguro')
    expect(getAuthErrorMessage(null, 'fallback seguro')).toBe('fallback seguro')
  })
})
