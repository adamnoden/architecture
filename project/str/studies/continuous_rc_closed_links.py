import copy
import itertools
import math

import numpy as np

from continuous_rc_cage import arch_bar_paths, frame_bar_paths, reference_cage_case


def reference_closed_link_case():
    bars=reference_cage_case()
    bars.update(nominalLinkCoverMm=47.,archTailInwardOffsetMm=8.,barMandrelMm=162.,
        lapIntervalsXMm=[[4850.,5850.],[6150.,7150.]])
    return {'schema':'str-continuous-rc-closed-link-case/1','barCase':bars,
        'mainRibEnvelopeMm':13.5,'linkRibEnvelopeMm':9.,'minimumCoverMm':40.,'wholeCageSettingMm':5.,
        'mainToFormedLinkBoxToleranceMm':5.,'ordinaryCornerCentreRadiusMm':22.75,
        'regularRadiusToleranceMm':.25,'closureCentreRadiusMm':24.75,'closureRadiusToleranceMm':.25,'straightHookTailMm':55.,
        'tailLengthToleranceMm':1.,'hookPlaneSeparationMm':14.,'hookPlaneToleranceMm':1.,
        'contactLapPackCentreSeparationMm':14.5,'contactPackRelativeToleranceMm':.5,
        'barCutToleranceMm':2.,'placementToleranceMm':4.,'externalFormingToleranceMm':1.,
        'archTailNormalOffsetMm':76/3,'minimumIndependentMainBarClearMm':21.,'linkStationToleranceMm':2.,
        'ordinaryNominalPitchMm':90.,'jointNominalPitchMm':50.,'maximumAsBuiltPitchMm':100.,
        'minimumSelfSurfaceClearMm':1.,'use':'new-conventional-closed-link-candidate-not-fabrication-release'}


def _smooth(t):
    t=max(0.,min(1.,t));return t*t*(3-2*t)


def _sample(fn,a,b,count=24):
    return [fn(a+(b-a)*i/count) for i in range(count+1)]


def refined_main_bars(case,portal,upstand_top):
    base=case['barCase'];arch=arch_bar_paths(base,portal)
    outer=base['normalCoreMm']/2-71.;inner=case['archTailNormalOffsetMm']
    for row in arch:
        row['pointsMm']=[[x,math.copysign(inner+(outer-inner)*_smooth((min(x,12000-x)-4520)/480),y),z] for x,y,z in row['pointsMm']]
    frame=frame_bar_paths(base,portal,upstand_top)
    for row in frame:
        layer,side,normal=row['id'].split('/');mirror=side=='east';sign=int(normal)
        interval=base['lapIntervalsXMm'][0 if sign==1 else 1]
        local=interval if not mirror else [12000-interval[1],12000-interval[0]]
        x0=(4520-71 if layer=='bottom' else 4307.5+71)+87
        ramp=max(x0,local[0]-300)
        result=[]
        for x,y,z in row['pointsMm']:
            xx=12000-x if mirror else x
            if xx>=x0-1e-7:
                weight=_smooth((xx-ramp)/(local[0]-ramp)) if xx<local[0] else 1.
                if xx>local[1]:weight=1-_smooth((xx-local[1])/300)
                z+=(case['contactLapPackCentreSeparationMm']/2-6)*(1 if mirror else -1)*weight
            result.append([x,y,z])
        row['pointsMm']=result
    return {'arch':arch,'frame':frame,'mainCentreFaceMm':71.,'postMainHalfXYMm':[35.25,74.],
        'archTailHalfXYMm':[27.25,inner],'upstandNormalBarOffsetMm':29.,
        'contactLapPackCentreSeparationMm':case['contactLapPackCentreSeparationMm'],
        'scope':'Explicit2mm inward reinforcement refinement, same290/200 concrete. Actual rib envelopes are admission limits, not measured stock identities.'}


