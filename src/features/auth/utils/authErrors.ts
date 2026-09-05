const KNOWN_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'User already registered': 'Ya existe una cuenta con ese correo.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Ese correo no parece válido.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos y vuelve a intentar.',
  'New password should be different from the old password.':
    'La nueva contraseña debe ser distinta a la anterior.',
  'Auth session missing!': 'Tu sesión expiró. Vuelve a intentarlo desde el link del correo.',
}

/**
 * Convierte un error de Supabase Auth en un mensaje seguro para mostrar.
 * "Seguro" significa: nunca reproduce mensajes técnicos crudos (nombres de
 * tabla, SQL, stack traces) que a veces vienen en errores no relacionados a
 * auth — solo traduce los mensajes de auth conocidos, y para cualquier otra
 * cosa da un mensaje genérico.
 */
export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  const raw = error instanceof Error ? error.message : ''
  return KNOWN_ERRORS[raw] || fallback
}
