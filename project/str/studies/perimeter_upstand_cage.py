"""Source-owned exact corner bar profiles and ordinary350-band anchorage bounds.
No native model, house response, signed demand or resistance acceptance is produced.
All coordinates are actual millimetres relative to the saved outer concrete face.
"""
import argparse,copy,json,math
from pathlib import Path
import xml.etree.ElementTree as ET
import separated_floor_bearing as source
D=Path(__file__).parent
INPUT=D/'perimeter-upstand-cage-inputs.json'
def area(d):return math.pi*d*d/4
def distance_box_point(p,q,t):
    return math.sqrt(sum(max(0.,abs(a-b)-t)**2 for a,b in zip(p,q)))
def arc_box_distance(centre,r,a,b,p,t):
    """Exact planar circular arc to an axis-aligned relative-placement box."""
    candidates=[a,b]
    def admit(theta):
        for n in range(-2,3):
            v=theta+n*2*math.pi
            if a-1e-12<=v<=b+1e-12:candidates.append(v)
    for k in range(4):admit(k*math.pi/2)
    for x in (p[0]-t,p[0]+t):
        for y in (p[1]-t,p[1]+t):admit(math.atan2(y-centre[1],x-centre[0]))
        v=(x-centre[0])/r
        if abs(v)<=1:
            z=math.acos(v);admit(z);admit(-z)
    for y in (p[1]-t,p[1]+t):
        v=(y-centre[1])/r
        if abs(v)<=1:
            z=math.asin(v);admit(z);admit(math.pi-z)
    return min(distance_box_point([centre[0]+r*math.cos(v),centre[1]+r*math.sin(v)],p,t) for v in candidates)
def line_box_distance(a,b,p,t):
    """Only axis-aligned actual straight bar stubs are used here."""
    if a[0]!=b[0] and a[1]!=b[1]:raise ValueError('Explicit axis-aligned stub required')
    lo=[min(x,y) for x,y in zip(a,b)];hi=[max(x,y) for x,y in zip(a,b)]
    return math.sqrt(sum(max(0.,lo[i]-(p[i]+t),(p[i]-t)-hi[i])**2 for i in range(2)))
def arc(centre,r,a,b,axes,other):
    return {'kind':'arc','centre':centre,'radiusMm':r,'anglesRad':[a,b],'axes':axes,'other':other}
def sample_primitive(p,step=.025):
    if p['kind']=='line':return p['points']
    a,b=p['anglesRad'];n=max(1,math.ceil(abs(b-a)/step));out=[]
    for k in range(n+1):
        q=[0.]*3
        q[p['axes'][0]]=p['centre'][0]+p['radiusMm']*math.cos(a+(b-a)*k/n)
        q[p['axes'][1]]=p['centre'][1]+p['radiusMm']*math.sin(a+(b-a)*k/n)
        q[3-sum(p['axes'])]=p['other'];out.append(q)
    return out
def paths_points(path):
    return [q for p in path['primitives'] for q in sample_primitive(p)]
def column_points(c):
    g,l=c['geometry'],c['links'];f,k=g['columnFaceRowsMm'];last=g['columnAlongStationsMm'][-1]
    pts=sorted({(x,y) for x in (f,k) for y in g['columnAlongStationsMm']}|
        {(x,y) for y in (f,k) for x in g['columnAlongStationsMm']})
    r=(l['columnMandrelMm']+l['columnOutsideMm'])/2
    combined=(l['columnOutsideMm']+g['columnBarOutsideMm'])/2
    delta=r-(r-combined)/math.sqrt(2)-combined
    adjusted={}
    for bounds in ((f,f,k,last),(f,f,last,k)):
        x0,y0,x1,y1=bounds
        for x,y in ((x0,y0),(x1,y0),(x1,y1),(x0,y1)):
            adjusted[x,y]=[x+(delta if x==x0 else -delta),y+(delta if y==y0 else -delta)]
    return [adjusted.get(p,list(p)) for p in pts]
def beam_paths(c):
    g=c['geometry'];out=[]
    for label,n,r in zip(('outer','inner'),g['beamBarNormalMm'],g['beamPlanRadiiMm']):
        centre=[n+r,n+r]
        for z in g['beamBarZMm']:
            out.append({'id':f'beam/{label}/{z:g}','nominalMm':g['beamBarNominalMm'],'outsideMm':g['beamBarOutsideMm'],
                'continuesBeyondLocalWindow':True,'primitives':[
                {'kind':'line','points':[[n,1600,z],[n,n+r,z]]},
                arc(centre,r,math.pi,1.5*math.pi,[0,1],z),
                {'kind':'line','points':[[n+r,n,z],[1600,n,z]]}]})
    return out
def floor_layers(c):
    g=c['geometry'];bottom,top=g['slabZMm'];cover=g['floorNominalSurfaceCoverMm'];d=g['floorBarOutsideMm']
    return {'X-bottom':bottom+cover+d/2,'Y-bottom':bottom+cover+1.5*d,
        'X-top':top-cover-d/2,'Y-top':top-cover-1.5*d}
def corner_floor_paths(c):
    g=c['geometry'];r=(g['cornerFloorMandrelMm']+g['floorBarOutsideMm'])/2;n=g['cornerFloorReturnNormalMm'];out=[]
    for axis in (0,1):
        for layer in ('bottom','top'):
            z=floor_layers(c)[('X' if axis==0 else 'Y')+'-'+layer];s=-1 if layer=='bottom' else 1
            for along in g['floorAlongCoordinatesMm']:
                p=lambda normal,height:[normal,along,height] if axis==0 else [along,normal,height]
                out.append({'id':f'floor/{axis}/{layer}/{along:g}','nominalMm':g['floorBarNominalMm'],'outsideMm':g['floorBarOutsideMm'],
                    'primitives':[{'kind':'line','points':[p(700,z),p(n+r,z)]},
                        arc([n+r,z+s*r],r,math.pi/2 if s<0 else 1.5*math.pi,math.pi,[axis,2],along),
                        {'kind':'line','points':[p(n,z+s*r),p(n,z+s*(r+g['cornerFloorStraightTailMm']))]}],
                    'verticalTailZMm':sorted((z+s*r,z+s*(r+g['cornerFloorStraightTailMm']))),
                    'surfaceCoveredByActualLowerOrUpper300Core':True})
    return out
