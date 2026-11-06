"""Upper roof rods terminate in real floor rings. Distinguish zero-G equipment cases
from whole-house uplift with evidenced lower-bound structural mass on actual supports.
"""
from pathlib import Path
import json,math,sys
from collections import defaultdict
from itertools import pairwise
D=Path(__file__).resolve().parent
def read(f):return json.loads((D/f).read_text())
R=read('current-house-ring-floor-stations.json')['rings'];W=read('current-house-welded-network.json');O=read('open-loggia-support.json');H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
A,B,C,E=332.5,11667.5,3917.5,8082.5
walls={};coords={};allLower=set()
for kind,lo,hi in [('outer',A,B),('court',C,E)]:
 for face,axis,d in [('south',0,lo),('east',1,hi),('north',0,hi),('west',1,lo)]:
    w=kind+'-'+face;ops=sorted((max(lo,q['centre']-q['width']/2),min(hi,q['centre']+q['width']/2)) for q in H['openings']['GROUND'] if q['wall']==w)
    # Bearings deliberately sit in real clear lower piers. Two portals have
    # the specific pre-existing RC bearing posts on their actual axes.
    u={lo,hi};last=lo
    for l,r in ops+[(hi,hi)]:
        if l>last:
            a,b=last+120,l-120
            if a<=b:
                if b-a>2000:u.update([a+(b-a)/3,a+2*(b-a)/3])
                elif last!=lo and l!=hi:u.add((a+b)/2)
        last=max(last,r)
    if face=='north':u.update([4377.5,7622.5])
    if w=='court-south':u.update([4785,7215])
    raw=sorted(u)
    # Near-coincident passive pads make poor force/stiffness references.
    # The actual RC portal stations take precedence over a neighbouring centroid.
    for p in raw:
        if p not in [lo,hi,4377.5,7622.5] and min(abs(p-q) for q in u if q!=p)<420:u.remove(p)
    us=sorted(u);walls[w]=(axis,d,lo,hi,us)
    for v in us:allLower.add((v,d) if axis==0 else (d,v))
def wallat(p):
    for w,(i,d,l,r,_) in walls.items():
        if abs(p[1-i]-d)<.1 and l-.1<=p[i]<=r+.1:return w
    raise ValueError(p)
def xy(w,u):
    i,d,*_=walls[w];return (u,d) if i==0 else (d,u)
def lower(w,p):
    i,d,l,r,us=walls[w];v=p[i]
    for a,b in pairwise(us):
        if a-.001<=v<=b+.001:
            u=(v-a)/(b-a)
            return [(xy(w,a),1-u),(xy(w,b),u)]
    raise ValueError((p,w))
# Weighted reactions arrive at actual upper stations; carry them longitudinally
# in the first-floor perimeter/court beam. No out-of-plane 'uplift diaphragm' credit.
def transmit(rows):
    result=defaultdict(float)
    for rr in rows:
        p=tuple(rr['xy']);w=wallat(p)
        for loc,f in lower(w,p):result[loc]+=f*rr['n']
    return dict(result)
INF={};heelloads={}
for ring,info in R.items():
    for k,rows in info['influence'].items():
        if k=='ringMass':continue
        kind,position=k.split(':');xy0=tuple(float(i) for i in position.split(','))
        INF[kind,xy0]=transmit(rows);heelloads[kind,xy0]=rows
def combine(q,p):
    out=defaultdict(float)
    for table,f in [(q[0],q[1]),(p[0],p[1])]:
        for k,v in table.items():out[k]+=v*f
    return dict(out)
# Keep a separate influence history for first-floor vertical strip bending;
# loads on the same roof row stay correlated within both the inner/outer loop.
def uppercombine(q,p):
    d=defaultdict(float)
    for tab,f in [q,p]:
        for r in tab:d[tuple(r['xy'])]+=f*r['n']
    return d
