import itertools
import math

EPSILON = 1e-7


class GeometryFailure(ValueError):
    pass


def require_geometry(condition, code):
    if not condition:
        raise GeometryFailure(code)


def pair(value):
    if (not isinstance(value, (list, tuple)) or len(value) != 2
            or not all(type(n) in (int, float) and math.isfinite(n) for n in value)):
        raise ValueError('Expected a finite handling coordinate pair')
    return tuple(value)


def points(value, smallest=2, largest=16):
    if not isinstance(value, (list, tuple)) or not smallest <= len(value) <= largest:
        raise ValueError('Invalid number of handling waypoints')
    return tuple(map(pair, value))


def translate(values, delta):
    return tuple(value + delta[i % 2] for i, value in enumerate(values))


def difference(a, b):
    return tuple(x - y for x, y in zip(a, b))


def rectangle(box):
    return (box[0], box[1], box[2] - box[0], box[3] - box[1])


def covers(outer, inner):
    return all(outer[i] - EPSILON <= inner[i] and inner[i+2] <= outer[i+2] + EPSILON for i in (0, 1))


def intersects(a, b):
    return all(a[i] < b[i + 2] - EPSILON and b[i] < a[i + 2] - EPSILON for i in (0, 1))


def box_gap(a, b):
    return math.hypot(*(max(a[i] - b[i+2], b[i] - a[i+2], 0) for i in (0, 1)))


def enclosing(a, b):
    return tuple((min if i < 2 else max)(x,y) for i,(x,y) in enumerate(zip(a,b)))


def area(box):
    return (box[2] - box[0]) * (box[3] - box[1])


def midpoint(box):
    return tuple((box[i]+box[i+2])/2 for i in (0,1))


def in_bands(box, bands):
    overlap = sum(math.prod(max(0, min(box[i+2], b[i+2]) - max(box[i], b[i])) for i in (0, 1)) for b in bands)
    return abs(overlap - area(box)) <= 1e-5


def segment_in_bands(a, b, bands):
    dx,dy = difference(b,a)
    knots = {0,1}
    for axis,delta in enumerate((dx,dy)):
        if delta:
            knots.update(t for band in bands for j in (axis,axis+2) if 0 < (t := (band[j]-a[axis])/delta) < 1)
    knots = sorted(knots)
    for left,right in zip(knots,knots[1:]):
        p = translate(a,(dx*(left+right)/2,dy*(left+right)/2))
        if not any(covers(band,(*p,*p)) for band in bands):
            return False
    return True


def sweep_box(box, shifts, obstructions, bands, ops):
    width,depth = rectangle(box)[2:]
    for first,second in zip(shifts,shifts[1:]):
        sweep = enclosing(translate(box,first),translate(box,second))
        require_geometry(in_bands(sweep,bands),'IAS_ORDINARY_SWEEP_OUTSIDE_FLOOR')
        start,end = (translate(midpoint(box),step) for step in (first,second))
        for obstacle in obstructions:
            if intersects(sweep,obstacle):
                grown = (obstacle[0]-width/2+EPSILON,obstacle[1]-depth/2+EPSILON,
                         obstacle[2]-obstacle[0]+width-2*EPSILON,obstacle[3]-obstacle[1]+depth-2*EPSILON)
                require_geometry(ops['segment_rectangle'](start,end,grown)>EPSILON,'IAS_ORDINARY_SWEEP_FIXED_CONFLICT')


def check_route(path, obstacles, bands, ops):
    require_geometry(all(segment_in_bands(a,b,bands) for a,b in zip(path,path[1:])), 'IAS_ORDINARY_BODY_OUTSIDE_FLOOR')
    result = ops['route'](path,{k:rectangle(v) for k,v in obstacles.items()},300)
    require_geometry(result['minimumClearance']>=5-EPSILON,'IAS_ORDINARY_BODY_CLEARANCE')
    return result


