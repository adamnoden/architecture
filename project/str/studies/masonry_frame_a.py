"""Actual straight-frame/separate masonry-ring successor of the native RC200 model.

The plate and source52 grid remain the existing solver. Tapered abutment slices
are openly discretised beam comparisons, not a concrete joint/cage qualification.
"""
import copy
import hashlib
import html
import json
import math
from pathlib import Path
import sys

from joined_successor_kernel import rectangle_section
from joined_successor_compatibility import _wrench_at
from rc_floor_house_loads import _add, _family_wrench, register_member_gravity
from vertical_rc_floor import load_vertical_rc_floor_source, reference_vertical_rc_floor_case, build_vertical_rc_floor, solve_vertical_rc_floor
from vertical_floor_views import draw_vertical_floor

METHOD='project/str/studies/masonry_frame_a.py'
EXTRA=('project/str/studies/foundation_solid_weight.py','project/str/studies/plate_bending_recovery.py','project/str/studies/court_corner_closure.py','project/str/studies/floor_reinforcement.py','project/str/studies/continuous_rc_cage.py')


def load_masonry_frame_a_source(root):
    root=Path(root);vertical=load_vertical_rc_floor_source(root)
    paths=[METHOD,*EXTRA,'project/str/studies/lower_core_bodies.py','project/str/studies/straight_frame_cage.py']
    from roof_floor_compatibility import load_roof_only_source
    roof=load_roof_only_source(root)
    return {'root':root,'vertical':vertical,'roof':roof,'identities':{**vertical['identities'],**roof['identities'],**{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}}}


def reference_masonry_frame_a_case(source):
    from floor_reinforcement import reference_floor_reinforcement_settings
    return {'schema':'str-masonry-frame-a-case/1','sourceSHA256':source['identities'],
        'verticalCase':reference_vertical_rc_floor_case(source['vertical']),
        'masonrySeatProjectionMm':180.,'masonryUnitWeightKNM3':20.,'abutmentSlices':12,
        'foundationWeight':{'unitWeightKNPerM3':25.,'gravityFactor':1.},'courtCornerClosure':None,
        'floorReinforcement':reference_floor_reinforcement_settings(),'lowerCoreBodies':None,'roofCoupling':None,'lowerLWeight':None,'straightFrameCage':None,
        'use':'unqualified-separate-masonry-and-straight-RC-frame'}


def geometry(case,portal,grid):
    projection=case['masonrySeatProjectionMm'];ri=portal['rawRadius'];ro=ri+portal['ring'];cz=portal['centreZ'];left=portal['piers']['westEW'][0];edge=portal['piers']['westEW'][1];inner=edge+projection
    theta=math.asin((6000-inner)/ri);spring=cz+ri*math.cos(theta);outer_x=6000-ro*math.sin(theta);outer_z=cz+ro*math.cos(theta)
    slope=(outer_z-spring)/(outer_x-inner);top=2600.;clip_x=inner+(top-spring)/slope
    if not -180<spring<outer_z<top or not edge<clip_x<inner<=4800:raise ValueError('Separate masonry abutment exceeds source finished opening or radial-seat domain')
    polygon=[[left,-180],[inner,-180],[inner,spring],[clip_x,top],[edge,top],[edge,3170],[left,3170]]
    area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(polygon,polygon[1:]+polygon[:1])))/2
    caps=[r for r in grid['heads'] if r['id'] in ('P25','P26','P28','P30')]
    if len(caps)!=4 or any(r['capXY']!=[600,600] or r['capZ'][-1]!=-180 for r in caps):raise ValueError('Exact source four cap bodies required; no invented bearing')
    if any(not r['xy'][0]-300<=x<=r['xy'][0]+300 for r in caps for x in ([left,inner] if r['xy'][0]<6000 else [12000-inner,12000-left])):raise ValueError('Abutment leaves actual named cap')
    return {'westPolygonXZMm':polygon,'innerSpringXZMm':[inner,spring],'outerSeatXZMm':[outer_x,outer_z],
        'seatAngleRad':theta,'seatTopXAt2600Mm':clip_x,'sectionAreaMm2':area,'fourRCPostUnionVolumeM3':4*area*290/1e9,
        'finishedWidthMm':2400,'finishedNormalEnvelopeMm':775,'localJambGlassMm':4800-inner-40,
        'sourceCurveCentreZMm':cz,'sourceInnerRadiusMm':ri,'sourceOuterRadiusMm':ro,
        'twoRadialCourseDepthsMm':[102.5,102.5],'radialMortarBedMm':10.,'normalWidthMm':215.,
        'sourceRCArchRemoved':True,'masonryCompositeActionCredited':False,'thermalAccepted':False}


