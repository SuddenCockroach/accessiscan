import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',  // Backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')  // Keep /api prefix
      }
    }
  }
});