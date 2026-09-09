import { Skeleton } from '@/shared/components/Skeleton'

interface AdminListSkeletonProps {
  rows?: number
}

/**
 * Skeleton genérico para las listas de Admin (fila con círculo + 2 líneas
 * de texto + bloque a la derecha). Antes cada página de Admin mostraba
 * simplemente el texto "Cargando..." mientras el resto de la app (cliente)
 * ya usaba skeletons reales — esto empareja esa experiencia reutilizando
 * el mismo <Skeleton /> base del design system, sin inventar uno nuevo.
 */
export const AdminListSkeleton = ({ rows = 4 }: AdminListSkeletonProps) => (
  <div className="flex flex-col gap-3" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-3.5 w-1/3 rounded mb-2" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
)
