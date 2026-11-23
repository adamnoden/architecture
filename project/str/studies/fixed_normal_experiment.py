"""Fixed physical normal rule experiment; never ordinary native admission.

Retains actual source500 fibres, ground six-coordinate maps and body G. Only
the upper Q4 work map changes with vertical pitch. All field units are explicit
in their existing native names: mm, kN, kNmm and reaction kNm.
"""
import argparse
import bisect
import copy
import hashlib
import json
import math
import os
from pathlib import Path
import time

import floor_section_model as native
import lower_core_bodies as bodies
import seated_wet_support as wet
import upper_roof_bearing as bearing
import vertical_rc_floor as vertical
from foundation_solid_weight import subtract_box
from four_l_joint_observer import numerical_runtime, require_runtime_threads
from vertical_floor_plate import rectangle_shapes

ROOT=Path(__file__).resolve().parents[3]
METHODS=['project/str/studies/fixed_normal_experiment.py','project/str/studies/fixed-normal-experiment-inputs.json',
 'project/str/studies/four_l_joint_observer.py','compiler/reference-house/current-design/structural-floor-cuts.ts',
 'project/str/studies/floor-section-cuts-inputs.json']
SCHEMA='str-fixed-normal-experiment/1'


def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def write(path,value):
    p=Path(path);q=p.with_suffix('.writing.json');q.write_text(json.dumps(value,allow_nan=False)+'\n');os.replace(q,p)
def identities():
    source=native.load_source(ROOT)
    return source,{**source['identities'],**{p:sha(ROOT/p) for p in METHODS}}
def uncovered(left,right):
    total=0.
    for row in left:
        pieces=[row['boxXYZMm']]
        for other in right:
            pieces=[p for box in pieces for p in subtract_box(box,other['boxXYZMm'])]
            if not pieces:break
        total+=math.fsum(math.prod(p[i+3]-p[i] for i in range(3)) for p in pieces)
    return total


def upper_trace(data,point,index=None):
    if index is None:
        xs=sorted({x for r in data['cells'] for x in (r[0],r[2])});ys=sorted({y for r in data['cells'] for y in (r[1],r[3])})
        index=xs,ys,{(r[0],r[1]):r for r in data['cells']}
    xs,ys,cells=index;x,y=point;i=bisect.bisect_right(xs,x)-1;j=bisect.bisect_right(ys,y)-1
    candidates=[cells[xs[ii],ys[jj]] for ii in (i,i-1) for jj in (j,j-1)
      if 0<=ii<len(xs)-1 and 0<=jj<len(ys)-1 and (xs[ii],ys[jj]) in cells
      and cells[xs[ii],ys[jj]][0]-1e-9<=x<=cells[xs[ii],ys[jj]][2]+1e-9
      and cells[xs[ii],ys[jj]][1]-1e-9<=y<=cells[xs[ii],ys[jj]][3]+1e-9]
    if not candidates:raise ValueError('Frozen point has no current plate material; no nearest-node substitution')
    a,b,c,d=candidates[0];points=((a,b),(c,b),(c,d),(a,d));weights,_,_=rectangle_shapes(2*(x-a)/(c-a)-1,2*(y-b)/(d-b)-1,c-a,d-b)
    if min(weights)<-1e-9:raise ValueError('Frozen point requires extrapolation')
    coefficients=[];count=len(data['portTerms'])
    for p,w in zip(points,weights):
        terms=data['operator']['assembled']['pointTerms'][p,0]
        if any(not 0<=k<count for k,_ in terms):raise ValueError('Frozen point requires unretained upper coordinates')
        coefficients.extend((k,w*v) for k,v in terms)
    audit={'partitionResidual':abs(sum(weights)-1),'firstMomentResidualMm':max(abs(sum(w*p[k] for w,p in zip(weights,points))-point[k]) for k in (0,1))}
    return vertical._combine_port_terms(data['portTerms'],coefficients),audit


def capture(model,source,setting):
    data=model['verticalFloor'];frame=model['model'];inventory=bodies.lower_core_inventory(model,source,setting);springs={r['id']:r for r in frame.springs};rows=[]
    for f in data['fibres']:
        spring=springs[f['id']]
        if spring['mode']!='compression' or spring['gap']!=0:raise ValueError('Unsupported original normal law')
        ground=[];coordinates={}
        for node,row in spring['terms']:
            p=frame.nodes[node]
            if p[2]<=inventory['bodyBottomZMm']:ground.append((node,[-v for v in row]));coordinates[node]=list(p)
            elif p[2]<inventory['bodyTopZMm']:raise ValueError('Ambiguous normal layer')
        if not ground:raise ValueError('Missing physical ground trace')
        rows.append({'fibre':copy.deepcopy(f),'groundTerms':ground,'groundCoordinatesMm':coordinates})
    return {'schema':'str-fixed-native-normal-ledger/1','sourceSHA256':native.load_source(ROOT)['identities'],
      'rows':rows,'inventory':inventory,'bearingLaw':data['request']['bearingLaw'],'frameLaw':model['request']['frameLaw'],
      'beamStationsYMm':[s['u'] for s in model['seatedWetSupport']['receiver']['stations']]}


