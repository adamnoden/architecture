"""Local torsion, tool and dry-envelope comparisons for a ring access aperture."""
import hashlib
import json
from math import atan, degrees, pi
from pathlib import Path

STUDIES = Path(__file__).resolve().parent
RING_SOURCE = STUDIES / 'current-house-welded-heel.json'
SEAT_SOURCE = STUDIES / 'floor-portal-seat-detail.json'
ENVELOPE_SOURCE = STUDIES.parents[1] / 'mat' / 'studies' / 'ordinary-eave-joined.json'


def closed_constant(area, compliance):
    return 4 * area**2 / compliance


def slot_and_cover(section, torque):
    width, height, wall = (section[key] for key in ('B', 'H', 't'))
    mid_width, mid_height = width - wall, height - wall
    area = mid_width * mid_height
    intact_compliance = 2 * (mid_width + mid_height) / wall
    intact = closed_constant(area, intact_compliance)
    opening_height, opening_length = 56.0, 100.0
    open_constant = (2 * mid_width + 2 * mid_height - opening_height) * wall**3 / 3
    plate_thickness, fastener_diameter = 20.0, 12.0
    overlap = 24.0
    cover_width, cover_height = opening_length + 2 * overlap, opening_height + 2 * overlap
    pitch = 40.0
    local_torsion = []
    for plate in (12.0, plate_thickness):
        replaced_web_compliance = intact_compliance - opening_height / wall + opening_height / plate
        restored = closed_constant(area, replaced_web_compliance)
        shear_flow = torque / (2 * area)
        fastener = shear_flow * pitch
        local_torsion.append({
            'coverThicknessMm': plate,
            'fullyEngagedJmm4': restored,
            'ratioToIntact': restored / intact,
            'coverGrossShearMPa': shear_flow / plate,
            'oneFastenerPerPitchDemandN': fastener,
            'oneFastenerGrossShankShearMPa': fastener / (pi * fastener_diameter**2 / 4),
            'nominalCoverBearingMPa': fastener / (fastener_diameter * plate),
        })
    shear_modulus = 77000.0
    slip_mm = 1.0
    two_seam_relative_slip_twist = 2 * slip_mm / (2 * area / mid_height)
    intact_twist = torque * opening_length / (shear_modulus * intact)
    web_ligament = (height - 2 * wall - opening_height) / 2
    assert web_ligament == 12.0
    assert open_constant < intact / 10
    assert local_torsion[0]['ratioToIntact'] < 0.95
    assert abs(local_torsion[1]['ratioToIntact'] - 1) < 1e-12
    return {
        'torqueProbeNmm': torque,
        'sectionAreaAtMedianLineMm2': area,
        'intactClosedJmm4': intact,
        'freeWarpingOpenJmm4': open_constant,
        'openRatioToIntact': open_constant / intact,
        'intact100mmTwistDeg': degrees(intact_twist),
        'freeWarpingOpen100mmTwistDeg': degrees(torque * opening_length / (shear_modulus * open_constant)),
        'twoSeamOneMmSlipTwistSensitivityDeg': degrees(two_seam_relative_slip_twist),
        'apertureMm': [opening_length, opening_height],
        'coverPlanMm': [cover_width, cover_height],
        'openingSidewallInnerLigamentMm': web_ligament,
        'maxPerSeamSlipAtTenPercentIntactTwistMm': 0.1 * intact_twist * (2 * area / mid_height) / 2,
        'oneSeamFortyMmPitchNPerMmSecantAtSlipTarget': torque / (2 * area) * pitch / (0.1 * intact_twist * area / mid_height),
        'nominalBoltPitchAndShankMm': [pitch, fastener_diameter],
        'reclosedPerfectShearTransferComparisons': local_torsion,
    }


def fixed_bypass(section, ring_room_face, torque, intact):
    width, height, wall = (section[key] for key in ('B', 'H', 't'))
    mid_width, mid_height = width - wall, height - wall
    clear_tool_pocket = 32.0
    results = []
    for backing_wall in (12.0, 20.0, 30.0, 40.0):
        shift = clear_tool_pocket + (backing_wall - wall) / 2
        closed_width = mid_width - shift
        area = closed_width * mid_height
        compliance = (2 * closed_width + mid_height) / wall + mid_height / backing_wall
        constant = closed_constant(area, compliance)
        results.append({
            'permanentWebThicknessMm': backing_wall,
            'remainingClosedCellMedianWidthMm': closed_width,
            'permanentWebMedianQmm': ring_room_face - clear_tool_pocket - backing_wall / 2,
            'closedJmm4': constant,
            'ratioToIntact': constant / intact,
            'permanentWebGrossShearMPa': torque / (2 * area * backing_wall),
        })
    assert max(row['ratioToIntact'] for row in results) < 0.85
    return {
        'clearBlindPocketFromRoomFaceMm': clear_tool_pocket,
        'screenedWebs': results,
        'modelsAxialTransitionOrConnectionForces': False,
    }