def _ring_witness(geometry,density):
    theta=geometry['seatAngleRad'];ri=geometry['sourceInnerRadiusMm'];ro=geometry['sourceOuterRadiusMm'];normal=geometry['normalWidthMm'];rows=[]
    # Each radial course independently supplies its own three-hinge equilibrium.
    # The10mm mortar is a separately reported weight-only equilibrium trial.
    for index,(r0,r1) in enumerate(((ri,ri+102.5),(ri+112.5,ro))):
        half_area=(r1*r1-r0*r0)*theta/2
        weight=2*half_area*normal/1e9*density
        first=(r1**3-r0**3)/3*(1-math.cos(theta))
        mean=(r0+r1)/2;a=mean*math.sin(theta);rise=mean*(1-math.cos(theta))
        h=normal*density*(a*half_area-first)/rise/1e9
        v=weight/2;point_w=[6000-mean*math.sin(theta),geometry['sourceCurveCentreZMm']+mean*math.cos(theta)]
        rows.append({'id':'radial-course-'+str(index+1),'innerRadiusMm':r0,'outerRadiusMm':r1,'physicalGKN':weight,
            'seatVerticalKN':v,'seatHorizontalKN':h,'westSeatXZMm':point_w,
            'seatCompressionKN':h*math.cos(theta)+v*math.sin(theta),'seatTangentialKN':-h*math.sin(theta)+v*math.cos(theta),
            'strengthAccepted':False,'movementCompatibleArchAccepted':False})
    mortar_area=((ri+112.5)**2-(ri+102.5)**2)*theta
    mortar_weight=mortar_area*normal/1e9*density
    # Uniform radial mortar weight is an explicit third narrow three-hinge trial;
    # it is not treated as tensile/bending continuity between brick courses.
    r0,r1=ri+102.5,ri+112.5;mean=(r0+r1)/2;ha=mortar_area/2;first=(r1**3-r0**3)/3*(1-math.cos(theta));a=mean*math.sin(theta);rise=mean*(1-math.cos(theta))
    h=normal*density*(a*ha-first)/rise/1e9;v=mortar_weight/2
    rows.append({'id':'radial-mortar-weight-only','innerRadiusMm':r0,'outerRadiusMm':r1,'physicalGKN':mortar_weight,
        'seatVerticalKN':v,'seatHorizontalKN':h,'westSeatXZMm':[6000-mean*math.sin(theta),geometry['sourceCurveCentreZMm']+mean*math.cos(theta)],
        'strengthAccepted':False,'movementCompatibleArchAccepted':False})
    return rows


def _transfer_loads_from_deleted_nodes(model,deleted):
    frame=model['model'];ledger=[]
    for family,loads in model['families'].items():
        if family=='physical-G':continue
        before=_family_wrench(model,loads)
        for node in list(loads):
            if node not in deleted:continue
            old=loads.pop(node);wall=node.split('/')[0];targets=model['wallFrames'][wall]['beamNodes'];target=min(targets,key=lambda n:abs(frame.nodes[n][0]-frame.nodes[node][0]))
            shifted=_wrench_at(old[:3],frame.nodes[node],frame.nodes[target]);shifted[3:]=[a+b for a,b in zip(shifted[3:],old[3:])];_add(loads,target,shifted)
            ledger.append({'family':family,'oldNode':node,'receivingNode':target,'physicalOriginXYZMm':frame.nodes[node],
                'wrenchKN_KNmm':old,'scope':'Explicit source-envelope nodal transfer comparison; actual cladding/out-of-plane restraint remains unqualified'})
        after=_family_wrench(model,loads)
        if max(abs(a-b) for a,b in zip(before,after))>1e-7:raise ValueError('Deleting old curved RC nodes lost source load or first moments')
    return ledger


