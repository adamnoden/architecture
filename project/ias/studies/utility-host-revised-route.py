"""Reproduce one revised utility host and the post-isolation move to first rest."""

import argparse
import hashlib
import html
import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SHEET = Path(__file__).with_suffix('.svg')
RECORD = Path(__file__).with_suffix('.json')
CLEARANCE = 25
CARRY_LIFT = 35
PAD_HEIGHT = 30
NORTH_TRAVEL = 350
WEST_TRAVEL = 200
CARRIER_DROP = 50
CARRIER_TRAVEL = 265


def read_source(path, sources):
    payload = (ROOT / path).read_bytes()
    blob_header = f'blob {len(payload)}\0'.encode()
    sources[path] = hashlib.sha1(blob_header + payload).hexdigest()
    return json.loads(payload)


# Boxes are [minimum x, minimum y, minimum z, width, depth, height].
def shifted(box, offset):
    return [box[i] + offset[i] for i in range(3)] + box[3:]


def sweep(box, start, end):
    assert sum(a != b for a, b in zip(start, end)) == 1
    origin = [box[i] + min(start[i], end[i]) for i in range(3)]
    size = [box[i + 3] + abs(end[i] - start[i]) for i in range(3)]
    return origin + size


def separation(a, b, axis):
    return max(a[axis] - b[axis] - b[axis + 3], b[axis] - a[axis] - a[axis + 3], 0)


def box_gap(a, b):
    return math.hypot(*(separation(a, b, axis) for axis in range(3)))


def overlaps_interior(a, b):
    return all(max(a[i], b[i]) < min(a[i] + a[i + 3], b[i] + b[i + 3]) for i in range(3))


def minimum_sweep(members, states, obstacles):
    candidates = []
    for leg, (start, end) in enumerate(zip(states, states[1:])):
        for label, member in members.items():
            occupied = sweep(member, start, end)
            for other, obstacle in obstacles.items():
                candidates.append((box_gap(occupied, obstacle), leg, label, other))
    distance, leg, member, other = min(candidates)
    return {'clearance': distance, 'leg': leg, 'member': member, 'retained': other}


def point_to_box_plan(point, box):
    return math.hypot(*(max(box[i] - point[i], point[i] - box[i] - box[i + 3], 0) for i in range(2)))


def person_gap(start, end, box):
    # Each plan segment is axis aligned. This gives the closest centre on it.
    assert sum(a != b for a, b in zip(start, end)) <= 1
    travel_axis = 0 if start[0] != end[0] else 1
    nearest = list(start)
    nearest[travel_axis] = min(max(box[travel_axis], min(start[travel_axis], end[travel_axis])), max(start[travel_axis], end[travel_axis]))
    torso_plan_gap = max(point_to_box_plan(nearest, box) - 300, 0)
    torso_vertical_gap = max(300 - box[2] - box[5], box[2] - 1800, 0)
    torso_gap = math.hypot(torso_plan_gap, torso_vertical_gap)
    # Fixed heading through the backward step and the sideways step.
    feet = [min(start[0], end[0]) - 175, min(start[1], end[1]) - 300, 0,
            350 + abs(end[0] - start[0]), 600 + abs(end[1] - start[1]), 300]
    return min((torso_gap, 'torso'), (box_gap(feet, box), 'feet/legs'))


def crew_checks(paths, frame, static_obstacles):
    for first, second in zip(*paths):
        assert math.dist(first, second) == 650
    results = []
    for path in paths:
        stationary = min(
            (*person_gap(start, end, obstacle), leg, label)
            for leg, (start, end) in enumerate(zip(path, path[1:]))
            for label, obstacle in static_obstacles.items()
        )
        # Both operators and the carried frame follow the same plan translation.
        # In moving coordinates each operator's plan position stays fixed.
        during_lift = {label: sweep(box, [0, 0, 0], [0, 0, CARRY_LIFT]) for label, box in frame.items()}
        relative = min((*person_gap(path[0], path[0], box), label) for label, box in during_lift.items())
        results.append({'stationaryClearance': stationary, 'relativeFrameClearance': relative})
    return results


def member_boxes(centres):
    frame = {}
    for index, (x, y) in enumerate(centres, start=1):
        frame[f'leg {index}'] = [x - 20, y - 20, 6, 40, 40, 864]
        frame[f'sole {index}'] = [x - 20, y - 20, 0, 40, 40, 6]
    for z, height in [(850, 40), (135, 30)]:
        for y in [750, 1350]:
            frame[f'EW rail at y{y} / z{z}'] = [10975, y - 15, z - height / 2, 550, 30, height]
        for x in [10975, 11525]:
            frame[f'NS rail at x{x} / z{z}'] = [x - 15, 750, z - height / 2, 30, 600, height]
    frame['temporary carry bar'] = [10750, 1335, 760, 795, 30, 40]
    return frame


