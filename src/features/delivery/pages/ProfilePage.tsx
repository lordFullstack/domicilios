import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, Bike, LogOut, Loader2, Package, Wallet } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { BottomNav } from '@/shared/components/BottomNav'
import { ORDER_STATUS, ROUTES } from '@/config/constants'
import { supabase } from '@/shared/utils/supabase'

export const DeliveryProfilePage = () => {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const { getOrdersByDelivery } = useOrders()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [vehicleType, setVehicleType] = useState<'moto' | 'bici'>(user?.vehicle_type || 'moto')
  const [vehiclePlate, setVehiclePlate] = useState(user?.vehicle_plate || '')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const myDeliveries = user ? getOrdersByDelivery(user.id) : []
  const completedDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.DELIVERED)
  const totalEarnings = completedDeliveries.reduce((sum, o) => sum + o.total * 0.1, 0)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 3 * 1024 * 1024) {
      setError('La foto no puede pesar más de 3MB')
      return
    }

    setUploadingPhoto(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      // Cache-bust para que se vea la foto nueva de una, sin esperar caché
      await updateProfile({ avatar_url: `${data.publicUrl}?t=${Date.now()}` })
    } catch (err) {
      console.error(err)
      setError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateProfile({
        name,
        phone,
        vehicle_type: vehicleType,
        vehicle_plate: vehiclePlate,
      })
      setMessage('Perfil actualizado')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate(ROUTES.DELIVERY_DASHBOARD)}>
          <ChevronLeft className="w-6 h-6 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Mi Perfil</h1>
      </div>

      {/* Foto */}
      <div className="flex flex-col items-center px-5 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-card">
            {uploadingPhoto ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-display font-bold text-gray-300">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white cursor-pointer active:scale-90 transition-transform">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
            />
          </label>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-6">
        <Card className="text-center py-4">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-display font-bold text-secondary">{completedDeliveries.length}</p>
          <p className="text-gray-400 text-xs">Entregas totales</p>
        </Card>
        <Card className="text-center py-4">
          <Wallet className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-xl font-display font-bold text-secondary">
            ${totalEarnings.toLocaleString('es-CO')}
          </p>
          <p className="text-gray-400 text-xs">Ganado en total</p>
        </Card>
      </div>

      {message && (
        <div className="mx-5 mb-4 bg-green-50 text-success text-sm font-semibold rounded-2xl p-3">
          {message}
        </div>
      )}
      {error && (
        <div className="mx-5 mb-4 bg-red-50 text-danger text-sm font-semibold rounded-2xl p-3">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSave} className="px-5 space-y-4">
        <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehículo</label>
          <div className="flex gap-3">
            {(['moto', 'bici'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setVehicleType(type)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-semibold capitalize transition-all active:scale-95 ${
                  vehicleType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <Bike className="w-4 h-4" />
                {type}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Placa"
          value={vehiclePlate}
          onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
          placeholder="Ej: ABC12D"
        />

        <Button type="submit" fullWidth loading={saving} className="mt-2">
          Guardar cambios
        </Button>
      </form>

      <div className="px-5 mt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-danger text-sm font-semibold py-3"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <BottomNav role="delivery" />
    </div>
  )
}
