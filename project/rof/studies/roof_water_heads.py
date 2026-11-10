"""Located outer heads, independently drained catches and supported wet bodies.

Lengths are mm, flows L/s and stresses N/mm². This finite reference comparison
specifies fabrication and demonstration duties. Installed flow coefficients,
joint pressure ratings and masonry anchor capacities require their named tests.
"""
import json
from math import pi

from roof_water_edges import (
    ROOT, read, primary, fault, head, normal_q, fault_q, primary_length,
    p_bed, f_rim, pstations, fstation, p_perimeter, f_perimeter, p_dry, f_dry,
    normal_depth, local_head, weir_head,
)


def section(width, depth, thickness):
    area = width*depth-(width-2*thickness)*(depth-2*thickness)
    inertia = (width*depth**3-(width-2*thickness)*(depth-2*thickness)**3)/12
    return {"area": area, "I": inertia, "Z": 2*inertia/depth}


def beam_screen(load_n_per_mm, length, shape, cantilever=False):
    moment = load_n_per_mm*length**2/(2 if cantilever else 8)
    deflection = load_n_per_mm*length**4/(8*180000*shape["I"])
    if not cantilever:
        deflection *= 5/48
    return {"momentNmm": moment, "stressMPa": moment/shape["Z"],
            "deflectionMm": deflection}


house = read("had/studies/water-replan.json")["model"]
shifts = read("str/studies/house-corner-rewind.json")["changes"]
services = read("had/studies/current-house-services.json")
review = services["structuralServiceReview"]
faces = [(h["wall"], p["point"][0], p["faceWidth"]/2)
         for h in review["fixedHeads"] for p in h["holes"]]
for port in review["ports"]:
    replacement = port["replacement"]
    if replacement:
        faces.append((replacement["wall"], replacement["point"][0], replacement["face"][0]/2))
    else:
        faces.append((port["wall"], port["point"][0], port["radius"]))


def facade_gap(face, station):
    wall = "outer-"+face
    gaps = [station, house["shell"]-station]
    for level, openings in house["openings"].items():
        for opening in openings:
            if opening["wall"] != wall:
                continue
            centres = [opening["centre"]] + [s["new"] for s in shifts
                if (s["level"], s["id"]) == (level, opening["id"])]
            gaps.extend(abs(station-c)-opening["width"]/2-215 for c in centres)
    gaps.extend(abs(station-p["p"][0])-p["r"]
                for p in house["exteriorPortGeometry"] if p["wall"] == wall)
    gaps.extend(abs(station-centre)-radius for side, centre, radius in faces if side == wall)
    return min(gaps)-head["along"]/2


head_rows = []
for face, station in pstations.items():
    bed = min(p_bed(face, station-.001), p_bed(face, station+.001))
    lower_rim = f_rim(face, station)
    floor = bed-10
    rim = bed+230
    catch_floor = lower_rim+60
    catch_water = 70
    return_floor = lower_rim+25
    return_length = head["farthest"]-600
    return_width = 240
    return_depth = catch_water
    # Half the width is obstructed. Use the actual 70-deep open section,
    # rather than borrowing the area of an unfilled 100-high enclosure.
    area = return_width/2*return_depth/1e6
    speed = normal_q/1000/area
    hydraulic_diameter = 4*area/((return_width/2+2*return_depth)/1000)
    velocity_head = speed**2*1000/(2*9.81)
    required_head = (1+6+.06*return_length/1000/hydraulic_diameter)*velocity_head
    available_head = catch_water+catch_floor-return_floor
    return_reserve = available_head-required_head-10-5-25
    # A dry upstand surrounds the pipe penetration. A separately fixed metal
    # drip ring below the lowest wet joint throws water outside that upstand.
    collar_top = catch_floor+105
    drip_ring = catch_floor+140
    lowest_wet_joint = floor-5
    collar_water_reserve = collar_top-catch_floor-catch_water-10-5
    drip_gap = drip_ring-collar_top-10-5
    joint_gap = lowest_wet_joint-drip_ring-10
    ring_overlap = (210-166)/2-5
    ring_side_gap = (246-210)/2-10
    spill = weir_head(normal_q, 1200)
    head_rim_reserve = rim-(bed+primary["frontDepth"]+spill+6+10+25+10)
    restricted_outlet_area = .75*pi*(150/2000)**2
    outlet_at_20 = .6*restricted_outlet_area*(2*9.81*.020)**.5*1000
    # Each primary head sits within a 250 x 260 gross independent catch.
    # The 190 x 190 normal body and the 210 drip ring retain their own gaps.
    assert min(return_reserve, collar_water_reserve, drip_gap, joint_gap,
               ring_overlap, ring_side_gap, head_rim_reserve) > 0
    assert outlet_at_20 > normal_q
    head_rows.append({"face": face, "station": station,
        "normalBodyPlan": [190, 190], "normalFloor": floor, "normalRim": rim,
        "catchGrossPlan": [250, 260], "catchFloor": catch_floor,
        "catchRim": rim+25, "catchWaterDepth": catch_water,
        "return": {"clearWidth": return_width, "clearHeight": 100,
                   "waterDepth": return_depth, "remainingWidthFraction": .5,
                   "length": return_length, "exitRadial": 600,
                   "exitFloor": return_floor, "velocity": speed,
                   "K": 6, "frictionFactor": .06,
                   "headRequiredIncludingExitVelocity": required_head,
                   "headAvailable": available_head,
                   "reserveAfter10Setting5Deflection25Splash": return_reserve},
        "pipePenetration": {"upstandOutsideDiameter": 166, "upstandTop": collar_top,
                            "dripRingOutsideDiameter": 210, "dripRingZ": drip_ring,
                            "lowestWetJointZ": lowest_wet_joint,
                            "waterReserve": collar_water_reserve, "dripGap": drip_gap,
                            "jointGap": joint_gap, "radialOverlapAfter5": ring_overlap,
                            "ringToCatchSideAfter10": ring_side_gap},
        "headRimReserve": head_rim_reserve,
        "restricted150OutletAt20HeadLps": outlet_at_20,
        "facadeGapAfterOpposed5": facade_gap(face, station)-10})

