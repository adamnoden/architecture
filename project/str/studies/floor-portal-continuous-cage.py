"""Tracked H20 feed through three fixed confinement loops on a common jig."""
import hashlib
import json
from itertools import combinations
from math import cos, sqrt
from pathlib import Path
from runpy import run_path

import numpy as np

STUDIES = Path(__file__).resolve().parent
INSERTION = STUDIES / 'floor-portal-hoop-insertion.py'
GEOMETRY = run_path(str(INSERTION))
DETAIL = GEOMETRY['DETAIL']
DETAIL_RECEIPT = GEOMETRY['RECEIPT']
SEAT = GEOMETRY['SEAT']
HOOP_RADIUS = GEOMETRY['HOOP_RADIUS']
BAR_RADIUS = SEAT['BAR_DIAMETER'] / 2
PLAN_ERROR = 5.0
HEIGHT_ERROR = 5.0
STROKE = 420.0
STEP = 1.0
PIVOT = 6355.0


def stations(first, last):
    return np.arange(first, last + STEP / 2, STEP)


def progress(z):
    fraction = np.clip((z - SEAT['BEND_BOTTOM']) / (SEAT['BEND_TOP'] - SEAT['BEND_BOTTOM']), 0, 1)
    return fraction**2 * (3 - 2 * fraction)


def slope_bound(delta):
    return 1.5 * np.linalg.norm(delta) / (SEAT['BEND_TOP'] - SEAT['BEND_BOTTOM'])


def tracking_progress(travel):
    return progress(PIVOT) - progress(PIVOT - travel)


