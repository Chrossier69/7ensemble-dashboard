import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/7ensemble-dashboard/', // <-- IMPORTANT pour GitHub Pages
})