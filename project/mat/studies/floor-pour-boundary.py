#!/usr/bin/env python3
"""Reproduce one suspended concrete floor and boundary comparison."""
import argparse
import html
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
STEM = 'floor-pour-boundary'


def read_source(source):
    raw = subprocess.check_output(['git', 'show', source['commit'] + ':' + source['path']], cwd=ROOT)
    blob = subprocess.check_output(['git', 'hash-object', '--stdin'], input=raw, cwd=ROOT).decode().strip()
    assert blob == source['blob'], source['path']
    return json.loads(raw)


def batch_comparison(control, floor, area, thickness):
    nominal_volume = area * thickness / 1000
    steel_kg = floor['steelTonnesBeforeLapsEdges'] * 1000
    steel_volume = steel_kg / control['steelDensity_kg_m3']
    concrete_volume = nominal_volume - steel_volume
    gravity = control['gravity_m_s2']
    ceiling = control['compositeDensityCeiling_kN_m3']
    ceiling_mass = ceiling * 1000 / gravity
    cement = control['cement_kg_m3']
    water = control['effectiveWater_kg_m3']
    paste_volume = cement / control['cementParticleDensity_kg_m3'] + water / control['waterDensity_kg_m3']
    cases = []
    for air in control['assumedAirVolumeFractions']:
        aggregate_volume = 1 - paste_volume - air
        assert aggregate_volume > 0
        aggregate_kg = aggregate_volume * control['aggregateParticleDensity_kg_m3']
        plain_density = cement + water + aggregate_kg
        density_checks = []
        for depth in sorted(set([*floor['depthRange'], thickness])):
            volume = area * depth / 1000
            concrete_at_depth = volume - steel_volume
            weight = (plain_density * concrete_at_depth + steel_kg) * gravity / (1000 * volume)
            plain_limit = (ceiling_mass * volume - steel_kg) / concrete_at_depth
            density_checks.append({
                'grossDepth_mm': depth, 'compositeWeight_kN_m3': weight,
                'requiredPlainDensityMaximum_kg_m3': plain_limit,
                'aggregateDensityMaximumInThisBatch_kg_m3': (plain_limit - cement - water) / aggregate_volume,
                'insideCurrentWeightBudget': weight <= ceiling,
            })
        cases.append({
            'assumedAirVolumeFraction': air, 'aggregate_kg_m3': aggregate_kg,
            'plainDensity_kg_m3': plain_density, 'aggregateForNominalPour_kg': aggregate_kg * concrete_volume,
            'densityChecks': density_checks,
        })
    assert not any(row['insideCurrentWeightBudget'] for row in cases[0]['densityChecks'])
    return {
        'control': control, 'grossRCVolume_m3': nominal_volume, 'steelBeforeLapsAndEdges_kg': steel_kg,
        'steelDisplacement_m3': steel_volume, 'nominalConcreteVolumeBeforeLapsAndEdges_m3': concrete_volume,
        'cementForNominalConcreteVolume_kg': cement * concrete_volume,
        'effectiveWaterForNominalConcreteVolume_kg': water * concrete_volume,
        'effectiveWaterCementRatio': water / cement, 'cases': cases,
        'decision': 'The zero-air comparison exceeds the current structural weight budget. Actual fresh density with the delivered reinforcement must earn the load bound or STR must recheck the actual actions. Entrapped air remains a measured input.',
    }


