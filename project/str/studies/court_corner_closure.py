"""Explicit formed SW court node: material, normal route and eccentric gravity.

The retained source has two end-cut rectangular beams meeting on a centreline.
Their missing southwest physical quarter is a real omission, not a hidden pad.
This optional reference authors that quarter as one cast joint-plane comparison.
"""
import hashlib
import json
import math
from pathlib import Path

from foundation_solid_weight import (_settings, disjoint_solid_union, load_foundation_solid_weight_source,
                                      source_foundation_solids, subtract_box)

METHOD='project/str/studies/court_corner_closure.py'
MODE='source-sw-formed-quarter-node-comparison'


def corner_closure_geometry(grid):
    west,south=grid['girders']['court-W'],grid['girders']['court-S']
    if west['axis']!='y' or south['axis']!='x' or west['z']!=south['z']:
        raise ValueError('Explicit coplanar source court-W/S end-node geometry required')
    x,y=west['datum'],south['datum']
    if west['extent'][0]!=y or south['extent'][0]!=x:
        raise ValueError('Source court members no longer meet at their positive-axis endpoints')
    body=[x-west['width']/2,y-south['width']/2,west['z'][0],x,y,west['z'][1]]
    source_solids=source_foundation_solids(grid)
    if any(all(min(body[i+3],row['boxXYZMm'][i+3])-max(body[i],row['boxXYZMm'][i])>1e-8 for i in range(3)) for row in source_solids):
        raise ValueError('Proposed quarter already overlaps source material; reconcile actual union before adding G')
    volume=math.prod(body[i+3]-body[i] for i in range(3))/1e9
    return {'id':'COURT-SW/formed-quarter-node','kind':'explicit-new-RC-node-quarter','boxXYZMm':body,
            'nodeXYMm':[x,y],'newRCVolumeM3':volume,'gridTopZMm':west['z'][1]}


