import { useState, useEffect } from 'react'
import { Promotion, PromotionType, Restaurant, Product } from '@/shared/types'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { PromotionInput } from '../services/admin.service'

interface PromotionFormProps {
  promotion?: Promotion | null
  restaurants: Restaurant[]
  products: Product[]
  onClose: () => void
  onSave: (input: PromotionInput, imageFile?: File | null) => Promise<void>
}

const TYPE_OPTIONS: { value: PromotionType; label: string }[] = [
  { value: 'banner', label: '🎉 Banner principal' },
  { value: 'featured_restaurant', label: '🏪 Restaurante destacado' },
  { value: 'featured_product', label: '🍽️ Producto destacado' },
]

// Convierte un datetime-local (sin zona horaria) a ISO string, o null si está vacío.
const toIsoOrNull = (value: string) => (value ? new Date(value).toISOString() : null)
// Convierte un ISO string a formato datetime-local para precargar el input.
const toDatetimeLocal = (value?: string | null) => (value ? value.slice(0, 16) : '')

export const PromotionForm = ({ promotion, restaurants, products, onClose, onSave }: PromotionFormProps) => {
  const [type, setType] = useState<PromotionType>(promotion?.type || 'banner')
  const [title, setTitle] = useState(promotion?.title || '')
  const [subtitle, setSubtitle] = useState(promotion?.subtitle || '')
  const [restaurantId, setRestaurantId] = useState(promotion?.restaurant_id || '')
  const [productId, setProductId] = useState(promotion?.product_id || '')
  const [active, setActive] = useState(promotion?.active ?? true)
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(promotion?.starts_at))
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(promotion?.ends_at))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si eligen un producto destacado, el restaurante se autocompleta con el dueño
  // del producto — así el clic en el cliente puede navegar directo sin otra consulta.
  useEffect(() => {
    if (type === 'featured_product' && productId) {
      const product = products.find((p) => p.id === productId)
      if (product) setRestaurantId(product.restaurant_id)
    }
  }, [type, productId, products])

  const handleSave = async () => {
    setError(null)

    if (!title.trim()) {
      setError('El título es obligatorio.')
      return
    }
    if (type !== 'banner' && !restaurantId) {
      setError('Selecciona un restaurante.')
      return
    }
    if (type === 'featured_product' && !productId) {
      setError('Selecciona un producto.')
      return
    }

    setSaving(true)
    try {
      const input: PromotionInput = {
        type,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        image_url: promotion?.image_url || null,
        restaurant_id: type === 'banner' ? restaurantId || null : restaurantId,
        product_id: type === 'featured_product' ? productId : null,
        active,
        display_order: promotion?.display_order ?? 0,
        starts_at: toIsoOrNull(startsAt),
        ends_at: toIsoOrNull(endsAt),
      }
      await onSave(input, imageFile)
      onClose()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar la promoción. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-bold text-lg text-secondary mb-4">
          {promotion ? 'Editar promoción' : 'Nueva promoción'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromotionType)}
              disabled={!!promotion}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm disabled:bg-gray-50"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {promotion && (
              <p className="text-xs text-gray-500 mt-1">El tipo no se puede cambiar al editar.</p>
            )}
          </div>

          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            label="Subtítulo (opcional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          {(type === 'featured_restaurant' || type === 'featured_product') && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Restaurante</label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                disabled={type === 'featured_product'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm disabled:bg-gray-50"
              >
                <option value="">Selecciona...</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'featured_product' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Producto</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Selecciona...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'banner' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Restaurante al que lleva (opcional)
              </label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Solo informativo (sin clic)</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
            {promotion?.image_url && !imageFile && (
              <img
                src={promotion.image_url}
                alt="Actual"
                className="w-full h-20 object-cover rounded-xl mt-2"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Inicia (opcional)</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Termina (opcional)</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Si dejas "Termina" vacío, la promo se queda activa hasta que la desactives manualmente.
          </p>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Activa
          </label>
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
      </div>
    </div>
  )
}
