/**
 * Reescribe una URL pública de Supabase Storage para pedir una versión
 * redimensionada/comprimida en vez del archivo original.
 *
 * Verificado en el proyecto real (23-sep-2026): una portada de 2.76 MB
 * servida completa pesa 26.6 KB pedida con `width=100` — el endpoint de
 * transformación SÍ está habilitado en este plan de Supabase. Antes,
 * ninguna pantalla pedía menos que el archivo original, sin importar si
 * se mostraba en un avatar de 32px o en el hero de 208px de alto.
 *
 * Si la URL no es de Supabase Storage (foto externa, o ya viene con otro
 * dominio), se devuelve tal cual — no rompe nada que no sea de Storage.
 */
export const supabaseImageUrl = (url: string, opts: { width?: number; quality?: number } = {}) => {
  const marker = '/storage/v1/object/public/'
  if (!url.includes(marker)) return url

  const { width, quality = 75 } = opts
  const transformed = url.replace(marker, '/storage/v1/render/image/public/')

  const params = new URLSearchParams()
  if (width) params.set('width', String(Math.round(width)))
  params.set('quality', String(quality))

  const sep = transformed.includes('?') ? '&' : '?'
  return `${transformed}${sep}${params.toString()}`
}
