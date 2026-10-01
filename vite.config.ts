import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// npm run dev starts Express, which owns the local /api routes.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb'],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