def _add_lower_l_weight(model,setting):
    if setting is None:return None
    if not isinstance(setting,dict) or set(setting)!={'unitWeightKNPerM3'} or type(setting['unitWeightKNPerM3']) not in (int,float) or not math.isfinite(setting['unitWeightKNPerM3']) or not 0<=setting['unitWeightKNPerM3']<=30:
        raise ValueError('Explicit finite lowerL density0..30kN/m3 required; zero is an unchanged stiffness control')
    if 'lowerLWeight' in model:raise ValueError('LowerL ownG already included; duplicate mass rejected')
    frame=model['model'];before=_family_wrench(model,model['families']['physical-G']);members={r[0]:r for r in frame.members};rows=[]
    for corner in model['joinedFloor']['corners']:
        area=math.fsum((r[2]-r[0])*(r[3]-r[1]) for r in corner['rectangles'])
        for kind in ('upper-wall','lower-wall'):
            name=corner['id']+'/'+kind
            if name not in members:raise ValueError('Actual source lowerL finite member missing: '+name)
            _,a,b,_=members[name];p,q=frame.nodes[a],frame.nodes[b]
            if p[:2]!=q[:2]:raise ValueError('LowerL ownG method supports only actual vertical member axes')
            length=math.dist(p,q);volume=area*length/1e9;weight=volume*setting['unitWeightKNPerM3'];centre=[(x+y)/2 for x,y in zip(p,q)]
            for node in (a,b):_add(model['families']['physical-G'],node,_wrench_at([0,0,-weight/2],centre,frame.nodes[node]))
            rows.append({'memberId':name,'physicalStartXYZMm':list(p),'physicalEndXYZMm':list(q),'sectionAreaMm2':area,'physicalLengthMm':length,'RCVolumeM3':volume,'physicalGKN':weight,'centroidXYZMm':centre})
    total=math.fsum(row['physicalGKN'] for row in rows);after=_family_wrench(model,model['families']['physical-G']);actual=[b-a for a,b in zip(before,after)]
    expected=[0,0,-total,-math.fsum(r['physicalGKN']*r['centroidXYZMm'][1]/1000 for r in rows),math.fsum(r['physicalGKN']*r['centroidXYZMm'][0]/1000 for r in rows),0]
    residual=[a-b for a,b in zip(actual,expected)]
    if max(abs(v) for v in residual)>1e-7:raise ValueError('LowerL actual mass or first moments lost')
    result={'schema':'str-lower-L-physical-weight-comparison/1','request':setting,'memberCount':len(rows),'members':rows,'RCVolumeM3':math.fsum(r['RCVolumeM3'] for r in rows),'physicalGKN':total,
        'addedPhysicalFamilyWrenchKN_KNm':actual,'sourceSelfGAndFirstMomentResidualKN_KNm':residual,
        'DPCGapOwnGExcluded':True,'newUpperRoofLOwnGIncluded':False,'reinforcementAccepted':False,'candidateAccepted':False}
    model['lowerLWeight']=result
    return result


