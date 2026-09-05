import { RESTAURANT_CATEGORIES } from '@/config/constants'

export type ApprovalFilter = 'all' | 'approved' | 'suspended'
export type StatusFilter = 'all' | 'open' | 'closed'

interface RestaurantFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  status: StatusFilter
  onStatusChange: (v: StatusFilter) => void
  approval: ApprovalFilter
  onApprovalChange: (v: ApprovalFilter) => void
}

export const RestaurantFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  approval,
  onApprovalChange,
}: RestaurantFiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <input
      type="search"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Buscar por nombre..."
      aria-label="Buscar restaurantes"
      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    />

    <select
      value={category}
      onChange={(e) => onCategoryChange(e.target.value)}
      aria-label="Filtrar por categoría"
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-secondary bg-white"
    >
      <option value="all">Todas las categorías</option>
      {RESTAURANT_CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.emoji} {c.label}
        </option>
      ))}
    </select>

    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
      aria-label="Filtrar por estado"
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-secondary bg-white"
    >
      <option value="all">Abierto y cerrado</option>
      <option value="open">🟢 Abierto</option>
      <option value="closed">🔴 Cerrado</option>
    </select>

    <select
      value={approval}
      onChange={(e) => onApprovalChange(e.target.value as ApprovalFilter)}
      aria-label="Filtrar por aprobación"
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-secondary bg-white"
    >
      <option value="all">Aprobado y suspendido</option>
      <option value="approved">Aprobado</option>
      <option value="suspended">Suspendido</option>
    </select>
  </div>
)
