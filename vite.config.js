import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const page = (p) => resolve(import.meta.dirname, p);

export default defineConfig({
  base: '/lovefutbal/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        chooser: page('index.html'),
        pitch: page('pitch.html'),
        world: page('world-clock.html'),
        board: page('live-board.html'),
        site: page('site/index.html'),
      },
    },
  },
});
