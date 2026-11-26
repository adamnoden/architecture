"""Finite normal pier beds with explicitly ideal tangential/yaw keys.

Additive experimental adapter: unchanged native kernels, geometry, G and source
loads. A zero-thickness spring comparison supplies no masonry/DPC material law
or key resistance. Each lower fibre uses its actual contained grid-member trace.
"""
from __future__ import annotations
import copy
import hashlib
import json
import math
from pathlib import Path

import wet_masonry_arch_rise as rise
from finite_mapped_frame import combine, mapped_frame_member, node_trace
from joined_successor_kernel import rectangle_section, cross
from seated_wet_support import _grid_point_maps
from vertical_rc_floor import grid_member_geometry

ROOT=rise.ROOT
METHOD='project/str/studies/wet_masonry_arch_bed.py'


def admit_bed(value):
    if (not isinstance(value,dict) or set(value)!={'enabled','cellsPerAxis','normalComplianceMmPerMPa','tangentialKeyHypothesis'}
        or type(value['enabled']) is not bool or type(value['cellsPerAxis']) is not int
        or value['cellsPerAxis'] not in (2,4,8,16)
        or type(value['normalComplianceMmPerMPa']) not in (int,float)
        or not math.isfinite(value['normalComplianceMmPerMPa'])
        or not .001<=value['normalComplianceMmPerMPa']<=10
        or value['tangentialKeyHypothesis']!='ideal-work-dual-centroid-ux-uy-rz'):
        raise ValueError('Explicit bounded normal bed and ideal positive tangential/yaw key required')
    return copy.deepcopy(value)


def add_normal_bed(frame,identifier,foot,rectangle,lower_trace,cells,compliance):
    """Physical rigid upper plane against actual lower work-dual normal traces."""
    x0,y0,x1,y1=rectangle
    if not x0<x1 or not y0<y1 or cells not in (2,4,8,16) or not .001<=compliance<=10:
        raise ValueError('Finite covered footprint, quadrature and positive compliance required')
    centre=frame.nodes[foot]
    if max(abs(centre[i]-(rectangle[i]+rectangle[i+2])/2) for i in (0,1))>1e-7:
        raise ValueError('Footprint must use actual physical pier centroid')
    fibres=[];maximum_rigid=0.
    for i in range(cells):
        for j in range(cells):
            x=x0+(i+.5)*(x1-x0)/cells;y=y0+(j+.5)*(y1-y0)/cells
            lower,receiver=lower_trace([x,y,centre[2]])
            upper=[(foot,[0.,0.,1.,y-centre[1],-(x-centre[0]),0.])]
            terms=combine([upper,lower],[1.,-1.])
            for mode in range(6):
                omega=[float(mode==k+3) for k in range(3)];translation=[float(mode==k) for k in range(3)]
                work=0.
                for node,row in terms:
                    rigid=cross(omega,frame.nodes[node]);u=[*[a+b for a,b in zip(translation,rigid)],*omega]
                    work+=sum(a*b for a,b in zip(row,u))
                maximum_rigid=max(maximum_rigid,abs(work))
            area=(x1-x0)*(y1-y0)/cells**2;name=f'{identifier}/normal/{i}/{j}'
            frame.springs.append({'id':name,'terms':terms,'stiffness':area/compliance/1000,'mode':'compression','gap':0.})
            fibres.append({'id':name,'xyMm':[x,y],'areaMm2':area,'receiverId':receiver,
                           'stiffnessKNPerMm':area/compliance/1000})
    if maximum_rigid>1e-7:raise ValueError('Finite bed violates six rigid-motion work identities')
    return {'footNode':foot,'rectangleXYMm':list(rectangle),'fibres':fibres,
            'maximumRigidWorkResidual':maximum_rigid,'normalComplianceMmPerMPa':compliance,
            'quadrature':'uniform-cell-midpoints; actual nonaffine lower traces, refinement required'}


