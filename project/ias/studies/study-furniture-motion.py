from __future__ import annotations

import hashlib
import json
import math
import runpy
import sys
from pathlib import Path


def footprint(box):
    x0, y0, x1, y1 = box
    return [x0, y0, x1-x0, y1-y0]


def translation(bcr, name, item, start, end, start_body, end_body, obstacles, body_radius, arm_radius):
    dx, dy = end[0]-start[0], end[1]-start[1]
    assert start[2:] == end[2:] and (dx == 0 or dy == 0)
    assert [dx, dy] == [end_body[0]-start_body[0], end_body[1]-start_body[1]]
    sweep = [min(start[0], end[0]), min(start[1], end[1]), start[2]+abs(dx), start[3]+abs(dy)]
    item_clearance, item_obstacle = min((bcr['rectangle_distance'](sweep, r), k) for k, r in obstacles.items())
    worker = bcr['route']([start_body, end_body], obstacles, body_radius)
    contact_radius = 45
    contact = [min(max(start_body[i], start[i]), start[i]+start[i+2]) for i in (0, 1)]
    reach = math.dist(start_body, contact)
    wrist = [contact[i] + (start_body[i]-contact[i])*contact_radius/reach for i in (0, 1)]
    wrist_final = [wrist[0]+dx, wrist[1]+dy]
    points = [start_body, end_body, wrist, wrist_final]
    corner = [min(point[i] for point in points) for i in (0, 1)]
    arm_sweep = corner + [max(point[i] for point in points)-corner[i] for i in (0, 1)]
    forearm, arm_obstacle = min((bcr['rectangle_distance'](arm_sweep, r)-arm_radius, k) for k, r in obstacles.items())
    hand = bcr['route']([wrist, wrist_final], obstacles, contact_radius)
    return {
        'type': 'translation', 'id': name, 'item': item, 'startXYWHMm': start, 'endXYWHMm': end,
        'itemSweepXYWHMm': sweep, 'minimumItemClearanceMm': item_clearance, 'itemObstacle': item_obstacle,
        'worker': worker, 'bodyToItemMm': reach-body_radius, 'maximumProspectiveReachMm': reach,
        'forearmSweepXYWHMm': arm_sweep, 'forearmClearanceMm': forearm, 'forearmObstacle': arm_obstacle,
        'hand': hand, 'forearmToItemMm': contact_radius-arm_radius,
    }


def approach(bcr, name, points, obstacles, body_radius):
    return {'type': 'approach', 'id': name, 'worker': bcr['route'](points, obstacles, body_radius)}


def cardinal(box, side, offset):
    return [box[0]-offset, box[1]+box[3]/2] if side == 'west' else [box[0]+box[2]/2, box[1]+box[3]+offset]


def room_motion(root, request):
    if not isinstance(request, dict) or set(request) != {'schema', 'bayReceiptSha256', 'deskParkXYXYMm', 'chairParkXYXYMm'} or request['schema'] != 'ias-study-furniture-native-case/1':
        raise ValueError('Expected a versioned occupied furniture case')
    boxes = [request[name] for name in ('deskParkXYXYMm', 'chairParkXYXYMm')]
    if not all(isinstance(box,list) and len(box) == 4
               and all(type(value) in (int,float) and math.isfinite(value) for value in box)
               and all(box[i] < box[i+2] for i in (0,1)) for box in boxes):
        raise ValueError('Expected finite ordered parked furniture boxes in millimetres')
    desk_park, chair_park = map(footprint, boxes)
    bay_path = 'project/bcr/studies/bay-interface-study.json'
    bcr = runpy.run_path(str(root/'project/bcr/studies/bay-interface-study.py'))
    baseline, house, fixed = bcr['calculate'](root)
    bay_bytes = (root/bay_path).read_bytes()
    if hashlib.sha256(bay_bytes).hexdigest() != request['bayReceiptSha256'] or json.loads(json.dumps(baseline)) != json.loads(bay_bytes):
        raise ValueError('The live BCR obstruction model disagrees with the source-bound bay receipt')
    original = house['groundFurniture']
    desk, chair = [original[name] for name in ('study-desk','study-chair')]
    if desk_park[0] != desk[0] or desk_park[1] <= desk[1] or desk_park[2:] != desk[2:]:
        raise ValueError('Expected a north desk shift with unchanged plan dimensions')
    if chair_park[2:] != list(reversed(chair[2:])):
        raise ValueError('Expected unchanged chair dimensions after a quarter turn')
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
    return {
        'schema':'ias-study-furniture-native-result/1', 'state':'geometry-screen-only' if not conflicts else 'geometry-conflict',
        'basis': {'bayReceiptSha256':request['bayReceiptSha256'], 'bayInputs':baseline['sourceGitBlobs'],
                  'occupiedHouseInputs':baseline['currentHouseInputBlobs'],
                  'turnReceiptPath':window_path,'turnReceiptSha256':hashlib.sha256(window_bytes).hexdigest(),
                  'closedDoorPoseXYMm':entry},
        'candidate': {'deskParkXYXYMm':request['deskParkXYXYMm'],'chairParkXYXYMm':request['chairParkXYXYMm']},
        'comparisonClearanceMm': clearance, 'phases':phases, 'conflictingPhaseIds':conflicts,
        'reverseUsesSameSweeps':True, 'physicalAcceptance':False,
        'held':['Actual furniture gripping, mass, wheels or sliding supports, and moving forces',
                'A restrained turn and repeatable compliant operation after setting',
                'Maintained door operation and handling of floor parts from a supported deck'],
    }


if __name__ == '__main__':
    try:
        result = room_motion(Path(sys.argv[1]), json.load(sys.stdin))
        print(json.dumps(result, allow_nan=False))
    except ValueError as error:
        raise SystemExit(str(error)) from None
