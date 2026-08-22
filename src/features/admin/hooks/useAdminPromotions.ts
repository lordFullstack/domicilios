import { useState, useEffect, useCallback } from 'react'
import { Promotion, Product } from '@/shared/types'
import {
  fetchAllPromotions,
  fetchAllProducts,
  createPromotion as createPromotionRequest,
  updatePromotion,
  deletePromotion,
  uploadPromotionImage,
  PromotionInput,
} from '../services/admin.service'

export const useAdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [promoData, productData] = await Promise.all([fetchAllPromotions(), fetchAllProducts()])
      setPromotions(promoData)
      setProducts(productData)
    } catch (err) {
      console.error('Error cargando promociones:', err)
      setError('No se pudieron cargar las promociones.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const addPromotion = async (input: PromotionInput, imageFile?: File | null) => {
    // Se crea primero sin imagen para tener un id, y si hay archivo se sube
    // y se actualiza con la URL — el path del bucket usa el id de la promo.
    const created = await createPromotionRequest(input)

    if (imageFile) {
      const url = await uploadPromotionImage(imageFile, created.id)
      await updatePromotion(created.id, { image_url: url })
    }
    await reload()
  }

  const editPromotion = async (id: string, updates: Partial<PromotionInput>, imageFile?: File | null) => {
    if (imageFile) {
      const url = await uploadPromotionImage(imageFile, id)
      updates = { ...updates, image_url: url }
    }
    await updatePromotion(id, updates)
    await reload()
  }

  const removePromotion = async (id: string) => {
    await deletePromotion(id)
    await reload()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await updatePromotion(id, { active })
    await reload()
  }

  return {
    promotions,
    products,
    loading,
    error,
    reload,
    addPromotion,
    editPromotion,
    removePromotion,
    toggleActive,
  }
}
