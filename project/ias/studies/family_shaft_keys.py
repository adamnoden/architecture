"""Check the complete service keys and their occupied straight withdrawal to a captured rest."""
from math import cos, sin, radians, dist, hypot


def hull(points):
    points=sorted(set(map(tuple,points)))
    def half(sequence):
        side=[]
        for c in sequence:
            while len(side)>1:
                a,b=side[-2:]
                if (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0:
                    break
                side.pop()
            side.append(c)
        return side
    return half(points)[:-1]+half(reversed(points))[:-1]


def edges_of(poly):
    return [(poly[i-1],p) for i,p in enumerate(poly)]


def inside(p,poly):
    return all((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=-1.e-7 for a,b in edges_of(poly))


def shell_exchange(name,pipe,pipes,objects,geometry):
    # Machined loose ring OD is the service envelope +24 including its keeper.
    # A half-ring translating away from its mating pipe fits this closed
    # half-square. The two-piece rotation fits its circumcircle, NOT a square.
    x,y=pipe["centre"]; r=pipe["outerEnvelope"]/2+12
    faces={"H-return":[9997,4865],"cold":[9997,4865],"hot":[9570,5425],
           "hot-return":[9550,5425],"soil-comparator":[9760,5425]}
    if name=="H-flow":
        poses=[[x,y],[x,4775],[10140,4775]]
    else:
        f=faces[name]; length=dist([x,y],f)
        poses=[[x,y],[f[i]+(f[i]-[x,y][i])*(r+20)/length for i in range(2)]]
    distance=dist(poses[0],poses[1]); u=[(b-a)/distance for a,b in zip(*poses[:2])]
    n=[-u[1],u[0]]; offset=[(0,-r),(r,-r),(r,r),(0,r)]
    def poly_at(point):
        return [(point[0]+a*u[0]+b*n[0],point[1]+a*u[1]+b*n[1]) for a,b in offset]
    def rect(b):
        x,y,w,h=b
        return [(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
    point_gap=geometry["nearest"]; seg_gap=geometry["segdist"]
    neighbours=[p for p in pipes.values() if p!=pipe]
    spin=min([dist(q["centre"],[x,y])-q["outerEnvelope"]/2-r-10 for q in neighbours]
             +[geometry["ptbox"]([x,y],b)-r-10 for b in objects])
    clear=[]
    for first,last in zip(poses,poses[1:]):
        swept=hull(poly_at(first)+poly_at(last))
        clear.extend(min(a-9397,11567.5-a,b-3800,6400-b)-10 for a,b in swept)
        for q in neighbours:
            pt=q["centre"]
            d=0 if inside(pt,swept) else min(point_gap(pt,a,b) for a,b in edges_of(swept))
            clear.append(d-q["outerEnvelope"]/2-10)
        for b in objects:
            box=rect(b)
            gap=(0 if inside(box[0],swept) or inside(swept[0],box)
                 else min(seg_gap(a,b,c,d) for a,b in edges_of(swept) for c,d in edges_of(box)))
            clear.append(gap-10)
    assert spin>0 and min(clear)>0,(name,spin,min(clear))
    return {"centres":poses,"outerRadius":r,"rotationClear":spin,"withdrawalClear":min(clear)}


def support_keys(services, upper, basins, geometry):
    segbox, nearest, segdist = (geometry[k] for k in ("segbox", "nearest", "segdist"))
    family = upper["family"]
    cabinet = [9397,4675,600,750]
    fixed = [r for r in family["fixed"] if r != [11227.5,5200,340,450]]
    assert cabinet in fixed
    fixed += [basins["family"]["pan"], family["suite"], family["fixedTerminal"],
              [9397,5450,44,900]]  # closed privacy door
    posts = [[x-15,y-15,30,30] for x in (9415,9979) for y in (4693,5407)]
    # Primary centre height, direction of the opposed bearing pins, two
    # aperture points (east/north), and occupied worker stations for the draw.
    layout = {
        "H-flow": (600,84,[(9997,4730),(9997,5010)],[(10370,5080),(10330,5440)]),
        "H-return": (770,108,[(9997,4860),(9997,5040)],[(10330,5300),(10510,4860)]),
        "cold": (940,55,[(9997,4845),(9997,5100)],[(10430,5060),(10390,5420)]),
        "hot": (1110,0,[(9470,5425),(9610,5425)],[(9850,5780),(9990,5780)]),
        "hot-return": (1280,125,[(9997,4950),(9655,5425)],[(10390,5280),(10030,5780)]),
        "soil-comparator": (1450,0,[(9680,5425),(9997,5205)],[(10050,5800),(10390,4900)]),
    }
    pipes = {p["id"]:p for p in services["plant"]["proposedServices"]}
    assert pipes.keys()==layout.keys()
    entry=family["entry"]
    assert entry==[10380,5800]
    rows={}
    for name,(height,angle,edges,stations) in layout.items():
        pipe=pipes[name]; x,y=pipe["centre"]; radius=pipe["outerEnvelope"]/2
        pins=[(x+i*(radius+32)*cos(radians(angle)),y+i*(radius+32)*sin(radians(angle)))
              for i in (-1,1)]
        lines=[]; keys=[]
        for idx,(pin,edge,worker) in enumerate(zip(pins,edges,stations)):
            length=dist(pin,edge)
            end=[edge[i]+(edge[i]-pin[i])*(length+35)/length for i in range(2)]
            # A 20 wide key and all fittings, two independent 5 mm errors.
            # The 45 deep rectangular section fits the vertically staggered tiers.
            pipes_clear=min(nearest(p["centre"],pin,edge)-p["outerEnvelope"]/2-20
                            -(6 if p["id"]==name else 0) for p in pipes.values())
            # The radial 6-wide nose stays on the key. Its inner end
            # intentionally engages ONE bearing shelf on the removable half.
            # The minimum projections show withdrawal goes outwards, so it
            # cannot drive that nose towards its own cylindrical service.
            ux,uy=(edge[0]-pin[0])/length,(edge[1]-pin[1])/length
            nx,ny=(pin[0]-x)/(radius+32),(pin[1]-y)/(radius+32)
            assert nx*ux+ny*uy>=-1e-6
            toe=[x+(radius+8)*nx,y+(radius+8)*ny]
            toe_end=[toe[i]+end[i]-pin[i] for i in (0,1)]
            # Bounding the swept short radial nose by the key sweep plus its
            # 24 radial projection also tests intermediate positions.
            toe_sweep=hull([toe,pin,end,toe_end])
            other_clear=[]
            for other in pipes.values():
                if other==pipe:
                    continue
                centre=other["centre"]
                d=0 if inside(centre,toe_sweep) else min(nearest(centre,a,b) for a,b in edges_of(toe_sweep))
                other_clear.append(d-other["outerEnvelope"]/2-3-10)
            assert min(other_clear)>0,(name,other_clear)
            opposite=nearest(pins[1-idx],pin,end)-8-20
            furniture_clear=min(segbox(pin,end,r) for r in fixed if r!=cabinet)-20
            post_clear=min(segbox(pin,end,r) for r in posts)-20
            room_clear=min(end[0]-9397,11567.5-end[0],end[1]-3800,6400-end[1])-20
            # Reach the closed-door working stance before the guide projects.
            # A positively retained rail receives the whole removed key.
            body_clear=min(min(segbox(entry,worker,r) for r in fixed)-300,
                           nearest(worker,pin,end)-320,
                           min(worker[0]-9397,11567.5-worker[0],worker[1]-3800,6400-worker[1])-300)
            reach=hypot(dist(worker,edge),60)
            reserve=min(pipes_clear,opposite,furniture_clear,post_clear,room_clear)
            assert reserve>0 and body_clear>0 and reach<600,(name,idx,reserve,body_clear,reach)
            lines.append((pin,end))
            keys.append({"pinXY":pin,"faceXY":edge,"parkTipXY":end,"workerXY":worker,
                         "length":length,"solidClear":reserve,"bodyClear":body_clear,"gripReach":reach})
        # The other socket, bearing and key remain positively attached.
        pair_clear=segdist(*lines[0],*lines[1])-30
        assert pair_clear>0,(name,pair_clear)
        shell=shell_exchange(name,pipe,pipes,[r for r in fixed if r!=cabinet]+posts,geometry)
        # After each full draw the receiver folds wholly outside the face,
        # then lifts the upright package clear of the working and transfer tiers.
        parks=[]
        for k in keys:
            a,b=k["pinXY"],k["faceXY"]
            parks.append([b[i]+35*(b[i]-a[i])/k["length"] for i in (0,1)])
        assert all(nearest(parks[i],entry,keys[1-i]["workerXY"])>340 for i in (0,1))
        assert max(height+180+k["length"]+35+25 for k in keys)<2000
        front={"H-flow":[9997,4775],"H-return":[9997,4865],"cold":[9997,4865],
               "hot":[9570,5425],"hot-return":[9550,5425],"soil-comparator":[9760,5425]}[name]
        stance={"H-flow":[10420,5100],"H-return":[10460,5080],"cold":[10480,4980],
                "hot":[9880,5820],"hot-return":[9840,5840],"soil-comparator":[10140,5780]}[name]
        centres=shell["centres"]
        access=min([segbox(entry,stance,r)-300 for r in fixed]+[nearest(p,entry,stance)-340 for p in parks]
                   +[nearest(stance,a,b)-shell["outerRadius"]-310 for a,b in zip(centres,centres[1:])]
                   +[stance[0]-9397-300,11567.5-stance[0]-300,stance[1]-3800-300,6400-stance[1]-300])
        assert access>0 and hypot(dist(stance,front),60)<600
        shell.update({"operatingFace":front,"workerXY":stance,"workerReserve":access})
        rows[name]={"splitShell":shell,"foldedKeyCentres":parks,"primaryZ":height,"transferZ":height+75,"keys":keys,"pairClear":pair_clear}
    return rows


def drawing(rows, pipes):
    """Six small plans share one scale and a common north-up coordinate system."""
    from html import escape
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="800" viewBox="0 0 960 800" role="img" aria-labelledby="t d">',
         '<title id="t">Renew the six upper service supports</title><desc id="d">Six plans show the two removable support keys, the installed pipes and the exit path of each supported half-ring. North is up.</desc>',
         '<rect width="960" height="800" fill="#f8f7f1"/><g font-family="Arial,sans-serif" fill="#253b3b">']
    def label(x,y,s,font=15,weight='normal'):
        out.append(f'<text x="{x}" y="{y}" font-size="{font}" font-weight="{weight}">{escape(s)}</text>')
    label(30,41,'Renew the six upper service supports',29,'bold')
    label(31,71,'North is up. Each service has its own pair of bearing keys and a second pair 75 mm higher.')
    for j,(name,row) in enumerate(rows.items()):
        left=30+(j%3)*310; top=110+(j//3)*295; scale=.145
        def point(p): return [left+18+(p[0]-9397)*scale,top+246-(p[1]-4450)*scale]
        def route(points,colour,width,dash=''):
            coords=' '.join(','.join(f'{n:.2f}' for n in point(p)) for p in points)
            out.append(f'<polyline points="{coords}" fill="none" stroke="{colour}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
        label(left,top,name.replace('H-flow','Heating flow').replace('H-return','Heating return').replace('soil-comparator','Soil').capitalize(),20,'bold')
        label(left,top+22,f"Primary keys at +{row['primaryZ']} mm",14)
        p=point([9397,5425])
        out.append(f'<rect x="{p[0]:.2f}" y="{p[1]:.2f}" width="{600*scale}" height="{750*scale}" fill="#eae7de" stroke="#576362"/>')
        for svc in pipes:
            px,py=point(svc['centre']);rad=svc['outerEnvelope']*scale/2
            colour='#255a57' if svc['id']==name else '#a4aaa2'
            out.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="{rad:.2f}" fill="{colour}"/>')
        for key in row["keys"]:
            route([key["pinXY"],key["faceXY"]],'#265c75',3)
            route([key["faceXY"],key["parkTipXY"]],'#265c75',1.4,'4 3')
        route(row["splitShell"]["centres"],'#ab5436',2.2)
        x,y=point(row["splitShell"]["centres"][-1])
        out.append(f'<rect x="{x-2.5:.2f}" y="{y-2.5:.2f}" width="5" height="5" fill="#ab5436"/>')
        label(left,top+271,f"Half-ring withdrawal margin {row['splitShell']['withdrawalClear']:.1f} mm",13)
    label(31,709,'Blue solid · installed key    Blue dashed · supported withdrawn key    Rust · half-ring to its first rest',15)
    label(31,737,'All six pipes remain in place. The heating-flow half moves south before it can clear the heating return to the east.',14)
    label(31,766,'Reference geometry only. Dimensions, material compatibility, load transfer and the protected floor require verification.',13)
    out.extend(['</g>','</svg>'])
    return '\n'.join(out)+'\n'
