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
    lower_min,carrier_below_bed,exclusions,overlap,
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
    floor = bed-5
    rim = bed+230
    catch_floor = lower_rim+90
    catch_water = 70
    return_floor = lower_rim+55
    return_length = 720
    return_width = 240
    return_depth = catch_water
    # Half the width is obstructed. Use the actual wetted open section.
    area = return_width/2*return_depth/1e6
    speed = normal_q/1000/area
    return_diameter = 4*area/((return_width/2+2*return_depth)/1000)
    # Each side of the198 collar retains62 mm after half-width fouling.
    # The side passages have the governing wetted perimeter.
    side_width=(446-198)/4/1000
    side_depth=return_depth/1000
    catch_diameter=4*side_width*side_depth/(side_width+2*side_depth)
    hydraulic_diameter=min(return_diameter,catch_diameter)
    velocity_head = speed**2*1000/(2*9.81)
    required_head = (1+6+.06*return_length/1000/hydraulic_diameter)*velocity_head
    available_head = catch_water+catch_floor-return_floor
    return_reserve = available_head-required_head-10-30
    return_headspace = 120-catch_water-25-15
    return_lip_clearance = return_floor-lower_rim-10-30-2
    # A dry upstand surrounds the pipe penetration. A separately fixed metal
    # drip ring below the lowest wet joint throws water outside that upstand.
    collar_top = catch_floor+100
    drip_ring = catch_floor+123
    lowest_wet_joint = floor-5
    collar_water_reserve = collar_top-catch_floor-catch_water-10-5
    drip_gap = drip_ring-collar_top-10-5
    joint_gap = lowest_wet_joint-drip_ring-10
    ring_overlap = (218-198)/2-5
    ring_side_gap = (446-218)/2-10
    catch_bypass_half_width=(446-198)/2
    assert catch_bypass_half_width>=return_width/2
    catch_above_arch=catch_floor-6300-215-50-6-10
    assert catch_above_arch>25
    spill = weir_head(normal_q, 1200)
    head_rim_reserve = rim-(bed+primary["frontDepth"]+spill+6+10+25+10)
    restricted_outlet_area = .75*pi*(150/2000)**2
    outlet_at_20 = .6*restricted_outlet_area*(2*9.81*.020)**.5*1000
    # The450 high catch retains a half-obstructed bypass around the collar.
    # The250 pipe corridor is checked separately below the arches.
    assert min(return_reserve,return_headspace,return_lip_clearance,
               collar_water_reserve, drip_gap, joint_gap,
               ring_overlap, ring_side_gap, head_rim_reserve) > 0
    assert outlet_at_20 > normal_q
    head_rows.append({"face": face, "station": station,
        "normalBodyPlan": [190, 190], "normalFloor": floor, "normalRim": rim,
        "catchGrossPlan": [450, 260], "catchFloor": catch_floor,
        "catchRim": rim+25, "catchWaterDepth": catch_water,
        "catchBypassHalfRemainingWidth":catch_bypass_half_width,
        "catchAboveArchesAfter50Collector6Local10Setting":catch_above_arch,
        "return": {"clearWidth": return_width, "clearHeight": 120,
                   "waterDepth": return_depth, "remainingWidthFraction": .5,
                   "length": return_length, "exitRadial": 600,
                   "exitFloor": return_floor, "velocity": speed,
                   "K": 6, "frictionFactor": .06,
                   "frictionHydraulicDiameter":hydraulic_diameter,
                   "headRequiredIncludingExitVelocity": required_head,
                   "headAvailable": available_head,
                   "reserveAfter10Setting30Differential":return_reserve,
                   "headspaceAfter25Splash15LocalMovement":return_headspace,
                   "outletAboveReliefRimAfter10Setting30Differential2Wall":return_lip_clearance},
        "pipePenetration": {"upstandOutsideDiameter":198,"upstandClearDiameter":194,
                            "upstandTop": collar_top,
                            "dripRingOutsideDiameter":218,"dripRingZ": drip_ring,
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
relief_emergency_reserve = 125-60-relief_emergency_head-10-30-1
assert relief_emergency_reserve > 5
relief_emergency = {"ordinaryDirectRainLps":relief_direct_q,
    "outboardCrestAboveLocalBed":60,"spillWidth":200,
    "requiredHead":relief_emergency_head,
    "reserveBelowPerimeterFrontAfter10Setting30Movement1Grade":relief_emergency_reserve,
    "receivingTerritory":"the same closed N/S400-wide ground lane, beyond the occupied routes",
    "limit":"Actual free-fall splash and wind capture require the outer receiving demonstration. Concurrent primary and relief blockage is a multiple failure."}

# A manufacturer gives 240 MPa minimum for EN10088-2 cold-rolled 316L sheet
# at20C. This screen additionally requires 165 MPa at100C and reduces E to
# 180 GPa. Certificates must establish the actual section and temperature
# properties. No annealed-copper proof minimum or composite action is credited.
allowable = 165/1.1
rail = section(80,25,2)
rib = section(20,25,2)
crossarm = section(160,25,4)
frames = []
for name, width, water, perimeter, dry, root_shape, root_radial in [
    ("primary",350,180,p_perimeter,p_dry,section(50,100,4),160),
    ("relief",545,175,f_perimeter,f_dry,section(50,100,4),105),
]:
    spacing = perimeter*1000/64
    characteristic_water = width*water/1000
    gravity = (1.35*50+1.5*characteristic_water)*9.81/1000
    wind = 2.25*width/1000
    line_load = gravity+wind  # wind is the source's already factored stress.
    rail_check = beam_screen(line_load/2, spacing, rail)
    plate_pressure = (1.5*9.81*water/1000+2.25+.25)/1000
    plate = beam_screen(plate_pressure,200,{"I":2**3/12,"Z":2**2/6})
    rib_check = beam_screen(plate_pressure*200,width,rib)
    load = line_load*spacing
    inner = primary["inner"] if name == "primary" else fault["inner"]
    unloaded_offset = inner-root_radial
    arm_length = width+unloaded_offset
    arm_load = load/width
    arm_moment = load*(unloaded_offset+width/2)
    arm_deflection = arm_load*(3*arm_length**4-4*arm_length*unloaded_offset**3
        +unloaded_offset**4)/(24*180000*crossarm["I"])
    arm = {"momentNmm":arm_moment,"stressMPa":arm_moment/crossarm["Z"],
           "deflectionMm":arm_deflection,"unloadedRootOffset":unloaded_offset}
    lever = (primary["radius"] if name=="primary" else fault["radius"])+332.5
    root_stress = load*lever/root_shape["Z"]
    root_length = root_radial+332.5
    root_ei = 180000*root_shape["I"]
    root_translation = load*root_length**3/(3*root_ei)+arm_moment*root_length**2/(2*root_ei)
    root_rotation = load*root_length**2/(2*root_ei)+arm_moment*root_length/root_ei
    root_deflection = root_translation+arm_length*root_rotation
    whole_deflection = root_deflection+arm_deflection+rail_check["deflectionMm"]+rib_check["deflectionMm"]+plate["deflectionMm"]
    assert max(rail_check["stressMPa"],plate["stressMPa"],rib_check["stressMPa"],
               arm["stressMPa"],root_stress) < allowable, (name, rail_check, plate, rib_check, arm, root_stress)
    # Sum the conservative maxima of every serial component, including root
    # rotation and the unloaded gap before the moving crossarm's wet load.
    assert whole_deflection < 8
    service_rail = beam_screen((50+characteristic_water)*9.81/2000,spacing,rail)
    dry_ratio = (1.35*50*9.81/1000+wind)/line_load
    dry_offset = unloaded_offset+(40 if name=="primary" else 0)
    dry_length = width+dry_offset
    dry_moment = load*dry_ratio*(dry_offset+width/2)
    dry_arm = arm_load*dry_ratio*(3*dry_length**4-4*dry_length*dry_offset**3
        +dry_offset**4)/(24*180000*crossarm["I"])
    dry_root_translation = load*dry_ratio*root_length**3/(3*root_ei)+dry_moment*root_length**2/(2*root_ei)
    dry_root_rotation = load*dry_ratio*root_length**2/(2*root_ei)+dry_moment*root_length/root_ei
    # Scaling the plate and rib by the whole-load ratio overbounds their
    # smaller dry ratio. The released primary includes its extra40 mm lever.
    dry_whole = dry_root_translation+dry_length*dry_root_rotation+dry_arm
    dry_whole += dry_ratio*(rail_check["deflectionMm"]+rib_check["deflectionMm"]+plate["deflectionMm"])
    frames.append({"name":name,"width":width,"rootCount":64,"rootSpacing":spacing,
        "scheduledDryKgM":dry,"completeDryAllowanceKgM":50,
        "waterDepthForStructure":water,"factoredGravityNPerMm":gravity,
        "factoredAddedWindNPerMm":wind,"backing316LThickness":2,
        "rail80x25x2":rail_check,"rib20x25x2At200":rib_check,
        "backingPlateAt200":plate,"movingCrossarm160x25x4":arm,
        "fixedRootEndRadial":root_radial,"fixedRootStressMPa":root_stress,
        "rootDeflectionAtCombinedLoad":root_deflection,
        "wholeSupportDeflectionAtCombinedLoad":whole_deflection,
        "drySupportDeflectionWithSameWind":whole_deflection*(1.35*50*9.81/1000+wind)/line_load,
        "dryReleasedSupportDeflectionWithSameWind":dry_whole,
        "serviceRailDeflection":service_rail["deflectionMm"],
        "requiredRootReactionKN":load/1000,"requiredRootMomentKNm":load*lever/1e6})

# Vertically folded triangular ribs give each apron its own steel resistance.
# The primary is a580-long cantilever from the supported eave. The secondary
# is supported at7110,6750 and50 above the local lower rim, with a160-long toe.
aprons=[]
for name, thickness, fold_depth, length, cantilever in [
    ("primary",.7,25,580,True),("secondary",.5,6,360,False),
]:
    developed_factor=(25**2+fold_depth**2)**.5/25
    inertia=thickness*developed_factor*fold_depth**2/12
    shape={"I":inertia,"Z":2*inertia/fold_depth}
    check=beam_screen(.00225,length,shape,cantilever)
    assert check["stressMPa"]<allowable and check["deflectionMm"]<5
    aprons.append({"name":name,"material":"316L","thickness":thickness,
        "foldDepth":fold_depth,"pitch":50,"unbracedLength":length,
        "cantilever":cantilever,**check})
secondary_rail=beam_screen(2.25*.650/2,p_perimeter*1000/64,section(25,20,2))
assert secondary_rail["stressMPa"]<allowable and secondary_rail["deflectionMm"]<3
primary_apron_rear_clearance=260-25/2-.7/2-(primary["inner"]+40)-10-6
secondary_to_primary=primary["inner"]-146-(6000+primary["radius"])*17e-6*80-10-3
assert primary_apron_rear_clearance>20 and secondary_to_primary>2

leader_length = 8.4
leader_water = pi*.15**2/4*leader_length*1000
leader_copper = pi*(.154**2-.15**2)/4*leader_length*8940
leader_gravity = (1.35*(75+leader_copper)+1.5*(40+leader_water))*9.81/1000
leader_wind = 2.25*.25*1.5
top_arm = section(160,200,3)
top_lever = head["axis"]+332.5
head_vertical_wind = 2.25*(.25*(head["nearest"]-primary["outer"])
    +.45*(head["farthest"]-head["nearest"]))/1000
top_vertical_load = (leader_gravity+head_vertical_wind)*1000
top_wind_couple = leader_wind*1000*(7400-6240)
top_moment = top_vertical_load*top_lever+top_wind_couple
top_stress = top_moment/top_arm["Z"]
top_drop = 360
top_deflection = top_vertical_load*top_lever**3/(3*180000*top_arm["I"])
top_deflection += top_wind_couple*top_lever**2/(2*180000*top_arm["I"])
top_deflection += top_moment*top_drop*top_lever/(180000*top_arm["I"])
top_deflection += top_vertical_load*top_drop/(180000*top_arm["area"])
top_arm_mass = top_arm["area"]*.008*(top_lever+top_drop)/1000
fork = section(30,60,3)
fork_load = top_vertical_load/2
fork_stress = fork_load*260/fork["Z"]
fork_deflection = fork_load*260**3/(3*180000*fork["I"])
plate_width, plate_thickness = 37,14
plate_inertia = plate_width*plate_thickness**3/12
plate_stress = (fork_load*220/4)/(2*plate_inertia/plate_thickness)
plate_deflection = fork_load*220**3/(48*180000*plate_inertia)
head_support_deflection = top_deflection+fork_deflection+plate_deflection
assert max(top_stress,fork_stress,plate_stress) < allowable
assert head_support_deflection < 6 and top_arm_mass < 32
fork_mass = 2*fork["area"]*.008*.260
plate_mass = (.240**2-pi*.166**2/4)*.014*8000
shoulder_mass = pi*(.180**2-.154**2)/4*.008*8000
head_mass_schedule = {"armAndDrop":top_arm_mass,"twoForks":fork_mass,
    "splitBearingPlate":plate_mass,"positivePipeShoulder":shoulder_mass,
    "normalBodyBackingAndClips":6,"catchLinerBackingAndClips":11,
    "spout":4,"return":5,"catchPostsAndCrossRails":3,"rootPlatesAndFasteners":5}
assert sum(head_mass_schedule.values()) < 75
arm_to_gutter=lower_min-carrier_below_bed-6340-10-8-6-2
assert arm_to_gutter>5
renewal_geometry=[]
for row in head_rows:
    fork_passage=(190-180)/2-3
    collar_passage=(194-180)/2-3
    pipe_bottom_after_lift=6000+800
    clear_above_collar=pipe_bottom_after_lift-row["pipePenetration"]["upstandTop"]-15
    spout_above_catch=row["normalFloor"]+350-row["catchRim"]-15
    assert min(fork_passage,collar_passage,clear_above_collar,spout_above_catch)>0
    # Each part enters the whole guarded bay before its inner gate closes.
    # The outer gate then opens while the worker stays behind the side guard.
    # A second900 mm captured translation reaches the empty ground nest.
    landed_parts = [
        {"part":"spout", "radial":[1650,2165], "halfWidth":125,
         "height":primary["backDepth"]+5},
        {"part":"head and upper spool", "radial":[2005,2195], "halfWidth":95,
         "height":row["normalRim"]-6000},
        {"part":"catch and complete return", "radial":[1630,2290], "halfWidth":225,
         "height":row["catchRim"]-row["return"]["exitFloor"]},
    ]
    for part in landed_parts:
        near, far = part["radial"]
        part["bayEdgeReserve"] = min(near-1600,2350-far,300-part["halfWidth"])-10
        part["groundRadial"] = [near+900,far+900]
        part["groundNestReserve"] = min(near+900-2500,3250-far-900,
                                         300-part["halfWidth"])-10
        part["hoistHeadroomAfter100RestLift100Rig"] = 8350-(6800+100+part["height"]+100)
        assert min(part["bayEdgeReserve"],part["groundNestReserve"],
                   part["hoistHeadroomAfter100RestLift100Rig"]) > 0
    worker_guard_gap = (-350-10)-(-700+300)
    body_to_part = 700-300-max(part["halfWidth"] for part in landed_parts)
    control_reach = ((-420+700)**2+(7500-7850)**2)**.5
    assert worker_guard_gap >= 40 and body_to_part >= 175 and control_reach < 650
    # Only these two normal heads need this large temporary transfer bay.
    # The plan is checked against the actual reserved paths, receivers, dock
    # and independent diversion sole-board fields.
    def world_box(radial, along):
        y = 12000+radial[0] if row["face"]=="north" else -radial[1]
        return [row["station"]+along[0],y,along[1]-along[0],radial[1]-radial[0]]
    works_fields = {
        "deck":world_box([1600,2400],[-1200,400]),
        "groundNest":world_box([2500,3250],[-300,300]),
        "groundOperator":world_box([2600,3200],[-1000,-400]),
        "closedTransferLane":world_box([1600,3250],[-300,300]),
    }
    for name, field in works_fields.items():
        assert not [item for item in exclusions if all(overlap(field,item))], (row["face"],name)
    renewal_geometry.append({"face":row["face"],"upperSpoolLowerJointZ":6000,
        "firstSpoutLift":350,"firstSpoutOutwardTransfer":1130,
        "headAndUpperSpoolLift":800,"headOutwardTransfer":970,
        "maximumJointAndShoulderOD":180,"forkPassageAfter3":fork_passage,
        "collarPassageAfter3":collar_passage,
        "pipeBottomAboveCollarAfter15":clear_above_collar,
        "spoutAboveCatchAfter15":spout_above_catch,
        "catchRearTopOpenNotchWidth":200,"spoutWidthAtNotch":180,
        "temporaryDeckRadial":[1600,2400],"temporaryDeckAlong":[-1200,400],
        "temporaryDeckZ":6400,"workerCentreRadialAlong":[2000,-700],
        "workerBodyRadius":300,"guidedTrolleyAlong":0,
        "guidedTrolleyZ":8350,"maximumCapturedHeadAssemblyKg":25,
        "firstRestRadialAlong":[2100,0],"firstRestBaseZ":6800,
        "catchOutwardTransfer":1030,"transferBayRadial":[1600,2350],
        "transferBayAlong":[-300,300],"workerSideGuardAlong":-350,
        "workerHeight":2000,"workerToSideGuard":worker_guard_gap,
        "workerToMovingPart":body_to_part,
        "handDriveRadialAlongZ":[2000,-420,7500],"handDriveReach":control_reach,
        "landedParts":landed_parts,"liftOffRest":100,"secondOutwardTransfer":900,
        "groundNestRadial":[2500,3250],"groundNestAlong":[-300,300],
        "groundWorkerRadialAlong":[2900,-700],"worksPlanFields":works_fields,
        "gateOrder":"Keep the outer and side gates locked during receipt. Close the inner gate after the whole part enters. The worker remains outside the transfer bay.",
        "offRestOrder":"Close the inner gate and retain the worker-side guard. Capture and lift100 from the rest, open only the outer part gate, translate900 outward and lower into the closed empty ground nest. The ground worker stands beside that nest. Restore the outer gate before receiving another part.",
        "clearRestBeforeNextPart":True})
leaders = {"number":4,"clearDiameter":150,"copperWall":2,
    "maximumSuspendedLengthM":leader_length,"dryPipeKgEach":leader_copper,
    "blockedPipeWaterKgEach":leader_water,"additionalHeadDryWaterKg":[75,40],
    "factoredVerticalRootKNEach":leader_gravity,"upperWindTributaryM":1.5,
    "upperGrossWindWidth":250,"factoredWindKNEach":leader_wind,
    "firstFacadeRestraintZ":6000,"remainingFacadeRestraintMaximumPitch":1200,
    "roofArm160x200x3StressMPa":top_stress,"roofArmDeflectionMm":top_deflection,
    "wholeHeadSupportDeflectionMm":head_support_deflection,
    "armCentreZ":6240,"armTopZ":6340,"rootDropFrom6600":top_drop,
    "armStopsBeforePipeRadial":1000,"forksRadial":[1000,1260],
    "forkCentresAlong":[-110,110],"forkSection":[30,60,3],
    "forkStressMPa":fork_stress,"forkDeflectionMm":fork_deflection,
    "plateSize":[240,240,14],"platePipeHole":166,"plateRemovableHalves":2,
    "plateStressMPa":plate_stress,"plateDeflectionMm":plate_deflection,
    "normalUpperSpoolMaterial":"316L, 150 clear bore and 2 wall, to the joint at Z6000",
    "normalUpperSpoolShoulderOD":180,"normalSpoolLowerJointMaximumOD":180,
    "headMassSchedule":head_mass_schedule,"completeScheduledHeadDryKg":sum(head_mass_schedule.values()),
    "headDryAllowanceKg":75,"headVerticalWindKN":head_vertical_wind,
    "requiredVerticalRootMomentKNm":leader_gravity*1000*top_lever/1e6,
    "combinedLocalMomentIncludingHeadWindKNm":top_moment/1e6,
    "armBelowGutterAfter10Setting8Gutter6Arm2Root":arm_to_gutter,
    "wallHoopStressAt100kPaMPa":.1*150/(2*2),
    "oneDrained1200SpoolCopperKg":leader_copper*1.2/leader_length}

movement = read("rof/studies/roof_water_movement.json")
assert movement["courtWidthMM"] == 260


def movement_bound(label, field="rangeMM"):
    rows = [row for row in movement["queries"] if label in row["label"]]
    assert rows, label
    return max(abs(value) for row in rows for value in row[field])


primary_roll = movement_bound("cross-section R520 minus R170")
lower_roll = movement_bound("cross-section R670 minus R125")
dry_release = movement_bound("moving R170 minus lower R670", "dryDiversionRangeMM")
dry_extra_lever = movement_bound("cross-section R520 minus R170", "dryDiversionRangeMM")*40/350
dry_release += dry_extra_lever+sum(row["dryReleasedSupportDeflectionWithSameWind"] for row in frames)
return_differential = movement_bound("return R1260 minus R600 at actual lower root")
return_differential += head_support_deflection+frames[1]["wholeSupportDeflectionAtCombinedLoad"]
movement_receipt = {
    "primaryLocalPlusCollectorRoll":primary_roll+frames[0]["wholeSupportDeflectionAtCombinedLoad"],
    "lowerLocalPlusCollectorRoll":lower_roll+frames[1]["wholeSupportDeflectionAtCombinedLoad"],
    "dryReleaseIncluding40ExtraLeverAndBothLocalFrames":dry_release,
    "headReturnIncludingBothLocalFrames":return_differential,
    "adoptedBudgets":[11,19,20,30],
}
for key, limit in zip(list(movement_receipt)[:4], movement_receipt["adoptedBudgets"]):
    assert movement_receipt[key] < limit, (key,movement_receipt[key],limit)

report = {"heads":head_rows,"facade":facade,"frames":frames,"leaders":leaders,
    "aprons":aprons,"secondaryRail25x20x2":secondary_rail,
    "fixedPrimaryApronToeRadial":260,
    "primaryApronToReleasedRearAfter10Setting6Movement":primary_apron_rear_clearance,
    "secondaryToPrimaryAfterThermal10Setting3Movement":secondary_to_primary,
    "headRenewalGeometry":renewal_geometry,
    "joinedMovementReceipt":movement_receipt,
    "blockedReliefOutlet":relief_emergency,
    "steelScreen":{"requiredProofAt100C":165,"factor":1.1,"E":180000},
    "renewal":[
        "Commission the full independent over-roof diversion and close the ground receiving lane.",
        "Capture, isolate and drain the head and both pipe sides. Unbolt the flat spout joints and withdraw their loose metal gaskets. The joints have no axial pilot. Lift the tapered spout350 through the200-wide top-open catch notch, then transfer1130 outward into the gated bay.",
        "Capture the head and upper316L spool. Support the retained lower pipe, release its joint at6000, and remove the two bearing-plate halves from the fork. Lift the head and spool800. The180-maximum shoulder and joint pass the190 fork and194 dry collar. Transfer970 outward to the separately supported rest, then lower to ground before the next part.",
        "Release the independent return and catch clips. Lift the catch300 and transfer it1030 outward into the gated bay. The primary and relief bodies remain on their own roots. Restore the split bearing plate before returning a supported head.",
        "Capture the gutter module and its shallow crossarms before releasing their fork pins. Retained roots end at radial160 primary and105 relief.",
        "Move the primary40 outward,165 down, then360 outward. Its full27-deep carrier and relative allowances are included in the edge comparison.",
        "Remove the secondary apron under diversion before exchanging a relief module. Retained primary bodies remain supported by their independent roots.",
        "Restore root locks, normal joints and independent catches. Demonstrate ordinary flow, blocked outlet and leaked head before withdrawing diversion."
    ],
    "qualification":[
        "Qualify exact sheet/section properties, all formed joints, welds, dry sliding contacts, root plates and masonry/collector attachments at their reported actions.",
        f"Demonstrate the complete head, annular drip and half-obstructed return at{normal_q:.6f}L/s, including wind, inlet momentum, setting and movement.",
        "Copper head, pipe and retained-joint pressure duties include the whole blocked column. The100kPa wall calculation gives demand only.",
        "Facade restraints carry wind to the actual piers and floor zones. Their anchors, thermal closures and water shedding need the BCR/DEL detail and wet demonstration.",
        "The remaining margin within50kg/m covers apron ribs, clips and minor metalwork. No installed polymer exception is added."
    ]}

if __name__ == "__main__":
    print(json.dumps(report,indent=2))
