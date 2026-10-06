import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Readable} from 'node:stream';

async function invoke(handler,url,method='GET',body='',headers={}){
 const req=Readable.from([body]);Object.assign(req,{url,method,headers:{host:'localhost',...headers}});
 const res={status:200,headers:{},setHeader(k,v){this.headers[k]=v},writeHead(s,h){this.status=s;Object.assign(this.headers,h);return this},end(b){this.body=b;return this}};
 await handler(req,res);return res;
}
test('Vercel CMS serves exact multi-ranges and rejects unknown files',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'kyte-cms-'));
 try{
  await cp(new URL('../deployment/cms.mjs',import.meta.url),join(dir,'index.mjs'));
  await mkdir(join(dir,'data'));await writeFile(join(dir,'data/test'),'0123456789');
  await writeFile(join(dir,'cms-map.json'),JSON.stringify({'sites/test.framercms':'test','sites-content-v1/test.framercms':'test'}));
  const {default:handler}=await import(pathToFileURL(join(dir,'index.mjs')));
  for(const key of ['sites/test.framercms','sites-content-v1/test.framercms']){
   const r=await invoke(handler,'/api/cms?file='+key+'&range=0-2,7-9');assert.equal(r.status,200);assert.equal(r.body.toString(),'012789');
  }
  assert.equal((await invoke(handler,'/api/cms?file=sites/test.framercms&range=0-99')).status,416);
  for(const key of ['../test','__proto__','missing'])assert.equal((await invoke(handler,'/api/cms?file='+key)).status,404);
  const head=await invoke(handler,'/api/cms?file=sites/test.framercms','HEAD');assert.equal(head.headers['Content-Length'],10);assert.equal(head.body,undefined);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('Vercel inquiry rejects invalid and cross-origin submissions without delivery',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'kyte-inquiry-'));
 try{
  await cp(new URL('../deployment/inquiry.mjs',import.meta.url),join(dir,'index.mjs'));await cp(new URL('../src/inquiry.mjs',import.meta.url),join(dir,'inquiry-core.mjs'));
  const {default:handler}=await import(pathToFileURL(join(dir,'index.mjs')));
  assert.equal((await invoke(handler,'/api/inquiry')).status,405);
  assert.equal((await invoke(handler,'/api/inquiry','POST','{}',{'content-type':'application/json',origin:'https://unrelated.example'})).status,403);
  assert.equal((await invoke(handler,'/api/inquiry','POST','{}',{'content-type':'application/json'})).status,422);
  assert.equal((await invoke(handler,'/api/inquiry','POST','invalid',{'content-type':'application/json'})).status,400);
 }finally{await rm(dir,{recursive:true,force:true})}
});
