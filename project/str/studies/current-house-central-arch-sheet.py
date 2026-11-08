"""Draw the central bar and the adverse bending envelopes at the 19 analysis stations."""
import argparse
import json
import math
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--studies', type=Path, default=Path(__file__).resolve().parent)
parser.add_argument('--output', type=Path)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
studies = args.studies
def read(name):
    return json.loads((studies / (name + '.json')).read_text())
model = read('current-house-coupled-arches')['geometry']
opening = next(o for o in read('../../had/studies/water-replan')['model']['openings']['FIRST']
               if o['wall'] == 'outer-south' and o['centre'] == 1800)
control = next(c for c in read('current-house-outward-arches')['controls']
               if c['geometry']['normalWidthNominal'] == 180)
profiles = [row['centralH25Arch'] for row in control['coupled']]
meta = profiles[0]
old, new = ([max(row[key][i] for row in profiles) for i in range(19)]
            for key in ('adverseFourBarProfile', 'adverseWithSupplementProfile'))
half = opening['width'] / 2
rise = opening['head'] - opening['spring']
ri = (half**2 + rise**2) / (2*rise)
r = ri + model['arch'][1]/2
angle = math.asin(half/ri)
xc = opening['centre']
zc = model['springZ'] - r*math.cos(angle)
contact = read('current-house-window-receivers')['guard']['proposedContact']
warm = contact['outsideInnerCoreFaces'][0] + control['geometry']['insideConcreteFace']
bars = read('current-house-arch-detail')['archBars']['upperLStations']
tail = read('current-house-central-arch-detail')['nominalStraightTailMm']
tip = meta['freeTipStation']
last = meta['lastCreditedStation']
assert (meta['barDiameterMm'], tip, last) == (25, 12, 1)
red, blue = '#a33328', '#006367'
parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 576" width="1200" height="576" role="img" aria-labelledby="title desc">',
         '<title id="title">Corner window arch and central H25 bar</title>',
         '<desc id="desc">Upper window elevation shows the partial arch bar, straight tangent and two clashes with the previous pier cage. Adjacent plot shows maximum bending interaction at 19 discrete stations, before and after adding the bar.</desc>',
         '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#152b31}.small{font-size:14px}.note{font-size:15px}.panel{font-size:20px;font-weight:bold}.tick{font-size:13px}</style>',
         '<rect width="1200" height="576" fill="#fff"/>']

def line(x1,y1,x2,y2,colour='#899497',width=1,dash=None):
    dashed = f' stroke-dasharray="{dash}"' if dash else ''
    parts.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{colour}" stroke-width="{width}"{dashed}/>')

def label(x,y,words,style='note',anchor='start'):
    parts.append(f'<text x="{x:.2f}" y="{y:.2f}" class="{style}" text-anchor="{anchor}">{words}</text>')

def poly(points, colour, width, fill='none', kind='polyline'):
    coords = ' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
    parts.append(f'<{kind} points="{coords}" fill="{fill}" stroke="{colour}" stroke-width="{width}" stroke-linejoin="round"/>')

def dot(x,y,radius,fill,stroke,width=1):
    parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>')

# X/Z are millimetres, both mapped at the same scale. Crop the lower window.
def page(x,z):
    return 41+(x-805)*.293, 126+(6600-z)*.293

def station(i, radius=r):
    a = -angle+2*angle*i/18
    return page(xc+radius*math.sin(a), zc+radius*math.cos(a))

label(32,40,'Corner-window arch reinforcement','panel')
label(32,68,f'180 × 215 mm inner RC arch   ·   South elevation   ·   Occupied concrete face at Y {warm:g} mm')
line(32,84,1168,84)
label(32,116,'01    Bar route in elevation','panel')
label(631,116,'02    Bending at the arch stations','panel')
line(604,105,604,542,'#c6cdce')
low = 5400
outer = ri + model['arch'][1]
# Shade the supporting masonry/concrete only in the visible upper jamb zones.
for side,limit in ((0,805),(18,model['oppositeJambX'][1])):
    inner_end = xc + (-half if side == 0 else half)
    boundary = [page(limit,low),page(inner_end,low),station(side,ri),station(side,outer),
                page(limit,zc+outer*math.cos(angle))]
    poly(boundary,'#93a0a1',1,'#e6eaea','polygon')