spanShearTerms=defaultdict(list);spanLoadAbs=defaultdict(float);spanCases=defaultdict(list);padCases=defaultdict(list);caseN=defaultdict(lambda:[0.,0.]);fixedN=defaultdict(lambda:[0.,0.]);components=defaultdict(float)
def feed(label,upper,l,h,role):
    # A ring corner is a lower anchored or compression bearing in this scheme;
    # intermediate contributions end in their real span.
    nc=defaultdict(float);ms=defaultdict(float);qs=defaultdict(list)
    for p,k in upper.items():
        w=wallat(p);i,d,lo,hi,us=walls[w];u=p[i]
        for v,t in lower(w,p):nc[v]+=k*t
        for a,b in pairwise(us):
            if a<u<b:
                spanLoadAbs[w,a,b]+=abs(k)*max(abs(l),abs(h))
                qs[w,a,b].append((u,k))
                for j in range(1,20):
                    z=(b-a)*j/20;s=u-a
                    ms[w,a,b,j]+=k*(min(z,s)-z*s/(b-a))/1000
                break
    for key,items in qs.items():spanShearTerms[key].append((items,l,h))
    for v,k in nc.items():
        padCases[v].append((label,k,l,h))
        row=(fixedN if role=='guaranteed' else caseN)[v]
        row[0]+=min(k*l,k*h);row[1]+=max(k*l,k*h)
    for key,k in ms.items():spanCases[key].append((label,k,l,h))
    components[label]+=l*sum(upper.values())
    if 'retainedObserver' in globals() and role=='guaranteed':retainedObserver(label,upper,l)
# Architectural minimum: mandated formed steel component count, at least 95%
# of computed nominal area and density 77 vs 78.5. Neither node allowances,
# maximum nonsteel roof layers, finishes, glazing nor contents stabilise suction.
metalMin=.9*.95*77/78.5
for frame in W['frames']:
    ordinary=frame['id']=='ordinary';L=frame['axisSpanM'];ds=1 if ordinary else math.sqrt(2)
    frames=[]
    if ordinary:
        for u in [4700,7300]:frames.extend([((u,C),(u,A)),((u,E),(u,B)),((C,u),(A,u)),((E,u),(B,u))])
    else:
        frames.extend([((x,y),(X,Y)) for x,X in [(C,A),(E,B)] for y,Y in [(C,A),(E,B)]])
    for inn,out in frames:
        def split(x):
            f=x/L;return uppercombine((heelloads['F',inn],1-f),(heelloads['F',out],f))
        for row in frame['rows']:
            p=split(row['x']);ar=row['area']
            feed('roof pressure',p,-2.25*ar,6.3*ar,'case')
            steel=ar/row['rowWidth']*W['sections']['secondary']['lineG'];feed('retained roof steel',p,metalMin*steel,1.35*steel,'guaranteed')
        for x,m in [(L/4-.26625*ds,frame['primaryG']/2),(3*L/4+.26625*ds,frame['primaryG']/2),(0,frame['tieG']/2),(L,frame['tieG']/2)]:
            feed('retained roof steel',split(x),metalMin*m,1.35*m,'guaranteed')
        for x,m in [(0,1+frame['bracingG']/2),(L,1+frame['bracingG']/2),(L/2,.5)]:
            feed('uncredited roof allowance',split(x),0,1.35*m,'case')
        for seat in [inn,out]:
            for typ,mag in [('torsion',10),('eccentric',10.3)]:
                feed('signed local heel moment',uppercombine((heelloads[typ,seat],1),([],0)),-mag,mag,'case')
for kind,info in R.items():
    part={tuple(r['xy']):r['n'] for r in info['influence']['ringMass']}
    feed('retained roof ring steel',part,metalMin,1.35,'guaranteed')
# Floor structural mass: use only the edge reaction of real source floor fields
# bearing on this ring; all non-collinear floor area, slab residuals, stair and
# finishes are ignored as counterweight. Guard: source 200 slab min190 and RC
# density >=23 are explicit delivery conditions, not soil/material certification.
slabMin=.9*.190*23
fields={f['id']:f for f in O['floor_fields']}
for row in O['finite_floor_frame']['floor_reaction_inventory']['reactions']:
    f=fields[row['field']];x,y,xx,yy=row['support_segment'];i=0 if x!=xx else 1;a=(x,y);b=(xx,yy);L=math.dist(a,b)
    if not L:continue
    p=((x+xx)/2,(y+yy)/2)
    w=next((w for w,(j,d,lo,hi,us) in walls.items() if i==j and abs(p[1-i]-d)<1 and lo<=p[i]<=hi),None)
    if not w:continue
    n=math.ceil(L/100)
    for k in range(n):
        u=a[i]+(b[i]-a[i])*(k+.5)/n;p=xy(w,u)
        if not walls[w][2]<=u<=walls[w][3]:continue
        trib=f['axis_span']/2000*L/n/1000
        netTrib=max(0,f['axis_span']/2000-.080)*L/n/1000 # don't credit concrete replaced by steel at the edge
        feed('retained RC floor edge share',{p:1},slabMin*netTrib,(1.35*f['G']+1.5*f['Q'])*trib,'guaranteed')
