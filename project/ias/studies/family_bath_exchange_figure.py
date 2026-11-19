"""Draw the two architectural routes and the controlling sections."""
from math import radians,sin,cos,sqrt
from html import escape

def figure(d):
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 930" role="img" aria-label="Family bath replacement, room route, stair landing and east window section">',
         '<rect width="1180" height="930" fill="#faf7ef"/><style>text{font:15px sans-serif;fill:#233c46}.title{font:bold 31px sans-serif}.sub{font:bold 21px sans-serif}.small{font:13px sans-serif}.tag{font:bold 12px sans-serif;letter-spacing:1.5px;fill:#855134}</style>']
    ink='#52696b';cool='#28766d';warm='#a45532';grey='#e6e0d4'
    def txt(x,y,s,cls=''):out.append(f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}">{escape(s)}</text>')
    def path(points,color,width=1,fill='none',close=False,dash=''):
        coords=' '.join(('M' if i==0 else 'L')+f'{x:.1f},{y:.1f}' for i,(x,y) in enumerate(points))
        out.append(f'<path d="{coords}'+(' Z' if close else '')+f'" stroke="{color}" stroke-width="{width}" fill="{fill}" stroke-dasharray="{dash}"/>')
    def rect(x,y,w,h,fill,stroke=ink):out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}"/>')
    def disc(x,y,r,fill,stroke=ink):out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}"/>')
    def plan(tx,ty,x0,y0,k):
        P=lambda x,y:(tx+(x-x0)*k,ty-(y-y0)*k)
        def box(x,y,w,h,fill,stroke=ink):
            X,Y=P(x,y+h);rect(X,Y,w*k,h*k,fill,stroke)
        return P,box
    txt(28,44,'How the family bath can leave the house','title')
    txt(29,71,'DYNA SET 626  ·  46 kg bare  ·  480 × 730 × 1690 upright transport frame  ·  all dimensions in mm')
    path([(28,89),(1152,89)],ink)
    txt(30,119,'01   FAMILY ROOM','tag');txt(30,147,'Turn past the open leaf and its keeper','sub')
    P,B=plan(47,449,9310,3775,.111)
    B(9397,3800,2170.5,2600,'#f1ebdf');B(9397,4675,600,750,grey);B(10907.5,5722.5,650,355,grey)
    B(11227.5,5200,340,450,grey);B(11367.5,4525,200,650,'#d3bcae');B(9560,3800,1600,700,'none')
    B(9397,5516.5,8,767,'#faf7ef','#faf7ef')
    a=radians(85);v=[(9409+x*sin(a)+n*cos(a),6281-x*cos(a)+n*sin(a)) for x,n in [(0,0),(762,0),(762,44),(0,44)]]
    path([P(*p) for p in v],ink,1,'#b7c8bd',True);disc(*P(10585,6065),300*.111,'#cfac90')
    for name,color in [('approach',warm)]:
        pts=d[name];path([P(x,y) for x,y,_ in pts],color,3)
    pts=d['east']['roomPose'];path([P(x,y) for x,y,_ in pts],cool,3)
    for x,y,deg in [d['approach'][4],d['approach'][-1]]:
        a=radians(deg)
        path([P(x+u*cos(a)-v*sin(a),y+u*sin(a)+v*cos(a)) for u,v in [(-240,-365),(240,-365),(240,365),(-240,365)]],warm,1,'none',True)
    path([P(10970,4600),P(11850,4600)],cool,2,dash='5 3')
    for y,ss in [(195,'Brown · tightly steered room exit'),(223,'Green · east window approach'),(261,'An 85° lever enters the old'),(281,'730-wide transport path.'),(319,'Keep the 300-radius attendant'),(339,'beside the larger WC.'),(377,'Raise the frame before crossing'),(397,'the east radiator.')]:txt(335,y,ss,'small')
    path([(573,104),(573,460)],'#b9b4a8')
    txt(598,119,'02   PROTECTED STAIR','tag');txt(598,147,'A turn that clears the rails','sub')
    P,B=plan(637,398,429.5,7000,.112)
    B(429.5,7132.5,2388,1623,'#f1ebdf');B(1513.5,6750,220,482.5,'#cbbaab');B(429.5,8655.5,2388,100,grey)
    t=d['turn']['route'];path([P(x,y) for x,y,ang,ox,oy in t],cool,3);path([P(ox,oy) for x,y,ang,ox,oy in t],warm,2)
    for i in [2,len(t)//2,len(t)-4]:
        x,y,ang,_,_=t[i];a=radians(ang)
        path([P(x+u*cos(a)-v*sin(a),y+u*sin(a)+v*cos(a)) for u,v in [(-365,-508),(365,-508),(365,508),(-365,508)]],cool,1,'none',True)
    txt(602,454,'Green · load centre     Brown · side-attendant geometry','small')
    for y,ss in [(208,'R425 curves'),(235,'1016 long'),(262,'730 wide'),(302,'Side stance'),(324,'does not meet'),(346,'the documented'),(368,'control method.')]:txt(988,y,ss,'small')
    path([(28,478),(1152,478)],ink);txt(30,508,'03   EAST WINDOW','tag');txt(30,536,'Keep the beams clear of the sill','sub')
    P,B=plan(150,840,4100,700,.127)
    e=d['east'];R=e['archRadius'];cz=e['archCentreZ']
    def arch(rad):
        half=500-(R-rad)
        pts=[P(4600-half,850)]
        for j in range(101):
            y=4600-half+2*half*j/100
            pts.append(P(y,cz+sqrt(max(0,rad*rad-(y-4600)**2))))
        pts.append(P(4600+half,850));return pts
    path(arch(R),ink,1);path(arch(R-75),ink,1,dash='4 2')
    B(4360,990,480,1690,'#c1dbcf',cool);B(4355,950,50,40,'#a65c39');B(4795,950,50,40,'#a65c39')
    path([P(4120,925),P(5090,925)],warm,1,dash='5 3')
    txt(32,597,'Frame inset','small');txt(32,617,'75 normal','small');txt(32,658,'Crown +2850','small')
    txt(303,608,'Pack top +2680');txt(303,639,'25 clear under the rail at the sill','small')
    txt(303,666,'Local sill +850 and inset 75.','small');txt(303,686,'Rail underside +950.','small')
    txt(303,728,'Two 40-deep rails cross the wall.','small');txt(303,748,'A 150-deep member at the same','small');txt(303,768,'underside consumes the crown.','small')
    path([(573,493),(573,868)],'#b9b4a8');txt(598,508,'04   EAST ELEVATION','tag');txt(598,536,'Support the lift independently','sub')
    P,B=plan(624,830,10900,-2000,.080)
    # Different height scale in this annotated section.
    P=lambda x,z:(624+(x-10900)*.080,833-(z+1800)*.0305)
    path([P(10900,3450),P(11567.5,3450),P(12000,3450),P(12000,0)],ink,2)
    path([P(11020,4440),P(12270,4440),P(14270,4440)],cool,4);path([P(12130,-26),P(14230,-26)],ink,3)
    for x in (12270,14120):path([P(x,-1800),P(x,4440)],ink,2)
    path([P(10900,-1800),P(16500,-1800)],ink);path([P(15870,-1800),P(15870,5000)],warm,3)
    cage=[P(x,z) for x,z in [(14310,4440),(15260,4440),(15260,6130),(14310,6130)]]
    path(cage,warm,1,'#f0dcc6',True);txt(902,585,'North gate to goods cage','small')
    txt(625,850,'Ground −1800  ·  transfer +4440  ·  cage travel 5890 from its lower stop','small')
    txt(29,898,'Conditional house detail. Verify the aperture, protected first release, carrier restraints, hoist gate, temporary supports and actual site.','small')
    return '\n'.join(out+['</svg>'])+'\n'

def site_plan(d):
    e=d['east'];o=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1090 790" role="img" aria-label="Elevated L-shaped bath transfer and independent southern goods landing"><rect width="1090" height="790" fill="#faf7ef"/><style>text{font:15px sans-serif;fill:#233c46}.h{font:bold 28px sans-serif}.b{font:bold 19px sans-serif}.s{font:13px sans-serif}</style>']
    def T(x,y,s,cls=''):o.append(f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}">{escape(s)}</text>')
    k=.095;P=lambda x,y:(32+(x-10900)*k,715-(y-400)*k)
    def B(a,fill,stroke,dash=''):
        x,y,w,h=a;xx,yy=P(x,y+h);o.append(f'<rect x="{xx:.1f}" y="{yy:.1f}" width="{w*k:.1f}" height="{h*k:.1f}" fill="{fill}" stroke="{stroke}" stroke-dasharray="{dash}"/>')
    def L(pts,col,w,ds=''):
        xy=' '.join(f'{x:.1f},{y:.1f}' for x,y in [P(*q) for q in pts]);o.append(f'<polyline points="{xy}" fill="none" stroke="{col}" stroke-width="{w}" stroke-dasharray="{ds}"/>')
    def A(x,y,s):T(*P(x,y),s,'s')
    T(28,41,'Receive the bath north of the mast','h');T(29,70,'East yard  ·  north up  ·  solid route is at +4440  ·  dashed route is on the ground')
    B([12000,5475,450,300],'#d6bfad','#915e42');B([12130,3400,2100,1950],'#dfdfd0','#828c80')
    B([15950,2675,1100,3050],'#f6e7dc','#a76f52');B(e['hoistBase'],'#dfd4b9','#8f774c')
    B(e['southGoodsLanding'],'#e5dcc8','#937958');B([14270,1620,960,930],'#eddfc6','#937958')
    B(e['supportTableXY'],'none','#458479','4 3');B(e['upperLanding'],'none','#458479','4 3')
    for x,y in e['portalColumns']+e['additionalColumns']:B([x-125,y-125,250,250],'#a6bab4','#536c66')
    B([12150,3050,200,200],'#ca9c80','#966047')
    L([(11000,5370),(16300,5370)],'#698c9c',2,'6 4')
    L(e['upperLoadRoute'],'#23756b',4);L([[14770,3380],[14770,1620],[14770,700]],'#a75b34',4,'8 5')
    B([14770-400,5440-615,800,1230],'none','#915335');B([14770-400,3380-615,800,1230],'none','#915335')
    L([(12000,3700),(12000,4100)],'#43595f',4);L([(12000,5100),(12000,6050)],'#43595f',4)
    A(12210,4000,'Plant dock');A(14340,2890,'Mast base');A(12220,5590,'Soil');A(14410,980,'Low rest')
    T(637,123,'An independent receiving stage','b')
    rows=[('1','Pass the retained east sill at Y4600.'),('2','Arrest the cradle at X13670. Shift it 840 north.'),
          ('3','Cross to X14770 on a supported deck.'),('4','Capture the long-wheelbase cart, then enter'),
          ('','the cage from the north, with its gates open.'),('5','Lower 5890 to the bottom cage stop.'),
          ('6','Use the south ramp and secured landing.'),('','Buy 2080 mm beyond the old site reservation.')]
    for j,(n,t) in enumerate(rows):
        T(639,166+j*32,n,'b');T(665,166+j*32,t,'s')
    T(637,475,'At ground level','b')
    for j,t in enumerate(['250-square pads are separate from the dock.','The south-west pad clears the potable riser by 75.',
             'The next pad ends 25 west of the mast base.','Dashed blue is the primary pipe crossing.','Pale orange is the west edge of the R290 zone.',
             'Gate guide, mast ties, footings and weather','protection require actual measured interfaces.']):T(638,515+26*j,t,'s')
    L([(11000,700),(12000,700)],'#233c46',3);A(11000,850,'1 m')
    T(29,764,'Reference +4440 is the upper transfer plane. The dock, existing services and refrigerant zone must remain physically independent.','s')
    return '\n'.join(o+['</svg>'])+'\n'
