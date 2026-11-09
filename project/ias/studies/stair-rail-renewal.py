"""Check the two-level stair newel and removable wall grip against the current HAD model."""
import argparse
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "../../had/studies/water-replan.json"


def study(model):
    stair = model["stairGuard"]
    rail, steps, bars = stair["handrail"], stair["treadGeometry"], stair["infill"]
    rise, going = steps["rise"], steps["going"]
    y_end, landing = steps["midlandingNose"]
    axis_y, arrival = steps["upperArrivalNose"]
    upper_nose = arrival - (y_end - axis_y) * rise / going
    slope = rise / going
    secant = math.hypot(1, slope)
    sine = slope / secant
    diameter = rail["diameter"]
    radius = diameter / 2
    left, right = stair["wellX"]
    turn_radius = stair["midlandingUTurnRadius"]
    centre = (left + right) / 2
    west, east = centre - turn_radius, centre + turn_radius
    top = rail["topAbovePitchAndLanding"]
    lower_top, upper_top = landing + top, upper_nose + top
    # Bound the entire inclined cylinder through the +/-radius station interval
    # of the post. At fixed station its vertical thickness is d/cos(pitch).
    weld_limit = 10
    low_upper_skin = upper_top - radius * slope - diameter * secant
    bare_land = low_upper_skin - lower_top
    grip_zone = [lower_top + weld_limit, low_upper_skin - weld_limit]
    lower_grip = [centre+turn_radius/math.sqrt(2), y_end+turn_radius/math.sqrt(2),lower_top-radius]
    post_grip = [east+radius,y_end,sum(grip_zone)/2]
    upper_grip = [east,y_end-60,upper_top+60*slope-radius*secant]
    cut_gap, lift, pin = 3, 20, 12
    module = [steps["lowerFirstNose"][0] + 3 * going, steps["lowerFirstNose"][0] + 6 * going]
    y0, y1 = module
    grip_axis = stair["lowerFlightX"][0] + rail["wallClear"] + radius
    cradle = [y0+150, y1-150]
    saddle = [y0+75, y1-75]
    final_x = grip_axis+280
    foot_x = [grip_axis-40,final_x+40]
    feet = [[foot_x[0],y-60,foot_x[1]-foot_x[0],120] for y in cradle]
    cradle_z = [steps["lowerFirstNose"][1]+(y-steps["lowerFirstNose"][0])*slope+top-radius*secant for y in cradle]
    tread_z = [steps["lowerFirstNose"][1]+rise*math.floor((y-steps["lowerFirstNose"][0])/going) for y in cradle]
    cross = model["lowCillWindowGuard"]
    raw = cross["opening"]["rawJambs"]
    wall_support = [raw[0] - 110, raw[1] + 110]
    base_edge, support_sweep = 50, cross["supportEnquiry"]["guardAfterTranslationEW"]
    # At the first two adjacent goings the height remains respective tread +172.5.
    return {
        "source": "project/had/studies/water-replan.json · model.stairGuard and lowCillWindowGuard",
        "stair": {"wellX": [left, right], "railCentreX": [west, east],
                  "flightWidth": stair["bodyTerritoryEach"], "betweenRails": rail["betweenRailsMinimum"],
                  "widthAfterSourceLoss": rail["betweenRailsMinimum"]-rail["declaredCombinedPositionLoss"],
                  "firstUpperNoseYZ": [y_end, upper_nose], "landingYZ": [y_end, landing],
                  "upperArrivalYZ": steps["upperArrivalNose"], "rise": rise, "going": going, "pitchDegrees": math.degrees(math.atan(slope))},
        "transfer": {"newelXY": [east,y_end], "diameter": diameter, "lowerRailTop": lower_top,
                     "upperRailTopAtAxis": upper_top, "lowerHorizontalAxis": lower_top-radius,
                     "inclinedAxisAtPost": upper_top-radius*secant,
                     "landingHeightBand": [landing+900,landing+1000],
                     "upperNosingHeightBand": [upper_nose+900,upper_nose+1000],
                     "unbridgedBand": upper_nose+900-(landing+1000),
                     "heightDifference": upper_top-lower_top, "minimumUpperUndersideAcrossPost": low_upper_skin,
                     "bareVerticalLand": bare_land, "filletAllowanceAtEachEnd": weld_limit,
                     "clearPostLandZ": grip_zone, "usableVerticalLength": grip_zone[1]-grip_zone[0],
                     "declared90HandBandReserve": grip_zone[1]-grip_zone[0]-90,
                     "lowerTubeAxisPoint":lower_grip, "postEastContact":post_grip, "upperTubeAxisPoint":upper_grip,
                     "gripReferenceSeparations":[math.dist(lower_grip,post_grip),math.dist(post_grip,upper_grip),math.dist(lower_grip,upper_grip)],
                     "returnOuterProjection": turn_radius+radius,
                     "remainingLanding": stair["midlandingDepth"]-turn_radius-radius,
                     "uncappedPlanGap": east-west-diameter,
                     "straightBarGap": bars["centrePitch"]-bars["verticalDiameter"],
                     "turnChord": 2*turn_radius*math.sin(math.pi/6),
                     "turnBarGap": 2*turn_radius*math.sin(math.pi/6)-bars["verticalDiameter"],
                     "studiedUnderPanelGap": 50, "sourceUnderPanelLimit": bars["bottomGapMaximum"]},
        "wallGrip": {"moduleY": module, "axisX": grip_axis, "nominalAxialLength": (y1-y0)*secant,
                     "supportSaddlesY": saddle, "openJointMm": cut_gap, "pinHeight": pin,
                     "verticalUnseat": lift, "clearOverPin": lift-pin, "saddleLipHeight":8, "clearOverSaddleLip":lift-8,
                     "inclinedCutIntrusion": lift*sine-cut_gap, "perpendicularCutLiftLimit": cut_gap/sine,
                     "carriageStroke":final_x-grip_axis,"firstRestAxisX":final_x,
                     "firstRestFeetXYWD":feet,"restCradlesY":cradle,"installedCentresZ":cradle_z,
                     "cradleFeetTreadZ":tread_z,"restCentresZ":[z-300 for z in cradle_z],
                     "lowestRestHeightAboveTread":min(z-300-floor for z,floor in zip(cradle_z,tread_z)),
                     "supportToCradleClearY":min(abs(a-b) for a in saddle for b in cradle)-40,
                     "supportProjectionInsideFeet":min(grip_axis-foot_x[0],foot_x[1]-final_x),
                     "stairClearBeyondStand":left-foot_x[1],
                     "railsAboveNoses":top, "sourceBracketWallClear":rail["wallClear"],
                     "restFeetTreadY":[steps["lowerFirstNose"][0]+going*(i+0.5) for i in (3,5)]},
        "window": {"rawJambsY":raw, "supportCentresY":wall_support, "maxPlateAlongY":2*base_edge,
                   "fixingPlateToRaw":min(raw[0]-wall_support[0],wall_support[1]-raw[1])-base_edge,
                   "unsupportedPlanSpan":wall_support[1]-wall_support[0], "railNearX":grip_axis-radius,
                   "grilleOutermostXInFirstMove":support_sweep[1],
                   "firstMoveReserve":grip_axis-radius-support_sweep[1]},
    }