def closed_wire(half_u,half_v,case,closure_radius=None,closure='corner'):
    r=case['ordinaryCornerCentreRadiusMm'];rh=closure_radius or case['closureCentreRadiusMm']
    length=case['straightHookTailMm'];h=case['hookPlaneSeparationMm']/2
    if min(half_u,half_v)<=max(r,rh):raise ValueError('Actual closed-link cell is too small for delivered bends')
    if closure not in ('corner','side-middle'):raise ValueError('Unsupported ordinary closed-link closure')
    c=[half_u-rh,half_v-rh if closure=='corner' else 0.];points=[];parts=[]
    def add(name,rows):
        first=len(points)
        if points and math.dist(points[-1],rows[0])<1e-9:rows=rows[1:]
        points.extend(rows);parts.append({'id':name,'firstPoint':max(0,first-1),'lastPoint':len(points)-1})
    if closure=='side-middle':
        add('first-straight-tail',[[c[0]-rh,-length,-h],[c[0]-rh,0.,-h]])
        add('first-180-hook',_sample(lambda t:[c[0]+rh*math.cos(t),rh*math.sin(t),-h],math.pi,0.,48))
        add('right-lower',[[half_u,0.,-h],[half_u,-half_v+r,-h]])
        add('SE',_sample(lambda t:[half_u-r+r*math.cos(t),-half_v+r+r*math.sin(t),-h],0,-math.pi/2))
        add('bottom',[[half_u-r,-half_v,-h],[-half_u+r,-half_v,-h]])
        add('SW',_sample(lambda t:[-half_u+r+r*math.cos(t),-half_v+r+r*math.sin(t),-h],-math.pi/2,-math.pi))
        add('left',_sample(lambda t:[-half_u,-half_v+r+2*(half_v-r)*t,-h+2*h*_smooth(t)],0,1))
        add('NW',_sample(lambda t:[-half_u+r+r*math.cos(t),half_v-r+r*math.sin(t),h],math.pi,math.pi/2))
        add('top',[[-half_u+r,half_v,h],[half_u-r,half_v,h]])
        add('NE',_sample(lambda t:[half_u-r+r*math.cos(t),half_v-r+r*math.sin(t),h],math.pi/2,0.))
        add('right-upper',[[half_u,half_v-r,h],[half_u,0.,h]])
        add('second-180-hook',_sample(lambda t:[c[0]+rh*math.cos(t),rh*math.sin(t),h],0,-math.pi,48))
        add('second-straight-tail',[[c[0]-rh,0.,h],[c[0]-rh,length,h]])
        return {'points':points,'parts':parts,'halfCellMm':[half_u,half_v],'regularCentreRadiusMm':r,
            'closureCentreRadiusMm':rh,'nominalCoreInnerMandrelsMm':[2*r-8,2*rh-8],
            'ribClearInnerDiametersMm':[2*r-case['linkRibEnvelopeMm'],2*rh-case['linkRibEnvelopeMm']],
            'straightTailMm':length,'hookPlaneSeparationMm':2*h,'closureLocation':'side-middle',
            'closure':'One link with two180degree hooked ends at the deep-face mid-height; no weld or added hanger. Actual bend-bearing/anchorage forces remain separate.'}
    add('first-straight-tail',[[c[0]-length,c[1]-rh,-h],[c[0],c[1]-rh,-h]])
    add('first-180-hook',_sample(lambda t:[c[0]+rh*math.cos(t),c[1]+rh*math.sin(t),-h],-math.pi/2,math.pi/2,48))
    add('top',[[c[0],half_v,-h],[-half_u+r,half_v,-h]])
    add('NW',_sample(lambda t:[-half_u+r+r*math.cos(t),half_v-r+r*math.sin(t),-h],math.pi/2,math.pi))
    long_left=half_v>=half_u
    add('left',_sample(lambda t:[-half_u,half_v-r-2*(half_v-r)*t,-h+2*h*_smooth(t) if long_left else -h],0,1))
    level=h if long_left else -h
    add('SW',_sample(lambda t:[-half_u+r+r*math.cos(t),-half_v+r+r*math.sin(t),level],math.pi,3*math.pi/2))
    add('bottom',_sample(lambda t:[-half_u+r+2*(half_u-r)*t,-half_v,level if long_left else -h+2*h*_smooth(t)],0,1))
    add('SE',_sample(lambda t:[half_u-r+r*math.cos(t),-half_v+r+r*math.sin(t),h],3*math.pi/2,2*math.pi))
    add('right',[[half_u,-half_v+r,h],[half_u,c[1],h]])
    add('second-180-hook',_sample(lambda t:[c[0]+rh*math.cos(t),c[1]+rh*math.sin(t),h],0,math.pi,48))
    add('second-straight-tail',[[c[0]-rh,c[1],h],[c[0]-rh,c[1]-length,h]])
    return {'points':points,'parts':parts,'halfCellMm':[half_u,half_v],'regularCentreRadiusMm':r,
        'closureCentreRadiusMm':rh,'nominalCoreInnerMandrelsMm':[2*r-8,2*rh-8],
        'ribClearInnerDiametersMm':[2*r-case['linkRibEnvelopeMm'],2*rh-case['linkRibEnvelopeMm']],
        'straightTailMm':length,'hookPlaneSeparationMm':2*h,'closureLocation':'corner',
        'closure':'One conventional link with two180degree hooked ends, stacked in separate planes; no weld or added load-bearing hanger.'}


