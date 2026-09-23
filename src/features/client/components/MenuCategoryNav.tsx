import { useEffect, useRef } from 'react'
import { Soup, UtensilsCrossed, CupSoda, Cake, PlusCircle } from 'lucide-react'

// Un ícono por cada valor de PRODUCT_CATEGORIES (config/constants.ts).
// Si se agrega una categoría nueva ahí, hay que sumarle su ícono acá.
const CATEGORY_ICONS: Record<string, typeof Soup> = {
  Entradas: Soup,
  Platos: UtensilsCrossed,
  Bebidas: CupSoda,
  Postres: Cake,
  Adicionales: PlusCircle,
}

export interface MenuCategory {
  id: string // id del <section> destino
  label: string
}

interface MenuCategoryNavProps {
  categories: MenuCategory[]
  activeId: string | null
  onSelect: (id: string) => void
}

/**
 * Navegación del menú (NO filtro): todas las categorías están en la misma
 * lista y el chip lleva a su sección. Por eso <nav> + aria-current y no
 * role="tablist": no hay paneles que se oculten.
 * Sticky justo debajo del header compacto (3.5rem + safe-area).
 */
export const MenuCategoryNav = ({ categories, activeId, onSelect }: MenuCategoryNavProps) => {
  const rowRef = useRef<HTMLDivElement>(null)

  // Mantiene el chip activo a la vista dentro de la fila (scroll horizontal
  // del contenedor, sin mover la página).
  useEffect(() => {
    const row = rowRef.current
    const chip = row?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!row || !chip) return
    const left = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2
    row.scrollTo?.({ left, behavior: 'auto' })
  }, [activeId])

  if (categories.length < 2) return null

  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-5 mb-4 bg-white/95 px-5 py-2 backdrop-blur"
    >
      <div ref={rowRef} className="no-scrollbar flex gap-2 overflow-x-auto">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.label] ?? UtensilsCrossed
          const active = cat.id === activeId
          return (
            <button
              key={cat.id}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelect(cat.id)}
              className={`focus-ring flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors duration-150 motion-reduce:transition-none ${
                active ? 'bg-brand-gradient text-white' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {cat.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
