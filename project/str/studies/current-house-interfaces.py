#!/usr/bin/env python3
"""Exact current-house STR re-entry. --check is read-only; no historical prover is weakened."""
from pathlib import Path
import hashlib,json,math,sys
R=Path(__file__).resolve().parents[3]
P=R/'project/had/studies/water-replan.json';raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='547a0a5515878fd522ceb108c57c37b8aad29f5d2efe33848d93cedd89d65ad4','Rejoin actual HAD source before structural credit'
v=json.loads(raw);h=v['model'];b=v['bridge'];base=json.loads((R/'project/had/studies/open-north-loggia.json').read_text())
assert h['selection']['decision'].startswith('SELECT') and h['architecturalDevelopmentProof']['pass']
retained={}
for key in ['upperWalls','upperFurniture','stair','roofDevelopment']:
 assert h[key]==base[key],f'Historical {key} cannot transfer';retained[key]=hashlib.sha256(json.dumps(h[key],sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert h['openings']['FIRST']==base['openings']['FIRST']
court_core=[h['court'][0]+h['court'][2]+h['envelope']-27-140,h['court'][0]+h['court'][2]+h['envelope']-27]
spine=next(w for w in h['groundWalls']if w['id']=='gallery-east-water-weather')
court_axis=sum(court_core)/2;weather_court=h['court'][0]+h['court'][2]+102.5/2
weather_spine=spine['finishedFaces'][1]-102.5/2
nodes=[]
for x,w in zip(b['supportAxesX'],b['localSupportBeamWidths']):
 node=b['supportNodes']['plan'];edges=[x-node[0]/2,x+node[0]/2]
 wall=[7750,8179.5]if x==7950 else spine['finishedFaces']
 nodes.append({'axisX':x,'beamWidth':w,'nodePlan':node,'nodeX':edges,'completeWallX':wall,'wallBeyondNodeEast':max(0,wall[1]-edges[1]),'candidateNodePlan':[w,node[1]],'candidateNodeMassIncrementG_kN':(w-node[0])*node[1]*570/1e9*25})
portal=h['northNormalRoute']['portal'];incoming=h['southCourtThresholdReference']['maintainedState']['incoming'];height=incoming['transportEnvelope'][2]
def floor(y):return -110-(y-7750)/100 if y>=7750 else -30-(y-5750)*.04
rows=[]
for band in portal['coreBands']:
 top=height+floor(band[0]);rows.append({'actualCoreAxialBandY':band,'floorAtFront':floor(band[0]),'completeIncomingHeight':height,'loadTopAtFront':top,'tieEnvelopeUnderside':portal['tie']['underside'],'headReserve':portal['tie']['underside']-top})
assert rows[0]['headReserve']<0 and rows[1]['headReserve']>0
roof=json.loads((R/'project/str/studies/open-loggia-support.json').read_text())['actual_roof']
roofpoints=[q for q in roof['seats']if q['wall']=='court-east']
source={'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest(),'gitBlob':hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()}
out={'status':'Current-house structural coordination WIP; no STR-HOUSE selection or physical approval',
 'source':source,'retainedHistoricalGeometryChecks':retained,
 'actualLocalBridge':{'axesX':b['supportAxesX'],'axesY':b['supportAxesY'],'nodeNS':b['supportNodes']['plan'][1],'clearSpanNS':b['supportAxesY'][1]-b['supportAxesY'][0]-b['supportNodes']['plan'][1],'axisSpanNS':b['supportAxesY'][1]-b['supportAxesY'][0],'depthReservation':b['localSupportBeamZ'][1]-b['localSupportBeamZ'][0],
 'courtCoreX':court_core,'courtCoreAxisX':court_axis,'courtCoreEccentricity':court_axis-b['supportAxesX'][0],'courtWeatherAxisX':weather_court,'courtWeatherEccentricity':weather_court-b['supportAxesX'][0],
 'spineCoreX':spine['structuralCore'],'spineWeatherAxisX':weather_spine,'spineWeatherEccentricity':weather_spine-b['supportAxesX'][1]},
 'nodes':nodes,'incomingAgainstActualPortalTie':rows,'retainedRoofPointActionEnvelope':roofpoints,
 'findings':['Old3m grid torsion eccentricities cannot be repinned onto actual1600axis/1000clear short bridge. Current court core8082.5 enters132.5east; new spine weather9671.25 enters371.25east.',
 '900wide spine member alone does not establish direct support at600wide nodes: full wall extends122.5 beyond node. Explicit900EW node candidate adds2.565kN pernode and preserves NSwaterclearance.',
 '2300complete incoming reference intersects current courtportal tie envelope for every possible tie position in its actual215 coreband; gardenportal does not. Do not shrink load/drillvoussoirs/claimnominal2400opening solves actual head.'],
 'next':'Resolve actual bridge load/cage/depth and900node, then actual tie/portal/incoming section as one preferred structural reference; join whole-house gravity/signed routes and occupied section before STR-HOUSE exit.',
 'claimCeiling':'These are deterministic geometric counterexamples, not capacity, material/fire/connection, site or construction acceptance.'}
text=json.dumps(out,indent=2,sort_keys=True)+'\n';target=Path(__file__).with_suffix('.json')
if '--check'in sys.argv:assert target.read_text()==text;print('Current-house exact interface audit reproduces; three owning STR questions remain explicit')
else:target.write_text(text);print(json.dumps({'coreEccentricity':out['actualLocalBridge']['courtCoreEccentricity'],'weatherEccentricity':out['actualLocalBridge']['spineWeatherEccentricity'],'nodeBeyond':nodes[1]['wallBeyondNodeEast'],'courtTieReserve':rows[0]['headReserve']},indent=2))
