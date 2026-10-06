/* Page and section palettes layered over the original Framer components. */
(()=>{
 const seen=new WeakSet();
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
  const full=path!=='/'&&!path.startsWith('/services')&&path!=='/product-home';
  const roots=full?[document.body]:[];
  if(path==='/')for(const selector of ['.framer-b68tl','.framer-6mt1ho','.framer-v5qnca'])document.querySelectorAll(selector).forEach(el=>roots.push(el));
  if(path==='/services')for(const a of document.querySelectorAll('a[href*="/services/"]'))if(a.querySelector('h2')&&['0','2'].includes(a.style.getPropertyValue('--kyte-service-order')))roots.push(a);
  if(path.startsWith('/services/'))for(const selector of ['.framer-wryxz5','.framer-1y2xesg','.framer-1wze0gd','.framer-q2hgw4','.framer-1drfh0q'])document.querySelectorAll(selector).forEach(el=>roots.push(el));
  for(const el of document.querySelectorAll('a,button'))if(['Start a Project','Get started','Contact Us','View All Services'].includes(el.textContent.trim()))attr(el,'data-kyte-cta','');
  // Scan before applying tokens so hardcoded original surfaces can be identified.
  for(const root of roots){surfaces(root);attr(root,'data-kyte-tone','light')}
  if(!full)document.body.removeAttribute('data-kyte-tone');
  attr(document.body,'data-kyte-page-palette',full?'light':'mixed');
 };
})();
