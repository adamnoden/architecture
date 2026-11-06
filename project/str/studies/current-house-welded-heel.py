"""Separated roof primary/twin-tie and true 45-degree hip, on a closed collector node.
Units mm, kN, kNm. These are project stress, shop detail and clearance comparisons;
not a weld procedure, EN certification, fire or physical qualification.
"""
from pathlib import Path
import math,json,sys,hashlib
D=Path(__file__).resolve().parent;w=json.loads((D/'current-house-welded-network.json').read_text());H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model'];old=json.loads((D/'current-house-roof-connection.json').read_text())
assert not old['jointPass'];fy=200/1.1;tw=100;E=200000
S=w['sections'];r=S['primary'];rail=w['individualTieRail'];c=S['collector'];pitch=math.radians(25);N=60;V=70;U=25;T=10
# One continuous RHS rafter through each heel. Flanking horizontal rails remain
# outside both side webs, not intersecting the inclined primary as their axes meet.
z=6860;zt=z-90;ringBot=6540;ringTop=ringBot+c['H'];topPlate=20
heel={};mass={}
for frame in w['frames']:
    hip=frame['id']=='hip';d=math.sqrt(2) if hip else 1;th=math.atan(math.tan(pitch)/d)
    # Roof faces slope across a hip by tan25/sqrt2 as well as along it.
    transverse=math.tan(pitch)/math.sqrt(2) if hip else 0
    # All steel at the station must clear the roof planes on BOTH sides of the
    # hip. The full 300 square local collector cassette is below the rafter;
    # Check the full plan, including the down-slope tail.
    along=lambda u:z+u*math.tan(th)
    bottom=lambda u:along(u)-100/math.cos(th)
    top=lambda u:along(u)+100/math.cos(th)
    # At hip, 300-square plan projects 212.13 along a diagonal; full raw 300
    # top plate is retained, not imagined as a narrower support strip.
    rawPlanExtent=150*d
    low=bottom(-rawPlanExtent)
    # Across-web lateral edge tilt is NOT imposed on the rigid RHS top: it is
    # charged at the roof-layer closure instead (max envelope below).
    gap=low-ringTop
    assert gap>=12,(frame['id'],gap)
    # Two exterior cheek plates y=±70..86, rafter side faces are directly
    # joined at two transverse 16mm diaphragms before the box lids are fitted.
    # Only the two actual 80mm pieces of perimeter at each diaphragm are counted.
    grip=160;throat=7
    # 10kNm actual axis torsion -> vertical couple and yaw; take absolute T in
    # BOTH components, a conservative screen even at the diagonal.
    sideV=V/2+T/.14
    sideH=N/2+T/.14
    # +90mm tie offset: two short stations on each cheek develop the moment,
    # no raw weld length credited without its lever. Worst shear on any station.
    halfM=(N*.09+V*.07)/2
    demand=math.hypot(sideV/2+halfM/.16,sideH/2)
    resistance=2*80*throat*tw/1000
    assert demand<resistance
    # Two 8mm webs and two caps of each tie rail end in a 12mm diaphragm.
    # Its axial force enters both longitudinal seams against the cheek; a
    # 120mm rail depth and 180 lap get a definite force couple for 25 eccentricity.
    railForce=N/2;railWeld=railForce/2+railForce*.025/.10;railRes=180*6*tw/1000
    # Off-axis box does not magically get the inertia of a composite wide box.
    euler=.5*math.pi**2*E*rail['Iminor']/(frame['axisSpanM']*1000)**2/1000
    assert railForce<euler and railWeld<railRes
    # Closed 300x300 cassette supports both the horizontal square ordinary
    # node and its physically rotated hip shoe. Local shoe footprint 160x180.
    maxProj=math.sqrt(.5)*(80+90) if hip else 90
    assert maxProj+10<=150
    # Welded rectangle, 4 effective throat lines, 160 x 180. Treat BOTH local
    # overturning moments, bidirectional vertical and torsional shear. No bolt
    # group or assumed equal corner support. Use elastic line weld properties.
    a,b=160,180;aw=7;A=2*aw*(a+b)
    Ix=aw*(a*b*b/2+b**3/6);Iy=aw*(b*a*a/2+a**3/6);J=Ix+Iy
    plateM=N*.09+V*.07 # includes explicit line eccentricities
    # Yaw=T*sin(theta); in-plane transfer N bounds even the self-equilibrating
    # local branch force. Plus both major and minor section bending.
    normal=V*1000/A+T*1e6*(b/2)/Ix+plateM*1e6*(a/2)/Iy
    shear=N*1000/A+T*math.sin(th)*1e6*math.hypot(a,b)/2/J
    weldUtil=math.hypot(normal,shear)/tw
    # Record 7mm first; choose 8mm throat for both axes and site erection reserve.
    aold=weldUtil
    aw=8;factor=7/aw;weldUtil*=factor
    assert weldUtil<1,(frame['id'],weldUtil)
    # Full-depth coined shoe cheeks ±70 and transverse diaphragms ±80 land on
    # 2 matching pairs of 16mm cassette internal webs. Through this closed box,
    # the 45° loads turn into both orthogonal ring arms. Allow entire resultant
    # to either arm, no favourable split. The largest flat top panel immediately
    # beneath an actual cheek has at most 25mm unmatched eccentricity.
    laneForce=V/2+T/.14+plateM/.16
    plateStress=laneForce*1000*25/(160*20**2/6)
    # The top skin alone is NOT allowed to span the unreinforced hollow centre.
    # 20mm sole/skin would fail the cantilever panel check at a 100mm offset.
    if plateStress>=fy: # web position is a physical routing dimension
        webOffset=10;plateStress=laneForce*1000*webOffset/(160*20**2/6)
    else:webOffset=25
    assert plateStress<fy
    webStress=laneForce*1000/(16*160);webWeld=laneForce*1000/(2*160*8);assert webStress<fy and webWeld<tw
    # Overhang tails and row7750 have clear physical separation after the 322.5
    # shift. At the actual first interior purlin row, charge both normal-depth
    # difference and hip transverse roof slope out to outermost tie-rail face.
    maxTieY=70+16+60
    nearestRow=217.5*d
    purlinLow=z+nearestRow*math.tan(th)+100/math.cos(th)-150/math.cos(pitch)-maxTieY*transverse
    tieTop=zt+60;rowClear=purlinLow-tieTop
    assert rowClear>15,(frame['id'],rowClear)
    additionalM=N*.09
    Nb=min(.3*r['A']*fy/1000,.5*math.pi**2*E*r['Iminor']/5100**2/1000)
    util=frame['primaryCombined']+additionalM/r['MR']
    half=frame['primaryLengthM']*500
    d0=frame['curvatureAndTieStretchBound']+additionalM*1e6*half**2/(2*E*r['I'])
    assert util<1 and d0<frame['strutL250'],(frame['id'],d0,frame['strutL250'])
    # Upper surface of rafter & 140 width hip plus normal cross-face closure.
    zNeed=top(0)+70*transverse
    heel[frame['id']]=dict(planAngle=45 if hip else 0,rafterPitch=math.degrees(th),ringZ=[ringBot,ringTop],roofCentreAtHeel=z,tieCentre=zt,railBoundsY=[[70+16,70+16+60],[-70-16-60,-70-16]],clearAboveFullCassette=gap,planShoeMaxProjection=maxProj,purlinToOuterTieClear=rowClear,diaphragmStationDemand=demand,diaphragmWeldResistance=resistance,railEulerHalf=euler,railPerSideAxial=railForce,railAxialWeldStress=railWeld*1000/(180*6),baseWeld7Util=aold,baseWeld8Util=weldUtil,skinWithoutDiaphragmStress=laneForce*1000*100/(160*20**2/6),installedWebOffsetBound=webOffset,skinStress=plateStress,internalWebStress=webStress,internalWebWeldStress=webWeld,primaryRevisedInteraction=util,deflectionWithTieOffset=d0,L250=frame['strutL250'],roofStructuralTopNeed=zNeed)

