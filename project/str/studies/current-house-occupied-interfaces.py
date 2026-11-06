"""Three source-owned interfaces on the actual unadopted structural comparison:
dry ground floor between real grid faces; northwest first-floor formed opening;
water pipe top-notch versus body, full draw and occupied solid. mm/kN/MPa.
"""
from pathlib import Path
import sys,json,math,runpy,hashlib
from itertools import pairwise
D=Path(__file__).resolve().parent;H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model'];G=json.loads((D/'current-house-grid.json').read_text())
beamRecords=[]
def observe(name,p,n,cat,case,cx,cy):
    if name in ['court-E','spine','outer-E'] and 5900<=p[1]<=7900 and case in ['G','Q']:beamRecords.append((name,tuple(p),n,cat,case,cx,cy))
a=sys.argv[:];sys.argv=['legacy','--check'];old=runpy.run_path(str(D/'current-house-head-actions.py'),init_globals={'beamObserver':observe});br=runpy.run_path(str(D/'current-house-bridge.py'));sys.argv=a
inside=old['inside'];axis2=old['axis2'];girds=G['girders'];cross=G['crossBeams']
dry=lambda p:(inside(p,old['inner']) and not any(inside(p,r) for r in [old['court'],old['loggia'],old['outdoor']])) or inside(p,old['seat'])
# Every beam/cap whose *concrete* adjoins/overlaps retained ground slab.
# Low loggia ties below exterior decks do not support a domestic plate by fiat.
receivers=[(r,n) for r,z,n in old['rects'] if z[1]>=-380 and z[0]<-180]
allrect=[old[n] for n in ['inner','court','loggia','outdoor','seat']]+[r for r,n in receivers]
cuts=[sorted({v for r in allrect for v in [r[i],r[i+2]]}) for i in [0,1]]
def dryalong(a,b,h,i):
    pts=sorted({a,b,*[k for k in cuts[i] if a<k<b]})
    return all(dry(axis2(i,(p+q)/2,h)) for p,q in pairwise(pts))
def fieldRoute(p):
    if any(inside(p,r) for r,n in receivers):return ('direct',0,None)
    opts=[];cants=[]
    for i in [0,1]:
        v=p[1-i];c=p[i]
        left=sorted((r[i+2],n,r) for r,n in receivers if r[1-i]<=v<r[3-i] and r[i+2]<=c)
        right=sorted((r[i],n,r) for r,n in receivers if r[1-i]<=v<r[3-i] and r[i]>=c)
        l=left[-1] if left else None;r=right[0] if right else None
        if l and r and dryalong(l[0],r[0],v,i):opts.append((r[0]-l[0],i,l[1],r[1],l[0],r[0],v))
        for q in (l,r):
            if q and dryalong(min(q[0],c),max(q[0],c),v,i):cants.append((abs(q[0]-c),i,q[1],q[0],v))
    if opts:
        b=min(opts);return ('simple',b[0],b)
    if cants:
        b=min(cants);return('cant',b[0],b)
    return ('unrouted',0,p)
fieldArea={};spans=[];fail=[];cants=[]
for xa,xb in pairwise(cuts[0]):
 for ya,yb in pairwise(cuts[1]):
    p=((xa+xb)/2,(ya+yb)/2)
    if not dry(p):continue
    ty,span,ex=fieldRoute(p);ar=(xb-xa)*(yb-ya)/1e6;fieldArea[ty]=fieldArea.get(ty,0)+ar
    if ty=='simple':spans.append((span,ex,p))
    if ty=='cant':
        # Worst cell corner to closest bearing: centre-distance plus half
        # rectangle width (same direction) is a conservative edge bound.
        cants.append((span+(xb-xa if ex[1]==0 else yb-ya)/2,ex,p))
    if ty=='unrouted':fail.append(p)
