"""P32 starter lanes, in millimetres relative to its shaft; conditional P45 cage."""
from itertools import combinations, pairwise
import json
import math
from pathlib import Path

R = 291.       # 560 internal mandrel for H22, open-loggia-support.py
TAIL = 1200.   # straight after the last bend
STEP = math.radians(2)


def sub(a, b):
    return tuple(x-y for x,y in zip(a,b))


def dot(a,b):
    return sum(x*y for x,y in zip(a,b))


def segment_distance(p, q, a, b):
    u, v, w = sub(q,p), sub(b,a), sub(p,a)
    uu, vv, uv, wu, wv = dot(u,u), dot(v,v), dot(u,v), dot(w,u), dot(w,v)
    def clamp(x):
        return min(1.,max(0.,x))
    pairs = [(0.,clamp(wv/vv)), (1.,clamp((wv+uv)/vv)),
             (clamp(-wu/uu),0.), (clamp((uv-wu)/uu),1.)]
    det = uu*vv - uv*uv
    if det > 1e-12*uu*vv:
        s,t = (uv*wv-vv*wu)/det, (uu*wv-uv*wu)/det
        if 0 < s < 1 and 0 < t < 1:
            pairs.append((s,t))
    return math.sqrt(min(sum((z+s*x-t*y)**2 for z,x,y in zip(w,u,v)) for s,t in pairs))


def angles(angle):
    n = math.ceil(abs(angle)/STEP)
    return [angle*i/n for i in range(n+1)]


def path(name, dia, points, radius=0.):
    pts = [points[0]] + [b for a,b in pairwise(points) if math.dist(a,b)>1e-9]
    return name, dia, list(pairwise(pts)), radius*(1-math.cos(STEP/2))


def gauge(a,b):
    """True surface clearance is in chord result ± the two arc sagittas."""
    d = min(segment_distance(*s,*t) for s in a[2] for t in b[2])-(a[1]+b[1])/2
    error=a[3]+b[3]
    return {'items':[a[0],b[0]], 'nominalIntervalMm':[max(-(a[1]+b[1])/2,d-error),d+error],
            'afterTwo5mmSetoutsLowerMm':d-error-10}


def starter(i, roots, z, direction, yaw=0., straight_between=0.):
    x,y=roots[i]
    dx,dy=direction
    points=[(x,y,-1950.)]
    for t in angles(math.pi/2):
        shift=R*(1-math.cos(t))
        points.append((x+dx*shift,y+dy*shift,z-R+R*math.sin(t)))
    x,y,_=points[-1]
    if yaw:
        x,y=x+straight_between*dx,y+straight_between*dy
        points.append((x,y,z))
        # The first tangent is SW. The second bend is horizontal, ending due W.
        for t in angles(yaw):
            rem=yaw-t
            points.append((x+R*(math.sin(rem)-math.sin(yaw)),y+R*(math.cos(yaw)-math.cos(rem)),z))
        dx,dy=-1.,0.
    x,y,_=points[-1]
    points.append((x+TAIL*dx,y+TAIL*dy,z))
    return path(f'P32 H22 {i}',22,points,R)


def hold(i, root, target, record):
    x,y=root
    dx,dy=sub(target,root)
    offset=math.hypot(dx,dy)
    dx,dy=dx/offset,dy/offset
    z0,z1=record['bendStartFinishZ']
    r=record['centrelinedBendRadius']
    lo,hi=0.,math.atan(1/6)
    for _ in range(45):
        t=(lo+hi)/2
        drift=2*r*(1-math.cos(t))+(z1-z0-2*r*math.sin(t))*math.tan(t)
        if drift < offset: lo=t
        else: hi=t
    pts=[(x,y,-1950.)]
    pts.extend((x+r*(1-math.cos(t))*dx,y+r*(1-math.cos(t))*dy,z0+r*math.sin(t)) for t in angles(hi))
    pts.extend((target[0]-r*(1-math.cos(t))*dx,target[1]-r*(1-math.cos(t))*dy,z1-r*math.sin(t)) for t in reversed(angles(hi)))
    return path(f'P32 tie H22 {i}',22,pts,r)


