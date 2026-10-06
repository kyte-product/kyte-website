"""Generate responsive delivery assets; preserve captured original images."""
import json,hashlib
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1];source=root/'content/site.json';data=json.loads(source.read_text());out=root/'public/assets/optimized';out.mkdir(exist_ok=True)
cache={};before=after=0
for item in data['projects']+data['articles']:
 for image in [item.get('cover',{}),*item.get('gallery',[])]:
  original=image.get('original_src',image.get('src'))
  if not original:continue
  if original in cache:image.update(cache[original]);continue
  path=root/'public'/original.lstrip('/')
  with Image.open(path) as raw:
   img=ImageOps.exif_transpose(raw).convert('RGBA' if 'A' in raw.getbands() else 'RGB');w,h=img.size
   widths=sorted({min(w,n) for n in [480,960,1440]});variants=[];key=hashlib.sha256(original.encode()).hexdigest()[:14]
   for width in widths:
    target=out/f'{key}-{width}.webp';img.resize((width,round(h*width/w)),Image.Resampling.LANCZOS).save(target,'WEBP',quality=84,method=6)
    variants.append((f'/assets/optimized/{target.name}',width));after+=target.stat().st_size
   values={'original_src':original,'src':variants[-1][0],'srcset':', '.join(f'{url} {size}w' for url,size in variants),'width':w,'height':h}
   before+=path.stat().st_size;cache[original]=values;image.update(values)
source.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
print(f'Optimized {len(cache)} unique images. Originals {before/1024/1024:.1f}MB; all responsive variants {after/1024/1024:.1f}MB.')
