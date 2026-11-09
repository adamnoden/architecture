"""Reproduce the four WC service stations against their owning room and supply models."""
import argparse
import json
import math
import runpy
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJ = HERE.parents[1]
H = json.loads((PROJ / "had/studies/water-replan.json").read_text())["model"]
S = json.loads((PROJ / "mat/studies/whole-house-service-baseline.json").read_text())
REAR = json.loads((PROJ / "mat/studies/services-b-joined-inventory.json").read_text())["rearCrossingProposal"]
P = runpy.run_path(str(HERE / "principal-shower-entry.py"))
segbox, ptbox = P["segbox"], P["ptbox"]
U, G = H["upperFurniture"], H["groundFurniture"]
VALVES = {v["id"]: v for v in S["fixtures"] if v["id"] in ("guest-WC","principal-WC","family-WC","rear-WC")}
FAMILY = H["familyWetTrial"]
B = {"width":430, "leverMax":239, "panWidth":360, "panDepth":525, "totalDepth":740,
     "cisternDepth":218, "inletRight":155, "panTop":415, "tankBottom":748, "outletZ":195}
D = {"panWidth":355, "depth":650, "tankWidth":390, "tankDepth":175}
RADIUS, REACH = 300, 600

def bounds(points):
    xs,ys = zip(*points)
    return [min(xs),min(ys),max(xs)-min(xs),max(ys)-min(ys)]

def local(back,front,depth,right):
    # Right as seen from the room looking at the cistern.
    return [back[0]+depth*front[0]-right*front[1], back[1]+depth*front[1]+right*front[0]]

def prism(back,front,d0,d1,r0,r1):
    return bounds(local(back,front,d,r) for d in (d0,d1) for r in (r0,r1))

def overlap(a,b):
    return [max(0,min(a[i]+a[i+2],b[i]+b[i+2])-max(a[i],b[i])) for i in (0,1)]

def low(back,front):
    return {
        "pan": prism(back,front,B["totalDepth"]-B["panDepth"],B["totalDepth"],-B["panWidth"]/2,B["panWidth"]/2),
        # 430 ceramic, 454 overall. Put the additional 24 on the illustrated right.
        "tank": prism(back,front,0,B["cisternDepth"],-B["width"]/2,B["leverMax"]),
        "valve": local(back,front,55,155),
        # The source asks for 200 x 200 x 300. Keep all of it roomward of the
        # wall. The underside is its intentional upper mating boundary.
        "field": prism(back,front,0,200,55,255),
    }

def route(path,obstacles,walls):
    x,y,w,h = walls
    def wall(point):
        return min(point[0]-x,x+w-point[0],point[1]-y,y+h-point[1])
    return min(min(wall(p) for p in path),
               *(segbox(a,b,r) for a,b in zip(path,path[1:]) for r in obstacles)) - RADIUS

def reach(body,axis,z,shoulder=900):
    return math.dist([*body,shoulder],[*axis,z])

