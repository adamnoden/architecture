"""BCR front Study bay: exact parked-state cut and reversible floor-space candidate.

No FEM, product certification, operator simulation or selected house mutation.
All dimensions are mm. Rectangles are x/y/width/depth; y increases into the house.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import subprocess
from pathlib import Path

INPUTS = (
    'project/had/studies/water-replan.json',
    'project/mat/studies/study-coupled-window.json',
    'project/mat/studies/study-coupled-window.py',
    'project/str/studies/house-corner-rewind.json',
    'project/str/studies/reconciled-house-interface.json',
    'project/had/studies/current-house.mjs',
    'project/had/studies/inlet-maintenance.mjs',
    'project/ias/studies/study-door-reveal.json',
    'project/ias/studies/study-door-reveal.py',
)


def rectangle_distance(a, b):
    return math.hypot(max(a[0]-b[0]-b[2], b[0]-a[0]-a[2], 0),
                      max(a[1]-b[1]-b[3], b[1]-a[1]-a[3], 0))


def point_rectangle(p, r):
    return math.hypot(max(r[0]-p[0], p[0]-r[0]-r[2], 0),
                      max(r[1]-p[1], p[1]-r[1]-r[3], 0))


def point_segment(p, a, b):
    v = [b[i]-a[i] for i in (0, 1)]
    length2 = sum(x*x for x in v)
    t = max(0, min(1, sum((p[i]-a[i])*v[i] for i in (0, 1))/length2)) if length2 else 0
    return math.dist(p, [a[i]+t*v[i] for i in (0, 1)])


def segment_rectangle(a, b, r):
    """Exact distance from an entire line segment to an axis-aligned rectangle."""
    lo, hi = 0, 1
    for i in (0, 1):
        delta = b[i]-a[i]
        if not delta:
            if not r[i] <= a[i] <= r[i]+r[i+2]:
                lo, hi = 1, 0
        else:
            near, far = sorted(((r[i]-a[i])/delta, (r[i]+r[i+2]-a[i])/delta))
            lo, hi = max(lo, near), min(hi, far)
    if lo <= hi:
        return 0
    return min(point_rectangle(a, r), point_rectangle(b, r),
               *(point_segment([r[0]+x, r[1]+y], a, b)
                 for x in (0, r[2]) for y in (0, r[3])))


def route(points, objects, radius):
    values = [(segment_rectangle(a, b, r)-radius, name, index)
              for index, (a, b) in enumerate(zip(points, points[1:]))
              for name, r in objects.items()]
    gap, obstacle, segment = min(values)
    return {'points': points, 'radius': radius, 'minimumClearance': gap,
            'limitingObstacle': obstacle, 'segment': segment}


def axis_translation(start, end, body_start, body_end, objects, body_radius, arm_radius):
    delta = [end[i]-start[i] for i in (0, 1)]
    assert sum(v != 0 for v in delta) == 1 and start[2:] == end[2:]
    assert delta == [body_end[i]-body_start[i] for i in (0, 1)]
    sweep = [min(start[i], end[i]) for i in (0, 1)] + [start[i+2]+abs(delta[i]) for i in (0, 1)]
    object_gap, object_limit = min((rectangle_distance(sweep, r), k) for k, r in objects.items())
    body = route([body_start, body_end], objects, body_radius)
    # East-side prospective hand contact: a 45 mm hand envelope touches the
    # item; the 40 mm forearm ends 5 mm short. This is not a measured grasp.
    wrist_x = start[0]+start[2]+45
    assert start[1] < body_start[1] < start[1]+start[3]
    arm_sweep = [wrist_x, min(body_start[1], body_end[1]),
                 body_start[0]-wrist_x, abs(delta[1])]
    assert arm_sweep[2] > 0 and delta[0] == 0
    arm_gap, arm_limit = min((rectangle_distance(arm_sweep, r)-arm_radius, k) for k, r in objects.items())
    return {'start': start, 'end': end, 'exactSweptRectangle': sweep,
            'minimumItemClearance': object_gap, 'itemLimit': object_limit, 'body': body,
            'bodyToMovingItem': point_rectangle(body_start, start)-body_radius,
            'forearmSweep': arm_sweep, 'forearmRadius': arm_radius,
            'minimumForearmClearance': arm_gap, 'forearmLimit': arm_limit,
            'forearmToMovingItem': 45-arm_radius,
            'prospectiveHandContactReach': body_start[0]-start[0]-start[2]}


def calculate(root):
    raw = {path: (root/path).read_bytes() for path in INPUTS}
    inherited = json.loads(raw[INPUTS[0]])['model']
    # Use the selected service compositor, not its earlier water-plan input.
    # Its stdout is an inspection result; no upstream file is written.
    house = json.loads(subprocess.run(['node', str(root/INPUTS[5])],
                                     check=True, capture_output=True, text=True).stdout)
    h = house['model']
    assert house['id'] == 'HAD-SERVICES-02'
    assert h['groundWalls'] == inherited['groundWalls']
    window = json.loads(raw[INPUTS[1]])
    rewind = json.loads(raw[INPUTS[3]])
    structural = json.loads(raw[INPUTS[4]])
    door_reveal = json.loads(raw[INPUTS[7]])
    jamb = structural['jambAndTies']
    actual = next(row for row in h['archOpeningRegister']['GROUND']
                  if row['id'] == 'south-window-0' and row['wall'] == 'outer-south')
    assert {key:actual[key] for key in ('centre','width','sill','spring','head')} == {
        'centre':2100,'width':1000,'sill':750,'spring':2550,'head':2850}
    change = next(row for row in structural['openingEdits']
                  if row['level'] == 'GROUND' and row['side'] == 'outer-south' and row['id'] == 'south-window-0')
    assert change == {'level':'GROUND','side':'outer-south','id':'south-window-0',
                      'old':1800,'new':2100,'sill':750,'head':2850}
    assert h['envelope'] == 429.5 and h['finishRewind']['dry']['total'] == 27
    assert structural['jambAndTies']['axes'] == [1497.5, 2702.5]
    assert h['sections']['groundFloorRC'] == {'top':-180,'bottom':-380}
    assert h['sections']['firstFloorRC'] == {'top':3370,'bottom':3170}
    body_radius, arm_radius = h['studyDoorOperation']['bodyRadius'], h['studyDoorOperation']['forearmRadius']
    assert (body_radius, arm_radius) == (300, 40)
    desk, chair = (h['groundFurniture'][key] for key in ('study-desk', 'study-chair'))
    assert desk == [655,600,1600,700] and chair == [900,1400,1000,900]
    assert window['service']['desk'] == desk and window['service']['chair'] == chair
    old_chair = window['service']['chairPark']
    desk_park = [desk[0], window['service']['deskParkY'], *desk[2:]]
    assert desk_park == [655,1300,1600,700] and old_chair == [2325,1470,900,1000]
    old_platform = rewind['studySouth2100']['shiftedPlatform']
    assert old_platform == [1500,465,1200,700]

    # The selected compositor owns the occupied inventory. Its historical
    # fixedServiceSolids index still names three explicitly replaced bodies.
    inventory = dict(h['groundFurniture'])
    legacy_missing = set(h['fullHouseFootprint']['fixedServiceSolids']['GROUND']) - inventory.keys()
    assert legacy_missing == {'pantry-shelf-comparison', 'service-emitter-kitchen-E',
                              'plant-primary-buffer-round-bounding600'}
    assert h['pantryReplacement']['oldShelfComparisonDeleted'] is True
    assert inventory['low-food-larder'] == h['pantryReplacement']['selectedLowLarder']['completeBody']
    assert 'service-emitter-kitchen-W' in inventory and 'plant-primary-buffer-FCBVS0300' in inventory
    statics = {name: list(r) for name, r in inventory.items() if name not in ('study-desk', 'study-chair')}
    for name, r in h['fixedObstacles']['GROUND']:
        assert name not in statics
        statics[name] = r
    statics['stair-footprint'] = h['stair']
    for record in h['fixedServicesAboveFloor']:
        statics['elevated:'+record['id']] = record['plan']
    inlet = next(p for p in h['architecturalServices']['supply'] if p['id'] == 'study')['selectedFirstRelease']
    assert inlet['point'] == [3045,0,2100] and inlet['wall'] == 'outer-south'
    cartridge = inlet['innerCartridge']
    assert cartridge['installedNormalMM'] == [458,608] and cartridge['completeOD'] == 347
    # Conservative full-height plan projections include the installed inlet
    # and its entire renewal carrier. No contemporaneous inlet draw is assumed.
    statics['study-inlet-installed'] = [3045-200,429.5,400,608-429.5]
    statics['study-inlet-carrier'] = cartridge['supportedCarrier']
    # h.void is the FIRST-floor entrance void, not a ground-floor hole.
    # Conservative 18 mm trim is charged to all wall strips, including permanent
    # rooms outside this bay; no walking across an unmodelled door is needed.
    for wall in h['groundWalls']:
        a, b = wall['a'], wall['b']
        assert a[0] == b[0] or a[1] == b[1]
        axis = 0 if a[1] == b[1] else 1
        other = 1-axis
        lo, hi = sorted((a[axis], b[axis]))
        cursor = lo
        for index, (near, far) in enumerate(sorted(wall.get('holes', []))+[[hi,hi]]):
            if near > cursor:
                r = [0.,0.,0.,0.]
                r[axis], r[other] = cursor, a[other]-(wall['t']+36)/2
                r[axis+2], r[other+2] = near-cursor, wall['t']+36
                statics['wall:'+wall['id']+':'+str(index)] = r
            cursor = far
    e, s = h['envelope']+18, h['shell']
    statics.update({'outer-W':[-10000,-10000,10000+e,32000],
                    'outer-S':[-10000,-10000,32000,10000+e],
                    'outer-E':[s-e,-10000,22000,32000],
                    'outer-N':[-10000,s-e,32000,22000]})
    for index, r in enumerate(h['studyDoorOperation']['checkedFramePieces']):
        statics['study-frame:'+str(index)] = r
    hx, hy = h['studyDoorOperation']['hinge']
    length, depth = h['studyDoorOperation']['leaf']
    assert h['studyDoorOperation'] == inherited['studyDoorOperation']
    assert door_reveal['frameDepthAndWallMm'] == [230,194]
    assert door_reveal['gripOffsetsFromAxisMm'] == [62,-106]
    # The compositor retains HAD's centred closed proxy. IAS proposes a
    # face-pivot blade wholly on the hall side, using the same body knots.
    # Charge their UNION while closed, without adopting the IAS trial or
    # reusing the centred proxy as a complete opening doorset.
    current_closed = [hx,hy-depth/2,length,depth]
    ias_closed = [hx,hy,length,depth]
    statics['study-closed-leaf'] = [hx,hy-depth/2,length,depth*1.5]
    assert all(len(r) == 4 and all(math.isfinite(v) for v in r) and min(r[2:]) >= 0
               for r in statics.values())

    cloak = next(w for w in h['groundWalls'] if w['id'] == 'cloak-west')['finishedFaces'][0]-18
    emitter = h['groundFurniture']['service-emitter-study-W']
    cut_y = 1600
    assert all(r[1] < cut_y < r[1]+r[3] for r in (emitter, desk_park, old_chair))
    gaps = [desk_park[0]-emitter[0]-emitter[2],
            old_chair[0]-desk_park[0]-desk_park[2], cloak-old_chair[0]-old_chair[2]]
    assert gaps == [25.5,70,60]
    # The centre of any continuous 600 mm disc route from north to south must
    # cross y1600. These expanded intervals overlap across the whole room.
    blocked = [[e,emitter[0]+emitter[2]+body_radius],
               [desk_park[0]-body_radius,desk_park[0]+desk_park[2]+body_radius],
               [old_chair[0]-body_radius,old_chair[0]+old_chair[2]+body_radius],
               [cloak-body_radius,cloak]]
    end = e
    for start, stop in sorted(blocked):
        assert start <= end
        end = max(end,stop)
    assert end >= cloak

    chair_park = [chair[0],chair[1]+650,*chair[2:]]
    platform = [old_platform[0]-150,old_platform[1]+10,*old_platform[2:]]
    start = h['studyDoorOperation']['bodyKnots'][0][1:]
    assert start == [2275,2800]
    first = route([start,[2300,1850]], {**statics,'desk':desk,'chair':chair}, body_radius)
    move_chair = axis_translation(chair,chair_park,[2300,1850],[2300,2500],
                                  {**statics,'desk':desk},body_radius,arm_radius)
    connector = route([[2300,2500],[2300,2200],[2600,2200],[2600,1150]],
                      {**statics,'desk':desk,'chair':chair_park},body_radius)
    direct = route([[2300,2500],[2600,950]],{**statics,'desk':desk,'chair':chair_park},body_radius)
    assert direct['minimumClearance'] < 0
    move_desk = axis_translation(desk,desk_park,[2600,1150],[2600,1850],
                                 {**statics,'chair':chair_park},body_radius,arm_radius)
    occupied = {**statics,'desk':desk_park,'chair':chair_park,'platform':platform}
    approach = route([[2600,1850],[2917.5,1850],[2917.5,1225]],occupied,body_radius)
    joined = route([start,[2300,2350],[2600,2200],[2600,1850],[2917.5,1850],[2917.5,1225]],
                   occupied,body_radius)
    platform_gap, platform_limit = min((rectangle_distance(platform,r),k)
                                      for k,r in {**statics,'desk':desk_park,'chair':chair_park}.items())
    for record in (first,connector,approach,joined):
        assert record['minimumClearance'] >= 25
    for record in (move_chair,move_desk):
        assert min(record['minimumItemClearance'],record['body']['minimumClearance'],
                   record['bodyToMovingItem'],record['minimumForearmClearance']) >= 25
        assert record['prospectiveHandContactReach'] <= 600
    assert platform_gap >= 25
    # Reverse the exact same complete sweeps: apparatus removed first, desk
    # restored first, then chair, then the previously checked door operation.
    back_desk = axis_translation(desk_park,desk,[2600,1850],[2600,1150],
                                 {**statics,'chair':chair_park},body_radius,arm_radius)
    back_chair = axis_translation(chair_park,chair,[2300,2500],[2300,1850],
                                  {**statics,'desk':desk},body_radius,arm_radius)
    assert back_desk['end'] == desk and back_chair['end'] == chair
    for outward, backward in ((move_desk,back_desk),(move_chair,back_chair)):
        for key in ('minimumItemClearance','bodyToMovingItem','minimumForearmClearance'):
            assert math.isclose(outward[key],backward[key])
        assert math.isclose(outward['body']['minimumClearance'],backward['body']['minimumClearance'])

    # An actual collision witness, not merely a failed bounding-box test:
    # this point is inside both the former 600 x 2000 body and the installed
    # 347 mm cylindrical inlet module on its selected 1% axis.
    witness = [3045,590,1950]
    old_apron = [2917.5,815]
    inlet_axis_z = inlet['point'][2]+witness[1]*.01
    assert math.dist(witness[:2],old_apron) < body_radius and 0 < witness[2] < 2000
    assert 458 < witness[1] < 608 and abs(witness[2]-inlet_axis_z) < cartridge['completeOD']/2

    # Prospective working positions inside the authored rectangle. These are
    # distance budgets only: supplied rails/steps/deck and module capture are
    # not known and are not erased by this fit calculation.
    pack = window['glass']['halfHeadPackWHD']
    assert pack == [374,310,100]
    head_offset = window['glass']['headCentreBar']/2 + window['glass']['halfHeadSightWH'][0]/2
    head_bottom = window['section']['rectangleZ'][1]+3+52
    heads = []
    for module_centre, body_x in ((actual['centre']-head_offset,1875),(actual['centre']+head_offset,2225)):
        shoulder = [body_x,800,2500]
        # Authored room-side grip field includes the 16 mm lower pocket bite
        # as well as the full 310 mm reserved height above the glazed bottom.
        # This is not a selected retainer/grip schedule or a swept-arm proof.
        points = [[module_centre+dx,window['section']['rearY'],z]
                  for dx in (-pack[0]/2,pack[0]/2) for z in (head_bottom-16,head_bottom+pack[1])]
        reaches = [math.dist(shoulder,p) for p in points]
        inner = min(body_x-platform[0]-body_radius,platform[0]+platform[2]-body_x-body_radius,
                    shoulder[1]-platform[1]-body_radius,platform[1]+platform[3]-shoulder[1]-body_radius)
        assert max(reaches) < 600 and inner >= 25
        heads.append({'prospectiveShoulder':shoulder,'moduleCentreX':module_centre,
                      'roomSideGripFieldYZ':[window['section']['rearY'],head_bottom-16,head_bottom+pack[1]],
                      'maximumCornerDistance':max(reaches),'bodyToRectangleBoundary':inner})
    rise=actual['head']-actual['spring']; radius=actual['width']**2/(8*rise)+rise/2
    centre_z=actual['head']-radius
    old_rect_head=2835
    raw_at_old_corner=centre_z+math.sqrt(radius**2-(970/2)**2)
    frame_q = [window['section']['frontY'],window['section']['rearY']]
    depth_overlap = lambda core: max(0,min(frame_q[1],core[1])-max(frame_q[0],core[0]))
    geometry_receipt = {key:h[key] for key in ('groundFurniture','groundWalls','studyDoorOperation','sections')}
    geometry_receipt.update({'opening':actual,'inletPoint':inlet['point'],
                            'inletInstalledNormal':cartridge['installedNormalMM'],
                            'inletCarrier':cartridge['supportedCarrier']})
    return {'scope':'BCR-BAY-INTERFACES; SAP-C1 local comparison, not house or apparatus adoption',
        'sourceGitBlobs':{p:hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest() for p,b in raw.items()},
        'currentHouseInputBlobs':house['inputs'],
        'composedRoomGeometrySha256':hashlib.sha256(json.dumps(geometry_receipt,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
        'sourceReceipt':'Selected current-house.mjs is executed read-only; its historical water input is not substituted for the composed house.',
        'inventory':{'groundFurniture':len(inventory),'groundFixed':len(h['fixedObstacles']['GROUND']),
                     'wallRecords':len(h['groundWalls']),'allCurrentGroundServiceSolidsIncluded':True,
                     'replacedHistoricalInventoryNames':sorted(legacy_missing),
                     'additionalConservativeProjections':['Elevated services','Study installed inlet and complete renewal carrier'],
                     'groundEntranceVoidExcludedBecauseItIsFirstFloor':True},
        'basis':{'opening':change,'roomFace':h['envelope'],'dryFinish':27,
                 'jambAxes':structural['jambAndTies']['axes'],'jambAlongNormal':[205,180],
                 'groundFloorRC':h['sections']['groundFloorRC'],'firstFloorRC':h['sections']['firstFloorRC'],
                 'groundAboveRC':180,'firstAboveRC':80,'firstBelowRCToCeiling':70,
                 'trialFrameQ':frame_q,'portalCoreQ':jamb['portalCoreQ'],
                 'ordinaryCoreQ':jamb['ordinaryWallCoreQ'],
                 'frameDepthCoincidenceOrdinaryPortal':[depth_overlap(jamb[k]) for k in ('ordinaryWallCoreQ','portalCoreQ')],
                 'portalGlassAndCavity':jamb['glassAndVentilatedCavity'],
                 'roughOpeningMovementAndFaceDeparture':[jamb['jambRoughClosureOrOpeningMM'],jamb['facePlaneDepartureMM']],
                 'old970FrameAgainst946FinishedWidthInterferenceEach':12,
                 'oldRectangular2835HeadAboveRawArchAt485':old_rect_head-raw_at_old_corner},
        'rejectedParkedState':{'desk':desk_park,'chair':old_chair,'SAPPlatform':old_platform,
            'crossSectionY':cut_y,'unexpandedGaps':gaps,'bodyDiameter':2*body_radius,
            'expandedBlockedIntervals':blocked,'continuousCrossing':'impossible in this fixed parked state',
            'limit':'Does not rule out every alternative staged protocol or an actual smaller chair.'},
        'candidate':{'chairPark':chair_park,'deskPark':desk_park,'platformRectangle':platform,
            'chairApproach':first,'chairTranslation':move_chair,'deskApproach':connector,
            'rejectedStraightConnector':direct,'deskTranslation':move_desk,'platformApronRoute':approach,
            'joinedDoorToApronRoute':joined,'platformStaticClearance':platform_gap,'platformLimit':platform_limit,
            'eastLane':cloak-platform[0]-platform[2],'eastLaneBodySideReserve':(cloak-platform[0]-platform[2]-600)/2,
            'returnSequence':['Leave apparatus to east apron; keep bay supported and weather-secure.',
                'Remove all apparatus by a separately qualified method before furniture restoration.',
                'Reverse apron route, desk translation and the kinked connector.',
                'Reverse chair translation and initial approach; original furniture is restored.',
                'Only then reverse the existing source door close/open sequence.'],
            'reverseItemSweepsEqual':True,'headDistanceBudgetsOnly':heads,
            'condition':'Entire actual apparatus, deployed entry/guards/feet and usable deck must fit and connect from the north-east apron; this rectangle is not a supplied kit.'},
        'selectedInletJoin':{'point':inlet['point'],'installedPlanBound':statics['study-inlet-installed'],
            'chargedCarrier':cartridge['supportedCarrier'],'oldApron':old_apron,'collisionWitnessXYZ':witness,
            'collisionWith':'Installed 347 mm cartridge and 600 mm diameter, 2000 mm high standing body',
            'newApron':[2917.5,1225],'carrierClearance':25,
            'condition':'No simultaneous inlet extraction. Keep its installed boundary and carrier territory outside the bay apparatus.'},
        'doorJoin':{'currentCentredClosedProxy':current_closed,'IASFacePivotClosedTrial':ias_closed,
            'conservativeClosedUnion':statics['study-closed-leaf'],
            'IASTrialUsesSameBodyKnots':True,'IASTrialGripOffsetsFromAxis':door_reveal['gripOffsetsFromAxisMm'],
            'IASTrialContinuousBodyArmMargins':[door_reveal['facePivot'][k] for k in ('continuousBodyGapMm','continuousArmGapMm')],
            'limit':'Floor-space check begins at the common closed-body endpoint; door operation/adoption retains its owning evidence and unresolved complete doorset.'},
        'retainedReleaseLimits':{'headDraw':window['service']['headAndLatticeDraw'],
            'headFarFaceBeyondLining':window['service']['farFaceAfterDrawBeyondFinishedWall'],
            'headPocketAfterTwo2':window['glass']['adversePocketAfterTwo2'],
            'weatherLatticeAfterTwo2':window['glass']['closedLeafRelease']['afterTwo2'],
            'movingFrameSideTopBottom':window['glass']['closedLeafRelease']['minimalSideAndHeadStructure'],
            'glassOnlyMovingMassKg':window['glass']['warmStraightVig']['coupledGlassOnlyKg']},
        'unearned':['Actual furniture grasp, weight, cable release and moving force; the chair is a full source reservation.',
            'Actual apparatus ingress, erection, working deck, gate/step/rail geometry, floor/finish point loads and extraction.',
            'Supported head/sash release, two-handed tool/grip paths, lowering and transfer to a protected bench.',
            'Whole frame/guard exchange and protected external access over the stepped front approach.',
            'Exact sill/head/jamb air, water, insulation, materials, fixing/tolerance and structural movement compatibility.',
            'Blind/curtain/lamp, room-projecting sill/handle and other unselected furnishing geometry, physical operation and construction acceptance.']}, h, statics


def drawing(data,h,statics):
    p=data['candidate'];old=data['rejectedParkedState'];parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1480" height="860" viewBox="0 0 1480 860" role="img" aria-labelledby="title description">',
        '<title id="title">Front Study bay: preserve a connected service approach</title>',
        '<desc id="description">The inherited parked desk and chair close every 600 millimetre body route to the window. A north chair park and slightly moved trial apparatus restore a reversible floor-space approach to the north-east apron, including the current inlet and its carrier. Actual apparatus entry and window handling remain unqualified.</desc>',
        '<rect width="1480" height="860" fill="#faf9f5"/><g font-family="Arial,sans-serif" fill="#263b43">']
    def text(x,y,message,size=18,colour='#263b43'):
        parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}">{html.escape(message)}</text>')
    text(35,42,'Front Study bay · a service rectangle needs an arrival and return',29)
    text(35,74,'Selected service house on SAP-C1, south-window-0 at X2100. Full source furniture reservations. Dimensions in mm.',18)
    for panel, (desk,chair,platform) in enumerate(((old['desk'],old['chair'],old['SAPPlatform']),
                                                (p['deskPark'],p['chairPark'],p['platformRectangle']))):
        ox=35+panel*735;sc=.127
        X=lambda x:ox+20+x*sc
        Y=lambda y:610-y*sc
        text(ox,120,'01  Inherited parked state' if not panel else '02  Reversible floor-space candidate',23)
        def rect(r,fill,stroke='#63757b'):
            x,y,w,d=r
            parts.append(f'<rect x="{X(x):.2f}" y="{Y(y+d):.2f}" width="{w*sc:.2f}" height="{d*sc:.2f}" fill="{fill}" stroke="{stroke}"/>')
        rect([429.5,429.5,4370.5,2818], '#ffffff')
        for name,r in statics.items():
            if name.startswith('wall:study') or name.startswith('wall:cloak'):
                rect(r,'#d5d8d4')
        rect([0,0,4800,429.5],'#d5d8d4');rect([0,429.5,429.5,2818],'#d5d8d4')
        rect(statics['service-emitter-study-W'],'#b9c1c6')
        rect(statics['study-closed-leaf'],'#71848a')
        rect(desk,'#d9c5a8');rect(chair,'#eadcc9');rect(platform,'#d4e7e1','#337d6a')
        rect(statics['study-inlet-installed'],'#b9a8c1','#725184')
        rect(statics['study-inlet-carrier'],'#e3d7e9','#725184')
        text(X(desk[0]+100),Y(desk[1]+desk[3]/2),'Desk',17)
        text(X(chair[0]+120),Y(chair[1]+chair[3]/2),'Chair',17)
        text(X(platform[0]+95),Y(platform[1]+platform[3]/2),'Trial apparatus',16,'#236955')
        parts.append(f'<line x1="{X(1600):.2f}" y1="{Y(429.5):.2f}" x2="{X(2600):.2f}" y2="{Y(429.5):.2f}" stroke="#3f7591" stroke-width="6"/>')
        text(X(1600),Y(100),'Window at 2100',16,'#3f7591')
        text(X(3340),Y(650),'Inlet + carrier',14,'#725184')
        if panel==0:
            parts.append(f'<line x1="{X(429.5):.2f}" y1="{Y(1600):.2f}" x2="{X(3285):.2f}" y2="{Y(1600):.2f}" stroke="#a33a3a" stroke-width="4" stroke-dasharray="7 4"/>')
            text(ox,655,'Y1600 cut: only 25.5 / 70 / 60 clear gaps.',20,'#a33a3a')
            text(ox,685,'No 600 mm body route crosses that parked state.',18,'#a33a3a')
            text(ox,715,'This is a local negative, not a universal impossibility.',17)
        else:
            points=p['joinedDoorToApronRoute']['points'];line=' '.join(f'{X(x):.2f},{Y(y):.2f}' for x,y in points)
            parts.append(f'<polyline points="{line}" fill="none" stroke="#246a8a" stroke-width="4"/>')
            for x,y in (points[0],points[-1]):
                parts.append(f'<circle cx="{X(x):.2f}" cy="{Y(y):.2f}" r="{300*sc}" fill="none" stroke="#246a8a" stroke-width="2"/>')
            text(ox,655,'Chair 650 north; desk 700 north; apparatus 150 W + 10 N.',18)
            text(ox,685,'735 east lane; 25 minimum body reserve at the inlet carrier.',18,'#246a8a')
            text(ox,715,'Reverse furniture before reopening the room door.',17)
    parts.append('<line x1="35" y1="754" x2="1445" y2="754" stroke="#b6bebc"/>')
    text(35,786,'Green is a trial equipment territory. Its actual gate, stairs, guards, lifting support and occupied entry remain to be drawn.',18)
    text(35,818,'The route ends at the north-east apron. No kit or full renewal is admitted. Exact preparation and return: bay-interface-study.json.',16)
    return '\n'.join(parts+['</g></svg>'])+'\n'


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path)
    parser.add_argument('--output',type=Path,default=Path(__file__).with_suffix(''))
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    result,h,statics=calculate(args.root or Path(__file__).resolve().parents[3])
    outputs={args.output.with_suffix('.json'):json.dumps(result,indent=2)+'\n',
             args.output.with_suffix('.svg'):drawing(result,h,statics)}
    for path,content in outputs.items():
        if args.check:
            assert path.read_text()==content,f'Stale bay interface evidence: {path}'
        else:path.write_text(content)
    p=result['candidate']
    print(f"Parked-state 600 mm crossing rejected; joined candidate route {p['joinedDoorToApronRoute']['minimumClearance']:.1f} mm; desk movement {p['deskTranslation']['minimumItemClearance']:.1f} mm. Kit and full renewal remain open.")


if __name__=='__main__':main()
