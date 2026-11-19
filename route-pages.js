// Only for the prototype build: give every route (and every old .html address) its own copy of
// index.html, so GitHub Pages answers 200 and the React app takes over from there.
// 404.html catches anything else.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const dist = resolve(import.meta.dirname, process.argv[2] || 'dist-prototypes');
const index = join(dist, 'index.html');
const copies = [
  'home.html', 'options/index.html', 'options.html', 'pitch/index.html', 'world-clock/index.html', 'live-board/index.html', 'site/index.html',
  'pitch.html', 'world-clock.html', 'live-board.html', 'site.html', '404.html',
];
for (const file of copies) {
  const to = join(dist, file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(index, to);
}
console.log(`Copied index.html to ${copies.length} route files.`);
