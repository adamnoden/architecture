#!/usr/bin/env python3
"""Actual folded-route renewal comparison. Plan containment is not handling admission."""
import hashlib, heapq, html, json, math, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
BASE = pathlib.Path(__file__).with_suffix('')
HEAD = '8871604771ff018896a1da62e9d8510a3616212e'
raw = subprocess.check_output(['git', 'show', HEAD+':project/had/studies/water-replan.json'], cwd=ROOT)
blob = hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
assert blob == 'f7324121f59cc5f1707ea47640dd2b20c26b9bbb'
h = json.loads(raw)['model']
front = h['gardenFailureBypass']['frontApproach']
route = front['route']
travel = sum(math.dist(a,b) for a,b in zip(route,route[1:]))
assert math.isclose(travel,45944.97191010141,abs_tol=.001)
assert len(front['ramps']) == 4 and len(front['landings']) == 5

def area(p):
    return abs(sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2) if p else 0

def clip(p, axis, value, sign):
    out=[]
    if not p: return out
    a=p[-1]; inside_a=sign*(a[axis]-value)>=-1e-8
    for b in p:
        inside_b=sign*(b[axis]-value)>=-1e-8
        if inside_a != inside_b:
            t=(value-a[axis])/(b[axis]-a[axis])
            out.append((a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])))
        if inside_b: out.append(b)
        a,inside_a=b,inside_b
    return out

def covered(p, rectangles):
    total=0
    for x0,y0,x1,y1 in rectangles:
        q=p
        for axis,v,sign in [(0,x0,1),(0,x1,-1),(1,y0,1),(1,y1,-1)]: q=clip(q,axis,v,sign)
        total+=area(q)
    # Clear ramp/landing rectangles have disjoint interiors: area sums cannot
    # conceal an uncovered patch through double counting an overlap.
    return total >= area(p)-.001

def shapes(x,y,degrees):
    a=math.radians(degrees); c,s=math.cos(a),math.sin(a)
    # Native1125 overall may overhang the1000deck wholly at either end:
    # charge1250 centred on the deck. Both native body and600operator grow25.
    body=[(x+u*c-v*s,y+u*s+v*c) for u,v in [(-650,-329.5),(650,-329.5),(650,329.5),(-650,329.5)]]
    radius=325/math.cos(math.pi/32)  # circumscribed, never an undersized circle
    operator=[(x-950*c+radius*math.cos(2*math.pi*i/32),y-950*s+radius*math.sin(2*math.pi*i/32)) for i in range(32)]
    return body,operator

# Local landing SW0,0; adjacent clear ramps extend north. The full actual
# union is used below for every mapped pose;4200 only bounds this turn search.
local_rects=[(0,0,2700,1200),(0,1200,1200,4200),(1500,1200,2700,4200)]
cache={}
def valid(n):
    if n in cache: return cache[n]
    x,y,k=n
    good=0<=x<=54 and 0<=y<=80 and all(covered(p,local_rects) for p in shapes(x*50,y*50,k*5))
    cache[n]=good
    return good

start=(42,56,54); goal=(12,56,18)
def heuristic(n):
    return math.hypot(n[0]-goal[0],n[1]-goal[1])+min((n[2]-goal[2])%72,(goal[2]-n[2])%72)*1.5
queue=[(heuristic(start),0,start)]; cost={start:0}; previous={}
assert valid(start) and valid(goal)
while queue:
    _,g,n=heapq.heappop(queue)
    if g != cost[n]: continue
    if n == goal: break
    x,y,k=n
    for dx,dy,dk,step in [(1,0,0,1),(-1,0,0,1),(0,1,0,1),(0,-1,0,1),(0,0,1,1.5),(0,0,-1,1.5)]:
        nn=(x+dx,y+dy,(k+dk)%72); gg=g+step
        if gg<cost.get(nn,math.inf) and valid(nn):
            cost[nn]=gg; previous[nn]=n; heapq.heappush(queue,(gg+heuristic(nn),gg,nn))