def _segment_pairs(a,b):
    a=np.asarray(a,dtype=float);b=np.asarray(b,dtype=float)
    p=a[:-1,None,:];q=a[1:,None,:];r=b[None,:-1,:];s=b[None,1:,:]
    u=q-p;v=s-r;w=p-r
    dot=lambda x,y:np.sum(x*y,axis=-1)
    aa=dot(u,u);bb=dot(u,v);cc=dot(v,v);dd=dot(u,w);ee=dot(v,w);den=aa*cc-bb*bb
    with np.errstate(divide='ignore',invalid='ignore'):
        t1=np.where(den>1e-12,np.clip((bb*ee-cc*dd)/den,0,1),0.)
        t2=(bb*t1+ee)/cc
        t1=np.where(t2<0,np.clip(-dd/aa,0,1),np.where(t2>1,np.clip((bb-dd)/aa,0,1),t1))
        t2=np.clip(t2,0,1)
        t1=np.where(aa<=1e-12,0,t1);t2=np.where(aa<=1e-12,np.clip(ee/cc,0,1),t2)
        t2=np.where(cc<=1e-12,0,t2);t1=np.where(cc<=1e-12,np.clip(-dd/aa,0,1),t1)
    return np.sqrt(dot(w+t1[...,None]*u-t2[...,None]*v,w+t1[...,None]*u-t2[...,None]*v))


def path_distance(a,b):
    matrix=_segment_pairs(a,b)
    at=np.unravel_index(int(np.argmin(matrix)),matrix.shape)
    return {'centreDistanceMm':float(matrix[at]),'segmentIndices':list(map(int,at))}


def _segment_box_distance(a,b,lo,hi):
    direction=np.asarray(b)-a;start=np.asarray(a);breaks=[0.,1.]
    for axis in range(3):
        if abs(direction[axis])<1e-12:continue
        breaks.extend(float(t) for t in ((lo[axis]-start[axis])/direction[axis],(hi[axis]-start[axis])/direction[axis]) if 0<t<1)
    breaks=sorted(set(breaks));best=math.inf
    for first,last in zip(breaks,breaks[1:]):
        middle=(first+last)/2;point=start+middle*direction
        constants=[];slopes=[]
        for axis in range(3):
            boundary=lo[axis] if point[axis]<lo[axis] else hi[axis] if point[axis]>hi[axis] else None
            if boundary is not None:constants.append(start[axis]-boundary);slopes.append(direction[axis])
        den=sum(v*v for v in slopes)
        station=max(first,min(last,-sum(u*v for u,v in zip(constants,slopes))/den)) if den>1e-12 else middle
        point=start+station*direction;gap=np.maximum(lo-point,np.maximum(point-hi,0))
        best=min(best,float(np.linalg.norm(gap)))
    return best


def wire_self_clearance(wire,case):
    points=np.asarray(wire['points']);lengths=np.linalg.norm(points[1:]-points[:-1],axis=1)
    chain=np.r_[0,np.cumsum(lengths)]
    distance=_segment_pairs(points,points)
    local=np.maximum(chain[:-1,None],chain[None,:-1])-np.minimum(chain[1:,None],chain[None,1:])
    mask=(local>2*case['linkRibEnvelopeMm']) & (np.arange(len(lengths))[:,None]<np.arange(len(lengths))[None,:])
    distance=np.where(mask,distance,np.inf);at=np.unravel_index(int(np.argmin(distance)),distance.shape)
    clear=float(distance[at])-case['linkRibEnvelopeMm']-2*case['hookPlaneToleranceMm']
    return {'adverseSelfSurfaceClearMm':clear,'limitingSegmentIndices':list(map(int,at)),
        'selfClearancePasses':clear>=case['minimumSelfSurfaceClearMm'],
        'scope':'Connected local material within two wire diameters of chainage is excluded; delivered bend-radius bounds remain independent.'}


