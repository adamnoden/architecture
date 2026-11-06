#!/usr/bin/env python3
"""Actual kitchen applicability of the existing joined cooker heat challenger."""
import hashlib,json,math,pathlib,subprocess,sys
P=pathlib.Path(__file__).resolve().parent
ROOT=P.parents[2]
def load(path):return json.loads((ROOT/path).read_text())
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':')).encode()).hexdigest()
h=load('project/had/studies/water-replan.json')['model']
b=load('project/mat/studies/whole-house-service-baseline.json')
c=load('project/mat/studies/joined-cooker-system.json')['SwegonExternalMotorCandidate']
# This study owns no selected geometry. Reject drift in the actual affected
# source projection, rather than pinning unrelated water-mechanism prose.
old=json.loads(subprocess.check_output(['git','show','bc1231479ccbcae3c15b3f5cc7f86055dbeb7a0e:project/had/studies/water-replan.json'],cwd=ROOT))['model']
def subject(m):return {k:m[k] for k in ['rooms','groundFurniture','kitchenOccurrence','windowRequirements','groundWalls','architecturalServices','pantryReplacement']}
assert digest(subject(h))==digest(subject(old)), 'Affected HAD source changed: review heat applicability'
f=h['groundFurniture'];room=h['rooms']['kitchenDining']['bounds']
def intersection(a,b):
 lo=[max(a[i],b[i]) for i in (0,1)];hi=[min(a[i]+a[i+2],b[i]+b[i+2]) for i in (0,1)]
 return [lo[0],lo[1],max(0,hi[0]-lo[0]),max(0,hi[1]-lo[1])]
def overlaps(a,b):r=intersection(a,b);return r[2]>0 and r[3]>0
def distance(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1];d=dx*dx+dy*dy
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)) if d else 0
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
def corners(r):return [(r[0],r[1]),(r[0]+r[2],r[1]),(r[0]+r[2],r[1]+r[3]),(r[0],r[1]+r[3])]
def polygon(x,y,a,width,length):
 co,si=math.cos(math.radians(a)),math.sin(math.radians(a))
 return [(x+dx*co-dy*si,y+dx*si+dy*co) for dx,dy in [(-width/2,-length/2),(width/2,-length/2),(width/2,length/2),(-width/2,length/2)]]
def polygon_distance(p,q):
 # Separating axes detect intersection; otherwise edge-to-vertex distance is exact.
 separate=False
 for z in (p,q):
  for a,bb in zip(z,z[1:]+z[:1]):
   axis=(a[1]-bb[1],bb[0]-a[0]);u=[x*axis[0]+y*axis[1] for x,y in p];v=[x*axis[0]+y*axis[1] for x,y in q]
   separate|=max(u)<min(v) or max(v)<min(u)
 if not separate:return 0
 return min([distance(v,a,bb) for poly,other in ((p,q),(q,p)) for v in poly for a,bb in zip(other,other[1:]+other[:1])])
solids={k:r for k,r in f.items() if r[0]<room[0]+room[2] and r[0]+r[2]>room[0] and r[1]<room[1]+room[3] and r[1]+r[3]>room[1]}
east=c['proposedEastEmitterCompletePlanMM'];column=f['service-kitchen-feed-column']
assert intersection(east,column)==[11425,11188,145,224]
pull=[east[0]-200,east[1],east[2]+200,east[3]]
assert overlaps(pull,f['north-cooking-station'])
north=[9675,11370.5,1050,200]
assert overlaps(north,f['low-food-larder'])
# Native 1100 body + inherited 75 each valve/end allowance. Neither selected.
west=[7719.5,10277.5,200,1250]
assert not any(overlaps(west,r) for r in solids.values())
assert room[1]+room[3]-18-(west[1]+west[3])==25
assert west[1]-(f['dining-chair-west-north'][1]+500)==27.5
nominal=2983;ncoef=1.34
east_old=next(e for e in b['heat']['emitterSchedule'] if e['id']=='kitchen-E')
assert east_old['completePlanWithValvesAndBrackets']==[11370.5,9700,200,1350]
output=east_old['nominalDelta50W']*.6**east_old['nCoefficient']+nominal*.6**ncoef
band=c['maximumZeroCreditSub1_5KitchenW']
variants=[v for row in c['all256Modes'] for v in row['variants']]
assert len(c['all256Modes'])==256 and all(output>v['remainingKitchenW'] for v in variants)
assert output>band
# Warm flow/return branch: two inherited complete84 pipes,25 between,25 each
# edge =>243x134. Retain25 insulation and jackets; no bare-tube substitution.
branch={'section':[243,134],'completePipeOD':84,'edgeAndBetween':25,
 'points':[[10500,8585,2945],[7841,8585,2945],[7841,10340,2945],[7841,10340,200],[7819.5,10370,200]],
 'scope':'Proposed connected branch inside warm kitchen. No wall/core crossing or cill; pressure, actual valve/bend/support and thermal movement not proved.'}
