"""Conventional floor-bar/anchorage comparisons, without selecting a cage.

The existing physical plate supplies the moments and body. The comparisons
separate section steel, straight development, an old vertical return and a
deeper conventional edge detail; none is a complete reinforcement design.
"""
import copy
import json
import math
from pathlib import Path
import sys

from continuous_rc_cage import reference_cage_case
from plate_bending_recovery import recover_plate_bending


METHOD = 'project/str/studies/floor_reinforcement.py'


def reference_floor_reinforcement_settings():
    cage = reference_cage_case()
    return {'schema': 'str-floor-reinforcement-settings/1', 'barDiameterMm': 12.,
        'pitchMm': 100., 'mainBarNominalCoverMm': 50.,
        'minimumCoverMm': cage['minimumCoverMm'],
        'cageSettingToleranceMm': cage['cageSettingToleranceMm'],
        'independentBarToleranceMm': cage['relativeBarBoxToleranceMm'],
        'minimumIndependentClearMm': cage['minimumIndependentBarClearanceMm'],
        'steelYieldMPa': cage['steelYieldMPa'], 'strengthSteelFraction': cage['strengthSteelFraction'],
        'bondMPa': cage['goodBondMPa'] * cage['poorBondFactor'],
        'concreteCompressionMPa': cage['concreteCompressionMPa'],
        'mandrelMm': cage['barMandrelMm'], 'leverArmFactor': .9,
        'comparisonDeeperSectionMm': 320., 'lapMultiplier': 1.5,
        'use': 'unqualified-conventional-section-and-anchorage-comparison'}


def _admit(settings):
    expected = reference_floor_reinforcement_settings()
    if not isinstance(settings, dict) or set(settings) != set(expected):
        raise ValueError('Exact authored reinforcement controls required; no sources/results/approval')
    if any(settings[k] != expected[k] for k in ('schema', 'use')):
        raise ValueError('Unsupported reinforcement comparison scope')
    for key, value in settings.items():
        if key in ('schema', 'use'): continue
        if type(value) not in (int, float) or not math.isfinite(value) or value <= 0:
            raise ValueError('Positive finite reinforcement controls required')
    if not 6 <= settings['barDiameterMm'] <= 16 or not .5 <= settings['leverArmFactor'] <= .9:
        raise ValueError('Unsupported bar/lever-arm comparison')
    if settings['strengthSteelFraction'] > 1 or settings['lapMultiplier'] < 1:
        raise ValueError('No enhanced steel strength or shortened lap is supported')


def _inside_cells(point, cells):
    x, y = point
    return any(a-1e-8 <= x <= c+1e-8 and b-1e-8 <= y <= d+1e-8
               for a, b, c, d in cells)


def _boundary_segments(cells):
    # Physical plate cells share the same global grid, so internal edges cancel
    # exactly. This retains every actual aperture, including tiny stair tongues.
    edges = {}
    for a, b, c, d in cells:
        for p, q, normal in (((a,b),(c,b),(0,1)), ((c,b),(c,d),(-1,0)),
                             ((c,d),(a,d),(0,-1)), ((a,d),(a,b),(1,0))):
            key = tuple(sorted((p, q)))
            if key in edges: del edges[key]
            else: edges[key] = (p, q, normal)
    return list(edges.values())


def _field_run(point, normal, cells, maximum):
    # Exact line intersections with every source rectangle, merged from the
    # near edge; no station sampling can skip a small intervening opening.
    axis = 0 if normal[0] else 1
    transverse = 1-axis
    intervals = []
    for r in cells:
        if not r[transverse]-1e-8 <= point[transverse] <= r[transverse+2]+1e-8: continue
        lo, hi = sorted(((r[axis]-point[axis])*normal[axis],
                         (r[axis+2]-point[axis])*normal[axis]))
        if hi >= -1e-8 and lo <= maximum: intervals.append((max(0.,lo),min(maximum,hi)))
    end = 0.
    for lo, hi in sorted(intervals):
        if lo > end+1e-8: break
        end = max(end,hi)
    return end


