"""Read-only simultaneous rear lintel/seat demands from authenticated actual96 captures.

No section actions are combined across source cases. This consumer does not
change geometry, solve, select a material grade or qualify resistance.
"""
import argparse
import copy
import gzip
import hashlib
import json
import math
from pathlib import Path
from types import SimpleNamespace

ACTIONS=('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')

def sha(data):return hashlib.sha256(data).hexdigest()
def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def number(value):
    if type(value) not in (int,float) or not math.isfinite(value):raise ValueError('Finite signed action or physical coordinate required')
    return value
def near(a,b,tol=1e-7):
    if abs(number(a)-number(b))>tol:raise ValueError('Actual lintel geometry or bearing integration differs')

def cut_record(row,index,geometry,choices):
    if not row['memberId'].startswith('REAR-LINTEL/') or row['kind']!='seated-wet-beam':raise ValueError('Actual source lintel member required')
    end=row['end']
    if end is not None and (type(end) is not int or end not in (0,1)):raise ValueError('Native endpoint sign convention differs')
    if end is None and (row.get('cutSide') not in ('left','right') or not ((0<=number(row['fraction'])<=1) if row.get('recoveryOrigin')=='actual-support-face' else (0<number(row['fraction'])<1))):raise ValueError('Native interior side/fraction required')
    near(row['breadthMm'],choices['lintelWidthMm']);near(row['depthMm'],choices['lintelDepthMm'])
    p=row['physicalPointMm']
    if len(p)!=3:raise ValueError('Actual three-dimensional cut required')
    x,y,z=map(number,p);near(x,geometry['axisXMm'])
    near(z,(geometry['lintelTopZMm']+geometry['lintelBottomZMm'])/2)
    rectangle=geometry['lintelRectangleXYMm']
    if not rectangle[1]-1e-7<=y<=rectangle[3]+1e-7:raise ValueError('Cut outside actual lintel')
    vector=[number(row[k]) for k in ACTIONS]
    # Native end0 and interior report the left resultant. At end1 only N was
    # already sign-flipped by _physical_cut_rows; the other5 are outward actions.
    if end==1:vector=[vector[0],*[-v for v in vector[1:]]]
    return {'windIndex':index,'memberId':row['memberId'],'end':end,
        'cutSide':row.get('cutSide'),'fraction':row.get('fraction'),'physicalPointMm':list(p),'recoveryOrigin':row.get('recoveryOrigin','authenticated-native-cut'),
        'leftResultantKN_KNm':vector,'nativeCut':row}

def seat_records(rows,index,geometry,choices,retained):
    rectangles=[*geometry['bearingRectanglesXYMm'],*retained]
    order=choices['bearingQuadratureOrder'];expected={f'REAR-BEARING/{s}/{i}' for s in range(len(rectangles)) for i in range(order*order)}
    if len(rows)!=len(expected) or {r['id'] for r in rows}!=expected:raise ValueError('Exact physical seat fibre catalogue required')
    result=[]
    for side,rectangle in enumerate(rectangles):
        fibres=sorted((r for r in rows if r['id'].split('/')[1]==str(side)),key=lambda r:r['id'])
        area=(rectangle[2]-rectangle[0])*(rectangle[3]-rectangle[1])
        near(math.fsum(number(r['areaMm2']) for r in fibres),area,1e-5)
        for r in fibres:
            x,y=map(number,r['xyMm'])
            if not rectangle[0]<x<rectangle[2] or not rectangle[1]<y<rectangle[3] or number(r['areaMm2'])<=0:raise ValueError('Actual bearing point/area outside physical seat')
            if type(r['topActive']) is not bool:raise ValueError('Actual unilateral contact state required')
            near(number(r['baseCompressionKN'])-number(r['topCompressionKN'])-number(r['bodyOwnFactoredGKN'])-number(r['beddingOwnFactoredGKN'])/2,0.)
            if r['topCompressionKN'] < -1e-7 or r['baseCompressionKN'] < -1e-7:raise ValueError('Compression-only seat developed tension')
        top=math.fsum(r['topCompressionKN'] for r in fibres);base=math.fsum(r['baseCompressionKN'] for r in fibres)
        centre=[(rectangle[0]+rectangle[2])/2,(rectangle[1]+rectangle[3])/2]
        def resultant(key):
            force=math.fsum(r[key] for r in fibres)
            mx=math.fsum((r['xyMm'][1]-centre[1])*r[key]/1000 for r in fibres)
            my=-math.fsum((r['xyMm'][0]-centre[0])*r[key]/1000 for r in fibres)
            centroid=None if abs(force)<1e-10 else [math.fsum(r['xyMm'][j]*r[key] for r in fibres)/force for j in (0,1)]
            return {'upwardOnLintelKN':force,'momentAboutPatchCentreKNm':[mx,my,0.],
                'compressionCentroidXYMm':centroid,'maximumFibrePressureMPa':max(r[key]*1000/r['areaMm2'] for r in fibres)}
        result.append({'windIndex':index,'seatId':str(side),'kind':'primary-seat' if side<2 else 'retained-cross-wall-seat',
            'rectangleXYMm':rectangle,'areaMm2':area,'activeTopAreaMm2':math.fsum(r['areaMm2'] for r in fibres if r['topActive']),
            'centroidXYMm':centre,'top':resultant('topCompressionKN'),'base':resultant('baseCompressionKN'),
            'fullSignedFibreRows':fibres})
    return result

