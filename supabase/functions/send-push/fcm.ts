// Envío por Firebase Cloud Messaging (HTTP v1) con una cuenta de servicio.
// Sin librerías externas: firma el JWT con WebCrypto y pide el token a Google.
//
// Secret requerido: FCM_SERVICE_ACCOUNT = contenido completo del .json de la cuenta de servicio.

interface ServiceAccount {
  project_id: string
  client_email: string
  private_key: string
}

export type FcmResult = 'sent' | 'invalid_token' | 'error'

let cachedToken: { value: string; expiresAt: number } | null = null

const base64Url = (data: ArrayBuffer | string): string => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const pemToDer = (pem: string): ArrayBuffer => {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')
  const binary = atob(base64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out.buffer
}

/** null si el secret falta o está mal formado (entonces simplemente no se envía por FCM). */
export const loadServiceAccount = (): ServiceAccount | null => {
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT')
  if (!raw) return null
  try {
    const sa = JSON.parse(raw)
    if (sa.project_id && sa.client_email && sa.private_key) return sa as ServiceAccount
  } catch {
    // cae al return null
  }
  console.error('FCM_SERVICE_ACCOUNT no es un JSON de cuenta de servicio válido')
  return null
}

const getAccessToken = async (sa: ServiceAccount): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value

  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64Url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  )
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`))

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${base64Url(signature)}`,
    }),
  })
  if (!res.ok) throw new Error(`OAuth de FCM falló (${res.status})`)
  const json = await res.json()
  cachedToken = { value: json.access_token, expiresAt: now + (json.expires_in ?? 3600) }
  return cachedToken.value
}

/**
 * Mensaje solo de "datos": la app arma la notificación (canal de alta prioridad, sonido,
 * caducidad). Prioridad alta y TTL de 120 s: una oferta vencida no se entrega tarde.
 */
export const sendFcm = async (sa: ServiceAccount, token: string, data: Record<string, string>): Promise<FcmResult> => {
  const accessToken = await getAccessToken(sa)
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { token, data, android: { priority: 'HIGH', ttl: '120s' } } }),
  })
  if (res.ok) return 'sent'

  const body = await res.text()
  // Token ya inválido (app desinstalada o token renovado): hay que borrarlo
  if (res.status === 404 || body.includes('UNREGISTERED')) return 'invalid_token'
  console.error('FCM rechazó el mensaje', res.status, body.slice(0, 300))
  return 'error'
}
