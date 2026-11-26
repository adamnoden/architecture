"""Bounded actual rear400 comparison from the authenticated shared300 request.

No producer/kernel/source account is edited. The sole physical candidate edit
is the existing admitted saved rear stage's lintelDepthMm300->400. Historical
responses are comparison evidence only, never assembly forces.
"""
import argparse,copy,gzip,hashlib,json,os,subprocess,traceback,zipfile
from pathlib import Path
from current_finite_joint_signed_proof import (read,write,digest,digest_bytes,encoded,
    admit_packet,make_case,check_rear_result,rear_body_catalogue,actual_body_adverse_controls)
from rear_bearing_signed_development import restore,retain_native_response
from rear_bearing_plan import admit_choices
from rear_direct_bearing import run_rear_direct_bearing
from rear_bearing_signed_demands import support_face_cuts,cut_record,seat_records,native_head_records,envelope,ACTIONS

PARENT='808b298261ac7956958087ab8e5f0b641c0ab8c9b3030f99e603bfa175db9d93'
INPUT_ZIP='c4ba2ec37882f15fa032876e5d42f88e6a99a33c05889fa45f3105334e3ca7d2'
REFERENCE_ZIP='60f76154729357dc9e6c71eaebe6c7f3fe1d5ca0cdfe0ffeb1865863b16f3a07'
METHOD='project/str/studies/rear_bearing_depth_control.py'

def extract_input(folder):
    archive=folder/'source-input.zip'
    if digest_bytes(archive.read_bytes())!=INPUT_ZIP:raise ValueError('Exact immutable4010 input archive required')
    target=folder/'parent';target.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as z:
        names=set()
        for entry in z.infolist():
            if entry.is_dir():continue
            name=Path(entry.filename).name
            if name in names:raise ValueError('Duplicate source input name')
            names.add(name);(target/name).write_bytes(z.read(entry))
    packet_path=target/'finite-signed-input.json'
    if digest_bytes(packet_path.read_bytes())!=PARENT:raise ValueError('Exact4010 source packet required')
    restore(argparse.Namespace(input=str(packet_path)))
    packet=read(packet_path);admit_packet(packet)
    return packet,packet_path

