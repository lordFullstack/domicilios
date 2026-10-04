import { useEffect, useState } from 'react'
import { Bike } from 'lucide-react'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import {
  ERRAND_LIMITS,
  isValidErrandSetting,
  useErrandSettingsAdmin,
  type ErrandAdminSettings,
} from '../hooks/useErrandSettingsAdmin'

const FIELDS: { key: keyof ErrandAdminSettings; unit: string }[] = [
  { key: 'minFee', unit: 'COP' },
  { key: 'maxBudget', unit: 'COP' },
  { key: 'quoteSeconds', unit: 'segundos' },
  { key: 'maxRounds', unit: 'rondas' },
]

const toNumber = (raw: string) => (raw.trim() === '' ? NaN : Number(raw))

/**
 * Ajustes de Domi (mandados): tarifa mínima, tope de compra, tiempo del cliente para responder una
 * cotización y rondas de búsqueda. Aplican a los Domis nuevos; los que ya están en curso no cambian.
 */
export const ErrandSettingsCard = () => {
  const { settings, loading, error, reload, save } = useErrandSettingsAdmin()
  const [draft, setDraft] = useState<Record<keyof ErrandAdminSettings, string> | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (settings) {
      setDraft({
        minFee: String(settings.minFee),
        maxBudget: String(settings.maxBudget),
        quoteSeconds: String(settings.quoteSeconds),
        maxRounds: String(settings.maxRounds),
      })
    }
  }, [settings])

  const parsed: ErrandAdminSettings | null = draft
    ? {
        minFee: toNumber(draft.minFee),
        maxBudget: toNumber(draft.maxBudget),
        quoteSeconds: toNumber(draft.quoteSeconds),
        maxRounds: toNumber(draft.maxRounds),
      }
    : null
  const valid = !!parsed && FIELDS.every(({ key }) => isValidErrandSetting(key, parsed[key]))
  const changed = !!settings && !!parsed && FIELDS.some(({ key }) => parsed[key] !== settings[key])

  const handleSave = async () => {
    if (!parsed || !valid) return
    setSaving(true)
    const ok = await save(parsed)
    setSaving(false)
    setFeedback(
      ok
        ? { ok: true, text: 'Ajustes de Domi guardados. Se aplican a los Domis nuevos.' }
        : { ok: false, text: 'No pudimos guardar los ajustes. Intenta de nuevo.' }
    )
  }

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-domi-soft text-domi-text flex items-center justify-center flex-shrink-0">
          <Bike className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-secondary">Domi (mandados)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Tarifa mínima que cobra el domiciliario, tope de lo que se puede comprar, tiempo que tiene el cliente para
            responder una cotización y cuántas veces se ofrece el Domi a los domiciliarios antes de darlo por sin Domi.
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
            draft &&
            parsed && (
              <div className="flex flex-wrap items-end gap-3">
                {FIELDS.map(({ key, unit }) => {
                  const lim = ERRAND_LIMITS[key]
                  const bad = !isValidErrandSetting(key, parsed[key])
                  return (
                    <div key={key}>
                      <label htmlFor={`errand-${key}`} className="block text-xs font-semibold text-gray-600 mb-1">
                        {lim.label} ({unit})
                      </label>
                      <input
                        id={`errand-${key}`}
                        type="number"
                        inputMode="numeric"
                        min={lim.min}
                        max={lim.max}
                        value={draft[key]}
                        onChange={(e) => {
                          setDraft({ ...draft, [key]: e.target.value })
                          setFeedback(null)
                        }}
                        aria-invalid={bad}
                        aria-describedby={`errand-${key}-help`}
                        className="focus-ring w-40 min-h-[44px] rounded-xl border border-gray-200 px-3 text-sm"
                      />
                      <p id={`errand-${key}-help`} className={`text-sm mt-1 ${bad ? 'text-danger' : 'text-gray-500'}`}>
                        Entre {lim.min.toLocaleString('es-CO')} y {lim.max.toLocaleString('es-CO')}
                      </p>
                    </div>
                  )
                })}
                <Button onClick={handleSave} disabled={!changed || !valid || saving} loading={saving}>
                  Guardar
                </Button>
              </div>
            )
          )}

          {feedback && (
            <p role="status" className={`text-sm mt-3 font-semibold ${feedback.ok ? 'text-success-strong' : 'text-danger'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
