"""Finite body/guard comparison for the NEW raised inner handling trough.

This does not establish water interception before the first opening, nor a
temporary works or complete ordinary-renewal pass. All geometry is explicit;
the former1171-state result is not inherited.
"""
from pathlib import Path
import hashlib,json,math

def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def hull(points):
    p=sorted(set(points));lo=[];hi=[]
    for t in p:
        while len(lo)>1 and cross(lo[-2],lo[-1],t)<=0:lo.pop()
        lo.append(t)
    for t in p[::-1]:
        while len(hi)>1 and cross(hi[-2],hi[-1],t)<=0:hi.pop()
        hi.append(t)
    return lo[:-1]+hi[:-1]
def box(x,y,w,h,pad=0):return [(x-pad,y-pad),(x+w+pad,y-pad),(x+w+pad,y+h+pad),(x-pad,y+h+pad)]
def point_segment(p,a,b):
    v=(b[0]-a[0],b[1]-a[1]);d=v[0]**2+v[1]**2
    t=max(0,min(1,((p[0]-a[0])*v[0]+(p[1]-a[1])*v[1])/d)) if d else 0
    return math.dist(p,(a[0]+t*v[0],a[1]+t*v[1]))
def edges(p):return list(zip(p,p[1:]+p[:1]))
def inside(p,poly):return all(cross(a,b,p)>=-1e-9 for a,b in edges(poly))
def segments_intersect(a,b,c,d):
    if max(min(a[0],b[0]),min(c[0],d[0]))>min(max(a[0],b[0]),max(c[0],d[0]))+1e-9:return False
    if max(min(a[1],b[1]),min(c[1],d[1]))>min(max(a[1],b[1]),max(c[1],d[1]))+1e-9:return False
    return cross(a,b,c)*cross(a,b,d)<=1e-9 and cross(c,d,a)*cross(c,d,b)<=1e-9
def distance(a,b):
    if inside(a[0],b) or inside(b[0],a):return 0.
    if any(segments_intersect(p,q,r,s) for p,q in edges(a) for r,s in edges(b)):return 0.
    return min([point_segment(p,r,s) for p in a for r,s in edges(b)]+[point_segment(p,r,s) for p in b for r,s in edges(a)])
def point_polygon(p,poly):
    if inside(p,poly):return 0.
    return min(point_segment(p,a,b) for a,b in edges(poly))
def swept(a,b,size=585,pad=0):return hull(box(*a,size,size,pad)+box(*b,size,size,pad))
def gate(a,b,half=40):
    dx,dy=b[0]-a[0],b[1]-a[1];ll=math.hypot(dx,dy);n=(-dy/ll*half,dx/ll*half)
    return hull([(a[0]+n[0],a[1]+n[1]),(b[0]+n[0],b[1]+n[1]),(b[0]-n[0],b[1]-n[1]),(a[0]-n[0],a[1]-n[1])])

body_size=585
points=[(4310,4310),(5265,5265),(5620,5265),(5620,5635),(6065,5635)]
post_centres=[(5570,4860),(4860,5570),(6270,5560),(5560,6270)]
# 80 square is an authored reconstruction matching the old reported post
# margin. The source of that old numerical margin is not a surviving drawing.
posts=[box(x-40,y-40,80,80,5) for x,y in post_centres]
guards=[box(5570,4820,2180,80,5),box(4820,5570,80,2180,5),
        box(6270,5520,1480,80,5),box(5520,6270,80,1480,5)]
inner_gate=gate(post_centres[0],post_centres[1],45)
outer_gate=gate(post_centres[2],post_centres[3],45)
worker_first=(6500,5900);worker_second=(6500,6700);worker_radius=300
legs=[]
for i,(a,b) in enumerate(zip(points,points[1:])):
    poly=swept(a,b,pad=5)
    worker=worker_first if i==0 else worker_second
    legs.append(dict(id=i,start=a,end=b,continuousSweptPolygon=poly,
        postClearanceMM=min(distance(poly,p) for p in posts),
        fixedGuardClearanceMM=min(distance(poly,g) for g in guards),
        workerClearanceMM=point_polygon(worker,poly)-worker_radius-5))
first=box(*points[1],585,585,5);final=box(*points[-1],585,585,5)
first_rest=[5225,5225,650,650];second_rest=[6025,5600,650,650]
def rest_reserve(part,rest):
    xs=[p[0] for p in part];ys=[p[1] for p in part];x,y,w,h=rest
    return min(min(xs)-(x+5),(x+w-5)-max(xs),min(ys)-(y+5),(y+h-5)-max(ys))
