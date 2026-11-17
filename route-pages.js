// After `vite build`: give every route (and every old .html address) its own copy of
// index.html, so GitHub Pages answers 200 and the React app takes over from there.
// 404.html catches anything else.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const dist = join(import.meta.dirname, 'dist');
const index = join(dist, 'index.html');
const copies = [
  'pitch/index.html', 'world-clock/index.html', 'live-board/index.html', 'site/index.html',
  'pitch.html', 'world-clock.html', 'live-board.html', 'site.html', '404.html',
];
for (const file of copies) {
  const to = join(dist, file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(index, to);
}
console.log(`Copied index.html to ${copies.length} route files.`);