def install(model,ledger):
    data=model['verticalFloor'];frame=model['model'];owners={r['id']:r for r in data['cores']}
    if ledger['bearingLaw']!=data['request']['bearingLaw'] or ledger['frameLaw']!=model['request']['frameLaw']:raise ValueError('Changed constitutive law')
    if ledger['beamStationsYMm']!=[s['u'] for s in model['seatedWetSupport']['receiver']['stations']]:raise ValueError('Changed beam sections')
    old_ids={f['id'] for f in data['fibres']};keep=[r for r in frame.springs if r['id'] not in old_ids]
    xs=sorted({x for r in data['cells'] for x in (r[0],r[2])});ys=sorted({y for r in data['cells'] for y in (r[1],r[3])});index=xs,ys,{(r[0],r[1]):r for r in data['cells']}
    rows=[];springs=[];max_partition=max_moment=0.
    for saved in ledger['rows']:
        f=copy.deepcopy(saved['fibre']);owner=owners[f['ownerId']];law=data['request']['bearingLaw']
        e=model['request']['frameLaw']['elasticModulusMPa'] if owner['materialKind']=='source-RC-column' else law['masonryModulusMPa']
        stiffness=f['areaMm2']/(f['heightMm']/e+law['jointNormalComplianceMmPerMPa'])/1000
        if stiffness!=f['stiffnessKNPerMm']:raise ValueError('Normal stiffness no longer follows source geometry/law')
        upper,audit=upper_trace(data,f['xyMm'],index);terms={n:list(v) for n,v in upper}
        max_partition=max(max_partition,audit['partitionResidual']);max_moment=max(max_moment,audit['firstMomentResidualMm'])
        for node,row in saved['groundTerms']:
            if node not in frame.nodes or list(frame.nodes[node])!=saved['groundCoordinatesMm'][node]:raise ValueError('Changed actual ground receiver')
            target=terms.setdefault(node,[0.]*6)
            for k,v in enumerate(row):target[k]-=v
        springs.append({'id':f['id'],'terms':list(terms.items()),'stiffness':stiffness,'mode':'compression','gap':0.});rows.append(f)
    if data['missingGroundContactFibres']:raise ValueError('Unclosed normal area')
    frame.springs=[*keep,*springs];data['fibres']=rows
    return {'oldCount':len(old_ids),'fixedCount':len(rows),'maximumPartitionResidual':max_partition,'maximumFirstMomentResidualMm':max_moment}