def void_comparison(had, grid, floor_area, slab_bottom, guidance):
    grade = had['model']['approaches']['authoredExteriorGrade']
    ground = had['groundEnvelope']
    assert grade == -ground['routeLocalDTrial']
    loss = ground['heaveStress'] + ground['constructionLoss']
    effective_ground = grade + loss
    girders = [*grid['girders'].values(), *grid['crossBeams'].values()]
    member_bottom = min(girder['z'][0] for girder in girders)
    cap_bottom = min(head['capZ'][0] for head in grid['heads'])
    planes = {
        'slabSoffit': slab_bottom, 'lowestGirderSoffit': member_bottom,
        'lowestFoundationCap': cap_bottom, 'separateFullWaterTrackComparison': ground['fullSelectedTrackLowest'],
    }
    vent = guidance['voidClearance_mm']
    floor_area_term = guidance['ventAreaPerFloorArea_mm2_m2'] * floor_area
    historical_grade = had['model']['approaches']['supersededD1300Comparison']['authoredExteriorGrade']
    return {
        'referenceGrade_mm': grade, 'heaveStress_mm': ground['heaveStress'],
        'separateConstructionLoss_mm': ground['constructionLoss'],
        'effectiveStressDatum_mm': effective_ground,
        'clearanceCases': {
            key: {'bottomZ_mm': z, 'verticalClearance_mm': z - effective_ground,
                  'surplusOver150Comparison_mm': z - effective_ground - vent}
            for key, z in planes.items()
        },
        'supersededGradeToFullTrackClearance_mm': planes['separateFullWaterTrackComparison'] - historical_grade - loss,
        'floorAreaVentTerm_mm2': floor_area_term,
        'externalWallRunCrossover_m': floor_area_term / guidance['ventAreaPerExternalWallRun_mm2_m'],
        'actualExternalWallRun_m': None, 'actualConnectedVentOpeningArea_mm2': None,
        'actualSolumDrainageAndExposure': None,
        'scope': 'The D1800 stress check compares vertical reservations. The deeper water track keeps its own location and vent/drainage obligations. Establish the actual underfloor enclosure, opposite openings, free path past every support and screen, ground/drainage relation, water entry and vermin protection before accepting a vent route.',
    }


