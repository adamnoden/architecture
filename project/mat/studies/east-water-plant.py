"""Full retained-apparatus plant reservation for HAD's joined E-water hypothesis.

This authors a proposed Services interface; it does not mutate the frozen whole
house baseline or qualify an apparatus, person, trolley, joint or water passage.
"""
import copy
import hashlib
import json
import math
from pathlib import Path
import sys
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent

def source(path, expected):
    raw = subprocess.check_output(['git','show','c1986524454a0a9f518c45184e1d8808e9eebb1e:'+path], cwd=ROOT)
    actual = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    assert actual == expected, (path, 'changed; review the complete interface')
    return json.loads(raw)

baseline = source('project/mat/studies/whole-house-service-baseline.json', '2d8f7243fb87d350763f2bca3d103b89b9d14b7d')
had = source('project/had/studies/open-north-loggia.json', '25faad2c4d40df2b7da7212f73808843a88d2f52')

def point_segment(p, a, b):
    v = [b[i] - a[i] for i in range(2)]
    n = sum(x*x for x in v)
    t = max(0, min(1, sum((p[i]-a[i])*v[i] for i in range(2))/n)) if n else 0
    return math.dist(p, [a[i]+t*v[i] for i in range(2)])

def point_rect(p, r):
    return math.hypot(max(r[0]-p[0], p[0]-r[0]-r[2], 0), max(r[1]-p[1], p[1]-r[1]-r[3], 0))

def segment_rect(a, b, r):
    # Liang-Barsky intersection, followed by exact segment/edge distance.
    lo, hi = 0, 1
    for axis in range(2):
        d = b[axis]-a[axis]
        if d == 0:
            if not r[axis] <= a[axis] <= r[axis]+r[axis+2]:
                lo, hi = 1, 0
                break
        else:
            x, y = sorted(((r[axis]-a[axis])/d, (r[axis]+r[axis+2]-a[axis])/d))
            lo, hi = max(lo, x), min(hi, y)
    if lo <= hi:
        return 0
    corners = [[r[0], r[1]], [r[0]+r[2], r[1]], [r[0]+r[2], r[1]+r[3]], [r[0], r[1]+r[3]]]
    return min(point_rect(a, r), point_rect(b, r), *(point_segment(p, a, b) for p in corners))

plant = copy.deepcopy(baseline['plant'])
old = copy.deepcopy(plant)
# Complete apparatus sizes and duties stay unchanged. Only placement/orientation
# changes; the cylinder's 25 east movement earns a real cart/west-wall reserve.
for key in ['body', 'station', 'workingEast']:
    plant['cylinder'][key][0] += 25
plant['cylinder']['replacementCentrePath'] = [[9860,4250],[10500,4250],[10500,4575],[12500,4575]]
plant['primaryBuffer']['station'] = [10125,5000,650,650]
plant['primaryBuffer']['replacementCentrePath'] = [[10450,5325],[10700,4575],[12500,4575]]
plant['controlsHydraulics'] = [10895.5,5480.5,650,300]
plant['architecturalRewinds']=['Plant dry north face5780.5 and intermediatearch3300/raw1250 require actual HAD source join.','Hydraulic controls rotate onto dry north wall; actual ports/supports may not breach its wet/air/thermal boundary.','Retain all baseline duties, including actual high-level east soil exit; do not create a floor-level crossbar.']
plant['primaryBuffer']['stationRewind']='New proposed east-water room:100east/525south, full650station retained.'
plant['emitterJoin'] = {
    'radComplete':[10975,3397,550,200],
    'radRoutineBody':[11225,3922,300],
    'radAfter150PullBody':[11225,4072,300],
    'controlsBody':[11220.5,5155.5,300],
    'bufferFrontServiceBody':[10450,4675,300],
    'scope':'Inherited full R300 spatial task reservations, not qualified people or tools. Separate task modes; no simultaneous work-space claim.',
    'bufferPortFaceRequirement':old['emitterJoin']['bufferPortFaceRequirement'],
}
room = [9397,3397,2173.5,2383.5]
water = {'finishedPassageY':[6300,7500], 'plantWeatherWallY':[5780.5,6300],
         'dryGallery':'Retained warm full-height gallery west of the outdoor cut. HAD/MAT must prove its actual deep water bridge; this record gives it no structural or water pass.'}
