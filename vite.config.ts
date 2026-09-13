import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GitHub Pages serves the site from /<repo-name>/, so the deploy workflow sets BASE_PATH.
// The value has no slashes (BASE_PATH=Learn-React) so Git Bash on Windows won't turn it into a file path.
const basePath = process.env.BASE_PATH?.replace(/^\/+|\/+$/g, '')

// https://vite.dev/config/
export default defineConfig({
  base: basePath ? `/${basePath}/` : '/',
  plugins: [react()],
  server: {
    // The C# API runs on its own port during development. Proxying /api keeps requests
    // same-origin, just like on Vercel where /api is routed to the backend service.
    proxy: { '/api': 'http://localhost:5080' },
    watch: {
      // dotnet build locks files under backend/*/obj; watching them crashes the dev server (EBUSY).
      ignored: ['**/backend/**'],
    },
  },
  test: {
    // A small browser-like environment for code that uses localStorage, fetch and window.
    environment: 'happy-dom',
  },
})
