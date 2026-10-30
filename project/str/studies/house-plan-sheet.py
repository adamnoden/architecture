"""A3, live-text paired B plans from frozen HOUSE study inputs.

This script draws evidence. It does not alter geometry or establish capacity,
accessibility, whole-house acceptance, or an adopted architectural arrangement.
Run with --check to compare the SVG without writing; --render also makes a PNG.
"""
from pathlib import Path
from html import escape
import hashlib
import json
import math
import subprocess
import sys

OUT = Path(__file__).resolve().parent
NAMES = ('house-plan.json', 'house-quantities.json', 'house-bedside.json', 'house-source.json')
DATA = {name: json.loads((OUT/name).read_text()) for name in NAMES}
plan, qty, bedside, source = (DATA[name] for name in NAMES)
assert plan['stair'] == [417.5,4432.5,2400,4335]
assert plan['ground_objects']['family-sofa1900x750'] == [3650,9600,750,1900]
assert bedside['beds']['bed2']['minimum_full_length_right'] == 192.5
assert bedside['beds']['bed3']['minimum_full_length_left'] == 65
assert len(plan['upper_target_reachable']) == 28

C = dict(ink='#203746', muted='#586b75', pale='#f4f7f7', finish='#d7e4e3',
         core140='#537e80', core215='#263f55', source='#b6ad9b', weather='#c9bca6',
         changed='#b96a2e', opening='#5e8ea6', furniture='#dce6da', wet='#dce9ef',
         red='#aa3e38', redpale='#fbefed', rule='#c4ced2')
S = .01  # 1 mm on A3 = 100 mm in the plan.
svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<title>Unadopted HOUSE B paired ground and upper plans, 1:100 on A3</title>',
       '<desc>Frozen geometry and furnishing comparison. HOUSE remains unpassed; front bedroom head-nook clearances remain restricted.</desc>',
       '<rect width="420" height="297" fill="white"/>',
       '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#203746} .halo{paint-order:stroke;stroke:white;stroke-width:1;stroke-linejoin:round}</style>']

def text(x,y,s,size=2.7,fill=None,weight=None,anchor='start',halo=False):
    extra = (' font-weight="'+str(weight)+'"') if weight else ''
    extra += ' class="halo"' if halo else ''
    svg.append(f'<text x="{x:.3f}" y="{y:.3f}" font-size="{size}" text-anchor="{anchor}"'+extra+f' style="fill:{fill or C["ink"]}">{escape(str(s))}</text>')

def rect(x,y,w,h,fill,stroke='none',sw=.2,rx=0,opacity=None):
    op = f' opacity="{opacity}"' if opacity is not None else ''
    svg.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{op}/>')