def _build_masonry_portal(case,source,monolithic_case,monolithic_source):
    """Compose the actual northern frame before the sole plate condensation.

    Legacy200mm barrier controls remain untouched. Their case schema is a
    reused input boundary, never a certificate for this independent A frame.
    """
    from rc_portal_monolithic import reference_monolithic_rc_case
    from rc_floor_house_loads import build_rc_floor_house
    expected=reference_monolithic_rc_case(monolithic_source)
    if not isinstance(monolithic_case,dict) or set(monolithic_case)!=set(expected) or any(monolithic_case[k]!=expected[k] for k in ('schema','sourceSHA256','jointMode','waterControl','barGeometry','use')):
        raise ValueError('Exact current parent inputs required; no old barrier/bridge acceptance is transferred')
    house=monolithic_case['houseCase']
    if house['coreAxialWidthMm']!=290 or house['northUpstandWidthMm'] not in (200,290):
        raise ValueError('Explicit A normalcore290 and northbeam200or290 required')
    model=build_rc_floor_house(house,monolithic_source['house'])
    frame=model['model'];g=geometry(case,model['portal'],model['grid']);courses=_ring_witness(g,case['masonryUnitWeightKNM3'])
    removed={name for name,m in model['members'].items() if m['kind']=='curved-ring' or m['kind']=='post'}
    virtual=model.get('virtualJointLoadMembers',{})
    frame.springs=[spring for spring in frame.springs if '/dpc/' not in spring['id'] and '/NORMAL/' not in spring['id']]
    deleted={name for name in frame.nodes if '/arch/' in name}
    # End arch masters are shared post nodes and remain. Internal arch nodes have
    # no independent acceptance role in the straight frame.
    transfer=_transfer_loads_from_deleted_nodes(model,deleted)
    removed_loads=[]
    for family,rows in model.get('memberEquivalentLoads',{}).items():
        if family=='physical-G':continue
        for name,vector in rows.items():
            if name in removed or name in virtual:
                removed_loads.append({'family':family,'originalMemberId':name,'originalMember':copy.deepcopy(model['members'].get(name,virtual.get(name))),
                    'equivalentEndWrenchesKN_KNmm':list(vector),'pointLoads':copy.deepcopy(model.get('memberPointLoads',{}).get(family,{}).get(name,[])),
                    'distributedLoads':copy.deepcopy(model.get('memberDistributedLoads',{}).get(family,{}).get(name,[])),
                    'scope':'Original source member-equivalent nodal loads retained at their actual masters; the enlarged A post is a nodal-envelope comparison. These are not recovered distributed pressure cuts in the changed post.'})
    frame.members=[row for row in frame.members if row[0] not in removed]
    for name in removed:model['members'].pop(name)
    for family in ('memberEquivalentLoads','memberPointLoads','memberDistributedLoads'):
        for rows in model.get(family,{}).values():
            for name in removed|set(virtual):rows.pop(name,None)
    for node in deleted:frame.nodes.pop(node)
    left=model['portal']['piers']['westEW'][0];edge=model['portal']['piers']['westEW'][1];inner=g['innerSpringXZMm'][0];spring=g['innerSpringXZMm'][1];top=2600.;clip=g['seatTopXAt2600Mm']
    new_members=[];seat_nodes={};post_volume=0.
    def right_at(z):return inner if z<=spring else inner+(clip-inner)*(z-spring)/(top-spring) if z<top else edge
    for wall,row in model['wallFrames'].items():
        for side in ('west','east'):
            old=row[side];stem=wall+'/'+side;cy=old['pier']['footCentroidXYMm'][1];master_x=old['pier']['footCentroidXYMm'][0];oldnodes=old['nodes'];levels=sorted({-180.,3170.,spring,top,*[course['westSeatXZMm'][1] for course in courses],*[frame.nodes[n][2] for n in oldnodes if -180<frame.nodes[n][2]<3170],*[spring+(top-spring)*i/case['abutmentSlices'] for i in range(case['abutmentSlices']+1)]})
            nodes=[]
            for z in levels:
                matching=[n for n in oldnodes if abs(frame.nodes[n][2]-z)<1e-8]
                nodes.append(matching[0] if matching else frame.node(stem+'/A/'+str(z),[master_x,cy,z]))
            for i,(za,zb) in enumerate(zip(levels,levels[1:])):
                # A stepped section supplies explicit convergence control at the
                # radial seat. Mid-depth integration conserves linear area.
                zm=(za+zb)/2;right=right_at(zm);width=right-left;cx=(left+right)/2
                if side=='east':cx=12000-cx
                name=stem+'/A-post/'+str(i);p=[cx,cy,za];q=[cx,cy,zb];a,b=nodes[i:i+2]
                frame.member(name,a,b,rectangle_section(width,290),model['request']['frameLaw'],physical_start=p,physical_end=q,y_axis=[0,1,0])
                m={'a':a,'b':b,'physicalStartMm':p,'physicalEndMm':q,'breadthMm':290,'depthMm':width,'kind':'post'};model['members'][name]=m;new_members.append(name);post_volume+=width*290*(zb-za)/1e9
            # Restore the existing finite work-dual connection from3170 to the
            # upstand master. Its physical post endpoint remains3170.
            existing_top=oldnodes[-1];node3170=nodes[-1]
            if node3170!=existing_top:
                # Same physical endpoint; the source upstand centroid offset is
                # represented by one finite upper post from prior physical level.
                last_name=new_members[-1];last=model['members'][last_name];frame.members=[r for r in frame.members if r[0]!=last_name]
                frame.member(last_name,last['a'],existing_top,rectangle_section(last['depthMm'],290),model['request']['frameLaw'],physical_start=last['physicalStartMm'],physical_end=last['physicalEndMm'],y_axis=[0,1,0]);last['b']=existing_top
                frame.nodes.pop(node3170)
            for course in courses:
                seat_nodes[wall,side,course['id']]=next(n for z,n in zip(levels,nodes) if abs(z-course['westSeatXZMm'][1])<1e-8)
    # Rebuild G again after master substitutions; this also removes unused
    # equivalent endpoint entries and keeps physical local cut recovery exact.
    model['families']['physical-G']={}
    for key in ('memberEquivalentLoads','memberPointLoads','memberDistributedLoads'):model[key]['physical-G']={}
    for name,m in model['members'].items():
        if m['kind'] in ('post','upstand'):register_member_gravity(model,name,already_lumped=False)
    end_strips=[]
    for wall,row in model['wallFrames'].items():
        nodes=row['beamNodes'];y=frame.nodes[nodes[0]][1];depth=row['west']['topMm']-3170;width=model['widthEdit']['northUpstandWidthMm']
        for edge,node in ((model['portal']['piers']['westEW'][0],nodes[0]),(12000-model['portal']['piers']['westEW'][0],nodes[-1])):
            at=frame.nodes[node];length=abs(edge-at[0]);volume=length*width*depth/1e9;weight=volume*25;point=[(edge+at[0])/2,y,at[2]]
            _add(model['families']['physical-G'],node,_wrench_at([0,0,-weight],point,at))
            end_strips.append({'wallId':wall,'receivingNode':node,'physicalCentroidXYZMm':point,'lengthMm':length,'widthMm':width,'depthMm':depth,'RCVolumeM3':volume,'physicalGKN':weight,'scope':'Actual end-zone material outside the finite upstand axis. Rigid joint-zone work trace only; local cage/resistance remains unqualified.'})
    for wall,row in model['wallFrames'].items():
        cy=row['west']['pier']['footCentroidXYMm'][1]
        for course in courses:
            sx,sz=course['westSeatXZMm']
            for side,sign,x in (('west',-1,sx),('east',1,12000-sx)):
                node=seat_nodes[wall,side,course['id']];force=[sign*course['seatHorizontalKN'],0,-course['seatVerticalKN']]
                _add(model['families']['physical-G'],node,_wrench_at(force,[x,cy,sz],frame.nodes[node]))
    if abs(post_volume-g['fourRCPostUnionVolumeM3'])>1e-9:raise ValueError('Tapered post material integration differs from exact polygon union')
    model['masonryFrameA']={'request':case,'geometry':g,'courses':courses,'newPostMembers':new_members,'explicitTransferredLoads':transfer,
        'RCPostVolumeM3':post_volume,'masonryPhysicalGKN':2*sum(r['physicalGKN'] for r in courses),'retainedOriginalMemberEquivalentLoads':removed_loads,'upstandEndStrips':end_strips,
        'oldCurvedRCAndInfillRemoved':True,'sourceWindTransferQualified':False,'archMovementCompatibilityQualified':False}
    model['monolithic']={'request':monolithic_case,'bridges':[],'additionalRCVolumeM3':0.,'additionalPhysicalGKN':0.,
        'barrierDuties':[],'allOtherSourceDPCsPreserved':True,'actualCapCageAxesKnown':False,'actualCapPileInterfaceQualified':False,
        'scope':'Independent source-bound A frame composition. No legacy200beam barrier/cage/20mmbridge metadata supplies acceptance.'}
    return model