def transform_wire(wire,origin,u,v,w):
    return [[origin[i]+x*u[i]+y*v[i]+z*w[i] for i in range(3)] for x,y,z in wire['points']]


def main_to_wire_clearance(points,main_paths,case):
    worst=None
    for row in main_paths:
        matrix=_segment_pairs(points,row['pointsMm']);tolerance=case['mainToFormedLinkBoxToleranceMm']
        bounds=matrix-math.sqrt(3)*tolerance
        radii=(case['linkRibEnvelopeMm']+case['mainRibEnvelopeMm'])/2
        candidates=np.argwhere(bounds<radii+3.)
        main=np.asarray(row['pointsMm']);wire=np.asarray(points)
        for i,j in candidates:
            lo=np.minimum(main[j],main[j+1])-tolerance;hi=np.maximum(main[j],main[j+1])+tolerance
            bounds[i,j]=max(bounds[i,j],_segment_box_distance(wire[i],wire[i+1],lo,hi))
        at=np.unravel_index(int(np.argmin(bounds)),bounds.shape)
        clear=float(bounds[at])-radii-.4-.02
        item={'mainBarId':row['id'],'adverseSurfaceLowerBoundMm':clear,'nominalCentreDistanceMm':float(matrix[at]),
            'segmentIndices':list(map(int,at)),'mainInterpolationAllowanceMm':.4,'wireChordAllowanceMm':.02}
        if worst is None or clear<worst['adverseSurfaceLowerBoundMm']:worst=item
    return worst


def main_normal_at_z(z):return 74.-45.*_smooth((z-2600)/500)


def _point_segment_2d(point,a,b):
    u=[b[i]-a[i] for i in range(2)];v=[point[i]-a[i] for i in range(2)];den=sum(x*x for x in u)
    t=max(0.,min(1.,sum(x*y for x,y in zip(u,v))/den)) if den else 0.
    return math.hypot(*(v[i]-t*u[i] for i in range(2)))


def joint_union_clearance(x,z,portal):
    ri=portal['rawRadius'];ro=ri+portal['ring'];cz=portal['centreZ'];lo,hi=portal['piers']['westEW']
    rr=math.hypot(x-6000,z-cz)
    inside=lo<=x<=hi and -180<=z<=3170 or hi<=x<=7480 and z>=cz and ri<=rr<=ro
    if not inside:return -1.
    inner_z=cz+math.sqrt(ri*ri-(hi-6000)**2);outer_z=cz+math.sqrt(ro*ro-(hi-6000)**2)
    segments=[([lo,-180],[lo,3170]),([lo,-180],[hi,-180]),([lo,3170],[hi,3170]),
        ([hi,-180],[hi,inner_z]),([hi,outer_z],[hi,3170])]
    distances=[_point_segment_2d([x,z],a,b) for a,b in segments]
    angle=math.atan2(z-cz,x-6000)
    for radius in (ri,ro):
        left=math.atan2(math.sqrt(radius*radius-1480**2),-1480)
        right=math.pi-left
        distances.append(abs(rr-radius) if right<=angle<=left else min(math.hypot(x-(6000+radius*math.cos(t)),z-(cz+radius*math.sin(t))) for t in (left,right)))
    return min(distances)


def joint_hoop_right(z,portal):
    hi=portal['piers']['westEW'][1];d=49.5
    levels=[z-10,z,z+10]
    for radius in (portal['rawRadius'],portal['rawRadius']+portal['ring']):
        endpoint=portal['centreZ']+math.sqrt(radius*radius-1480**2)
        if z-10<endpoint<z+10:levels.append(endpoint)
    def safe(x):return min(joint_union_clearance(x,level,portal) for level in levels)>=d-1e-8
    left=hi-d;right=left
    while right<5100 and safe(right+2):right+=2
    low,high=right,right+2
    for _ in range(24):
        middle=(low+high)/2
        if safe(middle):low=middle
        else:high=middle
    return low-.05


