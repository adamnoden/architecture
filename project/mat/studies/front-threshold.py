"""Join the front threshold to the current folded approach, floor and two side outlets."""
import argparse
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]


def read(name):
    return json.loads((PROJECT / name).read_text())


def oas_section():
    svg = ET.parse(PROJECT / "oas/studies/nominal-interface-studies.svg")
    base = svg.find(".//*[@id='D-ground-package-reserve']")
    nose = svg.find(".//*[@id='D-threshold-envelope']")
    box = svg.find(".//*[@id='D-collector-reserve']")
    scale = float(base.get("data-scale"))
    def yz(x, y):
        return [round((x-float(base.get("x")))*scale, 3), round((float(base.get("y"))-y)*scale, 3)]
    outline = [yz(*map(float,p.split(","))) for p in nose.get("points").split()]
    a, b = float(box.get("x")), float(box.get("y"))
    near = yz(a+float(box.get("width")), b)
    far = yz(a, b+float(box.get("height")))
    assert (far, near) == ([-120, -100], [-20, 0])
    return {"sillYZ": outline, "collectorY": [far[0], near[0]], "collectorBottom": far[1],
            "sillBottom": min(v[1] for v in outline), "crest": max(v[1] for v in outline)}


def landing(s, u):
    """s south of the front grate, u either side of the centre line. Four flat faces."""
    return -min(s, abs(u)) / 80


def critical(flow_lps, width):
    return 1500 * ((flow_lps/1000)**2 / (9.81*(width/1000)**2))**(1/3)


