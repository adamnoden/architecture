"""One unadopted ordinary utility sink/service host. No product or installation pass."""
import argparse,hashlib,json,math,html
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--source-root',type=Path,default=Path(__file__).resolve().parents[3]);p.add_argument('--check',action='store_true');a=p.parse_args();root=a.source_root
sources={}
def source(key,path):
 b=(root/path).read_bytes();sources[key]={'path':path,'blob':hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()};return json.loads(b)
h=source('had','project/had/studies/water-replan.json')['model'];s=source('services','project/mat/studies/whole-house-service-baseline.json');old=source('historicalSink','project/ias/studies/sink-renewal.json')
u=s['interfaces']['architecturalServices']['utility'];f=next(v for v in s['fixtures'] if v['id']=='washer-PROPOSED')
assert all(h['groundFurniture']['service-utility-'+k]==u[k] for k in ['washer','sink','valveBay'])
assert u['sink']==[10950,700,600,700] and u['valveBay']==[10700,700,250,700]
assert f['waterBranchPlan'][-1]==[10800,1250] and f['valveAxisZ']==750 and f['requiredValveWorkTerritory']==[200,200,300]
# All dimensions below are NEW project geometry within those reservations.
# Boxes [xmin,ymin,zmin,EW,NS,height]. Member centrelines define actual quantities.
feet=[[x,y] for x in [10975,11525] for y in [750,1350]]
posts=[{'id':f'leg-{i+1}','section':'30x30x3','box':[x-15,y-15,5,30,30,865]} for i,(x,y) in enumerate(feet)]
rails=[]
for z,depth,sec in [(850,40,'30x40x3'),(135,30,'30x30x3')]:
 for y in [750,1350]:rails.append({'id':f'EW-{y}-{z}','section':sec,'box':[10975,y-15,z-depth/2,550,30,depth]})
 for x in [10975,11525]:rails.append({'id':f'NS-{x}-{z}','section':sec,'box':[x-15,750,z-depth/2,30,600,depth]})
# West side member is outside the front service opening, not a centre mullion.
side={'id':'west-service-side','section':'30x30x3','box':[10960,1210,135,30,30,715]}
hand=[10700,1250,600,200,200,300]
carriers=[]
for z in [450,550,750]:
 carriers.append({'id':f'water-carrier-{z}','section':'20x20x3','box':[10800,1215,z-10,175,20,20]})
terminal_pad={'box':[10775,1212,710,50,3,80],'mountingTerritory':'Four M6 positions x10785/10815 at z730/770; actual clip/carrier interface is not fitted to the tap.',
 'role':'New project terminal reaction plate behind task volume; not a water adapter, a completed valve clamp or a pressure fitting.'}
clips=[{'centre':[10800,1250,z],'conservativeBox':[10774.5,1230,z-40,51,40,80]} for z in [450,550]]
clip_source={'product':'Walraven 2S 33035019 unlined 15–19 mm, M8/M10','url':'https://www.walraven.com/int/products/walraven-2s-clamp-m8-10/product-33035019/','inspected':'7 November 2026','dimensions':{'width':51,'height':40,'depth':20},'material':'Zinc-plated steel St.1.0330, no lining stated; complete material/owner admission unearned','nativeInstallationTorque_Nm':2,'reportedFaZ_N':700,'role':'One matched 15 mm pipe-support dimensional control, not a valve reaction or pressure rating. Supplier lists metal pipes; actual copper contact, wear/corrosion, installation and complete joint remain to be established.','hold':'The conservative 80 mm height envelope encloses full 40 mm on either side of pipe axis; no guessed centre-to-nut datum, stud length/engagement, axial grip or anti-rotation capacity is admitted.'}
assert all(c['conservativeBox'][2]+c['conservativeBox'][5]<=hand[2]-10 for c in clips)
assert side['box'][0]>=hand[0]+hand[3]+60
assert all(c['box'][1]+c['box'][4]<=hand[1]-15 for c in carriers)
assert all(10950<=x-25 and x+25<=11550 and 700<=y-25 and y+25<=1400 for x,y in feet)
# Explicit project model, not a claimed material certificate or measured task force.
E=193000;stress_limit=160;deflection_limit=3
loads={'aggregateVertical_N':2000,'additionalLocalPointOnFrame_N':1000,'valveHorizontalReaction_N':100,'valveVerticalReactionWithinAggregate_N':200,
 'definition':'Design-target domain, not measured nut force, a certified cabinet rating, a pressure rating or permission to stand on the worktop. Actual terminal/task loads must fit this domain or the host must be redesigned.'}
sections={
 '30x30x3':{'outer':[30,30],'wall':3,'requiredI_mm4':32000,'requiredArea_mm2':250},
 '30x40x3':{'outer':[30,40],'wall':3,'requiredI_mm4':65000,'requiredArea_mm2':300},
 '20x20x3':{'outer':[20,20],'wall':3,'requiredI_mm4':8000,'requiredArea_mm2':170}}