arch = {'axisY':3300, 'finishedNorthFaceY':3397, 'rawOpeningX':[9650,10900],
        'oldRawOpeningX':[9650,11050], 'jambFinishEachSide':27, 'finishedClearWidth':1196, 'radiatorFinishedJambReserve':48,
        'scope':'HAD must author this explicit 150 raw-opening narrowing; no radiator hung in the former arch opening.'}
door = {'rawY':old['cylinder']['doorRaw'], 'finishedClearY':[4100,5100],
        'requiredClearHeight':2300, 'renewal':'Open outward or remove the complete leaf before trolley work under a qualified supported task. An inward leaf at y5300 blocks the northern buffer turn. Exterior swept/standing territory remains HAD/site-owned.'}

buffer_centre = [10450,5325]
cylinder_centre = [9860,4250]
rectangles = {'riser':plant['riserGross'], 'controls':plant['controlsHydraulics'], 'radiator':plant['emitterJoin']['radComplete']}
circles = {'cylinder':(cylinder_centre,297.5), 'buffer':(buffer_centre,300)}
checks = []
for name in ['cylinder','primaryBuffer']:
    path = plant[name]['replacementCentrePath']
    for fixed, rect in rectangles.items():
        reserve = min(segment_rect(a,b,rect)-425 for a,b in zip(path,path[1:]))
        assert reserve >= 25-1e-7, (name,fixed,reserve)
        checks.append({'task':name+' replacement','fixed':fixed,'minimumPlanReserve':reserve})
    other = 'buffer' if name == 'cylinder' else 'cylinder'
    centre, radius = circles[other]
    reserve = min(point_segment(centre,a,b)-425-radius for a,b in zip(path,path[1:]))
    assert reserve >= 25-1e-7, (name,other,reserve)
    checks.append({'task':name+' replacement','fixed':other+' complete round body','minimumPlanReserve':reserve})
    # Before exiting east, the entire 850 circle remains in the plant dry bounds.
    for p in path[:-1]:
        reserve = min(p[0]-425-room[0], p[1]-425-room[1], room[1]+room[3]-p[1]-425)
        assert reserve >= 25-1e-7, (name,'room',p,reserve)
    y = path[-1][1]
    assert min(y-425-door['finishedClearY'][0],door['finishedClearY'][1]-y-425) >= 25

for task in ['radRoutineBody','radAfter150PullBody','controlsBody','bufferFrontServiceBody']:
    x,y,r = plant['emitterJoin'][task]
    for name, rect in rectangles.items():
        if (task.startswith('rad') and name=='radiator') or (task=='controlsBody' and name=='controls'):
            continue
        reserve = point_rect([x,y],rect)-r
        assert reserve >= 25-1e-7, (task,name,reserve)
        checks.append({'task':task,'fixed':name,'minimumPlanReserve':reserve})
    for name,(centre,radius) in circles.items():
        reserve = math.dist([x,y],centre)-r-radius
        assert reserve >= 25-1e-7, (task,name,reserve)
        checks.append({'task':task,'fixed':name,'minimumPlanReserve':reserve})
    assert min(x-r-room[0],room[0]+room[2]-x-r,y-r-room[1],room[1]+room[3]-y-r) >= 25-1e-7