def hoop_gaps(loop, originals, shifts, travel):
    chords = loop['centrelineSegmentsFromCoreOriginMm'] + [
        segment for arc in loop['centrelineArcsFromCoreOriginMm']
        for segment in GEOMETRY['chord_segments'](arc)
    ]
    starts, ends = np.asarray(chords).transpose(1, 0, 2)
    sagitta = max(a[1] for a in loop['centrelineArcsFromCoreOriginMm']) * (
        1 - cos(GEOMETRY['ANGLE_STEP'] / 2))
    output = {}
    for setting in (HEIGHT_ERROR, 2 * HEIGHT_ERROR):
        heights = np.asarray(loop['levelsMm'])[:, None] + stations(-setting, setting)
        lift = travel[:, None, None]
        lower = float('inf')
        straight_witness = float('inf')
        for index, (old, delta) in enumerate(zip(originals, shifts)):
            fraction = progress(heights - lift)
            tracked = old + (fraction + tracking_progress(lift))[..., None] * delta
            nominal = old + fraction[..., None] * delta
            distances = GEOMETRY['point_segment_distances']
            distance = min(distances(chunk, starts, ends).min() for chunk in np.array_split(
                tracked.reshape(-1, 2), 1 + tracked.size // 12000))
            # Translation derivative is the difference of two nonnegative cubic derivatives.
            # Same-height cross sections bound the full bar/hoop distance via the bar slope.
            slope = slope_bound(delta)
            allowance = sagitta + slope * STEP
            clearance = (distance - allowance) / sqrt(1 + slope**2) - BAR_RADIUS - HOOP_RADIUS - setting
            if clearance < lower:
                lower, bar = float(clearance), index
            control = min(distances(chunk, starts, ends).min() for chunk in np.array_split(
                nominal.reshape(-1, 2), 1 + nominal.size // 12000))
            # Adverse witness at an actual sample, using the arc error in the opposite direction.
            straight_witness = min(straight_witness, control + sagitta - BAR_RADIUS - HOOP_RADIUS - setting)
        output[str(int(setting))] = {
            'trackedClearanceLowerBoundMm': lower,
            'trackedLimitingH20': bar,
            'straightClearanceWitnessUpperBoundMm': float(straight_witness),
        }
    return output


def vertical_bar_gaps(receipt, originals, shifts, travel):
    # Extending endpoints vertically is conservative for every bar of the same profile.
    # The transition and a relative height offset can only be active within this band.
    heights = stations(SEAT['BEND_BOTTOM'] - HEIGHT_ERROR,
                       SEAT['BEND_TOP'] + STROKE + HEIGHT_ERROR)
    current_fraction = progress(heights[None, :] - travel[:, None]) + tracking_progress(travel[:, None])
    slopes = [slope_bound(delta) for delta in shifts]
    h20, h12 = float('inf'), float('inf')
    secondary = GEOMETRY['bar_paths'](receipt)[len(originals):]
    secondary = [(name, radius, slope, np.asarray([path(z) for z in heights]))
                 for name, radius, slope, path in secondary]
    for moving, (old, delta) in enumerate(zip(originals, shifts)):
        moving_centres = old + current_fraction[..., None] * delta
        for fixed in range(moving):
            fixed_centres = originals[fixed] + progress(heights)[:, None] * shifts[fixed]
            distance = np.linalg.norm(moving_centres - fixed_centres, axis=2).min()
            moving_slope, fixed_slope = slopes[moving], slopes[fixed]
            allowance = (2 * moving_slope + fixed_slope) * STEP / 2 + fixed_slope * HEIGHT_ERROR
            clearance = (distance - allowance) / sqrt(1 + min(moving_slope, fixed_slope)**2)
            clearance -= 2 * BAR_RADIUS + PLAN_ERROR
            if clearance < h20:
                h20, pair = float(clearance), [moving, fixed]
        for name, radius, slope, fixed_centres in secondary:
            distance = np.linalg.norm(moving_centres - fixed_centres, axis=2).min()
            moving_slope = slopes[moving]
            allowance = (2 * moving_slope + slope) * STEP / 2 + slope * HEIGHT_ERROR
            clearance = (distance - allowance) / sqrt(1 + min(moving_slope, slope)**2)
            clearance -= BAR_RADIUS + radius + PLAN_ERROR
            if clearance < h12:
                h12, witness = float(clearance), [moving, name]
    return {'H20PairLowerBoundMm': h20, 'H20Pair': pair,
            'trialH12LowerBoundMm': h12, 'trialH12Pair': witness}


def top_coupons(receipt, originals, shifts):
    # CXL20W and an axisymmetric, independently turnable carrier must stay
    # outside the hoop feed. The carrier is an envelope, with no seat capacity assigned.
    radius = SEAT['COUPLER_DIAMETER'] / 2 + SEAT['WELD_TOE_RESERVE']
    height = SEAT['COUPLER_HEIGHT']
    seated_bottom = SEAT['CAP_Z'] - height
    travel = stations(0, height + HEIGHT_ERROR)
    final_centres = originals + shifts
    moving = final_centres + tracking_progress(travel)[:, None, None] * shifts[None, :, :]
    gap, adjacent = float('inf'), None
    shaft_gap = float('inf')
    full_travel = stations(0, STROKE)
    fixed_height = stations(seated_bottom - HEIGHT_ERROR, SEAT['CAP_Z'] + HEIGHT_ERROR)
    shaft_fractions = progress(fixed_height[None, :] - full_travel[:, None])
    shaft_fractions += tracking_progress(full_travel[:, None])
    tool_radius = float('inf')
    for fixed, incoming in combinations(range(len(originals)), 2):
        distance = np.linalg.norm(moving[:, incoming] - final_centres[fixed], axis=1).min()
        distance -= slope_bound(shifts[incoming]) * STEP / 2 + PLAN_ERROR
        if distance - 2 * radius < gap:
            gap, adjacent = float(distance - 2 * radius), [incoming, fixed]
        seated = np.linalg.norm(final_centres[incoming] - final_centres[fixed]) - PLAN_ERROR
        tool_radius = min(tool_radius, seated - radius)
        shaft = originals[incoming] + shaft_fractions[..., None] * shifts[incoming]
        distance = np.linalg.norm(shaft - final_centres[fixed], axis=2).min()
        slope = slope_bound(shifts[incoming])
        distance = (distance - slope * STEP) / sqrt(1 + slope**2)
        shaft_gap = min(shaft_gap, distance - PLAN_ERROR - radius - BAR_RADIUS)
    # Lowest moving collar is seated. The fixed cassette is absent throughout shop feed.
    to_hoop = seated_bottom - max(receipt['roundedH8LinkScreen']['levelsMm']) - HOOP_RADIUS - HEIGHT_ERROR
    return {
        'fittingEnvelopeDiameterMm': 2 * radius,
        'fittingLengthMm': height,
        'seatedFittingBottomZmm': seated_bottom,
        'minimumVerticalGapAboveHighestHoopDuringFeedMm': to_hoop,
        'adjacentMovingAndInstalledFittingsLowerBoundMm': gap,
        'limitingFittingPair': adjacent,
        'movingShaftAgainstInstalledFittingLowerBoundMm': float(shaft_gap),
        'maxSeatedRoundToolRadiusBeforeOtherFittingMm': float(tool_radius),
    }


def compare():
    receipt = json.loads(DETAIL_RECEIPT.read_text())
    originals = np.asarray(receipt['originalPositionsMm'])
    shifts = np.asarray(receipt['trialPositionsMm']) - originals
    travel = stations(0, STROKE)
    loop = receipt['roundedH8LinkScreen']
    hoops = hoop_gaps(loop, originals, shifts, travel)
    vertical = vertical_bar_gaps(receipt, originals, shifts, travel)
    fittings = top_coupons(receipt, originals, shifts)
    assert hoops['5']['trackedClearanceLowerBoundMm'] > 0 > hoops['5']['straightClearanceWitnessUpperBoundMm']
    assert hoops['10']['trackedClearanceLowerBoundMm'] < 0
    assert min(vertical['H20PairLowerBoundMm'], vertical['trialH12LowerBoundMm']) > 0
    assert fittings['adjacentMovingAndInstalledFittingsLowerBoundMm'] > 0
    assert fittings['movingShaftAgainstInstalledFittingLowerBoundMm'] > 0
    return {
        'sourceSha256': {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                         for path in (INSERTION, DETAIL, DETAIL_RECEIPT)},
        'inputs': {
            'strokeMm': STROKE,
            'trackingPivotZmm': PIVOT,
            'sampleStepMm': STEP,
            'sharedRelativePlanAndHeightErrorMm': [PLAN_ERROR, HEIGHT_ERROR],
            'insertionOrderZeroBasedH20': list(range(len(originals))),
            'hoopLevelsMm': loop['levelsMm'],
            'fittingTopAtStartZmmBeforeToolAndLiftingMm': SEAT['CAP_Z'] + STROKE,
            'leadingEndAtSeatingMustReachAtOrBelowZmm': min(loop['levelsMm']) - STROKE - HEIGHT_ERROR,
            'maximumPlanTranslationMm': float((np.linalg.norm(shifts, axis=1) * tracking_progress(STROKE)).max()),
            'relativeDatumAllocationPerPiecePlanAndHeightMm': [PLAN_ERROR / 2, HEIGHT_ERROR / 2],
            'seatedFittingTopBelowRoofSoffitMm': receipt['steelSoffitZmm'] - SEAT['CAP_Z'],
        },
        'hoopFeedByRelativePlanAndHeightErrorMm': hoops,
        'installedVerticalBarScreens': vertical,
        'independentTopFittingEnvelope': fittings,
        'retainedSignedModelPeakSingleAnchorTensionKN': (
            receipt['signed']['capTransition']['peakLAnchorTension']['tensionN'] / 1000),
    }


if __name__ == '__main__':
    print(json.dumps(compare(), indent=2))
