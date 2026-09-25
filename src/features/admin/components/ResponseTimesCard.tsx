import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import {
  useResponseTimeSettings,
  isValidResponseSeconds,
  MIN_RESPONSE_SECONDS,
  MAX_RESPONSE_SECONDS,
} from '../hooks/useResponseTimeSettings'

/**
 * Tiempos de respuesta: cuánto tiene el restaurante para confirmar y el domiciliario para aceptar.
 * Se aplican a los pedidos y asignaciones NUEVOS; los que ya tienen plazo no cambian.
 */
export const ResponseTimesCard = () => {
  const { settings, loading, error, reload, save } = useResponseTimeSettings()
  const [restaurant, setRestaurant] = useState('')
  const [delivery, setDelivery] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (settings) {
      setRestaurant(String(settings.restaurant_confirm_seconds))
      setDelivery(String(settings.delivery_accept_seconds))
    }
  }, [settings])

  const r = restaurant.trim() === '' ? NaN : Number(restaurant)
  const d = delivery.trim() === '' ? NaN : Number(delivery)
  const valid = isValidResponseSeconds(r) && isValidResponseSeconds(d)
  const changed =
    !!settings && valid && (r !== settings.restaurant_confirm_seconds || d !== settings.delivery_accept_seconds)

  const handleSave = async () => {
    setSaving(true)
    const ok = await save(r, d)
    setSaving(false)
    setFeedback(
      ok
        ? { ok: true, text: 'Tiempos guardados. Se aplican a los pedidos nuevos.' }
        : { ok: false, text: 'No pudimos guardar los tiempos. Intenta de nuevo.' }
    )
  }

  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={MIN_RESPONSE_SECONDS}
        max={MAX_RESPONSE_SECONDS}
        step={5}
        value={value}
        onChange={(e) => {
          set(e.target.value)
          setFeedback(null)
        }}
        aria-invalid={!isValidResponseSeconds(Number(value))}
        aria-describedby="response-times-help"
        className="focus-ring w-36 min-h-[44px] rounded-xl border border-gray-200 px-3 text-sm"
      />
    </div>
  )

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Timer className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-secondary">Tiempos de respuesta</h2>
          <p className="text-sm text-gray-500 mb-4">
            Si el restaurante no confirma a tiempo, el pedido se devuelve al cliente. Si el domiciliario no
            acepta, se ofrece a otro.
          </p>

          {loading && !settings ? (
            <p className="text-sm text-gray-500" role="status">Cargando…</p>
          ) : error && !settings ? (
            <div role="alert" className="text-sm text-danger">
              {error}.{' '}
              <button type="button" onClick={reload} className="focus-ring font-semibold underline">
                Reintentar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              {field('confirm-seconds', 'Restaurante confirma (segundos)', restaurant, setRestaurant)}
              {field('accept-seconds', 'Domiciliario acepta (segundos)', delivery, setDelivery)}
              <Button onClick={handleSave} disabled={!changed || saving} loading={saving}>
                Guardar
              </Button>
            </div>
          )}

          <p id="response-times-help" className={`text-sm mt-2 ${valid ? 'text-gray-500' : 'text-danger'}`}>
            Entre {MIN_RESPONSE_SECONDS} y {MAX_RESPONSE_SECONDS} segundos (120 = 2 minutos). El vencimiento real
            puede tardar hasta 15 s más.
          </p>
          {feedback && (
            <p role="status" className={`text-sm mt-2 font-semibold ${feedback.ok ? 'text-success-strong' : 'text-danger'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
