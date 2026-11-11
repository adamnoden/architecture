"""Finite geometry and section screens for the floor/portal correction.

This is a successor comparison, never an edit to SAP-C1.  A successful local
screen does not admit the house: the coupled actions, joint shear/anchorage,
corners and assembly must also be earned.  Coordinates are mm, q increases
inward from the weather face, Z is the common house datum.
"""
from pathlib import Path
from itertools import combinations
import hashlib
import json
import math
import sys

D = Path(__file__).resolve().parent
ROOT = D.parents[2]
READ = lambda name: json.loads((D / name).read_text())
FCD, FYD, AGGREGATE, SETTING = .85 * 30 / 1.5, 500 / 1.15, 16., 5.
MIN_PARALLEL = max(AGGREGATE + 5, 20.)
BASE, AXIS = 3170., 332.5
SOURCES = [
    'project/str/studies/reconciled-house-interface.json',
    'project/str/studies/reconciled-corner-portals.py',
    'project/str/studies/current-house-floor-closure.py',
    'project/str/studies/current-house-floor-stops.json',
    'project/str/studies/current-house-welded-network.json',
    'project/str/studies/house-corner-rewind.json',
]


def bar(q, z, diameter, role):
    return {'q': q, 'z': z, 'diameter': diameter, 'role': role}


def cage(kind='outer', local=False):
    """A trial with usable slab-bar rows; no implied source adoption."""
    height, rows = (750., 3) if kind == 'outer' else (650., 2)
    q16 = [313.5, 419.5] if local else [303.5, 361.5]
    q12 = [311.5, 421.5] if local else [301.5, 363.5]
    bars = []
    for side in ('bottom', 'top'):
        for row in range(rows):
            z = BASE + 61 + 75 * row
            if side == 'top':
                z = BASE + height - 61 - 75 * row
            bars.extend(bar(q, z, 16., side) for q in q16)
    centre = BASE + height / 2
    for row in range(4):
        bars.extend(bar(q, centre + (row - 1.5) * 55, 12., 'plan') for q in q12)
    return {'kind': kind, 'height': height,
            'concreteQ': [252.5, 472.5] if local else [252.5, 412.5],
            'bars': bars, 'linksDiameter': 10. if local else 8.,
            'linksPitch': 50. if local else 100.}


def section_screen(c):
    """Conservative singly-reinforced rectangular screen, no slab flange.

    Both actual faces are present but compression steel is deliberately not
    borrowed in this preliminary screen. Full N/My/Mz interaction is separate.
    """
    face = [b for b in c['bars'] if b['role'] == 'bottom']
    area = sum(math.pi * b['diameter'] ** 2 / 4 for b in face)
    bottom_centre = sum(b['z'] * math.pi * b['diameter'] ** 2 / 4 for b in face) / area
    width = c['concreteQ'][1] - c['concreteQ'][0]
    # Five mm loss at each concrete face and a five mm inward bar displacement.
    b = width - 10
    d = BASE + c['height'] - SETTING - bottom_centre - SETTING
    x = area * FYD / (.8 * b * FCD)
    moment = area * FYD * (d - .4 * x) / 1e6
    z = .9 * d
    links = 2 * math.pi * c['linksDiameter'] ** 2 / 4 / c['linksPitch'] * z * FYD * 1.5 / 1000
    strut = b * z * .6 * (1 - 30 / 250) * FCD / (1.5 + 1 / 1.5) / 1000
    return {'bAdverseMM': b, 'dAdverseMM': d, 'tensionAreaMM2': area,
            'xOverD': x / d, 'MRdKNm': moment,
            'VRdKN': min(links, strut), 'linkVRdKN': links, 'strutVRdKN': strut,
            'scope': 'Zero axial force; preliminary section screen only.'}


