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
parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1800" width="1200" height="1800" role="img" aria-labelledby="title desc">',
         '<title id="title">Corner window arch and central H25 bar</title>',
         '<desc id="desc">Upper window elevation and bending interaction at 19 stations. The plan below shows the nominal vertical return beside a guard sleeve. Tangent intervals show where a forged head meets existing steel. The final plan and elevation show an in-plane pier cage shift and its tight bend crossing. The last plan compares a transverse U tie with the available wall width.</desc>',
         '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#152b31}.small{font-size:14px}.note{font-size:15px}.panel{font-size:20px;font-weight:bold}.tick{font-size:13px}</style>',
         '<rect width="1200" height="1800" fill="#fff"/>']

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
label(631,539,'H25 within ±5 mm of the formed centre. Points are sampled ends.','small')
challenge = max(row['nominalDatumSensitivity']['bothAxes'] for row in profiles)
label(631,563,f'Nominal setout with one-sided loss on both axes reaches {challenge:.3f}.','small')

detail = read('current-house-central-arch-detail')
route, head = detail['verticalReturn'], detail['psbSingle25']
line(32,587,1168,587)
line(604,604,604,970,'#c6cdce')
label(32,626,'03    Vertical return at the upper guard sleeve','panel')
label(32,654,'Plan at Z 5570 mm. Bars and sleeve shown at nominal setout.','small')
def plan(x,y):
    return 50+1.38*(x-970), 676+1.38*(140-y)

outer, inner = (control['geometry'][k] for k in ('outsideConcreteFace','insideConcreteFace'))
def strip(xa,xb,fill):
    poly([plan(xa,outer),plan(xb,outer),plan(xb,inner),plan(xa,inner)],'#8b999b',1,fill,'polygon')
strip(970,1300,'#edf0ef')
sleeve_r = next(s['sleeveOD']/2 for s in read('current-house-guard-bracket')['new']['formedSleeves']
                if s['side']=='near')
strip(route['sleeveX']-sleeve_r,route['sleeveX']+sleeve_r,'#c9d0d2')
primary = read('current-house-ground-ties')['outer']['primaryBarXY']
lanes = sorted({y for x,y in primary if x>140})
for row in bars:
    for y in lanes:
        dot(*plan(contact['outsideInnerCoreFaces'][0]+row['upper'],y),1.38*10,'#566769','#34474a')
arch_bars = read('current-house-arch-detail')['archBars']
for leg in arch_bars['legs']:
    for y in control['geometry']['normalH16Centres']:
        dot(*plan(leg['startVertical'][0],y),1.38*arch_bars['diameter']/2,'#a9b6b7','#445a5e')
dot(*plan(route['witness']['verticalX'],detail['normalLane']),1.38*meta['barDiameterMm']/2,blue,blue)
label(53,946,'Dark grey H20 pier bars  ·  Light grey H16 arch tails','small')
label(53,970,'Teal trial H25  ·  Grey strip through-wall guard sleeve','small')

label(631,626,'04    Forged head on the straight tangent','panel')
label(631,654,'One permitted setout. Distances follow the bar from the spring.','small')
def chain(s):
    return 655+s*1.32
def interval(row,name,span,colour):
    lo,hi=span
    label(648,row-17,f'{name}  ·  {lo:.2f}–{hi:.2f} mm','small')
    line(chain(lo),row,chain(hi),row,colour,8)
    for value in span:
        line(chain(value),row-7,chain(value),row+7,colour,1.4)
interval(726,'Head positions checked',[head['firstPermittedStationMm'],head['lastStationIncludingHeadThicknessMm']],'#586c70')
interval(793,'Head intersects H16',head['h16CollisionStationsMm'],red)
interval(860,'Head intersects H20',head['h20CollisionStationsMm'],red)
line(chain(0),897,chain(360),897)
for station_mm in range(0,351,50):
    x=chain(station_mm)
    line(x,894,x,902)
    label(x,920,str(station_mm),'tick','middle')
lo,hi = head['h20CollisionStationsMm'][0],head['h16CollisionStationsMm'][1]
label(648,949,f'The two obstructions overlap from {lo:.2f} to {hi:.2f} mm.','small')
label(648,972,'Beyond the head allowance the straight shank reaches the H20.','small')
trial = detail['inPlaneCage']
line(32,993,1168,993)
label(32,1030,'05    Shift the end bars along the wall','panel')
label(32,1056,'Plan at Z 5570. The two guard sleeves stay on their existing axis.','small')
def shifted_plan(x,y):
    return 54+1.32*(x-925), 1080+1.32*(inner-y)
poly([shifted_plan(x,y) for x,y in ((925,outer),(1300,outer),(1300,inner),(925,inner))],
     '#879597',1,'#edf0ef','polygon')
sx = route['sleeveX']
poly([shifted_plan(x,y) for x,y in ((sx-sleeve_r,outer),(sx+sleeve_r,outer),
                                      (sx+sleeve_r,inner),(sx-sleeve_r,inner))],
     '#8b999b',1,'#c9d0d2','polygon')
