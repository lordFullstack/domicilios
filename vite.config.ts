import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
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
        // Los assets propios de la app (JS/CSS/fuentes locales) ya se
        // precachean automáticamente por Workbox al buildear — esto de
        // abajo es para todo lo que NO se precachea (fotos de productos/
        // restaurantes subidas a Supabase Storage, fuentes de Google).
        runtimeCaching: [
          // Cache First: imágenes de productos/restaurantes (Supabase Storage)
          // y fuentes — cambian poco, y cachearlas es lo que hace que la app
          // "sienta" instantánea en la segunda visita.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Network Only: TODO lo que sea datos vivos (pedidos, estados,
          // usuarios, restaurantes, promociones). Nunca debe verse un precio
          // o un estado de pedido desactualizado por culpa de la caché.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/v1\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/functions\/v1\/.*/i,
            handler: 'NetworkOnly',
          },
          // Stale While Revalidate: tiles del mapa (seguimiento de domiciliario)
          // — está bien mostrar el tile de hace unos minutos mientras llega el actual.
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
              },
            },
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