def run(pitch,outdir,ledger_path=None):
    require_runtime_threads();source,before=identities();settings=json.loads((ROOT/METHODS[1]).read_text())
    if settings['schema']!='str-fixed-normal-experiment-inputs/1' or settings['baseNativeRequest']['sourceSHA256']!=source['identities']:raise ValueError('Stale explicit experimental input')
    if pitch not in (500,250) or ((pitch==500)!=(ledger_path is None)):raise ValueError('500 creates exact native ledger;250 requires that saved ledger')
    case=copy.deepcopy(settings['baseNativeRequest']);v=case['bearingCase']['masonryCase']['verticalCase'];v['maxPitchMm']=pitch
    if v['monolithicCase']['houseCase']['joinedCase']['floor']['maxPitchMm']!=500:raise ValueError('In-plane control must remain500')
    ledger=json.loads(Path(ledger_path).read_text()) if ledger_path else None
    if ledger and ledger['sourceSHA256']!=source['identities']:raise ValueError('Stale frozen rule')
    if ledger:
        coarse=json.loads(Path(ledger_path).with_name('v500.full.json').read_text())
        if coarse['schema']!=SCHEMA or coarse['methodSourceSHA256']!=before or coarse['fixedNormalLedgerSHA256']!=digest(ledger):
            raise ValueError('Ledger is not the exact completed current-method500 control')
    out=Path(outdir);out.mkdir(parents=True,exist_ok=True);prefix=out/f'v{pitch}'
    if prefix.with_suffix('.full.json').exists():raise ValueError('Refusing to overwrite completed experiment')
    runtime=numerical_runtime();executed={'schema':'str-fixed-normal-executed-input/1','nativeRequest':case,'settings':settings,'methodSourceSHA256':before,'runtime':runtime,'inputLedgerSHA256':sha(ledger_path) if ledger_path else None}
    write(prefix.with_suffix('.input.json'),executed)
    started=time.time();events=[];audits=[];body_ledgers=[]
    def event(stage,**fields):
        events.append({'stage':stage,'seconds':time.time()-started,**fields});write(prefix.with_suffix('.progress.json'),{'events':events,'complete':False})
    original_support=wet.build_support;original_body=bearing.add_lower_core_bodies;original_inventory=bodies.lower_core_inventory;original_add=bodies._add
    def support(model,setting,house,required_stations=()):return original_support(model,setting,house,sorted(set([*required_stations,*settings['commonWetBeamStationsYMm']])))
    def body(model,body_source,setting):
        nonlocal ledger
        event('pre-body',ordinaryNormalCount=len(model['verticalFloor']['fibres']))
        inventory=original_inventory(model,body_source,setting)
        if ledger is None:ledger=capture(model,body_source,setting);write(out/'fixed-normal-ledger.json',ledger);audits.append({'scope':'exact native500 rule','count':len(ledger['rows'])})
        else:
            old=ledger['inventory']
            for k in ('sourceBodyBoxes','bodyHeightMm','bodyTopZMm','bodyBottomZMm','netClearCoreVolumeM3','netClearCoreAreaMm2','physicalGKN','excludedRCStiffnessPathRectanglesXYMm','excludedSourceRCColumnIds','sourceOrdinaryCoreIds'):
                if inventory[k]!=old[k]:raise ValueError('Changed lower-body physical inventory: '+k)
            diff=[uncovered(inventory['freeTopBodyBoxes'],old['freeTopBodyBoxes']),uncovered(old['freeTopBodyBoxes'],inventory['freeTopBodyBoxes'])]
            if any(diff):raise ValueError('Free-top body union changed: '+str(diff))
            audits.append({**install(model,ledger),'freeTopSymmetricDifferenceVolumeMm3':diff})
        added=[];target=model['families']['physical-G']
        def observe(family,node,row,factor=1):
            if family is target:added.append({'node':node,'rowKN_KNmm':list(row),'factor':factor})
            return original_add(family,node,row,factor)
        try:
            bodies.lower_core_inventory=lambda m,s,t:copy.deepcopy(ledger['inventory']);bodies._add=observe
            result=original_body(model,body_source,setting)
        finally:bodies.lower_core_inventory=original_inventory;bodies._add=original_add
        body_ledgers.append({'nodalG':added,'contactBodies':result['contactBodies'],'freeTopReceiverLoadsKN':result['freeTopReceiverLoadsKN'],'freeTopPhysicalGKN':result['freeTopPhysicalGKN'],'addedPhysicalGKN':result['addedPhysicalGKN'],'unsupportedBodies':result['unsupportedBodies']})
        event('fixed-body-installed',bodyLedgerSHA256=digest(body_ledgers[-1]));return result
    try:
        wet.build_support=support;bearing.add_lower_core_bodies=body;event('native-start',pitchMm=pitch)
        result=native.run(case,source,f'EXPERIMENT-FIXED-NORMAL-{pitch}')
    finally:wet.build_support=original_support;bearing.add_lower_core_bodies=original_body;bodies.lower_core_inventory=original_inventory;bodies._add=original_add
    if len(body_ledgers)!=1:raise ValueError('Unexpected closure rebuild: fixed normal rule is not established')
    if identities()[1]!=before or numerical_runtime()!=runtime:raise ValueError('Source/runtime changed during actual solve')
    result['schema']='str-fixed-normal-experimental-floor/1';result['sourceSHA256']=before
    result['request']={'schema':'str-fixed-normal-experimental-request/1','executedInputSHA256':digest(executed),'ledgerSHA256':digest(ledger)}
    result['nativeVertical']['native']['schema']='str-fixed-normal-experimental-frame/1';result['nativeVertical']['native']['sourceSHA256']=before
    envelope={'schema':SCHEMA,'methodSourceSHA256':before,'executedInput':executed,'fixedNormalLedgerSHA256':digest(ledger),'physicalBodyLedger':body_ledgers[0],'physicalBodyLedgerSHA256':digest(body_ledgers[0]),'audits':audits,'response':result,'candidateAccepted':False,'ordinaryNativeAdmissionApplicable':False,'completeHouseProof':False,'seconds':time.time()-started}
    write(prefix.with_suffix('.full.json'),envelope);write(prefix.with_suffix('.receipt.json'),{'schema':'str-fixed-normal-experiment-receipt/1','fullSHA256':sha(prefix.with_suffix('.full.json')),'methodSourceSHA256':before,'sourceUnchangedBeforeAfter':True,'ordinaryNativeAdmissionApplicable':False})
    event('complete',headCount=len(result['nativeVertical']['native']['heads']))
    print(json.dumps({'pitch':pitch,'seconds':time.time()-started,'sha256':sha(prefix.with_suffix('.full.json'))}),flush=True)


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--pitch',type=int,required=True);p.add_argument('--out',required=True);p.add_argument('--ledger');a=p.parse_args();run(a.pitch,a.out,a.ledger)
