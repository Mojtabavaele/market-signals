import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // The platform injects __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS for the preview proxy
    watch: { usePolling: process.env.BASE44_PREVIEW_MODE === '1' },
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:8000',
    },
  },
});
