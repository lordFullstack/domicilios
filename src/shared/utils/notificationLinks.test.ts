import { describe, it, expect } from 'vitest'
import { getNotificationIcon, getNotificationTarget } from './notificationLinks'
import { USER_ROLES, ROUTES } from '@/config/constants'
import { Bike, RefreshCw, ShoppingBag, Bell } from 'lucide-react'

describe('getNotificationIcon', () => {
  it('usa el ícono de bolsa para "Nuevo pedido"', () => {
    expect(getNotificationIcon('Nuevo pedido recibido')).toBe(ShoppingBag)
  })

  it('usa el ícono de moto para "Entrega asignada"', () => {
    expect(getNotificationIcon('Entrega asignada')).toBe(Bike)
  })

  it('usa el ícono de refresh para "Actualización"', () => {
    expect(getNotificationIcon('Actualización de tu pedido')).toBe(RefreshCw)
  })

  it('usa la campana genérica si el título no coincide con ningún patrón conocido', () => {
    expect(getNotificationIcon('Mensaje sin categoría')).toBe(Bell)
  })
})

describe('getNotificationTarget', () => {
  it('sin orderId, no hay a dónde navegar', () => {
    expect(getNotificationTarget(USER_ROLES.CLIENT, null)).toBeNull()
    expect(getNotificationTarget(USER_ROLES.CLIENT, undefined)).toBeNull()
  })

  it('cliente va al detalle de SU pedido específico', () => {
    expect(getNotificationTarget(USER_ROLES.CLIENT, 'abc-123')).toBe(
      ROUTES.CLIENT_ORDER.replace(':id', 'abc-123')
    )
  })

  it('restaurante va al listado de órdenes (no existe detalle dedicado)', () => {
    expect(getNotificationTarget(USER_ROLES.RESTAURANT, 'abc-123')).toBe(ROUTES.RESTAURANT_ORDERS)
  })

  it('domiciliario va a su dashboard', () => {
    expect(getNotificationTarget(USER_ROLES.DELIVERY, 'abc-123')).toBe(ROUTES.DELIVERY_DASHBOARD)
  })

  it('admin va al listado de pedidos', () => {
    expect(getNotificationTarget(USER_ROLES.ADMIN, 'abc-123')).toBe(ROUTES.ADMIN_ORDERS)
  })

  it('un rol desconocido no rompe, devuelve null', () => {
    expect(getNotificationTarget('rol-inventado', 'abc-123')).toBeNull()
  })
})