def prepare(folder):
    packet,path=extract_input(folder)
    choices=copy.deepcopy(packet['rearChoices']);choices['lintelDepthMm']=400.
    if admit_choices(choices)!=choices:raise ValueError('Existing strict shared rear choices must admit400')
    old=copy.deepcopy(choices);old['lintelDepthMm']=300.
    if old!=packet['rearChoices']:raise ValueError('Only the admitted depth may change')
    source=read(packet['documentPath']);candidate=copy.deepcopy(source)
    candidate['stages']['floorSection']['rearBearingComparison']=choices
    check=copy.deepcopy(candidate);check['stages']['floorSection']['rearBearingComparison']=packet['rearChoices']
    if check!=source:raise ValueError('Unlisted source document edit')
    write(folder/'candidate400-document.json',candidate)
    control={'schema':'str-explicit-source-derived-rear-depth-control/1',
        'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
        'originalPhysicalSourceCommit':packet['sourceCommit'],'authenticatedOriginalPacketSHA256':PARENT,
        'sourceSHA256':packet['sourceSHA256'],'methodSHA256':packet['methodSHA256'],'runtime':packet['runtime'],
        'rearMethodSHA256':packet['rearMethodSHA256'],'rearReplaySHA256':packet['rearReplaySHA256'],
        'observerSHA256':packet['observerSHA256'],'replaySHA256':packet['replaySHA256'],
        'nativeCase':packet['nativeCase'],'settings':packet['settings'],'rearChoices':choices,
        'headIds':packet['headIds'],'portIds':packet['portIds'],'catalogue':packet['catalogue'],
        'candidateDocumentSHA256':digest_bytes((folder/'candidate400-document.json').read_bytes()),
        'executingControlMethodSHA256':digest_bytes(Path(METHOD).read_bytes()),
        'physicalChoiceDelta':{'stages.floorSection.rearBearingComparison.lintelDepthMm':[300.,400.]},
        'currentSavedEngineeringDocumentAdmitted':False,'oldForcesUsedAsAssemblyInput':False,
        'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False}
    write(folder/'candidate400-input.json',control)
    print('Prepared existing admitted400mm rear choice; native58,finite6,CFDB and original source document unchanged',flush=True)

def original(folder,control):
    packet,path=extract_input(folder)
    if (control['authenticatedOriginalPacketSHA256']!=PARENT or control['sourceSHA256']!=packet['sourceSHA256']
        or control['methodSHA256']!=packet['methodSHA256'] or control['rearMethodSHA256']!=packet['rearMethodSHA256']
        or control['executingControlMethodSHA256']!=digest_bytes(Path(METHOD).read_bytes())
        or control['candidateDocumentSHA256']!=digest_bytes((folder/'candidate400-document.json').read_bytes())
        or control['physicalChoiceDelta']!={'stages.floorSection.rearBearingComparison.lintelDepthMm':[300.,400.]}):
        raise ValueError('Exact unchanged physical methods and candidate control required')
    expected=copy.deepcopy(packet['rearChoices']);expected['lintelDepthMm']=400.
    if control['rearChoices']!=expected or control['nativeCase']!=packet['nativeCase'] or control['settings']!=packet['settings']:
        raise ValueError('Only the saved rear depth may change')
    if any(control[k] is not False for k in ('currentSavedEngineeringDocumentAdmitted','oldForcesUsedAsAssemblyInput','candidateAccepted','strengthAccepted','ownerAccepted')):
        raise ValueError('Counterfactual development cannot grant compiler or structural acceptance')
    return packet

def case_demands400(result,checkpoint,index):
    a=result['actualReplacement'];g=a['geometry'];choices=result['choices']
    cuts=[cut_record(r,index,g,choices) for r in [*a['lintelMemberCuts'],*a['lintelInteriorMemberCuts']]]
    faces=support_face_cuts(checkpoint,index,g,choices);cuts.extend(faces)
    return {'windIndex':index,'choices':choices,'geometry':g,'cuts':cuts,'supportFaceCuts':faces,
        'seats':seat_records(a['bearingBodies'],index,g,choices,a['retainedCrossWallSeatRectanglesXYMm']),
        'heads':native_head_records(result,index),
        'sourceReinforcementSettings':result['authoredNativeCase']['bearingCase']['masonryCase']['floorReinforcement'],
        'cutReviewIndex':envelope(cuts,'leftResultantKN_KNm',ACTIONS),'resistanceAccepted':False}

def execute(folder,index):
    if index not in (0,31):raise ValueError('Bounded actual0/31 comparison only')
    control=read(folder/'candidate400-input.json');packet=original(folder,control)
    case=make_case(control,index);checkpoint_path=folder/f'candidate400-{index}-checkpoint.json'
    output=folder/f'candidate400-{index}.json'
    try:
        with retain_native_response(control,index,folder/f'candidate400-{index}-early.json') as early:
            result=run_rear_direct_bearing(case,control['rearChoices'],control['settings'],Path('.'),checkpoint_path)
        write(output,result)
        checkpoint=read(checkpoint_path)
        if digest_bytes(checkpoint_path.read_bytes())!=result['rawCheckpointSHA256'] or digest(checkpoint['rawResponse'])!=early['rawSemanticSHA256']:
            raise ValueError('Actual raw physical response changed before replay')
        # This is a response catalogue, not substituted authored geometry.
        # All bodies are then independently checked against actual fibre/G/law
        # records and native spring compatibility, forces and constitutive state.
        response_control={**control,'rearBodyCatalogue':rear_body_catalogue(checkpoint)}
        check=check_rear_result(response_control,index,result,checkpoint)
        adverse=actual_body_adverse_controls(response_control,result,index,checkpoint)
        demands=case_demands400(result,checkpoint,index)
        write(folder/f'candidate400-{index}-demands.json',demands)
        write(folder/f'candidate400-{index}-replay.json',{'replay':check,'actualBodyAdverseControls':adverse,
            'responseBodyCatalogueSHA256':digest(response_control['rearBodyCatalogue']),
            'currentSavedEngineeringDocumentAdmitted':False,'strengthAccepted':False})
        print('REAR_ACTUAL400_PASS '+json.dumps({'windIndex':index,'replay':check,'actualBodyAdverseControls':adverse,
            'sourceReinforcementSettings':demands['sourceReinforcementSettings'],
            'cutReviewIndex':demands['cutReviewIndex'],'supportFaceCuts':demands['supportFaceCuts'],
            'seats':[{k:v for k,v in r.items() if k!='fullSignedFibreRows'} for r in demands['seats']]},separators=(',',':')),flush=True)
    except Exception:
        write(folder/f'candidate400-{index}-failure.json',{'windIndex':index,'controlSHA256':digest(control),
            'error':traceback.format_exc(),'rawMayBeRetainedBeforePostprocessing':True,'accepted':False})
        raise
    finally:admit_packet(packet)

def compare(folder):
    control=read(folder/'candidate400-input.json');original(folder,control)
    archive=folder/'source300-W31.zip'
    if digest_bytes(archive.read_bytes())!=REFERENCE_ZIP:raise ValueError('Exact passed300-W31 archive required')
    with zipfile.ZipFile(archive) as z:reference=json.loads(z.read('zero-rear-W31-native.json'))
    candidate=read(folder/'candidate400-31.json')
    for key in ('authoredNativeCase','finiteSettings','sourceSHA256','methodSHA256'):
        if reference[key]!=candidate[key]:raise ValueError('Matched300/400 source controls differ')
    expected=copy.deepcopy(reference['choices']);expected['lintelDepthMm']=400.
    if candidate['choices']!=expected:raise ValueError('Matched physical edit exceeded depth')
    a=reference['actualReplacement'];b=candidate['actualReplacement'];ga=a['geometry'];gb=b['geometry']
    if ga['lintelRectangleXYMm']!=gb['lintelRectangleXYMm']:raise ValueError('Depth edit changed physical plan')
    def weight(force,point):
        return [0.,0.,-force,-force*point[1]/1000,force*point[0]/1000,0.]
    rectangle=ga['lintelRectangleXYMm'];centre=[(rectangle[0]+rectangle[2])/2,(rectangle[1]+rectangle[3])/2]
    pieces=[weight(b['lintelPhysicalGKN']-a['lintelPhysicalGKN'],centre)]
    old={r['id']:r for r in a['bearingBodies']};fresh={r['id']:r for r in b['bearingBodies']}
    if set(old)!=set(fresh):raise ValueError('Depth edit changed bearing integration')
    for key,row in fresh.items():
        prior=old[key]
        if row['xyMm']!=prior['xyMm'] or row['areaMm2']!=prior['areaMm2'] or row['beddingPhysicalGKN']!=prior['beddingPhysicalGKN']:
            raise ValueError('Depth edit moved a physical integration fibre or bedding material')
        pieces.append(weight(row['serialLaw']['bodyPhysicalGKN']-prior['serialLaw']['bodyPhysicalGKN'],row['xyMm']))
    physical=[sum(row[i] for row in pieces) for i in range(6)]
    native=lambda r:r['finiteHouseResult']['native']['nativeVertical']['native']
    oldn,newn=native(reference),native(candidate)
    factor=candidate['authoredNativeCase']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    applied=[v-u for u,v in zip(oldn['externalWrenchKN_KNm'],newn['externalWrenchKN_KNm'])]
    residual=[a-factor*b for a,b in zip(applied,physical)]
    if max(map(abs,residual))>1e-6:raise ValueError('Depth material/applied6-wrench difference fails')
    old_heads={r['id']:r['reactionKN_KNm'] for r in oldn['heads']}
    differences=[{'id':r['id'],'actual300ReactionKN_KNm':old_heads[r['id']],'actual400ReactionKN_KNm':r['reactionKN_KNm'],
        'differenceKN_KNm':[b-a for a,b in zip(old_heads[r['id']],r['reactionKN_KNm'])]} for r in newn['heads']]
    summary={'schema':'str-actual-rear-depth400-comparison/1','inputSHA256':digest(control),
        'referenceArchiveSHA256':REFERENCE_ZIP,'physicalGDeltaKN':-physical[2],
        'physicalMaterialWrenchDeltaKN_KNm':physical,'actualAppliedWrenchDeltaKN_KNm':applied,
        'materialAppliedWrenchResidualKN_KNm':residual,'fullHeadComparisons':differences,
        'maximumAbsoluteHeadComponentDifference':max(abs(v) for r in differences for v in r['differenceKN_KNm']),
        'actual400Cases':[0,31],'all96NewDepthComplete':False,'currentSavedEngineeringDocumentAdmitted':False,
        'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False,
        'scope':'Fresh actual400 gravity andW31 responses. Original300 W31 is an authenticated matched comparison only; no old assembly forces and no altered-geometry96 demand claim.'}
    write(folder/'actual400-summary.json',summary)
    print('REAR_ACTUAL400_COMPARISON '+json.dumps(summary,separators=(',',':')),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','one','compare']);p.add_argument('--folder',type=Path,required=True);p.add_argument('--index',type=int)
    a=p.parse_args();a.folder.mkdir(parents=True,exist_ok=True)
    {'prepare':lambda:prepare(a.folder),'one':lambda:execute(a.folder,a.index),'compare':lambda:compare(a.folder)}[a.mode]()
