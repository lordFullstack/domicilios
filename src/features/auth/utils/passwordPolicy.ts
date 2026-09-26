// Política de contraseñas. Debe coincidir con Supabase (Authentication → Providers → Email):
//   largo mínimo 8 · "Lowercase, uppercase letters and digits".
// El plan gratuito de Supabase no incluye "Prevent use of leaked passwords" (es de Pro), así que la
// comprobación contra contraseñas filtradas se hace aquí con la API pública de Pwned Passwords.

export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con mayúsculas, minúsculas y números.'

export const PASSWORD_POLICY_ERROR = 'La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas y números.'

export const PASSWORD_LEAKED_ERROR = 'Esa contraseña aparece en filtraciones de datos y es fácil de adivinar. Elige otra.'

/** null = cumple la política de forma. */
export const validatePasswordShape = (password: string): string | null =>
  password.length >= MIN_PASSWORD_LENGTH && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)
    ? null
    : PASSWORD_POLICY_ERROR

const sha1Hex = async (text: string): Promise<string> => {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

/**
 * ¿Aparece la contraseña en filtraciones conocidas? Usa k-anonymity: solo se envían los primeros 5
 * caracteres del hash SHA-1; la contraseña nunca sale del dispositivo. Si la consulta falla (sin red,
 * API caída) NO se bloquea el registro: la comprobación es una ayuda, no un requisito.
 */
export const isPasswordLeaked = async (password: string): Promise<boolean> => {
  try {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    })
    if (!res.ok) return false
    const body = await res.text()
    return body.split('\n').some((line) => {
      const [candidate, count] = line.trim().split(':')
      return candidate === suffix && Number(count) > 0
    })
  } catch {
    return false
  }
}

/** Forma + filtraciones. Devuelve el mensaje de error para mostrar, o null si la contraseña sirve. */
export const checkPassword = async (password: string): Promise<string | null> => {
  const shape = validatePasswordShape(password)
  if (shape) return shape
  return (await isPasswordLeaked(password)) ? PASSWORD_LEAKED_ERROR : null
}
