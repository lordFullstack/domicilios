import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { ROUTES } from '@/config/constants'

interface AdminAlertsProps {
  restaurants: Restaurant[]
  cancellationRate: number
  totalOrders: number
}

// Umbral simple para marcar una tasa de cancelación como preocupante.
// No es una métrica de negocio definida por Jorge — es solo un aviso de
// "revisa esto", claramente etiquetado como tal.
const CANCELLATION_ALERT_THRESHOLD = 15

export const AdminAlerts = ({ restaurants, cancellationRate, totalOrders }: AdminAlertsProps) => {
  const navigate = useNavigate()
  const unapproved = restaurants.filter((r) => !r.approved)

  const alerts: { text: string; onClick?: () => void }[] = []

  if (unapproved.length > 0) {
    alerts.push({
      text: `${unapproved.length} ${unapproved.length === 1 ? 'restaurante no está aprobado' : 'restaurantes no están aprobados'}`,
      onClick: () => navigate(ROUTES.ADMIN_RESTAURANTS),
    })
  }

  if (totalOrders >= 10 && cancellationRate >= CANCELLATION_ALERT_THRESHOLD) {
    alerts.push({
      text: `Tasa de cancelación en ${cancellationRate.toFixed(0)}% en el periodo seleccionado`,
      onClick: () => navigate(ROUTES.ADMIN_ORDERS),
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-8">
      {alerts.map((alert, i) => (
        <button
          key={i}
          onClick={alert.onClick}
          className="focus-ring flex items-center gap-2 bg-warning/10 text-warning text-sm font-semibold rounded-2xl p-3 text-left hover:bg-warning/20 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {alert.text}
        </button>
      ))}
    </div>
  )
}
