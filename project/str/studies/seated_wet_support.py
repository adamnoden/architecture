"""Seated wet-wall beam on finite RC receivers, in the current-house assembly.

This compares an actual gravity support. Finite normal contact carries no
horizontal force or tension. Four-L/floor lateral duties and all physical cage,
base/joint, bearing material and durability acceptance remain outstanding.
"""
import copy
import math
from finite_mapped_frame import mapped_frame_member,node_trace,combine,mapped_load
from joined_successor_kernel import rectangle_section,rectangle_contact_quadrature
from rc_floor_house_loads import consistent_member_point_load,_consistent_line,_add,_family_wrench
from vertical_rc_floor import grid_member_geometry,inside,intersect
from foundation_solid_weight import subtract_box


def reference_support(h):
    source=h['structuralChanges']['newWetWallBeam'];south=source['southReceiverCore'];north=source['northReceiverCore']
    return {'beamWidthMm':250.,'beamDepthMm':350.,'beamAxisXMm':source['axisX'],
        'beamSouthEndYMm':next(w['structuralCore'][0] for w in h['groundWalls'] if w['id']=='rear-west'),'beamNorthEndYMm':north[1]+north[3],'beamTopZMm':3370.,
        'receiverRectanglesXYMm':[[p[0],p[1],p[0]+p[2],p[1]+p[3]] for p in (south,north)],
        'padCentreOffsetsYMm':[0.,0.],'padWidthMm':220.,'padLengthMm':100.,'padThicknessMm':10.,'combinedRelativePlacementToleranceMm':10.,
        'bearingQuadratureOrder':4,'jointNormalComplianceMmPerMPa':.1,'padUnitWeightKNPerM3':78.5,'concreteUnitWeightKNPerM3':25.,'maxBeamPitchMm':500.,
        'scope':'unselected-finite-gravity-support-no-friction-or-moment-frame-credit'}


def _rectangle_subtract(row,removed):
    a,b,c,d=row['rectangleXYMm'];parts=[[a,b,0,c,d,1]]
    for r in removed:parts=[p for box in parts for p in subtract_box(box,[r[0],r[1],0,r[2],r[3],1])]
    return [{**row,'id':row['id']+'/wet-union/'+str(i),'rectangleXYMm':[p[0],p[1],p[3],p[4]]} for i,p in enumerate(parts)]


def replacement_cores(cores,setting,model=None):
    """Explicit post bodies replace old scalar wet RC and overlapping masonry."""
    removed=setting['receiverRectanglesXYMm'];result=[]
    for row in cores:
        if row['sourceWallId'] in ('wet-south','wet-north'):continue
        result.extend(_rectangle_subtract(row,removed) if row['materialKind']=='source-core-material-unqualified' else [row])
    if model is not None:
        removed_boxes=[]
        for row in cores:
            if row['materialKind']!='source-core-material-unqualified':continue
            for r in removed:
                overlap=intersect(row['rectangleXYMm'],r)
                if overlap is not None:removed_boxes.append({'sourceCoreId':row['id'],'boxXYZMm':[*overlap[:2],-180.,*overlap[2:],3170.]})
        model['seatedWetSupport']['removedSourceMasonryTerritory']=removed_boxes
    return result


