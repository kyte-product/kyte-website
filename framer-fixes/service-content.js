/* Populate original Framer content slots. Native process and FAQ props are set at build time. */
window.kyteServiceContent=(service,config)=>{
 const set=(el,key,value)=>{if(el&&el.getAttribute(key)!==value)el.setAttribute(key,value)};
 const text=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value};
 const rich=(selector,value)=>{const el=document.querySelector(selector);if(!el)return;let p=el.querySelector('p');if(!p){p=document.createElement('p');p.className='framer-text framer-styles-preset-15w8txd';el.append(p)}text(p,value)};
 const hide=selector=>document.querySelectorAll(selector).forEach(el=>set(el,'data-kyte-remove-duplicate',''));
 rich('.framer-193x117',service.summary);
 rich('.framer-1r2g55u',service.line);
 document.querySelectorAll('.framer-p8c924>[data-border]').forEach((card,i)=>{if(!service.scope[i])return;text(card.querySelector('h4'),service.scope[i][0]);text(card.querySelector('p'),service.scope[i][1])});
 rich('.framer-3v2c2a','A clear process, from the first conversation to the final handover.');
 const heading=(selector,value)=>{const h=document.querySelector(selector);text(h,value);if(h)set(h,'aria-label',value)};
 heading('.framer-1y2xesg .framer-hpypzq-container h2','What you take away');
 rich('.framer-1c96435','A closer look at the assets and decisions we can shape together. Your proposal defines the exact deliverables.');
 document.querySelectorAll('.framer-1y2xesg [data-framer-background-image-wrapper]').forEach((box,i)=>{const project=config.projects.find(p=>p.slug===service.proof[i%service.proof.length]);if(!project)return;let img=box.querySelector('img');if(!img){img=document.createElement('img');img.style.cssText='width:100%;height:100%;object-fit:contain;display:block;background:#0f0f0f';box.append(img)}set(img,'src',project.image);set(img,'alt',project.name+' work by Kyte')});
 const cards=[...document.querySelectorAll('.framer-1y2xesg [data-framer-name="Card 2"]')];
 cards.forEach((card,i)=>{const group=service.deliverables[i];if(!group)return;const h=card.querySelector('h2');text(h,group.title);set(h,'aria-label',group.title);[...card.querySelectorAll('[data-framer-name="Title"]')].forEach((row,j)=>{const ps=row.querySelectorAll('p');text(ps[0],group.items[j][0]);text(ps[1],group.items[j][1])})});
 heading('.framer-1941821 .framer-hpypzq-container h2','Working together');
 rich('.framer-14lzdck','What to expect when you bring a brief to Kyte.');
 heading('.framer-q2hgw4 .framer-hpypzq-container h2','Where this work lives');
 rich('.framer-1799ys5','Formats and touchpoints we can support, selected around your audience and the agreed scope.');

 rich('.framer-teyb33','Thoughtful creative work, shaped around your business and the people you want to reach.');
 document.querySelectorAll('.framer-o1710d>[data-border]').forEach((card,i)=>{const reason=service.reasons[i];if(!reason){set(card,'data-kyte-remove-duplicate','');return}text(card.querySelector('h6'),reason[0]);let p=card.querySelector('[data-kyte-reason]');if(!p){p=document.createElement('p');p.dataset.kyteReason='';p.className='framer-text framer-styles-preset-1jyvm9m';card.querySelector('[data-framer-name="Blog List Item"]').append(p)}text(p,reason[1])});
 document.querySelectorAll('.framer-12zsk1b>.framer-1wma9g4-container,.framer-12zsk1b>.framer-1fnhxgs-container,.framer-12zsk1b>.framer-17q9kyd-container,.framer-12zsk1b>.framer-mfpbjj-container').forEach((box,i)=>{const h=box.querySelector('h2');text(h,service.fit[i]);set(h,'aria-label',service.fit[i])});
 hide('[data-framer-name="Creator Link (Delete)"]');


 rich('.framer-2mcqni','A selection of projects that show how we turn a brief into work in the real world.');
 document.querySelectorAll('.framer-e7l9li .framer-1ohis0m>a').forEach((card,i)=>{const project=config.projects.find(p=>p.slug===service.proof[i]);if(!project){set(card,'href','/work');set(card,'data-kyte-corrected','/work');text(card.querySelector('.framer-11kagni p'),'Explore more work');text(card.querySelector('.framer-k1vr93 p'),'See the full Kyte portfolio');return}set(card,'href','/work/'+project.slug);set(card,'data-kyte-corrected','/work/'+project.slug);text(card.querySelector('.framer-11kagni p'),project.name);text(card.querySelector('.framer-k1vr93 p'),project.role);for(const img of card.querySelectorAll('img')){set(img,'src',project.image);if(img.hasAttribute('srcset'))img.removeAttribute('srcset');set(img,'alt',project.name+' project by Kyte')}});
 rich('.framer-wcuag4','A few things you might want to know before we get started.');
 const hero=document.querySelector('.framer-pr0ajs>[data-framer-background-image-wrapper]');const lead=config.projects.find(p=>p.slug===service.proof[0]);if(hero&&lead){let img=hero.querySelector('img');if(!img){img=document.createElement('img');img.style.cssText='width:100%;height:100%;object-fit:cover;display:block';hero.append(img)}set(img,'src',lead.image);set(img,'alt',lead.name+' project by Kyte')}
 set(document.body,'data-kyte-content-ready',service.slug);
};
