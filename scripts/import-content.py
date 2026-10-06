"""Import local editorial sources and captured project media into editable JSON.
Run deliberately; content/site.json is the editable source after initial import.
"""
import json,re
from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
inv=json.loads((root/'audit/evidence/site-inventory.json').read_text())['pages']
docs=json.loads((root/'audit/evidence/source-documents.json').read_text())
class Node:
 def __init__(self,tag='',attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.children=[];self.parent=parent
 def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
 def all(self,tag):return ([self] if self.tag==tag else [])+[n for c in self.children if isinstance(c,Node) for n in c.all(tag)]
class Tree(HTMLParser):
 def __init__(self,text):super().__init__();self.root=Node();self.current=self.root;self.feed(text)
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.current);self.current.children.append(n)
  if tag not in ['img','input','br','hr','meta','link','source','path','wbr','area','base','embed']:self.current=n
 def handle_endtag(self,tag):
  n=self.current
  while n.parent and n.tag!=tag:n=n.parent
  if n.parent:self.current=n.parent
 def handle_data(self,text):self.current.children.append(text)
media={}
for route in ['/work','/design-news','/']:
 page=next(p for p in inv if p['path']==route);tree=Tree((root/page['file']).read_text()).root
 for a in tree.all('a'):
  href=a.attrs.get('href','').replace('./','/',1)
  imgs=a.all('img')
  if href.startswith(('/work/','/design-news/')) and imgs:
   media.setdefault(href,imgs[0].attrs)
def field(block,label):
 m=re.search(r'(?:^|\n)'+re.escape(label)+r'\s*\n([^\n]+)',block)
 return m[1].strip() if m else ''
def clean(s):return re.sub(r'\s+',' ',s).strip().replace('—',', ').replace('–','-')
def extract_body(block):
 body=block.split('Case Study Content\n',1)[-1].split('Relevant Testimonial')[0]
 out=[];skip=False
 for line in body.splitlines():
  line=line.strip()
  if not line:continue
  if line in ['Link to Raw Images','Notes for Editing / Processing']:skip=True;continue
  if line in ['NA','N/A']:skip=False;continue
  if skip or line.startswith(('http','[','Editorial note','Note :','Section Title','Section Content')):continue
  if 'Cluster:' in line or '✓' in line:continue
  if len(line)>100:out.append({'type':'p','text':clean(line)})
  elif len(line)>2:out.append({'type':'h2','text':clean(line)})
 return out
blocks={}
for b in docs['Case Studies/Kyte Case Studies Consolidated.docx'].split('General Information\n')[1:]:blocks[field(b,'Client Name')]=b
mapnames={'accountify-website':'Accountify','arka-inventory-website':'Arka Inventory','banza-social-content-production':'Banza','collectbee-website':'Collectbee','doodle-dept.-website':'Doodle Dept.','make-a-difference-social-media':'Make a Difference (MAD)','maya-explainer-video':'Maya (@heymaya.pro)','mirai-brand-identity':'Mirai','msr-assets':'MSR','ogale-machines-design-development':'Ogale Machines','revenue-grid-explainer-videos':'Revenue Grid','sapani-website':'Sapani Industrial Products','smash-guys':'Smash Guys','spicy-tango':'Spicy Tango','spicybayer-restaurant-website':'Spicy Bayer','sproutova-brand-identity':'Sproutova','staunch-fit-organic-growth':'Staunch.Fit','strength-socials':'Strength Socials','wynter-s-dreams-website-and-app':"Wynter's Dreams"}
projects=[]
for page in inv:
 if not page['path'].startswith('/work/'):continue
 slug=page['path'].split('/')[-1];name=mapnames[slug]
 b=blocks.get(name,'')
 if not b:
  b=next((v for k,v in blocks.items() if name.lower().replace(' ','') in k.lower().replace(' ','')), '')
 if not b:
  b=next((v for k,v in docs.items() if k.startswith('Case Studies/') and name.lower().split()[0] in k.lower()),'')
 role=field(b,'Project Name');subtitle=field(b,'Project Subtitle')
 if not role or role.startswith('['):role='Brand Identity Design' if slug=='msr-assets' else 'Website Design'
 if not subtitle or subtitle.startswith('['):subtitle=f'A selection of {name} work by Kyte, focused on {role.lower()}.'
 group='product' if any(x in slug for x in ['website','design-development']) else 'branding' if any(x in slug for x in ['identity','assets','spicy-tango','strength-socials']) else 'video' if 'explainer' in slug else 'social'
 cover=media.get(page['path'],{})
 if not cover and page['images']:cover=page['images'][0]
 gallery=[];seen=set()
 for im in page['images']:
  src=im.get('src','');stem=src.split('--')[0]
  if stem in seen or im.get('alt') in ['MSR Assets luxury real estate brand identity'] and slug!='msr-assets':continue
  if int(im.get('width') or 0)>=1000:
   seen.add(stem);gallery.append(im)
 body=extract_body(b) if b else []
 # No outcome percentages/quantified marketing claims are imported without reconciliation.
 body=[x for x in body if not re.search(r'\d[%+]|\d,\d{3}|\d+x\b|sold out|viral',x['text'],re.I)]
 projects.append({'slug':slug,'name':name,'role':clean(role),'summary':clean(subtitle),'group':group,'cover':cover,'gallery':gallery[:3],'body':body,'source':next((k for k,v in docs.items() if b and b in v),'Case Studies/Kyte Case Studies Consolidated.docx')})
blogs=[]
for b in re.split(r'\nTab \d+\n',docs['Blogs/Kyte_Blogs_SEO_Ready_Batch.docx']):
 title=field(b,'Blog Title (H1)')
 if not title:continue
 slug=field(b,'URL Slug').strip('/')
 # Keep published slugs, including existing punctuation.
 route=next((p['path'] for p in inv if p['path'].startswith('/design-news/') and p['path'].split('/')[-1].replace('(','').replace(')','')==slug.replace('(','').replace(')','')), '/design-news/'+slug)
 body=re.split(r'Body content[^\n]*\n',b,maxsplit=1)[-1].strip()
 blogs.append({'slug':route.split('/')[-1],'title':title,'description':field(b,'Excerpt / Subheading'),'author':field(b,'Author Name'),'category':field(b,'Category / Tag'),'cover':media.get(route,{}),'paragraphs':[x.strip() for x in body.splitlines() if x.strip()],'source':'Blogs/Kyte_Blogs_SEO_Ready_Batch.docx'})
(root/'content/site.json').write_text(json.dumps({'business':{'name':'Kyte','email':'contact@kyte-agency.com','phone':'','address':'','city':'Bengaluru, India','domain':'https://kyte-agency.com'},'projects':projects,'articles':blogs},indent=2,ensure_ascii=False)+'\n')
print('Imported',len(projects),'projects and',len(blogs),'articles. Covers:',sum(bool(x['cover']) for x in projects),sum(bool(x['cover']) for x in blogs))