for v in sections.values():
 b,d=v['outer'];t=v['wall'];v['nominalArea_mm2']=b*d-(b-2*t)*(d-2*t);v['sharpCornerI_mm4']=(b*d**3-(b-2*t)*(d-2*t)**3)/12
 assert v['sharpCornerI_mm4']>=v['requiredI_mm4'] and v['nominalArea_mm2']>=v['requiredArea_mm2']
L=600;W=loads['aggregateVertical_N'];P=loads['additionalLocalPointOnFrame_N'];eccentric=200*175
M=W*L/8+P*L/4+eccentric
beamStress=M*20/65000
beamForceDeflection=5*W*L**3/(384*E*65000)+P*L**3/(48*E*65000)
# Conservative cantilever couple bound added to the simply supported force result.
beamMomentDeflection=eccentric*L**2/(2*E*65000)
beamDeflection=beamForceDeflection+beamMomentDeflection
postM=100*750+eccentric;postStress=postM*15/32000+3200/250;postForceDeflection=100*750**3/(3*E*32000);postMomentDeflection=eccentric*750**2/(2*E*32000);postDeflection=postForceDeflection+postMomentDeflection
armF=math.hypot(100,200);armM=armF*175;armStress=(100+200)*175*10/8000;armAxialCaseStress=200*175*10/8000+100/170;armDeflection=armF*175**3/(3*E*8000)
memberScreens={'topRail':{'stressMPa':beamStress,'verticalDeflection_mm':beamDeflection,'forceDeflection_mm':beamForceDeflection,'coupleDisplacementBound_mm':beamMomentDeflection,'scope':'Conservatively all aggregate load and local point on one 600 mm simply supported rail, plus the service vertical overhang moment. This does not design the worktop or bowl clips.'},
 'post':{'stressMPa':postStress,'horizontalDeflection_mm':postDeflection,'forceDeflection_mm':postForceDeflection,'coupleDeflection_mm':postMomentDeflection,'scope':'One 750 mm cantilever takes full horizontal reaction and service overhang moment; full 3200 N axial applied to that one post. Frame joints and side-rail transfer remain separate.'},
 'carrier':{'stressMPa':armStress,'deflection_mm':armDeflection,'horizontalAxialCaseStressMPa':armAxialCaseStress,'loadDirections':'65.625 MPa is the biaxial corner comparison with horizontal force normal to the arm. Horizontal parallel to arm is axial plus vertical bending. Actual terminal normal offset/torsion, contact and connections remain unqualified.','scope':'175 mm end-load comparison takes 100 N horizontal and 200 N vertical; vector magnitude is used only for deflection, not biaxial corner stress; terminal contact/anti-rotation and local weld/plate/bolt transfer remain separate.'}}
for q in memberScreens.values():q['withinComparisonThresholds']=q['stressMPa']<stress_limit and q.get('verticalDeflection_mm',q.get('horizontalDeflection_mm',q.get('deflection_mm',0)))<deflection_limit
assert not memberScreens['post']['withinComparisonThresholds'] and postDeflection>deflection_limit,'Preserve the original failed post/moment movement control until explicitly superseded'

# Unloaded host: do not borrow worktop/payload weight to prevent uplift.
anchorDemandN=100*750/550+100*750/600+200*175/550
anchorInteraction=anchorDemandN/1000+100/1000
assert anchorInteraction<1
anchors={'footPlates':[{'box':[x-25,y-25,0,50,50,5],'holeCentre':[x,y],'holeDiameter':9} for x,y in feet],
 'proposedReceiverTerritories':[[x-15,y-15,-80,30,30,80] for x,y in feet],
 'requiredPerReceiver':{'tension_N':1000,'shear_N':1000,'combinedInteraction':'N/1000 + V/1000 <=1'},
 'conservativeSingleReceiverScreen':{'uplift_N':anchorDemandN,'shear_N':100,'interaction':anchorInteraction},
 'status':'No anchor product or floor host is qualified. Receivers are proposed territories, not drilling authority. Join actual floor support, edges/reinforcement, moisture/air/water continuity and removable fixing before adoption.'}
