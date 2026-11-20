import copy
import hashlib
import json
import math
from pathlib import Path
import sys

from distributed_floor_compatibility import _native_floor_wind, native_intermediate_support_ports
from joined_rc_floor import _author_portal_contact, build_joined_rc_floor, joined_physical_schedule, load_joined_rc_floor_source, reference_joined_rc_floor_case, solve_joined_rc_floor
from joined_successor_compatibility import _wrench_at
from joined_successor_kernel import FrameModel, cross, rectangle_contact_quadrature, rectangle_section
from north_portal_receiving import GAUSS
from perforated_floor_condensation import compile_perforated_floor
from retained_components import evaluate_retained_components


METHOD='project/str/studies/rc_floor_house_loads.py'


def load_rc_floor_house_source(root):
    root=Path(root);joined=load_joined_rc_floor_source(root)
    return {'root':root,'joined':joined,'identities':{**joined['identities'],METHOD:hashlib.sha256((root/METHOD).read_bytes()).hexdigest()}}


def reference_rc_floor_house_case(source):
    return {'schema':'str-rc-floor-house-load-case/1','sourceSHA256':source['identities'],
        'joinedCase':reference_joined_rc_floor_case(source['joined']),
        'coreAxialWidthMm':None,'northUpstandWidthMm':None,'finishedAxialWidthMm':775,
        'mineralFaceLiningMm':40,'boundary':{'kind':'native-floor-and-actual-open-north-portal-replacement','physicalGFactor':None,'includeExternalGMAXQ':False},
        'courtyardPressure':None,'reinforcement':'separate-worked-cage-proof-required','use':'unqualified-source-loaded-RC-house-subsystem'}


def _add(family,node,wrench):
    row=family.setdefault(node,[0.]*6)
    for i,value in enumerate(wrench):row[i]+=value


def _beam_gravity(model):
    loads={};frame=model['model']
    for wall,row in model['wallFrames'].items():
        nodes=row['beamNodes'];xs=row['beamXMm'];height=row['west']['topMm']-3170
        for i,(a,b) in enumerate(zip(nodes,nodes[1:])):
            weight=(xs[i+1]-xs[i])*140*height/1e9*25
            for node in (a,b):_add(loads,node,[0,0,-weight/2,0,0,0])
        for edge,node in ((4307.5,nodes[0]),(7692.5,nodes[-1])):
            weight=106.25*140*height/1e9*25;point=[(edge+frame.nodes[node][0])/2,*frame.nodes[node][1:]]
            _add(loads,node,_wrench_at([0,0,-weight],point,frame.nodes[node]))
    return loads