def build_masonry_frame_a(case,source):
    expected=reference_masonry_frame_a_case(source)
    if not isinstance(case,dict) or set(case)!=set(expected) or any(case[k]!=expected[k] for k in ('schema','sourceSHA256','use')):raise ValueError('Exact source-bound masonry frame case required; no injected result or approval')
    for key in ('masonrySeatProjectionMm','masonryUnitWeightKNM3'):
        if type(case[key]) not in (int,float) or not math.isfinite(case[key]):raise ValueError('Finite authored masonry geometry/material required')
    if not 100<=case['masonrySeatProjectionMm']<=180 or not 15<=case['masonryUnitWeightKNM3']<=25:raise ValueError('Unsupported masonry seat or density comparison')
    if type(case['abutmentSlices']) is not int or not 4<=case['abutmentSlices']<=48:raise ValueError('Explicit4..48 tapered abutment slices required')
    receivers=None
    if case['roofCoupling'] is not None:
        from roof_floor_compatibility import roof_floor_receiver_points
        receivers=roof_floor_receiver_points(source['root'])
    model=build_vertical_rc_floor(case['verticalCase'],source['vertical'],retained_point_receivers=receivers,
        portal_builder=lambda inner_case,inner_source:_build_masonry_portal(case,source,inner_case,inner_source))
    data=model['verticalFloor']
    from court_corner_closure import apply_court_corner_closure
    if case['courtCornerClosure'] is not None:
        apply_court_corner_closure(model,source,case['courtCornerClosure'],case['foundationWeight'])
    _add_lower_l_weight(model,case['lowerLWeight'])
    from lower_core_bodies import add_lower_core_bodies
    add_lower_core_bodies(model,source,case['lowerCoreBodies'])
    from foundation_solid_weight import add_foundation_solid_weight
    shell_weight=data['mass']['joinedPhysicalGKN']
    model['foundationWeight']=add_foundation_solid_weight(model,source,case['foundationWeight'])
    roof_before=-sum(row[2] for row in model['families']['physical-G'].values())
    if case['roofCoupling'] is not None:
        from roof_floor_compatibility import apply_roof_floor_coupling
        apply_roof_floor_coupling(model,source,case['roofCoupling'])
    total=-sum(row[2] for row in model['families']['physical-G'].values())
    data['mass'].update(referenceStructuralShellPhysicalGKN=shell_weight,
        foundationPhysicalGKN=model['foundationWeight']['physicalGKN'],
        cornerClosurePhysicalGKN=model.get('courtCornerClosure',{}).get('addedGKN',0.),
        lowerLPhysicalGKN=model.get('lowerLWeight',{}).get('physicalGKN',0.),
        lowerCorePhysicalGKN=model.get('lowerCoreBodies',{}).get('addedPhysicalGKN',0.),roofAddedPhysicalGKN=total-roof_before,
        joinedPhysicalGKN=total,authoredPhysicalGFactor=model['houseLoadCase']['boundary']['physicalGFactor'],
        appliedPhysicalGKN=total*model['houseLoadCase']['boundary']['physicalGFactor'])
    return model


