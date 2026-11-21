"""Ordinary upper masonry seats and gravity in the real floor/roof/52-head model.

This extends, rather than overwrites, the retained bilateral-roof control. The
seat is an openly axial point-bearing idealisation of a finite footprint: it
does not qualify pad pressure, rotation, sliding, friction or masonry stability.
"""
import copy
import hashlib
import json
import math
from pathlib import Path
import sys

from foundation_solid_weight import add_foundation_solid_weight, subtract_box
from lower_core_bodies import add_lower_core_bodies, serial_body_law
from masonry_frame_a import (load_masonry_frame_a_source, reference_masonry_frame_a_case,
    _build_masonry_portal, _add_lower_l_weight, finish_masonry_frame_a)
from named_plate_load import patch_force, condense_named_force, recover_named_loads
from rc_floor_house_loads import _add, _family_wrench, _beam_point, _consistent_line, _upstand_member
from roof_bearing_trace import ring_vertical_trace
from roof_floor_compatibility import (roof_floor_receiver_points, build_roof_only_operator,
    _roof_energy_modes, _add_upper_L, roof_pressure_load, finish_roof_floor_coupling, reference_roof_coupling_settings)
from upper_masonry_inventory import upper_clear_core_inventory
from vertical_rc_floor import build_vertical_rc_floor, solve_vertical_rc_floor, fresh_net_floor_live_load

METHOD = 'project/str/studies/upper_roof_bearing.py'
EXTRA = [METHOD, 'project/str/studies/named_plate_load.py',
    'project/str/studies/upper_masonry_inventory.py', 'project/str/studies/roof_bearing_trace.py']


def load_source(root):
    root=Path(root);base=load_masonry_frame_a_source(root)
    return {'root':root,'base':base,'identities':{**base['identities'],
        **{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in EXTRA}}}


def reference_case(source):
    seats=[]
    for row in roof_floor_receiver_points(source['root']):
        xy=list(row['xyMm'])
        if xy==[4700,11667.5]:xy[0]=4500.
        if xy==[11667.5,6000]:xy[1]=6100.
        # Keep the whole pad on a represented straight ring segment rather
        # than inventing material/pressure transfer in a court corner joint.
        if xy in ([3917.5,3917.5],[3917.5,8082.5]):xy[0]=4050.
        if xy in ([8082.5,3917.5],[8082.5,8082.5]):xy[0]=7950.
        seats.append({'id':row['id'],'xyMm':xy,'padWidthMm':100.,'settingToleranceMm':10.})
    roof=reference_roof_coupling_settings(source['root']);roof.pop('intermediateSupportLaws')
    return {'schema':'str-upper-masonry-roof-bearing-case/1','sourceSHA256':source['identities'],
        'masonryCase':reference_masonry_frame_a_case(source['base']),'seats':seats,
        'roofControls':roof,
        'masonryUnitWeightKNPerM3':20.,'masonryModulusMPa':3000.,
        'jointNormalComplianceMmPerMPa':.1,'padThicknessMm':10.,'padUnitWeightKNPerM3':78.5,
        'use':'unselected-upper-clear-masonry-and-axial-roof-seat-comparison'}


