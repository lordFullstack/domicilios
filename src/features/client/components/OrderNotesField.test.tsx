import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrderNotesField, MAX_NOTES_LENGTH } from './OrderNotesField'

describe('OrderNotesField', () => {
  it('tiene label visible, tope de 150 y contador en vivo', () => {
    render(<OrderNotesField value="sin cebolla" onChange={() => {}} />)
    const field = screen.getByLabelText(/nota para el restaurante/i)
    expect(field).toHaveAttribute('maxLength', String(MAX_NOTES_LENGTH))
    expect(screen.getByText('11/150')).toBeInTheDocument()
  })

  it('avisa lo que se escribe', () => {
    const onChange = vi.fn()
    render(<OrderNotesField value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/nota para el restaurante/i), { target: { value: 'sin sal' } })
    expect(onChange).toHaveBeenCalledWith('sin sal')
  })

  it('el contador no se anuncia en cada tecla (sin aria-live)', () => {
    render(<OrderNotesField value="abc" onChange={() => {}} />)
    expect(screen.getByText('3/150')).not.toHaveAttribute('aria-live')
  })
})
