import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      shared: path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { clientPort: 5173 },
    proxy: {
      '/api': {
        // Local-first: point to local API server.
        // Override with VITE_DEV_API_TARGET for preview/staging branches.
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:3008',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1600,
    // Code splitting enabled – duplicate React is prevented by pnpm overrides
    // in root package.json (react & react-dom pinned to ^18.2.0).
  },
})
