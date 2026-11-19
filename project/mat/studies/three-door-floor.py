"""Compare the three threshold boundaries on one drained, suspended RC floor."""
import argparse
import json
import math
from pathlib import Path

from three_door_floor_figure import drawing

HERE = Path(__file__).resolve().parent
OUT = HERE / "three-door-floor.json"


def read(name):
    return json.loads((HERE / (name + ".json")).read_text())


def dry_sill(width, beam, one_wheel, face, jamb_offset, panels):
    # All section distances n increase into the house from the outer weather face.
    # The gasket lies on a vertical plane. Its two vertical legs are coplanar.
    bottom, top, gasket = -45, 225, 12
    outer, inner = face-28, face+112
    clear, contact, steel = 100, 20, 16
    centre_span = clear + contact
    service_load = 5000
    strip_width = 25
    stress = lambda force, thickness: 1.5 * force * centre_span / (strip_width * thickness**2)
    u_width, rise = width + 2*jamb_offset, top-bottom
    area = gasket * (u_width + 2*rise)
    # A catalogue flange factor supplies a comparison pressure only.
    pressure = 1000 * 0.006894757293
    pitch, bar_width, E = 100, 40, 193000
    line = pressure * gasket
    bars = {}
    for thickness in (8, 10):
        inertia = bar_width * thickness**3 / 12
        bars[thickness] = {
            "stressMPa": 6 * line*pitch**2/8 / (bar_width*thickness**2),
            "deflectionMm": 5*line*pitch**4 / (384*E*inertia),
        }
    return {
        "roughWidthMm": width, "beamInwardMm": beam, "gasketPlaneN": face,
        "gasketBottomAndTopZ": [bottom, top], "uprightCentresOutsideRoughEachMm": jamb_offset,
        "gasketBlankWidthHeightMm": [u_width+gasket, rise+gasket/2],
        "graphiteAreaMm2": area, "projectedFlangeFactorPressureMPa": pressure,
        "closedClampForceKN": area*pressure/1000, "forcePer100MmTributaryKN": line*pitch/1000,
        "barSimplySupportedComparison": bars, "lidInwardMm": [outer,inner],
        "toolOpeningN": [outer+contact,inner-contact], "toolSpaceAfter10BarMm": inner-contact-(face+10),
        "lidSeatMinimumHorizontalBeamReserveMm": min(outer-beam[0], beam[1]-inner),
        "lidPlateSteelMm": steel, "lidLengthsMm": panels,
        "largestLidPlateKg": max(panels)*(clear+2*contact)*steel*7900/1e9,
        "seatCentreSpanMm": centre_span, "oneWheelAt16MPa": stress(one_wheel,steel),
        "fiveKNAt12MPa": stress(service_load,12), "fiveKNAt16MPa": stress(service_load,steel),

    }


