import { Restaurant } from '@/shared/types'

interface RestaurantsTableProps {
  restaurants: Restaurant[]
  onEdit: (r: Restaurant) => void
  onToggleApproval: (r: Restaurant) => void
}

export const RestaurantsTable = ({ restaurants, onEdit, onToggleApproval }: RestaurantsTableProps) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-gray-400 border-b border-gray-100">
        <th className="font-medium py-3 px-2">Restaurante</th>
        <th className="font-medium py-3 px-2">Categoría</th>
        <th className="font-medium py-3 px-2">Estado</th>
        <th className="font-medium py-3 px-2">Plataforma</th>
        <th className="font-medium py-3 px-2 text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {restaurants.map((r) => (
        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
          <td className="py-3 px-2">
            <p className="font-semibold text-secondary">{r.name}</p>
            <p className="text-xs text-gray-400">{r.address}</p>
          </td>
          <td className="py-3 px-2 text-gray-500">{r.category}</td>
          <td className="py-3 px-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                r.status === 'open' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {r.status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
            </span>
          </td>
          <td className="py-3 px-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                r.approved ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
              }`}
            >
              {r.approved ? 'Aprobado' : 'Suspendido'}
            </span>
          </td>
          <td className="py-3 px-2">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onEdit(r)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => onToggleApproval(r)}
                className="text-xs font-semibold text-gray-500 hover:underline"
              >
                {r.approved ? 'Suspender' : 'Aprobar'}
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)
