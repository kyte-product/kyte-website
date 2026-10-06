import {readFile,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),target=resolve(root,'release');
const manifest=JSON.parse(await readFile(resolve(root,'dist/pages.json'),'utf8'));
await rm(target,{recursive:true,force:true});
const assets=new Set();
async function copy(source,destination){await mkdir(dirname(destination),{recursive:true});await copyFile(source,destination)}
for(const p of [...manifest.pages,{path:'/404'}]){
 const rel='dist/'+(p.path==='/'?'':p.path.slice(1)+'/')+'index.html';const text=await readFile(resolve(root,rel),'utf8');
 for(const m of text.matchAll(/(?:src|srcset)="([^"]+)"/g))for(const part of m[1].split(',')){const src=part.trim().split(/\s/)[0];if(src.startsWith('/assets/'))assets.add(src)}
 await copy(resolve(root,rel),resolve(target,rel));
}
assets.add('/assets/local/telegraf.otf');
for(const asset of assets)await copy(resolve(root,'public','.'+asset),resolve(target,'public','.'+asset));
for(const file of ['server.mjs','src/inquiry.mjs','content/redirects.json','dist/site.css','dist/site.js','dist/favicon.svg','dist/robots.txt','dist/sitemap.xml','dist/pages.json'])await copy(resolve(root,file),resolve(target,file));
await writeFile(resolve(target,'package.json'),JSON.stringify({name:'kyte-release',private:true,type:'module',scripts:{start:'node server.mjs'},engines:{node:'>=20'}},null,2));
await writeFile(resolve(target,'RELEASE.txt'),`Kyte ${manifest.production?'PRODUCTION':'PREVIEW (NOINDEX)'} package\nRun HOST=0.0.0.0 PORT=3000 npm start behind HTTPS.\nConfigure the server-only INQUIRY_WEBHOOK_URL and optional token.\nNo private source documents, audit evidence or form submissions are included.\n`);
console.log(`Packaged ${manifest.pages.length} pages and ${assets.size} used assets in release/. Mode: ${manifest.production?'production':'preview, noindex'}`);