def result():
    front, plant, field, pour, court = map(read, ("front-threshold", "plant-threshold",
        "ground-field-assembly.results", "floor-pour-boundary.results", "court-air-path.results"))
    doors = {d["id"]: d for d in field["threeDoorTransitions"]}
    assert [doors[k]["width"] for k in ("front-door","plant-replacement","grand-court-entry-south")] == [1800,1400,1800]
    assert field["unchangedFloor"]["z"] == [0,-15,-80,-180,-380]
    assert field["supportAwareRoomField"]["outer"][:2] == [429.5,429.5]
    fw, pw = front["water"], plant["water"]
    wheel = plant["plateComparison"]["oneWheelIncluding1p5_N"]
    fb = dry_sill(doors["front-door"]["width"], front["bearing"]["beamY"], wheel, 480, 25, [450]*4)
    east_wall = 12000
    pb = dry_sill(doors["plant-replacement"]["width"],
        [east_wall-x for x in reversed(plant["section"]["outerBeamX"])], wheel, 278, -100, [100]+[275]*4+[100])
    house = read("../../had/studies/water-replan")["model"]
    room = read("plant-room-rewind")
    ymin, ymax = plant["opening"]["roughY"]
    def cover_window(plate, end_inset):
        n0,n1=plate["lidInwardMm"]
        return [east_wall-n1, ymin+end_inset, n1-n0, ymax-ymin-2*end_inset]
    old_window, new_window = cover_window(fb,0), cover_window(pb,50)
    bodies = {"HAD controls":house["groundFurniture"]["plant-controls"],
              "W9 proposed controls":room["proposal"]["controls"],
              "60 mm wall controls":room["wallNorth60Control"]["controlsRect_mm"],
              "W9 machine":room["proposal"]["W9"], "W9 service zone":room["proposal"]["W9FrontSouth600"]}
    def geometry(box, body):
        overlaps = [min(box[i]+box[i+2], body[i]+body[i+2])-max(box[i], body[i]) for i in (0,1)]
        return {"overlapXY": [max(0,value) for value in overlaps],
                "clearanceXY": [max(0,-value) for value in overlaps]}
    room_check = {key: {"body": body, "common": geometry(old_window, body), "recessed": geometry(new_window, body)}
                  for key,body in bodies.items()}
    assert room_check["W9 proposed controls"]["common"]["overlapXY"] == [140,197]
    assert room_check["60 mm wall controls"]["common"]["overlapXY"] == [140,257]
    assert room_check["W9 proposed controls"]["recessed"]["clearanceXY"][0] == 39.5
    def disk_gap(point, rect):
        return math.hypot(*(max(rect[i]-point[i], 0, point[i]-rect[i]-rect[i+2]) for i in (0,1)))-300
    stow = [11140,4220,170,300]
    stations = {}
    for label, point, target_y, open_y in (("south",(11672,4470),4000,3950),("north",(11672,4775),5200,5150)):
        horizontal = math.hypot(point[0]-(east_wall-pb["gasketPlaneN"]),point[1]-target_y)
        clear_gap = min(disk_gap(point, rect) for key,rect in bodies.items() if key!="W9 service zone")
        stations[label] = {"centre":list(point), "nearestFixedPlanGapMm":clear_gap,
            "openEndCoverGapMm":disk_gap(point,[new_window[0],open_y,new_window[2],100]),
            "restGapMm":disk_gap(point,stow), "upperJambReachMm": math.hypot(horizontal,550-225),
            "minimumHandZFor600Reach":550-math.sqrt(600**2-horizontal**2),
            "upperDriveReachMm":math.hypot(horizontal,550-255)}
    assert all(x["nearestFixedPlanGapMm"]>=25 and x["upperDriveReachMm"]<=600 for x in stations.values())
    assert all(x["restGapMm"]>=25 and x["openEndCoverGapMm"]>=25 for x in stations.values())
    true_crest = front["occurrence"]["oas"]["crest"]
    inner_dam = front["bearing"]["backdamZ"]
    assert inner_dam == pw["dryBackdam"] and true_crest == plant["section"]["normalCrest"]
    front_level = fw["idealLowReliefEnergyLevel"]+5
    plant_level = pw["returnFlow"]["upperLevelWithLoss"]
    court_stage = pour["courtWallTray"]["quietStageZ_mm"]
    ledger = court["joinedCandidate"]["finiteAirLedger"]
    budget = pour["airAndCapillaryRegister"]["openingFamily_m3_h_at50Pa"]
    assert budget == ledger["sharedAllOpeningsBudget_m3_per_h"]
    shared_remaining = budget-ledger["conditionalIdealSubtotal_m3_per_h"]
    width_m = (fb["gasketBlankWidthHeightMm"][0]+pb["gasketBlankWidthHeightMm"][0]-2*12)/1000
    slit_coefficient = math.sqrt(2*50/1.2)*3600*.001*width_m
    # Full-length unbacked open slit, uniform height in mm. Perimeter test replaces this diagnostic.
    candidate = {
        "floor":field["unchangedFloor"]["z"], "masonryDpc":field["unchangedFloor"]["innerDpc"],
        "front":fb, "plant":pb, "eastOccupation":{"commonCover":old_window, "recessedCover":new_window,
            "states":room_check, "recessedGasketUprightY":[ymin+100,ymax-100],
            "endLidNotchN":[250,312], "southNorthCutoutY":[[3950,4030],[5170,5250]],
            "uprightHardwareMaxN":302,"endLiftMm":35,"endTranslationMm":80,
            "undersideAfterLiftMm":35-pb["lidPlateSteelMm"],"lateralGapAfterReleasingNotchMm":3950+80-4020,
            "oneEdgeNotchClashWithW9Mm":62-room_check["W9 proposed controls"]["recessed"]["clearanceXY"][0],
            "crewStations":stations, "singlePanelRest":stow,
            "guidedExtensionMm":300,"clearanceFor36Head25Bit15ReleaseMm":pb["toolSpaceAfter10BarMm"]-36-25-15,
            "clearanceFor51Head25Bit15ReleaseMm":pb["toolSpaceAfter10BarMm"]-51-25-15,
            "uprightHardwareMaxWidth":40, "lowerCheekTrimRemovedBeforeEndLid":True,
            "guaranteedCargoY":plant["opening"]["clearY"],
            "lidToFinishedRevealMm":new_window[1]-room["sourceRoles"]["eastArchitecturalFinishedMouthY"][0],
            "proposedPanDryHeelX":east_wall-(pb["gasketPlaneN"]-45),"proposedPanToeX":12045,
            "proposedPanHeelZ":-60+(12045-(east_wall-pb["gasketPlaneN"]+45))/80},
        "primaryWater": {"courtQuietZ":court_stage, "courtGeometricReturnZ":15,
            "frontBlockedPipeZ":front_level, "frontToeZ":front["bearing"]["panToeYZ"][1],
            "frontToDryReturnMm":inner_dam-front_level,
            "plantBlockedPipeZ":plant_level,"plantToeZ":-60,
            "plantToDryReturnMm":inner_dam-plant_level, "bothOuterDryReturnZ":inner_dam,
            "surfaceCrossingZ":true_crest},
        "sharedAir":{"familyM3h":budget,"courtConditionalM3h":ledger["conditionalIdealSubtotal_m3_per_h"],
            "unallocatedAfterCourtM3h":shared_remaining,"twoNewBottomGasketCentrelinesM":width_m,
            "uniformHalfMmOpenSlitM3h":.5*slit_coefficient,"uniformOneMmOpenSlitM3h":slit_coefficient,
            "hypotheticalGapConsumingAllRemainingMm":shared_remaining/slit_coefficient,
            "floorWallSeparateFamilyM3h":pour["airAndCapillaryRegister"]["singleFloorWallFamily_m3_h_at50Pa"]},
        "exposure":{"occupiedUpperCores":len(field["confirmedSourceProposedSupportCrossings"]),
            "fieldSeamM":field["panelLayout"]["sharedButtSeamLength_m"],
            "fieldCostGBPexVAT":field["stockPriceScreen"]["oneFullSheetPerOccupiedSlot_GBP_withoutVAT"],
            "solumWestLipAtMatchingExterior":pour["solumFallTrial"]["westLipAtUniformExterior"],
            "solumEastEdgeAtMatchingExterior":pour["solumFallTrial"]["eastEdgeAtUniformExterior"]},
        "materialBounds":{"foilThicknessMm":1,"rollWidthMm":500,"standardRollLengthM":50,
            "largerRollWidthMm":1500,
            "onePairSequential500RollLengthMm":sum(p["gasketBlankWidthHeightMm"][0] for p in (fb,pb)),
            "tenGrossLidPlatesKg":sum(sum(p["lidLengthsMm"])*140*16*7900/1e9 for p in (fb,pb)), "jointFreeFullFrameFitsMaximumStockWidth":
            {k:v["gasketBlankWidthHeightMm"][0]<=1500 for k,v in (("front",fb),("plant",pb))},
            "thermalConductanceOfTwoContinuousBladesWK":15*.0015*width_m/.1},
        "scope":"Dry-site development. No site, as-built flange, material exception, downstream water, thermal or occupancy qualification.",
    }
    assert fb["barSimplySupportedComparison"][8]["stressMPa"] > 200/1.1 > fb["barSimplySupportedComparison"][10]["stressMPa"]
    assert fb["fiveKNAt12MPa"] > 200/1.1 > fb["fiveKNAt16MPa"]
    assert all(x["lidSeatMinimumHorizontalBeamReserveMm"]>0 for x in (fb,pb))
    assert front_level > candidate["primaryWater"]["frontToeZ"] and plant_level < -60
    assert .5*slit_coefficient < shared_remaining < slit_coefficient
    return candidate


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--check", action="store_true")
    args = cli.parse_args()
    data = result()
    outputs = {OUT:json.dumps(data,indent=2,ensure_ascii=False)+"\n", OUT.with_suffix(".svg"):drawing(data)}
    for target, content in outputs.items():
        if args.check:
            if target.read_text()!=content:
                raise SystemExit(f"Stale {target.name}")
        else:
            target.write_text(content)