def result():
    model = read("had/studies/water-replan.json")["model"]
    door = next(o for o in model["archOpeningRegister"]["GROUND"] if o["id"] == "front-door")
    bay = read("mat/studies/ground-field-assembly.results.json")["threeDoorTransitions"]
    assert door == next(o for o in bay if o["id"]=="front-door")
    section = oas_section()
    x, width = door["centre"], door["width"]
    assert (x,width,door["wall"],door["leaves"]) == (6000,1800,"outer-south",2)
    approach = model["approaches"]
    front = approach["front"]
    assert (approach["clearWidthReservation"], front["landingLength"], front["flights"],
            approach["authoredExteriorGrade"]) == (1200,1200,[9000]*4,-1800)
    # The HAD producer puts the landing's near end at Y0 and its ramp start at Y-1200.
    half, clear_half = 1000, approach["clearWidthReservation"]/2
    length = front["landingLength"] + section["collectorY"][0]
    low = landing(half,half)
    assert length==1080 and low==-12.5
    for s in (0,200,650,length):
        assert landing(s,0)==0 and landing(s,half)==landing(s,-half)
    for u in (0,150,500,clear_half,half):
        assert landing(0,u)==0 and landing(length,u)==-u/80
    # On s<u, water heads south to s=u. On s>u, it heads sideways to u=s
    # or to the side boundary. The diagonal then falls to the side at s=1000.
    for s in range(0,int(length)+1,10):
        for u in range(0,half+1,10):
            exit_s=max(s,half)
            assert exit_s<=length and landing(exit_s,half)<=landing(s,u)
    fade=1200
    def ramp(t,u):
        return -t/front["slope"] - abs(u)/80 * max(0,1-t/fade)
    for u in (0,150,clear_half):
        assert ramp(0,u)==landing(length,u) and ramp(fade,u)==-60
    assert ramp(9000,clear_half)==-450
    # The nearby return is only 900 mm below the entrance. Check the *whole*
    # declared walking strip and 100 mm guard territories, not a body centreline alone.
    baseline = model["gardenFailureBypass"]["frontApproach"]
    lower_turn = baseline["landings"][2]
    assert lower_turn == {"plan":[2400,-1200,2700,1200], "z":-900}
    deck_west, chute_west = x-half, x-half-300
    guard = baseline["guardTerritoryEach"]
    old_turn_right = lower_turn["plan"][0]+lower_turn["plan"][2]
    shift = 600
    axes = [r["from"][0]-(shift if i else 0) for i,r in enumerate(baseline["ramps"])]
    assert axes == [6000,3900,2400,900]
    revised_landings = [[x-half,-1200,2*half,1200]]
    for left,right,y in [(axes[1],axes[0],-11400),(axes[2],axes[1],-1200),
                         (axes[3],axes[2],-11400),(axes[3],axes[3],-1200)]:
        revised_landings.append([left-clear_half,y,right-left+2*clear_half,1200])
    assert revised_landings[1][2]==3300 and revised_landings[2][0]+revised_landings[2][2]==4500
    assert all(a-b-2*clear_half>=300 for a,b in zip(axes,axes[1:]))
    assert chute_west-(old_turn_right-shift+guard)==100
    assert all(r["plan"][3]==9000 for r in baseline["ramps"])
    floor = read("mat/studies/floor-pour-boundary.results.json")["actualFloor"]["stack"]
    beam = read("str/studies/current-house-grid.json")["girders"]["outer-S"]
    faces=[beam["datum"]-beam["width"]/2,beam["datum"]+beam["width"]/2]
    seat=[20,360]
    assert faces==[-17.5,682.5] and floor["z"][-2]==beam["z"][1]==-180
    crest=section["crest"]
    # Authored light wet-side assembly. All elevations are relative to FFL.
    pan_back, pan_toe = [435,-60],[-40,-65.9375]
    backdam=-20
    assert pan_back[0] > max(v[0] for v in section["sillYZ"]) and backdam < floor["z"][1]
    tray_centre, tray_end=-77,-87
    assert pan_toe[0]<section["collectorY"][1] and pan_toe[0]>section["collectorY"][0]
    rate=read("rwt/studies/live-receiver-renewal.json")["catchments"]["rainfallMmH"]
    horiz=2*half*front["landingLength"]/1e6
    vertical=width*door["head"]/1e6
    q=rate*(horiz+vertical)/3600 # Deliberately charge the full bounding door face as additional rain area.
    # Side trench receives both the frame collector and the paving. Downstream blockage
    # of its primary pipe opens a separate exterior free overfall at the same side.
    spill=-55; spill_width=200
    tail_level=landing(700,half) # Highest paved crest along the final 380 mm of edge.
    edge_width=length-700
    edge_E,spill_E=critical(q,edge_width),critical(q,spill_width)
    backed = spill + spill_E + 5
    assert backed < low < crest and backed > pan_toe[1]
    assert crest > tail_level + edge_E + 5
    # The centre ridge is below the door crest; a complete downstream blockage can wet it.
    assert landing(length,0) == landing(0,0) == 0 < crest
    trough_end_clearance = tray_end-1.5-8-section["collectorBottom"]
    assert trough_end_clearance==3.5 and pan_toe[0] - section["collectorY"][0]==80
    return {"occurrence":{"doorX":[x-width/2,x+width/2],"leaves":2,"doorHead":door["head"],"oas":section},
            "ground":{"oldLanding":[x-clear_half,-1200,2*clear_half,1200],"proposedLanding":[x-half,-1200,2*half,1200],
                      "openingBeyondOldLandingEach":width/2-clear_half,"newLandingBeyondJambEach":half-width/2,
                      "facetedLength":length,"lowLineEndY":section["collectorY"][0]-half,
                      "constantLowSideLength":length-half,"sideLowZ":low,"diagonalRun":math.hypot(half,half),
                      "diagonalGradientDenominator":math.sqrt(2)*80,"twoEndErrorsAt5Residual":-low-10,
                      "errorAtEachEndForZeroFall":-low/2,"onePlaneStepAtRamp":length/80,"rampEdgeAtTie":ramp(0,clear_half),
                      "fadeLength":fade,"steepestFirstRampLongitudinal":front["slope"],
                      "maximumResultantGradientLimitDenominator":1/math.hypot(1/20,1/80),
                      "shallowestFirstRampLongitudinal":1/(1/front["slope"]-clear_half/80/fade),
                      "frontFlights":front["flights"],"outsideGrade":approach["authoredExteriorGrade"]},
            "foldRepair":{"originalLowerTurn":lower_turn,"originalClearPlanOverlap":old_turn_right-deck_west,
                          "originalMaximumClearHeight":-200-lower_turn["z"],"revisedFlightAxes":axes,"guardEach":guard,
                          "sideWorkAndChuteWestX":chute_west,"westShiftLowerThree":shift,
                          "shiftForZeroGuardToChuteGap":old_turn_right+guard-chute_west,
                          "guardToChuteGap":chute_west-(old_turn_right-shift+guard),"revisedLandingsXYWH":revised_landings,
                          "minimumGapBetweenLowerRunGuards":min(a-b for a,b in zip(axes,axes[1:]))-2*clear_half-2*guard,
                          "oldFoot":baseline["foot"],"newFoot":[axes[-1],-600,-1800],
                          "newWestGuardLimit":axes[-1]-clear_half-guard},
            "bearing":{"beamY":faces,"beamTop":beam["z"][1],"proposedBedY":seat,"nearBeamEdgeMargin":seat[0]-faces[0],
                       "sillNoseOutstandFromBed":seat[0]-section["collectorY"][1],"sillUnderside":section["sillBottom"],
                       "grossSupportHeight":section["sillBottom"]-beam["z"][1],"floorStack":floor["z"],
                       "innerDPC":floor["innerDpc"],"panBackYZ":pan_back,"panToeYZ":pan_toe,"backdamZ":backdam,"panToeOverlap":20,
                       "toeToTrayFloorAfterSkinAnd4mm":pan_toe[1]-1.5-tray_centre-4,
                       "panFallDenominator":(pan_back[0]-pan_toe[0])/(pan_back[1]-pan_toe[1]),
                       "troughCentreInvert":tray_centre,"troughEndInvert":tray_end,"troughRunEach":1000,
                       "endBelowSkinAndBedReserve":trough_end_clearance},
            "water":{"rainMmH":rate,"landingM2":horiz,"additionalDoorRectangleM2":vertical,"oneSideChallengeLps":q,
                     "pavingEdgeAvailableWidth":edge_width,"highestPavingEdgeZ":tail_level,"idealEdgeEnergy":edge_E,
                     "idealEdgeEnergyLevel":tail_level+edge_E,"sillAboveIdealEdgeWith5mmAdverse":crest-tail_level-edge_E-5,
                     "lowReliefWidth":spill_width,"lowReliefCrest":spill,"idealLowReliefEnergy":spill_E,
                     "idealLowReliefEnergyLevel":spill+spill_E,"lowSideAboveReliefWith5mmAdverse":low-backed,"blockedToeSubmergenceWith5mmAdverse":backed-pan_toe[1],"backdamAboveReliefWith5mmAdverse":backdam-backed},
            "scope":"Front only. Whole-event ideal controls are not measured water depth, outlet rating, exit admission or site outfall."}


