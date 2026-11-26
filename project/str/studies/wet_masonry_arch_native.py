"""Isolated actual-house arched-wall elastic-frame comparison backend.

Uses the unchanged native frame/contact, plate, membrane, roof and grid kernels.
Temporary support-builder adapters are restored on exit. The physical masonry
law is NOT qualified: this first comparison keeps explicit elastic arch/pier
bending, and reports tension demands rather than disguising them as masonry.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
import math
from pathlib import Path

from wet_masonry_arch_comparison import ROOT, CHOICES, geometry, choices
from joined_successor_kernel import rectangle_section, cross
from finite_mapped_frame import mapped_frame_member, node_trace, mapped_load, recover_mapped_member
from rc_floor_house_loads import _consistent_line, _add, consistent_member_point_load, _family_wrench
from vertical_rc_floor import grid_member_geometry
from seated_wet_support import _grid_point_maps, _rectangle_subtract

METHOD = 'project/str/studies/wet_masonry_arch_native.py'


def midpoint_integral(radius, a, b):
    def primitive(x):
        return .5*(x*math.sqrt(max(0., radius**2-x*x))+radius**2*math.asin(x/radius))
    return primitive(b)-primitive(a)


class NativeArchAdapter:
    def __init__(self, authored, arch_segments=16, masonry_e_mpa=3000., native_plate=False):
        if type(arch_segments) is not int or not 8 <= arch_segments <= 96 or not 500 <= masonry_e_mpa <= 10000:
            raise ValueError('Explicit bounded elastic arch mesh and masonry modulus required')
        self.authored = choices(authored)
        self.native_plate = native_plate
        self.arch_segments = arch_segments
        self.masonry_law = {'elasticModulusMPa': masonry_e_mpa, 'poissonRatio': .2,
                            'flexuralFactor': 1., 'torsionFactor': 1., 'shearAreaFactor': 5/6}
        self.last_model = None

    def build(self, model, legacy_setting, h, required_stations=()):
        frame = model['model']; grid = model['grid']; g = geometry(self.authored, h, grid)
        if not g['groundReceiverCoverageGeometric']:
            raise ValueError('Actual masonry footprint lacks complete finite grid coverage')
        self.last_model = model
        legacy = copy.deepcopy(legacy_setting)
        # This is a200mm slab strip, not the removed350mm downstand.
        legacy.update(beamDepthMm=200., beamTopZMm=3370.)
        x = g['lowerWallAxisXMm'] if self.native_plate else legacy['beamAxisXMm']
        lo = g['lowerCoreRectangleXYMm'][1] if self.native_plate else legacy['beamSouthEndYMm']
        hi = g['lowerCoreRectangleXYMm'][3] if self.native_plate else legacy['beamNorthEndYMm']
        z = 3117.5 if self.native_plate else 3270.
        rectangle = [x-70,lo,x+70,hi] if self.native_plate else [x-125, lo, x+125, hi]
        physical = g['archPhysicalGeometry']; ri = physical['sourceInnerRadiusMm']; rm = ri+107.5; ro = ri+215
        angle = physical['seatAngleRad']; cz = physical['sourceCurveCentreZMm']; cy = g['centreYMm']; mx = g['lowerWallAxisXMm']
        arch = []
        for i in range(self.arch_segments+1):
            t = -angle+2*angle*i/self.arch_segments; point = [mx, cy+rm*math.sin(t), cz+rm*math.cos(t)]
            arch.append({'node': frame.node('WET-ARCH/ring/'+str(i), point), 'point': point})
        axes = {lo, hi, *[u for u in required_stations if lo <= u <= hi], *[r['point'][1] for r in arch if lo <= r['point'][1] <= hi]}
        for a, b in zip(sorted(axes), sorted(axes)[1:]):
            count = max(1, math.ceil((b-a)/500))
            axes.update(a+(b-a)*i/count for i in range(1, count))
        stations = [{'u': y, 'node': frame.node('WET-ARCH/slab-strip/'+str(y), [x, y, z])} for y in sorted(axes)]
        names = []; loads = model['families']['physical-G']; arch_members = []; mass_origins = []
        header_members = []
        for i, (a, b) in enumerate(zip(stations, stations[1:])):
            name = ('WET-ARCH/top-band/' if self.native_plate else 'WET-SUPPORT/beam/')+str(i); names.append(name)
            depth,width,material = (105.,140.,self.masonry_law) if self.native_plate else (200.,250.,model['request']['frameLaw'])
            frame.member(name,a['node'],b['node'],rectangle_section(depth,width),material,y_axis=[1,0,0])
            member={'a':a['node'],'b':b['node'],'physicalStartMm':list(frame.nodes[a['node']]),
                    'physicalEndMm':list(frame.nodes[b['node']]),'depthMm':depth,'breadthMm':width,
                    'yAxisGlobal':[1,0,0],'kind':'seated-wet-beam'}
            header_members.append({'id':name,**member})
            if self.native_plate:
                arch_members.append({'id':name,'start':member['physicalStartMm'],'end':member['physicalEndMm'],'kind':'elastic-masonry-top-band'})
            else:
                model['members'][name]=member
                _consistent_line(model,loads,'physical-G',name,member,0,b['u']-a['u'],[0,0,-width*depth*legacy['concreteUnitWeightKNPerM3']/1e9])
        for i, (a, b) in enumerate(zip(arch, arch[1:])):
            name = 'WET-ARCH/ring-member/'+str(i)
            frame.member(name, a['node'], b['node'], rectangle_section(215., 140.), self.masonry_law, y_axis=[1,0,0])
            arch_members.append({'id': name, 'start': a['point'], 'end': b['point'], 'kind': 'elastic-ring'})
        members = grid_member_geometry(model); pier_records = []
        for i, (ring, interval) in enumerate(zip((arch[0], arch[-1]),
                ([g['lowerCoreRectangleXYMm'][1], g['rawOpeningYMm'][0]], [g['rawOpeningYMm'][1], g['lowerCoreRectangleXYMm'][3]]))):
            py = sum(interval)/2; top = [mx, py, ring['point'][2]]
            head = frame.node('WET-ARCH/pier/'+str(i), top)
            maps, member_id, base = _grid_point_maps(model, members, [mx, py, -180.])
            item = mapped_frame_member(frame, 'WET-ARCH/mapped-pier/'+str(i), [mx,py,-180.], top,
                rectangle_section(interval[1]-interval[0], 140.), self.masonry_law, maps+node_trace(head), [1,0,0])
            # Explicit finite offset head segment, never a nearest-node support.
            name = 'WET-ARCH/pier-head/'+str(i)
            frame.member(name, head, ring['node'], rectangle_section(215., 140.), self.masonry_law, y_axis=[1,0,0])
            arch_members.append({'id': name, 'start': top, 'end': ring['point'], 'kind': 'elastic-pier-head'})
            pier_records.append({'id': item['id'], 'member': item, 'receiverId': member_id, 'intervalYMm': interval,
                                 'node': head, 'baseXYZMm': [mx,py,base]})
        # Actual spandrel tributaries join the ring to the restored slab strip.
        # These are elastic-frame idealisations of the real masonry, not a
        # qualified compression-only wall or equivalent3D material.
        for i, row in enumerate(arch):
            y = row['point'][1]
            station = next(s for s in stations if abs(s['u']-y)<1e-7)
            left = arch[max(0,i-1)]['point'][1]; right = arch[min(len(arch)-1,i+1)]['point'][1]
            width = (right-left)/2
            if i in (0,len(arch)-1): width = max(width, 20.)
            start = list(row['point']) if self.native_plate else [mx,y,cz+math.sqrt(ro**2-(y-cy)**2)]
            end = [mx,y,z if self.native_plate else 3170.]
            if end[2] <= start[2]: raise ValueError('Actual arch leaves no spandrel height')
            name = 'WET-ARCH/spandrel/'+str(i)
            frame.member(name, row['node'], station['node'], rectangle_section(width,140.), self.masonry_law,
                         physical_start=start, physical_end=end, y_axis=[1,0,0])
            arch_members.append({'id': name, 'start': start, 'end': end, 'kind': 'elastic-spandrel'})
        tie_nodes = []
        for i, pier in enumerate(pier_records):
            # Bearing action at the real tie plane within the actual pier.
            node = frame.node('WET-ARCH/tie-end/'+str(i), [mx, self.authored['tieBearingFacesYMm'][i], self.authored['tieCentreZMm']])
            frame.member('WET-ARCH/tie-node/'+str(i), pier['node'], node,
                rectangle_section(215.,140.), self.masonry_law, y_axis=[1,0,0])
            arch_members.append({'id':'WET-ARCH/tie-node/'+str(i), 'start':top if i==len(pier_records)-1 else list(frame.nodes[pier['node']]),
                                 'end':list(frame.nodes[node]), 'kind':'elastic-tie-bearing-node'})
            tie_nodes.append(node)
        length = math.dist(frame.nodes[tie_nodes[0]], frame.nodes[tie_nodes[1]])
        # Existing native tension-only spring, direct axialEA/L; no fabricated bending restraint.
        frame.spring('WET-ARCH/tie', tie_nodes[1], tie_nodes[0], [mx,cy,self.authored['tieCentreZMm']], [0,1,0],
                     200000*math.pi*30**2/4/length/1000, 'tension')
        tie_ref=h['northNormalRoute']['portal']['tie'];plate=tie_ref['endPlate'];washer=tie_ref['washer'];nut=tie_ref['nut']
        stock_length=length+2*(plate[2]+washer[1]+nut[1])
        # Gross requirement envelopes, deliberately no bore/thread deductions.
        steel_volume=(math.pi*tie_ref['rod']**2/4*stock_length+2*plate[0]*plate[1]*plate[2]+2*washer[0]**2*washer[1]+2*nut[0]**2*nut[1])/1e9
        steel_g=steel_volume*78.5
        for node in tie_nodes:_add(loads,node,[0,0,-steel_g/2,0,0,0])
        # Exact gross wall-minus-opening G; whole physical first moments are
        # integrated over actual material strips and applied as declared rigid
        # tributary loads to ring/pier nodes. This is not unit/mortar evidence.
        rect = g['lowerCoreRectangleXYMm']; breaks = sorted({rect[1],rect[3],*g['rawOpeningYMm'],*[r['point'][1] for r in arch]})
        for a,b in zip(breaks,breaks[1:]):
            m = (a+b)/2
            if g['rawOpeningYMm'][0] <= m <= g['rawOpeningYMm'][1]:
                void_area = 2550*(b-a)+(cz-2550)*(b-a)+midpoint_integral(ri,a-cy,b-cy)
            else: void_area = 0.
            area = 3350*(b-a)-void_area; weight = area*140*self.authored['masonryUnitWeightKNPerM3']/1e9
            if area<=0: continue
            target = (pier_records[0]['node'] if m<arch[0]['point'][1] else pier_records[1]['node'] if m>arch[-1]['point'][1]
                      else min(arch,key=lambda r:abs(r['point'][1]-m))['node'])
            # Gravity first moments inX/Y are exact; centroidZ is irrelevant to a vertical force.
            origin = [mx,m,0.]; master = frame.nodes[target]; force = [0,0,-weight]
            moment = cross([origin[j]-master[j] for j in range(3)],force)
            _add(loads,target,[*force,*moment]);mass_origins.append({'target':target,'intervalYMm':[a,b],'weightKN':weight,'originXYZMm':origin})
        mass = math.fsum(r['weightKN'] for r in mass_origins)
        if abs(mass-g['wallMinusOpeningGrossVolumeM3']*self.authored['masonryUnitWeightKNPerM3'])>1e-8:
            raise ValueError('Actual masonry material partition loses gross arch G')
        receiver = {'id':'WET-ARCH/RC200-strip','axis':1,'rectangleXYMm':rectangle,'stations':stations,
                    'memberNames':names,'centroidZMm':3270.,'depthMm':200.}
        if not self.native_plate:
            old = model['joinedFloor']['floor'];old['omissionsXYMm'].append(rectangle)
            membrane_stations=[]
            for s in stations:
                identifier='RC-FLOOR/'+s['node'];membrane_stations.append({'id':identifier,'u':s['u']})
                old['ports'].append({'id':identifier,'originXYMm':[x,s['u']],'rectangles':[],'node':s['node']})
            law=model['request']['frameLaw']; shear=law['elasticModulusMPa']/(2*(1+law['poissonRatio']))
            old['finiteBeamBoundaryReceivers'].append({'id':receiver['id'],'axis':1,'datum':x,'width':250.,'lo':lo,'hi':hi,
                'stations':membrane_stations,'shearPhi':[law['elasticModulusMPa']*law['flexuralFactor']*250**2/(shear*law['shearAreaFactor']*(b['u']-a['u'])**2) for a,b in zip(stations,stations[1:])]})
        model['seatedWetSupport']={'settings':legacy,'receiver':receiver,'posts':[], 'contactFibres':[],
            'experimentalArch':{'geometry':g,'masonryLaw':self.masonry_law,'archSegments':self.arch_segments,
                'members':arch_members,'piers':pier_records,'materialGOrigins':mass_origins,'grossMasonryGKN':mass,
                'headerMembers':header_members, 'nativePlateRetained':self.native_plate,
                'retainedWallOverlapRemovalValidated':False,'actualMasonryTensionAccepted':False,
                'tieHardwareGrossEnvelopeGKN':steel_g,'tieHardwareGrossEnvelopeVolumeM3':steel_volume,
                'tieHardwareDeliveredWeightQualified':False,
                'tributaryGWorkMappingQualified':False,'physicalNodesTieAndMaterialAccepted':False},
            'physicalAcceptance':False,'momentFixityAtBearingsCredited':False,'frictionOrHorizontalBearingRestraintCredited':False}
        return [] if self.native_plate else [receiver]

    def cores(self, cores, legacy, model):
        removed=model['seatedWetSupport']['experimentalArch']['geometry']['lowerCoreRectangleXYMm'];result=[]
        for row in cores:
            if row['sourceWallId'] in ('wet-south','wet-north'): continue
            result.extend(_rectangle_subtract(row,[removed]) if row['materialKind']=='source-core-material-unqualified' else [row])
        return result

    def floor_points(self, h, grid, cells_y):
        if type(cells_y) is not int or not 2 <= cells_y <= 11:
            raise ValueError('Normal bearing2..11cells must fit the existing64 retained-point domain with18roof seats')
        g=geometry(self.authored,h,grid);a,b,c,d=g['lowerCoreRectangleXYMm'];rows=[]
        for cell in range(cells_y):
            lo=b+(d-b)*cell/cells_y;hi=b+(d-b)*(cell+1)/cells_y
            for i,xi in enumerate((-1/math.sqrt(3),1/math.sqrt(3))):
                for j,eta in enumerate((-1/math.sqrt(3),1/math.sqrt(3))):
                    rows.append({'id':f'WET-ARCH/FLOOR/{cell}/{i}/{j}',
                        'xyMm':[(a+c)/2+xi*(c-a)/2,(lo+hi)/2+eta*(hi-lo)/2],
                        'areaMm2':(c-a)*(hi-lo)/4})
        return rows

    def connect_floor(self, model, points, compliance):
        if not math.isfinite(compliance) or not .001 <= compliance <= 10:
            raise ValueError('Explicit finite comparison bedding compliance required')
        data=model['verticalFloor'];wall=model['seatedWetSupport']['experimentalArch'];frame=model['model'];fibres=[]
        context={'model':frame,'request':{'frameLaw':self.masonry_law}}
        maximum_rigid_residual=0.
        for point in points:
            x,y=point['xyMm'];member=next(m for m in wall['headerMembers'] if m['physicalStartMm'][1]-1e-7<=y<=m['physicalEndMm'][1]+1e-7)
            vector=consistent_member_point_load(context,member,[x,y,3170.],[0,0,1],[0,0,0])
            terms={node:list(row) for node,row in data['retainedPointReceivers'][point['id']]['terms']}
            for i,node in enumerate((member['a'],member['b'])):
                target=terms.setdefault(node,[0.]*6)
                for j,v in enumerate(vector[6*i:6*i+6]):target[j]-=v
            # Global rigid-body work must vanish in all six directions. Unused
            # coordinates on scalar floor ports never enter this contact row.
            for mode in range(6):
                work=0.
                for node,row in terms.items():
                    xyz=frame.nodes[node]
                    if node.startswith('VERTICAL-FLOOR/normal/'):
                        # A retained scalar port carries physicalw at itsXY;
                        # its unused fixed coordinates do not restrain the house.
                        if any(row[i] for i in (0,1,3,4,5)):
                            raise ValueError('Unused scalar floor coordinates would restrain the house')
                        displacement=[0,0,1. if mode==2 else xyz[1] if mode==3 else -xyz[0] if mode==4 else 0.,0,0,0]
                    else:
                        omega=[float(mode==3+i) for i in range(3)];translation=[float(mode==i) for i in range(3)]
                        rigid=cross(omega,xyz);displacement=[*[a+b for a,b in zip(translation,rigid)],*omega]
                    work+=sum(a*b for a,b in zip(row,displacement))
                maximum_rigid_residual=max(maximum_rigid_residual,abs(work))
            name='WET-ARCH/bearing/'+point['id'];stiffness=point['areaMm2']/compliance/1000
            frame.springs.append({'id':name,'terms':list(terms.items()),'stiffness':stiffness,'mode':'compression','gap':0.})
            fibres.append({**point,'springId':name,'headerMemberId':member['id'],'stiffnessKNPerMm':stiffness})
        if maximum_rigid_residual>1e-7:raise ValueError('Actual finite masonry/floor map violates rigid-body work')
        wall.update(floorBearingFibres=fibres,maximumFloorBearingRigidWorkResidual=maximum_rigid_residual,
                    floorNormalComplianceMmPerMPa=compliance,
                    actualMITC4PlateAndCSTMaterialRetained=True,
                    floorMomentFixityOrFrictionCredited=False)

    def finish(self, model, raw, g_factor):
        result=copy.deepcopy(model['seatedWetSupport']['experimentalArch']);states={r['id']:r for r in raw['springs']}
        result['tieState']=states['WET-ARCH/tie']
        for row in result.get('floorBearingFibres',[]):
            row['actualState']=states[row['springId']]
        for row in result['members']:
            row['rawEndWrenchesKN_KNmm']=raw['memberEndWrenchesKN_KNmm'][row['id']]
        for row in result['piers']:
            row['recovery']=recover_mapped_member(row.pop('member'),raw['displacements'])
        return {'schema':'str-experimental-wet-masonry-native-result/1','arch':result,'candidateAccepted':False,
                'completeSignedLoadEnvelope':False,'actualMasonryResistanceAccepted':False}


def run(request, root=ROOT, checkpoint_path=None):
    import floor_section_model as native
    import seated_wet_support as wet
    expected={'schema','caseId','archChoices','archSegments','masonryElasticModulusMPa','nativeCase','bearingCellsY','floorNormalComplianceMmPerMPa'}
    if not isinstance(request,dict) or set(request)!=expected or request['schema']!='str-wet-masonry-arch-native-request/2':
        raise ValueError('Versioned explicit experimental arched-wall native request required')
    source=native.load_source(root)
    if request['nativeCase']['sourceSHA256']!=source['identities']:raise ValueError('Actual current58 native source required')
    adapter=NativeArchAdapter(request['archChoices'],request['archSegments'],request['masonryElasticModulusMPa'],native_plate=True)
    import upper_roof_bearing as roof
    h=json.loads((Path(root)/'project/had/studies/water-replan.json').read_text())['model']
    grid=json.loads((Path(root)/'project/str/studies/current-house-grid.json').read_text())
    points=adapter.floor_points(h,grid,request['bearingCellsY'])
    original_vertical=roof.build_vertical_rc_floor;original_solve=native.solve_vertical_frame;captured={}
    native_case=copy.deepcopy(request['nativeCase']);legacy=copy.deepcopy(native_case['wetSupport']);native_case['wetSupport']=None
    def vertical(case,source,**kwargs):
        existing=kwargs.get('retained_point_receivers',[])
        kwargs['retained_point_receivers']=[*existing,*[{'id':r['id'],'xyMm':r['xyMm']} for r in points]]
        kwargs['additional_receiver_builder']=lambda model:adapter.build(model,legacy,h)
        kwargs['core_transform']=lambda cores,model:adapter.cores(cores,legacy,model)
        model=original_vertical(case,source,**kwargs);adapter.connect_floor(model,points,request['floorNormalComplianceMmPerMPa']);return model
    def solved(frame,data):
        raw=original_solve(frame,data);captured['raw']=raw;return raw
    before={p:hashlib.sha256((Path(root)/p).read_bytes()).hexdigest() for p in [METHOD,'project/str/studies/wet_masonry_arch_comparison.py']}
    try:
        roof.build_vertical_rc_floor=vertical;native.solve_vertical_frame=solved
        result=native.run(native_case,source,request['caseId'])
    finally:
        roof.build_vertical_rc_floor=original_vertical;native.solve_vertical_frame=original_solve
    if checkpoint_path is not None:
        provisional=copy.deepcopy(result);provisional['schema']='str-unvalidated-wet-masonry-native-checkpoint/1'
        provisional['experimentalRequest']=copy.deepcopy(request);provisional['experimentalMethodBeforeSHA256']=before
        provisional['experimentalArch']=adapter.finish(adapter.last_model,captured['raw'],1.)
        provisional['sourceAndMethodPostExecutionValidationComplete']=False
        Path(checkpoint_path).write_text(json.dumps(provisional,allow_nan=False))
    if source['identities']!=native.load_source(root)['identities'] or before!={p:hashlib.sha256((Path(root)/p).read_bytes()).hexdigest() for p in before}:
        raise ValueError('Experimental source changed during actual execution')
    result['schema']='str-experimental-wet-masonry-coupled-comparison/1';result['experimentalRequest']=copy.deepcopy(request)
    result['experimentalArch']=adapter.finish(adapter.last_model,captured['raw'],native_case['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor'])
    result['experimentalMethodSHA256']=before
    result['diagnostics'].extend(['The native RC200 MITC4/CST material remains continuous; compression-only finite-width floor bearings attach to the actual masonry-top frame.',
        'Masonry frame bending/tension law is an authored elastic comparison, not compression-only physical acceptance.',
        'Gross new masonry material partition is distinct from retained wall-union and arch node/tie qualification.'])
    return result


if __name__=='__main__':
    import sys
    p=argparse.ArgumentParser();p.add_argument('--request',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.out.exists():raise ValueError('Refuse overwriting an actual experimental result')
    from datetime import datetime, timezone
    from four_l_joint_observer import numerical_runtime
    value=json.loads(a.request.read_text());record={'schema':'str-wet-masonry-native-execution-start/1',
        'startedAt':datetime.now(timezone.utc).isoformat(),'requestFileSHA256':hashlib.sha256(a.request.read_bytes()).hexdigest(),
        'methodSHA256':hashlib.sha256((ROOT/METHOD).read_bytes()).hexdigest(),
        'numericalRuntime':numerical_runtime(),'caseId':value['caseId'],'accepted':False}
    a.out.with_suffix('.execution-start.json').write_text(json.dumps(record,indent=2)+'\n')
    recovery=a.out.with_suffix('.unvalidated.json');result=run(value,checkpoint_path=recovery)
    temporary=a.out.with_suffix('.writing.json');temporary.write_text(json.dumps(result,allow_nan=False));temporary.replace(a.out)
    recovery.unlink()
