"""Actual coupled floor-section successor, using the existing physical solvers.

The named source pressure programme retains its authored origins. Finish/FFL,
stairs, services and revised aerodynamic tributaries are explicitly unadopted.
"""
import copy
import hashlib
import json
import math
from pathlib import Path
import sys

from continuous_rc_portal import solve_continuous_rc_case
from floor_section_successor import replace_floor_section, necessary_strain_section
from joined_successor_kernel import l_section
from joined_successor_compatibility import _wrench_at
from named_plate_load import recover_named_loads
from plate_bending_recovery import recover_plate_bending
from floor_reinforcement import assess_floor_reinforcement
from rc_floor_house_loads import (_add, recovered_member_actions, _member_cuts,
    _interior_member_cuts, _cap_cuts, _adjacent_grid_cuts, _family_wrench)
from roof_floor_compatibility import finish_roof_floor_coupling
from upper_masonry_inventory import upper_clear_core_inventory
from upper_roof_bearing import load_source as load_bearing_source, _admit, _build_base, _add_roof, _free_top_load
from upper_roof_bearing_proof import worked_case
from vertical_floor_numerics import solve_vertical_frame
from vertical_rc_floor import fresh_net_floor_live_load
from vertical_floor_views import draw_vertical_floor

METHOD='project/str/studies/floor_section_model.py'
EXTRA=(METHOD,'project/str/studies/floor_section_successor.py')


def load_source(root):
    root=Path(root);bearing=load_bearing_source(root)
    return {'root':root,'bearing':bearing,'identities':{**bearing['identities'],
        **{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in EXTRA}}}


def reference_case(source):
    return {'schema':'str-coupled-floor-section-case/1','sourceSHA256':source['identities'],
        'bearingCase':worked_case(source['bearing']),'thicknessMm':200.,
        'use':'unselected-source0-section-replacement-with-fixed-origin-load-controls'}


def _replace_upper_L_start(model,case,new_bottom):
    frame=model['model'];data=model['roofFloorCoupling'];setting=case['roofControls'];total=0.
    floor=model['houseLoadCase']['joinedCase']['floor'];corners={c['id']:c for c in model['joinedFloor']['corners']}
    for row in data['upperL']:
        corner=corners[row['cornerId']];origin=corner['originXYMm'];sx=1 if origin[0]<6000 else -1;sy=1 if origin[1]<6000 else -1
        local=[]
        for a,b,c,d in corner['rectangles']:
            xs=sorted(((a-origin[0])*sx,(c-origin[0])*sx));ys=sorted(((b-origin[1])*sy,(d-origin[1])*sy));local.append([xs[0],ys[0],xs[1],ys[1]])
        section=l_section(min(r[0] for r in local),floor['cornerWidthsMm'][corner['id']],max(r[2] for r in local))
        if sorted(local)!=sorted([list(r) for r in section['rectangles']]):raise ValueError('Actual L footprint cannot be reconstructed')
        lower,roof=row['lowerNode'],row['roofNode'];start=[*row['physicalStartXYZMm'][:2],new_bottom];finish=row['physicalEndXYZMm']
        if not start[2]<finish[2]:raise ValueError('No positive upper L height remains')
        for node,wrench in zip((lower,roof),row['equivalentGKN_KNmm']):_add(model['families']['physical-G'],node,[-v for v in wrench])
        frame.members=[m for m in frame.members if m[0]!=row['id']]
        orientation=[sx*section['principalYUV'][0],sy*section['principalYUV'][1],0]
        frame.member(row['id'],lower,roof,section,setting['upperFrameLaw'],physical_start=start,physical_end=finish,y_axis=orientation)
        volume=section['A']*(finish[2]-new_bottom)/1e9;weight=volume*setting['upperUnitWeightKNPerM3'];equivalents=[]
        for node,point in ((lower,start),(roof,finish)):
            wrench=_wrench_at([0,0,-weight/2],point,frame.nodes[node]);_add(model['families']['physical-G'],node,wrench);equivalents.append(wrench)
        row.update(physicalStartXYZMm=start,physicalRCUnionVolumeM3=volume,physicalSelfGKN=weight,equivalentGKN_KNmm=equivalents,
            slabDepthTransfer=f'Explicit candidate rigid corner patch3170..{new_bottom:g}; local shear/joint/cage remains unqualified.')
        total+=weight
    data['upperLPhysicalGKN']=total


