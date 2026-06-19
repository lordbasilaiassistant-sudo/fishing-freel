import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' -> relative asset URLs so the static build works on any host
// (GitHub Pages project subpaths, Cloudflare Pages, plain file serving).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, open: false },
  build: { target: 'es2022', sourcemap: false },
})
