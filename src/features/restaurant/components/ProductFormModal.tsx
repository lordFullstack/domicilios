import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Product } from '@/shared/types'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    description: string
    price: number
    image_url: string
    available: boolean
  }) => void
  product?: Product | null
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
}: ProductFormModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('🍽️')
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setPrice(String(product.price))
      setImageUrl(product.image_url || '🍽️')
      setAvailable(product.available)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('🍽️')
      setAvailable(true)
    }
    setError('')
  }, [product, isOpen])

  if (!isOpen) return null

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
      available,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {isEditing ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-danger text-sm font-semibold">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de emoji */}
            <div>
              <label className="block text-sm font-semibold mb-2">Icono</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setImageUrl(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 transition-all ${
                      imageUrl === emoji
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre *</label>
              <Input
                placeholder="Ej: Pizza Margarita"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold mb-2">Descripción</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Tomate, mozzarella, albahaca"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold mb-2">Precio (COP) *</label>
              <Input
                type="number"
                placeholder="Ej: 28000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="500"
              />
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="available" className="text-sm font-semibold">
                Disponible para la venta
              </label>
            </div>

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