for old_s, new_s in zip(trial['stationPairBefore'],trial['stationPairAfter']):
    for y in lanes:
        datum = contact['outsideInnerCoreFaces'][0]
        # Display the two states separately where an end pair moves.
        dot(*shifted_plan(datum+old_s,y),1.32*10,'none','#8b999b',1)
        dot(*shifted_plan(datum+new_s,y),1.32*10,'#566769','#34474a')
for leg in arch_bars['legs']:
    for y in control['geometry']['normalH16Centres']:
        dot(*shifted_plan(leg['startVertical'][0],y),1.32*8,'#a9b6b7','#445a5e')
dot(*shifted_plan(trial['legX'],detail['normalLane']),1.32*12.5,blue,blue)
label(49,1350,'Outline = original H20. Solid = moved H20. Teal = H25.','small')
label(49,1373,'The vertical leg fits between the end pair and the H16 tails.','small')

label(631,1030,'06    Through the bend','panel')
label(631,1056,'Enlarged elevation. The H25 and H16 are on different depth planes.','small')
# Equal horizontal and vertical scale to show the actual bend angle.
def turn_page(x,z):
    return 718+1.03*(x-1080), 1290-1.03*(z-5780)
bx,bz=trial['bendEndXZ']
R=trial['bendRadiusMm']
a=math.pi/2-angle
points=[turn_page(bx,bz-38)]+[turn_page(bx+R*(1-math.cos(a*i/32)),bz+R*math.sin(a*i/32)) for i in range(33)]
# The initial tangent extends beyond the drawing crop; it crosses the H16 within the view.
px,pz=trial['bendStartXZ']
points.append(turn_page(px+75*math.cos(angle),pz+75*math.sin(angle)))
poly(points,blue,7)
x16=route['h16X']
line(*turn_page(x16,5742),*turn_page(x16,5970),'#819094',5)
wx,wz=trial['bendAt20DegXZ']
xx,yy=turn_page(wx,wz)
dot(xx,yy,4,'white',red,2)
line(xx+5,yy,905,yy,'#9b7973')
label(913,yy-6,'20° from vertical','small')
gap = trial['bendToH16At20DegOnSteelErrorCardMm']
label(913,yy+15,f'{gap:.1f} mm on one permitted setout','small')
label(632,1350,'Teal H25 and grey H16 cross in elevation on the tangent.','small')
label(632,1373,'Concrete access and anchored confinement remain open.','small')
tie = read('current-house-central-arch-detail')['bendTie']
line(48,1400,1152,1400)
label(49,1435,'07    Adding a horizontal tie around the H25 turn','panel')
label(49,1464,f"Plan at Z{tie['trialZmm']:.1f} mm. One arm of the corner pier.",'small')
# Equal plan scale so the semicircular nose and round bars keep their shape.
def tie_page(x,y):
    return 52+(x-688)*.95, 1503+(y+68)*.95
leg_end, tangent = tie['legXmm']
yl, yr = tie['legYmm']
for y in tie['trialFacesYmm']:
    line(*tie_page(688,y),*tie_page(1280,y),'#28474a',2)
for y in (control['geometry']['outsideConcreteFace'],control['geometry']['insideConcreteFace']):
    line(*tie_page(688,y),*tie_page(1280,y),'#9a7772',1.4,'6 5')
r_tie = tie['noseCentreRadiusMm']
nose = [tie_page(tangent+r_tie*math.cos(math.pi*i/60-math.pi/2),
                 (yl+yr)/2+r_tie*math.sin(math.pi*i/60-math.pi/2)) for i in range(61)]
poly([tie_page(leg_end,yl),*nose,tie_page(leg_end,yr)],blue,9.5)
for x in trial['stationPairAfter']:
    for y in (43,97):
        dot(*tie_page(contact['outsideInnerCoreFaces'][0]+x,y),9.5,'#555d61','#555d61')
for x in (b['startVertical'][0] for b in read('current-house-arch-detail')['archBars']['legs']):
    for y in control['geometry']['normalH16Centres']:
        dot(*tie_page(x,y),7.6,'#899497','#899497')
dz_tie=tie['trialZmm']-trial['bendEndXZ'][1]
radius=trial['bendRadiusMm']
x_tie=trial['legX']+radius-math.sqrt(radius**2-dz_tie**2)
dot(*tie_page(x_tie,(yl+yr)/2),11.875,red,red)
label(630,1518,'Teal  H10 U with two 425 mm straight legs','panel')
label(630,1551,'Red  H25 turn      Dark grey  H20      Light grey  H16','small')
label(630,1594,'Dashed lines mark the existing 180 mm concrete.','note')
label(630,1622,'The solid lines add 28 mm at each face.','note')
label(630,1650,'42 mm of the trial glass insulation remains.','note')
label(630,1692,'One permitted setout leaves only 12.53 mm','note')
label(630,1718,'between the nose and a vertical H16.','note')
label(49,1771,'The expanded trial separates these bars. Concrete placing, anchorage and the two-arm force path remain open.','small')
parts.extend(['</svg>',''])
svg='\n'.join(parts)
out=args.output or Path(__file__).with_suffix('.svg')
if args.check:
    assert out.read_text()==svg
else:
    out.write_text(svg)
