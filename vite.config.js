import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  define: {
    'import.meta.env.VITE_SQUARE_APP_ID': JSON.stringify(process.env.SQUARE_APP_ID),
    'import.meta.env.VITE_SQUARE_LOCATION_ID': JSON.stringify(process.env.SQUARE_LOCATION_ID)
  },
  resolve: {
    alias: {
      '@assets': '/attached_assets'
    }
  }
})