def line(x,y,xx,yy,col=None,sw=.2,dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    svg.append(f'<path d="M{x:.3f},{y:.3f} L{xx:.3f},{yy:.3f}" fill="none" stroke="{col or C["ink"]}" stroke-width="{sw}"{d}/>')

def arrow(x,y,xx,yy,col=None,sw=.28):
    col=col or C['ink']; line(x,y,xx,yy,col,sw)
    a=math.atan2(yy-y,xx-x)
    for d in (-.5,.5):line(xx,yy,xx-1.5*math.cos(a+d),yy-1.5*math.sin(a+d),col,sw)

def note(x,y,lines,size=2.65,step=4,fill=None,weight=None):
    for i,s in enumerate(lines):text(x,y+i*step,s,size,fill,weight)

def segments(w):
    horiz=w['a'][1]==w['b'][1]
    lo,hi = (w['a'][0],w['b'][0]) if horiz else (w['a'][1],w['b'][1])
    cuts=sorted(set([lo,hi]+[v for ab in w['holes'] for v in ab if lo<v<hi]))
    return horiz,[(a,b) for a,b in zip(cuts,cuts[1:]) if not any(a>=aa and b<=bb for aa,bb in w['holes'])]

def draw_plan(px,py,level):
    # Origin is the southwest source corner; increasing y is north/up on sheet.
    def xy(x,y):return px+x*S,py+(12000-y)*S
    def pr(x,y,w,h,fill,stroke='none',sw=.18,rx=0):
        X,Y=xy(x,y+h);rect(X,Y,w*S,h*S,fill,stroke,sw,rx)
    def pl(x,y,xx,yy,col=None,sw=.2,dash=None):line(*xy(x,y),*xy(xx,yy),col,sw,dash)
    def pt(x,y,s,size=2.35,fill=None,weight=None,halo=True):text(*xy(x,y),s,size,fill,weight,'middle',halo)
    def badge(code,x,y,tx=None,ty=None,col=None):
        X,Y=xy(x,y);col=col or C['changed']
        if tx is not None:line(X,Y,*xy(tx,ty),col,.22)
        svg.append(f'<circle cx="{X:.3f}" cy="{Y:.3f}" r="2.15" fill="white" stroke="{col}" stroke-width=".35"/>')
        text(X,Y+.85,code,2.45,col,'bold','middle')
    def ring(x,y,w,h,t,fill):
        pr(x,y,w,t,fill);pr(x,y+h-t,w,t,fill)
        pr(x,y+t,t,h-2*t,fill);pr(x+w-t,y+t,t,h-2*t,fill)
    # Retained four-layer outer envelope and courtyard walls.
    for start,t,col in [(0,102.5,C['weather']),(102.5,160,'#f7f5ee'),(262.5,140,C['source']),(402.5,15,'#e5e1d7')]:
        ring(start,start,12000-2*start,12000-2*start,t,col)
    for outer,t,col in [(417.5,15,'#e5e1d7'),(402.5,140,C['source']),(262.5,160,'#f7f5ee'),(102.5,102.5,C['weather'])]:
        ring(4250-outer,4250-outer,3500+2*outer,3500+2*outer,t,col)
    pr(4250,4250,3500,3500,'#f7f8f3',C['rule'],.15)
    # External apertures are retained source occurrences with exactly two recorded changes.
    external=[dict(o) for o in source['sourceInventory']['openings'][level] if o['wall'].startswith(('outer-','court-'))]
    changes={o['id']:o for o in plan['opening_changes'] if o['level']==level}
    for o in external:
        lo,hi=o['centre']-o['width']/2,o['centre']+o['width']/2
        if o['id'] in changes:lo,hi=changes[o['id']]['comparison_interval']
        wall=o['wall'];col=C['changed'] if o['id'] in changes else C['opening']
        if wall=='outer-south':r=(lo,0,hi-lo,417.5);a=(lo,180,hi,180)
        elif wall=='outer-north':r=(lo,11582.5,hi-lo,417.5);a=(lo,11820,hi,11820)
        elif wall=='outer-west':r=(0,lo,417.5,hi-lo);a=(180,lo,180,hi)
        elif wall=='outer-east':r=(11582.5,lo,417.5,hi-lo);a=(11820,lo,11820,hi)
        elif wall=='court-south':r=(lo,3832.5,hi-lo,417.5);a=(lo,4070,hi,4070)
        elif wall=='court-north':r=(lo,7750,hi-lo,417.5);a=(lo,7930,hi,7930)
        elif wall=='court-west':r=(3832.5,lo,417.5,hi-lo);a=(4070,lo,4070,hi)
        else:r=(7750,lo,417.5,hi-lo);a=(7930,lo,7930,hi)
        pr(*r,'white');pl(*a,col,.32 if o['kind']=='window' else .15,'1 .7' if o['kind']=='door' else None)
    walls=plan['ground_walls' if level=='GROUND' else 'first_walls']
    for w in walls:
        horizontal,parts=segments(w);core=w['t']-30
        svg.append('<g><title>'+escape(w['id']+f': {core:g} core + 15 + 15 finishes')+'</title>')
        for a,b in parts:
            a=max(a,417.5);b=min(b,11582.5)
            if b<=a:continue
            at=w['a'][1] if horizontal else w['a'][0]
            if horizontal:
                pr(a,at-w['t']/2,b-a,w['t'],C['finish'])
                pr(a,at-core/2,b-a,core,C['core140'] if core==140 else C['core215'])
            else:
                pr(at-w['t']/2,a,w['t'],b-a,C['finish'])
                pr(at-core/2,a,core,b-a,C['core140'] if core==140 else C['core215'])
        for a,b in w['holes']:
            at=w['a'][1] if horizontal else w['a'][0]
            pl(a,at,b,at,C['changed'],.17,'.7 .7') if horizontal else pl(at,a,at,b,C['changed'],.17,'.7 .7')
        svg.append('</g>')
    if level=='GROUND':
        for r in plan['occupied_dining_fields'].values():
            x,y,ww,hh=r;X,Y=xy(x,y+hh)
            svg.append(f'<rect x="{X:.3f}" y="{Y:.3f}" width="{ww*S:.3f}" height="{hh*S:.3f}" fill="#faf2e2" stroke="#bd9b60" stroke-width=".15" stroke-dasharray=".8 .7"/>')
    # All furniture and fixed-object footprints are exact input rectangles.
    objs=plan['ground_objects' if level=='GROUND' else 'first_objects']
    for name,r in objs.items():
        x,y,w,h=r;iswet=any(k in name for k in ('shower','basin','WC','bath','riser','Q350','water','cabinet','sink','cooking','storage','stack','shelf'))
        fill=C['wet'] if iswet else C['furniture']
        svg.append('<g><title>'+escape(f'{name}: x{x:g}, y{y:g}, {w:g} × {h:g}')+'</title>')
        pr(*r,fill,'#829690',.15)
        if name in ('bed2','bed3','bed4','principal'):
            pr(x+80,y+h-460,w/2-120,360,'#f5f8f3','#9aa99a',.12, .35)
            pr(x+w/2+40,y+h-460,w/2-120,360,'#f5f8f3','#9aa99a',.12,.35)
            pl(x,y+h-570,x+w,y+h-570,'#9aa99a',.14)
        if 'shower' in name:pl(x,y,x+w,y+h,'#a4b9c2',.13);pl(x,y+h,x+w,y,'#a4b9c2',.13)
        if name=='family-sofa1900x750':
            pl(x+w-100,y+100,x+w-100,y+h-100,'#748775',.45)
            arrow(*xy(x+370,y+h/2),*xy(x-370,y+h/2),'#617960',.25)
        svg.append('</g>')
    # Stair footprint and flight arrangement are retained apart from +600 y shift.
    st=plan['stair'];pr(*st,'#edf3f6','#7a99a8',.24)
    x,y,w,h=st
    for off in (0,1300):
        for k in range(10):pl(x+off,y+k*300,x+off+1100,y+k*300,'#9eb2bd',.13)
    pl(x+1100,y,x+1100,y+2700,'#9eb2bd',.13);pl(x+1300,y,x+1300,y+2700,'#9eb2bd',.13)
    arrow(*xy(x+550,y+350),*xy(x+550,y+2250),'#658293',.25)
    pt(x+1200,y+3350,'STAIR +600',2.35,C['ink'],'bold')
    pt(x+1200,y+3030,'1100 flights',2.15)
    if level=='FIRST':
        pr(*plan['void'],'#f6eee4','#a69685',.2)
        pt(6000,1550,'VOID',2.5,C['muted'],'bold');pt(6000,1220,'2230 × 2317.5',2.1)
        for bed,side in [('bed2','right'),('bed3','left')]:
            b=bedside['beds'][bed];bx,by,bw,bh=b['bed_rectangle']
            for section in b['sections']:
                gap=section[side+'_clear']
                if gap>=600:continue
                lo,hi=section['y_interval'];xx=bx+bw if side=='right' else bx-gap
                pr(xx,lo,gap,hi-lo,'#e5a59f',C['red'],.11)
        badge('B2',3250,3100,2690,2870,C['red'])
        badge('B3',8650,3420,9400,3140,C['red'])
    # Room labels sit in free drawn territories, not inherited room boxes.
    if level=='GROUND':
        labels=[(1450,2820,'STUDY',None),(4100,2230,'CLOAK',None),(8300,2130,'GUEST WC','4.14 m²'),(10650,1540,'UTILITY','4.50 m²'),
                (10750,4750,'PLANT','7.93 m²*'),(10750,7530,'PANTRY','3.48 m²'),(1590,10570,'READING','6.35 m²'),
                (5770,10650,'FAMILY / DINING','13.44 m²'),(10050,10350,'KITCHEN','12.93 m²'),(6000,2300,'ENTRANCE',None)]
    else:
        labels=[(3570,2390,'BEDROOM 2','10.62 m²'),(8410,2390,'BEDROOM 3','11.54 m²'),(10800,5310,'FAMILY BATH','5.78 m²'),
                (10400,7950,'EN SUITE','3.48 m²'),(1350,10470,'EN SUITE','6.35 m²'),(5790,9220,'BEDROOM 4','13.44 m²'),(10050,9120,'PRINCIPAL','12.93 m²')]
    for x,y,title,area in labels:
        pt(x,y,title,2.25,C['ink'],'bold')
        if area:pt(x,y-275,area,2.05,C['muted'])
    pt(6000,6080,'COURTYARD',2.7,C['muted'],'bold');pt(6000,5740,'3500 × 3500',2.4,C['muted'])
    badge('1',4870,8520,4450,8430)
    badge('2',8610,7100,9300,7100)
    badge('3',6860,8490,7400,8750)
    badge('4',1700,3750,2817.5,3247.5)
    if level=='GROUND':
        badge('U',10800,3100,10700,2550)
        badge('CS',6000,4680,6000,4050)
        badge('CN',6000,7100,6000,7900)
        # Direction arrows only: the unselected frame/hinge location is not invented.
        for ax in (5400,6600):arrow(*xy(ax,7650),*xy(ax,7100),C['changed'],.25)
        pt(6000,6740,'CN outward direction',2.15,C['changed'])
    else:badge('W',6740,7200,6700,7930)
    # Scale and coordinate evidence.
    X0,Y0=xy(0,12000);X1,_=xy(12000,12000)
    line(X0,Y0-3,X1,Y0-3,C['muted'],.18)
    for xx in (X0,X1):line(xx,Y0-4,xx,Y0-2,C['muted'],.18)
    text((X0+X1)/2,Y0-4.4,'12 000',2.55,C['muted'],anchor='middle')
    text(px,py+124,'SW origin (0, 0) · dimensions mm',2.2,C['muted'])
    for k in range(3):rect(px+87+k*10,py+124,10,1.2,C['ink'] if k%2==0 else 'white',C['ink'],.15)
    text(px+87,py+128.3,'0',2.1,C['muted']);text(px+117,py+128.3,'3 m',2.1,C['muted'],anchor='end')
    arrow(px+114,py-9,px+114,py-15,C['muted'],.26);text(px+114,py-17,'N',2.6,C['muted'],'bold','middle')
    return xy

text(14,16,'Substantial walls, aligned rooms, real openings',6,C['ink'],'bold')
text(14,25,'HOUSE B · paired ground and upper plans · 1:100 when printed on A3 at 100%',3.1,C['muted'])
rect(14,31,392,10,C['redpale'])
text(18,37.5,'PARTIAL DESIGN EVIDENCE — HOUSE UNPASSED',3.4,C['red'],'bold')
text(213,37.5,'Geometry comparison; no selected structure or capacity approval.',2.65,C['red'])
text(18,51,'GROUND FLOOR',3.5,C['ink'],'bold');text(157,51,'UPPER FLOOR',3.5,C['ink'],'bold')
draw_plan(18,66,'GROUND');draw_plan(157,66,'FIRST')
line(288,46,288,275,C['rule'],.3)

# Right-hand key: failure information precedes positive geometry evidence.
rect(296,48,110,55,C['redpale'])
text(300,55,'FRONT BEDROOMS REMAIN RESTRICTED',3.0,C['red'],'bold')
note(300,61,['28 named upper stations are reachable.','They do not establish full-length bilateral bed access.'],2.55,4,C['red'])
text(300,73,'B2  east side: 192.5 minimum',3.0,C['red'],'bold')
text(300,78,'497.5 of the 2000 bed length is below 600.',2.65,C['red'])
text(300,86,'B3  west side: 65 minimum',3.0,C['red'],'bold')
text(300,91,'960 of the 2000 bed length is below 600.',2.65,C['red'])
text(300,99,'600 is a diagnostic comparator, not a compliance limit.',2.35,C['red'])
text(298,109,'OTHER BEDS · nominal side minima',2.65,C['muted'],'bold')
text(298,114,'Bed 4: 650 / 627.5    Principal: 967.5 / 832.5',2.65,C['muted'])
line(298,119,406,119,C['rule'],.25)
text(298,126,'KEYED CHANGES / OPENING DUTIES',3.2,C['ink'],'bold')
keys=[
 ('1  rear-west-return · paired floors',['x4450; y8012.5–8852.5; finished 245.','rear-west y8852.5; door x3100–4000.']),
 ('2  service-spine / wet-spine',['x9300; core 140 + 15 + 15.','Plant / bath north walls align at y6500.']),
 ('3  rear-divider · paired floors',['x7400; finished 245. Ground arch 1500','spans y9450–10950; upper wall continuous.']),
 ('4  front L / shifted stair',['L return x2817.5; north wall y3247.5.','Stair y4432.5–8767.5, shifted +600.']),
 ('U  utility-north opening · moved 900',['At y2550; x10250–11150.','Former access through the guest WC is closed.']),
 ('CS  grand-court-entry-south',['2400 →1800; x5100–6900.','True arch / finite frame / thrust study remains.']),
 ('CN  grand-court-entry-north',['2400 retained; x4800–7200. Outward-to-court','handing is an operation comparison only.']),
 ('W  upper court-north-1',['Window shifts 150 west: x6200–7200.','Garden-entry remains 2400, x4800–7200.'])]
y=134
for title,ls in keys:
    text(298,y,title,2.85,C['changed'],'bold');note(298,y+4,ls,2.5,3.7);y+=17

# Material legend and bounded quantitative comparison.
legend=[(18,C['source'],'Retained source envelope 417.5'),(103,C['core140'],'B: core 140 +15 +15 =170'),(194,C['core215'],'B: core 215 +15 +15 =245')]
for x,col,s in legend:rect(x,202,5,3,col);text(x+7,204.5,s,2.5)
line(18,211,26,211,C['opening'],.4);text(29,212,'Retained external aperture',2.45)
line(104,211,112,211,C['changed'],.35,'1 .8');text(115,212,'Proposed opening / operation',2.45)
rect(210,209,5,3,C['furniture'],'#829690',.15);text(218,212,'Frozen furniture envelope',2.45)
text(18,218,'Source 125 partition controls remain in the source record. B thicknesses are family enquiries, not product selections.',2.35,C['muted'])
rect(14,225,264,50,'#f5f7f8')
text(18,232,'SPACE AND MASONRY RESERVATIONS',3.0,C['ink'],'bold')
text(180,232,'Source 125',2.6,C['muted'],anchor='end');text(219,232,'Proposed B',2.6,C['muted'],anchor='end');text(269,232,'Change',2.6,C['muted'],anchor='end')
rows={(r['level'],r['scheme']):r for r in qty['rows']}
comparisons=[('Ground internal finished-wall reservation','GROUND','wall_reservation_m2'),('Upper internal finished-wall reservation','FIRST','wall_reservation_m2'),('Upper remainder after full stair / void','FIRST','net_after_full_stair_aperture_and_void_m2')]
for i,(label,level,key) in enumerate(comparisons):
    a,b=rows[level,'source125'][key],rows[level,'proposedB'][key];y=239+i*5
    text(18,y,label,2.65);text(180,y,f'{a:.2f} m²',2.65,anchor='end');text(219,y,f'{b:.2f} m²',2.65,anchor='end');text(269,y,f'{b-a:+.2f} m²',2.65,anchor='end')
v=sum(rows[level,'proposedB']['gross_core_volume_at3100_before_openings_m3'] for level in ('GROUND','FIRST'))
text(18,257,f'B internal core volume: {v:.2f} m³ gross at 3100 height, before openings.',2.65,C['ink'],'bold')
note(18,263,['Planning reservations only; doorway thresholds included. These are not statutory net areas or material take-offs.',
             '* Plant area combines both sides of its new 1400 arch. No envelope, foundations or roof extension in the core quantity.'],2.35,4,C['muted'])

text(14,283,'Two sofas retained; second faces WEST. Four-place 1200 ×800 table; two 300 side tables replace the coffee-table trial.',2.55,C['ink'])
text(14,288,'Arch heads, finite bearings, services, wet floors, fire/acoustics, door operation, roof and foundations remain unresolved design duties.',2.5,C['muted'])
fingerprints=' · '.join(f'{name}: {hashlib.sha256((OUT/name).read_bytes()).hexdigest()[:10]}' for name in NAMES[:3])
text(14,293,f'Frozen inputs · {fingerprints}',2.15,C['muted'])
svg.append('</svg>')
result='\n'.join(svg)+'\n'
target=OUT/'house-plan.svg'
if '--check' in sys.argv:
    if target.read_text()!=result:raise SystemExit('STALE: house-plan.svg')
else:target.write_text(result)
if '--render' in sys.argv:
    subprocess.run(['inkscape',str(target),'--export-type=png','--export-filename='+'/tmp/str-house-plan.png','--export-width=2520'],check=True,capture_output=True,text=True)
print('Checked' if '--check' in sys.argv else 'Wrote',target)
