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
 assert cap['trayX'][1]==cap['pipeStartX'] and bed(cap['trayX'][1])+cap['floorRelativeBed']>cap['pipeInvertStart']
 endX,endInvert=cap['pipeEnd'];assert endX>cap['pipeStartX'] and endInvert<cap['pipeInvertStart'] and cap['receivingWaterMaximum']<endInvert
 pipeCrownStart=cap['pipeInvertStart']+cap['pipeOD']-cap['pipeWall'];pipeCrownEnd=endInvert+cap['pipeOD']-cap['pipeWall']
 pipeRailGap=min(bed(j['splitX'])-200-pipeCrownStart,bed(endX)-200-pipeCrownEnd);# Actual pipe is centred6900, BETWEEN both50-wide rails, not a free route through a solid crossbeam.
 railLateralGap=min(abs(cap['pipeCentreY']-ry)-cap['pipeOD']/2-j['railReference']['sectionNS']/2 for ry in j['railReference']['axesY']);assert railLateralGap>0
 for bridgeX in [*b['supportAxesX'],outer['axisX']]:
  inv=cap['pipeInvertStart']+(endInvert-cap['pipeInvertStart'])*(bridgeX-cap['pipeStartX'])/(endX-cap['pipeStartX'])
  if cap['pipeStartX']<=bridgeX<=endX:assert inv+cap['pipeOD']-cap['pipeWall']<b['localSupportBeamZ'][0]
 out={'identity':s['identity'],'status':'Preferred accessible two-piece project reference; internal component/motion checks only','hadBlob':blob,'method':'SAME-LEVEL TWO-PIECE SIDE-BOLTED U FLANGE','frameScreen':{'I_mm4':I,'crossDeflection_mm':crossDef,'sideDeflection_mm':sideDef,'crossStress_MPa':crossStress,'sideStress_MPa':sideStress,'scope':'Assumed E/preload/reaction; not uniform gasket contact, bolt torque or certified strength'},'boltEngagedX':engaged,'boltThreadClearanceAfter35':afterThread-j['nutIntervalX'][1],'boltClearOfInnerFaceAfter175':released-j['innerFaceEastX'],'maxHandReach':maxReach,'continuousRatchetHalfstepBound':ratchetHalfStepBound,'continuousHookHalfstep':{'body':bodyHalfBound,'guardCapsule':guideHalfBound,'minimumSampledGuard':minGuide},'minimumToolToBodyX':minBody,'portalBodyMargin':minPortal,'toolInstallGuideBodyMargin':setupMargin,'coverOperatorX':[min(hooks),max(hooks)],'modules':mods,'rackPostClearance':postGap,'storedOuterToCompleteUpperBearer':hnd['upperBearerTop']-hnd['upperBearerSection'][0]-maxOuterTop,'rackComponentScreen':{'deflection_mm':rackDef,'stress_MPa':rackStress,'load_N':hnd['referenceVerticalLoadN']},'capture':{'floor':floor,'rim':rim,'carrierToRim':zj-150-rim,'pipeInvertStart':cap['pipeInvertStart'],'pipeEnd':[endX,endInvert],'pipeToLongitudinalRailLateralClear':railLateralGap,'comparison50RailVerticalGap':pipeRailGap,'receivingMaximum':cap['receivingWaterMaximum'],'scope':'Geometry only; capacity/site and first-harm admissibility remain unearned'},'minimumLocalD':-(endInvert-cap['pipeWall']-cap['pipeSupportBelow'])+500,'preferredLocalDtrial':j['preferredLocalDtrial'],'qualifiedFirstHarmMargin':None,'methodAcceptance':'Project reference INTERNAL checks pass; actual seal/preload/material/rigging/load/physical and incoming-module handover acceptance remain open'}

# Source-derived inspection figure: geometry/claim boundaries, not a fabrication drawing.
import html
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1120" viewBox="0 0 1400 1120"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" fill="#17242e">']
def T(x,y,msg,size=15,c='#17242e'):svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}">{html.escape(str(msg))}</text>')
def B(x,y,ww,hh,fill,stroke='#41535b'):svg.append(f'<rect x="{x}" y="{y}" width="{ww}" height="{hh}" fill="{fill}" stroke="{stroke}"/>')
T(35,35,'Upper access: one same-level E route, accessible two-piece joint',24)
T(35,62,'PROJECT REFERENCE · limited internal checks · no seal, physical, material, lifting or site acceptance',15,'#a12b23')
PX=lambda x:40+(x-7500)*.12
PY=lambda y:100+(y-6000)*.075
plat=hnd['platform'];B(PX(plat[0]),PY(plat[1]),plat[2]*.12,plat[3]*.075,'#f6f2e9')
for low,high in [[x-ww/2,x+ww/2] for x,ww in zip(b['supportAxesX'],b['localSupportBeamWidths'])]+[outer['fullX']]:
 low=max(low,7500)
 if high>low:B(PX(low),PY(6300),(high-low)*.12,1200*.075,'#ddd4c8')