def solution():
    for v in VALVES.values():
        assert v["requiredValveWorkTerritory"] == [200,200,300]
    old = {k:v["waterBranchPlan"][-1] for k,v in VALVES.items()}
    rear_box, column = U["rear-cabinet"],U["principal-local-soil-column"]
    assert old["principal-WC"] == [column[0]+column[2]/2,column[1]+column[3]/2]
    assert ptbox(old["guest-WC"],G["guest-WC-pan"]) == 0
    assert ptbox(old["rear-WC"],rear_box) == 0
    assert ptbox(old["family-WC"],FAMILY["serviceBand"]) == 0

    guest = low([8900,H["envelope"]+3+60],[0,1])
    guest["walls"] = [7300,H["envelope"]+3,1900,2550-H["envelope"]-3]
    guest["station"] = [8340,838]
    guest["route"] = [[8100,2190],[8100,1460],guest["station"]]
    guest["obstacles"] = [G["guest-WC-basin"],G["service-emitter-guest-WC-E"]]
    guest["bodyReserve"] = route(guest["route"],[*guest["obstacles"],guest["pan"],guest["tank"]],guest["walls"])
    guest["switch"] = [guest["valve"][0], guest["valve"][1]+112.5-50]
    guest["reachToBottom"] = reach(guest["station"],guest["switch"],575,630)
    guest["tubeRise"] = B["tankBottom"]-575
    assert 300 - guest["tubeRise"] == 127 and guest["pan"][1]+guest["pan"][3] == 1232.5
    guest["reachToNut"] = reach(guest["station"],guest["valve"],725,630)
    guest["armClear"] = min(segbox(guest["station"],guest["valve"],r) for r in guest["obstacles"]) - 25
    assert not any(all(overlap(guest["field"],r)) for r in guest["obstacles"])
    assert min(guest["bodyReserve"],guest["armClear"]) > 30
    assert max(guest["reachToBottom"],guest["reachToNut"]) < 530
    # Between the 415 pan top and the 748 cistern underside the whole working
    # field is clear. The hand/tool may intentionally mate with the inlet.
    assert B["tankBottom"]-300-B["panTop"] == 33
    # Pan on a supported pad. Include 50 packaging around the moving footprint
    # after disengagement. Tank and flush pipe are removed before the local move.
    guest["stage"] = [8070,1500,360,525]
    x,y,w,h = guest["pan"]
    guest["sweeps"] = [[x,y,w,h+100],[8070-50,y+100-50,x+w+50-(8070-50),h+100],
                       [8020,y+100-50,w+100,1500+h+50-(y+100-50)]]
    for sweep in guest["sweeps"]:
        assert not any(all(overlap(sweep,r)) for r in guest["obstacles"])
        assert overlap(sweep,guest["walls"]) == [sweep[2],sweep[3]]
    guest["drip"]=[8625,505,220,160]
    assert ptbox(guest["valve"],guest["drip"]) == ptbox(guest["switch"],guest["drip"]) == 0
    assert guest["drip"][0] < guest["tank"][0] and guest["drip"][1]+guest["drip"][3] < guest["pan"][1]

    family_back = [FAMILY["eastWetFace"]-10,5900]
    family = {"pan":prism(family_back,[-1,0],0,D["depth"],-D["panWidth"]/2,D["panWidth"]/2),
              "tank":prism(family_back,[-1,0],0,175,-195,195),
              "valve":[10650,6310],"field":[10550,6200,200,200],
              "station":[10495,6030]}
    family["walls"] = [FAMILY["westDryFace"],FAMILY["southWetFace"],
                       FAMILY["eastWetFace"]-FAMILY["westDryFace"],
                       FAMILY["northWetFace"]-FAMILY["southWetFace"]]
    family["route"] = [H["familyOperationEvidence"]["proof"]["transfer"]["path"][-1], family["station"]]
    family["obstacles"] = [U[k] for k in ("family-service-cabinet","family-basin","family-bath1700",
                                           "family-local-soil-column","service-emitter-family-E")]
    family["bodyReserve"] = route(family["route"],[*family["obstacles"],family["pan"],family["tank"]],family["walls"])
    family["valveReach"] = reach(family["station"],family["valve"],900)
    assert not any(all(overlap(family["field"],r)) for r in [*family["obstacles"],family["pan"],family["tank"]])
    # Necessary clearance cut: to reach the under-cistern tap on a north-wall
    # low-level pan from the west door, pass south between the cabinet and pan;
    # to get onto its east side, pass between pan and basin. Exact nearest
    # corners, with even zero margin beyond the 600 body.
    cabinet,basin = U["family-service-cabinet"],U["family-basin"]
    front_y=FAMILY["northWetFace"]-B["totalDepth"]
    dy_w = front_y-(cabinet[1]+cabinet[3])
    dy_e = front_y-(basin[1]+basin[3])
    family["minX"] = cabinet[0]+cabinet[2]+180+math.sqrt(600**2-dy_w**2)
    family["maxX"] = basin[0]-180-math.sqrt(600**2-dy_e**2)
    assert family["minX"] - family["maxX"] > 280
    old_family_low = low([FAMILY["eastWetFace"],5927.5],[-1,0])
    family["oldLowOverlap"] = overlap(old_family_low["tank"],U["family-local-soil-column"])
    assert all(family["oldLowOverlap"])
    principal_back = [11130, H["rooms"]["principalBath"]["northFinishedFace"]-10]
    principal = {
        "pan":prism(principal_back,[0,-1],0,D["depth"],-D["panWidth"]/2,D["panWidth"]/2),
        "tank":prism(principal_back,[0,-1],0,175,-195,195),
        "valve":[10900,8050],"field":[10800,7952.5,200,200],
        "station":[10520,7780], "route":[[10400,7850],[10520,7780]],
    }
    assert 0 < column[0]-(principal["tank"][0]+principal["tank"][2]) < 20
    fixed = P["FIXED"]
    old_fixed = dict(fixed)
    try:
        fixed["WC"] = principal["pan"]
        fixed["exposed tank"] = principal["tank"]
        # Retain the rest of the old chase as an obstacle for the operator.
        principal["shower"] = P["verify"](P["POSES"])
        principal["stationBody"] = P["route_reserve"](*principal["route"])
        principal["valveReach"] = reach(principal["station"],principal["valve"],1100,1100)
        assert principal["field"][0] == P["MAT"]["door"]["rough"][1]
        assert not all(overlap(principal["field"],column))
        # 200-square working field can overlap the proposed 775-high ceramic
        # in plan only. Its lower face is 950, and it stays on the solid pier.
        assert 1100-150-(400+375) == 175
    finally:
        fixed.clear()
        fixed.update(old_fixed)
    old_principal = low([11150,8152.5],[0,-1])
    principal["lowOverlap"] = overlap(old_principal["tank"],column)
    rear = {"valve":[500,10000], "field":[430,9900,200,200],
            "station":[820,9750], "route":[[1550,10550],[1325,10225],[1120,9750],[820,9750]]}
    rear["walls"] = [H["envelope"],8952.5,2802.5-H["envelope"],11570.5-8952.5]
    rear["obstacles"] = [U[k] for k in ("rear-WC","rear-cabinet","rear-basin","rear-shower1000","service-emitter-rear-N")]
    rear["rack"] = [600,10150,150,550]
    rear["stationBody"] = route(rear["route"],[*rear["obstacles"],rear["rack"]],rear["walls"])
    rear["valveReach"] = reach(rear["station"],rear["valve"],850)
    for room in [family,principal,rear]:
        assert room.get("stationBody",room.get("bodyReserve")) >= 20 and room["valveReach"] < REACH
    assert min(v for k,v in principal["shower"].items() if k.startswith("body")) > 20
    assert not all(overlap(rear["field"],rear["rack"]))
    # Empty pan after cistern, independent water connection and pan joint
    # release. Charge 25 mm of protection around each subsequent plan move.
    # First draw has no invented clearance behind the installed pan.
    principal["stage"] = [10360,8540,355,650]
    principal["sweeps"] = [[10952.5,7392.5,355,750], [10335,7367.5,997.5,700],
                            [10335,7367.5,405,1847.5]]
    assert principal["pan"] == [10952.5,7492.5,355,650]
    assert principal["sweeps"][2][0] >= P["MAT"]["door"]["netOpen"][0]
    assert principal["sweeps"][2][0]+principal["sweeps"][2][2] <= P["MAT"]["door"]["netOpen"][1]
    fixed_after = [U["principal-shower900"],U["principal-basin"],column,P["MAT"]["door"]["openLeaf"],
                   P["MAT"]["bedroomTrial"]["maintenanceBed"]]
    assert not any(all(overlap(r,o)) for r in principal["sweeps"] for o in fixed_after)
    family["stage"] = [10100,5722.5,650,355]
    family["sweeps"] = [[10807.5,5722.5,750,355], [10075,5697.5,1407.5,405]]
    assert family["pan"] == [10907.5,5722.5,650,355]
    assert not any(all(overlap(r,o)) for r in family["sweeps"] for o in family["obstacles"])
    assert all(overlap(r,family["walls"]) == [r[2],r[3]] for r in family["sweeps"])
    # True first-wet control for the low-level inlet and a visibility outlet.
    assert all(guest["drip"][i]+30 <= guest["valve"][i] <= guest["drip"][i]+guest["drip"][i+2]-30 for i in (0,1))
    return {"guest":guest,"family":family,"principal":principal,"rear":rear,"old":old}

