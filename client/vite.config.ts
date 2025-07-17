import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://my-monorepo-1pzh.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
