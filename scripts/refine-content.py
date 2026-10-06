import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'content/site.json';d=json.loads(p.read_text())
updates={
'smash-guys':('Smash Guys','Production & Social Media','Building a restaurant’s presence before the doors opened.', [('The challenge','Smash Guys needed a social presence while its first location was still taking shape. Without a finished storefront, the content had to introduce the food, the people and the personality behind the brand.'),('Our approach','We used early pop-ups and content shoots to capture product photography, behind-the-scenes moments and short-form stories. A consistent visual direction connected that material across social posts and launch communication.'),('The work','The engagement brought together ongoing production, social creative and community-focused content. The resulting portfolio shows how the brand could communicate before and after its physical launch.')]),
'msr-assets':('MSR Assets','Brand Identity','A visual identity for a luxury real-estate brand.', [('Selected work','Explore the MSR Assets identity through the selected project imagery. The portfolio focuses on the visual work; additional project details will be added when the full case record is available.')]),
'ogale-machines-design-development':('Ogale Machines','Website Design & Development','Making specialized engineering easier to understand.', [('The challenge','Ogale Machines & Systems needed a website that made its industrial offering easier to understand and explore. Its engineering expertise had to translate into a clear online experience for prospective buyers.'),('Our approach','We structured the site around the company’s solutions, explaining the offer through a clear hierarchy, focused product information and a distinctive industrial visual direction.'),('The delivery','The project brought website design and development together, with responsive layouts and direct inquiry paths. The site gives the team a clearer way to present its capabilities and start a conversation with potential customers.')]),
'maya-explainer-video':('Maya','Video & Social Content','Explaining an AI-powered hiring platform through content.', [('The brief','Maya is an AI agent platform focused on hiring and job matching. The content needed to introduce the offer in a way people could follow.'),('The work','Kyte developed content around the product and its role in the hiring experience. The selected work brings the platform’s message into a visual format.')]),
'sapani-website':('Sapani Industrial Products','Website Design & Development','A clearer digital home for industrial products.', [('The challenge','Sapani needed a website that could present its industrial product range with clarity and help prospective customers find the information they needed.'),('Our approach','We organized the offer into a considered website structure, using product information and a clear visual hierarchy to guide exploration.'),('The delivery','The website brings the company’s products and capabilities into one accessible digital presentation, with clear paths to start an inquiry.')])}
for x in d['projects']:
 if x['slug'] in updates:
  x['name'],x['role'],x['summary'],body=updates[x['slug']];x['body']=[v for h,t in body for v in [{'type':'h2','text':h},{'type':'p','text':t}]]
 # Drop orphan headings, imported editorial fragments and any unidentified placeholder lines.
 x['body']=[b for i,b in enumerate(x['body']) if not (b['type']=='h2' and (i==len(x['body'])-1 or x['body'][i+1]['type']=='h2'))]
 if not x['body']:x['body']=[{'type':'h2','text':'The project'},{'type':'p','text':x['summary']}]
 if x['slug']=='banza-social-content-production':x['group']='social'
 if x['slug']=='doodle-dept.-website':x['name']='Doodle Dept.'
 # Avoid related-project thumbnails leaking into a case gallery.
 other={z['cover'].get('src','').split('--')[0] for z in d['projects'] if z['slug']!=x['slug']}
 x['gallery']=[im for im in x['gallery'] if im.get('src','').split('--')[0] not in other]
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