outer=['outer-south','outer-north','outer-east','outer-west','court-south','court-north','court-east','court-west']
def allowed(wall,u):
    return all(abs(u-op['centre'])>=op['width']/2+285 for level in ['GROUND','FIRST'] for op in H['openings'][level] if op['wall']==wall)
rows={};ringshear=0.;ringstress=0.
for wall in outer:
    lo,hi=(332.5,11667.5) if wall.startswith('outer') else (3917.5,8082.5)
    # Actual north portals have purpose-made RC tie piers, not bare masonry
    # anchors inserted through an arch. Shafts of rods are physically routed
    # either side of the horizontal M30 hole at each such pier.
    special=[4377.5,7622.5] if wall.endswith('north') else []
    candidates=sorted({lo,hi,*special,*[u for u in [4700,7300] if allowed(wall,u)],*[u for u in range(math.ceil(lo/25)*25,math.floor(hi/25)*25+1,25) if allowed(wall,u)]})
    anchors={lo,hi}
    for u in [4700,7300]:
        if u in candidates:anchors.add(u)
        else:anchors.update([max(x for x in candidates if x<u),min(x for x in candidates if x>u)])
    # Supply only extra intermediate tie stations where the real steel ring
    # would otherwise have more than 3.6m unsupported for reversal. They must
    # exist in solid material on both storeys or be the actual north RC piers.
    while True:
        gaps=[(b-a,a,b) for a,b in zip(sorted(anchors),sorted(anchors)[1:]) if b-a>3600]
        if not gaps:break
        _,a,b=max(gaps);choices=[v for v in candidates if a<v<b]
        assert choices,(wall,a,b);anchors.add(min(choices,key=lambda v:abs(v-(a+b)/2)))
    anchors=sorted(anchors);supports=[{'u':u,'upperLowerType':'existing north pier' if u in special else 'corner' if u in [lo,hi] else 'clear full height strip'} for u in anchors]
    segments=[]
    for a,b in zip(anchors,anchors[1:]):
        span=(b-a)/1000;loads=[(u-a)/1000 for u in [4700,7300] if a<u<b]
        # Imposed closed-haunch moment goes to an actual arm, including at a
        # hip. Bound an entire T10 on either arm in bending AND torsion. A hip
        # and ordinary heel can both load a short end arm: no free equal split.
        endsNear=[q for q in [lo,4700,7300,hi] if a-1e-8<=q<=b+1e-8]
        nNode=len(endsNear);Mlocal=T*nNode
        g=1.35*c['lineG'];mmax=0;vmax=0
        for k in range(201):
            xx=span*k/200
            mm=g*xx*(span-xx)/2+sum(V*(min(xx,s)-xx*s/span) for s in loads)
            mmax=max(mm,mmax)
        vmax=g*span/2+max(sum(V*s/span for s in loads),sum(V*(1-s/span) for s in loads),0)
        # Full consecutive local torsional impulses are deliberately added;
        # the in-plane collector/chord demand is a separate 100kN budget.
        # Vertical axis yaw term is charged to weak-axis bending as well.
        sigma=(mmax+Mlocal)*1e6/c['W']+Mlocal*math.sin(pitch)*1e6/c['Wminor']+100e3/c['A']
        tau=Mlocal*1e6/(2*(c['H']-c['t'])*(c['B']-c['t'])*c['t'])+vmax*1000/(2*c['t']*(c['H']-2*c['t']))
        util=math.hypot(sigma,math.sqrt(3)*tau)/fy
        segments.append(dict(start=a,end=b,originHeels=endsNear,maxVerticalM=mmax,localMomentsEachArm=Mlocal,shear=vmax,interaction=util))
        ringstress=max(ringstress,util);ringshear=max(ringshear,vmax)
    rows[wall]=dict(supports=supports,segments=segments)