def transition_and_split(source, section, bypass, torsion):
    pocket_length = torsion['apertureMm'][0]
    selected = max(bypass['screenedWebs'], key=lambda row: row['ratioToIntact'])
    median_width = section['B'] - section['t']
    median_height = section['H'] - section['t']
    wall = section['t']
    thickness = selected['permanentWebThicknessMm']
    shift = median_width - selected['remainingClosedCellMedianWidthMm']
    taper_length, cassette_half = 128.0, 150.0
    intact, pocket = torsion['intactClosedJmm4'], selected['closedJmm4']

    def taper_compliance(intervals):
        inverse_j = 0.0
        for i in range(intervals):
            x = (i + 0.5) / intervals
            width = median_width - shift * x
            taper_wall = wall + (thickness - wall) * x
            perimeter_compliance = (2 * width + median_height) / wall + median_height / taper_wall
            inverse_j += 1 / closed_constant(width * median_height, perimeter_compliance)
        return taper_length * inverse_j / intervals

    taper = taper_compliance(512)
    assert abs(taper / taper_compliance(256) - 1) < 1e-6
    total_length = pocket_length + 2 * taper_length
    extra_equivalent_intact_length = intact * (pocket_length / pocket + 2 * taper) - total_length
    assert extra_equivalent_intact_length > 0
    rows = {}
    torque = torsion['torqueProbeNmm']
    for face, entry in source['faces'].items():
        if not face.startswith('outer-'):
            continue
        first, last = entry['segments'][0], entry['segments'][-1]
        rows[face] = [row['end'] - row['start'] for row in (first, last)]
    # Each direction remains fixed remotely in this compatibility comparison.
    pairs = [
        ('SW', rows['outer-south'][0], rows['outer-west'][0]),
        ('SE', rows['outer-south'][1], rows['outer-east'][0]),
        ('NE', rows['outer-north'][1], rows['outer-east'][1]),
        ('NW', rows['outer-north'][0], rows['outer-west'][1]),
    ]
    splits = []
    for corner, arm_a, arm_b in pairs:
        for modified, straight in ((arm_a, arm_b), (arm_b, arm_a)):
            original_fraction = straight / (modified + straight)
            modified_fraction = straight / (modified + straight + extra_equivalent_intact_length)
            splits.append({
                'corner': corner,
                'modifiedAndStraightArmLengthsMm': [modified, straight],
                'remainingModifiedArmRotationalStiffnessRatio': modified / (modified + extra_equivalent_intact_length),
                'additionalOtherArmTorqueAt10kNm': torque * (original_fraction - modified_fraction) / 1e6,
            })
    return {
        'trialPermanentWebThicknessMm': thickness,
        'medianWebShiftMm': shift,
        'eachTransitionLengthMm': taper_length,
        'transitionPlanAngleDeg': degrees(atan(shift / taper_length)),
        'totalAxialExtentMm': total_length,
        'cornerCassetteHalfExtentMm': cassette_half,
        'nearestPocketAxisFromCornerForNoCassetteOverlapMm': cassette_half + taper_length + pocket_length / 2,
        'extraEquivalentIntactTorsionLengthMm': extra_equivalent_intact_length,
        'grossFlowUnmodifiedAndPocketAt10kNmNPerMm': [
            torque / (2 * median_width * median_height),
            torque / (2 * selected['remainingClosedCellMedianWidthMm'] * median_height),
        ],
        'twoFixedEndSensitivity': splits,
        'maximumAdditionalOtherArmTorqueAt10kNm': max(row['additionalOtherArmTorqueAt10kNm'] for row in splits),
    }