# Upper masonry: disjoint clear full-height core bands only. Exclude ALL first
# openings plus 215mm radial ring projections on each side, a 100mm joint/
# unfilled end zone, and 25% longitudinal loss for uncharted chases/rod pockets.
# Do not count weather leaf, head masonry over openings, corner overlaps, fitout.
# UPPER first-floor wall is physically seated on the same integral collector.
for w,(i,d,lo,hi,us) in walls.items():
  cuts={lo+100,hi-100}
  holes=[(op['centre']-op['width']/2-215,op['centre']+op['width']/2+215) for op in H['openings']['FIRST'] if op['wall']==w]
  for a,b in holes:cuts.update(v for v in [a,b] if lo+100<v<hi-100)
  for a,b in pairwise(sorted(cuts)):
    if any(l<(a+b)/2<r for l,r in holes):continue
    n=math.ceil((b-a)/100)
    for k in range(n):
        p=xy(w,a+(b-a)*(k+.5)/n);l=(b-a)/n/1000
        feed('retained upper solid core',{p:1},.9*.75*.12*3.07*16*l,1.35*.14*3.17*25*l,'guaranteed')
# Actual extra gravity over opening/edge (not useful deadweight): full-height
# upper wall includes the zones omitted from the min, plus reserve finishes.
for w,(i,d,lo,hi,us) in walls.items():
  holes=[(op['centre']-op['width']/2-215,op['centre']+op['width']/2+215) for op in H['openings']['FIRST'] if op['wall']==w]
  nn=math.ceil((hi-lo)/100)
  for k in range(nn):
    u=lo+(hi-lo)*(k+.5)/nn;ln=(hi-lo)/nn/1000; excluded=u<lo+100 or u>hi-100 or any(l<u<r for l,r in holes)
    extra=(.14*3.17*25 if excluded else 0)+4 # finish/ceiling edge budget
    feed('remaining upper edge load',{xy(w,u):1},0,1.35*extra*ln,'case')
rows=[];Mn=max(max(abs(sum(min(k*l,k*h) for _,k,l,h in terms)),abs(sum(max(k*l,k*h) for _,k,l,h in terms))) for terms in spanCases.values())
for p in sorted(allLower):
    n=caseN[p];g=fixedN[p];rows.append({'xy':p,'strippedAdverse':[n[0],n[1]],'accountedRetainedState':[n[0]+g[0],n[1]+g[1]]})
def lowerScheme(extra):
    # Explicit statically admissible load path at ULS, not an assertion of
    # uniformly fixed vertical reactions. A passive masonry contact never
    # supplies tension. Replace any negative short-span reaction by an upward
    # point load on the continuous rolled floor collector to its next captive
    # stations. Simultaneously using every local minimum is adverse and the
    # resulting supplemental moment only acts in hogging, not in both signs.
    caps={p for p in allLower if p[0] in [A,B] and p[1] in [A,B] or p[0] in [C,E] and p[1] in [C,E]}|set(extra)
    residual={p:caseN[p][0]+fixedN[p][0] for p in allLower};capLo={p:residual[p] for p in caps};sections={}
    for w,(i,d,lo,hi,us) in walls.items():
        pr=sorted(p[i] for p in caps if p[1-i]==d and lo<=p[i]<=hi);assert pr[0]==lo and pr[-1]==hi
        for ca,cb in pairwise(pr):
            interior=[u for u in us if ca<u<cb];net={u:min(0,residual[xy(w,u)]) for u in interior}
            for u,v in net.items():
                capLo[xy(w,ca)]+=v*(cb-u)/(cb-ca);capLo[xy(w,cb)]+=v*(u-ca)/(cb-ca)
            for a,b in pairwise(us):
                if a<ca or b>cb:continue
                worstPos=worstNeg=0.;worstShear=0.
                for j in range(21):
                    z=a+(b-a)*j/20
                    # Exact max short-span load differences are between grid cuts.
                    # Add an explicit 1/20-pitch moment interpolation allowance
                    # using the sum of absolute applied source forces below.
                    terms=spanCases.get((w,a,b,j),[]);hiM=sum(max(k*l,k*h) for _,k,l,h in terms);loM=sum(min(k*l,k*h) for _,k,l,h in terms)
                    longM=sum(v*(min(z-ca,u-ca)-(z-ca)*(u-ca)/(cb-ca))/1000 for u,v in net.items())
                    worstPos=max(worstPos,hiM);worstNeg=min(worstNeg,loM+longM)
                # The short-span grid is 20 intervals; conservatively allow L/40
                # times an upper bound for actual vertical shear from all applied loads.
                # Analytical piecewise influence maxima for point samples can
                # replace this broad interpolation allowance later.
                shearlimit=spanLoadAbs[w,a,b]+sum(-v for v in net.values())
                interp=(b-a)/1000/40*shearlimit
                sections[w,a,b]=(worstNeg-interp,worstPos+interp)
    return caps,capLo,sections