assert not fail and abs(sum(fieldArea.values())-old['garea']['dry slab'])<1e-7
clear,ex,where=max(spans);cant=max([c[0] for c in cants]or[0])
# Member C30/S500 comparison, no current NA or certified mix assumed. Take
# upper thickness/weight for pressure and lower depth/max cover for resistance.
# 45nominal +/-5 =>40 minimum, maximum50. Second orthogonal layer is governing.
def plate(h,d,A,L,G,Q,cover,bar,restraint=.0004):
    fy=500/1.15;fd=.85*30/1.5;E=22000*(38/10)**.3;bw=1000
    x=A*fy/(.8*bw*fd);mr=A*fy*(d-.4*x)/1e6;rho=min(.02,A/(bw*d));k=min(2,1+math.sqrt(200/d));vr=max(.12*k*(100*rho*30)**(1/3),.035*k**1.5*math.sqrt(30))*bw*d/1000
    def cracked(phi):
        Ec=E/(1+phi);n=200000/Ec;x=(-n*A+math.sqrt((n*A)**2+2*bw*n*A*d))/bw
        I=bw*x**3/3+n*A*(d-x)**2;return Ec,I,x
    def defl(w,phi):
        E,I,x=cracked(phi);return 5*w*L**4/(384*E*I)
    Ec,I,xx=cracked(3.5);z=d-xx/3
    ss=(G+Q)*(L/1000)**2/8*1e6/(A*z);heff=min(2.5*(h-d),(h-xx)/3,h/2);rp=A/(bw*heff)
    # Derivation from JRC EC2 worked examples (2014), sec7.3.4 analogue.
    # Upper bound neglects favourable tension stiffening. Impose full
    # 400microstrain restrained separately, charge pure-tension k2=1 for it.
    flexSpacing=3.4*cover+.8*.5*.425*bar/rp
    pureSpacing=3.4*cover+.8*1*.425*bar/rp
    wt=flexSpacing*ss/200000+pureSpacing*restraint
    return dict(effectiveDepth=d,MR=mr,Vr=vr,M=(1.35*G+1.5*Q)*(L/1000)**2/8,V=(1.35*G+1.5*Q)*L/2000,steelStressFullService=ss,flexCrackSpacing=flexSpacing,pureRestraintCrackSpacing=pureSpacing,crackWidthFlexOnly=flexSpacing*ss/200000,crackWidthFullRestraint=wt,deflection=defl(G,3.5)+defl(Q,0)+400e-6*L**2/(8*h),comparatorL250=L/250,coverToControllingDirectionCompared=cover)
L=clear+200 # conservative effective span increment; no favourable fixity
variants=[]
for bar,pitch in [(12,150),(12,125),(12,100),(16,125),(16,100)]:
    d=195-50-1.5*bar;As=math.pi*bar**2/4*1000/pitch
    z=plate(195,d,As,L,7.625,2,50+bar,bar);z.update(bar=bar,pitch=pitch,steelKgM2=4*As*7850/1e6,actualFreeVerticalClear=195-2*(50+2*bar))
    variants.append(z)
# Treat the concentrated plant pair as an installation load on TWO actual
# floor positions. For a conservative local comparison allow both on the same
# 1m strip at midspan, even though their specified points differ.
plant=[]
for p in [(11100,4300),(10900,4500)]:
 t,sl,po=fieldRoute(p);le=sl+200 if t=='simple' else 0;z=plate(195,127,math.pi*12**2/4*10,le,7.625,2,62,12)
 # Include all 2.335 as permanent before comparing with member/reference.
 if le:
    pG=2.335;oldM=z['M'];z=plate(195,127,math.pi*12**2/4*10,le,7.625+2*pG/(le/1000),2,62,12)
    # Equivalent w matches max point bending and is conservative for shear.
    # Midpoint displacement ratio 5/384*(2P/L)*L^4 / (P*L^3/48)=1.25.
 plant.append({'point':p,'route':t,'clear':sl,'maxPointGCompared':2.335,'width':1000,'comparison':z})