lengths={'30x30x3':4*.865+2*(.55+.6)+.715,'30x40x3':2*(.55+.6),'20x20x3':3*.175}
mass=sum(sections[k]['nominalArea_mm2']*v*1000*8e-6 for k,v in lengths.items())+4*50*50*5*8e-6+50*80*3*8e-6
emitter=next(e for e in s['heat']['emitterSchedule'] if e['id']=='utility-E')
assert emitter['completePlanWithValvesAndBrackets']==h['groundFurniture']['service-emitter-utility-E']
assert emitter['completePlanWithValvesAndBrackets']==[11370.5,1778,200,650] and emitter['bottomLocal']==100 and emitter['topLocal']==700
ex,ey,ew,en=emitter['completePlanWithValvesAndBrackets'];ez=emitter['bottomLocal'];eh=emitter['topLocal']-ez
contacts=[]
for m in posts+rails+[side]+carriers+[{'id':f'foot-{i+1}','box':q['box']} for i,q in enumerate(anchors['footPlates'])]:
 x,y,z,w,n,hh=m['box']
 if min(x+w,ex+ew)>max(x,ex) and min(z+hh,ez+eh)>max(z,ez):
  travel=ey-(y+n)
  if travel>=0:contacts.append({'member':m['id'],'firstNorthContact_mm':travel})
contacts.sort(key=lambda q:q['firstNorthContact_mm'])
assert contacts and contacts[0]['firstNorthContact_mm']==413
retirement={'sourceEmitterPlan':emitter['completePlanWithValvesAndBrackets'],'sourceEmitterZ':[ez,ez+eh],'firstContacts':contacts[:3],
 'status':'700 mm straight north whole-host retirement is NOT admitted; actual proposed legs/lower rails reach the retained source emitter duty envelope after 413 mm.',
 'scope':'This is a source complete-plan/body-height envelope control, not recovered fin/individual-valve geometry or a universal rejection from a filled cabinet square. Low foot plates and high top rails are excluded by their actual heights.',
 'next':'Develop one short north then west actual-member/crew method with independent temporary fixed-pipe support, first rest and receivers; retain radiator and all other fixtures.'}
native_width=old['plan']['outer']['width'];front_clear=11510-10990
assert native_width>front_clear
r={'status':'Authored shared utility host NEGATIVE checkpoint: original post fails movement; retirement route unearned; no installation admission',
 'sources':sources,'geometry':{'sinkReservation':u['sink'],'serviceBay':u['valveBay'],'frameTerritory':[10950,700,0,600,700,900],
 'worktopTerritory':[10950,700,870,600,700,30],'legs':posts,'perimeterRails':rails,'westServiceSide':side,
 'serviceCarriers':carriers,'terminalReactionPad':terminal_pad,'candidateLowerClips':clips,'actualClipComparator':clip_source,'explicitFrontHandVolume':hand,'designValveAxis':[10800,1250,750],
 'frontClearOpening':{'x':[10990,11510],'z':[150,830],'width':front_clear,'height':680},
 'noFixedCentreMullion':True,'noFixedShelfAcrossServiceTask':True},
 'projectDesignTarget':{'loads':loads,'analysisE_MPa':E,'assumedProofStrengthFloor_MPa':220,'projectStressCeiling_MPa':stress_limit,'projectMovementCeiling_mm':deflection_limit,
 'materialAndJoints':'Uncoated stainless primary members are a project proposal, not a product declaration or approved whole assembly. Actual section properties/corner radii, grade/temper, welds/bolts, stability and local connections must satisfy the domain; no plastic end caps, liners or threadlocking compound is silently included.',
 'sections':sections,'memberScreens':memberScreens,'completeHostQualified':False},'floorFixings':anchors,'actualMemberRetirementControl':retirement,
 'massScreen':{'densityBound_kg_m3':8000,'memberCentrelineLengths_m':lengths,'bareMemberFootPlatePadMass_kg':mass,
 'scope':'Nominal section/plate material only. Actual welded overlaps, holes, welds, fasteners, covers, worktop, sink, services and retained water remain to be weighed/priced. No lifting or owner material pass.'},
 'renewal':{'washer':'Keep the shared host and fixed services in place; isolate power/water, collect each actual hose separately and disconnect supported fixed ends before moving the washer.',
 'sink':'The historical 530 mm Franke outer rim exceeds this new 520 mm front opening by 10 mm; the older 800 mm cabinet lowering proof does not transfer. Preferred direction to develop is supported whole top/bowl release after actual sink-service isolation; no lower/rotate choreography is inherited.',
 'historicalSinkControl':{'nativeOuterWidth':native_width,'newFrontClearWidth':front_clear,'excessWidth':native_width-front_clear,'scope':'Dated native geometry control only; no utility sink/product/template adoption.'},
 'host':'For eventual host retirement, isolate and separately support all affected fixed services; remove the actual top/bowl and captured faces, release exposed floor fixings, then qualify the bare 600×700 frame handling/export. No complete carrying route or field weld-cutting requirement is inferred.',
 'waterFailure':'Expose leaks and collect/drain before opening; dry and inspect floor/host, renew disturbed joints and restore leak/electrical checks. Current cabinet geometry gives no water-containment pass.'},
 'holds':['Actual sink/top/seals/clips/trap and native first-release section, including the whole top/bowl mass/grip/capture, remain unqualified.',
 'Actual tap 17 mm bore/10 mm threaded outlet, washer seat, hand/nut/lever motion, terminal contact/anti-rotation and hose route remain open.',
 'The terminal plate is not a certified pressure fitting and does not clamp an invented valve shape. Actual interface must earn the declared support reactions.',
 'Waste terminal/socket mounting, wet/electrical separation and all other duty-specific supports remain to be joined; water clips do not discharge them.',
 'Floor receivers and connections are proposed, not an admitted hole in permanent fabric. Joint/member screening is not whole-frame or floor capacity certification.',
 'All complete materials, functional polymer residues and owner exceptions remain explicit/unapproved. No manufacturer internals or safety duties are modified.']}
