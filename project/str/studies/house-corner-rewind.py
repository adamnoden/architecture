"""Select a coordinated architectural rewind against the current water-safe house."""
from pathlib import Path
import json
import hashlib
import math
import runpy
import sys

here = Path(__file__).resolve().parent
root = here.parents[2]
sources={}
def read(p):
    raw=(root/p).read_bytes()
    sources[p]=hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()
    return json.loads(raw)
h = read("project/had/studies/water-replan.json")["model"]
arch = read("project/str/studies/current-house-arch-movement.json")["geometry"]
jambs = read("project/str/studies/current-house-arch-jambs.json")["openings"]
grid = read("project/str/studies/current-house-grid.json")
roof = read("project/mat/studies/raised-roof-edge.json")
barrier = read("project/str/studies/current-house-window-renewal.json")["temporaryBarrier"]
end = read("project/str/studies/corner-arch-end.json")["occupation"]
witnesses = h["windowRequirements"]
assert h["shell"]==12000 and h["court"]==[4250,4250,3500,3500]
assert h["sections"]["firstFFL"]==3450 and h["sections"]["firstFloorRC"]=={"top":3370,"bottom":3170}
assert h["currentAdoptionBlockers"] == []
sides=("outer-south","outer-east","outer-north","outer-west")
# Physical opening area projected on the facade. Keep identical section geometry
# while translating for this trial. It does not predict illuminance or air change.
def area(row):
    b=row["width"]; rise=row["head"]-row["spring"]
    rad=b*b/(8*rise)+rise/2
    return (b*(row["spring"]-row["sill"])+rad*rad*math.acos((rad-rise)/rad)-(rad-rise)*b/2)/1e6

def to_world(side,s,z):
    return {"outer-west":[0,s,z],"outer-east":[12000,s,z],"outer-north":[s,12000,z],"outer-south":[s,0,z]}[side]

def supports(side,station):
    target=[v for k,v in grid["girders"].items() if (k==side.replace("west","W").replace("east","E").replace("south","S")) or
            (side=="outer-north" and k==("outer-NW" if station<6000 else "outer-NE"))]
    assert len(target)==1,side
    points=target[0]["heads"]
    for a,b in zip(points,points[1:]):
        if a["u"]<=station<=b["u"]:
            frac=(station-a["u"])/(b["u"]-a["u"])
            assert abs(a["u"]*(1-frac)+b["u"]*frac-station)<1e-7
            return [a["id"],b["id"]],[1-frac,frac]
    raise ValueError((side,station))

changes=[]
near_axis,far_axis=1497.5,2702.5
old_lo,old_hi=1300,2300
for level,rows in h["openings"].items():
    for side in sides:
        ordered=sorted([r for r in rows if r["wall"]==side], key=lambda r:r["centre"])
        new_edges=[]
        for r in ordered:
            c,b=r["centre"],r["width"]
            move=300 if c==1800 else -300 if c==10200 else 0
            new_edges.append([c+move-b/2,c+move+b/2])
            if move:
                assert r["kind"]=="window" and b==1000 and r["head"]==2850
                z=0 if level=="GROUND" else h["sections"]["firstFFL"]
                feet=[near_axis,far_axis] if c<6000 else [12000-near_axis,12000-far_axis]
                choices=[supports(side,p) for p in feet]
                changes.append(dict(level=level,side=side,id=r["id"],old=c,new=c+move,
                    clear=[c+move-500,c+move+500],sill=z+r["sill"],head=z+r["head"],area=area(r),
                    worldCentre=to_world(side,c+move,z+r["sill"]),jambAxes=feet,headPairs=choices))
        assert all(a[1]<b[0] for a,b in zip(new_edges,new_edges[1:]))