choice=variants[2];assert max(z['comparison']['crackWidthFullRestraint'] for z in plant)<.3 and choice['crackWidthFullRestraint']<.3<variants[1]['crackWidthFullRestraint']
assert choice['M']<choice['MR'] and choice['V']<choice['Vr'] and choice['deflection']<choice['comparatorL250']
# Illustrate the genuine scope of the reserve. 500microstrain is NOT assumed
# impossible; creep, early thermal strain, construction joints or poor curing
# can readily defeat a floor credited as water/gas-proof without evidence.
wk500=choice['crackWidthFlexOnly']+choice['pureRestraintCrackSpacing']*.0005
assert wk500>.3
lowG=50;minDeck=195;areaSlab=sum(fieldArea.values())
groundOut={'basis':'warm domestic RC slab + threshold seat only. Geometry in current proposed support layout; not imported NW-W upstairs 25cover or site certification. Four independent H12 layers: EW and NS at BOTH faces, 100 centres, nominal45 outer cover, prescribed 40..50. Both faces and layers count in mass.', 'physicalAreaM2':fieldArea,'maximumClearSpan':clear,'maximumClearAtXY':where,'sides':ex,'effectiveSpanCompared':L,'distanceVsOldAxis':'old 4000mm at (4075,3975) is directly on the 600wide court-S concrete footprint. The new test requires uninterrupted actual slab between both support faces. No concrete is conjured across courtyard/stair/water territory.','prior4000PointRoute':fieldRoute((4075.,3975.)),'maxOneSideProjection':cant,'thresholdSeat':'210mm cantilever is the known 1900x210 apron/seat beyond court-S; concentrated hardware duties are independent of this slab field check.','Gk':7.625,'Qk':2,'depthRange':[195,205],'faceCoverRange':[40,50],'sectionComparisons':variants,'preferredField':choice,'plantPatch':plant,'steelTonnesBeforeLapsEdges':choice['steelKgM2']*areaSlab/1000,'H12at150ControlSteelTonnes':variants[0]['steelKgM2']*areaSlab/1000,'wkIf500Microstrain':wk500,'crackMethod':'JRC Eurocode 2 worked examples, 2014, 7.3.4 form sr=3.4c+0.8*k2*0.425*bar/rhoeff. Deliberately neglect favourable tension-stiffening, full G+Q elastic cracked stress plus a separate 400microstrain upper restraint comparison using pure-tension k2=1.0. The 0.30mm is an authored structural comparison only, not acceptable gas transmission, liquid permeability or proof of lifetime crack width. Full restraint, unmodeled settlement and thermal exposure remain bounded hypotheses. https://eurocodes.jrc.ec.europa.eu/publications/eurocode-2-background-appications-design-concrete-buildings-worked-examples','pour':'Preferred finite construction control: form a continuous upper200mm dry-floor lift (20.98m3 nominal), including the head/beam overlap once and the formed threshold seat. No planned full-depth intermediate joint in occupied field; if the lower grillage is cast first, structural horizontal construction interface is at underside -380 with prepared rough concrete and continuing reinforcement. Starter/interlock, real pour length, temperature/early-age restraint, interruption detail and any service penetrations still need coordinated design. Do not declare the construction joint airtight.', 'materials':'C30/S500 only structural comparison. Composite RC density at or below25kN/m3 including the actual bars must be delivered for this load bound. Cement dose, constituent mix, permeability, curing, floor surface/air-wall seal and actual site/water exposure remain the material/source owners’ duties. 300kg/m3 or 40mm exposure hypothesis alone gives no admission.'}
# Practical economy challenger: stock H12/150 both ways at both faces, then
# H12/150 interleaved giving 75 inside the longer span bands. Extend extras
# 650 beyond both supports and 150 across the loaded edge; clip only to real
# slab. This is a developed steel quantity comparator, not a pointwise uniform
# 100 spacing magically assembled out of a 150 mesh.
heavy=[[],[]]
for xa,xb in pairwise(cuts[0]):
 for ya,yb in pairwise(cuts[1]):
    p=((xa+xb)/2,(ya+yb)/2)
    if not dry(p):continue
    tt,cl,ex0=fieldRoute(p)
    if tt!='simple':continue
    z=plate(195,127,math.pi*12**2/4*1000/150,cl+200,7.625,2,62,12)
    if z['crackWidthFullRestraint']<=.3:continue
    _,di,ln,rn,bf,ef,cross0=ex0
    r=[xa,ya,xb,yb];r[di]=bf-650;r[di+2]=ef+650;r[1-di]-=150;r[3-di]+=150
    heavy[di].append(r)
addA=[]
for di,boxes in enumerate(heavy):
    cx=sorted(set(cuts[0]+[z for r in boxes for z in [r[0],r[2]]]));cy=sorted(set(cuts[1]+[z for r in boxes for z in [r[1],r[3]]]));aa=0
    for xa,xb in pairwise(cx):
     for ya,yb in pairwise(cy):
        p=((xa+xb)/2,(ya+yb)/2)
        if dry(p) and any(inside(p,r) for r in boxes):aa+=(xb-xa)*(yb-ya)/1e6
    addA.append(aa)
groundOut['localStripEconomy']={'base':'H12/150 each face/two axes; add offset H12/150 each face only in the actual span direction at governing >0.30mm regions, resulting local75 rather than pretending to make 100 from 150. Includes650 beyond both receiving faces and 150 side extension clipped to real slab; boundary bars still require hook/anchorage. Plant point, lap extensions, threshold and re-entrant edge extras not included in this quantity.', 'actualDirectionAreasEWNS':addA,'tonnesBeforeLapsExtras':(variants[0]['steelKgM2']*areaSlab+variants[0]['steelKgM2']/2*sum(addA))/1000,'decision':'Simpler uniform100 is the bounded reproducible control. Compare this lower-mass reinforcement layout for actual cover/joint/scheduling rather than declaring dense steel a whole-house invariant.'}
# Form an actual finite opening, not post-drill a wet slab. Reserve floor
# bars and transverse header reactions; an unknown tray foot does not borrow
# the entire residual floor strip capacity as a tested foot receiver.
s=next(q for q in old['o']['floor_fields'] if q['id']=='NW-W');r=s['rectangle'];assert r==[332.5,8852.5,2902.5,11667.5]
well=[1812.5,9252.5,2212.5,9652.5];zz=[3170,3370];tray=[1802.5,8952.5,2802.5,9952.5];assert r[0]<well[0]<well[2]<r[2] and r[1]<well[1]<well[3]<r[3]
assert H['sections']['firstFloorRC']['top']==3370
wet=old['o']['wet_wall_beam'];width=wet['section']['b'];beamFace=wet['axis_x']-width/2
Lx=s['axis_span']/1000;ps=(1.35*s['G']+1.5*s['Q'])*.4*Lx
# Two EW side strips 240mm wide each with 2 ADDITIONAL H12 main bars on
# BOTH faces over whole 2.57m + anchorage, plus normal continuing mesh.
# Every cut EW/NS bar is matched or exceeded across two opposite sides.
# Even when all 0.4m corridor load diverts to ONE EW strip, include its own
# slab load PLUS 2kN characteristic concentrated assembly/use challenge.
bw=.24;maxPoint=2.;g=s['G'];q=s['Q'];ql=(1.35*g+1.5*q)*bw;oldAs=math.pi*12**2/4;Abar=2*oldAs
# Use 140mm effective depth (physical section thickness200,
# d140 conservatively below original d157) and count ADDED two bars only.
def trim(b,h,d,as0):
    fd=.85*30/1.5;fy=500/1.15;nx=as0*fy/(.8*b*fd);mr=as0*fy*(d-.4*nx)/1e6;rho=as0/(b*d);k=min(2,1+math.sqrt(200/d))
    vr=max(.12*k*(100*rho*30)**(1/3),.035*k**1.5*math.sqrt(30))*b*d/1000
    return mr,vr,nx/d