def assess_floor_reinforcement(result, settings=None):
    settings = reference_floor_reinforcement_settings() if settings is None else copy.deepcopy(settings)
    _admit(settings)
    bending = recover_plate_bending(result)
    h = result['request']['plateLaw']['thicknessMm']
    cells = result['plate']['cellsXYMm']
    bar, pitch, cover = (settings[k] for k in ('barDiameterMm','pitchMm','mainBarNominalCoverMm'))
    tolerance = settings['cageSettingToleranceMm'] + settings['independentBarToleranceMm']
    actual_cover = cover-tolerance
    # Two orthogonal bars per face; intentional contact at a tied crossing.
    # Inner bars govern depth, not a fictional single bar layer.
    effective_depth = h-cover-1.5*bar-tolerance
    if effective_depth <= 0: raise ValueError('No positive two-direction effective depth remains')
    lever = settings['leverArmFactor']*effective_depth
    steel_area = math.pi*bar*bar/4*1000/pitch
    design_stress = settings['steelYieldMPa']*settings['strengthSteelFraction']
    moment = bending['maximumAbsoluteBendingPlusTwistingKNmPerM']
    force_per_metre = moment*1e6/lever
    stress = force_per_metre/steel_area
    full_force_per_bar = math.pi*bar*bar/4*design_stress
    fbd = settings['bondMPa']
    full_development = bar*design_stress/(4*fbd)
    demand_development = bar*stress/(4*fbd)
    # Minimum lbd is retained even when a current comparison has little force.
    demand_development = max(demand_development, .3*demand_development, 10*bar, 100.)
    full_lap = settings['lapMultiplier']*full_development
    mandrel = settings['mandrelMm']
    full_mandrel = full_force_per_bar*(1/(settings['minimumCoverMm']+bar/2)+1/(2*bar))/settings['concreteCompressionMPa']
    # A return in the inner direction has the outer orthogonal mat between its
    # legs and each surface. Translation tolerances are already in nominal cover.
    needed_depth = mandrel+4*bar+2*cover
    deeper = settings['comparisonDeeperSectionMm']
    source_weight = result['mass']['newPlatePhysicalSelfGKN']
    area = result['mass']['newPlateAreaM2']
    density = result['request']['plateLaw']['unitWeightKNPerM3']
    route_rows = []
    for index,(p,q,normal) in enumerate(_boundary_segments(cells)):
        point = [(a+b)/2 for a,b in zip(p,q)]
        run = _field_run(point,normal,cells,full_lap+cover+bar/2+tolerance)
        # This is a necessary centreline inventory only. It grants no concrete
        # lateral cover around a hole, corner-bar fit, lap confinement or bond.
        # Worst inward end setting consumes development length even though it
        # improves edge cover; the nominal bar end cannot earn that extra run.
        available = max(0.,run-cover-bar/2-tolerance)
        axis = 0 if normal[0] else 1
        transverse = 1-axis
        support_rows = []
        for core in result.get('normalCoreGeometry',[]):
            r=core['rectangleXYMm']
            if not r[transverse]-1e-8 <= point[transverse] <= r[transverse+2]+1e-8:continue
            lo,hi=sorted(((r[axis]-point[axis])*normal[axis],(r[axis+2]-point[axis])*normal[axis]))
            if abs(lo)<1e-7 and hi>0:
                support_rows.append({'coreId':core['id'],'inwardCoreWidthMm':hi,
                    'supportInnerFaceToBarEndMm':max(0.,hi-cover-bar/2-tolerance),
                    'fullSourceDesignStressDevelopmentFitsBeforeEdge':hi-cover-bar/2-tolerance>=full_development})
        route_rows.append({'id':'FLOOR-EDGE-SEGMENT/'+str(index),'midpointXYMm':point,
            'inwardNormal':list(normal),'sourceEdgeLengthMm':math.dist(p,q),
            'continuousPhysicalFieldNormalRunMm':run,'availableStraightCentrelineMm':available,
            'fullForceStraightDevelopmentAvailable':available>=full_development,
            'fullForceLapRunAvailable':available>=full_lap,
            'edgeAdjacentSourceCoreComparisons':support_rows})
    depth_delta = max(0.,deeper-h)
    return {'schema':'str-floor-reinforcement-result/1','settings':settings,
        'sourceCaseId':result['native']['caseId'],'floorThicknessMm':h,
        'momentInspectionKNmPerM':moment,'governingMomentCell':bending['governing'],
        'section':{'barAreaPerMetreEachFaceDirectionMm2':steel_area,
            'minimumMainBarCoverMm':actual_cover,'coverComparatorPasses':actual_cover>=settings['minimumCoverMm'],
            'minimumIndependentParallelClearMm':pitch-bar-2*settings['independentBarToleranceMm'],
            'clearComparatorPasses':pitch-bar-2*settings['independentBarToleranceMm']>=settings['minimumIndependentClearMm'],
            'adverseInnerEffectiveDepthMm':effective_depth,'authoredLeverArmMm':lever,
            'inspectionForcePerMetreN':force_per_metre,'inspectionSteelStressMPa':stress,
            'sourceDesignSteelStressMPa':design_stress,'inspectionMomentCapacityKNmPerM':steel_area*design_stress*lever/1e6,
            'inspectionStressComparatorPasses':stress<=design_stress},
        'straightDevelopment':{'fullSourceDesignStressDevelopmentMm':full_development,
            'inspectionDemandDevelopmentMm':demand_development,'fullSourceDesignStressLapMm':full_lap,
            'policy':'No hook/cover/confinement reduction is credited; source poor-bond comparison retained.',
            'fieldRouteCount':len(route_rows),'routesWithoutFullForceDevelopment':sum(not row['fullForceStraightDevelopmentAvailable'] for row in route_rows),
            'routesWithoutFullForceLapRun':sum(not row['fullForceLapRunAvailable'] for row in route_rows),
            'edgeAdjacentSourceCoreCount':sum(len(row['edgeAdjacentSourceCoreComparisons']) for row in route_rows),
            'edgeAdjacentSourceCoreShortDevelopmentCount':sum(not core['fullSourceDesignStressDevelopmentFitsBeforeEdge']
                for row in route_rows for core in row['edgeAdjacentSourceCoreComparisons']),
            'routeInventory':route_rows,'routeInventoryIsFabricationSchedule':False},
        'verticalReturn':{'authoredMandrelMm':mandrel,'necessaryFullSourceDesignStressMandrelMm':full_mandrel,
            'mandrelForceComparatorPasses':mandrel>=full_mandrel,
            'requiredDepthForInnerDirectionMm':needed_depth,'existingDepthReserveMm':h-needed_depth,
            'existingSectionFits':h>=needed_depth,
            'minimumDepthUsingFullStressMandrelMm':max(mandrel,full_mandrel)+4*bar+2*cover,
            'deeperComparisonMm':deeper,'deeperComparisonReserveMm':deeper-needed_depth,
            'deeperComparisonFitsAuthoredGeometry':deeper>=needed_depth,
            'deeperComparisonPassesBothScreens':deeper>=needed_depth and mandrel>=full_mandrel},
        'uniformThickeningConsequence':{'changedThicknessMm':deeper,'additionalPhysicalRCVolumeM3':area*depth_delta/1000,
            'additionalPhysicalSelfGKN':area*depth_delta/1000*density,
            'newPhysicalSelfGKN':source_weight+area*depth_delta/1000*density,
            'scope':'Uniform-known-domain upper-bound quantity comparison only; no local band geometry or changed stiffness solve.',
            'changedModelReplayed':False},
        'localStressConvergenceProven':False,'reinforcementAccepted':False,'anchorageAccepted':False,
        'wholeHouseProof':False,
        'recommendation':'Retain RC200 as a floor candidate. Develop conventional straight continuous bars with explicit edge/void anchorage; '
            'the failed vertical-return template is not a proof that the slab is impossible. Do not uniformly thicken the slab from this screen. '
            'Resolve the specific short edge routes with a physically drawn, force-level conventional anchorage and rerun altered material/stiffness if its body changes.'}


if __name__=='__main__':
    if sys.argv[1:]==['--read']:
        print(json.dumps(reference_floor_reinforcement_settings(),allow_nan=False))
    else:
        data=json.load(sys.stdin)
        if set(data)!={'result','settings'}:raise ValueError('Exact current result/settings request required')
        print(json.dumps(assess_floor_reinforcement(data['result'],data['settings']),allow_nan=False))