def straight_yaw_limit(root, adjacent, width, cover):
    """Exact maximin within side cover; all eight projection feet lie on the tail."""
    limit=width/2-cover-11
    lo,hi=[math.asin((y-root[1])/(R+TAIL)) for y in (-limit,limit)]
    vectors=[sub(p,root) for p in adjacent]
    choices=[lo,hi]
    # Extrema of one active absolute sinusoid, or crossings of two such terms.
    for x,y in vectors:
        choices.extend(math.atan2(x,y)+n*math.pi for n in (-1,0,1))
    for a,b in combinations(vectors,2):
        for sign in (-1,1):
            x,y=a[0]+sign*b[0],a[1]+sign*b[1]
            if abs(x)+abs(y)>1e-10:
                choices.extend(math.atan2(-y,x)+n*math.pi for n in (-1,0,1))
    def score(t):
        return min(abs(x*math.sin(t)+y*math.cos(t)) for x,y in vectors)-22
    for x,y in vectors:
        # Conservative inclusion across the entire feasible yaw interval.
        assert min(-x*math.cos(lo),-x*math.cos(hi))-abs(y)>R
        assert -x+abs(y)<R+TAIL
    best=max((score(t),t) for t in choices if lo<=t<=hi)
    return {'sideCoverMm':cover, 'validYawDeg':[math.degrees(lo),math.degrees(hi)],
            'bestYawDeg':math.degrees(best[1]), 'bestP45VerticalClearMm':best[0]}