def hold_reserve(hold, phases, ops):
    stub=(hold[0],hold[1],0,0)
    margins=[]
    for phase in phases:
        path = phase['worker']['points']
        margins.extend((ops['segment_rectangle'](a,b,stub)-600,phase['id'])
                       for a,b in zip(path,path[1:]))
        margins.extend((ops['point_rectangle'](hold,phase[field])-300,phase['id'])
                       for field in ('itemSweepXYWHMm','forearmSweepXYWHMm') if field in phase)
        if phase['type']=='rotation':
            margins.append((math.dist(hold,phase['centreXYMm'])-phase['radiusMm']-300,phase['id']))
    require_geometry(bool(margins),'IAS_ORDINARY_HOLD_FURNITURE_PHASE_UNAVAILABLE')
    return min(margins)


def placement_geometry(position, grips, board, obstructions, bands, ops):
    require_geometry(len(grips)==2 and math.dist(*grips)>=100-EPSILON and all(covers(board,(*g,*g)) for g in grips),
                     'IAS_ORDINARY_BOARD_GRIP_GEOMETRY')
    reach=max(math.dist((*position,360),(*grip,12)) for grip in grips)
    require_geometry(reach<=600+EPSILON,'IAS_ORDINARY_BOARD_GRIP_REACH')
    slide=difference(midpoint(board),position)
    carried=translate(board,tuple(-d for d in slide))
    sweep_box(carried,((0,0),slide),obstructions.values(),bands,ops)
    return {'stanceXYMm':position,'gripsXYMm':grips,'maximumReachMm':reach,'carriedXYXYMm':carried,'slideXYMm':slide}


def check_staging(record, initial_body, board, stage, full, core, occupied, bands, entry, phases, ops):
    hold_path=record.get('preParkingPathXYMm')
    arrival=points(record['arrivalPathXYMm'])
    if hold_path is not None:
        hold_path=points(hold_path)
        if stage=='occupied' or hold_path[0]!=entry or hold_path[-1]!=arrival[0]:
            raise ValueError('Handling hold must connect source entry to a parked stage')
        check_route(hold_path,occupied,bands,ops)
        margin,control=hold_reserve(hold_path[-1],phases,ops)
        require_geometry(margin>=5-EPSILON,'IAS_ORDINARY_WAITING_HANDLER_CLEARANCE')
        hold_result={'preParkingPathXYMm':hold_path,'holdReserveMm':margin,'holdLimitingPhase':control}
    else:
        if arrival[0]!=entry:
            raise ValueError('Handling approach must start at source entry or a declared hold')
        hold_result={}
    with_board={**full,'first-rest-board':board}
    mode=record['mode']
    if mode=='approach-after-board-placed':
        if arrival[-1]!=initial_body:
            raise ValueError('Handling approach must reach the initial pickup stance')
        return {'state':'placement-sequence-withheld','approach':check_route(arrival,with_board,bands,ops),**hold_result}
    grips=points(record['boardGripsXYMm'],2,2)
    if mode=='second-handler-places-then-withdraws':
        if arrival[-1]!=initial_body or stage!='occupied':
            raise ValueError('Second-handler placement expects an occupied-stage pickup')
        check_route(arrival,full,bands,ops)
        second=points(record['secondHandlerPathXYMm'])
        if second[0]!=entry:
            raise ValueError('Second-handler approach must start at the source entry')
        x,y=initial_body
        person=(x-300,y-300,x+300,y+300)
        second_route=check_route(second,{**with_board,'waiting-handler':person},bands,ops)
        geometry=placement_geometry(second[-1],grips,board,{**core,'waiting-handler':person},bands,ops)
        return {'state':'joined-geometry-witness','arrivalPathXYMm':arrival,'secondHandlerApproach':second_route,
                'secondHandlerWithdrawalXYMm':second[::-1],'placement':geometry,**hold_result}
    if mode not in ('carry-then-place-from-pickup-stance','carry-then-place-before-approaching-pickup'):
        raise ValueError('Unknown ordinary board placement mode')
    check_route(arrival,full,bands,ops)
    position=arrival[-1]
    geometry=placement_geometry(position,grips,board,core,bands,ops)
    if mode=='carry-then-place-before-approaching-pickup':
        after=points(record['afterPlacementPathXYMm'])
        if after[0]!=position or after[-1]!=initial_body:
            raise ValueError('Post-placement path must connect board position to pickup')
        check_route(after,with_board,bands,ops)
    else:
        if position!=initial_body:
            raise ValueError('Same-stance board placement must reach the pickup')
        after=None
    return {'state':'joined-geometry-witness','arrivalPathXYMm':arrival,'placement':geometry,
            **({'afterPlacementPathXYMm':after} if after else {}),**hold_result}


