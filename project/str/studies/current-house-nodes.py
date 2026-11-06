#!/usr/bin/env python3
"""Representative current support node: geometry and declared force envelope, not a pile/soil approval."""
from pathlib import Path
import json,hashlib,math,sys
R=Path(__file__).resolve().parents[3]
P=R/'project/had/studies/water-replan.json'; raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='547a0a5515878fd522ceb108c57c37b8aad29f5d2efe33848d93cedd89d65ad4'
h=json.loads(raw); b=h['bridge']; model=h['model']
L=R/'project/str/studies/open-loggia-support.json'; lr=L.read_bytes(); old=json.loads(lr)
bridge=json.loads(Path(__file__).with_name('current-house-bridge.json').read_text())
fyd=500/1.15;fcd=.85*30/1.5
# Keep the existing 450-depth field as the initially joined node reference.
# A passing 250 field is NOT automatically an anchored, integral node.
nodeTop=-180;nodeBottom=-750;nodeNS=650;headDiameter=400;N=850;Mx=My=100
cover=50; bar=20;link=10
zBottom=[-680,-640];zTop=[-250,-290]
assert zBottom[0]-bar/2-nodeBottom>=cover+link
assert nodeTop-(zTop[0]+bar/2)>=cover+link
assert zBottom[1]-zBottom[0]-bar>=20 and zTop[0]-zTop[1]-bar>=20
# Use smaller 370 lever from the archived 450 cap instead of claiming full570 depth.
d=370;leverArm=headDiameter/4
T=N*leverArm/d/2+max(abs(Mx),abs(My))*1000/d
As=5*math.pi*bar*bar/4;capacity=As*fyd/1000
bond=bar*fyd/(4*3);straight=750
# Consistent with archived declared bond3 MPa. No capacity from a terminal hook is assumed.
assert straight>bond and T<capacity
rows=[]
for name,width,axis in [('court',600,7950),('spine',900,9300)]:
 wall=next(w for w in model['groundWalls'] if w['id']=='gallery-east-water-weather') if name=='spine' else None
 x=[axis-width/2,axis+width/2]
 nodeRows=[]
 for y in b['supportAxesY']:
  bounds=[x[0],y-nodeNS/2,width,nodeNS]
  # Current 900 opening, not simply its 600 water clear.
  aperture=h['renewal']['withdrawalTrackClearY']
  # Pick the positive adjacent edge for each node.
  gap=aperture[0]-(y+nodeNS/2) if y<aperture[0] else y-nodeNS/2-aperture[1]
  assert gap>=25
  nodeRows.append({'axis':[axis,y],'plan':bounds,'z':[nodeBottom,nodeTop],'waterPortalReserve':gap})
 positions=[-240,-190,0,190,240] if width==600 else [-390,-340,0,340,390]
 assert min((positions[i+1]-positions[i]-bar)for i in range(4))>=30
 rows.append({'id':name,'nodes':nodeRows,'bottomBars':{'EW':{'z':zBottom[0],'count':5,'diameter':20},'NS':{'z':zBottom[1],'count':5,'diameter':20}},
  'topBars':{'EW':{'z':zTop[0],'count':5,'diameter':20},'NS':{'z':zTop[1],'count':5,'diameter':20}},
  'barAcrossWidthOffsets':positions,'clearCoverToOuterLink':cover,
  'wallBearing':None if wall is None else {'fullFinishedWall':wall['finishedFaces'],'nodeEastReserve':x[1]-wall['finishedFaces'][1]},
  'minimumStraightDevelopmentIntoActualGridArms':straight,
  'incrementalConcreteWeightFrom600Node':(width*nodeNS-600*600)*570/1e9*25})
assert rows[1]['wallBearing']['nodeEastReserve']==27.5
# A reaction envelope bounds four local current-bridge end shears plus actual hip.
local=max(s['V'] for r in bridge['members'] for s in r['capacityComparison'] if s['depth']==450)
hip=old['actual_roof']['cases']['ULS-down']['corner_action_envelope']['RA']
localBound=4*local+hip
assert localBound<N
result={'status':'Representative integral node force/space reference; actual arm allocation and whole-house signed ledger remain active',
 'sources':[{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},{'path':str(L.relative_to(R)),'sha256':hashlib.sha256(lr).hexdigest()}],
 'units':'mm, kN, kNm, MPa unless stated',
 'reference':{'N':N,'Mx':Mx,'My':My,'fourCurrentLocalShearsPlusOneHip':localBound,'pileHeadDiameter':headDiameter,
 'headAverageStressMPa':N*1000/(math.pi*headDiameter**2/4),'effectiveTieLever':d,'tieEachDirection':T,'steelEachDirection':As,'tieResistance':capacity,
 'declaredBondStressMPa':3,'fullYieldStraightBond':bond,'actualReservedStraightLength':straight,
 'reinforcement':'5H20 each direction TOP and BOTTOM, orthogonal layers separated40; H10 closed confinement at75 in node. Layer coordinates are a spatial reservation, not a completed intersection/shop cage.',
 'pileSectionHistoricalDomain':{'sourceNrange':[0,850],'minimumResultantMomentResistance':old['cap']['pile_head_section']['sampled_minimum_resultant'],'demandResultant':math.hypot(Mx,My)},
 'pileSoilCapacity':None,'upliftSoilCapacity':None},'nodes':rows,
 'anchorageBoundary':{'450field':'Its lower main steel can continue into the deep node without a200 vertical offset. Actual continuous longitudinal routes reserve750 into connected arms, as in the archived grillage proposition; corners/terminations and orthogonal cage fabrication require matched STR-RECONCILE evidence.',
 '250field':'Positive member section screen only. Its bottom main bars are200 higher; an explicit force-turn/development detail is required before changing the field soffit or waterbed. No reduction of the selected450 member is adopted here.',
 'knownFailureControl':'A600-wide spine node leaves122.5 of the actual weatherleaf beyond the node. Widening only the field member does not fix that bearing route.'},
 'transverseWallBearing':{'southActualCore':[5807.5,5947.5],'northActualCore':[7852.5,7992.5],'southCandidateNodeY':[5775,6425],'northCandidateNodeY':[7375,8025],'actualCoreMinimumReserve':32.5,'old600NodeCoreReserve':7.5,'currentWaterPortalReserve':25,'declaredConstructionSetoutTolerance':25,'role':'650NS candidate is below-floor only. Wall alignment unchanged; no reduction of finished exterior1200clear band is claimed.'},
 'qualification':'N850 and M100 each are declared node design limits, not allocated whole-house reactions. A pile section capacity is not pile/soil or wet-ground admission; the whole-house ledger must remain inside the force domain.'}
assert result['reference']['headAverageStressMPa']<fcd
assert result['reference']['pileSectionHistoricalDomain']['demandResultant']<result['reference']['pileSectionHistoricalDomain']['minimumResultantMomentResistance']
out=Path(__file__).with_suffix('.json');s=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert out.read_text()==s;print('Current node geometry, force and reinforcement-space reference reproduces')
else:out.write_text(s);print(json.dumps(result['reference'],indent=2))
