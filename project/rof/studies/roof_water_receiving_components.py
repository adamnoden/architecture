"""Unselected receiving strength and axial-stiffness comparisons.

The ordinary fourteen-station detail is not the eight-corner detail. Neither
an axial rod screen nor the native vertical spring qualifies that load path.
Units: N, mm, MPa, kN and kN/mm as labelled.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
INPUTS = [
    'project/str/studies/current-house-floor-closure.py',
    'project/str/studies/current-house-floor-closure.json',
    'project/str/studies/current-house-welded-heel.json',
    'project/str/studies/reconciled-house-interface.json',
]
MATERIAL_REFERENCE = ('https://www.hilti.co.uk/content/dam/documents/pdf/temp/'
    'technical-marketing---bu-anchors/seismic/'
    'Concrete%20anchor%20fastening_TECHNOLOGY%20MANUAL%20for%20seismic%20condition.pdf')


def component_screen(load_kn, grade88=False):
    # Same steel-material and explicit resistance factors as the owning
    # floor-closure comparison; only the upper rod material is varied.
    steel = 355/1.1
    shaft = min(353*640/1.1, .9*800*353/1.25)/1000 if grade88 else 353*steel/1000
    stud = .6*load_kn
    crossbar = load_kn*1000*100/4/((100-28)*30**2/6)
    bearing = stud*1000/(100*100-math.pi*18**2/4)
    roof_plate = load_kn*1000*.5*40/(140*25**2/6)
    bottom_plate = bearing*50**2/2/(25**2/6)
    values = {'shaftKN': load_kn, 'oneM16StudKN': stud,
        'crossbarNetStressMPa': crossbar, 'bottomPatchPressureMPa': bearing,
        'bottomPlateStressMPa': bottom_plate, 'roof25PlateStressMPa': roof_plate}
    limits = {'shaftKN': shaft, 'oneM16StudKN': .9*800*157/1.25/1000,
        'crossbarNetStressMPa': steel, 'bottomPatchPressureMPa': .6*.85*30/1.5,
        'bottomPlateStressMPa': steel, 'roof25PlateStressMPa': steel}
    return {'loadKN': load_kn, 'rodMaterial': 'candidate class8.8' if grade88 else 'source355/1.1',
        'values': values, 'comparisonLimits': limits,
        'utilisation': {k: values[k]/limits[k] for k in values},
        'componentScreensPass': all(values[k] < limits[k] for k in values),
        'completeConnectionQualified': False}


def compare():
    floor = json.loads((ROOT/INPUTS[1]).read_text())
    heel = json.loads((ROOT/INPUTS[2]).read_text())
    interface = json.loads((ROOT/INPUTS[3]).read_text())
    rod = floor['upperTie']
    rc = floor['rcEdgeAlternative']
    ordinary = rc['ordinaryPositiveRodDetail']
    assert rod['M24TensileArea'] == 353
    assert ordinary['studPairPitch'] == 100
    baseline = component_screen(rod['worstUp'])
    for metric, source in [('oneM16StudKN', 'oneStudMaxAt10mmEccentricity'),
                          ('crossbarNetStressMPa', 'crossbarCentreNetElasticStress'),
                          ('bottomPatchPressureMPa', 'bottomPatchPressure'),
                          ('bottomPlateStressMPa', 'bottomPlateCantileverStress')]:
        assert abs(baseline['values'][metric]-ordinary[source]) < 2e-6, metric
    assert abs(baseline['values']['roof25PlateStressMPa']-rod['25mmPlateStress']) < 2e-6

    floor_top = rc['upstandBottomTop'][1]
    finished_floor = floor_top-rc['heightAboveUpperFinishedFloor']
    fitting_top = finished_floor+ordinary['upperFittingNominalNutTopRelativeFFL']
    roof_bottom = heel['ring']['z'][0]
    shortest_envelope = roof_bottom-fitting_top
    assert (floor_top, finished_floor, fitting_top, roof_bottom, shortest_envelope) == (3820, 3450, 3920, 6540, 2620)
    elastic_modulus = 200000.
    shaft_rows = []
    for diameter, area in [(24, 353), (27, 459), (30, 561)]:
        shaft_rows.append({'nominalDiameterMM': diameter, 'threadTensileAreaMM2': area,
            'fullyThreadedUniformAreaStiffnessKNPerMM': elastic_modulus*area/shortest_envelope/1000,
            'solidNominalShankAreaMM2': math.pi*diameter**2/4,
            'solidNominalShankUpperStiffnessKNPerMM': elastic_modulus*math.pi*diameter**2/4/shortest_envelope/1000})
    # A shortest-envelope perfect solid shank is deliberately favourable.
    # End threads, seating, plates, receiver and supporting frame add compliance.
    assert shaft_rows[0]['solidNominalShankUpperStiffnessKNPerMM'] < 40
    trial_length = fitting_top-3125
    stud_pair = 2*elastic_modulus*157/trial_length/1000
    series = 1/(1/shaft_rows[0]['fullyThreadedUniformAreaStiffnessKNPerMM']+1/stud_pair)
    # At the source10mm load eccentricity the stud forces split60/40.
    # Castigliano compliance at that load point is(sum of split squares)/k.
    eccentric_pair = (stud_pair/2)/(.6**2+.4**2)
    eccentric_series = 1/(1/shaft_rows[0]['fullyThreadedUniformAreaStiffnessKNPerMM']+1/eccentric_pair)
    old = component_screen(125.)
    proposed = component_screen(125., True)
    assert not old['componentScreensPass'] and proposed['componentScreensPass']
    return {
        'status': 'UNSELECTED COMPONENT AND STIFFNESS COMPARISON; NO RECEIVING LOAD PATH ADMITTED',
        'historicalBaselineReproduced': baseline,
        'declared125KNActionComparison': {'oldRodControl': old, 'sameDiameterGrade88Candidate': proposed,
            'scope': '125kN is an explicit action comparison, not a substituted native result or a full connection resistance.'},
        'materialBasis': {'source': MATERIAL_REFERENCE, 'edition': 'April2017, material table on printed page101',
            'M24ThreadAreaMM2': 353, 'candidateMinimumYieldMPa': 640, 'candidateMinimumUltimateMPa': 800,
            'nominalRodDiameterMM': 24,
            'scope': 'Primary manufacturer material-property evidence only. No resin, bond, catalogue anchor capacity, present product availability or corrosion/fire suitability is transferred. Actual rod, matching nuts and full thread engagement need certificates and assembly definition.'},
        'shortestRodEnvelope': {'roofSteelLowestZ': roof_bottom, 'floorFittingHighestZ': fitting_top,
            'lengthMM': shortest_envelope, 'E_MPa': elastic_modulus,
            'qualification': 'A deliberately short axial length between complete source envelopes. Actual bearing faces make the rod longer. A larger bespoke shank must be explicitly authored; it is not inferred from the M24 thread label.'},
        'axialShaftComparisons': shaft_rows,
        'nativeSpringRequirementKNPerMM': 40.,
        'minimumUniformAreaForPerfect40SpringMM2': 40000*shortest_envelope/elastic_modulus,
        'illustrativeOrdinarySeries': {'fullThreadM24RodKNPerMM': shaft_rows[0]['fullyThreadedUniformAreaStiffnessKNPerMM'],
            'assumedM16ThreadedLengthMM': trial_length, 'centredTwoM16ThreadedStudsKNPerMM': stud_pair,
            'centredSeriesBeforePlateConcreteAndSupportKNPerMM': series,
            'source10MMEccentricStudForceFractions': [.6, .4],
            'eccentricTwoM16EffectiveStiffnessKNPerMM': eccentric_pair,
            'eccentricSeriesBeforePlateConcreteAndSupportKNPerMM': eccentric_series,
            'scope': 'Illustrative centred50/50 and source10mm-eccentric60/40 serial steel calculations, not measured stiffnesses, lower bounds or corner models. Nominal solid shanks, thread lengths and actual bearing planes require a physical schedule.'},
        'portalQualificationDuties': {'sourceKN': interface['jambAndTies']['symmetricTieQualificationKN'],
            'sourceMinimumNormalStiffnessNPerMM': interface['jambAndTies']['minimumTieStiffnessNPerMm'],
            'scope': 'These are source qualification requirements, not tested product capacities. Revised actions require a defined two-sided sliding receiver and supporting substrate; changing a numeric limit is not verification.'},
        'unproved': [
            'The ordinary fourteen-station fitting expressly excludes all eight corners, including the governing court corner.',
            'No receiving compression, contact, splitting, local core, floor collector or downstream capacity is inferred.',
            'Higher rod grade does not increase the elastic modulus or establish the native40kN/mm spring.',
            'Any receiving-stiffness sensitivity must rebuild the native model, backgrounds, local recovery and reactions consistently; changing the reaction multiplier alone is invalid.',
            'Tension and compression may have different stiffness and contact states. A uniform20kN/mm sensitivity is a numerical comparison only.',
            'Actual sliding tie bearing, movement, friction, fixings and substrate remain unqualified.'
        ],
        'sourceHashes': {p: hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
            for p in [*INPUTS, str(Path(__file__).relative_to(ROOT))]},
    }


def rounded(value):
    if isinstance(value, dict): return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)): return [rounded(v) for v in value]
    return round(value, 9) if isinstance(value, float) else value


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = rounded(compare())
    target = Path(__file__).with_suffix('.json')
    content = json.dumps(result, indent=2)+'\n'
    if args.check:
        assert target.read_text() == content, 'Regenerate the receiving-component comparison'
    else:
        target.write_text(content)
    print(json.dumps({k: result[k] for k in ['status', 'axialShaftComparisons', 'illustrativeOrdinarySeries']}, indent=2))
