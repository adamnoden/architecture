"""Whole-house conventional RC comparison with an actual finite SW joint.

The caller supplies the saved native floor case and explicit comparison controls.
This composes the existing house/plate/membrane/grid solvers; it is not a second
house source. The original case remains a separately executable control.
"""
import copy
import hashlib
import math
from pathlib import Path
import numpy as np

from finite_mapped_frame import combine
from joined_successor_kernel import cross, l_section
from named_plate_load import recover_named_loads
from finite_joint_membrane_trace import compile_point_trace_floor as compile_perforated_floor
from rc_floor_house_loads import _add
from floor_section_successor import _energy_springs, _membrane_maps, _pressure_offset_couples, _replace_vertical_plate_energy
from vertical_floor_plate import assemble_vertical_plate, condense_vertical_plate
from vertical_rc_floor import retained_receiver_operator_participation

METHOD='project/str/studies/current_finite_rc_joint.py'
METHODS=[METHOD,'project/str/studies/finite_rc_joint_solid.py','project/str/studies/finite_joint_contact_trace.py','project/str/studies/finite_joint_membrane_trace.py','project/str/studies/finite-joint-solid-requirements.txt']

def method_identities(root):
    return {path:hashlib.sha256((root/path).read_bytes()).hexdigest() for path in METHODS}

def runtime_versions():
    import sys,scipy,skfem
    versions={'python':sys.version.split()[0],'numpy':np.__version__,'scipy':scipy.__version__,'scikit-fem':skfem.__version__}
    if any(versions[k]!=v for k,v in {'numpy':'2.3.5','scipy':'1.17.0','scikit-fem':'12.0.2'}.items()):
        raise ValueError('Pinned native and finite-solid runtime required')
    return versions
PATCH=[262.5,262.5,2177.5,2650.]
MID=3270.


def uniform_concrete_case(original,young_mpa=8250.):
    """Explicit secant-stiffness comparison; strength/durability are not selected."""
    result=copy.deepcopy(original)
    def visit(x):
        if isinstance(x,dict):
            if set(x)=={'mode','elasticModulusMPa','poissonRatio','flexuralFactor','torsionFactor','shearAreaFactor'}:
                x.update(elasticModulusMPa=young_mpa,poissonRatio=.2,flexuralFactor=1.,torsionFactor=1.,shearAreaFactor=5/6)
            elif set(x)=={'mode','elasticModulusMPa','poissonRatio','shearModulusMPa'}:
                x.update(elasticModulusMPa=young_mpa,poissonRatio=.2,shearModulusMPa=young_mpa/2.4)
            elif set(x)=={'elasticModulusMPa','poissonRatio','thicknessMm','flexuralFactor','shearFactor','unitWeightKNPerM3'}:
                x.update(elasticModulusMPa=young_mpa,poissonRatio=.2,flexuralFactor=1.,shearFactor=5/6)
            elif x.get('mode')=='authored-conventional-slab-level-band':
                x.update(elasticModulusMPa=young_mpa,flexuralFactor=1.)
            for key,value in x.items():
                if key!='sourceSHA256':visit(value)
        elif isinstance(x,list):
            for value in x:visit(value)
    visit(result)
    return result


def trace(node,axis,coefficient=1.):
    return [(node,[coefficient if i==axis else 0. for i in range(6)])]


def in_patch(point,strict=True):
    x,y=point
    return PATCH[0]<x<PATCH[2] and PATCH[1]<y<PATCH[3] if strict else PATCH[0]<=x<=PATCH[2] and PATCH[1]<=y<=PATCH[3]


def map_force(target,maps,values,factor=1.):
    for node,row in combine(maps,values):_add(target,node,[factor*v for v in row])


def interpolate(stations,maps,value):
    if value<stations[0]-1e-8 or value>stations[-1]+1e-8:raise ValueError('No contour extrapolation')
    if value<=stations[0]:return maps[0]
    if value>=stations[-1]:return maps[-1]
    i=next(i for i,(a,b) in enumerate(zip(stations,stations[1:])) if a<=value<=b)
    t=(value-stations[i])/(stations[i+1]-stations[i])
    return combine([maps[i],maps[i+1]],[1-t,t])


