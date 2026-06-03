import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Target modern browsers for smaller output
    target: 'es2015',

    // Increase the warning threshold (default 500kB is too noisy)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps vendor libs separate from app code
        // so browsers can cache them independently
        manualChunks: {
          // React core — changes rarely, cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Animation / UI — large but shared across pages
          'vendor-motion': ['framer-motion'],

          // Google Maps + OAuth — heavy, load only when needed by pages that use it
          'vendor-google': ['@react-google-maps/api', '@react-oauth/google'],

          // Socket.io client — chat feature only
          'vendor-socket': ['socket.io-client'],

          // Utilities
          'vendor-utils': ['axios', 'jwt-decode', 'date-fns'],
        },

        // Use content hashes for long-term caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Enable CSS code splitting (each chunk gets its own CSS)
    cssCodeSplit: true,

    // Source maps for production debugging (set to false if not needed)
    sourcemap: false,
  },

  // Optimise dev server — pre-bundle dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
      'jwt-decode',
      'date-fns',
      'socket.io-client',
    ],
  },
})
