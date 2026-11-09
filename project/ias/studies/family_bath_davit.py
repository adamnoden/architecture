"""Bridge actions and vertical clearance for a temporary upright bath exchange. SI loads, mm plans."""
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent


def read(name):
    return json.loads((HERE / name).read_text())


def beam_study():
    house = read('../../had/studies/water-replan.json')['model']
    bath = read('family-bath-exchange.json')
    bridge = read('../../str/studies/whole-house-reaction-join.json')['entrance_bridge']
    heads = {p['id']: p['xy'] for p in read('../../str/studies/current-house-grid.json')['heads']}
    xmin, xmax = 4785, 7215
    south, north = 2920, 3630
    mast = (4635, south)
    radius = 1200
    frame = [(xmin, south), (xmax, south), (xmin, north), (xmax, north)]
    ids = ['P49', 'P52', 'P38', 'P40']
    source_endpoints = [p['xy'] for p in bridge['seats']]
    edges = sorted(set(y for x, y in source_endpoints))
    assert source_endpoints == [[xmin, 2650], [xmin, 3917.5], [xmax, 2650], [xmax, 3917.5]]
    assert [heads[i] for i in ids] == [[4800, 2650], [7200, 2650], [4785, 3917.5], [7215, 3917.5]]
    assert bath['package'] == [480, 730, 1690] and house['void'] == [4885, 417.5, 2230, 2317.5]
    assert house['sections']['firstFFL'] == 3450
    guards = dict(house['stairGuard']['firstFloorGuards'])
    assert guards['entry-void-north'] == [4885, 2735, 2230, 50]

    def forces(angle, payload, factor):
        # Explicit determinate comparison: two EW crosspieces; supported by two NS side members.
        # A stiff continuous plate requires its actual stiffness model in place of these shares.
        ux, uy = math.cos(angle), math.sin(angle)
        loads = [(x, y, .00981 * 50) for x, y in frame]  # 200 kg frame, temporary deck and covers; verify actual distributed and assembly loads
        for offset, kg, amp in [(radius, payload, factor), (700, 13, 1), (0, 28, 1), (-350, 19, 1)]:
            loads.append((mast[0] + ux * offset, mast[1] + uy * offset, .00981 * kg * amp))
        reactions = [0.] * 4
        for x, y, force in loads:
            a, b = (x - xmin) / (xmax - xmin), (y - south) / (north - south)
            for i, share in enumerate(((1-a)*(1-b), a*(1-b), (1-a)*b, a*b)):
                reactions[i] += share * force
        for axis in (0, 1):
            assert abs(sum(f * p[axis] for f, p in zip(reactions, frame)) -
                       sum(load[axis] * load[2] for load in loads)) < 1e-7
        assert abs(sum(reactions) - sum(load[2] for load in loads)) < 1e-9
        ends = [0.] * 4
        for i, (r, (_, y)) in enumerate(zip(reactions, frame)):
            north_share = (y - edges[0]) / (edges[1] - edges[0])
            ends[i % 2] += r * (1-north_share)
            ends[2 + i % 2] += r * north_share
        return reactions, ends

    def envelope(kg, factor, low, high):
        # Continuous conservative error around the angular samples. Bilinear interpolation
        # contains terms in sin, cos, and sin*cos. Bound their derivative before extrema.
        step = math.radians(.25)
        count = max(1, math.ceil((high-low) / step))
        rows = [forces(low + (high-low)*i/count, kg, factor) for i in range(count+1)]
        rate = 0.
        for off, mass in [(radius, kg*factor), (700, 13), (-350, 19)]:
            u = abs(off)/(xmax-xmin)
            v = abs(off)/(north-south)
            rate += .00981*mass*(u*(1+v) + v*(1+abs(mast[0]-xmin)/(xmax-xmin)+u))
        d = rate*(high-low)/(2*count)
        def ranges(group, name, err):
            return {key: [round(min(row[group][i] for row in rows)-err, 3),
                          round(max(row[group][i] for row in rows)+err, 3)]
                    for i, key in enumerate(name)}
        return {'holdDown_kN': ranges(0, ['SW','SE','NW','NE'], d),
                'existingSeatAdditional_kN': ranges(1, ids, 2*d)}

    start = math.asin((3250-south)/radius)
    end = math.asin((2000-south)/radius)
    roof_limit = house['protectedRoofClosureDomains']['bottom'] - house['sections']['firstFFL']
    support = bath['support']
    shell_kg = support['bathKg'] + support['tareBudget']
    pack_height = bath['package'][2]
    pick_bottom, flying_bottom = 300, 340
    top = flying_bottom + pack_height
    eye = 350 + 1935
    terminal = 225  # inclusive proposed yoke, connector, live rope and manufacturer upper limit allowance
    upright = {
        'radiusAt75PercentWLL': radius, 'mast': list(mast), 'pinAHeightAboveSocket': 1935,
        'floorDatum': house['sections']['firstFFL'], 'roofComparisonAboveFloor': roof_limit,
        'minimumDeckTop': 200, 'loadedDollyTop': pick_bottom, 'floatingShellBottom': flying_bottom,
        'cradleTop': top, 'heightOfLiftIfSocketDatum350': eye, 'connectorAndUpperStopAllowance': terminal,
        'hookBudgetRemainder': eye-top-terminal, 'ordinaryGuardComparison': 1100,
        'deficitAboveIntactGuardWith60Clearance': 1100+60+pack_height+terminal-eye,
        'requiredInstalledMaximumHeightWith100RoofReserve': roof_limit-100,
        'oneWayLowerTo100Dolly': house['sections']['firstFFL']+flying_bottom-100,
        'approachEast': [[8780,3290], [8000,3250], [6400,3250]],
        'levelLiftTable': [7340,2820,940,880], 'deckLift': 200, 'crankForceFirstLayerN': 150,
        'rope': {'length_m': 15, 'ratedFirstLastLayer_kg': [500,430],
                 'winch_kg': 14, 'bracketAllowance_kg': 5, 'column_kg': 28, 'beam_kg': 13},
        'transportMass_kg': shell_kg, 'spreaderAndLooseGearAllowance_kg': 14,
        'pressureBrake': {'minimumSuspended_kg': 70, 'bareCrateMargin_kg': shell_kg-70,
                          'fullySuspendedMargin_kg': shell_kg+14-70,
                          'supportShareForBrakeThreshold_N': (shell_kg+14-70)*9.81,
                          'emptyCradleBelowMinimum_kg': 70-support['tareBudget']},

        'frameMassAllowance_kg': 200, 'mastWestOffsetFromBeam': xmin-mast[0],
        'basis': 'Temporary structural, restraint and height envelopes for purchasing. No proof of the rated socket, host, classification, fitted winch or site.'}
    # A witnessed horizontal-turn pose, clipped where its shadow reaches the open void.
    angle = math.radians(72)
    x, y = 5978.437097257535, 2794.668859059259
    shape = [(x+a*math.cos(angle)-b*math.sin(angle), y+a*math.sin(angle)+b*math.cos(angle))
             for a, b in [(-845,-365),(845,-365),(845,365),(-845,365)]]
    cut = house['void'][1]+house['void'][3]
    hits = [x for x,y in shape if y <= cut]
    for (x1,y1), (x2,y2) in zip(shape, shape[1:]+shape[:1]):
        if (y1-cut)*(y2-cut) < 0:
            hits.append(x1+(x2-x1)*(cut-y1)/(y2-y1))
    upright['comparisonFlatPack'] = {'centre': [x,y], 'yawDeg': 72, 'eastShadow': max(hits),
                                    'widthBeforeBarrier': 7101.5-max(hits)}
    assert round(max(hits), 1) == 6342.8
    assert upright['hookBudgetRemainder'] == 30 and roof_limit == 2994
    full_moment = 500*.00981*1.2*1.5
    return {'upper': upright, 'seats': {'frameXY': frame, 'existingBridgeULSPerSeat_kN':
            bridge['seats'][0]['vertical_ULS_kN'], 'heads': {i: heads[i] for i in ids}},
            'additionAt85kgOperatingArc': envelope(shell_kg+14, 1.5, end, start),
            'additionAt500kgAllDirections': envelope(500, 1.5, -math.pi, math.pi),
            'markedLoadAloneAt1_5': {'moment_kNm': full_moment, 'rowCouple710_kN': full_moment/.71,
                'local200mmBoltRow_kN': full_moment/.20, 'staticCounterweightAt710_kg': 500*1.2/.71}}


if __name__ == '__main__':
    print(json.dumps(beam_study(), indent=2))