def drawing(d):
    g, f, b = d["ground"], d["foldRepair"], d["bearing"]
    ox, oy, k = 38, 110, .09
    def X(x): return ox + (x-1500)*k
    def Y(y): return oy - y*k
    def box(x,y,w,h,fill,stroke):
        return f'<rect x="{X(x):.2f}" y="{Y(y+h):.2f}" width="{w*k:.2f}" height="{h*k:.2f}" fill="{fill}" stroke="{stroke}"/>'
    def path(points, colour, width=2):
        return '<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+f'" fill="none" stroke="{colour}" stroke-width="{width}"/>'
    def label(x,y,msg,size=15):
        return f'<text x="{x}" y="{y}" font-size="{size}">{msg}</text>'
    marks=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 680" font-family="Arial,sans-serif" fill="#233e49">',
           '<rect width="1100" height="680" fill="#faf8f0"/>',label(30,34,"Front entrance  /  keep the folded exit route clear",25),
           label(30,62,"Plan of the upper landing and the nearby return. Section below shows the fixed sill and separately supported collector.",16),
           box(*f["revisedLandingsXYWH"][2],"#d1d9c7","#617a65"),box(4500,-1200,100,1200,"#b6c7ae","#667960"),
           box(5000,-1200,2000,1200,"#f3e2be","#746a55"),box(5400,-2110,1200,910,"#e4d4b5","#746a55"),
           box(5000,-120,2000,100,"#a4c7d3","#476a78"),box(4700,-1200,300,1200,"#c9dbe1","#597887"),
           box(7000,-1200,300,1200,"#c9dbe1","#597887"),path([(X(5100),Y(0)),(X(6900),Y(0))],"#4d5556",4)]
    for x in (5000,7000):
        marks.append(path([(X(6000),Y(-120)),(X(x),Y(g["lowLineEndY"]))],"#177983",2.5))
    marks.extend([label(X(1900),Y(-600),"Lower turn  −900",14),label(X(5530),Y(-700),"Upper  ±0",14),
                  label(X(5400),Y(-1950),"First flight",13),label(640,108,"100 mm between the west chute and lower guard",17),
                  label(640,140,"The original return extended to X5100.",15),label(640,164,"Its 100 mm overlap with the enlarged upper landing",15),
                  label(640,188,"left only 700 mm below the upper deck.",15),label(640,222,"Move the lower three flight axes 600 mm west.",15),
                  label(640,246,"Extend the first far turn by 600 mm. Keep four 9 m flights.",15),
                  label(640,278,"Blue diagonal valleys drain to the side shoulders.",15),label(640,302,"Each drops 12.5 mm over 1414 mm of plan travel.",15),
                  label(32,347,"Threshold and collector on the south wall",20)])
    # Enlarged section with separate axis scales to make the shallow wet joints visible.
    PX=lambda y: 60+(y+180)*.75
    PZ=lambda z: 395-z*.90
    def block(y0,z0,y1,z1,fill):
        return f'<rect x="{PX(y0):.2f}" y="{PZ(z1):.2f}" width="{(y1-y0)*.75:.2f}" height="{(z1-z0)*.9:.2f}" fill="{fill}" stroke="#637078"/>'
    marks.extend([block(-17.5,-245,490,-180,"#c1c3bb"),block(20,-180,360,-68,"#d0b997"),
                  block(-120,-100,-20,0,"#cde0e5"),path([(PX(-120),PZ(0)),(PX(-20),PZ(0))],"#3f626b",4),
                  path([(PX(y),PZ(z)) for y,z in d["occurrence"]["oas"]["sillYZ"]+[d["occurrence"]["oas"]["sillYZ"][0]]],"#4b4d42",2),
                  path([(PX(-40),PZ(-65.9375)),(PX(435),PZ(-60)),(PX(435),PZ(-20))],"#0e7484",3),
                  label(40,392,"outside",13),label(450,378,"inside",13),label(280,528,"mineral bearing",13),
                  label(300,581,"outer-S beam",13),label(640,371,"+15 crossing  /  floor 0  /  original sill underside −60",16),
                  label(640,403,"Support on the existing −180 beam top via a mineral bed.",15),
                  label(640,427,"The pan turns up behind the weather path and drips",15),label(640,451,"20 mm into the independent front collector.",15),
                  label(640,483,"A blocked side pipe can flood the pan toe.",15),
                  label(640,507,"The backdam, jamb ends and separate dry air seal matter.",15),
                  label(640,539,"The side relief must discharge clear of the lower route.",15),
                  label(640,571,"No unguarded fall to the plot or discharge onto the ramp.",15),
                  label(29,644,"Dimensions in mm. Support, guards, true site outfalls, full-weather testing and protected egress remain unqualified.",15),
                  '</svg>'])
    return '\n'.join(marks)+'\n'


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--check",action="store_true")
    check=parser.parse_args().check
    d=result()
    for suffix, data in (("json",json.dumps(d,indent=2)+"\n"),("svg",drawing(d))):
        file=HERE/f"front-threshold.{suffix}"
        if check:
            assert file.read_text()==data, f"Front threshold {suffix} changed"
        else:
            file.write_text(data)
    print("Front threshold: folded approach, four paved faces, two wet routes and supported sill checked.")
