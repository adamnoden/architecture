"""Two southern roof leaders with genuinely separate downstream blockage paths.

A source-bound architectural comparison for the ROF/RWT gate. Run at repository
root. All lengths and elevations are mm, flow L/s, pressure kPa. The compact
nonreturn cartridge and its metal joints are dimensional project requirements,
not a purchased or qualified valve. No buried branch is accepted for installation.
"""
from hashlib import sha1
from math import atan2, cos, hypot, pi, sin, sqrt
from pathlib import Path
import json


ROOT = Path(__file__).resolve().parents[3]
INPUTS = {}


def read(path):
    file = ROOT / "project" / path
    raw = file.read_bytes()
    INPUTS[str(file.relative_to(ROOT))] = sha1(
        b"blob " + str(len(raw)).encode() + b"\0" + raw
    ).hexdigest()
    return json.loads(raw)


def rect_gap(a, b):
    return hypot(*(
        max(a[i] - b[i] - b[i + 2], b[i] - a[i] - a[i + 2], 0)
        for i in (0, 1)
    ))


def centred(point, width, depth):
    return [point[0] - width / 2, point[1] - depth / 2, width, depth]


def route_length(points):
    return sum(hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(points, points[1:]))


def segment_distance(point, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    fraction = max(0, min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return hypot(point[0] - a[0] - fraction * dx, point[1] - a[1] - fraction * dy)


def branch_losses(q, length, local_k=8, diameter=150):
    area = .75 * pi * (diameter / 2000) ** 2
    hydraulic_diameter = .75 * diameter / 1000
    speed = q / 1000 / area
    return {
        "q": q,
        "length": length,
        "velocity": speed,
        "localK": local_k,
        "roughnessFactor": .06,
        "lossMm": (local_k + .06 * length / 1000 / hydraulic_diameter) * speed * speed * 1000 / (2 * 9.81),
    }


def compare(primary_front=4725, relief_front=4800, blocked_roof_level=6750):
    roof = read("mat/studies/ring-roof-family.json")
    house = read("had/studies/water-replan.json")["model"]
    receiver = read("had/studies/receiver-selection.json")
    service = read("rwt/studies/court-service-selection.json")
    grid = read("str/studies/current-house-grid.json")
    historical = read("rwt/studies/live-receiver-renewal.json")
    rain = read("rwt/studies/selected-water-event.json")["duty"]["syntheticRainfallMmPerHour"] / 3600
    shell = house["shell"]
    ridge = roof["catchment"]["outerCourtRidgeSides"][2]
    roof_sky = roof["catchment"]["revisedCourt"]["openSide"]
    primary_sky = shell - 2 * primary_front
    relief_sky = shell - 2 * relief_front
    normal_q = (ridge * ridge - relief_sky * relief_sky) / 1e6 * rain
    relief_q = (ridge * ridge - relief_sky * relief_sky) / 1e6 * rain
    direct_q = relief_sky * relief_sky / 1e6 * rain
    direct_lower_q = (primary_sky * primary_sky - relief_sky * relief_sky) / 1e6 * rain
    assert abs(normal_q - 3.25815) < 1e-8
    assert abs(relief_q - 3.25815) < 1e-8
    assert abs(relief_q + direct_q - service["windows"]["cases"][0]["q"]) < 1e-8

    south_west, south_east = historical["profiles"]["A"]["outletsP"]
    # Retain the low N corridor, moving its first transverse run north by70.
    # Both connections remain inside the actual court and beneath the N intake.
    old_n = receiver["services"]["buried"]["north"]
    normal_y = old_n[1][1] + 70
    merger = [old_n[0][0], normal_y]
    normal_route = [[south_west, south_west], [5500, south_west], [5500, normal_y], merger]
    new_n = [old_n[0][:2], [old_n[1][0], normal_y], [old_n[2][0], normal_y], *[point[:2] for point in old_n[3:]]]
    slope = receiver["services"]["buried"]["fall"]
    diameter, gross = receiver["flow"]["roundID"], receiver["flow"]["closedGross"]
    n_length = route_length(new_n)
    assert n_length == route_length(old_n) == receiver["services"]["buried"]["length"]
    merger_invert = old_n[0][2] - (normal_y - old_n[0][1]) * slope
    merger_axis = merger_invert + diameter / 2
    normal_length = route_length(normal_route)
    normal_start_axis = merger_axis + normal_length * slope
    # Maximum upper silhouette on the X5500 run at the transverse guard rib.
    guard = receiver["services"]["guard"]
    guard_y = guard["rib"][0][1]
    guard_bottom = guard["axisZ"] - guard["sectionReservation"][1] / 2
    normal_at_guard = normal_start_axis - ((5500 - south_west) + (guard_y - south_west)) * slope
    normal_guard_gap = guard_bottom - normal_at_guard - gross / 2
    box_x, box_y, box_w, box_d = receiver["composition"]["case"]
    normal_box_gap = box_x - (5500 + gross / 2)

    relief_port = [5820, box_y, -750]
    relief_route = [[south_east, south_west], [relief_port[0], south_west], relief_port[:2]]
    relief_length = route_length(relief_route)
    relief_start_axis = relief_port[2] + relief_length * slope
    relief_at_guard = relief_port[2] + (box_y - guard_y) * slope
    relief_guard_gap = guard_bottom - relief_at_guard - gross / 2
    # The port is wholly in the full-width south compartment. Its east end does
    # not puncture the baffle or quiet-cell wall farther north.
    port_side_gaps = [relief_port[0] - gross / 2 - box_x,
                      box_x + box_w - relief_port[0] - gross / 2]
    port_floor_gap = relief_port[2] - gross / 2 - receiver["composition"]["bottom"]
    assert min(normal_guard_gap, relief_guard_gap, normal_box_gap, *port_side_gaps, port_floor_gap) > 10

    # A compact valve is in the W branch BEFORE the two flows join. Relocate
    # the existing nonreturn obligation here. The remote manual isolation stays.
    # The30-long wafer, loose metal gaskets, flanges and retained anchors must
    # fit this envelope at the measured opening head. No spring head is hidden.
    check = {"axis": [merger[0], 7430, old_n[0][2] - (7430 - old_n[0][1]) * slope + diameter / 2],
             "waferAxial": 30, "maximumOutsideDiameter": 300,
             "upstreamFlangeY": [7400, 7415], "waferY": [7415, 7445],
             "downstreamFlangeY": [7445, 7460], "directTeeFlange": [7445, 7460], "firstWaferDrawNorth": 10,
             "sourceOpeningHeadMm": 10,
             "productQualified": False}
    # The access opening is formed only after removing the appropriate N-liner
    # module and positively supporting the independent E crossing. It stops
    # south of the actual low tie. The pit and reinstated N liner are separate.
    tie = grid["crossBeams"]["low-tie-8050"]
    tie_south = tie["a"][1] - tie["width"] / 2
    access = [5600, 7375, 700, 355]
    tee = {"centre": [*merger, merger_axis], "mainLength": 300, "gross": 200,
           "southFlangeFaceY": 7445, "maximumFlangeOD": 240,
           "firstNorthDraw": 20, "nextSouthDraw": 30, "netSouthDraw": 10, "localK": 6}
    drawn_tee = [5735, 7435, 330, 275]
    aperture_gaps = [drawn_tee[0] - access[0], drawn_tee[1] - access[1],
                     access[0] + access[2] - drawn_tee[0] - drawn_tee[2],
                     access[1] + access[3] - drawn_tee[1] - drawn_tee[3]]
    tie_after_draw = tie_south - (normal_y + tee["maximumFlangeOD"] / 2 - tee["netSouthDraw"])
    check_body_z = check["axis"][2] + check["maximumOutsideDiameter"] / 2
    # Actual E body is above this new valve. Use its greatest depth envelope.
    east_floor_bound = receiver["services"]["buried"]["upperBoundOnPipeCrown"] - gross
    check_e_gap = east_floor_bound - check_body_z
    assert min(aperture_gaps) >= 20
    assert tie_south - access[1] - access[3] >= 20
    assert tie_after_draw >= 40 and check_e_gap > 50

    # E is removed FIRST. Merely supporting it leaves it across the N lift.
    # Both receivers are isolated, drained and under tested independent capture.
    crossover = east_crossover(receiver, check, tee, access, tie_south)
    releases = tee_releases(check, tee, access, tie_south)
    lift = junction_handling(access)

    # A600 section crossing the150-wide fixed guard root cannot lift vertically.
    # Give the isolated wet line a450 axial empty bay, then withdraw south425
    # before lifting. This is greater than400 once end/relative errors are paid.
    module_length = 600
    rib_width = guard["sectionReservation"][0]
    axial_draw = 425
    guard_draw_gap = axial_draw - module_length / 2 - rib_width / 2 - 25 - 10
    assert guard_draw_gap > 0

    # Ground heel assemblies are flush and independently supported. The nearest
    # caps and the held-open south court doors are checked as installed. The
    # upper working decks intersect both leaders, so roof renewal MUST divert
    # and remove the relevant captured pipe lengths before their first lift.
    feet = [centred([p, south_west], 300, 300) for p in [south_west, south_east]]
    caps = [centred(h["xy"], *h["capXY"]) for h in grid["heads"]]
    cap_gaps = [min(rect_gap(foot, cap) for cap in caps) for foot in feet]
    door = house["southCourtWeatherDoor"]
    door_gaps = [min(abs(p - hinge[0]) for hinge in door["hinges"]) - 150 for p in [south_west, south_east]]
    assert min(cap_gaps) >= 100 and min(door_gaps) >= 500

    loss_rows = [branch_losses(normal_q, normal_length), branch_losses(relief_q, relief_length)]
    # Main N duty retains the full original joined runoff and long-maintenance
    # duty, with an added combining T loss. Moving the old check does not add a
    # second10 mm opening head. The initial valve obligation remains unqualified.
    n_cases = []
    for original in receiver["flow"]["rows"]:
        q = original["q"]
        area = receiver["flow"]["openArea"]
        added = tee["localK"] * 1000 * (q / 1000 / area) ** 2 / (2 * 9.81)
        n_cases.append({"q": q, "addedMergerHead": added,
                        "westImpactWithNAtFaultTail": original["NfaultTailLevel"] + added,
                        "dryHighEAfterMerger": original["EcrestDryWithN"] - added,
                        "checkOpeningHeadCarried": 10})
    assert min(row["dryHighEAfterMerger"] for row in n_cases) > 70

    lowest = min(check["axis"][2] - 150, merger_axis - gross / 2,
                 normal_start_axis - gross / 2, relief_port[2] - gross / 2,
                 old_n[-1][2] + diameter / 2 - gross / 2)
    static_pressure = (blocked_roof_level - lowest) * 9.81 / 1000
    nominal_area = pi * (diameter / 2000) ** 2
    end_force = static_pressure * nominal_area
    pressure = {"blockedRoofLevel": blocked_roof_level, "lowestOuterFace": lowest,
                "staticAtLowestFaceKPa": static_pressure,
                "closed150BoreEndForceKN": end_force,
                "orthogonalBendResultantKN": sqrt(2) * end_force,
                "check300GrossFaceForceKN": static_pressure * pi * .15 ** 2,
                "transientOrSafetyFactorIncluded": False}

    return {"id": "INNER-SOUTHERN-NORMAL-AND-RELIEF-COMPARISON", "inputs": INPUTS,
            "limits": {"constructed": False, "siteAccepted": False,
                       "firstHarmfulWaterLevel": None, "valveOrSealAccepted": False,
                       "roofBlockedLevelProvisional": True,
                       "existingEastSealHoldRetained": "Any1.94g silicone exception remains unapproved; this route does not select it"},
            "flow": {"rain": rain, "roofSkySide": roof_sky, "primaryClearSky": primary_sky,
                     "lowerClearSky": relief_sky, "normal": normal_q, "lowerNormally": 0, "ordinaryCapToPrimary": direct_lower_q,
                     "lowerFullFault": relief_q, "directCourt": direct_q,
                     "totalInward": relief_q + direct_q},
            "normal": {"route": normal_route, "axisAtStart": normal_start_axis, "axisAtMerger": merger_axis,
                       "length": normal_length, "guardGap": normal_guard_gap, "westBoxGap": normal_box_gap},
            "relief": {"route": relief_route, "axisAtStart": relief_start_axis, "port": relief_port,
                       "length": relief_length, "guardGap": relief_guard_gap,
                       "sidePortGaps": port_side_gaps, "floorGap": port_floor_gap},
            "nCarrier": {"routeXY": new_n, "orthogonalLength": n_length,
                         "existingDevelopedBudget": receiver["services"]["buried"]["developedBudget"],
                         "merger": tee, "check": check, "cases": n_cases},
            "renewal": {"accessOpening": access, "teeAfterFirstDraw": drawn_tee,
                        "apertureGaps": aperture_gaps, "toTieAfterDraw": tie_after_draw,
                        "installedCheckToEastPipe": check_e_gap, "eastCrossoverFirst": crossover, "teeJointReleases": releases, "lift": lift,
                        "underGuardModule": {"length": module_length, "axialEmptyBay": 450,
                                             "drawSouth": axial_draw, "remainingAfter25AndTwo5": guard_draw_gap},
                        "heelFeet": feet, "footToCaps": cap_gaps, "footToDoorHinges": door_gaps},
            "losses": loss_rows, "pressure": pressure,
            "singleFailures": [
                ["Normal roof channel, SW leader or new SW branch stopped", "Independent lower channel and SE leader to W impact, then available N or E"],
                ["Common N carrier or N receiving territory stopped", "SW riser backs up inside pressure boundary, high-level spill feeds SE and W high E; relocated W check prevents reverse injection"],
                ["W impact body, screen throat or entire W receiver unavailable", "SW roof normal and original court N-L remain connected to N"],
                ["SE relief or E receiving territory stopped", "SW normal and original N-L remain connected to N"],
                ["Relocated W check stuck shut", "SW normal connected to N; W uses its independent high E"],
                ["Relocated W check stuck open", "Ordinary N drainage works; do not credit coincident N flooding or reverse-pressure closure"],
            ],
            "commonCauseRejections": [
                "Both receiving territories unavailable or flooded together",
                "A blanket or ice event defeating both upper catchments",
                "Reverse-pressure failure of W check combined with a stopped N route",
                "Both source and independent temporary diversion unavailable during intrusive renewal",
            ]}


def bounds(points):
    return [min(p[i] for p in points) for i in range(3)] + [max(p[i] for p in points) for i in range(3)]


def box_gap(a, b):
    return sqrt(sum(max(a[i] - b[i + 3], b[i] - a[i + 3], 0) ** 2 for i in range(3)))


def east_crossover(receiver, check, tee, access, tie_south):
    """Actual round elbow and joint envelopes, including its first movement."""
    source = receiver["services"]["buried"]
    assert source["east"] == [[5900, 6900], [5900, 7540], [7450, 7540], [7450, 6975], [7580, 6975]]
    y = 7550
    radius, outside, union_od, union_length = source["radius"], 200, 210, 20
    upstream, downstream = [5900, 7385], [6200, y]
    developed = source["developedEast"] + 2 * (y - source["east"][1][1])
    # Parameterised centreline. The tangent is horizontal in plan, with 1% fall.
    stations = []
    for i in range(31):
        north = upstream[1] + i * (7400 - upstream[1]) / 30
        stations.append((5900, north, north - 6900, 0, 1))
    for i in range(181):
        angle = i * pi / 360
        stations.append((6050 - radius * cos(angle), 7400 + radius * sin(angle),
                         500 + radius * angle, sin(angle), cos(angle)))
    for i in range(151):
        east = 6050 + i
        stations.append((east, y, 500 + radius * pi / 2 + east - 6050, 1, 0))
    vertices = []
    for x, north, length, tx, ty in stations:
        z = -635 - .01 * length
        for i in range(72):
            angle = i * pi / 36
            vertices.append([x - ty * outside / 2 * cos(angle),
                             north + tx * outside / 2 * cos(angle), z + outside / 2 * sin(angle)])
    joints = []
    for centre, length, tx, ty in [(upstream, 485, 0, 1),
                                  (downstream, 500 + radius * pi / 2 + 150, 1, 0)]:
        z = -635 - .01 * length
        joints.append([*centre, z])
        for axial in [-union_length / 2, union_length / 2]:
            for i in range(72):
                angle = i * pi / 36
                vertices.append([centre[0] + axial * tx - ty * union_od / 2 * cos(angle),
                                 centre[1] + axial * ty + tx * union_od / 2 * cos(angle),
                                 z + union_od / 2 * sin(angle)])
    valve_box = [check["axis"][0] - 150, check["waferY"][0], check["axis"][2] - 150,
                 check["axis"][0] + 150, check["waferY"][1], check["axis"][2] + 150]
    tee_box = [5735, 7445, tee["centre"][2] - 120, 6065, 7720, tee["centre"][2] + 120]
    tie_box = [4500, tie_south, -750, 7500, tie_south + 600, -550]
    cases = []
    for step in range(41):
        moved = bounds([[p[0] - step, p[1] + step, p[2]] for p in vertices])
        cases.append({"westAndNorthMm": step, "valveGap": box_gap(moved, valve_box),
                      "teeGap": box_gap(moved, tee_box), "tieGap": box_gap(moved, tie_box)})
    lifted = bounds([[p[0] - 40, p[1] + 40, p[2]] for p in vertices])
    margins = [lifted[0] - access[0], lifted[1] - access[1],
               access[0] + access[2] - lifted[3], access[1] + access[3] - lifted[4]]
    fixed_upstream_north = upstream[1] + union_length / 2
    # Once E is gone, the retained upstream flange lies SOUTH of the wafer's
    # lift plane. The east retained flange is EAST of both N lift envelopes.
    wafer_to_retained = check["waferY"][0] + check["firstWaferDrawNorth"] - fixed_upstream_north
    t_to_retained_e = downstream[0] - union_length / 2 - 6065
    installed_downstream_to_deck = source["boughtDeckUnderside"] - (joints[1][2] + union_od / 2) - 10
    assert developed < 3000
    assert min(margins) > 10 and min(case["tieGap"] for case in cases) > 10
    assert min(case["valveGap"] for case in cases) > 10
    assert min(case["teeGap"] for case in cases) > 10
    assert wafer_to_retained > 10 and t_to_retained_e > 10
    assert installed_downstream_to_deck > 0
    return {"routeXY": [[5900, 6900], [5900, y], [7450, y], [7450, 6975], [7580, 6975]],
            "developedLength": developed, "retainedHydraulicBudgetMm": 3000,
            "nozzleLoweringMm": .2, "oldPairedNozzleMarginMm": 10.961124774303357,
            "revisedPairedNozzleMarginMm": 10.761124774303358,
            "joints": joints, "jointMaximumOD": union_od, "jointMaximumAxial": union_length,
            "jointStatus": "Dimensional project requirements for demountable all-metal joints; no catalogue or sealing qualification",
            "initialEnvelope": bounds(vertices), "firstTranslation": [-40, 40, 0],
            "postTranslationEnvelope": lifted, "apertureMargins": margins,
            "minimumTranslationClearances": {key: min(row[key] for row in cases) for key in ["valveGap", "teeGap", "tieGap"]},
            "retainedUpstreamToWaferLift": wafer_to_retained,
            "retainedEastToTeeLift": t_to_retained_e,
            "downstreamUnionToClosedCrossingUndersideAfterTwo5": installed_downstream_to_deck,
            "sequence": ["Prove full independent capture and downstream capacity; isolate, drain and verify both N branches and W/E",
                         "Remove the appropriate N liner module and local paving under a guarded lifting state",
                         "Capture E and both loose metal union parts before either joint releases",
                         "Release both E joints, translate40 west and40 north, lift vertically to the dedicated E rest",
                         "Compress the W/E metal bellows20 and move T20 north, opening the direct south-wafer joint",
                         "Draw the wafer10 north and lift; move T30 south from that first position, then lift to the distinct N rest",
                         "Rebuild and test N, E and the continuous N liner before releasing diversion"],
            "jointQualification": "The finite three-joint reference uses guided welded metal bellows, positive jacks and copper face gaskets; fabrication, pressure, leakage and stroke-fatigue tests remain required",
            "scope": "3D geometry and source loss-budget comparison; qualification of joints, pit, temporary support and lifting remains required"}


def tee_releases(check, tee, access, tie_south):
    """Finite three-flange release using two dry-controlled welded bellows."""
    axis_z = tee["centre"][2]
    # The normal branch has an R150 bend ending at(5650,7600). Its developed
    # length is shorter than the retained orthogonal loss budget. The W spool
    # begins AFTER that tangent, not inside the elbow.
    west = {"fixedFaceX": 5650, "movingFaceX": 5750, "compressedFaceX": 5730}
    east = {"fixedFaceX": 6150, "movingFaceX": 6050, "compressedFaceX": 6070}
    component = {"clearBore": 150, "bellowsMaximumOD": 200,
                 "maximumFlangeOD": 240, "freeFaceLength": 100,
                 "controlledCompression": 20, "compressedFaceLength": 80,
                 "flangeAxialEnvelope": 15, "maximumSpringForceAt20KN": 1,
                 "maximumGuideFrictionKN": .5, "qualifiedPressureKPa": 100,
                 "jacks": {"number": 2, "thread": "M12", "minimumTensileAreaMm2": 84.3,
                           "axisOffsetsY": [-110,110], "headHalfWidth":10},
                 "wetConstruction": "Formed or edge-welded metal bellows, welded necks, overlapping150-clear metal flow liner, copper face gaskets. No sliding wet seal.",
                 "fixedLoadPath": "Outer flange is anchored. Twin positive screw jacks and hard stops restrain the inner flange and full pressure thrust in every state; the lift captures T independently."}
    maximum_thrust = 100*pi*(.200**2)/4
    operating_force = maximum_thrust+component["maximumSpringForceAt20KN"]+component["maximumGuideFrictionKN"]
    per_jack = operating_force/2
    jack_stress = per_jack*1000/84.3
    assert jack_stress < 150
    assert 110+10 <= component["maximumFlangeOD"]/2
    # Flange faces move apart AXIALLY first. The whole T may then translate in
    # Y through the open gaps, without flexing either retained pipe.
    flange_gaps = [5750-west["compressedFaceX"], east["compressedFaceX"]-6050]
    t_north = [5735,7465,axis_z-120,6065,7740,axis_z+120]
    t_final = [5735,7435,axis_z-120,6065,7710,axis_z+120]
    wafer = [5750,7425,check["axis"][2]-150,6050,7455,check["axis"][2]+150]
    fixed_north_face = check["upstreamFlangeY"][1]
    wafer_face_gaps = [wafer[1]-fixed_north_face, t_north[1]-wafer[4]]
    tee_to_upstream = t_final[1]-fixed_north_face
    # The small initial north move remains wholly BELOW the concrete tie.
    initial_tie_underside = -750-t_north[5]
    final_margins = [t_final[0]-access[0],t_final[1]-access[1],
                     access[0]+access[2]-t_final[3],access[1]+access[3]-t_final[4]]
    assert min(flange_gaps) == 20
    assert min(wafer_face_gaps) >= 10
    assert tee_to_upstream >= 20 and initial_tie_underside > 80
    assert min(final_margins) >= 20
    assert tie_south-t_final[4] >= 40
    # After T leaves, either bellows cartridge can be renewed. Its first30
    # axial motion opens the fixed flange, then20 south brings the complete
    #240 flange below the access opening before the vertical lift.
    spool_paths = {
        "west": {"firstAxisXY":[30,0],"secondAxisXY":[0,-20],"finalBounds":[5665,7460,axis_z-120,5795,7700,axis_z+120]},
        "east": {"firstAxisXY":[-30,0],"secondAxisXY":[0,-20],"finalBounds":[6005,7460,axis_z-120,6135,7700,axis_z+120]},
    }
    for row in spool_paths.values():
        b=row["finalBounds"]
        row["apertureMargins"]=[b[0]-access[0],b[1]-access[1],access[0]+access[2]-b[3],access[1]+access[3]-b[4]]
        assert min(row["apertureMargins"]) >= 30
    return {"west":west,"east":east,"component":component,
            "maximumPressureThrustKN":maximum_thrust,"maximumControlledForceKN":operating_force,
            "forceEachJackKN":per_jack,"jackStressAt150MPaAllowable":jack_stress,
            "firstAxialGaps":flange_gaps,"TAfterFirst20North":t_north,
            "waferAfter10North":wafer,"waferFaceGaps":wafer_face_gaps,
            "TAfterNext30South":t_final,"TToRetainedUpstreamFace":tee_to_upstream,
            "TToTieDuringNorthMove":initial_tie_underside,
            "TFinalApertureMargins":final_margins,"bellowsCartridgeRenewal":spool_paths,
            "minorLossBudget":{"T":4,"twoLinedBellowsAtMostEach":1,"combinedChargedK":6},
            "operation": ["Capture and remove E first; verify the N lines drained and isolated",
                          "Support the T and both bellows independently, take jack load and release W/E T-face bolts",
                          "Compress each bellows20 against its anchored outer flange and lock both hard stops",
                          "Release the south wafer bolts and move T20 north, retaining its fixed elevation below the tie",
                          "Draw wafer10 north into the20 gap and lift through its clear E-free plane",
                          "Move T30 south, net10 south of its installed centre, then lift through the opening",
                          "For cartridge renewal, remove its fixed bolts, draw30 axially into the vacated T bay, draw20 south and lift",
                          "Rebuild at neutral stroke with new metal face gaskets; pressure, low-head and functional tests precede return to service"],
            "requiredEvidence": ["Complete bellows and liner pressure/low-head leakage,20 stroke and intended service-cycle fatigue tests",
                                 "Spring force no greater than1kN and guide force no greater than0.5kN over the complete stroke",
                                 "Metal seats, gasket compression, bolts, anchors and stops at100kPa plus the stated spring/guide force",
                                 "Tool sweep and captured load trials inside the declared opening; no assumption of a freely articulating pipe"],
            "qualificationStatus":False}


def junction_handling(access):
    """Separate rests and a constrained hoist, located in the actual N loggia."""
    mast = [6200, 8300]
    worker = [6850, 8500]
    body = centred(worker, 600, 600)
    e_rest = [5375, 8000, 600, 450]
    n_rest = [5875, 8750, 400, 400]
    ballast = [5350, 8650, 500, 400]
    shoes = [centred([x, y], 280, 140) for x in [5400, 6375] for y in [7800, 9250]]
    picks = [[5900, 7430], [5900, 7590], [6025, 7500], [5675, 8225], [6075, 8950]]
    radii = [hypot(p[0] - mast[0], p[1] - mast[1]) for p in picks]
    angles = [atan2(p[1] - mast[1], p[0] - mast[0]) * 180 / pi % 360 for p in picks]
    minimum_rest_separation = min(rect_gap(e_rest, n_rest), rect_gap(e_rest, ballast), rect_gap(n_rest, ballast))
    minimum_shoe_to_rest = min(rect_gap(shoe, rest) for shoe in shoes for rest in [e_rest, n_rest, ballast])
    # All load centres remain west of the mast in the90..260 degree sector.
    # A260 bounding radius contains the largest E assembly plan projection.
    load_to_body = worker[0] - 300 - (mast[0] + 260)
    approach_to_shoes = min(6850 - shoe[0] - shoe[2] - 300 for shoe in shoes)
    rig = {"ballastKg": 250, "suspendedKN": .60, "horizontalKN": .15,
           "momentHeightM": 2.6, "movingArmKg": 20, "armCentreRadiusMm": 450}
    horizontal_moment = rig["horizontalKN"] * rig["momentHeightM"]
    mass_force = 250 * 9.81 / 1000
    support = {"W": 5400, "E": 6375, "S": 7800, "N": 9250}
    ballast_centre = [5600, 8850]
    # Allow each suspended point plus the complete400-radius swing. Only
    # adverse moments are charged, so no moving load provides stability credit.
    load_points = picks + [[mast[0] + 400 * cos(i * pi / 180), mast[1] + 400 * sin(i * pi / 180)] for i in range(90, 261)]
    arms = [[mast[0] + 450 * cos(i * pi / 180), mast[1] + 450 * sin(i * pi / 180)] for i in range(90, 261)]
    moments = {}
    for edge, axis, sign in [("W", 0, 1), ("E", 0, -1), ("S", 1, 1), ("N", 1, -1)]:
        lever = sign * (ballast_centre[axis] - support[edge]) / 1000
        adverse_load = max(0, -min(sign * (p[axis] - support[edge]) / 1000 for p in load_points)) * .60
        adverse_arm = max(0, -min(sign * (p[axis] - support[edge]) / 1000 for p in arms)) * (20 * 9.81 / 1000 * 1.5)
        moments[edge] = mass_force * lever - horizontal_moment - adverse_load - adverse_arm
    setting_reach = max(hypot(hypot(worker[0] - p[0], worker[1] - p[1]), 1040) for p in picks[:3])
    assert max(radii) < 950 and min(angles) >= 90 and max(angles) <= 260
    assert minimum_rest_separation > 10 and minimum_shoe_to_rest > 10
    assert approach_to_shoes > 10 and load_to_body > 10
    assert min(moments.values()) > 0 and setting_reach < 1900
    assert rect_gap(body, access) > 10
    return {"mast": mast, "maximumReach": 950, "sectorDegrees": [90, 260], "swingRadius": 400,
            "worker": worker, "bodyRadius": 300, "operatorBay": [6500, 8150, 700, 700],
            "accessRoute": [[6850, 10000], [6850, 8500], [6850, 7600]],
            "approachToShoeAfterBody": approach_to_shoes, "workerToLiftedLoad": load_to_body,
            "rests": {"eastSpool": e_rest, "northValveAndTee": n_rest},
            "eastRestHasSeparateCapturedLevelsForLooseUnions": True,
            "restTop": 250, "minimumRestSeparation": minimum_rest_separation,
            "shoes": shoes, "ballastBox": ballast, "ballastCentre": ballast_centre,
            "shoeToRestMinimum": minimum_shoe_to_rest, "pickRadii": radii, "pickAngles": angles,
            "surfaceEyeReach": setting_reach, "carryBottom": 1250, "guardTop": 1100,
            "restoringKNm": moments, "loadInputs": rig,
            "onePadAllStatedLoadKPa": (mass_force + .60 + 20 * 9.81 / 1000 * 1.5) / (.280 * .140),
            "minimumFrictionWithHalfBallastOnly": .15 / (mass_force / 2),
            "restrictions": ["One captive assembly at a time, measured gross suspended mass at most40kg",
                             "Full N/E isolation and diversion; no occupied ordinary receiver service at the same time",
                             "No full-circle slew; retract to400 radius before rotation and use hard sector stops",
                             "Ground/tower-supported temporary rig, with no unallocated roof-ring reaction",
                             "Declared pad/moment calculation excludes unknown rig base mass; qualify and charge the actual plant before use"],
            "physicalQualification": False}


if __name__ == "__main__":
    print(json.dumps(compare(), indent=2))
