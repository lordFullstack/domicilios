import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { useRestaurants, useProducts } from '@/hooks/useLocalData'
import { ProductFormModal } from '@/features/restaurant/components/ProductFormModal'
import { ProductImage } from '@/shared/components/ProductImage'
import { Button } from '@/shared/components/Button'
import { Product, ProductCategory } from '@/shared/types'
import { PRODUCT_CATEGORIES } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'

export const AdminProductsPage = () => {
  const { restaurants, loading: loadingRestaurants } = useRestaurants()
  const [restaurantId, setRestaurantId] = useState('')

  // Selecciona el primer restaurante disponible apenas cargan.
  useMemo(() => {
    if (!restaurantId && restaurants.length > 0) setRestaurantId(restaurants[0].id)
  }, [restaurants, restaurantId])

  const { products, loading, createProduct, updateProduct, deleteProduct, toggleAvailability } =
    useProducts(restaurantId || undefined)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const showMessage = (msg: string, error = false) => {
    setMessage(msg)
    setIsError(error)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleSave = async (data: {
    name: string
    description: string
    price: number
    image_url: string
    category: ProductCategory
    available: boolean
  }) => {
    if (!restaurantId) return
    if (editingProduct) {
      await updateProduct(editingProduct.id, data)
      showMessage('Producto actualizado')
    } else {
      await createProduct({ restaurant_id: restaurantId, ...data })
      showMessage('Producto creado')
    }
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = async (productId: string) => {
    const ok = await deleteProduct(productId)
    setDeleteConfirmId(null)
    if (ok) {
      showMessage('Producto eliminado')
    } else {
      showMessage('No se pudo eliminar: este producto ya tiene pedidos asociados. Desactívalo en su lugar.', true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Menú y Productos</h1>
        <p className="text-sm text-gray-500 mb-6">
          Administra el menú de cualquier restaurante de la plataforma.
        </p>

        {message && (
          <div
            className={`mb-4 text-sm font-semibold rounded-2xl p-3 ${
              isError ? 'bg-red-50 text-danger' : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        {loadingRestaurants ? (
          <p className="text-gray-400 text-sm">Cargando restaurantes...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12 border border-gray-100 rounded-2xl bg-white">
            No hay restaurantes registrados todavía.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-secondary bg-white"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-400">
                  <strong className="text-secondary">{products.length}</strong> productos ·{' '}
                  <strong className="text-secondary">{products.filter((p) => p.available).length}</strong> activos
                </p>
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="w-4 h-4" />
                  Nuevo producto
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="text-gray-400 text-sm">Cargando menú...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <p className="text-5xl mb-4">🍽️</p>
                <p className="font-display font-bold mb-1 text-secondary">Este restaurante no tiene productos</p>
                <Button onClick={handleOpenCreate}>Crear primer producto</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {PRODUCT_CATEGORIES.filter((cat) => products.some((p) => p.category === cat)).map((cat) => (
                  <div key={cat}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat}</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {products
                        .filter((p) => p.category === cat)
                        .map((product) => (
                          <div
                            key={product.id}
                            className={`bg-white border border-gray-100 rounded-2xl p-3 flex gap-3 ${
                              !product.available ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                              <ProductImage imageUrl={product.image_url} alt={product.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-0.5">
                                <p className="font-semibold text-sm text-secondary truncate">{product.name}</p>
                                <span className="font-bold text-primary text-sm whitespace-nowrap">
                                  {formatCOP(product.price)}
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
                                    onClick={() => {
                                      setEditingProduct(product)
                                      setIsModalOpen(true)
                                    }}
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
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {restaurantId && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
          onSave={handleSave}
          product={editingProduct}
          restaurantId={restaurantId}
          allowPhotoUpload={false}
        />
      )}
    </div>
  )
}