def parallel_clearance(c):
    # All listed bars run along the collector, so this is a parallel-bar test.
    rows = []
    for a, b in combinations(c['bars'], 2):
        clear = math.hypot(a['q'] - b['q'], a['z'] - b['z']) - (a['diameter'] + b['diameter']) / 2
        rows.append((clear - 2 * SETTING, a, b))
    minimum, a, b = min(rows, key=lambda r: r[0])
    return {'minimumAfterTwo5MM': minimum, 'requiredFor16AggregateMM': MIN_PARALLEL,
            'criticalBars': [a, b]}


def local_crossings(c):
    # Continuous vertical jamb bars cannot be cleared by shifting beam-bar Z.
    jamb_q = READ('reconciled-house-interface.json')['jambAndTies']['continuousJambH12Q']
    rows = [(abs(b['q'] - q) - b['diameter'] / 2 - 6 - 2 * SETTING, b, q)
            for b in c['bars'] for q in jamb_q]
    value, b, q = min(rows, key=lambda r: r[0])
    return {'minimumOrthogonalMainBarClearAfterTwo5MM': value,
            'criticalBeamBar': b, 'criticalJambQ': q,
            'scope': 'Physical main-bar crossing; links and assembly separately checked. '
                     'The parallel-bar spacing rule is not re-labelled as a rule for every orthogonal crossing.'}


def slab_and_studs(c):
    # The transverse slab bars cross the beam bars orthogonally. Their actual
    # Z, diameter and independent setting budgets matter; nominal voids do not.
    slab_z = [3201., 3339.]  # RC200, nominal25 cover plus H12 radius.
    minimum = min(abs(b['z'] - z) - (b['diameter'] + 12) / 2 - 2 * SETTING
                  for b in c['bars'] for z in slab_z)
    stud = min(abs(b['q'] - AXIS) - b['diameter'] / 2 - 8 - 2 * SETTING for b in c['bars'])
    return {'slabTransverseH12Z': slab_z,
            'slabToLongitudinalBarClearAfterTwo5MM': minimum,
            'ordinaryStud': {'diameterMM': 16, 'alongStationsMM': [-50, 50], 'qMM': AXIS,
                            'minimumOrthogonalClearAfterTwo5MM': stud,
                            'source': 'current-house-floor-closure.py ordinaryPositiveRodDetail',
                            'M24PassesThroughConcrete': False},
            'scope': 'Two existing M16 studs and crossbars at14 ordinary stations. '
                     'Eight corner assemblies are not inferred from this screen.'}


def placement_path(c):
    """A declared open vertical feed path, not a concrete casting trial.

    Before fitting the removable upper crossbar, x=23/q332.5 avoids the
    M16 stud at nominal x50 and the closed hoop at x0.  Independent +/-5 mm
    positional bounds are applied to those obstacles. The clearance is radius
    to steel, so a grain/probe diameter must use twice that result.
    """
    x, q = 23., AXIS
    main = min(abs(b['q'] - q) - SETTING - b['diameter'] / 2 for b in c['bars'])
    stud = min(abs(x - s) - SETTING - 8 for s in (-50., 50.))
    hoop = min(abs(x - s) - SETTING - c['linksDiameter'] / 2 for s in (-100., 0., 100.))
    diameter = 2 * min(main, stud, hoop)
    return {'alongMM': x, 'qMM': q, 'lowerBoundFreeDiameterMM': diameter,
            'aggregateDiameterMM': AGGREGATE, 'aggregatePlus5MM': AGGREGATE + 5,
            'sequence': 'Top crossbar fitted after concrete placement; permanent stud feet and cage already present.',
            'scope': 'One connected vertical access path through the ordinary cage; '
                     'does not certify compaction, link bends or the local jamb/corner cage.'}


