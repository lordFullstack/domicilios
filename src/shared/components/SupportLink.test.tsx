import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupportLink, supportUrl } from './SupportLink'

describe('SupportLink', () => {
  it('abre el WhatsApp de soporte con el mensaje y en otra pestaña', () => {
    render(<SupportLink message="Mi cuenta sigue en revisión" />)
    const link = screen.getByRole('link', { name: /soporte por whatsapp/i })
    expect(link).toHaveAttribute('href', 'https://wa.me/573205390468?text=Mi%20cuenta%20sigue%20en%20revisi%C3%B3n')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('el mensaje por defecto menciona la app', () => {
    expect(supportUrl('hola')).toBe('https://wa.me/573205390468?text=hola')
    render(<SupportLink />)
    expect(screen.getByRole('link').getAttribute('href')).toContain(encodeURIComponent('Domicilios Riohacha'))
  })
})