def lap_bend_audit(case):
    bar_case=case['barCase'];radius=(bar_case['barMandrelMm']+bar_case['barDiameterMm'])/2
    face=bar_case['nominalLinkCoverMm']+bar_case['linkDiameterMm']/2+(bar_case['linkMandrelMm']+bar_case['linkDiameterMm'])/2
    rows=[]
    for layer,x in (('bottom',4520-face),('top',4307.5+face)):
        for side in ('west','east'):
            for sign,interval in ((1,bar_case['lapIntervalsXMm'][0]),(-1,bar_case['lapIntervalsXMm'][1])):
                local=interval if side=='west' else [12000-interval[1],12000-interval[0]]
                length=min(300.,local[0]-(x+radius))
                offset=case['contactLapPackCentreSeparationMm']/2
                change=(10 if layer=='bottom' else -10)+(-offset if side=='west' else offset)
                minimum=length**2/(6*abs(change)) if length>0 else 0.
                rows.append({'layer':layer,'side':side,'normalSign':sign,'actualRampLengthMm':length,
                    'verticalChangeMm':change,'minimumRadiusLowerBoundMm':minimum,
                    'requiredMainCentreRadiusMm':radius,'radiusScreenPasses':minimum>=radius})
    return rows


def local_component_checks(case):
    definitions=[('post',56.75,95.5,35.25,74.,'corner'),
        ('ring-end',57.5,case['archTailNormalOffsetMm']+23.5,36.5,case['archTailNormalOffsetMm'],'corner'),
        ('outer-upstand',50.5,325.5,29.,304.,'side-middle'),
        ('court-upstand',50.5,275.5,29.,254.,'side-middle'),
        ('cap',215.,215.,193.,193.,'corner')]
    results=[]
    for name,a,b,u,v,closure in definitions:
        main=[{'id':str(i),'pointsMm':[[x,y,-500.],[x,y,500.]]} for i,(x,y) in enumerate(itertools.product((-u,u),(-v,v)))]
        checks=[]
        for dr in (-case['closureRadiusToleranceMm'],case['closureRadiusToleranceMm']):
            for regular in (-case['regularRadiusToleranceMm'],case['regularRadiusToleranceMm']):
                candidate=copy.deepcopy(case);candidate['ordinaryCornerCentreRadiusMm']+=regular
                wire=closed_wire(a,b,candidate,case['closureCentreRadiusMm']+dr,closure)
                own=wire_self_clearance(wire,case);clear=main_to_wire_clearance(wire['points'],main,case)
                checks.append({'closureRadiusChangeMm':dr,'regularRadiusChangeMm':regular,'self':own,'main':clear})
        worst=min(checks,key=lambda row:row['main']['adverseSurfaceLowerBoundMm'])
        self_min=min(row['self']['adverseSelfSurfaceClearMm'] for row in checks)
        wire=closed_wire(a,b,case,closure=closure)
        results.append({'component':name,'wire':wire,'mainBarAxesUV':[[x,y] for x,y in itertools.product((-u,u),(-v,v))],
            'deliveredRadiusChecks':checks,'minimumSelfClearanceMm':self_min,
            'worstMainClearance':worst['main'],'componentGeometryPasses':self_min>=case['minimumSelfSurfaceClearMm'] and worst['main']['adverseSurfaceLowerBoundMm']>=0,
            'bendBearingAndAnchorageStrengthAccepted':False})
    return results


def proposed_barrier_axes(case,portal):
    rows=[]
    for wall,key in (('court-north','courtNS'),('outer-north','gardenNS')):
        cy=sum(portal['piers'][key])/2
        for side,along in (('west','westEW'),('east','eastEW')):
            lo,hi=portal['piers'][along];warm=[lo,lo+140] if side=='west' else [hi-140,hi]
            for x,y in itertools.product((lo+71.,hi-71.),(cy-74.,cy+74.)):
                rows.append({'pierId':wall+'/'+side,'proposedAxisXYZMm':[x,y,-40.],
                    'reference69FaceAxisXYZMm':[x-2 if x<(lo+hi)/2 else x+2,y-2 if y<cy else y+2,-40.],
                    'mainRibEnvelopeMm':case['mainRibEnvelopeMm'],'sourceWarmCoreClipXMm':warm,
                    'existing69FaceBarrierMatches':False,'metalJointOrSealAccepted':False})
    return rows


