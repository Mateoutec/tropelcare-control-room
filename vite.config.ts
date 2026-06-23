import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hackaton-20261-front-587720740455.us-east1.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});