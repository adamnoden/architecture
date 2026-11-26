"""Fresh nominal renewal of a compiled structural Study room.

The structural context and current parts arrive from the shared compiler. This
adapter authenticates their native/baseline sources, adds the explicit ordinary
preparation, and uses the existing BCR motion and ordinary handling kernels.
No historical floor witness or physical acceptance is imported.
"""
from __future__ import annotations

import copy
import hashlib
import json
import math
import runpy
import sys
from pathlib import Path


def _require(condition, message):
    if not condition:
        raise ValueError(message)


def _canonical(value):
    # Match finite JSON.stringify semantic numbers for this ASCII-keyed input.
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, list):
        return [_canonical(item) for item in value]
    if isinstance(value, dict):
        return {key: _canonical(value[key]) for key in sorted(value)}
    return value


def _digest(value):
    return hashlib.sha256(json.dumps(_canonical(value), separators=(',', ':'), ensure_ascii=False, allow_nan=False).encode()).hexdigest()


def _phase_conflicts(phases):
    return [phase['id'] for phase in phases if min(
        phase['worker']['minimumClearance'], phase.get('minimumItemClearanceMm', math.inf),
        phase.get('bodyToItemMm', math.inf), phase.get('forearmClearanceMm', math.inf),
        phase.get('hand', phase.get('handCorridor', {'minimumClearance': math.inf}))['minimumClearance'],
    ) < 25 or phase.get('maximumProspectiveReachMm', 0) > 600]