def render_masonry_frame_a(result):
    g=result['geometry'];native=result['nativeVertical'];theta=g['seatAngleRad'];ri=g['sourceInnerRadiusMm'];cz=g['sourceCurveCentreZMm'];rows=[]
    def pt(x,z):return 55+(x-4150)*.135,660-(z+180)*.135
    def path(points,close=True):
        return ' '.join(('M' if i==0 else 'L')+f'{pt(x,z)[0]:.3f},{pt(x,z)[1]:.3f}' for i,(x,z) in enumerate(points))+(' Z' if close else '')
    rows.extend(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#faf8f2"/>',
        '<style>text{font:14px sans-serif;fill:#243339}.small{font-size:12px}.hold{fill:#a64e3c}</style>',
        '<text x="35" y="35" font-size="21">STRAIGHT RC FRAME + SEPARATE MASONRY ARCH</text>',
        '<text x="35" y="62">Source ground 0 / same RC200 plate and actual 52 heads / unselected architectural successor</text>'])
    for mirror in (False,True):
        polygon=[(12000-x if mirror else x,z) for x,z in g['westPolygonXZMm']]
        rows.append(f'<path d="{path(polygon)}" fill="#9eb5bb" stroke="#344d54"/>')
    outer=next(row for row in native['northUpstandStrips'] if row['wallId']=='outer-north')
    top=outer['centroidZMm']+outer['depthMm']/2
    rows.append(f'<path d="{path([(4307.5,3170),(7692.5,3170),(7692.5,top),(4307.5,top)])}" fill="#9eb5bb" stroke="#344d54"/>')
    for course in result['masonryCourses']:
        r0,r1=course['innerRadiusMm'],course['outerRadiusMm'];points=[]
        for radius,reverse in ((r0,False),(r1,True)):
            angles=[math.pi/2+theta-2*theta*i/80 for i in range(81)]
            if reverse:angles.reverse()
            points.extend([(6000+radius*math.cos(a),cz+radius*math.sin(a)) for a in angles])
        fill='#dfd4bf' if course['id']=='radial-mortar-weight-only' else '#b77d5d'
        rows.append(f'<path d="{path(points)}" fill="{fill}" stroke="#704b3a" stroke-width=".7"/>')
    finished=ri-280;angle=math.asin(1200/finished);curve=[(6000+finished*math.cos(a),cz+finished*math.sin(a)) for a in [math.pi/2+angle-2*angle*i/80 for i in range(81)]]
    rows.append(f'<path d="{path(curve,False)}" fill="none" stroke="#a64e3c" stroke-width="2"/>')
    for x in (4500,7500):rows.append(f'<path d="{path([(x-300,-750),(x+300,-750),(x+300,-180),(x-300,-180)])}" fill="#bdc9cf" stroke="#344d54"/>')
    heads=native['native']['heads'];minhead=min(heads,key=lambda r:r['reactionKN_KNm'][2]);maxhead=max(heads,key=lambda r:r['reactionKN_KNm'][2]);lines=[
        ('OUTER-NORTH FRAME SECTION',False),(f"Upstand depth {outer['depthMm']:g} / normal {outer['rectangleXYMm'][3]-outer['rectangleXYMm'][1]:g} mm",False),(html.escape(native['native']['caseId']),False),
        (f"Known plate {native['mass']['newPlateAreaM2']:.5f}m²",False),
        (f"Plate selfG {native['mass']['newPlatePhysicalSelfGKN']:.3f}kN",False),
        (f"Four RC post union {result['mass']['RCPostVolumeM3']:.6f}m³",False),
        (f"Two masonry rings {result['mass']['masonryPhysicalGKN']:.4f}kN",False),
        (f"Foundation union {result['foundationWeight']['physicalGKN']:.3f}kN",False),
        (f"52-head min {minhead['reactionKN_KNm'][2]:.3f}kN/{minhead['id']}",False),
        (f"52-head max {maxhead['reactionKN_KNm'][2]:.3f}kN/{maxhead['id']}",False),
        (f"Modeled physical G {result['mass']['joinedPhysicalGKN']:.3f} kN",False),('RETAINED ARCHITECTURAL COST',True),('Finished opening2400 / normal775 retained',False),
        (f"Local jamb glass {g['localJambGlassMm']:.0f}mm remains unqualified",True),
        ('105mm gross crown-to-upstand clearance',False),('No structural masonry infill credited',False),
        ('',False),('OPEN ASSEMBLED-PATH OBLIGATIONS',True),('Actual RC cage, anchorage and cap/grid node',True),
        ('Masonry strength, asymmetry and seat shear',True),('Arch movement and out-of-plane retention',True),
        ('Wet inventory / SW formed node qualification',True),('Complete water/thermal boundary and roof',True),
        ('Raised-house transformation not supplied',True)]
    for i,(text,hold) in enumerate(lines):rows.append(f'<text x="710" y="{105+23*i}" class="small {"hold" if hold else ""}">{text}</text>')
    rows.extend(['<text x="40" y="760" class="small">Brown: two 102.5 mm radial courses; light 10 mm mortar. Blue: actual direct-bearing RC union.</text>',
        '<text x="40" y="785" class="small">Red: unchanged finished profile. Gravity is reapplied to this source; old ring actions are not transferred.</text>',
        '<text x="40" y="815" class="hold">Own-ring equilibrium and compatible frame response are not complete masonry, reinforcement or installed acceptance.</text></svg>'])
    return '\n'.join(rows)+'\n'


