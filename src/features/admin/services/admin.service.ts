/**
 * Admin service — todas las consultas a Supabase para el bloque de Admin.
 *
 * Sigue el mismo patrón que src/hooks/useLocalData.ts: funciones planas que
 * llaman a `supabase` directamente. Se separan aquí (en vez de meterlas en
 * ese archivo de 800+ líneas) porque son consultas exclusivas del rol admin
 * y así el archivo no crece más de la cuenta.
 */

import { supabase } from '@/shared/utils/supabase'
import { User, Restaurant, Order, Promotion, Product } from '@/shared/types'

// ============================================
// USUARIOS
// ============================================

export const fetchAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as User[]
}

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

export const setUserActive = async (userId: string, active: boolean) => {
  const { error } = await supabase.from('profiles').update({ active }).eq('id', userId)
  if (error) throw error
}

// Llama a la Edge Function admin-reset-password (necesita la service role key,
// por eso no se puede hacer directo desde el navegador).
export const resetUserPassword = async (targetUserId: string, newPassword: string) => {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  const { data, error } = await supabase.functions.invoke('admin-reset-password', {
    body: { target_user_id: targetUserId, new_password: newPassword },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

// ============================================
// RESTAURANTES
// ============================================

export const fetchAllRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Restaurant[]
}

export const updateRestaurantAdmin = async (id: string, updates: Partial<Restaurant>) => {
  const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
  if (error) throw error
}

export const setRestaurantApproved = async (id: string, approved: boolean) => {
  const { error } = await supabase.from('restaurants').update({ approved }).eq('id', id)
  if (error) throw error
}

// Usado por el formulario de Promociones para elegir un producto a destacar.
export const fetchAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error
  return data as Product[]
}

// ============================================
// ÓRDENES (solo lectura para Admin)
// ============================================

export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return data as Order[]
}

// ============================================
// PROMOCIONES
// ============================================

export const fetchAllPromotions = async (): Promise<Promotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Promotion[]
}

export type PromotionInput = Omit<Promotion, 'id' | 'created_at' | 'updated_at'>

export const createPromotion = async (input: PromotionInput): Promise<Promotion> => {
  const { data, error } = await supabase.from('promotions').insert(input).select().single()
  if (error) throw error
  return data as Promotion
}

export const updatePromotion = async (id: string, updates: Partial<PromotionInput>) => {
  const { error } = await supabase
    .from('promotions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export const deletePromotion = async (id: string) => {
  const { error } = await supabase.from('promotions').delete().eq('id', id)
  if (error) throw error
}

export const uploadPromotionImage = async (file: File, promotionId: string): Promise<string> => {
  const ext = file.name.split('.').pop()
  const path = `${promotionId}/banner.${ext}`
  const { error } = await supabase.storage
    .from('promotion-images')
    .upload(path, file, { upsert: true })

  if (error) throw error
  const { data } = supabase.storage.from('promotion-images').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

// Público: lo consume el cliente para pintar banners y destacados.
// Se reusa aquí para que exista un solo lugar con la forma de la tabla.
export const fetchActivePromotionsByType = async (type: Promotion['type']): Promise<Promotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('type', type)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Promotion[]
}