def _grid_point_maps(model,geometry,point):
    """All six displacement traces on a real contained finite grid member."""
    choices=[]
    for name,row in geometry.items():
        p,q=row['physicalStartMm'],row['physicalEndMm'];axis=0 if p[0]!=q[0] else 1;other=1-axis
        if min(p[axis],q[axis])-1e-7<=point[axis]<=max(p[axis],q[axis])+1e-7 and abs(point[other]-p[other])<=row['widthMm']/2+1e-7:
            choices.append((abs(point[other]-p[other]),name,row))
    if not choices:raise ValueError('Actual wet receiver centroid lacks finite ground beam path')
    _,name,row=min(choices,key=lambda r:(r[0],r[1]));p=row['physicalStartMm'];q=row['physicalEndMm'];axis=0 if p[0]!=q[0] else 1
    metadata={**row,'depthMm':row['widthMm'],'breadthMm':row['heightMm'],'yAxisGlobal':[0,0,1]}
    context={'model':model['model'],'request':{'frameLaw':model['request']['gridLaw']}}
    maps=[]
    for coordinate in range(6):
        vector=consistent_member_point_load(context,metadata,point,[1. if j==coordinate else 0 for j in range(3)],[1. if j+3==coordinate else 0 for j in range(3)])
        maps.append([(node,vector[6*i:6*i+6]) for i,node in enumerate((row['a'],row['b']))])
    return maps,name,row['topZMm']


def _pad_fit(setting,beam_rectangle,post_rectangle,centre):
    half=[setting['padWidthMm']/2,setting['padLengthMm']/2];tol=setting['combinedRelativePlacementToleranceMm']
    pad=[centre[0]-half[0],centre[1]-half[1],centre[0]+half[0],centre[1]+half[1]]
    envelope=[pad[0]-tol,pad[1]-tol,pad[2]+tol,pad[3]+tol]
    margins={}
    for name,r in [('beam',beam_rectangle),('post',post_rectangle)]:
        values=[envelope[0]-r[0],envelope[1]-r[1],r[2]-envelope[2],r[3]-envelope[3]]
        if min(values)<-1e-7:raise ValueError('Complete combined-tolerance wet pad envelope leaves '+name)
        margins[name]=values
    return pad,{'nominalRectangleXYMm':pad,'combinedToleranceEnvelopeXYMm':envelope,'remainingMarginsMm':margins,'toleranceOwnership':'One combined relative pad/member-placement bound; independent10+10mm errors are not admitted.'}


