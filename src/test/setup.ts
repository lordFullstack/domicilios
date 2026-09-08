import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Sin `globals: true` (a propósito, ver vite.config.ts), Testing Library
// no puede auto-registrar la limpieza del DOM entre tests — hay que
// hacerlo a mano, o un test contamina el DOM del siguiente.
afterEach(() => {
  cleanup()
})
