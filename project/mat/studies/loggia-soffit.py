"""Geometry, signed support demand and first release for the exposed loggia field."""
import argparse
import json
from math import pi
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]


def source(relative):
    return json.loads((PROJECT / relative).read_text())


def section():
    house = source("had/studies/water-replan.json")["model"]
    old = source("mat/studies/loggia-envelope-section.json")
    ordinary = source("mat/studies/loggia-roof-edge.json")["ordinaryWall"]["roomToWeather"]
    structure = source("str/studies/open-loggia-support.json")
    slab = next(field for field in structure["floor_fields"] if field["id"] == "above-loggia")
    portal = house["insulatedPortal"]
    x, y, width, length = house["loggia"]["clear"]
    south, north = portal["courtFaces"][1], portal["gardenFaces"][0]
    underside = old["upper"]["rcSoffit"]
    assert (x, y, width, length) == (4800, 7750, 2400, 4250)
    assert old["upper"]["glass"] == 240 and old["upper"]["underside"] == 2890
    assert slab["rectangle"] == [4377.5, 8082.5, 7622.5, 11667.5] and slab["section"]["cover"] == 25
    assert "H12/150 bothfaces/twoaxes" in source("str/studies/current-house-lateral.json")["horizontalRoute"]["firstFloor"]
    assert ordinary == [27, 140, 110, 50, 102.5]
    assert old["wallAxes"] == [4377.5, 7622.5] and [v for _, v in old["wallLayers"]] == [27, 140, 200, 50, 102.5]
    assert house["shell"] == 12000
    west = next(w for w in house["groundWalls"] if w["id"]=="loggia-west-weather")
    assert west["structuralCore"] == [4307.5,4447.5] and west["finishedFaces"] == [4280.5,4800]
    face = west["structuralCore"][1]
    assert face + 200 + 50 + 102.5 == x
    return {
        "walk": [x, y, width, length], "flat": [x, south, width, north-south],
        "portalFaces": [portal["courtFaces"], portal["gardenFaces"]],
        "pier": portal["piers"]["westEW"], "tieBottom": portal["tie"]["underside"],
        "slab": slab["rectangle"], "slabZ": [underside, old["upper"]["rcTop"]],
        "westX": [face-167, face-140, face, face+200, face+250, x],
        "northOrdinaryY": [12000-sum(ordinary), 11597.5, 11737.5, 11847.5, 11897.5, 12000],
        "z": {"floor": 3450, "glassBottom": underside-240, "railTop": 2963,
              "railBottom": 2923, "ribBottom": 2915, "finish": 2890, "brickHead": 2870},
        "normalCoverX": house["northNormalRoute"]["normal"]["westLoggia"][:3:2],
        "fireField": structure["fire_field_comparator"],
    }