def build_support(model,setting,h,required_stations=()):
    """Insert actual members before both physical floor operators are built."""
    expected=reference_support(h)
    if not isinstance(setting,dict) or set(setting)!=set(expected) or setting['scope']!=expected['scope']:raise ValueError('Exact explicit seated wet-support controls required')
    for key,value in setting.items():
        if key not in ('scope','receiverRectanglesXYMm','padCentreOffsetsYMm') and (type(value) not in (int,float) or not math.isfinite(value) or value<=0):raise ValueError('Positive finite wet-support input required: '+key)
    offsets=setting['padCentreOffsetsYMm']
    if not isinstance(offsets,list) or len(offsets)!=2 or any(type(v) not in (int,float) or not math.isfinite(v) for v in offsets):raise ValueError('Both actual pad offsets from source post axes are required')
    for key,low,high in [('maxBeamPitchMm',250,1000),('jointNormalComplianceMmPerMPa',.001,10),('padThicknessMm',5,20),('padUnitWeightKNPerM3',1,90)]:
        if not low<=setting[key]<=high:raise ValueError('Wet support outside bounded explicit input domain: '+key)
    if setting['receiverRectanglesXYMm']!=expected['receiverRectanglesXYMm'] or setting['beamAxisXMm']!=expected['beamAxisXMm'] or setting['beamTopZMm']!=3370.:raise ValueError('Only actual original-axis/source receiver geometry and RC200 datum supported')
    if not 200<=setting['beamWidthMm']<=260 or not 300<=setting['beamDepthMm']<=400 or not 18<=setting['concreteUnitWeightKNPerM3']<=30 or not 0<=setting['combinedRelativePlacementToleranceMm']<=20:raise ValueError('Wet support outside bounded explicit comparison domain')
    before_g=_family_wrench(model,model['families']['physical-G'])
    if type(setting['bearingQuadratureOrder']) is not int or setting['bearingQuadratureOrder'] not in (2,4,8):raise ValueError('Explicit wet-bearing quadrature2/4/8 required')
    if setting['beamNorthEndYMm']!=expected['beamNorthEndYMm']:raise ValueError('Actual north beam end must retain current core/weather boundary; no unsupported extension')
    frame=model['model'];x=setting['beamAxisXMm'];width=setting['beamWidthMm'];depth=setting['beamDepthMm'];lo=setting['beamSouthEndYMm'];hi=setting['beamNorthEndYMm'];top=setting['beamTopZMm'];z=top-depth/2
    rectangle=[x-width/2,lo,x+width/2,hi]
    stair=h['stair'];stair=[stair[0],stair[1],stair[0]+stair[2],stair[1]+stair[3]]
    if intersect(rectangle,stair):raise ValueError('Actual seated wet beam intersects physical stair aperture')
    supports=[[(r[0]+r[2])/2,(r[1]+r[3])/2] for r in setting['receiverRectanglesXYMm']]
    if not lo<=supports[0][1]<supports[1][1]<=hi:raise ValueError('Actual support axes must lie in physical wet beam')
    pad_centres=[[p[0],p[1]+offset] for p,offset in zip(supports,offsets)]
    axes={lo,hi,*[p[1] for p in supports],*[p[1] for p in pad_centres]}
    if len(required_stations)>256 or any(type(u) not in (int,float) or not math.isfinite(u) or not lo<=u<=hi for u in required_stations):raise ValueError('Bounded finite derived wet-beam attachment stations required')
    for u in required_stations:
        if not any(abs(u-v)<=1e-7 for v in axes):axes.add(u)
    for a,b in zip(sorted(axes),sorted(axes)[1:]):axes.update(a+(b-a)*i/max(1,math.ceil((b-a)/setting['maxBeamPitchMm'])) for i in range(1,max(1,math.ceil((b-a)/setting['maxBeamPitchMm']))))
    stations=[{'u':u,'node':frame.node('WET-SUPPORT/beam/'+str(u),[x,u,z])} for u in sorted(axes)];names=[];density=setting['concreteUnitWeightKNPerM3'];g=model['families']['physical-G'];law=model['request']['frameLaw']
    for i,(a,b) in enumerate(zip(stations,stations[1:])):
        name='WET-SUPPORT/beam/'+str(i);names.append(name)
        frame.member(name,a['node'],b['node'],rectangle_section(depth,width),law,y_axis=[1,0,0])
        model['members'][name]={'a':a['node'],'b':b['node'],'physicalStartMm':list(frame.nodes[a['node']]),'physicalEndMm':list(frame.nodes[b['node']]),'depthMm':depth,'breadthMm':width,'yAxisGlobal':[1,0,0],'kind':'seated-wet-beam'}
        _consistent_line(model,g,'physical-G',name,model['members'][name],0,b['u']-a['u'],[0,0,-width*depth*density/1e9])
    geometry=grid_member_geometry(model);posts=[];pads=[]
    for index,(centre,r) in enumerate(zip(supports,setting['receiverRectanglesXYMm'])):
        pad_centre=pad_centres[index];pad,fit=_pad_fit(setting,rectangle,r,pad_centre);posttop=top-depth-setting['padThicknessMm'];base_maps,grid_name,basez=_grid_point_maps(model,geometry,[*centre,-180.])
        if abs(basez+180)>1e-7:raise ValueError('Wet post actual grid top has changed; explicit vertical datum update required')
        # The entire concrete footprint must have actual finite grid material,
        # including narrow edge strips. Centre interpolation alone earns none.
        from lower_core_bodies import partition_free_body_receivers,ground_receiver_footprints
        coverage=partition_free_body_receivers([{'boxXYZMm':[r[0],r[1],0,r[2],r[3],1]}],ground_receiver_footprints(model,geometry))
        if any(not row['supported'] for row in coverage):raise ValueError('Wet post full footprint lacks actual finite grid/cap support')
        node=frame.node('WET-SUPPORT/post-top/'+str(index),[*centre,posttop]);length=posttop-basez
        member=mapped_frame_member(frame,'WET-SUPPORT/post/'+str(index),[*centre,basez],[*centre,posttop],rectangle_section(r[3]-r[1],r[2]-r[0]),law,base_maps+node_trace(node),[1,0,0])
        weight=(r[2]-r[0])*(r[3]-r[1])*length*density/1e9;vector=[0,0,-weight/2,0,0,0]*2;mapped_load(g,member,vector)
        padweight=(pad[2]-pad[0])*(pad[3]-pad[1])*setting['padThicknessMm']*setting['padUnitWeightKNPerM3']/1e9;_add(g,node,[0,0,-padweight,-padweight*offsets[index],0,0])
        station=next(s for s in stations if s['u']==pad_centre[1]);beamnode=station['node']
        for sample,(px,py,area) in enumerate(bearing_quadrature(pad,setting['bearingQuadratureOrder'])):
            name='WET-SUPPORT/contact/'+str(index)+'/'+str(sample);point=[px,py,top-depth]
            stiffness=area/setting['jointNormalComplianceMmPerMPa']/1000
            frame.spring(name,beamnode,node,point,[0,0,1],stiffness,'compression')
            pads.append({'id':name,'pointXYZMm':point,'areaMm2':area,'stiffnessKNPerMm':stiffness,'receiverIndex':index})
        posts.append({'id':member['id'],'node':node,'rectangleXYMm':r,'physicalBottomZMm':basez,'physicalTopZMm':posttop,'physicalGKN':weight,'sourceGridMemberId':grid_name,'fullFootprintGroundCoverage':coverage,'consistentEquivalentGKN_KNmm':vector,'padPhysicalGKN':padweight,'padFit':fit,'padCentreXYMm':pad_centre,'padEccentricityYMm':offsets[index]})
    receiver={'id':'WET-SUPPORT/beam','axis':1,'rectangleXYMm':rectangle,'stations':stations,'memberNames':names,'centroidZMm':z,'depthMm':depth}
    old_floor=model['joinedFloor']['floor'];old_floor['omissionsXYMm'].append(list(rectangle))
    membrane_stations=[]
    for station in stations:
        identifier='RC-FLOOR/'+station['node'];membrane_stations.append({'id':identifier,'u':station['u']})
        old_floor['ports'].append({'id':identifier,'originXYMm':[x,station['u']],'rectangles':[],'node':station['node']})
    shear=law['elasticModulusMPa']/(2*(1+law['poissonRatio']))
    old_floor['finiteBeamBoundaryReceivers'].append({'id':receiver['id'],'axis':1,'datum':x,'width':width,'lo':lo,'hi':hi,'stations':membrane_stations,
        'shearPhi':[law['elasticModulusMPa']*law['flexuralFactor']*width**2/(shear*law['shearAreaFactor']*(b['u']-a['u'])**2) for a,b in zip(stations,stations[1:])]})
    model['seatedWetSupport']={'settings':copy.deepcopy(setting),'receiver':receiver,'posts':posts,'contactFibres':pads,
        'beamPhysicalGKN':width*depth*(hi-lo)*density/1e9,'physicalPostAxesYMm':[p[1] for p in supports],'physicalBearingAxesYMm':[p[1] for p in pad_centres],'northLoadedEndYMm':hi,
        'momentFixityAtBearingsCredited':False,'frictionOrHorizontalBearingRestraintCredited':False,'physicalAcceptance':False}
    expected_g=[0.]*6
    def origin(weight,point):
        expected_g[2]-=weight;expected_g[3]-=weight*point[1]/1000;expected_g[4]+=weight*point[0]/1000
    origin(model['seatedWetSupport']['beamPhysicalGKN'],[x,(lo+hi)/2])
    recesses=[]
    for post in posts:
        r=post['rectangleXYMm'];centre=[(r[0]+r[2])/2,(r[1]+r[3])/2];origin(post['physicalGKN'],centre);origin(post['padPhysicalGKN'],post['padCentreXYMm'])
        boxes=[[r[0],r[1],post['physicalTopZMm'],r[2],r[3],3170.]]
        pad=post['padFit']['nominalRectangleXYMm']
        for solid in ([pad[0],pad[1],posttop,pad[2],pad[3],top-depth],[rectangle[0],rectangle[1],top-depth,rectangle[2],rectangle[3],top]):
            boxes=[piece for box in boxes for piece in subtract_box(box,solid)]
        recesses.extend(boxes)
    after_g=_family_wrench(model,g);residual=[b-a-e for a,b,e in zip(before_g,after_g,expected_g)]
    if max(abs(v) for v in residual)>1e-6:raise ValueError('Actual wet beam/posts/pads lose independent body G or first moments')
    model['seatedWetSupport'].update(addedMaterialWrenchKN_KNm=expected_g,sourceMaterialWrenchResidualKN_KNm=residual,
        pierHeadRecessVoidBoxesXYZMm=recesses,pierHeadRecessClosureAccepted=False,
        rearDoorClearanceMm=h['groundWalls'][next(i for i,w in enumerate(h['groundWalls']) if w['id']=='rear-west')]['holes'][0][0]-(max(rectangle[2],max(r[2] for r in setting['receiverRectanglesXYMm']))+27.),
        northWeatherBoundaryYMm=setting['receiverRectanglesXYMm'][1][3],weatherBoundaryIntersection=hi>=setting['receiverRectanglesXYMm'][1][3],
        closureScope='Exposed seated piers and explicit empty head recess. No masonry/infill G or stiffness is invented. Removable independent finish/thermal/air/weather closure with seams remains unselected; it must add no structural bearing or retention.')
    return [receiver]


