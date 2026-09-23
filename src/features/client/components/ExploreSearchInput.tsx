import { X } from 'lucide-react'
import { Icon as BrandIcon } from '@/shared/icons'

interface ExploreSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export const ExploreSearchInput = ({ value, onChange }: ExploreSearchInputProps) => {
  return (
    <div className="px-5 pb-3">
      <div className="relative">
        <BrandIcon name="search" size="sm" className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="¿Qué estás buscando?"
          aria-label="Buscar restaurantes"
          className="focus-ring w-full min-h-[48px] bg-gray-50 rounded-2xl pl-11 pr-11 text-sm placeholder:text-gray-500 focus:bg-white focus:border focus:border-primary transition-colors [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
            className="touch-target focus-ring absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          >
            <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
