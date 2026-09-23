import type { RestaurantCategory } from '@/shared/types'
import type { IconName } from './glyphs'

/** Ícono propio por categoría de restaurante (reemplaza `emoji` e `icon` de lucide). */
export const CATEGORY_ICON: Record<RestaurantCategory, IconName> = {
  Pizza: 'pizza',
  Burgers: 'burger',
  Sushi: 'sushi',
  Postres: 'dessert',
  Bebidas: 'drink',
  Asados: 'grill',
  Mariscos: 'seafood',
}

/** Clases de la gota de cada categoría (tokens `category.*` de tailwind.config.ts). */
export const CATEGORY_DROP_CLASS: Record<RestaurantCategory, string> = {
  Pizza: 'bg-category-pizza-bg text-category-pizza-fg',
  Burgers: 'bg-category-burgers-bg text-category-burgers-fg',
  Sushi: 'bg-category-sushi-bg text-category-sushi-fg',
  Postres: 'bg-category-postres-bg text-category-postres-fg',
  Bebidas: 'bg-category-bebidas-bg text-category-bebidas-fg',
  Asados: 'bg-category-asados-bg text-category-asados-fg',
  Mariscos: 'bg-category-mariscos-bg text-category-mariscos-fg',
}