B(PX(7550),PY(6600),(10050-7550)*.12,600*.075,'#79b2d4')
B(PX(10050.5),PY(6600),(12250-10050.5)*.12,600*.075,'#8dc6b1')
B(PX(j['splitX']-112),PY(j['completeCouplingY'][0]),224*.12,(j['completeCouplingY'][1]-j['completeCouplingY'][0])*.075,'none','#a12b23')
B(PX(hnd['parkStart']),PY(hnd['apertureY'][0]),2700*.12,(hnd['apertureY'][1]-hnd['apertureY'][0])*.075,'none','#276a98')
for name in ['stage','handover','endOperator']:
 q=hnd[name];B(PX(q[0]),PY(q[1]),q[2]*.12,q[3]*.075,{'stage':'#e0cda7','handover':'#e4ded3','endOperator':'#f0dfa7'}[name])
 T(PX(q[0])+5,PY(q[1])+22,{'stage':'Two-tier STATIC storage','handover':'Incoming / outgoing: one at a time','endOperator':'Fixed operator'}[name],12)
q=j['hatchClear'];B(PX(q[0]),PY(q[1]),q[2]*.12,q[3]*.075,'none','#a12b23')
for body in j['operatorCentres']:svg.append(f'<ellipse cx="{PX(body[0])}" cy="{PY(body[1])}" rx="{rad*.12}" ry="{rad*.075}" fill="none" stroke="#245b93"/>')
T(40,495,'Plan: brown support envelopes below the upper deck; blue/green are separate same-level modules. Operators shown are alternative positions.',14)
T(1120,125,'One controlled sequence',17)
for i,msg in enumerate(['1 N verified / E isolated','2 Guards, then joint hatch','3 Four side bolts captive','4 All park covers opened','5 Rack, then OUTER lands','6 Upper bearers, INNER','7 Old out before new in','8 INNER returns first','9 Then OUTER / seal test']):T(1120,160+i*30,msg,14)
T(40,545,'EW section through side-bolt lane (not the wet pan centre)',20)
SX=lambda x:40+(x-9700)*.28
SZ=lambda z:865-z*.13
for lo,hi in [[9750,10000],[10700,12250]]:B(SX(lo),SZ(0),(hi-lo)*.28,180*.13,'#c4c8cc')
B(SX(11217.5),SZ(-180),900*.28,450*.13,'#d7c7b4')
T(SX(11217.5)+3,SZ(-180)-8,'Retained outer beam BELOW walking level',12)
for lo,hi,col in [(7550,10050.5,'#79b2d4'),(10050.5,12250,'#8dc6b1')]:
 lo=max(lo,9700)
 pts=[(SX(lo),SZ(bed(lo)+100)),(SX(hi),SZ(bed(hi)+100)),(SX(hi),SZ(bed(hi)-150)),(SX(lo),SZ(bed(lo)-150))]
 svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{col}" stroke="#41535b"/>')
B(SX(9938),SZ(zj+f['sideHeight']-j['frameBelowBed']),224*.28,f['sideHeight']*.13,'none','#a12b23')
for dz in j['boltZRelativeBed']:
 z=zj+dz;svg.append(f'<path d="M{SX(9925)} {SZ(z)} H{SX(10200)}" stroke="#a12b23" stroke-width="2"/>')
 z=zj+j['boltZRelativeBed'][0]
B(SX(j['toolHeadX']-30),SZ(z+30),60*.28,60*.13,'#808f9c')
svg.append(f'<path d="M{SX(j["boltHeadX"])} {SZ(z)} H{SX(j["toolHeadX"])} V{SZ(z+t["verticalShaft"])} H{SX(j["toolHeadX"]+250)}" fill="none" stroke="#245b93" stroke-width="4"/>')
B(SX(j['guardEastX']-10),SZ(j['guardTop']),20*.28,j['guardTop']*.13,'#c4d4df')
body=j['operatorCentres'][0];B(SX(body[0]-rad),SZ(j['bodyHeight']),2*rad*.28,j['bodyHeight']*.13,'none','#245b93')
T(850,570,'Actual preferred proof',18)
for i,msg in enumerate([f'Bolt full release clearance: {released-j["innerFaceEastX"]:g} mm',f'Max hand reach: {maxReach:.1f} / 600 mm',f'Ratchet half-step bound: {ratchetHalfStepBound:.3f} mm',f'Hook guard half-step bound: {guideHalfBound:.3f} mm',f'U-frame nominal deflections: {crossDef:.3f} / {sideDef:.3f} mm',f'Rack bearer nominal deflection: {rackDef:.3f} mm',f'Local D minimum incl. pipe support: {out["minimumLocalD"]:g} mm','E / preload / loadshare explicitly assumed','First-harm margin remains UNKNOWN']):T(850,605+i*32,msg,14,'#a12b23' if i>=7 else '#17242e')
T(40,1060,'No person below a beam. No bottom flange bolt. No live second receiver. Storage never loads a wet pan.',16)
T(40,1090,'The diagram and internal checks do not substitute for qualified seal, material, force, support, rigging, receiving or actual plot evidence.',14,'#a12b23')
svg.append('</g></svg>\n')
svgText='\n'.join(svg)

outputs={O/'upper-access-renewal.results.json':json.dumps(out,indent=2)+'\n',O/'upper-access-renewal.svg':svgText}
if '--check' in sys.argv:
 for q,v in outputs.items():assert q.read_text()==v,q
 print('Preferred joint source/results/figure reproduce; limited internal domains and acceptance holds explicit')
else:
 for q,v in outputs.items():q.write_text(v)
 print('Wrote preferred joint source-linked results and figure')