def primitive_point(p,t):
    if p['kind']=='line':return [a+t*(b-a) for a,b in zip(*p['points'])]
    theta=p['anglesRad'][0]+t*(p['anglesRad'][1]-p['anglesRad'][0]);q=[0.]*3
    q[p['axes'][0]]=p['centre'][0]+p['radiusMm']*math.cos(theta)
    q[p['axes'][1]]=p['centre'][1]+p['radiusMm']*math.sin(theta)
    q[3-sum(p['axes'])]=p['other'];return q
def primitive_bounds(p,a,b):
    points=[primitive_point(p,a),primitive_point(p,b)]
    if p['kind']=='arc':
        lo,hi=sorted((p['anglesRad'][0]+a*(p['anglesRad'][1]-p['anglesRad'][0]),
            p['anglesRad'][0]+b*(p['anglesRad'][1]-p['anglesRad'][0])))
        for k in range(math.floor(lo/(math.pi/2))-1,math.ceil(hi/(math.pi/2))+2):
            theta=k*math.pi/2
            if lo<=theta<=hi:
                t=(theta-p['anglesRad'][0])/(p['anglesRad'][1]-p['anglesRad'][0])
                points.append(primitive_point(p,t))
    return [min(q[i] for q in points) for i in range(3)],[max(q[i] for q in points) for i in range(3)]
def certify_primitive_pair(a,b,radius_sum,tol,clearance=0.,budget=20000):
    """Exact coordinate bounds certify each pruned parameter rectangle.
    Collision witnesses use an actual feasible relative ±tol box displacement.
    Unresolved tangencies never become a false pass.
    """
    limit=radius_sum+clearance;stack=[(0.,1.,0.,1.)];minimum=math.inf;count=0
    while stack:
        aa,ab,ba,bb=stack.pop();count+=1
        if count>budget:return {'state':'unresolved','boxes':count}
        alo,ahi=primitive_bounds(a,aa,ab);blo,bhi=primitive_bounds(b,ba,bb)
        lower=math.sqrt(sum(max(0.,alo[i]-bhi[i]-tol,blo[i]-ahi[i]-tol)**2 for i in range(3)))
        if lower>limit+1e-9:minimum=min(minimum,lower-radius_sum);continue
        for u in (aa,(aa+ab)/2,ab):
            pa=primitive_point(a,u)
            for v in (ba,(ba+bb)/2,bb):
                pb=primitive_point(b,v);shift=[max(-tol,min(tol,x-y)) for x,y in zip(pa,pb)]
                dist=math.sqrt(sum((x-y-d)**2 for x,y,d in zip(pa,pb,shift)))
                if dist<limit-1e-7:
                    return {'state':'collision','nominalPointsMm':[pa,pb],'relativeShiftMm':shift,
                        'adverseSurfaceClearMm':dist-radius_sum,'requiredClearMm':clearance,'boxes':count}
        if max(ab-aa,bb-ba)<1e-9:return {'state':'unresolved','boxes':count}
        da=sum((x-y)**2 for x,y in zip(alo,ahi));db=sum((x-y)**2 for x,y in zip(blo,bhi))
        if da>=db:
            mid=(aa+ab)/2;stack.extend(((aa,mid,ba,bb),(mid,ab,ba,bb)))
        else:
            mid=(ba+bb)/2;stack.extend(((aa,ab,ba,mid),(aa,ab,mid,bb)))
    return {'state':'clear','certifiedSurfaceClearLowerBoundMm':minimum,'boxes':count}
def beam_floor_audit(c,beams,floors):
    tol=2*c['geometry']['independentBarSettingMm'];fail=[];tested=0;worst=math.inf
    for a in beams:
        for b in floors:
            r=(a['outsideMm']+b['outsideMm'])/2
            for pa in a['primitives']:
                for pb in b['primitives']:
                    out=certify_primitive_pair(pa,pb,r,tol);tested+=1
                    if out['state']!='clear':fail.append({'a':a['id'],'b':b['id'],**out})
                    else:worst=min(worst,out['certifiedSurfaceClearLowerBoundMm'])
    return {'testedPrimitivePairs':tested,'failures':fail,'allCertified':not fail,
        'smallestCertifiedSurfaceClearLowerBoundMm':worst}

def line(a,b):return {'kind':'line','points':[a,b]}
def transformed(path,axis):
    if axis==0:return path
    out=copy.deepcopy(path)
    for p in out['primitives']:
        if p['kind']=='line':
            p['points']=[[q[1],q[0],q[2]] for q in p['points']]
        else:p['axes']=[1 if i==0 else 0 if i==1 else i for i in p['axes']]
    return out
def closed_profile(x0,x1,y0,y1,r,tail,z,rise,diameter,nominal,identifier):
    cx,cy=x0+r,y0+r;angle=math.acos(1-abs(rise)/(2*r));run=2*r*math.sin(angle);sgn=1 if rise<0 else -1
    begin=z+rise
    first=arc([cx,begin+sgn*r],r,-math.pi/2 if sgn>0 else math.pi/2,
        -math.pi/2+angle if sgn>0 else math.pi/2-angle,[0,2],y0)
    second=arc([cx+run,begin+sgn*r*(1-2*math.cos(angle))],r,
        math.pi/2+angle if sgn>0 else -math.pi/2-angle,
        math.pi/2 if sgn>0 else -math.pi/2,[0,2],y0)
    a0=[cx-r/math.sqrt(2),cy+r/math.sqrt(2),begin]
    at=[a0[0]+tail/math.sqrt(2),a0[1]+tail/math.sqrt(2),begin]
    b0=[cx+r/math.sqrt(2),cy-r/math.sqrt(2),z]
    bt=[b0[0]+tail/math.sqrt(2),b0[1]+tail/math.sqrt(2),z]
    primitives=[line(at,a0),arc([cx,cy],r,3*math.pi/4,1.5*math.pi,[0,1],begin),
        first,second,line([cx+run,y0,z],[x1-r,y0,z]),
        arc([x1-r,y0+r],r,1.5*math.pi,2*math.pi,[0,1],z),
        line([x1,y0+r,z],[x1,y1-r,z]),arc([x1-r,y1-r],r,0,math.pi/2,[0,1],z),
        line([x1-r,y1,z],[x0+r,y1,z]),arc([x0+r,y1-r],r,math.pi/2,math.pi,[0,1],z),
        line([x0,y1-r,z],[x0,y0+r,z]),arc([cx,cy],r,math.pi,7*math.pi/4,[0,1],z),line(b0,bt)]
    return {'id':identifier,'outsideMm':diameter,'nominalMm':nominal,'primitives':primitives,'closureOffsetMm':rise}
