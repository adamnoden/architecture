"""Northwest roof quadrant and one side of the raised ridge, drawn from the case."""
import math


def draw(r):
    ink,green,blue,brick,wood='#263a37','#267357','#286581','#a04b39','#856540'
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="690" viewBox="0 0 1260 690" role="img" aria-labelledby="title desc">',
         '<title id="title">An open courtyard valley and a raised, ventilated ridge</title>',
         '<desc id="desc">The enlarged court overhang supplies a lower lateral air passage. The valley remains continuous. The new capped ridge rises above the structural comparison.</desc>',
         '<rect width="1260" height="690" fill="#faf9f5"/>',
         '<defs><marker id="air" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#267357"/></marker>',
         '<marker id="wet" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#286581"/></marker></defs>',
         '<g font-family="Arial,sans-serif">']
    def txt(x,y,msg,n=14,col=ink,bold=False):
        svg.append(f'<text x="{x:.2f}" y="{y:.2f}" font-size="{n}" fill="{col}" font-weight="{700 if bold else 400}">{msg}</text>')
    def rect(x,y,w,h,fill,stroke='none'):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def line(points,col,sw=1,dash='',arrow=''):
        pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        end=f' marker-end="url(#{arrow})"' if arrow else ''
        svg.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-dasharray="{dash}"{end}/>')
    def poly(points,fill):
        pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        svg.append(f'<polygon points="{pts}" fill="{fill}"/>')
    txt(32,38,'A slate ring roof with an unbroken wet valley',28,bold=True)
    txt(32,68,'Development comparison   ·   air crosses below the raised rails, while both weather layers drain toward their own eaves.',15)
    line([(30,89),(1230,89)],'#aebcb5')
    txt(32,122,'01   Northwest quarter in plan',19,bold=True)
    txt(632,122,'02   One side of the capped ridge',19,bold=True)
    loc=r['air']['tracedPathsXQ']
    k=.069
    px=lambda x:45+(x+200)*k
    py=lambda q:155+(q+200)*k
    xy=lambda pair:(px(pair[0]),py(pair[1]))
    def bounds(a,b,color,stroke='none'):
        rect(px(a),py(a),(b-a)*k,(b-a)*k,color,stroke)
    bounds(-200,5800,'#dfd8c7',wood)
    bounds(2125,5800,'#d3e4df')
    bounds(4525,5800,'#faf9f5',blue)
    line([xy((2125,5800)),xy((2125,2125)),xy((5800,2125))],wood,4)
    line([xy((-200,-200)),xy((2125,2125))],wood,2)
    line([xy((2160,2160)),xy((4505,4505))],blue,4,arrow='wet')
    for key in ['outer','court']:
        line([xy(p) for p in loc[key]],green,2.6,arrow='air')
    txt(47,145,'Outer eave',12,wood)
    txt(px(2600),py(1950),'Square ridge',13,wood)
    txt(px(2150),py(4630),'Open wet valley',13,blue)
    txt(px(4570),py(5230),'Court',13,blue)
    txt(48,598,'Green arrows show example dry paths, including their lateral turns.',14,green)
    txt(48,620,'The 275 mm court overhang leaves a 2950 mm open court.',14)
    # Cross-section at the ordinary side. The 165.28 mm raised cold board
    # preserves the inherited full-depth crown/steel clearance.
    chosen=r['families'][-1]; a=r['air']; cap=a['curbCutLipOffsets']
    sf=.49; t=math.tan(math.radians(25)); c=math.cos(math.radians(25))
    X=lambda s:696+sf*s
    Z=lambda h:319-sf*h
    field=lambda s:-s*t
    def zpts(points):return [(X(s),Z(z)) for s,z in points]
    def band(s0,s1,top_offset,normal,colour):
        poly(zpts([(s0,field(s0)+top_offset),(s1,field(s1)+top_offset),
                   (s1,field(s1)+top_offset-normal/c),(s0,field(s0)+top_offset-normal/c)]),colour)
    d=22.275+25+110
    rise=a['separateCapCrossflow']['raisedBoardTopAboveFieldAtSameQ']+d/c
    band(0,cap['curb'],rise-d/c,18,'#c19465')
    band(cap['curb'],760,-d/c,18,'#c19465')
    line(zpts([(cap['curb'],field(cap['curb'])+rise-d/c),(cap['curb'],field(cap['curb'])-d/c)]),wood,4)
    band(cap['newCut'],760,0,22.275,'#58696b')
    band(cap['newCut'],760,-22.275/c,25,'#95876a')
    band(cap['newCut'],760,-47.275/c,110,'#d8e9e4')
    line(zpts([(0,236),(cap['lip'],field(cap['lip'])+236),(cap['lip'],field(cap['lip'])+116)]),blue,4)
    line(zpts([(cap['newCut'],field(cap['newCut'])),(cap['newCut'],field(cap['newCut'])+120),
               (cap['newCut']+20,field(cap['newCut'])+120)]),blue,3)
    line(zpts([(630,field(630)-91),(390,field(390)-91),(304,field(304)-65),
               (304,field(304)+148),(420,field(420)+156),(560,field(560)+96)]),green,2.8,arrow='air')
    line(zpts([(50,field(50)+60),(220,field(220)+55),(282,field(282)+50)]),green,2,'5 3','air')
    txt(636,158,'Weather apex +8645.33',15,blue,True)
    txt(994,192,'Two supported cover cheeks',13,blue)
    line([(1000,199),(960,233)],blue)
    txt(1024,276,'116 mm below lip',13,blue)
    line([(1018,280),(X(520),Z(field(520)+80))],blue)
    txt(610,457,'Raised wind board',13,wood)
    line([(703,448),(X(190),Z(field(190)+rise-d/c))],wood)
    txt(620,520,'Continuous stepped secondary return',13,wood)
    line([(812,514),(X(250),Z(field(250)-d/c+14))],wood)
    txt(922,559,'110 mm air chamber',14,green)
    txt(822,617,'Inner curb 250  ·  slate cutoff 360  ·  lip 520',13)
    line([(30,642),(1230,642)],'#aebcb5')
    txt(32,669,'Dimensions in mm. The crown, cold supports, water receivers and temporary cover all change or require requalification.',14)
    return '\n'.join(svg+['</g></svg>'])+'\n'