variations=[]
for extra in [[],[(4377.5,B),(7622.5,B)],[(4377.5,B),(7622.5,B),(A,6000),(B,5786.5)]]:
 caps,capLo,sm=lowerScheme(extra);variations.append((caps,capLo,sm));print(len(caps),'anchored; moment',min((v[0],k) for k,v in sm.items()),max((v[1],k) for k,v in sm.items()),'anchor min',min(capLo.values()))
print('actual local gravity components',dict(components),'closed under zero G separately')
# An actual published rolled section, elastic check only; no invented RHS
# fillet properties. Extra beam G charged as right-way additional load, with
# no stabilising credit; 80mm of approaching RC removed from favourable share.
caps,anchorBounds,moments=variations[0];welded=read('current-house-welded-heel.json');totalLength=62.;beamKgM=37.
beamG=beamKgM*9.81/1000;fy=355/1.1;MR=433e3*fy/1e6
longest=max(b-a for w,a,b in moments)/1000
addM=1.35*beamG*longest**2/8
largest=max(max(abs(v) for v in pair) for pair in moments.values())+addM
assert largest<MR
minstate=sum(components.values());assert minstate>0 and min(anchorBounds.values())<0
absBolt=max(-min(v['range'][0] for v in R[k]['stations']) for k in ['outer','court'])
rodA=353;rodFy=355/1.1;rodCap=rodA*rodFy/1000
assert rodCap>absBolt
# Local rod is M24 with minimum proof stress declared355/1.1. Bearing plates
# engage the web directly via two 12mm full-depth triangular stiffener plates;
# no pull-out cone in an 85mm slab ledge is borrowed. 100x140x20 plate with
# 28 clearance hole: model 40mm max cantilever per half, no prying credit.
plateStress=absBolt*1000*.5*40/(140*20**2/6)
# 25mm adds local stiffness relative to the passing 20mm elastic comparison.
plate25=plateStress*(20/25)**2
assert plate25<fy
out={'status':'Bounded upper-roof-to-first-floor and remanent ground-tie comparison. Conservative static equilibrium with passive contact and validated geometry; not merged structural selection.','roles':{'strippedLocal':'No dead-weight credit to the heel, upper rod, ring, or its cracked/removed-state control. Never erect roof on absent floor; any stripped/temporary support must be positively held before dismantling.','retainedShell':'Roof may rely only on installed minimum shell after RC and walls cured. 0.90 subset factor is an explicitly authored comparison, not a UK National Annex certification. Reopen for reduced thickness, permanent removal, material density below the specified lower bound, incomplete ties, site or assembly stage.'},'source':'British Steel Universal beams sizes 190724, 254x146x37 256.0 high x146.4 wide, 37kg/m, I=5537cm4, elastic modulus433cm3. https://www.britishsteel.co.uk/wp-content/uploads/2026/02/british-steel-universal-beams-datasheet-190724.pdf','minComponentTotals':dict(components),'retainedGlobalUniformSuctionBalance':minstate,'floorRing':{'section':'254x146x37 UB, assumed actual S355 grade required','z':[3114,3370],'lengthM':totalLength,'steelMassKg':totalLength*beamKgM,'rawRingClearanceAboveGround3065Extrados':3114-3065,'memberElasticMR':MR,'maximumIncludingSelfweight':largest,'maxAdditionalSelfweightMoment':addM,'qualification':'The two parallel beams assumption is not required: first compute the short spans on all physical pads, replace negative passive reactions by upward point loads in the continuous rolled member to its eight captive stops, then combine signed member moment ranges. Static admissibility is not a measured contact distribution. Elastic stability/restraint, local shear, splice, service movement and actual temporary sequence still require matching details. No new concrete mass is invented.'},'upperTie':{'count':22,'worstUp':absBolt,'M24TensileArea':353,'minMaterialStress':rodFy,'axialResistance':rodCap,'20mmPlateCantileverStress':plateStress,'25mmPlateStress':plate25,'role':'mechanical end fitting from actual roof steel through upper core into actual floor steel, positive upper rod termination at the floor; no adhesive/masonry bond or lower-DPC penetration for each rod. Penetration/clip/splitting, local compression and thermal/fire finish still require joint evidence.'},'stationControls':[{'count':len(caps),'minTieForce':min(v.values()),'maxHogging':min(m[0] for m in sm.values()),'maxSagging':max(m[1] for m in sm.values())} for caps,v,sm in variations],'candidateRetainedCaptiveStations':[{'xy':p,'minimumIncludingAdverseRedistribution':n,'role':'existing outer stability group' if p[0] in [A,B] else 'new court corner hold-down; DPC/jamb detail not admitted'} for p,n in sorted(anchorBounds.items())],'lowerPads':rows,'remaining':['True site/foundation and group stiffness remain unproved; signed rolled-beam reactions are not permission to borrow gravity from maximum roof layer allowances.','Need shifted roof/corner ties joined to every final shaft, floor bracing and arch/movement case before selection. Earlier 52-head schedule is a named different roof reference.','Upper slot/bolt/crown, eight full lower force crossings, lateral restraint/manufacture, plate/thermal/capillary and external acceptance not admitted.']}