def attachment_station_audit(model):
    """Every actual plate/membrane trace must meet a real beam section node.

    Otherwise force-only work maps can give the correct coupled response but
    omit the physical interior interaction origins from beam cut recovery.
    This plans a shared discretisation; it adds no physical support or law.
    """
    receiver=model['seatedWetSupport']['receiver'];r=receiver['rectangleXYMm']
    stations=[s['u'] for s in receiver['stations']]
    vertical=sorted({p for cell in model['verticalFloor']['cells'] for p in (cell[1],cell[3]) if r[1]<=p<=r[3]})
    membrane=[p for p in model['joinedFloor']['floor']['coordinateColumns'][1] if r[1]<=p<=r[3]]
    actual=sorted(set(vertical+membrane));missing=[p for p in actual if min(abs(p-u) for u in stations)>1e-7]
    return {'actualVerticalCoordinatesYMm':vertical,'actualMembraneCoordinatesYMm':membrane,
        'actualBeamSectionNodesYMm':stations,'missingAttachmentCoordinatesYMm':missing,
        'maximumAttachmentToNodeDistanceMm':max((min(abs(p-u) for u in stations) for p in actual),default=0.),
        'allPlateAttachmentsAtRealBeamNodes':not missing,
        'scope':'All actual coordinate columns crossing the beam span, including unused columns conservatively. Each applied plate trace is therefore nodal in the along-beam direction; rigid cross-section offsets and declared bearing-plane idealisations remain explicit.'}