arc = [i/10 for i in range(181)]
poly([station(i,ri) for i in arc]+[station(i,outer) for i in reversed(arc)],
     '#879597',1.25,'#e6eaea','polygon')
poly([station(i) for i in arc],'#91a3a4',1)
spring = (model['leftSpringX'],model['springZ'])
dx,dz = math.cos(angle),math.sin(angle)
x0,y0 = station(0)
xt,yt = page(spring[0]-tail*dx,spring[1]-tail*dz)
sl = [station(i/10) for i in range(tip*10+1)]
poly([(xt,yt),*sl],blue,4)
for i in range(19):
    x,y=station(i)
    dot(x,y,4 if i<=last or i==tip else 2, blue if i<=tip else '#fff',blue if i<=tip else '#768687')
for row in bars:
    cx=contact['outsideInnerCoreFaces'][0]+row['upper']
    z=spring[1]-(spring[0]-cx)*dz/dx
    xx,yy=page(cx,z)
    line(xx,yy-17,xx,yy+20,'#8d7772',1.3,'3 2')
    line(xx-5,yy-5,xx+5,yy+5,red,2.2)
    line(xx-5,yy+5,xx+5,yy-5,red,2.2)
    line(xx+6,yy,192,yy,'#9b7973')
    label(197,yy+4,f'H20 · Z {z:.2f}'.rstrip('0').rstrip('.'),'small')
x,y=station(0);line(x,y,x+24,y+26,blue);label(x+28,y+36,'0','small')
x,y=station(1);label(x-13,y-12,'1','small')
x,y=station(tip);line(x,y,x+12,y-24,blue);label(x+16,y-26,f'{tip} · free tip','small')
label(*page(2158,5730),'Window','note','end')
label(*page(2404,5538),'Fixed far','small','middle')
label(*page(2404,5475),'jamb','small','middle')
label(36,497,f'{tail:g} mm near tangent. Crosses two H20 bars in the previous pier cage.','small')
label(36,518,'The new bar carries bending at stations 0 and 1 in this calculation.','small')
label(36,539,'Lower window and pier omitted below Z 5400 mm.','small')

left,right,top,bottom=681,1146,171,415
ceiling=1.25
def graph(i,u):
    return left+(right-left)*i/18, bottom-(bottom-top)*u/ceiling
for v in (0,.25,.50,.75,1,1.25):
    yy=graph(0,v)[1]
    line(left,yy,right,yy,'#4c595d' if v==1 else '#d8dfe0',1.3 if v==1 else 1,'6 4' if v==1 else None)
    label(left-9,yy+4,f'{v:.2f}','tick','end')
label(left,153,'Adverse bending interaction','small')
for i in (0,3,6,9,12,15,18):
    xx=graph(i,0)[0];line(xx,bottom,xx,bottom+6);label(xx,bottom+22,str(i),'tick','middle')
for i,(a,b) in enumerate(zip(old,new)):
    dot(*graph(i,a),5,'#fff',red,1.8)
    dot(*graph(i,b),2.9,blue,blue)
label((left+right)/2,bottom+43,'Station from near spring to far spring','small','middle')
dot(645,487,5,'#fff',red,1.8);label(656,492,'Four existing H16','small')
dot(827,487,3,blue,blue);label(839,492,'With central H25','small')
label(631,516,f'Peak {max(old):.3f} → {max(new):.3f}. Dashed line marks the 1.000 limit.','small')
label(631,539,'Each point is a sampled member end. Intermediate extrema remain open.','small')
parts.extend(['</svg>',''])
svg='\n'.join(parts)
out=args.output or Path(__file__).with_suffix('.svg')
if args.check:
    assert out.read_text()==svg
else:
    out.write_text(svg)
