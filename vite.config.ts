import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      // Le service worker se met à jour tout seul à chaque nouveau déploiement
      registerType: 'autoUpdate',
      includeAssets: ['logoRunner.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Running Tools',
        short_name: 'RunningTools',
        description:
          "Calculateurs pour coureurs : allures, temps de passage, équivalences de performance et barème d'athlétisme.",
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#242424',
        background_color: '#242424',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Toutes les routes de l'app (SPA) retombent sur index.html, y compris hors ligne
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