def route_free_patch(model,rectangle,pressure,target):
    data=model.get('seatedWetSupport')
    if data is None:return None
    receiver=data['receiver'];r=receiver['rectangleXYMm'];a,b,c,d=rectangle
    if not r[0]<=a<c<=r[2] or not r[1]<=b<d<=r[3]:return None
    q=(c-a)*pressure;cuts=sorted({b,d,*[s['u'] for s in receiver['stations'] if b<s['u']<d]});records=[]
    for lo,hi in zip(cuts,cuts[1:]):
        middle=(lo+hi)/2;i=next(i for i,(u,v) in enumerate(zip(receiver['stations'],receiver['stations'][1:])) if u['u']<=middle<=v['u'])
        name=receiver['memberNames'][i];member=model['members'][name];start=member['physicalStartMm']
        _consistent_line(model,target,'physical-G',name,member,lo-start[1],hi-start[1],[0,0,-q],[0,((a+c)/2-start[0])*q,0])
        records.append({'memberId':name,'intervalYMm':[lo,hi],'lineDownKNPerMm':q,'normalOffsetMm':(a+c)/2-start[0]})
    return {'physicalGKN':q*(d-b),'distributedLoads':records}


def finish_support(model,raw,g_factor):
    from finite_mapped_frame import recover_mapped_member
    result=copy.deepcopy(model['seatedWetSupport']);states={r['id']:r for r in raw['springs']}
    for contact in result['contactFibres']:
        state=states[contact['id']];contact.update(active=state['active'],relativeDisplacementMm=state['relativeMm'],normalCompressionKN=-state['forceKN'],normalPressureMPa=-state['forceKN']*1000/contact['areaMm2'])
        if contact['normalCompressionKN']<-1e-7:raise ValueError('Wet bearing supplied fictitious tension')
    for index,post in enumerate(result['posts']):
        beamnode=next(s['node'] for s in model['seatedWetSupport']['receiver']['stations'] if s['u']==post['padCentreXYMm'][1])
        ub=raw['displacements'][beamnode];up=raw['displacements'][post['node']];pb=model['model'].nodes[beamnode];pp=model['model'].nodes[post['node']]
        plane=[ub[2]-up[2]-ub[3]*pb[1]+ub[4]*pb[0]+up[3]*pp[1]-up[4]*pp[0],-ub[4]+up[4],ub[3]-up[3]]
        exact=exact_bearing_field(post['padFit']['nominalRectangleXYMm'],plane,result['settings']['jointNormalComplianceMmPerMPa'])
        numerical=[c for c in result['contactFibres'] if c['receiverIndex']==index]
        exact['quadratureForceResidualKN']=sum(c['normalCompressionKN'] for c in numerical)-exact['normalCompressionKN']
        exact['quadratureFirstMomentResidualKNmm']=[sum(c['normalCompressionKN']*c['pointXYZMm'][j] for c in numerical)-exact[k] for j,k in ((0,'compressionFirstMomentXKNmm'),(1,'compressionFirstMomentYKNmm'))]
        post['exactDeclaredNormalField']=exact
        post['recovery']=recover_mapped_member(model['model'].mappedMembers[post['id']],raw['displacements'],[g_factor*v for v in post['consistentEquivalentGKN_KNmm']])
    result.update(candidateAccepted=False,beamCageAccepted=False,columnCageAccepted=False,padMaterialAndRotationAccepted=False,localGridCapJointAccepted=False,
        scope='Actual finite frame/post/base work and finite quadrature normal bearing comparison. Contact quadrature convergence, physical pad distribution/material, RC cages/development, shear/torsion/deflection/cracks, local base/joints, moisture and installation remain unqualified.')
    return result