def _interface_result(model,raw,midplane):
    data=model['joinedFloor'];u=[sum(c*raw['displacements'][n][axis] for n,row in terms for axis,c in enumerate(row)) for terms in data['portTerms']]
    k=data['floor']['condensedStiffnessKNPerMm'];f=data['floor']['condensedForceKN']
    forces=[sum(a*b for a,b in zip(row,u))-p for row,p in zip(k,f)];rows=[];balance=[0.]*6
    for i,port in enumerate(data['floor']['ports']):
        fx,fy,mz=forces[3*i:3*i+3];point=[*port['originXYMm'],midplane];w=_wrench_at([fx,fy,0],point,[0,0,0]);w[5]+=mz*1000
        for j,v in enumerate(w):balance[j]+=v
        rows.append({'id':port['id'],'physicalPointMm':point,'displacementMmMrad':u[3*i:3*i+3],
            'forceOnFloorKN_KNm':[fx,fy,0,0,0,mz]})
    for load in model['housePressure']['reconciledFloorRows']:
        w=_wrench_at(load['forceKN'],[*load['pointXYZMm'][:2],midplane],[0,0,0])
        for i,v in enumerate(w):balance[i]+=v
    residual=[*balance[:3],*[v/1000 for v in balance[3:]]]
    if max(abs(v) for v in residual)>1e-5:raise ValueError('Actual transformed membrane component loses wrench equilibrium')
    return rows,residual


def _upper_origin_wrench(model,bearing,inventory,free):
    """Physical material ledger independent of assembled equivalent loads."""
    expected=[0.]*6
    def add(weight,point):
        expected[2]-=weight;expected[3]-=weight*point[1]/1000;expected[4]+=weight*point[0]/1000
    for body in inventory['bodyBoxes']:
        a,b,c,d,e,f=body['boxXYZMm'];add((d-a)*(e-b)*(f-c)/1e9*bearing['masonryUnitWeightKNPerM3'],[(a+d)/2,(b+e)/2])
    for body in inventory['padBoxes']:
        a,b,c,d,e,f=body['boxXYZMm'];add((d-a)*(e-b)*(f-c)/1e9*(bearing['padUnitWeightKNPerM3']-bearing['masonryUnitWeightKNPerM3']),[(a+d)/2,(b+e)/2])
    for body in free['unroutedBodies']:add(-body['physicalGKN'],body['pointXYMm'])
    corners={r['id']:r for r in model['joinedFloor']['corners']}
    for row in model['roofFloorCoupling']['upperL']:
        area=sum((r[2]-r[0])*(r[3]-r[1]) for r in corners[row['cornerId']]['rectangles'])
        p,q=row['physicalStartXYZMm'],row['physicalEndXYZMm']
        add(area*(q[2]-p[2])/1e9*bearing['roofControls']['upperUnitWeightKNPerM3'],[(p[0]+q[0])/2,(p[1]+q[1])/2])
    stock=model['roofFloorCoupling']['stockGravity']
    if stock is not None:
        from roof_stock_gravity import serial_roof_stock_gravity
        for origin in serial_roof_stock_gravity(stock)['origins']:add(-origin['forceKN'][2],origin['pointXYZMm'])
    return expected


