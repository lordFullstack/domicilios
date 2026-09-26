import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  validatePasswordShape,
  isPasswordLeaked,
  checkPassword,
  PASSWORD_POLICY_ERROR,
  PASSWORD_LEAKED_ERROR,
} from './passwordPolicy'

// SHA-1("Password1") = 70CCD9007338D6D81DD3B6271621B9CF9A97EA00 -> prefijo 70CCD, sufijo 9007338D6D81DD3B6271621B9CF9A97EA00
const LEAKED = 'Password1'
const SUFFIX = '9007338D6D81DD3B6271621B9CF9A97EA00'

const mockFetch = (body: string, ok = true) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, text: () => Promise.resolve(body) }))

describe('validatePasswordShape', () => {
  it('exige 8+ caracteres con minúscula, mayúscula y número', () => {
    expect(validatePasswordShape('Abcdefg1')).toBeNull()
    expect(validatePasswordShape('Abcdef1')).toBe(PASSWORD_POLICY_ERROR) // 7
    expect(validatePasswordShape('abcdefg1')).toBe(PASSWORD_POLICY_ERROR) // sin mayúscula
    expect(validatePasswordShape('ABCDEFG1')).toBe(PASSWORD_POLICY_ERROR) // sin minúscula
    expect(validatePasswordShape('Abcdefgh')).toBe(PASSWORD_POLICY_ERROR) // sin número
  })
})

describe('isPasswordLeaked', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envía solo los 5 primeros caracteres del hash (k-anonymity)', async () => {
    mockFetch('')
    await isPasswordLeaked(LEAKED)
    const url = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toBe('https://api.pwnedpasswords.com/range/70CCD')
    expect(url).not.toContain(SUFFIX)
  })

  it('detecta una contraseña que aparece en la lista', async () => {
    mockFetch(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:2\r\n${SUFFIX}:12345\r\n`)
    expect(await isPasswordLeaked(LEAKED)).toBe(true)
  })

  it('no la marca si no está, o si el conteo es 0 (relleno de la API)', async () => {
    mockFetch(`${SUFFIX}:0\r\nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB:5\r\n`)
    expect(await isPasswordLeaked(LEAKED)).toBe(false)
  })

  it('si la consulta falla, NO bloquea (falla abierto)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await isPasswordLeaked(LEAKED)).toBe(false)
    mockFetch('', false)
    expect(await isPasswordLeaked(LEAKED)).toBe(false)
  })
})

describe('checkPassword', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('primero la forma (sin consultar la red) y luego las filtraciones', async () => {
    mockFetch('')
    expect(await checkPassword('corta')).toBe(PASSWORD_POLICY_ERROR)
    expect(fetch).not.toHaveBeenCalled()
    mockFetch(`${SUFFIX}:99\r\n`)
    expect(await checkPassword(LEAKED)).toBe(PASSWORD_LEAKED_ERROR)
    mockFetch('')
    expect(await checkPassword('Zx9kLmnPq')).toBeNull()
  })
})
