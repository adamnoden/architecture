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
def buffer_carrier(obs,crewobs):
 """One authored package: source-bound stock, continuous indoor plan, no physical admission."""
 src=json.loads((BASE.parent/'plant-room-buffer-carrier-sources.json').read_text());a=src['authoredCarrier'];n=src['nativeCaster'];states=a['coupledStates_mm'];rho=8000
 assert n['swivelRadius_mm']==90 and n['offset_mm']==40 and src['nativeBuffer']['dryNet_kg']==34
 def stock(D,axis,L):
  plate=math.pi*(D/2000)**2*.008*rho;ring=2*math.pi*((D/2-15)/1000)*.04*.006*rho
  area=40*80-34*74
  mass={'plate':plate,'ring':ring,'crossbeams':2*area*L/1e9*rho,'casterPads':4*105*80*12/1e9*rho,'casterPods':4*(40**2-34**2)*88/1e9*rho,'fixedLegs':4*(25**2-19**2)*228/1e9*rho,'casters':4*n['massEach_kg'],'towbar':(25**2-21**2)*1000/1e9*rho,'hardwareStorageAllowance':3,'gripClevisAllowance':.5}
  m=sum(mass.values());inner=axis-n['offset_mm'];swivel=math.sqrt(2)*axis+n['swivelRadius_mm']
  # The native fork lane is165..260.5 from the common centre. Pod outer edge is axis+20.
  overlap=max(0,min(axis+20,260.5)-max(axis-20,165))
  I=(80*40**3-74*34**3)/12;span=2*axis;load=3000;Z=I/20
  return {'plateDiameter_mm':D,'casterAxesAbs_mm':axis,'stockMasses_kg':mass,'carrierCoarse_kg':m,'nativeDryPlusCarrier_kg':m+34,'nativeListedWaterFilledPlusCarrier_kg':m+135,'completeSwivelRadius_mm':swivel,'fourContactInnerSquareHalfWidth_mm':inner,'requiredMeasuredCombinedCGOffsetMax_mm':25,'staticCGEdgeMarginIfFourContactsAndMeasuredCG_mm':inner-25,'casterPodOverlapWithNativeForkLane_mm':overlap,'nativeForkInside330Outside521Role':'Native configuration match, actual origin/tine/sweep/contact still unbound. No rating extrapolation or corner-reaction admission.','frameComponent3kNChallenge':{'span_mm':span,'I_mm4':I,'stress_MPa':load*span/4/Z,'deflection_mm':load*span**3/(48*193000*I)},'rating':'Unrated authored fabrication; native160kg caster is not a whole-carrier rating.135kg water-filled plus frame exceeds provisional150kg measured gross limit; actual drained residues/CG must be measured.'}
 controls=[stock(600,140,450),stock(700,180,550)]
 # Complete600 plate includes the tabulated four-caster sweep.25 reserve is applied once.
 bodyobs={k:v for k,v in obs.items() if k!='buffer'};crewobs={k:v for k,v in crewobs.items() if k!='buffer'}
 body=circlepath([s[0] for s in states],325,bodyobs);crew=[circlepath([s[j] for s in states],325,crewobs) for j in [1,2]]
 separations={key:min(pointseg([0,0],[x[j][z]-x[k][z] for z in range(2)],[y[j][z]-y[k][z] for z in range(2)])-need for x,y in zip(states,states[1:])) for j,k,need,key in [(0,1,625,'bodyCrew1'),(0,2,625,'bodyCrew2'),(1,2,650,'crewCrew')]}
 # Circular body300 and crew body300 receive25 each for fixed obstacles, but mutual
 # non-overlap uses one shared25 gap:300+300+25, not two stacked reserves.
 worst=math.inf;movement=0;heights=[];steps=100
 for i,(x,y) in enumerate(zip(states,states[1:])):
  if i==a['dockDetachTransitionIndex']:continue # explicit positively docked detach/carry/re-pin state
  ra=[x[1][z]-x[0][z] for z in range(2)];rb=[y[1][z]-y[0][z] for z in range(2)];rmin=pointseg([0,0],ra,rb)
  # Normalised-vector displacement <=2|delta r|/rmin. Any intermediate bar
  # endpoint is within this conservative movement bound of the preceding sample;
  # the entire segment inherits the maximum of its endpoint bounds.
  du=2*math.dist(ra,rb)/(steps*rmin)
  movement=max(movement,math.dist(x[0],y[0])/steps+275*du,math.dist(x[1],y[1])/steps+105*du)
  for k in range(steps+1):
   t=k/steps;b=[x[0][z]*(1-t)+y[0][z]*t for z in range(2)];c=[x[1][z]*(1-t)+y[1][z]*t for z in range(2)];d=math.dist(b,c);v=[(c[z]-b[z])/d for z in range(2)];pin=[b[z]+275*v[z] for z in range(2)];grip=[c[z]-105*v[z] for z in range(2)]
   horizontal=d-105-275;assert 0<horizontal<1000;heights.append(160+math.sqrt(1000**2-horizontal**2))
   for o in crewobs.values():
    gap=pointseg(o['circle'][:2],pin,grip)-o['circle'][2]-37.5 if 'circle'in o else segpoly(pin,grip,rect(o['rect']))-37.5
    worst=min(worst,gap)
 assert body['planPass'] and all(c['planPass'] for c in crew) and min(separations.values())>0
 assert worst-movement>0 and min(heights)>=900 and max(heights)<=1120
 # One larger body control, not a silently altered600 transfer assembly.
 big=src['largerControl'];arc=[[9860+680*math.cos(math.radians(t)),4250+680*math.sin(math.radians(t))] for t in range(-55,16)]
 bigpath=[big['initialCentre_mm'],[10800,3097],[10550,3300],[10300,3600]]+arc+[[10700,4575],[12500,4575]]
 larger=circlepath(bigpath,375,bodyobs);assert larger['planPass'] and controls[1]['casterPodOverlapWithNativeForkLane_mm']>0
 # Horizontal50N is an authored static challenge, not pull-force or stability certification.
 stability=[]
 for c in controls:
  H=c['fourContactInnerSquareHalfWidth_mm'];rows=[]
  for height in [900,1120]:
   rise=height-160;run=math.sqrt(1000**2-rise**2);up=rise/run
   lever=160+up*(275-H);W=c['nativeDryPlusCarrier_kg']*9.81
   rows.append({'gripHeight_mm':height,'upwardForcePerHorizontalForce':up,'overturnEquivalentLever_mm':lever,'dryAssemblyRestoringMoment_Nmm':W*(H-25),'horizontal50NChallengeMoment_Nmm':50*lever,'idealStaticHorizontalThreshold_N':W*(H-25)/lever})
  stability.append({'diameter_mm':c['plateDiameter_mm'],'fourContactMeasuredCGConditional':rows})
 return {'status':'One actual-source authored carrier comparison; indoor plan only, no fabrication/handling/adoption approval','source':{'path':'project/mat/studies/plant-room-buffer-carrier-sources.json','sha256':hashlib.sha256((BASE.parent/'plant-room-buffer-carrier-sources.json').read_bytes()).hexdigest()},'nativeBuffer':src['nativeBuffer'],'nativeCaster':src['nativeCaster'],'stockControls':controls,'sameCaster700ExtraCoarseStock_kg':controls[1]['carrierCoarse_kg']-controls[0]['carrierCoarse_kg'],'conditionalStaticStability':stability,'coupledStates_mm':states,'body600':body,'body600Complete700StationControl':circlepath([s[0] for s in states],325,crewobs),'crew600':crew,'mutualClearanceBeyondRequired_mm':separations,'bar600':{'width_mm':25,'reserve_mm':25,'length_mm':1000,'pinRadius_mm':275,'pinZ_mm':160,'crewCentreToGrip_mm':105,'gripHeightRangeRequired_mm':[min(heights),max(heights)],'sampleMinimumPlanMargin_mm':worst,'maximumUnsampledMovementBound_mm':movement,'continuousPlanMarginLowerBound_mm':worst-movement,'dockDetachTransitionIndex':a['dockDetachTransitionIndex'],'regrip':a['towbarRegrip']},'larger700BodyOnly':larger,'decision':'Develop600 conversion with its complete crew/bar path as the current joined indoor method.700 earns greater conditional stability and a body-only throat pass, but overlaps native fork lanes35mm and cannot inherit low-bar/ring clearance or the600 crew method. Price that changed transfer before preferring700; no new apparatus selected.','holds':['Carrier inflated path enters complete700×700 cylinder station170.12mm while clearing actual595 body; actual retained feet/valves/ports/pipes/support in that station domain must qualify','Native3foot bearing/contact geometry and captured pressure-body restraint remain unbound; no lifting by ports or wall-fixing assumption','Actual residual mass after drain, combined CG and four floor contacts must satisfy the stated measured conditions; caster rating does not prove stability','GL fork origin/tine thickness/full tool/crew and positive supported leg-to-caster conversion, dock/chocks, pins/welds/local plate and fixed storage remain unqualified','Actual native563mm buffer plus200mm lateral and150mm top/port access is not a drop-in650 station;101nominal does not prove100usable or hydraulic/glycol compatibility','Crew2 is a utility spotter, not an assumed shared manual lifting capacity; actual grip/force/stop procedure remains to qualify','Eastward plan continuation has no source-qualified level exterior receiver/crew stance or1800mm grade transfer; front folded route credit is not inherited','Known rubber/polyamide casters, native insulation/seals/finishes and lubricants remain explicit unapproved constituents; no tool exemption','W9 operator/GL method, actual riser tasks and ports/condensate/thermal/support joins remain open'],'admission':{'wholeRoomHandlingPass':False,'apparatusAccepted':False,'owningGeometryAdopted':False}}

