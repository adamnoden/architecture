"""Four outer L sections with real biaxial actions and four court tension
stations over existing shafts; price metal interruption, not a glued masonry
joint or 36 through-rods. N compression positive. mm, kN, kNm, MPa.
"""
from pathlib import Path
import json,runpy,sys,math
from itertools import pairwise,product
D=Path(__file__).resolve().parent;a=runpy.run_path(str(D/'current-house-joined-foundation.py'))
pl=a['plane'];A,B,C,E=a['A'],a['B'],a['C'],a['E'];fy=.92*500/1.15;fc=.85*30/1.5
cent=pl['cc'];rects=[[(0,0),(1000,0),(1000,140),(0,140)],[(0,140),(140,140),(140,1000),(0,1000)]]
def clip(P,dx,dy,th):
    Q=[]
    for p,q in zip(P,P[1:]+P[:1]):
        h=p[0]*dx+p[1]*dy-th;k=q[0]*dx+q[1]*dy-th
        if h>=0:Q.append(p)
        if (h>=0)!=(k>=0):
            s=h/(h-k);Q.append((p[0]+s*(q[0]-p[0]),p[1]+s*(q[1]-p[1])))
    return Q
def polar(P):
    if len(P)<3:return 0,0,0
    A=fx=fy0=0.
    for p,q in zip(P,P[1:]+P[:1]):
        c=p[0]*q[1]-q[0]*p[1];A+=c;fx+=(p[0]+q[0])*c;fy0+=(p[1]+q[1])*c
    return A/2,fx/6,fy0/6
def bars(stations):
    zz={(x,y) for x in [43,97] for y in [43,97]}
    for v in stations:
        for across in [43,97]:zz.update([(v,across),(across,v)])
    return sorted(zz)
def curve(N,bs,dia,concrete=rects):
    As=math.pi*dia**2/4;rr=[]
    for jt in range(120):
        th=jt*math.pi/60;dx,dy=math.cos(th),math.sin(th);mx=max(x*dx+y*dy for r in concrete for x,y in r)
        def cal(dep):
            boundary=mx-.8*dep;s0=sx=sy=0.
            for rect in concrete:
                area,Qx,Qy=polar(clip(rect,dx,dy,boundary));s0+=fc*area;sx+=fc*Qx;sy+=fc*Qy
            for x,y in bs:
                f=max(-fy,min(fy,.0035*(1-(mx-x*dx-y*dy)/dep)*200000))
                t=As*(f-(fc if x*dx+y*dy>=boundary else 0));s0+=t;sx+=t*x;sy+=t*y
            return s0/1000,(sx-s0*cent)/1e6,(sy-s0*cent)/1e6
        low,high=.01,3500.
        for _ in range(38):
            d=(low+high)/2
            if cal(d)[0]<N:low=d
            else:high=d
        n,x,y=cal((low+high)/2);rr.append((x,y))
    return rr
def utilisation(q,curve0):
    # Positive intersection with polygon whose vertices are actual
    # strain-compatible ultimate states at the same axial N.
    rays=[]
    for p,b in zip(curve0,curve0[1:]+curve0[:1]):
        d=(b[0]-p[0],b[1]-p[1]);det=q[0]*d[1]-q[1]*d[0]
        if abs(det)<1e-8:continue
        t=(p[0]*d[1]-p[1]*d[0])/det;s=(p[0]*q[1]-p[1]*q[0])/det
        if t>0 and -.0000001<=s<=1.0000001:rays.append(t)
    return 1/min(rays) if rays else 0 if math.hypot(*q)<1e-6 else 999