def run_masonry_frame_a(case,source,name):
    model=build_masonry_frame_a(case,source);captured={}
    if case['roofCoupling'] is not None:
        def observe(raw):captured['raw']=raw
        native=solve_vertical_rc_floor(model,source['vertical'],name,additional_nodal_loads=model['roofFloorCoupling']['additionalNodalLoads'],result_observer=observe)
    else:native=solve_vertical_rc_floor(model,source['vertical'],name)
    return finish_masonry_frame_a(model,source,native,captured.get('raw'))


def _label_ground_element_actions(native):
    """Keep actual solved actions; do not invent distributed local recovery."""
    groups=((native['native']['adjacentGridMemberCuts'],'grid member'),
        (native['native']['capCuts'],'upper-cap member'),
        (native.get('additionalGroundCapCuts',[]),'additional upper-cap member'))
    for rows,kind in groups:
        for row in rows:
            row['localDistributedLoadRecoveryQualified']=False
            row['scope']=('Elastic element-end actions at the actual '+kind+' geometry in the same compatible A model under the declared equivalent nodal loads, including mapped foundation gravity. '
                'Per-member distributed body-load vectors have not been subtracted here; these are not recovered distributed physical local cuts or a local strength proof. '
                'Local3D node, cap cage, pile and soil resistance remain unqualified.')


