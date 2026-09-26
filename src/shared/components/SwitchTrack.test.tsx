import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SwitchTrack } from './SwitchTrack'

// La geometría real (bolita dentro de la pista) se comprobó en el navegador; aquí se fija el contrato de
// clases que la garantiza: bolita anclada a la izquierda, desplazamiento = pista − bolita − márgenes.
describe('SwitchTrack', () => {
  const parts = (on: boolean) => {
    const { container } = render(<SwitchTrack on={on} />)
    const track = container.firstElementChild as HTMLElement
    return { track, knob: track.firstElementChild as HTMLElement }
  }

  it('la bolita está anclada a la izquierda y su recorrido cabe en la pista (48 - 24 - 2*2 = 20px)', () => {
    const { track, knob } = parts(true)
    expect(track.className).toMatch(/\bw-12\b/)
    expect(knob.className).toMatch(/\bw-6\b/)
    expect(knob.className).toMatch(/\bleft-0\.5\b/)
    expect(knob.className).toMatch(/\btranslate-x-5\b/)
  })

  it('apagado: sin desplazamiento; encendido: pista verde', () => {
    expect(parts(false).knob.className).toMatch(/\btranslate-x-0\b/)
    expect(parts(true).track.className).toMatch(/\bbg-success\b/)
    expect(parts(false).track.className).not.toMatch(/\bbg-success\b/)
  })

  it('la bolita es blanca fija: no usa bg-white, que el tema noche remapea a azul-noche', () => {
    const { knob } = parts(true)
    expect(knob.className).toMatch(/bg-\[#FFFFFF\]/)
    expect(knob.className).not.toMatch(/bg-white/)
  })

  it('es decorativo para lectores de pantalla', () => {
    expect(parts(true).track).toHaveAttribute('aria-hidden', 'true')
  })
})