def produce():
 hp='project/had/studies/water-replan.json';sp='project/mat/studies/whole-house-service-baseline.json'
 h=immutable(hp,'089f0dac2f2e89272dc2ea85a10c2208f2fd797d')['model'];s=immutable(sp,'049161ebac29b24e0acc7d8085302fca906fe9d2')
 current=json.loads((ROOT/hp).read_text())['model'];assert all(current[k]==h[k] for k in ['groundWalls','groundFurniture','plantReferenceDoor','utilityDisposition','servicesInterface'])
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
 return {'status':'Whole-room comparison in development; current HAD/Services unchanged; no geometry/apparatus/handling adoption','sourceCommit':'50093457642f65eca288e5cc233a77d8aac6bc29','sources':{'HAD':{'path':hp,'blob':'089f0dac2f2e89272dc2ea85a10c2208f2fd797d'},'Services':{'path':sp,'blob':'049161ebac29b24e0acc7d8085302fca906fe9d2'}},'sourceRoles':{'utilityRawX':uw['holes'][0],'utilityFinishedX':uj,'intermediateFinishedX':ij,'eastArchitecturalFinishedMouthY':door,'eastDoorsetMinimumRequiredClear_mm':1000,'note':'Architectural finished mouth is not actual installed doorset clear. Retain1000 minimum and full native frame/leaf/threshold/closer/source qualification.425 is the retained complete cart/apparatus circle including its25mm allowance, not a mandatory shape for every possible actual handling method.'},'rejectedLocalControls':locals,'proposal':{'W9':bw,'W9FrontSouth600':[10400,4547,1006,600],'bufferStation':[10920.5,2772,650,650],'bufferMaximumRoundBody_mm':600,'bufferUsableAlwaysConnectedLitres':100,'bufferPortFace':'WEST proposed; actual native ports/isolation/drain/support and usable volume unqualified','controls':fixed['controls']['rect'],'controlsFront':'NORTH','emitter':fixed['emitter']['rect'],'cylinderBodyUnchanged':p['cylinder']['body'],'cylinderWorkingEast':[10210,4097,900,700],'riserUnchanged':p['riserGross'],'permanentBodies':fixed,'emitterToFullReferenceLeafSweep_mm':sweepgap,'emitterSweepRole':'Exact reference quarter-disc outer radius; ~20mm remains, not25 and not classified-kit/trim/closer or fixing approval.'},'bufferActualCarrierComparison':buffer_carrier(obs('closed',('buffer',)),{**obs('closed',('buffer',)),'complete-cylinder-station':{'rect':p['cylinder']['station']}}),'taskComparisons':tasks,'buffer425RenewalClosedDoor':buffer,'unchangedCylinderPierPhysicalThroat_mm':throat,'cylinder425Renewal':cylinder,'W9CarrierBodyOnly':carrier,'W9AuthoredCrewFirstAttempt':crew,'W9Crew300Complete700StationControl':crew_station,'decision':'Retain this one whole-room candidate for joined development. Local south-host/arch-only and emitter-only north controls fail. No layout adopted: finish full buffer/crew supported method and W9 operator regrip/exit, native GL/cart datum/CG/support, ports/duct/condensate and moved hydraulic thermal/support consequences before source adoption.','unearned':['Actual W9 cart operator regrip/exit and whole-tool lift/setdown; a cart-body sweep is not whole handling','Actual supported buffer transfer/capture/CG and retained complete700 station qualification;600 crew/bar indoor plan is a limited comparison, not relabelled old425 method','Actual riser service/230mm clamp tasks: only450mm remains between riser east9950 and W9 west10400 at overlappingY5147..5400; no600body+25 parallel stance or whole access pass supplied','Moved controls/buffer/emitter supports, finite filled loads and actual pipe/port/air/heat loss consequences','W9 native72mm UVLL cover access through rimmed receiver, actual base seat/feet and independently supported discharge/receptor','No source-qualified floor drain/outfall, safety/material exception, site works or selected air target'], 'admission':{'owningGeometryAdopted':False,'wholeRoomHandlingPass':False,'apparatusAccepted':False,'packetComplete':False}}
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
 text(35,45,'Bottom-supported buffer: whole indoor plan + real transfer costs',27)
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
  text(660,y+30,f"Swivel radius {q['completeSwivelRadius_mm']:.2f}mm; four-contact support ±{q['fourContactInnerSquareHalfWidth_mm']}mm",17)
  text(660,y+60,f"Measured CG±25 gives nominal edge margin{q['staticCGEdgeMarginIfFourContactsAndMeasuredCG_mm']}mm",17)
  text(660,y+90,f"GL pod / native fork lane overlap {q['casterPodOverlapWithNativeForkLane_mm']:.0f}mm",17,'#8c402e' if i else '#365d86')
 text(660,535,'Earned plan scope',23)
 for i,s in enumerate(['Ø600 +25 reserve: continuous body / crew segments clear.', 'Crew protects full700 cylinder station; body uses native595.', 'Bar25 wide +25 reserve: >106mm continuous plan bound.', 'Grip902–1120mm; frame held during captured bar regrip.', 'Ø700 +25: body-only pass after50mm west centre change.', 'Ø700 needs changed fork/pod and bar/ring handover.']):text(660,575+i*32,s,17)
 text(660,805,'Physical joins still open',23)
 for i,s in enumerate(['Body path enters full700×700 station by170.12mm.', 'Bind actual cylinder feet / valves / pipe supports there.', 'Native3 buffer feet / capture / residual mass / CG unbound.', 'Four contacts, positive dock and leg/caster transfer unproved.', 'Native200 lateral +150 top / ports need actual room fit.', 'Polymer/rubber / native insulation / seals remain unapproved.', 'W9 crew / riser task / condensate and East receiver stay open.']):text(660,845+i*32,s,17,'#8c402e')
 text(35,1135,'Development direction: retain the ordinary room rewind; qualify actual joins before any owning geometry change.',20)
 out.append('</svg>');return '\n'.join(out)+'\n'

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();r=produce()
 for p,s in [(BASE.with_suffix('.json'),json.dumps(r,indent=2)+'\n'),(BASE.with_suffix('.svg'),figure(r)),(BASE.parent/'plant-room-buffer-carrier.svg',carrierfigure(r))]:
  if args.check:assert p.read_text()==s,'Stale '+p.name
  else:p.write_text(s)
 print('Reproduces source-bound rejected controls and unresolved whole-room/crew methods; no adoption')
if __name__=='__main__':main()
