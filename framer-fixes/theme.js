/* Page and section palettes layered over the original Framer components. */
(()=>{
 const seen=new WeakSet();
 let lightRoots=[],frame=0;
 const darkLine='#262626',lightLine='#e7e6df';
 function syncRails(full){
  for(const rail of document.querySelectorAll('.framer-ysavql-container .framer-Oronr :is(.framer-v0cz9a,.framer-1e04nn0)')){
   const box=rail.getBoundingClientRect();if(!box.width||!box.height)continue;
   let paint=full?lightLine:darkLine;
   if(!full){
    const sections=lightRoots.filter(el=>el!==document.body&&el.id!=='template-overlay').map(el=>el.getBoundingClientRect())
     .filter(r=>r.width>=innerWidth*.7&&r.left<=box.left+1&&r.right>=box.right-1)
     .map(r=>[Math.max(0,Math.round(r.top-box.top)),Math.min(Math.round(box.height),Math.round(r.bottom-box.top))])
     .filter(([start,end])=>end>start).sort((a,b)=>a[0]-b[0]);
    const merged=[];
    for(const [start,end] of sections){
     const last=merged[merged.length-1];
     if(last&&start<=last[1])last[1]=Math.max(last[1],end);
     else merged.push([start,end]);
    }
    if(merged.length){
     const stops=[`${darkLine} 0px`];
     for(const [start,end] of merged)stops.push(`${darkLine} ${start}px`,`${lightLine} ${start}px`,`${lightLine} ${end}px`,`${darkLine} ${end}px`);
     stops.push(`${darkLine} ${Math.round(box.height)}px`);
     paint=`linear-gradient(to bottom,${stops.join(',')})`;
    }
   }
   if(rail.style.getPropertyValue('--kyte-rail-paint')!==paint)rail.style.setProperty('--kyte-rail-paint',paint);
  }
 }
 function syncNavigation(){
  frame=0;
  const full=document.body.dataset.kytePagePalette==='light';
  for(const nav of document.querySelectorAll('.framer-JMBgM')){
   const box=nav.getBoundingClientRect();if(!box.width)continue;
   const sample=Math.min(64,box.top+box.height/2);
   const light=full||lightRoots.some(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.top<=sample&&r.bottom>sample});
   attr(nav,'data-kyte-nav-tone',light?'light':'dark');
   if(light)attr(nav,'data-kyte-tone','light');else nav.removeAttribute('data-kyte-tone');
  }
  syncRails(full);
 }
 function queueNavigation(){if(!frame)frame=requestAnimationFrame(syncNavigation)}
 addEventListener('scroll',queueNavigation,{passive:true});
 addEventListener('resize',queueNavigation,{passive:true});
 const attr=(el,name,value)=>{if(el.getAttribute(name)!==value)el.setAttribute(name,value)};
 function surfaces(root){
  for(const el of [root,...root.querySelectorAll('*')]){
   if(seen.has(el)||!(el instanceof HTMLElement))continue;seen.add(el);
   if(['IMG','VIDEO','CANVAS','PICTURE','SOURCE'].includes(el.tagName))continue;
   const css=getComputedStyle(el),rgb=css.backgroundColor.match(/[\d.]+/g)?.map(Number);
   if(rgb&&rgb.length>=3&&(rgb.length<4||rgb[3]>.05)&&Math.max(...rgb.slice(0,3))-Math.min(...rgb.slice(0,3))<16){
    const shade=rgb[0];if(shade<70)attr(el,'data-kyte-surface',shade<20?'base':'card');
    else if(shade>220&&el.closest('a,button'))attr(el,'data-kyte-surface','button');
   }
   // Neutral decorative gradients must not create dark bands on an otherwise light page.
   if(css.backgroundImage.includes('gradient')&&!css.backgroundImage.includes('url('))attr(el,'data-kyte-gradient','');
   if(el.hasAttribute('data-framer-background-image-wrapper')&&!el.querySelector('img,video')&&css.backgroundImage.includes('data:image/svg'))attr(el,'data-kyte-pattern','');
  }
 }
 window.kyteApplyTheme=()=>{
  const path=location.pathname;
  const full=path!=='/'&&!path.startsWith('/services')&&path!=='/product-home'&&path!=='/design-system';
  const roots=full?[document.body]:[];
  const dialog=document.querySelector('#template-overlay');if(dialog)roots.push(dialog);
  if(path==='/')for(const selector of ['.framer-b68tl','.framer-6mt1ho','.framer-v5qnca'])document.querySelectorAll(selector).forEach(el=>roots.push(el));
  if(path==='/services')for(const a of document.querySelectorAll('a[href*="/services/"]'))if(a.querySelector('h2')&&['0','2'].includes(a.style.getPropertyValue('--kyte-service-order')))roots.push(a);
  if(path.startsWith('/services/'))for(const selector of ['.framer-wryxz5','.framer-1y2xesg','.framer-1wze0gd','.framer-q2hgw4','.framer-1drfh0q'])document.querySelectorAll(selector).forEach(el=>roots.push(el));
  for(const el of document.querySelectorAll('a,button'))if(el.matches('button[type="submit"]')||['Start a Project','Get started','Contact Us','View All Services','View Service','View All News','View Project'].includes(el.textContent.trim()))attr(el,'data-kyte-cta','');
  // Scan before applying tokens so hardcoded original surfaces can be identified.
  for(const root of roots){surfaces(root);attr(root,'data-kyte-tone','light')}
  if(!full)document.body.removeAttribute('data-kyte-tone');
  attr(document.body,'data-kyte-page-palette',full?'light':'mixed');
  lightRoots=roots;queueNavigation();
 };
})();
