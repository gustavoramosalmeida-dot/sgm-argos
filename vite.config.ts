import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src') },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
      /** Resolver público do QR (mesmo host que o SPA em dev). */
      '/q': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
})