def finish_masonry_frame_a(model,source,native,roof_raw=None):
    """Format one actual solved model; never rerun or substitute another case."""
    from plate_bending_recovery import recover_plate_bending
    from floor_reinforcement import assess_floor_reinforcement
    case=model['masonryFrameA']['request']
    native['headPositions']=[{'id':row['id'],'xyMm':list(model['model'].nodes[row['id']][:2]),'xyzMm':list(model['model'].nodes[row['id']])} for row in model['grid']['heads']]
    from lower_core_bodies import summarize_lower_core_body_response
    lower_response=summarize_lower_core_body_response(model,native)
    roof_result=None
    if case['roofCoupling'] is not None:
        from roof_floor_compatibility import finish_roof_floor_coupling
        if roof_raw is None:raise ValueError('Actual joined roof solve state is required for its result')
        roof_result=finish_roof_floor_coupling(model,roof_raw)
    native['request']=case['verticalCase'];native['mass']['includesNewStraightFrameAndSeparateMasonryGravity']=True
    # Old schedules/bridge bar diagnostics belong to the rejected curved control.
    native['native'].pop('continuousSectionStressDiagnostics',None)
    native['native'].pop('schedule',None)
    for key in ('freeFloorPortalStatics','domainReason','bilateralFullContactDomainRejected','freeFloorCompressionOnlyEquilibriumRejected','initialContactGuessFromCase'):
        native['native'].pop(key,None)
    native['native']['barrierDuties']=[]
    native['native']['scopeOfFormerDPC']='The actual enlarged continuous A post union crosses the former20mm gap in finite slices. No old curved-control cage, bridge section, flange or seal geometry is adopted.'
    native['native']['memberLoadRecovery']='New RC post/upstand gravity uses consistent member vectors and physical local cut recovery. Source post pressure retains its original equivalent nodal cards as an explicit load-introduction comparison; changed-post distributed pressure cuts and actual cladding restraint are not qualified.'
    _label_ground_element_actions(native)
    native['reusedPlateMethod']='str-vertical-rc-floor-case/1'
    native['verticalGravityMethod']='str-masonry-frame-a-native-plate-comparison/1'
    native['reusedMonolithicKernelSourceSHA256']=native['native'].pop('parentMonolithicControlSourceSHA256')
    native['native']['barrierDisposition']='Old curved-control flange/bar axes are inapplicable; enlarged direct-bearing RC union needs new complete moisture/thermal detail.'
    data=model['masonryFrameA'];native['native']['monolithicRCBridgeMembers']=[]
    native['diagnostics'].append('StraightRC/postunion replaced the actual curvedRC ring; independent masonry selfweight and seatthrust enters the same compatible floor/52headsolve. Outofplane restraint, archmovement compatibility and wholehousegravity remain unqualified.')
    bending=recover_plate_bending(native)
    reinforcement=assess_floor_reinforcement(native,case['floorReinforcement'])
    native.update(schema='str-masonry-frame-a-vertical-result/1',sourceSHA256=source['identities'],request=case,
        plateCase=case['verticalCase'],parentVerticalMethodSchema='str-vertical-rc-floor-case/1')
    native['native'].update(schema='str-masonry-frame-a-compatible-frame-result/1',sourceSHA256=source['identities'],request=case)
    svg=draw_vertical_floor(native).replace('RC200 VERTICAL FLOOR / FINITE NORMAL RECEIVERS / ACTUAL 52 HEADS','STRAIGHT FRAME / SEPARATE MASONRY / RC200 / ACTUAL 52 HEADS')
    result={'schema':'str-masonry-frame-a-result/1','sourceSHA256':source['identities'],'request':case,'nativeVertical':native,
        'geometry':data['geometry'],'masonryCourses':data['courses'],'mass':{'RCPostVolumeM3':data['RCPostVolumeM3'],'masonryPhysicalGKN':data['masonryPhysicalGKN'],**native['mass']},
        'foundationWeight':model['foundationWeight'],'courtCornerClosure':model.get('courtCornerClosure'),
        'lowerLWeight':model.get('lowerLWeight'),'lowerCoreBodies':None if model.get('lowerCoreBodies') is None else {k:v for k,v in model['lowerCoreBodies'].items() if k!='contactBodies'},
        'lowerCoreResponse':None if lower_response is None else {k:v for k,v in lower_response.items() if k!='response'},'roofCoupling':roof_result,'plateBending':bending,'floorReinforcement':reinforcement,'explicitTransferredLoads':data['explicitTransferredLoads'],
        'loadIntroduction':{'physicalGravityConsistentMemberRecovery':True,'sourceWindEquivalentNodalComparison':True,'upstandEndStripGravity':data['upstandEndStrips'],
            'changedPostDistributedPressureRecoveryQualified':False,'retainedOriginalMemberEquivalentLoads':data['retainedOriginalMemberEquivalentLoads']},
        'straightFrameCage':None,'drawings':{'masonry-frame-a-floor.svg':svg},'candidateAccepted':False,'completeHouseProof':False,'roofAdoption':False,
        'masonryStrengthAccepted':False,'archMovementCompatibilityAccepted':False,'frameReinforcementAccepted':False,
        'waterControlAccepted':False,'thermalAccepted':False,'installedAcceptance':False}
    result['drawings']['masonry-frame-a.svg']=render_masonry_frame_a(result)
    if roof_result is not None:result['drawings']['masonry-frame-a-roof.svg']=roof_result['roofSvg']
    if case['straightFrameCage'] is not None:
        from straight_frame_cage import assess_straight_frame_cage,render_straight_frame_cage
        result['straightFrameCage']=assess_straight_frame_cage(result,case['straightFrameCage'])
        result['drawings']['masonry-frame-a-cage.svg']=render_straight_frame_cage(result,result['straightFrameCage'])
    return result


if __name__=='__main__':
    source=load_masonry_frame_a_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_masonry_frame_a_case(source),allow_nan=False))
    else:
        request=json.load(sys.stdin)
        if set(request)!={'case','name'}:raise ValueError('Exact case/name request required')
        print(json.dumps(run_masonry_frame_a(request['case'],source,request['name']),allow_nan=False))
