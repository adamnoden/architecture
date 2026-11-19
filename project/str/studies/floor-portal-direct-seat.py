"""Compare a direct tension cartridge between two closed torsion cells."""
import hashlib
import json
from math import pi
from pathlib import Path
from runpy import run_path
import sys

STUDIES = Path(__file__).resolve().parent
CAGE = STUDIES / 'floor-portal-continuous-cage.json'
ACCESS = STUDIES / 'floor-portal-ring-access.json'
SEAT = STUDIES / 'floor-portal-seat-detail.json'
HEEL = STUDIES / 'current-house-welded-heel.json'
ENVELOPE = STUDIES.parents[1] / 'mat' / 'studies' / 'ordinary-eave-joined.json'
CAPTIVE = STUDIES / 'floor-portal-captive-seat.py'


def section_screen(clear_q, ring, centre_q, room_q, web_thickness, torque):
    skin = ring['t']
    height = ring['H'] - skin
    median_cold = room_q - ring['B'] + skin / 2
    median_room = room_q - skin / 2
    widths = [clear_q[0] - web_thickness / 2 - median_cold,
              median_room - clear_q[1] - web_thickness / 2]
    assert min(widths) > 0
    areas = [w * height for w in widths]
    # The cells have separate inner webs. Both ends impose the same twist
    # through idealised transfers from the full box; no panel takes torsion.
    constants = [4 * area**2 / (2 * width / skin + height / skin + height / web_thickness)
                 for area, width in zip(areas, widths)]
    total = sum(constants)
    torques = [torque * value / total for value in constants]
    shear_flow = [value / (2 * area) for value, area in zip(torques, areas)]
    assert clear_q[0] < centre_q < clear_q[1]
    return {
        'permanentWebMm': web_thickness,
        'cellMedianWidthsMm': widths,
        'torsionConstantMm4': total,
        'cellTorquesKNm': [t / 1e6 for t in torques],
        'cellShearFlowsNPerMm': shear_flow,
        'innerWebShearStressMPa': [flow / web_thickness for flow in shear_flow],
    }


