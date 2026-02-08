import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
  },
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        // Dev-only API target (override with VITE_DEV_API_TARGET if needed)
        // Defaulting to Render avoids requiring local MongoDB for frontend work.
        // NOTE: match the Render "primary URL" you posted in logs.
        target: process.env.VITE_DEV_API_TARGET || 'https://my-monorepo-1.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Single chunk for React + deps so all libs use same instance - fixes useSyncExternalStore
          const norm = id.replace(/\\/g, '/');
          if (norm.includes('/react/') || norm.includes('/react-dom/') || norm.includes('/scheduler/') || norm.includes('/react-is/')) return 'react';
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
          if (id.includes('pdf-lib')) return 'pdf';
        }
      }
    }
  },
})
