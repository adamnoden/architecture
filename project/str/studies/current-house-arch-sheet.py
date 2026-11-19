"""Draw the actual corner opening and both reinforcement interfaces."""
import html
import json
import math
from pathlib import Path
import sys

D=Path(__file__).resolve().parent
source=json.loads((D/'current-house-arch-detail.json').read_text())
response=json.loads((D/'current-house-coupled-arches.json').read_text())
base=source['oppositeJambBase']
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1480 1020" width="1480" height="1020" role="img" aria-labelledby="title"><title id="title">Corner arch, independent window and two jamb connections</title><rect width="1480" height="1020" fill="#f7f5ef"/>']

def rect(x,y,w,h,fill,stroke='none',sw=0):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

def line(pts,stroke,width=2,fill='none'):
    points=' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)
    parts.append(f'<polyline points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"/>')

def text(x,y,s,size=18,weight=400,colour='#182d36'):
    parts.append(f'<text x="{x}" y="{y}" font-family="DejaVu Sans,sans-serif" font-size="{size}" font-weight="{weight}" fill="{colour}">{html.escape(s)}</text>')

def circle(x,y,r,c):parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>')

rc='#94b4b1'; boundary='#354f52'; main='#a84b2e'; steel='#255a80'; finish='#bf945c'; ink='#243740'
text(42,58,'Eight corner windows: the arch and its receivers',38,700)
text(44,92,'First floor  /  Proposed structural research  /  Dimensions in millimetres',18,400)
line([(42,116),(1436,116)],'#adb9b6',2)
text(44,154,'Inner elevation',24,700)
text(44,181,'NW example. The eight occurrences share the section and take different ceiling loads.',16)
scale=.202
x=lambda u:55+(u-650)*scale
y=lambda z:214+(6540-z)*scale
xy=lambda u,z:(x(u),y(z))
def block(l,b,r,t,fill):rect(x(l),y(t),(r-l)*scale,(t-b)*scale,fill)
block(650,3170,2820,3920,'#bed0cd');block(650,3920,1262.5,6540,'#d7e3de');block(1262.5,5000,1300,6200,rc)
block(2300,3920,2505,6050,rc);block(2300,3020,2505,3920,rc)
rr=1000**2/2400+150; a=math.asin(500/rr);cz=3450+2850-rr
arc=lambda r:[xy(1800+r*math.sin(t),cz+r*math.cos(t)) for t in [-a+2*a*i/100 for i in range(101)]]
line(arc(rr)+arc(rr+215)[::-1]+[arc(rr)[0]],boundary,1.5,rc)
for radial in [rr+49,rr+215-49]:line(arc(radial),steel,2)
for leg in source['archBars']['legs']:
    u,z=leg['start'];v,t=leg['startVertical'];w,b=leg['endVertical']
    line([xy(u,z),xy(v,t),xy(w,b)],steel,2)
    line([xy(3600-u,z),xy(3600-v,t),xy(3600-w,3020)],steel,2)
frame_arc=arc(rr-35)
# OAS frame outside sides are 930 mm apart. Its spring intersections follow
# the true circular profile rather than an invented rectangular glazing head.
line([xy(1335,4335),xy(2265,4335),*frame_arc[::-1],xy(1335,4335)],finish,4)
line([xy(1300,4300),xy(2300,4300)],boundary,1.5)
for z,name in [(6540,'6540  ring underside'),(5000,'5000  local RC toe starts'),(4335,'4335  window bottom'),(3920,'3920  floor beam top'),(3170,'3170  floor beam soffit')]:
    line([xy(2580,z),xy(2730,z)],'#899896',1);text(x(2770),y(z)+5,name,15)
text(51,982,'Blue  H16  ·  Green  concrete  ·  Ochre  removable frame',15,500)
line([(768,140),(768,958)],'#b5bdb9',1)
text(800,155,'Near jamb  /  bar plan',23,700)
text(800,186,'Four H16 tails turn down inside the existing 140 mm wall width.',16)
# Plan uses genuine normal and longitudinal scales.
k=1.45;qx=lambda xv:814+(xv-970)*k;qy=lambda v:220+v*k
rect(qx(970),qy(0),330*k,140*k,'#d5e1dc',boundary,1)
for v in [745,815]:
    for n in [43,97]:circle(qx(262.5+v),qy(n),10*k,main)
for leg in source['archBars']['legs']:
    for n in [49,91]:circle(qx(leg['startVertical'][0]),qy(n),8*k,steel)
line([(qx(1262.5),qy(0)),(qx(1262.5),qy(140))],'#738b85',1.5)
text(814,455,'H20 at 745 / 815 local. Former toe at 1262.5.',16)
text(814,481,'RC now reaches the raw jamb at 1300 over Z5000–6200.',16)
text(814,507,'900 straight after bend  /  828 required in the bond comparison.',16)
line([(800,537),(1438,537)],'#b5bdb9',1)
text(800,579,'Opposite jamb  /  section normal to wall',23,700)
text(800,608,'The local foot overlaps the solid head of the aligned ground jamb.',16)
px=lambda n:920+(n+30)*1.3;pz=lambda z:644+(4550-z)*.16
line([(px(0),pz(4550)),(px(140),pz(4550)),(px(140),pz(4000)),(px(140),pz(3020)),(px(-85),pz(3020)),(px(-85),pz(4000)),(px(0),pz(4550))],boundary,2,rc)
for hi,lo in [(49,-38),(91,14)]:line([(px(hi),pz(4550)),(px(lo),pz(4000)),(px(lo),pz(3020))],steel,4)
for h in [3920,3170,3020]:line([(px(140),pz(h)),(px(180),pz(h))],boundary,1);text(px(184),pz(h)+4,str(h),14)
text(800,933,'225 at foot / 85 outward / inside face retained.',16)
text(800,958,'150 into the lower wall. Ground arch extrados clears by 135.8.',16)
parts.append('</svg>')
output=Path(__file__).with_suffix('.svg');contents='\n'.join(parts)+'\n'
if '--check' in sys.argv:assert contents==output.read_text()
else:output.write_text(contents)