def board_geometry(protocol, stock):
    turn=protocol['boardTurnDeg']
    if turn not in (0,90):
        raise ValueError('Unknown board rotation')
    width,depth=pair(stock['sizeMm'])
    if turn==90:
        width,depth=depth,width
    if min(width,depth)<=0 or math.hypot(width,depth)>600:
        raise ValueError('Board cannot be carried inside the declared body envelope')
    x,y=pair(protocol['boardOriginXYMm'])
    board=(x,y,x+width,y+depth)
    wx,wy=(75,47.5) if (turn+stock['padTurnDeg'])%180 else (47.5,75)
    pads=tuple(itertools.product((x+width/2-wx,x+width/2+wx),(y+depth/2-wy,y+depth/2+wy)))
    require_geometry(all(covers(board,(u-12.5,v-12.5,u+12.5,v+12.5)) for u,v in pads),'IAS_ORDINARY_BOARD_PAD_PATTERN')
    return board,pads


def check_protocol(protocol, part, all_faces, board_stock, stage_obstacles, occupied, bands, entry, phases, plan, ops):
    bodies=points(protocol['workerPathXYMm'])
    path=points(protocol['panelPathWaypointDeltasMm'],1,8)
    shifts=((0,0),*path)
    if len(bodies)!=len(shifts):
        raise ValueError('Panel and worker waypoints must have matching phases')
    trims=protocol['trimReleases']
    if (not isinstance(trims,list) or len(set(trims))!=len(trims)
            or any(name not in stage_obstacles or 'withoutWallTrimXYXYMm' not in stage_obstacles[name] for name in trims)):
        raise ValueError('Trim release must reference the current stage obstruction')
    full={name:obj['boxXYXYMm'] for name,obj in stage_obstacles.items()}
    core={name:(obj['withoutWallTrimXYXYMm'] if name in trims else obj['boxXYXYMm']) for name,obj in stage_obstacles.items()}
    face_pieces=all_faces[part['id']]
    board,pads=board_geometry(protocol,board_stock)
    travel=sum(math.dist(a,b) for a,b in zip(shifts,shifts[1:]))
    require_geometry(travel<=plan['maximumTravelMm']+EPSILON,'IAS_ORDINARY_TRANSFER_DISTANCE')
    board_pickup_gap=min(box_gap(box,board) for box in face_pieces)
    require_geometry(board_pickup_gap>=plan['pickupClearanceMm']-EPSILON,'IAS_ORDINARY_BOARD_PICKUP_CLEARANCE')
    require_geometry(in_bands(board,bands) and not any(intersects(board,obs) for obs in core.values()),
                     'IAS_ORDINARY_BOARD_FIXED_CONFLICT')
    for box in face_pieces:
        sweep_box(box,shifts,core.values(),bands,ops)
    final_pieces=[translate(box,path[-1]) for box in face_pieces]
    require_geometry(all(covers(board,box) for box in final_pieces),'IAS_ORDINARY_BOARD_PANEL_CONTAINMENT')
    gravity=tuple(sum(midpoint(box)[i]*area(box) for box in final_pieces)/sum(map(area,final_pieces)) for i in (0,1))
    bearings=[]
    expected=protocol['padBearingPartIds']
    if not isinstance(expected,list) or len(expected)!=4 or any(name not in all_faces or name==part['id'] for name in expected):
        raise ValueError('Board pad must reference a separate current seated floor face')
    for (x,y),name in zip(pads,expected):
        pad=(x-12.5,y-12.5,x+12.5,y+12.5)
        require_geometry(any(covers(box,pad) for box in all_faces[name]),'IAS_ORDINARY_PAD_SINGLE_SEATED_FACE')
        bearings.append(name)
    require_geometry(all(min(p[i] for p in pads)-EPSILON<=gravity[i]<=max(p[i] for p in pads)+EPSILON for i in (0,1)),
                     'IAS_ORDINARY_BOARD_RESULTANT')
    body=check_route(bodies,full,bands,ops)
    board_body=check_route(bodies,{'first-rest-board':board},bands,ops)
    relative=tuple(difference(p,v) for p,v in zip(bodies,shifts))
    body_panel=min(ops['segment_rectangle'](a,b,rectangle(box)) for a,b in zip(relative,relative[1:]) for box in face_pieces)
    require_geometry(body_panel>=335-EPSILON,'IAS_ORDINARY_BODY_PANEL_CLEARANCE')
    keys=part.get('keyCentresXYMm') or part['grip']['centres']
    key_reach=max(math.dist((*p,180),(*translate(key,shift),0)) for p,shift in zip(bodies,shifts) for key in keys)
    require_geometry(key_reach<=600+EPSILON,'IAS_ORDINARY_PANEL_KEY_REACH')
    staging=check_staging(protocol['staging'],bodies[0],board,protocol['stage'],full,core,occupied,bands,entry,phases,ops)
    return {'partId':part['id'],'state':staging['state'],'stage':protocol['stage'],'trimReleases':trims,
            'boardId':protocol['boardId'],'boardXYXYMm':board,'padCentresXYMm':pads,'padBearingPartIds':bearings,
            'finalPanelPiecesXYXYMm':final_pieces,'panelPathWaypointDeltasMm':path,'workerPathXYMm':bodies,
            'transferTravelMm':travel,'maximumKeyReachMm':key_reach,'bodyToPanelMm':body_panel,
            'bodyToBoardClearanceMm':board_body['minimumClearance'],'fixedBodyClearanceMm':body['minimumClearance'],
            'boardPickupClearanceMm':board_pickup_gap,'boardFixedPlanClearanceMm':min(box_gap(board,box) for box in core.values()),
            'staging':staging}