def closed_column_link(c,axis,z):
    g,l=c['geometry'],c['links'];f,k=g['columnFaceRowsMm'];last=g['columnAlongStationsMm'][-1]
    d=l['columnOutsideMm'];r=(l['columnMandrelMm']+d)/2;combined=(d+g['columnBarOutsideMm'])/2
    path=closed_profile(f-combined,k+combined,f-combined,last+combined,r,l['columnHookTailMm'],z,
        l['columnClosureOffsetMm'],d,l['columnNominalMm'],f'column-link/{axis}/{z:g}')
    return transformed(path,axis)
def cross_tie(c,axis,z,along):
    g,l=c['geometry'],c['links'];f,k=g['columnFaceRowsMm'];d=l['columnOutsideMm']
    r=(l['columnMandrelMm']+d)/2;combined=(d+g['columnBarOutsideMm'])/2
    cy=along+combined-r;t=l['columnHookTailMm']
    wa=[f-r/math.sqrt(2),cy-r/math.sqrt(2),z];wt=[wa[0]+t/math.sqrt(2),wa[1]-t/math.sqrt(2),z]
    ea=[k+r/math.sqrt(2),cy-r/math.sqrt(2),z];et=[ea[0]-t/math.sqrt(2),ea[1]-t/math.sqrt(2),z]
    return transformed({'id':f'cross-tie/{axis}/{z:g}/{along:g}','outsideMm':d,'nominalMm':l['columnNominalMm'],
        'primitives':[line(wt,wa),arc([f,cy],r,5*math.pi/4,math.pi/2,[0,1],z),
            line([f,along+combined,z],[k,along+combined,z]),
            arc([k,cy],r,math.pi/2,-math.pi/4,[0,1],z),line(ea,et)]},axis)
def link_paths(c):
    # Fixed family schedules, not a model/section parameter sweep.
    schedules=c['links']['columnFamilySchedulesZMm']
    west,south,cross=(schedules[k] for k in ('west','south','cross'))
    out=[closed_column_link(c,0,z) for z in west]+[closed_column_link(c,1,z) for z in south]
    for z in cross:
        for axis in (0,1):
            for along in c['geometry']['columnAlongStationsMm'][2:-1]:out.append(cross_tie(c,axis,z,along))
    return out,{'west':west,'south':south,'cross':cross}
def paths_bounds(path):
    boxes=[primitive_bounds(p,0,1) for p in path['primitives']]
    return [min(q[0][i] for q in boxes) for i in range(3)],[max(q[1][i] for q in boxes) for i in range(3)]
def separated_boxes(a,b,tol,r):
    return math.sqrt(sum(max(0.,a[0][i]-b[1][i]-tol,b[0][i]-a[1][i]-tol)**2 for i in range(3)))>r
def audit_path_groups(left,right,tol,limit_failures=12,matched_contacts=False):
    failures=[];pairs=0;primitive_pairs=0;contact_certificates=0;left_boxes=[paths_bounds(x) for x in left];right_boxes=[paths_bounds(x) for x in right]
    for i,a in enumerate(left):
        for j,b in enumerate(right):
            r=(a['outsideMm']+b['outsideMm'])/2
            match=matched_contacts and a['id'].startswith('cross-tie/') and '/3274.5/' in a['id'] and b['id'].startswith('beam/') and b['id'].endswith('/3260')
            if match and left_boxes[i][0][2]-right_boxes[j][1][2]>=r-1e-9:
                contact_certificates+=1;continue
            if separated_boxes(left_boxes[i],right_boxes[j],tol,r):continue
            pairs+=1
            for pa in a['primitives']:
                for pb in b['primitives']:
                    aa=primitive_bounds(pa,0,1);bb=primitive_bounds(pb,0,1)
                    if separated_boxes(aa,bb,tol,r):continue
                    primitive_pairs+=1;ans=certify_primitive_pair(pa,pb,r,tol,budget=4000)
                    if ans['state']!='clear':
                        failures.append({'a':a['id'],'b':b['id'],**ans})
                        if len(failures)>=limit_failures:return {'allCertified':False,'failures':failures,'pathPairs':pairs,'primitivePairs':primitive_pairs,'truncatedFailureList':True,'lockedNormalContactCertificates':contact_certificates}
    return {'allCertified':not failures,'failures':failures,'pathPairs':pairs,'primitivePairs':primitive_pairs,'truncatedFailureList':False,'lockedNormalContactCertificates':contact_certificates}

def ordinary_floor_paths(c):
    g=c['geometry'];r=(g['ordinaryFloorMandrelMm']+g['floorBarOutsideMm'])/2;out=[]
    for axis in (0,1):
        for layer in ('bottom','top'):
            n=g['ordinaryFloorReturnNormalMm'][layer];z=floor_layers(c)[('X' if axis==0 else 'Y')+'-'+layer]
            for along in g['ordinaryFloorAlongCoordinatesMm'][layer]:
                point=lambda x,h:[x,along,h] if axis==0 else [along,x,h]
                if layer=='top' and along==g['ordinaryStraightTopRowMm']:
                    out.append({'id':f'ordinary-floor/{axis}/{layer}/{along:g}','nominalMm':g['floorBarNominalMm'],'outsideMm':g['floorBarOutsideMm'],
                        'straightBarWithFiniteBondCapacityOnly':True,
                        'primitives':[line(point(700,z),point(g['ordinaryStraightBarOuterEndMm'],z))]})
                    continue
                out.append({'id':f'ordinary-floor/{axis}/{layer}/{along:g}','nominalMm':g['floorBarNominalMm'],'outsideMm':g['floorBarOutsideMm'],
                    'primitives':[line(point(700,z),point(n+r,z)),arc([n+r,z+r],r,1.5*math.pi,math.pi,[axis,2],along),
                        line(point(n,z+r),point(n,g['ordinaryFloorVerticalEndZMm']))]})
    return out
def remap_axes(path,mapping):
    out=copy.deepcopy(path)
    for p in out['primitives']:
        if p['kind']=='line':
            transformed_points=[]
            for q in p['points']:
                result=[0.]*3
                for i,j in enumerate(mapping):result[j]=q[i]
                transformed_points.append(result)
            p['points']=transformed_points
        else:p['axes']=[mapping[i] for i in p['axes']]
    return out
