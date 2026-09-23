/**
 * Reescribe una URL pública de Supabase Storage para pedir una versión
 * redimensionada/comprimida en vez del archivo original.
 *
 * Verificado en el proyecto real (23-sep-2026): una portada de 2.76 MB
 * servida completa pesa 26.6 KB pedida con `width=100&height=...` — el
 * endpoint de transformación SÍ está habilitado en este plan de Supabase.
 *
 * IMPORTANTE — bug real encontrado y corregido el mismo día: pedir solo
 * `width` (sin `height`) NO escala la imagen proporcionalmente — Supabase
 * deja el alto del archivo original sin tocar. Las fotos de los
 * restaurantes son fotos de celular en vertical (ej. 4032×3024 con
 * rotación EXIF); pedir `width=400` solo devolvía una tira de 400×4032 px,
 * que `object-cover` recortaba después en una franja mínima y ampliada
 * ("efecto lupa"). Por eso `height` es obligatorio aquí, no opcional: si
 * un llamador no lo pasa, se asume cuadrado (`height = width`) — sigue
 * siendo mejor que dejar el alto original sin escalar, pero cada pantalla
 * debe pasar el alto real de su contenedor cuando no sea cuadrado.
 *
 * Si la URL no es de Supabase Storage (foto externa, o ya viene con otro
 * dominio), se devuelve tal cual — no rompe nada que no sea de Storage.
 */
export const supabaseImageUrl = (url: string, opts: { width?: number; height?: number; quality?: number } = {}) => {
  const marker = '/storage/v1/object/public/'
  if (!url.includes(marker)) return url

  const { width, quality = 75 } = opts
  const height = opts.height ?? width
  const transformed = url.replace(marker, '/storage/v1/render/image/public/')

  const params = new URLSearchParams()
  if (width) params.set('width', String(Math.round(width)))
  if (height) params.set('height', String(Math.round(height)))
  if (width && height) params.set('resize', 'cover')
  params.set('quality', String(quality))

  const sep = transformed.includes('?') ? '&' : '?'
  return `${transformed}${sep}${params.toString()}`
}
