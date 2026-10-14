import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        open: true,
        host: true // Listen on all addresses, not only localhost - so the browser can reach Vite inside its Docker container.
    }
})
