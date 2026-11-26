"""Optional source-bound rear bearing comparison in the actual finite house.

The current 52-head case remains the sole house input. This adapter replaces
only its seated wet beam/posts with source-derived masonry tails and a shorter
ordinary RC lintel. Existing native operators are composed without editing
their bytes. No masonry bending, friction, tension or extra foundation is used.
"""
import copy
import hashlib
import json
import math
from pathlib import Path

from rear_bearing_plan import admit_choices, geometry
from joined_successor_kernel import rectangle_section
from seated_wet_support import (_rectangle_subtract, bearing_quadrature,
    route_free_patch, attachment_station_audit)
from rc_floor_house_loads import _consistent_line, _add, _family_wrench
from vertical_rc_floor import grid_member_geometry, grid_vertical_point_terms, clear_ground_core_rectangles,intersect
from foundation_solid_weight import disjoint_solid_union
from lower_core_bodies import (serial_body_law, ground_receiver_footprints,
    partition_free_body_receivers)

METHOD='project/str/studies/rear_direct_bearing.py'
PLAN='project/str/studies/rear_bearing_plan.py'
RENEWAL='project/ias/studies/selected-family-convergence.json'


def identities(root):
    return {p:hashlib.sha256((Path(root)/p).read_bytes()).hexdigest() for p in (METHOD,PLAN,RENEWAL)}


def _joint_origin(model,member_id,identifier,adapter,point_xy,force_z,actual,family,ledger=None):
    """Verify/coalesce a real coincident-master receiver, never invent a cut."""
    ledger=model['rearDirectJointOrigins'] if ledger is None else ledger
    row=ledger['members'][member_id];node=row['a'];p=model['model'].nodes[node]
    if row['a']!=row['b'] or set(actual)!={node}:
        raise ValueError('Direct joint must retain its one actual common master and complete nodal work map')
    expected=[0.,0.,force_z,(point_xy[1]-p[1])*force_z,(p[0]-point_xy[0])*force_z,0.]
    if any(not math.isfinite(v) for v in [*point_xy,force_z,*actual[node]]) or max(abs(a-b) for a,b in zip(actual[node],expected))>1e-8:
        raise ValueError('Direct-joint physical point force/couple differs from actual coalesced end map')
    ledger['origins'].append({'id':identifier,'adapter':adapter,'memberId':member_id,'jointId':'DIRECT-JOINT/'+node,
        'masterNodeId':node,'masterXYZMm':list(p),'receiverPointXYZMm':[*point_xy,row['topZMm']],
        'forceKN':[0.,0.,force_z],'momentKNmm':[0.,0.,0.],'actualNodalWrenchKN_KNmm':list(actual[node]),'family':family})


def _joint_gravity_adapter(model,adapter,expected):
    ledger=model['rearDirectJointOrigins'];rows=[r for r in ledger['origins'] if r['adapter']==adapter]
    required=[r for r in expected if r['memberId'] in ledger['members']]
    if len({r['id'] for r in rows})!=len(rows) or sorted(r['id'] for r in rows)!=sorted(r['id'] for r in required):
        raise ValueError('Missing or duplicated direct-joint source gravity origin: '+adapter)
    by_id={r['id']:r for r in rows}
    for r in required:
        actual=by_id[r['id']]
        if actual['memberId']!=r['memberId'] or actual['receiverPointXYZMm'][:2]!=r['centroidXYMm'] or abs(actual['forceKN'][2]+r['physicalDownKN'])>1e-9:
            raise ValueError('Direct-joint source gravity quantity or physical position changed')
    if adapter in ledger['adapters']:raise ValueError('Direct-joint gravity adapter completed twice')
    ledger['adapters'][adapter]=copy.deepcopy(required)


def verify_direct_joint_origins(ledger,gravity_factor):
    """Independent physical-origin sum versus actual coalesced nodal cards."""
    if type(gravity_factor) not in (int,float) or not math.isfinite(gravity_factor) or gravity_factor<0:
        raise ValueError('Finite nonnegative direct-joint gravity factor required')
    ids=[r['id'] for r in ledger['origins']]
    if len(set(ids))!=len(ids):raise ValueError('Duplicate direct-joint physical origin')
    totals={}
    for origin in ledger['origins']:
        node=origin['masterNodeId'];p=origin['masterXYZMm'];point=origin['receiverPointXYZMm'];force=origin['forceKN'];moment=origin['momentKNmm']
        if origin['family'] not in ('physical-G','solved-interface'):raise ValueError('Unknown direct-joint physical force family')
        factor=gravity_factor if origin['family']=='physical-G' else 1.
        from joined_successor_kernel import cross
        expected=[*force,*[a+b for a,b in zip(cross([x-y for x,y in zip(point,p)],force),moment)]]
        actual=origin['actualNodalWrenchKN_KNmm']
        if len(actual)!=6 or any(not math.isfinite(v) for v in actual+expected) or max(abs(a-b) for a,b in zip(actual,expected))>1e-8:
            raise ValueError('Direct-joint actual nodal load omission/double count or work mismatch')
        total=totals.setdefault(node,{'physicalOriginWrenchKN_KNmm':[0.]*6,'actualNodalWrenchKN_KNmm':[0.]*6,'originCount':0})
        for i,(a,b) in enumerate(zip(expected,actual)):
            total['physicalOriginWrenchKN_KNmm'][i]+=factor*a;total['actualNodalWrenchKN_KNmm'][i]+=factor*b
        total['originCount']+=1
    for row in totals.values():
        row['sixComponentWorkClosureKN_KNmm']=[a-b for a,b in zip(row['actualNodalWrenchKN_KNmm'],row['physicalOriginWrenchKN_KNmm'])]
        if max(map(abs,row['sixComponentWorkClosureKN_KNmm']))>1e-7:raise ValueError('Direct-joint aggregate work closure fails')
    return totals