def case_demands(capture,index):
    if capture['windIndex']!=index:raise ValueError('Captured source case differs')
    result=capture['result'];actual=result['actualReplacement'];geometry=actual['geometry'];choices=result['choices']
    if choices['lintelWidthMm']!=200 or choices['lintelDepthMm']!=300:raise ValueError('This consumer owns actual200x300 comparison only')
    ends=actual['lintelMemberCuts'];interior=actual['lintelInteriorMemberCuts'];members={}
    for row in ends:
        member=members.setdefault(row['memberId'],{})
        if row['end'] in member:raise ValueError('Duplicate lintel endpoint')
        member[row['end']]=row
    if not members or any(set(v)!={0,1} for v in members.values()):raise ValueError('Both actual ends of every lintel segment required')
    stations=[]
    for name,ends_by_id in members.items():
        a=ends_by_id[0]['physicalPointMm'];b=ends_by_id[1]['physicalPointMm']
        if b[1]<=a[1] or a[0]!=b[0] or a[2]!=b[2]:raise ValueError('Actual positive-Y lintel local basis differs')
        stations.append((a[1],b[1]))
    ordered=sorted(stations)
    near(ordered[0][0],geometry['lintelRectangleXYMm'][1]);near(ordered[-1][1],geometry['lintelRectangleXYMm'][3])
    for a,b in zip(ordered,ordered[1:]):near(a[1],b[0])
    cuts=[];seen=set()
    for row in [*ends,*interior]:
        if row['memberId'] not in members:raise ValueError('Interior cut on uncatalogued member')
        record=cut_record(row,index,geometry,choices)
        key=(record['memberId'],record['end'],record['cutSide'],tuple(record['physicalPointMm']))
        if key in seen:raise ValueError('Duplicate physical lintel cut')
        seen.add(key);cuts.append(record)
    seats=seat_records(actual['bearingBodies'],index,geometry,choices,actual['retainedCrossWallSeatRectanglesXYMm'])
    return {'windIndex':index,'catalogueRow':capture['catalogueRow'],'cuts':cuts,'seats':seats,
        'geometry':geometry,'choices':choices}

def support_face_cuts(checkpoint,index,geometry,choices):
    """Recover both true support-face sides from actual saved end+load ledger."""
    from rc_floor_house_loads import recovered_member_actions,_member_left_resultant,member_physical_basis
    model=copy.deepcopy(checkpoint['postprocessingModel'])
    model['model']=SimpleNamespace(**model.pop('frame'))
    multipliers=model['rearDirectBearing']['memberRecoveryMultipliers']
    recovered=recovered_member_actions(model,checkpoint['rawResponse'],multipliers)
    rows=[]
    for face in geometry['rawOpeningYMm']:
        found=0
        for name,member in model['members'].items():
            if not name.startswith('REAR-LINTEL/'):continue
            a,b=member['physicalStartMm'],member['physicalEndMm']
            if not a[1]-1e-7<=face<=b[1]+1e-7:continue
            axis,normal,radial=member_physical_basis(member);length=math.dist(a,b);station=min(length,max(0.,face-a[1]))
            for side in ('left','right'):
                force,moment=_member_left_resultant(model,name,member,recovered,multipliers,station,side)
                dot=lambda p,q:sum(x*y for x,y in zip(p,q))
                row={'memberId':name,'kind':member['kind'],'end':None,'fraction':station/length,
                    'cutSide':side,'physicalPointMm':[a[0],face,a[2]],'breadthMm':member['breadthMm'],'depthMm':member['depthMm'],
                    'recoveryOrigin':'actual-support-face','axialCompressionKN':dot(force,axis),
                    'shearYKN':dot(force,normal),'shearZKN':dot(force,radial),'torsionKNm':dot(moment,axis)/1000,
                    'bendingYKNm':dot(moment,normal)/1000,'bendingZKNm':dot(moment,radial)/1000}
                rows.append(cut_record(row,index,geometry,choices))
            found+=1
        if not found:raise ValueError('Actual source opening face has no physical lintel section')
    return rows

