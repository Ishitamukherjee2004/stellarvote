import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Some libraries (like buffer) expect 'global' or 'globalThis'
    'global': 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
})
