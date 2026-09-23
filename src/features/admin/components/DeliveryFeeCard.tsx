import { useEffect, useState } from 'react'
import { Bike } from 'lucide-react'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'
import { ConfirmDialog } from './ConfirmDialog'
import { useDeliveryFeeSettings, MAX_DELIVERY_FEE } from '../hooks/useDeliveryFeeSettings'

/**
 * Tarifa de domicilio (lo que cobra el domiciliario por entrega). La fija
 * el Admin; los precios de los productos los fija cada restaurante.
 * El servidor la aplica al crear cada pedido (RPC create_order) y la
 * guarda en `orders.delivery_fee`: cambiarla NO altera pedidos ya creados.
 */
export const DeliveryFeeCard = () => {
  const { settings, loading, error, reload, saveFee } = useDeliveryFeeSettings()
  const [draft, setDraft] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (settings) setDraft(String(settings.delivery_fee))
  }, [settings])

  const parsed = draft.trim() === '' ? NaN : Number(draft)
  const valid = Number.isInteger(parsed) && parsed >= 0 && parsed <= MAX_DELIVERY_FEE
  const changed = !!settings && valid && parsed !== settings.delivery_fee

  const handleSave = async () => {
    setSaving(true)
    const ok = await saveFee(parsed)
    setSaving(false)
    setConfirmOpen(false)
    setFeedback(
      ok
        ? { ok: true, text: 'Tarifa guardada. Se aplica a los pedidos nuevos.' }
        : { ok: false, text: 'No pudimos guardar la tarifa. Intenta de nuevo.' }
    )
  }

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Bike className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-secondary">Tarifa de domicilio</h2>
          <p className="text-sm text-gray-500 mb-4">
            Lo que se cobra por cada entrega. Se suma al total de los pedidos nuevos; en 0 los clientes ven
            &quot;Envío gratis&quot;.
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
              <div>
                <label htmlFor="delivery-fee" className="block text-xs font-semibold text-gray-600 mb-1">
                  Valor en pesos (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" aria-hidden="true">
                    $
                  </span>
                  <input
                    id="delivery-fee"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX_DELIVERY_FEE}
                    step={100}
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value)
                      setFeedback(null)
                    }}
                    aria-invalid={!valid}
                    aria-describedby="delivery-fee-help"
                    className="focus-ring w-40 min-h-[44px] rounded-xl border border-gray-200 pl-7 pr-3 text-sm"
                  />
                </div>
              </div>
              <Button onClick={() => setConfirmOpen(true)} disabled={!changed || saving}>
                Guardar
              </Button>
            </div>
          )}

          <p id="delivery-fee-help" className={`text-sm mt-2 ${valid ? 'text-gray-500' : 'text-danger'}`}>
            {valid
              ? `Entero entre $0 y ${formatCOP(MAX_DELIVERY_FEE)}.`
              : `Escribe un valor entero entre $0 y ${formatCOP(MAX_DELIVERY_FEE)}.`}
            {settings && ` Última actualización: ${new Date(settings.updated_at).toLocaleString('es-CO')}.`}
          </p>
          {feedback && (
            <p role="status" className={`text-sm mt-2 font-semibold ${feedback.ok ? 'text-success-strong' : 'text-danger'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Cambiar la tarifa de domicilio?"
        message={
          valid && settings
            ? `Pasa de ${formatCOP(settings.delivery_fee)} a ${formatCOP(parsed)}. Se aplica a los pedidos que se creen desde ahora; los pedidos existentes no cambian.`
            : ''
        }
        confirmLabel="Sí, cambiar"
        loading={saving}
        onConfirm={handleSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  )
}
