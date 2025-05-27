import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove hardcoded values - let Vite handle environment variables properly
  // This allows Vercel's environment variables to be used in production
})
