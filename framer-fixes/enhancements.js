/* Compatibility repairs around the original Framer components. No replacement layouts. */
(()=>{
 const config=window.KYTE_FIXES;if(!config)return;
 let queued=false,lastPath='',lastFocus=null,activeOverlay=null;
 const articlePaths=new Set(Object.keys(config.pages).filter(p=>p.startsWith('/design-news/')));
 const set=(el,key,value)=>{if(el&&el.getAttribute(key)!==value)el.setAttribute(key,value)};
 const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
 function correctedPath(raw){
  if(!raw||/^(?:mailto:|tel:|https?:|#)/.test(raw))return null;
  let path=new URL(raw,location.origin+'/').pathname;
  if(['/staunch-fit-organic-growth','/msr-assets'].includes(path))return '/work'+path;
  if(path.startsWith('/work/')&&articlePaths.has(path.replace('/work/','/design-news/')))return path.replace('/work/','/design-news/');
  return null;
 }
 function head(){const path=location.pathname;const meta=config.pages[path];if(!meta)return;
  if(document.title!==meta.title)document.title=meta.title;
  for(const [key,value]of [['description',meta.description],['robots',config.production?'index,follow,max-image-preview:large':'noindex,follow']]){let el=document.querySelector(`meta[name="${key}"]`);if(!el){el=document.createElement('meta');el.name=key;document.head.append(el)}set(el,'content',value)}
  let canonical=document.querySelector('link[rel=canonical]');if(canonical)set(canonical,'href',meta.canonical);
  for(const [property,value]of [['og:title',meta.title],['og:description',meta.description],['og:url',meta.canonical]]){const el=document.querySelector(`meta[property="${property}"]`);if(el)set(el,'content',value)}
 }
 function content(){
  const path=location.pathname;set(document.body,'data-kyte-page',path);
  const main=document.querySelector('#main');if(main){set(main,'role','main');set(main,'tabindex','-1')}
  if(!document.querySelector('.kyte-skip-link')){const skip=document.createElement('a');skip.href='#main';skip.className='kyte-skip-link';skip.textContent='Skip to content';document.body.prepend(skip)}
  for(const a of document.querySelectorAll('a[href]')){const correct=correctedPath(a.getAttribute('href'));if(correct){set(a,'data-kyte-corrected',correct);set(a,'href',correct)}
   if(a.getAttribute('href')==='https://www.instagram.com/'||a.getAttribute('href')==='https://instagram.com/'){set(a,'href','/contact');for(const p of a.querySelectorAll('p'))if(p.textContent.includes('Follow me'))p.textContent='Connect with Kyte'}
  }
  if(path==='/services'){
   const cards=[];
   for(const [index,s]of config.services.entries()){
    for(const a of document.querySelectorAll(`a[href="./services/${s.slug}"],a[href="/services/${s.slug}"]`)){
     if(!a.querySelector('h2'))continue;cards.push({a,index});
     const inclusions=[...a.querySelectorAll('p')].filter(p=>!["What's Included",'Tools We Use'].includes(p.textContent.trim()));if(inclusions.length===4)inclusions.forEach((p,i)=>{if(p.textContent!==s.scope[i][0])p.textContent=s.scope[i][0]});
     for(const heading of a.querySelectorAll('h2'))if(/^0[1-4]$/.test(heading.textContent.trim())){if(heading.textContent!==`0${index+1}`)heading.textContent=`0${index+1}`;set(heading,'aria-hidden','true')}
     for(const p of a.querySelectorAll('h5,p'))if(p.textContent.startsWith('At Kyte, we combine brand strategy'))p.textContent=s.summary;
    }
   }
   if(cards.length===4&&cards.every(c=>c.a.parentElement===cards[0].a.parentElement)){const parent=cards[0].a.parentElement;const ordered=cards.toSorted((a,b)=>a.index-b.index);const actual=[...parent.children].filter(e=>cards.some(c=>c.a===e));if(actual.some((e,i)=>e!==ordered[i].a))for(const c of ordered)parent.append(c.a)}
   for(const c of cards){set(c.a,'data-kyte-service-order','');const order=String(c.index);if(c.a.style.getPropertyValue('--kyte-service-order')!==order)c.a.style.setProperty('--kyte-service-order',order)}
  }
  const service=config.services.find(s=>path==='/services/'+s.slug);if(service)window.kyteServiceContent?.(service,config);
  if(path==='/work/smash-guys'){
   const titles=config.smash.filter(x=>x.type==='h2').map(x=>x.text);const paragraphs=config.smash.filter(x=>x.type==='p').map(x=>x.text);
   const sections=[...document.querySelectorAll('.framer-1fm669n>div')].filter(el=>el.querySelector('h3'));
   sections.forEach((section,i)=>{if(i>=titles.length){set(section,'data-kyte-remove-duplicate','');return}const h=section.querySelector('h3'),p=section.querySelector('p');if(h&&h.textContent!==titles[i])h.textContent=titles[i];if(p&&p.textContent!==paragraphs[i])p.textContent=paragraphs[i]});
   for(const el of document.querySelectorAll('h1,h2'))if(el.textContent.includes('How We Sold Out Smash Guys Before the Launch'))el.textContent='Building the Smash Guys launch presence';
  }
  for(const p of document.querySelectorAll('p'))if(p.textContent.trim()==='Talk to our team'){const a=p.closest('a');if(a)set(a,'href','/contact')}
  for(const image of document.querySelectorAll('img'))if(!image.hasAttribute('alt'))set(image,'alt','');
  // Framer's visual trigger is an anchor without href. Keep its handler and appearance.
  for(const a of document.querySelectorAll('a:not([href])'))if(a.textContent.trim()==='Start a Project'){set(a,'role','button');set(a,'tabindex','0');set(a,'data-kyte-interactive','');set(a,'aria-haspopup','dialog')}
  for(const form of document.forms){set(form,'data-kyte-inquiry','');for(const input of form.querySelectorAll('input,textarea')){if(!input.getAttribute('aria-label')){const label=input.getAttribute('placeholder')||input.name;if(label)set(input,'aria-label',label)}}}
  const overlay=[...document.querySelectorAll('#template-overlay, [data-framer-name="Overlay"], [data-framer-name="template-overlay"], [data-framer-portal-id]')].find(el=>visible(el)&&el.querySelector('form'));
  if(overlay&&overlay!==activeOverlay){activeOverlay=overlay;lastFocus=document.activeElement;set(overlay,'role','dialog');set(overlay,'aria-modal','true');set(overlay,'aria-label','Tell us about your project');const close=overlay.querySelector('.framer-1sovcpc');if(close){set(close,'role','button');set(close,'aria-label','Close project dialog');set(close,'data-kyte-interactive','')}overlay.querySelector('input')?.focus()}
  if(activeOverlay&&!activeOverlay.isConnected){activeOverlay=null;if(lastFocus?.isConnected)lastFocus.focus()}
  window.kyteApplyTheme?.();
  head();
  if(path!==lastPath){lastPath=path;if(window.lenis?.scrollTo)window.lenis.scrollTo(0,{immediate:true})}
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;content()})}
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,characterData:true,subtree:true});
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-kyte-corrected]');if(a&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&e.button===0){e.preventDefault();e.stopImmediatePropagation();location.assign(a.dataset.kyteCorrected)}},true);
 document.addEventListener('keydown',e=>{const button=e.target.closest('[data-kyte-interactive]');if(button&&['Enter',' '].includes(e.key)){e.preventDefault();button.click()}
  if(e.key==='Tab'&&activeOverlay){const items=[...activeOverlay.querySelectorAll('input,textarea,select,button,a[href],[tabindex="0"]')].filter(visible);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
 });
 document.addEventListener('submit',async e=>{const form=e.target;if(!(form instanceof HTMLFormElement))return;e.preventDefault();e.stopImmediatePropagation();if(!form.reportValidity())return;
  const value=selector=>form.querySelector(selector)?.value?.trim()||'';
  const fields={name:value('input[placeholder*="full name"]'),email:value('input[type=email],input[placeholder*="email"]'),company:value('input[placeholder*="company"]'),message:value('textarea'),service:'',website:value('input[name=website]')};
  let status=form.querySelector('[data-kyte-form-status]');if(!status){status=document.createElement('p');status.dataset.kyteFormStatus='';status.role='status';form.append(status)}
  status.textContent='Sending your inquiry…';const submit=form.querySelector('[type=submit]');if(submit)submit.disabled=true;
  try{const res=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields),signal:AbortSignal.timeout(15000)});const result=await res.json();if(!res.ok)throw Error(result.error);status.textContent='Thank you. Your inquiry has been sent to Kyte.';form.reset()}
  catch(err){status.textContent=err.message||'Your inquiry could not be sent. Please email us.';let fallback=form.querySelector('[data-kyte-email-fallback]');if(!fallback){fallback=document.createElement('a');fallback.dataset.kyteEmailFallback='';fallback.textContent='Send your brief by email instead';form.append(fallback)}fallback.href=`mailto:${config.email}?subject=Project%20inquiry&body=${encodeURIComponent(fields.message+'\n\n'+fields.name+'\n'+fields.email)}`}
  finally{if(submit)submit.disabled=false}
 },true);
 window.addEventListener('popstate',schedule);window.addEventListener('load',schedule);schedule();
})();