# All outer pier vertical component bounds from actual floor stops. Add full
# solid RC/L permanent height and generous finish budget as adverse only. Top
# wall pressures are not magically hidden in other foundation members.
Gpier=(1+.86)*.14*3.35*25 # actual lower L volume at this storey
# Corner nearest pads are >2m away; ensure allocated L core/wall selfweight
# and the corner bearing represent the vertical load (not every outer facade).
Ndomain=[5*math.floor(min(a['cornerRaw'][p][0] for p in pl['corners'])/5),5*math.ceil((max(a['cornerRaw'][p][1] for p in pl['corners'])+1.35*(Gpier+5+.210*9.81))/5)];assert min(a['cornerRaw'][p][0] for p in pl['corners'])>=Ndomain[0]
assert max(a['cornerRaw'][p][1] for p in pl['corners'])+1.35*(Gpier+5+.210*9.81)<=Ndomain[1]
dem=[]
for i,(cas,u,fs,rs,roofM) in enumerate(pl['actual']):
 for p,vs in rs.items():
    mirror=[1 if z==A else -1 for z in p]
    # Absolute local resultant at axis corner(70,70), not centroid(301.18
    # approx). Extra N*40mm covers second order/small setout; no shrinkage
    # compatibility of a fixed window is inferred from these steel stresses.
    mm=[mirror[j]*(vs[j]*(3370+40)+vs[j+2]*(6600+40))/1e6 for j in range(2)]
    vv=[mirror[j]*(vs[j]+vs[j+2])/1000 for j in range(2)]
    for N in Ndomain:
        for signX,signY in product([-1,1],repeat=2):
            mc=[mm[j]+N*(70-cent)/1000+abs(N)*.04*s for j,s in enumerate([signX,signY])]
            dem.append((N,mc,vv,p,i))
def screen(st,diam):
    bs=bars(st);hulls={n:curve(n,bs,diam) for n in Ndomain};worst=max((utilisation(m,hulls[n]),n,m,p,i) for n,m,v,p,i in dem)
    return dict(stations=st,diameter=diam,count=len(bs),steelFraction=len(bs)*math.pi*diam**2/4/(1000*140+860*140),interaction=worst[0],governingN=worst[1],governingFirstMoments=worst[2],at=worst[3],windIndex=worst[4])