def calculate():
    sources = {}
    house = read_source('project/had/studies/water-replan.json', sources)['model']
    services = read_source('project/mat/studies/whole-house-service-baseline.json', sources)
    original = read_source('project/ias/studies/utility-service-host.json', sources)
    washer = read_source('project/ias/studies/utility-first-release.json', sources)['native']
    fixtures = house['groundFurniture']
    utility = services['interfaces']['architecturalServices']['utility']
    valve = next(item for item in services['fixtures'] if item['id'] == 'washer-PROPOSED')
    assert fixtures['service-utility-sink'] == utility['sink'] == [10950, 700, 600, 700]
    assert fixtures['service-utility-valveBay'] == utility['valveBay'] == [10700, 700, 250, 700]
    assert fixtures['service-utility-washer'] == utility['washer'] == [10050, 700, 650, 700]
    assert valve['waterBranchPlan'][-1] == [10800, 1250] and valve['valveAxisZ'] == 750
    assert valve['requiredValveWorkTerritory'] == [200, 200, 300]
    branch_plan = valve['waterBranchPlan']
    upper_axis = valve['valveAxisZ'] + valve['waterBranchLengthIncludingDropMM'] - sum(
        math.dist(start, end) for start, end in zip(branch_plan, branch_plan[1:])
    )
    assert upper_axis == 2945
    assert washer['model'] == 'Bosch WAN282X2GB' and washer['drainHeight'] == [600, 1000]
    assert washer['siphonClampDiameter'] == [24, 40]
    east_window = next(item for item in house['openings']['GROUND'] if item['id'] == 'east-window-0')
    assert east_window['centre'] - east_window['width'] / 2 == 1300
    east_face = house['shell'] - house['envelope']
    north_face = min(next(wall for wall in house['groundWalls'] if wall['id'] == 'utility-north')['finishedFaces'])
    assert east_face == 11570.5 and north_face == 2453

    centres = [(x, y) for x in [10975, 11525] for y in [750, 1350]]
    frame = member_boxes(centres)
    # The carrier and its water termination occupy the old valve bay. The
    # upper waste kit belongs to the separately removed sink assembly.
    carrier = {
        'compact carrier post': [10905, 1215, 300, 20, 20, 550],
        'lower pipe arm': [10800, 1215, 440, 115, 20, 20],
        'middle pipe arm': [10800, 1215, 540, 115, 20, 20],
        'valve reaction arm': [10800, 1215, 740, 115, 20, 20],
        'water fitting and cap domain': [10770, 1220, 720, 60, 60, 130],
    }
    temporary = {
        'mast base': [11150, 1175, 0, 200, 150, 6],
        'mast': [11225, 1225, 6, 50, 50, 1094],
        'upper pipe restraint beam': [10800, 1235, 1080, 450, 30, 40],
        'lower receiving beam': [10900, 1210, 210, 350, 30, 40],
        'wall restraint beam': [11250, 1135, 1035, east_face - 11250, 130, 30],
        'retained wall connection domain': [east_face - 15, 1100, 1010, 15, 100, 230],
    }
    stored_parts = {'isolated spool, bridge brackets and packing block': [11150, 1175, 6, 200, 50, 100]}
    pipes = {
        'retained upper water and cap domain': [10775, 1225, 950, 50, 50, upper_axis - 950],
        'retained accessible waste cap domain': [10850, 1250, 0, 50, 50, 125],
    }
    pads = {f'first rest pad {i}': [x - WEST_TRAVEL - 35, y + NORTH_TRAVEL - 35, 0, 70, 70, PAD_HEIGHT]
            for i, (x, y) in enumerate(centres, start=1)}
    # Only the host's own sink and valve-bay reservations are replaced by the
    # explicit released/retained states. All other fixture plans are protected.
    foreign = {key: [box[0], box[1], 0, box[2], box[3], 3500]
               for key, box in fixtures.items() if key not in {'service-utility-sink', 'service-utility-valveBay'}}
    for key, box in house['fixedObstacles']['GROUND']:
        foreign[key] = [box[0], box[1], 0, box[2], box[3], 3500]
    for key in ('stair', 'court'):
        x, y, width, depth = house[key]
        foreign[key] = [x, y, 0, width, depth, 3500]
    foreign['east wall'] = [east_face, 0, 0, 500, 2500, 3500]
    foreign['north wall'] = [9300, north_face, 0, 2700, 194, 3500]

    carrier_states = [[0, 0, 0], [0, 0, -CARRIER_DROP], [CARRIER_TRAVEL, 0, -CARRIER_DROP]]
    frame_states = [[0, 0, 0], [0, 0, CARRY_LIFT], [0, NORTH_TRAVEL, CARRY_LIFT],
                    [-WEST_TRAVEL, NORTH_TRAVEL, CARRY_LIFT], [-WEST_TRAVEL, NORTH_TRAVEL, PAD_HEIGHT]]
    parked_carrier = {label: shifted(box, carrier_states[-1]) for label, box in carrier.items()}
    # The carrier post lands on the receiving beam at z250. That deliberate
    # bearing interface is checked for interpenetration, separately from clearance.
    receiver = temporary['lower receiving beam']
    # The horizontal slide keeps the complete post bottom on the beam.
    sliding_post = sweep(carrier['compact carrier post'], *carrier_states[1:])
    assert sliding_post[2] == receiver[2] + receiver[5]
    assert all(receiver[i] <= sliding_post[i] and sliding_post[i] + sliding_post[i + 3] <= receiver[i] + receiver[i + 3]
               for i in (0, 1))
    post_footprint = carrier['compact carrier post'][3] * carrier['compact carrier post'][4]
    other_temporary = {key: box for key, box in temporary.items() if key != 'lower receiving beam'}
    carrier_foreign = foreign | frame | pipes | pads | stored_parts | other_temporary
    for start, end in zip(carrier_states, carrier_states[1:]):
        assert all(not overlaps_interior(sweep(box, start, end), receiver) for box in carrier.values())
    for start, end in zip(frame_states, frame_states[1:]):
        assert all(not overlaps_interior(sweep(box, start, end), pad) for box in frame.values() for pad in pads.values())
    for index in range(1, 5):
        sole = shifted(frame[f'sole {index}'], frame_states[-1])
        pad = pads[f'first rest pad {index}']
        assert sole[2] == pad[2] + pad[5]
        assert all(sole[i] - pad[i] == 15 and pad[i] + pad[i + 3] - sole[i] - sole[i + 3] == 15 for i in range(2))
    static = foreign | temporary | pipes | parked_carrier | stored_parts
    carrier_check = minimum_sweep(carrier, carrier_states, carrier_foreign)
    frame_check = minimum_sweep(frame, frame_states, static)
    pad_approach = minimum_sweep(frame, frame_states[:-1], pads)
    waste_cap = {key: box for key, box in pipes.items() if key == 'retained accessible waste cap domain'}
    cap_clearance = minimum_sweep(frame, frame_states, waste_cap)
    raised_control = minimum_sweep(frame, [[0, 0, 0], [0, 0, 40]], {'lower receiving beam': receiver})
    assert pad_approach['clearance'] >= 5
    assert cap_clearance['clearance'] >= CLEARANCE
    assert raised_control['clearance'] < CLEARANCE
    pad_check = min((box_gap(pad, obstacle), label, other)
                    for label, pad in pads.items() for other, obstacle in static.items())
    crew_paths = [[[10395, 1725], [10395, 2075], [10195, 2075]],
                  [[11045, 1725], [11045, 2075], [10845, 2075]]]
    crew = crew_checks(crew_paths, frame, static | pads)
    grip_reach = [max(math.dist([x, 1725, 1050], [grip, 1350, 780 + rise]) for rise in (0, CARRY_LIFT))
                  for x, grip in [(10395, 10800), (11045, 11495)]]
    carrier_grip_reach = max(math.dist([11045, 1725, 1000], shifted([10915, 1225, 700], offset)) for offset in carrier_states)
    assert min(carrier_check['clearance'], frame_check['clearance'], pad_check[0]) >= CLEARANCE
    assert min(min(item['stationaryClearance'][0], item['relativeFrameClearance'][0]) for item in crew) >= CLEARANCE
    assert max(*grip_reach, carrier_grip_reach) < 650

    old_target = original['projectDesignTarget']
    old_post = old_target['memberScreens']['post']
    assert old_post['withinComparisonThresholds'] is False
    modulus = old_target['analysisE_MPa']
    horizontal = old_target['loads']['valveHorizontalReaction_N']
    vertical = old_target['loads']['valveVerticalReactionWithinAggregate_N']
    moment = vertical * 175
    post_inertia = 75000
    post_displacement = horizontal * 750**3 / (3 * modulus * post_inertia) + moment * 750**2 / (2 * modulus * post_inertia)
    assert old_post['horizontalDeflection_mm'] > 3 > post_displacement
    # Sum transverse force magnitudes for the conservative corner stress bound.
    mast_length, mast_inertia = 1100, 150000
    mast_couple = math.hypot(100 * 25, 100 * (450 + 350))
    mast_movement = 50 * mast_length**3 / (3 * modulus * mast_inertia) + mast_couple * mast_length**2 / (2 * modulus * mast_inertia)
    assert mast_movement < 3
    mast_corner_stress = (math.sqrt(2) * 50 * mast_length + 100 * (25 + 450 + 350)) * 25 / mast_inertia
    seat_depth, seat_width, edge_distance = 200, 90, 50
    seat_reaction = 2000
    peak_bearing = 2 * seat_reaction / (seat_width * min(seat_depth, 3 * edge_distance))
    assert peak_bearing < 0.30
    seat_plans = [[x - 45, 700 if y == 750 else 1200, seat_width, seat_depth] for x, y in centres]
    waste_access = [10825, 1225, 100, 100]
    access_box = [*waste_access[:2], -80, *waste_access[2:], 65]
    access_gap = min(box_gap(access_box, [*seat[:2], -80, *seat[2:], 65]) for seat in seat_plans)
    assert access_gap == 5
    seat_layers = [('lower mineral bed', -180, 5), ('bare glass F control', -175, 100),
                   ('upper mineral bed', -75, 5), ('steel spreader', -70, 6),
                   ('removable steel pedestal', -64, 43), ('steel cap', -21, 6), ('finish', -15, 15)]
    assert all(bottom + thickness == next_bottom for (_, bottom, thickness), (_, next_bottom, _) in zip(seat_layers, seat_layers[1:]))
    return {
        'status': 'Conditional project comparison through first rest. The complete task awaits fitted services, supports and handling qualification.',
        'scope': 'The lift and the two translations are a local first-rest comparison. The bowl, trap and upper waste release is an entry condition. Final export and return remain open.',
        'sources': sources,
        'originalControl': {'postMovement': old_post['horizontalDeflection_mm'], 'straightNorthContact': original['actualMemberRetirementControl']['firstContacts'][0]},
        'geometry': {'frame': frame, 'carrier': carrier, 'parkedCarrier': parked_carrier, 'temporarySupport': temporary,
                     'retainedPipes': pipes, 'firstRestPads': pads, 'smallPartsReceiverDomain': stored_parts,
                     'retainedPlanContext': {key: foreign[key] for key in ('service-utility-washer', 'service-emitter-utility-E')}},
        'states': {'carrier': carrier_states, 'frame': frame_states, 'crew': crew_paths},
        'checks': {'carrier': carrier_check, 'carrierContinuouslySupportedFootprint_mm2': post_footprint,
                   'frame': frame_check, 'wasteCap': cap_clearance, 'raised40mmControl': raised_control,
                   'crew': crew, 'pads': pad_check, 'padApproach': pad_approach,
                   'maxShoulderToFrameGrip': grip_reach, 'maxShoulderToCarrierGrip': carrier_grip_reach},
        'postComparison': {'section': [40, 40, 3], 'requiredI_mm4': post_inertia, 'movement': post_displacement, 'movementTarget': 3},
        'temporarySupportComparison': {'mastSection': [50, 50, 3], 'requiredI_mm4': mast_inertia,
                                       'upperReactionTarget_N': 100, 'lowerReactionTarget_N': 100, 'horizontalReactionTarget_N': 50,
                                       'movement': mast_movement, 'cornerStressBeforeAxial_MPa': mast_corner_stress,
                                       'wallGroupMomentTarget_kNm': 0.25},
        'floorAndWall': {'seatPlan': seat_plans,
                         'seatLayers': seat_layers, 'verticalReactionTarget_N': seat_reaction, 'peakIdealisedBearing_MPa': peak_bearing,
                         'requiredPermissibleBearing_MPa': 0.30, 'windowRawStartY': 1300,
                         'proposedAnchorAxesYZ': [[1120, 1050], [1180, 1050], [1120, 1200], [1180, 1200]],
                         'wasteAccessTerritory': waste_access, 'wasteAccessToSeatGap': access_gap,
                         'soleContactPressure_MPa': seat_reaction / 40**2,
                         'bareGlassControl': {'product': 'FOAMGLAS F slab', 'url': 'https://www.foamglas.com/en-gb/products/fgbfslabs', 'nominalCS_kPa': 1600}},
        'entryAndCompletionHolds': [
            'Isolate and independently capture the whole top, bowl and upper waste kit on its own receiver before the modelled state. Actual sink assembly, lift and first receiver remain open.',
            'Ordinary washer work retains the host. The revised drain direction uses a supported native siphon branch on the utility sink trap, with its fitted spigot, clamp, hose and access still to earn.',
            'For rare host retirement, restrain and drain the upper water run before removing a visible lower spool. Cap the retained upstream run and release the detachable compact water carrier. Cut tooling, captured offcuts, native caps and actual repair joints remain open.',
            'The retained floor-side waste cap must fit the 125 mm height domain with the access opening clear. Services owns the actual drain, trap and closure join.',
            'Lower the carrier onto the receiving beam from the initial 50 mm packer. Keep its weight supported and guide it to the positive dock before lifting the frame. Actual packer withdrawal, restraints, grip loads, erection and captured handling remain open.',
            'Qualify real worker stance, footwear, reach, grip force, centre of gravity, load sharing, pads and first rest before a physical task. The two declared bodies do not reserve the electrical station for simultaneous work.',
            'Qualify floor bearing and local material stack, wall restraint and its accessible air, water and thermal interfaces, joints and all material residues before adoption.',
        ],
    }