def _finish_direct_joints(model,raw,gravity_factor):
    ledger=copy.deepcopy(model['rearDirectJointOrigins']);states={s['id']:s for s in raw['springs']}
    required=['rear-bearing/base-G','lower-core/base-G','lower-core/free-G','foundation/solid-G']
    if any(adapter not in ledger['adapters'] for adapter in required):raise ValueError('Missing direct-joint source adapter completion')
    shadow={**model,'rearDirectJointOrigins':{**ledger,'adapters':{}}}
    for adapter,expected in ledger['adapters'].items():_joint_gravity_adapter(shadow,adapter,expected)
    bodies={r['fibreId']:(i,r) for i,r in enumerate(model['lowerCoreBodies']['contactBodies'])}
    selected=[]
    for fibre in model['verticalFloor']['fibres']:
        member=fibre['gridMemberId']
        if member not in ledger['members']:continue
        index,body=bodies.get(fibre['id'],(None,None));spring_id=fibre['id'] if index is None else 'LOWER-CORE/axial/'+str(index)
        spring=states[spring_id];node=ledger['members'][member]['a'];actual={node:[0.]*6}
        for n,row in spring['terms']:
            if n==node:
                for i,v in enumerate(row):actual[node][i]-=spring['forceKN']*v
        _joint_origin(model,member,'solved/'+spring_id,'source-normal/solved-body',fibre['xyMm'],spring['forceKN'],actual,'solved-interface',ledger)
        selected.append({'fibreId':fibre['id'],'actualSpringId':spring_id,'memberId':member})
    for fibre in model['rearDirectBearing']['bearingBodies']:
        member=fibre['receiverId']
        if member not in ledger['members']:continue
        node=ledger['members'][member]['a'];spring=states[fibre['id']+'/body'];actual={node:[0.]*6}
        for n,row in spring['terms']:
            if n==node:
                for i,v in enumerate(row):actual[node][i]-=spring['forceKN']*v
        _joint_origin(model,member,'solved/'+spring['id'],'rear-bearing/solved-body',fibre['xyMm'],spring['forceKN'],actual,'solved-interface',ledger)
    totals=verify_direct_joint_origins(ledger,gravity_factor)
    return {**ledger,'jointTotals':totals,'actualNormalFibres':selected,
        'jointDemandResistanceRecoveryQualified':False,'beamInteriorCutsInvented':False,
        'scope':'Complete captured physical-G and solved normal/body origins on actual coincident-master grid zones. Six-component end maps coalesce at the existing named head; forces are not reapplied. Internal joint stress/cut allocation and cap/pile resistance remain unqualified.'}


