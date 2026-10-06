import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateInquiry,deliverInquiry} from './src/inquiry.mjs';
const project=fileURLToPath(new URL('./',import.meta.url));
const root=resolve(project,'framer-site');
const assets=resolve(project,'framer-site/assets');
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
const redirects=JSON.parse(await readFile(resolve(project,'content/redirects.json'),'utf8'));
const build=JSON.parse(await readFile(resolve(project,'dist/pages.json'),'utf8'));
const info=JSON.parse(await readFile(resolve(root,'build-info.json'),'utf8'));build.production=info.production;
for(const p of build.pages.filter(p=>p.path.startsWith('/design-news/')))redirects[p.path.replace('/design-news/','/work/')]=p.path;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.framercms':'application/octet-stream','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.otf':'font/otf','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf'};
const rates=new Map();
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(body))}
async function inquiry(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Method not allowed.'})}
 const allowedOrigins=new Set([`http://${host}:${port}`,`http://localhost:${port}`,`http://127.0.0.1:${port}`,build.domain]);
 if(req.headers.origin&&!allowedOrigins.has(req.headers.origin))return json(res,403,{error:'This request is not allowed.'});
 if(!String(req.headers['content-type']||'').includes('application/json'))return json(res,415,{error:'Please use the project inquiry form or email us.'});
 const ip=req.socket.remoteAddress,now=Date.now();for(const [key,v]of rates)if(now-v.start>600000)rates.delete(key);
 const rate=rates.get(ip)||{start:now,count:0};rate.count++;rates.set(ip,rate);if(rate.count>10)return json(res,429,{error:'Too many attempts. Please wait a few minutes or email us.'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>12000)return json(res,413,{error:'Please shorten your message.'})}}catch{return json(res,400,{error:'The request could not be read.'})}
 let value;try{value=JSON.parse(raw)}catch{return json(res,400,{error:'The request could not be read.'})}
 const result=validateInquiry(value);if(result.error)return json(res,422,{error:result.error});if(result.spam)return json(res,422,{error:'Please leave the extra website field empty.'});
 const delivered=await deliverInquiry(result.fields);return json(res,delivered.status,delivered.ok?{ok:true}:{error:delivered.error});
}
createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
 if(!build.production)res.setHeader('X-Robots-Tag','noindex, follow');
 try{
  const url=new URL(req.url,'http://localhost');const pathname=decodeURIComponent(url.pathname);
  if(pathname==='/api/inquiry')return await inquiry(req,res);
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end('Method not allowed');return}
  if(redirects[pathname]){res.writeHead(301,{Location:redirects[pathname]+url.search}).end();return}
  if(pathname.endsWith('/index.html')){const clean=pathname.slice(0,-11)||'/';res.writeHead(301,{Location:clean+url.search}).end();return}
  if(pathname.length>1&&pathname.endsWith('/')){res.writeHead(301,{Location:pathname.slice(0,-1)+url.search}).end();return}
  const isAsset=pathname.startsWith('/assets/');const base=isAsset?assets:root;
  let file=resolve(base,isAsset?pathname.slice(8):'.'+pathname);
  if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403).end('Forbidden');return}
  let info;try{info=await stat(file);if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file)}}catch{const html=await readFile(resolve(project,'dist/404/index.html'));res.writeHead(404,{'Content-Type':types['.html']}).end(req.method==='HEAD'?undefined:html);return}
  const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':isAsset?'public, max-age=86400':'no-cache'};
  if(extname(file)==='.framercms'&&url.searchParams.has('range')){
   const ranges=url.searchParams.get('range').split(',').map(r=>/^(\d+)-(\d+)$/.exec(r));
   if(ranges.length>500||ranges.some(r=>!r||Number(r[1])>Number(r[2])||Number(r[2])>=info.size)){res.writeHead(416).end('Invalid CMS range');return}
   const source=await readFile(file),body=Buffer.concat(ranges.map(r=>source.subarray(Number(r[1]),Number(r[2])+1)));
   res.writeHead(200,{...headers,'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);return;
  }
  let start=0,end=info.size-1,status=200;
  if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return}if(!m[1])start=Math.max(0,info.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]))}if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return}status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`}
  res.writeHead(status,{...headers,'Content-Length':end-start+1});if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
 }catch{if(!res.headersSent)res.writeHead(400,{'Content-Type':'text/plain'});res.end('Invalid request')}
}).listen(port,host,()=>console.log(`Kyte original Framer components → http://${host}:${port} (${build.production?'production':'preview'})`));