def render(record):
    pieces = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/>']

    def label(x, y, value, size=3.3):
        pieces.append(f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" fill="#20313b">{html.escape(str(value))}</text>')

    def outline(box, x_origin, y_origin, scale, colour, front=False):
        x, y, z, width, depth, height = box
        left = x_origin + (x - 9900) * scale
        top = y_origin - ((z + height) if front else (y + depth - 650)) * scale
        pieces.append(f'<rect x="{left}" y="{top}" width="{width * scale}" height="{(height if front else depth) * scale}" fill="{colour}" fill-opacity=".25" stroke="{colour}" stroke-width=".4"/>')

    geo = record['geometry']
    label(15, 18, 'IAS / Utility host retirement comparison', 5.4)
    label(15, 29, 'Revised section and supported route to first rest. Fitted services, floor/wall and physical handling remain open.')
    label(15, 48, 'PLAN / frame positions and retained receiver', 4)
    for box in geo['retainedPlanContext'].values():
        outline(box, 20, 208, .085, '#934e56')
    for index, state in enumerate(record['states']['frame'][1:-1]):
        for box in geo['frame'].values():
            outline(shifted(box, state), 20, 208, .085, ['#6b8190', '#7190ae', '#256449'][index])
    for box in geo['temporarySupport'].values():
        outline(box, 20, 208, .085, '#9a6133')
    for box in geo['firstRestPads'].values():
        outline(box, 20, 208, .085, '#607339')
    for path in record['states']['crew']:
        points = ' '.join(f'{20 + (x - 9900) * .085},{208 - (y - 650) * .085}' for x, y in path)
        pieces.append(f'<polyline points="{points}" fill="none" stroke="#522b70" stroke-width=".8" stroke-dasharray="2 1"/>')
    label(20, 224, 'Blue and green show the 350 mm north and 200 mm west frame positions.')
    label(20, 233, 'Brown marks the mast. Red marks the washer and radiator. Dashed lines mark crew centres.')
    label(224, 48, 'FRONT / parked carrier and raised frame', 4)
    for box in geo['frame'].values():
        outline(shifted(box, record['states']['frame'][-2]), 226, 209, .096, '#256449', front=True)
    for box in geo['temporarySupport'].values():
        outline(box, 226, 209, .096, '#9a6133', front=True)
    for box in geo['parkedCarrier'].values():
        outline(box, 226, 209, .096, '#285999', front=True)
    label(226, 224, 'The carrier lowers 50 mm and moves 265 mm east onto the receiver.')
    label(226, 233, 'The frame lifts 35 mm, traverses, then lowers 5 mm to its pads.')
    label(15, 254, f"Declared minima: carrier {record['checks']['carrier']['clearance']:.1f} mm, moving frame {record['checks']['frame']['clearance']:.1f} mm.")
    label(15, 264, f"Original post {record['originalControl']['postMovement']:.3f} mm. Revised 40 mm post {record['postComparison']['movement']:.3f} mm in the same comparison.")
    label(15, 274, 'The 40 mm lift leaves only 20 mm at the receiving beam. The 35 mm lift retains 25 mm.')
    label(15, 284, 'Four local gravity seats preserve the floor datum. The separate proposed wall restraint carries uplift.')
    return '\n'.join(pieces + ['</svg>']) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    record = calculate()
    for path, content in ((RECORD, json.dumps(record, indent=2) + '\n'), (SHEET, render(record))):
        if args.check:
            assert path.read_text() == content, f'{path.name}: revised host comparison drift'
        else:
            path.write_text(content)
    print(json.dumps(record['checks'], indent=2))


if __name__ == '__main__':
    main()
