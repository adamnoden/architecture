"""Compare concrete side web around the full radial roof-guide cassette in plan."""
import json
from math import hypot, isclose
from pathlib import Path

STUDIES = Path(__file__).resolve().parent
ARM_LENGTH = 1000.0
ROOF_CENTRE = 6000.0
CORNER_ORIGINS = (
    ('SW', 262.5, 262.5, 1, 1),
    ('SE', 11737.5, 262.5, -1, 1),
    ('NE', 11737.5, 11737.5, -1, -1),
    ('NW', 262.5, 11737.5, 1, -1),
)
GUIDE_STATIONS = (200.0, 475.0, 725.0)
TONGUE_LENGTH = 70.0
TONGUE_THICKNESS = 20.0
TRAVEL_EACH = 10.0
RUNNING_EACH = 2.0
SLIDE_PLATE_EACH = 5.0
CARRIER_CHEEK_EACH = 6.0
SETTING_EACH = 5.0
WEB_COMPARATOR = 25.0
CASSETTE_LENGTH = TONGUE_LENGTH + 2 * (TRAVEL_EACH + RUNNING_EACH)
CASSETTE_WIDTH = TONGUE_THICKNESS + 2 * (RUNNING_EACH + SLIDE_PLATE_EACH + CARRIER_CHEEK_EACH)


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1]


def offset(a, b):
    return (a[0] - b[0], a[1] - b[1])


def edges(points):
    return zip(points, points[1:] + points[:1])


def point_to_segment(point, start, end):
    direction = offset(end, start)
    relative = offset(point, start)
    t = max(0.0, min(1.0, dot(relative, direction) / dot(direction, direction)))
    return hypot(*(relative[i] - t * direction[i] for i in range(2)))


def segment_touches_box(start, end, half_sizes):
    """Clip a finite segment to an axis-aligned rectangle in guide coordinates."""
    enter, leave = 0.0, 1.0
    for a, b, half_size in zip(start, end, half_sizes):
        if a == b:
            if abs(a) > half_size:
                return False
            continue
        first, second = sorted(((-half_size - a) / (b - a), (half_size - a) / (b - a)))
        enter, leave = max(enter, first), min(leave, second)
    return enter <= leave


def web_to_l_boundary(centre, radial, arm, length, width, arm_length=ARM_LENGTH):
    normal = (-radial[1], radial[0])
    half_sizes = (length / 2, width / 2)
    cassette = tuple(
        (centre[0] + a * radial[0] + b * normal[0], centre[1] + a * radial[1] + b * normal[1])
        for a in (-half_sizes[0], half_sizes[0])
        for b in (-half_sizes[1], half_sizes[1])
    )
    if not all(0 <= x <= arm_length and 0 <= y <= arm_length and min(x, y) <= arm
               for x, y in cassette):
        return 0.0

    boundary = ((0, 0), (arm_length, 0), (arm_length, arm),
                (arm, arm), (arm, arm_length), (0, arm_length))
    boundary_in_box = [
        (dot(offset(p, centre), radial), dot(offset(p, centre), normal)) for p in boundary
    ]
    if any(segment_touches_box(a, b, half_sizes) for a, b in edges(boundary_in_box)):
        return 0.0
    corner_gaps = [point_to_segment(p, a, b) for p in cassette for a, b in edges(boundary)]
    boundary_vertex_gaps = [
        hypot(max(abs(x) - half_sizes[0], 0.0), max(abs(y) - half_sizes[1], 0.0))
        for x, y in boundary_in_box
    ]
    return min(corner_gaps + boundary_vertex_gaps)


