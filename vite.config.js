import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Graphic Editor',
        short_name: 'GraphicEditor',
        description: 'A powerful graphic editor',
        theme_color: '#ffffff',
        icons: [
          { src: 'icons.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
      }
    })
  ],
})