assert branch['section']==[2*84+3*25,84+2*25]
assert 7841-243/2==7719.5 and 8000-(7841+243/2)==37.5
assert 8585-243/2-8424.5==39 and 3100-(2945+134/2)==88
new_person_obstacles=[west,[7719.5,10340-243/2,243,243]]
paths={w['id']:w['points'] for w in h['actions']['witnesses'] if w['level']=='GROUND' and w['id'].startswith(('kitchen-','low-larder-'))}
task_reserves={name:min(polygon_distance([a,z,z,a],corners(r))-300 for a,z in zip(points,points[1:]) for r in new_person_obstacles) for name,points in paths.items()}
for win in h['windowRequirements']:
 if win['level']=='GROUND' and win['id'].startswith('kitchen'):
  point=win['body'];task_reserves[win['id']]=min(polygon_distance([point]*4,corners(r))-300 for r in new_person_obstacles)
assert task_reserves and min(task_reserves.values())>=30.5-1e-7,task_reserves
# A finite ROOM-ONLY witness, never a qualified handling device/export claim.
# Full native body is1100x180x700. Released supported maximum1120x200 leaves
# only10 each edge for a real cradle; that restrictive requirement is unearned.
poses=[[7819.5,10902.5,0],[8019.5,10902.5,0],[8594.5,10877.5,35],[8769.5,10702.5,60],[8919.5,10652.5,65],[9219.5,10602.5,65],[9419.5,10602.5,65],[9994.5,10302.5,60],[9994.5,10177.5,25],[10019.5,10002.5,-5]]
assert poses[0][1:]==poses[1][1:] and poses[1][0]-poses[0][0]==200
assert all(room[0]<=x<=room[0]+room[2] and room[1]+18<=y<=room[1]+room[3]-18 for x,y in polygon(*poses[0],200,1120))
def reserve(p):
 wall=min(min(x-room[0]-18,room[0]+room[2]-18-x,y-room[1]-18,room[1]+room[3]-18-y) for x,y in p)
 return min(wall,*[polygon_distance(p,corners(r)) for r in solids.values()])
minimum=1e9
for seg,(a,z) in enumerate(zip(poses,poses[1:])):
 travel=math.hypot(z[0]-a[0],z[1]-a[1])+math.hypot(560,100)*abs(math.radians(z[2]-a[2]))
 steps=max(1,math.ceil(travel))
 for j in range(steps+1):
  pose=[a[i]+(z[i]-a[i])*j/steps for i in range(3)]
  # Installed wall contact is intentional during the first front pull.
  p=polygon(*pose,200,1120)
  if seg==0:
   fixed=min(polygon_distance(p,corners(r)) for r in solids.values())
   margin=fixed
  else:margin=reserve(p)
  minimum=min(minimum,margin-travel/steps/2)
assert minimum>24,minimum
result={'status':'UNSELECTED heat/room-release challenger; no canonical Services change or whole-system/handling/material admission.',
 'source':{'HADReviewCommit':'bc1231479ccbcae3c15b3f5cc7f86055dbeb7a0e','affectedProjectionSha256':digest(subject(h)),
 'servicesBlob':'3e934b29d9f328b41cb9bd2498184154090492c0','heatSource':'joined-cooker-system.json / SwegonExternalMotorCandidate'},
 'rejectedOldJoin':{'northH700L900LarderOverlap':intersection(north,f['low-food-larder']),
 'eastH600L1400FeedColumnOverlap':intersection(east,column),'east200PullCookingOverlap':intersection(pull,f['north-cooking-station']),
 'actualFeed':'Cold/hot complete74OD atx11487/y11250,11350 descend2945to242, crossing proposed radiator100to700. No through-radiator nesting or omitted column permitted.'},
 'recommendedDevelopment':{'retainEast1200':east_old['completePlanWithValvesAndBrackets'],'westH700L1100':west,
 'native':'Stelrad3073311,1100x700,180 mounted depth; nominal2983WDelta50/n1.34. Complete installed1250x200 includes150valve territory.',
 'support':'Solid loggia-east-weather structural core7552.5..7692.5;27 internal finish to7719.5. Native brackets retained, no insulation/core omitted; actual anchors/reactions and thermal movement required.',
 'dryMassKg':60.77*1.1,'filledMassBeforeValvesKg':(60.77+11.37)*1.1,
 'at55_45_20W':output,'zeroHeaterBandW':band,'zeroHeaterBandMarginW':output-band,
 'all256ModesThermalComparison':True,'sourceOperationalAdmission':False,'branch':branch,
 'actualKitchenPersonPathReserves':task_reserves,
 'smallerWestH700L1000ThermalMarginW':east_old['nominalDelta50W']*.6**east_old['nCoefficient']+2712*.6**ncoef-band},
 'roomReleaseOnly':{'maximumSupportedPlan':[1120,200],'nativeBodyPlan':[1100,180],'lift':50,
 'poseKnotsXYDegrees':poses,'continuousClearanceLowerBound':minimum,
 'method':'Exact convex polygon distances; samples have<=1mm maximum point movement. Subtract half adjacent point-travel bound for continuous clearance. Fixed furniture/table/chairs/larder retained; no pocket/body proxy.',
 'notProved':'Matched support before union release, actual valves/tool/anchor/mass/centre, cradle fitting the10mm edge budget, people/reach/forces,3D lift, door/gallery/whole-house export and reinstatement. End is the room handoff point, not outside.'},
 'decision':'Reject the existing north900/east1400 join on actual larder/retained feed/cooking collisions. Prefer retained east1200 plus west1100 for next joined kit proof. Do not adopt any radiator, source/HX duty, hood mode, heater/controller or material exception from this geometric and heat comparison.'}