class Insertion:
    def __init__(self,case,settings):
        self.case=case;self.settings=settings;self.model=None;self.engine=None
        self.wind_rows=None;self.component_loads={};self.audit={}

    def install_exterior(self,model,source,section):
        """Retain real native contour fields and remove only the replaced domain."""
        self.model=model;frame=model['model'];data=model['verticalFloor'];joined=model['joinedFloor'];old=data['operator'];assembled=old['assembled'];old_floor=joined['floor']
        if section['thicknessMm']!=200 or data['request']['plateLaw']['elasticModulusMPa']!=self.settings['youngMPa']:
            raise ValueError('Actual RC200 and declared uniform comparison law required')
        cells=data['cells'];axes=[sorted({r[k] for r in cells for k in (a,a+2)}) for a in (0,1)]
        if any(PATCH[a+2] not in axes[a] or PATCH[a+2] not in old_floor['coordinateColumns'][a] for a in (0,1)):
            raise ValueError('Finite patch must have actual common plate/membrane cut axes')
        if any(r[0]<PATCH[2] and r[2]>PATCH[0] and r[1]<PATCH[3] and r[3]>PATCH[1] and not (PATCH[0]<=r[0]<r[2]<=PATCH[2] and PATCH[1]<=r[1]<r[3]<=PATCH[3]) for r in cells):
            raise ValueError('No clipping through an actual plate element')
        inside=[r for r in cells if PATCH[0]<=r[0]<r[2]<=PATCH[2] and PATCH[1]<=r[1]<r[3]<=PATCH[3]]
        expected=(PATCH[2]-PATCH[0])*(PATCH[3]-PATCH[1])
        if abs(sum((r[2]-r[0])*(r[3]-r[1]) for r in inside)-expected)>1e-6:
            raise ValueError('Actual finite patch contains a source aperture or missing material')
        self.old_plate=old;self.old_floor=old_floor
        self.common_membrane_axes=[sorted(set(old_floor['coordinateColumns'][a]+[v+delta for v in PATCH[2:] for delta in (-70.,0.,70.)])) for a in (0,1)]
        self.contact_fibres=[f for f in data['fibres'] if in_patch(f['xyMm'])]
        self.audit['removedPlateAreaM2']=expected/1e6
        self.audit['actualNormalContactCount']=len(self.contact_fibres)
        self.audit['actualNormalContactIds']=[f['id'] for f in self.contact_fibres]
        self.exterior_cells=[r for r in cells if r not in inside]
        self.contours={side:{'plate':sorted({p[a] for r in cells for p in ((r[0],r[1]),(r[2],r[1]),(r[2],r[3]),(r[0],r[3])) if p[1-a]==PATCH[3-a] and PATCH[a]<=p[a]<=PATCH[a+2]}),
                             'membrane':[v for v in self.common_membrane_axes[a] if PATCH[a]<=v<=PATCH[a+2]]}
                       for side,a in (('east',1),('north',0))}
        self.point_nodes={};point_ports=[]
        for side,a in (('east',1),('north',0)):
            line=self.contours[side]['membrane']
            line=sorted(set([332.5,*[v for v in line if v>402.5]]))
            for value in line:
                point=(PATCH[2],value) if side=='east' else (value,PATCH[3])
                if point in self.point_nodes:continue
                node=frame.node('FINITE-SW/membrane/'+side+'/'+str(value),[*point,MID]);self.point_nodes[point]=node
                point_ports.append({'id':'FINITE-SW/'+side+'/'+str(value),'originXYMm':list(point),'node':node})
        ports=copy.deepcopy(old_floor['ports'])
        if self.settings['enabled']:
            next(p for p in ports if p['id']=='SW')['rectangles']=[]
        loops=copy.deepcopy(old_floor['bands']);omissions=copy.deepcopy(old_floor['omissionsXYMm'])
        if self.settings['enabled']:
            omissions.append(list(PATCH))
            for row in loops:
                if row['id']=='outer-south':row['lo']=PATCH[2]
                if row['id']=='outer-west':row['lo']=PATCH[3]
        # Concrete axial stiffness is now explicit, separate from retained
        # steel-chord EA. It is not smuggled into the authored steel allowance.
        law=copy.deepcopy(old_floor['unqualifiedLaw'])
        concrete_ea=self.settings['youngMPa']*140.*200./1000
        law['edgeAxialRigidityKN']+=concrete_ea
        self.audit['retainedSteelChordEAKN']=old_floor['unqualifiedLaw']['edgeAxialRigidityKN']
        self.audit['explicitConcreteBandEAKN']=concrete_ea
        rows=copy.deepcopy(model['housePressure']['reconciledFloorRows']);outside=[];inside_wind=[]
        for row in rows:
            force_axis=0 if row['forceKN'][0] else 1;along=1-force_axis
            target=(row['pointXYZMm'][force_axis]==332.5 and row['loadedAlongIntervalMm'][0]<PATCH[along+2])
            if not self.settings['enabled'] or not target:
                outside.append(row);continue
            lo,hi=row['loadedAlongIntervalMm'];cut=PATCH[along+2]
            for start,end,target_list in ((lo,min(hi,cut),inside_wind),(max(lo,cut),hi,outside)):
                if end<=start:continue
                changed=copy.deepcopy(row);changed['id']+='/finite-'+('inside' if target_list is inside_wind else 'outside')
                changed['loadedAlongIntervalMm']=[start,end];changed['forceKN']=[v*(end-start)/(hi-lo) for v in row['forceKN']]
                changed['pointXYZMm'][along]=(start+end)/2;target_list.append(changed)
        self.wind_rows=outside;self.inside_wind=inside_wind
        floor=compile_perforated_floor(old_floor['sourceBodiesXYMm'] if 'sourceBodiesXYMm' in old_floor else self.source_bodies(source,model),omissions,loops,ports,law,
            model['houseLoadCase']['joinedCase']['floor']['maxPitchMm'],outside,old_floor['finiteBeamBoundaryReceivers'],retained_point_ports=point_ports,extra_coordinates=self.common_membrane_axes)
        self.audit['inplaneCoordinateColumns']=floor['coordinateColumns']
        modes=floor.pop('energyModes');joined['floor']=floor
        new_terms=_membrane_maps(model,MID)
        _energy_springs(frame,'JOINED-FLOOR/energy/',modes,new_terms);joined['portTerms']=new_terms
        for item in floor['retainedPointParticipation']:
            node=next(p['node'] for p in floor['ports'] if p['id']==item['id'])
            if 2 not in item['activeCoordinates']:frame.fixed[node,5]=0.
        loads={}
        for value,terms in zip(floor['condensedForceKN'],new_terms):
            for node,row in terms:_add(loads,node,[value*v for v in row])
        _pressure_offset_couples(model,rows,loads,MID)
        model['families']['native-floor-reconciled']=loads
        self.rebuild_vertical(model)
        return section

    @staticmethod
    def source_bodies(source,model):
        from retained_components import evaluate_retained_components
        request=model['houseLoadCase']['joinedCase']['floor']
        owning=source['base']['vertical']['parent']['house']['joined']['floor']
        actual=evaluate_retained_components(request['componentCase'],owning['retained'])
        return [r['geometry']['bodyRectangleXYMm'] for r in actual['components'] if r['kind']=='first-floor']

    def rebuild_vertical(self,model):
        frame=model['model'];data=model['verticalFloor'];old=data['operator'];assembled=old['assembled'];ports=data['ports'];terms=data['portTerms']
        point_terms={};self.vertical_nodes={}
        for side,a in (('east',1),('north',0)):
            for v in self.contours[side]['plate']:
                point=(PATCH[2],v) if side=='east' else (v,PATCH[3])
                if point in self.vertical_nodes:continue
                node=self.point_nodes.get(point) or frame.node('FINITE-SW/plate/'+side+'/'+str(v),[*point,MID])
                if node not in self.point_nodes.values():
                    frame.fixed[node,0]=0.;frame.fixed[node,1]=0.;frame.fixed[node,5]=0.
                indices=[]
                for axis,coordinate in ((2,0),(3,1),(4,2)):
                    index=len(ports);ports.append({'id':f'FINITE-SW/{side}/{v}/{coordinate}','xyMm':list(point),'coordinate':coordinate})
                    terms.append(trace(node,axis,1 if axis==2 else 1000.));indices.append(index)
                point_terms[point]=[[(i,1 if axis==0 else .001)] for axis,i in enumerate(indices)]
                self.vertical_nodes[point]=node
        retained=len(ports)
        def boundary(point,axis):
            if point in point_terms:return point_terms[point][axis]
            previous=assembled['pointTerms'].get((point,axis))
            return list(previous) if previous is not None and all(i<assembled['portCount'] for i,_ in previous) else None
        cells=self.exterior_cells if self.settings['enabled'] else data['cells']
        fresh=assemble_vertical_plate(cells,assembled['law'],boundary,retained)
        rigid=[[(1 if kind==0 else .001*r['xyMm'][1] if kind==1 else -.001*r['xyMm'][0]) if r['coordinate'] in (None,0) else (1 if r['coordinate']==kind else 0) for r in ports] for kind in range(3)]
        operator=condense_vertical_plate(fresh,rigid)
        for vector,factor,work_maps in ((old['condensedSelfG'],-1.,terms[:assembled['portCount']]),(operator['condensedSelfG'],1.,terms)):
            for value,maps in zip(vector,work_maps):
                for node,row in maps:_add(model['families']['physical-G'],node,[factor*value*v for v in row])
        _replace_vertical_plate_energy(frame,data,operator);data['cells']=cells
        data['mass'].update(newPlatePhysicalSelfGKN=fresh['physicalSelfGKN'],newPlateAreaM2=fresh['areaM2'],newPlateCentroidXYMm=fresh['centroidXYMm'])
        # Existing roof feet remain outside this patch and retain exact work.
        for receiver in data['retainedPointReceivers'].values():
            point=tuple(receiver['xyMm']);coefficient=fresh['pointTerms'].get((point,0))
            if coefficient is not None:receiver['physicalPlateParticipation']=retained_receiver_operator_participation(point,coefficient,fresh,operator)
        self.audit['exteriorPlateAreaM2']=fresh['areaM2']
        self.audit['exteriorPlateGKN']=fresh['physicalSelfGKN']
        for node in self.point_nodes.values():
            if node not in self.vertical_nodes.values():
                for axis in (2,3,4):frame.fixed[node,axis]=0.

    def membrane_trace(self,side,value,axis):
        def at(v):
            if v<=402.5+1e-8:
                p=(PATCH[2],332.5) if side=='east' else (332.5,PATCH[3]);node=self.point_nodes[p]
                result=trace(node,axis)
                if (side=='east' and axis==0) or (side=='north' and axis==1):
                    result=combine([result,trace(node,5)],[1.,-(v-332.5) if side=='east' else v-332.5])
                return result
            p=(PATCH[2],v) if side=='east' else (v,PATCH[3])
            return trace(self.point_nodes[p],axis)
        stations=sorted({402.5,*[v for v in self.contours[side]['membrane'] if v>402.5]})
        if value<=402.5+1e-8:return at(value)
        return interpolate(stations,[at(v) for v in stations],value)

    def vertical_trace(self,side,value,axis):
        stations=self.contours[side]['plate']
        maps=[trace(self.vertical_nodes[(PATCH[2],v) if side=='east' else (v,PATCH[3])],axis) for v in stations]
        return interpolate(stations,maps,value)

    def install_solid(self,model):
        from finite_rc_joint_solid import build_joint,condense_load,line_load
        from finite_joint_contact_trace import remap_contacts
        frame=model['model'];data=model['verticalFloor'];g=model['families']['physical-G']
        sw=next(r for r in model['joinedFloor']['corners'] if r['id']=='SW')
        lower=sw['node'];centroid=frame.nodes[lower][:2]
        self.upper_node=frame.node('FINITE-SW/wall-upper', [*centroid,4370.])
        normal_nodes={}
        for i,fibre in enumerate(self.contact_fibres):
            node=frame.node('FINITE-SW/normal/'+str(i),[*fibre['xyMm'],3170.]);normal_nodes[fibre['id']]=node
            for axis in (0,1,3,4,5):frame.fixed[node,axis]=0.
        self.audit['normalTopTraceReplacement']=remap_contacts(model,PATCH,normal_nodes,{'operator':self.old_plate,'portTerms':data['portTerms'][:self.old_plate['assembled']['portCount']]})
        contours={side:sorted(set(self.contours[side]['plate']+self.contours[side]['membrane']+[332.5,402.5])) for side in ('east','north')}
        self.audit['solidGeometry']={'patchXYMm':PATCH,'slabZMm':[3170.,3370.],'lowerLRectanglesXYMm':sw['rectangles'],'wallCentroidXYMm':centroid,'upperEndZMm':4370.}
        self.engine=build_joint(patch_xy_mm=PATCH,slab_z_mm=[3170.,3370.],l_rectangles_xy_mm=sw['rectangles'],wall_centroid_xy_mm=centroid,
            upper_end_z_mm=4370.,contours_mm=contours,normal_points_xy_mm=[f['xyMm'] for f in self.contact_fibres],
            chord_axis_xy_mm=[332.5,332.5],chord_axial_rigidity_kn=self.audit['retainedSteelChordEAKN'],pitch_mm=self.settings['solidPitchMm'],
            young_mpa=self.settings['youngMPa'],poisson=.2,slab_density_kn_m3=data['request']['plateLaw']['unitWeightKNPerM3'],
            wall_density_kn_m3=self.case['bearingCase']['roofControls']['upperUnitWeightKNPerM3'],slab_live_kpa=1.5*data['request']['freshUniformLiveKPa'])
        self.maps=[]
        for port in self.engine['ports']:
            kind,c=port['kind'],port['coordinate'];axis=('u','v','w','rx','ry','rz').index(c)
            if kind=='wall':
                node=lower if '/lower/' in port['id'] else self.upper_node
                result=trace(node,axis,.001 if axis<3 else 1.)
            elif kind=='normal':result=trace(normal_nodes[self.contact_fibres[port['contactIndex']]['id']],2,.001)
            elif kind=='band':
                side='east' if '/east/' in port['id'] else 'north'
                node=self.point_nodes[(PATCH[2],332.5) if side=='east' else (332.5,PATCH[3])]
                result=trace(node,axis,.001 if axis<3 else 1.)
            else:
                x,y=[v*1000 for v in port['xyM']];side='east' if abs(x-PATCH[2])<1e-7 else 'north';value=y if side=='east' else x
                result=self.membrane_trace(side,value,axis) if axis<2 else self.vertical_trace(side,value,axis)
                if axis<3:result=[(n,[v*.001 for v in row]) for n,row in result]
            self.maps.append(result)
        # Independent world rigid fields must survive the assembled SI maps,
        # including translations/rotations across different contour meshes.
        mapped_rigid=[]
        for maps in self.maps:
            values=[]
            for kind in range(6):
                total=0.
                for node,row in maps:
                    xyz=frame.nodes[node];rotation=[float(kind==i+3) for i in range(3)]
                    translation=[1000.*float(kind==i) for i in range(3)]
                    translation=[a+b for a,b in zip(translation,cross(rotation,xyz))]
                    total+=sum(a*b for a,b in zip(row,[*translation,*rotation]))
                values.append(total)
            mapped_rigid.append(values)
        rigid_error=float(abs(np.asarray(mapped_rigid)-self.engine['rigidModes']).max())
        if rigid_error>1e-9:raise ValueError('Actual finite/global work map restrains a world rigid motion')
        self.audit['globalMapRigidModeResidual']=rigid_error
        k=self.engine['condensedStiffness'];scale_q=np.array([.001 if p['coordinate'] in ('rx','ry','rz') else 1. for p in self.engine['ports']])
        # Port coordinates themselves are SI. Congruence balances eigenvalue
        # conditioning only; maps below restore the exact original energy.
        scaled=scale_q[:,None]*k*scale_q[None,:];values,vectors=np.linalg.eigh((scaled+scaled.T)/2)
        maximum=max(1.,float(abs(scaled).max()))
        if values.min() < -maximum*1e-8:raise ValueError('Actual finite component has negative energy')
        modes=(vectors[:,values>maximum*1e-11]*np.sqrt(values[values>maximum*1e-11])).T/scale_q[None,:]
        error=float(abs(modes.T@modes-k).max())/max(1.,float(abs(k).max()))
        if error>1e-8:raise ValueError('Mapped finite component energy reconstruction failed')
        # Condensation/eigensolution roundoff must not supply a fictitious
        # world-rigid stiffness. Remove only its measured six-dimensional
        # null-work error, never relax the independent52-head balance limit.
        rigid=self.engine['rigidModes'];modes-=modes@rigid@np.linalg.pinv(rigid)
        projected_error=float(abs(modes.T@modes-k).max())/max(1.,float(abs(k).max()))
        if projected_error>1e-8:raise ValueError('Rigid-null projection changes physical component energy')
        correction=0.
        for i,mode in enumerate(modes):
            rows=dict(combine(self.maps,mode*np.sqrt(1000.)));rows.setdefault(lower,[0.]*6)
            before={n:list(row) for n,row in rows.items()}
            force=[math.fsum(row[a] for row in rows.values()) for a in range(3)]
            moment=[math.fsum(row[a+3]+cross([x-y for x,y in zip(frame.nodes[n],frame.nodes[lower])],row[:3])[a] for n,row in rows.items()) for a in range(3)]
            for a in range(3):rows[lower][a]-=force[a];rows[lower][a+3]-=moment[a]
            correction=max(correction,max(abs(rows[n][a]-before[n][a]) for n in rows for a in range(6))/max(1.,max(abs(v) for row in before.values() for v in row)))
            frame.springs.append({'id':'FINITE-SW/energy/'+str(i),'terms':list(rows.items()),'stiffness':1.,'mode':'bilateral','gap':0.})
        if correction>1e-8:raise ValueError('Global rigid-null roundoff correction changes finite work map')
        self.audit['rigidNullProjectedEnergyRelativeError']=projected_error
        self.audit['mappedRigidNullRoundoffRelativeCorrection']=correction
        map_force(g,self.maps,self.engine['gravityLoad'],1000.)
        self.component_loads={'gravity':self.engine['physicalLoads']['gravity'].copy(),'live':self.engine['physicalLoads']['live'].copy(),'wind':np.zeros(self.engine['basis'].N),'upper':np.zeros(self.engine['basis'].N)}
        for row in self.inside_wind:
            force_axis=0 if row['forceKN'][0] else 1;along=1-force_axis;lo,hi=row['loadedAlongIntervalMm']
            vector=line_load(self.engine,axis=along,fixed_coordinate_mm=row['pointXYZMm'][force_axis],z_mm=MID,interval_mm=[lo,hi],force_density_kn_per_mm=[v/(hi-lo) for v in row['forceKN']])
            self.component_loads['wind']+=vector
        map_force(model['families']['native-floor-reconciled'],self.maps,condense_load(self.engine,self.component_loads['wind']),1000.)
        # An old normal vertex wholly inside the replaced domain can become
        # unused. Gauge only a proven unused scalar, with no physical force.
        used={n for _,a,b,_ in frame.members for n in (a,b)}|{n for s in frame.springs for n,row in s['terms'] if any(row)}|{n for maps in data['portTerms'] for n,row in maps if any(row)}
        active_plate={i for element in data['operator']['assembled']['elements'] for terms in element['terms'] for i,v in terms if v}
        inactive_nodes={n for i,maps in enumerate(data['portTerms']) if i not in active_plate for n,row in maps if n.startswith('VERTICAL-FLOOR/normal/')}
        for node in inactive_nodes:
            other_used=any(n==node and any(row) for s in frame.springs for n,row in s['terms']) or any(node in (a,b) for _,a,b,_ in frame.members)
            if other_used or any(model['families']['physical-G'].get(node,[0.]*6)):continue
            frame.fixed[node,2]=0.
        self.audit.update(solidPortCount=len(self.engine['ports']),solidVolumeM3=self.engine['volumeM3'],actualJointGKN=-float(self.engine['rigidModes'][:,2]@self.engine['gravityLoad']),mappedEnergyReconstructionRelativeError=error)

    def shorten_upper(self,model,bearing):
        frame=model['model'];g=model['families']['physical-G'];row=next(r for r in model['roofFloorCoupling']['upperL'] if r['cornerId']=='SW')
        old_weight=row['physicalSelfGKN']
        for node,load in zip((row['lowerNode'],row['roofNode']),row['equivalentGKN_KNmm']):_add(g,node,[-v for v in load])
        frame.members=[m for m in frame.members if m[0]!=row['id']]
        sw=next(r for r in model['joinedFloor']['corners'] if r['id']=='SW');origin=sw['originXYMm'];floor=model['houseLoadCase']['joinedCase']['floor']
        section=l_section(262.5-origin[0],floor['cornerWidthsMm']['SW'],1262.5-origin[0]);orientation=[*section['principalYUV'],0]
        start=list(frame.nodes[self.upper_node]);finish=row['physicalEndXYZMm']
        frame.member(row['id'],self.upper_node,row['roofNode'],section,bearing['roofControls']['upperFrameLaw'],physical_start=start,physical_end=finish,y_axis=orientation)
        from joined_successor_compatibility import _wrench_at
        volume=section['A']*(finish[2]-start[2])/1e9;weight=volume*bearing['roofControls']['upperUnitWeightKNPerM3'];equivalents=[]
        for node,point in ((self.upper_node,start),(row['roofNode'],finish)):
            wrench=_wrench_at([0,0,-weight/2],point,frame.nodes[node]);_add(g,node,wrench);equivalents.append(wrench)
        row.update(lowerNode=self.upper_node,physicalStartXYZMm=start,physicalRCUnionVolumeM3=volume,physicalSelfGKN=weight,equivalentGKN_KNmm=equivalents,
                   slabDepthTransfer='Finite solid SW slab/upper stub; actual lower frame cut at3170, upper finite cut4370; no rigid1000mm arm.')
        model['roofFloorCoupling']['upperLPhysicalGKN']+=weight-old_weight

    def upper_patch(self,rectangle,pressure,target):
        from finite_rc_joint_solid import top_patch_load,condense_load
        if not (PATCH[0]<=rectangle[0]<rectangle[2]<=PATCH[2] and PATCH[1]<=rectangle[1]<rectangle[3]<=PATCH[3]):return None
        vector=top_patch_load(self.engine,rectangle,pressure);self.component_loads['upper']+=vector
        map_force(target,self.maps,condense_load(self.engine,vector),1000.)
        return {'physicalGKN':(rectangle[2]-rectangle[0])*(rectangle[3]-rectangle[1])*pressure,'distributedLoads':[{'finiteJointPatch':list(rectangle),'pressureKNPerMm2':pressure}]}


