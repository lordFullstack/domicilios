import { useState, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { ProductImage } from '@/shared/components/ProductImage'
import { Product, ProductCategory } from '@/shared/types'
import { PRODUCT_CATEGORIES } from '@/config/constants'
import { supabase } from '@/shared/utils/supabase'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    description: string
    price: number
    image_url: string
    category: ProductCategory
    available: boolean
  }) => void
  product?: Product | null
  restaurantId: string
}

const EMOJI_OPTIONS = [
  '🍕', '🍔', '🍣', '🍗', '🍟', '🌮', '🍝', '🥗',
  '🍰', '🥤', '🍺', '☕', '🍦', '🥪', '🍤', '🍜',
]

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSave,
  product,
  restaurantId,
}: ProductFormModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('🍽️')
  const [category, setCategory] = useState<ProductCategory>('Platos')
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setPrice(String(product.price))
      setImageUrl(product.image_url || '🍽️')
      setCategory(product.category || 'Platos')
      setAvailable(product.available)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('🍽️')
      setCategory('Platos')
      setAvailable(true)
    }
    setError('')
  }, [product, isOpen])

  if (!isOpen) return null

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La foto no puede pesar más de 5MB')
      return
    }

    setUploading(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${restaurantId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    } catch (err: any) {
      console.error('Error subiendo foto:', err)
      setError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    const numericPrice = Number(price)
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      setError('El precio debe ser un número mayor a 0')
      return
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      image_url: imageUrl,
      category,
      available,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-card-hover w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display text-lg font-bold text-secondary">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
            >
              &times;
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 rounded-2xl p-3">
              <p className="text-danger text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto real o icono */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Foto del producto</label>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <ProductImage imageUrl={imageUrl} alt={name || 'Producto'} />
                  )}
                </div>
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-500 active:scale-[0.98] transition-transform cursor-pointer">
                    <Camera className="w-4 h-4" />
                    Subir foto
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                  />
                </label>
              </div>

              <p className="text-xs text-gray-400 mb-2">O elige un icono rápido:</p>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setImageUrl(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all active:scale-90 ${
                      imageUrl === emoji
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <Input
              label="Nombre *"
              placeholder="Ej: Pizza Margarita"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all active:scale-95 ${
                      category === cat
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-100 text-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Descripción</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Ej: Tomate, mozzarella, albahaca"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Precio */}
            <Input
              label="Precio (COP) *"
              type="number"
              placeholder="Ej: 28000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="500"
            />

            {/* Disponibilidad */}
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className="w-full flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3"
            >
              <span className="text-sm font-semibold text-secondary">Disponible para la venta</span>
              <span
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                  available ? 'bg-success' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    available ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </button>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