def produce():
    control = json.loads((HERE / f'{STEM}.json').read_text())
    sources = {key: read_source(source) for key, source in control['sources'].items()}
    had = sources['HAD']
    model = had['model']
    floor = sources['STRfloor']['groundFloor']
    field = sources['field']
    ordinary = sources['ordinaryWall']
    air = sources['airDuty']
    grid = sources['STRgrid']
    guidance = control['moistureGuidance']
    slab = model['sections']['groundFloorRC']
    depth = slab['top'] - slab['bottom']
    assert slab == {'top': -180, 'bottom': -380}
    stack = model['northNormalRoute']['floorJoin']
    assert stack['layers'] == [15, 65, 100, 200]
    assert stack['innerDpc'] == [-180, -30]
    assert floor['faceCoverRange'] == [40, 50]
    assert floor['depthRange'][0] >= guidance['minimumInSituThickness_mm']
    assert floor['faceCoverRange'][0] >= guidance['minimumCover_mm']
    assert control['mixTrial']['cement_kg_m3'] >= guidance['minimumCement_kg_m3']
    assert not any(control['admission'].values())
    area = sum(floor['physicalAreaM2'].values())
    crossings = field['confirmedSourceProposedSupportCrossings']
    structures = model['structuralChanges']
    wet_beam = structures['newWetWallBeam']
    assert [row['core'] for row in crossings] == [
        structures['stairMidPost']['concrete'], wet_beam['southReceiverCore'], wet_beam['northReceiverCore']]
    bases = field['wallBaseRegister']
    assert [row['id'] for row in bases] == [wall['id'] for wall in model['groundWalls']]
    for wall, row in zip(model['groundWalls'], bases):
        along = 1 if wall['a'][0] == wall['b'][0] else 0
        length = abs(wall['b'][along] - wall['a'][along])
        assert length - sum(b - a for a, b in wall.get('holes', [])) == row['rawSolidLength_mm']
    spine = grid['girders']['spine']
    spine_base = next(row for row in bases if row['id'] == 'service-spine')
    assert spine['datum'] == spine_base['axis'] and spine['axis'] == 'y'
    assert spine['extent'][0] <= ordinary['section']['atY'] <= spine['extent'][1]
    doors = [row for row in model['archOpeningRegister']['GROUND'] if row['kind'] == 'door']
    assert doors == field['threeDoorTransitions']
    assert sum(row['width'] for row in doors) == 5000
    stair = sources['STRtoe']['finite_floor_frame']['stair']
    toe = {'lowerFlightX_mm': model['stairGuard']['lowerFlightX'],
           'bearingAxisY_mm': stair['bearing_axes_y'][0], 'floorContact': stair['ground_toe_support'],
           'actualThreeDimensionalContact': None}
    assert toe['floorContact']['control_RC_top'] == slab['top']
    batch = batch_comparison(control['mixTrial'], floor, area, depth)
    concrete_volume = batch['nominalConcreteVolumeBeforeLapsAndEdges_m3']
    batch['guidanceMinimumCementAtNominalConcreteVolume_kg'] = concrete_volume * guidance['minimumCement_kg_m3']
    void = void_comparison(had, grid, area, slab['bottom'], guidance)
    assert void['supersededGradeToFullTrackClearance_mm'] < 0
    assert void['clearanceCases']['lowestFoundationCap']['surplusOver150Comparison_mm'] > 0
    assert grid['headCount'] == len(grid['heads']) == 52
    line = control['airScreen']
    ideal_cracks = []
    for aperture in [*line['authoredCrackApertures_mm'], floor['preferredField']['crackWidthFullRestraint'], floor['wkIf500Microstrain']]:
        gap = aperture / 1000
        speed = gap**2 * line['pressure_Pa'] / (12 * line['airDynamicViscosity_Pa_s'] * depth / 1000)
        ideal_cracks.append({'aperture_mm': aperture, 'flow_m3_h_per_m': speed * gap * 3600,
                             'idealHydraulicReynoldsNumber': line['airDensity_kg_m3'] * speed * 2 * gap / line['airDynamicViscosity_Pa_s']})
    families = air['aggregateFamilyBudgets']
    floor_budget = families['floorWallField']['aggregate_m3_per_h_at50Pa']
    opening_budget = families['completeOpeningsIncludingThreeDoorThresholds']['aggregate_m3_per_h_at50Pa']
    assert sources['court']['joinedCandidate']['finiteAirLedger']['sharedAllOpeningsBudget_m3_per_h'] == opening_budget
    return {
        'status': control['status'], 'sources': control['sources'], 'admission': control['admission'],
        'actualFloor': {'stack': stack, 'physicalArea_m2': area, 'areaParts_m2': floor['physicalAreaM2'],
                        'pressureFootprint_m2': air['geometry']['groundPressureFootprint']['area_m2'],
                        'roomField_m2': field['supportAwareRoomField']['netField_m2'],
                        'ordinaryFieldEdge_m': field['supportAwareRoomField']['ordinaryUpstandExcludingThreeDoors_m'],
                        'slab': slab, 'depthRange_mm': floor['depthRange'], 'faceCoverRange_mm': floor['faceCoverRange'],
                        'commonGridMemberZ_mm': spine['z'], 'serviceSpineWidth_mm': spine['width'],
                        'sectionY_mm': ordinary['section']['atY'],
                        'lowerInterfaceZ_mm': slab['bottom'], 'structuralPour': floor['pour'],
                        'structuralMaterialScope': floor['materials']},
        'guidance': guidance, 'voidComparison': void,
        'batchComparison': batch, 'binderEvidence': control['binderEvidence'], 'curingAndJoint': control['curingAndJoint'],
        'airAndCapillaryRegister': {
            'ordinaryDpcControl': ordinary['bondedMineralBase'], 'ordinaryAirRoute': ordinary['airRouteControl'],
            'wallBases': bases, 'threeSourceProposedRCCrossings': crossings, 'groundToe': toe,
            'proposedFoundationShaftCount': grid['headCount'], 'openingCuts': doors,
            'capillaryPaths': [
                'Ground and wet supports can feed the connected lower RC and slab. Establish matrix and interface transfer under the actual exposure.',
                'Outdoor RC and threshold seat contacts remain possible bypasses. Close the actual external and internal DPC ends, including the local structural pier cuts.',
                'Each vertical RC core and the stair toe has a separate moisture and surface duty. The slab comparison does not qualify those vertical paths.',
            ],
            'singleFloorWallFamily_m3_h_at50Pa': floor_budget, 'openingFamily_m3_h_at50Pa': opening_budget,
            'servicePenetrationsFamily_m3_h_at50Pa': families['servicePenetrations']['aggregate_m3_per_h_at50Pa'],
            'airTestScope': 'One aggregate for slab body, actual cracks and joints, ordinary wall bases, three structural crossings and the stair toe up to the actual assembly cuts. Opening and service assemblies retain their own disjoint budgets. Mask those interfaces when isolating this family and verify the final whole envelope unmasked. Every installed contribution remains unmeasured.',
            'idealCrackModel': line, 'idealCracks': ideal_cracks,
        },
        'costScope': {'fieldSheetAndOrdinaryReturnsScreen_kg': field['supportAwareRoomField']['ordinaryFlatAndUpstandScreen_kg'],
                      'role': 'The RC lift and cage are shared structural work. Compare actual mix, cure, inspection, interface and renewal differences before drawing a cost conclusion.'},
    }