def run_current_finite_joint(case,settings,root):
    """Execute the same saved native controls through the actual joined model."""
    import floor_section_model as native
    from finite_rc_joint_solid import recover
    if set(settings)!={'enabled','youngMPa','solidPitchMm'} or type(settings['enabled']) is not bool or settings['youngMPa'] not in (8250.,16500.,33000.) or settings['solidPitchMm'] not in (250.,140.,100.,70.):
        raise ValueError('Explicit supported conventional finite-joint comparison controls required')
    root=Path(root);source=native.load_source(root)
    if case['sourceSHA256']!=source['identities']:raise ValueError('Current actual saved source identity required')
    trial=uniform_concrete_case(case,settings['youngMPa']);insertion=Insertion(trial,settings)
    replace=native.replace_floor_section;upper=native._replace_upper_L_start;free=native._free_top_load;live=native.fresh_net_floor_live_load;interfaces=native._interface_result;solve=native.solve_vertical_frame
    captured={};methods=method_identities(root);runtime=runtime_versions()
    def replaced(model,owner,thickness):
        result=replace(model,owner,thickness);insertion.install_exterior(model,owner,result)
        if settings['enabled']:insertion.install_solid(model)
        return result
    def trimmed(model,bearing,top):
        upper(model,bearing,top)
        if settings['enabled']:insertion.shorten_upper(model,bearing)
    def free_load(model,inventory,additional_patch_receiver=None):
        def route(rectangle,pressure,target):
            result=insertion.upper_patch(rectangle,pressure,target) if settings['enabled'] else None
            return result if result is not None else additional_patch_receiver(rectangle,pressure,target) if additional_patch_receiver else None
        return free(model,inventory,additional_patch_receiver=route)
    def fresh_live(model):
        result=live(model)
        if settings['enabled']:map_force(result['loads'],insertion.maps,insertion.engine['liveLoad'],1000.)
        return result
    def interface(model,raw,mid):
        if not settings['enabled']:return interfaces(model,raw,mid)
        shadow={**model,'housePressure':{**model['housePressure'],'reconciledFloorRows':insertion.wind_rows}}
        return interfaces(shadow,raw,mid)
    def solved(frame,data):
        result=solve(frame,data);captured['raw']=result;return result
    try:
        native.replace_floor_section=replaced;native._replace_upper_L_start=trimmed;native._free_top_load=free_load
        native.fresh_net_floor_live_load=fresh_live;native._interface_result=interface;native.solve_vertical_frame=solved
        output=native.run(trial,source,'CURRENT-FINITE-SW' if settings['enabled'] else 'CURRENT-FINITE-AXES-CONTROL')
    finally:
        native.replace_floor_section=replace;native._replace_upper_L_start=upper;native._free_top_load=free;native.fresh_net_floor_live_load=live
        native._interface_result=interfaces;native.solve_vertical_frame=solve
    result={'schema':'str-current-finite-rc-joint/1','authoredNativeCase':case,'executedConventionalCase':trial,'settings':settings,'sourceSHA256':source['identities'],
            'methodSHA256':methods,'runtime':runtime,'scope':{'topology':'one SW actual finite slab/upper-stub joint; three other L rigid patch controls retained','constitutiveLaw':'isotropic uniform secant RC frame/slab comparison; source normal-contact laws retained independently','boundary':'lower L cross-section3170mm, finite slab3170..3370mm and upper L stub3370..4370mm; frame continuation above4370mm','loads':'same authored native52-head case, existing physical-G factor, fresh1.5Q and signed wind; optional additive service-room-ground stage not included','reinforcement':'not designed; no RC strength, cracking, anchorage or durability acceptance'},'audit':insertion.audit,'native':output,'candidateAccepted':False,'completeHouseProof':False,'resistanceAccepted':False}
    if settings['enabled']:
        g=trial['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
        physical=g*(insertion.component_loads['gravity']+insertion.component_loads['upper'])+insertion.component_loads['live']+insertion.component_loads['wind']
        q=[sum(v*captured['raw']['displacements'][n][axis] for n,row in maps for axis,v in enumerate(row)) for maps in insertion.maps]
        recovered=recover(insertion.engine,q,physical)
        result['finiteJoint']={k:v.tolist() if isinstance(v,np.ndarray) else v for k,v in recovered.items() if k!='physicalDisplacementsM'}
        joint=result['finiteJoint'];joint['ports']=insertion.engine['ports']
        joint['portDisplacementsM_Rad']=q
        joint['condensedStiffnessKN_KNm']=insertion.engine['condensedStiffness'].tolist()
        joint['condensedPhysicalLoadKN_KNm']=(insertion.engine['response'].T@physical).tolist()
        joint['externalWrenchKN_KNm']=(insertion.engine['rigidModes'].T@(insertion.engine['response'].T@physical)).tolist()
        joint['portGlobalRigidModes']=insertion.engine['rigidModes'].tolist()
        factors={'gravity':g,'upper':g,'live':1.,'wind':1.}
        joint['loadFamilies']={name:{'factor':factors[name],'condensedLoadKN_KNm':(insertion.engine['response'].T@vector*factors[name]).tolist(),
            'globalWrenchKN_KNm':(insertion.engine['rigidModes'].T@(insertion.engine['response'].T@vector)*factors[name]).tolist()} for name,vector in insertion.component_loads.items()}
        joint['insideWindRows']=insertion.inside_wind
        cells=output['nativeVertical']['plate']['cellsXYMm'];bounds=[min(r[0] for r in cells),min(r[1] for r in cells),max(r[2] for r in cells),max(r[3] for r in cells)];scale=780/max(bounds[2]-bounds[0],bounds[3]-bounds[1])
        px=lambda x:60+(x-bounds[0])*scale
        py=lambda y:930-(y-bounds[1])*scale
        a,b,c,d=PATCH
        overlay=f'<g><rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="#dcb988" fill-opacity=".8" stroke="#663d18" stroke-width="1.5"/>'
        for fibre in insertion.contact_fibres:
            x,y=fibre['xyMm'];overlay+=f'<circle cx="{px(x):.3f}" cy="{py(y):.3f}" r="1.6" fill="#452c16"/>'
        overlay+=f'<text x="{px(a)+4:.3f}" y="{py(d)+16:.3f}" style="font-size:10px">Actual finite SW joint /32 normal traces</text></g>'
        for path,svg in output['drawings'].items():output['drawings'][path]=svg.replace('</svg>',overlay+'</svg>')
    if methods!=method_identities(root) or source['identities']!=native.load_source(root)['identities'] or runtime!=runtime_versions():raise ValueError('Finite-joint source changed during execution')
    return result

