import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const manifest=JSON.parse(await readFile(new URL('./cms-map.json',import.meta.url),'utf8'));
export default async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method))return res.writeHead(405,{Allow:'GET, HEAD'}).end();
 const url=new URL(req.url,'https://localhost');
 const key=url.searchParams.get('file')||url.pathname.replace(/^\/assets\//,'');
 const mapped=Object.hasOwn(manifest,key)?manifest[key]:null;if(!mapped)return res.writeHead(404).end('Not found');
 const source=await readFile(fileURLToPath(new URL('./data/'+mapped,import.meta.url)));
 let body=source;
 if(url.searchParams.has('range')){
  const ranges=url.searchParams.get('range').split(',').map(r=>/^(\d+)-(\d+)$/.exec(r));
  if(ranges.length>500||ranges.some(r=>!r||+r[1]>+r[2]||+r[2]>=source.length))return res.writeHead(416).end('Invalid CMS range');
  body=Buffer.concat(ranges.map(r=>source.subarray(+r[1],+r[2]+1)));
 }
 res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Length':body.length,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
 res.end(req.method==='HEAD'?undefined:body);
}