# Main 12H20 bars match 3 common four-hole groups; intermediate H12 each
# face at 350 and600 in each leg provides distribution/links. No axial
# capacity of those H12 is needed across the imperforate central barrier.
chosen=screen([850,950],20);assert chosen['interaction']<1
mainBars=bars([850,950]);vb=max(math.hypot(*v) for n,m,v,p,i in dem);vax=max(abs(z) for _,_,v,_,_ in dem for z in v)
studFy=600/1.25;threadA=353;Nbar=math.pi*20**2/4*fy/1000
full=45;drill=full+5+7;web=140-2*drill
threadR=.5*math.pi*20.75*full*(200/(1.1*math.sqrt(3)))/1000
assert Nbar<min(threadR,threadA*studFy/1000) and web>=20
# Two stock 140 square bars cut into three four-stud anchor blocks in plan.
# A 20mm continuous L web connects all three blocks at midheight; stocking
# the entire L140 deep is an unnecessary mass control. One 140x60 leading
# key face is considered per axis: do not count the trailing face in tension.
proj=(140-20)/2;keyP=vax*1000/(140*proj);assert keyP<.85*fc
# Combined ULS torque sensitivity from any 160mm in-plane application offset.
# Match the axially opposite bar axes to machine/blind threads across one
# unperforated solid; reserve FE yield for actual bolt/dowel shear.
cx=sum(p[0] for p in mainBars)/len(mainBars);cy=sum(p[1] for p in mainBars)/len(mainBars)
J=sum((x-cx)**2+(y-cy)**2 for x,y in mainBars)
dowel=max(vb*.160*1e6*math.hypot(x-cx,y-cy)/J/1000 for x,y in mainBars)
barvm=math.hypot(fy,math.sqrt(3)*dowel*1000/(math.pi*20**2/4));assert barvm<500/1.15
bearing=dowel*1000/(20*50);assert bearing<fc
# Full membrane and positive alignment, not an unsupported fillet weld on
# every highly loaded bar. One midweb butt seam is conservatively charged
# with full axis horizontal action, plus actual displacement error of each
# axial stud axis (3mm concentricity budget) over its two opposed faces.
seamStress=vax*1000/(140*20)+4*Nbar*1000*3/(140*20**2/6)
# The assumption all four bars' offset moments act in the SAME direction at
# one web seam can legitimately fail. The main normal force actually goes
# through the opposed solid block; tighten as-machined axis error if needed.
seamAt1=vax*1000/(140*20)+4*Nbar*1000*1/(140*20**2/6)
assert seamAt1<100
Ax=.2604;thickAr=.14*.14+2*.2*.14;mass=8000*(thickAr*.140+(Ax-thickAr)*.020)
joint={'section':chosen,'primaryBarXY':mainBars,'additionalNoncreditedH12':'two per face at each350/600 station in each leg, H8 horizontal confinement at50 through first150 either side of plate, H10/150 general. Actual lap/development/hoop topology and physical load translation remain to qualify.','axialDomain':Ndomain,'lowerCoreGrossCharacteristicKN':Gpier,'criticalHorizontalResultantKN':vb,'maxPerAxisKN':vax,'maximumCoupledMomentResultant':max(math.hypot(*[(v[j]*(3370+40)+v[j+2]*(6600+40))/1e6 for j in range(2)]) for case in pl['actual'] for v in case[3].values()),'barMaxAxialInBiaxialModel':Nbar,'counterweightClaim':False,'DPC':{'threeThickBlocksPlanLocal':[[0,0,140,140],[800,0,200,140],[0,800,140,200]],'thickBlockZ':[-110,30],'connectingContinuousWebZ':[-50,-30],'blindM24FullEngagement':45,'blindDrillDepthMax':57,'remainingUncutCore':web,'threadPureShearResistance':threadR,'requiredMaleMinProof':600,'comparisonStudArea':353,'onePositiveShearKeyFaceMM2':140*proj,'maxKeyPressure':keyP,'dowelShearLargestWith160Ecc':dowel,'combinedSteelVM':barvm,'nominalDowelBearing50mm':bearing,'opposedThreeMMSeamStress':seamStress,'opposedOneMMSeamStress':seamAt1,'netUnboredStockKgPerPier':mass,'solid140ControlKgPerPier':Ax*.14*8000,'route':'Studs with full-strength forged/rolled M24 transitions to twelve H20s enter separate blind bores above and below the four-bar blocks. A 26mm-or-greater imperforate middle remains. Vertical bar forces go through thick stock to their aligned opposite bars; gross concrete bears across plate/block faces. A shop-butt-welded 20mm web makes one L moisture plane. Positive key faces carry in-plane horizontal load; residual sensitivity tested through twelve embedded/captive studs. No friction or field welding below grade. Demand actual certified compatible threaded bar/plate material, tensile pullout/fatigue/thread-root/bearing/splitting, fabrication/air-edge/thermal details before adoption.'}}
if __name__=='__main__':
 print('outer section:',chosen,'plate kg',mass,'V',vb,'key p',keyP,'bar/thread',Nbar,threadR)
# Court stations: reuse two of the eight actual pile starter locations. Adding
# two unconstrained vertical bars to an already full head is the failed control.
# A formed S bend continues selected H22 bars into two BLIND M24 underside
# bores. Top M20 A4-80 rods have their own blind bores; no hole in the barrier.
# These two main bars are reserved for the positive hold and not also silently
# counted at full yield in the remaining six-bar pile-section screen.
from itertools import permutations,combinations
P=[(141*math.cos(math.radians(22.5+45*i)),141*math.sin(math.radians(22.5+45*i))) for i in range(8)]
court=[]
def offsets(order,targets):
    # Each bar follows a monotone offset from its original plan location.
    # Exact minimum distance between the centre lines of any pair sharing
    # this common interpolation factor; never rely on a 100-point near miss.
    s=list(P);e=list(P)
    for i,q in zip(order,targets):e[i]=q
    clearance=1e5
    for i,j in combinations(range(8),2):
        dv=[s[i][k]-s[j][k] for k in [0,1]];dt=[e[i][k]-e[j][k]-dv[k] for k in [0,1]]
        ss=sum(z*z for z in dt);v=max(0,min(1,-sum(x*y for x,y in zip(dv,dt))/ss)) if ss else 0
        clearance=min(clearance,math.hypot(*(z+v*t for z,t in zip(dv,dt)))-22)
    return max(math.dist(P[i],q) for i,q in zip(order,targets)),clearance