def _admit(case,source):
    if source['identities']!=load_source(source['root'])['identities']:
        raise ValueError('Stale current upper-bearing method/source; refresh explicitly')
    expected=reference_case(source)
    if not isinstance(case,dict) or set(case)!=set(expected) or any(case[k]!=expected[k] for k in ('schema','sourceSHA256','use')):
        raise ValueError('Exact current upper-bearing source and authored case required')
    for key,lo,hi in [('masonryUnitWeightKNPerM3',0,30),('masonryModulusMPa',100,30000),
            ('jointNormalComplianceMmPerMPa',.001,10),('padThicknessMm',5,20),('padUnitWeightKNPerM3',0,90)]:
        v=case[key]
        if type(v) not in (int,float) or not math.isfinite(v) or not lo<=v<=hi:raise ValueError('Unsupported explicit upper-bearing control: '+key)
    seats=case['seats']
    if not isinstance(seats,list) or len(seats)!=18 or {r.get('id') for r in seats if isinstance(r,dict)}!={r['id'] for r in expected['seats']}:
        raise ValueError('All eighteen stable roof bearing IDs required')
    base=case['masonryCase'];reference=expected['masonryCase']
    if not isinstance(base,dict) or set(base)!=set(reference) or any(base[k]!=reference[k] for k in ('schema','sourceSHA256','use')):
        raise ValueError('Exact current masonry frame source and scope required')
    if base['roofCoupling'] is not None:
        raise ValueError('Do not supply superseded intermediate bilateral laws; author roofControls explicitly')
    for key,lo,hi in [('masonrySeatProjectionMm',100,180),('masonryUnitWeightKNM3',15,25)]:
        v=base[key]
        if type(v) not in (int,float) or not math.isfinite(v) or not lo<=v<=hi:raise ValueError('Unsupported masonry frame control: '+key)
    if type(base['abutmentSlices']) is not int or not 4<=base['abutmentSlices']<=48:raise ValueError('Actual bounded abutment slices required')
    roof=case['roofControls'];roof_reference=expected['roofControls']
    if not isinstance(roof,dict) or set(roof)!=set(roof_reference) or any(roof[k]!=roof_reference[k] for k in ('schema','use')):
        raise ValueError('Exact roof controls without superseded intermediate laws required')
    if roof['upperFrameLaw'] is None or roof['upperUnitWeightKNPerM3'] is None:
        raise ValueError('Explicit current upper-L material controls required')
    for key,lo,hi in [('upperUnitWeightKNPerM3',18,30),('roofWindFactor',0,2)]:
        v=roof[key]
        if type(v) not in (int,float) or not math.isfinite(v) or not lo<=v<=hi:raise ValueError('Finite explicit roof control required: '+key)


def _build_base(case,source):
    """Same specialist assembly, with moved physical feet retained before Schur."""
    base=copy.deepcopy(case['masonryCase']);base['roofCoupling']=None
    receivers=[{'id':r['id'],'xyMm':r['xyMm']} for r in case['seats']]
    model=build_vertical_rc_floor(base['verticalCase'],source['base']['vertical'],retained_point_receivers=receivers,
        portal_builder=lambda inner,inner_source:_build_masonry_portal(base,source['base'],inner,inner_source))
    from court_corner_closure import apply_court_corner_closure
    if base['courtCornerClosure'] is not None:apply_court_corner_closure(model,source['base'],base['courtCornerClosure'],base['foundationWeight'])
    _add_lower_l_weight(model,base['lowerLWeight']);add_lower_core_bodies(model,source['base'],base['lowerCoreBodies'])
    model['foundationWeight']=add_foundation_solid_weight(model,source['base'],base['foundationWeight'])
    return model


