import { Restaurant } from '@/shared/types'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'

interface RestaurantsCardListProps {
  restaurants: Restaurant[]
  onEdit: (r: Restaurant) => void
  onToggleApproval: (r: Restaurant) => void
}

export const RestaurantsCardList = ({ restaurants, onEdit, onToggleApproval }: RestaurantsCardListProps) => (
  <div className="grid gap-4">
    {restaurants.map((r) => (
      <Card key={r.id}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-display font-bold text-secondary">{r.name}</p>
            <p className="text-xs text-gray-500">{r.category} · {r.address}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                r.status === 'open' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {r.status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                r.approved ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
              }`}
            >
              {r.approved ? 'Aprobado' : 'Suspendido'}
            </span>
          </div>
        </div>

        {r.description && <p className="text-sm text-gray-500 mb-3">{r.description}</p>}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" fullWidth onClick={() => onEdit(r)}>
            Editar
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={() => onToggleApproval(r)}>
            {r.approved ? 'Suspender' : 'Aprobar'}
          </Button>
        </div>
      </Card>
    ))}
  </div>
)
