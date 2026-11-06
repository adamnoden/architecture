#!/usr/bin/env python3
"""Check the actual current foul setout against actual HAD opening profiles."""
import hashlib,json,math,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
args={x.split('=',1)[0]:x.split('=',1)[1] for x in sys.argv[1:] if '=' in x}
hadpath=pathlib.Path(args.get('--had',ROOT/'project/had/studies/water-replan.json'))
h=json.loads(hadpath.read_text())['model']
raw=(ROOT/'project/mat/studies/whole-house-service-baseline.json').read_bytes()
b=json.loads(raw);s=b['interfaces']['architecturalServices'];e=s['eastFoulExit']
geometry_only='--geometry-only' in sys.argv
if not geometry_only:
 assert h['architecturalServices']==s,'HAD must import the exact entire current Services object'
 assert h['servicesInterface']['eastFoulExit']==e,'Actual HAD foul occurrence is stale'
 assert h['servicesAuxiliaryProjection']['sourceBlob']==hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
actual={o['id']:o for o in h['openings']['GROUND'] if o['wall']=='outer-east'}
profiles={o['id']:o for o in h['archOpeningRegister']['GROUND'] if o['wall']=='outer-east'}
assert actual.keys()==profiles.keys(),'Stale or missing actual opening profile'
assert 'east-window-2' not in profiles and 'east-outdoor-water-portal' in profiles
for name,p in profiles.items():
 for key in ['centre','width','wall']:
  assert p[key]==actual[name][key],(name,key)
 for key in ['head','spring','radialRingTrial']:
  assert key in p,(name,'unbound '+key)
portal=profiles['east-outdoor-water-portal']
assert portal['width']-2*portal['jambFinishEach']==portal['finishedWidth']==1200
assert portal['head']+portal['radialRingTrial']==3065
def ring_gap(q,R,t,half,r):
 a=math.atan2(math.sqrt(R*R-half*half),half);th=math.atan2(q[1],q[0]);rr=math.hypot(*q)
 if a<=th<=math.pi-a:
  return R-rr-r if rr<R else rr-R-t-r if rr>R+t else -r
 aa=a if th<a else math.pi-a;u=[math.cos(aa),math.sin(aa)]
 along=max(R,min(R+t,sum(q[i]*u[i] for i in (0,1))))
 return math.hypot(q[0]-along*u[0],q[1]-along*u[1])-r
def profiles_at(point,radius):
 values={}
 for name,p in profiles.items():
  half=p['width']/2;rise=p['head']-p['spring'];R=(half*half+rise*rise)/(2*rise)
  q=[point[1]-p['centre'],point[2]-(p['head']-R)]
  values[name]=ring_gap(q,R,p['radialRingTrial'],half,radius)
 return values
point=e['path'][-1];assert point==[12000,5625,2616.875]
assert e['lengthMM']==2625 and e['fallAt1in40']==65.625
assert e['path'][0]==[9800,5200,2682.5]
for a,z in zip(e['path'],e['path'][1:]):assert abs(a[2]-z[2]-math.dist(a[:2],z[:2])/40)<1e-9
wall=next(w for w in h['groundWalls'] if w['id']=='plant-north')
dry=wall['finishedFaces'][0];assert dry==e['northReturnJoin']['northDryFace']==5780.5
carrier_radius=80;hole_radius=e['formedWallTerritory']/2;flash_radius=e['faceFlashingTerritory']/2
checks={name:profiles_at(point,r) for name,r in [('complete160Carrier',carrier_radius),('formed200Hole',hole_radius),('complete300Flashing',flash_radius)]}
assert all(v>=25 for row in checks.values() for v in row.values()),checks
assert dry-point[1]-hole_radius==55.5 and dry-point[1]-carrier_radius==75.5
# The old point is a negative control against actual new return, regardless of
# its favourable old arch calculation. Current exterior stack is fully outside.
assert dry-(5700+hole_radius)==-19.5
assert e['externalDownstackBodyTerritory']==[12000,5475,450,300]
assert e['externalDownstackBodyTerritory'][0]>=wall['b'][0]
assert e['path'][-2][2]-carrier_radius-s['plant']['controlsMaximumHeight']>250
grade=e['grade'];assert grade['trialExterior']==-2000
assert grade['requiredReceiverEnvelopeCrownAtOrBelow']==grade['trialExterior']-grade['crownCoverControl']==-2600
axis=grade['requiredReceiverEnvelopeCrownAtOrBelow']-80
assert grade['axisOf160OuterEnvelope']==axis==-2680
tails={d['id']:d['path'][-1] for d in s['otherServiceDuties'] if d['id'] in grade['affectedExternalTails']}
assert len(tails)==5 and all(p[2]==axis for p in tails.values())
assert tails['east-soil']==[12450,5625,axis]
assert b['interfaces']['kitchenSinkStation']['wasteRequiredRoute'][-1]==[9275,12450,axis]
if not geometry_only:
 current=next(p for p in h['exteriorPortGeometry'] if p['id']=='east-foul-flashing')
 assert current['p']==point and abs(current['minimumRingOrCassetteReserve']-min(checks['complete300Flashing'].values()))<1e-8
print(json.dumps({'scope':'GEOMETRY ONLY; HAD Services projection is not being accepted' if geometry_only else 'Actual current whole-Services equality and bounded foul/return/profile/receiver checks; no hydraulic/material/closure/support/site acceptance',
 'actualProfileIds':list(profiles),'port':point,'allCurrentOpeningReserves':checks,
 'formedHoleReturnReserve':55.5,'carrierReturnReserve':75.5,'oldHoleReturnNegative':-19.5,
 'newReceiverOuterAxis':axis,'affectedExternalTails':tails}))