class NormalBedArchAdapter(rise.RiseArchAdapter):
    def __init__(self,*args,bed,**kwargs):
        self.bed=admit_bed(bed)
        super().__init__(*args,**kwargs)

    def build(self,model,legacy_setting,h,required_stations=()):
        value=super().build(model,legacy_setting,h,required_stations)
        if not self.bed['enabled']:return value
        frame=model['model'];wall=model['seatedWetSupport']['experimentalArch'];geometry=grid_member_geometry(model)
        for p in wall['piers']:
            old=p['member'];identifier=old['id'];old_maps=old['endMaps'];base=old['physicalStartMm']
            foot=frame.node(identifier+'/normal-foot',base)
            # Only unused gauges: no spring/load/member may use these axes.
            for axis in (0,1,5):frame.fixed[(foot,axis)]=0.
            maps=copy.deepcopy(old_maps)
            for axis in (2,3,4):maps[axis]=node_trace(foot)[axis]
            owned=[s for s in frame.springs if s['id'].startswith(identifier+'/energy/')]
            if len(owned)!=6:raise ValueError('Expected exactly six physical mapped-pier energy modes')
            frame.springs[:]=[s for s in frame.springs if not s['id'].startswith(identifier+'/energy/')]
            del frame.mappedMembers[identifier]
            interval=p['intervalYMm'];width=wall['geometry']['archPhysicalGeometry']['normalWidthMm']
            item=mapped_frame_member(frame,identifier,base,old['physicalEndMm'],rectangle_section(interval[1]-interval[0],width),
                                     wall['masonryLaw'],maps,[1,0,0])
            if item['physicalK']!=old['physicalK']:raise ValueError('Bed adapter changed physical pier stiffness')
            p['member']=item
            def lower(point):
                actual,receiver,z=_grid_point_maps(model,geometry,point)
                if abs(z-base[2])>1e-7:raise ValueError('Actual bed/grid surface elevation mismatch')
                return actual[2],receiver
            rectangle=[base[0]-width/2,interval[0],base[0]+width/2,interval[1]]
            p['normalBed']=add_normal_bed(frame,identifier,foot,rectangle,lower,self.bed['cellsPerAxis'],self.bed['normalComplianceMmPerMPa'])
            p['normalBed']['idealKeyMaps']={str(k):old_maps[k] for k in (0,1,5)}
        wall['normalBedSettings']=self.bed
        wall['pierFootAllSixWeldRetained']=False
        return value

    def finish(self,model,raw,g_factor):
        result=super().finish(model,raw,g_factor)
        if not self.bed['enabled']:
            result['arch']['normalBedDisabledControl']=True
            return result
        states={s['id']:s for s in raw['springs']}
        for p in result['arch']['piers']:
            bed=p['normalBed'];force=mx=my=energy=0.;peak=0.;rows=[];xc,yc,_=p['baseXYZMm']
            for f in bed['fibres']:
                state=states[f['id']];compression=-state['forceKN']
                if compression< -1e-7:raise ValueError('Compression-only bed transmits tension')
                x,y=f['xyMm'];force+=compression;mx+=(y-yc)*compression;my-=(x-xc)*compression
                peak=max(peak,compression*1000/f['areaMm2']);energy+=state['forceKN']**2/(2*f['stiffnessKNPerMm'])
                rows.append({**f,'actualState':state,'pressureMPa':compression*1000/f['areaMm2']})
            w=p['recovery']['physicalEndWrenchesKN_KNmm']
            residual=[force-w[2],mx-w[3],my-w[4]]
            if max(map(abs,residual))>1e-5:raise ValueError('Actual normal-bed/pier boundary wrench does not close')
            gauges=raw['supportWrenches'].get(bed['footNode'],[0.]*6)
            if max(map(abs,gauges))>1e-7:raise ValueError('Unused normal-foot gauges carry physical load')
            bed.update(fibres=rows,normalCompressionKN=force,normalFirstMomentsKNmm=[mx,my],
                       peakSampledPressureMPa=peak,contactEnergyKNmm=energy,
                       physicalPierNormalBoundaryResidualKN_KNmm=residual,
                       idealKeyRequiredFxFyKNAndMzKNmm=[w[0],w[1],w[5]],
                       unusedGaugeSupportWrenchKN_KNmm=gauges,
                       actualFootDisplacementMmRad=raw['displacements'][bed['footNode']],
                       contactConverged=False,keyMaterialAndResistanceAccepted=False,bedMaterialAndResistanceAccepted=False)
        return result


def run(request,root=ROOT,checkpoint_path=None):
    if not isinstance(request,dict) or request.get('schema')!='str-wet-masonry-arch-bed-request/1':
        raise ValueError('Explicit source-bound normal-bed experimental request required')
    bed=admit_bed(request.get('normalBed'));native=copy.deepcopy(request);native.pop('normalBed');native['schema']='str-wet-masonry-arch-rise-request/1'
    before=hashlib.sha256((Path(root)/METHOD).read_bytes()).hexdigest();original=rise.RiseArchAdapter
    try:
        rise.RiseArchAdapter=lambda *args,**kwargs:NormalBedArchAdapter(*args,bed=bed,**kwargs)
        result=rise.run(native,root,checkpoint_path)
    finally:rise.RiseArchAdapter=original
    if before!=hashlib.sha256((Path(root)/METHOD).read_bytes()).hexdigest():raise ValueError('Bed source changed during execution')
    result['executedRiseExperimentalRequest']=result['experimentalRequest'];result['experimentalRequest']=copy.deepcopy(request)
    result['schema']='str-experimental-wet-masonry-bed-comparison/1';result['experimentalMethodSHA256'][METHOD]=before
    result['diagnostics'].append('Finite compression-only normal pier beds with actual per-fibre grid work maps and explicitly ideal centroid tangential/yaw keys. No friction, DPC material, key resistance or contact convergence acceptance.')
    return result


if __name__=='__main__':
    import argparse
    from datetime import datetime,timezone
    from four_l_joint_observer import numerical_runtime,require_runtime_threads
    require_runtime_threads()
    p=argparse.ArgumentParser();p.add_argument('--request',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.out.exists():raise ValueError('Refuse overwriting an actual normal-bed capture')
    request=json.loads(a.request.read_bytes())
    a.out.with_suffix('.execution-start.json').write_text(json.dumps({'schema':'str-normal-bed-start/1','startedAt':datetime.now(timezone.utc).isoformat(),
        'requestSHA256':hashlib.sha256(a.request.read_bytes()).hexdigest(),'methodSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'numericalRuntime':numerical_runtime(),'accepted':False},indent=2)+'\n')
    result=run(request,checkpoint_path=a.out.with_suffix('.unvalidated.json'))
    a.out.write_text(json.dumps(result,allow_nan=False));a.out.with_suffix('.unvalidated.json').unlink()