def _standard_furniture(bcr, motion, root, house, fixed, desk, chair, desk_park, chair_park):
    # Same source-bound turn and phase composition as room_motion; all geometric
    # operations below are the existing motion/BCR primitives, unchanged.
    approach, translation, cardinal = (motion[key] for key in ('approach', 'translation', 'cardinal'))
    window_path = 'project/mat/studies/study-coupled-window.json'

    window_bytes = (root/window_path).read_bytes()
    native = json.loads(window_bytes)['service']
    turn = native['chairCentreTurn']
    door = house['studyDoorOperation']
    body_radius, arm_radius = door['bodyRadius'], door['forearmRadius']
    entry = door['bodyKnots'][0][1:]
    clearance = 25
    grip_offset = body_radius + 45
    chair_seen = {**fixed,'study-desk':desk}
    near_turn = [turn[0]-chair[2]/2, chair[1], *chair[2:]]
    before_turn = [turn[0]-chair[2]/2, turn[1]-chair[3]/2, *chair[2:]]
    after_turn = [turn[0]-chair[3]/2, turn[1]-chair[2]/2, chair[3], chair[2]]
    aligned = [after_turn[0], chair_park[1], *after_turn[2:]]
    chair_radius = math.hypot(chair[2]/2,chair[3]/2)
    turn_worker = [math.floor(turn[0]-chair_radius-body_radius-clearance), turn[1]]
    turn_gap, turn_obstacle = min((bcr['point_rectangle'](turn,r)-chair_radius,k) for k,r in chair_seen.items())
    turn_body = bcr['route']([turn_worker,turn_worker],chair_seen,body_radius)
    turn_reach = math.dist(turn,turn_worker)-min(chair[2:])/2
    turned_hand_target = [turn_worker[0]+turn_reach, turn_worker[1]]
    turn_hand = bcr['route']([turn_worker,turned_hand_target],chair_seen,45)
    turn_stance = cardinal(near_turn,'west',grip_offset)
    between_stances = [[turn_stance[0], cardinal(near_turn,'north',grip_offset)[1]], turn_stance]
    parked_desk_worker = cardinal(desk_park,'north',grip_offset)
    phases = [
        approach(bcr,'enter-chair-field',[entry,cardinal(chair,'north',grip_offset)],{**chair_seen,'study-chair':chair},body_radius),
        translation(bcr,'shift-chair-east','study-chair',chair,near_turn,
                    cardinal(chair,'north',grip_offset),cardinal(near_turn,'north',grip_offset),chair_seen,body_radius,arm_radius),
        approach(bcr,'move-to-west-flank',[cardinal(near_turn,'north',grip_offset),*between_stances],
                 {**chair_seen,'study-chair':near_turn},body_radius),
        translation(bcr,'shift-chair-north','study-chair',near_turn,before_turn,
                    turn_stance,cardinal(before_turn,'west',grip_offset),chair_seen,body_radius,arm_radius),
        approach(bcr,'step-back-for-turn',[cardinal(before_turn,'west',grip_offset),turn_worker],
                 {**chair_seen,'study-chair':before_turn},body_radius),
        {'type':'rotation', 'id':'turn-chair', 'item':'study-chair','centreXYMm':turn,'radiusMm':chair_radius,'angleDeg':90,
         'startXYWHMm':before_turn, 'endXYWHMm':after_turn, 'worker':turn_body,
         'minimumItemClearanceMm':turn_gap, 'itemObstacle':turn_obstacle,
         'bodyToItemMm':math.dist(turn,turn_worker)-chair_radius-body_radius,
         'maximumProspectiveReachMm':turn_reach,'handCorridor':turn_hand},
        approach(bcr,'return-to-west-flank',[turn_worker,cardinal(after_turn,'west',grip_offset)],
                 {**chair_seen,'study-chair':after_turn},body_radius),
        translation(bcr,'align-turned-chair-south','study-chair',after_turn,aligned,
                    cardinal(after_turn,'west',grip_offset),cardinal(aligned,'west',grip_offset),chair_seen,body_radius,arm_radius),
        translation(bcr,'park-turned-chair-east','study-chair',aligned,chair_park,
                    cardinal(aligned,'west',grip_offset),cardinal(chair_park,'west',grip_offset),chair_seen,body_radius,arm_radius),
        approach(bcr,'approach-desk-north-face',[cardinal(chair_park,'west',grip_offset),cardinal(desk,'north',grip_offset)],
                 {**chair_seen,'study-chair':chair_park},body_radius),
        translation(bcr,'pull-desk-north','study-desk',desk,desk_park,
                    cardinal(desk,'north',grip_offset),parked_desk_worker,{**fixed,'study-chair':chair_park},body_radius,arm_radius),
        approach(bcr,'return-to-closed-door',[parked_desk_worker,[parked_desk_worker[0],entry[1]],entry],
                 {**fixed,'study-chair':chair_park,'study-desk':desk_park},body_radius),
    ]
    conflicts = [p['id'] for p in phases if min(
        p['worker']['minimumClearance'], p.get('minimumItemClearanceMm', math.inf),
        p.get('bodyToItemMm', math.inf), p.get('forearmClearanceMm', math.inf),
        p.get('hand', p.get('handCorridor', {'minimumClearance': math.inf}))['minimumClearance'],
    ) < clearance or p.get('maximumProspectiveReachMm', 0) > 600]
    return {'schema': 'ias-study-furniture-native-result/1',
            'state': 'geometry-conflict' if conflicts else 'geometry-screen-only',
            'comparisonClearanceMm': clearance, 'phases': phases, 'conflictingPhaseIds': conflicts,
            'turnReceiptPath': window_path, 'turnReceiptSha256': hashlib.sha256(window_bytes).hexdigest(),
            'reverseUsesSameSweeps': True, 'physicalAcceptance': False}


