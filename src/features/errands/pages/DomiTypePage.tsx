import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUTES } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import { useDomisAvailable, useErrandSettings } from '../hooks/useErrands'
import type { ErrandType } from '../types'

const OPTIONS: { type: ErrandType; slug: string; emoji: string; title: string; text: string }[] = [
  {
    type: 'purchase',
    slug: 'compra',
    emoji: '🛒',
    title: 'Domi de compra',
    text: 'Tu Domi compra lo que necesites y te lo trae. Tú le pagas la factura y su tarifa en efectivo cuando llegue.',
  },
  {
    type: 'pickup',
    slug: 'recogida',
    emoji: '📦',
    title: 'Domi de recogida',
    text: 'Tu Domi recoge algo en un lugar (punto A) y lo entrega en otro (punto B).',
  },
]

export const DomiTypePage = () => {
  const navigate = useNavigate()
  const { available } = useDomisAvailable()
  const { minFee, maxBudget } = useErrandSettings()

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-10 safe-left safe-right">
      <div className="flex items-center gap-3 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          aria-label="Volver al inicio"
          className="touch-target focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-transform active:scale-90"
        >
          <ChevronLeft className="h-4 w-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Pide tu Domi</h1>
      </div>

      <div className="px-5">
        <p className="mb-5 text-sm text-gray-600">Un domiciliario te hace el mandado, sin pasar por un restaurante. ¿Qué necesitas?</p>

        {available === false && (
          <p className="mb-4 rounded-2xl bg-warning/10 p-3 text-sm font-semibold text-warning-strong" role="status">
            Ahora mismo no hay Domis en turno. Puedes intentar de nuevo en unos minutos.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              disabled={available === false}
              onClick={() => navigate(`${ROUTES.DOMI_NEW}?tipo=${opt.slug}`)}
              className="focus-ring flex items-center gap-4 rounded-3xl border-2 border-domi/20 bg-domi-soft p-4 text-left transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <span className="text-4xl" aria-hidden="true">
                {opt.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-secondary">{opt.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-600">{opt.text}</span>
              </span>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-domi-text" aria-hidden="true" />
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-2 text-xs text-gray-500">
          <li>• Tarifa desde {formatCOP(minFee)}. Tu Domi puede proponerte otro precio y tú decides si lo aceptas.</li>
          <li>• En compras, el tope es {formatCOP(maxBudget)}. Pagas todo en efectivo al recibir.</li>
          <li>• No se aceptan artículos prohibidos: tu Domi puede rechazar el mandado.</li>
        </ul>
      </div>
    </div>
  )
}