def _author_widths(model,case,source):
    core,beam=case['coreAxialWidthMm'],case['northUpstandWidthMm']
    if any(type(value) not in (int,float) or not math.isfinite(value) for value in (core,beam)) or not 215<=core<=350 or not 140<=beam<=core:
        raise ValueError('Bounded authored normal-core215..350mm and140..core upstand width required')
    h=source['joined']['floor']['retained']['values']['project/had/studies/water-replan.json']['model'];portal=h['insulatedPortal']
    if case['finishedAxialWidthMm']!=portal['finishedAxial'] or case['finishedAxialWidthMm']!=775 or case['mineralFaceLiningMm']!=40:
        raise ValueError('Changed775finished envelope or40mm lining requires a new architectural/MAT method')
    if portal['wrap']['composition']!=[['bareCellularGlass',240],['mineralLining',40]]:
        raise ValueError('Source portal glass/lining recipe changed; no historicalwrap is silentlysubstituted')
    glass=(775-core)/2-case['mineralFaceLiningMm']
    if glass<=0:raise ValueError('No positive cellular-glass face layer remains')
    frame=model['model'];old_beam=_beam_gravity(model);old=model['families']['physical-G'];new={}
    for node in old.keys()|old_beam.keys():
        a=old.get(node,[0.]*6);b=old_beam.get(node,[0.]*6)
        new[node]=[core/215*(u-v)+beam/140*v for u,v in zip(a,b)]
    model['families']['physical-G']=new
    for member in model['members'].values():member['breadthMm']=beam if member['kind']=='upstand' else core
    temporary=FrameModel();temporary.nodes=frame.nodes;rebuilt=[]
    for name,a,b,matrix in frame.members:
        if name not in model['members']:
            rebuilt.append((name,a,b,matrix));continue
        member=model['members'][name];temporary.members=[]
        temporary.member(name,a,b,rectangle_section(member['depthMm'],member['breadthMm']),model['request']['frameLaw'],
            physical_start=member['physicalStartMm'],physical_end=member['physicalEndMm'],y_axis=[0,1,0])
        rebuilt.append(temporary.members[0])
    frame.members=rebuilt
    frame.springs=[spring for spring in frame.springs if '/dpc/' not in spring['id'] and '/NORMAL/' not in spring['id']]
    footprints=[]
    for pier in model['dpcNodes']:
        original=list(pier['nominalSourceFootprintXYMm']);cx,cy,_=pier['pointMm'];x0,x1=original[0],original[2]
        authored=[x0,cy-core/2,x1,cy+core/2]
        geometry=next(row for wall in model['wallFrames'].values() for row in (wall['west']['pier'],wall['east']['pier']) if row['id']==pier['pierId'])
        cap=geometry['capFootprintXYMm']
        if authored[0]<cap[0] or authored[1]<cap[1] or authored[2]>cap[2] or authored[3]>cap[3]:
            raise ValueError('Authored normal RC core exceeds its actual named finite cap')
        pier['footprintXYMm']=authored
        for index,(x,y,area) in enumerate(rectangle_contact_quadrature(authored)):
            for axis,direction in enumerate(([1,0,0],[0,1,0])):
                frame.spring(pier['low'].split('/-')[0]+'/dpc/'+str(index)+'/'+str(axis),pier['high'],pier['low'],[x,y,pier['pointMm'][2]],direction,area*model['request']['dpcLaw']['shearStiffnessKNPerMm3'])
        footprints.append({'pierId':pier['pierId'],'originalSourceFootprintXYMm':original,'authoredCoreFootprintXYMm':authored,'actualCapFootprintXYMm':cap})
    joined=case['joinedCase']
    _author_portal_contact(model,joined['portalDPCNormalMode'],joined['portalDPCQuadratureOrder'],joined['portalDPCNormalSubdivisions'],joined['portalDPCInsetMm'])
    for pier,footprint in zip(model['dpcNodes'],footprints):
        pier['nominalSourceFootprintXYMm']=footprint['originalSourceFootprintXYMm']
        pier['authoredCoreFootprintXYMm']=footprint['authoredCoreFootprintXYMm']
    model['portalContact']['integration']=joined['portalDPCNormalIntegration']
    model['initialNormalSprings']=copy.deepcopy([spring for spring in frame.springs if '/NORMAL/' in spring['id']])
    model['widthEdit']={'coreAxialWidthMm':core,'northUpstandWidthMm':beam,'finishedAxialWidthMm':775,
        'cellularGlassFaceThicknessMm':glass,'mineralFaceLiningMm':40,'originalGlassFaceThicknessMm':240,
        'cellularGlassThicknessLossFraction':1-glass/240,'footprints':footprints,
        'rawSpanMm':portal['rawSpan'],'rawSpringMm':portal['rawSpring'],'rawRiseMm':portal['rawRise'],'ringRadialDepthMm':portal['ring'],
        'postAlongWidthMm':212.5,'thermalAdoption':False,'reinforcementAdoption':False}


def _local_outer_pressure(model,source,low,high,pressure):
    frame=model['model'];geometry=model['wallFrames']['outer-north'];portal=model['portal'];family={};origins=[]
    west,east=geometry['west'],geometry['east'];y=west['pier']['footCentroidXYMm'][1]
    left,right=west['pier']['footprintXYMm'][0],east['pier']['footprintXYMm'][2]
    low=max(low,left);high=min(high,right)
    if high<=low:return family,origins
    raw_left=6000-portal['rawSpan']/2;raw_right=6000+portal['rawSpan']/2
    finish_left=6000-portal['finishedWidthAtVerticalJambs']/2;finish_right=6000+portal['finishedWidthAtVerticalJambs']/2
    stations=sorted({low,high,*[value for value in (raw_left,raw_right,finish_left,finish_right,*geometry['beamXMm']) if low<value<high]})
    ff=source['nativeWind']['sourceDatumsMm']['ff'];exposure=source['gardenWalkingZMm']
    for a,b in zip(stations,stations[1:]):
        for coordinate,weight in GAUSS:
            x=(a+b)/2+(b-a)*coordinate/2
            opening=exposure if x<finish_left or x>finish_right else portal['centreZ']+math.sqrt(portal['finishedRadius']**2-(x-6000)**2)
            height=3170-opening;force=pressure*(b-a)*weight*height/2e6
            z=(3170+opening)/2
            node=west['nodes'][-2] if x<raw_left else east['nodes'][-2] if x>raw_right else min(geometry['arcNodes'],key=lambda name:abs(frame.nodes[name][0]-x))
            point=[x,y+775/2,z];vector=[0,force,0]
            _add(family,node,_wrench_at(vector,point,frame.nodes[node]));origins.append({'pointXYZMm':point,'forceKN':vector,'source':'actual-open-portal-ground-solid-face'})
    if ff<3170:raise ValueError('Native firstfloor pressure datum is below actual RC soffit')
    for a,b in zip(stations,stations[1:]):
        x=(a+b)/2;force=pressure*(b-a)*(ff-3170)/1e6;z=(3170+ff)/2
        xs=geometry['beamXMm'];nodes=geometry['beamNodes']
        if x<=xs[0]:shares=[(nodes[0],1.)]
        elif x>=xs[-1]:shares=[(nodes[-1],1.)]
        else:
            i=next(i for i in range(len(xs)-1) if xs[i]<=x<=xs[i+1]);v=(x-xs[i])/(xs[i+1]-xs[i]);shares=[(nodes[i],1-v),(nodes[i+1],v)]
        point=[x,y+775/2,z];vector=[0,force,0]
        for node,factor in shares:_add(family,node,[factor*v for v in _wrench_at(vector,point,frame.nodes[node])])
        origins.append({'pointXYZMm':point,'forceKN':vector,'source':'actual-ground-to-source-ff-slab-edge-strip'})
    return family,origins