tray_pieces=[swept(a,b,pad=120) for a,b in zip(points,points[1:])]
tray_worker_margin=min(point_polygon(worker_second,p)-worker_radius-5 for p in tray_pieces)
legacy_worker_tray_margin=min(point_polygon((6500,6550),p)-worker_radius-5 for p in tray_pieces)
result=dict(status='UNSELECTED BODY/GUARD COMPARISON ONLY; NO RAIN-SAFE RENEWAL PASS',
    sourceSHA256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    dimensionsMM=dict(bodyPlan=[585,585],bodyInitialLowerLeft=points[0],firstDraw=[955,955],
        partSettingPerAxis=5,postSettingPerAxis=5,posts80Square=post_centres,
        guardPlanes=[4860,5560],stageFloorZ=5540,troughFloorZ=6100,troughRimZ=6250,
        raisedRestTopZ=6300,partGateClosedZ=[6250,6640],partGateOpenBottomZ=7140,gateStroke=890,
        firstRest=first_rest,secondRest=second_rest,
        oldLanding=[5000,5500,2000,1400],newLanding=[5000,5500,2000,1550],
        addedLandingStrip=[5000,6900,2000,150],workerFirst=worker_first,workerSecond=worker_second),
    bodyEnvelope=dict(scope='Complete pan/cap/carrier only after spill80 retraction; fixed socket stubs, aprons and hangers retained.',
        basis='585 square bounds proposedq4310..4895 including20 end returns. The corners and joints still require an actual fabrication model.',
        maxPrimaryHeight=6840-(6605.75-26.9),maxLowerHeight=6540-(6386.25-26.9),
        lowestInstalledLowerCarrier=6386.25-26.9,nominalTroughRimClearance=6386.25-26.9-6250,
        restAboveTroughRim=50,conditionalSettingLocalAndFrameBudget=25,conditionalRestVerticalReserve=25),
    continuousLegs=legs,
    firstRest=dict(padReserveMM=rest_reserve(first,first_rest),innerClosedGateClearanceMM=distance(first,inner_gate),outerClosedGateClearanceMM=distance(first,outer_gate)),
    secondRest=dict(padReserveMM=rest_reserve(final,second_rest),innerClosedGateClearanceMM=distance(final,inner_gate)),
    workerTransfer=dict(start=worker_first,end=worker_second,radius=worker_radius,
        firstRestClearanceMM=distance(first,hull([(6500-305,5900-305),(6500+305,5900-305),(6500+305,6700+305),(6500-305,6700+305)])),
        landingNorthMarginMM=7050-(6700+300)-10),
    trough=dict(plan='Union of body swept polygons expanded120, clipped roofward toq4325 at the two facade legs; fully sealed post/pipe penetrations required.',
        untrimmedPlanPieces=tray_pieces,dutyLps=3.60375,workerPlanMarginMM=tray_worker_margin,
        oldWorker6550NegativeControlMM=legacy_worker_tray_margin,
        qualification='This geometry is NOT a hydraulic capacity or splash/wind capture proof. The rear bridge, collars and joints are unbuilt interfaces.'),
    reverse='Exact reversal of the same translations has the same static swept envelopes. This does not prove reversible water-control changes or reconnectability.',
    unresolved=['Install and prove roof/secondary/upstream/head rain interception BEFORE80 spill or190 apron stroke, any seam opening or firsthead release.',
        'Keep source normal spout350 lift, head/upper spool800 lift and8350 complete hoist envelope until a distinct inner physical assembly proves another value.',
        'The old continuous trough crosses full-height descending gates and blocks5750 rests. New fixed lower guard/sill and upper gates are required.',
        'The120 capture skirt overlaps the old worker6550 position. New worker6700 requires the explicit150 north landing extension; existing four gate posts are held.',
        'Post collars, retained pipe collar, water outlet/backup, deployment, support/guard resistance, finite hoist and all permanent/temporary service intersections remain unproved.',
        'Temporary supports carry the moving parts independently. Paired roof-to-ground motion and native plus local clearance still need the current complete wind join.',
        'The whole L corner and independent cassette reaction allocation remain physically unresolved.'])
result['geometricTranslationOnlyPass']=all(min(x['postClearanceMM'],x['fixedGuardClearanceMM'],x['workerClearanceMM'])>0 for x in legs) and min(result['firstRest']['padReserveMM'],result['secondRest']['padReserveMM'])>0
path=Path(__file__).with_suffix('.json');path.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(path=str(path),translationOnly=result['geometricTranslationOnlyPass'],legMinima=[{k:v for k,v in x.items() if k.endswith('MM')} for x in legs],first=result['firstRest'],second=result['secondRest'],trayWorker=tray_worker_margin,oldWorker=legacy_worker_tray_margin),indent=2))