def s_bend(offset, span=500., diameter=16., count=1):
    # Two equal opposite circular bends have horizontal end tangents.
    # offset=2R(1-cos theta), span=2R sin theta.
    radius = (span * span + offset * offset) / (4 * offset)
    theta = 2 * math.atan(offset / span)
    full_force = count * math.pi * diameter ** 2 / 4 * FYD / 1000
    normal = full_force * math.sin(theta)
    # EC2 8.3 concrete-inside-bend screen. a_b is conservatively half the
    # smallest75 mm face-bar centre spacing, limited by35 mm cover.
    ab = min(75 / 2, 35.)
    required_mandrel = (full_force / count * 1000 / FCD) * (1 / ab + 1 / (2 * diameter))
    return {'offsetMM': offset, 'spanMM': span, 'centrelineRadiusMM': radius,
            'angleDegrees': math.degrees(theta), 'arcLengthMM': 2 * radius * theta,
            'barCount': count, 'diameterMM': diameter, 'fullYieldAxialKN': full_force,
            'maximumNormalResultantKN': normal,
            'insideBendMandrelDiameterScreenMM': required_mandrel,
            'providedInsideMandrelDiameterMM': 2 * radius - diameter}


def source_controls():
    j = READ('reconciled-house-interface.json')['jambAndTies']
    section = READ('current-house-welded-network.json')['sections']['collector']
    b, h, t = section['B'], section['H'], section['t']
    assert (b, h, t) == (220, 120, 20)
    jq0, jq1 = j['portalCoreQ']; along = j['widthNormalAlong'][1]
    box_q = [AXIS - b / 2, AXIS + b / 2]
    z0, z1 = 6600 - h / 2, 6600 + h / 2
    overlap = lambda a,b,c,d: max(0., min(b,d) - max(a,c))
    gross = overlap(jq0,jq1,*box_q) * overlap(-180,6600,z0,z1) * along
    void = overlap(jq0,jq1,box_q[0]+t,box_q[1]-t) * overlap(-180,6600,z0+t,z1-t) * along
    floor_volume = 16 * 205 * 140 * 750 / 1e9
    return {'retainedFloorIntersectionM3': floor_volume,
            'retainedRoofSteelIntersectionPerJambM3': (gross - void) / 1e9,
            'retainedRoofSteelIntersectionAll16M3': 16 * (gross - void) / 1e9,
            'retainedRoofVoidHeightMM': h - 2 * t,
            'oldRequiredVerticalGuideClearHeightMM': 20 + 2 * 35,
            'upperSpandrelToRoofSoffitGapMM': z0 - 6540,
            'negativeControl': 'The old floor and roof free-movement propositions are physically incompatible with these solids.'}


