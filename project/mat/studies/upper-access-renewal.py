#!/usr/bin/env python3
"""Preferred same-level project reference. Never use the retired receiver screen as proof."""
import hashlib,json,math,sys
from pathlib import Path
O=Path(__file__).resolve().parent;R=O.parents[2]
s=json.loads((O/'upper-access-renewal.json').read_text());raw=(R/s['hadSource']).read_bytes();h=json.loads(raw)
b,n,p=h['bridge'],h['renewal'],h['passage']
blob=hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
bed=lambda x:p['bedEnds'][0][1]+(x-p['bedEnds'][0][0])*(p['bedEnds'][1][1]-p['bedEnds'][0][1])/(p['bedEnds'][1][0]-p['bedEnds'][0][0])
outer=b['outerSupportReservation'];cx=p['waterClear'][1]+p['waterClear'][3]/2
spineE=max(x+z/2 for x,z in zip(b['supportAxesX'],b['localSupportBeamWidths']))
# Preferred same-level method: never use the withdrawn lower-receiver screen as its proof.
if 'preferredJoint' in s:
 j=s['preferredJoint'];f=j['reinforcingUFrame'];t=j['tool'];hnd=j['handling'];zj=bed(j['splitX']);rad=j['bodyRadius']
 E=j['preliminaryFrameCase']['EassumedMPa'];d=f['sectionEW'];v=f['sectionTransverse'];wall=f['wall'];I=(v*d**3-(v-2*wall)*(d-2*wall)**3)/12
 span=f['bottomSpan'];F=j['preliminaryFrameCase']['bottomDistributedReactionAssumedN'];qline=F/span
 crossDef=5*qline*span**4/(384*E*I);crossStress=(qline*span**2/8)*(d/2)/I
 sideF=j['preliminaryFrameCase']['totalBoltPreloadAssumedN']/2;sideDef=sideF*f['sideHeight']**3/(3*E*I);sideStress=sideF*f['sideHeight']*(d/2)/I
 assert I>0 and crossDef<.2 and sideDef<.2 # authored stiffness screen only, not seal admission
 engaged=[j['boltHeadX']-j['boltLength'],j['boltHeadX']]
 assert engaged[0]<=j['nutIntervalX'][0] and engaged[1]>=j['nutIntervalX'][1]
 afterThread=engaged[0]+j['threadedRelease'];assert afterThread>j['nutIntervalX'][1]
 released=engaged[0]+j['captiveRetreatEast'];assert released>j['innerFaceEastX']
 assert j['captiveCollarDiameter']>j['captiveStopBore'] and j['captiveCollarDiameter']<j['captiveGuideInnerDiameter']
 assert j['boltHeadX']+j['captiveRetreatEast']+j['captiveCollarDiameter']/2<j['captiveGuideX'][1]
 # Source complete tool: side lanes, above-floor top lever, staff through actual open hatch.
 headR=t['headCube']/2;shaftR=t['shaftRadius'];maxReach=0;minPortal=1e9;minBody=1e9
 for side,by in enumerate(j['sideBoltsY']):
  body=j['operatorCentres'][side]
  for dz in j['boltZRelativeBed']:
   bz=zj+dz;top=bz+t['verticalShaft'];assert top-shaftR>j['guardTop']
   lane=(cx-763/2)-(by+headR) if side==0 else (by-headR)-(cx+763/2);assert lane>0
   for move in [0,j['captiveRetreatEast']]:
    tx=j['toolHeadX']+move;assert j['hatchClear'][0]+shaftR<tx<j['hatchClear'][0]+j['hatchClear'][2]-shaftR
    bx=body[0]+move;minPortal=min(minPortal,body[1]-rad-6300,7500-body[1]-rad)
    for degree in range(-15,16):
     a=math.radians(degree);hx=tx+t['topLeverRadius']*math.cos(a);hy=by+t['topLeverRadius']*math.sin(a)
     reach=math.sqrt((bx-hx)**2+(body[1]-hy)**2+(j['shoulderHeight']-top)**2);maxReach=max(maxReach,reach);assert reach<=j['handReach']
     minBody=min(minBody,bx-rad-(hx+shaftR));assert bx-rad>hx+shaftR
 assert minPortal>0
 # Install/retrieve the full tool through the real hatch; collar/positive guide holds between strokes.
 ins=j['toolInstall'];setupMargin=1e9
 for by in j['sideBoltsY']:
  for dz in j['boltZRelativeBed']:
   final=zj+dz;remaining=ins['headInitialZ']-final
   first=min(remaining,ins['initialDescentMax']);remaining-=first
   second=min(remaining,ins['secondDescentMax']);remaining-=second
   assert remaining<=ins['finalHandOffToTopLeverMax']
   assert ins['headInitialZ']+t['verticalShaft']+20<2523 # conservative finished arch spring reference
   for lo,hi in ins['collarZStates']:
    for hz in [lo,hi]:
     hx=j['toolHeadX']+ins['movingCollarHandleXOffset'];bx=j['toolHeadX']+ins['setupBodyXOffset']
     byBody=6650 if by<cx else 7150
     reach=math.sqrt((bx-hx)**2+(byBody-by)**2+(1450-hz)**2);assert reach<600
     setupMargin=min(setupMargin,bx-rad-j['guardEastX']-j['guardThickness']/2)
 assert setupMargin>0

 # Continuous half-step bound: hand/tool point moves no faster than the250 lever radius per radian.
 ratchetHalfStepBound=t['topLeverRadius']*math.radians(.5)
 assert maxReach+ratchetHalfStepBound<j['handReach'] and minBody>ratchetHalfStepBound
 # Both short leaves open through a narrow dedicated guard guide; person remains entirely outside.
 hooks=[];minGuide=1e9;minGuardBody=1e9;minClosedDeck=1e9
 for hinge,direction in [(9975,1),(10725,-1)]:
  for i in range(901):
   a=math.pi/2*i/900;tipx=hinge+direction*j['hook']['leafHandleRadius']*math.cos(a);tipz=j['hook']['leafHandleRadius']*math.sin(a)
   run=math.sqrt(j['hook']['length']**2-(j['hook']['handHeight']-tipz)**2);handx=tipx+run;bodyx=handx+j['hook']['bodyBehindHand']
   minGuardBody=min(minGuardBody,bodyx-rad-j['guardEastX']-j['guardThickness']/2)
   assert minGuardBody>0
   minClosedDeck=min(minClosedDeck,hnd['parkStart']+hnd['innerGrossX'][1]-hnd['innerGrossX'][0]-bodyx-rad)
   assert minClosedDeck>0 # fixed deck OR explicitly still-closed outboard bay during joint-hatch operation
   assert math.hypot(j['hook']['bodyBehindHand'],j['shoulderHeight']-j['hook']['handHeight'])<=j['handReach']
   for gx in [j['guardEastX']-j['guardThickness']/2,j['guardEastX']+j['guardThickness']/2]:
    iz=tipz+(gx-tipx)*(j['hook']['handHeight']-tipz)/run
    envelope=j['hook']['headRadius']*math.sqrt(1+((j['hook']['handHeight']-tipz)/run)**2)
    minGuide=min(minGuide,iz-envelope-j['hook']['guideZ'][0],j['hook']['guideZ'][1]-iz-envelope)
    assert minGuide>0
   hooks.append(bodyx)
 # Analytic Lipschitz bound over every unsampled halfstep, including capsule projection.
 # Handle derivative<=350; run>=900, |run'|<=466.667, |A|<=835, B<=1200.
 hookHalf=math.pi/(2*900)/2;bodyDerivative=350+1200*350/900
 guideDerivative=350+350*1200/900+835*350/900+835*1200*(1200*350/900)/900**2
 capsuleDerivative=j['hook']['headRadius']*(350/900+1200*(1200*350/900)/900**2)
 guideHalfBound=(guideDerivative+capsuleDerivative)*hookHalf;bodyHalfBound=bodyDerivative*hookHalf
 assert minGuide>guideHalfBound and minGuardBody>bodyHalfBound and minClosedDeck>bodyHalfBound
 # Full hardware profiles, staging order and independent support. Upper bearers aren't present on first placement.
 mods=[];maxEnd=0
 for name,xs,store in [('outer',hnd['outerGrossX'],hnd['lowerBearerTop']),('inner',hnd['innerGrossX'],hnd['upperBearerTop'])]:
  L=xs[1]-xs[0];park=[hnd['parkStart'],hnd['parkStart']+L];maxEnd=max(maxEnd,park[1]);low=min(bed(x)-150 for x in park)
  assert park[0]>outer['fullX'][1] and park[1]<=hnd['stage'][0]+hnd['stage'][2]
  assert low+hnd['lift']>hnd['postTop'] # lateral transfer clears the actual pre-existing posts
  assert (j['completeCouplingY'][1]-j['completeCouplingY'][0])<hnd['apertureY'][1]-hnd['apertureY'][0]
  if name=='inner':assert j['splitX']-112>spineE # wide coupling NEVER moves west through900 gallery aperture
  mods.append({'module':name,'grossX':xs,'grossLength':L,'parkX':park,'translation':park[0]-xs[0],'tier':store,'minimumLiftedBottom':low+hnd['lift']})
 assert maxEnd+hnd['temporaryDrawConnectorEW']<hnd['endOperator'][0]
 assert hnd['handover'][2]>=max(q['grossLength'] for q in mods) and hnd['handover'][3]>j['completeCouplingY'][1]-j['completeCouplingY'][0]
 assert hnd['handover'][1]+hnd['handover'][3]<=hnd['platform'][1]+hnd['platform'][3]
 assert hnd['rackInstallState'].startswith('Temporary rack assembled AFTER')
 stageHalf=(j['completeCouplingY'][1]-j['completeCouplingY'][0])/2;stageCY=cx+hnd['northTranslation']
 postGap=min(stageCY-stageHalf-(hnd['rackPostY'][0]+25),hnd['rackPostY'][1]-25-(stageCY+stageHalf));assert postGap>0
 maxOuterTop=hnd['lowerBearerTop']+300+bed(hnd['parkStart'])-bed(maxEnd);assert hnd['upperBearerTop']-hnd['upperBearerSection'][0]>maxOuterTop # complete100-deep beam, not just its top
 for yy in hnd['bearerInstallOperators']['y']:
  for hz in hnd['bearerInstallOperators']['handZ']:
   assert math.sqrt(hnd['bearerInstallOperators']['xOffset']**2+350**2+(hnd['bearerInstallOperators']['crouchedShoulder']-hz)**2)<600
 assert hnd['forkSeatZ']+hnd['upperBearerSection'][0]==hnd['upperBearerTop']
 # Removable rack beams: component screen under authored5kN single-module handling load, NOT a supplied rating.
 rb=hnd['upperBearerSection'];rI=(rb[1]*rb[0]**3-(rb[1]-2*rb[2])*(rb[0]-2*rb[2])**3)/12;rSpan=hnd['rackPostY'][1]-hnd['rackPostY'][0];rp=hnd['referenceVerticalLoadN']/2
 rackDef=rp*rSpan**3/(48*E*rI);rackStress=(rp*rSpan/4)*(rb[0]/2)/rI
 # Local joint leakage falls continuously to a separate stated receiver; no borrowed foul route.
 cap=j['capture'];floor=zj+cap['floorRelativeBed'];rim=zj+cap['rimRelativeBed'];assert rim<zj-150 and cap['pipeInvertStart']<floor
 endX,endInvert=cap['pipeEnd'];assert endX>cap['pipeStartX'] and endInvert<cap['pipeInvertStart'] and cap['receivingWaterMaximum']<endInvert
 pipeCrownStart=cap['pipeInvertStart']+cap['pipeOD']-cap['pipeWall'];pipeCrownEnd=endInvert+cap['pipeOD']-cap['pipeWall']
 pipeRailGap=min(bed(j['splitX'])-200-pipeCrownStart,bed(endX)-200-pipeCrownEnd);# Actual pipe is centred6900, BETWEEN both50-wide rails, not a free route through a solid crossbeam.
 railLateralGap=min(abs(cap['pipeCentreY']-ry)-cap['pipeOD']/2-j['railReference']['sectionNS']/2 for ry in j['railReference']['axesY']);assert railLateralGap>0
 for bridgeX in [*b['supportAxesX'],outer['axisX']]:
  inv=cap['pipeInvertStart']+(endInvert-cap['pipeInvertStart'])*(bridgeX-cap['pipeStartX'])/(endX-cap['pipeStartX'])
  if cap['pipeStartX']<=bridgeX<=endX:assert inv+cap['pipeOD']-cap['pipeWall']<b['localSupportBeamZ'][0]
 out={'identity':s['identity'],'status':'Preferred accessible two-piece project reference; internal component/motion checks only','hadBlob':blob,'method':'SAME-LEVEL TWO-PIECE SIDE-BOLTED U FLANGE','frameScreen':{'I_mm4':I,'crossDeflection_mm':crossDef,'sideDeflection_mm':sideDef,'crossStress_MPa':crossStress,'sideStress_MPa':sideStress,'scope':'Assumed E/preload/reaction; not uniform gasket contact, bolt torque or certified strength'},'boltEngagedX':engaged,'boltThreadClearanceAfter35':afterThread-j['nutIntervalX'][1],'boltClearOfInnerFaceAfter175':released-j['innerFaceEastX'],'maxHandReach':maxReach,'continuousRatchetHalfstepBound':ratchetHalfStepBound,'continuousHookHalfstep':{'body':bodyHalfBound,'guardCapsule':guideHalfBound,'minimumSampledGuard':minGuide},'minimumToolToBodyX':minBody,'portalBodyMargin':minPortal,'toolInstallGuideBodyMargin':setupMargin,'coverOperatorX':[min(hooks),max(hooks)],'modules':mods,'rackPostClearance':postGap,'storedOuterToCompleteUpperBearer':hnd['upperBearerTop']-hnd['upperBearerSection'][0]-maxOuterTop,'rackComponentScreen':{'deflection_mm':rackDef,'stress_MPa':rackStress,'load_N':hnd['referenceVerticalLoadN']},'capture':{'floor':floor,'rim':rim,'carrierToRim':zj-150-rim,'pipeInvertStart':cap['pipeInvertStart'],'pipeEnd':[endX,endInvert],'pipeToLongitudinalRailLateralClear':railLateralGap,'comparison50RailVerticalGap':pipeRailGap,'receivingMaximum':cap['receivingWaterMaximum'],'scope':'Geometry only; capacity/site and first-harm admissibility remain unearned'},'minimumLocalD':-(endInvert-cap['pipeWall']-cap['pipeSupportBelow'])+500,'preferredLocalDtrial':j['preferredLocalDtrial'],'qualifiedFirstHarmMargin':None,'methodAcceptance':'Project reference INTERNAL checks pass; actual seal/preload/material/rigging/load/physical and incoming-module handover acceptance remain open'}

q=O/'upper-access-renewal.results.json';v=json.dumps(out,indent=2)+'\n'
if '--check' in sys.argv:assert q.read_text()==v;print('Preferred joint outputs reproduce; see actual component/motion domains and explicit acceptance holds')
else:q.write_text(v);print('Wrote finite upper-access proposal screen; whole method INCOMPLETE')