def assess(arm, across, width, primary_bars, outward=0.0):
    cover_checks, h20_checks, h12_checks = [], [], []
    arm_length = ARM_LENGTH + outward
    bars = [(x + outward, y + outward) for x, y in primary_bars]
    for corner, origin_x, origin_y, sx, sy in CORNER_ORIGINS:
        origin_x -= sx * outward
        origin_y -= sy * outward
        for source_station in GUIDE_STATIONS:
            station = source_station + outward
            for leg, centre in enumerate(((station, across), (across, station))):
                delta = (centre[0] + sx * (origin_x - ROOF_CENTRE),
                         centre[1] + sy * (origin_y - ROOF_CENTRE))
                distance = hypot(*delta)
                radial = (delta[0] / distance, delta[1] / distance)
                normal = (-radial[1], radial[0])
                web = web_to_l_boundary(centre, radial, arm, CASSETTE_LENGTH, width, arm_length)
                cover_checks.append((web, corner, centre))
                for bar in bars:
                    relative = offset(bar, centre)
                    clear = hypot(max(abs(dot(relative, radial)) - CASSETTE_LENGTH / 2, 0.0),
                                  max(abs(dot(relative, normal)) - width / 2, 0.0))
                    h20_checks.append(clear - 10.0 - 2 * SETTING_EACH)
                reach = (abs(radial[leg]) * CASSETTE_LENGTH + abs(normal[leg]) * width) / 2
                for bar_station in (350.0, 600.0):
                    h12_checks.append(abs(source_station - bar_station) - reach - 6.0 - 2 * SETTING_EACH)

    web, corner, centre = min(cover_checks)
    budgeted = web - 2 * SETTING_EACH
    return {
        'armWidthMm': arm, 'cassetteWidthMm': width, 'guideCount': len(cover_checks),
        'minGrossConcreteWebMm': round(web, 6),
        'minConcreteWebAfterSettingsMm': round(budgeted, 6),
        'marginTo25MmScreenMm': round(budgeted - WEB_COMPARATOR, 6),
        'minH20PlanGapAfterSettingsMm': round(min(h20_checks), 6),
        'minH12StationGapAfterSettingsMm': round(min(h12_checks), 6),
        'oneLimitingGuide': {'corner': corner, 'localCentreMm': centre},
    }


def comparison():
    # A point in the joined square clears the internal rectangle seam.
    assert web_to_l_boundary((100, 100), (1, 0), 180, 0, 0) == 100
    # All four cassette corners fit, but its long edge cuts the re-entrant notch.
    axis = (2 ** -0.5, -(2 ** -0.5))
    assert web_to_l_boundary((140, 140), axis, 140, 120, 20) == 0
    # The closest boundary point can be the re-entrant vertex opposite a
    # cassette edge, away from any cassette corner.
    assert isclose(web_to_l_boundary((130, 130), axis, 140, 100, 10),
                   10 * 2 ** 0.5 - 5)
    outer = json.loads((STUDIES / 'current-house-ground-ties.json').read_text())['outer']
    primary_bars = outer['primaryBarXY']
    assert outer['section']['diameter'] == 20 and len(primary_bars) == 12
    base = assess(140.0, 70.0, CASSETTE_WIDTH, primary_bars)
    bare = assess(140.0, 70.0, TONGUE_THICKNESS, primary_bars)
    wider = assess(180.0, 90.0, CASSETTE_WIDTH, primary_bars)
    assert base['marginTo25MmScreenMm'] < 0 and bare['marginTo25MmScreenMm'] < 0
    outward = assess(180.0, 90.0, CASSETTE_WIDTH, primary_bars, outward=40.0)
    assert wider['marginTo25MmScreenMm'] > 0 and outward['marginTo25MmScreenMm'] > 0
    outward['armLengthMm'] = 1040.0
    outward['worldEndStationsRetained'] = True
    return {
        'status': 'adverse comparison; widened alternative limited to plan',
        'referenceStudyCommit': '7a1b697431e9c1556f426068068b96356d3158ca',
        'cassettePlanLengthMm': CASSETTE_LENGTH,
        'provisionalWebScreenMm': WEB_COMPARATOR,
        'independentSettingsMm': [SETTING_EACH, SETTING_EACH],
        'base140MmArm': base,
        'bareTongueWidthLowerBound140MmArm': bare,
        'unselected180MmArm': wider,
        'unselectedOutward180MmArm': outward,
    }


if __name__ == '__main__':
    print(json.dumps(comparison(), indent=2))