else: raise AssertionError('No constructive turn on this search grid')
path=[goal]
while path[-1] != start: path.append(previous[path[-1]])
path=[[x*50,y*50,k*5] for x,y,k in reversed(path)]
assert len(path)==147

actual_rects=[(p[0],p[1],p[0]+p[2],p[1]+p[3]) for p in [r['plan'] for r in front['ramps']]+[l['plan'] for l in front['landings']]]
for i,a in enumerate(actual_rects):
    for b in actual_rects[i+1:]:
        assert min(a[2],b[2])<=max(a[0],b[0]) or min(a[3],b[3])<=max(a[1],b[1])
transforms=[{'landing':1,'originXY':[3900,-11400],'reflectY':False},
            {'landing':2,'originXY':[2400,0],'reflectY':True},
            {'landing':3,'originXY':[900,-11400],'reflectY':False}]
def mapped(p, tr):
    return [(tr['originXY'][0]+x,tr['originXY'][1]+(-y if tr['reflectY'] else y)) for x,y in p]
dense_count=0
for a,b in zip(path,path[1:]):
    assert (a[2]==b[2]) != (a[:2]==b[:2])
    samples=math.ceil(max(math.hypot(b[0]-a[0],b[1]-a[1])/5,abs(b[2]-a[2])/.25))
    for j in range(samples+1):
        pose=[a[k]+(b[k]-a[k])*j/samples for k in range(3)]
        polygons=shapes(*pose); dense_count+=1
        assert all(covered(p,local_rects) for p in polygons)
        for tr in transforms:
            assert all(covered(mapped(p,tr),actual_rects) for p in polygons)
# Each motion changes translation OR angle. Nearest checked pose is<=2.5mm
# translation or<=0.125degrees away. Even a1277mm maximum point radius moves
# <2.8mm.25mm inflation therefore retains>22mm uninflated plan reserve between
# samples; this does not assert wheel support or a safe handling manoeuvre.
interpolation_bound=max(2.5,2*1277*math.sin(math.radians(.125)/2))
assert interpolation_bound<2.8
assert not all(all(covered(p,local_rects) for p in shapes(1350,600,k*5)) for k in range(72))
assert not all(covered(p,local_rects) for p in shapes(2100,600,180))