def blind_pin_service(ring_room_face, pin_z, receiver_q):
    clear_pocket_depth, clear_pocket_height = 32.0, 60.0
    central_eye, ear, face_gap = 10.0, 8.0, 2.0
    fork_pack = central_eye + 2 * (ear + face_gap)
    rear_seating_reserve = 5.0
    roomward_receiver_projection = 5.0
    required_reach = fork_pack + rear_seating_reserve
    free_run = receiver_q - ring_room_face - roomward_receiver_projection
    trial_extract_run = fork_pack + 10.0
    aperture_radius, sleeve_height, sleeve_length = 28.0, 76.0, 120.0
    assert required_reach > clear_pocket_depth
    assert required_reach <= clear_pocket_depth + roomward_receiver_projection
    assert trial_extract_run < free_run
    return {
        'trialQOrientedForkEarEyeAndSideGapsMm': [ear, central_eye, face_gap],
        'nominalForkPackMm': fork_pack,
        'pocketDepthWithoutProjectionShortfallMm': required_reach - clear_pocket_depth,
        'projectedReceiverRoomwardMm': roomward_receiver_projection,
        'remainingDepthForRetainerAndSettingBeyondTrialStackMm':
            clear_pocket_depth + roomward_receiver_projection - required_reach,
        'pinExtractRunWithinClearAirLidQmm': trial_extract_run,
        'straightRunToAirReceiverFromForkFaceMm': free_run,
        'remainingRunAfterTrialExtractMm': free_run - trial_extract_run,
        'toolSweepZmm': [pin_z - aperture_radius, pin_z + aperture_radius],
        'radialZSpareInBlindPocketMm': clear_pocket_height / 2 - aperture_radius,
        'radialZSpareInSleeveMm': sleeve_height / 2 - aperture_radius,
        'axialSpareEachSideInSleeveMm': sleeve_length / 2 - aperture_radius,
        'minimumLocalRemovablePanelWidthAtFlangedSleeveMm': sleeve_length + 20,
    }


def tool_and_envelope(ring, ring_room_face, pin_z, glass, retained_cavity, envelope):
    ceiling = envelope['occurrence']['ceiling']
    finish_q = envelope['occurrence']['ordinaryFinishQ']
    finish_z, removable_underside = ceiling['finish'], ceiling['localUnderside']
    polyline = envelope['sections']['clearBay']['warmAirPolylineQZ']
    socket_diameter, positive_setting = 46.0, 5.0
    access_length = 180.0
    aperture_height, cover_thickness, fastener_head = 45.0, 20.0, 12.0
    service_aperture_height, frame_overlap = 56.0, 24.0
    tool_radius = socket_diameter / 2 + positive_setting
    tool_run = [ring_room_face, ring_room_face + access_length]
    tool_z = [pin_z - tool_radius, pin_z + tool_radius]
    vertical_crossings = []
    for (q1, z1), (q2, z2) in zip(polyline, polyline[1:]):
        if q1 == q2 and tool_run[0] <= q1 <= tool_run[1]:
            lower, upper = sorted((z1, z2))
            if min(upper, tool_z[1]) >= max(lower, tool_z[0]):
                vertical_crossings.append((q1, upper))
    assert vertical_crossings == [(489.5, 6640)]
    return_q, return_z = vertical_crossings[0]
    assert all(not (z1 == z2 and tool_z[0] <= z1 <= tool_z[1]
                    and min(max(q1, q2), tool_run[1]) >= max(min(q1, q2), tool_run[0]))
               for (q1, z1), (q2, z2) in zip(polyline, polyline[1:]))
    direct_aperture_margin = aperture_height - 2 * tool_radius
    underside_rise = pin_z - finish_z
    # Orthogonal elbow upper bound: a 32 mm radius plus the tool envelope.
    elbow_rise = 32.0 + tool_radius
    underside_room = finish_z - removable_underside
    fastener_circle = 13.0
    provisional_edge = 1.2 * fastener_circle
    web_ligament = (ring['H'] - 2 * ring['t'] - service_aperture_height) / 2
    aperture_inner_frame_width = 40.0
    surround_height = service_aperture_height + 4 * provisional_edge
    return_port_height, return_port_length = 76.0, 120.0
    return_port_z = [pin_z - return_port_height / 2, pin_z + return_port_height / 2]
    return_port_land = return_z - return_port_z[1]
    assert return_port_land == 2.0
    lifted_return_top = 6650.0
    flange_land = 10.0
    flange_z = [return_port_z[0] - flange_land, return_port_z[1] + flange_land]
    ordinary_ceiling_band = [finish_z, ceiling['top']]
    ceiling_intersection = [max(flange_z[0], ordinary_ceiling_band[0]),
                            min(flange_z[1], ordinary_ceiling_band[1])]
    assert lifted_return_top >= flange_z[1] and ceiling_intersection[1] > ceiling_intersection[0]
    assert direct_aperture_margin < 0 and elbow_rise > underside_room
    assert web_ligament < provisional_edge and frame_overlap < 2 * provisional_edge
    return {
        'qRoomFaceMm': ring_room_face,
        'qFinishMm': finish_q,
        'toolDiameterAndIndependentRadialSettingMm': [socket_diameter, positive_setting],
        'direct45mmApertureMarginMm': direct_aperture_margin,
        'minimumToolPassHeightMm': 2 * tool_radius,
        'minimumClearWebLigamentAtToolPassMm': web_ligament,
        'trialBackingFrameOuterVerticalOverlapMm': frame_overlap,
        'requiredCoverHeightForTwoStraightFastenerRowsMm': surround_height,
        'steelRingOuterHeightMm': ring['H'],
        'nominalCoverHeightSpareMm': ring['H'] - surround_height,
        'frontAirSleeveClearLengthAndHeightMm': [return_port_length, return_port_height],
        'frontAirSleeveFlangeTopLandMm': return_port_land,
        'frontAirSleeveIllustrativeRequiredFlangeLandMm': 10.0,
        'frontAirSleeveFlangeTopShortfallMm': flange_land - return_port_land,
        'liftedReturnWithSeparateAirLid': {
            'topZmm': lifted_return_top,
            'deltaAboveAuthoredAirReceiverTopMm': lifted_return_top - return_z,
            'airLidFlangeZmm': flange_z,
            'topFlangeLandMm': lifted_return_top - return_port_z[1],
            'ordinaryCeilingElevationOverlapMm': ceiling_intersection,
            'ordinaryCeilingElevationOverlapHeightMm': ceiling_intersection[1] - ceiling_intersection[0],
        },
        'trialFastenerHoleAndEdgeComparatorMm': [fastener_circle, provisional_edge],
        'trialFastenerRowShortfallAtInternalLigamentMm': provisional_edge - web_ligament,
        'trialFastenerRowShortfallAtTwoCoverEdgesMm': 2 * provisional_edge - frame_overlap,
        'trialBackingFrameSocketPocketAndFlangesQmm': [32.0, 4.0, 4.0],
        'trialBackingFramePocketWidthMm': aperture_inner_frame_width,
        'assumedToolRunMm': access_length,
        'roomSideToolAxisZmm': pin_z,
        'roomSideToolRunQmm': tool_run,
        'airReceiverCrossingQmm': return_q,
        'airReturnCrossingZmm': tool_z,
        'airReturnTopZmm': return_z,
        'coverAndHeadsOccupiedQmm': [ring_room_face, ring_room_face + cover_thickness + fastener_head],
        'clearBetweenProtrudingFastenersAndAirReceiverMm': return_q - ring_room_face - cover_thickness - fastener_head,
        'ceilingFinishToPinAxisMm': underside_rise,
        'localUndersideDropReservationMm': underside_room,
        'trialElbowAndToolRiseMm': elbow_rise,
        'coldCavityAndGlass': {
            'minimumRetainedGlassMm': glass,
            'remainingIf5mmFastenerOccupiesColdGlassMm': glass - positive_setting,
            'retainedDrainedCavityMm': retained_cavity,
        },
    }


