import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'dist');
const {pages,production,domain}=JSON.parse(await readFile(resolve(out,'pages.json'),'utf8'));
const redirects=JSON.parse(await readFile(resolve(root,'content/redirects.json'),'utf8'));
const paths=new Set(pages.map(p=>p.path)),titles=new Set(),descriptions=new Set();let links=0,images=0,total=0;
for(const p of pages){
 const html=await readFile(resolve(out,'.'+(p.path==='/'?'':p.path),'index.html'),'utf8');total+=Buffer.byteLength(html);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,p.path+' heading');assert.equal((html.match(/<main[ >]/g)||[]).length,1,p.path+' landmark');
 assert.ok(!/<base\b/.test(html),p.path+' base override');
 assert.ok(!/My Framer Site|Made with Framer|dummy@mail.com|9876543210|Section Title|sayhi@akihiko|Tokyo, Japan/.test(html),p.path+' placeholder');
 assert.ok(html.includes(`href="${domain+p.path}"`),p.path+' canonical');assert.ok(html.includes(production?'index,follow,max-image-preview:large':'noindex,follow'),p.path+' indexing mode');
 assert.ok(!titles.has(p.title),'Duplicate title '+p.title);titles.add(p.title);assert.ok(!descriptions.has(p.description),'Duplicate description '+p.path);descriptions.add(p.description);
 for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(m[1]);
 for(const m of html.matchAll(/<a[^>]+href="([^"]+)"/g)){if(!m[1].startsWith('/'))continue;const href=m[1].split(/[?#]/)[0];assert.ok(paths.has(href)||redirects[href],`Broken link ${p.path} → ${href}`);links++}
 for(const m of html.matchAll(/<img\b[^>]*>/g)){const src=/src="([^"]+)"/.exec(m[0])?.[1];assert.ok(src,p.path+' src');assert.ok(/alt="[^"]+"/.test(m[0]),p.path+' alt');assert.ok(/width="\d+"/.test(m[0])&&/height="\d+"/.test(m[0]),p.path+' dimensions');await stat(resolve(root,'public','.'+src));images++}
}
for(const [from,to] of Object.entries(redirects))assert.ok(paths.has(to),`Bad redirect ${from} → ${to}`);
for(const p of JSON.parse(await readFile(resolve(root,'audit/evidence/site-inventory.json'),'utf8')).pages)assert.ok(paths.has(p.path)||redirects[p.path],`Missing original route ${p.path}`);
console.log(`PASS: ${pages.length} pages; ${links} internal links; ${images} image references; unique metadata; schema; original-route coverage.`);
console.log(`Total HTML ${(total/1024).toFixed(1)}KB; average ${(total/pages.length/1024).toFixed(1)}KB. CSS ${((await stat(resolve(out,'site.css'))).size/1024).toFixed(1)}KB; JS ${((await stat(resolve(out,'site.js'))).size/1024).toFixed(1)}KB.`);
if(process.env.CHECK_URL){const base=process.env.CHECK_URL;
 for(const p of pages){const r=await fetch(base+p.path);assert.equal(r.status,200,p.path);if(!production)assert.match(r.headers.get('x-robots-tag'),/noindex/)}
 for(const [from,to]of Object.entries(redirects)){const r=await fetch(base+from,{redirect:'manual'});assert.equal(r.status,301,from);assert.equal(r.headers.get('location'),to)}
 assert.equal((await fetch(base+'/missing-audit-test')).status,404);
 assert.equal((await fetch(base+'/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,422);
 console.log('PASS: live routes, redirects, 404, preview headers and validation endpoint. No valid inquiry sent.');
}
