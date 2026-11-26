"""Source-derived rear bearing and Living comparison; no structural acceptance.

The optional fourth input is the actual IAS rearRenewal.firstReleaseInterface.
No filesystem, historical response, handler capability or aesthetic acceptance
is hidden in the geometry calculation.
"""
import copy
import hashlib
import html
import json
import math


def choices_defaults():
    return dict(mode='direct-masonry-short-rc-lintel',openingYMm=[9100.,10950.],
        lintelWidthMm=200.,lintelDepthMm=300.,bearingLengthMm=200.,jointThicknessMm=10.,
        jointNormalComplianceMmPerMPa=.1,masonryUnitWeightKNPerM3=20.,
        concreteUnitWeightKNPerM3=25.,jointUnitWeightKNPerM3=20.,maxBeamPitchMm=500.,
        bearingQuadratureOrder=4,execution='deferred')


def admit_choices(value):
    reference=choices_defaults()
    if not isinstance(value,dict) or set(value)!=set(reference) or value['mode']!=reference['mode'] or value['execution'] not in ('deferred','compute'):
        raise ValueError('Exact authored rear bearing comparison choices required')
    r=value['openingYMm']
    if not isinstance(r,(list,tuple)) or len(r)!=2 or any(type(v) not in (int,float) or not math.isfinite(v) for v in r) or r[1]<=r[0]:
        raise ValueError('Actual ordered finite raw opening required')
    domains={'lintelWidthMm':(140,300),'lintelDepthMm':(200,400),'bearingLengthMm':(150,350),
        'jointThicknessMm':(5,20),'jointNormalComplianceMmPerMPa':(.001,10),
        'concreteUnitWeightKNPerM3':(18,30),'jointUnitWeightKNPerM3':(15,25),'maxBeamPitchMm':(250,1000)}
    for k,(lo,hi) in domains.items():
        if type(value[k]) not in (int,float) or not math.isfinite(value[k]) or not lo<=value[k]<=hi:raise ValueError('Unsupported rear bearing choice: '+k)
    if value['masonryUnitWeightKNPerM3']!=20. or type(value['masonryUnitWeightKNPerM3']) not in (int,float):
        raise ValueError('Rear masonry density must match the existing actual20kN/m3 house body law')
    if type(value['bearingQuadratureOrder']) is not int or value['bearingQuadratureOrder'] not in (2,4,8,16,32):raise ValueError('Explicit actual bearing quadrature required')
    return copy.deepcopy(value)


