const menu=document.querySelector('#site-menu');
const opener=document.querySelector('.menu-toggle');
opener?.addEventListener('click',()=>{menu.showModal();opener.setAttribute('aria-expanded','true');menu.querySelector('[data-close]').focus()});
menu?.querySelector('[data-close]')?.addEventListener('click',()=>menu.close());
menu?.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)menu.close()}});
menu?.addEventListener('close',()=>{opener.setAttribute('aria-expanded','false');opener.focus()});
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 let count=0;document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++});
 document.querySelector('#filter-status').textContent=`Showing ${count} projects.`;
});
const form=document.querySelector('#inquiry');
if(form){
 const service=new URLSearchParams(location.search).get('service');if([...form.elements.service.options].some(o=>o.value===service))form.elements.service.value=service;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const status=document.querySelector('#form-status'),button=form.querySelector('button[type=submit]'),fallback=document.querySelector('#email-fallback');
  const fields=Object.fromEntries(new FormData(form));button.disabled=true;status.className='';status.textContent='Sending your inquiry…';fallback.hidden=true;
  try{
   const response=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields),signal:AbortSignal.timeout(15000)});
   const result=await response.json();if(!response.ok)throw new Error(result.error||'Your inquiry could not be sent. Please try again or email us.');
   status.textContent='Thank you. Your inquiry has been sent to Kyte.';form.reset();
   // First-party integration hook. No form values or personal data are attached.
   window.dispatchEvent(new CustomEvent('kyte:inquiry-success'));
  }catch(error){
   status.className='error';status.textContent=error.name==='TimeoutError'?'The request timed out. Your message is still here. Please try again or email us.':error.message;
   fallback.href='mailto:contact@kyte-agency.com?subject='+encodeURIComponent('Project inquiry'+(fields.company?' · '+fields.company:''))+'&body='+encodeURIComponent(`${fields.message}\n\nName: ${fields.name}\nEmail: ${fields.email}\nCompany: ${fields.company||''}\nService: ${fields.service||'To discuss'}`);
   fallback.hidden=false;
  }finally{button.disabled=false}
 });
}