def native_head_records(result,index):
    """Keep the saved support-on-house reaction and its equal/opposite action."""
    vertical=result['finiteHouseResult']['native']['nativeVertical']
    heads=vertical['native']['heads'];positions=vertical['headPositions']
    by_id={p['id']:p['xyzMm'] for p in positions}
    if len(heads)!=52 or len({h['id'] for h in heads})!=52 or len(positions)!=52 or len(by_id)!=52 or set(by_id)!={h['id'] for h in heads}:raise ValueError('Complete52 actual native head vectors and positions required')
    rows=[]
    for head in heads:
        vector=head['reactionKN_KNm'];point=by_id[head['id']]
        if len(vector)!=6 or len(point)!=3:raise ValueError('Actual full6-action head vector/physicalpoint required')
        vector=list(map(number,vector));point=list(map(number,point))
        rows.append({'windIndex':index,'headId':head['id'],'physicalPointMm':point,
            'nativeSupportOnHouseKN_KNm':vector,'equalOppositeHouseOnFoundationKN_KNm':[-v for v in vector]})
    return rows

def envelope(records,vector_key,labels):
    if not records:raise ValueError('Actual simultaneous records required')
    output={}
    for axis,label in enumerate(labels):
        for sign,title in ((1,'maximum'),(-1,'minimum')):
            row=max(records,key=lambda r:sign*r[vector_key][axis])
            output[label+'/'+title]={'componentValue':row[vector_key][axis],'fullSimultaneousRecord':row}
    return output