def compare(studies):
    studies = Path(studies)
    grid=json.loads((studies/'current-house-grid.json').read_text())
    ties=json.loads((studies/'current-house-ground-ties.json').read_text())['court']
    source=max(ties,key=lambda r:r['jointUpliftKN'])
    heads={h['id']:h for h in grid['heads']}
    assert source['head']=='P32' and source['axis']==heads['P32']['xy']
    header=grid['girders']['stair-header']
    wall=grid['girders']['court-W']
    assert header['axis']=='x' and header['extent'][1]==source['axis'][0]
    assert header['datum']==source['axis'][1] and wall['datum']==source['axis'][0]
    assert header['width']==wall['width']==600 and header['z']==wall['z']==[-630,-180]
    assert heads['P32']['capXY']==[600,600] and heads['P32']['capZ']==[-750,-180]
    offset=sub(heads['P45']['xy'],source['axis'])
    north=sub(heads['P33']['xy'],source['axis'])
    assert offset==(-1007.5,0.) and north==(0.,1867.5)
    radius=141.
    roots=[(radius*math.cos(math.radians(22.5+45*i)),radius*math.sin(math.radians(22.5+45*i))) for i in range(8)]
    for centre,i in zip(source['originalBarXYLocal'],source['originalPileBarIndicesZeroBased']):
        assert math.dist(centre,roots[i])<1e-6
    target=source['headLocalRodEnds']
    held=[hold(i,roots[i],q,source) for i,q in zip(source['originalPileBarIndicesZeroBased'],target)]
    normal=[starter(i,roots,z,(0,1)) for i,z in ((0,-355),(1,-355),(3,-355),(6,-296),(7,-296))]
    yaw=math.radians(19.)
    west=starter(4,roots,-315,(-math.cos(yaw),-math.sin(yaw)),yaw,110)
    plain=starter(4,roots,-315,(-1,0))
    adjacent=[(x+offset[0],y) for x,y in roots]
    p45=[path(f'P45 straight H22 {i}',22,[(x,y,-750),(x,y,-180)]) for i,(x,y) in enumerate(adjacent)]
    # The following are transplanted grid-arm comparators. Both EW/NS bottom
    # mats and the top bars from open-loggia-support.py are swept through P32.
    mats=[]
    def mat(name,axis,location,z):
        a=(-1850,location,z) if axis=='EW' else (location,-382.5,z)
        b=(300,location,z) if axis=='EW' else (location,1700,z)
        return path(f'{name} {axis} {location:g}',20,[a,b])
    p32_mats=[]
    for q,z in ((-242,-572),(-186.8,-572),(4,-572),(200,-572),(240,-520)):
        p32_mats.append(mat('P32 bottom','EW',q,z))
    for q,z in ((-242,-500),(-194,-552),(215,-500),(186.8,-552),(242,-552)):
        p32_mats.append(mat('P32 bottom','NS',q,z))
    for q in (-240,0,240):
        p32_mats.append(mat('P32 top','EW',q,-238))
    for q in (-240,186.8,242):
        p32_mats.append(mat('P32 top','NS',q,-258))
    mats += p32_mats
    for q in (-240,0,240): mats.append(mat('P45 top','NS',offset[0]+q,-258))
    for q in (-240,-190,0,190,240): mats.append(mat('P45 bottom','NS',offset[0]+q,-552))
    # Reserve closed H8 perimeter at every arm station (the continuous swept
    # rectangle is conservative here); first/last station cannot improve it.
    width=grid['girders']['stair-header']['width']
    end=west[2][-1][1]
    y,z=end[1:]
    hoop_clear=min(256-abs(y),z+586,-224-z)-11-4
    def minimum(rows):
        return min(rows,key=lambda v:v['nominalIntervalMm'][0])
    bars=normal+[west]+held
    groups={
       'westToP45':minimum(gauge(west,b) for b in p45),
       'dueWestToP45':minimum(gauge(plain,b) for b in p45),
       'westToP32Bars':minimum(gauge(west,b) for b in normal+held),
       'westToTransplantedMats':minimum(gauge(west,b) for b in mats),
       'allP32BarPairs':minimum(gauge(a,b) for a,b in combinations(bars,2)),
       'allP32ToTransplantedMats':minimum(gauge(a,b) for a in bars for b in mats)}
    tested=groups['allP32ToTransplantedMats']
    candidate_pairs=[(a,b) for a,b in combinations(p32_mats,2)]
    parallel=minimum(gauge(a,b) for a,b in candidate_pairs
                     if a[0].split()[2]==b[0].split()[2])
    cross=[gauge(a,b)['nominalIntervalMm'][0] for a,b in candidate_pairs
           if a[0].split()[2]!=b[0].split()[2]]
    # The crossing H20s bank on designated courses: nominal tangency is
    # an intended tied contact. A hypothetical free crossing is distinct.
    contacts=sum(abs(v)<1e-8 for v in cross)
    assert min(cross)>=-1e-8
    assert min(tested['afterTwo5mmSetoutsLowerMm'], parallel['afterTwo5mmSetoutsLowerMm'],
               groups['allP32BarPairs']['afterTwo5mmSetoutsLowerMm'],hoop_clear-10)>25
    assert end[0]+source['axis'][0]>header['extent'][0]
    # At the unaltered centre row height, an S rod at x<0 and ordinary
    # north-running #6 at constant x>0 bound ANY central straight NS bar.
    tie=held[0]
    ztest=-552
    seg=next((p,q) for p,q in tie[2] if p[2]<=ztest<=q[2])
    lo,hi=seg
    xneg=lo[0]+(hi[0]-lo[0])*(ztest-lo[2])/(hi[2]-lo[2])
    # Section is interpolated on a straight S-bar shank between its curves.
    assert lo[2]<-700 and hi[2]>-200
    max_central_clear=(roots[6][0]-xneg)/2-21
    def mat_record(group,direction):
        chosen=[a for a in p32_mats if a[0].startswith('P32 '+group+' '+direction+' ')]
        # An EW bar is stationed by Y, NS by X.
        index=1 if direction=='EW' else 0
        positions=[[a[2][0][0][index],a[2][0][0][2]] for a in chosen]
        return {'stationAndZ':positions,'centroidStationAndZ':[sum(v)/len(v) for v in zip(*positions)]}
    return {'head':source['head'],'headXY':source['axis'],'P45offset':offset,
       'strippedHoldKN':source['jointUpliftKN'],'tieIndices':source['originalPileBarIndicesZeroBased'],
       'straightYaw':straight_yaw_limit(roots[4],adjacent,width,50),
       'westBarIndex':4,'firstHeadingSouthOfWestDeg':19,'interbendStraightMm':110,
       'finalTailStartLocal':west[2][-1][0],'finalTailEndLocal':end,'westFinalStraightMm':TAIL,
       'northLowerUpperZ':[-355,-296], 'northLowerIndices':[0,1,3], 'northUpperIndices':[6,7],
       'westTailToHeaderSideCoverMm':width/2-abs(y)-11,'westStraightToH8EnvelopeMm':hoop_clear,
       'northTailEndToP33VerticalBarsLowerMm':north[1]-max(s[2][-1][1][1] for s in normal)-radius-22,
       'unchangedBottomNSRoam':{'level':ztest,'holdBarX':xneg,'positiveBarX':roots[6][0],
          'maxPossibleNominalCentralH20ClearMm':max_central_clear},
       'P32trialMats':{group+axis:mat_record(group,axis) for group in ('bottom','top') for axis in ('EW','NS')},
       'P32parallelMats':parallel, 'P32crossedMats':{'pairs':len(cross),'intendedTies':contacts,
            'minimumNominalClearMm':min(cross),'nextNominalClearMm':min(x for x in cross if x>1e-8)},
       'groups':groups, 'curveErrorPerR291Mm':R*(1-math.cos(STEP/2)),
       'scope':'Nominal geometric trial. The adverse displacement is up to 5 mm per member in total toward the other member, separate from tied crossings. P45 verticals are an obstacle surrogate. P45 returns, end and node hoops, transverse bend confinement, beam resistance, full-route continuity and actual sequencing remain to be determined.'}