assert len(changes)==16 and len(jambs)==8
assert all(c["clear"]==[1600,2600] or c["clear"]==[9400,10400] for c in changes)
# Leave the existing L toe in the primary roof/diaphragm frame. The first
# storey cannot bear a new 205 jamb over the ground window it replaces.
near_edges=[1395,1600]; far_edges=[2600,2805]; joint=25
old_ground_intersection=min(near_edges[1],old_hi)-max(near_edges[0],old_lo)
assert old_ground_intersection==205
toe_gap=near_edges[0]-arch["RCtoe"]
assert toe_gap==132.5
roof_gap=min(j["outsideRingToNearestRoofStation"] for j in jambs)-300
assert roof_gap>477
# Counterfactual near columns only. A gross upper bound before displaced infill;
# include first moments through actual named perimeter girder support intervals.
increment={}
gross=0
for c in changes:
    base=h["sections"]["groundFloorRC"]["top"] if c["level"]=="GROUND" else h["sections"]["firstFloorRC"]["top"]
    crown=arch["springCentreZ"]+(0 if c["level"]=="GROUND" else 3450)
    weight=.205*.180*((crown-base)/1000)*25; gross+=weight
    keys,fracs=c["headPairs"][0]
    for k,f in zip(keys,fracs):increment[k]=increment.get(k,0)+weight*f
assert abs(sum(increment.values())-gross)<1e-8
old_sock=barrier["postSocketsX"][0]+300
assert arch["RCtoe"]<old_sock<near_edges[0]
new_sockets=[near_axis,far_axis]
assert min(new_sockets[0]-near_edges[0],far_edges[1]-new_sockets[1])==102.5

# Principal room. A 600-diameter standing body has no east-side passage in the
# inherited 30 mm gap. Every point within 600 of the grip is abreast of the
# bed in X, so a northern standing position is the nearest possible class.
bed=h["furnitureRequirements"]["principalBed"]
bx,by,bw,bh=bed["whole"]; wall=12000-h["envelope"]
grip=next(i for i in witnesses if i["id"]=="principalEast10200")["handle"]
radius=300; reach=600; new_grip=[grip[0],grip[1]-300]
room_spare=bed["remainingPassageAfterLoss"]-600
shift_south=by+bh+radius-new_grip[1]-math.sqrt(reach**2-radius**2)
assert room_spare==14 and 210<shift_south<211 and wall-(bx+bw)==30
newbed=[9315,9150,1600,2090]; parked=[8540,9150,1600,2090] # 775 west, only for traceable service mode
ward=h["upperFurniture"]["principal-wardrobe"]; stage=bed["maintenance"]["paddedStage"]
assert min(wall-(newbed[0]+newbed[2]),newbed[0]-(ward[0]+ward[2]))>=650
assert parked[0]-(ward[0]+ward[2])>=100 and stage[0]-(parked[0]+parked[2])>=25
assert bed["southPassage"]-50==614 and newbed[1]==by
def pt_rect(p,r):
    return math.hypot(max(r[0]-p[0],0,p[0]-r[0]-r[2]),max(r[1]-p[1],0,p[1]-r[1]-r[3]))
def centre_check(p,level,skip,extra):
    furniture=h["upperFurniture" if level=="FIRST" else "groundFurniture"]
    solids=[v for k,v in furniture.items() if k not in skip]+extra
    return min([pt_rect(p,r) for r in solids]+[p[0]-h["envelope"],p[1]-h["envelope"],wall-p[0],wall-p[1]])-radius
corner_tasks={}
for w in witnesses:
    if w["id"] not in ("living1800","studySouth1800","studyWest1800","kitchen10200","principalEast10200","principalNorth10200","principalNorth8300"):
        continue
    grip=w["handle"].copy(); p=w["body"].copy(); id=w["id"]
    if id in ("living1800","studySouth1800"):grip[0]+=300
    if id=="studyWest1800":grip[1]+=300
    if id in ("kitchen10200","principalNorth10200"):grip[0]-=300
    if id=="principalEast10200":grip[1]-=300;p=[11242.75,grip[1]]
    if id=="principalNorth10200":p=[8990,11245.5]
    if id=="kitchen10200":p=[10345,11045.5]
    clear=centre_check(p,w["level"],{"principal","principal-head","cold-storage"},[newbed] if w["level"]=="FIRST" else [[10920.5,8725,650,650]])
    corner_tasks[id]=dict(grip=grip,body=p,reach=math.dist(p,grip),clearance=clear)
    assert corner_tasks[id]["reach"]<=600 and clear>=-1e-8,(id,p,grip,clear)