def collect(proof_path,packet_path,captures,out):
    from current_finite_joint_signed_proof import admit_packet,make_case,digest
    proof_bytes=Path(proof_path).read_bytes();proof=json.loads(proof_bytes);packet=json.loads(Path(packet_path).read_bytes())
    admit_packet(packet)
    if (proof['status']!='all96-current-source-programmes-replayed' or proof['caseCount']!=96 or proof['parentInputSHA256']!=digest(packet)
        or proof['sourceCommit']!=packet['sourceCommit'] or set(proof['captureIdentities'])!={str(i) for i in range(96)}):
        raise ValueError('Complete authenticated actual96 proof required')
    cases=[];geometry=None;choices=None
    for index in range(96):
        paths=list(Path(captures).rglob(f'case-{index:02}.json.gz'))
        if len(paths)!=1:raise ValueError('Exactly one actual physical case required')
        compressed=paths[0].read_bytes();data=gzip.decompress(compressed);identity=proof['captureIdentities'][str(index)]
        if sha(compressed)!=identity['gzipSHA256'] or sha(data)!=identity['rawSHA256']:raise ValueError('Actual signed response bytes changed')
        capture=json.loads(data);result=capture['result']
        if (capture['parentInputSHA256']!=proof['parentInputSHA256'] or capture['derivedNativeCaseSHA256']!=digest(make_case(packet,index))
            or capture['catalogueRow']!=packet['catalogue'][index] or result['rawCheckpointSHA256']!=identity['checkpointSHA256']
            or result['sourceSHA256']!=proof['sourceSHA256'] or result['methodSHA256']!=proof['rearMethodSHA256']):
            raise ValueError('Physical source/geometry/action authority differs')
        current=case_demands(capture,index)
        checkpoints=list(Path(captures).rglob(f'case-{index:02}.json.gz.checkpoint.json.gz'))
        if len(checkpoints)!=1:raise ValueError('Exactly one original actual raw checkpoint required for true support faces')
        compressed_checkpoint=checkpoints[0].read_bytes();receipt=capture['nativeCaptureReceipt']
        if sha(compressed_checkpoint)!=receipt['checkpointGzipSHA256']:raise ValueError('Original raw checkpoint transport changed')
        checkpoint_bytes=gzip.decompress(compressed_checkpoint)
        if sha(checkpoint_bytes)!=identity['checkpointSHA256']:raise ValueError('Original raw checkpoint bytes changed')
        checkpoint=json.loads(checkpoint_bytes)
        for key in ('authoredNativeCase','choices','finiteSettings','sourceSHA256','methodSHA256'):
            if checkpoint[key]!=result[key]:raise ValueError('Actual support-face source authority differs')
        current['nativeHeadReactions']=native_head_records(result,index)
        current['supportFaceCuts']=support_face_cuts(checkpoint,index,current['geometry'],current['choices'])
        current['cuts'].extend(current['supportFaceCuts'])
        if index==0:
            slab=result['finiteHouseResult']['native']['nativeVertical']['plate']['cellsXYMm']
            reinforcement=result['authoredNativeCase']['bearingCase']['masonryCase']['floorReinforcement']
        if geometry is None:geometry=current['geometry'];choices=current['choices']
        if current['geometry']!=geometry or current['choices']!=choices:raise ValueError('A changed seat/section cannot reuse this demand envelope')
        cases.append(current)
    cuts=[r for c in cases for r in c['cuts']];seats=[r for c in cases for r in c['seats']];heads=[r for c in cases for r in c['nativeHeadReactions']]
    seat_envelope={}
    for side in range(4):
        local=[r for r in seats if r['seatId']==str(side)]
        for location in ('top','base'):
            for key in ('upwardOnLintelKN','maximumFibrePressureMPa'):
                row=max(local,key=lambda r:r[location][key])
                seat_envelope[f'{side}/{location}/{key}']={'value':row[location][key],'fullSimultaneousRecord':row}
    output={'schema':'str-rear-bearing-simultaneous-demands/1','sourceCommit':proof['sourceCommit'],
        'proofSHA256':sha(proof_bytes),'parentInputSHA256':proof['parentInputSHA256'],
        'consumerSHA256':sha(Path(__file__).read_bytes()),'sourceSHA256':proof['sourceSHA256'],
        'rearMethodSHA256':proof['rearMethodSHA256'],'geometry':geometry,'choices':choices,'physicalSlabCellsXYMm':slab,'sourceReinforcementSettings':reinforcement,
        'actionOrder':list(ACTIONS),'localBasis':{'axisGlobal':[0,1,0],'yGlobal':[1,0,0],'zGlobal':[0,0,-1]},
        'caseCount':96,'cutCount':len(cuts),'seatCount':len(seats),'cases':cases,
        'signedCutReviewIndex':envelope(cuts,'leftResultantKN_KNm',ACTIONS),'seatReviewIndex':seat_envelope,
        'nativeHeadReactionReviewIndex':envelope(heads,'nativeSupportOnHouseKN_KNm',('FxKN','FyKN','FzKN','MxKNm','MyKNm','MzKNm')),
        'headConvention':'Saved native support-on-house reactions sum with applied house loads to zero; the house-on-foundation action is their negative. No capacity is inferred in either sign.',
        'scope':'Every simultaneous physical section vector retained. Review extrema are indices, never a synthetic combined load. Normal springs transmit no horizontal force/torsion through seats. This is not a resistance or altered-geometry demand proof.',
        'resistanceAccepted':False,'currentSavedEngineeringDocumentAdmitted':proof.get('currentSavedEngineeringDocumentAdmitted',True),
        'candidateAccepted':False,'ownerAccepted':False}
    admit_packet(packet)
    Path(out).parent.mkdir(parents=True,exist_ok=True);Path(out).write_bytes(canonical(output))
    print('REAR_DEMAND_SUMMARY '+json.dumps({'caseCount':96,'cutCount':len(cuts),'seatCount':len(seats),
        'signedCutReviewIndex':output['signedCutReviewIndex'],'nativeHeadReactionReviewIndex':output['nativeHeadReactionReviewIndex'],'seatReviewIndex':{k:{'value':v['value'],'windIndex':v['fullSimultaneousRecord']['windIndex'],'seatId':v['fullSimultaneousRecord']['seatId'],'rectangleXYMm':v['fullSimultaneousRecord']['rectangleXYMm'],'top':v['fullSimultaneousRecord']['top'],'base':v['fullSimultaneousRecord']['base']} for k,v in seat_envelope.items()}},separators=(',',':'),allow_nan=False),flush=True)
    return output

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    for field in ('proof','input','captures','out'):parser.add_argument('--'+field,required=True)
    args=parser.parse_args();collect(args.proof,args.input,args.captures,args.out)
