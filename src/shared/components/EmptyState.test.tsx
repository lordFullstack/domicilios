import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { EmptyState } from './EmptyState'

describe('<EmptyState />', () => {
  it('renderiza el título siempre', () => {
    render(<EmptyState icon={Search} title="No encontramos restaurantes" />)
    expect(screen.getByText('No encontramos restaurantes')).toBeInTheDocument()
  })

  it('la descripción es opcional — no rompe si no se pasa', () => {
    render(<EmptyState icon={Search} title="Vacío" />)
    expect(screen.getByText('Vacío')).toBeInTheDocument()
  })

  it('renderiza la descripción cuando se pasa', () => {
    render(<EmptyState icon={Search} title="Vacío" description="Prueba otra búsqueda" />)
    expect(screen.getByText('Prueba otra búsqueda')).toBeInTheDocument()
  })

  it('renderiza la acción (botón) cuando se pasa', () => {
    render(
      <EmptyState icon={Search} title="Vacío" action={<button>Reintentar</button>} />
    )
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('no renderiza ninguna acción si no se pasa (no hay botón fantasma)', () => {
    render(<EmptyState icon={Search} title="Vacío" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
