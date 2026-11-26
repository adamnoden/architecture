"""Pure actual-response replay; no structural solve or alternative load input."""
import copy
import hashlib
import json
import math
from pathlib import Path
from types import SimpleNamespace

from current_finite_joint_replay import replay as replay_finite
from floor_section_model import load_source
from rear_bearing_plan import geometry
from rear_direct_bearing import DirectBearing,identities,RENEWAL,compare_seated_reference

def material_and_load_difference(capture,control,root):
    """Independent current material-union and total occupied-Q difference."""
    compare_seated_reference(capture,control)
    from vertical_rc_floor import clear_ground_core_rectangles
    from seated_wet_support import replacement_cores
    from foundation_solid_weight import disjoint_solid_union
    source=load_source(root);cores=clear_ground_core_rectangles(source['bearing']['base']['vertical'])
    case=capture['authoredNativeCase'];old=case['wetSupport'];c=capture['choices'];p=capture['actualReplacement']['geometry']
    masonry=case['bearingCase']['masonryCase'];density=masonry['lowerCoreBodies']['masonryUnitWeightKNPerM3']
    adapter=DirectBearing(c,p,masonry['verticalCase']['bearingLaw'],density,cores)
    def g(weight,point):return [0.,0.,-weight,-weight*point[1]/1000,weight*point[0]/1000,0.]
    def total(rows):return [math.fsum(row[i] for row in rows) for i in range(6)]
    def ordinary(rows):
        union=disjoint_solid_union([{'id':r['id'],'kind':'source-ordinary-masonry',
            'boxXYZMm':[*r['rectangleXYMm'][:2],p['baseZMm'],*r['rectangleXYMm'][2:],p['floorSoffitZMm']]}
            for r in rows if r['materialKind']=='source-core-material-unqualified'])
        return total([g((b[3]-b[0])*(b[4]-b[1])*(b[5]-b[2])*density/1e9,
            [(b[0]+b[3])/2,(b[1]+b[4])/2]) for row in union for b in [row['boxXYZMm']]])
    old_ordinary=ordinary(replacement_cores(cores,old));new_ordinary=ordinary(adapter.cores(cores,{}))
    quantities={'ordinaryMasonryUnion':[a-b for a,b in zip(new_ordinary,old_ordinary)]}
    r=p['lintelRectangleXYMm'];old_r=control['native']['seatedWetSupport']['receiver']['rectangleXYMm']
    beam_old=old['beamWidthMm']*old['beamDepthMm']*(old_r[3]-old_r[1])*old['concreteUnitWeightKNPerM3']/1e9
    beam_new=c['lintelWidthMm']*c['lintelDepthMm']*(r[3]-r[1])*c['concreteUnitWeightKNPerM3']/1e9
    quantities['rcBeam']=[a-b for a,b in zip(g(beam_new,[p['axisXMm'],(r[1]+r[3])/2]),g(beam_old,[old['beamAxisXMm'],(old_r[1]+old_r[3])/2]))]
    post_g=[];pad_g=[]
    for rect,offset in zip(old['receiverRectanglesXYMm'],old['padCentreOffsetsYMm']):
        centre=[(rect[0]+rect[2])/2,(rect[1]+rect[3])/2]
        height=old['beamTopZMm']-old['beamDepthMm']-old['padThicknessMm']-p['baseZMm']
        post_g.append(g((rect[2]-rect[0])*(rect[3]-rect[1])*height*old['concreteUnitWeightKNPerM3']/1e9,centre))
        pad_g.append(g(old['padWidthMm']*old['padLengthMm']*old['padThicknessMm']*old['padUnitWeightKNPerM3']/1e9,[centre[0],centre[1]+offset]))
    body_g=[];joint_g=[]
    for rect in adapter.seats:
        area=(rect[2]-rect[0])*(rect[3]-rect[1]);centre=[(rect[0]+rect[2])/2,(rect[1]+rect[3])/2]
        body_g.append(g(area*(p['masonryBearingTopZMm']-p['baseZMm'])*density/1e9,centre))
        joint_g.append(g(area*c['jointThicknessMm']*c['jointUnitWeightKNPerM3']/1e9,centre))
    quantities['masonryBearingBodiesMinusRcPosts']=[a-b for a,b in zip(total(body_g),total(post_g))]
    quantities['mineralBeddingMinusSteelPads']=[a-b for a,b in zip(total(joint_g),total(pad_g))]
    before=control['native']['mass'];after=capture['finiteHouseResult']['native']['mass']
    slab_density=masonry['verticalCase']['plateLaw']['unitWeightKNPerM3'];slab_pressure=case['thicknessMm']/1000*slab_density
    quantities['restoredPlate']=[a-b for a,b in zip(g(after['newPlateAreaM2']*slab_pressure,after['newPlateCentroidXYMm']),g(before['newPlateAreaM2']*slab_pressure,before['newPlateCentroidXYMm']))]
    material=total(list(quantities.values()));mass_change=after['joinedPhysicalGKN']-before['joinedPhysicalGKN']
    if abs(material[2]+mass_change)>1e-7:raise ValueError('Independent rear material union does not equal actual whole-house own-G change')
    def area(rect):return (rect[2]-rect[0])*(rect[3]-rect[1])/1e6
    pressure=1.5*masonry['verticalCase']['freshUniformLiveKPa']
    q_delta=[a-b for a,b in zip(total([g(after['newPlateAreaM2']*pressure,after['newPlateCentroidXYMm']),g(area(r)*pressure,[(r[0]+r[2])/2,(r[1]+r[3])/2])]),
        total([g(before['newPlateAreaM2']*pressure,before['newPlateCentroidXYMm']),g(area(old_r)*pressure,[(old_r[0]+old_r[2])/2,(old_r[1]+old_r[3])/2])]))]
    factor=masonry['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    expected=[factor*a+b for a,b in zip(material,q_delta)]
    old_external=control['native']['nativeVertical']['native']['externalWrenchKN_KNm'];new_external=capture['finiteHouseResult']['native']['nativeVertical']['native']['externalWrenchKN_KNm']
    actual=[b-a for a,b in zip(old_external,new_external)];residual=[a-b for a,b in zip(actual,expected)]
    if max(map(abs,residual))>1e-6 or max(map(abs,q_delta))>1e-7:
        raise ValueError('Rear complete G/Q installation loses or double-applies physical force/first moment')
    return {'schema':'str-rear-bearing-independent-material-and-load-difference/1',
        'physicalMaterialDifferenceWrenchesKN_KNm':quantities,'totalPhysicalMaterialDifferenceKN_KNm':material,
        'actualHousePhysicalGChangeKN':mass_change,'sameOccupiedQWrenchDifferenceKN_KNm':q_delta,
        'expectedAppliedWrenchDifferenceKN_KNm':expected,'actualAppliedWrenchDifferenceKN_KNm':actual,
        'independentAppliedWrenchResidualKN_KNm':residual,'candidateAccepted':False}



def compare_values(actual,saved,path='response'):
    if isinstance(actual,bool) or isinstance(saved,bool):
        if actual is not saved:raise ValueError('Changed rear proof field: '+path)
    elif isinstance(actual,(int,float)) and isinstance(saved,(int,float)):
        if not math.isfinite(actual) or not math.isfinite(saved) or abs(actual-saved)>1e-7:
            raise ValueError('Changed rear numerical evidence: '+path)
    elif isinstance(actual,dict) and isinstance(saved,dict):
        if set(actual)!=set(saved):raise ValueError('Changed rear proof catalogue: '+path)
        for key in actual:compare_values(actual[key],saved[key],path+'.'+key)
    elif isinstance(actual,(list,tuple)) and isinstance(saved,(list,tuple)):
        if len(actual)!=len(saved):raise ValueError('Changed rear proof row count: '+path)
        for i,(a,b) in enumerate(zip(actual,saved)):compare_values(a,b,path+'/'+str(i))
    elif actual!=saved:raise ValueError('Changed rear proof identity: '+path)


def replay(capture,checkpoint,root):
    root=Path(root)
    if capture.get('schema')!='str-rear-direct-bearing-comparison/1' or checkpoint.get('schema')!='str-rear-direct-bearing-native-checkpoint/1' or checkpoint.get('postProcessingComplete') is not False:
        raise ValueError('Actual rear result and explicitly pending raw native checkpoint required')
    source=load_source(root);methods=identities(root)
    for key,current in [('sourceSHA256',source['identities']),('methodSHA256',methods)]:
        if capture[key]!=current or checkpoint[key]!=current:raise ValueError('Rear producer source/method identity differs')
    for key in ('authoredNativeCase','choices','finiteSettings'):
        if capture[key]!=checkpoint[key]:raise ValueError('Rear saved controlling choices differ')
    if any(capture.get(k) is not False for k in ('candidateAccepted','wholeHouseAccepted','strengthAccepted','ownerAccepted')):
        raise ValueError('Rear proof does not grant adoption or strength')
    compare_values(capture['finiteHouseResult'],checkpoint['finiteHouseResult'],'actualFullHouse')
    native=replay_finite(capture['finiteHouseResult'])
    h=json.loads((root/'project/had/studies/water-replan.json').read_text())['model']
    grid=json.loads((root/'project/str/studies/current-house-grid.json').read_text())
    renewal=json.loads((root/RENEWAL).read_text())['rearRenewal']['firstReleaseInterface']
    plan=geometry(h,grid,capture['choices'],renewal,capture['authoredNativeCase'])
    if plan!=capture['actualReplacement']['geometry']:raise ValueError('Rear response no longer derives from the actual shared plan')
    model=copy.deepcopy(checkpoint['postprocessingModel']);frame=model.pop('frame');model['model']=SimpleNamespace(**frame)
    adapter=DirectBearing.__new__(DirectBearing);adapter.model=model;adapter.plan=plan
    factor=capture['authoredNativeCase']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    actual=adapter.finish(checkpoint['rawResponse'],factor)
    member=capture['finiteHouseResult']['native']['nativeVertical']['native']
    from rc_floor_house_loads import recovered_member_actions,_physical_cut_rows,_interior_member_cuts,member_load_equilibrium
    multipliers=model['rearDirectBearing']['memberRecoveryMultipliers']
    recovered=recovered_member_actions(model,checkpoint['rawResponse'],multipliers)
    lintels={k:v for k,v in model['members'].items() if k.startswith('REAR-LINTEL/')}
    shadow={**model,'members':lintels}
    actual['lintelMemberCuts']=_physical_cut_rows(model,recovered,lintels)
    actual['lintelInteriorMemberCuts']=_interior_member_cuts(shadow,recovered,multipliers)
    compare_values(actual['lintelMemberCuts'],[r for r in member['memberCuts'] if r['memberId'].startswith('REAR-LINTEL/')],'nativeLintelEnds')
    compare_values(actual['lintelInteriorMemberCuts'],[r for r in member['interiorMemberCuts'] if r['memberId'].startswith('REAR-LINTEL/')],'nativeLintelInteriorPointJumps')
    member_load_equilibrium(shadow,recovered,multipliers)
    compare_values(actual,capture['actualReplacement'],'actualReplacement')
    grid_cuts=actual['receivingGridCuts']
    if not grid_cuts['physicalElementCutsAvailable']:raise ValueError('Actual new rear grid cuts remain incomplete')
    return {'schema':'str-rear-direct-bearing-replay/1','actualHeadCount':52,
        'actualBearingContactCount':len(actual['bearingBodies']),'activeBearingContactCount':actual['activeBearingCount'],
        'topCompressionKN':actual['topCompressionKN'],'baseCompressionKN':actual['baseCompressionKN'],
        'actualGridMemberCount':len(grid_cuts['memberIds']),'actualGridOriginCount':grid_cuts['originCount'],
        'actualDirectJointOriginCount':len(actual['directJointOrigins']['origins']),
        'directJointTotals':actual['directJointOrigins']['jointTotals'],'finiteHouseReplay':native,
        'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False}


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--capture',type=Path,required=True)
    parser.add_argument('--checkpoint',type=Path,required=True);parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--control',type=Path,required=True)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3]);args=parser.parse_args()
    if hashlib.sha256(args.checkpoint.read_bytes()).hexdigest()!=json.loads(args.capture.read_text())['rawCheckpointSHA256']:
        raise ValueError('Raw native checkpoint byte identity differs from actual final receipt')
    capture=json.loads(args.capture.read_text());control=json.loads(args.control.read_text())
    result=replay(capture,json.loads(args.checkpoint.read_text()),args.root)
    result['matchedHouseComparison']=compare_seated_reference(capture,control)
    result['independentMaterialAndLoadDifference']=material_and_load_difference(capture,control,args.root)
    result['replayMethodSHA256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    args.out.write_text(json.dumps(result,allow_nan=False))
    print(json.dumps({'schema':result['schema'],'headCount':result['actualHeadCount'],
        'gridOriginCount':result['actualGridOriginCount'],'directJointOriginCount':result['actualDirectJointOriginCount'],
        'physicalGChangeKN':result['independentMaterialAndLoadDifference']['actualHousePhysicalGChangeKN'],
        'maximumIndependentAppliedWrenchResidualKN_KNm':max(map(abs,result['independentMaterialAndLoadDifference']['independentAppliedWrenchResidualKN_KNm'])),
        'replayMethodSHA256':result['replayMethodSHA256']},allow_nan=False))