# Same floor-ring forces, physical voids, openings and positive anchor burden,
# now compared with slab/edge reinforcement. No slab flange is credited.
def rectRC(b,h,cover,bar,nrows=2,nper=2,links=8,gap=25,areaOverride=None):
    As=nrows*nper*math.pi*bar**2/4 if areaOverride is None else areaOverride
    d=h-cover-links-bar/2-(nrows-1)*(bar+gap)/2
    fyd=500/1.15;fcd=.85*30/1.5;x=As*fyd/(.8*b*fcd)
    return dict(b=b,h=h,As=As,d=d,neutralAxis=x,MR=As*fyd*(d-.4*x)/1e6,xOverD=x/d,clearAcross=b-2*(cover+links+bar))
# Actual selected slabs stop on the structural perimeter axes: at both
# 4335-long stair and 2230-wide entrance only 85mm of inward RC exists.
# The 70mm halfcore outside the axis is included ONLY for the new formed beam.
assert H['stair']==[417.5,4432.5,2400,4335] and H['void']==[4885,417.5,2230,2317.5]
inward=min(H['void'][1]-A,H['stair'][0]-A);assert inward==85
slab=rectRC(inward,200,25,12,1,1,0,0,math.pi*12**2/4*inward/150)
down=rectRC(140,275,35,16)
up=rectRC(140,650,35,16)
assert slab['MR']<15 and down['xOverD']>.45 and up['xOverD']<.45
assert up['clearAcross']>=max(16,16+5,20)
# Exact signed local shear on each side of every discrete source; same-signed
# rows are kept correlated, including local heel torque. Superpose bounded
# residual redistribution over the actual longer span (any passive pad 0..uplift).
shears={};rcspan={}
for (w,a,b),mm in moments.items():
    terms=spanShearTerms[w,a,b];us=sorted({a,b,*(u for items,l,h in terms for u,k in items)})
    v0=v1=0.
    for x,y in pairwise(us):
        z=(x+y)/2;lo=hi=0.
        for items,l,h in terms:
            k=sum(t*((b-u)/(b-a)-(u<z)) for u,t in items)
            lo+=min(k*l,k*h);hi+=max(k*l,k*h)
        v0=min(lo,v0);v1=max(hi,v1)
    i,d,_,_,pads=walls[w];st=sorted(p[i] for p in caps if p[1-i]==d and walls[w][2]<=p[i]<=walls[w][3])
    ca,cb=next((p,q) for p,q in pairwise(st) if p<=a and b<=q)
    slo=shi=0
    for u in pads:
        if not ca<u<cb:continue
        n=min(0,caseN[xy(w,u)][0]+fixedN[xy(w,u)][0]);k=(cb-u)/(cb-ca)-(u<=a)
        slo+=min(k*n,0);shi+=max(k*n,0)
    # Charge the entire new RC area as adverse load. No stabilising credit;
    # former RC200 or replaced masonry mass is NOT silently deducted.
    qg=1.35*.14*.65*25;le=(b-a)/1000
    shears[w,a,b]=max(abs(v0+slo),abs(v1+shi))+qg*le/2
    rcspan[w,a,b]=max(map(abs,mm))+qg*le**2/8