def figure(result):
    floor = result['actualFloor']
    batch = result['batchComparison']
    void = result['voidComparison']
    air = result['airAndCapillaryRegister']
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="890" viewBox="0 0 1250 890">',
           '<rect width="1250" height="890" fill="#faf9f4"/><g font-family="Arial" fill="#263b47">']

    def text(x, y, label, size=17):
        svg.append(f'<text x="{x}" y="{y}" font-size="{size}">{html.escape(label)}</text>')

    def block(x0, x1, low, high, color):
        # Shared drawing datum. Horizontal dimensions are cropped around the spine.
        top = 295 - high * 0.52
        svg.append(f'<rect x="{x0}" y="{top}" width="{x1-x0}" height="{(high-low)*0.52}" fill="{color}" stroke="#647782"/>')

    text(30, 40, 'The continuous RC floor and its real boundary cuts', 28)
    text(30, 73, 'Development comparison. Installed material, air, moisture and site evidence remain open.')
    text(55, 127, 'A  SERVICE-SPINE SECTION / cropped field', 20)
    block(60, 660, -380, -180, '#b6bdba')
    block(135, 585, -630, -380, '#aeb6b6')
    for low, high, color in [(-180, -80, '#cfe2db'), (-80, -15, '#e6d9c2'), (-15, 0, '#d5c8ad')]:
        block(60, 306.25, low, high, color)
        block(413.75, 660, low, high, color)
    block(306.25, 413.75, -180, -30, '#ba8f6e')
    block(325, 395, -30, 220, '#c6a489')
    block(311.5, 325, 0, 220, '#e5d9cb')
    block(395, 408.5, 0, 220, '#e5d9cb')
    svg.append('<path d="M135 492.6H585" stroke="#ab553e" stroke-width="3" stroke-dasharray="8 4"/>')
    text(60, 652, 'Continuous RC200 upper lift, Z−380..−180.')
    text(60, 680, 'Possible prepared lower-grid interface at Z−380.')
    text(60, 708, 'DPC band Z−180..−30. Plaster begins at Z0.')
    text(60, 736, 'The wall core bridges the 30 mm between DPC and plaster.')
    text(60, 764, 'Connected lower concrete can carry ground moisture.')
    text(60, 816, 'Geometry and scope shown separately from performance.', 15)
    text(730, 127, 'B  ONE POUR / ACTUAL QUANTITIES', 20)
    text(730, 165, f'{floor["physicalArea_m2"]:.3f} m² physical slab and seat.')
    text(730, 192, f'{batch["grossRCVolume_m3"]:.3f} m³ gross RC at nominal depth.')
    text(730, 219, f'{batch["steelBeforeLapsAndEdges_kg"]/1000:.3f} t steel before laps and edges.')
    text(730, 246, f'{batch["cementForNominalConcreteVolume_kg"]/1000:.3f} t cement in the trial batch.')
    text(730, 273, 'Zero-air sensitivity exceeds the 25 kN/m³ load bound.')
    text(730, 328, 'C  D1800 STRESS COMPARISON', 20)
    for i, (key, label) in enumerate([
        ('slabSoffit', 'Slab soffit'), ('lowestGirderSoffit', 'Lowest girder'),
        ('lowestFoundationCap', 'Lowest cap'), ('separateFullWaterTrackComparison', 'Separate full water track')]):
        item = void['clearanceCases'][key]
        text(730, 366 + i * 27, f'{label}, {item["verticalClearance_mm"]} mm vertical clearance.')
    text(730, 482, 'Actual free openings, drainage and soil exposure remain open.')
    text(730, 537, 'D  ONE FLOOR/WALL AIR FAMILY', 20)
    text(730, 575, f'{air["singleFloorWallFamily_m3_h_at50Pa"]:.3f} m³/h at 50 Pa, provisional.')
    text(730, 602, 'Slab, actual cracks, 22 wall bases and ordinary perimeter.')
    text(730, 629, 'Three RC crossings and the unresolved lower stair toe.')
    text(730, 656, 'Complete doors and service penetrations have separate cuts.')
    text(730, 683, 'Actual contributions remain unmeasured.')
    text(730, 754, 'Glass stays above the structural pour.')
    text(730, 781, 'The comparison retains the accessible service zone.')
    svg.append('</g></svg>')
    return ''.join(svg) + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = produce()
    outputs = {HERE / f'{STEM}.results.json': json.dumps(result, indent=2, ensure_ascii=False) + '\n',
               HERE / f'{STEM}.svg': figure(result)}
    for path, contents in outputs.items():
        if args.check:
            assert path.exists() and path.read_text() == contents, f'Stale output: {path.name}'
        else:
            path.write_text(contents)
    print('Floor pour, D1800 clearance, batch weight and one air-family comparison reproduce. Admission remains open.')
