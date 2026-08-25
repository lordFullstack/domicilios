import { useState } from 'react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PromotionForm } from '../components/PromotionForm'
import { useAdminPromotions } from '../hooks/useAdminPromotions'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Promotion } from '@/shared/types'

const TYPE_LABELS: Record<string, string> = {
  banner: '🎉 Banner',
  featured_restaurant: '🏪 Restaurante destacado',
  featured_product: '🍽️ Producto destacado',
}

export const AdminPromotionsPage = () => {
  const { restaurants } = useAdminRestaurants()
  const { promotions, products, loading, error, addPromotion, editPromotion, removePromotion, toggleActive } =
    useAdminPromotions()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openNew = () => {
    setEditingPromotion(null)
    setFormOpen(true)
  }

  const openEdit = (promo: Promotion) => {
    setEditingPromotion(promo)
    setFormOpen(true)
  }

  const handleSave = async (input: Parameters<typeof addPromotion>[0], imageFile?: File | null) => {
    if (editingPromotion) {
      await editPromotion(editingPromotion.id, input, imageFile)
    } else {
      await addPromotion(input, imageFile)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removePromotion(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const isExpired = (promo: Promotion) => promo.ends_at && new Date(promo.ends_at) <= new Date()

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-2xl font-bold text-secondary">Promociones</h1>
          <Button variant="primary" size="sm" onClick={openNew}>
            + Nueva promoción
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Banners y destacados que ven los clientes en Inicio
        </p>

        {loading && <p className="text-gray-400 text-sm">Cargando promociones...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {promotions.map((promo) => (
              <Card key={promo.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-primary">{TYPE_LABELS[promo.type]}</span>
                    <p className="font-display font-bold text-secondary truncate">{promo.title}</p>
                    {promo.subtitle && (
                      <p className="text-xs text-gray-400 truncate">{promo.subtitle}</p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      promo.active && !isExpired(promo)
                        ? 'bg-success/10 text-success'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isExpired(promo) ? 'Vencida' : promo.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {promo.image_url && (
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-24 object-cover rounded-xl mb-3"
                  />
                )}

                {(promo.starts_at || promo.ends_at) && (
                  <p className="text-xs text-gray-400 mb-3">
                    {promo.starts_at && `Desde ${new Date(promo.starts_at).toLocaleDateString('es-CO')}`}
                    {promo.starts_at && promo.ends_at && ' · '}
                    {promo.ends_at && `Hasta ${new Date(promo.ends_at).toLocaleDateString('es-CO')}`}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => openEdit(promo)}>
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => toggleActive(promo.id, !promo.active)}
                  >
                    {promo.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(promo)}>
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
            {promotions.length === 0 && (
              <p className="text-gray-400 text-sm col-span-2 text-center py-8">
                No hay promociones todavía. Crea la primera con "+ Nueva promoción".
              </p>
            )}
          </div>
        )}
      </div>

      {formOpen && (
        <PromotionForm
          promotion={editingPromotion}
          restaurants={restaurants}
          products={products}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar promoción"
        message={`Se eliminará "${deleteTarget?.title}" permanentemente. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
