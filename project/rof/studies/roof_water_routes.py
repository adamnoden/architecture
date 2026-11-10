"""Two southern roof leaders with genuinely separate downstream blockage paths.

A source-bound architectural comparison for the ROF/RWT gate. Run at repository
root. All lengths and elevations are mm, flow L/s, pressure kPa. The compact
nonreturn cartridge and its metal joints are dimensional project requirements,
not a purchased or qualified valve. No buried branch is accepted for installation.
"""
from hashlib import sha1
from math import hypot, pi, sqrt
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


def compare(primary_front=4700, relief_front=4800, blocked_roof_level=6720):
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
    normal_q = (ridge * ridge - primary_sky * primary_sky) / 1e6 * rain
    relief_q = (ridge * ridge - relief_sky * relief_sky) / 1e6 * rain
    direct_q = relief_sky * relief_sky / 1e6 * rain
    direct_lower_q = (primary_sky * primary_sky - relief_sky * relief_sky) / 1e6 * rain
    assert abs(normal_q - 3.19815) < 1e-8
    assert abs(relief_q - 3.25815) < 1e-8
    assert abs(relief_q + direct_q - service["windows"]["cases"][0]["q"]) < 1e-8

    south_west, south_east = historical["profiles"]["A"]["outletsP"]
    # Retain the low N corridor, moving its first transverse run north by150.
    # Both connections remain inside the actual court and beneath the N intake.
    old_n = receiver["services"]["buried"]["north"]
    normal_y = old_n[1][1] + 150
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
             "downstreamFlangeY": [7445, 7460], "separableNorthSpoolY": [7460, normal_y - 150],
             "sourceOpeningHeadMm": 10,
             "productQualified": False}
    # The access opening is formed only after removing the appropriate N-liner
    # module and positively supporting the independent E crossing. It stops
    # south of the actual low tie. The pit and reinstated N liner are separate.
    tie = grid["crossBeams"]["low-tie-8050"]
    tie_south = tie["a"][1] - tie["width"] / 2
    access = [merger[0] - 200, 7375, 400, 350]
    tee = {"centre": [*merger, merger_axis], "mainLength": 300, "gross": 200,
           "southBranchFromCentre": 150, "firstSouthDraw": 80, "localK": 4}
    drawn_tee = [merger[0] - 150, normal_y - 150 - 80, 300, 250]
    aperture_gaps = [drawn_tee[0] - access[0], drawn_tee[1] - access[1],
                     access[0] + access[2] - drawn_tee[0] - drawn_tee[2],
                     access[1] + access[3] - drawn_tee[1] - drawn_tee[3]]
    tie_after_draw = tie_south - (normal_y + gross / 2 - tee["firstSouthDraw"])
    check_body_z = check["axis"][2] + check["maximumOutsideDiameter"] / 2
    # Actual E body is above this new valve. Use its greatest depth envelope.
    east_floor_bound = receiver["services"]["buried"]["upperBoundOnPipeCrown"] - gross
    check_e_gap = east_floor_bound - check_body_z
    assert min(aperture_gaps) >= 25
    assert tie_south - access[1] - access[3] >= 25
    assert tie_after_draw > 40 and check_e_gap > 50

    # First lifted valve and merger go to one positive dry nest after the court
    # and both N paths have been diverted/isolate/drained. Empty-gallery service
    # uses its own guarded lift, not the occupied receiver screen rig.
    lift = {"worker": [6500, 8100], "bodyRadius": 300,
            "firstRest": [5500, 7900, 400, 450], "pick": [5900, 7500],
            "surfacePickEyeZ": -100, "shoulderZ": 940,
            "ratedCapturedLiftRequired": True, "assemblyAtRestMaximum": [300, 300],
            "firstRestWithPartNotAStandingPlace": True}
    worker_gap = rect_gap(centred(lift["worker"], 600, 600), access)
    rest_gap = rect_gap(lift["firstRest"], access)
    lift["workerToOpening"] = worker_gap
    lift["firstRestToOpening"] = rest_gap
    lift["surfaceEyeReach"] = hypot(hypot(lift["worker"][0] - lift["pick"][0],
                                        lift["worker"][1] - lift["pick"][1]), 1040)
    assert worker_gap > 90 and rest_gap > 150 and lift["surfaceEyeReach"] < 1900

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
    assert min(row["dryHighEAfterMerger"] for row in n_cases) > 80

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
                     "lowerClearSky": relief_sky, "normal": normal_q, "lowerNormally": direct_lower_q,
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
                        "checkToEastPipe": check_e_gap, "lift": lift,
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


if __name__ == "__main__":
    print(json.dumps(compare(), indent=2))