def derive_bounded_geometry(case,portal):
    base=reference_closed_link_case()
    if case!=base:
        raise ValueError('Exact authored closed-link geometry case required; no source/result/approval injection')
    supported={'rawSpan':2960.,'rawSpring':2250.,'rawRise':600.,'rawCrown':2850.,'rawRadius':2125.333333333333,'centreZ':724.666666666667,'ring':215.,'finishedAxial':775.}
    if any(abs(portal.get(k,math.inf)-v)>1e-8 for k,v in supported.items()) or portal['piers']['westEW']!=[4307.5,4520] or portal['piers']['eastEW']!=[7480,7692.5]:
        raise ValueError('Portal geometry outside this explicit rejected-layout comparison')
    bars=refined_main_bars(case,portal,3920.);components=local_component_checks(case)
    audit=lap_bend_audit(case)
    old=copy.deepcopy(case);old['barCase']=reference_cage_case();old['contactLapPackCentreSeparationMm']=12.
    controls=lap_bend_audit(old)
    main_paths=[{**row,'pointsMm':[p for p in row['pointsMm'] if p[0]<=5000]} for row in bars['arch']]
    main_paths.extend(row for row in bars['frame'] if '/west/' in row['id'])
    trials=[]
    for z in (2250.,2300.,2350.,2400.,2450.,2500.,2550.):
        for name,right in (('fixed-post',4470.5),('maximum-cover-bounded-horizontal-union',joint_hoop_right(z,portal))):
            left=4357.;wire=closed_wire((right-left)/2,95.5,case)
            points=transform_wire(wire,[(right+left)/2,0,z],[1,0,0],[0,1,0],[0,0,1])
            trials.append({'type':name,'stationZMm':z,'rightWireAxisXMm':right,
                'clearance':main_to_wire_clearance(points,main_paths,case),
                'proposedAssemblyGeometryAccepted':False})
    return {'schema':'str-continuous-rc-closed-link-geometry/1','case':case,
        'correctedBarSpine':bars,'courtBarSpine':refined_main_bars(case,portal,3820.),
        'lapBendAudit':audit,'rejectedOldLapAudit':controls,
        'lapGeometryPasses':all(row['radiusScreenPasses'] for row in audit),
        'oldLapGeometryRejected':any(not row['radiusScreenPasses'] for row in controls),
        'contactLapPackMinimumSurfaceClearMm':case['contactLapPackCentreSeparationMm']-case['mainRibEnvelopeMm']-2*case['contactPackRelativeToleranceMm'],
        'closedLinkComponents':components,'allLocalClosedLinkComponentsPass':all(row['componentGeometryPasses'] for row in components),
        'proposedBarrierAxes':proposed_barrier_axes(case,portal),'source69FaceBarrierCompatible':False,
        'postArchJointTrials':trials,'completeJointLinkGeometryProvided':False,
        'completeCageFabricationGeometryRejected':True,'assemblyAssessment':'REJECTED fabricated joint tie assembly',
        'stationTrialScope':'The seven explicit stations are trial layouts, not an exhaustive impossibility proof. Removing their clashing links does not provide a compliant station schedule.',
        'maximumTrialAsBuiltGapMm':max(b-a for a,b in zip(sorted(row['stationZMm'] for row in trials if row['type']=='fixed-post' and row['clearance']['adverseSurfaceLowerBoundMm']>=0),sorted(row['stationZMm'] for row in trials if row['type']=='fixed-post' and row['clearance']['adverseSurfaceLowerBoundMm']>=0)[1:]))+2*case['linkStationToleranceMm'],
        'specificRemainingGeometry':'Fixed and maximum-cover horizontal rectangular joint ties intersect actual arch legs. A whole-joint splayed or oblique enclosure has not been produced. No fullcage or100mm joint-spacing pass is inferred from isolated closed-link components.',
        'jointPanelStrengthAccepted':False,'capGridForceTransferAccepted':False,
        'sourceCompleteLoadStrengthAccepted':False,'installedOrSelectedStructure':False}