def figure(result):
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 940" width="1060" height="940">',
         '<title>Four WC isolation and replacement choices</title>',
         '<desc>Four north-up room plans at the same scale compare old feed points, accessible valve fields, the toilet, a crouching person, and wet-service furniture.</desc>',
         '<rect width="1060" height="940" fill="#faf8f2"/>',
         '<g font-family="sans-serif" fill="#20343a">',
         '<text x="30" y="39" font-size="27" font-weight="bold">Four WCs  /  where the water can be turned off</text>',
         '<text x="31" y="66" font-size="14">North up   ·   all plans at the same scale   ·   red cross = source feed   ·   teal = 200 mm work field   ·   blue circle = 600 mm body</text>']
    cards=[("guest",30,105,"Guest WC","Separate low-level tank","60 mm exposed service lining","Plan approach 45 mm spare"),
           ("principal",545,105,"Principal shower room","Compact coupled WC","Cistern shifts 20 mm west","Shower route retains 21 mm"),
           ("family",30,495,"Family bathroom","Keep pan facing west","Isolate on north wall","North-facing trial fails both pinch points"),
           ("rear",545,495,"Rear shower room","Retain cabinet and pan","Isolate on fixed west wall","200 mm work field stays clear of rack")]
    for name,x,y,title,sub,note,margin in cards:
        q=result[name]
        if name=="principal":
            walls=P["ROOM"]; obs=[U["principal-basin"],U["principal-shower900"],U["principal-local-soil-column"]]
        else:
            walls=q["walls"];obs=q["obstacles"]
        ox,oy,w,h=walls
        scale=.112
        def xy(p):
            return x+22+(p[0]-ox)*scale,y+48+(oy+h-p[1])*scale
        def rect(r,fill,stroke,width=1):
            a,b=xy([r[0],r[1]+r[3]])
            return f'<rect x="{a:.1f}" y="{b:.1f}" width="{r[2]*scale:.1f}" height="{r[3]*scale:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
        def poly(pts,stroke,dash=""):
            s=" ".join("%.1f,%.1f"%xy(p) for p in pts)
            return f'<polyline points="{s}" fill="none" stroke="{stroke}" stroke-dasharray="{dash}" stroke-width="1.7"/>'
        out.extend([f'<text x="{x}" y="{y}" font-size="21" font-weight="bold">{title}</text>',
                    f'<text x="{x}" y="{y+23}" font-size="15">{sub}</text>',rect(walls,"#fff","#536367"),
                    *(rect(r,"#e6e0d4","#9c998f") for r in obs)])
        pan,tank=(q.get("pan",U["rear-WC"]),q.get("tank",U["rear-cabinet"]))
        out.extend([rect(pan,"#b5c9cc","#50676d"),rect(tank,"#d5e2da","#627b72")])
        if name=="rear":out.append(rect(q["rack"],"none","#a58b61"))
        if name=="guest":out.append(rect(q["drip"],"#d1a65f","#966822"))
        if name=="principal":out.append(rect(P["CORNER"],"#405d5e","#405d5e"))
        if name in ("family","guest"):
            stage=q["stage"];out.append(rect(stage,"none","#bbb"))
        a,b=xy(q["station"])
        out.extend([f'<circle cx="{a:.1f}" cy="{b:.1f}" r="{300*scale}" fill="#8eb6c2" fill-opacity=".4" stroke="#417085"/>',
                    poly(q["route"],"#497487","3 3"),rect(q["field"],"#9ad9c7","#21735e"),
                    poly([q["station"],q.get("switch",q["valve"])],"#206b58")])
        a,b=xy(result["old"][name+"-WC"])
        out.append(f'<path d="M{a-4:.1f} {b-4:.1f}l8 8m0 -8l-8 8" stroke="#b44a38" stroke-width="2.2"/>')
        for i,label in enumerate([note,margin]):
            out.append(f'<text x="{x+22}" y="{y+(324 if y<200 else 365)+18*i}" font-size="13">{label}</text>')
    out.extend(['<path d="M32 912h56" stroke="#293c40" stroke-width="3"/>',
                '<text x="98" y="917" font-size="13">500 mm</text>',
                '<text x="300" y="917" font-size="13">The plan checks access. Supply, waste, waterproofing and protected openings retain their own checks.</text>',
                '</g></svg>'])
    return "\n".join(out)+"\n"

