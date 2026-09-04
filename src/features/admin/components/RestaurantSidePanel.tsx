import { useState } from 'react'
import { X } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { RESTAURANT_CATEGORIES } from '@/config/constants'

interface RestaurantSidePanelProps {
  restaurant: Restaurant
  onClose: () => void
  onSave: (updates: Partial<Restaurant>) => Promise<void>
}

export const RestaurantSidePanel = ({ restaurant, onClose, onSave }: RestaurantSidePanelProps) => {
  const [name, setName] = useState(restaurant.name)
  const [description, setDescription] = useState(restaurant.description || '')
  const [address, setAddress] = useState(restaurant.address || '')
  const [phone, setPhone] = useState(restaurant.phone || '')
  const [category, setCategory] = useState(restaurant.category)
  const [imageUrl, setImageUrl] = useState(restaurant.image_url || '')
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_url || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name,
        description,
        address,
        phone,
        category,
        image_url: imageUrl,
        cover_url: coverUrl,
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Editar restaurante"
        className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-floating overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-display font-bold text-lg text-secondary">Editar restaurante</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="focus-ring w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Restaurant['category'])}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white"
            >
              {RESTAURANT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <Input
            label="URL de imagen (emoji o link)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Input label="URL de portada" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
          <p className="text-xs text-gray-400 -mt-2">
            La subida de fotos solo la puede hacer el dueño del restaurante desde su panel — acá solo
            se puede editar el link.
          </p>
        </div>

        {error && <p className="text-danger text-xs px-6">{error}</p>}

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button variant="outline" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}
