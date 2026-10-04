// Fotos del Domi (pedido y factura): se reducen antes de subir para gastar pocos datos móviles.

export const ERRAND_IMAGE_MAX_BYTES = 5 * 1024 * 1024
const MAX_SIDE = 1600
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export interface PreparedImage {
  blob: Blob
  extension: 'jpg' | 'png' | 'webp'
  contentType: string
}

const extensionFor = (type: string): PreparedImage['extension'] =>
  type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'

const loadBitmap = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image_load_failed'))
    }
    img.src = url
  })

/** Devuelve la imagen lista para subir o lanza `Error` con un mensaje para el usuario. */
export const prepareErrandImage = async (file: File): Promise<PreparedImage> => {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error('Usa una foto JPG, PNG o WebP.')
  }
  try {
    const img = await loadBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no_canvas')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (blob && blob.size <= ERRAND_IMAGE_MAX_BYTES) {
      return { blob, extension: 'jpg', contentType: 'image/jpeg' }
    }
  } catch {
    // Si el navegador no puede reducirla, se sube tal cual (si cabe).
  }
  if (file.size > ERRAND_IMAGE_MAX_BYTES) {
    throw new Error('La foto pesa más de 5 MB. Prueba con otra.')
  }
  return { blob: file, extension: extensionFor(file.type), contentType: file.type }
}