# Mirror the actual low-hinge refrigerator operation at a new north hinge.
# For all t in [0,pi/2], each body/hand coordinate is H -/+ a sin t +/- b cos t.
# Use full axis-aligned interval bounds for the static obstacles and exact
# body/arm clearance to the moving rectangular leaf in its own (u,n) frame.
fridge=h["groundFurniture"]["cold-storage"]; new_fridge=[fridge[0],fridge[1]-300,*fridge[2:]]
hinge=[fridge[0],new_fridge[1]+650]; body_box=[hinge[0]-math.hypot(250,345)-300,hinge[1]-250-300,
              hinge[0]-min(250,345)+300,hinge[1]+345+300]
assert body_box[1]>h["rooms"]["kitchenDining"]["bounds"][1]
chair_east=max(v[0]+v[2] for k,v in h["groundFurniture"].items() if 'dining-chair' in k)
assert body_box[0]>chair_east
fridge_window_gap=9400-(new_fridge[1]+650)
assert fridge_window_gap==25 and 9400-(fridge[1]+650)==-275
# Faces in the local moving coordinates: the 70 mm leaf is centred on n=0;
# its outside face is n=35. All points of the arm segment have n>=95.
assert 345-35-300==10 and 95-35-40==20 and math.hypot(600-250,345-95)<600
# The regular two-storey CAD and all eight updated occupied-window operations
# do not establish a NEW coherent 96-wind / guard solution or a served receiver
# in the old empty near socket strip. Preserve both model boundaries.
near_release={"oldSocketShifted":old_sock,"oldToe":arch["RCtoe"],"newJamb":near_edges,
 "newJambSocket":near_axis,"nominalCentreEdge":102.5,"westCabinetGap":h["upperFurniture"]["rear-cabinet"][1]-(12000-near_axis)}
assert near_release["westCabinetGap"]==297.5
assert roof["trialRidgeCapApexAndEdgeZ"][0]>roof["trialWallLineAndFieldRidgeZ"][1]>h["roofSelectionComparison"]["retained"]["ridge"]
out={"disposition":"Supplied house requires an architectural rewind; alternate geometry is a proposed successor, not an adopted or signed structure.",
 "sourceWork":"HAD-WATER-REPLAN; current pitched steel/RC/52-head comparison; MAT north ordinary raised field and cap.",
 "changes":changes,"jointGapMm":toe_gap,"oldGroundOpeningBelowJambMm":old_ground_intersection,
 "roofStationClearanceLowerMm":roof_gap,"grossNearJambWeightKN":gross,"grossNewNearJambReactionsKN":increment,
 "upperWindowAreaM2":sum(c["area"] for c in changes if c["level"]=="FIRST"),"lowerWindowAreaM2":sum(c["area"] for c in changes if c["level"]=="GROUND"),
 "retainedOrientation":{"minimumBedSouthMoveMm":shift_south,"permittedBedSouthMoveMm":room_spare},
 "principal":{"ordinaryBed":newbed,"servicePark":parked,"paddedStage":stage,"eastStripMm":wall-newbed[0]-newbed[2]},
 "kitchen":{"newFridge":new_fridge,"hinge":hinge,"fridgeToWindowMm":fridge_window_gap,"bodySweepAABB":body_box},
 "namedWindowActions":corner_tasks,"windowBarrier":near_release,
 "roof":{"HADridge":h["roofSelectionComparison"]["retained"]["ridge"],"northField":roof["trialWallLineAndFieldRidgeZ"],"northCap":roof["trialRidgeCapApexAndEdgeZ"],"capRise":roof["additionalCapLiftVertical"]},
 "adopted":False,"newSignedWholeHouseRegister":None}
print(f"{len(changes)} apertures; {gross:.2f} kN gross jamb trace; shifted fridge 25 mm; east strip {out['principal']['eastStripMm']:.1f}; north cap {out['roof']['northCap'][0]:.2f}.")

