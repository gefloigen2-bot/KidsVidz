// Packs dist/ into worker/assets.generated.js so the whole site deploys as one Worker
// (no separate asset-upload step needed).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
const TEXT = new Set(['.html', '.js', '.css', '.svg', '.json', '.webmanifest']);

const root = 'dist';
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

const assets = {};
for (const file of walk(root)) {
  const path = '/' + relative(root, file).split('\\').join('/');
  if (path.split('/').pop().startsWith('_')) continue; // _headers etc. are handled in the Worker
  const ext = extname(file);
  const buf = readFileSync(file);
  assets[path] = {
    type: TYPES[ext] ?? 'application/octet-stream',
    ...(TEXT.has(ext) ? { text: buf.toString('utf8') } : { b64: buf.toString('base64') }),
  };
}
writeFileSync('worker/assets.generated.js', `export const ASSETS = ${JSON.stringify(assets)};\n`);
console.log(`Embedded ${Object.keys(assets).length} files`);
