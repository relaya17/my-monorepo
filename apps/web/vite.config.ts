import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        // Dev-only API target (override with VITE_DEV_API_TARGET if needed)
        // Defaulting to Render avoids requiring local MongoDB for frontend work.
        target: process.env.VITE_DEV_API_TARGET || 'https://my-monorepo-1pzh.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Reduce initial JS by splitting heavy vendor deps into separate chunks
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react';
          if (id.includes('redux') || id.includes('@reduxjs')) return 'redux';
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
          if (id.includes('pdf-lib')) return 'pdf';
          if (id.includes('bootstrap') || id.includes('react-bootstrap')) return 'bootstrap';
          return 'vendor';
        }
      }
    }
  },
})
