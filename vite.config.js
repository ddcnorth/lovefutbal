import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import scopePages from './scope-pages.js';

export default defineConfig({
  base: '/lovefutbal/',
  plugins: [react()],
  css: { postcss: { plugins: [scopePages()] } },
});
