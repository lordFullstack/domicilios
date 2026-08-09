import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRestaurants, useProducts } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
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

  const handleSave = (data: {
    name: string
    description: string
    price: number
    image_url: string
    available: boolean
  }) => {
    if (!myRestaurant) return

    if (editingProduct) {
      updateProduct(editingProduct.id, data)
      showSuccess('✅ Producto actualizado')
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        restaurant_id: myRestaurant.id,
        ...data,
        created_at: new Date().toISOString(),
      }
      createProduct(newProduct)
      showSuccess('✅ Producto creado')
    }

    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = (productId: string) => {
    deleteProduct(productId)
    setDeleteConfirmId(null)
    showSuccess('🗑️ Producto eliminado')
  }

  if (!myRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-gray-600">No tienes un restaurante asignado todavía.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(ROUTES.RESTAURANT_DASHBOARD)}
            className="mb-4 hover:opacity-80"
          >
            ← Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">
            📋 Menú de {myRestaurant.name}
          </h1>
          <p className="text-lg">Gestiona tus productos y categorías</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mensaje de éxito */}
        {successMessage && (
          <Card className="mb-6 bg-success/10 border border-success/20">
            <p className="text-success font-semibold">{successMessage}</p>
          </Card>
        )}

        {/* Acciones y estadísticas */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              📦 <strong>{products.length}</strong> productos totales
            </span>
            <span>
              ✅ <strong>{products.filter((p) => p.available).length}</strong> disponibles
            </span>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            ➕ Nuevo Producto
          </Button>
        </div>

        {/* Lista de productos */}
        {products.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🍽️</p>
              <h2 className="text-xl font-bold mb-2">Tu menú está vacío</h2>
              <p className="text-gray-600 mb-6">Agrega tu primer producto para empezar a vender</p>
              <Button variant="primary" onClick={handleOpenCreate}>
                ➕ Crear primer producto
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className={!product.available ? 'opacity-60' : ''}>
                <div className="flex gap-4">
                  <div className="text-4xl">{product.image_url}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold truncate">{product.name}</h3>
                      <span className="font-bold text-primary whitespace-nowrap">
                        ${product.price.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description || 'Sin descripción'}
                    </p>

                    {/* Toggle disponibilidad */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => toggleAvailability(product.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          product.available ? 'bg-success' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            product.available ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-600">
                        {product.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        fullWidth
                        onClick={() => handleOpenEdit(product)}
                      >
                        ✏️ Editar
                      </Button>
                      {deleteConfirmId === product.id ? (
                        <Button
                          size="sm"
                          variant="primary"
                          fullWidth
                          onClick={() => handleDelete(product.id)}
                          className="!bg-danger"
                        >
                          Confirmar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          fullWidth
                          onClick={() => setDeleteConfirmId(product.id)}
                        >
                          🗑️ Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSave}
        product={editingProduct}
      />
    </div>
  )
}