assert ringstress<1,ringstress
# Conserve the actual cassette/cheek/saddle components against the authored
# 1kN per heel. Do NOT subtract the replaced short ring length twice.
vol={'cassetteTopBottom':2*300*300*20,'cassetteSides':4*260*80*16,'cassetteTwoThroughPlusTwoCrossWebs':2*260*80*16+2*230*80*16,'sole':180*160*20,'twoFullCheekEnvelopes':2*330*300*16,'twoRafterDiaphragms':2*116*176*16,'twoTieEndDiaphragms':2*44*104*12}
nodeG=sum(vol.values())/1e9*78.5+.055 # deposited weld/closures
assert nodeG<=1,nodeG
# Purlin reaction under either sign. Square-end or true 45deg end plates are
# shop cut, directly fitted to a 12mm rafter web between its flanges. The local
# weld/throat acts in shear; do not count a notional bolt in an empty tube.
purlinForce=(6.3*.55+1.35*S['secondary']['lineG'])*4.9/2
tabStress=purlinForce*1000*22/(10*110**2/6);tabShear=purlinForce*1000/(10*110)
pWeld=purlinForce*1000/(2*90*5)
clearEave=250-70-70*math.sqrt(2);clearEnd=450-70-70*math.sqrt(2)-2*60
assert clearEave>75 and clearEnd>150
# Crown is the intentional internal hinge in the three-hinge analysis. A
# welded mitre acting as a rigid ridge would invalidate that force system.
# One central lug, two outer cheeks, exposed 40 pin; close the local RHS with
# full-section 16mm end diaphragms, cutting the tongue into the two webs.
pin=40;centre=24;ears=16;pinF=math.hypot(60,70);pinShear=pinF*1000/(2*math.pi*pin**2/4)
pinM=pinF*1000*(centre/2+2+ears/2)/2;pinBend=pinM/(math.pi*pin**3/32)
pinVM=math.hypot(pinBend,math.sqrt(3)*pinShear)
assert pinVM<fy and pinF*1000/(pin*centre)<fy
assert (pinF/2)*1000/(pin*ears)<fy and pinF*1000/(4*100*7)<tw
# The required face envelope includes the actual across-hip fall as well as the
# normal rafter depth. Crown pin housing stays inside the stated normal section.
oldTop=6702.5859723120175+80/math.cos(pitch)
rise=max(card['roofStructuralTopNeed'] for card in heel.values())-oldTop
eave=H['roofDevelopment']['eavesDatum']+rise;ridge=old['heightComparison']['historicalRidge']+rise
# Actual shared corner anchors are counted once by plan coordinates. Keep the
# support REACTION and the eventual vertical tie interface distinct: a raw
# 285mm opening-edge clearance is not a qualified rod/arch/DPC crossing.
stations={}
for wall,g in rows.items():
    axis=0 if wall.endswith(('south','north')) else 1
    d={'outer-south':332.5,'outer-west':332.5,'outer-north':11667.5,'outer-east':11667.5,'court-south':3917.5,'court-west':3917.5,'court-north':8082.5,'court-east':8082.5}[wall]
    for a in g['supports']:
        u=a['u'];xy=(u,d) if axis==0 else (d,u)
        stations.setdefault(xy,[]).append(wall)