def analytic_open_portal_wind(model,low,high,pressure,exposure,ff):
    portal=model['portal'];radius=portal['finishedRadius'];cz=portal['centreZ'];centre=6000
    left,right=centre-portal['finishedWidthAtVerticalJambs']/2,centre+portal['finishedWidthAtVerticalJambs']/2
    a=max(low,4307.5);b=min(high,7692.5)
    if b<=a:return {'areaMm2':0.,'wrenchKN_KNm':[0.]*6}
    area=(b-a)*(ff-exposure);qz=(b-a)*(ff*ff-exposure*exposure)/2;qx=(b*b-a*a)*(ff-exposure)/2
    c=max(a,left);d=min(b,right)
    if d>c:
        u,v=c-centre,d-centre
        def s0(t):return .5*(t*math.sqrt(radius*radius-t*t)+radius*radius*math.asin(t/radius))
        def s1(t):return -(radius*radius-t*t)**1.5/3
        root=s0(v)-s0(u)
        void=(cz-exposure)*(d-c)+root
        void_z=((cz*cz+radius*radius-exposure*exposure)*(d-c)+2*cz*root-(v**3-u**3)/3)/2
        void_x=(cz-exposure)*(d*d-c*c)/2+centre*root+s1(v)-s1(u)
        area-=void;qz-=void_z;qx-=void_x
    return {'areaMm2':area,'firstZMomentMm3':qz,'firstXMomentMm3':qx,
        'wrenchKN_KNm':[0.,pressure*area/1e6,0.,-pressure*qz/1e9,0.,pressure*qx/1e9],
        'scope':'Independent closed circular-segment area and firstmoments, including actualexposure andff; no loadprojection or frame equilibrium is used to obtain these values.'}


def _floor_offset_couples(model,rows,family,ff):
    frame=model['model'];joined=model['joinedFloor'];corners=joined['corners'];offset=ff-3270;records=[]
    for row in rows:
        force=row['forceKN'];axis=0 if force[0] else 1;low,high=row['loadedAlongIntervalMm'];point=row['pointXYZMm']
        north=axis==1 and abs(point[1]-model['wallFrames']['outer-north']['west']['pier']['footCentroidXYMm'][1])<1e-6
        cuts=sorted({low,high,*[value for value in (4307.5,7692.5) if low<value<high]}) if north else [low,high]
        for a,b in zip(cuts,cuts[1:]):
            magnitude=(b-a)/(high-low);middle=(a+b)/2;moment=cross([0,0,offset],[value*magnitude for value in force])
            if north and 4307.5<=middle<=7692.5:
                geometry=model['wallFrames']['outer-north'];xs=geometry['beamXMm'];nodes=geometry['beamNodes'];stations=sorted({a,b,*[value for value in xs if a<value<b]})
                for c,d in zip(stations,stations[1:]):
                    x=(c+d)/2
                    if x<=xs[0]:shares=[(nodes[0],1.)]
                    elif x>=xs[-1]:shares=[(nodes[-1],1.)]
                    else:
                        i=next(i for i in range(len(xs)-1) if xs[i]<=x<=xs[i+1]);v=(x-xs[i])/(xs[i+1]-xs[i]);shares=[(nodes[i],1-v),(nodes[i+1],v)]
                    for node,factor in shares:_add(family,node,[0,0,0,*[value*(d-c)/(b-a)*factor for value in moment]])
                records.append({'sourceId':row['id'],'intervalMm':[a,b],'momentKNmm':moment,'route':'actual-finite-north-upstand-torsion-stations'})
            else:
                side=[corner for corner in corners if abs(corner['originXYMm'][axis]-point[axis])<1e-6];side.sort(key=lambda corner:corner['originXYMm'][1-axis])
                if len(side)!=2:raise ValueError('No actual two finite Lports receive this source face offset')
                lo,hi=[corner['originXYMm'][1-axis] for corner in side];v=(middle-lo)/(hi-lo)
                for corner,factor in zip(side,(1-v,v)):_add(family,corner['node'],[0,0,0,*[value*factor for value in moment]])
                records.append({'sourceId':row['id'],'intervalMm':[a,b],'momentKNmm':moment,'route':'explicit-source-Lface-offset-projection-vertical-plate-unproved'})
    return records