def run(case,source,name):
    expected=reference_case(source)
    if set(case)!=set(expected) or any(case[k]!=expected[k] for k in ('schema','sourceSHA256','use')):raise ValueError('Exact current explicit floor-section case required')
    if type(case['thicknessMm']) not in (int,float) or not math.isfinite(case['thicknessMm']) or not 200<=case['thicknessMm']<=250:
        raise ValueError('Explicit finite supported200..250mm slab section required')
    if source['identities']!=load_source(source['root'])['identities']:raise ValueError('Stale floor-section source')
    bearing=case['bearingCase'];_admit(bearing,source['bearing']);model=_build_base(bearing,source['bearing'])
    section=replace_floor_section(model,source['bearing'],case['thicknessMm']);frame=model['model'];data=model['verticalFloor'];top=section['topZMm']
    h=json.loads((source['root']/'project/had/studies/water-replan.json').read_text())['model']
    native_floor=source['bearing']['base']['vertical']['parent']['house']['joined']['floor'];rectangles=[r for c in model['joinedFloor']['corners'] for r in c['rectangles']]
    boxes=[]
    for r in data['northUpstandStrips']:
        a,b,c,d=r['rectangleXYMm'];z=r['centroidZMm'];depth=r['depthMm'];boxes.append([a,b,z-depth/2,c,d,z+depth/2])
    inventory=upper_clear_core_inventory(h,native_floor['retained']['policy']['axes'],rectangles,bearing['seats'],
        bearing['masonryUnitWeightKNPerM3'],bottom_z=top,pad_depth=bearing['padThicknessMm'],rc_boxes=boxes)
    before_upper=_family_wrench(model,model['families']['physical-G'])
    seats=_add_roof(model,bearing,source['bearing'],inventory);_replace_upper_L_start(model,bearing,top);free=_free_top_load(model,inventory)
    expected_upper=_upper_origin_wrench(model,bearing,inventory,free)
    after_upper=_family_wrench(model,model['families']['physical-G'])
    section['sourceUpperMaterialResidualKN_KNm']=[b-a-e for a,b,e in zip(before_upper,after_upper,expected_upper)]
    if max(abs(v) for v in section['sourceUpperMaterialResidualKN_KNm'])>1e-6:raise ValueError('Changed upper bodies/pads/roof lose independent material gravity or first moments')
    total=-sum(r[2] for r in model['families']['physical-G'].values());g_factor=model['houseLoadCase']['boundary']['physicalGFactor']
    data['mass'].update(joinedPhysicalGKN=total,appliedPhysicalGKN=total*g_factor,
        upperClearMasonryPhysicalGKN=inventory['masonryPhysicalGKN']-free['unroutedPhysicalGKN'],
        upperBearingPadsPhysicalGKN=sum(s['padPhysicalGKN'] for s in seats))
    live=fresh_net_floor_live_load(model);captured={};original=frame.solve
    def solve():
        for loads in (model['roofFloorCoupling']['additionalNodalLoads'],live['loads']):
            for node,row in loads.items():frame.load(node,row)
        raw=solve_vertical_frame(frame,data);captured['raw']=raw;return raw
    try:
        frame.solve=solve
        portal_source=source['bearing']['base']['vertical']['parent']['house']['joined']['portal']
        native=solve_continuous_rc_case(model,portal_source,name,{'physical-G':g_factor,'native-floor-reconciled':1.,'actual-outer-portal-ground-pressure':1.})
    finally:frame.solve=original
    raw=captured['raw'];multipliers={'physical-G':g_factor,'native-floor-reconciled':1.,'actual-outer-portal-ground-pressure':1.}
    recovered=recovered_member_actions(model,raw,multipliers)
    for key in ('dpc','memberNecessaryScreens','freeFloorPortalStatics','domainReason','bilateralFullContactDomainRejected','freeFloorCompressionOnlyEquilibriumRejected'):native.pop(key,None)
    native.update(schema='str-explicit-section-compatible-frame/1',caseId=name,sourceSHA256=source['identities'],
        memberCuts=_member_cuts(model,recovered),interiorMemberCuts=_interior_member_cuts(model,recovered,multipliers),
        capCuts=_cap_cuts(model,raw),adjacentGridMemberCuts=_adjacent_grid_cuts(model,raw))
    interfaces,residual=_interface_result(model,raw,section['midplaneZMm']);native.update(floorInterfacePorts=interfaces,floorInterfaceWrenchResidualKN_KNm=residual)
    port_u=[sum(v*raw['displacements'][n][axis] for n,row in terms for axis,v in enumerate(row)) for terms in data['portTerms']]
    plate=recover_named_loads(data['operator'],port_u,g_factor+live['pressureRatioToSelfG'],[(free['force'],g_factor)])
    states={r['id']:r for r in raw['springs']};bearings=[]
    for fibre in data['fibres']:
        state=states[fibre['id']];bearings.append({**fibre,'active':state['active'],
            'normalCompressionKN':-state['forceKN'],'normalPressureMPa':-state['forceKN']*1000/fibre['areaMm2']})
    vertical={'schema':'str-explicit-floor-section-vertical/1','request':data['request'],'native':native,'mass':data['mass'],
        'plate':{'physicalRecovery':plate,'cellsXYMm':data['cells'],'holesXYMm':data['holes']},
        'headPositions':[{'id':r['id'],'xyMm':r['xy'],'xyzMm':frame.nodes[r['id']]} for r in model['grid']['heads']],
        'normalCoreGeometry':data['cores'],'northUpstandStrips':data['northUpstandStrips'],
        'principalWetReservationXYMm':data['principalWetReservation'],'missingGroundContactFibres':data['missingGroundContactFibres'],
        'missingGroundContactAreaMm2':sum(r['areaMm2'] for r in data['missingGroundContactFibres']),'bearings':bearings}
    bending=recover_plate_bending(vertical);reinforcement=assess_floor_reinforcement(vertical,bearing['masonryCase']['floorReinforcement'])
    reinforcement['necessaryStrainCompatibleSection']=necessary_strain_section(reinforcement)
    roof=finish_roof_floor_coupling(model,raw);roof.pop('roofSvg');roof['datumsMm']['floorSlabZMm']=[3170.,top];roof['datumsMm']['upperLBodyZMm']=[top,6540.]
    svg=draw_vertical_floor(vertical).replace('RC200 VERTICAL FLOOR',f'RC{case["thicknessMm"]:g} VERTICAL FLOOR').replace('net200mm material',f'net{case["thicknessMm"]:g}mm material')
    # Presentation only: separate the east head labels from the notes and
    # show actual section datums rather than leaving thickness in a title.
    svg=svg.replace('x="865"','x="900"').replace('</svg>',
        f'<text x="35" y="124">RCsoffit3170 / top{top:g} / centroid{section["midplaneZMm"]:g}mm; retainedFFL3450 leaves{section["remainingSourceFinishDepthMm"]:g}mm finish, unadopted.</text></svg>')
    return {'schema':'str-coupled-floor-section-result/1','sourceSHA256':source['identities'],'request':case,
        'floorSection':section,'nativeVertical':vertical,'mass':data['mass'],'plateBending':bending,'floorReinforcement':reinforcement,
        'roofCoupling':roof,'upperMasonry':{'inventory':inventory,'seats':seats,'unroutedPhysicalGKN':free['unroutedPhysicalGKN']},
        'drawings':{'floor-section-floor.svg':svg},'candidateAccepted':False,'completeHouseProof':False,
        'loadControlScope':'The same inherited source-origin facade and roof pressure programme is held as an explicit mechanical control; new aerodynamic tributaries are not adopted.',
        'diagnostics':['Finish/FFL/stair/opening/service coordination is withheld when slab thickness changes. No implied FFL3500 or adopted ceiling/roof edit.',
            'Raw south-corner moments lie beside the rigid L boundary in a narrow source partition. Local stress convergence and physical design-strip demand remain unproved; global thickening is not selected to repair an unqualified point peak.',
            'Slab soffit3170, upper body/L bottoms and actual membrane centroid are transformed. Northern upstands retain their complete bodies once.',
            'The inherited wireframe/section renderer still owns fixed vertical datums; it is not emitted as a current transformed roof drawing.']}


if __name__=='__main__':
    source=load_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_case(source),allow_nan=False))
    else:
        request=json.load(sys.stdin);print(json.dumps(run(request['case'],source,request['name']),allow_nan=False))
