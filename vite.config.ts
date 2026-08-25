import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/rocket-app-icon.png', 'brand/rocket-app-icon-192.png'],
      manifest: {
        name: 'pa comer express',
        short_name: 'pa comer',
        description: 'Pide a domicilio en Riohacha — rápido, fácil y sin filas.',
        theme_color: '#2F5EFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/app/home',
        scope: '/',
        icons: [
          {
            src: '/brand/rocket-app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/brand/rocket-app-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/brand/rocket-app-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Nunca cachear llamadas a Supabase — siempre datos frescos (pedidos,
        // estados, precios). Solo se cachean los assets estáticos de la app
        // (JS/CSS/imágenes), que es lo que hace que abra instantáneo.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
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
