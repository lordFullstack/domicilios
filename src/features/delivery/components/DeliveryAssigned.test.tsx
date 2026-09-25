import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Order } from '@/shared/types'

vi.mock('@/hooks/useLocalData', () => ({
  useRestaurantById: () => ({ restaurant: { name: 'Asados Riohacha', address: 'Calle 10 # 5-20' } }),
}))
vi.mock('@/hooks/useCountdown', () => ({
  useCountdown: () => ({ secondsLeft: 90, expired: false, label: '1:30' }),
}))
vi.mock('@/shared/components/OrderItemsList', () => ({ OrderItemsList: () => null }))

import { DeliveryOrderCard } from './DeliveryOrderCard'
import { DeliveryOrderDetailSheet } from './DeliveryOrderDetailSheet'

const order = {
  id: 'o1', total: 41000, delivery_fee: 5000, payment_method: 'cash_on_delivery',
  delivery_address: 'Carrera 7 # 12-34', special_instructions: 'Casa azul', restaurant_id: 'r1',
} as unknown as Order

describe('pedido asignado sin aceptar (LOOP_SECURITY_01)', () => {
  it('la tarjeta no muestra la dirección del cliente antes de aceptar', () => {
    render(<DeliveryOrderCard order={order} onOpenDetail={() => {}} pendingAcceptance />)
    expect(screen.queryByText(/Carrera 7/)).not.toBeInTheDocument()
    expect(screen.getByText(/ábrelo para aceptar o rechazar/)).toBeInTheDocument()
    expect(screen.getByText('Cobrar')).toBeInTheDocument()
  })

  it('la tarjeta de una entrega activa sí muestra la dirección', () => {
    render(<DeliveryOrderCard order={order} onOpenDetail={() => {}} />)
    expect(screen.getByText(/Carrera 7 # 12-34/)).toBeInTheDocument()
  })

  it('el detalle oculta dirección y referencia antes de aceptar y ofrece Aceptar / Rechazar', () => {
    const onAction = vi.fn()
    const onSecondaryAction = vi.fn()
    render(
      <DeliveryOrderDetailSheet
        order={order} open onClose={() => {}} actionLabel="Aceptar entrega" actionLoading={false}
        actionDisabled={false} onAction={onAction} hideCustomerAddress
        secondaryActionLabel="Rechazar pedido" onSecondaryAction={onSecondaryAction}
      />
    )
    expect(screen.queryByText('Carrera 7 # 12-34')).not.toBeInTheDocument()
    expect(screen.queryByText(/Casa azul/)).not.toBeInTheDocument()
    expect(screen.getByText('La dirección aparece cuando aceptas el pedido.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar entrega' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar pedido' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onSecondaryAction).toHaveBeenCalledTimes(1)
  })

  it('el detalle de la entrega activa muestra la dirección y no ofrece rechazar', () => {
    render(
      <DeliveryOrderDetailSheet
        order={order} open onClose={() => {}} actionLabel="Marcar como entregada" actionLoading={false}
        actionDisabled={false} onAction={() => {}}
      />
    )
    expect(screen.getByText('Carrera 7 # 12-34')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rechazar pedido' })).not.toBeInTheDocument()
  })
})
