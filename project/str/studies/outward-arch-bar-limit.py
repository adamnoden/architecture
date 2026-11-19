"""Necessary limits for uniform bar upsizing in the existing H6 arch and foot cages."""
import json
import math
from pathlib import Path
import runpy

studies = Path(__file__).resolve().parent
cage = runpy.run_path(str(studies / 'arch-width-geometry.py'))['cage']
detail = json.loads((studies / 'current-house-arch-detail.json').read_text())
placement = json.loads((studies / 'current-house-jamb-placement.json').read_text())
response = json.loads((studies / 'current-house-outward-arches.json').read_text())

base_diameter = detail['archBars']['diameter']
foot = next(row for row in placement['widthComparison'] if row['width'] == placement['footNormalWidth'])
outer_bar, inner_bar = foot['H16Normal']
inside_link = inner_bar - outer_bar + base_diameter  # inner faces tangent to the original bars
setout_loss = 2 * placement['barsAndFormAdverseSetout']
placing_gap = 25  # parallel-bar requirement in current-house-jamb-placement.py
diameter_limit = (inside_link - setout_loss - placing_gap) / 2
assert diameter_limit >= base_diameter


def moment_ceiling(section_width, depth, rows, axial_kn):
    """Optimistic moment about the compression row, then shifted to the centroid."""
    near, far = rows
    assert math.isclose(near, depth - far) and axial_kn >= 0
    # Each row moves inward by half the diameter increment in the fixed link.
    max_near = near + (diameter_limit - base_diameter) / 2
    # Give concrete its full compressive stress on the favourable side only.
    concrete_nmm = 17 * section_width * max_near**2 / 2
    # Two opposite bars receive the largest area AND the longest original arm.
    # Keep the source's five percent reserve but give all remaining steel to bending.
    opposite_area = 2 * math.pi * diameter_limit**2 / 4
    steel_nmm = opposite_area * (0.95 * 500 / 1.15) * (far - near)
    return (concrete_nmm + steel_nmm) / 1e6 + axial_kn * (depth / 2 - near) / 1000


bounds = []
for control in response['controls']:
    width = control['geometry']['normalWidthNominal']
    governing = max(control['coupled'], key=lambda row: row['maximumSameStateActions']['adverseRatio'][0])
    witness = governing['governingStates']['adverseRatio/0']
    axial, strong, weak = witness[7:10]  # both moments and compression at the same arch end
    arch = cage(width, 'arch', 6000, adverse=True)  # constant section throughout the arc
    strong_limit = moment_ceiling(arch['b'], arch['h'], arch['xs'], axial)
    weak_limit = moment_ceiling(arch['h'], arch['b'], arch['ys'], axial)
    bounds.append({
        'widthMm': width, 'windIndex': witness[0], 'window': witness[2],
        'element': witness[6], 'end': witness[-1], 'compressionKN': axial,
        'strongDemandKNm': strong, 'weakDemandKNm': weak,
        'strongCeilingKNm': strong_limit, 'weakCeilingKNm': weak_limit,
        'interactionLowerBound': strong / strong_limit + weak / weak_limit,
    })

trial = 20
print(json.dumps({
    'insideLinkMm': inside_link, 'largestDiameterMm': diameter_limit,
    'h20ClearMm': inside_link - 2 * trial - setout_loss,
    'h20FullYieldLengthMm': trial / base_diameter * detail['archBars']['requiredFullYieldAt2p1MPa'],
    'availableTailMm': detail['archBars']['straightDevelopment'],
    'bounds': bounds,
}, indent=2))