def emit(path,content):
 if a.check:assert path.read_text()==content,f'{path.name}: generated host drift'
 else:path.write_text(content)
out=Path(__file__).with_suffix('.json');emit(out,json.dumps(r,indent=2)+'\n')
print(json.dumps({'memberScreens':memberScreens,'anchorScreen':anchors['conservativeSingleReceiverScreen'],'bareMassKg':mass,'frontWidth':front_clear,'historicalRimExcess':native_width-front_clear},indent=2))
# Both views project the same authored boxes; no fixed frame line is copied from an older plan.
g=r['geometry'];v=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif"><rect width="420" height="297" fill="white"/>']
def label(x,y,t,size=3.2):v.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="#20313b">{html.escape(t)}</text>')
def rect(x,y,w,h,fill,dash=False):v.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="#52616b" stroke-width=".45"'+(' stroke-dasharray="2 1"' if dash else '')+'/>')
label(15,17,'IAS / Shared utility sink and service host',5.3)
label(15,27,'7 November 2026 | New project candidate; no fitted product, joint, floor, material or handling pass.',3.5)
label(15,37,'One ordinary cabinet frame carries the sink/top and accessible service brackets. No separate washer rack.',3.3)
label(15,50,'PLAN / current 250 mm bay + 600 mm sink reserve',3.8)
px=lambda x:20+(x-10650)*.2;py=lambda y:215-(y-650)*.18
for key in ['serviceBay','sinkReservation']:
 b=g[key];rect(px(b[0]),py(b[1]+b[3]),b[2]*.2,b[3]*.18,'#fff3dc' if key=='serviceBay' else '#edf1f3',True)
for m in g['legs']+g['perimeterRails'][:4]+[g['westServiceSide']]+g['serviceCarriers'][-1:]:
 b=m['box'];rect(px(b[0]),py(b[1]+b[4]),b[3]*.2,b[4]*.18,'#b6d4df')
b=g['explicitFrontHandVolume'];rect(px(b[0]),py(b[1]+b[4]),b[3]*.2,b[4]*.18,'none',True)
label(20,226,'Dashed: required front task territory; actual fitting/hand motion remains open.',2.9)
label(20,234,'Design valve point remains x10800/y1250/z750 mm.',3)
label(250,50,'FRONT / new primary members',3.8)
fx=lambda x:250+(x-10700)*.17;fz=lambda z:220-z*.17
for m in g['legs']+[q for q in g['perimeterRails'] if q['id'].startswith('EW-1350')]+[g['westServiceSide']]+g['serviceCarriers']:
 b=m['box'];rect(fx(b[0]),fz(b[2]+b[5]),b[3]*.17,b[5]*.17,'#b6d4df')
for key in ['worktopTerritory','explicitFrontHandVolume']:
 b=g[key];rect(fx(b[0]),fz(b[2]+b[5]),b[3]*.17,b[5]*.17,'none',True)
label(310,145,f"{g['frontClearOpening']['width']} mm clear",3.6)
label(310,155,'no centre mullion',3);label(310,164,'no fixed task shelf',3)
label(250,229,'Posts/lower rails 30 × 30 × 3; top rails 30 × 40 × 3.',3)
label(250,237,'Service carriers 20 × 20 × 3; four exposed floor fixings.',3)
label(15,251,'Design target: 2.0 kN aggregate vertical + 1.0 kN local point; service reaction 100 N horizontal / 200 N vertical.',3.3)
label(15,260,f'Original post movement {postDeflection:.3f} mm exceeds the 3 mm target. Joints, floor and actual fit remain unqualified.',3.3)
label(15,269,f"Straight north retirement reaches retained emitter envelope after {retirement['firstContacts'][0]['firstNorthContact_mm']} mm. Corrected route is not yet earned.",3.3)
label(15,279,f"Bare nominal members/feet/pad {mass:.2f} kg, excluding top, bowl, covers, connections and water. No mass/grip/crew pass.",3.1)
label(15,289,'The old 530 mm sink rim exceeds this 520 mm front opening. No old 800 mm cabinet or carrying proof transfers.',3.1)
v.append('</svg>');emit(out.with_suffix('.svg'),'\n'.join(v)+'\n')