z=.9*up['d'];cot=1.5;fyd=500/1.15;fcd=.85*30/1.5
VRs=2*math.pi*8**2/4/100*z*fyd*cot/1000
Vmax=140*z*(.6*(1-30/250))*fcd/(cot+1/cot)/1000
VM=max(shears.values());MM=max(rcspan.values())
assert MM<up['MR'] and VM<min(VRs,Vmax)
# Actual first-floor raw sill elevations are relative to FFL +3450. No upper
# door on either ring. Intrados/void footprints, plenum and port remain intact.
ops=[q for q in H['openings']['FIRST'] if q['wall'] in walls]
assert len(ops)==25 and all(q['kind']=='window' for q in ops)
zlo=3170;zhi=zlo+650; FF=3450
rodHole=32;rodMargin=up['clearAcross']-rodHole
assert rodMargin<0 # A centered sleeve through the unaltered cage fails.
barsMass=8*math.pi*(.016**2)/4*7850*totalLength
tieCL=2*((140-2*(35+4))+(650-2*(35+4)))*.001+.16
linkMass=math.ceil(totalLength/.1)*tieCL*math.pi*.008**2/4*7850
out['rcEdgeAlternative']={'role':'Preferred next floor-collector development. Same eight lower ties and signed source loads; no structural geometry selected.', 'axisEdgeToStairAndEntryVoidMM':inward,'RC200ActualNarrowField':slab,'275Downstand':down,'downstandSoffit':3370-275,'downstandMarginOverTypical3065Extrados':3370-275-3065,'650Upstand':up,'floorTopBottom':[3370,3170],'upstandBottomTop':[zlo,zhi],'upperFFL':FF,'heightAboveUpperFinishedFloor':zhi-FF,'minimumSill':min(q['sill'] for q in ops),'minimumRawSillReserve':min(q['sill'] for q in ops)-(zhi-FF),'all25UpperFacadeOpeningsAreWindows':True,'roofSourceForceKept':True,'maximumMomentInclFullNewConcrete':MM,'maximumShearInclFullNewConcrete':VM,'VRs':VRs,'VRstrut':Vmax,'loads':'Use full 140x650 concrete as adverse additional G on each actual short span, give none as counterweight. No upper wall/slab displacement reduction or steel UB weight included in this alternative.', 'cage':'4H16 per face in two rows of two, 25mm clear vertical. Closed H8/100, 35mm nominal cover, 16mm aggregate comparator. 22mm across vs21mm required. Compare actual placement, cover tolerance and bar congestion; no fabricated cage, torsion or development admission.', 'concreteGrossM3':.14*.65*totalLength,'concreteAboveFormerSlabM3':.14*.45*totalLength,'grossConcreteKN':.14*.65*totalLength*25,'nominalLongitudinalSteelKgNoLaps':barsMass,'nominalLinksKgNoCornersSplices':linkMass,'straightCentered32SleevePlanDeficit':-rodMargin,'geometry':'Beam stays in the actual 140 wide upper wall core and starts at existing RC200 soffit: no stair/entry clipping, drop below ceiling or change to E02 plant port extrados3115. Replaces masonry below all first-floor sills. Thermal material and finishes at 62m remain costs, including void/cavity edges. Do not use an upper doorway here without reanalysis.','failure':'The straight 32mm through-sleeve for M24 fails the two top/bottom bar planes by 10mm, before clearance. Need a positive developed standard reinforced anchor beyond the upper-only rod (or locally relocate/rearrange cage with checked cover/room footprint). Also verify one-sided slab transfer/chord eccentricity, roll/torsion, cage corners/splices, penetrations, real bearings and all eight ground stops. No pull-out bond or slab flange credit.'}
# Conventional through-studs, rather than assuming bond or a large M24 sleeve
# in a 140 wide edge. Both continuous upper/lower flexural cages use standard
# H12 in three rows each. No reduction in the counted concrete/self load.
actual=rectRC(140,650,35,12,3,2)
n=absBolt;dist=100;Pmax=.60*n # 10mm eccentricity of the rod across a 100mm stud pair
studDesign=.9*800*157/1.25/1000
assert Pmax<studDesign
headM=n*dist/4/1000;headW=(100-28)*30**2/6;headStress=headM*1e6/headW
plateBearing=Pmax*1000/(100*100-math.pi*18**2/4)
footStress=plateBearing*50**2/2/(25**2/6)
tol=4 # each-side combined rod/cage positioning envelope, not per item
remaining=(actual['clearAcross']-16)/2-tol
assert remaining>=3 and headStress<355/1.1 and plateBearing<.6*fcd and footStress<355/1.1
actualVRstrut=Vmax*actual['d']/up['d'];actualVRlinks=VRs*actual['d']/up['d']
assert MM<actual['MR'] and VM<min(actualVRstrut,actualVRlinks)
out['rcEdgeAlternative']['ordinaryPositiveRodDetail']={'appliesTo':'14 intermediate stations, not the eight corners. At corners both axes and actual continuous ground-tie/RC jamb cage must meet; no hollow flange or unpriced return assumed.', 'upperAndLowerCage':'6H12 per face, three rows of two, 25 clear vertically /35 cover/H8 closed links at100; entire section rechecked with reduced lever arm. Through both cages a plain 16mm stud crosses orthogonally to the longitudinal bars inside the central gap, not a 32mm tube.', 'section':actual,'MR':actual['MR'],'VRstrut':actualVRstrut,'VRlinks':actualVRlinks,'studPair':'Two permanent M16 grade8.8 through bolts at ±50mm along the wall, rolled thread tensile area157. Position between H8 hoops (hoop centres at −100,0,+100). M24 upper roof rod nuts beneath 220x100x30 crossbar, two stud nuts above. Crossbar underside45 above RC upstand for central nut. Body within 140mm core; local warm-side access/lining needs pricing. Facing may not grip/carry load.', 'studPairPitch':dist,'singleStudDesignUltimate':studDesign,'oneStudMaxAt10mmEccentricity':Pmax,'crossbarCentreNetElasticStress':headStress,'bottomBearing':'Common 220x100x25 bar under actual RC soffit, two 100x100 compression patches less18mm hole; captive bolt heads/washer below, up to 45mm projection to Z3125. Leave local formed pocket in solid jamb/pad. No concrete tensile cone or friction capacity. Permanent cast-in rods/foot are not renewable independently of support; local bedding/plate splitting/placement, fire and thermal detailing still qualify.', 'bottomPatchPressure':plateBearing,'bottomPlateCantileverStress':footStress,'nominalHorizontalEachSideClear':(actual['clearAcross']-16)/2,'combinedSetoutBudgetEachSide':tol,'residualEachSide':remaining,'grossLongitudinalSteelKgNoLaps':12*math.pi*.012**2/4*7850*totalLength,'platesMassPerOrdinaryStationKg':.220*.100*(.030+.025)*7850,'upperFittingNominalNutTopRelativeFFL':zhi-FF+45+30+25,'bottomAssemblyAboveTypicalArchExtrados':3125-3065,'unresolved':'Locate special portal/ground arch extrados and real bedding at all stations. Full direct corner detail, shear-torsion, local transverse splitting, through-bolt fit/nuts and actual welded-ring roof connection remain open.'}
# Exact gross RC edge plan and intersections with the historical physical
# RC200 slab reference and four proposed RC L cores, each counted once.
outerRect=[A-70,A-70,B+70,B+70];outerHole=[A+70,A+70,B-70,B-70]
courtRect=[C-70,C-70,E+70,E+70];courtHole=[C+70,C+70,E-70,E-70]
Lrect=[]
for sx in [1,-1]:
 for sy in [1,-1]:
  for r in [[262.5,262.5,1262.5,402.5],[262.5,402.5,402.5,1262.5]]:
   X=sorted(z if sx==1 else 12000-z for z in [r[0],r[2]]);Y=sorted(z if sy==1 else 12000-z for z in [r[1],r[3]]);Lrect.append([X[0],Y[0],X[1],Y[1]])