def ordinary_beam_links(c):
    g,l=c['geometry'],c['links'];d=l['beamOutsideMm'];r=(l['beamMandrelMm']+d)/2
    combined=(d+g['beamBarOutsideMm'])/2;outward=r-(r-combined)/math.sqrt(2)
    normals=g['beamBarNormalMm'];zs=g['beamBarZMm'];reserve=l['beamCageSideReserveMm']
    planes=l['ordinaryBeamStirrupPlanesMm']
    out=[]
    for axis in (0,1):
        for along in planes:
            profile=closed_profile(normals[0]-outward-reserve,normals[1]+outward+reserve,zs[0]-outward,zs[1]+outward,
                r,l['beamHookTailMm'],along,l['beamClosureOffsetMm'],d,l['beamNominalMm'],f'beam-link/{axis}/{along:g}')
            out.append(remap_axes(profile,[axis,2,1-axis]))
    return out
def audit_unique_paths(paths,tol):
    failures=[];tested=0;locked=0
    for i,a in enumerate(paths):
        for b in paths[i+1:]:
            match=(a['id'].startswith('column-link/0/3285.5') and b['id'].startswith('cross-tie/') and '/3274.5/' in b['id']) or (b['id'].startswith('column-link/0/3285.5') and a['id'].startswith('cross-tie/') and '/3274.5/' in a['id'])
            aa,bb=paths_bounds(a),paths_bounds(b);r=(a['outsideMm']+b['outsideMm'])/2
            zclear=max(aa[0][2]-bb[1][2],bb[0][2]-aa[1][2])
            if match and zclear>=r-1e-9:locked+=1;continue
            ans=audit_path_groups([a],[b],tol);tested+=ans['primitivePairs']
            if not ans['allCertified']:
                failures.extend(ans['failures'])
                if len(failures)>=12:return {'allCertified':False,'failures':failures,'primitivePairs':tested,'lockedNormalContactCertificates':locked,'truncated':True}
    return {'allCertified':not failures,'failures':failures,'primitivePairs':tested,'lockedNormalContactCertificates':locked,'truncated':False}

def segment_point_distance_2d(a,b,p):
    v=[y-x for x,y in zip(a,b)];length=sum(x*x for x in v)
    t=max(0.,min(1.,sum((x-y)*z for x,y,z in zip(p,a,v))/length)) if length else 0.
    return math.dist([x+t*y for x,y in zip(a,v)],p)
def projected_point_distance(point,primitive,plane=(0,1)):
    if primitive['kind']=='line':
        return segment_point_distance_2d([primitive['points'][0][i] for i in plane],
            [primitive['points'][1][i] for i in plane],point)
    if set(primitive['axes'])==set(plane):
        q=[point[plane.index(i)] for i in primitive['axes']]
        a,b=sorted(primitive['anglesRad'])
        return arc_box_distance(primitive['centre'],primitive['radiusMm'],a,b,q,0.)
    lo,hi=primitive_bounds(primitive,0,1)
    a=[lo[i] for i in plane];b=[hi[i] for i in plane]
    return segment_point_distance_2d(a,b,point)
def intended_link_main_contact_audit(c,columns,links,beam_links):
    g=c['geometry'];bad=[];minimum=math.inf
    for link in links:
        for p in columns:
            d=min(projected_point_distance(p,primitive) for primitive in link['primitives'])
            clear=d-(link['outsideMm']+g['columnBarOutsideMm'])/2
            minimum=min(minimum,clear)
            if clear<-1e-7:bad.append({'linkId':link['id'],'columnPointMm':p,'nominalCylinderClearMm':clear})
    beam_min=math.inf
    for link in beam_links:
        axis=int(link['id'].split('/')[1])
        for n in g['beamBarNormalMm']:
            for z in g['beamBarZMm']:
                d=min(projected_point_distance([n,z],primitive,(axis,2)) for primitive in link['primitives'])
                clear=d-(link['outsideMm']+g['beamBarOutsideMm'])/2
                beam_min=min(beam_min,clear)
                if clear<-1e-7:bad.append({'linkId':link['id'],'beamPointMm':[n,z],'nominalCylinderClearMm':clear})
    return {'allNominalContactsNonpenetrating':not bad,'failures':bad,
        'minimumColumnContactClearMm':minimum,'minimumBeamContactClearMm':beam_min,
        'commonJigAndActualSurfaceContactConstraintsRequired':True,
        'independentNormalMotionThroughLinkedBarNotPermitted':True,
        'fieldPhysicalAcceptanceEarned':False}


def external_cover_audit(c,columns,links,beam_links):
    g=c['geometry'];tol=g['cageSettingMm']+g['independentBarSettingMm'];items=[]
    def check(identifier,lo,hi,r,kind):
        if kind=='L':
            distances=[lo[0],lo[1],1000-hi[0],1000-hi[1]]
            if hi[1]>300:distances.append(300-hi[0])
            if hi[0]>300:distances.append(300-hi[1])
        else:
            distances=[lo[0],300-hi[0],lo[2]-3170,3520-hi[2]]
        items.append({'id':identifier,'adverseExternalConcreteCoverMm':min(distances)-r-tol})
    for k,p in enumerate(columns):check('column-main/'+str(k),p+[0],p+[0],g['columnBarOutsideMm']/2,'L')
    for link in links:
        lo,hi=paths_bounds(link);check(link['id'],lo,hi,link['outsideMm']/2,'L')
    for link in beam_links:
        lo,hi=paths_bounds(link);axis=int(link['id'].split('/')[1])
        check(link['id'],[lo[axis],0,lo[2]],[hi[axis],0,hi[2]],link['outsideMm']/2,'beam')
    return {'minimumRequiredMm':g['minimumConcreteCoverMm'],'fullCommonAndIndependentSettingDeductedMm':tol,
        'allCheckedProfilesMeetMinimum':all(x['adverseExternalConcreteCoverMm']>=g['minimumConcreteCoverMm']-1e-8 for x in items),
        'worst':min(items,key=lambda x:x['adverseExternalConcreteCoverMm']),
        'checkedProfileCount':len(items),'floorArcsAtSlabCoreUnionNeedSeparateSurfaceWitness':True}