def build_rc_floor_house(case,source):
    expected=reference_rc_floor_house_case(source)
    if not isinstance(case,dict) or set(case)!=set(expected) or any(case[key]!=expected[key] for key in ('schema','sourceSHA256','finishedAxialWidthMm','mineralFaceLiningMm','courtyardPressure','reinforcement','use')):
        raise ValueError('Unsupported/stale exact RC house load case; no result/approval injection')
    boundary=case['boundary']
    if not isinstance(boundary,dict) or set(boundary)!=set(expected['boundary']) or boundary['kind']!=expected['boundary']['kind'] or type(boundary['physicalGFactor']) not in (int,float) or not math.isfinite(boundary['physicalGFactor']) or not 0<=boundary['physicalGFactor']<=1.35 or type(boundary['includeExternalGMAXQ']) is not bool:
        raise ValueError('Explicit physical-G comparison factor and supported native pressure boundary required')
    model=build_joined_rc_floor(case['joinedCase'],source['joined']);base_schedule=joined_physical_schedule(model)
    geometry=source['joined']['floor']['successor']['values']['floor-portal-monolithic-drag']['geometry']
    portal=source['joined']['floor']['retained']['values']['project/had/studies/water-replan.json']['model']['insulatedPortal']
    model['sourceUpperEnvelope']={'floorCollectorGlassCavityBrickMm':geometry['unchangedExteriorGlassCavityBrickMm'],'portalAdjacentRecipeText':portal['wrap']['localReplacement']}
    _author_widths(model,case,source)
    floor_source=source['joined']['floor'];request=case['joinedCase']['floor'];joined=model['joinedFloor'];old=joined['floor'];width=case['northUpstandWidthMm']
    retained=evaluate_retained_components(request['componentCase'],floor_source['retained']);bodies=[row['geometry']['bodyRectangleXYMm'] for row in retained['components'] if row['kind']=='first-floor']
    omissions=copy.deepcopy(old['omissionsXYMm']);receivers=copy.deepcopy(old['finiteBeamBoundaryReceivers'])
    material=case['joinedCase']['portal']['frameLaw'];g=material['elasticModulusMPa']/(2*(1+material['poissonRatio']))
    for receiver in receivers:
        receiver['width']=width;rectangle=[receiver['lo'],receiver['datum']-width/2,receiver['hi'],receiver['datum']+width/2]
        for aperture in joined['physicalHoles']:
            a=aperture['bounds']
            if min(rectangle[2],a[2])-max(rectangle[0],a[0])>1e-6 and min(rectangle[3],a[3])-max(rectangle[1],a[1])>1e-6:
                raise ValueError('APERTURE_INTERSECTS_STRUCTURAL_PATH: widened full RCupstand intersects '+aperture['id'])
        omissions.append(rectangle)
        receiver['shearPhi']=[12*material['elasticModulusMPa']*material['flexuralFactor']*width**2/(12*g*material['shearAreaFactor']*(b['x']-a['x'])**2) for a,b in zip(receiver['stations'],receiver['stations'][1:])]
    wind=_native_floor_wind(floor_source,request['boundaryCase']['windIndex'],floor_source['retained']['policy']['axes']);rows=copy.deepcopy(wind['rows']);removed=[];actual=[];portal_loads={}
    water=source['joined']['floor']['retained']['values']['project/had/studies/water-replan.json']['model']['sections']['waterLevels']
    walking=water['loggiaNorth']
    if type(walking) not in (int,float) or not wind['sourceDatumsMm']['base']<=walking<3170:
        raise ValueError('Authored garden walking surface lies outside supported source lower pressure band')
    context={'nativeWind':wind,'gardenWalkingZMm':walking}
    for row in wind['rows']:
        if row['forceKN'][1]>=0 or abs(row['pointXYZMm'][1]-model['wallFrames']['outer-north']['west']['pier']['footCentroidXYMm'][1])>1e-6:continue
        lo,hi=row['loadedAlongIntervalMm'];lo=max(lo,4307.5);hi=min(hi,7692.5)
        if hi<=lo:continue
        scalar=wind['sourceDatumsMm'];q=-row['pressureKPa']*(hi-lo)*(scalar['ff']-scalar['base'])/2e6
        replacement={'id':row['id']+'/remove-gross-lower-portal-share','forceKN':[0,-q,0],
            'pointXYZMm':[(lo+hi)/2,row['pointXYZMm'][1],scalar['ff']],'loadedAlongIntervalMm':[lo,hi]}
        rows.append(replacement);removed.append({'sourceId':row['id'],'removedFloorForceKN':[0,q,0],
            'intervalMm':[lo,hi],'sourceVerticalBandMm':[scalar['base'],scalar['ff']],
            'sourceGrossLowerFloorShareBelowWalkKN':-row['pressureKPa']*(hi-lo)*(walking-scalar['base'])/2e6,
            'sourceGrossFullFaceBelowWalkKN':-row['pressureKPa']*(hi-lo)*(walking-scalar['base'])/1e6,
            'scope':'Remove only the native gross lower-wall first-floor share before adding actual full open-portal body wind; no P0 reaction is imported.'})
        loads,origins=_local_outer_pressure(model,context,lo,hi,-row['pressureKPa'])
        for node,wrench in loads.items():_add(portal_loads,node,wrench)
        actual.extend(origins)
    floor=compile_perforated_floor(bodies,omissions,old['bands'],old['ports'],old['unqualifiedLaw'],request['maxPitchMm'],rows,receivers)
    modes=floor.pop('energyModes');frame=model['model'];frame.springs=[spring for spring in frame.springs if not spring['id'].startswith('JOINED-FLOOR/energy/')]
    for index,vector in enumerate(modes):
        by_node={}
        for coefficient,terms in zip(vector,joined['portTerms']):
            for node,row in terms:
                target=by_node.setdefault(node,[0.]*6)
                for axis,value in enumerate(row):target[axis]+=coefficient*value
        frame.springs.append({'id':'JOINED-FLOOR/energy/'+str(index),'terms':list(by_node.items()),'stiffness':1.,'mode':'bilateral','gap':0.})
    condensed={}
    for coefficient,terms in zip(floor['condensedForceKN'],joined['portTerms']):
        for node,row in terms:_add(condensed,node,[coefficient*value for value in row])
    projection=_floor_offset_couples(model,rows,condensed,wind['sourceDatumsMm']['ff'])
    model['families']['native-floor-reconciled']=condensed;model['families']['actual-outer-portal-ground-pressure']=portal_loads
    joined['floor']=floor;model['houseLoadCase']=case;model['houseBaseSchedule']=base_schedule
    model['housePressure']={'nativeWind':wind,'reconciledFloorRows':rows,'removedGrossLowerPortalShares':removed,
        'actualPortalWindOrigins':actual,'projectionCouples':projection,
        'actualGardenWalkingZMm':walking,'walkingDatumSource':'model.sections.waterLevels.loggiaNorth',
        'sourceLowerBandMm':[wind['sourceDatumsMm']['base'],wind['sourceDatumsMm']['ff']],
        'belowWalkingBandHeightMm':walking-wind['sourceDatumsMm']['base'],
        'exposureScope':'Actual solidface pressure starts at the authored−152.5garden walking surface, not0or the−180native grossbase; belowwalk pressure is excluded and quantified, no surveyedgrade is inferred.',
        'scope':'Actual native first-floor programmes only, with explicit lower-wall overlap replacement on outer north. No roof/P0/old fixed-base increments or silent courtyard wind.'}
    model['housePressure']['analyticActualPortalChecks']=[]
    for item in removed:
        lo,hi=item['intervalMm'];analytic=analytic_open_portal_wind(model,lo,hi,-2.25,walking,wind['sourceDatumsMm']['ff'])
        numerical=_origin_wrench(actual);error=[a-b for a,b in zip(numerical,analytic['wrenchKN_KNm'])]
        if max(abs(value) for value in error)>1e-7:raise ValueError('Actual finishedarch quadrature loses independentanalytic force/firstmoment')
        model['housePressure']['analyticActualPortalChecks'].append({**analytic,'quadratureWrenchResidualKN_KNm':error})
    return model