class DirectBearing:
    def __init__(self, choices, plan, masonry_law, density, original_cores=()):
        self.choices=admit_choices(choices);self.plan=plan
        self.law=masonry_law;self.density=density;self.model=None
        if self.choices['masonryUnitWeightKNPerM3']!=density:
            raise ValueError('New wall and actual inherited lower-body density must match')
        # The short lintel nicks the existing transverse rear wall at its
        # southern T. Retain those real masonry wings below the beam; do not
        # overlap the new concrete with full-height source body columns.
        wings=[]
        for row in original_cores:
            overlap=intersect(row['rectangleXYMm'],plan['lintelRectangleXYMm'])
            if row['materialKind']!='source-core-material-unqualified' or overlap is None:continue
            wings.extend(_rectangle_subtract({**row,'rectangleXYMm':overlap},[plan['wallRectangleXYMm']]))
        union=disjoint_solid_union([{'id':r['id'],'kind':'retained-transverse-masonry-seat',
            'boxXYZMm':[*r['rectangleXYMm'][:2],0.,*r['rectangleXYMm'][2:],1.]} for r in wings])
        self.wings=[[b['boxXYZMm'][i] for i in (0,1,3,4)] for b in union]
        self.seats=[*plan['bearingRectanglesXYMm'],*self.wings]

    def build(self, model, required=()):
        if 'rearDirectBearing' in model or 'seatedWetSupport' in model:
            raise ValueError('Rear bearing replacement cannot be applied twice')
        self.model=model;c=self.choices;p=self.plan;frame=model['model'];loads=model['families']['physical-G']
        old_wrench=_family_wrench(model,loads);x=p['axisXMm'];r=p['lintelRectangleXYMm'];lo,hi=r[1],r[3]
        z=(p['lintelTopZMm']+p['lintelBottomZMm'])/2
        # Every pad/bearing quadratureY is a real member station. This prevents
        # within-element spring forces being mistaken for endpoint-only cuts.
        samples=[]
        for side,rectangle in enumerate(self.seats):
            for i,(px,py,area) in enumerate(bearing_quadrature(rectangle,c['bearingQuadratureOrder'])):
                samples.append({'id':f'REAR-BEARING/{side}/{i}','xyMm':[px,py],
                    'areaMm2':area,'side':side})
        axes={lo,hi,*[f['xyMm'][1] for f in samples],*required}
        if any(not lo<=a<=hi for a in axes):raise ValueError('Real lintel attachment station leaves its body')
        for a,b in zip(sorted(axes),sorted(axes)[1:]):
            n=max(1,math.ceil((b-a)/c['maxBeamPitchMm']))
            axes.update(a+(b-a)*i/n for i in range(1,n))
        stations=[{'u':u,'node':frame.node('REAR-LINTEL/section/'+str(u),[x,u,z])} for u in sorted(axes)]
        names=[];width=c['lintelWidthMm'];depth=c['lintelDepthMm'];law=model['request']['frameLaw']
        for i,(a,b) in enumerate(zip(stations,stations[1:])):
            name='REAR-LINTEL/member/'+str(i);names.append(name)
            frame.member(name,a['node'],b['node'],rectangle_section(depth,width),law,y_axis=[1,0,0])
            member={'a':a['node'],'b':b['node'],'physicalStartMm':list(frame.nodes[a['node']]),
                'physicalEndMm':list(frame.nodes[b['node']]),'depthMm':depth,'breadthMm':width,
                'yAxisGlobal':[1,0,0],'kind':'seated-wet-beam'}
            model['members'][name]=member
            _consistent_line(model,loads,'physical-G',name,member,0,b['u']-a['u'],
                [0,0,-width*depth*c['concreteUnitWeightKNPerM3']/1e9])
        members=grid_member_geometry(model);receivers=ground_receiver_footprints(model,members)
        coverage=partition_free_body_receivers([{'boxXYZMm':[*q[:2],0,*q[2:],1]} for q in
            [*p['fullHeightTailRectanglesXYMm'],*self.seats]],receivers)
        if any(not v['supported'] for v in coverage):
            raise ValueError('New masonry wall has an unsupported finite grid/cap footprint')
        # Register every actual receiving member before the stock lower-body
        # and foundation own-G adapters execute, including the wall's tails.
        member_ids=set()
        for cell in coverage:member_ids.update(cell['receiverIds']['beam'])
        routes=[]
        for sample in samples:
            route=grid_vertical_point_terms(model,members,sample['xyMm'])
            if route is None or route['memberId'] not in members:
                raise ValueError('Actual masonry bearing fibre lacks a finite ground-beam trace')
            routes.append(route);member_ids.add(route['memberId'])
        from grid_origin_recovery import initialise_grid_origins,record_grid_gravity,finish_grid_gravity_adapter
        joints={name:members[name] for name in member_ids if members[name]['a']==members[name]['b']}
        model['rearDirectJointOrigins']={'members':joints,'origins':[],'adapters':{}}
        initialise_grid_origins(model,members,member_ids-set(joints))
        body_rows=[];expected_base=[];joint_g=0.;body_g=0.
        height=p['masonryBearingTopZMm']-p['baseZMm']
        for sample,route in zip(samples,routes):
            identifier=sample['id'];px,py=sample['xyMm'];area=sample['areaMm2']
            body=serial_body_law(area,height,self.law['masonryModulusMPa'],
                c['jointNormalComplianceMmPerMPa'],area*height*self.density/1e9)
            node=frame.node('LOWER-CORE/body-top/'+identifier,[px,py,p['masonryBearingTopZMm']])
            for axis in (0,1,3,4,5):frame.fixed[node,axis]=0.
            if not hasattr(frame,'internalScalarCoordinateScales'):frame.internalScalarCoordinateScales={}
            frame.internalScalarCoordinateScales[node]=1/math.sqrt(body['bodyAxialStiffnessKNPerMm']+body['topContactStiffnessKNPerMm'])
            # All fixed unused coordinates belong only to this scalar w DOF;
            # no ground/beam horizontal coordinate is fixed by the adapter.
            frame.springs.append({'id':identifier+'/body','terms':[(node,[0,0,1,0,0,0]),
                *[(n,[-v for v in row]) for n,row in route['terms']]],
                'stiffness':body['bodyAxialStiffnessKNPerMm'],'mode':'bilateral','gap':0.})
            station=next(s for s in stations if s['u']==py);beam_node=station['node']
            beam=frame.nodes[beam_node]
            upper=[0,0,1,py-beam[1],beam[0]-px,0]
            frame.springs.append({'id':identifier+'/top','terms':[(beam_node,upper),(node,[0,0,-1,0,0,0])],
                'stiffness':body['topContactStiffnessKNPerMm'],'mode':'compression','gap':0.})
            weight=body['bodyPhysicalGKN'];joint_weight=area*c['jointThicknessMm']*c['jointUnitWeightKNPerM3']/1e9
            _add(loads,node,[0,0,-(weight+joint_weight)/2,0,0,0])
            for n,row in route['terms']:_add(loads,n,[-weight*v/2 for v in row])
            _add(loads,beam_node,[-joint_weight*v/2 for v in upper])
            origin=identifier+'/base-G'
            record_grid_gravity(model,'rear-bearing/base-G',route['memberId'],sample['xyMm'],-weight/2,route['terms'],origin)
            expected_base.append({'id':origin,'memberId':route['memberId'],'centroidXYMm':sample['xyMm'],'physicalDownKN':weight/2})
            body_rows.append({**sample,'bodyTopNodeId':node,'beamNodeId':beam_node,'receiverId':route['memberId'],
                'receiverTerms':copy.deepcopy(route['terms']),'upperTerms':[(beam_node,upper)],'serialLaw':body,
                'beddingPhysicalGKN':joint_weight})
            joint_g+=joint_weight;body_g+=weight
        finish_grid_gravity_adapter(model,'rear-bearing/base-G',expected_base)
        receiver={'id':'REAR-LINTEL','axis':1,'rectangleXYMm':list(r),'stations':stations,
            'memberNames':names,'centroidZMm':z,'depthMm':depth}
        floor=model['joinedFloor']['floor'];floor['omissionsXYMm'].append(list(r));membrane=[]
        for station in stations:
            identifier='RC-FLOOR/'+station['node'];membrane.append({'id':identifier,'u':station['u']})
            floor['ports'].append({'id':identifier,'originXYMm':[x,station['u']],'rectangles':[],'node':station['node']})
        shear=law['elasticModulusMPa']/(2*(1+law['poissonRatio']))
        floor['finiteBeamBoundaryReceivers'].append({'id':receiver['id'],'axis':1,'datum':x,'width':width,
            'lo':lo,'hi':hi,'stations':membrane,'shearPhi':[law['elasticModulusMPa']*law['flexuralFactor']*width**2/
                (shear*law['shearAreaFactor']*(b['u']-a['u'])**2) for a,b in zip(stations,stations[1:])]})
        # Compatibility for existing actual patch-load and attachment helpers.
        model['seatedWetSupport']={'receiver':receiver,'posts':[],'contactFibres':[]}
        lintel_g=width*depth*(hi-lo)*c['concreteUnitWeightKNPerM3']/1e9
        expected=[0.,0.,-(lintel_g+joint_g+body_g),0.,0.,0.]
        expected[3]=-lintel_g*(lo+hi)/2000
        expected[4]=lintel_g*x/1000
        for sample in body_rows:
            force=sample['serialLaw']['bodyPhysicalGKN']+sample['beddingPhysicalGKN'];px,py=sample['xyMm']
            expected[3]-=force*py/1000;expected[4]+=force*px/1000
        actual=[b-a for a,b in zip(old_wrench,_family_wrench(model,loads))]
        residual=[a-b for a,b in zip(actual,expected)]
        if max(map(abs,residual))>1e-7:raise ValueError('New lintel/body/bedding own-G or first moments lost')
        model['rearDirectBearing']={'choices':self.choices,'geometry':p,'bearingBodies':body_rows,
            'retainedCrossWallSeatRectanglesXYMm':self.wings,
            'fullFootprintCoverage':coverage,'lintelPhysicalGKN':lintel_g,'bearingBodyPhysicalGKN':body_g,
            'beddingPhysicalGKN':joint_g,'sourceAddedWrenchKN_KNm':expected,
            'sourceOwnGResidualKN_KNm':residual,'newMasonryHorizontalOrTensionStiffness':False,
            'newRCPosts':0,'newFoundations':0,'bearingMomentFixityCredited':False}
        return [receiver]

    def cores(self, cores, model):
        p=self.plan;result=[]
        for row in cores:
            if row['sourceWallId'] in ('wet-south','wet-north'):continue
            result.extend(_rectangle_subtract(row,[p['wallRectangleXYMm'],p['lintelRectangleXYMm']])
                if row['materialKind']=='source-core-material-unqualified' else [row])
        for i,r in enumerate(p['fullHeightTailRectanglesXYMm']):
            result.append({'id':'REAR-DIRECT/full-height/'+str(i),'rectangleXYMm':list(r),
                'sourceWallId':'rear-direct-bearing','materialKind':'source-core-material-unqualified',
                'archProjectionOmitted':False})
        return result

    def finish(self, raw, g_factor):
        from grid_origin_recovery import _validate_adapter,recover_wet_receiving_grid
        model=self.model;data=copy.deepcopy(model['rearDirectBearing']);states={r['id']:r for r in raw['springs']}
        ledger=copy.deepcopy(model['wetGridOrigins']);expected=[]
        for row in data['bearingBodies']:
            name=row['id'];body=states[name+'/body'];top=states[name+'/top']
            own_g=row['serialLaw']['bodyPhysicalGKN']*g_factor;joint_g=row['beddingPhysicalGKN']*g_factor
            compression=-top['forceKN'];base=-body['forceKN']+own_g/2
            residual=base-compression-own_g-joint_g/2
            if abs(residual)>1e-7 or compression < -1e-7:raise ValueError('Actual masonry bearing-body balance fails')
            row.update(topActive=top['active'],topRelativeMm=top['relativeMm'],topCompressionKN=compression,
                actualAxialSpringForceKN=body['forceKN'],bodyOwnFactoredGKN=own_g,beddingOwnFactoredGKN=joint_g,
                baseCompressionKN=base,baseMinusTopMinusOwnGAndHalfBeddingKN=residual)
            expected.append({'id':name+'/base-G','memberId':row['receiverId'],'centroidXYMm':row['xyMm'],
                'physicalDownKN':row['serialLaw']['bodyPhysicalGKN']/2})
            if row['receiverId'] in ledger['members']:
                ledger['points'].append({'id':'solved/'+name+'/body','memberId':row['receiverId'],
                    'adapter':'rear-bearing/solved-body',
                    'pointXYZMm':[*row['xyMm'],self.plan['baseZMm']],'forceKN':[0.,0.,body['forceKN']],
                    'momentKNmm':[0.,0.,0.],'family':'solved-interface'})
        if _validate_adapter(ledger,'rear-bearing/base-G',expected)!=ledger['adapters']['rear-bearing/base-G']:
            raise ValueError('Actual rear bearing base-G inventory changed')
        shadow={**model,'wetGridOrigins':ledger}
        data['receivingGridCuts']=recover_wet_receiving_grid(shadow,raw,[],g_factor)
        data['directJointOrigins']=_finish_direct_joints(model,raw,g_factor)
        data['activeBearingCount']=sum(row['topActive'] for row in data['bearingBodies'])
        data['topCompressionKN']=sum(row['topCompressionKN'] for row in data['bearingBodies'])
        data['baseCompressionKN']=sum(row['baseCompressionKN'] for row in data['bearingBodies'])
        data['candidateAccepted']=False;data['strengthAccepted']=False;data['genuineArchPreferenceMet']=False
        return data