def verify(r):
    t, w, c, s = r["transfer"], r["wallGrip"], r["window"], r["stair"]
    assert s["landingYZ"] == [7132.5,1725] and s["firstUpperNoseYZ"] == [7132.5,1897.5]
    assert t["newelXY"] == [1703.5,7132.5] and t["unbridgedBand"] == 72.5
    assert t["uncappedPlanGap"] > 100 and max(t["turnBarGap"],t["straightBarGap"],t["studiedUnderPanelGap"]) < 100
    assert t["usableVerticalLength"] > 90 and t["usableVerticalLength"] - 10 < 90
    assert w["perpendicularCutLiftLimit"] < w["pinHeight"] < w["verticalUnseat"]
    assert w["inclinedCutIntrusion"] > 6 and w["clearOverPin"] == 8
    assert w["restCradlesY"] == w["restFeetTreadY"] and w["supportToCradleClearY"] == 35
    assert w["stairClearBeyondStand"] == 704 and w["supportProjectionInsideFeet"] == 40
    assert c["firstMoveReserve"] == 17 and c["fixingPlateToRaw"] == 60
    assert s["betweenRails"] == 1004 and s["widthAfterSourceLoss"] == 984


def drawing(r):
    t,w,c = r["transfer"],r["wallGrip"],r["window"]
    o=['<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1000" viewBox="0 0 1100 1000" role="img"><title>Retained stair guard and renewable wall rail</title><rect width="1100" height="1000" fill="#fbfaf5"/><g font-family="sans-serif" fill="#203538">']
    def label(x,y,s,n=15):
        o.append(f'<text x="{x}" y="{y}" font-size="{n}">{s}</text>')
    def path(d,colour,width,extra=''):
        o.append(f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="{width}" {extra}/>')
    def rect(x,y,width,height,colour):
        o.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="{colour}"/>')
    steel,wood,mute,dark='#286a67','#946438','#9faea8','#384749'
    label(32,42,'Stair rail renewal on the two-flight RC stair',28)
    label(32,69,'Fixed metal guards and transfer newel at the well. Removable solid timber on independent wall brackets.')
    label(32,115,'1   Midlanding in plan',20)
    rect(78,189,220,226,'#e1e2d8')
    path('M96 386 V249 A92 92 0 0 1 280 249 V386',steel,14)
    path('M96 249 H280',mute,2,'stroke-dasharray="5 4"')
    for x,y in [(96,249),(142,169.3),(234,169.3),(280,249)]:
        o.append(f'<circle cx="{x}" cy="{y}" r="6" fill="{dark}"/>')
    o.append('<circle cx="280" cy="249" r="17" fill="#384749"/>')
    label(42,144,'Landing',14);label(38,439,'Lower flight');label(234,439,'Upper flight')
    label(105,280,'200 mm well',15);label(117,306,'Axes 160 apart',13)
    label(35,474,'Ø40 post at X1703.5 / Y7132.5',15)
    label(374,115,'2   Two heights at the first upper riser',20)
    path('M390 394 H548 V333 H802',dark,4)
    rect(531,172,26,221,'#476865')
    path('M386 242 H542',steel,14)
    path('M548 178 L766 135',steel,14)
    path('M562 195 V233',wood,6)
    label(586,210,'Clear vertical land',15);label(586,232,f'{t["usableVerticalLength"]:.1f} mm after joint allowances',14)
    label(373,271,'Landing rail top +2725',13)
    label(784,155,'Flight rail top +2897.5 at nose',14)
    label(391,420,'Landing +1725',15);label(575,357,'First upper tread +1897.5',15)
    label(375,472,'Newel is a vertical hand transfer. User and grip trials remain open.',14)
    label(32,528,'3   Release the timber on the wall side',20)
    path('M55 694 L284 574',wood,15);path('M294 568 L342 543',wood,15)
    path('M284 559 V597',dark,2)
    path('M159 636 V598 M153 607 L159 597 L165 607',steel,3)
    label(374,571,'Plumb end joints allow a 20 mm lift off a 12 mm vertical pin.')
    label(374,605,'A square cut normal to the sloping timber binds after 6.0 mm.')
    label(374,639,'Move the supported rail toward the flight onto two retained cradles.')
    label(374,673,'The well guard, treads, window grille and its independent frame stay fixed.')
    label(32,750,'4   Two tread-supported pickup stations in plan',20)
    # World Y runs horizontally and world X downward to show the two ends.
    def plan_y(y): return 58+(y-w['moduleY'][0])*.44
    def plan_x(x): return 786+(x-429.5)*.37
    for x,y,dx,dy in w['firstRestFeetXYWD']:
        rect(plan_y(y),plan_x(x),dy*.44,dx*.37,'#c8d9d3')
    for y in w['supportSaddlesY']: rect(plan_y(y)-6,775,12,41,'#80938e')
    for y in w['restCradlesY']:
        path(f'M{plan_y(y)} {plan_x(w["axisX"])} V{plan_x(w["firstRestAxisX"])}',steel,4)
    for x,col in [(w['axisX'],wood),(w['firstRestAxisX'],steel)]:
        path(f'M{plan_y(w["moduleY"][0])} {plan_x(x)} H{plan_y(w["moduleY"][1])}',col,8)
    label(490,799,'Installed timber at X499.5. Gray saddles stay with the wall.')
    label(490,837,'Two sliding cradles start 75 mm from the nearest saddle centre.')
    label(490,875,'First rest at X779.5 after a 280 mm supported transverse draw.')
    label(490,913,'Each foot sits on its own tread: +690 or +1035.')
    label(32,973,'Diagrams are schematic. Use the coordinate ledger for scales, section heights and release allowances.',13)
    return '\n'.join(o+['</g></svg>',''])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = study(json.loads(SOURCE.read_text())["model"])
    verify(result)
    for suffix, content in (("json",json.dumps(result,indent=2)+"\n"),("svg",drawing(result))):
        path = HERE / ("stair-rail-renewal."+suffix)
        if args.check:
            if path.read_text() != content:
                raise SystemExit("Stale " + path.name)
        else:
            path.write_text(content)