def _family_wrench(model,family):
    total=[0.]*6
    for node,row in family.items():
        value=_wrench_at(row[:3],model['model'].nodes[node],[0,0,0]);value[3:]=[a+b for a,b in zip(value[3:],row[3:])]
        total=[a+b for a,b in zip(total,value)]
    return [*total[:3],*[value/1000 for value in total[3:]]]


def _origin_wrench(rows,z=None):
    total=[0.]*6
    for row in rows:
        point=list(row['pointXYZMm'])
        if z is not None:point[2]=z
        value=_wrench_at(row['forceKN'],point,[0,0,0]);total=[a+b for a,b in zip(total,value)]
    return [*total[:3],*[value/1000 for value in total[3:]]]


def rc_house_schedule(model):
    old=model['houseBaseSchedule'];edit=model['widthEdit'];core=edit['coreAxialWidthMm']/215;beam=edit['northUpstandWidthMm']/140
    pier=old['fullheightPierVolumeM3']*core;ring=old['ringOutsidePierUnionVolumeM3']*core;upstand=old['floorUpstandVolumeM3']*beam;infill=old['gravityOnlyInfillVolumeM3']*core
    return {'fullheightPierVolumeM3':pier,'ringOutsidePierUnionVolumeM3':ring,'floorUpstandVolumeM3':upstand,
        'RCVolumeM3':pier+ring+upstand,'gravityOnlyInfillVolumeM3':infill,'physicalGKN':25*(pier+ring+upstand)+20*infill,
        'widthEdit':edit,'reinforcementAdoption':False,
        'massScope':'One current authored RCunion and gravity-only infill. Widerupstand removes additional CSTstrip; no oldbrickmass, retainedfloor mass, roof reaction or glass/lining minimumG is credited.',
        'upperWallEnvelopeHold':{'sourceUpperCoreWidthMm':140,'authoredUpstandWidthMm':edit['northUpstandWidthMm'],
            'centredCoreIncreaseEachFaceMm':(edit['northUpstandWidthMm']-140)/2,
            'floorCollectorUnchangedGlassCavityBrickMm':model['sourceUpperEnvelope']['floorCollectorGlassCavityBrickMm'],
            'portalWrapAdjacentEnvelopeSourceText':model['sourceUpperEnvelope']['portalAdjacentRecipeText'],
            'resolution':'Specialground775portal is preserved. The ordinaryouter/court collector and orthogonalloggiaweatherwall are distinct assemblies; widerupstand room/weatherfaces andthermal/material arrangement require actual scoped coordination, not assumed775coverage.'}}