def validate_floor_handling(parts, stages, bands, math_ops, plan, entry, phases):
    entry=pair(entry)
    if isinstance(stages,list):
        stages={value['stage']:value['obstacles'] for value in stages}
    stock={board['id']:board for board in plan['boards']}
    source={part['id']:part for part in parts}
    all_faces={name:part.get('facePieces') or [part['face']] for name,part in source.items()}
    protocols=plan['protocols']
    if len({p['partId'] for p in protocols})!=len(protocols) or set(source)!={p['partId'] for p in protocols}:
        raise ValueError('Ordinary handling must name every current removable part once')
    if any(type(plan[k]) not in (int,float) or not math.isfinite(plan[k]) for k in ('pickupClearanceMm','maximumTravelMm')) or plan['pickupClearanceMm']<5 or not 0<plan['maximumTravelMm']<=1200:
        raise ValueError('Outside supported ordinary Study handling plan')
    occupied={name:obj['boxXYXYMm'] for name,obj in stages['occupied'].items()}
    rows=[]
    for protocol in protocols:
        part_id=protocol['partId']
        if protocol['stage'] not in stages or protocol['boardId'] not in stock:
            raise ValueError('Ordinary handling references an unknown board or staged room')
        try:
            row=check_protocol(protocol,source[part_id],all_faces,stock[protocol['boardId']],stages[protocol['stage']],
                               occupied,bands,entry,phases,plan,math_ops)
            rows.append(row)
        except GeometryFailure as error:
            rows.append({'partId':part_id,'state':'geometry-withheld','diagnostic':str(error)})
    witnesses=sum(row['state']=='joined-geometry-witness' for row in rows)
    return {'schema':'ias-study-ordinary-handling-result/1','units':'mm',
            'state':'joined-geometry-witnesses' if witnesses==len(rows) else 'partial-geometry-witnesses',
            'physicalAcceptance':False,'partCount':len(rows),'witnessCount':witnesses,'parts':rows}