def corner_floor_surface_cover_audit(c,paths,ordinary=False):
    """Conservative exact-coordinate bounds against the local concrete UNION.
    Core two300x1000 arms are continuous above/below the real200 slab.
    Orthant complement represents the actual concave slab/core surface;
    no artificial concrete face is inserted at their internal material seam.
    """
    g=c['geometry'];tol=g['cageSettingMm']+g['independentBarSettingMm'];fail=[];certified=0
    def cover_bound(primitive,a,b,r):
        lo,hi=primitive_bounds(primitive,a,b);lo=[x-tol for x in lo];hi=[x+tol for x in hi]
        if ordinary:
            above_inner=math.sqrt(max(0.,300-hi[current_axis])**2+max(0.,3370-hi[2])**2)
            return min(lo[current_axis],lo[2]-3170,3520-hi[2],above_inner)-r
        above=math.sqrt(max(0.,300-hi[0])**2+max(0.,300-hi[1])**2+max(0.,3370-hi[2])**2)
        below=math.sqrt(max(0.,300-hi[0])**2+max(0.,300-hi[1])**2+max(0.,lo[2]-3170)**2)
        return min(lo[0],lo[1],1000-hi[0],1000-hi[1],above,below)-r
    for path in paths:
        current_axis=int(path['id'].split('/')[1])
        for primitive in path['primitives']:
            stack=[(0.,1.)];count=0
            while stack:
                a,b=stack.pop();count+=1
                lower=cover_bound(primitive,a,b,path['outsideMm']/2)
                if lower>=g['minimumConcreteCoverMm']-1e-9:certified+=1;continue
                for t in (a,(a+b)/2,b):
                    point=primitive_point(primitive,t);q=line(point,point)
                    value=cover_bound(q,0.,1.,path['outsideMm']/2)
                    if value<g['minimumConcreteCoverMm']-1e-8:
                        fail.append({'id':path['id'],'state':'insufficient-cover','nominalPointMm':point,'adverseCoverMm':value});break
                else:
                    if count<4000 and b-a>1e-10:
                        middle=(a+b)/2;stack.extend(((a,middle),(middle,b)));continue
                    fail.append({'id':path['id'],'state':'unresolved-cover-bound'})
                break
    return {'allCertified':not fail,'failures':fail,'certifiedParameterIntervals':certified,
        'settingDeductedOnEveryAxisMm':tol,'minimumRequiredMm':g['minimumConcreteCoverMm'],
        'localCornerSlabAndTwoContinuousCoreArmsOnly':not ordinary,'ordinaryBandAndContinuousSlabOnly':ordinary}


def floor_floor_audit(c,paths):
    """All actual floor profiles, including opposed corner and phased edge returns.
    Only perpendicular horizontal mat segments have prescribed tied-surface contact.
    Curves, tails and all other pairs retain the full independent-placement box.
    """
    if not c['geometry']['crossedMatsRequireTiedNormalContact']:raise ValueError('Actual tied mat crossing constraints required')
    tol=2*c['geometry']['independentBarSettingMm'];fail=[];pairs=0;locked=0
    for i,a in enumerate(paths):
        for b in paths[i+1:]:
            r=(a['outsideMm']+b['outsideMm'])/2
            if separated_boxes(paths_bounds(a),paths_bounds(b),tol,r):continue
            ia,ib=a['id'].split('/'),b['id'].split('/')
            mat_cross=ia[1]!=ib[1] and ia[2]==ib[2]
            for pa in a['primitives']:
                for pb in b['primitives']:
                    aa,bb=primitive_bounds(pa,0,1),primitive_bounds(pb,0,1)
                    if separated_boxes(aa,bb,tol,r):continue
                    horiz=lambda p:p['kind']=='line' and p['points'][0][2]==p['points'][1][2]
                    if mat_cross and horiz(pa) and horiz(pb) and abs(pa['points'][0][2]-pb['points'][0][2])>=r-1e-9:
                        locked+=1;continue
                    ans=certify_primitive_pair(pa,pb,r,tol,budget=4000);pairs+=1
                    if ans['state']!='clear':
                        fail.append({'a':a['id'],'b':b['id'],**ans})
                        if len(fail)>=12:return {'allCertified':False,'failures':fail,'primitivePairs':pairs,'lockedMatContactCertificates':locked,'truncated':True}
    return {'allCertified':not fail,'failures':fail,'primitivePairs':pairs,'lockedMatContactCertificates':locked,'truncated':False}


def link_self_audit(c,paths):
    """Same-bar nonadjacent portions retain actual forming deviation bounds.
    Adjacent primitives are continuous pieces of the same swept cylinder.
    Unresolved or intersecting nonadjacent portions cannot pass.
    """
    tol=2*c['links']['hookShapeToleranceMm'];fail=[];tested=0
    for path in paths:
        for i,a in enumerate(path['primitives']):
            for b in path['primitives'][i+2:]:
                if separated_boxes(primitive_bounds(a,0,1),primitive_bounds(b,0,1),tol,path['outsideMm']):continue
                tested+=1;ans=certify_primitive_pair(a,b,path['outsideMm'],tol,budget=4000)
                if ans['state']!='clear':
                    fail.append({'id':path['id'],'firstPrimitive':i,**ans})
                    if len(fail)>=12:return {'allCertified':False,'failures':fail,'testedPrimitivePairs':tested,'truncated':True}
    return {'allCertified':not fail,'failures':fail,'testedPrimitivePairs':tested,'truncated':False}

