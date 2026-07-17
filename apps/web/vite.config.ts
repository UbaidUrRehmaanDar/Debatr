import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    proxy: {
      // Proxy API + WebSocket to the Fastify backend during local dev.
      '/api': {
        target: process.env.API_ORIGIN || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
