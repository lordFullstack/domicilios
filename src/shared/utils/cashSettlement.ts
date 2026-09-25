import { ORDER_STATUS, PAYMENT_METHOD } from '@/config/constants'
import type { Order } from '@/shared/types'

// Cuadre diario del domiciliario. Modelo real del negocio: el domiciliario lleva una base, PAGA al
// restaurante el subtotal en cuanto recoge el pedido y luego COBRA el total al cliente. Su ganancia
// es la tarifa de domicilio. Todo sale de los pedidos entregados; no hay tablas nuevas.

const TIME_ZONE = 'America/Bogota'

/** Día calendario (YYYY-MM-DD) de una fecha ISO, en hora de Colombia. */
export const bogotaDay = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })

export interface CashSettlement {
  /** Pedidos entregados ese día. */
  deliveries: number
  /** Cuántos de ellos fueron en efectivo. */
  cashDeliveries: number
  /** Efectivo cobrado a los clientes (total de los pedidos en efectivo). */
  collected: number
  /** Efectivo adelantado a los restaurantes (subtotal = total − tarifa, solo en efectivo). */
  paidToRestaurants: number
  /** Ganancia del domiciliario: tarifa de domicilio de todo lo entregado. */
  earnings: number
}

export const computeSettlement = (orders: Order[], day: string): CashSettlement => {
  const result: CashSettlement = { deliveries: 0, cashDeliveries: 0, collected: 0, paidToRestaurants: 0, earnings: 0 }
  for (const o of orders) {
    if (o.status !== ORDER_STATUS.DELIVERED || bogotaDay(o.updated_at) !== day) continue
    const total = Number(o.total)
    const fee = Number(o.delivery_fee ?? 0)
    result.deliveries += 1
    result.earnings += fee
    if (o.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY) {
      result.cashDeliveries += 1
      result.collected += total
      result.paidToRestaurants += total - fee
    }
  }
  return result
}

/** Efectivo que el domiciliario debe tener en mano al cerrar: su base + lo cobrado − lo adelantado. */
export const expectedCashOnHand = (base: number, s: CashSettlement): number =>
  base + s.collected - s.paidToRestaurants
