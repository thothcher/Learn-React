import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves the site from /<repo-name>/, so the deploy workflow sets BASE_PATH.
// The value has no slashes (BASE_PATH=Learn-React) so Git Bash on Windows won't turn it into a file path.
const basePath = process.env.BASE_PATH?.replace(/^\/+|\/+$/g, '')

// https://vite.dev/config/
export default defineConfig({
  base: basePath ? `/${basePath}/` : '/',
  plugins: [react()],
})