def study():
    source = json.loads(RING_SOURCE.read_text())['ring']
    section = source['section']
    assert [section[key] for key in ('B', 'H', 't')] == [220, 120, 20]
    segments = [segment for face, entry in source['faces'].items() if face.startswith('outer-')
                for segment in (entry['segments'][0], entry['segments'][-1])]
    torques = [row['localMomentsEachArm'] for row in segments]
    assert torques and min(torques) == max(torques) == 10
    receipt = json.loads(SEAT_SOURCE.read_text())
    envelope = json.loads(ENVELOPE_SOURCE.read_text())
    assert envelope['occurrence']['face'] == 'outer-north'
    ring_axis_q = min(min(station['xy']) for station in source['stations'])
    pin_z = sum(source['z']) / 2
    ring_room_face = ring_axis_q + section['B'] / 2
    glass = receipt['minimumGlassWidthAfterSingleOutwardCapSettingMm']
    retained_cavity = 50.0
    assert 'Ordinary50 drained' in envelope['cold']['cavity']
    assert glass == 70.0 and ring_axis_q == 332.5 and pin_z == 6600.0
    torque = max(torques) * 1e6
    torsion = slot_and_cover(section, torque)
    bypass = fixed_bypass(section, ring_room_face, torque, torsion['intactClosedJmm4'])
    access = tool_and_envelope(section, ring_room_face, pin_z, glass, retained_cavity, envelope)
    return {
        'status': 'comparison only; closed torsion, tool access and envelope installation remain unselected',
        'sourceSHA256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                         for p in (RING_SOURCE, SEAT_SOURCE, ENVELOPE_SOURCE)},
        'torqueScope': '10 kNm authored welded-heel outer end-arm action, separate from the floor collector torsion',
        'torsion': torsion,
        'fixedBlindPocketBypass': bypass,
        'taperedPlanAndFixedEndSensitivity': transition_and_split(source, section, bypass, torsion),
        'access': access,
        'blindPinService': blind_pin_service(ring_room_face, pin_z, access['airReceiverCrossingQmm']),
    }


if __name__ == '__main__':
    print(json.dumps(study(), indent=2))