# The occupied-room tests include a connected path from the bedroom doorway,
# the operating clearances at the two north grips and the actual shower entry.
def seg_rect(a,b,r):
    inside=[0.,1.]
    for i in (0,1):
        d=b[i]-a[i]
        if not d:
            if not r[i]<=a[i]<=r[i]+r[i+2]:inside=[1.,0.]
        else:
            t=sorted(((r[i]-a[i])/d,(r[i]+r[i+2]-a[i])/d))
            inside=[max(inside[0],t[0]),min(inside[1],t[1])]
    if inside[0]<=inside[1]:return 0.
    def ps(p):
        d=[b[i]-a[i] for i in (0,1)];l=sum(e*e for e in d)
        t=min(1,max(0,sum((p[i]-a[i])*d[i] for i in (0,1))/l)) if l else 0.
        return math.dist(p,[a[i]+t*d[i] for i in (0,1)])
    return min(pt_rect(a,r),pt_rect(b,r),*(ps([r[0]+dx,r[1]+dy]) for dx in (0,r[2]) for dy in (0,r[3])))
routes=[[(8700,8800),(11242.75,8800),(11242.75,10320)],
        [(8700,8800),(8990,8800),(8990,11245.5)],
        [(8990,11245.5),(8700,11250)],[(8700,8800),(10400,8825)]]
new_furn=[r for k,r in h["upperFurniture"].items() if k not in ("principal","principal-head")]+[newbed]
route_min=min(seg_rect(a,b,r)-300 for route in routes for a,b in zip(route,route[1:]) for r in new_furn)
assert route_min>=20
# Do not declare free space at unmodelled upper-wall openings: all preceding
# paths stay within the principal bedroom, north of its finished south wall.
assert min(p[1] for route in routes for p in route)-300>8424.5
out["principal"]["routes"]=routes
out["principal"]["routeToFurnitureMm"]=route_min
out["principal"]["serviceWardrobeClearMm"]=parked[0]-ward[0]-ward[2]
# Angular Lipschitz bounds for the rehanded operation, including the door
# and all surrounding fixed furniture, with the pantry leaf already removed.
statics=[r for k,r in h["groundFurniture"].items() if k!="cold-storage"]+[new_fridge]
body_gap=arm_gap=1e9
for i in range(901):
    t=math.radians(i/10);u=[-math.sin(t),-math.cos(t)];n=[-math.cos(t),math.sin(t)]
    p=[hinge[k]+250*u[k]+345*n[k] for k in (0,1)]
    q=[hinge[k]+600*u[k]+95*n[k] for k in (0,1)]
    body_gap=min(body_gap,*(pt_rect(p,r)-300 for r in statics))
    arm_gap=min(arm_gap,*(seg_rect(p,q,r)-40 for r in statics))
delta=math.radians(.05)
out["kitchen"]["bodyToFixedMm"]=min(body_gap-math.hypot(250,345)*delta,body_box[1]-8424.5)
out["kitchen"]["armToFixedMm"]=arm_gap-math.hypot(600,95)*delta
assert min(out["kitchen"]["bodyToFixedMm"],out["kitchen"]["armToFixedMm"])>0
out["programme"]={"bedroomCount":4,"bedFrames":[h["upperFurniture"][k] for k in ("bed2","bed3","bed4")]+[newbed],
 "bed2And3Windows":[r["opening"] for r in h["frontWindowRequirements"]],"occupiedFloorChangeM2":0,
 "unchanged":["stair and entrance void","three sanitary rooms and independent ground WC","floor/room boundaries and protected stair/front door",
              "court and two water routes","primary pitched roof, diaphragm and corner stability frame"],
 "originalRoughAreaChangeM2":0}
out["roof"]["grossRiseAtNorthCap"]=out["roof"]["northCap"][0]-out["roof"]["HADridge"]
# No false positive from a calmed isolated new pier: the supplied global
# response uses a near L support, which the new portals explicitly remove.
legacy=read("project/str/studies/corner-arch-end.json")
cards=legacy["cards"]
tip={i:cards["separated36"][i]["nearGapXYZmm"][1] for i in ("7","3")}
assert min(abs(d) for d in tip.values())>70
assert cards["hinge18"]["7"]["near"]["edges"][0]<-12
assert min(tip.values())<-124 and end["pin"]["nominalCabinetPlanOverlap"]>6
out["legacy"]=dict(occupation=legacy["occupation"]["pin"],case=legacy["case"],options=legacy["options"],
                    separatedWallNormalMm=tip,hingeEdgeLineKN=cards["hinge18"]["7"]["near"]["edges"])