for oldStop,(stop,catch,head) in a['shifts'].items():
    hxy=a['xy'](head);i=a['W'][a['edge']['wallat'](stop)][0]
    target=[tuple(z-k+(ds if j==i else 0) for j,(z,k) in enumerate(zip(stop,hxy))) for ds in [-60,60]]
    order=min(permutations(range(8),2),key=lambda o:(max(0,25-offsets(o,target)[1]),offsets(o,target)[0]))
    dx,clr=offsets(order,target);height=615.;R=200.
    # Two radius200 tangential curves and intervening straight; comparison
    # with 1:6 slope includes each transition, not just gross offset/height.
    def drift(theta):return 2*R*(1-math.cos(theta))+(height-2*R*math.sin(theta))*math.tan(theta)
    aa,bb=0.,.3
    for _ in range(40):
        t0=(aa+bb)/2
        if drift(t0)<dx:aa=t0
        else:bb=t0
    slope=math.tan(bb);assert slope<=1/6 and clr>25
    T=-a['bounds'][stop][0][0];bar=.6*T;assert bar<245*600/1.25/1000
    # No full-yield anchorage of a large bent horizontal tail: 1.20 m
    # declared minimum *straight below the concrete pile cut-off*, developed
    # at the actual allocated hold force, with adverse 2.1 MPa effective bond.
    ld=bar*1000/(math.pi*22*2.1);assert ld<1200
    threadTop=.5*math.pi*17.3*45*200/(1.1*math.sqrt(3))/1000
    threadLower=.5*math.pi*20.75*45*200/(1.1*math.sqrt(3))/1000
    assert bar<min(threadTop,threadLower,353*500/1.15/1000)
    hp=bar*1000/(120*110-math.pi*22**2/4);bs=hp*55**2/2/(30**2/6)
    assert hp<.6*fc and bs<200/1.1
    turn=bar*slope;linkCap=2*math.pi*12**2/4*500/1.15/1000
    assert 2*turn<linkCap
    court.append({'head':head,'axis':hxy,'floorRodGroup':stop,'headLocalRodEnds':target,'originalPileBarIndicesZeroBased':order,'originalBarXYLocal':[P[j] for j in order],'sweptBarClearEachOtherSixStillVertical':clr,'maximumPlanSet':dx,'bendStartFinishZ':[-735,-120],'centrelinedBendRadius':R,'maximumSlope':slope,'jointUpliftKN':T,'worstRodAt60Percent':bar,'M20A4_80Resistance':245*600/1.25/1000,'M24FactoryRolledLowerEndProofRequiredMPa':500,'twoBlindFullThreadsMM':45,'threadStripTopLowerKN':[threadTop,threadLower],'lower1200StraightBondRequired':ld,'oneBarTransverseForce':turn,'twoH12TieResistance':linkCap,'floorPlateGrossPlanThickness':[280,120,30],'patchStress':hp,'plateBendingStress':bs,'DPCBlockPlanThickness':[280,140,140],'lowerBarContinuity':'Two H22 continue from the original 400 mm pile section; through the six other starters and named beam cage, actual non-vertical starter ends and closed hoops still need their 3D lanes. Offset geometry here compares all eight at equal elevations; the bar lengths descend 1.2m below head. No new shaft, adhesive or friction. Reserve the corresponding two starter capacities before adding pile bending or other head actions.'})
out={'status':'Candidate force path, not a qualified water/thermal joint or shaft design.','outer':joint,'court':court,'reference':'ISO 3506 A4-80 nominal 0.2% proof600 MPa, Bossard Materials screws & nuts: https://www.bossard.com/-/media/bossard-group/website/documents/technical-resources-old/stainless-steel-fasteners.pdf . Actual grade, force on a machined/upset reinforcing-bar end and compatibility are separate from a fastener catalogue. Concrete bond model provenance: JRC89037, https://publications.jrc.ec.europa.eu/repository/handle/JRC89037 .','boundary':'The positive upper capillary cut remains required at structural penetrations. Blind central stock does not by itself qualify perimeter air/moisture seals, heat flow, complete steel execution or site uplift. Four outer joints and four court rods do not imply only eight piles can see tension. Full pile/soil, differential settlements, actual starter bends/hoops and temporary stability remain unresolved.','admitted':False}
dest=Path(__file__).with_suffix('.json');ss=json.dumps(out,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert dest.read_text()==ss
else:dest.write_text(ss)