def _add_roof(model,case,source,inventory):
    setting=copy.deepcopy(case['roofControls'])
    operator=build_roof_only_operator(source['base']['roof'],setting['ringPlanEIRatio'],setting['ridgeJointKRatio'])
    p=operator['scope'];frame=model['model'];ring_nodes={tuple(point):frame.node(
        'JOINED-ROOF/ring/'+','.join(f'{v:g}' for v in point),[*point,p['rr']]) for point in operator['ringPointsXYMm']}
    modes,error=_roof_energy_modes(operator['condensedStiffnessKN'])
    for index,mode in enumerate(modes):
        terms=[]
        for i,point in enumerate(operator['ringPointsXYMm']):
            ux,uy,rz,down,sx,sy=mode[6*i:6*i+6]
            terms.append((ring_nodes[tuple(point)],[ux,uy,-down,-sy,sx,rz]))
        frame.springs.append({'id':'JOINED-ROOF/energy/'+str(index),'terms':terms,'stiffness':1.,'mode':'bilateral','gap':0.})
    upper,upper_g=_add_upper_L(model,operator,ring_nodes,setting)
    receivers=[];seat_records=[];g=model['families']['physical-G']
    columns={r['id']:r for r in inventory['seatColumns']}
    for index,seat in enumerate(case['seats']):
        identifier=seat['id'];x,y=seat['xyMm'];column=columns[identifier]['boxXYZMm'];area=seat['padWidthMm']**2
        trace=model['verticalFloor']['retainedPointReceivers'][identifier]
        if not trace['physicalPlateParticipation']['physicalTraceConfirmed']:raise ValueError('No actual plate seat trace')
        ring_trace=ring_vertical_trace(p['rings'],ring_nodes,[x,y])
        half=seat['padWidthMm']/2+seat['settingToleranceMm']
        try:
            for dx in (-half,half):
                for dy in (-half,half):ring_vertical_trace(p['rings'],ring_nodes,[x+dx,y+dy])
        except ValueError as error:raise ValueError('Complete bearing envelope leaves represented ring: '+identifier) from error
        height=column[5]-column[2];weight=area*height/1e9*case['masonryUnitWeightKNPerM3']
        pad_g=area*case['padThicknessMm']/1e9*case['padUnitWeightKNPerM3']
        law=serial_body_law(area,height,case['masonryModulusMPa'],case['jointNormalComplianceMmPerMPa'],weight)
        top=frame.node('UPPER-CORE/body-top/'+str(index),[x,y,column[5]])
        for axis in (0,1,3,4,5):frame.fixed[top,axis]=0.
        frame.springs.append({'id':'UPPER-CORE/axial/'+str(index),'terms':[(top,[0,0,1,0,0,0]),
            *[(n,[-v for v in r]) for n,r in trace['terms']]],'stiffness':law['bodyAxialStiffnessKNPerMm'],'mode':'bilateral','gap':0.})
        spring_id='UPPER-CORE/roof-contact/'+str(index)
        frame.springs.append({'id':spring_id,'terms':[*ring_trace,(top,[0,0,-1,0,0,0])],
            'stiffness':law['topContactStiffnessKNPerMm'],'mode':'compression','gap':0.})
        _add(g,top,[0,0,-weight/2-pad_g,0,0,0])
        for node,row in trace['terms']:_add(g,node,[-weight/2*v for v in row])
        receivers.append({'id':identifier,'springId':spring_id,'xyMm':[x,y],'roofNode':None,'roofTrace':ring_trace,
            'plateTrace':{k:v for k,v in trace.items() if k!='terms'},
            'law':{'mode':'compression','stiffnessKNPerMm':law['topContactStiffnessKNPerMm']},'physicalAcceptance':False})
        seat_records.append({'id':identifier,'bodyTopNodeId':top,'bodySpringId':'UPPER-CORE/axial/'+str(index),
            'pointXYMm':[x,y],'areaMm2':area,'bodyHeightMm':height,'bodyPhysicalGKN':weight,'padPhysicalGKN':pad_g,
            'bodyLaw':law,'padDisposition':'bedded/retained on masonry; continuous ring slides over it',
            'finiteFootprintPressureAndRotationQualified':False,'padFrictionAndSlidingQualified':False})
    floor=model['houseLoadCase']['joinedCase']['floor'];pressure=roof_pressure_load(operator,floor['boundaryCase']['windIndex']);additional={}
    def mapped(vector,target,factor=1.):
        for i,point in enumerate(operator['ringPointsXYMm']):
            ux,uy,rz,down,sx,sy=[factor*float(v) for v in vector[6*i:6*i+6]]
            _add(target,ring_nodes[tuple(point)],[ux,uy,-down,-sy,sx,rz])
    mapped(pressure['condensedForceKN'],additional,setting['roofWindFactor'])
    stock=surface=None
    if setting['roofSteelGravity'] is not None:
        from roof_stock_gravity import assemble_roof_stock_gravity
        stock=assemble_roof_stock_gravity(operator,setting['roofSteelGravity']);mapped(stock['condensedForceKN'],g)
    if setting['roofSurfacePressure'] is not None:
        from roof_surface_pressure import assemble_roof_surface_pressure
        surface=assemble_roof_surface_pressure(operator,setting['roofSurfacePressure']);mapped(surface['condensedForceKN'],additional)
    model['roofFloorCoupling']={'settings':setting,'operator':operator,'pressure':pressure,'ringNodes':ring_nodes,
        'upperL':upper,'receivers':receivers,'upperLPhysicalGKN':upper_g,'additionalNodalLoads':additional,
        'stockGravity':stock,'surfacePressure':surface,'energyModeReconstructionRelativeError':error,'roofGravityIntegrated':False}
    return seat_records


