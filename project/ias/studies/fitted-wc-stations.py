"""Check the selected WCs, occupied bathing movements and service-shaft exchanges."""
import argparse
import json
import math
from pathlib import Path
import runpy

HERE = Path(__file__).resolve().parent
# Keep the earlier station comparison available for its original structural join.
stations = runpy.run_path(str(HERE / "wc-service-stations.py"))
B, G, H, P, RADIUS, S, U = (stations[key] for key in ("B", "G", "H", "P", "RADIUS", "S", "U"))
overlap, route, segbox = (stations[key] for key in ("overlap", "route", "segbox"))


def current_file(name):
    return json.loads((HERE / name).read_text())


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


def occupied_replay():
    wc=runpy.run_path(str(HERE/"upper-wc-release.py"))
    basins=current_file('household-water.json')['basins']
    pans={key:value['pan'] for key,value in basins.items()}
    joined=wc["study"](pans)
    rear=json.loads((HERE/'rear-tray-first.json').read_text())['change']
    tray_path=rear['route']; extra=rear['liftProjection']
    rear_gap=min(wc['rectangle_gap']([min(a[0],b[0])-extra,min(a[1],b[1])-extra,
                                abs(a[0]-b[0])+a[2]+2*extra,abs(a[1]-b[1])+a[3]+2*extra],pans['rear'])
                 for a,b in zip(tray_path,tray_path[1:]))
    walk_gap=min(segbox(a,b,pans['rear'])-300 for a,b in zip(rear['walk'],rear['walk'][1:]))
    whole=json.loads((HERE/'three-bathing-sections.json').read_text())['originalBathExchange']
    yoke=whole['inside']['yokeExample']
    foot_max=max(p[1]+yoke['pad']/2 for p in yoke['posts'])
    bath_gap=pans['family'][1]-max(whole['inside']['minMaxY'][1],max(yoke['headerYSweep']),foot_max)
    assert rear_gap>0 and walk_gap>0 and bath_gap>0
    replay={'familyWCFirstAndRest':[joined['family']['minFirstSweep'],joined['family']['afterFirst150Min']],
            'principalWCFirstAndRest':[joined['principal']['minFirstSweep'],joined['principal']['afterFirst150Min']],
            'principalShower':joined['principal']['showerAt145'],
            'familySmallBathComparator':joined['bath']['newRoom']['minimumContinuousGap'],
            'originalBathRollYokeAndFeetToBasin':bath_gap,'selectedRearTrayToBasin':rear_gap,
            'rearTrayApproachToBasin':walk_gap}

    # The structural corner rewind moves the bed independently of the fitted
    # WC study. Compare the newly selected whole carrier with BOTH bed states.
    structural=current_file('../../str/studies/house-corner-rewind.json')['principal']
    pan=joined['principal']
    path=pan['trimmedCarrierCentrePath']
    width,depth=wc['trimmed_carrier_size'](pan['suite'])
    moves=[pan['first150Sweep']]+[wc['moving_box'](a,b,width,depth) for a,b in zip(path,path[1:])]
    rest=wc['moving_box'](path[-1],path[-1],width,depth)
    ordinary=overlap(rest,structural['ordinaryBed'])
    parked=min(wc['rectangle_gap'](swept,structural['servicePark']) for swept in moves)
    assert ordinary[0]>0 and ordinary[1]==60 and parked==202.5, (ordinary, parked)
    replay['principalCarrierVsStructuralBed']={'terminalRest':rest,'ordinaryPlanOverlap':ordinary,
                                              'parkedBedToFullSweep':parked}
    return replay


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    check=parser.parse_args().check
    current=stations['solution']()
    takeoffs=current_takeoffs(current)
    shaft=runpy.run_path(str(HERE/'family_shaft_keys.py'))
    keys=shaft['support_keys'](S,current_file('upper-wc-release.json'),current_file('household-water.json')['basins'],P)
    outputs={
        'fitted-wc-schedule.json': fitted_schedule(current,takeoffs),
        'family-shaft-keys.json': keys,
        'family-shaft-keys.svg': shaft['drawing'](keys,S['plant']['proposedServices']),
        'occupied-fixture-replay.json': occupied_replay(),
    }
    for name,data in outputs.items():
        path=HERE/name
        text=data if isinstance(data,str) else json.dumps(data,indent=2)+'\n'
        if check:
            assert path.read_text()==text,'Regenerate '+name
        else:
            path.write_text(text)
    print('Fitted WCs, occupied bathing and shaft exchanges checked against the current house and structural bed park.')


if __name__=='__main__':
    main()