def _bounds(r):return [r[0],r[1],r[0]+r[2],r[1]+r[3]]
def _rect(r):return [[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]
def _pose(centre,size,angle):
    t=math.radians(angle);c,s=math.cos(t),math.sin(t)
    return [[centre[0]+a*c-b*s,centre[1]+a*s+b*c] for a,b in
        ((-size[0]/2,-size[1]/2),(size[0]/2,-size[1]/2),(size[0]/2,size[1]/2),(-size[0]/2,size[1]/2))]
def _dot(a,b):return sum(x*y for x,y in zip(a,b))
def _point_segment(p,a,b):
    d=[b[i]-a[i] for i in range(2)];den=_dot(d,d)
    u=max(0.,min(1.,_dot([p[i]-a[i] for i in range(2)],d)/den)) if den else 0.
    return math.dist(p,[a[i]+u*d[i] for i in range(2)])
def _polygon_gap(a,b):
    # Positive Euclidean separation; negative SAT penetration for collision.
    separated=False;penetration=math.inf
    for poly in (a,b):
        for p,q in zip(poly,poly[1:]+poly[:1]):
            normal=[p[1]-q[1],q[0]-p[0]];length=math.hypot(*normal)
            aa=[_dot(x,normal)/length for x in a];bb=[_dot(x,normal)/length for x in b]
            overlap=min(max(aa),max(bb))-max(min(aa),min(bb))
            if overlap<0:separated=True
            penetration=min(penetration,overlap)
    if not separated:return -penetration
    return min(_point_segment(p,x,y) for one,two in ((a,b),(b,a)) for p in one for x,y in zip(two,two[1:]+two[:1]))


def _sweep(stages,size,obstacles,room,samples=360):
    worst={'clearanceLowerBoundMm':math.inf};poses=[]
    for number,(a,b) in enumerate(zip(stages,stages[1:])):
        speed=math.dist(a[:2],b[:2])+math.hypot(*size)/2*abs(math.radians(b[2]-a[2]))
        allowance=speed/(2*samples)
        for i in range(samples):
            u=(i+.5)/samples;state=[x+(y-x)*u for x,y in zip(a,b)];poly=_pose(state[:2],size,state[2])
            roomgap=min(min(p[0]-room[0],room[2]-p[0],p[1]-room[1],room[3]-p[1]) for p in poly)
            checks=[('completeLivingRoom',roomgap),*[(name,_polygon_gap(poly,_rect(r))) for name,r in obstacles.items()]]
            name,gap=min(checks,key=lambda item:item[1]);bound=gap-allowance
            if bound<worst['clearanceLowerBoundMm']:worst=dict(clearanceLowerBoundMm=bound,governor=name,segment=number,pose=state,sampledClearanceMm=gap,motionErrorBoundMm=allowance)
        poses.append({'start':list(a),'end':list(b)})
    return dict(pass_=worst['clearanceLowerBoundMm']>0,segments=poses,samplesPerSegment=samples,
        continuousBound='Exact rectangle separation at interval midpoints minus maximum translation+corner-rotation displacement over half interval.',**worst)


def _coverage(rectangles,grid):
    receivers=[]
    for name,r in grid['girders'].items():
        a,b=r['extent'];d=r['datum'];half=r['width']/2
        receivers.append(([a,d-half,b,d+half] if r['axis']=='x' else [d-half,a,d+half,b],name))
    for h in grid['heads']:
        x,y=h['xy'];w,d=h['capXY'];receivers.append(([x-w/2,y-d/2,x+w/2,y+d/2],h['id']))
    missing=[]
    for r in rectangles:
        xx=sorted({r[0],r[2],*[v for p,_ in receivers for v in (p[0],p[2]) if r[0]<v<r[2]]})
        yy=sorted({r[1],r[3],*[v for p,_ in receivers for v in (p[1],p[3]) if r[1]<v<r[3]]})
        for a,c in zip(xx,xx[1:]):
            for b,d in zip(yy,yy[1:]):
                if not any(p[0]<=a and c<=p[2] and p[1]<=b and d<=p[3] for p,_ in receivers):missing.append([a,b,c,d])
    return {'completePhysicalFootprintCovered':not missing,'uncoveredRectanglesXYMm':missing}


def geometry(h,grid,choices,renewal=None,native_case=None):
    c=admit_choices(choices);upper=next(w for w in h['upperWalls'] if w['id']=='rear-wet-east')
    finish=h['finishRewind']['dry']['total'];stair=h['protectedRoute']['geometry']['groundStairEastWall']['finished'][0]
    width=upper['structuralCore'][1]-upper['structuralCore'][0];west=stair+finish;east=west+width;axis=(west+east)/2
    source=h['structuralChanges']['newWetWallBeam'];south=source['southReceiverCore'];north=source['northReceiverCore']
    lo=south[1];hi=north[1]+north[3];a,b=c['openingYMm'];bearing=c['bearingLengthMm'];start=a-bearing;end=b+bearing
    if not lo<start<a<b<end<hi:raise ValueError('Actual opening/bearings must leave two positive full-height masonry tails')
    top=h['sections']['firstFloorRC']['top'];soffit=h['sections']['firstFloorRC']['bottom'];base=h['sections']['groundSupport']['top']
    bottom=top-c['lintelDepthMm'];seat=bottom-c['jointThicknessMm'];lintel=[axis-c['lintelWidthMm']/2,start,axis+c['lintelWidthMm']/2,end]
    if not base<seat<bottom<=soffit or lintel[0]>upper['structuralCore'][0] or lintel[2]<upper['structuralCore'][1]:
        raise ValueError('Actual lintel must cover the complete source upper core and have a positive lower masonry seat')
    tails=[[west,lo,east,start],[west,end,east,hi]];bearings=[[west,start,east,a],[west,b,east,end]]
    finished=[[west-finish,lo,east+finish,a+finish],[west-finish,b-finish,east+finish,hi]]
    room=_bounds(h['rooms']['living']['bounds']);furniture=copy.deepcopy(h['groundFurniture'])
    selected={k:_bounds(v) for k,v in furniture.items() if min(v[0]+v[2],room[2])>max(v[0],room[0]) and min(v[1]+v[3],room[3])>max(v[1],room[1])}
    fixed={k:v for k,v in selected.items() if k!='family-sofa1900x750'}
    fixed.update({'newSouthFinishedPier':finished[0],'newNorthFinishedPier':finished[1]})
    family=furniture['family-sofa1900x750'];size=family[2:];centre=[family[0]+size[0]/2,family[1]+size[1]/2]
    # One explicit constructive layout derived from the Living north/right faces.
    turn=[room[2]-1055.5,room[3]-1345.5];park=[room[2]-830.5,turn[1]]
    stages=[[*centre,0.],[*turn,0.],[*turn,45.],[*park,90.],[park[0],park[1]-25.,90.]]
    route=_sweep(stages,size,fixed,room)
    parkpoly=_pose(stages[-1][:2],size,90.);parkrect=[min(p[0] for p in parkpoly),min(p[1] for p in parkpoly),max(p[0] for p in parkpoly),max(p[1] for p in parkpoly)]
    ordinary_checks={name:_polygon_gap(_rect(selected['family-sofa1900x750']),_rect(r)) for name,r in fixed.items()}
    for name,r in selected.items():
        ordinary_checks[name+'/room']=min(r[0]-room[0],room[2]-r[2],r[1]-room[1],room[3]-r[3])
        for number,pier in enumerate(finished):ordinary_checks[name+'/pier/'+str(number)]=_polygon_gap(_rect(r),_rect(pier))
    ordinary_pass=all(v>=0 for v in ordinary_checks.values())
    west_service=h['livingRadiatorMaintenance'];pull_y=family[1]-west_service['bodyRadius']-25.
    pull_path=[[p[0],pull_y] for p in west_service['pullingBodyCentrePath']];radius=west_service['bodyRadius']
    # A constant-Y straight body sweep is checked as the exact stadium, not a sofa bounding circle.
    pull_checks={}
    for name,r in [*fixed.items(),('family-sofa1900x750',selected['family-sofa1900x750'])]:
        if name=='reading-sofa1900x850':continue
        dx=max(r[0]-max(p[0] for p in pull_path),min(p[0] for p in pull_path)-r[2],0.)
        dy=max(r[1]-pull_y,pull_y-r[3],0.)
        pull_checks[name]=math.hypot(dx,dy)-radius
    old_park=[family[0],family[1]+650.,size[0],size[1]]
    old_gap=_polygon_gap(_rect(_bounds(old_park)),_rect(finished[1]))
    renewal_result={'state':'unsupported-missing-IAS-reference','pass':False,'referenceRequired':'rearRenewal.firstReleaseInterface'}
    if renewal is not None:
        platform=_bounds(renewal['workingPlatformRequiredPlan'])
        obstacles={**fixed,'family-sofa1900x750/renewal-park':parkrect}
        gaps={name:_polygon_gap(_rect(platform),_rect(r)) for name,r in obstacles.items()}
        renewal_result=dict(state='computed-unselected-plan-comparison',pass_=min(gaps.values())>0,
            platformPlan=copy.deepcopy(renewal['workingPlatformRequiredPlan']),platformGapsMm=gaps,
            sourceInterface=copy.deepcopy(renewal),obsoleteInterfaceFields=['fixedBeamFinishedWestFace','fixedBeamSoffit','actualReceiverSource','furnitureMaintenance'],
            newHeaderFinishedWestFaceMm=lintel[0]-finish,newStructuralLintelBottomZMm=bottom,
            actorEquipmentForceAndFirstReleaseAccepted=False)
        renewal_result['pass']=renewal_result.pop('pass_')
    coverage=_coverage(tails+bearings,grid)
    old_reference={'state':'unsupported-missing-executed-native-wetSupport','sourceHADWidthMm':source.get('beamWidth')}
    if native_case is not None:
        old=native_case.get('wetSupport')
        if not isinstance(old,dict):raise ValueError('Exact executed native wetSupport is required for matched old/new drawing')
        ox=old['beamAxisXMm'];ow=old['beamWidthMm'];old_rect=[ox-ow/2,old['beamSouthEndYMm'],ox+ow/2,old['beamNorthEndYMm']]
        old_reference=dict(state='bound-executed-native-input',settings=copy.deepcopy(old),lintelRectangleXYMm=old_rect,
            lintelTopZMm=old['beamTopZMm'],lintelBottomZMm=old['beamTopZMm']-old['beamDepthMm'],
            postRectanglesXYMm=copy.deepcopy(old['receiverRectanglesXYMm']),
            finishedPostRectanglesXYMm=[list(r[1]) for r in h['fixedObstacles']['GROUND'] if r[0] in ('wetBeamSouthReceiver','wetBeamNorthReceiver')],
            sourceHADWidthMm=source.get('beamWidth'),sourceHADWidthDescribesExecutedBeam=source.get('beamWidth')==ow)
    result=dict(schema='str-rear-direct-bearing-plan/1',choices=c,wallRectangleXYMm=[west,lo,east,hi],
        fullHeightTailRectanglesXYMm=tails,bearingRectanglesXYMm=bearings,lintelRectangleXYMm=lintel,
        finishedPierRectanglesXYMm=finished,axisXMm=axis,upperWallAxisXMm=upper['a'][0],upperCoreRectangleXMm=upper['structuralCore'],
        upperLowerCoreOverlapMm=max(0.,min(east,upper['structuralCore'][1])-max(west,upper['structuralCore'][0])),
        lintelTopZMm=top,lintelBottomZMm=bottom,masonryBearingTopZMm=seat,baseZMm=base,floorSoffitZMm=soffit,
        protectedStairFinishedXMm=stair,lowerCoreWestXMm=west,lowerFinishedWestXMm=west-finish,faceFinishMm=finish,
        rawOpeningYMm=[a,b],finishedOpeningYMm=[a+finish,b-finish],finishedClearWidthMm=b-a-2*finish,
        roomBoundsXYMm=room,ordinaryFurnitureXYMm=selected,ordinaryFurnitureChecksMm=ordinary_checks,
        stairRectangleXYMm=_bounds(h['stair']),
        familySofaRenewalRoute=route,familySofaRenewalParkXYMm=parkrect,familySofaRenewalPoses=stages,
        oldFamilyNorth650Park=dict(rectangleXYMm=_bounds(old_park),northPierSignedClearanceMm=old_gap,pass_=old_gap>=0),
        westSofaRenewal=dict(bodyCentrePath=pull_path,bodyRadiusMm=radius,bodyFixedGapsMm=pull_checks,
            bodyPass=min(pull_checks.values())>=25.-1e-9,sofaEastMoveMm=west_service['eastMove'],
            sofaBefore=west_service['sofaBefore'],sofaPark=west_service['sofaPark'],parkedSofaBGapMm=family[0]-(west_service['sofaPark'][0]+west_service['sofaPark'][2]),
            southJambRectangularBodyReserveMm=pull_y-radius-(a+finish),sourcePathYRevised=True),
        southCrossPassageMm=family[1]-(a+finish),rearSpoolRenewal=renewal_result,groundFootprintCoverage=coverage,
        oldSeatedReference=old_reference,removedSourceObstacleIds=['wetBeamSouthReceiver','wetBeamNorthReceiver'],
        old260RCPostsRemoved=True,upperWallOpeningsFacadeAndWetServicesChanged=False,
        sourceNormalBodyLaw='Actual saved bearingLaw owns normal body stiffness; no replacement modulus authored here.',
        planPass=ordinary_pass and route['pass_'] and min(pull_checks.values())>=25.-1e-9 and coverage['completePhysicalFootprintCovered'] and renewal_result['pass'],
        candidateAccepted=False,appearanceAccepted=False,physicalHandlingAccepted=False)
    result['sourceGeometryDigest']=hashlib.sha256(json.dumps({'choices':c,'upper':upper,'sourceBeam':source,'stair':h['protectedRoute']['geometry']['groundStairEastWall'],
        'room':h['rooms']['living'],'furniture':selected,'renewal':renewal,'nativeWetSupport':None if native_case is None else native_case['wetSupport']},sort_keys=True,separators=(',',':')).encode()).hexdigest()
    return result


def render_plan(g):
    room=g['roomBoundsXYMm'];scale=.14;out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1950" height="900" viewBox="0 0 1950 900"><metadata>{g["sourceGeometryDigest"]}</metadata><rect width="1950" height="900" fill="#f7f3e9"/><style>text{{font:16px sans-serif;fill:#333c37}}.title{{font:30px Georgia}}.panel{{font:23px Georgia}}.small{{font-size:13px}}</style><text x="40" y="50" class="title">The whole Living room · rear bearing and independent furniture renewal</text><text x="40" y="85">Same room, upper wall, openings and radiator positions. The temporary furniture state is restored after work.</text>']
    names={'reading-sofa1900x850':'A','family-sofa1900x750':'B','reading-side-table300':'T1','family-side-table300':'T2','rear-stack':'S','service-emitter-living-W':'R1','service-emitter-living-N2':'R2'}
    for column,title in enumerate(('Executed seated RC control','Direct bearing · ordinary room','Direct bearing · rear spool renewal')):
        ox=45+column*650;px=lambda x:ox+(x-room[0])*scale;py=lambda y:665-(y-room[1])*scale
        def rect(r,fill,stroke='#61685f',opacity=1.,dash=''):
            return f'<rect x="{px(r[0]):.2f}" y="{py(r[3]):.2f}" width="{(r[2]-r[0])*scale:.2f}" height="{(r[3]-r[1])*scale:.2f}" fill="{fill}" stroke="{stroke}" opacity="{opacity}" '+(f'stroke-dasharray="{dash}"' if dash else '')+'/>'
        out.extend([f'<text x="{ox}" y="160" class="panel">{title}</text>',rect(room,'#fffdf7')])
        stair=g['stairRectangleXYMm'];clipped=[stair[0],max(stair[1],g['wallRectangleXYMm'][1]),stair[2],stair[3]]
        if clipped[3]>clipped[1]:
            out.extend([rect(clipped,'#e1e1db'),f'<text x="{px(stair[0])+10:.2f}" y="{py(stair[3])+17:.2f}" class="small">Actual stair north end</text>'])
        for name,r in g['ordinaryFurnitureXYMm'].items():
            if column==2 and name=='family-sofa1900x750':continue
            out.append(rect(r,'#c5b69a' if 'sofa' in name else '#d8d8cd'))
            out.append(f'<text x="{px((r[0]+r[2])/2):.2f}" y="{py((r[1]+r[3])/2):.2f}" text-anchor="middle">{html.escape(names.get(name,name))}</text>')
        if column==0:
            old=g['oldSeatedReference']
            if old['state']=='bound-executed-native-input':
                for r in old['finishedPostRectanglesXYMm']:out.append(rect(_bounds(r),'#a9b7b6'))
                out.append(rect(old['lintelRectangleXYMm'],'none','#46636d',1.,'5 4'))
                label=f'{old["settings"]["beamWidthMm"]:g} × {old["settings"]["beamDepthMm"]:g} RC beam; original 260 mm posts'
            else:label='Old executed native geometry not supplied'
        else:
            for r in g['finishedPierRectanglesXYMm']:out.append(rect(r,'#b2bea6'))
            out.append(rect(g['lintelRectangleXYMm'],'none','#667a63',1.,'5 4'))
            label=f'{g["choices"]["lintelWidthMm"]:g} × {g["choices"]["lintelDepthMm"]:g} short lintel; {g["choices"]["bearingLengthMm"]:g} mm bearings'
            out.append(f'<text x="{px(g["wallRectangleXYMm"][2])+10:.2f}" y="{py(sum(g["finishedOpeningYMm"])/2):.2f}" class="small">{g["finishedClearWidthMm"]:g} clear</text>')
        if column==2:
            family=g['ordinaryFurnitureXYMm']['family-sofa1900x750'];size=[family[2]-family[0],family[3]-family[1]]
            for state in g['familySofaRenewalPoses'][1:-1]:
                points=' '.join(f'{px(x):.2f},{py(y):.2f}' for x,y in _pose(state[:2],size,state[2]))
                out.append(f'<polygon points="{points}" fill="none" stroke="#648396" opacity=".45" stroke-dasharray="4 4"/>')
            out.append(rect(g['familySofaRenewalParkXYMm'],'#a7c1d0','#506c7c',.8))
            r=g['familySofaRenewalParkXYMm'];out.append(f'<text x="{px((r[0]+r[2])/2):.2f}" y="{py((r[1]+r[3])/2):.2f}" text-anchor="middle">B parked</text>')
            renewal=g['rearSpoolRenewal']
            if 'platformPlan' in renewal:
                r=_bounds(renewal['platformPlan']);out.append(rect(r,'#dfbf80','#927348',.6))
                out.append(f'<text x="{px((r[0]+r[2])/2):.2f}" y="{py((r[1]+r[3])/2):.2f}" text-anchor="middle" class="small">IAS equipment field</text>')
        # The north end of the existing protected stair face is unchanged.
        x=px(g['protectedStairFinishedXMm']);y=py(room[1]);out.append(f'<path d="M{x:.2f},{y:.2f}v45" stroke="#855d4f" stroke-width="3"/><text x="{ox}" y="755" class="small">{html.escape(label)}</text>')
        if column==1:out.append(f'<text x="{ox}" y="780" class="small">South cross passage {g["southCrossPassageMm"]:g} mm · protected stair face retained</text>')
        if column==2:out.append(f'<text x="{ox}" y="780" class="small">Actual rectangle sweep: ≥{g["familySofaRenewalRoute"]["clearanceLowerBoundMm"]:.2f} mm continuous reserve</text>')
    out.append('<text x="40" y="830">A reading sofa · B family sofa · T side tables · S stack · R unchanged radiators · dashed head lines are overhead structural bodies.</text><text x="40" y="868">Unselected coordinated geometry. Furniture handling, actual equipment, construction, structural resistance and owner aesthetic acceptance remain unproved.</text></svg>')
    return ''.join(out)


def render_section(g):
    lo,hi=g['wallRectangleXYMm'][1::2];scale=.16
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1450" height="850" viewBox="0 0 1450 850"><metadata>{g["sourceGeometryDigest"]}</metadata><rect width="1450" height="850" fill="#f7f3e9"/><style>text{{font:17px sans-serif;fill:#333c37}}.title{{font:29px Georgia}}.panel{{font:22px Georgia}}</style><text x="35" y="45" class="title">Rear support · matched longitudinal sections</text>']
    for column in (0,1):
        ox=65+column*710;px=lambda y:ox+(y-lo)*scale;pz=lambda z:730-(z-g['baseZMm'])*.16
        def rect(a,b,c,d,fill):return f'<rect x="{px(a):.2f}" y="{pz(d):.2f}" width="{(c-a)*scale:.2f}" height="{(d-b)*.16:.2f}" fill="{fill}" stroke="#5c625d"/>'
        if column==0:
            old=g['oldSeatedReference'];out.append(f'<text x="{ox}" y="110" class="panel">Executed seated RC control</text>')
            if old['state']=='bound-executed-native-input':
                settings=old['settings'];bottom=old['lintelBottomZMm'];r=old['lintelRectangleXYMm']
                for pier in old['postRectanglesXYMm']:
                    out.append(rect(pier[1],g['baseZMm'],pier[3],bottom-settings['padThicknessMm'],'#b4c0c2'))
                    centre=(pier[1]+pier[3])/2;out.append(rect(centre-settings['padLengthMm']/2,bottom-settings['padThicknessMm'],centre+settings['padLengthMm']/2,bottom,'#b39d74'))
                out.append(rect(r[1],bottom,r[3],old['lintelTopZMm'],'#9daeb3'))
                label=f'RC underside {bottom:g} · original separate seated posts/pads'
            else:label='Executed native wetSupport reference missing'
        else:
            out.append(f'<text x="{ox}" y="110" class="panel">Direct masonry bearing</text>')
            for r in g['fullHeightTailRectanglesXYMm']:out.append(rect(r[1],g['baseZMm'],r[3],g['floorSoffitZMm'],'#bdc6b4'))
            for r in g['bearingRectanglesXYMm']:
                out.append(rect(r[1],g['baseZMm'],r[3],g['masonryBearingTopZMm'],'#bdc6b4'))
                out.append(rect(r[1],g['masonryBearingTopZMm'],r[3],g['lintelBottomZMm'],'#d8b675'))
            r=g['lintelRectangleXYMm'];out.append(rect(r[1],g['lintelBottomZMm'],r[3],g['lintelTopZMm'],'#a9b8b5'))
            label=f'RC underside {g["lintelBottomZMm"]:g} · masonry seat {g["masonryBearingTopZMm"]:g} · bedding {g["choices"]["jointThicknessMm"]:g}'
        out.append(f'<text x="{ox}" y="770">{html.escape(label)}</text>')
    out.append(f'<text x="35" y="810">Both derive from the same source floor top {g["lintelTopZMm"]:g}, soffit {g["floorSoffitZMm"]:g} and ground receiver {g["baseZMm"]:g}. Independent lightweight room finish is nonstructural.</text><text x="35" y="838">Comparison only · actual normal-body law, coupled house demands, cage and masonry bearing remain separate proof obligations.</text></svg>')
    return ''.join(out)