out={'status':'Calculated shop fabrication and ring force route; roof-anchor/grid/capillary and global stability interfaces remain explicit','sources':{n:hashlib.sha256((D/n).read_bytes()).hexdigest() for n in ['current-house-welded-network.json','current-house-roof-connection.json']},'method':'Project stress budget fy=200/1.1 MPa; 100 MPa allowable effective weld throat stress. SCI P398 section 2.5 and BCSA Guide to Site Welding 35/03 describe weld group and site execution methods; declared screens do not constitute a weld procedure or code acceptance. All RC/soil/material/fire incl cross-wall anchors remain pre-site research.','claimedScope':'24 factory-built heels across twelve tied frames; 8 ordinary, 4 hip. Through-web diaphragms built before closing lid; shop weld rail end diaphragm and exterior cheeks to continuous sloping primary, then erect prefabricated frame onto indexed collector cassette before roofing/insulation. External all-around 8mm throat shoe weld accessible before closure. 300 square cassette has rotated matched internal webs for the hip, two orthogonal shop CJP ring arms, all torque allowed into either arm. Crown pin remains accessible before roof closes. No interior overhead field weld into a sealed box.','node':heel,'componentsMM3':vol,'nodeGkN':nodeG,'nodeGMaximum':1,'ring':{'section':c,'z':[ringBot,ringTop],'fullHeightSupportStations':len(stations),'stations':[{'xy':k,'walls':v} for k,v in stations.items()],'faces':rows,'highestMemberUtilisation':ringstress,'connection':'One closed 300 square cassette per heel, 120 deep with 20mm top/bottom and interlocked 16mm full-depth web pairs; ordinary arm is straight, hip has two orthogonal arms. Slot from open side before closure; ring skins and webs continue to end diaphragms via full-penetration seams. Choose all-arm20mm, not16mm which failed actual south court double-heel combination.'},'tail':{'purlinEndULS':purlinForce,'tenMMTabStress':math.hypot(tabStress,math.sqrt(3)*tabShear),'twoWeldStress':pWeld,'outermostEaveRafterSolidGap':clearEave,'innerRowSolidGapAfterTwo60Cleats':clearEnd},'crown':{'pin':pin,'centralLug':centre,'eachOuterLug':ears,'forceResultant':pinF,'pinShear':pinShear,'pinBending':pinBend,'combined':pinVM,'centralLugBearing':pinF*1000/(pin*centre),'terminal':'Positive 40 pin with metal retainers; 100mm lug width, 50mm minimum longitudinal end distance, 16mm welded end diaphragm aligned to both primary webs. Single clevis is not a torsion-through-ridge assumption; each half routes purlin torque to its own heel.'},'height':{'eave':eave,'ridge':ridge,'rise':rise,'ceiling':6620,'minimumTieUnderside':zt-60,'lowestProtectedReturn':ringBot-25,'widthDisplacement':'Continuous 220 wide ring on 140 core; 40 each side, or explicit offset subject to recalculation. Local 300 square cassette, 292 twin-rail width. Roofing closure and fire material qualification remain distinct.'},'openInterfaces':['Complete captive roof-ring to floor/grillage ties at every actual anchor, including narrow core, north arch bore and air/DPC crossing; topology is not permission for a new metal penetration.','Roof bracing, L-pier diaphragm flexibility/arch movement and independent ceiling remain separate joins.','Qualified weld preparations, execution/inspection/protection and fire/thermal/geometric tolerance; crown lug out-of-plane and bracing connectors must match signed wind design.'],'physicalAdmission':False}
def norm(v):
    if isinstance(v,dict):return {k:norm(z) for k,z in v.items()}
    if isinstance(v,(tuple,list)):return [norm(j) for j in v]
    return round(v,6) if isinstance(v,float) else v