holes=[[r[0],r[1],r[0]+r[2],r[1]+r[3]] for r in [H['stair'],H['void'],H['court']]]
inner=[A,A,B,B];rects=[outerRect,outerHole,courtRect,courtHole,inner,*holes,*Lrect]
sets=[sorted({v for r in rects for v in [r[j],r[j+2]]}) for j in [0,1]]
ar0=arL=arBase=0
for xa,xb in pairwise(sets[0]):
 for ya,yb in pairwise(sets[1]):
  x=(xa+xb)/2;y=(ya+yb)/2;inside=lambda r:r[0]<x<r[2] and r[1]<y<r[3]
  if not ((inside(outerRect) and not inside(outerHole)) or (inside(courtRect) and not inside(courtHole))):continue
  ar=(xb-xa)*(yb-ya)/1e6;ar0+=ar;inL=any(inside(r) for r in Lrect)
  if inL:arL+=ar
  if inL or inside(inner) and not any(inside(r) for r in holes):arBase+=ar
assert math.isclose(ar0,totalLength*.14)
# No favourable roof stability credit. For material comparison, assign only
# confirmed below-sill solid above FFL to replaced upper core; bound 80mm floor
# build-up thickness as either solid or empty, never pretend it is guaranteed brick.
wallArea=ar0-arL;replacedUpper=[wallArea*.370,wallArea*.450]
gross=.650*ar0*25;existingRC=.2*arBase+.45*arL
netMax=gross-existingRC*25-replacedUpper[0]*16;netMin=gross-existingRC*25-replacedUpper[1]*25
out['rcEdgeAlternative']['materialDisplacement']={'basis':'Gross 25kN/m3 RC versus mapped historical RC200 footprint and the four proposed L-piers. New concrete partly replaces continuous below-sill upper core (16..25kN/m3); 80mm from structural top to FFL not assumed guaranteed masonry. Below-soffit bearings/interfaces not claimed. Net excludes any further old material outside the slab/pier mask, construction rebates, double-count relief for displaced bar volume and bar mass. Do not use these net figures as retained wind counterweight.', 'grossPlan':ar0,'existingLCoresArea':arL,'existingSlabOrLAreaAtBase200':arBase,'reusedExistingRCVolume':existingRC,'upperMaterialReplacedM3Range':replacedUpper,'additionalConcreteLessDisplacedMaterialKNRange':[netMin,netMax], 'steelSeparate':'About1.01t nominal longitudinal/link steel before laps/corners, plus14 ordinary plate pairs at9.50kg per pair. Rolled comparator has2.294t of section alone; its support plates, local steel, any displaced old material and eight corner details are not a like-for-like installed quantity.'}
print('RC edge: M/V',MM,VM,'compared to',up['MR'],min(VRs,Vmax),'; minimum sill reserve',out['rcEdgeAlternative']['minimumRawSillReserve'])
def norm(v):
 if isinstance(v,dict):return {k:norm(z) for k,z in v.items()}
 if isinstance(v,(list,tuple)):return [norm(z) for z in v]
 return round(v,6) if isinstance(v,float) else v