# Recheck the new MAT sash relative to the fixed front approach. Translate
# the head pack and interior working platform together, not the ramp or desk.
coupled=read("project/mat/studies/study-coupled-window.json")
entry=read("project/mat/studies/front-threshold.json")["foldRepair"]
sash=coupled["section"]; service=coupled["service"]; landing=coupled["ramp"]["landing"]
wx,wy=coupled["ramp"]["overLandingXYat30"]; wx+=300
assert landing[0]<wx<landing[0]+landing[2] and landing[1]<wy<landing[1]+landing[3]
reach_x=sash["movingHingeX"]+300+math.hypot(sash["movingWidth"],sash["depth"])
top_guard=entry["revisedLandingsXYWH"][0][0]-entry["guardEach"]
assert reach_x<top_guard and coupled["ramp"]["newAfterTwo10"]==2080
platform=service["platformXYWH"].copy();platform[0]+=300
assert service["deskParkY"]-platform[1]-platform[3]==135
assert service["chairPark"][1]-platform[1]-platform[3]>300
out["studySouth2100"]={"occupiedOpeningRequirements":coupled["current"],"shiftedPlatform":platform,
 "halfLandingWitness":[wx,wy],"clearToUpperLandingGuardMm":top_guard-reach_x,
 "underHardwareAfterTwo10Mm":coupled["ramp"]["newAfterTwo10"],"deskNorthGapMm":135,
 "headDrawMm":service["headAndLatticeDraw"],"innerZoneBearingOverlapMm":sash["innerZoneBearingOverlap"]}
out["sourceMain"]="126ae0c2c31025d2a1c1307fd7fe2849df75f6c1"
# The four-WC scope came from the companion IAS parent. It uses a different
# cart and swept outline from the existing shower-tray service stage.
wc_file="project/ias/studies/wc-service-stations.py"
wc_raw=(root/wc_file).read_bytes()
sources[wc_file]=hashlib.sha1(b"blob "+str(len(wc_raw)).encode()+b"\0"+wc_raw).hexdigest()
wc=runpy.run_path(str(root/wc_file))["solution"]()["principal"]
px,py,pw,ph=wc["stage"]
pan=[px-25,py-25,pw+50,ph+50]
intersections=[min(newbed[i]+newbed[i+2],pan[i]+pan[i+2])-max(newbed[i],pan[i]) for i in (0,1)]
park_gap=min(rect[0] for rect in wc["sweeps"])-(parked[0]+parked[2])
assert intersections[0]>0 and intersections[1]==65 and park_gap==195
out["principal"]["wcPan"]={"paddedStage":pan,"ordinaryYOverlapMm":65,"parkedToWholeSweepMm":park_gap}
out["sourceBlobs"]=sources
data=json.dumps(out,indent=2)+'\n'

# Ground and first plates share full-scale coordinates. Section magnifies the
# vertical so the transition from present ridge to raised ordinary cap reads.
def label(x,y,s,size=14):
    return f'<text x="{x}" y="{y}" font-size="{size}">{s}</text>'
def line(points,c,w=2,extra=""):
    pts=" ".join(f"{p[0]:.1f},{p[1]:.1f}" for p in points)
    return f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="{w}" {extra}/>'
art=['<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="690" viewBox="0 0 1050 690">',
     '<title>Coordinated corner opening rewind on both inhabited floor plates and the north roof section</title>',
     '<desc>Sixteen corner bays shift away from the four exterior corners. The fridge changes hinge and the principal bed turns ninety degrees. The section compares the existing and raised ordinary north crown.</desc>',
     '<rect width="1050" height="690" fill="#faf9f5"/><g font-family="Arial,sans-serif" fill="#243d43">',
     label(25,37,'Move the corner openings on both storeys',26),
     label(25,62,'Ochre = old centre · Green = proposed aperture · Solid bars = new jambs · North up')]