def current_takeoffs(stations):
    """Recheck the two WC connections on the occupied basin and floor geometry."""
    basins = json.loads((HERE / "household-water.json").read_text())["basins"]
    g = stations["guest"]
    duty = next(d for d in S["otherDuties"] if d["id"] == "foul-ground-WC")
    reference, wall, _ = duty["path"]
    assert reference == [8900,650,180] and wall == [8900,0,163.75]
    assert B["outletZ"] == 195 and g["pan"] == [8720,707.5,360,525]

    # Horizontal connector, then a formed R1000 transition and straight fall.
    radius, tangent_y = 1000, 540
    def water_fall(angle):
        return radius*(1-math.cos(angle)) + (tangent_y-radius*math.sin(angle))*math.tan(angle)
    low, high = 0., math.radians(6)
    for _ in range(48):
        angle=(low+high)/2
        if water_fall(angle) < B["outletZ"]-wall[2]:
            low=angle
        else:
            high=angle
    straight_y=tangent_y-radius*math.sin(angle)
    assert abs(water_fall(angle)-(195-wall[2])) < 1e-8 and straight_y-g["walls"][1]>43

    # A held pan on a wheeled, padded carrier is a separate solid from the
    # R300 attendant. Re-index handles only with the truck positively parked.
    offsets = [[0,0],[0,100],[-650,100],[-650,792.5]]
    handlers = [[8550,1597.5],[8550,1697.5],[7900,1697.5]]
    gfix = [basins["guest"]["pan"],G["service-emitter-guest-WC-E"]]
    x,y,w,h=g["pan"]
    def carrier(d):
        return [x+d[0]-50,y+d[1]-50,w+100,h+100]
    body_gap, fixed_gap, grip_reach = [], [], []
    def move(start,end,h0,h1,grip):
        box=carrier(start)
        delta=[end[i]-start[i] for i in range(2)]
        relative=[h1[i]-delta[i] for i in range(2)]
        body_gap.append(segbox(h0,relative,box)-RADIUS)
        body_gap.append(route([h0,h1],gfix,g["walls"]))
        for obs in gfix:
            # Minkowski expansion of the obstacle by the moving rectangle.
            expanded=[obs[0]-box[2],obs[1]-box[3],obs[2]+box[2],obs[3]+box[3]]
            fixed_gap.append(segbox(box[:2],[box[i]+delta[i] for i in range(2)],expanded))
        for a,b in [(h0,start),(h1,end)]:
            grip_reach.append(math.dist([*a,780],[grip[0]+b[0],grip[1]+b[1],720]))
    move(offsets[0],offsets[1],handlers[0],handlers[1],[8770,1232.5])
    move(offsets[1],offsets[2],handlers[1],handlers[2],[8770,1232.5])
    change=[handlers[2],[8670,1697.5],[8745,1655],[8820,1530],[8820,830]]
    body_gap.append(route(change,[carrier(offsets[2]),*gfix],g["walls"]))
    move(offsets[2],offsets[3],change[-1],[8820,1522.5],[9080,750])
    assert min(body_gap)>0 and min(fixed_gap)>0 and max(grip_reach)<600
    assert carrier(offsets[-1]) == [8020,1450,460,625]

    rear=U["rear-WC"]; stack=S["rewinds"]["rearSource27"]["retainedFloorPort"]
    assert rear == [729.5,11000,560,355] and stack == [567.5,11177.5,160]
    assert rear[1]+rear[3]/2 == stack[1]
    # Duravit's actual 211509 has a 40 mm ceramic land, recessed 135.
    tip=rear[0]+135
    throat=tip+35
    first_pull=100
    assert throat-(rear[0]+first_pull)==70
    assert 250-(throat-rear[0])==80
    # Source stack fitting shoulder is 69 from its axis. Bound its complete
    # 62 mm socket, the adaptor and a short, specially formed connecting pipe.
    # Connector lip = +35 onto ceramic; shoulder/diameter cannot act as a clamp.
    tee_mouth=stack[0]+69+62
    adaptor_end=throat-126
    free=adaptor_end-5-tee_mouth
    assert free>69 and 40-35==5 and 100-55==45
    # Circle tangent to the 87.5 degree branch, with both sockets kept square.
    roll=math.radians(2.5); curve=500*math.sin(roll)
    assert free-curve>47
    z_stack=185-500*(1-math.cos(roll))-(tee_mouth-stack[0]+free-curve)*math.tan(roll)
    assert z_stack-117>58

    # Current pan moves through the actual rear door once its fixed couplers
    # have cleared. Swept body includes 100 mm pad only after the 250 pull.
    rdoor=next(v for v in H["upperWalls"] if v["id"]=="rear-wet-east")
    assert rdoor["holes"]==[[10350,11250]]
    rear_fixed=[basins["rear"]["pan"],*[U[k] for k in ("rear-shower1000","service-emitter-rear-N",
               "rear-west-low-box","bed4-island-wardrobe","bed4","service-emitter-bed4-N")]]
    door=json.loads((HERE / "selected-family-convergence.json").read_text())["rearRenewal"]["door"]
    hx,hy=door["hinge"]; leaf,thick=door["leaf"]
    rear_fixed.append([hx-leaf,hy-thick/2,leaf,thick])
    west,east=rdoor["finishedFaces"]
    # Reserve 50 each end of the raw hole for finished stops/ironmongery.
    south,north=rdoor["holes"][0]
    rear_fixed.extend([[west,8952.5,east-west,south+50-8952.5],
                       [west,north-50,east-west,11570.5-north+50]])
    legs=[(rear[:2],[979.5,11000],0),([979.5,11000],[1340,11000],100),
          ([1340,11000],[1340,10622.5],100),([1340,10622.5],[3800,10622.5],100)]
    rear_gap=[]; rear_bodies=[]; rear_reach=[]
    attendant=[[rear[0]+980,10950],[979.5+980,10950],[1340+980,10950],
               [1340+980,10800],[3800+980,10800]]
    for i,(a,b,pad) in enumerate(legs):
        h0,h1=attendant[i:i+2]
        rear_bodies.extend(segbox(h0,h1,obs)-RADIUS for obs in rear_fixed)
        assert h0[0]-a[0]==h1[0]-b[0]==980
        rear_bodies.append(980-rear[2]-pad-RADIUS)
        for worker,base in [(h0,a),(h1,b)]:
            rear_reach.append(math.dist([*worker,780],[base[0]+rear[2],base[1]+105,720]))
        for obs in rear_fixed:
            expanded=[obs[i]-rear[i+2]-pad for i in range(2)]+[obs[i+2]+rear[i+2]+2*pad for i in range(2)]
            rear_gap.append(segbox(a,b,expanded))
    assert min(rear_gap)>0 and min(rear_bodies)>0 and max(rear_reach)<600
    old_turn=[1500-100,11000-100,560+200,355+200]
    assert overlap(old_turn,U["service-emitter-rear-N"]) == [60,87.5]
    # The supported guest heel must be open at the fixed Ø133 mouth. A solid
    # 50 mm rear pad reaches the adverse mouth after the initial 100 draw.
    fixed_mouth=y+15+35
    assert y+100-50-fixed_mouth==0
    heel_half_clear=(195-133)/2-10
    assert heel_half_clear==21
    # Move farther north while still centred before fitting a plug. Keep the
    # transverse stage at the same ordinate after that temporary overshoot.
    plug_draw=180
    assert y+plug_draw-fixed_mouth==130
    cap_handler=[8550,1752.5]
    move(offsets[1],[0,plug_draw],handlers[1],cap_handler,[8770,1232.5])
    cap_route=[cap_handler,[8300,1752.5],[8300,775],[8370,775]]
    body_gap.append(route(cap_route,[carrier([0,plug_draw]),*gfix],g["walls"]))
    cap_reach=math.dist([8370,775,390],[8900,fixed_mouth+35,195])
    assert cap_reach<570 and 100-50-25-10==15 and min(body_gap)>0
    return {"guestBendDegrees":math.degrees(angle),"guestStraightY":straight_y,
            "guestCarrierClear":min(fixed_gap),"guestWorkerClear":min(body_gap),
            "guestGripReach":max(grip_reach),"guestCapReach":cap_reach,"rearStackEntry":z_stack,"rearTransferClear":min(rear_gap),
            "rearWorkerClear":min(rear_bodies),"rearGripReach":max(rear_reach)}