def add_live_load(model,characteristic_kpa):
    data=model['seatedWetSupport'];receiver=data['receiver'];r=receiver['rectangleXYMm'];loads={};factor=1.5
    if type(characteristic_kpa) not in (int,float) or not math.isfinite(characteristic_kpa) or not 0<=characteristic_kpa<=5:raise ValueError('Actual wet-beam live pressure0..5kPa required')
    q=factor*characteristic_kpa*(r[2]-r[0])/1e6
    for name in receiver['memberNames']:
        member=model['members'][name];length=math.dist(member['physicalStartMm'],member['physicalEndMm'])
        if q:_consistent_line(model,loads,'wet-support-Q',name,member,0,length,[0,0,-q])
    model['families']['wet-support-Q']=loads
    area=(r[2]-r[0])*(r[3]-r[1])/1e6;expected=[0,0,-factor*characteristic_kpa*area,-factor*characteristic_kpa*area*(r[1]+r[3])/2000,factor*characteristic_kpa*area*(r[0]+r[2])/2000,0]
    residual=[a-b for a,b in zip(_family_wrench(model,loads),expected)]
    if max(abs(v) for v in residual)>1e-8:raise ValueError('Wet-beam live load loses actual occupied strip force/first moments')
    data['liveLoad']={'characteristicKPa':characteristic_kpa,'factor':factor,'actualBeamTopAreaM2':area,'sourceWrenchKN_KNm':expected,'wrenchResidualKN_KNm':residual,'physicalMassAddedKN':0.,'scope':'Independent uniform live pressure on actual beam-top footprint replacing the known RC200 plate strip, in addition to net remaining plate Q. No withheld wet territory or gross budget is credited.'}