assert 10975-10900-27==48 and 11570.5-11525==45.5
assert plant['cylinder']['height'] + plant['cylinder']['requiredTopService'] == 2245
assert plant['controlsMaximumHeight'] == 2300
assert plant['primaryBuffer']['maximumBodyHeight'] == 1600
trunk = copy.deepcopy(next(t for t in baseline['trunks'] if t['id']=='ground-rear-east'))
assert trunk['axisZ']==2945 and trunk['ordinaryBand']==[320,260]
adverse = {'unchangedBufferBeyondNewDryWall':old['primaryBuffer']['station'][1]+650-5780.5,'unchangedControlsBeyondNewDryWall':old['controlsHydraulics'][1]+650-5780.5,'unchangedRadiatorBeyondNewDryWall':old['emitterJoin']['radComplete'][1]+200-5780.5,'oldArchOpeningOverlapsNewRadiator':11050-10975}
assert all(v>0 for v in adverse.values())
assert segment_rect([0,0],[10,10],[4,4,2,2])==0
assert abs(segment_rect([0,0],[10,10],[0,10,1,1])-9/math.sqrt(2))<1e-9
result = {
    'status':'Proposed full Services plant reservation for the joined HAD east-water hypothesis. No source adoption or MAT-SERVICES completion.',
    'immutableStartingMain':'c1986524454a0a9f518c45184e1d8808e9eebb1e',
    'sourceBlobs':{'whole-house-service-baseline.json':'2d8f7243fb87d350763f2bca3d103b89b9d14b7d','open-north-loggia.json':'25faad2c4d40df2b7da7212f73808843a88d2f52'},
    'coordinates':'mm; ground FFL0, same existing selected HAD source. Proposed plant dry bounds and water cut belong to the unadopted joined hypothesis.',
    'plantDryRoom':room,'eastWaterHypothesis':water,'intermediateArch':arch,'replacementDoor':door,
    'plant':plant,'unchangedUtility':copy.deepcopy(baseline['rewinds']['utility']),
    'unchangedUpperRiser':{'gross':old['riserGross'],'formedOpening':old['formedOpeningProposal'],'services':old['proposedServices'],'scope':old['openingStatus']},
    'frontPlantArchCrossing':{'oldAxisY':3700,'newAxisY':3300,'trunkX':10350,'newLowCentreProfile':[[10350,3550,2945],[10350,3550,2500],[10350,3300,2500],[10350,3050,2500],[10350,3050,2945]],'completeBand':[320,260],'lowestFinishedPanel':2350,'scope':'Replace the old3700 local crossing in the front-west trunk. Actual new1300 arch intrados, full160half-width, continuous pipe bends/supports and exposed-panel access must be joined to HAD/STR; this proposed shoulder cannot be treated as a free core bore.'},
    'rearWarmTrunk':{'source':trunk,'normalFullZ':[2815,3075],'normalFullXAtGallery':[8540,8860],
                     'loweredCrossingAxisZ':2500,'lowestFinishedLocalPanelZ':2350,
                     'condition':'Keep the complete original high-level route within actual enclosed dry gallery, including every lowered aperture. It is NOT routed in 65 screed, in bridge concrete or outdoors. Prove actual wall/ceiling/air/weather boundaries on the same HAD source.'},
    'changes':{'cylinder':'25 east; unchanged 595 complete comparison body/700 station, 300L duty and 1745 height; exit turn25 south.',
               'buffer':'Station +100 east /525 south; unchanged650 station,600 complete-round body and100 usable L duty.',
               'controls':'Unchanged650×300 plan dimensions rotated from east to north wall; all hydraulic/electrical/support/lead access still required.',
               'radiator':'Unchanged550×200 complete plan/400 body length, now on actual intermediate-arch east jamb facing north; unchanged150 front-pull requirement.',
               'utility':'All original washer/sink/chase/valve/electrical/PV bodies and working fields retained.'},
    'checks':checks,'adverseUnchangedLayout':adverse,
    'retainedHolds':['Actual bridge/deep passive water/foundation/first-wetting and dry/wet wall support must be proved by HAD/MAT/STR before source selection.',
                    '850 circle is the inherited maximum whole apparatus+trolley plan requirement, not a qualified trolley, handler, force or 3D carrying proof. Complete handling height must remain below the actual2300 door; supports, routes and outdoor position need qualification.',
                    'R300 task fields are inherited spatial reservations only. Real workers/tools/valves/brackets and all access/door states require matched apparatus.',
                    'No actual plant product, safety circuit, constituent or polymer exception is accepted. Known cooker/boost/heat/hydraulic and first-release defects remain open; moving them does not cure them.',
                    'New north-wall control supports and pipe entries must terminate on dry supports without piercing the wet/air/thermal boundary or obstructing liner renewal. No unnamed service port is permitted.'],
}

