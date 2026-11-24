// Fills public/sw.js's PRECACHE list and VERSION with the real dist/ files,
// then writes the result to dist/sw.js. Run after `vite build`.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

const files = walk('dist')
  .map((f) => './' + relative('dist', f).split('\\').join('/'))
  .filter((p) => p !== '/sw.js' && !p.split('/').pop().startsWith('_'));

const precache = ['./', ...files];
const version = String(Date.now());
const sw = readFileSync('public/sw.js', 'utf8')
  .replace("'__VERSION__'", JSON.stringify(version))
  .replace('/*__PRECACHE__*/[]', JSON.stringify(precache));
writeFileSync('dist/sw.js', sw);
console.log(`sw.js: precaching ${precache.length} files, version ${version}`);