def build():
    sec = section()
    x, y, width, length = sec["flat"]
    dx = 600
    bays = [450, 450, 300, 450, 300, 450, 410]
    assert length == sum(bays) == 2810 and width == 4*dx
    rows = [y]
    for pitch in bays:
        rows.append(rows[-1]+pitch)
    hangers = [[x+300+dx*i, yy] for yy in rows for i in range(4)]
    catches = [[x+600+1200*i, yy] for yy in rows for i in range(2)]
    # Trial mesh centres and tolerances; source gives pitch/diameter, not phase.
    def nearest_bar(value, phase):
        return abs((value-phase+75) % 150-75)
    x_clear = min(nearest_bar(xx, 5025)-25-6 for xx, _ in hangers)
    y_clear = min(nearest_bar(yy, 8375)-8-6 for _, yy in hangers)
    catch_x = min(nearest_bar(xx, 5025)-37.5-6 for xx, _ in catches)
    catch_y = min(nearest_bar(yy, 8375)-10-6 for _, yy in catches)
    assert min(catch_x,catch_y)-5 >= 21
    sx, sy, ex, ey = sec["slab"]
    edge = min(min(xx-sx, ex-xx, yy-sy, ey-yy) for xx, yy in hangers)
    assert (x_clear, y_clear, edge) == (44, 41, 387.5)
    # Each independent 1200 rail has two supports, 300 overhangs, 600 span.
    # Integrated positive and negative support influence lengths are 675/75 mm.
    spans = [(a+b)/2000 for a,b in zip([0]+bays, bays+[0])]
    tributary = max(spans)
    rail_kg = (40*35-34*29)/1e6*8000           # RHS 40 high by 35, 3 wall
    glass_kg = .240*110
    render_kg = .025*2000
    area = width*length/1e6
    # A blocked glass catch cannot discharge through a frame-to-frame joint.
    # Allow 20 mm folded upstands on each independent 1 mm steel catch tray.
    panel_count = 4*len(bays)
    folds_m2 = 4*sum(2*(.6+h/1000)*.02 for h in bays)
    upper_folds_m2 = sum(2*(2.4+5*h/1000)*.02 for h in bays)
    # Three ribs per 600 tray, one per 300 half-tray. Each layer carries its
    # own pieces. Full sheet mass also covers the pierced upper tray.
    rib_m = (4*3+3*3+2)*length/1000
    ledger_kg_m = (20**2-18**2)*8000/1e6       # 20 × 20 × 2 angle
    items = {"glass":glass_kg, "wetRender":render_kg, "ribLath":1.5,
             "panelFramesAndCaptives":2.1*panel_count/area,
             "lowerCatchTrays":(area+folds_m2)*8/area,
             "upperTrays":(area+upper_folds_m2)*8/area,
             "formedTrayRibs":rib_m*.070*.0012*8000/area,
             "mainRails":rail_kg*8*2.4/area,
             "upperAndLowerLedgers":2*8*2.4*ledger_kg_m/area,
             "rodsAndEndHardware":len(hangers)*(.27*pi*.010**2/4*8000+.2)/area,
             "catchRodsAndCartridges":len(catches)*(.27*pi*.012**2/4*8000+.5)/area}
    wet_kg = sum(items.values())
    g = wet_kg*9.81/1000
    down, up = 1.35*g+1.5*1.5, 1.5*1.5-.9*g
    max_down = tributary*(.675*down+.075*up)
    max_up = tributary*(.675*up+.075*down)
    inertia = (35*40**3-29*34**3)/12
    # Positive load on both overhangs and reversed load on internal half-span
    # gives a conservative absolute moment using the absolute influence area.
    # The worst support cantilever moment is w*a²/2; centre moment can receive
    # the opposite sign on both overhangs plus the centre triangle.
    moment = tributary*max(down,up)*(.3**2/2+.6**2/8)
    flooded_down = down+1.35*(20+.15*glass_kg)*9.81/1000
    # Lose one outer hanger of one 1200 rail. A centre catch then has
    # influence ordinates +3..0..−1; the surviving hanger has −2..0..+2.
    # Bounded linear arrest with gap <=0.5, static deflection 1..2 mm.
    catch_factor = 1+(1+2*.5/1.)**.5
    catch_peak = tributary*(1.35*flooded_down+.15*up)*catch_factor
    surviving_peak = tributary*.6*(flooded_down+up)*catch_factor
    catch_moment = tributary*max(flooded_down,up)*.6**2/2*catch_factor
    tray_span = 150
    # Strip of unit width with simply supported 150 mm span. Also price each
    # proposed folded rib as only two 20 x 1.2 webs; ignore its flange stiffness.
    tray_stress = 6*(flooded_down/1000)*tray_span**2/8
    tray_deflection = 5*(flooded_down/1000)*tray_span**4/(384*193000/12)
    rib_inertia = 2*1.2*20**3/12
    rib_moment = (flooded_down/1000)*150*450**2/8
    rod_root = 8.16
    rod_euler = pi**2*193000*(pi*rod_root**4/64)/270**2/1000
    mass = .6*.45*(render_kg+1.5)+2.1
    floors = {"dry": {"finishKgMax":mass, "glassPieceKg":.6*.45*.12*110},
              "grid": {"bayY":bays, "railY":rows, "hangersXY":hangers,"catchXY":catches,
                       "fieldAreaM2":area, "returnAreaInWalkProjectionM2":10.2-area,
                       "lowerGlassBays":4*7, "staggeredUpperPieces":5*7,
                       "railKgPerM":rail_kg,"wetKgPerM2":wet_kg,"massKgPerM2":items},
              "signed": {"downKPa":down,"upKPa":up,"maxTributaryM":tributary,
                         "maxHangerDownKN":max_down,"maxHangerUpKN":max_up,
                         "floodedDownKPa":flooded_down, "floodedHangerDownKN":tributary*(.675*flooded_down+.075*up),
                         "sheetStressMPa":tray_stress,"sheetDeflectionMM":tray_deflection,
                         "ribStressMPa":rib_moment*10/rib_inertia,
                         "ribDeflectionMM":5*(flooded_down/1000)*150*450**4/(384*193000*rib_inertia),
                         "railMomentKNmBound":moment,"railStressMPaBound":moment*1e6*20/inertia,
                         "lossCatchFactor":catch_factor,"lossCatchPeakKN":catch_peak,
                         "survivingHangerPeakKN":surviving_peak,"lostHangerRailMPa":catch_moment*1e6*20/inertia,
                         "rodRootEulerPinnedKN":rod_euler,"rodRootEulerCantileverKN":rod_euler/4},
              "castInsert": {"article":"1074A10S","length":60,"thread":["M10",35],
                             "bodyOD":16,"crossPin":[6,50],"axialShearRatedKg":[600,400],
                             "minimumEdgeSpacingSlab":[75,150,85],"fieldEdge":edge,
                             "meshXYPhase":[5025,8375],"steelSurfaceClearXY":[x_clear,y_clear],
                             "relativePositionBudget":5,"barClearTrial":21,
                             "catchArticle":"1074A12S","catchBodyOD":20,"catchCrossPin":[10,75],
                             "catchThread":["M12",20],"catchLength":50,"catchSurfaceClearXY":[catch_x,catch_y]}}
    assert max_down < 1.4 and max_up < .8 and floors["signed"]["railStressMPaBound"] < 115
    assert catch_peak < 8.83 and surviving_peak < 5.88 and catch_moment*1e6*20/inertia < 200
    # Whole field conduction of primary and catch shanks. Rail tips enter
    # 33 mm of the 240 mm course; do not double-count their width as steel
    # through the full depth.
    def u(thickness): return 1/(.4+thickness/.041)
    cut = 8*.035*2.4/area
    steel = (len(hangers)*.010**2+len(catches)*.012**2)*pi/4*(15-.041)/(.24*area)
    thermal = {"wallU110": 1/(.13+.027/.57+.140/.77+.110/.041+.04),
               "wallU200": 1/(.13+.027/.57+.140/.77+.200/.041+.04),
               "floorU240":u(.24), "railNotchAreaFraction":cut, "rodDeltaU":steel,
               "railOnlyComparison":(1-cut)*u(.24)+cut*u(.207)+steel,
               "allFieldWorstNotchAndRods":u(.240-.002-.033-2*.020)+steel}
    from loggia_soffit_heat import wall_head
    thermal["wallHead2D"] = [wall_head(step, bridge) for step in (20,10) for bridge in (False,True)]
    assert thermal["wallHead2D"][-1]["fromRoomWPerM"] > thermal["wallHead2D"][-2]["fromRoomWPerM"]
    # This is a temporary works envelope and load budget, not a tower rating.
    feet = [5390, 6800]
    load, component = 2., .35
    overturn = load*(feet[0]-4850)/1000 + component*(feet[0]-5100)/1000
    restoring = 2.4*(6150-feet[0])/1000
    cover0, cover_width = sec["normalCoverX"]
    support = {"footLinesX":feet, "footSize":200,"floorClearToTrough":feet[0]-100-cover0-cover_width,
               "deckX":[4850,7150],"deckZ":950,"ballastKN":2.4,"ballastX":6150,
               "overturnKNm":overturn,"restoringKNm":restoring,"ratio":restoring/overturn,
               "nearFootLineKN":load+component+2.4-(restoring-overturn)/((feet[1]-feet[0])/1000),
               "eastOverturnKNm":load*.350+component*.100,"eastRestoringKNm":2.4*.650,
               "stageAxisYRange":[8970,10780],"footYOffsets":[-400,400],"largestPanelHalfDiagonal":(.6**2+.45**2)**.5/2*1000}
    support["cornerToolReach"] = ((2890-100-(950+1450))**2+2*295**2)**.5
    assert support["cornerToolReach"]<600
    assert support["ratio"]>1.5 and support["floorClearToTrough"]==65
    # At the outer north end the 110 mm ordinary glass overlaps only part
    # of the lower 240 mm axial portal wrap. Glass cannot carry upper brick.
    core_end = sec["portalFaces"][1][1]-280
    normal = sec["northOrdinaryY"]
    seat = 11977.5
    support_brick = .1025*4*20*.6
    north = {"outerRingFace":core_end,"axialGlassEnd":core_end+240,
             "overlapUpperLowerGlass":min(normal[3],core_end+240)-max(normal[2],core_end),
             "gapToFirstUpperBrick":normal[4]-core_end,"bearingMM":seat-normal[4],
             "toeY":seat,"trialReceiverFaceY":normal[2],"steelProjectionMM":seat-normal[2],
             "upperLeafTrialHeightM":4,"bracketPitchMM":600,"characteristicKN":support_brick,
             "eccentricMomentKNm":support_brick*((normal[4]+normal[5])/2-normal[2])/1000}
    assert north["overlapUpperLowerGlass"] == 72.5 and north["gapToFirstUpperBrick"] == 122.5
    assert north["bearingMM"]-5 > 102.5*2/3
    return {"section":sec,**floors,"thermal":thermal,"service":support,"northShoulder":north}


if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args=parser.parse_args()
    result=build()
    from loggia_soffit_figure import figure
    for suffix, value in (("json",json.dumps(result,indent=2)+"\n"),("svg",figure(result))):
        path=HERE/f"loggia-soffit.{suffix}"
        if args.check:
            if path.read_text()!=value: raise SystemExit(f"Stale {path.name}")
        else:
            path.write_text(value)
    print(f"Loggia field {result['grid']['fieldAreaM2']:.3f} m², {len(result['grid']['hangersXY'])} hangers, "
          f"signed hanger +{result['signed']['maxHangerDownKN']:.2f}/−{result['signed']['maxHangerUpKN']:.2f} kN.")
