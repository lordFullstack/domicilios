import { useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, ChevronLeft, X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { ROUTES } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { clientCreateErrand, errandFilePath, uploadErrandFile } from '../services/errandActions.service'
import { useErrandSettings } from '../hooks/useErrands'
import { prepareErrandImage, type PreparedImage } from '../utils/image'
import { ERRAND_TYPE_EMOJI, ERRAND_TYPE_LABEL } from '../utils/errandStatus'
import type { ErrandType } from '../types'

const SLUG_TO_TYPE: Record<string, ErrandType> = { compra: 'purchase', recogida: 'pickup' }

const digitsToNumber = (raw: string): number | null => {
  const digits = raw.replace(/\D/g, '')
  return digits ? Number(digits) : null
}

interface FormState {
  description: string
  pickupAddress: string
  pickupNotes: string
  dropoffAddress: string
  dropoffNotes: string
  budget: string
}

type Step = 'form' | 'summary'

export const DomiNewPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const type = SLUG_TO_TYPE[params.get('tipo') ?? '']
  const { user } = useAuth()
  const isOffline = useOnlineStatus() === 'offline'
  const { minFee, maxBudget } = useErrandSettings()

  // Misma llave mientras dure esta pantalla: un reintento devuelve el mismo Domi y no crea otro.
  const errandId = useRef(crypto.randomUUID())
  const inFlight = useRef(false)

  const saved = useMemo(
    () => localStorageService.get(STORAGE_KEYS.LAST_DELIVERY_ADDRESS) as { street?: string; complement?: string } | null,
    []
  )
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormState>({
    description: '',
    pickupAddress: '',
    pickupNotes: '',
    dropoffAddress: [saved?.street, saved?.complement].filter(Boolean).join(', '),
    dropoffNotes: '',
    budget: '',
  })
  const [photo, setPhoto] = useState<{ image: PreparedImage; previewUrl: string } | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!type) return <Navigate to={ROUTES.DOMI} replace />

  const isPurchase = type === 'purchase'
  const budget = digitsToNumber(form.budget)
  const set = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const errors = {
    description: form.description.trim().length < 3 ? 'Cuéntanos qué necesitas (mínimo 3 letras).' : null,
    pickupAddress: form.pickupAddress.trim().length < 3 ? 'Escribe el punto A.' : null,
    dropoffAddress: form.dropoffAddress.trim().length < 3 ? 'Escribe el punto B.' : null,
    budget: !isPurchase
      ? null
      : budget === null || budget <= 0
        ? 'Escribe cuánto dejas gastar como máximo.'
        : budget > maxBudget
          ? `El tope por compra es ${formatCOP(maxBudget)}.`
          : null,
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const show = (key: keyof typeof errors) => (touched ? errors[key] ?? undefined : undefined)

  const onPickPhoto = async (file?: File) => {
    if (!file) return
    setPhotoError(null)
    try {
      const image = await prepareErrandImage(file)
      if (photo) URL.revokeObjectURL(photo.previewUrl)
      setPhoto({ image, previewUrl: URL.createObjectURL(image.blob) })
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'No pudimos usar esa foto.')
    }
  }

  const goSummary = () => {
    setTouched(true)
    if (hasErrors) return
    setStep('summary')
    window.scrollTo({ top: 0 })
  }

  const submit = async () => {
    if (inFlight.current || submitting || !user) return
    if (isOffline) return setSubmitError('Necesitamos conexión a internet para pedir tu Domi.')
    inFlight.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      let photoPath: string | null = null
      if (photo) {
        photoPath = errandFilePath(user.id, errandId.current, 'request', photo.image.extension)
        const ok = await uploadErrandFile(photoPath, photo.image)
        if (!ok) {
          setSubmitError('No pudimos subir la foto. Revisa tu conexión o quítala para continuar.')
          return
        }
      }
      const result = await clientCreateErrand({
        id: errandId.current,
        type,
        description: form.description.trim(),
        photoPath,
        pickupAddress: form.pickupAddress.trim(),
        pickupNotes: form.pickupNotes.trim(),
        dropoffAddress: form.dropoffAddress.trim(),
        dropoffNotes: form.dropoffNotes.trim(),
        maxBudget: isPurchase ? budget : null,
      })
      if (!result.ok || !result.errand) {
        setSubmitError(result.reason ?? 'No pudimos pedir tu Domi. Intenta de nuevo.')
        return
      }
      navigate(ROUTES.DOMI_DETAIL.replace(':id', result.errand.id), { replace: true })
    } catch (err) {
      console.error('Error pidiendo el Domi:', err)
      setSubmitError('No pudimos pedir tu Domi. Revisa tu conexión e intenta de nuevo.')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  const back = () => (step === 'summary' ? setStep('form') : navigate(ROUTES.DOMI))

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-10 safe-left safe-right">
      <div className="flex items-center gap-3 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={back}
          aria-label="Volver"
          className="touch-target focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-transform active:scale-90"
        >
          <ChevronLeft className="h-4 w-4 text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-secondary">
            {ERRAND_TYPE_EMOJI[type]} {ERRAND_TYPE_LABEL[type]}
          </h1>
          <p className="text-xs text-gray-500">{step === 'form' ? 'Paso 1 de 2 · Cuéntanos el mandado' : 'Paso 2 de 2 · Revisa y confirma'}</p>
        </div>
      </div>

      {step === 'form' ? (
        <form
          className="flex flex-col gap-4 px-5"
          onSubmit={(e) => {
            e.preventDefault()
            goSummary()
          }}
          noValidate
        >
          <div>
            <label htmlFor="domi-description" className="mb-2 block text-sm font-medium text-gray-700">
              {isPurchase ? '¿Qué necesitas que compre?' : '¿Qué debe recoger?'}
            </label>
            <textarea
              id="domi-description"
              value={form.description}
              onChange={(e) => set('description')(e.target.value.slice(0, 500))}
              rows={3}
              aria-invalid={!!show('description')}
              placeholder={isPurchase ? 'Ej: 2 pollos asados con papa y una gaseosa de 1.5 L' : 'Ej: Un sobre con documentos en la oficina de Servientrega'}
              className={`w-full resize-none rounded-2xl border bg-white p-3 text-sm text-secondary placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                show('description') ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {show('description') && <p className="mt-1 text-sm text-danger">{show('description')}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Foto (opcional)</p>
            {photo ? (
              <div className="relative h-40 overflow-hidden rounded-2xl border border-gray-200">
                <img src={photo.previewUrl} alt="Foto de tu pedido" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Quitar foto"
                  onClick={() => {
                    URL.revokeObjectURL(photo.previewUrl)
                    setPhoto(null)
                  }}
                  className="focus-ring absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="focus-within:ring-2 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500">
                <Camera className="h-5 w-5" aria-hidden="true" />
                Agregar foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    void onPickPhoto(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>
            )}
            {photoError && (
              <p className="mt-1 text-sm text-danger" role="alert">
                {photoError}
              </p>
            )}
          </div>

          <Input
            label={isPurchase ? 'Punto A · ¿Dónde se compra?' : 'Punto A · ¿Dónde se recoge?'}
            value={form.pickupAddress}
            onChange={(e) => set('pickupAddress')(e.target.value.slice(0, 200))}
            placeholder={isPurchase ? 'Ej: Pollos Don Pepe, Calle 15 con Carrera 8' : 'Ej: Calle 10 # 5-20, oficina 3'}
            error={show('pickupAddress')}
          />
          <Input
            label="Indicaciones del punto A (opcional)"
            value={form.pickupNotes}
            onChange={(e) => set('pickupNotes')(e.target.value.slice(0, 150))}
            placeholder="Ej: Pregunta por Luis"
          />
          <Input
            label="Punto B · ¿Dónde lo entregamos?"
            value={form.dropoffAddress}
            onChange={(e) => set('dropoffAddress')(e.target.value.slice(0, 200))}
            placeholder="Ej: Calle 15 # 8-20, casa azul"
            error={show('dropoffAddress')}
          />
          <Input
            label="Indicaciones del punto B (opcional)"
            value={form.dropoffNotes}
            onChange={(e) => set('dropoffNotes')(e.target.value.slice(0, 150))}
            placeholder="Ej: Toca el timbre dos veces"
          />

          {isPurchase && (
            <div>
              <Input
                label={`Presupuesto máximo (tope ${formatCOP(maxBudget)})`}
                inputMode="numeric"
                value={budget === null ? '' : budget.toLocaleString('es-CO')}
                onChange={(e) => set('budget')(e.target.value)}
                placeholder="Ej: 40.000"
                error={show('budget')}
              />
              <p className="mt-1 text-xs text-gray-500">Tu Domi no puede gastar más que esto. Pagas la factura real + su tarifa.</p>
            </div>
          )}

          <Button type="submit" variant="gradient" fullWidth size="lg" className="mt-2">
            Continuar
          </Button>
        </form>
      ) : (
        <div className="px-5">
          <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4">
            <SummaryRow label="Mandado" value={form.description.trim()} />
            {photo && <img src={photo.previewUrl} alt="Foto de tu pedido" className="h-28 w-full rounded-2xl object-cover" />}
            <SummaryRow label="Punto A" value={form.pickupAddress.trim()} hint={form.pickupNotes.trim()} />
            <SummaryRow label="Punto B" value={form.dropoffAddress.trim()} hint={form.dropoffNotes.trim()} />
            {isPurchase && budget !== null && <SummaryRow label="Presupuesto máximo" value={formatCOP(budget)} />}
          </div>

          <div className="mb-4 rounded-2xl bg-domi-soft p-4 text-sm text-gray-700">
            <p className="mb-1 font-display font-bold text-secondary">Así funciona el precio</p>
            <p>
              La tarifa es desde <strong>{formatCOP(minFee)}</strong>. Tu Domi puede aceptarla o proponerte otro precio, y tú decides si lo apruebas.
              {isPurchase ? ' Al recibir pagas en efectivo la factura real + la tarifa.' : ' Al recibir pagas la tarifa en efectivo.'}
            </p>
          </div>

          {submitError && (
            <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button variant="gradient" fullWidth size="lg" loading={submitting} disabled={submitting || isOffline} onClick={() => void submit()}>
              {isOffline ? 'Sin conexión' : 'Pedir mi Domi'}
            </Button>
            <Button variant="tertiary" fullWidth disabled={submitting} onClick={() => setStep('form')}>
              Editar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const SummaryRow = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-secondary">{value}</p>
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
)