def apply_court_corner_closure(model,source,setting,foundation_settings):
    """Bind actual missing normal fibres to an explicit existing-node plane."""
    from joined_successor_compatibility import _wrench_at
    from rc_floor_house_loads import _family_wrench
    from vertical_floor_plate import rectangle_shapes
    from vertical_rc_floor import _combine_port_terms, inside
    if setting is None:return None
    if setting!={'mode':MODE}:raise ValueError('Only explicit source SW formed-quarter node comparison supported; no approvals or invented dimensions')
    _settings(foundation_settings)
    if 'courtCornerClosure' in model:raise ValueError('Court node closure already applied; duplicate geometry/loads rejected')
    root=Path(source['root']);current=load_foundation_solid_weight_source(root)
    if model['grid']!=current['grid']:raise ValueError('Court corner geometry differs from actual solved grid')
    geometry=corner_closure_geometry(current['grid']);body=geometry['boxXYZMm'];x,y=geometry['nodeXYMm'];frame=model['model'];data=model['verticalFloor']
    candidates=[name for name,p in frame.nodes.items() if name.startswith('GRID-') and abs(p[0]-x)<1e-8 and abs(p[1]-y)<1e-8]
    if len(candidates)!=1:raise ValueError('Actual shared finite grid node is missing or ambiguous; no new support invented')
    lower=candidates[0];lower_point=frame.nodes[lower]
    if lower_point[2]!=(body[2]+body[5])/2:raise ValueError('Changed source node vertical offset needs an explicit joint model')
    missing=data['missingGroundContactFibres'];before_area=math.fsum(row['areaMm2'] for row in missing)
    if not missing:raise ValueError('No missing source receiving fibres remain; this closure is not applicable')
    if any(not inside(row['xyMm'],[body[0],body[1],body[3],body[4]],1e-8) for row in missing):
        raise ValueError('Closure cannot silently absorb missing contact outside the real formed quarter')
    owners={row['id']:row for row in data['cores']};assembled=data['operator']['assembled'];new_fibres=[];law=data['request']['bearingLaw']
    h=json.loads((root/'project/had/studies/water-replan.json').read_text())['model'];soffit=h['sections']['firstFloorRC']['bottom'];height=soffit-geometry['gridTopZMm']
    if height<=0:raise ValueError('Invalid actual ground-to-floor normal member height')
    for missing_fibre in missing:
        point=missing_fibre['xyMm'];owner=owners[missing_fibre['ownerId']];cells=[cell for cell in data['cells'] if inside(point,cell,1e-9)]
        if len(cells)!=1:raise ValueError('Missing contact point has ambiguous actual plate cell')
        x0,y0,x1,y1=cells[0];n,_,_=rectangle_shapes(2*(point[0]-x0)/(x1-x0)-1,2*(point[1]-y0)/(y1-y0)-1,x1-x0,y1-y0);coefficients=[]
        for p,value in zip(((x0,y0),(x1,y0),(x1,y1),(x0,y1)),n):coefficients.extend((i,value*c) for i,c in assembled['pointTerms'][p,0])
        upper=_combine_port_terms(data['portTerms'],coefficients);terms={node:list(row) for node,row in upper}
        dx,dy=point[0]-lower_point[0],point[1]-lower_point[1];row=[0,0,1,dy,-dx,0]
        target=terms.setdefault(lower,[0.]*6)
        for axis,value in enumerate(row):target[axis]-=value
        e=model['request']['frameLaw']['elasticModulusMPa'] if owner['materialKind']=='source-RC-column' else law['masonryModulusMPa']
        stiffness=missing_fibre['areaMm2']/(height/e+law['jointNormalComplianceMmPerMPa'])/1000
        name='VERTICAL-FLOOR/bearing/'+str(len(data['fibres'])+len(new_fibres))
        frame.springs.append({'id':name,'terms':list(terms.items()),'stiffness':stiffness,'mode':'compression','gap':0.})
        new_fibres.append({'id':name,'xyMm':point,'areaMm2':missing_fibre['areaMm2'],'ownerId':owner['id'],'sourceWallId':owner['sourceWallId'],
            'gridMemberId':geometry['id'],'overlapMemberCount':1,'heightMm':height,'stiffnessKNPerMm':stiffness,
            'unitWrenchResidualKN_KNmm':0.,'routeKind':'explicit-source-court-sw-rigid-joint-plane-comparison'})
    data['fibres'].extend(new_fibres);data['missingGroundContactFibres']=[]
    centroid=[(body[i]+body[i+3])/2 for i in range(3)];weight=geometry['newRCVolumeM3']*foundation_settings['unitWeightKNPerM3']*foundation_settings['gravityFactor']
    before=_family_wrench(model,model['families']['physical-G']);load=_wrench_at([0,0,-weight],centroid,lower_point)
    target=model['families']['physical-G'].setdefault(lower,[0.]*6)
    for axis,value in enumerate(load):target[axis]+=value
    after=_family_wrench(model,model['families']['physical-G']);expected=_wrench_at([0,0,-weight],centroid,[0,0,0]);expected[3:]=[value/1000 for value in expected[3:]]
    residual=[b-a-c for a,b,c in zip(before,after,expected)]
    if max(abs(value) for value in residual)>1e-8:raise ValueError('Corner body G fails force/first-moment conservation')
    result={'schema':'str-court-sw-closure-comparison/1','request':setting,
        'sourceSHA256':{**current['identities'],METHOD:hashlib.sha256((root/METHOD).read_bytes()).hexdigest(),
            'project/had/studies/water-replan.json':hashlib.sha256((root/'project/had/studies/water-replan.json').read_bytes()).hexdigest()},
        'addedSolid':geometry,'existingGridNodeId':lower,'existingGridNodeXYZMm':lower_point,
        'missingGroundContactAreaBeforeMm2':before_area,'missingGroundContactAreaAfterMm2':0,
        'newNormalFibreCount':len(new_fibres),'newRCVolumeM3':geometry['newRCVolumeM3'],'addedGKN':weight,'addedPhysicalGKN':weight,
        'newBodyCentroidXYZMm':centroid,'appliedNodeWrenchKN_KNmm':load,'sourceSelfGAndFirstMomentResidualKN_KNm':residual,
        'loadCombinationFactor':model['houseLoadCase']['boundary']['physicalGFactor'],'newSupportCount':0,
        'aboveSourceDPCCompressionCreditKN':0,'foundationUnionAlreadyIncludesAddedBody':False,
        'localJointRigidityAccepted':False,'local3DTransferAccepted':False,'jointReinforcementAccepted':False,'candidateAccepted':False,
        'scope':'Explicit formed source corner quarter replaces the missing physical footprint. Lower contact and body gravity charge eccentric forces/moments to the actual shared frame node; its rigid joint-plane assumption, local torsion/shear/cage and construction remain unqualified. No new restraint, soil support or adopted material proof.'}
    model['courtCornerClosure']=result
    return result