def fitted_schedule(stations, takeoffs):
    upper=json.loads((HERE / "upper-wc-release.json").read_text())
    g=stations["guest"]
    result={"basis":"Joined pre-site fixture selection; the pads, source interfaces and product limits retain their separate approval duties.",
            "coordinateSystem":"All plan rectangles are X/Y/width/depth in millimetres. Section levels are local to the room FFL.",
            "guest":{"pan":g["pan"],"cistern":g["tank"],"valve":g["valve"],
                     "servicesReferenceXY":[8900,650],"soilAxisZ":B["outletZ"],"southWall":[8900,0,163.75],
                     "selectedTakeoff":"Continuous formed above-floor south-wall branch",
                     "firstDraw":[0,100],"plugDraw":[0,180],"dryPanRest":g["stage"]},
            "rear":{"pan":U["rear-WC"],"cabinet":U["rear-cabinet"],"valve":stations["rear"]["valve"],
                    "stack":S["rewinds"]["rearSource27"]["retainedFloorPort"],"localSoilAxisZ":185,
                    "soilSpigotTip":[U["rear-WC"][0]+135,11177.5,185],"flushAxisZ":340,
                    "firstDraw":[250,0],"dryPanRest":[3800,10622.5,560,355]},
            "replay":{k:round(v,5) for k,v in takeoffs.items()}}
    for name in ["family","principal"]:
        q=upper[name]
        result[name]={"suite":q["suite"],"matchedSuiteMovement":q["travelling"],"back":q["back"],
                      "fixedServicePort":q["fixedPort"],"travellingServicePort":q["tailPort"],
                      "firstDrawMM":150,"onwardCarrierCentrePath":q["trimmedCarrierCentrePath"]}
    return result