def save(p,s):
    if '--check' in sys.argv:assert p.read_text()==s,p
    else:p.write_text(s)
save(D/'current-house-welded-heel.json',json.dumps(norm(out),indent=2)+'\n')
print('24 closed heels: node %.3fkN; ring %.3f; %d unique tie stations; eave +%.2fmm'%(nodeG,ringstress,len(stations),rise))
# Two orthogonal views, both true scale in their own panel; steel cut away in
# elevation so the receiving cassette's through webs remain visible.
from html import escape
s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 650"><rect width="1050" height="650" fill="#faf9f4"/><g font-family="sans-serif" fill="#27343b">']
def t(x,y,msg,sz=14):s.append(f'<text x="{x}" y="{y}" font-size="{sz}">{escape(msg)}</text>')
def poly(ps,col,stroke='#364b53'):s.append('<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in ps)+'" fill="'+col+'" stroke="'+stroke+'" stroke-width="1.2"/>')
def line(a,b,col='#67777e',sw=1):s.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="{col}" stroke-width="{sw}"/>')
t(30,35,'Welded roof heel  /  continuity through the hollow boxes',24)
t(30,63,'One structural comparison • current HAD plan • 4700 / 7300 primary axes • pre-site, unadopted',15)
t(30,107,'A   Ordinary heel section',18);t(565,107,'B   45° hip: cutaway plan of collector head',18)
def P(x,z):return 210+.48*x,410-.48*(z-6500)
def rect(x,z,xx,zz,col):poly([P(x,z),P(xx,z),P(xx,zz),P(x,zz)],col)
rect(-70,6360,70,6540,'#cdbda0');rect(-150,6540,150,6660,'#586f77');rect(-80,6660,80,6680,'#c19066')
for x in [-80,80]:rect(x-8,6560,x+8,6640,'#d5e1dd')
def a(x):return 6860+x*math.tan(pitch)
poly([P(q,a(q)+off) for q,off in [(-250,-100/math.cos(pitch)),(540,-100/math.cos(pitch)),(540,100/math.cos(pitch)),(-250,100/math.cos(pitch))]],'#829ca4')
poly([P(-85,6680),P(85,6680),P(235,6810),P(235,a(235)+45),P(-95,a(-95)+45)],'#b77b53')
rect(0,6710,535,6830,'#afc2bd')
line(P(-300,6620),P(480,6620),'#99565b')
t(35,505,'Continuous primary; twin rails run along its outside faces.');t(35,527,'Cheeks deliver signed forces to aligned cassette webs.')
def q(x,y):return 745+.66*x,320-.66*y
def flat(r,col):poly([q(*p) for p in ((r[0],r[1]),(r[2],r[1]),(r[2],r[3]),(r[0],r[3]))],col)
flat([-110,-110,350,110],'#789199');flat([-110,-110,110,265],'#789199');flat([-150,-150,150,150],'#b5c4c3')
def rot(u,v):return q((u-v)/math.sqrt(2),(u+v)/math.sqrt(2))
def rr(a,b,c,d,col):poly([rot(*p)for p in [(a,b),(c,b),(c,d),(a,d)]],col)
rr(-80,-90,80,90,'#c19066')
for v in [-70,70]:rr(-80,v-8,80,v+8,'#526e78')
for u in [-80,80]:rr(u-8,-80,u+8,80,'#627d86')
rr(-255,-70,249,70,'#66818b')
for v in [-146,86]:rr(0,v,240,v+60,'#acc0ba')
t(565,505,'300 square closed cassette; two perpendicular ring arms.');t(565,527,'Matched inner webs roof-side before the lid is closed.')
t(30,582,'Roof field 144.15 m²  •  rain catchment 60.0625 m²  •  24 heel assemblies  •  ring 120 × 220 × 20 mm',16)
t(30,611,'Ridge +197.5 mm against the HAD model. The member comparison does not admit 36 full-height anchor stations.',14)
s.append('</g></svg>');save(D/'current-house-welded-heel.svg','\n'.join(s)+'\n')
