import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plain config: `vite build` → dist/ (served by server/index.ts); `vite` dev server proxies /api to the app server.
// server/index.ts --dev also loads this file for its Vite middleware.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:3004' },
    },
  },
});
