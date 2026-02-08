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
    strictPort: true,
    hmr: { clientPort: 5174 },
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
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Single bundle: no async chunks, so one React instance (fixes useSyncExternalStore)
        inlineDynamicImports: true,
      },
    },
  },
})
