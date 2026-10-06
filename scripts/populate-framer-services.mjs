/* Supply content to the captured Framer component props, preserving their rendering and interactions. */
export function populateServiceModule(source){
 if(!source.includes('className:`framer-juok5z-container`'))return source;
 const helper='const kyteService=()=>window.KYTE_FIXES.services.find(s=>location.pathname.endsWith("/"+s.slug))||window.KYTE_FIXES.services[0];\n';
 for(const [index,key]of ['discover','define','develop','deliver'].entries()){
  for(const [suffix,field]of [['Headline',0],['Body',1]])source=source.replaceAll(new RegExp(`${key}${suffix}:[A-Za-z_$][\\w$]*(?=[,}]|$)`,'g'),`${key}${suffix}:kyteService().steps[${index}][${field}]`);
 }
 // The second native panel is about collaboration, not a duplicate design process.
 const collabStart=source.indexOf('className:`framer-17556w1-container`'),collabEnd=source.indexOf('})})})',collabStart);
 let collaboration=source.slice(collabStart,collabEnd);
 for(const [index,key]of ['discover','define','develop','deliver'].entries()){
  collaboration=collaboration.replaceAll(`kyteService().steps[${index}][0]`,`kyteService().collaboration[${index}][1]`).replaceAll(`kyteService().steps[${index}][1]`,`kyteService().collaboration[${index}][2]`);
  collaboration=collaboration.replace(new RegExp(key+'Label:`[^`]*`'),`${key}Label:kyteService().collaboration[${index}][0]`);
 }
 source=source.slice(0,collabStart)+collaboration+source.slice(collabEnd);
 // Reuse the existing eight-cell logo grid for supported formats, rendered as text.
 const gridStart=source.indexOf('className:`framer-y2tt66-container`'),gridEnd=source.indexOf('})})})',gridStart);
 let grid=source.slice(gridStart,gridEnd).replace('columnsMobile:4','columnsMobile:2');
 for(let i=0;i<8;i++)grid=grid.replace(new RegExp('logo'+(i+1)+':\\$\\([A-Za-z_$][\\w$]*\\)'),`logo${i+1}:{src:"format",alt:kyteService().formats[${i}]}`);
 source=source.slice(0,gridStart)+grid+source.slice(gridEnd);
 const image='s(`img`,{src:e.src,srcSet:e.srcSet,alt:e.alt||`Client logo`,style:{height:`100%`,width:`100%`,objectFit:`contain`,filter:x?`grayscale(1)`:`none`}})';
 source=source.replace(image,'s(`span`,{style:{fontFamily:`Geist, sans-serif`,fontSize:16,color:`#ffffff`,textAlign:`center`,lineHeight:1.4},children:e.alt})');
 // These counts describe content on the page, not claimed business performance.
 for(const [index,node]of ['framer-5txy66-container','framer-jgo4j3-container','framer-qd0u6a-container'].entries()){
  const start=source.indexOf('className:`'+node+'`'),end=source.indexOf('})})})',start);let block=source.slice(start,end);
  block=block.replace(/jR7OqNXmE:[A-Za-z_$][\w$]*/, 'jR7OqNXmE:``').replace(/T8GOWYbSr:[A-Za-z_$][\w$]*/, 'T8GOWYbSr:'+JSON.stringify(['Service capabilities','Supported formats','Selected case studies'][index])).replace(/VP0PvdGkt:[A-Za-z_$][\w$]*/, 'VP0PvdGkt:'+['kyteService().scope.length','kyteService().formats.length','kyteService().proof.length'][index]);
  source=source.slice(0,start)+block+source.slice(end);
 }
 const questions=['svZsCKZ7a','UV7N3G2yB','IdiX4w72s','ApkKi7SYs','Yp26WXhzg','yKqHH3CY6'];
 const answers=['xHGoJVa3_','j_EfdrGoD','yIgVEHYaT','rV343XnZp','SZGafHI2T','Wb41KwT0B'];
 const start=source.indexOf('className:`framer-15xtt1u-container`'),end=source.indexOf('})})})',start);
 let block=source.slice(start,end);
 for(let i=0;i<6;i++)for(const [keys,field]of [[questions,0],[answers,1]])block=block.replace(new RegExp(`${keys[i]}:[A-Za-z_$][\\w$]*(?=[,}]|$)`),`${keys[i]}:kyteService().faqs[${i}][${field}]`);
 source=source.slice(0,start)+block+source.slice(end);
 return helper+source;
}