def _free_top_load(model,inventory):
    data=model['verticalFloor'];density=inventory['densityKNPerM3'];patches=[]
    for index,row in enumerate(inventory['freeTopBodyBoxes']):
        a,b,c,d,e,f=row['boxXYZMm'];patches.append({'id':'UPPER-FREE/'+str(index),
            'rectangleXYMm':[a,b,d,e],'pressureKNPerMm2':(f-c)*density/1e9})
    load=patch_force(data['operator']['assembled'],patches);condensed=condense_named_force(data['operator'],load['force'])
    for index,value in enumerate(condensed['condensedForceKN']):
        for node,row in data['portTerms'][index]:_add(model['families']['physical-G'],node,[value*v for v in row])
    missing=[];beam_g=0.;beam_distributed=[];end_joint_point=[]
    for patch in patches:
        r=patch['rectangleXYMm'];parts=[{'boxXYZMm':[r[0],r[1],0,r[2],r[3],1]}]
        for cell in data['cells']:
            parts=[{'boxXYZMm':piece} for row in parts for piece in subtract_box(row['boxXYZMm'],[cell[0],cell[1],0,cell[2],cell[3],1])]
            if not parts:break
        for row in parts:
            a,b,_,c,d,_=row['boxXYZMm'];point=[(a+c)/2,(b+d)/2,3370.];weight=(c-a)*(d-b)*patch['pressureKNPerMm2']
            owners=[north for north in data['northUpstandStrips'] if north['rectangleXYMm'][0]<=a and north['rectangleXYMm'][1]<=b and north['rectangleXYMm'][2]>=c and north['rectangleXYMm'][3]>=d]
            if len(owners)==1:
                wall=owners[0]['wallId'];members=[(name,m) for name,m in model['members'].items() if name.startswith(wall+'/upstand/')]
                cuts=sorted({a,c,*[x for _,m in members for x in (m['physicalStartMm'][0],m['physicalEndMm'][0]) if a<x<c]})
                line_density=(d-b)*patch['pressureKNPerMm2']
                for low,high in zip(cuts,cuts[1:]):
                    x=(low+high)/2;name,member=_upstand_member(model,wall,x)
                    if member is None:
                        # The actual end-zone strip loads the existing end joint;
                        # this is not a distributed cut in an invented beam.
                        _beam_point(model,model['families']['physical-G'],'physical-G',wall,[x,point[1],3370.],[0,0,-line_density*(high-low)])
                        end_joint_point.append({'wallId':wall,'intervalXMm':[low,high],'physicalGKN':line_density*(high-low),
                            'localJointRecoveryQualified':False})
                    else:
                        p=member['physicalStartMm'];normal_offset=point[1]-p[1]
                        _consistent_line(model,model['families']['physical-G'],'physical-G',name,member,
                            low-p[0],high-p[0],[0,0,-line_density],[-normal_offset*line_density,0,0])
                        beam_distributed.append({'memberId':name,'intervalXMm':[low,high],
                            'lineDownKNPerMm':line_density,'normalOffsetMm':normal_offset})
                beam_g+=weight
            else:missing.append({'patchId':patch['id'],'rectangleXYMm':[a,b,c,d],'physicalGKN':weight,'pointXYMm':point[:2]})
    load.update(northBeamPhysicalGKN=beam_g,unroutedBodies=missing,
        northBeamDistributedLoads=beam_distributed,northEndJointPointLoads=end_joint_point,
        unroutedPhysicalGKN=math.fsum(r['physicalGKN'] for r in missing),condensation=condensed)
    if abs(load['uncoveredDownKN']-beam_g-load['unroutedPhysicalGKN'])>1e-6:raise ValueError('Upper body plate/beam/missing load partition loses mass')
    return load


