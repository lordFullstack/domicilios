import { Skeleton } from '@/shared/components/Skeleton'

/** Filas con la geometría real de MenuProductCard (p-3 + imagen de 96px). */
export const MenuListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div role="status" aria-label="Cargando menú" className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} aria-hidden="true" className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
        <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-3/4 rounded" />
          <Skeleton className="mb-1 h-3 w-full rounded" />
          <Skeleton className="mb-3 h-3 w-2/3 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </div>
      </div>
    ))}
  </div>
)

/** Hero (h-52, igual que el real) + chips + filas del menú. */
export const RestaurantDetailSkeleton = () => (
  <div className="min-h-screen bg-white max-w-md mx-auto" role="status" aria-label="Cargando restaurante">
    <div aria-hidden="true">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="px-5 pt-4">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-11 w-24 rounded-full" />
          <Skeleton className="h-11 w-24 rounded-full" />
          <Skeleton className="h-11 w-24 rounded-full" />
        </div>
        <MenuListSkeleton />
      </div>
    </div>
  </div>
)
