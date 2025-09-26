import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/foodtracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'FoodTracker',
        short_name: 'FoodTracker',
        start_url: '/foodtracker/',
        scope: '/foodtracker/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        description: 'Track meals, nutrition, weight, and get guidance.',
        icons: [
          { src: '/foodtracker/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/foodtracker/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
