"""Physical geometry of a local radial thickening at the inner arch's near spring."""
import json
import math
from itertools import pairwise
from pathlib import Path

HERE = Path(__file__).resolve().parent


def extra_depth(station, addition):
    """Station 0 is the near spring; the 18 equal-angle intervals end at the far spring."""
    u = min(1.0, max(0.0, (station - 1) / 3))
    return addition * (1 - u) ** 2 * (1 + 2 * u)


def detailing():
    read = lambda name: json.loads((HERE / (name + '.json')).read_text())
    model = json.loads((HERE.parents[1] / 'had/studies/water-replan.json').read_text())['model']
    op = next(o for o in model['openings']['FIRST'] if o['wall'] == 'outer-south' and o['centre'] == 1800)
    rise, half = op['head'] - op['spring'], op['width'] / 2
    r = (half**2 + rise**2) / (2 * rise)
    cx, cz = op['centre'], model['sections']['firstFFL'] + op['head'] - r
    half_angle = math.asin(half / r)
    near = read('current-house-central-arch-detail')
    count = near['stationCount'] - 1
    step = 2 * half_angle / count
    detail = read('current-house-arch-detail')['archBars']
    guard = read('current-house-window-receivers')['guard']['proposedContact']
    width = next(c for c in read('current-house-outward-arch-geometry')['controls'] if c['normalWidthNominal'] == 180)
    nominal = read('current-house-coupled-arches')['geometry']
    narrow_width, arch_depth = nominal['arch']
    wide_width = width['normalWidthNominal']
    ro = r + arch_depth
    pier_top = detail['localToe']['z'][1]
    pier_x = detail['localToe']['newX']
    assert count == 18 and arch_depth == 215

    def volumes(n):
        totals = [0.0] * 6  # gross, broad pier, narrow pier, spandrel, intersection, union
        ds = 4 / n
        for k in range(n):
            station = (k + .5) * ds
            phi = -half_angle + station * step
            si, co = math.sin(phi), math.cos(phi)
            outer = ro + extra_depth(station, 45)
            # Every X/Z boundary of the two L-arm levels and the nominal
            # spandrel tributary lies on one of these rays' radial cuts.
            cuts = [ro, outer]
            for boundary in (pier_x, detail['localToe']['oldX'], nominal['leftSpringX']):
                radius = (boundary - cx) / si
                if ro < radius < outer:
                    cuts.append(radius)
            radius = (pier_top - cz) / co
            if ro < radius < outer:
                cuts.append(radius)
            for lo, hi in pairwise(sorted(cuts)):
                mid = (lo + hi) / 2
                x, z = cx + mid * si, cz + mid * co
                assert z > detail['localToe']['z'][0] and x > guard['outsideInnerCoreFaces'][0]
                broad = wide_width if z < pier_top and x < pier_x else 0
                narrow = narrow_width if z >= pier_top and x < detail['localToe']['oldX'] else 0
                pier = broad + narrow
                span = wide_width if x >= nominal['leftSpringX'] else 0
                sector = (hi**2 - lo**2) / 2 * ds * step / 1e9
                for i, thickness in enumerate((wide_width, broad, narrow, span, min(pier, span), max(pier, span))):
                    totals[i] += sector * thickness
        return totals

    total = volumes(4096)
    assert max(abs(a - b) for a, b in zip(total, volumes(2048))) < 2e-9
    gross, broad, narrow, span, shared, union = total
    assert math.isclose(broad + narrow + span - shared, union)
    origin = guard['outsideInnerCoreFaces'][0]
    h20 = origin + max(near['inPlaneCage']['stationPairAfter'])
    tail = min(detail['legs'], key=lambda leg: leg['startVertical'][0])
    diam_sum = detail['diameter'] + detail['upperLComparedOnPreviousBiaxialDomain']['diameter']
    # The two relevant Y lanes differ by 6 mm. On the declared error cards
    # that gap may close entirely. This is a vertical-leg check at overlap.
    y_gap = min(abs(y - 97) for y in width['normalH16Centres'])
    losses = (near['inPlaneCage']['relativeXYAllowanceMm'], 30)
    assert y_gap < min(losses)
    rows = []
    for addition in (0, 45, 60, 75):
        x = tail['startVertical'][0] - addition * math.sin(half_angle)
        z = tail['endVertical'][1] + addition * math.cos(half_angle)
        assert z > detail['transitionGlobalZ'][1] and z < min(guard['centreGlobalZ'])
        rows.append({'radialAddition_mm': addition, 'extradosLegX_mm': x, 'legTipZ_mm': z,
                     'clearAfter15_mm': x - h20 - losses[0] - diam_sum / 2,
                     'clearAfter30_mm': x - h20 - losses[1] - diam_sum / 2})
    assert rows[1]['clearAfter30_mm'] > 25 > rows[-1]['clearAfter15_mm']
    assert rows[2]['clearAfter30_mm'] < 25
    return {
        'insideRadius_mm': r, 'existingDepth_mm': arch_depth, 'normalWidth_mm': width['normalWidthNominal'],
        'centreXZ_mm': [cx, cz], 'halfAngle_rad': half_angle, 'stationCount': count + 1,
        'addition_mm': 45, 'plateauEndStation': 1, 'taperEndStation': 4,
        'nearPierRightX_mm': pier_x, 'upperPierBandZ_mm': detail['localToe']['z'],
        'narrowPierRightX_mm': detail['localToe']['oldX'], 'spandrelStartX_mm': nominal['leftSpringX'],
        'grossWedgePerWindow_m3': gross, 'grossWedgeAcrossEight_m3': 8 * gross,
        'perWindow_m3': {'widenedPier': broad, 'narrowPier': narrow, 'nominalSpandrelTerritory': span,
                         'pierAndSpandrel': shared, 'union': union, 'outsideTheseDomains': gross - union},
        'fractionWithinWidenedBand': broad / gross, 'fractionWithinPier': (broad + narrow) / gross,
        'extradosMovingWithFace': rows,
        'retainedCage': 'Original four H16 paths, returns and closed H6 cell. Added concrete alone supplies no additional torsion-cell area.',
        'alternativeCage': 'Move the extrados pair and its return with the new face. Tabulated clearances apply only where the vertical H16 and upper H20 legs overlap.',
    }