def material_bounds(c):
    g,m=c['geometry'],c['materials'];d=g['floorBarNominalMm'];f=m['reinforcementComparisonMPa']
    ab=(g['floorPitchMm']-2*g['independentBarSettingMm'])/2
    corner_pitch=min(b-a for a,b in zip(g['floorAlongCoordinatesMm'],g['floorAlongCoordinatesMm'][1:]));corner_ab=(corner_pitch-2*g['independentBarSettingMm'])/2
    ft=area(d)*f;dm=ft/m['concreteCompressionMPa']*(1/corner_ab+1/(2*d))
    beam_ab=(g['beamBarNormalMm'][1]-g['beamBarNormalMm'][0]-2*g['independentBarSettingMm'])/2
    beam_bends=[{'id':label,'actualMandrelMm':2*radius-g['beamBarOutsideMm'],
        'noCrossBarExemptionBearingStressCapMPa':(2*radius-g['beamBarOutsideMm'])*m['concreteCompressionMPa']/(area(g['beamBarNominalMm'])*(1/beam_ab+1/(2*g['beamBarNominalMm']))),
        'actualNewCombinedForceDemandAccepted':False} for label,radius in zip(('outer','inner'),g['beamPlanRadiiMm'])]
    layers=floor_layers(c);top=g['slabZMm'][0]+g['ordinaryBandDepthMm']
    end=g['ordinaryFloorVerticalEndZMm']
    r=(g['ordinaryFloorMandrelMm']+g['floorBarOutsideMm'])/2
    ordinary=[]
    for name,z in layers.items():
        tail=end-z-r
        layer_rows=g['ordinaryFloorAlongCoordinatesMm']['bottom' if name.endswith('bottom') else 'top']
        actual_pitch=min(b-a for a,b in zip(layer_rows,layer_rows[1:]));actual_ab=(actual_pitch-2*g['independentBarSettingMm'])/2
        n=g['ordinaryFloorReturnNormalMm']['bottom' if name.endswith('bottom') else 'top']
        horizontal=max(0.,g['ordinaryBandWidthMm']-n-r)
        angle=(2*math.pi-math.acos((g['ordinaryBandWidthMm']-n-r)/r)-math.pi) if n+r>g['ordinaryBandWidthMm'] else math.pi/2
        arc_inside=r*angle
        length=horizontal+arc_inside+max(0.,tail)
        ordinary.append({'layer':name,'straightAfterBendMm':tail,
            'horizontalStraightInsideActualBandMm':horizontal,'curvedLengthInsideActualBandMm':arc_inside,
            'basicTensionBondLengthInsideBandMm':length,'compressionAnchorageQualified':False,
            'minimumStandardBendTailMm':g['ordinaryFloorHookMinTailFactor']*d,
            'standardBendTailFits':tail>=g['ordinaryFloorHookMinTailFactor']*d,
            'poorBondNoShapeReductionStressCapMPa':length*4*m['poorBondMPa']/d,
            'goodBondNoShapeReductionStressCapMPa':length*4*m['goodBondMPa']/d,
            'actualMinimumNeighbourPitchMm':actual_pitch,
            'mandrelBearingStressCapMPa':g['ordinaryFloorMandrelMm']*m['concreteCompressionMPa']/(area(d)*(1/actual_ab+1/(2*d))),
            'completeAnchorageOrForceDemandAccepted':False})
    legacy_radius=(g['alternateLegacyOrdinaryMandrelMm']+g['floorBarOutsideMm'])/2
    legacy_tail=min(end-z-legacy_radius for z in layers.values())
    return {'continuousRingCornerBendBearingBounds':beam_bends,
        'legacy160MandrelMinimumStraightTailMm':legacy_tail,
        'legacy160MandrelFitsChosen5Phi':legacy_tail>=g['ordinaryFloorHookMinTailFactor']*d,
        'current140MandrelMinimumStraightTailMm':min(x['straightAfterBendMm'] for x in ordinary),
        'current140FitsChosen5Phi':all(x['standardBendTailFits'] for x in ordinary),
        'floorStockStrengthSelectedFromActualNewDemands':False,
        'floorAreaMm2PerM':area(d)*1000/g['floorPitchMm'],
        'legacyH16Per80AreaMm2PerM':area(16)*1000/80,
        'requiredMandrelAt400MPaWorstIndependentPitchMm':dm,
        'cornerMandrelReserveMm':g['cornerFloorMandrelMm']-dm,
        'ordinaryStraightTopRowBasicTensionLengthMm':g['ordinaryBandWidthMm']-g['ordinaryStraightBarOuterEndMm'],
        'ordinaryStraightTopRowPoorBondStressCapMPa':(g['ordinaryBandWidthMm']-g['ordinaryStraightBarOuterEndMm'])*4*m['poorBondMPa']/d,
        'ordinaryStraightTopRowGoodBondStressCapMPa':(g['ordinaryBandWidthMm']-g['ordinaryStraightBarOuterEndMm'])*4*m['goodBondMPa']/d,
        'cornerPoorBondFull400StraightRequirementMm':d*f/(4*m['poorBondMPa']),
        'cornerStraightTailReserveMm':g['cornerFloorStraightTailMm']-d*f/(4*m['poorBondMPa']),
        'ordinary350Anchorage':ordinary,
        'prospective360MinimumStraightTailMm':min(x['straightAfterBendMm'] for x in ordinary)+10,
        '360GeometryIsAnUnselectedComparison':True}