facade = []
for face, station, circuit in [("north",9025,"normal"),("south",11150,"normal"),
                               ("north",11750,"relief"),("south",11750,"relief")]:
    gap = facade_gap(face, station)-10
    assert gap >= 25
    facade.append({"face": face,"station": station,"circuit": circuit,
                   "grossWidth": 250,"clearanceAfterOpposed5": gap})

# An unavailable relief outlet is itself a single failure. Its projecting
# collector still receives rain while the primary works. Give that small
# ordinary inflow a lower emergency crest at the outboard N/S head, rather
# than allowing it to back up to the whole perimeter's front.
relief_direct_q = fault_q-normal_q
relief_emergency_head = weir_head(relief_direct_q,200)
relief_emergency_reserve = 125-70-relief_emergency_head-10-5-1
assert relief_emergency_reserve > 20
relief_emergency = {"ordinaryDirectRainLps":relief_direct_q,
    "outboardCrestAboveLocalBed":70,"spillWidth":200,
    "requiredHead":relief_emergency_head,
    "reserveBelowPerimeterFrontAfter10Setting5Deflection1Grade":relief_emergency_reserve,
    "receivingTerritory":"the same closed N/S400-wide ground lane, beyond the occupied routes",
    "limit":"Actual free-fall splash and wind capture require the outer receiving demonstration. Concurrent primary and relief blockage is a multiple failure."}

# A manufacturer gives 240 MPa minimum for EN10088-2 cold-rolled 316L sheet
# at20C. This screen additionally requires 165 MPa at100C and reduces E to
# 180 GPa. Certificates must establish the actual section and temperature
# properties. No annealed-copper proof minimum or composite action is credited.
allowable = 165/1.1
rail = section(40,25,2)
rib = section(20,25,2)
crossarm = section(100,25,4)
frames = []
for name, width, water, perimeter, dry, root_shape, root_radial in [
    ("primary",350,180,p_perimeter,p_dry,section(40,60,3),160),
    ("relief",545,175,f_perimeter,f_dry,section(40,80,4),105),
]:
    spacing = perimeter*1000/64
    characteristic_water = width*water/1000
    gravity = (1.35*50+1.5*characteristic_water)*9.81/1000
    wind = 2.25*width/1000
    line_load = gravity+wind  # wind is the source's already factored stress.
    rail_check = beam_screen(line_load/2, spacing, rail)
    plate_pressure = (1.5*9.81*water/1000+2.25+.25)/1000
    plate = beam_screen(plate_pressure,250,{"I":2**3/12,"Z":2**2/6})
    rib_check = beam_screen(plate_pressure*250,width,rib)
    arm = beam_screen(line_load*spacing/width,width,crossarm,True)
    load = line_load*spacing
    lever = (primary["radius"] if name=="primary" else fault["radius"])+332.5
    root_stress = load*lever/root_shape["Z"]
    root_deflection = load*lever**3/(3*180000*root_shape["I"])
    assert max(rail_check["stressMPa"],plate["stressMPa"],rib_check["stressMPa"],
               arm["stressMPa"],root_stress) < allowable, (name, rail_check, plate, rib_check, arm, root_stress)
    # Water-surface deflection uses the gravity case. The wind case above also
    # checks resistance, and the relative moving-body envelope reserves 5 mm.
    service_rail = beam_screen((50+characteristic_water)*9.81/2000,spacing,rail)
    assert service_rail["deflectionMm"]+plate["deflectionMm"] < 5
    frames.append({"name":name,"width":width,"rootCount":64,"rootSpacing":spacing,
        "scheduledDryKgM":dry,"completeDryAllowanceKgM":50,
        "waterDepthForStructure":water,"factoredGravityNPerMm":gravity,
        "factoredAddedWindNPerMm":wind,"backing316LThickness":2,
        "rail40x25x2":rail_check,"rib20x25x2At250":rib_check,
        "backingPlateAt250":plate,"movingCrossarm100x25x4":arm,
        "fixedRootEndRadial":root_radial,"fixedRootStressMPa":root_stress,
        "rootDeflectionAtCombinedLoad":root_deflection,
        "serviceRailDeflection":service_rail["deflectionMm"],
        "requiredRootReactionKN":load/1000,"requiredRootMomentKNm":load*lever/1e6})

