import {createHash} from 'node:crypto';
import {populateServiceModule} from './populate-framer-services.mjs';
import {cp,readFile,writeFile,mkdir,readdir,symlink} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),output=resolve(root,'framer-site');
await mkdir(output,{recursive:true});await cp(resolve(root,'public'),output,{recursive:true});
const manifest=JSON.parse(await readFile(resolve(root,'mirror-manifest.json'),'utf8'));
const site=JSON.parse(await readFile(resolve(root,'content/site.json'),'utf8'));
const metadata=JSON.parse(await readFile(resolve(root,'dist/pages.json'),'utf8'));
const services=JSON.parse(await readFile(resolve(root,'content/services.json'),'utf8'));
const origin=process.env.SITE_URL||site.business.domain;
const production=process.env.SITE_ENV==='production';
const pages=Object.fromEntries(metadata.pages.map(p=>[p.path,{...p,canonical:origin+p.path}]));
const fixes={production,origin,email:site.business.email,pages,services,projects:site.projects.map(({slug,name,role,cover})=>({slug,name,role,image:cover.original_src})),smash:site.projects.find(p=>p.slug==='smash-guys').body};
const replacements=[['mailto:dummy@mail.com','mailto:'+site.business.email],['sayhi@akihiko.com',site.business.email],['Office: Tokyo, Japan.','Bengaluru, India.'],['https://www.framer.com/@westhill-studio/','/contact'],['+1 34566 4565','Email Kyte'],['tel:+1 14945 78297','mailto:'+site.business.email],['tel:+1%2014945%2078297','mailto:'+site.business.email],['+91 9876543210','Talk to our team']];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
let modifiedModules=0;
async function patchDirectory(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())await patchDirectory(path);else if(['.html','.mjs','.js'].includes(extname(path))){let before=await readFile(path,'utf8'),text=before;for(const [a,b]of replacements)text=text.replaceAll(a,b);if(path.endsWith('.mjs'))text=populateServiceModule(text);if(text!==before){await writeFile(path,text);if(path.endsWith('.mjs'))modifiedModules++}}}}
await patchDirectory(output);
const contentVersion=createHash('sha256').update(await readFile(resolve(root,'scripts/populate-framer-services.mjs'))).update(JSON.stringify(services)).digest('hex').slice(0,10);
const versionedSites='sites-content-'+contentVersion;
await symlink('sites',resolve(output,'assets/framerusercontent.com/'+versionedSites)).catch(e=>{if(e.code!=='EEXIST')throw e});
for(const url of manifest.pages){let path=new URL(url).pathname.replace(/\/$/,'')||'/';const file=resolve(output,'.'+(path==='/'?'':path),'index.html');let html=await readFile(file,'utf8');
 const meta=pages[path]||{title:'Product & UI/UX Design · Kyte',description:'Explore product and website design with Kyte.',canonical:origin+path};
 html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(meta.title)}</title>`);
 html=html.replace(/<meta\s+(?:name|property)="(?:description|og:title|og:description|og:image|og:url|twitter:title|twitter:description|twitter:image|robots)"[^>]*>/gi,'').replace(/<link[^>]+rel="canonical"[^>]*>/gi,'');
 const canonical=meta.canonical;
 html=html.replace('</head>',`<meta name="description" content="${esc(meta.description)}"><meta name="robots" content="${production&&path!='/product-home'?'index,follow,max-image-preview:large':'noindex,follow'}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin+site.projects[0].cover.original_src}"><link rel="stylesheet" href="/kyte-fixes.css"><link rel="stylesheet" href="/kyte-theme.css"><script src="/kyte-config.js"></script><script src="/kyte-service-content.js" defer></script><script src="/kyte-theme.js" defer></script><script src="/kyte-fixes.js" defer></script><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Kyte',url:origin,email:site.business.email})}</script></head>`);
 // These two root-relative mistakes were introduced by the mirror's base element.
 html=html.replaceAll('href="./staunch-fit-organic-growth"','href="/work/staunch-fit-organic-growth"').replaceAll('href="./msr-assets"','href="/work/msr-assets"');
 // Reuse the actual published article routes when related cards name the wrong collection.
 for(const a of site.articles)html=html.replaceAll(`href="./work/${a.slug}"`,`href="/design-news/${a.slug}"`);
 html=html.replaceAll('/assets/framerusercontent.com/sites/','/assets/framerusercontent.com/'+versionedSites+'/');
 await writeFile(file,html);
}
await writeFile(resolve(output,'kyte-config.js'),'window.KYTE_FIXES='+JSON.stringify(fixes).replaceAll('<','\\u003c')+';');
for(const [source,dest]of [['theme.js','kyte-theme.js'],['theme.css','kyte-theme.css'],['service-content.js','kyte-service-content.js'],['enhancements.js','kyte-fixes.js'],['repairs.css','kyte-fixes.css']])await cp(resolve(root,'framer-fixes',source),resolve(output,dest));
// The design system lives outside the normal Framer route manifest, while
// remaining available as a public, indexable HTML reference page.
const designSystemDir=resolve(output,'.','design-system');await mkdir(designSystemDir,{recursive:true});
const designSystemHtml=(await readFile(resolve(root,'framer-fixes/design-system.html'),'utf8')).replaceAll('{{SITE_URL}}',origin);
await writeFile(resolve(designSystemDir,'index.html'),designSystemHtml);
await cp(resolve(root,'framer-fixes/design-system.css'),resolve(output,'kyte-design-system.css'));
await writeFile(resolve(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(resolve(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...manifest.pages.map(u=>new URL(u).pathname).filter(p=>p!='/product-home'),'/design-system'].map(p=>`<url><loc>${origin+p}</loc></url>`).join('')}</urlset>`);
await writeFile(resolve(output,'build-info.json'),JSON.stringify({mode:'framer-components',production,pages:manifest.pages.length,patchedModules:modifiedModules},null,2));
console.log(`Built ${manifest.pages.length} pages from original Framer components. ${modifiedModules} modules have contact-text corrections. Original capture remains untouched.`);