def assess(c,base,full_geometry=False):
    g=c['geometry'];col=column_points(c);beam=beam_paths(c);floors=corner_floor_paths(c)
    if c['links']['columnHookTailMm']<c['links']['columnHookMinimumTailMm']:raise ValueError('Declared ordinary135 hook fabrication comparison requires100mm straight')
    if not g['independentBarAllowanceIncludesShapeError'] or c['links']['hookShapeToleranceMm']>g['independentBarSettingMm']:raise ValueError('Forming deviations must fit within the declared total independent bar allowance')
    if c['materials']['maximumAggregateMm']+5>g['parallelMinimumClearMm']:raise ValueError('Declared aggregate exceeds inherited21mm minimum-clear comparison')
    contact=c['links']['matchedJointContactPlanesZMm']
    expected_cross=g['beamBarZMm'][0]+(g['beamBarOutsideMm']+c['links']['columnOutsideMm'])/2
    if not g['commonNodeJigRequired'] or not c['links']['matchedContactsRequireLockedNormalSeparation'] or contact!={'beamBottom':g['beamBarZMm'][0],'crossTie':expected_cross,'westHoop':expected_cross+c['links']['columnOutsideMm']}:
        raise ValueError('Exact tied-cage normal-separation constraints required; no independent-Z contact waiver')
    if base['slabZMm']!=g['slabZMm'] or base['firstFFLMm']!=g['FIRSTMm']:raise ValueError('Changed actual source levels')
    if g['comparisonCoreMm']!=300 or g['ordinaryBandWidthMm']!=300 or g['ordinaryBandDepthMm']!=350:raise ValueError('This exact unselected300x350 source family only')
    if any(c['scope'][k] is not False for k in ('nativeHouseSolved','old96DemandTransferred','wholeCagePlacingAccepted','completeResistanceAccepted','productAccepted','ownerAccepted','houseAccepted')):raise ValueError('No approval or demand injection')
    tol=2*g['independentBarSettingMm'];beam_col=[]
    for p in col:
        for bar in beam:
            rr=(g['columnBarOutsideMm']+bar['outsideMm'])/2
            distances=[]
            for primitive in bar['primitives']:
                if primitive['kind']=='line':distances.append(line_box_distance(primitive['points'][0][:2],primitive['points'][1][:2],p,tol))
                else:distances.append(arc_box_distance(primitive['centre'],primitive['radiusMm'],*primitive['anglesRad'],p,tol))
            beam_col.append({'columnXYMm':p,'beamId':bar['id'],'adverseCylinderClearMm':min(distances)-rr})
    floor_col=[]
    for bar in floors:
        axis=int(bar['id'].split('/')[1]);along=float(bar['id'].split('/')[-1])
        for p in col:
            nearest=list(p);n=g['cornerFloorReturnNormalMm']
            point=[min(700,max(n,p[axis])),along] if axis==0 else [along,min(700,max(n,p[axis]))]
            floor_col.append({'floorId':bar['id'],'columnXYMm':p,
                'adverseProjectedCylinderClearMm':distance_box_point(point,p,tol)-(bar['outsideMm']+g['columnBarOutsideMm'])/2})
    ordinary=ordinary_floor_paths(c);beam_links=ordinary_beam_links(c)
    links,schedules=link_paths(c)
    link_beam=audit_path_groups(links,beam,tol,matched_contacts=True) if full_geometry else {'executed':False}
    link_floor=audit_path_groups(links,floors+ordinary,tol) if full_geometry else {'executed':False}
    layers=floor_layers(c);inter=layers['Y-top']-layers['Y-bottom']-g['floorBarOutsideMm']-tol
    return {'schema':'str-perimeter-upstand-cage-checkpoint/1','status':'EXACT CORNER PROFILES;WHOLE CAGE/ORDINARY EDGE ANCHORAGE NOT ACCEPTED',
        'geometry':g,'columnBarCoordinatesLocalMm':col,'columnBarsNominalCount':len(col),
        'beamSectionOriginNormalZMm':[g['ordinaryBandWidthMm']/2,g['slabZMm'][0]+g['ordinaryBandDepthMm']/2],
        'L300ConcreteAreaMm2':510000,'L300CentroidLocalXYMm':[355.88235294117646]*2,
        'floorLayerZMm':layers,'parallelFloorBarAdverseClearMm':min(b-a for layer in ('bottom','top') for rows in [sorted(set(g['floorAlongCoordinatesMm']+g['ordinaryFloorAlongCoordinatesMm'][layer]))] for a,b in zip(rows,rows[1:]))-g['floorBarOutsideMm']-tol,
        'interMatAdverseParallelClearMm':inter,
        'beamColumnWitness':min(beam_col,key=lambda x:x['adverseCylinderClearMm']),
        'floorColumnWitness':min(floor_col,key=lambda x:x['adverseProjectedCylinderClearMm']),
        'cornerMainBarHoleChecksPass':min(x['adverseCylinderClearMm'] for x in beam_col)>=0 and min(x['adverseProjectedCylinderClearMm'] for x in floor_col)>=0,
        'beamPaths':beam,'cornerFloorPaths':floors,'materialBounds':material_bounds(c),
        'fullThreeDimensionalGeometryAuditExecuted':full_geometry,
        'beamFloorThreeDimensionalBoxAudit':beam_floor_audit(c,beam,floors) if full_geometry else {'executed':False},
        'columnLinkPaths':links,'linkSchedulesZMm':schedules,'ordinaryFloorPaths':ordinary,'ordinaryBeamLinkPaths':beam_links,
        'ordinaryBeamLinksAgainstFloorAudit':audit_path_groups(beam_links,floors+ordinary,tol) if full_geometry else {'executed':False},
        'allLinksAgainstEachOtherAudit':audit_unique_paths(links+beam_links,tol) if full_geometry else {'executed':False},
        'intendedLinkMainContacts':intended_link_main_contact_audit(c,col,links,beam_links) if full_geometry else {'executed':False},
        'sameBarLinkSelfIntersectionAudit':link_self_audit(c,links+beam_links) if full_geometry else {'executed':False},
        'allFloorProfilesAgainstEachOtherAudit':floor_floor_audit(c,floors+ordinary) if full_geometry else {'executed':False},
        'ordinaryFloorConcreteUnionCoverAudit':corner_floor_surface_cover_audit(c,ordinary,ordinary=True),
        'cornerFloorConcreteUnionCoverAudit':corner_floor_surface_cover_audit(c,floors),
        'externalConcreteCoverAudit':external_cover_audit(c,col,links,beam_links),
        'ordinaryFloorAgainstBeamAudit':beam_floor_audit(c,beam,ordinary) if full_geometry else {'executed':False},
        'linksAgainstBeamThreeDimensionalAudit':link_beam,'linksAgainstFloorThreeDimensionalAudit':link_floor,
        'maximumOrdinaryBeamStirrupPitchMm':max(b-a for a,b in zip(sorted({float(x['id'].split('/')[-1]) for x in beam_links}),sorted({float(x['id'].split('/')[-1]) for x in beam_links})[1:])),
        'maximumColumnLinkFamilyPitchMm':max(b-a for rows in schedules.values() for a,b in zip(rows,rows[1:])),
        'sourceCornerMirrors':[{'corner':r['corner'],'originHeadXYMm':r['originXYMm'],'signXY':r['signXY'],
            'outerFaceXYMm':[r['originXYMm'][i]-70*r['signXY'][i] for i in range(2)],'localCoordinatesMeasuredInwardFromOuterFace':True} for r in base['corners']],
        'newInnerMasonrySeatUsed':False,'nativeHouseSolveExecuted':False,
        'unclosed':['Beam laps, bars beyond the local node window and full resistance remain unqualified; complete all listed geometry audits before placing selection',
            'The old160mandrel top tail fails5phi;140 now fits geometrically but its finite bond/bearing force capacity requires actual new edge demands',
            'No current signed whole-house force envelope, beam/column six-component resistance or floor stress-convergence proof exists for this profile',
            'Factory rib envelopes/common jig and physical installation/material acceptance unearned',
            'Actual north650/750 overlap and material union belong to the producer; no guessed beam width is used here'],
        'scope':copy.deepcopy(c['scope'])}

