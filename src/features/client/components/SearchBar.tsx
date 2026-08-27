import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

/**
 * Todavía no existe un mecanismo de búsqueda/filtrado real en el proyecto
 * (RestaurantListPage tampoco lo tiene). Para no inventar una segunda
 * arquitectura de búsqueda a medias, esto es un botón con apariencia de
 * input que lleva al listado completo — el lugar natural donde, cuando se
 * construya la búsqueda real, debería vivir el filtrado.
 */
export const SearchBar = () => {
  const navigate = useNavigate()

  return (
    <div className="px-5 pb-4">
      <button
        onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
        className="touch-target focus-ring w-full flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5 text-left active:scale-[0.98] transition-transform"
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-400">Buscar restaurantes, platos...</span>
      </button>
    </div>
  )
}
