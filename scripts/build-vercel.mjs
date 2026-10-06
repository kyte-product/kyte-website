import {existsSync} from 'node:fs';
import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {resolve,relative,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
// Keep preview hosts unindexed until the custom domain is ready.
if(!process.env.SITE_URL&&process.env.VERCEL_PROJECT_PRODUCTION_URL)process.env.SITE_URL='https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL;
await import('./build-framer.mjs');
const output=resolve(root,'.vercel/output'),site=resolve(root,'framer-site');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
// Follow versioned asset symlinks so the uploaded output is self-contained.
await cp(site,resolve(output,'static'),{recursive:true,dereference:true});
const map={},data=resolve(output,'functions/api/cms.func/data');await mkdir(data,{recursive:true});
async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())await scan(path);else if(entry.name.endsWith('.framercms')){const key=relative(resolve(site,'assets'),path);const name=Object.keys(map).length+'-'+basename(path);map[key]=name;await cp(path,resolve(data,name))}}}
await scan(resolve(site,'assets'));
const originals=Object.entries(map);
for(const entry of await readdir(resolve(site,'assets/framerusercontent.com'),{withFileTypes:true})){
 if(entry.isSymbolicLink()&&entry.name.startsWith('sites-content-'))for(const [key,value] of originals)if(key.startsWith('framerusercontent.com/sites/'))map[key.replace('/sites/','/'+entry.name+'/')]=value;
}
for(const [name,handler]of [['cms','cms.mjs'],['inquiry','inquiry.mjs']]){
 const dir=resolve(output,'functions/api/'+name+'.func');await mkdir(dir,{recursive:true});await cp(resolve(root,'deployment',handler),resolve(dir,'index.mjs'));
 await writeFile(resolve(dir,'.vc-config.json'),JSON.stringify({runtime:'nodejs22.x',handler:'index.mjs',launcherType:'Nodejs',maxDuration:20}));
}
await writeFile(resolve(data,'../cms-map.json'),JSON.stringify(map));
await cp(resolve(root,'src/inquiry.mjs'),resolve(output,'functions/api/inquiry.func/inquiry-core.mjs'));
const meta=JSON.parse(await readFile(resolve(root,'dist/pages.json'),'utf8'));
const redirects=JSON.parse(await readFile(resolve(root,'content/redirects.json'),'utf8'));
for(const p of meta.pages.filter(p=>p.path.startsWith('/design-news/')))redirects[p.path.replace('/design-news/','/work/')]=p.path;
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const routes=[{src:'/(.*)',headers:{'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY',...(process.env.SITE_ENV==='production'?{}:{'X-Robots-Tag':'noindex, follow'})},continue:true},...Object.entries(redirects).map(([src,dest])=>({src:escape(src),status:308,headers:{Location:dest}})),{src:'/assets/(.*\\.framercms)',dest:'/api/cms?file=$1'},{src:'/api/inquiry',dest:'/api/inquiry'},...meta.pages.filter(p=>p.path!='/product-home'&&existsSync(resolve(site,'.'+p.path,'index.html'))).map(p=>({src:escape(p.path)+(p.path==='/'?'':'/?'),dest:(p.path==='/'?'':p.path)+'/index.html'})),{src:'/design-system/?',dest:'/design-system/index.html'},{handle:'filesystem'},{src:'/.*',dest:'/404.html',status:404}];
await writeFile(resolve(output,'static/404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · Kyte</title><style>body{background:#f8f7f4;color:#20201e;font:18px/1.6 system-ui;padding:10vw;max-width:720px}a{color:inherit}</style><h1>That page could not be found.</h1><p>Explore our work or get in touch about your project.</p><p><a href="/">Home</a> · <a href="/work">Our work</a> · <a href="/contact">Contact Kyte</a></p></html>');
await writeFile(resolve(output,'config.json'),JSON.stringify({version:3,routes},null,2));
console.log('Vercel output ready: static pages, media, CMS range handler and inquiry endpoint.');