p=D/'current-house-floor-closure.json';txt=json.dumps(norm(out),indent=2)+'\n'
if '--check' in sys.argv:assert p.read_text()==txt
else:p.write_text(txt)
# All points shown at their actual plan coordinates, with shared corners once.
fig=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 620"><rect width="1060" height="620" fill="#faf9f4"/><g font-family="sans-serif" fill="#26363b"><text x="28" y="38" font-size="23">Upper roof restraint and the first-floor collector</text><text x="28" y="65" font-size="15">Two positive rings and eight proposed lower ties • plan coordinates in millimetres</text>']
def loc(p):return 45+p[0]*.036,550-p[1]*.036
for w,(i,d,lo,hi,us) in walls.items():
 p=loc(xy(w,lo));q=loc(xy(w,hi));fig.append(f'<path d="M{p[0]} {p[1]}L{q[0]} {q[1]}" fill="none" stroke="#617b81" stroke-width="6"/>')
for p in allLower:
 x,y=loc(p);fig.append(f'<circle cx="{x}" cy="{y}" r="5" fill="#faf9f4" stroke="#536c74" stroke-width="2"/>')
for rr in R.values():
 for q in rr['stations']:
    x,y=loc(q['xy']);fig.append(f'<rect x="{x-4}" y="{y-4}" width="8" height="8" fill="#198274"/>')
for p in caps:
 x,y=loc(p);fig.append(f'<circle cx="{x}" cy="{y}" r="10" fill="none" stroke="#c3683e" stroke-width="4"/>')
def text(x,y,msg,n=16):fig.append(f'<text x="{x}" y="{y}" font-size="{n}">{msg}</text>')
text(525,142,'22 green squares: upper ties',20);text(525,170,'Each ends in the first-floor collector.')
text(525,221,'Open circles: actual lower pads',20);text(525,249,'Only compressive contact is credited at a passive pad.')
text(525,300,'8 orange rings: captive lower locations',20);text(525,328,'Four existing outer stability corners and four court corners.')
text(525,387,'Minimum retained shell vs global roof suction',18);text(525,417,'+382.80 kN retained vs −324.34 kN suction.');text(525,444,'Local uplift remains: up to 110.33 kN at a captive stop.')
text(525,497,'62 m floor collector: compare steel and RC',18);text(525,526,'Rolled steel 2.294 t, or a 650 mm RC upstand inside the wall.')
text(28,592,'Development comparison only. Actual final shaft forces, capillary details, beam restraint and site acceptance remain open.',14)
fig.append('</g></svg>');f=D/'current-house-floor-closure.svg';svg='\n'.join(fig)+'\n'
if '--check' in sys.argv:assert f.read_text()==svg
else:f.write_text(svg)
