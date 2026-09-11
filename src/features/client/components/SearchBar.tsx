import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

/**
 * La búsqueda real (con filtros) vive en RestaurantListPage
 * (ExploreSearchInput + filterAndSortRestaurants). Este botón con apariencia
 * de input es el punto de entrada desde el Home: lleva directo a esa
 * pantalla, donde el usuario ya puede escribir su búsqueda.
 */
export const SearchBar = () => {
  const navigate = useNavigate()

  return (
    <div className="px-5 pb-4">
      <button
        onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
        className="touch-target focus-ring w-full flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5 text-left active:scale-[0.98] transition-transform"
      >
        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm text-gray-500">Buscar restaurantes, platos...</span>
      </button>
    </div>
  )
}
