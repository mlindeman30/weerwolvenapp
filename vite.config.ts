import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' zorgt dat de site werkt vanuit een submap, zoals op GitHub Pages (gebruiker.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