def draw(c,result):
    """Source-derived projections; no invented force/resistance depiction."""
    ns='http://www.w3.org/2000/svg';ET.register_namespace('',ns)
    root=ET.Element('{'+ns+'}svg',{'width':'1500','height':'1240','viewBox':'0 0 1500 1240'})
    def elem(tag,**kw):return ET.SubElement(root,'{'+ns+'}'+tag,{k.replace('_','-'):str(v) for k,v in kw.items()})
    def text(x,y,value,size=18):elem('text',x=x,y=y,font_family='Arial',font_size=size,fill='#202a35').text=value
    def path(points,colour,width=2):
        return elem('polyline',points=' '.join(f'{x:.3f},{y:.3f}' for x,y in points),fill='none',stroke=colour,stroke_width=width)
    elem('rect',x=0,y=0,width=1500,height=1240,fill='white')
    text(35,35,'UNSELECTED — 300 × 350 perimeter band / inward L300 corner',25)
    text(35,66,'Actual floor 3170–3370; FIRST 3450; upstand top 3520. New whole-house resistance UNCALCULATED.',17)
    text(35,103,'Corner plan · local inward mm from outside concrete face',20)
    ox,oy,scale=45,150,.53
    def plan(q):return [ox+scale*q[0],oy+scale*q[1]]
    path([plan(p) for p in [[0,0],[1000,0],[1000,300],[300,300],[300,1000],[0,1000],[0,0]]],'#9b9fa2',3)
    clip=elem('clipPath',id='plan-window');ET.SubElement(clip,'{'+ns+'}rect',{'x':'35','y':'140','width':'620','height':'560'})
    for bar in result['beamPaths']:path([plan(q) for q in paths_points(bar)],'#a3362a',2).set('clip-path','url(#plan-window)')
    for bar in result['cornerFloorPaths']:path([plan(q) for q in paths_points(bar)],'#287a47',1)
    for q in result['columnBarCoordinatesLocalMm']:
        x,y=plan(q);elem('circle',cx=x,cy=y,r=4.77,fill='#243c83')
    for name,normal in [('west',0),('south',1)]:
        selected=next(p for p in result['columnLinkPaths'] if p['id'].startswith(f'column-link/{normal}/3285.5' if normal==0 else 'column-link/1/3355'))
        path([plan(q) for q in paths_points(selected)],'#b17815',1.7)
    text(35,720,'12H16 column main; 4 continuous H16 band; H10 hoops/crossties.',17)
    text(35,750,'H14/75 nominal floor; explicit local rows and opposed 1000 mm tails.',17)
    text(35,780,'160 mm extra inward width beyond 140 mm wall; visible 70 mm plinth.',17)
    text(35,825,'Steel families: blue column · red ring · green floor · ochre links',16)
    text(35,860,'Mirrored at all four actual corner heads; local geometry only.',16)
    text(35,895,'Linked steel contacts require coordinated jig; no cylinder overlap waiver.',16)
    def section(title,xbase,ybase,ordinary):
        text(xbase,ybase,title,20);x0=xbase;y0=ybase+45;sc=.8;zlow=3050
        project=lambda q:[x0+sc*q[0],y0+sc*(3650-q[2])]
        # Real band and floor; section cut at local inward normal.
        if ordinary:
            path([project(q) for q in [[0,0,3170],[300,0,3170],[640,0,3170],[640,0,3370],[300,0,3370],[300,0,3520],[0,0,3520],[0,0,3170]]],'#a2a7aa',2)
        else:
            path([project(q) for q in [[0,0,3650],[0,0,3050]]],'#a2a7aa',2)
            path([project(q) for q in [[300,0,3650],[300,0,3370],[640,0,3370],[640,0,3170],[300,0,3170],[300,0,3050]]],'#a2a7aa',2)
        for z,label in [(3170,'3170 soffit'),(3370,'3370 slab'),(3450,'3450 FIRST'),(3520,'3520 band')]:
            y=project([0,0,z])[1];path([[x0-5,y],[x0+510,y]],'#d4d7d9',.8);text(x0+520,y+5,label,14)
        for n in c['geometry']['beamBarNormalMm']:
            for z in c['geometry']['beamBarZMm']:
                x,y=project([n,0,z]);elem('circle',cx=x,cy=y,r=7.2,fill='#a3362a')
        clip_id='ordinary-window' if ordinary else 'corner-window'
        clip=elem('clipPath',id=clip_id);ET.SubElement(clip,'{'+ns+'}rect',{'x':str(xbase),'y':str(ybase+35),'width':'515','height':str(370 if ordinary else 435)})
        selected=result['ordinaryFloorPaths'] if ordinary else result['cornerFloorPaths']
        for layer in ('bottom','top'):
            bar=next(b for b in selected if '/0/'+layer+'/' in b['id'] and not b.get('straightBarWithFiniteBondCapacityOnly',False))
            path([project(q) for q in paths_points(bar)],'#287a47',3).set('clip-path','url(#'+clip_id+')')
        if not ordinary:
            text(xbase,ybase+490,'Tails continue beyond clipped view: 1000 mm into lower/upper L300.',15)
        else:
            text(xbase,ybase+490,'Ordinary 140 mm mandrel: minimum 72 mm straight after bend.',15)
            text(xbase,ybase+514,'Top row955 is straight: 240 mm finite bond; fresh demands still required.',15)
    section('Corner section · opposed vertical returns',725,105,False)
    section('Ordinary perimeter section · hooks within 350 depth',725,655,True)
    text(35,1210,'SOURCE-OWNED COMPARISON · no native solve · no transferred old96 loads · no physical/product/owner/house acceptance',17)
    return ET.tostring(root,encoding='unicode')+'\n'

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True);p=ap.parse_args()
    c=json.loads(INPUT.read_bytes());settings,raw=source.load();base,h,grid,furniture=source.derive(settings,raw)
    result=assess(c,base,full_geometry=True);p.out.mkdir(parents=True,exist_ok=True)
    result['sourceSHA256']={name:source.sha((D/name).read_bytes()) for name in ('perimeter_upstand_cage.py','perimeter-upstand-cage-inputs.json','perimeter_upstand_cage_test.py')}
    data=json.dumps(result,indent=2,allow_nan=False)+'\n';(p.out/'perimeter-upstand-cage-checkpoint.json').write_text(data)
    svg=draw(c,result);(p.out/'perimeter-upstand-cage.svg').write_text(svg)
    print('SVG_SOURCE perimeter-upstand-cage.svg '+svg.encode().hex())
    print('UPSTAND_CAGE_SUMMARY '+json.dumps({k:v for k,v in result.items() if k not in ('beamPaths','cornerFloorPaths','columnLinkPaths','ordinaryFloorPaths','ordinaryBeamLinkPaths')}))
    print('CHECKPOINT_SHA256 '+source.sha(data.encode()))
    print('JSON_SOURCE perimeter-upstand-cage-checkpoint.json '+data.encode().hex())
if __name__=='__main__':main()
