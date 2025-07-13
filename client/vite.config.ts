import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // או כל פורט אחר שתבחר
    proxy: {
      '/api': {
        target: 'http://localhost:3008', // שרת ה־Express
        changeOrigin: true,
        secure: false
      }
    }
  }
})
