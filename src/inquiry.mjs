export function validateInquiry(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return {error:'Please provide your name, email and project details.'};
 const fields={};for(const key of ['name','email','company','service','message','website'])fields[key]=typeof value[key]==='string'?value[key].trim():'';
 if(fields.website)return {spam:true};
 if(!fields.name||fields.name.length>160)return {error:'Please enter your name (up to 160 characters).'};
 if(fields.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))return {error:'Please enter a valid email address.'};
 if(fields.message.length<10||fields.message.length>5000)return {error:'Please describe your project in 10 to 5,000 characters.'};
 if(fields.company.length>160)return {error:'Please keep the company name under 160 characters.'};
 if(!['','product','branding','social','video'].includes(fields.service))return {error:'Please choose one of the listed services.'};
 delete fields.website;return {fields};
}
export async function deliverInquiry(fields,env=process.env,fetcher=fetch){
 if(!env.INQUIRY_WEBHOOK_URL)return {status:503,error:'Online inquiries are not connected yet. Your message is still here. Please send it by email below.'};
 let destination;try{destination=new URL(env.INQUIRY_WEBHOOK_URL)}catch{return {status:503,error:'Online inquiries are temporarily unavailable. Please email us.'}};
 if(destination.protocol!=='https:')return {status:503,error:'Online inquiries are temporarily unavailable. Please email us.'};
 try{
  const response=await fetcher(destination,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(env.INQUIRY_WEBHOOK_TOKEN?{Authorization:`Bearer ${env.INQUIRY_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({type:'project-inquiry',...fields}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)return {status:502,error:'Your inquiry could not be delivered. Your message is still here. Please try again or email us.'};
  return {status:200,ok:true};
 }catch{return {status:502,error:'Your inquiry could not be delivered. Your message is still here. Please try again or email us.'}}
}
