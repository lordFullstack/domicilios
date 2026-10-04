import { useState } from 'react'
import { Banknote, Camera, MapPin, Phone } from 'lucide-react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { formatCOP } from '@/shared/utils/money'
import { useErrandFileUrl, usePublicProfile } from '../hooks/useErrands'
import { prepareErrandImage, type PreparedImage } from '../utils/image'
import { ERRAND_TYPE_EMOJI, ERRAND_TYPE_LABEL, errandAmountDue } from '../utils/errandStatus'
import type { Errand } from '../types'

const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(/riohacha/i.test(address) ? address : `${address}, Riohacha`)}`

export interface PickedUpInput {
  purchaseAmount?: number
  receipt?: PreparedImage
}

interface ErrandActiveSheetProps {
  errand: Errand | null
  open: boolean
  busy: boolean
  disabled: boolean
  onPickedUp: (errand: Errand, input: PickedUpInput) => void
  onStartDelivery: (errand: Errand) => void
  onComplete: (errand: Errand) => void
  onClose: () => void
}

/** Domi activo: A/B con mapas, llamar al cliente y el paso siguiente (compré/recogí → salgo → entregué). */
export const ErrandActiveSheet = ({ errand, open, busy, disabled, onPickedUp, onStartDelivery, onComplete, onClose }: ErrandActiveSheetProps) => {
  const client = usePublicProfile(open ? errand?.client_id : null)
  const photoUrl = useErrandFileUrl(open ? errand?.photo_url : null)
  const [amountText, setAmountText] = useState('')
  const [receipt, setReceipt] = useState<{ image: PreparedImage; previewUrl: string } | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)

  if (!errand) return null

  const isPurchase = errand.type === 'purchase'
  const amount = Number(amountText.replace(/\D/g, '')) || 0
  const overBudget = isPurchase && errand.max_budget !== null && amount > errand.max_budget
  const due = errandAmountDue(errand)
  const purchaseReady = !isPurchase || (amount > 0 && !overBudget && !!receipt)

  const pickReceipt = async (file?: File) => {
    if (!file) return
    setReceiptError(null)
    try {
      const image = await prepareErrandImage(file)
      if (receipt) URL.revokeObjectURL(receipt.previewUrl)
      setReceipt({ image, previewUrl: URL.createObjectURL(image.blob) })
    } catch (err) {
      setReceiptError(err instanceof Error ? err.message : 'No pudimos usar esa foto.')
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={`${ERRAND_TYPE_EMOJI[errand.type]} ${ERRAND_TYPE_LABEL[errand.type]}`}>
      <div className="flex flex-col gap-4">
        <span className="w-fit rounded-full bg-domi px-2.5 py-1 text-xs font-bold text-white dark:bg-pulse">🛵 DOMI</span>

        <div>
          <p className="mb-1 text-xs font-bold tracking-wide text-gray-500">MANDADO</p>
          <p className="text-sm font-semibold text-secondary">{errand.description}</p>
        </div>
        {photoUrl && <img src={photoUrl} alt="Foto del pedido del cliente" className="h-32 w-full rounded-2xl object-cover" />}

        <Place label={isPurchase ? 'PUNTO A · COMPRAR EN' : 'PUNTO A · RECOGER EN'} address={errand.pickup_address} hint={errand.pickup_notes} />
        <Place label="PUNTO B · ENTREGAR EN" address={errand.dropoff_address} hint={errand.dropoff_notes} />

        {client?.phone && (
          <a
            href={`tel:${client.phone}`}
            className="focus-ring flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-secondary"
          >
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            Llamar a {client.name.split(' ')[0]}
          </a>
        )}

        {due !== null && (
          <div className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary">
            <Banknote className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {errand.status === 'accepted' && isPurchase
                ? `Tu tarifa es ${formatCOP(errand.fee ?? 0)}. Al entregar cobras la factura + la tarifa.`
                : `Cobrar ${formatCOP(due)} en efectivo al entregar`}
            </span>
          </div>
        )}

        {errand.status === 'accepted' && isPurchase && (
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-3">
            <p className="text-xs font-bold tracking-wide text-gray-500">YA LO COMPRÉ</p>
            <Input
              label={`Monto de la factura (máx. ${formatCOP(errand.max_budget ?? 0)})`}
              inputMode="numeric"
              value={amount ? amount.toLocaleString('es-CO') : ''}
              onChange={(e) => setAmountText(e.target.value)}
              placeholder="Ej: 38.500"
              error={overBudget ? 'Supera el presupuesto del cliente.' : undefined}
            />
            {receipt ? (
              <div className="relative">
                <img src={receipt.previewUrl} alt="Foto de la factura" className="h-32 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(receipt.previewUrl)
                    setReceipt(null)
                  }}
                  className="focus-ring absolute right-2 top-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold text-white"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <label className="flex h-20 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500">
                <Camera className="h-5 w-5" aria-hidden="true" />
                Foto de la factura (obligatoria)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => {
                    void pickReceipt(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>
            )}
            {receiptError && (
              <p className="text-sm text-danger" role="alert">
                {receiptError}
              </p>
            )}
          </div>
        )}

        {errand.status === 'accepted' && (
          <Button
            fullWidth
            size="lg"
            loading={busy}
            disabled={disabled || busy || !purchaseReady}
            onClick={() => onPickedUp(errand, isPurchase ? { purchaseAmount: amount, receipt: receipt?.image } : {})}
          >
            {isPurchase ? 'Ya lo compré' : 'Ya lo recogí'}
          </Button>
        )}
        {errand.status === 'picked_up' && (
          <Button fullWidth size="lg" loading={busy} disabled={disabled || busy} onClick={() => onStartDelivery(errand)}>
            Salir a entregar
          </Button>
        )}
        {errand.status === 'in_delivery' && (
          <Button fullWidth size="lg" loading={busy} disabled={disabled || busy} onClick={() => onComplete(errand)}>
            Marcar como entregado
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}

const Place = ({ label, address, hint }: { label: string; address: string; hint?: string | null }) => (
  <div>
    <p className="mb-1 text-xs font-bold tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-secondary">{address}</p>
    {hint && <p className="mt-0.5 text-xs italic text-gray-500">“{hint}”</p>}
    <a
      href={mapsUrl(address)}
      target="_blank"
      rel="noreferrer"
      className="focus-ring mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"
    >
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
      Abrir en Maps
    </a>
  </div>
)
