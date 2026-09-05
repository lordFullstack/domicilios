import { useState } from 'react'
import { User } from '@/shared/types'
import { USER_ROLES } from '@/config/constants'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

interface UserEditModalProps {
  user: User
  onClose: () => void
  onSave: (updates: Partial<User>) => Promise<void>
  onResetPassword: (newPassword: string) => Promise<void>
}

const ROLE_OPTIONS = [
  { value: USER_ROLES.CLIENT, label: 'Cliente' },
  { value: USER_ROLES.RESTAURANT, label: 'Restaurante' },
  { value: USER_ROLES.DELIVERY, label: 'Domiciliario' },
  { value: USER_ROLES.ADMIN, label: 'Admin' },
]

export const UserEditModal = ({ user, onClose, onSave, onResetPassword }: UserEditModalProps) => {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '')
  const [role, setRole] = useState(user.role)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave({ name, phone, role })
      onClose()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setResetting(true)
    setError(null)
    try {
      await onResetPassword(newPassword)
      setNewPassword('')
    } catch (err) {
      console.error(err)
      setError('No se pudo restablecer la contraseña.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-bold text-lg text-secondary mb-1">Editar usuario</h3>
        <p className="text-xs text-gray-500 mb-4">{user.email}</p>

        <div className="space-y-3">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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

        <div className="border-t border-gray-100 mt-5 pt-4">
          <p className="text-sm font-semibold text-secondary mb-2">Restablecer contraseña</p>
          <div className="flex gap-2">
            <Input
              placeholder="Nueva contraseña (min. 6 caracteres)"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" loading={resetting} onClick={handleResetPassword}>
              Cambiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
