import { useState } from 'react'
import { Restaurant } from '@/shared/types'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

interface RestaurantEditModalProps {
  restaurant: Restaurant
  onClose: () => void
  onSave: (updates: Partial<Restaurant>) => Promise<void>
}

export const RestaurantEditModal = ({ restaurant, onClose, onSave }: RestaurantEditModalProps) => {
  const [name, setName] = useState(restaurant.name)
  const [description, setDescription] = useState(restaurant.description || '')
  const [address, setAddress] = useState(restaurant.address || '')
  const [phone, setPhone] = useState(restaurant.phone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave({ name, description, address, phone })
      onClose()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-bold text-lg text-secondary mb-4">Editar restaurante</h3>

        <div className="space-y-3">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {error && <p className="text-danger text-xs mt-3">{error}</p>}

        <div className="flex gap-3 mt-5">
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
