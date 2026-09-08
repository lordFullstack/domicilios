import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('<Badge />', () => {
  it('renderiza el texto que recibe', () => {
    render(<Badge>Abierto</Badge>)
    expect(screen.getByText('Abierto')).toBeInTheDocument()
  })

  it('aplica el color correcto según la variante', () => {
    render(<Badge variant="danger">Cerrado</Badge>)
    expect(screen.getByText('Cerrado').className).toContain('text-danger')
  })

  it('usa la variante "default" si no se especifica ninguna', () => {
    render(<Badge>Sin variante</Badge>)
    expect(screen.getByText('Sin variante').className).toContain('bg-gray-100')
  })
})
