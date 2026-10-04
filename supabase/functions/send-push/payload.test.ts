import { describe, it, expect } from 'vitest'
import { parseRequest, pathFor, buildPayload, type NotificationRow } from './payload'

const ID = '3f2b8c1e-9d4a-4e7b-8a6c-1b2c3d4e5f60'

describe('send-push: parseRequest (LOOP_SECURITY_02)', () => {
  it('acepta solo { notification_id: uuid }', () => {
    expect(parseRequest({ notification_id: ID })).toEqual({ ok: true, notificationId: ID })
  })

  it('rechaza el formato antiguo { userId, type, orderId }', () => {
    const res = parseRequest({ userId: ID, type: 'new_order', orderId: ID })
    expect(res.ok).toBe(false)
  })

  it('rechaza campos extra junto a notification_id (el llamante no puede añadir destinatario ni texto)', () => {
    expect(parseRequest({ notification_id: ID, userId: 'otro' }).ok).toBe(false)
    expect(parseRequest({ notification_id: ID, title: 'hackeado' }).ok).toBe(false)
  })

  it('rechaza ids que no son uuid, tipos incorrectos y cuerpos no objeto', () => {
    expect(parseRequest({ notification_id: 'no-es-uuid' }).ok).toBe(false)
    expect(parseRequest({ notification_id: 123 }).ok).toBe(false)
    expect(parseRequest({ notification_id: null }).ok).toBe(false)
    expect(parseRequest(null).ok).toBe(false)
    expect(parseRequest('texto').ok).toBe(false)
    expect(parseRequest([ID]).ok).toBe(false)
    expect(parseRequest({}).ok).toBe(false)
  })
})

describe('send-push: pathFor y buildPayload', () => {
  const row: NotificationRow = {
    id: ID, user_id: 'u1', title: 'Nuevo pedido', body: 'Te llegó un pedido nuevo por $10000', type: 'order', order_id: 'o1',
  }

  it('la pantalla depende del rol del destinatario', () => {
    expect(pathFor('restaurant', 'o1')).toBe('/restaurant/orders')
    expect(pathFor('delivery', 'o1')).toBe('/delivery/active')
    expect(pathFor('client', 'o1')).toBe('/app/order/o1')
    expect(pathFor(null, 'o1')).toBe('/app/order/o1')
    expect(pathFor('client', null)).toBe('/app')
  })

  it('un Domi abre su pantalla según el rol (cliente, domiciliario, admin)', () => {
    expect(pathFor('client', null, 'e1')).toBe('/domi/e1')
    expect(pathFor('delivery', null, 'e1')).toBe('/delivery/dashboard')
    expect(pathFor('admin', null, 'e1')).toBe('/admin/orders?tab=domis')
    // Un pedido normal no cambia
    expect(pathFor('client', 'o1', null)).toBe('/app/order/o1')
  })

  it('el payload de un Domi lleva errandId y su ruta', () => {
    const domi: NotificationRow = { ...row, title: 'Actualización de tu Domi', order_id: null, errand_id: 'e1' }
    expect(JSON.parse(buildPayload(domi, 'client'))).toMatchObject({ url: '/domi/e1', errandId: 'e1', orderId: null })
  })

  it('el payload sale solo de la fila: título, cuerpo, pedido y ruta', () => {
    const payload = JSON.parse(buildPayload(row, 'restaurant'))
    expect(payload).toEqual({
      title: 'Nuevo pedido',
      body: 'Te llegó un pedido nuevo por $10000',
      url: '/restaurant/orders',
      orderId: 'o1',
      errandId: null,
    })
  })
})