def _physical_cut_rows(model,raw,metadata):
    rows=[];frame=model['model']
    for name,member in metadata.items():
        a,b=member['physicalStartMm'],member['physicalEndMm'];length=math.dist(a,b);axis=[(v-u)/length for u,v in zip(a,b)];normal=[0,1,0];radial=cross(axis,normal)
        for end,node in enumerate((member['a'],member['b'])):
            wrench=raw['memberEndWrenchesKN_KNmm'][name][6*end:6*end+6];force=wrench[:3];point=a if end==0 else b
            offset=[u-v for u,v in zip(frame.nodes[node],point)];moment=[u+v for u,v in zip(wrench[3:],cross(offset,force))]
            dot=lambda v,w:sum(a*b for a,b in zip(v,w))
            rows.append({'memberId':name,'end':end,'kind':member['kind'],'physicalPointMm':point,
                'breadthMm':member['breadthMm'],'depthMm':member['depthMm'],
                'axialCompressionKN':dot(force,axis)*(1 if end==0 else -1),'shearYKN':dot(force,normal),'shearZKN':dot(force,radial),
                'torsionKNm':dot(moment,axis)/1000,'bendingYKNm':dot(moment,normal)/1000,'bendingZKNm':dot(moment,radial)/1000,
                'globalPhysicalEndWrenchKN_KNm':[*force,*[value/1000 for value in moment]]})
    return rows


def _member_cuts(model,raw):
    return _physical_cut_rows(model,raw,model['members'])


