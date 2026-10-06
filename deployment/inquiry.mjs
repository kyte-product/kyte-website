import {validateInquiry,deliverInquiry} from './inquiry-core.mjs';
export default async function handler(req,res){
 const send=(status,body)=>res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(body));
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'Method not allowed.'})}
 const origin=req.headers.origin;
 const hosts=new Set([req.headers.host,process.env.VERCEL_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL]);
 if(process.env.SITE_URL)try{hosts.add(new URL(process.env.SITE_URL).host)}catch{}
 if(origin){try{if(!hosts.has(new URL(origin).host))return send(403,{error:'This request is not allowed.'})}catch{return send(403,{error:'This request is not allowed.'})}}
 if(!String(req.headers['content-type']||'').includes('application/json'))return send(415,{error:'Please use the project inquiry form.'});
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>12000)return send(413,{error:'Please shorten your message.'})}
 let data;try{data=JSON.parse(raw)}catch{return send(400,{error:'The request could not be read.'})}
 const result=validateInquiry(data);if(result.error||result.spam)return send(422,{error:result.error||'Please leave the extra website field empty.'});
 const delivered=await deliverInquiry(result.fields);return send(delivered.status,delivered.ok?{ok:true}:{error:delivered.error});
}
