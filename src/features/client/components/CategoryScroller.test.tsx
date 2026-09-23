import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryScroller } from './CategoryScroller'

describe('<CategoryScroller />', () => {
  it('cada categoría es un botón con aria-label', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CategoryScroller />
      </MemoryRouter>
    )
    const pizza = screen.getByLabelText('Categoría Pizza')
    expect(pizza.tagName).toBe('BUTTON')
    expect(pizza).toHaveAttribute('type', 'button')
  })
})