def compare():
    cage, access, seat, heel, envelope = [json.loads(path.read_text())
                                         for path in (CAGE, ACCESS, SEAT, HEEL, ENVELOPE)]
    source = access['anchorRelocation']
    anchor_q = source['oldAnchorAndTrialEyeQmm'][0]
    force = source['sourceAnchorTensionWitness']['tensionN']
    station = max(seat['trialPositionsMm'][11])
    room_q = access['access']['qRoomFaceMm']
    ring = heel['ring']['section']
    soffit, roof_top = heel['ring']['z']
    setting = 5.0
    fitting_diameter = cage['independentTopFittingEnvelope']['fittingEnvelopeDiameterMm']
    half_chamber = fitting_diameter / 2 + setting
    clear_q = [anchor_q - half_chamber, anchor_q + half_chamber]
    torque = access['torsion']['torqueProbeNmm']
    intact_j = access['torsion']['intactClosedJmm4']
    trials = [section_screen(clear_q, ring, anchor_q, room_q, thickness, torque)
              for thickness in (12.0, 20.0, 30.0, 40.0)]
    selected = max(trials, key=lambda row: row['torsionConstantMm4'])
    assert selected['permanentWebMm'] == 20
    selected_j = selected['torsionConstantMm4']
    assert selected_j / intact_j < 0.4

    captive = run_path(str(CAPTIVE))
    ear, eye, cheek_gap, pin_d = 8.0, 10.0, 2.0, 16.0
    fork_length = eye + 2 * (ear + cheek_gap)
    pull = fork_length + 6 + 6
    station_range = [station - fork_length / 2 - setting,
                     station + fork_length / 2 + pull + setting]
    minimum_tunnel_length = station_range[1] - station_range[0]
    opposite_side = station - fork_length / 2 - pull - setting
    first_case = heel['ring']['faces']['outer-north']['segments'][-1]
    same_centre_heel_distance = source['anchorStationFromCornerMm']
    local_start = same_centre_heel_distance - (station - station_range[0])
    local_end = same_centre_heel_distance + (station_range[1] - station)
    corner_cassette_half = access['taperedPlanAndFixedEndSensitivity']['cornerCassetteHalfExtentMm']
    next_heel_distance = first_case['end'] - first_case['start']
    assert local_start > corner_cassette_half and local_end < next_heel_distance - corner_cassette_half
    assert opposite_side < 882 + fork_length / 2
    assert station_range[1] < 1000

    core_start = seat['seatOuterInwardCoordinateMm']
    core_end = envelope['occurrence']['actualCoreQ'][1]
    toe_widths = [clear_q[0] - core_start, core_end - clear_q[1]]
    assert min(toe_widths) > 0
    core_width = core_end - core_start
    # Reserve the entire service tunnel from bearing. Same load on the net
    # gross strip is only an area sensitivity; pressure is not re-solved here.
    removed_area = (clear_q[1] - clear_q[0]) * minimum_tunnel_length
    upper_interior = roof_top - ring['t']
    lower_interior = soffit + ring['t']
    z = (upper_interior + lower_interior) / 2
    collar_q = [anchor_q - fitting_diameter / 2, anchor_q + fitting_diameter / 2]
    service_radius = 28.0
    lower_route_gap = soffit - cage['independentTopFittingEnvelope']['seatedFittingBottomZmm'] - (
        cage['independentTopFittingEnvelope']['fittingLengthMm'])
    through_gap_margin = lower_route_gap - 2 * service_radius
    assert lower_route_gap == 25 and through_gap_margin < 0
    # A trial tool sphere includes the radial setting. Lower it past the cap
    # end, then translate it along the station axis at the pin elevation.
    # This is a geometric head sweep, without the drive shaft/hand envelope.
    core_end_station = 1000.0
    mouth_axis = core_end_station + 2 * setting + service_radius
    mouth_end = mouth_axis + service_radius
    tool_q = [anchor_q - service_radius, anchor_q + service_radius]
    tool_tunnel_length = mouth_end - station_range[0]
    tool_cell = section_screen(tool_q, ring, anchor_q, room_q, selected['permanentWebMm'], torque)
    tool_toe_widths = [tool_q[0] - core_start - 2 * setting, core_end - tool_q[1] - 2 * setting]
    affected_core_length = core_end_station - station_range[0]
    tool_removed_area = affected_core_length * (2 * service_radius)
    assert z - service_radius > lower_interior and z + service_radius < upper_interior
    assert mouth_axis - service_radius == core_end_station + 2 * setting
    assert tool_cell['torsionConstantMm4'] < selected_j
    # A supported strip between the two permanent walls carries the vertical pin
    # reaction. The centred force, two reactions and deflection are screened
    # without credit for torsional load or real weld/connector rigidity.
    bridge_width, bridge_depth = 40.0, 20.0
    bridge_span = clear_q[1] - clear_q[0] + selected['permanentWebMm']
    bridge_inertia = bridge_width * bridge_depth**3 / 12
    bridge_moment = force * bridge_span / 4
    # Put the bridge at the top of the ring interior, above the pin. Moving
    # it up into the top skin would change the load path being compared.
    bridge_soffit = upper_interior - bridge_depth
    bridge_tool_overlap = z + service_radius - bridge_soffit
    assert bridge_tool_overlap > 0
    minimum_pin_housing_radius = pin_d / 2 + 6.0
    pin_z_for_tool = bridge_soffit - service_radius
    housing_lower_clearance = pin_z_for_tool - minimum_pin_housing_radius - lower_interior
    lowered_full_head_clearance = pin_z_for_tool - service_radius - lower_interior
    assert 0 < lowered_full_head_clearance < setting
    return {
        'sourceSha256': {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                         for path in (CAGE, ACCESS, SEAT, HEEL, ENVELOPE, CAPTIVE)},
        'sourceAnchorWitness': source['sourceAnchorTensionWitness'],
        'directPath': {
            'anchorQmm': anchor_q,
            'fittingExtentQmm': collar_q,
            'clearTunnelQmm': clear_q,
            'clearRingInteriorZmm': [lower_interior, upper_interior],
            'pinAxisZmm': z,
            'directPinVerticalReactionKN': force / 1000,
            'directPin': captive['pin_demand'](force, pin_d, eye, cheek_gap, ear),
            'localSectionTorqueAtInheritedAnchorLineKNm': (
                force * (anchor_q - (room_q - ring['B'] / 2)) / 1e6),
            'trialBridgeWidthDepthSpanMm': [bridge_width, bridge_depth, bridge_span],
            'bridgeGrossElasticBendingMPa': bridge_moment * bridge_depth / (2 * bridge_inertia),
            'bridgeElasticMidspanDeflectionMm': force * bridge_span**3 / (48 * 200000 * bridge_inertia),
            'verticalReactionEachWebKN': force / 2000,
        },
        'torsionAndBearing': {
            'existingTorsionConstantMm4': intact_j,
            'separateCells': trials,
            'selectedTorsionFraction': selected_j / intact_j,
            'minimumAccessLengthAdditionalEquivalentIntactMm': (
                minimum_tunnel_length * (intact_j / selected_j - 1)),
            'coreWidthAndNominalResidualToeWidthsMm': [core_width, *toe_widths],
            'residualToeWidthsAfterTwoFiveMmSettingsMm': [width - 2 * setting for width in toe_widths],
            'minimumRemovedCoreBearingAreaMm2': removed_area,
            'grossNetStripAveragePressureMultiplier': core_width / sum(toe_widths),
        },
        'access': {
            'forkBodyAndPullRunwayMm': [fork_length, fork_length + 6, pull],
            'localTunnelStationRangeMm': station_range,
            'requiredMinimumTunnelLengthMm': minimum_tunnel_length,
            'oppositeDrawReachAndAdjacentForkEndMm': [opposite_side, 882 + fork_length / 2],
            'endDrawFromCornerBlockedByCassetteAtDistanceMm': corner_cassette_half,
            'localRangeFromCornerMm': [local_start, local_end],
            'nextHeelCentreFromCornerMm': next_heel_distance,
            'remainingVerticalSpaceBetweenCapAndSoffitMm': lower_route_gap,
            'underSoffitToolDiameterIncludingSettingMm': 2 * service_radius,
            'underSoffitStraightToolShortfallMm': -through_gap_margin,
            'toolRadiusExcessOverClearTunnelHalfWidthMm': service_radius - half_chamber,
            'widenedEndMouthTrial': {
                'clearTunnelQmm': tool_q,
                'mouthCentreAndEndStationMm': [mouth_axis, mouth_end],
                'idealToolHeadStrokeAlongStationMm': mouth_axis - station,
                'minimumTunnelLengthThroughEndMouthMm': tool_tunnel_length,
                'sphereNominalClearanceToCoreEndMm': 2 * setting,
                'sphereClearanceToCoreEndAfterIndependentCoreSettingMm': setting,
                'sphereClearanceToUpperAndLowerInteriorFacesAtDrawMm': [
                    upper_interior - z - service_radius, z - service_radius - lower_interior],
                'bridgeSoffitIfLocatedDirectlyUnderUpperSkinZmm': bridge_soffit,
                'toolHeadOverlapWithUnrelievedBridgeMm': bridge_tool_overlap,
                'loweredPinAxisAtBridgeTangentZmm': pin_z_for_tool,
                'loweredHousingClearanceAboveInteriorFloorMm': housing_lower_clearance,
                'loweredFullHeadClearanceAboveInteriorFloorMm': lowered_full_head_clearance,
                'remainingToeWidthsAfterSettingsMm': tool_toe_widths,
                'minimumRemovedCoreBearingAreaMm2': tool_removed_area,
                'grossNetStripAveragePressureMultiplier': core_width / (core_width - 2 * service_radius),
                'torsionFraction': tool_cell['torsionConstantMm4'] / intact_j,
                'cellMedianWidthsMm': tool_cell['cellMedianWidthsMm'],
                'cellShearFlowsNPerMm': tool_cell['cellShearFlowsNPerMm'],
                'minimumAdditionalEquivalentIntactLengthMm': (
                    tool_tunnel_length * (intact_j / tool_cell['torsionConstantMm4'] - 1)),
                'coreEndAndLocalToolTunnelEndBeforeSettingMm': [core_end_station, mouth_end],
                'onlySweepsAnIdealizedToolHead': True,
            },
        },
    }


if __name__ == '__main__':
    result = json.dumps(compare(), indent=2) + '\n'
    if sys.argv[1:] == ['--check']:
        if Path(__file__).with_suffix('.json').read_text() != result:
            raise SystemExit('Direct seat receipt differs. Regenerate and review the source changes.')
    elif len(sys.argv) == 1:
        sys.stdout.write(result)
    else:
        raise SystemExit('Usage: floor-portal-direct-seat.py [--check]')
