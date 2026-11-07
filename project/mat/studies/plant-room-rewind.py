#!/usr/bin/env python3
"""One whole-cell rewind, with rejected local controls and unearned handling visible."""
from pathlib import Path
import argparse,hashlib,json,math,subprocess,html
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).with_suffix('')
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def pointseg(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
def edges(p):return list(zip(p,p[1:]+p[:1]))
def inside(p,poly):
 vals=[cross(a,b,p) for a,b in edges(poly)];return all(v>=-1e-9 for v in vals) or all(v<=1e-9 for v in vals)
def segdist(a,b,c,d):
 if cross(a,b,c)*cross(a,b,d)<=0 and cross(c,d,a)*cross(c,d,b)<=0:
  if max(min(a[0],b[0]),min(c[0],d[0]))<=min(max(a[0],b[0]),max(c[0],d[0]))+1e-9 and max(min(a[1],b[1]),min(c[1],d[1]))<=min(max(a[1],b[1]),max(c[1],d[1]))+1e-9:return 0
 return min(pointseg(a,c,d),pointseg(b,c,d),pointseg(c,a,b),pointseg(d,a,b))
def pointpoly(p,poly):return 0 if inside(p,poly) else min(pointseg(p,a,b) for a,b in edges(poly))
def segpoly(a,b,p):return 0 if inside(a,p) or inside(b,p) else min(segdist(a,b,c,d) for c,d in edges(p))
def polydist(p,q):return 0 if inside(p[0],q) or inside(q[0],p) else min(segdist(a,b,c,d) for a,b in edges(p) for c,d in edges(q))
def rect(r):x,y,w,h=r;return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
def hull(ps):
 ps=sorted(set(map(tuple,ps)));lo=[];hi=[]
 for p in ps:
  while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 for p in reversed(ps):
  while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return [list(x) for x in lo[:-1]+hi[:-1]]
def circlepath(path,r,obstacles):
 margins={}
 for id,o in obstacles.items():
  ds=[]
  for a,b in zip(path,path[1:]):
   ds.append(pointseg(o['circle'][:2],a,b)-o['circle'][2]-r if 'circle'in o else segpoly(a,b,rect(o['rect']))-r)
  margins[id]=min(ds)
 worst=min(margins,key=margins.get)
 return {'radius_mm':r,'polyline_mm':path,'minimumInflatedMargin_mm':margins[worst],'limiting':worst,'allMargins_mm':margins,'planPass':margins[worst]>=-1e-7}
def cartpath(path,obstacles):
 # Exact convex swept union for each fixed-heading translation; no sampling gap.
 sw=[hull([[x+dx,y+dy] for x,y in [a,b] for dx,dy in [(-625,-304.5),(625,-304.5),(625,304.5),(-625,304.5)]]) for a,b in zip(path,path[1:])]
 margins={id:min(pointpoly(o['circle'][:2],p)-o['circle'][2]-25 if 'circle'in o else polydist(p,rect(o['rect']))-25 for p in sw) for id,o in obstacles.items()};worst=min(margins,key=margins.get)
 return {'completeCarrier_mm':[1250,609],'reserve_mm':25,'polyline_mm':path,'minimumMargin_mm':margins[worst],'limiting':worst,'allMargins_mm':margins,'planPass':margins[worst]>=-1e-7,'scope':'Exact fixed-heading body sweep only; no wheel/support/CG/force/hand-grip or complete operator turn admission.'}
def immutable(path,blob):
 raw=subprocess.check_output(['git','show','50093457642f65eca288e5cc233a77d8aac6bc29:'+path],cwd=ROOT)
 assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==blob
 return json.loads(raw)
def coupled_plan(obs,crewobs,states,detach_index,regrip_role):
 # Complete600 plate includes the tabulated four-caster sweep.25 reserve is applied once.
 bodyobs={k:v for k,v in obs.items() if k!='buffer'};crewobs={k:v for k,v in crewobs.items() if k!='buffer'}
 body=circlepath([s[0] for s in states],325,bodyobs);crew=[circlepath([s[j] for s in states],325,crewobs) for j in [1,2]]
 separations={key:min(pointseg([0,0],[x[j][z]-x[k][z] for z in range(2)],[y[j][z]-y[k][z] for z in range(2)])-need for x,y in zip(states,states[1:])) for j,k,need,key in [(0,1,625,'bodyCrew1'),(0,2,625,'bodyCrew2'),(1,2,650,'crewCrew')]}
 # Circular body300 and crew body300 receive25 each for fixed obstacles, but mutual
 # non-overlap uses one shared25 gap:300+300+25, not two stacked reserves.
 worst=math.inf;movement=0;heights=[];steps=100
 bounds=[]
 for o in crewobs.values():
  if 'circle'in o:x,y,r=o['circle'];bb=[x-r,y-r,x+r,y+r]
  else:x,y,w,hh=o['rect'];bb=[x,y,x+w,y+hh]
  bounds.append((o,bb))
 for i,(x,y) in enumerate(zip(states,states[1:])):
  if i==detach_index:continue # explicit positively docked detach/carry/re-pin state
  ra=[x[1][z]-x[0][z] for z in range(2)];rb=[y[1][z]-y[0][z] for z in range(2)];rmin=pointseg([0,0],ra,rb)
  # Normalised-vector displacement <=2|delta r|/rmin. Any intermediate bar
  # endpoint is within this conservative movement bound of the preceding sample;
  # the entire segment inherits the maximum of its endpoint bounds.
  du=2*math.dist(ra,rb)/(steps*rmin)
  movement=max(movement,math.dist(x[0],y[0])/steps+275*du,math.dist(x[1],y[1])/steps+105*du)
  for k in range(steps+1):
   t=k/steps;b=[x[0][z]*(1-t)+y[0][z]*t for z in range(2)];c=[x[1][z]*(1-t)+y[1][z]*t for z in range(2)];d=math.dist(b,c);v=[(c[z]-b[z])/d for z in range(2)];pin=[b[z]+275*v[z] for z in range(2)];grip=[c[z]-105*v[z] for z in range(2)]
   horizontal=d-105-275;assert 0<horizontal<1000;heights.append(160+math.sqrt(1000**2-horizontal**2))
   for o,bb in bounds:
    dx=max(bb[0]-max(pin[0],grip[0]),min(pin[0],grip[0])-bb[2],0);dy=max(bb[1]-max(pin[1],grip[1]),min(pin[1],grip[1])-bb[3],0)
    if math.hypot(dx,dy)-37.5>=worst:continue
    gap=pointseg(o['circle'][:2],pin,grip)-o['circle'][2]-37.5 if 'circle'in o else segpoly(pin,grip,rect(o['rect']))-37.5
    worst=min(worst,gap)
 assert body['planPass'] and all(c['planPass'] for c in crew) and min(separations.values())>0
 assert worst-movement>0 and min(heights)>=900 and max(heights)<=1120
 return {'coupledStates_mm':states,'body600':body,'body600Complete700StationControl':circlepath([s[0] for s in states],325,crewobs),'crew600':crew,'mutualClearanceBeyondRequired_mm':separations,'bar600':{'width_mm':25,'reserve_mm':25,'length_mm':1000,'pinRadius_mm':275,'pinZ_mm':160,'crewCentreToGrip_mm':105,'gripHeightRangeRequired_mm':[min(heights),max(heights)],'sampleMinimumPlanMargin_mm':worst,'maximumUnsampledMovementBound_mm':movement,'continuousPlanMarginLowerBound_mm':worst-movement,'dockDetachTransitionIndex':detach_index,'regrip':regrip_role}}

def buffer_carrier(obs,crewobs,states_override=None,detach_override=None):
 """One authored package: source-bound stock, continuous indoor plan, no physical admission."""
 src=json.loads((BASE.parent/'plant-room-buffer-carrier-sources.json').read_text());a=src['authoredCarrier'];n=src['nativeCaster'];states=states_override if states_override is not None else a['coupledStates_mm'];rho=8000
 assert n['swivelRadius_mm']==90 and n['offset_mm']==40 and src['nativeBuffer']['dryNet_kg']==34
 def stock(D,axis,L):
  plate=math.pi*(D/2000)**2*.008*rho;ring=2*math.pi*((D/2-15)/1000)*.04*.006*rho
  area=40*80-34*74
  mass={'plate':plate,'ring':ring,'crossbeams':2*area*L/1e9*rho,'casterPads':4*105*80*12/1e9*rho,'casterPods':4*(40**2-34**2)*88/1e9*rho,'fixedLegs':4*(25**2-19**2)*228/1e9*rho,'casters':4*n['massEach_kg'],'towbar':(25**2-21**2)*1000/1e9*rho,'hardwareStorageAllowance':3,'gripClevisAllowance':.5}
  m=sum(mass.values());inner=axis-n['offset_mm'];swivel=math.sqrt(2)*axis+n['swivelRadius_mm']
  # The native fork lane is165..260.5 from the common centre. Pod outer edge is axis+20.
  overlap=max(0,min(axis+20,260.5)-max(axis-20,165))
  I=(80*40**3-74*34**3)/12;span=2*axis;load=3000;Z=I/20
  return {'plateDiameter_mm':D,'casterAxesAbs_mm':axis,'stockMasses_kg':mass,'carrierCoarse_kg':m,'nativeDryPlusCarrier_kg':m+34,'nativeListedWaterFilledPlusCarrier_kg':m+135,'completeSwivelRadius_mm':swivel,'idealFourContactCentreSquareHalfWidth_mm':inner,'flatFloorFullTreadEdgeSensitivityHalfWidth_mm':axis-math.hypot(n['offset_mm'],n['wheelWidth_mm']/2),'supportModel':'Ideal flat-floor wheel-contact centres from native40offset, not guaranteed merely by four wheels touching. Actual tread/floor/contact positions and corner reactions must be bound.','requiredMeasuredCombinedCGOffsetMax_mm':25,'staticCGEdgeMarginIfFourContactsAndMeasuredCG_mm':inner-25,'casterPodOverlapWithNativeForkLane_mm':overlap,'nativeForkInside330Outside521Role':'Native configuration match, actual origin/tine/sweep/contact still unbound. No rating extrapolation or corner-reaction admission.','frameComponent3kNChallenge':{'span_mm':span,'I_mm4':I,'stress_MPa':load*span/4/Z,'deflection_mm':load*span**3/(48*193000*I)},'rating':'Unrated authored fabrication; native160kg caster is not a whole-carrier rating.135kg water-filled plus frame exceeds provisional150kg measured gross limit; actual drained residues/CG must be measured.'}
 controls=[stock(600,140,450),stock(700,180,550)]
 plan=coupled_plan(obs,crewobs,states,a['dockDetachTransitionIndex'] if detach_override is None else detach_override,a['towbarRegrip'])
 # One larger body control, not a silently altered600 transfer assembly.
 big=src['largerControl'];arc=[[9860+680*math.cos(math.radians(t)),4250+680*math.sin(math.radians(t))] for t in range(-55,16)]
 bigpath=[big['initialCentre_mm'],[10800,3097],[10550,3300],[10300,3600]]+arc+[[10700,4575],[12500,4575]]
 larger=circlepath(bigpath,375,{k:v for k,v in obs.items() if k!='buffer'});assert larger['planPass'] and controls[1]['casterPodOverlapWithNativeForkLane_mm']>0
 # Horizontal50N is an authored static challenge, not pull-force or stability certification.
 stability=[]
 for c in controls:
  H=c['idealFourContactCentreSquareHalfWidth_mm'];rows=[]
  for height in [900,1120]:
   rise=height-160;run=math.sqrt(1000**2-rise**2);up=rise/run
   lever=160+up*(275-H);W=c['nativeDryPlusCarrier_kg']*9.81
   rows.append({'gripHeight_mm':height,'upwardForcePerHorizontalForce':up,'overturnEquivalentLever_mm':lever,'dryAssemblyRestoringMoment_Nmm':W*(H-25),'horizontal50NChallengeMoment_Nmm':50*lever,'idealStaticHorizontalThreshold_N':W*(H-25)/lever})
  stability.append({'diameter_mm':c['plateDiameter_mm'],'idealContactCentreMeasuredCGConditional':rows})
 return {'status':'One actual-source authored carrier comparison; indoor plan only, no fabrication/handling/adoption approval','source':{'path':'project/mat/studies/plant-room-buffer-carrier-sources.json','sha256':hashlib.sha256((BASE.parent/'plant-room-buffer-carrier-sources.json').read_bytes()).hexdigest()},'nativeBuffer':src['nativeBuffer'],'nativeCaster':src['nativeCaster'],'stockControls':controls,'sameCaster700ExtraCoarseStock_kg':controls[1]['carrierCoarse_kg']-controls[0]['carrierCoarse_kg'],'conditionalStaticStability':stability,'unsignedTableRole':'Earlier conservative unsigned lever sensitivity, not exact signed r×F equilibrium. Use persistent signedFirstFlight for finite directional cases.',**plan,'larger700BodyOnly':larger,'decision':'Earlier convertible/East control retained; current coherentCandidate prefers persistent600 and front renewal.700 earns greater conditional stability and a body-only throat pass, but overlaps native fork lanes35mm and cannot inherit low-bar/ring clearance or the600 crew method. Price that changed transfer before preferring700; no new apparatus selected.','holds':['Carrier inflated path enters complete700×700 cylinder station170.12mm while clearing actual595 body; actual retained feet/valves/ports/pipes/support in that station domain must qualify','Native3foot bearing/contact geometry and captured pressure-body restraint remain unbound; no lifting by ports or wall-fixing assumption','Actual residual mass after drain, combined CG and four floor contacts must satisfy the stated measured conditions; caster rating does not prove stability','GL fork origin/tine thickness/full tool/crew and positive supported leg-to-caster conversion, dock/chocks, pins/welds/local plate and fixed storage remain unqualified','Actual native563mm buffer plus200mm lateral and150mm top/port access is not a drop-in650 station;101nominal does not prove100usable or hydraulic/glycol compatibility','Crew2 is a utility spotter, not an assumed shared manual lifting capacity; actual grip/force/stop procedure remains to qualify','Eastward plan continuation has no source-qualified level exterior receiver/crew stance or1800mm grade transfer; front folded route credit is not inherited','Known rubber/polyamide casters, native insulation/seals/finishes and lubricants remain explicit unapproved constituents; no tool exemption','W9 operator/GL method, actual riser tasks and ports/condensate/thermal/support joins remain open'],'admission':{'wholeRoomHandlingPass':False,'apparatusAccepted':False,'owningGeometryAdopted':False}}

def wall60_control(obs,crewobs,baseStates,cylinderPath,doorref,h):
 """One conditional whole-cell wall rewind; current-source geometry remains unchanged."""
 new=json.loads(json.dumps(obs));cn=json.loads(json.dumps(crewobs));states=json.loads(json.dumps(baseStates))
 for o in [new,cn]:
  for key in ['intermediate-west-pier','intermediate-east-pier','controls']:o[key]['rect'][1]+=60
 for i,state in enumerate(states):
  if i<=3:state[0][1]+=58
  if i==3:state[1][1]+=60
  elif i==4:state[0][1]+=60;state[1][1]+=60
  elif i==5:state[0][1]+=60
  if i>=8:state[1][1]+=60
 joined=buffer_carrier(new,cn,states)
 cp=[[9860,4250],[10500,4250],[10500,4600],[12500,4600]]
 # Put relocated buffer back for other tasks; closed/open leaf are real distinct states.
 new['buffer']={'circle':[11245.5,3155,300]}
 openobs={k:v for k,v in new.items() if k!='closed-leaf'};openobs['parked-leaf']={'rect':doorref['fullyOpenEastLeaf']}
 cylinder=circlepath(cp,425,{k:v for k,v in new.items() if k!='cylinder'})
 oldCylinder=circlepath(cylinderPath,425,{k:v for k,v in new.items() if k!='cylinder'})
 plant=circlepath(doorref['operatorCentrePath'],325,openobs)
 utility=circlepath([[10800,1725],[10610,2000],[10610,2900],[10550,3400],[10550,4250]],325,openobs)
 assert cylinder['planPass'] and not oldCylinder['planPass'] and plant['planPass'] and utility['planPass']
 upper=next(w for w in h['upperWalls'] if w['id']=='bed3-L-north');opening=next(w for w in h['archOpeningRegister']['GROUND'] if w['id']=='plant-replacement')
 core=[3690,3830];upperAxis=upper['a'][1];assert upperAxis==3700 and opening['width']==1400
 rise=opening['head']-opening['spring'];half=opening['width']/2;radius=(half**2+rise**2)/(2*rise)
 southExtrados=opening['centre']-half*(radius+opening['radialRingTrial'])/radius
 grid=immutable('project/str/studies/current-house-grid.json','56aca6f99f5fa60b21d58c89115ac1ee824e3828')['crossBeams']['plant-intermediate']
 raw=subprocess.check_output(['git','show','50093457642f65eca288e5cc233a77d8aac6bc29:project/str/studies/current-house-head-actions.py'],cwd=ROOT)
 assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()=='aef7fa4cad6e89fc09c47e55e071ad52da22b522'
 upperGross=3.170*(25*.140+.4)
 assert grid['a'][1]==3700 and grid['width']==600
 return {'status':'ONE conditional+60 north wall/arch comparison; no adopted native-clearance interpretation or source geometry','wallAxisY_mm':3760,'wallCoreY_mm':core,'wallFinishedFacesY_mm':[3663,3857],'southCellDepth_mm':3663-2647,'bufferCentre_mm':[11245.5,3155],'controlsRect_mm':new['controls']['rect'],'nativeClearanceConditional':{'conservativeDiameter_mm':563,'lateralEach_mm':200,'requiredLateralSpan_mm':963,'southCellExcess_mm':1016-963,'complete600SupportPlusBoth200_mm':1000,'complete600SupportEachSideSurplusBeyond200_mm':8,'southNorthSurplusBeyondEach200_mm':[3155-281.5-2647-200,3663-3155-281.5-200],'interpretation':'Native p7 gives200 laterally in an elevation and150 above, and independently requires water ports accessible. It does not expressly label a PORT axis or all-around scope. Rotation of that lateral plane into N/S remains a source/application hold; no waiver of200 anywhere its native scope requires.'},'sourceUpperWallAxisUnchangedY_mm':upperAxis,'upperLoadEccentricity_mm':3760-upperAxis,'coreMiddleThirdHalfWidth_mm':140/6,'upperLoadAxisInsideMovedCore_mm':upperAxis-core[0],'noTensionTriangularContactWidth_mm':3*(upperAxis-core[0]),'adverseRelativeSetoutToLoseCoreEdge_mm':upperAxis-core[0],'groundLinkSource':{'commit':'50093457642f65eca288e5cc233a77d8aac6bc29','path':'project/str/studies/current-house-grid.json','blob':'56aca6f99f5fa60b21d58c89115ac1ee824e3828','key':'crossBeams.plant-intermediate'},'upperGrossLoadSource':{'path':'project/str/studies/current-house-head-actions.py','blob':'aef7fa4cad6e89fc09c47e55e071ad52da22b522','role':'3.170m gross upper core25kN/m3×.140 plus.4kN/m2 combined face budget; characteristic upper bound, not guaranteed gravity or all load'},'grossUpperWallCharacteristic_kNpm':upperGross,'upperGrossWallOnly1p35ULS60Offset_kNmPm':1.35*upperGross*.06,'eastReplacementDoor':{'sourceKey':'model.archOpeningRegister.GROUND[plant-replacement]','rawWidth_mm':opening['width'],'rise_mm':rise,'radialRing_mm':opening['radialRingTrial'],'segmentalRadius_mm':radius,'southRadialExtradosExtremeY_mm':southExtrados,'oldCoreOverlap_mm':3770-southExtrados,'newCoreOverlap_mm':core[1]-southExtrados,'newAxisOverlap_mm':3760-southExtrados,'role':'Actual bounded annular-sector end projection; source radial ring/skewback/thrust/frame/capacity remain unadmitted, not a scaled image or extended full circle.'},'groundLinkYRetained_mm':[grid['a'][1]-grid['width']/2,grid['a'][1]+grid['width']/2],'groundLinkNorthReserveFromNewCore_mm':4000-core[1],'structuralRole':'RC200 offset transfer and actual perpendicular East1400 replacement-door skewback must be designed; do not shift upper wall or infer direct unreinforced centred bearing. Gross upperwall1.35ULS offset sensitivity is not RC transfer/slab or actual perpendicular skewback capacity.','bodyCrewBarPlan':{k:joined[k] for k in ['coupledStates_mm','body600','crew600','mutualClearanceBeyondRequired_mm','bar600','body600Complete700StationControl']},'larger700BodyOnly':joined['larger700BodyOnly'],'cylinder425RetainedOldPathNegative':oldCylinder,'cylinder425Revised4600Line':cylinder,'ordinaryPlantOpenLeaf':plant,'utilityCurvedOpenLeaf':utility,'decision':'The60 wall move conditionally makes room for the native lateral minimum, but changes structural offset/skewback and controls/renewal paths. Revised buffer/crew/bar and cylinder4600 indoor plan controls pass their declared domains; native-clearance scope, occupied cylinder-station geometry, W9 whole handling, riser task and exterior receiver remain open. No installed layout or material admission.'}

def persistent_carrier_and_grade(base,h):
 """Persistent caster base and finite signed first-flight equilibrium, not transport admission."""
 old=base['stockControls'][0];rho=8000
 pinMass=2*math.pi*6**2*150/1e9*rho
 dockDrops=2*(25**2-19**2)*178/1e9*rho
 boxMass=(2*220*80+2*220*30+2*80*30)*.8/1e9*rho
 mass=old['carrierCoarse_kg']-old['stockMasses_kg']['fixedLegs']+pinMass+boxMass+dockDrops
 # Two flush fixed receivers are NEW floor work; the removable pins are above.
 socket=2*(50*50*40-math.pi*7**2*40)/1e9*rho;plates=2*80*80*8/1e9*rho
 tubes=2*(25**2-21**2)*140/1e9*rho;rods=2*math.pi*6**2*300/1e9*rho
 H=old['flatFloorFullTreadEdgeSensitivityHalfWidth_mm'];theta=math.atan(1/20);g=9.80665
 ratio=math.sqrt(1000**2-610**2)/610;rows=[]
 for label,kg in [('native-dry-plus-persistent',34+mass),('provisional150-limit',150),('complete-listed-water-filled',135+mass)]:
  for ch in [600,1208,1876]:
   pmax=0;Tmax=0;Nmin=math.inf;worst=None
   for ax in [-25,25]:
    for a in [-25,25]:
     for y in [-3000,-6000,-10000]:
      floor=(y+1200)/20;v=[5250-5725,332.5-y,150-(floor+160)];length=math.sqrt(sum(z*z for z in v));ux,uy,uz=[z/length for z in v]
      us=-uy*math.cos(theta)-uz*math.sin(theta);un=-uy*math.sin(theta)+uz*math.cos(theta);W=kg*g
      T=(W*math.sin(theta)+50)/(-us)
      forces=[(ax,a,ch,0,W*math.sin(theta),-W*math.cos(theta)),(0,275,160,0,50,50*ratio),(-275,0,160,T*ux,T*us,T*un)]
      fn=sum(f[5] for f in forces);assert fn<0
      px=sum(x*n-z*fx for x,s,z,fx,fs,n in forces)/fn;ps=sum(s*n-z*fs for x,s,z,fx,fs,n in forces)/fn
      if max(abs(px),abs(ps))>pmax:pmax=max(abs(px),abs(ps));worst={'CGx_mm':ax,'CGdownhill_mm':a,'loadCentreY_mm':y,'resultantFloorCOP_mm':[px,ps]}
      Tmax=max(Tmax,T);Nmin=min(Nmin,-fn)
   rows.append({'massCase':label,'gross_kg':kg,'CGheightChallenge_mm':ch,'maxRequiredPrimaryTension_N':Tmax,'minimumNormalReaction_N':Nmin,'minimumEdgeMarginOfConditionalContactSquare_mm':H-pmax,'signedEquilibriumInsideConditionalSupport':pmax<H,'worst':worst,'rollingWithinProvisional150kg':kg<=150})
 assert all(r['signedEquilibriumInsideConditionalSupport'] and r['maxRequiredPrimaryTension_N']<150 for r in rows if r['CGheightChallenge_mm']==600)
 assert any(not r['signedEquilibriumInsideConditionalSupport'] for r in rows if r['CGheightChallenge_mm']==1876)
 grid=immutable('project/str/studies/current-house-grid.json','56aca6f99f5fa60b21d58c89115ac1ee824e3828')['girders']['outer-S'];assert grid['datum']==332.5 and grid['width']==700 and grid['z']==[-630,-180]
 T=.8*g;run=250;rise=330;bracelen=math.hypot(run,rise);area=40**2-34**2
 brace=T*bracelen/run;compression=T*rise/run
 sleeveArea=50**2-44**2;sleeveMass=2*sleeveArea*(180+bracelen*180/330)/1e9*rho;capMass=4*80*80*6/1e9*rho
 fixtures=2*(area*(330+bracelen)/1e9*rho)+4*100*100*8/1e9*rho+8*math.pi*6**2*300/1e9*rho+1+sleeveMass+capMass
 drops=[[-282.5,-87.5,25,25],[-282.5,62.5,25,25]]
 dropRadius=max(math.hypot(x,y) for rr in drops for x,y in rect(rr));casterGap=min(pointpoly([x,y],rect(rr))-90 for rr in drops for x,y in [[-140,-140],[-140,140],[140,-140],[140,140]])
 assert dropRadius<300 and casterGap>25
 return {'status':'Persistent native caster-bearing carrier is preferred to under-GL pod conversion; no installed/fabrication/transport acceptance','carrier_mm':{'plateDiameter':600,'plateTopHeight':276,'casterAxesAbs':140,'nativeFullSwivelRadius':90,'completeSwivelRadiusFromCarrierCentre':old['completeSwivelRadius_mm'],'retainedFootContactRequirement':'Native3feet, all retained vessel bosses/plugs/collars/fittings and capture/storage must actually fit the measured complete600 transport envelope; listed563casing alone is not that proof. Fixed hydraulic tails are isolated/drained/blanked and independently supported before release.'},'carrierCoarse_kg':mass,'nativeDryPlusCarrier_kg':34+mass,'completeListedWaterFilledPlusCarrier_kg':135+mass,'changesFromEarlierConvertible':{'earlierConversionAdmitted':False,'earlierConversionProblem':'Attaching/removing pods while GL alone holds load cannot be accepted as no-reaching-under-load. Persistent baseline removes those operations.','removedFixedLegs_kg':old['stockMasses_kg']['fixedLegs'],'addedTwo12mmLpins_kg':pinMass,'pinStraightLegs_mm':[90,60],'addedTwo178mmSHS25x25x3DockDrops_kg':dockDrops,'added220x80x30x0p8CaptiveBox_kg':boxMass,'role':'All four actual native casters remain attached before loading and throughout installed/renewal states. No reaching under a GL-held unit to fit/remove pods; initial native-foot/pallet-to-carrier bearing/capture remains its own unqualified first-installation duty.'},'installedDock':{'proposal':'Two accessible West-side removable positive docking pins, floor receivers flush/covered before rolling. No native caster brake. Independently held/tensioned restraint precedes final stop release; reconnect supported tails and recapture before restraint is removed. Not merely friction chocks.','frameLocalReceiverAxes_mm':[[-270,-75],[-270,75]],'dockEyeHeight_mm':50,'movingDockDropSHS_mm':[25,25,3,178],'dropOutsideRadius_mm':dropRadius,'dockDropToCompleteNativeCasterSweep_mm':casterGap,'floorReceiverAxesGlobal_mm':[[11245.5-270,3155-75],[11245.5-270,3155+75]],'stationaryPinHandleWestProjectionFromCentre_mm':330,'WestTaskCrewCentre_mm':[11245.5-655,3155],'movingPinStorage_mm':[220,80,30],'storageRole':'Two12mm pins with90/60 straight legs fit stacked in the authored0.8wall box before motion; exact bends/retention/access/welds remain to qualify. Installed handles are removed into that bounded box, not hidden outside the600 moving envelope.','floorSocketBlocks_mm':[50,50,40],'floorFaceplates_mm':[80,80,8],'M12RodLength_mm':300,'standOffSHS_mm':[25,25,2,140],'referenceRCtopBelowFinish_mm':180,'referenceRCdepth_mm':200,'coarseFixedFloorStock_kg':socket+plates+tubes+rods+.25,'idealMetalBridgeCoefficient_m':2*(math.pi*6**2/1e6/.18+(25**2-21**2)/1e6/.14),'atAuthoredConductivity15_WperK':2*(math.pi*6**2/1e6/.18+(25**2-21**2)/1e6/.14)*15,'hold':'NEW actual slab/cage/edge/stand-off/local floor support and air/thermal/water closure design; rods do not inherit anchorage from RC200. No fresh leakage budget or zero-leak joint. Flush cap wheel-load/impact and accessible actual pin/clevis/force procedure must qualify.'},'nativeWholeVessel':{'article':'Vaillant0010021456 / VPS R100/1M /0020244064_02','casingDrawingDiameterHeight_mm':[563,927],'appendixDiameterHeight_mm':[550,932],'nominalLitres':101,'requiredUsableLitres':100,'nativeNet_kg':34,'nativeWaterFilled_kg':135,'nativePorts':'Opposed G1.5 water ports and native plugs/seals/feet; all complete connection/tool/isolation/drain/body dimensions must bind, not a bare circle. Port heights230/390/550/710 are native drawing-line dimensions, not newly installed floor datums.','knownInsulation':'Expanded polypropylene named on native p9; manufacturer-linked RSK entry listsPUR. Exact layer/version/quantity remains unreconciled; both source roles unapproved. Native seals/cover/foot full constituents remain unknown.','clearance':'p7 lateral200/top150 plus port access retained. +60 cell leaves26.5each beyond200 for native563,8each for complete600; lateral-port-plane interpretation/application still conditional.','heightRole':'932+276=1208 listed stack is not an actual fitted-foot/ports maximum.1876=source1600 complete-body limit+276 is retained as a separate adverse geometric CG challenge.'},'signedFirstFlight':{'basis':'Four actual planar contacts and bounded contact/tread geometry; inner square±96.537 from140−hypot(40,17). Actual contacts/reactions/uneven floor still qualify. NO rotating feet or invented caster brake.','measuredCGCondition_mm':{'horizontalEachAxis':25,'height':600},'grade':'Actual authored first9mflight1:20; sample bodyY−3000/−6000/−10000. Smooth planar contact only, not thresholds/pitch/slosh/impact.','forceCases':'Gravity at both±25 CG offsets;50N downhill forebar with actual1m/990-spacing normal component; ONE uphill primaryline to5250/332.5/+150, frame captureeyeWest−275/0/+160. Solve along-grade equilibrium without helpful rolling resistance. Primary operating-tension comparison≤150N is authored/measured, not a native automatic force limiter.','formula':'COP_i=sum(r_i F_normal−height F_i)/sum(F_normal); signed complete resultant in floor coordinates, checked against both edges/axes. No addition of unsigned force moments as an exact mechanics claim.','rows':rows,'earlierUnsignedSensitivityRole':'Earlier lever-sum table remains an adverse unsigned comparison, not this signed r×F first-flight equilibrium.','noDrainChallenge':'Complete listed water-filled assembly exceeds150kg provisional rolling limit despite positive conditional600CG statics. No-drain/retained-fluid/unknown glycol-density transport is NOT admitted. Actual residual mass, full body/fittings and CG must be measured; no34kg-after-drain assumption.','negativeControl':'Without positive primary holding the unbraked wheels supply no downhill control; geometry/stationary tipping margin is not a brake.1876 high-CG challenge includes negative resultant-support cases.'},'authoredAnchorStation':{'source':{'path':'project/str/studies/current-house-grid.json','blob':'56aca6f99f5fa60b21d58c89115ac1ee824e3828','key':'girders.outer-S'},'existingBeam':grid,'proposedEyeXYZ_mm':[[5250,332.5,150],[5450,332.5,150]],'proposedRearFootY_mm':582.5,'footCentreToNorthBeamEdge_mm':100,'rakeRiseRun_mm':[330,250],'SHS_mm':[40,40,3],'eachNativeWLL_kN':T,'simultaneousTwoNativeWLL_kN':2*T,'idealFullWLLBraceAxial_kN':brace,'idealFullWLLUprightCompression_kN':compression,'idealRearToeSignedUplift_kN':compression,'idealFrontToeSignedCompression_kN':compression,'idealFullWLLBaseCouple_kNm':T*.330,'proposedRodXYZRows_mm':[[[x-25,y,-180],[x+25,y,-180]] for x in [5250,5450] for y in [332.5,582.5]],'removableStationReceivers':{'SHS_mm':[50,50,3],'uprightSleeveLength_mm':180,'braceSleeveLength_mm':bracelen*180/330,'fourFlushCaps_mm':[80,80,6],'coarseSleevesAndCaps_kg':sleeveMass+capMass,'idealPermanentReceiverBridgeCoefficient_m':2*sleeveArea/1e6*(1/.18+1/(bracelen/1000*180/330)),'atAuthoredConductivity15_WperK':2*sleeveArea/1e6*(1/.18+1/(bracelen/1000*180/330))*15,'role':'New source-bound cast-in receivers allow removal toflush covers when station is notinuse. Actual interlock/fixing/seals/edge/cage and access still require design; not hidden permanent projections in the protectedthreshold.'},'idealBraceStress_MPa':brace*1000/area,'idealUprightStress_MPa':compression*1000/area,'coarseTwoStationStock_kg':fixtures,'oneTU8MachineHandle20mOriginalRope_kg':8.4+1+20*.25,'twoTU8MachineHandle20mRopes_kg':2*(8.4+1+20*.25),'holds':'Actual door/threshold openingX5100..6900 contains these stations and rearfeet153mm behind inside finished face. New sealed floor receivers, signed uplift/moment at actual bolt rows, cage/edge breakout, simultaneous15.69kN and native machine/620handle/operator/rope fields all remain unqualified. NativeWLL anchor duty is not reduced to the small operating tension. Exact device/rigging capacities/fields are not supplied by this member stress arithmetic. Later landings need new source-bound redirects/anchors/supports; no guard/wall-friction/free house-grid credit.'},'ropeRearCrewFirstFlight':{'ropeDiameter_mm':8.3,'unoffsetCentreX_mm':6000,'proposedOffsetCentreX_mm':6080,'worstLongFlightY_mm':-10000,'primaryRopeXAtRearCrew_mm':5250+(5725-5250)*((-10000+990-332.5)/(-10000-332.5)),'unoffsetInflatedMargin_mm':6000-(5250+(5725-5250)*((-10000+990-332.5)/(-10000-332.5)))-300-25-8.3/2,'offsetInflatedMargin_mm':6080-(5250+(5725-5250)*((-10000+990-332.5)/(-10000-332.5)))-300-25-8.3/2,'role':'The centreline rearcrew conflicts with the low primaryrope;80mm left-normal offset is independently included in the whole folded plan. Actual station/handle/rope/other people and later-flight layouts still qualify.'},'independentCapture':'The positive result is primary static holding only. An independently qualified constant-tension failure-capture and loaded handover are still required; two taut TU8 lines are NOT automatically qualified redundancy and slack impact capture is not native approved. Extra hoist/operators/rope/attachment/field/material burdens must be priced.','admission':{'installedDockAccepted':False,'wholeCarrierRated':False,'wholeTransportAccepted':False}}

def front_renewal_control(h,wallcase,obs,crewobs,basecarrier):
 """Matched600 package through real Plant/front topology, not the old850 method."""
 source=json.loads((BASE.parent/'plant-room-buffer-carrier-sources.json').read_text())
 o=json.loads(json.dumps(obs))
 for key in ['intermediate-west-pier','intermediate-east-pier','controls']:o[key]['rect'][1]+=60
 o.pop('closed-leaf',None);o.pop('buffer',None);o['parked-leaf']={'rect':h['plantReferenceDoor']['fullyOpenEastLeaf']}
 replaced={'plant-primary-buffer-round-bounding600','plant-controls','service-emitter-plant-N'}
 for key,value in h['groundFurniture'].items():
  if key not in replaced:o['retained-'+key]={'rect':value}
 # Conservative hall/WC and a REQUIRED central1000 front clear budget. Raw1800
 # is not actual frame/leaf clear; the doorset/threshold admission remains open.
 o.update({'hall-west':{'rect':[0,0,4897,4110]},'wc-closed-territory':{'rect':[7103,0,2200,2747]},'hall-north':{'rect':[4897,4110,2206,500]},'front-required-clear-west':{'rect':[0,-100,5500,530]},'front-required-clear-east':{'rect':[6500,-100,5500,530]}})
 co={**o,'complete-cylinder-station':{'rect':[9510,3900,700,700]}}
 states=[];second=[10550,4325];norm=math.hypot(1050,25);u=[-1050/norm,25/norm]
 def add(b,c,d):states.append([list(b),list(c),list(d)])
 for b in [[11245.5,3155],[10195.5,3180]]:add(b,[b[z]+1050*u[z] for z in range(2)],second)
 for i in range(1,11):
  t=math.atan2(25,-1050)+(math.pi-math.atan2(25,-1050))*i/10;b=[10195.5,3180];add(b,[b[0]+1050*math.cos(t),b[1]+1050*math.sin(t)],second)
 add([9800,3180],[8750,3180],second)
 for d in [[10550,3900],[10550,3400],[10550,3180]]:add([9800,3180],[8750,3180],d)
 add([9500,3180],[8450,3180],[10550,3180]);add([6300,3180],[5250,3180],[7350,3180]);add([6300,2700],[5250,2700],[7350,3180])
 for i in range(1,91):
  t=math.pi+math.pi/2*i/90;add([6300,2700],[6300+1050*math.cos(t),2700+1050*math.sin(t)],[7350,3180])
 for b,c,d in [([6000,2700],[6000,1650],[7350,3180]),([6000,2400],[6000,1350],[7350,3180]),([6000,2400],[6000,1350],[6300,3180]),([6000,2400],[6000,1350],[6000,3180]),([6000,2130],[6000,1080],[6000,3180]),([6000,0],[6000,-1050],[6000,1050])]:add(b,c,d)
 joined=coupled_plan(o,co,states,-1,'Receiver/captured unit yaw with fixed-radius pin; supported pauses/regrip are real duties, not a circumferential sliding eye or steering-force proof. All bar segments checked.')
 assert joined['body600Complete700StationControl']['planPass']
 folded=buffer_folded_control(h['gardenFailureBypass']['frontApproach'])
 persistent=persistent_carrier_and_grade(basecarrier,h);dry=persistent['nativeDryPlusCarrier_kg'];g=9.80665;sin=1/math.sqrt(401)
 return {'status':'Best current BUFFER renewal direction: genuine600 carrier through Plant/front; no whole handling/adoption','room':{k:joined[k] for k in ['coupledStates_mm','body600','crew600','mutualClearanceBeyondRequired_mm','bar600','body600Complete700StationControl']},'actualPlantEffectiveOpenClear_mm':h['plantReferenceDoor']['effectiveOpenClearWidth'],'old850ApparatusStillRejected':850>h['plantReferenceDoor']['effectiveOpenClearWidth'],'requiredFrontClear_mm':1000,'actualRawFrontWidth_mm':next(x for x in h['openings']['GROUND'] if x['id']=='front-door')['width'],'doorStates':'Plant leaf fully parked OPEN; guestWC conservatively CLOSED across whole wall; other crossdoors retained. Front both leaves OPEN with1000 required central budget, not an actual doorset clear/threshold result.','timing':'Secondcrew waits10550/4325 until body9800/3180, then walks South at10550. Wait7350/3180 during firstcrew hall turn. Enter6000/3180 only AFTER body reaches2400 (not earlier than2560 for625 separation).','barAndFrameYaw':'One fixed-radius low pin and hinged1m bar, not a free circumferential eye. Circular carrier/captured native tank yaw with the forecrew-facing radius during turns; full caster sweep remains inside600. Actual steering forces, retained fittings, capture/yaw control and supported pauses must qualify; plan kinematics alone do not prove steering.','frontFolded':folded,'persistentCarrierAndGrade':persistent,'matchedMassCaptureDuty':{'coarseNativeDryPlusCarrier_kg':dry,'provisionalMeasuredGrossLimit_kg':150,'oneIn20GravityOnlyDry_N':dry*g*sin,'oneIn20GravityOnly150kg_N':150*g*sin,'flatStaticHorizontal50NRole':'Authored flat-floor challenge does not cover full150kg slope gravity, rolling resistance, transition, braking or impact.','nativeTU8WLLAnchorEach_kN':.8*g,'nativeTU8RedirectResultantUpper_kN':2*.8*g,'captureRole':'Unbraked TENTE caster has no slope hold. Develop constant tension/independent capture and actual station anchorage, redirects and carrier low tether/captured pressure-body loadpath to native winch WLL; do not downrate by gravity alone or lift/attach by ports. Existing3kN frame-component calculation is not this7.845kN capture chain or installed floor rating.'},'decision':'Prefer the persistent600 carrier and this front method to the earlier East export: it preserves complete700 cylinder station and avoids a new East receiver for BUFFER. It uses current authored folded-front geometry with its own two-crew/bar proof, not old cart handling credit. W9 still has its own unresolved operator/riser/East-or-front method. Conditional+60 structural/native side clearance, actual feet/ports/usable100L/CG/material and loaded capture remain open.','admission':{'wholeHandlingPass':False,'apparatusAccepted':False,'owningGeometryAdopted':False}}

def buffer_folded_control(front):
 # Disjoint rectangle clipping follows the established folded study's proof
 # boundary; this matched circular package/two-crew/bar are tested independently.
 def area(p):return abs(sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2) if p else 0
 def clip(p,axis,value,sign):
  out=[]
  if not p:return out
  a=p[-1];ia=sign*(a[axis]-value)>=-1e-8
  for b in p:
   ib=sign*(b[axis]-value)>=-1e-8
   if ia!=ib:
    t=(value-a[axis])/(b[axis]-a[axis]);out.append([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])
   if ib:out.append(b)
   a,ia=b,ib
  return out
 def covered(p,rs):
  total=0
  for x0,y0,x1,y1 in rs:
   q=p
   for axis,v,sg in [(0,x0,1),(0,x1,-1),(1,y0,1),(1,y1,-1)]:q=clip(q,axis,v,sg)
   total+=area(q)
  return total>=area(p)-.001
 def circle(p,r,n=32):
  r/=math.cos(math.pi/n)
  return [[p[0]+r*math.cos(2*math.pi*i/n),p[1]+r*math.sin(2*math.pi*i/n)] for i in range(n)]
 def curve(s):
  if s<=1600:return [2100,2800-s]
  if s<1600+math.pi*750:
   t=(s-1600)/750;return [1350+750*math.cos(t),1200-750*math.sin(t)]
  return [600,1200+s-1600-math.pi*750]
 assert len(front['ramps'])==4 and len(front['landings'])==5 and all(r['slope']==20 and r['plan'][2:]==[1200,9000] for r in front['ramps'])
 rects=[(x,y,x+w,y+hh) for x,y,w,hh in [x['plan'] for x in front['ramps']+front['landings']]]
 for i,a in enumerate(rects):
  for b in rects[i+1:]:assert min(a[2],b[2])<=max(a[0],b[0]) or min(a[3],b[3])<=max(a[1],b[1])
 transforms=[]
 for i in [1,2,3]:
  x,y,w,hh=front['landings'][i]['plan'];assert [w,hh]==[2700,1200];reflect=i==2;transforms.append({'landing':i,'originXY':[x,y+hh if reflect else y],'reflectY':reflect})
 def rear(s):
  p=curve(s-990);v=s-990
  if v<=1600:n=[1,0]
  elif v<1600+math.pi*750:t=(v-1600)/750;n=[math.cos(t),-math.sin(t)]
  else:n=[-1,0]
  return [p[k]+80*n[k] for k in range(2)]
 length=3200+math.pi*750;count=math.ceil(length/5);chord=1500*math.sin(990/1500);mutual=math.inf;rearBody=math.inf;rearSpeed=1+80/750
 for i in range(count+1):
  s=length*i/count;b=curve(s);c=curve(s+990);rp=rear(s);d=math.dist(b,c);assert d>=chord-1e-6
  mutual=min(mutual,math.dist(c,rp));rearBody=min(rearBody,math.dist(b,rp));u=[(c[k]-b[k])/d for k in range(2)];pin=[b[k]+275*u[k] for k in range(2)];grip=[c[k]-105*u[k] for k in range(2)]
  shapes=[circle(p,350) for p in [b,c,rp]]+[hull(circle(pin,62.5,16)+circle(grip,62.5,16))]
  for t in transforms:
   mapped=[[[t['originXY'][0]+x,t['originXY'][1]+(-y if t['reflectY'] else y)] for x,y in p] for p in shapes]
   assert all(covered(p,rects) for p in mapped)
 # Centre paths are unit-speed; relative vector derivative<=2. Conservative
 # normalised-vector Lipschitz bound4/chord gives the complete bar endpoint bound.
 halfStep=length/count/2;speed=1+275*4/chord;movement=speed*halfStep;reserve=50-movement
 assert reserve>25 and chord-2*halfStep>625 and mutual-(1+rearSpeed)*halfStep>650 and rearBody-(1+rearSpeed)*halfStep>625
 return {'sourceKey':'model.gardenFailureBypass.frontApproach','actualRouteTravelXYZ_mm':sum(math.dist(a,b) for a,b in zip(front['route'],front['route'][1:])),'turnCentrelineRadius_mm':750,'localLanding_mm':[2700,1200],'localCurveCentre_mm':[1350,1200],'localCurveEndpoints_mm':[[2100,2800],[600,2800]],'crewLeadRearAlongPath_mm':990,'bodyDiameter_mm':600,'crewDiameterEach_mm':600,'barWidth_mm':25,'barLength_mm':1000,'fixedRadiusPin_mm':275,'crewGripOffset_mm':105,'inflationAtSamples_mm':50,'circumscribedCirclePolygons':True,'poseCountEachOfThreeTurns':count+1,'maximumCentrelineSampleStep_mm':length/count,'completeBarEndpointSpeedBoundPerCentrelineSpeed':speed,'nearestSampleFullShapeMovementBound_mm':movement,'continuousRawPlanReserveLowerBound_mm':reserve,'bodyCrewDistanceAnalyticLowerBound_mm':chord,'crewCrewDistanceSampleMinimum_mm':mutual,'crewCrewConservativeContinuousDistanceLower_mm':mutual-(1+rearSpeed)*halfStep,'rearBodyConservativeContinuousDistanceLower_mm':rearBody-(1+rearSpeed)*halfStep,'rearCrewLeftNormalOffset_mm':80,'bodyCrewConservativeContinuousDistanceLower_mm':chord-2*halfStep,'previewStates_mm':[[curve(length*t),curve(length*t+990),rear(length*t)] for t in [0,.25,.5,.75,1]],'requiredGripHeightIncludingWorst1in20FloorDifference_mm':[160+math.sqrt(1000**2-(990-380)**2)-49.5,160+math.sqrt(1000**2-(chord-380)**2)+49.5],'actualLandingTransforms':transforms,'role':'Own complete600 body/two600crew/25bar plan check on actual disjoint clear rectangles; straight flights share those1200 clear lanes. Does not prove wheel contacts/tilt/transition/force/steering/braking/anchor/capture or actual built ramp/doorset support or final toe/setdown/crew field beyond the source route endpoint. Historical42m budget is not this45.945m route.'}

def native_installation_join(h,obs,basecarrier):
 """One actual matched native sequence with explicit first configuration hold."""
 src=json.loads((BASE.parent/'plant-room-buffer-carrier-sources.json').read_text());o=json.loads(json.dumps(obs))
 for key in ['intermediate-west-pier','intermediate-east-pier','controls']:o[key]['rect'][1]+=60
 o['buffer']={'circle':[11245.5,3155,300]};o['complete-cylinder-station']={'rect':[9510,3900,700,700]}
 for y in [3080,3230]:o['installed-dock-handle-'+str(y)]={'rect':[10915.5,y-6,60,12]}
 tasks={key:circlepath([p,p],325,o) for key,p in [('North-return-IN',[10625,3415]),('South-return-OUT',[10615,2940]),('West-dock',[10590.5,3155])]}
 assert all(t['planPass'] for t in tasks.values())
 # These are explicitly authored NEW internal-arch dimensions. Selected HAD only
 # supplies plan span; do not copy the exterior1400 opening's authority.
 span=1275;rise=300;head=2850;finish=27;ring=215;R=((span/2)**2+rise**2)/(2*rise);cz=head-R;cx=(9650+10925)/2;Rf=R-finish
 pipes=[]
 for x in [10590,10750]:
  margin=Rf-math.hypot(x-cx,2400-cz)-67
  pipes.append({'centreXZ_mm':[x,2400],'fullJacketDiameter_mm':84,'additionalChallenge_mm':25,'finishedArchRadialMarginAfter67_mm':margin,'finishedJambPlanReserveAfter67_mm':min(x-9677,10898-x)-67})
 assert min(p['finishedArchRadialMarginAfter67_mm'] for p in pipes)>0
 # Only nominal casing-plane points. Native bosses/unions/tools and fitted-foot
 # vertical references are NOT silently assigned these coordinates.
 nominalPorts={'North-return-IN':[11245.5,3436.5,710],'South-return-OUT':[11245.5,2873.5,230]}
 reaches={k:math.dist(tasks[k]['polyline_mm'][0],v[:2]) for k,v in nominalPorts.items()}
 assert max(reaches.values())<700
 return {'status':'ONE persistent-carrier/native-case3 sequence; source proposal, no first-installation or operation acceptance','nativeSource':{'url':src['nativeBuffer']['url'],'sha256':src['nativeBuffer']['sha256'],'edition':src['nativeBuffer']['edition'],'pages':'p7dimensions/lateral/top;p8palletfloorinstallation;p9feet/port/EPP;p10case3;p11purge/drain'},'sourceRegister':src['matchedRegister'],'nativeHydraulicMode':'CASE3 seriesreturn. Heatpump supply directly feeds PRIMARY plateHX loop; its return enters upperright bufferport and lowerleft goes toHPreturn. Sixunusedwaterports retain nativeplugs/seals. Secondaryradiatorwater acrossplateHX is not borrowed. ActualHPflow/pressure/control/glycol/100usable and valve states still qualify.','orientationProposal':'NativeleftfaceSOUTH,rightfaceNORTH. Lateral200 minimum plane/application staysconditional. Both200 minima and port access retained; not an all-around waiver.','nominalCasingPlanePortPointsXYZ_mm':nominalPorts,'portPointRole':'Z230/710 are native drawing-line heights, NOT installed floorZ; addactualnativefeet/base and276carrier after binding. XY are casing-plane references, not native full boss/union/tool envelope.','portTaskPlanReferences':tasks,'planReachFromCrewCentreToNominalPort_mm':reaches,'reachRole':'Authored700mm plan comparison only. Actual standing/low-port stance, height, arm/tool/union rotation, pressure/temperature and visibility must qualify; no universal person reach claim.','authoredFixedWarmRoutes':{'fullJacketControl_mm':84,'centresThroughOpeningX_mm':[10590,10750],'centreZ_mm':2400,'routeNorthReturn':[[11245.5,3436.5,'native port height unbound'],[11245.5,3500,2400],[10750,3500,2400],[10750,4000,2400],[10920.5,4000,2400]],'routeSouthReturn':[[11245.5,2873.5,'native port height unbound'],[11245.5,2800,2400],[10590,2800,2400],[10590,4000,2400]],'role':'New supported fixed-tail route proposal, not chosenpipeID/nativefittings/flow or actualcontrols/HP terminal join. Rise atport-side territory before crossingwest so low pipes do not occupy the task body. Independent supports and demountable unions, no masonrypier drilling.','support':'Actual wall/RC support receivers, load/thermal/movement and all pipe/insulation/union/clip constituents remain unqualified; neither vessel nor removable carrier is fixed-pipe support.'},'explicitNewInteriorArchSectionTrial':{'selectedHADRole':'Onlyraw9650..10925 plan opening owned. This is a NEW authored internal section, not imported exterior arch geometry.','rawSpan_mm':span,'authoredSpring_mm':2550,'authoredHead_mm':head,'authoredRadialRing_mm':ring,'authoredRadialFinish_mm':finish,'rawRadius_mm':R,'centreXZ_mm':[cx,cz],'finishedRadius_mm':Rf,'rawOuterCrown_mm':head+ring,'toSourceRCsoffit3170_mm':3170-head-ring,'pipeChecks':pipes,'structuralHold':'Newinternaljamb/thrust/loadpath,105crownreserve,+60 upperwallbearingoffset and exteriorEastdoorjoint still needSTR/HAD review beforeadoption; no selected intrados or pipe-bearing credit.'},'sequence':[{'stage':'Configure before fabrication','action':'Bind exact full nativefeet/bosses/plugs/height, pallet fixing thread/engagement/bearing and allowable transport/restraint loads. Preserve nativefeet/casing/pressurebody; do not lift byports or restrain EPP as structure.','admitted':False,'firstHardHold':'NativeIOM establishes palletfixing exists but gives no dimensioned/qualified carrier-transfer/capture interface. No inferred M10 or clamp rating.'},{'stage':'Initial native delivery and carrier loading','action':'Retain actual factory pallet restraint until a positively supported, matched transfer onto the already-complete caster carrier is established. IOMhorizontal/pallet/threefeet sequence is source evidence, not approval of a custom74kg combined tilt or under-load GL pod work.','admitted':False,'hold':'Package655×605×1140 is a separate first-installation envelope; gross/bearing/GL/device/operator/transfer not earned by the600 renewal proof.'},{'stage':'Dock before filling','action':'Position full assembly at11245.5/3155. Engage both accessible positive stops/flush floorreceivers and demonstrate fullwet staticcaster/frame/floor/anchor loads before connecting/filling. Retain no nativecasterbrake assumption.','admitted':False,'hold':'ActualRC200cage/stand-offs/floor finish point loads, dock pin/drop/weld and completeair/water/thermal interfaces unqualified.'},{'stage':'Connect and commission native case3','action':'Independently support both fixedtails before matching demountable nativeport unions. Preserve nativepurge, pressure/flow and thermal/control protections; prove100usable always-connected primaryvolume and native orientation/access before ordinary operation.','admitted':False,'hold':'101nominal is not100usable. Exact thread/seal/union/flow and fullnativeport/insulation/EPP/PUR source roles not solved.'},{'stage':'First renewal release while still docked','action':'Shut down/isolate the actual heat/primaryfluid system, cool/depressurise and support/counterhold both tails before disconnecting. Native§9 uses thelowest waterconnection; size actualcapture for measuredisolatedinventory (101L nominal vessel comparison plus tails/tolerance) if completeemptying is attempted, and verify residual mass/CG. Retain completewet/no-drain challenge.','admitted':False,'hold':'Actual receiver/container/drain route, fluid density/residual pocket and permissible port disconnection remain unqualified; no floor drain/outfall borrowed.'},{'stage':'Transfer from fixed dock to movement restraint','action':'Establish independent positive capture before releasing the final stop; remove/stow both handles into boundedbox and close floorreceivers flush. Keep persistentcasters/pressurebody supported throughout.','admitted':False,'hold':'Primary signedholding is not an independently qualified failure-capture. Actual nativehook/pin/rope/620handle/operator/door/threshold and floor sockets must earn the handover.'},{'stage':'Front route and reverse restoration','action':'Use the exact shallowtwo-crew Plant/front sequence and ownfolded geometry proof only after the actual loading/capture/grade conditions pass. Atreturn recapture positive floor dock before removing travelrestraint; reconnect independently supportedtails and restore nativepurge/leak/flow/control duties.','admitted':False,'hold':'No generichandlingpass fromplan clearances; finaltoe/landing/grade/site and allsource physical/mass/material duties remain.'}],'decision':'Freeze this as a bounded coherent persistent-carrier/room/native-installation comparison once reviewed. Native capture/firstinstallation and realfloor/rigging/port/control qualification are explicit before fabrication/owning adoption, not hidden complete states.'}

def produce():
 hp='project/had/studies/water-replan.json';sp='project/mat/studies/whole-house-service-baseline.json'
 h=immutable(hp,'089f0dac2f2e89272dc2ea85a10c2208f2fd797d')['model'];s=immutable(sp,'049161ebac29b24e0acc7d8085302fca906fe9d2')
 current=json.loads((ROOT/hp).read_text())['model'];assert current['gardenFailureBypass']['frontApproach']==h['gardenFailureBypass']['frontApproach'];assert all(current[k]==h[k] for k in ['groundWalls','groundFurniture','plantReferenceDoor','utilityDisposition','servicesInterface','upperWalls','archOpeningRegister'])
 p=s['plant'];u=s['rewinds']['utility'];finish=h['finishRewind']['dry']['total'];assert finish==27
 uw=next(w for w in h['groundWalls'] if w['id']=='utility-north');iw=next(w for w in h['groundWalls'] if w['id']=='plant-intermediate-arch')
 uj=[uw['holes'][0][0]+finish,uw['holes'][0][1]-finish];ij=[iw['holes'][0][0]+finish,iw['holes'][0][1]-finish]
 south=uw['finishedFaces'][1];north=5780.5;west=9397;east=11570.5;door=[v+finish*(1 if i==0 else -1) for i,v in enumerate(p['cylinder']['doorRaw'])]
 doorref=h['plantReferenceDoor'];op=doorref['effectiveOpenClearY'];leaf=doorref['fullyOpenEastLeaf']
 fixed={'cylinder':{'circle':[9860,4250,297.5]},'riser':{'rect':p['riserGross']},'controls':{'rect':[10920.5,3797,650,300]},'emitter':{'rect':[9727,2647,550,200]},'buffer':{'circle':[11245.5,3097,300]},'W9':{'rect':[10400,5147,1006,597]}}
 walls={'utility-west-pier':{'rect':[west,uw['finishedFaces'][0],uj[0]-west,uw['t']]},'utility-east-pier':{'rect':[uj[1],uw['finishedFaces'][0],east-uj[1],uw['t']]},'intermediate-west-pier':{'rect':[west,iw['finishedFaces'][0],ij[0]-west,iw['t']]},'intermediate-east-pier':{'rect':[ij[1],iw['finishedFaces'][0],east-ij[1],iw['t']]},'north-wall':{'rect':[west,north,east-west,520]},'east-south':{'rect':[east,0,500,door[0]]},'east-north':{'rect':[east,door[1],500,6300-door[1]]},'west-south':{'rect':[9203,0,194,op[0]]},'west-north':{'rect':[9203,op[1],194,6300-op[1]]}}
 utility={k:{'rect':v} for k,v in h['groundFurniture'].items() if k.startswith('service-utility-') or k=='service-emitter-utility-E'}
 openobs={**walls,**utility,**fixed,'parked-leaf':{'rect':leaf}}
 hinge=doorref['northHingeReference'];closedobs={**walls,**utility,**fixed,'closed-leaf':{'rect':[hinge[0]-22,hinge[1]-762,44,762]}}
 def obs(mode='open',exclude=()):return {k:v for k,v in (openobs if mode=='open' else closedobs).items() if k not in exclude}
 bw=fixed['W9']['rect'];R=325;minimum_old=10683+math.sqrt(R*R-25*25)
 locals=[{'id':'existing-south-host','rawUtilityX':uw['holes'][0],'finishedUtilityX':uj,'maximumCentreX_mm':uj[1]-R,'minimumCentreX_mm':minimum_old,'planPass':False},
 {'id':'W9-west200','body':[9477,2672,1006,597],'frontField':[9477,3269,1006,600],'westPierOverlap_mm':[200,194],'openLeafFrontOverlap_mm':[682,44],'planPass':False},
 {'id':'utility-east200-only','rawUtilityX':[10450,11350],'finishedUtilityX':[10477,11323],'maximumCentreX_mm':11323-R,'minimumCentreX_mm':minimum_old,'stillShort_mm':minimum_old-(11323-R),'planPass':False},
 {'id':'north-emitter-only','body':[10540,4397,1006,597],'cylinderWorkingOverlap_mm':[570,328],'cylinderBuffer425ExitBlocked':True,'planPass':False}]
 tasks={'plant-entry':circlepath(doorref['operatorCentrePath'],325,obs()),'utility-curved-entry':circlepath([[10800,1725],[10610,2000],[10610,2900],[10550,3400],[10550,4250]],325,obs()),'buffer-west-service':circlepath([[10620.5,3097],[10620.5,3097]],300,obs()),'controls-north-service':circlepath([[11245.5,4422],[11245.5,4422]],300,obs()),'emitter-routine':circlepath([[10002,3172],[10002,3172]],300,obs()),'emitter-pulled-closed-door':circlepath([[10002,3322],[10002,3322]],300,obs('closed'))}
 bp=[[11245.5,3097],[10800,3097],[10580,3250],[10425,3400],[10425,4250],[10500,4575],[12500,4575]]
 buffer=circlepath(bp,425,obs('closed',('buffer',)))
 cylinder=circlepath(p['cylinder']['replacementCentrePath'],425,obs(exclude=('cylinder',)))
 cp=[[10903,5445.5],[10903,4575],[12500,4575]];carrier=cartpath(cp,obs(exclude=('W9',)))
 crew=circlepath([[x-403,y-629.5] for x,y in cp],325,obs(exclude=('W9',)))
 crew_station=circlepath([[x-403,y-629.5] for x,y in cp],300,{**obs(exclude=('W9',)),'complete-cylinder-station':{'rect':p['cylinder']['station']}})
 throat=math.hypot(10898-9860,3797-4250)-297.5
 assert throat<850 and buffer['allMargins_mm']['east-south']<0
 rad=fixed['emitter']['rect'];sweepgap=math.hypot(rad[0]-hinge[0],hinge[1]-(rad[1]+rad[3]))-math.hypot(762,22)
 assert locals[2]['stillShort_mm']>0 and locals[1]['westPierOverlap_mm'][0]>0
 assert not crew['planPass'] # do not silently promote a body-only cart route
 carrierCase=buffer_carrier(obs('closed',('buffer',)),{**obs('closed',('buffer',)),'complete-cylinder-station':{'rect':p['cylinder']['station']}})
 wallcase=wall60_control(obs('closed',('buffer',)),{**obs('closed',('buffer',)),'complete-cylinder-station':{'rect':p['cylinder']['station']}},json.loads((BASE.parent/'plant-room-buffer-carrier-sources.json').read_text())['authoredCarrier']['coupledStates_mm'],p['cylinder']['replacementCentrePath'],doorref,h)
 frontcase=front_renewal_control(h,wallcase,obs('closed',('buffer',)),{**obs('closed',('buffer',)),'complete-cylinder-station':{'rect':p['cylinder']['station']}},carrierCase)
 return {'status':'Whole-room comparison in development; current HAD/Services unchanged; no geometry/apparatus/handling adoption','sourceCommit':'50093457642f65eca288e5cc233a77d8aac6bc29','sources':{'HAD':{'path':hp,'blob':'089f0dac2f2e89272dc2ea85a10c2208f2fd797d'},'Services':{'path':sp,'blob':'049161ebac29b24e0acc7d8085302fca906fe9d2'}},'sourceRoles':{'utilityRawX':uw['holes'][0],'utilityFinishedX':uj,'intermediateFinishedX':ij,'eastArchitecturalFinishedMouthY':door,'eastDoorsetMinimumRequiredClear_mm':1000,'note':'Architectural finished mouth is not actual installed doorset clear. Retain1000 minimum and full native frame/leaf/threshold/closer/source qualification.425 is the retained complete cart/apparatus circle including its25mm allowance, not a mandatory shape for every possible actual handling method.'},'rejectedLocalControls':locals,'proposal':{'W9':bw,'W9FrontSouth600':[10400,4547,1006,600],'bufferStation':[10920.5,2772,650,650],'bufferMaximumRoundBody_mm':600,'bufferUsableAlwaysConnectedLitres':100,'bufferPortFace':'WEST proposed; actual native ports/isolation/drain/support and usable volume unqualified','controls':fixed['controls']['rect'],'controlsFront':'NORTH','emitter':fixed['emitter']['rect'],'cylinderBodyUnchanged':p['cylinder']['body'],'cylinderWorkingEast':[10210,4097,900,700],'riserUnchanged':p['riserGross'],'permanentBodies':fixed,'emitterToFullReferenceLeafSweep_mm':sweepgap,'emitterSweepRole':'Exact reference quarter-disc outer radius; ~20mm remains, not25 and not classified-kit/trim/closer or fixing approval.'},'bufferActualCarrierComparison':carrierCase,'wallNorth60Control':wallcase,'bufferFrontRenewal':frontcase,'nativeInstallationJoin':native_installation_join(h,obs('closed',('buffer',)),carrierCase),'coherentCandidate':{'status':'ONE current development comparison, not owning geometry','intermediateWallAxisY_mm':3760,'intermediateFinishedFacesY_mm':[3663,3857],'W9BodyFrontSouth':bw,'W9Front600':[10400,4547,1006,600],'bufferCentre_mm':[11245.5,3155],'bufferMovingPackageCondition_mm':600,'bufferPersistentPlateTop_mm':276,'bufferRenewal':'Actual Plant door then FRONT folded route; old425/East and under-GL pod conversion retained only as rejected controls','controls':wallcase['controlsRect_mm'],'emitter':fixed['emitter']['rect'],'cylinderStation':p['cylinder']['station'],'cylinderWorkingEast':[10210,4097,900,700],'cylinder425ExportLineY_mm':4600,'riser':p['riserGross'],'nativeSideClearanceRole':wallcase['nativeClearanceConditional'],'structuralRole':wallcase['structuralRole'],'stillOpen':['Emitter reference leaf sweep only19.72mm, not25/actualkit','W9 actual crew/GL lift/cart and independent condensate/ports/floor join','Riser230mm actual task in450mm gap, no600-body access proof','Native full buffer feet/ports/100usable, dock/floor and material policy','Primary finite first-flight holding is not independent failure capture or whole ramp/door/rigging/crew admission'],'owningGeometryAdopted':False},'taskComparisons':tasks,'buffer425RenewalClosedDoor':buffer,'unchangedCylinderPierPhysicalThroat_mm':throat,'cylinder425Renewal':cylinder,'W9CarrierBodyOnly':carrier,'W9AuthoredCrewFirstAttempt':crew,'W9Crew300Complete700StationControl':crew_station,'decision':'Retain this one whole-room candidate for joined development. Local south-host/arch-only and emitter-only north controls fail. No layout adopted: finish full buffer/crew supported method and W9 operator regrip/exit, native GL/cart datum/CG/support, ports/duct/condensate and moved hydraulic thermal/support consequences before source adoption.','unearned':['Actual W9 cart operator regrip/exit and whole-tool lift/setdown; a cart-body sweep is not whole handling','Actual supported buffer transfer/capture/CG and retained complete700 station qualification;600 crew/bar indoor plan is a limited comparison, not relabelled old425 method','Actual riser service/230mm clamp tasks: only450mm remains between riser east9950 and W9 west10400 at overlappingY5147..5400; no600body+25 parallel stance or whole access pass supplied','Moved controls/buffer/emitter supports, finite filled loads and actual pipe/port/air/heat loss consequences','W9 native72mm UVLL cover access through rimmed receiver, actual base seat/feet and independently supported discharge/receptor','No source-qualified floor drain/outfall, safety/material exception, site works or selected air target'], 'admission':{'owningGeometryAdopted':False,'wholeRoomHandlingPass':False,'apparatusAccepted':False,'packetComplete':False}}
def figure(r):
 out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 1200 1050">','<rect width="1200" height="1050" fill="#f4f1e9"/>']
 def t(x,y,s,n=18,c='#21363b'):out.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{n}" fill="{c}">{html.escape(s)}</text>')
 sx=.18;ox=55;oy=150
 def xy(x,y):return ox+(x-9300)*sx,oy+(5900-y)*sx
 def rr(b,col):x,y,w,h=b;xx,yy=xy(x,y+h);out.append(f'<rect x="{xx}" y="{yy}" width="{w*sx}" height="{h*sx}" fill="{col}" stroke="#21363b"/>')
 t(35,42,'One whole plant-room rewind — method still OPEN',28);t(35,77,'Same functions; no structural arch change or owning source adoption',19)
 for id,o in r['proposal']['permanentBodies'].items():
  if 'rect'in o:rr(o['rect'],'#b4cec4' if id!='W9' else '#d4a766');cx=o['rect'][0]+o['rect'][2]/2;cy=o['rect'][1]+o['rect'][3]/2
  else:
   cx,cy,rad=o['circle'];xx,yy=xy(cx,cy);out.append(f'<circle cx="{xx}" cy="{yy}" r="{rad*sx}" fill="#a8c6cc" stroke="#21363b"/>')
  xx,yy=xy(cx,cy);t(xx-30,yy+5,id,15)
 rr([9397,3603,280,194],'#a7a091');rr([10898,3603,672.5,194],'#a7a091')
 rr([9397,2453,880,194],'#a7a091');rr([11123,2453,447.5,194],'#a7a091')
 for key,col in [('buffer425RenewalClosedDoor','#75609a'),('cylinder425Renewal','#355f7a'),('W9CarrierBodyOnly','#a66b21')]:
  pts=' '.join(f'{xy(x,y)[0]},{xy(x,y)[1]}' for x,y in r[key]['polyline_mm']);out.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="3"/>')
 t(650,155,'Compare full events, not only body packing',21)
 rows=[('Old south host: utility/jamb approach fails.',False),('West200: full front field hits west pier.',False),('East200 arch only: finished throat still short.',False),('Emitter-only north: tank work/exit blocked.',False)]
 for i,(s,_)in enumerate(rows):t(650,202+i*35,s,18,'#8c402e')
 y=365
 for key in ['buffer425RenewalClosedDoor','cylinder425Renewal','W9CarrierBodyOnly','W9AuthoredCrewFirstAttempt']:
  q=r[key];margin=q.get('minimumMargin_mm',q.get('minimumInflatedMargin_mm'));t(650,y,key,17);t(650,y+26,f"{q['planPass']} / min margin {margin:.1f} mm / {q['limiting']}",16,'#355f7a' if q['planPass'] else '#8c402e');y+=77
 t(35,825,'Retain source duties and expose the next decisive test',24)
 for i,s in enumerate(['850 buffer control needs its real supported/crew route through the intermediate arch with the leaf closed.',
 'The W9 body path does not earn the first authored operator regrip/exit; no shrink to make it pass.',
 'Moved buffer/controls/emitter require real supports, pipes, thermal and hydraulic/control consequences.',
 'Native UVLL72mm plus support opening does not establish base datum, withdrawal or discharge/receptor.',
 'Current HAD/Services geometry stays unchanged; no apparatus, handling, material or MAT completion.']):t(35,865+i*35,s,18)
 out.append('</svg>');return '\n'.join(out)+'\n'
def carrierfigure(r):
 c=r['bufferActualCarrierComparison'];out=['<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="1180" viewBox="0 0 1300 1180">','<rect width="1300" height="1180" fill="#f4f1e9"/>']
 def text(x,y,s,size=18,col='#21363b'):out.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{col}">{html.escape(s)}</text>')
 def poly(pts,col,w=3):out.append('<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)+f'" fill="none" stroke="{col}" stroke-width="{w}"/>')
 text(35,45,'Earlier convertible / East buffer controls: not selected',27)
 text(35,80,'One matched native34kg model;101L nominal ≠100L usable. No apparatus or room adoption.',19)
 scale=.19
 def xy(x,y):return 55+(x-9300)*scale,150+(5900-y)*scale
 def box(b,col):x,y,w,h=b;xx,yy=xy(x,y+h);out.append(f'<rect x="{xx}" y="{yy}" width="{w*scale}" height="{h*scale}" fill="{col}" stroke="#475650"/>')
 for k,o in r['proposal']['permanentBodies'].items():
  if k=='buffer':continue
  if 'rect'in o:box(o['rect'],'#c6cbbd')
  else:
   x,y,rad=o['circle'];xx,yy=xy(x,y);out.append(f'<circle cx="{xx}" cy="{yy}" r="{rad*scale}" fill="#a8c6cc" stroke="#21363b"/>')
 box([9397,3603,280,194],'#938f86');box([10898,3603,672.5,194],'#938f86');box([9397,2453,880,194],'#938f86');box([11123,2453,447.5,194],'#938f86')
 for j,col in [(0,'#a56d24'),(1,'#365d86'),(2,'#7a467e')]:
  poly([xy(*s[j]) for s in c['coupledStates_mm']],col)
  for i in [0,3,6,12,21]:
   x,y=xy(*c['coupledStates_mm'][i][j]);out.append(f'<circle cx="{x}" cy="{y}" r="{(300 if j==0 else 300)*scale}" fill="none" stroke="{col}" stroke-opacity=".4"/>')
 text(55,1020,'Brown: Ø600 carrier; blue: crew; purple: spotter.',16)
 text(55,1048,'Dock / detach / carry / re-pin at11000/3186.',16)
 text(55,1076,'East line: no level receiver or grade handling pass.',16,'#8c402e')
 text(660,145,'Same-caster comparison',23)
 for i,q in enumerate(c['stockControls']):
  y=190+i*155;text(660,y,f"Ø{q['plateDiameter_mm']} / carrier {q['carrierCoarse_kg']:.2f}kg / dry assembly {q['nativeDryPlusCarrier_kg']:.2f}kg",19)
  text(660,y+30,f"Swivel radius {q['completeSwivelRadius_mm']:.2f}mm; ideal contact-centre support ±{q['idealFourContactCentreSquareHalfWidth_mm']}mm",17)
  text(660,y+60,f"Measured CG±25 gives nominal edge margin{q['staticCGEdgeMarginIfFourContactsAndMeasuredCG_mm']}mm",17)
  text(660,y+90,f"GL pod / native fork lane overlap {q['casterPodOverlapWithNativeForkLane_mm']:.0f}mm",17,'#8c402e' if i else '#365d86')
 text(660,535,'Earned plan scope',23)
 for i,s in enumerate(['Ø600 +25 reserve: continuous body / crew segments clear.', 'Crew protects full700 cylinder station; body uses native595.', 'Bar25 wide +25 reserve: >106mm continuous plan bound.', 'Grip902–1120mm; frame held during captured bar regrip.', 'Ø700 +25: body-only pass after50mm west centre change.', 'Ø700 needs changed fork/pod and bar/ring handover.']):text(660,575+i*32,s,17)
 text(660,805,'Physical joins still open',23)
 for i,s in enumerate(['Body path enters full700×700 station by170.12mm.', 'Bind actual cylinder feet / valves / pipe supports there.', 'Native3 buffer feet / capture / residual mass / CG unbound.', 'Four contacts, positive dock and leg/caster transfer unproved.', 'Native200 lateral +150 top / ports need actual room fit.', 'Polymer/rubber / native insulation / seals remain unapproved.', 'W9 crew / riser task / condensate and East receiver stay open.']):text(660,845+i*32,s,17,'#8c402e')
 text(35,1135,'Current direction: persistent carrier + front. These retained controls do not admit apparatus or geometry.',20)
 out.append('</svg>');return '\n'.join(out)+'\n'

def wallfigure(r):
 w=r['wallNorth60Control'];out=['<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="1120" viewBox="0 0 1250 1120">','<rect width="1250" height="1120" fill="#f4f1e9"/>']
 def t(x,y,s,n=18,c='#21363b'):out.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{n}" fill="{c}">{html.escape(s)}</text>')
 def xy(x,y):return 55+(x-9300)*.18,145+(5900-y)*.18
 def box(b,c):x,y,ww,hh=b;xx,yy=xy(x,y+hh);out.append(f'<rect x="{xx}" y="{yy}" width="{ww*.18}" height="{hh*.18}" fill="{c}" stroke="#475650"/>')
 t(35,44,'Conditional +60 wall control: section and earlier East-path consequences',26)
 t(35,79,'No adopted native-clearance interpretation, structural offset transfer or house geometry.',19)
 for k,o in r['proposal']['permanentBodies'].items():
  if k=='buffer':
   x,y=xy(*w['bufferCentre_mm']);out.append(f'<circle cx="{x}" cy="{y}" r="54" fill="#d4a766" stroke="#21363b"/>')
  elif k=='controls':box(w['controlsRect_mm'],'#b8c7bb')
  elif 'rect'in o:box(o['rect'],'#c6cbbd')
  else:
   xx,yy,rad=o['circle'];x,y=xy(xx,yy);out.append(f'<circle cx="{x}" cy="{y}" r="{rad*.18}" fill="#a8c6cc" stroke="#21363b"/>')
 box([9510,3900,700,700],'none')
 for b in [[9397,3663,280,194],[10898,3663,672.5,194],[9397,2453,880,194],[11123,2453,447.5,194]]:box(b,'#938f86')
 for j,col in [(0,'#a56d24'),(1,'#365d86'),(2,'#7a467e')]:
  pts=' '.join(f'{xy(*s[j])[0]},{xy(*s[j])[1]}' for s in w['bodyCrewBarPlan']['coupledStates_mm']);out.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="3"/>')
 t(55,915,'Brown: proposed receiver; blue: first crew.',17)
 t(55,944,'700×700 station box stays visible beside actual595 body.',16)
 t(55,973,'East continuation: level receiver / grade method open.',16,'#8c402e')
 t(635,145,'The room gains space; the structure pays for it',22)
 rows=['South cell956 →1016mm; fixed buffer centreY3155.', 'Native563 +2×200 =963mm:26.5mm surplus each side.', 'Complete600 support +2×200 =1000:8mm each side.', '200mm lateral-plane interpretation remains unqualified.', 'Controls shift60 north; old cylinder export hits by7mm.', 'Revised425 cylinder pathY4600:5.66mm extra reserve.']
 for i,s in enumerate(rows):t(635,188+i*35,s,17)
 t(635,450,'Keep upper wallY3700 and ground beam fixed',21)
 for i,s in enumerate(['New140 coreY3690..3830: upper axis only10mm in.', '60mm eccentricity exceeds middle-third23.33mm.', 'Direct no-tension triangular contact width only30mm.', '10mm adverse relative setout loses the edge.', f"Gross upperwall{w['grossUpperWallCharacteristic_kNpm']:.3f}kN/m →{w['upperGrossWallOnly1p35ULS60Offset_kNmPm']:.3f}kNm/m ULS offset.", 'RC200 transfer capacity is not established.']):t(635,490+i*35,s,17,'#8c402e')
 t(635,755,'Actual East1400 replacement-door spring territory',20)
 d=w['eastReplacementDoor']
 for i,s in enumerate([f"Rise{d['rise_mm']:.0f} / radial ring{d['radialRing_mm']:.0f}: south extradosY{d['southRadialExtradosExtremeY_mm']:.2f}.", f"Core overlap{d['oldCoreOverlap_mm']:.2f} →{d['newCoreOverlap_mm']:.2f}mm; new axis enters{d['newAxisOverlap_mm']:.2f}mm.", 'The ring/skewback/thrust/frame remains unqualified.', 'Native body /700 station / actual occupied parts stay distinct.', 'W9 operator, riser task, ports and East receiver stay open.']):t(635,795+i*35,s,17,'#8c402e')
 t(35,1063,'Conditional indoor motion passes its stated domains; no whole-room handling or apparatus admission.',20)
 out.append('</svg>');return '\n'.join(out)+'\n'

def frontfigure(r):
 f=r['bufferFrontRenewal'];p=f['persistentCarrierAndGrade'];fold=f['frontFolded'];out=['<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1300" viewBox="0 0 1400 1300">','<rect width="1400" height="1300" fill="#f4f1e9"/>']
 def t(x,y,s,n=18,c='#21363b'):out.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{n}" fill="{c}">{html.escape(s)}</text>')
 def rectsvg(x,y,w,h,c):out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" stroke="#68706a"/>')
 def circle(x,y,r,c):out.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{c}" stroke-width="1.5"/>')
 def path(ps,col,w=3):out.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in ps)+f'" fill="none" stroke="{col}" stroke-width="{w}"/>')
 t(35,44,'One whole-room direction: persistent buffer carrier + actual front renewal',27)
 t(35,80,'Research comparison; conditional wall/native clearances. No installed carrier, capture or house geometry adoption.',18)
 def xy(x,y):return 45+(x-4850)*.08,135+(5900-y)*.08
 def box(b,c):x,y,w,h=b;xx,yy=xy(x,y+h);rectsvg(xx,yy,w*.08,h*.08,c)
 box([7103,0,2200,2747],'#c6cbbd')
 for b in [[9397,3663,280,194],[10898,3663,672.5,194],[9397,2453,880,194],[11123,2453,447.5,194],[9397,3534,762,44]]:box(b,'#938f86')
 for key,o in r['proposal']['permanentBodies'].items():
  if key=='buffer':x,y=xy(11245.5,3155);circle(x,y,24,'#a56d24')
  elif key=='controls':box(r['coherentCandidate']['controls'],'#b7c8b9')
  elif 'rect'in o:box(o['rect'],'#c6cbbd')
  else:x,y,rad=o['circle'];xx,yy=xy(x,y);circle(xx,yy,rad*.08,'#365d86')
 for j,col in [(0,'#a56d24'),(1,'#365d86'),(2,'#7a467e')]:path([xy(*s[j]) for s in f['room']['coupledStates_mm']],col)
 box([5400,-1200,1200,1200],'none')
 for x in [5250,5450]:xx,yy=xy(x,332.5);rectsvg(xx-4,yy-4,8,8,'#b35343')
 t(45,742,'Brown: full proposed 600 package; blue/purple: real crew paths.',16)
 t(45,770,'Native 563 casing alone is not full feet / ports / fittings / capture.',16,'#8c402e')
 t(680,145,'Persistent carrier: remove the under-load conversion',22)
 for i,s in enumerate([f"Coarse moving fixture {p['carrierCoarse_kg']:.3f} kg; native-dry total {p['nativeDryPlusCarrier_kg']:.3f} kg.",f"Complete listed water-filled {p['completeListedWaterFilledPlusCarrier_kg']:.3f} kg >150 rolling limit.", 'All four native casters remain fitted; no pod work under GL load.', '276 mm plate top; 1208 listed stack is not a fitted maximum.', 'Accessible removable stops; flush floor receivers are NEW work.', 'Native full feet / port access / 100 usable litres still qualify.', 'EPP / PUR roles unresolved; caster plastics / seals remain unapproved.']):t(680,185+i*33,s,17)
 t(680,450,'Do not turn a positive force case into transport approval',21)
 for i,s in enumerate(['Measured CG ≤600 high, ±25 offset; actual four contacts qualify.', 'Signed first-flight equilibrium:150 kg needs ≤124.75 N line tension.', '150 N is an authored operating bound, not a native limiter.', '1876 high-CG challenge includes negative support resultants.', 'No drain:175.51 kg wet case remains over the150 kg limit.', 'TU8 native7.845 kN per anchor; pair15.691 kN on the real beam.', 'Door/threshold receivers,620 handle and all operator fields open.']):t(680,490+i*33,s,17,'#8c402e')
 # Actual three turns share this source-derived local geometry; offsets are mapped.
 ox=70;oy=830;sc=.075
 def lp(x,y):return ox+x*sc,oy+(4200-y)*sc
 for x,y,xx,yy in [[0,0,2700,1200],[0,1200,1200,4200],[1500,1200,2700,4200]]:
  a,b=lp(x,yy);rectsvg(a,b,(xx-x)*sc,(yy-y)*sc,'#deddd4')
 for state in fold['previewStates_mm']:
  for j,col in [(0,'#a56d24'),(1,'#365d86'),(2,'#7a467e')]:
   a,b=lp(*state[j]);circle(a,b,(350 if j else 350)*sc,col)
 t(355,835,'Actual folded front: three source-bound hairpins',22)
 for i,s in enumerate(['750 radius in2700×1200 landing; body600 + two crew600 + bar25.', '990 fore/rear spacing; rear crew80 left-normal clears low-rope conflict.', 'All shapes independently clipped with50 mm inflated samples.', f"1113 poses / turn; continuous raw plan reserve >{fold['continuousRawPlanReserveLowerBound_mm']:.2f} mm.", 'Grip902.90–1051.37 mm includes worst1:20 floor-height difference.', 'Wheel tilt / transition / steering / braking / final toe are NOT proved.', 'New anchors / redirects / floor support / independent failure capture open.']):t(355,875+i*34,s,17)
 t(45,1215,'Keep the whole system: W9 crew/GL,450 mm riser gap, native condensate/ports, floor/heat/material and capture duties.',19)
 t(45,1250,'Conditional +60 wall pays the RC offset and actual East-door skewback; no free structure or clearance waiver.',18,'#8c402e')
 out.append('</svg>');return '\n'.join(out)+'\n'

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();r=produce()
 for p,s in [(BASE.with_suffix('.json'),json.dumps(r,indent=2)+'\n'),(BASE.with_suffix('.svg'),figure(r)),(BASE.parent/'plant-room-buffer-carrier.svg',carrierfigure(r)),(BASE.parent/'plant-room-wall60.svg',wallfigure(r)),(BASE.parent/'plant-room-front-renewal.svg',frontfigure(r))]:
  if args.check:assert p.read_text()==s,'Stale '+p.name
  else:p.write_text(s)
 print('Reproduces source-bound rejected controls and unresolved whole-room/crew methods; no adoption')
if __name__=='__main__':main()