def calculate():
    outer, court, local = cage(), cage('court'), cage(local=True)
    results = {}
    for label,c in [('ordinaryOuter',outer),('ordinaryCourt',court),('localPortal',local)]:
        parallel = parallel_clearance(c)
        assert parallel['minimumAfterTwo5MM'] >= MIN_PARALLEL
        results[label] = {**c, 'parallelBars': parallel, 'sectionScreen': section_screen(c),
                          'slabAndStuds': slab_and_studs(c)}
    results['localPortal']['jambCrossings'] = local_crossings(local)
    assert results['localPortal']['jambCrossings']['minimumOrthogonalMainBarClearAfterTwo5MM'] > 0
    for label in ('ordinaryOuter','ordinaryCourt'):
        assert results[label]['slabAndStuds']['slabToLongitudinalBarClearAfterTwo5MM'] > 0
        assert results[label]['slabAndStuds']['ordinaryStud']['minimumOrthogonalClearAfterTwo5MM'] > 0
        results[label]['placementPath'] = placement_path(results[label])
        assert results[label]['placementPath']['lowerBoundFreeDiameterMM'] >= AGGREGATE + 5
    bends = [s_bend(10, diameter=16, count=6), s_bend(58, diameter=16, count=6),
             s_bend(10, diameter=12, count=4), s_bend(58, diameter=12, count=4)]
    # All face/chord groups at full yield with simultaneous adverse bend signs.
    # Five explicitly located closedH10 links in each250 mm half-transition.
    # The two transverse legs resist this demand. Combination with actual
    # beam shear/torsion and local anchorage still needs the coupled actions.
    burst = sum(r['maximumNormalResultantKN'] for r in bends)
    half_links = [25.,75.,125.,175.,225.]
    burst_tie = len(half_links) * 2 * math.pi * 10**2 / 4 * FYD / 1000
    near = {'plateauAlongMM':[1295,2905], 'completeAlongMM':[795,3405],
            'transitionAlongMM':500, 'sourceJambAxesMM':[1497.5,2702.5]}
    rods = [332.5,3800,4700,6000,7300,8200,11667.5]
    return {'status':'UNSELECTED finite-detail comparison; STR-FLOOR-PORTAL remains incomplete.',
            'units':'mm, N/mm2, kN, kNm', 'aggregateMM':AGGREGATE,
            'aggregateAuthority':'current-house-floor-closure.py rcEdgeAlternative.cage:16mm comparator',
            'sourceControls':source_controls(), 'cages':results,
            'pairedBay': {**near, 'mirrorAboutMM':6000, 'count':8,
                          'minimumOrdinaryRodOutsideTransitionMM':min(abs(x-e) for x in rods if x<795 or x>3405 for e in [795,3405]),
                          'ordinaryCoreQ':[252.5,412.5], 'localCoreQ':[252.5,472.5],
                          'ordinaryFinishedFaceQ':439.5, 'localFinishedFaceQ':499.5,
                          'oldFinishedFaceQ':429.5},
            'bends':bends, 'simultaneousFullYieldTransverseBendDemandKN':burst,
            'transitionConfinement':{'halfTransitionLinkStationsMM':half_links,
                                     'closedLinks':'H10 at50', 'transverseSteelYieldResistanceKN':burst_tie,
                                     'burstOnlyUtilisation':burst/burst_tie,
                                     'combinedShearTorsionAndAnchorageAdmitted':False},
            'roofCapComparison':{'jambTopZ':6515,'steelCapThicknessMM':25,'steelUndersideZ':6540,
                                 'upperSpandrelTopZ':6515,'nominalRoofGapAboveSpandrelMM':25,
                                 'normalRoofAxisToJambAxisOffsetMM':20,
                                 'sourceRCRemovedM3LowerControl':16*.205*.180*.085+8*1*.180*.025,
                                 'sourceCapSteelKgLowerControl':16*.205*.180*.025*7850,
                                 'restraintComparisons':['finite fixed cap, all six components',
                                                        'physically detailed sliding cap if the fixed comparison fails'],
                                 'admitted':False},
            'limits':['No coupled house actions or52-head successor result yet.',
                      'Roof positive/negative connection, RC joint shear, bend bursting and finite cage links not admitted by these screens.',
                      'Eight collector corners, field coupler assembly, slab mesh near jamb bars and all service/furniture conflicts still require explicit replay.',
                      'Source-foot pins, lower masonry contact and roof receiving links must not be silently replaced by convenient stiffness.'],
            'sourcesSHA256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in SOURCES},
            'references':[
                'https://www.concretecentre.com/Structural-design/Eurocode-2-concrete/Detailing.aspx',
                'https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/1110_WS_EC2.pdf',
                'https://www.nvent.com/sites/default/files/acquiadam/assets/LENTON-CAT-CP7J-TaperThreadedRebarSystem-UKEN.pdf'],
            'referenceScope':'EC2 first-generation detailing method, sourced16mm aggregate; product dimensions are comparison inputs, not purchase or certification authority.'}


def rounded(x):
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,list):return [rounded(v) for v in x]
    return round(x,8) if isinstance(x,float) else x


if __name__ == '__main__':
    result = rounded(calculate())
    target = D/'floor-portal-detail.json'
    text = json.dumps(result,indent=2)+'\n'
    if '--check' in sys.argv:
        assert target.read_text() == text, 'Finite detail receipt differs; regenerate intentionally.'
    else:
        target.write_text(text)
    print(json.dumps({'status':result['status'], 'sourceControls':result['sourceControls'],
                      'MRd':{k:v['sectionScreen']['MRdKNm'] for k,v in result['cages'].items()},
                      'bendDemandKN':result['simultaneousFullYieldTransverseBendDemandKN']},indent=2))
