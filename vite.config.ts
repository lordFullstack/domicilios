import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: 'auto',
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
      injectManifest: {
        // El propio sw.ts ya define sus estrategias de runtimeCaching a mano
        // (con registerRoute) porque injectManifest solo puede inyectar el
        // precache de assets del build, no reglas de caché dinámicas.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
        type: 'module',
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