def main():
    args=argparse.ArgumentParser(description=__doc__)
    args.add_argument("--check",action="store_true")
    check=args.parse_args().check
    r=solution()
    takeoffs=current_takeoffs(r)
    print("Current guest and rear takeoffs:", takeoffs)
    schedule=Path(__file__).with_name("fitted-wc-schedule.json")
    data=json.dumps(fitted_schedule(r,takeoffs),indent=2)+"\n"
    # This joined check uses the same occupied family room as the WC exchange.
    shaft=runpy.run_path(str(HERE/"family_shaft_keys.py"))
    support=shaft["support_keys"]
    def current_file(name):
        return json.loads((HERE/name).read_text())
    keys=support(S,current_file("upper-wc-release.json"),current_file("household-water.json")["basins"],P)
    shaft_path=HERE/"family-shaft-keys.json"
    shaft_data=json.dumps(keys,indent=2)+"\n"
    plate=HERE/"family-shaft-keys.svg"
    svg=shaft["drawing"](keys,S["plant"]["proposedServices"])
    if check:
        assert plate.read_text()==svg,"Regenerate the shaft plate"
        assert shaft_path.read_text()==shaft_data,"Regenerate the shaft key schedule"
    else:
        shaft_path.write_text(shaft_data)
        plate.write_text(svg)
    if check:
        assert schedule.read_text()==data,"Regenerate the fitted WC schedule"
    else:
        schedule.write_text(data)
    path=Path(__file__).with_suffix(".svg")
    if check:
        assert path.read_text()==figure(r),"Regenerate the four WC plans"
    else:
        path.write_text(figure(r))
    for n in ("guest","principal","family","rear"):
        q=r[n]; print(n, "body spare", round(q.get("bodyReserve",q.get("stationBody")),2),
                      "max modelled reach",round(q.get("valveReach",q.get("reachToNut")),2))
    print("North-wall family WC interval contradiction (mm)", round(r["family"]["minX"]-r["family"]["maxX"],2))

if __name__=="__main__":
    main()