def _cap_cuts(model,raw):
    metadata={};frame=model['model']
    for wall,row in model['wallFrames'].items():
        for side in ('west','east'):
            pier=row[side]['pier'];name=wall+'/'+side+'/finite-cap'
            item=next(member for member in frame.members if member[0]==name)
            _,a,b,matrix=item;point=frame.nodes[b]
            metadata[name]={'a':a,'b':b,'physicalStartMm':[point[0],point[1],pier['capGridAxisZMm']],
                'physicalEndMm':list(point),'breadthMm':600,'depthMm':600,'kind':'source-finite-upper-cap'}
    rows=_physical_cut_rows(model,raw,metadata)
    for row in rows:row['scope']='Only actual finite uppercap gridaxis−405 to top−180. Headmaster−750 eccentricity is transformed to the physicalcut; inherited lowercap transfer, actual fullcap cage, pile interface and soil are not qualified.'
    return rows


def solve_rc_floor_house(model,source,name,structural_solver=solve_joined_rc_floor):
    case=model['houseLoadCase'];boundary=case['boundary'];multipliers={'physical-G':boundary['physicalGFactor'],'native-floor-reconciled':1.,'actual-outer-portal-ground-pressure':1.}
    if boundary['includeExternalGMAXQ']:multipliers.update({'external-GMAX':1.35,'external-Q':1.5})
    context={**source['joined'],'identities':source['identities']};frame=model['model'];original=frame.solve;captured={}
    def record():
        raw=original();captured['last']=raw;return raw
    try:
        frame.solve=record
        result=structural_solver(model,context,name,multipliers)
    finally:frame.solve=original
    cuts=_member_cuts(model,captured['last'])
    result.pop('memberNecessaryScreens',None)
    result['inheritedFourH16StrengthScreensDiscarded']=True
    result['requiresActualWorkedCageStrengthProof']=True
    result['memberCuts']=cuts;result['capCuts']=_cap_cuts(model,captured['last']);result['request']=case;result['caseId']=name
    result['sourceSHA256']=source['identities'];pressure=model['housePressure']
    expected=_origin_wrench(pressure['reconciledFloorRows']);actual=_family_wrench(model,model['families']['native-floor-reconciled'])
    difference=[a-b for a,b in zip(actual,expected)]
    if max(abs(value) for value in difference)>1e-6:raise ValueError('Reconciled native floor pressure loses force/first moment or3370→3270eccentricwork')
    result['nativeFloorLoadWorkResidualKN_KNm']=difference
    result['pressureBoundary']=pressure
    result['condensedSystemStrainEnergyKNmm']=result.pop('strainEnergyKNmm')
    result['recoveredCondensedSystemInternalEnergyKNmm']=result.pop('recoveredInternalStrainEnergyKNmm')
    result['energyScope']='Exact reduced-system work balance. Internally applied floorpressure has a load-only condensation energy constant not recovered here; this is not totalphysical floor strainenergy.'
    floor=model['joinedFloor']['floor'];balance=[0.]*6
    for i,row in enumerate(result['floorInterfacePorts']):
        applied=floor['condensedForceKN'][3*i:3*i+3];old=row['forceOnFloorKN_KNm'];force=[old[0]-applied[0],old[1]-applied[1],0.];mz=old[5]-applied[2]
        row['forceOnFloorKN_KNm']=[*force,0,0,mz]
        value=_wrench_at(force,row['physicalPointMm'],[0,0,0]);value[5]+=mz*1000;balance=[a+b for a,b in zip(balance,value)]
    external_plane=_origin_wrench(pressure['reconciledFloorRows'],3270)
    residual=[*(balance[i]+external_plane[i] for i in range(3)),*(balance[i]/1000+external_plane[i] for i in range(3,6))]
    if max(abs(value) for value in residual)>1e-5:raise ValueError('Loaded floor component interface pressure equilibrium fails')
    result['floorInterfaceWrenchResidualKN_KNm']=residual
    result['nativePressureChoicesSupported']=96
    result['nativePressureChoiceScope']='96source programme identities supported; pairedcourtprojection differs only in omittedroof duties. This result executes only its named current choice.'
    result['schedule']=rc_house_schedule(model)
    result['completeHouseProof']=False;result['installedAcceptance']=False;result['candidateAccepted']=False;result['roofAdoption']=False
    return result