def run_rear_direct_bearing(native_case, choices, finite_settings, root,checkpoint_path=None):
    """One optional saved stage, one full native solve, unchanged operator files."""
    import floor_section_model as native
    import grid_origin_recovery as grid_origins
    from finite_joint_normal_observer import run_observed_current_joint
    from rear_bearing_plan import render_plan,render_section
    root=Path(root);choices=admit_choices(choices)
    if choices['execution']!='compute':raise ValueError('Actual rear comparison requires explicit compute execution')
    source=native.load_source(root)
    if native_case['sourceSHA256']!=source['identities'] or native_case['wetSupport'] is None:
        raise ValueError('Actual current source-bound seated support control required')
    if native_case['thicknessMm']!=200:raise ValueError('Rear bearing comparison owns only the actual RC200 slab datum')
    h=json.loads((root/'project/had/studies/water-replan.json').read_text())['model']
    grid=json.loads((root/'project/str/studies/current-house-grid.json').read_text())
    renewal=json.loads((root/RENEWAL).read_text())['rearRenewal']['firstReleaseInterface']
    plan=geometry(h,grid,choices,renewal,native_case)
    if not plan['planPass']:raise ValueError('Coordinated rear-bearing plan failed; native solve withheld')
    base=native_case['bearingCase']['masonryCase'];adapter=DirectBearing(choices,plan,base['verticalCase']['bearingLaw'],base['lowerCoreBodies']['masonryUnitWeightKNPerM3'],
        clear_ground_core_rectangles(source['bearing']['base']['vertical']))
    case=copy.deepcopy(native_case);case['wetSupport']=None
    before=identities(root);build=native._build_base;free=native._free_top_load;live=native.fresh_net_floor_live_load;solve=native.solve_vertical_frame
    continuous=native.solve_continuous_rc_case
    point_origin=grid_origins.record_grid_gravity;line_origin=grid_origins.record_grid_uniform_gravity
    finish_origins=grid_origins.finish_grid_gravity_adapter
    captured={};history=[]
    def gravity_point(model,adapter_name,member,point,force,terms,identifier):
        if member in model.get('rearDirectJointOrigins',{}).get('members',{}):
            actual={}
            for node,row in terms:_add(actual,node,[force*v for v in row])
            _joint_origin(model,member,identifier,adapter_name,point,force,actual,'physical-G')
        return point_origin(model,adapter_name,member,point,force,terms,identifier)
    def gravity_line(model,adapter_name,member,rectangle,weight,actual,identifier):
        if member in model.get('rearDirectJointOrigins',{}).get('members',{}):
            point=[(rectangle[0]+rectangle[2])/2,(rectangle[1]+rectangle[3])/2]
            _joint_origin(model,member,identifier,adapter_name,point,-weight,actual,'physical-G')
            model['rearDirectJointOrigins']['origins'][-1]['sourceUniformRectangleXYMm']=list(rectangle)
        return line_origin(model,adapter_name,member,rectangle,weight,actual,identifier)
    def gravity_finish(model,adapter_name,expected):
        if 'rearDirectJointOrigins' in model:_joint_gravity_adapter(model,adapter_name,expected)
        return finish_origins(model,adapter_name,expected)
    def built(inner,owner,additional_receiver_builder=None,core_transform=None):
        if additional_receiver_builder is not None or core_transform is not None:
            raise ValueError('Rear replacement cannot compose an undeclared second support replacement')
        required=[]
        for attempt in range(4):
            model=build(inner,owner,additional_receiver_builder=lambda m:adapter.build(m,required),core_transform=adapter.cores)
            audit=attachment_station_audit(model);history.append(audit)
            if audit['allPlateAttachmentsAtRealBeamNodes']:
                model['rearDirectBearing']['plateAttachmentAudit']={**audit,'coordinateClosurePasses':attempt+1};return model
            required=sorted(set(required+audit['missingAttachmentCoordinatesYMm']))
            adapter.model=None;del model
        raise ValueError('Real lintel/plate coordinate closure failed')
    def free_load(model,inventory,additional_patch_receiver=None):
        def route(rectangle,pressure,target):
            result=additional_patch_receiver(rectangle,pressure,target) if additional_patch_receiver else None
            return result if result is not None else route_free_patch(model,rectangle,pressure,target)
        return free(model,inventory,additional_patch_receiver=route)
    def fresh_live(model):
        result=live(model);receiver=model['seatedWetSupport']['receiver'];r=receiver['rectangleXYMm']
        pressure=1.5*model['verticalFloor']['request']['freshUniformLiveKPa'];q=pressure*(r[2]-r[0])/1e6
        expected=[0.,0.,-q*(r[3]-r[1]),-q*(r[3]-r[1])*(r[1]+r[3])/2000,
            q*(r[3]-r[1])*(r[0]+r[2])/2000,0.];loads={}
        for name in receiver['memberNames']:
            member=model['members'][name];length=math.dist(member['physicalStartMm'],member['physicalEndMm'])
            _consistent_line(model,loads,'rear-lintel-Q',name,member,0,length,[0,0,-q])
        actual=_family_wrench(model,loads)
        if max(abs(a-b) for a,b in zip(actual,expected))>1e-7:raise ValueError('New lintel top Q lost or doubled')
        model['rearDirectBearing']['lintelLiveWrenchKN_KNm']=expected
        # The native family is applied once by the continuous-house assembler;
        # it is not also returned in direct plate loads. The same factor is
        # used by endpoint/interior cut recovery for this physical line load.
        model['families']['rear-lintel-Q']=loads
        return result
    def continuous_case(model,owner,name,multipliers):
        multipliers['rear-lintel-Q']=1.
        return continuous(model,owner,name,multipliers)
    def solved(frame,data):
        for origin in adapter.model['wetGridOrigins']['points']+adapter.model['wetGridOrigins']['lines']:
            if not {'id','adapter','memberId','family'}<=set(origin):raise ValueError('Incomplete actual source origin schema before solving')
        verify_direct_joint_origins(adapter.model['rearDirectJointOrigins'],
            base['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor'])
        raw=solve(frame,data);captured['raw']=raw;return raw
    try:
        native._build_base=built;native._free_top_load=free_load;native.fresh_net_floor_live_load=fresh_live;native.solve_vertical_frame=solved
        native.solve_continuous_rc_case=continuous_case
        grid_origins.record_grid_gravity=gravity_point;grid_origins.record_grid_uniform_gravity=gravity_line
        grid_origins.finish_grid_gravity_adapter=gravity_finish
        result=run_observed_current_joint(case,finite_settings,root)
    finally:
        native._build_base=build;native._free_top_load=free;native.fresh_net_floor_live_load=live;native.solve_vertical_frame=solve
        native.solve_continuous_rc_case=continuous
        grid_origins.record_grid_gravity=point_origin;grid_origins.record_grid_uniform_gravity=line_origin
        grid_origins.finish_grid_gravity_adapter=finish_origins
    if before!=identities(root) or source['identities']!=native.load_source(root)['identities']:
        raise ValueError('Rear-bearing source/method changed during actual execution')
    # Preserve the actual completed source response before any new cut/ledger
    # postprocessor. This pending receipt cannot masquerade as a passed proof.
    if checkpoint_path is None:
        import tempfile
        with tempfile.NamedTemporaryFile(prefix='rear-bearing-unvalidated-',suffix='.json',delete=False) as stream:
            checkpoint_path=Path(stream.name)
    checkpoint_path=Path(checkpoint_path);model=adapter.model
    snapshot={k:model[k] for k in ('request','rearDirectBearing','rearDirectJointOrigins','wetGridOrigins',
        'lowerCoreBodies','foundationWeight','seatedWetSupport','memberEquivalentLoads')}
    snapshot['verticalFloor']={'fibres':model['verticalFloor']['fibres']}
    snapshot['frame']={k:getattr(model['model'],k) for k in ('nodes','loads','springs')}
    pending={'schema':'str-rear-direct-bearing-native-checkpoint/1','postProcessingComplete':False,
        'authoredNativeCase':native_case,'choices':choices,'finiteSettings':finite_settings,
        'sourceSHA256':source['identities'],'methodSHA256':before,'finiteHouseResult':result,
        'rawResponse':captured['raw'],'postprocessingModel':snapshot}
    partial=checkpoint_path.with_suffix('.writing.json');partial.write_text(json.dumps(pending,allow_nan=False));partial.replace(checkpoint_path)
    g=base['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    try:actual=adapter.finish(captured['raw'],g)
    except Exception as error:
        raise ValueError('Actual native response retained pending postprocessing at '+str(checkpoint_path)+': '+str(error)) from error
    # Existing native member recovery carries actual lintel G, Q and routed
    # upper loads; coordinate closure makes all plate attachment jumps nodal.
    actual['lintelMemberCuts']=[r for r in result['native']['nativeVertical']['native']['memberCuts'] if r['memberId'].startswith('REAR-LINTEL/')]
    actual['lintelInteriorMemberCuts']=[r for r in result['native']['nativeVertical']['native']['interiorMemberCuts'] if r['memberId'].startswith('REAR-LINTEL/')]
    return {'schema':'str-rear-direct-bearing-comparison/1','authoredNativeCase':native_case,
        'choices':choices,'finiteSettings':finite_settings,'sourceSHA256':source['identities'],'methodSHA256':before,
        'actualReplacement':actual,'finiteHouseResult':result,
        'rawCheckpointSHA256':hashlib.sha256(checkpoint_path.read_bytes()).hexdigest(),
        'drawings':{'rear-bearing-plan.svg':render_plan(plan),'rear-bearing-section.svg':render_section(plan)},
        'candidateAccepted':False,'wholeHouseAccepted':False,'strengthAccepted':False,'ownerAccepted':False,
        'scope':'Actual full-house source pressure/G/Q at unchanged52heads. One short RC lintel on serial axial masonry bodies and full-height masonry tails replaces the two RC posts/long beam. No masonry lateral stiffness, friction or tensile support is added. Genuine arch preference, reinforcement, joints, ground strength and owner architectural acceptance remain unearned.'}


def compare_seated_reference(comparison, control):
    """Pure simultaneous-case comparison; no fixed-head increment is reused."""
    current=comparison['finiteHouseResult']
    if (comparison['authoredNativeCase']!=control['authoredNativeCase'] or
        comparison['finiteSettings']!=control['settings'] or
        any(current[k]!=control[k] for k in ('sourceSHA256','methodSHA256','runtime'))):
        raise ValueError('Reference must be the exact same authored house, finite controls, native sources/methods and runtime')
    old=control['native'];new=current['native'];a=old['nativeVertical'];b=new['nativeVertical']
    if a['headPositions']!=b['headPositions']:raise ValueError('Bearing comparison changed actual foundation head locations')
    old_heads=a['native']['heads'];new_heads=b['native']['heads']
    if [h['id'] for h in old_heads]!=[h['id'] for h in new_heads] or len(new_heads)!=52:
        raise ValueError('Bearing comparison changed actual52-head catalogue')
    differences=[{'id':v['id'],'differenceKN_KNm':[y-x for x,y in zip(u['reactionKN_KNm'],v['reactionKN_KNm'])]}
        for u,v in zip(old_heads,new_heads)]
    wet=old['seatedWetSupport'];geometry=comparison['actualReplacement']['geometry']
    original=wet['settings'];receivers=original['receiverRectanglesXYMm']
    old_span=wet['physicalBearingAxesYMm'][1]-wet['physicalBearingAxesYMm'][0]
    seats=geometry['bearingRectanglesXYMm'];new_span=(seats[1][1]+seats[1][3]-seats[0][1]-seats[0][3])/2
    old_rect=wet['receiver']['rectangleXYMm'];new_rect=geometry['lintelRectangleXYMm']
    from vertical_rc_floor import intersect
    def peaks(rows):
        return {key:max((abs(r[key]) for r in rows),default=0.) for key in
            ('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')}
    old_cuts=[r for key in ('memberCuts','interiorMemberCuts') for r in a['native'][key]
        if r['memberId'].startswith('WET-SUPPORT/beam/')]
    new_cuts=comparison['actualReplacement']['lintelMemberCuts']+comparison['actualReplacement']['lintelInteriorMemberCuts']
    tails=[f for f in b['bearings'] if f['sourceWallId']=='rear-direct-bearing']
    return {'schema':'str-rear-bearing-matched-house-comparison/1','headCount':52,
        'sameActualHeadPositions':True,'headReactionDifferencesKN_KNm':differences,
        'physicalGKN':{'seatedControl':old['mass']['joinedPhysicalGKN'],'directBearing':new['mass']['joinedPhysicalGKN'],
            'difference':new['mass']['joinedPhysicalGKN']-old['mass']['joinedPhysicalGKN']},
        'actualAppliedWrenchDifferenceKN_KNm':[y-x for x,y in zip(a['native']['externalWrenchKN_KNm'],b['native']['externalWrenchKN_KNm'])],
        'seatedControl':{'rcPostCount':len(wet['posts']),'rcBeamPhysicalGKN':wet['beamPhysicalGKN'],
            'rcPostPhysicalGKN':sum(p['physicalGKN'] for p in wet['posts']),
            'padPhysicalGKN':sum(p['padPhysicalGKN'] for p in wet['posts']),
            'beamLengthMm':old_rect[3]-old_rect[1],'bearingAxisSpanMm':old_span,'beamCutPeaks':peaks(old_cuts),
            'stairPlanIntersectionRectanglesXYMm':[v for r in receivers if (v:=intersect(r,geometry['stairRectangleXYMm'])) is not None]},
        'directBearing':{'rcPostCount':0,'lintelLengthMm':new_rect[3]-new_rect[1],'bearingAxisSpanMm':new_span,
            'lintelCutPeaks':peaks(new_cuts),'actualBearingContactCount':len(comparison['actualReplacement']['bearingBodies']),
            'activeBearingContactCount':comparison['actualReplacement']['activeBearingCount'],
            'fullHeightTailContactCount':len(tails),'activeFullHeightTailContactCount':sum(f['active'] for f in tails),
            'fullHeightTailTopCompressionKN':sum(f['normalCompressionKN'] for f in tails),
            'stairFinishedPlaneIntrusionMm':max(0.,geometry['protectedStairFinishedXMm']-geometry['lowerFinishedWestXMm'])},
        'transferEliminated':False,'genuineArchPreferenceMet':False,'candidateAccepted':False,
        'scope':'A complete independent response for this one matched signed/G/Q case. Two RC posts are eliminated and the supported transfer is shortened; the ground girder, shorter lintel, contact/material/cage and complete signed programme remain explicit duties.'}


if __name__=='__main__':
    import argparse,sys
    parser=argparse.ArgumentParser();parser.add_argument('--plan',action='store_true')
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3]);parser.add_argument('--checkpoint',type=Path);args=parser.parse_args()
    request=json.load(sys.stdin)
    if not isinstance(request,dict) or set(request)!={'nativeCase','choices','finiteSettings'}:
        raise ValueError('One existing shared native case, optional saved choices and saved finite controls required')
    if args.plan:
        from rear_bearing_plan import render_plan,render_section
        h=json.loads((args.root/'project/had/studies/water-replan.json').read_text())['model']
        grid=json.loads((args.root/'project/str/studies/current-house-grid.json').read_text())
        renewal=json.loads((args.root/RENEWAL).read_text())['rearRenewal']['firstReleaseInterface']
        result=geometry(h,grid,request['choices'],renewal,request['nativeCase'])
        result={'geometry':result,'methodSHA256':identities(args.root),
            'drawings':{'rear-bearing-plan.svg':render_plan(result),'rear-bearing-section.svg':render_section(result)}}
    else:result=run_rear_direct_bearing(request['nativeCase'],request['choices'],request['finiteSettings'],args.root,args.checkpoint)
    json.dump(result,sys.stdout,allow_nan=False)
