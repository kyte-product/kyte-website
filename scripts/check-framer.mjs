import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await readFile(resolve(root,'mirror-manifest.json'),'utf8'));
let imports=0;const origin=process.env.CHECK_ORIGIN;
for(const url of manifest.pages){const path=new URL(url).pathname;const rel='.'+(path==='/'?'':path)+'/index.html';const original=await readFile(resolve(root,'public',rel),'utf8'),current=await readFile(resolve(root,'framer-site',rel),'utf8');
 const styles=s=>[...s.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]);assert.deepEqual(styles(current),styles(original),path+' must preserve original Framer stylesheet');
 assert.ok(!current.includes('<title>My Framer Site</title>'));if(original.includes('<div class="framer-i3Mx4'))assert.ok(current.includes('kyte-page-frame'));assert.ok(current.includes('kyte-fixes.js'));assert.ok(current.includes('kyte-layout-system.css'));assert.ok(current.includes('local-assets.js'));assert.ok(current.includes('script_main.BHl0p5qn.mjs'));
 if(origin){const r=await fetch(origin+path,{redirect:'manual'});assert.equal(r.status,path==='/product-home'?301:200,path)}
}
const layoutCss=await readFile(resolve(root,'framer-site/kyte-layout-system.css'),'utf8');for(const token of ['--kyte-content-max:1600px','--kyte-page-gutter:clamp(22px,5vw,96px)','--kyte-grid-gap:clamp(20px,2.25vw,36px)'])assert.ok(layoutCss.includes(token),'Missing shared layout token '+token);
const designSystem=await readFile(resolve(root,'framer-site/design-system/index.html'),'utf8');assert.ok(designSystem.includes('CONTENT WIDTH'));assert.ok(designSystem.includes('GRID GAP'));assert.ok(designSystem.includes('kyte-layout-system.css'));
for(const path of Object.values(manifest.resources)){const file=resolve(root,'framer-site','.'+path);assert.ok((await stat(file)).size>0,path);if(path.endsWith('.mjs')){const source=await readFile(file,'utf8');for(const m of source.matchAll(/(?:from\s*|import\s*\()["'`](\.[^"'`]+\.mjs)["'`]/g)){await stat(resolve(dirname(file),m[1]));imports++}}}
if(origin){const cms=Object.values(manifest.resources).find(p=>p.endsWith('.framercms'));const source=await readFile(resolve(root,'framer-site','.'+cms));const r=await fetch(origin+cms+'?range=0-9,20-29');assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),Buffer.concat([source.subarray(0,10),source.subarray(20,30)]));const video=Object.values(manifest.resources).find(p=>p.endsWith('.mp4'));const v=await fetch(origin+video,{headers:{Range:'bytes=0-99'}});assert.equal(v.status,206);assert.equal((await v.arrayBuffer()).byteLength,100);assert.equal((await fetch(origin+'/not-a-real-page')).status,404);assert.equal((await fetch(origin+'/work/the-wrap-is-the-campaign-what-car-camouflage-teaches-us-about-building-desire',{redirect:'manual'})).status,301)}
console.log(`PASS: ${manifest.pages.length} original Framer page styles preserved, shared layout tokens, ${imports} module imports, metadata and local assets${origin?', live routes, article redirects, CMS byte ranges and video seeking':''}.`);
