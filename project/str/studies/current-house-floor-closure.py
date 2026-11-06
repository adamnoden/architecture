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
spanLoadAbs=defaultdict(float);spanCases=defaultdict(list);padCases=defaultdict(list);caseN=defaultdict(lambda:[0.,0.]);fixedN=defaultdict(lambda:[0.,0.]);components=defaultdict(float)
def feed(label,upper,l,h,role):
    # A ring corner is a lower anchored or compression bearing in this scheme;
    # intermediate contributions end in their real span.
    nc=defaultdict(float);ms=defaultdict(float)
    for p,k in upper.items():
        w=wallat(p);i,d,lo,hi,us=walls[w];u=p[i]
        for v,t in lower(w,p):nc[v]+=k*t
        for a,b in pairwise(us):
            if a<u<b:
                spanLoadAbs[w,a,b]+=abs(k)*max(abs(l),abs(h))
                for j in range(1,20):
                    z=(b-a)*j/20;s=u-a
                    ms[w,a,b,j]+=k*(min(z,s)-z*s/(b-a))/1000
                break
    for v,k in nc.items():
        padCases[v].append((label,k,l,h))
        row=(fixedN if role=='guaranteed' else caseN)[v]
        row[0]+=min(k*l,k*h);row[1]+=max(k*l,k*h)
    for key,k in ms.items():spanCases[key].append((label,k,l,h))
    components[label]+=l*sum(upper.values())
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
text(525,497,'62 m rolled collector • 2.294 t',18);text(525,526,'This is the material cost of fewer full-height ties.')
text(28,592,'Development comparison only. Actual final shaft forces, capillary details, beam restraint and site acceptance remain open.',14)
fig.append('</g></svg>');f=D/'current-house-floor-closure.svg';svg='\n'.join(fig)+'\n'
if '--check' in sys.argv:assert f.read_text()==svg
else:f.write_text(svg)