def run(case,source,name):
    _admit(case,source);model=_build_base(case,source);frame=model['model']
    before=_family_wrench(model,model['families']['physical-G'])
    h=json.loads((source['root']/'project/had/studies/water-replan.json').read_text())['model']
    floor_source=source['base']['vertical']['parent']['house']['joined']['floor']
    rectangles=[r for corner in model['joinedFloor']['corners'] for r in corner['rectangles']]
    inventory=upper_clear_core_inventory(h,floor_source['retained']['policy']['axes'],rectangles,case['seats'],
        case['masonryUnitWeightKNPerM3'],pad_depth=case['padThicknessMm'])
    seats=_add_roof(model,case,source,inventory);free=_free_top_load(model,inventory)
    # The source material ledger is independent of the assembled nodal loads.
    after=_family_wrench(model,model['families']['physical-G']);observed=[b-a for a,b in zip(before,after)]
    roof_data=model['roofFloorCoupling'];expected=[0.]*6
    def gravity_origin(weight,point):
        expected[2]-=weight;expected[3]-=weight*point[1]/1000;expected[4]+=weight*point[0]/1000
    for body in inventory['bodyBoxes']:
        a,b,c,d,e,f=body['boxXYZMm'];gravity_origin((d-a)*(e-b)*(f-c)/1e9*case['masonryUnitWeightKNPerM3'],[(a+d)/2,(b+e)/2])
    for pad in inventory['padBoxes']:
        a,b,c,d,e,f=pad['boxXYZMm'];gravity_origin((d-a)*(e-b)*(f-c)/1e9*(case['padUnitWeightKNPerM3']-case['masonryUnitWeightKNPerM3']),[(a+d)/2,(b+e)/2])
    for body in free['unroutedBodies']:gravity_origin(-body['physicalGKN'],body['pointXYMm'])
    for member in roof_data['upperL']:
        p,q=member['physicalStartXYZMm'],member['physicalEndXYZMm'];gravity_origin(member['physicalSelfGKN'],[(p[0]+q[0])/2,(p[1]+q[1])/2])
    stock=roof_data['stockGravity']
    if stock is not None:
        from roof_stock_gravity import serial_roof_stock_gravity
        ledger=serial_roof_stock_gravity(stock)
        for origin in ledger['origins']:gravity_origin(-origin['forceKN'][2],origin['pointXYZMm'])
    origin_residual=[a-b for a,b in zip(observed,expected)]
    if max(abs(v) for v in origin_residual)>1e-6:raise ValueError('Upper body/pad/roof gravity loses independent force or first moments: '+str(origin_residual))
    total=-math.fsum(row[2] for row in model['families']['physical-G'].values())
    model['verticalFloor']['mass'].update(joinedPhysicalGKN=total,
        appliedPhysicalGKN=total*model['houseLoadCase']['boundary']['physicalGFactor'],
        upperClearMasonryPhysicalGKN=inventory['masonryPhysicalGKN']-free['unroutedPhysicalGKN'],
        upperBearingPadsPhysicalGKN=math.fsum(r['padPhysicalGKN'] for r in seats))
    captured={}
    native=solve_vertical_rc_floor(model,source['base']['vertical'],name,
        model['roofFloorCoupling']['additionalNodalLoads'],result_observer=lambda r:captured.update(raw=r))
    raw=captured['raw'];u=[sum(v*raw['displacements'][n][axis] for n,row in terms for axis,v in enumerate(row)) for terms in model['verticalFloor']['portTerms']]
    factor=model['houseLoadCase']['boundary']['physicalGFactor'];live=fresh_net_floor_live_load(model)
    native['plate']['physicalRecovery']=recover_named_loads(model['verticalFloor']['operator'],u,
        factor+live['pressureRatioToSelfG'],[(free['force'],factor)])
    result=finish_masonry_frame_a(model,source['base'],native)
    roof_result=finish_roof_floor_coupling(model,raw)
    roof_result['diagnostics']=[
        'Continuous inherited roof ring on actual clear-masonry axial seats; four finite RC L paths retain uplift/lateral duties. No intermediate tensile bearing is credited.',
        'All actual upper service holes and arch reservations omit their full-height projected clear columns. Sill/head/spandrel/finish mass and wall lateral stability remain outside this inventory.',
        'Eighteen axial point-bearing columns are a declared mechanical comparison. Full pad pressure/rotation, sliding/friction and installed stiffness/material resistance remain unqualified.',
        'Named ordinary-wall gravity uses the actual plate load operator and particular displacement/bending recovery. North-upstand gravity uses partitioned distributed loads; end-zone joints remain explicit point introductions.',
        'Lower P0, complete weather-layer gravity and aerodynamic combinations, four-L/north-frame/floor reinforcement, local foundation resistance and moisture/thermal continuity still prevent house selection.']
    springs={r['id']:r for r in raw['springs']}
    for seat,receiver in zip(seats,roof_result['receivers']):
        seat.update(contactActive=receiver['active'],contactCompressionKN=-receiver['forceKN'],
            bodyAxialCompressionKN=-springs[seat['bodySpringId']]['forceKN'])
        if seat['contactCompressionKN'] < -1e-7:raise ValueError('Masonry roof seat supplied fictitious tensile retention')
    result.update(schema='str-upper-masonry-roof-bearing-result/1',sourceSHA256=source['identities'],request=case,
        roofCoupling=roof_result,upperMasonry={'inventory':inventory,'seats':seats,
            'addedPhysicalFamilyWrenchKN_KNm':observed,'sourceGravityWrenchKN_KNm':expected,
            'sourceSelfGAndFirstMomentResidualKN_KNm':origin_residual,
            'freeTopPlateLoad':{k:v for k,v in free.items() if k not in ('force','condensation')},
            'namedPlateCondensation':free['condensation'],'allIntermediateRoofTensionRemoved':True,
            'retainedFloorPointCount':len(model['verticalFloor']['retainedPointReceivers']),
            'finiteFootprintPressureAndRotationQualified':False,'wholeUpperWallInventoryComplete':False,
            'lowerP0Integrated':False,'candidateAccepted':False})
    svg=roof_result.pop('roofSvg')
    svg=svg.replace('ACTUAL ROOF / RC200 FLOOR / 52-HEAD COUPLED CONTROL','MASONRY ROOF SEATS / RC200 FLOOR / ACTUAL 52 HEADS')
    svg=svg.replace('18 explicit axial paths','18 compression-only masonry seats')
    svg=svg.replace('Brown dashed: unqualified axial work paths.','Brown dashed: axial masonry seats; no intermediate tension.')
    svg=svg.replace('Modeled steel G is joined; weather-layer G and ordinary lower P0 remain absent.',
        f'Ordinary clear masonry G {inventory["masonryPhysicalGKN"]:.3f} kN is joined; lower P0/weather layers remain absent.')
    result['drawings']['upper-roof-bearing.svg']=svg
    result['drawings'].pop('masonry-frame-a-roof.svg',None)
    result['completeHouseProof']=False
    return result


if __name__=='__main__':
    source=load_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_case(source),allow_nan=False))
    else:
        request=json.load(sys.stdin)
        if set(request)!={'case','name'}:raise ValueError('Exact authored case/name required')
        print(json.dumps(run(request['case'],source,request['name']),allow_nan=False))