def svg():
    s=.1; ox,oy=50,100
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="600" viewBox="0 0 1050 600">',
         '<rect width="1050" height="600" fill="white"/>','<g font-family="sans-serif" font-size="12">',
         '<text x="25" y="18">MAT / HAD east-water hypothesis: full retained apparatus, proposed locations</text>']
    def rect(r,fill,stroke='#222'):
        out.append(f'<rect x="{ox+(r[0]-9300)*s}" y="{oy+(6000-r[1]-r[3])*s}" width="{r[2]*s}" height="{r[3]*s}" fill="{fill}" stroke="{stroke}"/>')
    rect(room,'#faf6e9')
    rect([9300,5780.5,2700,519.5],'#c8def0')
    for name,r in rectangles.items():
        rect(r,'#c4d0b5');out.append(f'<text x="{ox+(r[0]-9300)*s}" y="{oy+(6000-r[1])*s+13}">{name}</text>')
    for name,key in [('cylinder','cylinder'),('buffer','primaryBuffer')]:
        rect(plant[key]['station'],'#d9d1be')
        path=plant[key]['replacementCentrePath']
        points=' '.join(f'{ox+(p[0]-9300)*s},{oy+(6000-p[1])*s}' for p in path)
        out.append(f'<polyline points="{points}" fill="none" stroke="{ "#3465a4" if name=="cylinder" else "#a65a2b"}" stroke-width="2"/>')
        for p in path[:-1]:out.append(f'<circle cx="{ox+(p[0]-9300)*s}" cy="{oy+(6000-p[1])*s}" r="{425*s}" fill="none" stroke="#999" stroke-dasharray="3 3"/>')
        out.append(f'<text x="{ox+(path[0][0]-9300)*s}" y="{oy+(6000-path[0][1])*s}">{name}</text>')
    lines=['FFL0 / ceiling3100 retained as a candidate condition.','300L cylinder:595 body /700 station /1745 high +500 top task.','100L usable buffer:600 complete round /650 station /1600 high.','850 circle is a retained maximum cart+apparatus requirement.','Separate replacement/task states; no qualified human/tool claim.','Controls650×300 rotate onto dry north wall; height2300.','Arch3300: raw9650–10900;27jambs leave1196clear.','Plant external raw opening3900–5300; finished1000×2300.','Open outward or remove supported leaf before replacement.','Warm rear trunk stays HIGH: fullZ2815–3075; local panels2350.','No underfloor service route, bridge capacity or water pass.','Cooker/heat/control/material/actual-kit holds remain open.']
    for i,line in enumerate(lines):out.append(f'<text x="420" y="{65+i*25}">{line}</text>')
    out.append('<text x="25" y="450">Blue: cylinder exit. Brown: buffer exit. Dashed: complete850 circles at source checkpoints.</text>')
    out.append('<text x="25" y="478">Numeric source checks the whole swept circle continuously; drawn checkpoints alone are not the proof.</text>')
    out.append('<text x="25" y="520">PROPOSED REFERENCE DESIGN — not released for construction; no HAD source adoption.</text></g></svg>')
    return ''.join(out)

outputs={HERE/'east-water-plant.json':json.dumps(result,indent=2)+'\n',HERE/'east-water-plant.svg':svg()}
for path,content in outputs.items():
    if '--check' in sys.argv:assert path.read_text()==content, f'{path}: regenerate'
    else:path.write_text(content)
print(json.dumps({'checks':len(checks),'minimumFixedPlanReserve':min(x['minimumPlanReserve'] for x in checks),'status':result['status']}))
