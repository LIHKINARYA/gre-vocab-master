import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Port 3000 is required in Google AI Studio container.
// On localhost, default to standard Vite port 5173 so existing local development
// and localStorage origin (http://localhost:5173) are preserved.
const defaultPort = (process.env.DEFAULT_APP_PORT || process.env.APPLET_ID) ? 3000 : 5173;
const targetPort = process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: targetPort,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
