import { useState } from 'react'
import { Store } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { createRestaurant } from '@/hooks/useLocalData'

interface CreateRestaurantPageProps {
  onCreated: () => void
}

export const CreateRestaurantPage = ({ onCreated }: CreateRestaurantPageProps) => {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)
    try {
      await createRestaurant({
        owner_id: user.id,
        name,
        description,
        address,
        phone,
      })
      onCreated()
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el restaurante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-secondary text-center">
          Crea tu restaurante
        </h1>
        <p className="text-gray-500 text-sm mt-1 text-center">
          Cuéntanos de tu negocio para empezar a vender
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-2xl mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del restaurante"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Pizza Italia"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Ej: Comida italiana casera, pastas y pizzas al horno de leña"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>
        <Input
          label="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ej: Calle 15 # 8-20, Riohacha"
          required
        />
        <Input
          label="Teléfono"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 3001234567"
          required
        />

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Crear restaurante
        </Button>
      </form>
    </div>
  )
}