leader_length = 8.4
leader_water = pi*.15**2/4*leader_length*1000
leader_copper = pi*(.154**2-.15**2)/4*leader_length*8940
leader_gravity = (1.35*(50+leader_copper)+1.5*(40+leader_water))*9.81/1000
leader_wind = 2.25*.25*1.5
top_arm = section(80,100,6)
top_lever = head["axis"]+332.5
top_moment = leader_gravity*1000*top_lever
top_stress = top_moment/top_arm["Z"]
top_deflection = leader_gravity*1000*top_lever**3/(3*180000*top_arm["I"])
assert top_stress < allowable and top_deflection < 10
leaders = {"number":4,"clearDiameter":150,"copperWall":2,
    "maximumSuspendedLengthM":leader_length,"dryPipeKgEach":leader_copper,
    "blockedPipeWaterKgEach":leader_water,"additionalHeadDryWaterKg":[50,40],
    "factoredVerticalRootKNEach":leader_gravity,"upperWindTributaryM":1.5,
    "upperGrossWindWidth":250,"factoredWindKNEach":leader_wind,
    "remainingFacadeRestraintMaximumPitch":1200,
    "roofArm100x80x6StressMPa":top_stress,"roofArmDeflectionMm":top_deflection,
    "requiredVerticalRootMomentKNm":top_moment/1e6,
    "wallHoopStressAt100kPaMPa":.1*150/(2*2),
    "oneDrained1200SpoolCopperKg":leader_copper*1.2/leader_length}

report = {"heads":head_rows,"facade":facade,"frames":frames,"leaders":leaders,
    "blockedReliefOutlet":relief_emergency,
    "steelScreen":{"requiredProofAt100C":165,"factor":1.1,"E":180000},
    "renewal":[
        "Commission the full independent over-roof diversion and close the ground receiving lane.",
        "Capture, isolate and drain the normal head, its cross-spout and the independent catch. Remove them to a separate scaffold rest.",
        "Capture the gutter module and its shallow crossarms before releasing their fork pins. Retained roots end at radial160 primary and105 relief.",
        "Move the primary40 outward,165 down, then360 outward. Its full27-deep carrier and relative allowances are included in the edge comparison.",
        "Remove the secondary apron under diversion before exchanging a relief module. Retained primary bodies remain supported by their independent roots.",
        "Restore root locks, normal joints and independent catches. Demonstrate ordinary flow, blocked outlet and leaked head before withdrawing diversion."
    ],
    "qualification":[
        "Qualify exact sheet/section properties, all formed joints, welds, dry sliding contacts, root plates and masonry/collector attachments at their reported actions.",
        "Demonstrate the complete head, annular drip and half-obstructed return at3.310473L/s, including wind, inlet momentum, setting and movement.",
        "Copper head, pipe and retained-joint pressure duties include the whole blocked column. The100kPa wall calculation gives demand only.",
        "Facade restraints carry wind to the actual piers and floor zones. Their anchors, thermal closures and water shedding need the BCR/DEL detail and wet demonstration.",
        "The remaining margin within50kg/m covers apron ribs, clips and minor metalwork. No installed polymer exception is added."
    ]}

if __name__ == "__main__":
    print(json.dumps(report,indent=2))
