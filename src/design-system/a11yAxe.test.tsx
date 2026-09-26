import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { a11yViolations } from '@/test/axe'

// Vigilante de accesibilidad (axe-core) sobre los componentes que usan clientes, restaurantes y
// domiciliarios. Si alguien agrega un botón sin nombre, un campo sin etiqueta o un rol mal usado en
// estos componentes, este test falla. Los componentes nuevos de uso real deben sumarse aquí.

vi.mock('@/hooks/useCountdown', () => ({
  useCountdown: () => ({ secondsLeft: 45, expired: false, label: '0:45' }),
}))
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ logout: vi.fn(), user: { id: 'u1', name: 'Ana' } }) }))
vi.mock('@/shared/utils/supabase', () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }))

import { CheckoutError } from '@/features/client/components/CheckoutError'
import { CashAmountField } from '@/features/client/components/CashAmountField'
import { OrderNotesField } from '@/features/client/components/OrderNotesField'
import { PaymentMethodSelector } from '@/features/client/components/PaymentMethodSelector'
import { OrderPaymentInfo } from '@/shared/components/OrderPaymentInfo'
import { SupportLink } from '@/shared/components/SupportLink'
import { CashClosingCard } from '@/shared/components/CashClosingCard'
import { DeadlineCountdown } from '@/shared/components/DeadlineCountdown'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { ErrorState } from '@/shared/components/ErrorState'
import { RestaurantOrderActions } from '@/features/restaurant/components/RestaurantOrderActions'
import { AccountInactiveScreen } from '@/features/auth/components/AccountInactiveScreen'
import type { Order } from '@/shared/types'

const noop = () => {}
const order = (extra: Partial<Order> = {}): Order =>
  ({
    id: 'o1', user_id: 'u', restaurant_id: 'r', total: 30000, delivery_fee: 5000, status: 'pending',
    payment_method: 'cash_on_delivery', payment_status: 'pending', delivery_address: 'Calle 15 #10-20',
    cash_amount: 50000, notes_to_restaurant: 'sin cebolla', created_at: '2026-09-25T15:00:00Z',
    updated_at: '2026-09-25T17:00:00Z', ...extra,
  }) as Order

const CASES: [string, () => ReactElement][] = [
  ['CheckoutError · sesión', () => <CheckoutError kind="session" onRetry={noop} onReview={noop} onNavigate={noop} />],
  ['CheckoutError · red', () => <CheckoutError kind="network" onRetry={noop} onReview={noop} onNavigate={noop} />],
  ['CheckoutError · validación', () => <CheckoutError kind="validation" onRetry={noop} onReview={noop} onNavigate={noop} />],
  ['CheckoutError · cerrado', () => <CheckoutError kind="closed" onRetry={noop} onReview={noop} onNavigate={noop} />],
  ['CheckoutError · carrito', () => <CheckoutError kind="cart" onRetry={noop} onReview={noop} onNavigate={noop} />],
  ['CashAmountField · vacío', () => <CashAmountField total={30000} value="" onChange={noop} />],
  ['CashAmountField · con error', () => <CashAmountField total={30000} value="10000" onChange={noop} />],
  ['OrderNotesField', () => <OrderNotesField value="sin cebolla" onChange={noop} />],
  ['PaymentMethodSelector', () => <PaymentMethodSelector value="cash_on_delivery" onChange={noop} />],
  ['OrderPaymentInfo · domiciliario', () => <OrderPaymentInfo order={order()} audience="delivery" />],
  ['OrderPaymentInfo · restaurante', () => <OrderPaymentInfo order={order()} audience="restaurant" />],
  ['SupportLink', () => <SupportLink />],
  ['CashClosingCard · domiciliario', () => <CashClosingCard orders={[order({ status: 'delivered' })]} day="2026-09-25" baseStorageKey="k" />],
  ['CashClosingCard · admin', () => <CashClosingCard orders={[]} day="2026-09-25" />],
  ['DeadlineCountdown', () => <DeadlineCountdown deadline="2026-09-25T17:00:45Z" prefix="Responde en" />],
  ['BottomSheet', () => <BottomSheet open onClose={noop} title="Detalle del pedido"><p>Contenido</p></BottomSheet>],
  ['ErrorState', () => <ErrorState title="Algo salió mal" description="Intenta de nuevo" onRetry={noop} />],
  ['RestaurantOrderActions · pendiente', () => <RestaurantOrderActions order={order()} busy={false} disabled={false} onAdvance={noop} onCancel={noop} />],
  ['RestaurantOrderActions · lista sin domiciliario', () => <RestaurantOrderActions order={order({ status: 'ready' })} busy={false} disabled={false} onAdvance={noop} onCancel={noop} />],
  ['AccountInactiveScreen', () => <AccountInactiveScreen />],
]

describe('axe: sin violaciones de accesibilidad en los componentes del piloto', () => {
  it.each(CASES)('%s', async (_name, build) => {
    const { baseElement } = render(build())
    expect(await a11yViolations(baseElement)).toEqual([])
  })
})

describe('el vigilante detecta problemas reales (si esto falla, axe dejó de vigilar)', () => {
  it('botón solo-icono sin nombre', async () => {
    const { baseElement } = render(<button type="button"><svg aria-hidden="true" width="8" height="8" /></button>)
    expect((await a11yViolations(baseElement)).join(' ')).toMatch(/button-name/)
  })

  it('campo sin etiqueta', async () => {
    const { baseElement } = render(<input type="text" />)
    expect((await a11yViolations(baseElement)).join(' ')).toMatch(/label/)
  })

  it('imagen sin alt', async () => {
    const { baseElement } = render(<img src="/x.png" />)
    expect((await a11yViolations(baseElement)).join(' ')).toMatch(/image-alt/)
  })
})
