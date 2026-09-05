import { Download } from 'lucide-react'
import { useInstallPrompt } from '@/shared/hooks/useInstallPrompt'
import { Button } from './Button'

export const InstallAppCard = () => {
  const { canInstall, promptInstall } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-4 mb-2">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Download className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary">Instala la app</p>
        <p className="text-xs text-gray-500">Acceso más rápido, desde tu pantalla de inicio</p>
      </div>
      <Button size="sm" onClick={promptInstall} className="flex-shrink-0">
        Instalar
      </Button>
    </div>
  )
}
