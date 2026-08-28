import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'

interface LogoutConfirmSheetProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export const LogoutConfirmSheet = ({ open, onClose, onConfirm }: LogoutConfirmSheetProps) => {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleConfirm = async () => {
    setLoggingOut(true)
    await onConfirm()
    // No hace falta setLoggingOut(false) — al confirmar, la app redirige a
    // login y este componente se desmonta.
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="¿Cerrar sesión?">
      <p className="text-sm text-gray-500 mb-5">
        Vas a salir de tu cuenta en este dispositivo.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} disabled={loggingOut} className="flex-1">
          Volver
        </Button>
        <Button
          variant="secondary"
          onClick={handleConfirm}
          loading={loggingOut}
          disabled={loggingOut}
          className="flex-1 !bg-danger"
        >
          Cerrar sesión
        </Button>
      </div>
    </BottomSheet>
  )
}