target=P/'kitchen-replan-heat.json';text=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
if '--check' in sys.argv:assert target.read_text()==text,'stale kitchen heat applicability result'
else:target.write_text(text)
# Actual kitchen plan at1:20. Failed candidate and proposed source are distinct.
from html import escape
sv=['<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="260mm" viewBox="0 0 297 260"><rect width="297" height="260" fill="white"/>',
 '<style>text{font-family:Arial,sans-serif;fill:#172531;font-size:3px} .dash{stroke-dasharray:2 1}</style>']
def line(x,y,t):sv.append(f'<text x="{x}" y="{y}">{escape(t)}</text>')
def mapped(p):return (30+(p[0]-room[0])/20,205-(p[1]-room[1])/20)
def box(r,fill,stroke,label=None,dash=False):
 x,y=mapped([r[0],r[1]+r[3]])
 sv.append(f'<rect x="{x}" y="{y}" width="{r[2]/20}" height="{r[3]/20}" fill="{fill}" stroke="{stroke}" stroke-width="0.3"'+(' class="dash"' if dash else '')+'/>')
 if label:line(x+1,y+4,label)
line(15,12,'Kitchen replan / actual heat-host failure and unselected west alternative')
line(15,19,'Retained furniture and source Services. 1:20 at native297mm. GroundFFL0 / dimensionsmm.')
box(room,'none','#222')
for name,r in solids.items():box(r,'#edf0ec','#778078',{'low-food-larder':'LARDER','cold-storage':'COLD STORE','north-cooking-station':'HOB / OVEN'}.get(name))
box(east,'none','#b03030',dash=True)
box(intersection(east,column),'#f5a3a3','#b03030')
line(225,51,'East1400 REJECTED')
line(225,58,'Red: feed column clash')
box(west,'#ccebe0','#186d54','WEST1100',True)
for i,pose in enumerate(poses):
 points=' '.join(f'{x:.3f},{y:.3f}' for x,y in map(mapped,polygon(*pose,200,1120)))
 sv.append(f'<polygon points="{points}" fill="none" stroke="#a87522" stroke-width="0.25" opacity="0.7"/>')
 if i in (1,len(poses)-1):
  x,y=mapped(pose);line(x,y,str(i))
line(15,218,f'Existing east1200 + proposed westH700L1100: {output:.1f}W at55/45/20; band{band:.1f}W; margin{output-band:.1f}W.')
line(15,225,'RED full1550east box crosses retained feed column. North900 overlaps actual low larder.')
line(15,232,f'AMBER released1120x200 maximum, room-only swept lower bound{minimum:.2f}. All chairs retained.')
line(15,239,'Not matched handling equipment. Native1100x180 leaves10mm/edge for support: actual kit may reject it.')
line(15,246,'No adopted radiator/valve/support, full operator/export, cooker control, net plant or material pass.')
sv.append('</svg>');svg='\n'.join(sv)+'\n';svgpath=P/'kitchen-replan-heat.svg'
if '--check' in sys.argv:assert svgpath.read_text()==svg,'stale kitchen heat drawing'
else:svgpath.write_text(svg)
print(json.dumps({'rejectedEastColumnOverlap':result['rejectedOldJoin']['eastH600L1400FeedColumnOverlap'],'westThermalMarginW':output-band,'roomReleaseLowerBound':minimum}))
