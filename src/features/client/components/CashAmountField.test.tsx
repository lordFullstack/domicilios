import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CashAmountField, parseCashInput, cashAmountError } from './CashAmountField'

describe('parseCashInput / cashAmountError', () => {
  it('extrae solo dígitos y vacío = sin especificar', () => {
    expect(parseCashInput('50.000')).toBe(50000)
    expect(parseCashInput('$ 20000')).toBe(20000)
    expect(parseCashInput('')).toBeNull()
    expect(parseCashInput('abc')).toBeNull()
  })

  it('valida contra el total y el tope', () => {
    expect(cashAmountError(null, 30000)).toBeNull()
    expect(cashAmountError(30000, 30000)).toBeNull()
    expect(cashAmountError(29999, 30000)).toMatch(/al menos/)
    expect(cashAmountError(10_000_001, 30000)).toMatch(/máximo/)
  })
})

describe('CashAmountField', () => {
  it('vacío: no marca error y explica para qué sirve', () => {
    render(<CashAmountField total={30000} value="" onChange={() => {}} />)
    expect(screen.getByLabelText(/con cuánto pagas/i)).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByText(/cambio listo/i)).toBeInTheDocument()
  })

  it('muestra el cambio estimado en vivo', () => {
    render(<CashAmountField total={30000} value="50000" onChange={() => {}} />)
    expect(screen.getByText(/te devolverán \$20\.000/i)).toBeInTheDocument()
  })

  it('pago exacto: sin cambio', () => {
    render(<CashAmountField total={30000} value="30000" onChange={() => {}} />)
    expect(screen.getByText(/pago exacto/i)).toBeInTheDocument()
  })

  it('menor al total: error asociado al campo', () => {
    render(<CashAmountField total={30000} value="20000" onChange={() => {}} />)
    const input = screen.getByLabelText(/con cuánto pagas/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'cash-amount-help')
    expect(screen.getByText(/debe ser al menos \$30\.000/i)).toBeInTheDocument()
  })

  it('avisa el texto escrito', () => {
    const onChange = vi.fn()
    render(<CashAmountField total={30000} value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/con cuánto pagas/i), { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith('5')
  })
})
