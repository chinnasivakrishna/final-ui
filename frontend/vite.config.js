import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE || 'http://localhost:8788'

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/cpanel-api': {
          target: target.startsWith('http') ? target : 'http://localhost:8788',
          changeOrigin: true,
        },
        '/uploads': {
          target: target.startsWith('http') ? target : 'http://localhost:8788',
          changeOrigin: true,
        },
      },
    },
  }
})
