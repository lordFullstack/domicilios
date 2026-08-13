import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRestaurants, useProducts } from '@/hooks/useLocalData'
import { Button } from '@/shared/components/Button'
import { BottomNav } from '@/shared/components/BottomNav'
import { ProductFormModal } from '../components/ProductFormModal'
import { ROUTES } from '@/config/constants'
import { Product } from '@/shared/types'

export const MenuManagementPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()

  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id) || restaurants[0]
  const { products, createProduct, updateProduct, deleteProduct, toggleAvailability } =
    useProducts(myRestaurant?.id)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSave = async (data: {
    name: string
    description: string
    price: number
    image_url: string
    available: boolean
  }) => {
    if (!myRestaurant) return

    if (editingProduct) {
      await updateProduct(editingProduct.id, data)
      showSuccess('Producto actualizado')
    } else {
      await createProduct({
        restaurant_id: myRestaurant.id,
        ...data,
      })
      showSuccess('Producto creado')
    }

    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = async (productId: string) => {
    deleteProduct(productId)
    setDeleteConfirmId(null)
    showSuccess('Producto eliminado')
  }

  if (!myRestaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8">
        <p className="text-gray-400 text-sm text-center">No tienes un restaurante asignado todavía.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.RESTAURANT_DASHBOARD)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-secondary">Menú</h1>
          <p className="text-xs text-gray-400">{myRestaurant.name}</p>
        </div>
      </div>

      <div className="px-5">
        {successMessage && (
          <div className="mb-4 bg-green-50 text-green-700 text-sm font-semibold rounded-2xl p-3">
            {successMessage}
          </div>
        )}

        {/* Stats + botón nuevo */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">
            <strong className="text-secondary">{products.length}</strong> productos ·{' '}
            <strong className="text-secondary">{products.filter((p) => p.available).length}</strong> activos
          </p>
          <button
            onClick={handleOpenCreate}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Lista de productos */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="font-display font-bold mb-1 text-secondary">Tu menú está vacío</p>
            <p className="text-sm text-gray-400 mb-6">Agrega tu primer producto para empezar a vender</p>
            <Button variant="primary" onClick={handleOpenCreate}>
              Crear primer producto
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border border-gray-100 rounded-2xl p-3 ${
                  !product.available ? 'opacity-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {product.image_url}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
                      <span className="font-bold text-primary text-sm whitespace-nowrap">
                        ${product.price.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mb-2">
                      {product.description || 'Sin descripción'}
                    </p>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleAvailability(product.id)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          product.available ? 'bg-success' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            product.available ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center"
                        >
                          <Pencil className="w-3 h-3 text-gray-500" />
                        </button>
                        {deleteConfirmId === product.id ? (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-xs font-semibold text-white bg-danger px-2 rounded-full"
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSave}
        product={editingProduct}
      />

      <BottomNav role="restaurant" />
    </div>
  )
}