def rc_floor_house_diagnostics():
    return [
        'This authored structural successor reuses the actual native floor/grid/portal builder. Width edits regenerate finite post/ring/upstand sections, all own RC/infill mass, finite contact/shear face quadrature, cap containment and the same perforated floor condensation. No copied house or extra material stiffness is substituted.',
        'The full3D200mm upstand exclusively owns its widened centralnorth strips. Old140mm band/chord stiffness and additional CSTfield inside the200mm strip are absent. Other source floorbands stay140mm and retain actual aperture guards.',
        'The source firstfloor P1=qL(rr−base)/2 already includes a gross lower-wall contribution. Over the actual loaded outerportal territory that lower contribution is removed at its exact firstfloor station, then actual open-portal solid-face and3170→ff slab-edge pressure are applied to the finite RC body. Other faces retain their native source resultant. No filled-opening counterweight or P0/roof/fixed-base increment is imported.',
        'All96 source programme identities are supported through the SAME staged floor.boundaryCase.windIndex. A result claims only its executed case. The pairedcourtProjection flag affects omittedroof duties; actual courtyardface pressure is a separate unresolved challenge and is not silently added.',
        'The nativeff3370 to membrane3270 eccentricwork is conserved explicitly. Centralnorth offsets enter actual finite upstand torsion stations; other face offsets retain the declared source Lface projection. Local vertical slab/collector transfer outside the workedupstand remains unproved.',
        'Exact active positive-affine normal contact compatibility is not installed pressure resistance. Maxnormalpressure, contactarea, rockinggap, source global forces, fourLties and all physical signedmembercuts are reported. Actual bedding/concretebearing, positive key/free-travel and water/air continuity are independent proof obligations.',
        'The old fourH16 resistance screens are discarded for this candidate. Actual worked fourH12 cage geometry,45nominal/40minimum cover, roundedlinks,69/85mm barfaces, contactlaps, terminationaboveDPC and shear/torsion/bend proofs require their own source-bound method. AuthoredEI/torsion factors are comparison laws, not a derived crackedsection acceptance.',
        'The290core plus202.5cellularglass and40mineral lining eachface retains the source775specialgroundportal. This costs15.625percent of the original240mm faceglass. Thermal/glass/material/fire acceptance is absent; radialwrap/rawarch is unchanged.',
        'The special775groundportal does not resolve the ordinaryupperwall. The workedcentred200upstand expands30mm eachface relativeto140core. The outer/court collector110glass and orthogonalloggiaweather200glass describe distinct adjacent assemblies; actualupper room/weatherfaces need scopedcoordination, not a fabricatedsourceconflict or invented unchangedenvelope.',
        'PhysicalGcontains only the authored RCunion and gravity-only infill. Glass/lining minimumG is not credited. Native slabGMAX overlap, adjacent loggiasidewalls, unjoined receiving duties, fullfloorgravity/verticalplate and roof loads stay withheld; optionalupperGMAX/Q is a strengthchallenge, not retainedminimumG.',
        'Reduced-system work/energy is checked with actual loadedfloor condensation. The load-only internal condensation constant is not recovered, so reduced-system strainenergy is not totalphysical floor energy.',
        'The model retains52ideal translation-restrained/free-rotation heads and inherited lowercap transfer assumptions. It does not accept soil/settlement, source foundation resistance, the raised715groundproposal, owner transom appearance, installed connections or the completehouse. All28 canonical complete receiving duties remain open.'
    ]


def run_rc_floor_house_case(case,source,name):
    model=build_rc_floor_house(case,source);result=solve_rc_floor_house(model,source,name)
    from joined_rc_floor_views import draw_joined_rc_floor
    return {'schema':'str-rc-floor-house-load-result/1','sourceSHA256':source['identities'],'request':case,'native':result,
        'schedule':rc_house_schedule(model),'floor':model['joinedFloor']['floor'],'diagnostics':rc_floor_house_diagnostics(),
        'unresolvedReceivingPorts':native_intermediate_support_ports(source['joined']['floor']),'drawings':{'floor.svg':draw_joined_rc_floor(model,result)},
        'completeReceivingPaths':0,'unresolvedReceivingPortCount':28,'completeHouseProof':False,'roofAdoption':False,'installedAcceptance':False,'candidateAccepted':False,'ownerAppearanceApproval':False}


if __name__=='__main__':
    source=load_rc_floor_house_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_rc_floor_house_case(source),allow_nan=False))
    elif not sys.argv[1:]:
        request=json.load(sys.stdin)
        if set(request)!={'case','name'} or not isinstance(request['name'],str):raise ValueError('Exact current case and case name required')
        print(json.dumps(run_rc_floor_house_case(request['case'],source,request['name']),allow_nan=False))
    else:raise SystemExit('Use --read or provide current case/name on stdin')