M=ql*Lx**2/8+(ps+1.5*maxPoint)*Lx/4;V=ql*Lx/2+ps+1.5*maxPoint
mr,vr,xd=trim(240,200,140,Abar)
# Full uniform corridor paid for as one central point. This control may
# legitimately fail (it ignores real load spreading and is one-sided).
# If required, use three H12 along each edge, keeping four-layer congestion
# and the local 590mm wet-beam anchorage margin separate.
if M>mr or V>vr:
 Abar=3*oldAs;mr,vr,xd=trim(240,200,140,Abar)
assert M<mr and V<vr and xd<=.45
# NS headers at the west/east ends of opening, spanning the TWO EW strip
# centrelines (400+2*120). Give both ends the entire demanding hole load.
Lh=.64;mh=(ps+1.5*maxPoint)*Lh/4+ql*Lh**2/8;vh=ps+1.5*maxPoint+ql*Lh/2
rm,rv,xh=trim(240,200,140,2*oldAs);assert mh<rm and vh<rv
# conservative poor-bond actual stress demand versus straight projection.
# fbd 2.1MPa comparator, not universal product bond. Use d/4sigma/fbd,
# no hook/lap credit for a short projection.
fbd=2.1;fy=500/1.15;lbF=12*fy/(4*fbd);lbHeader=12*(mh*1e6/(2*oldAs*.85*140))/(4*fbd)
southMargin=well[1]-r[1];northMargin=r[3]-well[3];assert lbHeader<southMargin
# Force in the straight EW strip need not be fully yielded at its line
# support, but the whole global anchor cannot be silently hidden in a 140mm
# thick exterior wall or the 200mm wet beam. Keep direct restraint negative.
wellOut={'status':'formed 400x400 structural opening candidate, conditional local trimmer/header section; actual drain, concentrated tray foot/bracket, reinstatement and support anchorage remain open','xyz':[well,zz],'oldField':[s['id'],r,s['axis_span'],s['direction']],'toWetBeamFace':beamFace-well[2],'toSouthWetBeamSupportAxis':well[1]-wet['support_axes_y'][0],'trayFootprint':tray,'edgeFromTrayWest':well[0]-tray[0],'concreteRemovedM3':.4*.4*.2,'cutBarsEachFaceEachDirectionMax':math.ceil(400/150),'oneMetreFieldGQ':[g,q],'entireCutCorridorULS':ps,'extraPointChallengeCharacteristicKN':maxPoint,'knownTrayFrameKgOnly':26.6,'trimStations':{'EWstripCentreY':[well[1]-120,well[3]+120],'NSheaderCentreX':[well[0]-120,well[2]+120],'stripWidth':240,'EWmainBarsAdditionalEachFacePerSide':round(Abar/oldAs),'NScrossBarsAdditionalEachFacePerSide':2,'effectiveDepth':140,'EWspan':Lx,'NSspan':Lh,'M_V_EW':[M,V,mr,vr],'M_V_NS':[mh,vh,rm,rv],'xOverD':[xd,xh]},'poorBondStraightLengthAtFullSteelStress':lbF,'NSheaderStraightLengthAtActualBendingStress':lbHeader,'availableNSMarginsToFieldAxes':[southMargin,northMargin],'detail':'New bars continuous around the cast-out in prefixed mats, not cut by a saw. Before fabricating, establish support-end detailing within the 140mm exterior core and 200mm wet beam, edge opening transfer/crack service, actual crossing bar elevations, fire/acoustic/air floor classification and complete removable cover/tray support. The 2kN characteristic footprint challenge does not certify an unknown foot bearing or lifting operation.'}
print('ground span',clear,'H12/100',choice['crackWidthFullRestraint'],'ground mass',groundOut['steelTonnesBeforeLapsEdges'],'wet opening',wellOut['trimStations'])
# EW bottom bars cross the two longitudinal rows of the proposed 650 edge.
# A flat rebar hook turns along the west collector; do not demand 621mm of
# straight horizontal development in a 140mm wall.
barZ=3237.5;dEW=3370-barZ;rm,rv,xd=trim(240,200,dEW,3*oldAs)
assert M<rm and V<rv
westCage=[3170+35+8+6+(12+25)*i for i in range(3)]
nomClear=min(abs(barZ-z)-12 for z in westCage);assert nomClear>=6
# A 25mm mandrel radius is slightly larger than 4phi internal diameter /2.
# Locate the bend/straight inside the RC return, with east ends straight into
# the wet beam. On the actual full 2.57m EW span, reduced shear-shift end
# anchorage is compared; no unproved exterior masonry tension.
Rcent=30;westX=A=332.5;hookLen=200;endStress=1.25*V*1000/(3*oldAs);needEnd=max(120,100,12*endStress/(4*fbd))
eastAvailable=wet['section']['b']-25-6-6
assert eastAvailable>needEnd and hookLen>needEnd
# Avoid claiming three bars can occupy the same hook lines simultaneously.
# Each bar turns at a DIFFERENT Y lane, and a different final X lane within
# the west core; alternating North/South turns avoid three parallel tails
# chasing the same strip. Test 3D bar centre collisions with one another.
def distSeg(a,b,c,d): # 2-D minimum segment distance, incl crossings
    def cr(p,q,r):return (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
    if cr(a,b,c)*cr(a,b,d)<0 and cr(c,d,a)*cr(c,d,b)<0:return 0.
    def dp(p,x,y):
        dx=y[0]-x[0];dy=y[1]-x[1];t=max(0,min(1,((p[0]-x[0])*dx+(p[1]-x[1])*dy)/(dx*dx+dy*dy)))
        return math.hypot(p[0]-x[0]-t*dx,p[1]-x[1]-t*dy)
    return min(dp(a,c,d),dp(b,c,d),dp(c,a,b),dp(d,a,b))
# At each side strip, don't route the back/far hook through another bar's
# arriving leg. Low Y bar turns south; upper two turn north with farthest
# hook first. Two parallel tails are 32mm apart ->20mm clear, less than
# 21 comparator: put the third tail on same X as first but in opposite Y.
paths=[]
for cy in [9132.5,9772.5]:
 for n,(yy,xend,sign) in enumerate([(cy-70,347.5,-1),(cy,313.5,1),(cy+70,347.5,1)]):
    start=(xend+Rcent,yy);ys=yy+sign*Rcent;curve=[(xend+Rcent-Rcent*math.sin(math.pi*k/40),yy+sign*Rcent*(1-math.cos(math.pi*k/40))) for k in range(21)]
    paths.append([(wet['axis_x']+wet['section']['b']/2-37,yy),*curve,(xend,ys+sign*hookLen)])
hookClear=min(distSeg(a,b,c,d)-12 for j,P in enumerate(paths) for Q in paths[j+1:] for a,b in pairwise(P) for c,d in pairwise(Q));assert hookClear>=21
gM=wet['action']['M']+ps/2*.64+1.5*maxPoint*wet['span']/1000/4
gV=wet['action']['V']+ps/2+1.5*maxPoint
assert gM<wet['section']['MR'] and gV<wet['links']['VRs']
wellOut['trimStations'].update(EWrevisedWorkingDepth=dEW,EWFinalCapacity=[rm,rv],lowerEWBarZ=barZ,nearestCollectorBarSurfaceToCrossing=nomClear)
wellOut['receiverEndComparison']={'method':'3 EW bars per face per side. Bottoms at Z3237.5; ring bars at indicated centres, top EW at Z3335 (inside the upper edge, not its top bars). West bends selected in plan; east straight projection in actual 200-wide RC wet beam. Indicative 200 straight tails after 48mm internal mandrel, nominal 34mm between two parallel tails. No reduced development credit for hooks. New headers use two bars each face with at least actual calculated bending-stress development outside 240mm side strips, not an assumed full-yield anchorage.','westCollectorLowerBarLevels':westCage,'hookPathsXY':paths,'nominalClearBetweenNewParallelHookPaths':hookClear,'reducedSupportForceFromShearShift':1.25*V,'supportSteelStress':endStress,'requiredStraightLengthAtSupport':needEnd,'eastLengthInsideBeam':eastAvailable,'westStraightAfterBend':hookLen,'wetBeamGlobalM_V':[gM,gV],'wetBeamMR_VR':[wet['section']['MR'],wet['links']['VRs']],'remaining':'Check native floor mesh/closed stirrup avoidance and placement tolerance (6.5mm at closest ordinary lower ring crossing), actual concrete mandrel pressure and confinement, shear/edge/crack at the opening and cover frame, roof/edge ultimate combination and filled/removed/renewing states. A support reserve cannot prove the pan feet, shell handling or reversible fire/air closure.'}
# Actual wet carrier cases compared over three field locations. Native
# 285OD end flange must also traverse the route unless it is removed by an
# established operation. Source distance measured west to east, not just
# under the first bridge; warm floor is not the thin exterior cover.
plan=[('court','court-E',7950,600,6100,7700),('spine','spine',9300,900,6100,7700),('outer','outer-E',11667.5,900,6000,7800)]
tubeOD=159.9;flangeOD=285.;sx0=7550.;fall=50/4250
profiles=[]
for name,firstX,top,od in [('outside-body',7550,-60,tubeOD),('reprofiled-outside-body',7550,-20,tubeOD),('reprofiled-moving-flange',7550,-20,flangeOD),('body-below-full-warm-build-up',8179.5,-180,tubeOD),('moving-flange-below-full-warm-build-up',8179.5,-180,flangeOD)]:
    # Set required clearance to the moving component at *the constraint
    # itself*. Last variant locates a flange below actual RC top, NOT merely
    # a tube below it (this costs an additional flange-radius difference).
    xaxis=top-10-od/2
    def z(x):return xaxis-fall*(x-firstX)
    arr=[]
    for lab,key,x,b,y0,y1 in plan:
        assert girds[key]['width']==b and girds[key]['z']==[-630,-180]
        left=x-b/2;right=x+b/2
        need=z(right)-od/2-10
        arr.append(dict(beam=lab,axis=x,xFaces=[left,right],ySupport=[y0,y1],residualDepthAtDownstreamFace=need+630,recessBelowFormerTop=-180-need))
    profiles.append(dict(case=name,atX=firstX,axisAtX=xaxis,ownerConditionTop=top,travelOD=od,downstreamAxis=z(12250),downstreamMinimumChannelBed=z(12250)-od/2-10,recessAtDownstream=-180-z(12250)+od/2+10,sections=arr))
# Same body-below-warm axis, test the non-removable flange on that draw:
# this BOTH invades overhead build-up and needs a lower channel bed.
mid=next(z for z in profiles if z['case']=='body-below-full-warm-build-up')
mix={**mid,'case':'body-below-warm-axis-with-travelling285flange','travelOD':flangeOD,'flangeIntrusionIntoRetainedBuildUp':(flangeOD-tubeOD)/2-10,'sections':[{**r,'residualDepthAtDownstreamFace':r['residualDepthAtDownstreamFace']-(flangeOD-tubeOD)/2,'recessBelowFormerTop':r['recessBelowFormerTop']+(flangeOD-tubeOD)/2} for r in mid['sections']],'downstreamMinimumChannelBed':mid['downstreamMinimumChannelBed']-(flangeOD-tubeOD)/2,'recessAtDownstream':mid['recessAtDownstream']+(flangeOD-tubeOD)/2}
profiles.append(mix)
assert 290<mix['recessAtDownstream']<291 and mix['flangeIntrusionIntoRetainedBuildUp']>50
# Actual warm corridor roof slab cut, not a replaceable eastern exterior
# cover ongoing across a heated domestic floor.
warm=[8179.5,9203.0];assert any(q['xy'][0]==7950 for q in G['heads'])
RWT={'case':'The motion of a complete fixed flange is compared independently from the body. All dimensions provisional RWT research, not selected conveyance. Do not add contradictory cover assumptions as a single passing geometry.','sourceBinding':'STR geometry: current-house-grid.json. Product/corridor proposals from RWT #1344 and 6 November design join; immutable evidence source must be refreshed if flange, pipe connection, rain duty, rod, rail or actual extraction changes.', 'pipeBodyOD':tubeOD,'fixedEndFlangeOD':flangeOD,'slope':fall,'stationX':[7550,12250],'fallAcrossDraw':4700*fall,'approachAllowanceRoofBed':[10,10],'warmGalleryX':warm,'warmFloor':'Stone15/screed65/glass100 over RC200 top−180/bottom−380. The warm gallery/water withdrawal floor is not a −60 or −20 removable outdoor walking cover. With the tube body below −180, the travelling larger flange still hits the underside of the retained warm build-up and the RC slab. A body-only negative is not a whole assembly clearance.','profiles':profiles,'threeBridgeSectionControls':[]}
for lab,key,x,b,y0,y1 in plan:
    records=[(p,n,cat,k,cx+p[0]-x) for name,p,n,cat,k,cx,cy in beamRecords if name==key and y0<p[1]<y1]
    # Conditional predecessor gravity origins after TRUE routing, separate
    # actual bridge ledger, not arbitrary translated line budgets: compressive
    # contributions only, one-end absolute torque charges all eccentricities.
    nbar,dia=(4,20) if b==600 else (4,25);Lw=(y1-y0)/1000
    rc=[];sety={y0,y1,7000,*[p[1] for p,*_ in records]}
    for extra in [False,True]:
        weighted=[(p[1],n*(1.35 if k=='G' else 1.5),e) for p,n,cat,k,e in records if n>0]
        # The predecessor budget already includes local moving rail. Add the
        # missing adverse eccentricity of its 5kN live weight. As explicitly
        # separate extreme,+195 is the known member-level upper rod compression
        # check, NOT evidence that each beam actually receives 195. A failed
        # bound points to required final shifted allocation.
        if extra:weighted.append((7000,195.03,b/2))
        T=sum(abs(N*e)/1000 for _,N,e in weighted)+7.5*b/2000
        RL=sum(N*(y1-y)/(y1-y0) for y,N,e in weighted);RR=sum(N*(y-y0)/(y1-y0) for y,N,e in weighted)
        V=max(RL,RR)
        M=max(RL*(y-y0)/1000-sum(N*(y-f)/1000 for f,N,e in weighted if f<y) for y in sety)
        # A cutting operation cannot invent a new bottom anchorage! Keep actual
        # soffit -630. Worst cover50 and original 4H20/4H25, H10/75 four legs.
        actualG=sum(n for _,n,_,k,_ in records if k=='G' and n>0);actualQ=sum(n for _,n,_,k,_ in records if k=='Q' and n>0)
        for dep in [450,370,330,260,160]:
            sec=br['section'](b,dep,nbar,dia,50,10,75,0,0,0)
            sec['M']=M;sec['V']=V
            # All service G/Q treated as midspan POINT, no use of a shorter
            # span or gross inertia. The +195 stress case uses its full load
            # as characteristic to avoid a hidden favourable service split.
            ee=sec['edge'];de=dep-ee;As=nbar*math.pi*dia**2/4
            def dd(P,phi):
                ec=br['E']/(1+phi);mod=200000/ec;nx=(-mod*As+math.sqrt((mod*As)**2+2*b*mod*As*de))/b;I=b*nx**3/3+mod*As*(de-nx)**2
                return P*1000*(Lw*1000)**3/(48*ec*I)
            sec['deflectionIncluding400microstrain']=dd(actualG+(195.03 if extra else 0),3.5)+dd(actualQ,0)+.0004*(Lw*1000)**2/(8*dep)
            sec['deflectionComparator']=Lw*1000/250
            sec=br['mechanics'](sec,T)
            rc.append({'depth':dep,'extra195PointControl':extra,'M':M,'V':V,'T':T,'MR':sec['MR'],'cornerInteraction':sec['bottomCornerInteraction'],'strutInteraction':sec['shearTorsionStrut'],'deflection':sec['deflectionIncluding400microstrain'],'spanOver250':sec['deflectionComparator'],'pass':sec['pass'],'failed':[k for k,v in sec['passChecks'].items() if not v]})
    RWT['threeBridgeSectionControls'].append(dict(name=lab,axisX=x,width=b,span=Lw,caseRows=rc,sectionLoadSources=sorted({r[2] for r in records})))
RWT['anchorage']='A top recess keeps the low straight bottom bar path used by the original450 field. It cuts the unaltered upper bars/closed torsion links; a formed lower top cage, anchorage into the known −250/−290 node layers, and local notch interface/sidewall are additional physical changes. Body-only depth330 or370 is not an assembled pipe/renewal pass. Test the loaded outer1.8m member independently of the two1.6m members. The full285 flange plus below-warm-stack alternative removes most field depth and intersects the continuous gallery slab; do not specify a recess or underfloor extraction as though only three isolated ribs existed.'
RWT['decision']='Do not adopt the above-bridge route, excavate the structural core, or change levels. Preserve 450mm formed field and under-bridge option as the controlling unmodified geometry. A removable pipe joint, continuous accessible warm-floor/channel and priceable alternative support could reopen a different route; a thin outdoor cover or body-only envelope does not.'
out={'status':'Source-bound proposed structural comparisons for three interfaces; no HAD, structure, waterproofing, service appliance, site or product adoption.','sources':{f:hashlib.sha256((D/f).read_bytes()).hexdigest() for f in ['current-house-grid.json','current-house-head-actions.json','open-loggia-support.json','current-house-bridge.json','current-house-nodes.json','current-house-floor-closure.json']},'HAD':G['sources']['project/had/studies/water-replan.json'],'groundFloor':groundOut,'formedShowerOpening':wellOut,'aboveBridgeCarrier':RWT,'admitted':False}
def norm(v):
 if isinstance(v,dict):return {k:norm(x) for k,x in v.items()}
 if isinstance(v,(tuple,list)):return [norm(x) for x in v]
 return round(v,6) if isinstance(v,float) else v
t=D/'current-house-occupied-interfaces.json';body=json.dumps(norm(out),indent=2)+'\n'
if '--check' in sys.argv:assert t.read_text()==body
else:t.write_text(body)
for row in RWT['threeBridgeSectionControls']:
 print(row['name'],[(c['depth'],c['pass'],round(c['cornerInteraction'],2)) for c in row['caseRows'] if not c['extra195PointControl']])
# Plan plot is cut from the same floor/support cells used above, not a generic
# rectangle. Paired section shows the precise warm-gallery obstruction.
from xml.sax.saxutils import escape
t=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1190 720"><rect width="1190" height="720" fill="#fbfaf6"/><g font-family="sans-serif" fill="#283941">']
def tx(x,y,msg,n=15):t.append(f'<text x="{x}" y="{y}" font-size="{n}">{escape(msg)}</text>')
def rect(x,y,w,h,c,stroke='none'):t.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{c}" stroke="{stroke}"/>')
def box(r,c):
 x,y,xx,yy=r;rect(32+x*.039,605-yy*.039,(xx-x)*.039,(yy-y)*.039,c)
tx(30,36,'A real floor, a formed wet opening and the water-pipe draw',25)
tx(30,62,'Proposed structural comparison • millimetres / kN • no construction or waterproofing admission',16)
tx(31,98,'Ground slab and its actual concrete supports',20)
for xa,xb in pairwise(cuts[0]):
 for ya,yb in pairwise(cuts[1]):
    p=((xa+xb)/2,(ya+yb)/2)
    if dry(p):
        ty,_,_=fieldRoute(p);box([xa,ya,xb,yb],{'direct':'#93b2ab','simple':'#dfecdd','cant':'#bf795d'}[ty])
for x,y,m in [(30,637,'Dark: supported. Light: clear span. Rust: seat projection.'),(30,665,'Longest clear 2,967.5 mm. Added bars follow actual bays.')]:tx(x,y,m)
tx(542,102,'First floor • rear west wet field',20)
# Draw NW-W at 0.112; room void body remains transparent.
def wc(x,y):return 555+(x-332.5)*.112,346-(y-8852.5)*.075
def wb(r,color):
 x,y=wc(r[0],r[3]);rect(x,y,(r[2]-r[0])*.112,(r[3]-r[1])*.075,color)
wb([332.5,8852.5,2902.5,11667.5],'#e1e9e4')
wb([2802.5,8852.5,3002.5,11667.5],'#426c74')
for cy in [9132.5,9772.5]:wb([332.5,cy-120,2902.5,cy+120],'#8ab4ab')
for cx in [1692.5,2332.5]:wb([cx-120,9012.5,cx+120,9892.5],'#8ab4ab')
wb(well,'#a45538')
tx(872,147,'400 × 400 formed opening');tx(872,174,'3H12 EW per side/face');tx(872,201,'2H12 NS per side/face');tx(872,228,'590 to wet-beam face');tx(872,255,'Tray edge reserve only 10');tx(872,289,'Unknown feet / closure /');tx(872,311,'handling remain separate.')
tx(542,388,'East water route • vertical section along gallery',20)
# X scaled, Z deliberately magnified. Include actual tube and flange beneath
# warm build-up; the flange intrudes into both the RC200 and fixed insulation.
xx=lambda x:545+(x-7550)*.124
zz=lambda z:447-z*.22
rect(xx(warm[0]),zz(0),(warm[1]-warm[0])*.124,180*.22,'#dac9a6')
rect(xx(warm[0]),zz(-180),(warm[1]-warm[0])*.124,200*.22,'#8b9d9d')
for lab,key,x,b,y0,y1 in plan:rect(xx(x-b/2),zz(-180),b*.124,450*.22,'#a4b9b5')
profiles0=mid;za=lambda x:mid['axisAtX']-fall*(x-mid['atX'])
xa,xb=7550,12250
def strip(od,c):
 t.append('<polygon fill="'+c+'" points="'+' '.join(f'{xx(x):.2f},{zz(za(x)+v*od/2):.2f}' for x,v in [(xa,1),(xb,1),(xb,-1),(xa,-1)])+'"/>')
strip(285,'#dba18d');strip(tubeOD,'#557e8b')
tx(542,621,'Rust: 285 mm flange draw. Blue: 159.9 mm tube; vertical scale enlarged.')
tx(542,648,'Body below full warm build-up: travelling flange needs 290.3 mm recess at the outlet.')
tx(542,674,'Fixed gallery slab still intersects the draw. No three-beam notch is admitted.')
t.append('</g></svg>');pic=D/'current-house-occupied-interfaces.svg';svg='\n'.join(t)+'\n'
if '--check' in sys.argv:assert pic.read_text()==svg
else:pic.write_text(svg)