result={
 'status':'Unselected W9whole-system renewal development; plan containment only, no cart/handling/anchor/material admission',
 'basis':{'main':HEAD,'hadBlob':blob,'source':'model.gardenFailureBypass.frontApproach','travelXYZmm':travel,
          'historicalStraightBudgetMM':h['approaches']['front']['totalStraightReservation'],
          'historicalRole':'Nominal42m comparison is not current folded route or a straight winch path.'},
 'carrier':{'part':'Fetra25011401','nativeSource':'https://www.fetra.com/carts/open_cart-25011401',
  'nativeDeckMM':[1000,600],'nativeOverallPlanMM':[1125,609],'conservativeDeckCentredBodyMM':[1250,609],
  'nativeDeckHeightMM':270,'nativeCapacityKG':600,'W9KG':156,'operatorDiameterMM':600,'operatorBehindDeckCentreMM':950,
  'nativeCasterOption':1288,'casterSource':'https://www.fetra.com/surcharge_articles/4_swivel_castors-1288',
  'casterBoundary':'All-direction translation assumes native four-swivel option, which reduces directional stability and is incompatible with1280. No hidden fixed-wheel skid manoeuvre.',
  'temporaryToolConstituents':'Plywood deck,TPEwheels and restraints remain visible temporary-tool constituents, not permanent-service polymer approval.'},
 'constructiveFoldedTurn':{'localClearRectanglesMM':local_rects,'localDeckPoseXYDegrees':path,'actualLandingTransforms':transforms,
  'inflationMM':25,'densePoseCountPerTurn':dense_count,'maximumTranslationSampleMM':5,'maximumRotationSampleDegrees':.25,
  'betweenSampleMovementBoundMM':interpolation_bound,'uninflatedPlanReserveLowerBoundMM':25-interpolation_bound,
  'coverageMethod':'Convex clipping against disjoint-interior actual ramp/landing rectangles; circumscribed32side operator polygon. Every inflated polygon has full covered area at each checked pose. Nearest-sample bound covers continuous uninflated comparison shapes.',
  'negativeControls':'Fixed-centre180turn with full operator and the old right-wing sideways turn fail; complete constructive translation/rotation is necessary.',
  'scope':'Only three intermediate Uturns and their adjacent ramp portions. Entry/foot transitions and any continuation on actual grade remain unearned. Deck and operator bodies are plan envelopes; no wheel-contact, hand-force or three-dimensional support inference.'},
 'positiveControlDirection':{
  'manual':'https://www.tractel.com/PIM/Manuals/LH/Manual%20LH/Group%201/150425.ind-03.03-23.pdf',
  'identity':'Tractel150425.ind-03.03-23, native Tirfor/Greifzug installation,operating and maintenance manual,English original;sections1,5,6,8,10.',
  'nativeFacts':'TU8WLL0.8t,8.4kg machine+1kg handle;8.3mm originalTirforrope0.25kg/m. Section1 supports lowering;section6 says both jaws hold load when operation stops. Longer-than20m rope available on request.',
  'developmentChoice':'Investigate native grip-hoist controlled lowering/pulling per actual9mflight with positively held landing transfers. Do not use1280wheel lock as a driving brake, or infer2200downhill performance from its uphill sheet.',
  'hardBoundary':'Manual requires adequate anchors, intended hook/pin, original matching rope and unobstructed straight-line operation. Folded route therefore needs designed per-flight setups or rated redirects; no long straight rope shortcut. Machine,620mm handle arc, operator, rope/sheaves and capture equipment are additional real bodies/costs not yet included in the plan-turn envelope.',
  'transfer':'The next controlled attachment must actually hold the load before the previous line can be unloaded/released; actual anchor locations, attachment load paths, directional restraint and independent failure capture are not designed or qualified here.',
  'noPass':'No native caster/slope compatibility, loaded assembly stability, wheel-contact support, anchorage, redundant capture or whole-body lifting approval.'},
 'wholeSystemDecision':'Keep W9direct96/128 as leading development direction; this constructive actual-route plan removes one renewal uncertainty only. Retain VTCchallenger and all five decisive operating/heat/control/renewal/constituent tests. No apparatus adoption or S01–S10 duty reduction.',
 'nextDecisiveWork':['Native supported156kg W9base/deck transfer and exact component withdrawal','Wheelbase/caster/contact geometry, slope transitions, exact loadedCG and permitted inclination','Complete per-flight hoist/rope/anchor/operator and positively held landing transfer geometry/load path','Actual dirty-filter fan/network/sound and commissioned native two-state/lost-duty contract','Exact winter/defrost/emitter and installed/replacement constituent evidence'],
 'canonicalHADandServicesChanged':False}

svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="980" viewBox="0 0 1200 980">',
 '<style>text{font-family:Arial,sans-serif;fill:#182b3b;font-size:16px}.h{font-size:25px;font-weight:bold}.s{font-size:13px}.b{font-weight:bold}</style>',
 '<rect width="1200" height="980" fill="#fff"/>']
def text(x,y,s,cls=''): svg.append(f'<text x="{x}" y="{y}" class="{cls}">{html.escape(s)}</text>')
text(32,40,'Folded service renewal: one uncertainty narrowed','h')
text(32,69,'Actual HAD route + complete carrier/operator plan. No loaded handling or apparatus acceptance.')
text(32,111,'Actual four-flight approach','b'); text(620,111,'Constructive turn through each intermediate landing','b')
# Actual front approach view, north up. Plane reservations are clear support
# territory only; actual structural/guard/drainage acceptance is not implied.
scale=.045; ox=40; oy=150
def actual_xy(x,y): return ox+(x-800)*scale,oy-y*scale
for r in front['ramps']+front['landings']:
    p=r['plan']; x,y=actual_xy(p[0],p[1]+p[3])
    svg.append(f'<rect x="{x}" y="{y}" width="{p[2]*scale}" height="{p[3]*scale}" fill="#e8f1ef" stroke="#527b70"/>')
pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in [actual_xy(p[0],p[1]) for p in route])
svg.append(f'<polyline points="{pts}" fill="none" stroke="#247ba0" stroke-width="3"/>')
for tr in transforms:
    origin=tr['originXY'];cx=origin[0]+1350;cy=origin[1]+(-600 if tr['reflectY'] else 600)
    x,y=actual_xy(cx,cy);text(x+8,y,'T'+str(tr['landing']),'b')
text(340,190,'Four 9000 mm ramps','b');text(340,215,'1200 mm clear; 1:20')
text(340,252,'Three folded U-turns','b');text(340,277,'2700 × 1200 landings')
text(340,314,'45.945 m XYZ travel','b');text(340,339,'42 m: old straight budget')
text(340,386,'D1800 grade comparator','b');text(340,411,'Actual site / bearing unearned')
text(340,458,'No rope shortcut','b');text(340,483,'Turns require real setups')
text(340,530,'Entry and foot transfer','b');text(340,555,'remain unearned')
# Local proof detail. Three sparse states avoid hiding the actual complete
# bodies under all147poses; centre trace preserves the constructive sequence.
ds=.115; dx=670; dy=650
def local_xy(x,y): return dx+x*ds,dy-y*ds
for x0,y0,x1,y1 in local_rects:
    x,y=local_xy(x0,y1);svg.append(f'<rect x="{x}" y="{y}" width="{(x1-x0)*ds}" height="{(y1-y0)*ds}" fill="#e8f1ef" stroke="#527b70"/>')
pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in [local_xy(p[0],p[1]) for p in path])
svg.append(f'<polyline points="{pts}" fill="none" stroke="#d17a22" stroke-width="2"/>')
for index in [0,73,146]:
    for p,color in zip(shapes(*path[index]),['#1c7c94','#8555a3']):
        pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in [local_xy(*p) for p in p])
        svg.append(f'<polygon points="{pts}" fill="{color}" fill-opacity=".24" stroke="{color}" stroke-width="1.4"/>')
    x,y=local_xy(path[index][0],path[index][1]);text(x+7,y-5,str(index+1),'s')
text(1000,206,'Blue: full cart','s');text(1000,228,'Purple: operator','s');text(1000,250,'Both include 25 mm','s')
text(1000,294,'147 poses','b');text(1000,319,'1966 dense checks','s');text(1000,341,'per actual turn','s')
text(1000,385,'>22 mm reserve','b');text(1000,410,'uninflated comparison','s');text(1000,432,'from sample bound','s')
text(620,693,'PLAN RESULT: complete bodies remain in clear territory.','b')
text(32,741,'Whole-system development decision','b')
for y,s in [(770,'Retain W9 direct 96/128 L/s as leading direction; this is one renewal comparison, not an apparatus pass.'),
 (800,'Investigate grip-hoist control per 9 m flight, with positively held transfers through each landing.'),
 (830,'Native jaws holding a stopped load do not design the anchors, attachments, redirects or independent capture.'),
 (860,'Still bind: supported W9 loading/withdrawal; caster/wheel contact and CG; exact slope/landing control bodies.'),
 (890,'Still bind: actual dirty-filter pressure/noise; native mode/lost-duty behaviour; winter/defrost heat; full constituents.'),
 (934,'No HAD/Services geometry change. No 1280/1288 combination, driving-brake claim, or hidden tool constituents.')]:text(32,y,s,'s' if y==934 else '')
svg.append('</svg>')
artifacts={'.json':json.dumps(result,indent=2,ensure_ascii=False)+'\n','.svg':'\n'.join(svg)+'\n'}
for suffix,content in artifacts.items():
    p=BASE.with_suffix(suffix)
    if '--check' in sys.argv: assert p.read_text()==content, str(p)+' differs'
    else: p.write_text(content)
print('PASS: all three actual folded turns; complete carrier/operator, continuous-plan bound and negative controls. No handling admission.')
