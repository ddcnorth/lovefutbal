import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import scopePages from './scope-pages.js';

export default defineConfig(({ mode }) => {
  const prototypes = mode === 'prototypes';
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    // --base can override this for any subdirectory deployment.
    base: env.VITE_BASE_PATH || (prototypes ? '/lovefutbal/' : '/'),
    resolve: {
      // A build includes only its selected app, not the other app's routes/chunks.
      alias: {
        '#app': fileURLToPath(new URL(prototypes ? './src/prototypes.jsx' : './src/front-page.jsx', import.meta.url)),
      },
    },
    plugins: [react()],
    css: { postcss: { plugins: [scopePages()] } },
  };
});
