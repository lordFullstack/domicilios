import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Clock, Heart } from 'lucide-react'
import { useRestaurants } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { BottomNav } from '@/shared/components/BottomNav'
import { ROUTES } from '@/config/constants'

const CATEGORIES = [
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Burgers', emoji: '🍔' },
  { label: 'Sushi', emoji: '🍣' },
  { label: 'Postres', emoji: '🍰' },
  { label: 'Bebidas', emoji: '🥤' },
]

export const ClientDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      {/* Top bar */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
          <MapPin className="w-3 h-3 text-primary" />
          Riohacha, La Guajira
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-secondary">
            Hola, {user?.name?.split(' ')[0] || 'bienvenido'} 👋
          </h1>
          <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-3 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button key={c.label} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
              {c.emoji}
            </div>
            <span className="text-xs text-gray-500">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Banner promo */}
      <div className="mx-5 mb-6 rounded-2xl p-4 flex items-center justify-between bg-orange-50">
        <div>
          <p className="font-display font-bold text-sm text-primary">Envío gratis hoy</p>
          <p className="text-xs text-gray-500">En pedidos mayores a $40.000</p>
        </div>
        <span className="text-3xl">🎉</span>
      </div>

      {/* Lista de restaurantes */}
      <div className="px-5">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">
          Restaurantes cerca de ti
        </h2>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Cargando restaurantes...</p>
        ) : restaurants.length > 0 ? (
          <div className="flex flex-col gap-4">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id))}
                className="text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-95 transition-transform"
              >
                <div className="h-28 flex items-center justify-center text-5xl bg-orange-50">
                  {restaurant.image_url}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display font-bold text-sm text-secondary truncate">
                      {restaurant.name}
                    </p>
                    <Heart className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      4.8
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      25-35 min
                    </span>
                    <span className={restaurant.status === 'open' ? 'text-green-600' : 'text-red-500'}>
                      {restaurant.status === 'open' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No hay restaurantes disponibles</p>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
