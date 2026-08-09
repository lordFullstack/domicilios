import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  // GitHub Pages configuration
  base: process.env.VITE_BASE_URL || '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
