import { Skeleton } from '@/shared/components/Skeleton'

export const RestaurantDetailSkeleton = () => (
  <div aria-hidden="true">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="px-5 pt-4">
      <Skeleton className="h-6 w-2/3 rounded mb-2" />
      <Skeleton className="h-3 w-1/2 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
)
