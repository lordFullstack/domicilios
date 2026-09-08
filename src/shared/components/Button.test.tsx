import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('<Button />', () => {
  it('renderiza el texto y responde al click', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Confirmar pedido</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('con loading=true, el botón queda deshabilitado (protección contra doble-tap)', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} loading>
        Guardar
      </Button>
    )

    const button = screen.getByRole('button', { name: /Guardar/ })
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('con disabled=true explícito, tampoco dispara el click', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        No disponible
      </Button>
    )

    await userEvent.click(screen.getByRole('button', { name: 'No disponible' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
