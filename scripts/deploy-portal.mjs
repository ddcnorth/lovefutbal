import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = {
  account: '479e77f49d4ac5d7498529ee360f194b',
  bucket: 'ddcnorth-portal-sites',
  slug: 'lovefutbal',
  repo: 'ddcnorth/lovefutbal',
  ref: 'main',
  base: '/p/lovefutbal/',
};
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: 30_000 }).trim();
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const pointerKey = `sites/${config.slug}/current.json`;

export async function collectBuild(directory = join(root, 'dist')) {
  const files = [];
  async function walk(relative = '') {
    const entries = await readdir(join(directory, relative), { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || /[\\\x00-\x1f]/.test(entry.name)) {
        throw new Error(`Unexpected build path: ${entry.name}`);
      }
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Build must not contain symlinks: ${path}`);
      if (entry.isDirectory()) { await walk(path); continue; }
      const contentType = types[extname(path).toLowerCase()];
      if (!entry.isFile() || !contentType) throw new Error(`Unexpected build file: ${path}`);
      const bytes = await readFile(join(directory, path));
      if (bytes.length > 25 * 1024 * 1024) throw new Error(`Build file exceeds 25 MiB: ${path}`);
      files.push({ path, bytes, contentType, sha256: hash(bytes) });
    }
  }
  await walk();
  const index = files.find((file) => file.path === 'index.html');
  if (!index) throw new Error('Missing dist/index.html. Run npm run build:portal.');
  const html = index.bytes.toString('utf8');
  const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1]).filter((url) => !/^(?:https?:|data:|#)/.test(url));
  if (!assets.length || assets.some((url) => !url.startsWith(config.base))) {
    throw new Error(`The build must use ${config.base}. Run npm run build:portal.`);
  }
  for (const url of assets) {
    const path = url.slice(config.base.length).split(/[?#]/)[0];
    if (!files.some((file) => file.path === path)) throw new Error(`Missing referenced build asset: ${path}`);
  }
  if (files.some((file) => file.path.endsWith('.js') && /lf-switch|All options|World clock/.test(file.bytes.toString('utf8')))) {
    throw new Error('The build contains prototype navigation. Use npm run build:portal.');
  }
  return files;
}

export async function publish(files, version, token, request = fetch) {
  const prefix = `https://api.cloudflare.com/client/v4/accounts/${config.account}/r2/buckets/${config.bucket}/objects/`;
  async function api(method, key, bytes, contentType) {
    const response = await request(prefix + key.split('/').map(encodeURIComponent).join('/'), {
      method, redirect: 'error', signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${token}`,
        ...(bytes ? { 'Content-Type': contentType } : {}),
        ...(key === pointerKey ? { 'Cache-Control': 'no-store' } : {}),
      },
      ...(bytes ? { body: bytes } : {}),
    });
    if (!response.ok && !(method === 'GET' && key === pointerKey && response.status === 404)) {
      throw new Error(`Cloudflare ${method} ${key} failed (HTTP ${response.status}).`);
    }
    return response;
  }
  async function current() {
    const response = await api('GET', pointerKey);
    return response.status === 404 ? null : await response.text();
  }
  const previous = await current();
  if (previous && JSON.parse(previous).version === version) {
    throw new Error(`Commit ${version} is already active; no files were changed.`);
  }
  for (const file of files) {
    const key = `sites/${config.slug}/${version}/${file.path}`;
    const result = await (await api('PUT', key, file.bytes, file.contentType)).json();
    if (result.success !== true || Number(result.result?.size) !== file.bytes.length) {
      throw new Error(`Upload metadata did not match ${file.path}; current deployment was not changed.`);
    }
    const downloaded = Buffer.from(await (await api('GET', key)).arrayBuffer());
    if (hash(downloaded) !== file.sha256) throw new Error(`Upload verification failed: ${file.path}`);
    console.log(`Verified ${file.path} (${file.bytes.length} bytes)`);
  }
  if (await current() !== previous) {
    throw new Error('Another deployment changed current.json; activation stopped. Retry after checking the active release.');
  }
  const pointer = Buffer.from(JSON.stringify({
    version, repo: config.repo, ref: config.ref, deployed_at: new Date().toISOString(),
  }) + '\n');
  const activated = await (await api('PUT', pointerKey, pointer, 'application/json')).json();
  if (activated.success !== true) throw new Error('Cloudflare did not confirm activation. Check current.json.');
  if (await current() !== pointer.toString('utf8')) throw new Error('Activation readback differs; inspect current.json before retrying.');
  console.log(`Published https://ddcnorth.com${config.base} at ${version}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !['--publish', '--dry-run'].includes(arg)) || (args.includes('--publish') && args.includes('--dry-run'))) {
    throw new Error('Usage: npm run deploy:portal -- [--dry-run | --publish] (default: --dry-run)');
  }
  const version = git('rev-parse', 'HEAD');
  if (!/^[a-f0-9]{40}$/.test(version)) throw new Error('A committed Git revision is required.');
  const dirty = git('status', '--porcelain', '--untracked-files=normal');
  if (args.includes('--publish')) {
    if (dirty) throw new Error('Commit all source changes before publishing.');
    if (git('branch', '--show-current') !== config.ref) throw new Error('Publish from main after merging and pushing the changes.');
    const remoteHead = git('ls-remote', `https://github.com/${config.repo}.git`, `refs/heads/${config.ref}`).split(/\s/)[0];
    if (remoteHead !== version) throw new Error('Local HEAD must match the pushed GitHub main revision.');
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!token) throw new Error('Set CLOUDFLARE_API_TOKEN to an authorized R2 write token in your shell environment.');
    // Rebuild from the checked revision; never publish a stale dist directory.
    execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build:portal'], { cwd: root, stdio: 'inherit' });
    if (git('status', '--porcelain', '--untracked-files=normal') || git('rev-parse', 'HEAD') !== version) {
      throw new Error('Source changed during the build; activation stopped.');
    }
    await publish(await collectBuild(), version, token);
    return;
  }
  const files = await collectBuild();
  console.log(`Dry run: ${files.length} files, ${files.reduce((sum, file) => sum + file.bytes.length, 0)} bytes`);
  console.log(`Destination: ${config.bucket}/sites/${config.slug}/${version}/`);
  console.log(`Activate last: ${pointerKey}`);
  if (dirty) console.log('Source has uncommitted changes; --publish will require a clean committed checkout.');
  for (const file of files) console.log(`${file.sha256}  ${file.path}`);
  console.log('No network requests made. Use --publish after committing, reviewing, and pushing main.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
