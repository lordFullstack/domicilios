import { describe, it, expect } from 'vitest'
import { formatFirstName, formatFullName, normalizeText } from './format'

describe('formatFirstName', () => {
  it.each([
    ['jose', 'José'],
    ['jose luis', 'José Luis'],
    ['JOSE LUIS', 'José Luis'],
    ['maria', 'María'],
    ['MARÍA', 'María'],
    ['a', 'A'],
    ['juan  carlos', 'Juan Carlos'],
    ['  ana  ', 'Ana'],
  ])('%j → %j', (input, expected) => {
    expect(formatFirstName(input)).toBe(expected)
  })

  it('devuelve "" con vacío, null o undefined', () => {
    expect(formatFirstName('')).toBe('')
    expect(formatFirstName(null)).toBe('')
    expect(formatFirstName(undefined)).toBe('')
  })

  it('no inventa tildes en nombres que no están en el diccionario', () => {
    expect(formatFirstName('camilo')).toBe('Camilo')
  })
})

describe('formatFullName', () => {
  it('capitaliza y pone tildes a nombre y apellidos', () => {
    expect(formatFullName('jose luis perez gomez')).toBe('José Luis Pérez Gómez')
  })

  it('maneja nombres con guion', () => {
    expect(formatFullName('ana-maria')).toBe('Ana-María')
  })

  it('no rompe con emojis, números ni símbolos', () => {
    expect(formatFullName('😀 jose')).toBe('😀 José')
    expect(formatFullName('jose 2')).toBe('José 2')
    expect(formatFullName('@jose')).toBe('@jose')
  })
})

describe('normalizeText', () => {
  it.each([
    ['Pizzá', 'pizza'],
    ['PIZZA', 'pizza'],
    ['  PA  COMER ', 'pa comer'],
    ['Ñame', 'name'],
    ['Güero', 'guero'],
  ])('%j → %j', (input, expected) => {
    expect(normalizeText(input)).toBe(expected)
  })

  it('devuelve "" con vacío, null o undefined', () => {
    expect(normalizeText('')).toBe('')
    expect(normalizeText(null)).toBe('')
    expect(normalizeText(undefined)).toBe('')
  })
})
