import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(resolve(root, 'mirror-manifest.json'), 'utf8'));
const origin = process.env.CHECK_ORIGIN || 'http://localhost:4173';
let imports = 0;
assert.deepEqual(manifest.failures, {}, 'All public resources must be downloaded');
for (const path of Object.values(manifest.resources)) {
  const file = resolve(root, 'public', '.' + path);
  assert((await stat(file)).size > 0, `Empty resource: ${path}`);
  if (path.endsWith('.mjs')) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\()["'`](\.[^"'`]+\.mjs)["'`]/g)) {
      assert((await stat(resolve(dirname(file), match[1]))).isFile(), `Missing module ${match[1]}`);
      imports++;
    }
  }
}
for (const page of manifest.pages) {
  const pathname = new URL(page).pathname;
  const response = await fetch(origin + pathname);
  assert.equal(response.status, 200, `Route ${pathname}`);
  const content = await response.text();
  assert(content.includes('<base href="/">'), `Root-relative navigation: ${pathname}`);
  assert(content.includes('local-assets.js'), `Local CMS media resolver: ${pathname}`);
}
const cms = Object.values(manifest.resources).find(path => path.endsWith('.framercms'));
const data = await readFile(resolve(root, 'public', '.' + cms));
const ranges = await fetch(origin + cms + '?range=0-9,20-29');
assert.equal(ranges.status, 200);
assert.deepEqual(Buffer.from(await ranges.arrayBuffer()), Buffer.concat([data.subarray(0, 10), data.subarray(20, 30)]));
const video = Object.values(manifest.resources).find(path => path.endsWith('.mp4'));
const partial = await fetch(origin + video, { headers: { Range: 'bytes=0-99' } });
assert.equal(partial.status, 206);
assert.equal((await partial.arrayBuffer()).byteLength, 100);
assert.equal((await fetch(origin + cms + '?range=99999999-999999999')).status, 416);
assert.equal((await fetch(origin + '/not-a-real-page')).status, 404);
console.log(`PASS: ${manifest.pages.length} routes, ${Object.keys(manifest.resources).length} local resources, ${imports} module imports, CMS ranges, video seeking, and missing-page handling.`);