def bearing_quadrature(rectangle,order):
    import numpy as np
    if type(order) is not int or order not in (2,4,8):raise ValueError('Explicit wet-bearing quadrature2/4/8 required')
    a,b,c,d=rectangle
    if not all(math.isfinite(v) for v in rectangle) or c<=a or d<=b:raise ValueError('Actual positive bearing rectangle required')
    coordinates,weights=np.polynomial.legendre.leggauss(order)
    return [((a+c)/2+float(x)*(c-a)/2,(b+d)/2+float(y)*(d-b)/2,float(wx*wy)*(c-a)*(d-b)/4) for x,wx in zip(coordinates,weights) for y,wy in zip(coordinates,weights)]


def exact_bearing_field(rectangle,relative_plane,joint_compliance):
    """Integrate the positive compression part of a linear relative-w plane.

    Half-plane clipping and degree-two triangle quadrature are exact for force
    and first moments of this declared rigid-plane/Winkler comparison. This
    audits finite contact quadrature; it supplies no physical pad material.
    """
    a,b,c,d=rectangle;p0,px,py=relative_plane
    if any(not math.isfinite(v) for v in [*rectangle,*relative_plane,joint_compliance]) or c<=a or d<=b or joint_compliance<=0:raise ValueError('Finite positive actual bearing geometry/law required')
    polygon=[[a,b],[c,b],[c,d],[a,d]]
    def relative(p):return p0+px*p[0]+py*p[1]
    clipped=[]
    for left,right in zip(polygon,polygon[1:]+polygon[:1]):
        u,v=relative(left),relative(right)
        if u<=0:clipped.append(left)
        if (u<0<v) or (v<0<u):
            t=u/(u-v);clipped.append([x+t*(y-x) for x,y in zip(left,right)])
    force=mx=my=area=0.
    if len(clipped)>=3:
        o=clipped[0]
        for u,v in zip(clipped[1:-1],clipped[2:]):
            tri=abs((u[0]-o[0])*(v[1]-o[1])-(v[0]-o[0])*(u[1]-o[1]))/2;area+=tri
            for weights in ((2/3,1/6,1/6),(1/6,2/3,1/6),(1/6,1/6,2/3)):
                x,y=[sum(w*p[j] for w,p in zip(weights,(o,u,v))) for j in (0,1)];f=max(0.,-relative([x,y]))/joint_compliance*tri/3000
                force+=f;mx+=f*x;my+=f*y
    maximum=max(0.,max(-relative(p)/joint_compliance for p in polygon))
    return {'compressedPolygonXYMm':clipped,'compressedAreaMm2':area,'normalCompressionKN':force,
        'compressionFirstMomentXKNmm':mx,'compressionFirstMomentYKNmm':my,'maximumPlanePressureMPa':maximum,
        'scope':'Exact positive-part linear normal field on the declared rigid beam/post planes; local pad flexibility/material and concrete pressure distribution remain unqualified.'}