def evaluate_structural_renewal(root, request):
    root = Path(root).resolve()
    fields = {'schema', 'context', 'parts', 'emitterPlinth', 'ordinaryHandling', 'installedServices'}
    _require(isinstance(request, dict) and not set(request)-fields
             and request.get('schema') == 'ias-study-structural-renewal-case/1', 'Expected a compiled structural Study renewal case')
    context, parts, plan = (request[key] for key in ('context', 'parts', 'ordinaryHandling'))
    _require(context.get('schema') == 'ias-study-structural-consequence/1'
             and context['source']['controlPath'] == 'stages.distributedFloor.cornerWidthsMm.SW', 'Expected the same saved distributed-floor control')
    _require(_digest(context['source']) == context['digest'], 'Stale structural Study context digest')
    sys.path.insert(0, str(root/'project/str/studies'))
    native_method = runpy.run_path(str(root/'project/str/studies/finite_joint_geometry.py'))
    native = native_method['read_SW_geometry'](root, context['source']['native']['widthMm'])
    _require(native == context['source']['native'], 'Compiled Study context disagrees with current native SW geometry')
    floor = json.loads((root/'project/ias/studies/workable-study-floor.json').read_bytes())
    _require(context['source']['baseBands'] == floor['study']['bands']
             and context['source']['baseOccupied'] == floor['study']['occupied'], 'Compiled Study baseline disagrees with the current floor source')
    source, width = context['source'], native['widthMm']
    _require(140 < width <= 240 and source['finishDepthMm'] > 0, 'Expected an admitted local enlarged SW pilaster')
    raw = native['rectanglesXYMm']; x0=min(row[0] for row in raw); y0=min(row[1] for row in raw)
    finish = source['finishDepthMm']; face=[x0+width+finish,y0+width+finish]
    toe=[max(row[2] for row in raw)+finish,max(row[3] for row in raw)+finish]
    _require(context['finishedFaceXYMm'] == face and context['finishedToeXYMm'] == toe
             and context['finishReservations'] == [[x0,y0,face[0],toe[1]],[x0,y0,toe[0],face[1]]], 'Structural finish envelope mismatch')
    a,b,c=source['baseBands']
    _require(x0+140+finish == a[0] and y0+140+finish == a[1]
             and face[0] < toe[0] and face[1] < a[3] and b[1] < toe[1] < b[3], 'Structural finish datum no longer matches the source Study')
    expected_bands=[[toe[0],a[1],a[2],face[1]],[face[0],face[1],a[2],a[3]],
                    [face[0],b[1],b[2],toe[1]],[b[0],toe[1],b[2],b[3]],c]
    _require(context['bands'] == expected_bands, 'Structural room bands disagree with the exact local pilasters')
    layout=source['layoutDecision']; prep_input=layout.get('renewalPreparation', {})
    _require(prep_input.get('socketIsolatedAndUnplugged') is True
             and prep_input.get('restoreDailyFurnitureByReversingPreparation') is True
             and type(prep_input.get('deskWestTranslationMm')) in (int,float)
             and 0 < prep_input['deskWestTranslationMm'] <= layout['deskEastShiftMm']
             and prep_input.get('chairNorthTranslationMm') == 650, 'Expected the authored ordinary isolated furniture preparation')
    base_occupied=dict(source['baseOccupied']); occupied=dict(context['occupied'])
    expected=copy.deepcopy(base_occupied)
    shift=layout['deskEastShiftMm']; emitter_shift=layout['emitterNorthShiftMm']
    expected['study-desk']=[v+(shift if i%2==0 else 0) for i,v in enumerate(expected['study-desk'])]
    expected['service-emitter-study-W']=[v+(emitter_shift if i%2 else 0) for i,v in enumerate(expected['service-emitter-study-W'])]
    _require(occupied == expected, 'Current furniture does not match the explicit structural layout decision')
    grid=layout['placementGridMm']; source_emitter=base_occupied['service-emitter-study-W']
    _require(emitter_shift == max(0,math.ceil((toe[1]+layout['emitterEndClearanceMm']-source_emitter[1])/grid)*grid), 'Emitter shift no longer clears the current pier toe')
    bcr=runpy.run_path(str(root/'project/bcr/studies/bay-interface-study.py'))
    motion=runpy.run_path(str(root/'project/ias/studies/study-furniture-motion.py'))
    handler=runpy.run_path(str(root/'project/ias/studies/study-floor-handling.py'))
    baseline, house, fixed=bcr['calculate'](root)
    bay_bytes=(root/'project/bcr/studies/bay-interface-study.json').read_bytes()
    _require(json.loads(json.dumps(baseline)) == json.loads(bay_bytes), 'Current BCR calculation disagrees with the bound baseline receipt')
    fp=motion['footprint']; edges=motion['edges']
    for name,box in base_occupied.items():
        _require(house['groundFurniture'][name] == fp(box), 'Study baseline furniture source changed: '+name)
    for name,box in occupied.items():
        house['groundFurniture'][name]=fp(box)
        if name in fixed: fixed[name]=fp(box)
    west, south='FLOOR/CORNER/SW/west-face','FLOOR/CORNER/SW/south-face'
    trim=floor['assemblies']['skirting']['existingProjectionMM']
    _require(trim == 18, 'Actual structural skirt projection changed; reprove its renewal')
    fixed[west]=[x0,y0,face[0]+trim-x0,toe[1]-y0]
    fixed[south]=[x0,y0,toe[0]-x0,face[1]+trim-y0]
    plinth=request['emitterPlinth']; emitter=occupied['service-emitter-study-W']
    _require(plinth.get('emitterId') == 'service-emitter-study-W'
             and plinth['box'] == [emitter[0],toe[1],emitter[2]+5,emitter[3]+5], 'Emitter plinth does not meet the actual toe and current emitter')
    fixed['study-emitter-plinth']=fp(plinth['box'])
    desk=house['groundFurniture']['study-desk']; chair=house['groundFurniture']['study-chair']
    daily=copy.deepcopy(house['groundFurniture'])
    prepared=list(desk); prepared[0]-=prep_input['deskWestTranslationMm']
    raised=[chair[0],chair[1]+prep_input['chairNorthTranslationMm'],*chair[2:]]
    door=house['studyDoorOperation']; R,A=door['bodyRadius'],door['forearmRadius']; entry=door['bodyKnots'][0][1:]
    _require(R == 300 and A == 40, 'Source worker profile changed; reprove the preparation')
    offset=R+45; east=[chair[0]+chair[2]+offset,chair[1]+chair[3]/2]
    east_north=[east[0],east[1]+prep_input['chairNorthTranslationMm']]
    desk_north=[desk[0]+desk[2]/2,desk[1]+desk[3]+offset]
    prepared_north=[prepared[0]+prepared[2]/2,prepared[1]+prepared[3]+offset]
    elbow=[east[0],desk_north[1]]
    approach,translation=motion['approach'],motion['translation']
    prep=[
        approach(bcr,'prepare-approach-chair-east',[entry,east],{**fixed,'study-desk':desk,'study-chair':chair},R),
        translation(bcr,'prepare-slide-chair-north','study-chair',chair,raised,east,east_north,{**fixed,'study-desk':desk},R,A),
        approach(bcr,'prepare-approach-desk-north',[east_north,elbow,desk_north],{**fixed,'study-desk':desk,'study-chair':raised},R),
        translation(bcr,'prepare-desk-west','study-desk',desk,prepared,desk_north,prepared_north,{**fixed,'study-chair':raised},R,A),
        approach(bcr,'prepare-return-to-chair-east',[prepared_north,elbow,east_north],{**fixed,'study-desk':prepared,'study-chair':raised},R),
        translation(bcr,'prepare-slide-chair-home','study-chair',raised,chair,east_north,east,{**fixed,'study-desk':prepared},R,A),
        approach(bcr,'prepare-return-to-entry',[east,entry],{**fixed,'study-desk':prepared,'study-chair':chair},R),
    ]
    prep_conflicts=_phase_conflicts(prep)
    house['groundFurniture']['study-desk']=prepared
    # The same-case source owns the north parking translation; the existing
    # window source owns the turned-chair park. Neither controls corner width.
    reference=json.loads((root/'project/mat/studies/study-coupled-window.json').read_bytes())['service']
    _require(type(prep_input.get('deskNorthParkingTranslationMm')) in (int,float)
             and 0 < prep_input['deskNorthParkingTranslationMm'] <= 1200, 'Expected the authored ordinary north desk parking translation')
    desk_park=[prepared[0],prepared[1]+prep_input['deskNorthParkingTranslationMm'],*prepared[2:]]
    chair_park=reference['chairPark']
    furniture=_standard_furniture(bcr,motion,root,house,fixed,prepared,chair,desk_park,chair_park)
    furniture['candidate']={'deskParkXYXYMm':edges(desk_park),'chairParkXYXYMm':edges(chair_park)}
    installed=request.get('installedServices')
    _require(isinstance(installed,dict) and installed.get('schema') == 'ias-study-installed-inlet-candidate/1'
             and installed.get('state') == 'wall-hung-candidate' and installed.get('sourceId') == 'study'
             and installed.get('acceptance') == {'installedEvidence':False,'anchorAndCompleteSupport':False,'phasePostureVerified':False},
             'Expected the complete unaccepted authored installed Study inlet')
    volumes=[item['xyzxyzMm'] for item in installed.get('components',[])]
    _require(volumes and all(isinstance(v,list) and len(v)==6 and all(type(n) in (int,float) and math.isfinite(n) for n in v)
             and all(v[i]<v[i+3] for i in range(3)) for v in volumes), 'Invalid complete installed inlet volumes')
    lowest=min(v[2] for v in volumes); top=installed.get('workerTopMm')
    _require(lowest == installed.get('installedCarrierMinimumZMm') and top == 900 and lowest > top+5,
             'Installed inlet no longer clears the declared crouched floor phase')
    fixed={key:box for key,box in fixed.items() if key not in ('study-inlet-carrier','study-inlet-installed')}
    stages=[(name,{**fixed,'study-desk':d,'study-chair':ch}) for name,d,ch in (
        ('occupied',prepared,chair),('chair-parked',prepared,chair_park),('desk-and-chair-parked',desk_park,chair_park))]
    records=motion['board_plan_obstructions'](house,stages)
    for stage in records:
        stage['obstacles'][west]['withoutWallTrimXYXYMm']=[x0,y0,face[0],toe[1]]
        stage['obstacles'][south]['withoutWallTrimXYXYMm']=[x0,y0,toe[0],face[1]]
    _require(len(parts) == len({part['id'] for part in parts}) and 0 < len(parts) <= 200, 'Expected unique actual compiled floor parts')
    _require(plan.get('schema') == 'ias-study-ordinary-handling-plan/1', 'Expected a versioned ordinary handling plan')
    _require(0 < len(plan['boards']) <= 5 and len({board['id'] for board in plan['boards']}) == len(plan['boards']), 'Expected at most five unique ordinary handling boards')
    for part in parts:
        pieces=part.get('facePieces') or [part['face']]
        keys=part['grip']['centres']
        _require(len(keys) == 2 and all(any(handler['covers'](piece,(*key,*key)) for piece in pieces) for key in keys), 'Actual floor keys must remain inside their own wearing faces')
        _require('keyCentresXYMm' not in part or part['keyCentresXYMm'] == keys, 'Conflicting current key coordinates')
    ordinary=None if prep_conflicts or furniture['conflictingPhaseIds'] else handler['validate_floor_handling'](
        parts,records,context['bands'],bcr,plan,entry,furniture['phases'])
    method_paths=['project/ias/studies/study-structural-renewal.py','project/ias/studies/study-furniture-motion.py',
                  'project/ias/studies/study-floor-handling.py','project/bcr/studies/bay-interface-study.py',
                  'project/bcr/studies/bay-interface-study.json','project/ias/studies/workable-study-floor.json',
                  'project/mat/studies/study-coupled-window.json','project/str/studies/finite_joint_geometry.py']
    return {'schema':'ias-study-structural-renewal-result/1',
            'state':'joined-geometry-witnesses' if ordinary and ordinary['witnessCount'] == len(parts) else 'geometry-withheld',
            'contextDigest':context['digest'],'requestDigest':_digest(request),'dailyOccupied':context['occupied'],
            'preparation':{'schema':'ias-study-renewal-preparation-result/1','phases':prep,'conflictingPhaseIds':prep_conflicts,
                           'dailyDeskXYXYMm':edges(daily['study-desk']),'preparedDeskXYXYMm':edges(prepared),
                           'socketIsolatedAndUnplugged':True,'allFloorHandlingBeginsAfterPreparation':True,
                           'restorationUsesReverseSweeps':True,'physicalAcceptance':False},
            'furniture':furniture,'ordinaryHandling':ordinary,
            'installedServicesPhase':{'workerTopMm':top,'lowestCompleteSupportMm':lowest,'physicalAcceptance':False},
            'boardPlanObstructions':records,
            'sourceSHA256':{**native['sourceSHA256'],**{path:hashlib.sha256((root/path).read_bytes()).hexdigest() for path in method_paths}},
            'held':['Actual furniture gripping, forces and restrained operation',
                    'Actual socket isolation and unplugging before furniture preparation',
                    'Loaded boards, seated finish bearing and supported deck',
                    'Actual trim release, refit, tolerances and repeatability',
                    'Complete installed inlet support and floor-phase posture'],
            'physicalAcceptance':False,'ownerAcceptance':False}


if __name__ == '__main__':
    try:
        print(json.dumps(evaluate_structural_renewal(Path(sys.argv[1]),json.load(sys.stdin)),allow_nan=False))
    except (ValueError,KeyError,AssertionError) as error:
        raise SystemExit(str(error)) from None