for level,ox in (("GROUND",25),("FIRST",375)):
    p=lambda x,y:(ox+x*.025,400-y*.025)
    def box(r,fill,stroke="none"):
        xx,yy,ww,hh=r;a,b=p(xx,yy+hh)
        return f'<rect x="{a:.1f}" y="{b:.1f}" width="{ww*.025:.1f}" height="{hh*.025:.1f}" fill="{fill}" stroke="{stroke}"/>'
    art+=[label(ox,88,"GROUND" if level=="GROUND" else "FIRST",16),box([0,0,12000,12000],"#eae8dc","#544f46"),
          box(h["court"],"#faf9f5","#a2b4a7")]
    for wall_r in h["groundWalls" if level=="GROUND" else "upperWalls"]:
        start,finish=wall_r["a"],wall_r["b"]
        axis=0 if start[1]==finish[1] else 1
        lo,hi=sorted((start[axis],finish[axis]))
        for aa,bb in [*wall_r.get("holes",[]),[hi,hi]]:
            if aa>lo:
                a=list(start);b=list(start);a[axis]=lo;b[axis]=aa
                art.append(line([p(*a),p(*b)],"#a6a393",1))
            lo=max(lo,bb)
    for rr in (h["groundFurniture"] if level=="GROUND" else h["upperFurniture"]).values():
        art.append(box(rr,"#c9c9bc"))
    for cc in changes:
        if cc["level"]!=level:continue
        side=cc["side"];old=cc["old"];lo,hi=cc["clear"]
        def point(station):return p(*to_world(side,station,0)[:2])
        art.append(line([point(old-500),point(old+500)],"#c7804b",6))
        art.append(line([point(lo),point(hi)],"#348179",5))
        for ax in cc["jambAxes"]:
            art.append(line([point(ax-102.5),point(ax+102.5)],"#344c58",6))
    art.append(box(new_fridge if level=="GROUND" else newbed,"#82b7a4","#325d51"))
art+= [label(715,115,'Two-storey control',18),label(715,147,'Local centres 1800 → 2100 mm.'),
       label(715,171,'Keep all 16 raw widths and heads.'),
       label(715,197,'An upper-only move would leave a full'),
       label(715,218,'205 mm jamb over the ground opening.'),
       label(715,260,'Rooms affected',18),label(715,288,'Kitchen · move fridge 300 south and'),
       label(715,310,'reverse its hinge. Principal · rotate the'),
       label(715,332,'complete bed, then park it 775 west'),
       label(715,354,'during the shower-tray service task.'),
       label(25,444,'NORTH ORDINARY SECTION · X4700 or X7300',16)]
s=lambda y,z:(53+(y-7750)*.146,638-(z-3000)*.031)
for z1,z2 in ((3170,3370),):
    art.append(line([s(7750,z1),s(12000,z1),s(12000,z2),s(7750,z2),s(7750,z1)],'#665f53',2))
for yy in (7750,12000):
    art.append(line([s(yy,3170),s(yy,7100)],'#938b77',5))
art.append(line([s(7750,7100),s(9875,out["roof"]["HADridge"]),s(12000,7100)],'#b58059',2,'stroke-dasharray="6 3"'))
art.append(line([s(7750,roof["trialWallLineAndFieldRidgeZ"][0]),s(9875,roof["trialWallLineAndFieldRidgeZ"][1]),s(12000,roof["trialWallLineAndFieldRidgeZ"][0])],'#348179',3))
cap=roof["trialRidgeCapApexAndEdgeZ"]
art.append(line([s(9625,cap[1]),s(9875,cap[0]),s(10125,cap[1])],'#344c58',5))
art+=[label(46,659,'Court edge'),label(586,659,'Outer wall'),label(715,471,'Crown levels above ground floor',18),
      label(715,502,'Inherited HAD ridge +8090.90'),label(715,529,'Packed field +8299.46'),
      label(715,556,'Local structural cap +8464.73'),label(715,591,'The hips, valleys and ceiling must join'),
      label(715,613,'this ordinary section on the same house.'),'</g></svg>']
for ext,body in [('json',data),('svg','\n'.join(art)+'\n')]:
    path=here/('house-corner-rewind.'+ext)
    if '--check' in sys.argv: assert path.read_text()==body,'Regenerate '+str(path)
    else: path.write_text(body)
