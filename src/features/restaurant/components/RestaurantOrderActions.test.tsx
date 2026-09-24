import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RestaurantOrderActions } from './RestaurantOrderActions'
import type { Order } from '@/shared/types'

const order = (status: string, delivery_person_id?: string) => ({ id: 'o1', status, delivery_person_id }) as unknown as Order

const setup = (o: Order, extra: Partial<React.ComponentProps<typeof RestaurantOrderActions>> = {}) => {
  const onAdvance = vi.fn()
  const onCancel = vi.fn()
  render(<RestaurantOrderActions order={o} busy={false} disabled={false} onAdvance={onAdvance} onCancel={onCancel} {...extra} />)
  return { onAdvance, onCancel }
}

describe('<RestaurantOrderActions /> (LOOP_SECURITY_01)', () => {
  it('pedido pendiente: una acción primaria (Confirmar) y Cancelar', () => {
    const { onAdvance } = setup(order('pending'))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onAdvance).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('cancelar exige confirmación: no cancela con un solo toque', () => {
    const { onCancel } = setup(order('preparing'))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Cancelar este pedido?')
    fireEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('"Volver" cierra la confirmación sin cancelar', () => {
    const { onCancel } = setup(order('confirmed'))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Preparar' })).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('el restaurante puede cancelar hasta "lista"', () => {
    setup(order('ready'))
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('en camino: no hay cancelar ni acción', () => {
    setup(order('in_delivery', 'd1'))
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('lista sin domiciliario: se puede "Enviar" (el servidor asigna)', () => {
    const { onAdvance } = setup(order('ready'))
    expect(screen.getByText('Lista — falta asignar domiciliario')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('lista con domiciliario asignado: espera a que acepte, sin "Enviar"', () => {
    setup(order('ready', 'd1'))
    expect(screen.getByText(/esperando que acepte/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enviar' })).not.toBeInTheDocument()
  })

  it('mientras una acción está en curso muestra "Actualizando..." y bloquea los botones', () => {
    setup(order('pending'), { busy: true, disabled: true })
    expect(screen.getByRole('button', { name: /Actualizando/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})
