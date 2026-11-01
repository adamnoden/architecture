"""Source-bound service duties and finite crossings; no MEP or material approval."""
from pathlib import Path
import json, math, subprocess, sys, html

ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).with_suffix('')
PINS={
 'project/str/studies/house-plan.json':'d722ada30df5729852043f0010433a890e399999',
 'project/bcr/studies/services-feasibility.json':'7365a81b2b598aa79c35ad903aefe77cf18d76c3',
 'docs/reference-house/current-house-basis.md':'38306774af8e415441ddbc1f07db6ee4fa3a06f7',
 'project/mat/services-waste-joints.md':'046ea1cc6521bd51e5051df5aef4a7aed9571aaa',
 'project/str/studies/joined-rc-reference.json':'43091fe9516cc31bd827fc294827977b6b648777',
 'project/ias/studies/b-plan-riser-closure.json':'28d23b99bdec5f7edfc25cb193f1f1cd32b2c0b0',
}
for path,expected in PINS.items():
 actual=subprocess.check_output(['git','hash-object',path],cwd=ROOT,text=True).strip()
 if actual!=expected: raise ValueError('Reassess changed owning input: '+path)
B=json.loads((ROOT/'project/str/studies/house-plan.json').read_text())
OLD=json.loads((ROOT/'project/bcr/studies/services-feasibility.json').read_text())
assert B['service_disposition']['new_stacked_gross_riser']==[9410,4700,550,700]
assert B['ground_objects']['rear-stack']==B['first_objects']['rear-cabinet']==[417.5,10800,300,750]
assert B['first_objects']['rear-WC']==[717.5,11000,560,355]

def gap(p,r):
 return math.hypot(max(r[0]-p[0],0,p[0]-r[0]-r[2]),max(r[1]-p[1],0,p[1]-r[1]-r[3]))
def circle_inside(p,radius,r):
 return min(p[0]-radius-r[0],r[0]+r[2]-p[0]-radius,p[1]-radius-r[1],r[1]+r[3]-p[1]-radius)

joined={'status':'Four-lane candidate merged at6a953ef6; remains unadopted house geometry',
 'str':{'remoteHead':'329396f081ed6a2e882fa12e18bb76bc1905a317','tree':'f859b416a7913414cda78cff0af0fcf0f0cde46a','jsonBlob':'43091fe9516cc31bd827fc294827977b6b648777'},
 'ias':{'remoteHead':'910cd2d8807c4f7a78ac5f2614bcd0ce89369a54','tree':'8181590d6a8328a2542553b739a42df3a934ddeb','jsonBlob':'28d23b99bdec5f7edfc25cb193f1f1cd32b2c0b0'},
 'datum':'All z local to proposed ground FFL0; a later whole-house translation changes none of these differences',
 'ffl':3450,'rcTop':3370,'rcSoffit':3170,'ceiling':3100,'underSlabService':55,
 'formedBores':[[9500,4850,50],[9700,4850,50],[9800,5200,160]],
 'waterWitnessDuty':'IAS closed-water strainer task, not a selected domestic hot/cold circuit',
 'completeInventoryAccepted':False}

rear={'id':'R-01','cabinet':B['first_objects']['rear-cabinet'],'centre':[567.5,11177.5],
 'proposedFormedDiameter':160,'pipeBodyComparator':110,'structuralWestFace':402.5,
 'status':'Proposed crossing territory only; RC design and actual sanitary assembly not accepted',
 'branchAxisY':11177.5,'branchToCabinetEastFace':[622.5,717.5],
 'bodyTaskAfterWCRemoval':[1100,11177.5,300],
 'renewal':'Keep floor seal and independently supported upper/lower stack fixed for a local straight-section task above the floor; actual removable joints, branch levels, panel height and release stroke are unbound. The WC obstructs the east face at branch height: its prior renewal/removal is a dependency, not a free corridor.'}
rear['clearances']={'cabinetToBore':circle_inside(rear['centre'],80,rear['cabinet']),
 'westStructuralFaceToBore':rear['centre'][0]-80-rear['structuralWestFace'],
 'eastCabinetFaceToBore':rear['cabinet'][0]+rear['cabinet'][2]-rear['centre'][0]-80,
 'bodyToClosedCabinet':gap(rear['bodyTaskAfterWCRemoval'][:2],rear['cabinet'])-300,
 'bodyToOuterNorthFinish':11582.5-rear['bodyTaskAfterWCRemoval'][1]-300}
assert rear['clearances']['cabinetToBore']==70
assert rear['clearances']['westStructuralFaceToBore']==85
assert rear['clearances']['bodyToClosedCabinet']==82.5
# A bore at the cabinet's west edge fails even its geometric containment.
assert circle_inside([417.5,11177.5],80,rear['cabinet'])<0

def overlaps(a,b):
 return min(a[0]+a[2],b[0]+b[2])>max(a[0],b[0])+1e-8 and min(a[1]+a[3],b[1]+b[3])>max(a[1],b[1])+1e-8
def sweep(a,b,w,h,pad=0):
 assert a[0]==b[0] or a[1]==b[1]
 return [min(a[0],b[0])-pad,min(a[1],b[1])-pad,abs(a[0]-b[0])+w+2*pad,abs(a[1]-b[1])+h+2*pad]
def walls_rects():
 out=[]
 for w in B['first_walls']:
  (x,y),(xx,yy)=w['a'],w['b']; horizontal=y==yy
  lo,hi=(x,xx) if horizontal else (y,yy); at=y if horizontal else x
  cuts=sorted(set([lo,hi]+[v for pair in w['holes'] for v in pair if lo<v<hi]))
  for a,b in zip(cuts,cuts[1:]):
   if any(a>=l and b<=r for l,r in w['holes']):continue
   out.append((w['id'],[a,at-w['t']/2,b-a,w['t']] if horizontal else [at-w['t']/2,a,w['t'],b-a]))
 return out
pan_path=[[717.5,11000],[817.5,11000],[1500,11000],[1500,10622.5],[3800,10622.5]]
pan_obstacles=walls_rects()+[(n,r) for n,r in B['first_objects'].items() if n!='rear-WC']
pan_sweeps=[]
for index,(a,b) in enumerate(zip(pan_path,pan_path[1:])):
 r=sweep(a,b,560,355,100)
 if index==0:r[0]+=100;r[2]-=100 # Back-to-wall first100: no rear-hand space is claimed.
 assert 417.5<=r[0] and r[0]+r[2]<=11582.5 and r[1]>=417.5 and r[1]+r[3]<=11582.5
 for name,obstacle in pan_obstacles:assert not overlaps(r,obstacle),'Pan handling reservation hits '+name
 pan_sweeps.append(r)
parked_pan=[3800,10622.5,560,355]
panel={'face':717.5,'plan':[717.5,10950,2,455],'height':800,'z':[3500,4300],
 'massAt7850':.455*.8*.002*7850,'path':[[717.5,10950],[747.5,10950],[747.5,10200]],
 'temporaryRack':[600,10150,150,550],
 'rule':'Authored steel dry cover and temporary independent floor rack only; fixed stack/frame/penetration seals retained; no capacity, fixing or material admission'}
panel_sweeps=[sweep(a,b,2,455) for a,b in zip(panel['path'],panel['path'][1:])]
for r in panel_sweeps:
 for name,obstacle in pan_obstacles:
  if name=='rear-cabinet':continue # Renew its nonstructural face, not its frame or supported pipe.
  assert not overlaps(r,obstacle),'Panel sweep hits '+name
 assert not overlaps(r,parked_pan)
body_path=[[3100,10800],[1100,10800],[1100,11177.5]]
body_obstacles=pan_obstacles+[('parked pan',parked_pan),('temporary panel rack',panel['temporaryRack'])]
def seg_gap(a,b,r):
 dx=max(r[0]-max(a[0],b[0]),min(a[0],b[0])-r[0]-r[2],0)
 dy=max(r[1]-max(a[1],b[1]),min(a[1],b[1])-r[1]-r[3],0)
 return math.hypot(dx,dy)
body_margin=min(seg_gap(a,b,r)-300 for a,b in zip(body_path,body_path[1:]) for name,r in body_obstacles)
assert body_margin>=0
rear['maintenanceWitness']={'panPath':pan_path,'panHandlingPad':100,'first100Exception':'No rear-hand reserve for initial100 east movement from back-to-wall position; actual connector/fixing release must be separately accessible. A100 all-round handling envelope starts only after that movement.', 'panSweeps':pan_sweeps,'parkedPan':parked_pan,
 'panel':panel,'panelSweeps':panel_sweeps,'bodyPath':body_path,'bodyRadius':300,'bodyMinimumPlanMargin':body_margin,
 'door':'Actual rear-wet-east raw aperture y10350–11250; real leaf, jambs, handles and simultaneous handlers unmodelled',
 'limits':'Starts after safe water/waste/flush isolation and accessible fixing release; actual connection disengagement, ceramic projections, lifting/force and vertical transport remain unproved. Parked pan and rack temporarily occupy Bedroom4 floor; reverse the exact paths for reinstatement.'}
rear['panComparator']={'manufacturer':'Duravit','identity':'D-Code21150900002','source':'https://pro.duravit.co.uk/pro/html/default/402880943a1b6e1b013a1bd282eb0051.uk-en.html?ncat=toilets&nser=7120&product=94738',
 'retrieved':'2026-11-01','bareDimensions':[355,560,385],'bareMassKg':22,'outlet':'Rear horizontal, not a proved downward outlet',
 'unrecovered':'Exact outlet centre height, spigot projection/diameter/engagement and supplied tolerances. Native technical ZIP retrieval unsuccessful; do not infer180 or borrow another pan variant.'}

duties=[
 {'id':'F-REAR','fixtures':['rear-WC','rear-basin','rear-shower1000'],'level':'first','territory':'Rear stack/cabinet R-01, separate from east riser','needs':['soil/waste discharge','hot/cold supply as fixture design requires','trap protection/soil ventilation','room ventilation/extract strategy','electrical/lighting'],'crossing':'R-01 proposed; branch/outlet/vent/renewal unqualified'},
 {'id':'F-FAMILY','fixtures':['family-WC','family-basin','family-bath1700'],'level':'first','territory':'East family bath, aligned above plant','needs':['soil/waste discharge','hot/cold supply','trap protection/soil ventilation','room ventilation/extract strategy','electrical/lighting'],'crossing':'E-01 east stack candidate plus E-02 fixture-side branch territory; actual branch route unresolved'},
 {'id':'F-PRINCIPAL','fixtures':['principal-WC','principal-basin','principal-shower900'],'level':'first','territory':'East principal wet room north of family bath','needs':['soil/waste discharge','hot/cold supply','trap protection/soil ventilation','room ventilation/extract strategy','electrical/lighting'],'crossing':'No proved branch to E-01; cannot borrow family or pantry floor depth'},
 {'id':'G-WC','fixtures':['guest-WC-pan','guest-WC-basin'],'level':'ground','territory':'South-east WC','needs':['soil/waste discharge','water supply','room ventilation/extract strategy','electrical/lighting'],'crossing':'Ground external foul connection and distribution not shown by upper three bores'},
 {'id':'G-KITCHEN','fixtures':['north-sink-station','north-cooking-station'],'level':'ground','territory':'North-east kitchen','needs':['sink water/waste','separate cooker source capture','power/control and appliance replacement'],'crossing':'Ground routes/outside terminals; cooker extract is not the foul vent or an assumed MVHR duct'},
 {'id':'G-UTILITY','fixtures':[],'level':'ground','territory':'Utility room reservation','needs':['actual appliance inventory before fixing water/waste/power/extract'],'crossing':'Conditional; no appliance counts or terminals invented'},
 {'id':'G-PLANT','fixtures':['plant-water-reserve','Q350-body'],'level':'ground','territory':'Plant reservation, comparison bodies only','needs':['actual plant/system selection','isolation/draining/renewal','incoming water/electricity/data boundaries'],'crossing':'No selected heat-pump/MVHR duty; incoming site connections separately unresolved'},
 {'id':'DRY-ROOMS','fixtures':[],'level':'both','territory':'Four bedrooms, study, living, galleries/stair','needs':['lighting/power/data/control routes','heating distribution if selected','whole-house ventilation strategy'],'crossing':'Dedicated dry path and any heating/air crossings unallocated; room number does not prescribe cable/pipe count'},
]
for group in duties:
 objects=B['first_objects'] if group['level']=='first' else B['ground_objects']
 for name in group['fixtures']: assert name in objects

conditional=[]
for item in OLD['packing']['pack']:
 name=item['id']; w=item['w']; h=item['h']
 # This only asks whether an unchanged bounding rectangle could pass any one existing circular bore.
 suitable=[d for x,y,d in joined['formedBores'] if math.hypot(w,h)<=d]
 conditional.append({'inheritedObject':name,'envelope':[w,h],
  'authority':'Old BCR authored packing probe; not an actual required service or selected diameter',
  'unchangedRectangleFitsAnyExistingBore':bool(suitable),
  'warning':'No fitted insulation, joints, fire/acoustic seal or separation proof; do not infer service need from this test'})

sections={'bodyODComparator':110,'availableAboveSlab':3450-3370,'aboveSlabShortfallBeforeFall':110-(3450-3370),
 'availableUnderSlabServices':55,'underSlabShortfallBeforeSupport':110-55,
 'alternativeLocalLoweredCeiling':{'pipeTop':3170,'pipeBottom':3060,'ceilingThickness':15,'ceilingUnderside':3045,'dropFrom3100':55,
  'status':'Optimistic lower bound only: zero hangers, collars, fall and construction tolerance; actual route/door/headroom not granted'},
 'alternativeAboveSlabBranch':{'pipeTopAtZeroFall':3480,'heightAboveFFL':30,
  'status':'Optimistic zero bedding/support and zero fall. A real covered branch is higher; must avoid every fixture/body/door route. No raised wet floor selected'}}
assert sections['aboveSlabShortfallBeforeFall']==30 and sections['underSlabShortfallBeforeSupport']==55
# Reusing an obsolete 350-total floor allowance does not create a free service layer.
assert joined['ffl']-joined['ceiling']==20+60+200+55+15
assert not (110<=sections['availableAboveSlab'] or 110<=55)
principal=B['first_objects']['principal-WC']; principal_axis=principal[1]+principal[3]/2
sections['nearFixtureDropConflict']={'sourceFixture':principal,'axisY':principal_axis,'currentGroundEClearBand':[6825,7425],
 'currentGroundEFullBand':[6623.5,7626.5],'conditional160DropBand':[principal_axis-80,principal_axis+80],
 'status':'Conditional near-fixture vertical route would intersect the integrated unadopted E water passage; no such drop is currently selected. Replan foul branch or court route together, including next loggia trial.'}
assert 6825<principal_axis<7425

# E-02 is a finite compatibility design, not evidence that the current pan/fitting matches it.
# The coordinated principal port moved west to leave an honest terminal turn field.
collector_x=10800; cross_y=6500; arch_spring=2740; arch_r=160; ring=215; fall_ratio=40
principal_feed=[[11432.5,8040],[10800,8040],[10800,5200],[9800,5200]]
family_feed=[[11432.5,6077.5],[10800,6077.5],[10800,5200],[9800,5200]]
def length(path):return sum(abs(a[0]-b[0])+abs(a[1]-b[1]) for a,b in zip(path,path[1:]))
principal_to_wall=(11432.5-10800)+(8040-6500)
principal_start=arch_spring+principal_to_wall/fall_ratio
end_z=principal_start-length(principal_feed)/fall_ratio
family_start=end_z+length(family_feed)/fall_ratio
def stations(path,start):
 out=[[*path[0],start]];travel=0
 for a,b in zip(path,path[1:]):
  travel+=abs(a[0]-b[0])+abs(a[1]-b[1]);out.append([*b,start-travel/fall_ratio])
 return out
arch_corner_vertical=math.sqrt(arch_r**2-80**2)-80
wall_half_slope=85/40
arch_through_wall_corner=arch_corner_vertical-wall_half_slope
assert arch_corner_vertical>0 and arch_spring+arch_r+ring==3115
assert arch_through_wall_corner>0 and 80-wall_half_slope>0
assert joined['rcSoffit']-(arch_spring+arch_r+ring)==55
assert arch_spring-80>arch_spring-160
assert math.sqrt(120**2+120**2)>arch_r # A240square cannot pass;200 is now admitted geometrically.
assert abs(end_z-2682.5)<1e-8 and family_start==2745.25
ceiling_underside=2540; box_top=2900; assembly_half=80; panel_thick=20
assert end_z-assembly_half-panel_thick-ceiling_underside==42.5
# 400-wide ordinary route, with the northern terminal enclosure offset south to stay inside the pantry.
collector_boxes=[
 [10600,7760,952.5,400],
 [10600,5000,400,3160],
 [10600,5877.5,952.5,400],
 [9600,5000,1400,400],
]
assert max(r[0]+r[2] for r in collector_boxes)<=11582.5
assert max(r[1]+r[3] for r in collector_boxes)==8160
q=B['ground_objects']['Q350-body']
assert all(not overlaps(r,q) for r in collector_boxes)
assert all(not overlaps(r,B['ground_objects']['plant-water-reserve']) for r in collector_boxes)
# The collector avoids both existing plant entry/intermediate arch territories in plan.
entry=[9215,2750,170,900]; intermediate=[9650,3615,1400,170]
assert all(not overlaps(r,entry) and not overlaps(r,intermediate) for r in collector_boxes)
assert all(not overlaps(r,[9450,7767.5,900,400]) for r in collector_boxes) # Integrated pantry shelf.
sections['selectedConditionalCollector']={
 'status':'Selected finite compatibility design for development; no fixture, port or plumbing-system acceptance',
 'principalFeed':stations(principal_feed,principal_start),'familyFeed':stations(family_feed,family_start),
 'principalLength':length(principal_feed),'familyLength':length(family_feed),'fallDenominator':40,
 'principalFall':length(principal_feed)/40,'familyFall':length(family_feed)/40,'commonStackEntryCentre':end_z,
 'principalPort':[11432.5,8040,160],'familyPort':[11432.5,6077.5,160],
 'portRule':'Principal port coordinated as a proposal with MAT-INTERIORS; family port is an authored alternative requiring a moved pan/back service frontage. Neither creates drilling permission or inherits an actual outlet height.',
 'boxes':collector_boxes,'boxTop':box_top,'underside':ceiling_underside,'dropFrom3100':3100-ceiling_underside,
 'socketEvidence':{'identity':'BLUCHER811.XXX.110','pipeOD':110,'socketOD':123,'socketLength':57,'source':'https://www.blucher.com/dfsmedia/0533dbba17714b1ab581ab07a4cbb521/53115-source/639220620240000000/socketinfouk.pdf'},
 'compatibilityRequirements':{'maxInstalledLocalEnvelope':160,'maxTurnAlongEachTangent':200,'portSpoolMaxSquare':160,
  'maxTurnOutwardFromRouteAxis':80,'demonstratedRemovableStraightPiece':200,'freeRetainedTailEachEnd':250,'slipCouplingBodyEvidence':130,
  'warning':'These are authored procurement/design limits, not measured supplied bend/branch/support or guaranteed socket-release dimensions. Fixed straight160spool retained at the arch;200turns stay outside it for renewal independence even though their square fits the wider aperture. Measured products exceeding any requirement reject this design.'},
 'wallPort':{'centre':[10800,6500,2740],'clearSpan':320,'spring':2740,'bottom':2580,'intradosCrown':2900,'radialRing':215,'extrados':3115,
  'square160CornerVerticalClearanceAtMidplane':arch_corner_vertical,'wallThickness':170,'slopeCentreShiftAcrossHalfWall':wall_half_slope,
  'minimumThroughWallUpperCornerClearance':arch_through_wall_corner,'minimumThroughWallBottomClearance':80-wall_half_slope,'toRCSoffit':55,'eastAbutmentTerritory':11582.5-(10800+375),
  'alternatives':[{'clearSpan':d,'corner160ThroughWall':math.sqrt((d/2)**2-80**2)-80-wall_half_slope,'extrados':2740+d/2+215,'toRCSoffit':3170-(2740+d/2+215),'eastAbutment':11582.5-(10800+d/2+215)} for d in [240,320]],
  'square200ThroughWallCorner':math.sqrt(160**2-100**2)-100-wall_half_slope,
  'rule':'Fixed straight spool and qualified floor/wall boundary retained. Arch ring, abutments, load transfer and movement need STR design; no capacity follows from geometric fit.'},
 'maintenanceModule':{'centreline':[10800,6900,10800,7100],'length':200,'retainedTailTerritories':[[10800,6650,10800,6900],[10800,7100,10800,7350]],'slipBodyLength':130,
  'freeTailMinusSleeveBody':120,'southTailMinusWallNorthFace6585':65,'D50JunctionStart7400MinusNorthTail':50,
  'fixedSupportStations':[6625,7375],'supportAxialWidthRequirement':20,
  'undersideOpening':[10620,6600,360,800],'handlingCradleFootprint':[10500,6800,600,800],
  'requiredControlledLowering':500,'pipeLowestAfterLowering':2750-500-80,
  'rule':'250 tail territory must contain the entire actual parked130 sleeve, its release stroke, clamps and margins;120 arithmetic remainder is not the required stroke or a qualified removal. No ordinary joint lies within the fixed wall spool or D50 junction. The actual independent support/access/handling equipment must fit the declared floor territory; no equipment capacity or human operation is proved. This is one200 inspection/renewal spool, not a direction to joint all runs every200.'},
 'maintenance':'Remove independently supported underside panels, retain wall spool and floor seals, isolate affected appliances and drain, support both fixed ends, park the actual sleeves within the250 retained-tail territories around the200 branch-free spool, then lower it500 under controlled support. Actual sleeve/union stroke, water containment, fixings, working access and reinstatement must meet those design requirements.',
 'material':'EuroPipe geometric comparator has required elastomer/lubricant/accessory duties; it does not pass the material policy. No seals or hangers are removed to obtain a metal label.',
 'supports':'Independently anchored hangers above the removable face, outside the160 local envelope where rods continue to RC; actual spacing, loads, anchors and acoustic/fire isolation unqualified',
 'roomCost':'Local collector underside2540,560 below current3100. Source plant bodies and integrated pantry shelf clear in plan only; full installed overhead apparatus remains to reconcile. Existing plant arches are avoided in plan; the new port is explicit, not an unnoticed hole.'}
assert not overlaps([10500,6800,600,800],[9450,7767.5,900,400])
assert 6650>6585 and 7350<7400
d50_path=[[10200,6810],[10200,7500],[10800,7500]]
d50_join=arch_spring+(7500-cross_y)/40
d50_start=d50_join+length(d50_path)/40
assert d50_start==2797.25 and d50_join==2765
drop_interface={
 'schemaVersion':1,'id':'B-PRINCIPAL-SHOWER-DROP-01','units':'mm','datum':'Local proposed ground FFL0',
 'status':'Authored compatibility interface; no actual fitting, material, hydraulic or installed operation acceptance',
 'authority':'Coordinated MAT-INTERIORS120-rim trial; upper fixture/frame/outlet remains unqualified',
 'formedFloorPort':[10200,6810,110],'pipeOD':50,'retainedDropMaxEnvelope':100,
 'turnT':{'point':[10200,6810,d50_start],'maxEnvelope':[100,100,100]},
 'unionA':{'point':[10200,6810,3000],'axis':'vertical','maxOD':100,'maxAxialLength':100},
 'unionB':{'point':[10200,6910,d50_start-100/40],'axis':'north','maxOD':100,'maxAxialLength':100},
 'requiredFaceRelease':50,
 'clearUndersideAperture':[10000,6640,400,400],'outerApertureFrame':[9980,6620,440,440],
 'path':[stations(d50_path,d50_start)[0],[10200,6910,d50_start-2.5],*stations(d50_path,d50_start)[1:]],'length':length(d50_path),
 'fallDenominator':40,'fall':length(d50_path)/40,'soilJoin':[10800,7500,d50_join],
 'unionABelowRCSoffit':170,'fixedTailFromRCTopToUnionA':370,
 'boxing':{'lowestFittingAtJoin':2715,'supportDepth':25,'supportBottom':2690,'finalAirReserve':25,'panelTop':2665,'panelThickness':20,'finishedUnderside':2645,'width':320},
 'renewal':{'installedSpoolBounds':[10150,6760,2744.75,100,200,305.25],'firstMovement':[0,-50,-50],'subsequentLowering':[0,0,-400],
  'firstMovementLowest':2694.75,'fullyLoweredHighest':2600,'fullMovingPlanBounds':[10150,6710,100,250],
  'clearancesToAperture':{'west':150,'east':150,'south':70,'north':80},'toolDiameterSensitivity':200,
  'retained':'Upper outlet/drop tail, both floor seals, fixed unionA half and downstream fixed unionB half; independent supports retained',
  'rule':'Both accessible flat-face unions released before the supported elbow spool moves50south+50down. This is a required compatible joint action, not proof of a particular named union. Then lower400 under independent control through the open face; reverse with actual new seals and tests.'},
 'soilJunctionMaxEnvelope':[200,200,200],
 'upperRenewalBoundary':'MAT-INTERIORS owns the separate upper tray/tail withdrawal: the100 upper unionA half is retained only for ordinary lower-spool work. Full upper withdrawal must strip every nut/clamp/half exceeding its75 stem requirement below first, to pass its97 clear sleeve in the110 port. Actual kit strippability is unproved; an unstrippable100 part rejects that upper renewal. Interiors owns its500 upward stroke and explicit upper-FFL-relative handling coordinates; no reverse source import.',
 'rule':'Fixed outlet/drop tail and floor seals remain during ordinary below-slab union renewal.100OD unions plus50release and200tool sensitivity must fit the400clear underside opening; actual unions, matching tail and trapping/flow not proved. The low120rim replaces the former250step only if actual retained tail/drop and frame/outlet fit these requirements. No horizontal D50 route crosses the upper doorway.',
 'material':'Manufacturer-matched B568 geometry control retains PP/seals; no material admission or altered seal package. Actual component duty, hydraulic flow, support and joint recipe remain MAT-INTERIORS/MAT-SERVICES acceptance dependencies.'}
assert drop_interface['unionB']['point'][2]==2794.75
assert drop_interface['boxing']['supportBottom']-drop_interface['boxing']['panelTop']==25
assert drop_interface['boxing']['panelTop']-drop_interface['boxing']['finishedUnderside']==20
assert 2600<drop_interface['boxing']['finishedUnderside']

data={'title':'Compact B service-demand, crossing and renewal reconciliation','baselineMain':'6a953ef6d3131364aca740eaff2a06f301adbc2e',
 'sourceBlobs':PINS,'joinedReference':joined,'fixtureDuties':duties,'inheritedPacking':conditional,
 'interfaces':{'principalShowerDrop':drop_interface},
 'boundedRewindLedger':{'id':'B-SERVICES-REWIND-01','status':'Explicit conditional design ledger; no accepted geometry or cyclic cross-owner source hashes',
  'outerEnvelope':417.5,'eastDryFace':11582.5,'eastStructuralFace':11597.5,'eastStructuralOuterFace':11737.5,
  'principalWetLining':30,'principalEastWetFace':11567.5,'principalSouthWetFace':6600,
  'principalPort':[11432.5,8040,160],'portToStructuralFace':85,'portToWetFace':55,
  'principalColumn':[11342.5,7950,180,180],'columnToWetFace':45,
  'rejectedEarlierPort':[11492.5,8040,160],'rejectedEarlierStructuralGap':25,
  'loggiaWall':'507.5 applies only to the new loggia sidewalls, not the existing outer house envelope',
  'principalFixture':'Latest MAT-INTERIORS/HAD north-facing WC/door and120-rim shower are a bounded room rewind; source original WC remains the7277.5 adverse control, not the selected new port position',
  'familyPort':'11432.5/6077.5 is an authored compatibility alternative, not a relocated family WC acceptance; its back service frontage/body route must be reconciled by HAD/IAS',
  'outerWallMaterials':'417.5 is still a reference reservation; whole thermal/moisture/material recipe remains MAT-ENVELOPE scope'},
 'rearCrossingProposal':rear,'eastBranchDepth':sections,
 'materialBoundary':{'EuroPipe110':'123 socket OD, 57 socket length and 40–62 engagement are component evidence only; elastomer seals/lubricant and actual slip release remain unqualified',
  'HeritageNominal100':'Existing April2026 evidence says actual114 body; cannot relabel it110 or reuse an unmeasured caulked socket envelope',
  'wholeAssembly':'No product/system or polymer exception selected. Keep floor seals independent during ordinary renewal.'},
 'disposition':'REJECT whole-house service acceptance of the three-bore witness. Develop R-01 and a deliberate E-02 branch section, retain conditional air/heating/dry service territories, then re-enter STR before any new penetration is selected.',
 'unlockedDecision':'The rear sanitary crossing is a separate floor design input; the east 110 branch needs an explicit vertical/route change. A whole-floor solid-slab freeze cannot omit these duties.',
 'notProved':['whole-house actual bill of materials','hydraulic sizing/fall or trap/vent design','complete ventilation/heating choice','electrical circuit design/segregation','structural resistance around new holes','fire/acoustic/moisture seals','material admission','physical operation or installation']}

def txt(x,y,s,size=3,fill='#223740'):
 return f'<text x="{x}" y="{y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{size}" fill="{fill}">{html.escape(str(s))}</text>'
def rect(x,y,w,h,fill,stroke='#54666b'):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width=".35"/>'
def line(x,y,xx,yy,color='#54666b',dash=''):
 return f'<path d="M{x} {y}L{xx} {yy}" fill="none" stroke="{color}" stroke-width=".4" stroke-dasharray="{dash}"/>'
def page(title,body):
 return '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">'+rect(0,0,420,297,'#fffdf8','none')+txt(16,18,title,5)+txt(16,27,'1 November 2026 · unadopted B reference candidate · dimensions mm · not a construction or material issue',2.9)+''.join(body)+line(16,279,404,279)+txt(16,288,'Whole-house duties retained; no invented system selection, complete service fit or polymer exception.',2.8)+'</svg>\n'

s=[]
s+=[txt(16,43,'A  FIRST-FLOOR FIXTURE DUTIES / PLAN 1:100',3.4)]
X=lambda x:20+x/100; Y=lambda y:51+(12000-y)/100
s+=[rect(X(0),Y(12000),120,120,'#eee9df'),rect(X(4250),Y(7750),35,35,'#dcece4')]
for group in duties[:3]:
 for name in group['fixtures']:
  r=B['first_objects'][name];s.append(rect(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#d5c3a0'))
for r in [rear['cabinet'],[9385,4675,600,750]]:s.append(rect(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'none','#a14738'))
s += [f'<circle cx="{X(567.5)}" cy="{Y(11177.5)}" r=".8" fill="#a14738"/>',txt(24,55,'R-01',2.8,'#a14738'),txt(111,120,'E-01',2.8,'#a14738'),txt(20,182,'Rear and east wet groups are separate crossings.',2.9),txt(20,191,'Upper fixtures are source objects, not selected products.',2.9)]
rows=[('R-01 rear sanitary','New territory within existing 300×750 cabinet.'),('E-01 east stack','Two50 + one160 bores are only a local witness.'),('E-02 east branches','110 body fails80 upper and55 lower service bands.'),('Domestic hot/cold','No assigned circuits or third/fourth supply ports.'),('Dry services','Power/data route and boundary crossing unallocated.'),('Air / heating','System choice remains open; no two250 duct mandate.'),('Ground / roof','Incoming services, foul outfall and soil vent not fitted.')]
for i,(a,b) in enumerate(rows):s += [txt(166,47+i*17,a,3.2),txt(166,54+i*17,b,2.9)]
s += [txt(16,215,'B  INHERITED PACKING IS A STRESS CONTROL, NOT AN INSTALLED INVENTORY',3.3),txt(16,226,'BCR probes: 2×250 ducts, 3×72 water envelopes, 110 soil body and100×50 dry containment.',3),txt(16,236,'The current-house basis withholds historical MVHR / heat-pump routes. Do not force them into B.',3),txt(16,246,'Conversely, deleting those probes does not delete actual room ventilation, water, foul or power duties.',3),txt(16,259,'Decision: keep rear R-01 and resolve east branch depth before freezing a whole-floor solid-slab design.',3.1,'#a14738'),txt(16,269,'No new bore is authorised by this drawing. Structural review must bind actual product, boundary and reinforcement.',2.9)]

t=[txt(16,43,'C  REAR CROSSING / PLAN 1:5',3.4)]
RX=lambda x:30+(x-402.5)/5; RY=lambda y:55+(11582.5-y)/5
t += [rect(RX(417.5),RY(11550),60,150,'#eee6d6'),rect(RX(717.5),RY(11355),112,71,'#dac39b'),line(RX(402.5),RY(11582.5),RX(402.5),RY(10800)),f'<circle cx="{RX(567.5)}" cy="{RY(11177.5)}" r="16" fill="#fff" stroke="#a14738" stroke-width=".5"/>',f'<circle cx="{RX(567.5)}" cy="{RY(11177.5)}" r="11" fill="#a9c7bd"/>',line(RX(622.5),RY(11177.5),RX(717.5),RY(11177.5),'#a14738','1 1')]
t += [txt(16,221,'Proposed centre567.5 /11177.5;160 bore territory,110 body.',2.9),txt(16,230,'85 to west structural face;70 to cabinet east face.',2.9),txt(16,239,'WC overlaps service face at branch height: prior WC release required.',2.8),txt(16,248,'Stack support and floor seal stay; exact sockets / panel / tools unknown.',2.8)]
t += [txt(246,43,'D  EAST BRANCH DEPTH / SECTION 1:5',3.4)]
Z=lambda z:54+(3450-z)/5
t += [rect(254,Z(3450),90,4,'#d4be99'),rect(254,Z(3430),90,12,'#ece6d5'),rect(254,Z(3370),90,40,'#bac6c1'),rect(254,Z(3170),90,11,'#fff'),rect(254,Z(3115),90,3,'#e9e6dc')]
t += [f'<circle cx="{278}" cy="{Z(3425)}" r="11" fill="none" stroke="#a14738" stroke-width=".5"/>',f'<circle cx="{321}" cy="{Z(3115)}" r="11" fill="none" stroke="#a14738" stroke-width=".5"/>']
for z,label in [(3450,'FFL3450'),(3370,'RC top3370'),(3170,'RC soffit3170'),(3100,'Ceiling3100')]:t += [line(347,Z(z),353,Z(z)),txt(356,Z(z)+1,label,2.7)]
for i,label in enumerate(['110 OD circle exceeds upper80 by30 before fall.','Below RC,110 needs55 more than the55 service band.','Zero-fall optimistic alternative ceiling:3045 (55 lower).','Supports, fall, collars and tolerance increase the drop.','Above-slab boxing / raised wet floor or local dropped','branch route must preserve the occupied room below.','No concealed drilling, omitted boundary or ceiling','change is selected. Bind actual sanitary outlets first.']):t.append(txt(246,147+i*9,label,2.8))
t += [txt(16,265,'R-01 is a located proposal, not proof of 160 seal fit or RC adequacy. E-02 is an explicit section rewind, not spare floor depth.',2.9)]
u=[txt(16,43,'E  REAR PAN / DRY COVER / INSPECTION STATES · PLAN 1:20',3.5),'<defs><clipPath id="rear-plan"><rect x="16" y="49" width="220" height="107"/></clipPath></defs><g clip-path="url(#rear-plan)">']
UX=lambda x:20+(x-417.5)/20; UY=lambda y:54+(11582.5-y)/20
for name,r in pan_obstacles:
 if name.startswith(('rear-','bed4-island')):
  u.append(rect(UX(r[0]),UY(r[1]+r[3]),r[2]/20,r[3]/20,'#dfd8c7'))
for r in pan_sweeps:u.append(rect(UX(r[0]),UY(r[1]+r[3]),r[2]/20,r[3]/20,'none','#b7855c'))
u += [rect(UX(parked_pan[0]),UY(parked_pan[1]+parked_pan[3]),28,17.75,'#d8b886'),rect(UX(600),UY(10700),7.5,27.5,'#aebcc0')]
for a,b in zip(pan_path,pan_path[1:]):u.append(line(UX(a[0]+280),UY(a[1]+177.5),UX(b[0]+280),UY(b[1]+177.5),'#a45e35'))
for a,b in zip(body_path,body_path[1:]):u.append(line(UX(a[0]),UY(a[1]),UX(b[0]),UY(b[1]),'#277775'))
for p in body_path:u.append(f'<circle cx="{UX(p[0])}" cy="{UY(p[1])}" r="15" fill="none" stroke="#277775" stroke-width=".3"/>')
u.append('</g>')
u += [txt(16,165,'Brown:pan plus100 handling sensitivity; initial100east claims no rear-hand space. Green:separate body route.',2.9),txt(16,175,'Raw900 door aperture only; stage pan at3800/10622.5 in Bedroom4, clear of wardrobe.',2.9),txt(16,185,'Steel dry face455×800×2 ≈5.71kg; release30 east, then750 south onto a separate rack.',2.9),txt(16,195,'Permanent cabinet frame, supported stack and floor seals stay. No person enters the cabinet.',2.9)]
for i,label in enumerate(['1  Isolate water / flush / foul use; support and release actual pan connections and fixings.',
 '2  Withdraw pan east, shift south, pass raw doorway and park; retain every connection tail in actual handling proof.',
 '3  Support dry cover, release room-side fixings, translate30east then750south to independently supported rack.',
 '4  Inspect from the separate body path; only renew a bounded supported pipe section with actual proved joints.',
 '5  Restore/test boundaries, reverse cover and pan paths; inspect every disturbed joint and dry affected surfaces.']):u.append(txt(16,214+i*10,label,2.9))
u += [txt(16,270,'This finite plan witness does not prove safe ceramic handling, real connector release, seal material or a tested sanitation system.',2.9,'#a14738')]
v=[txt(16,43,'F  CHOSEN CONDITIONAL GROUND COLLECTOR · PLAN 1:25',3.4)]
VX=lambda x:20+(x-9200)/25; VY=lambda y:55+(8400-y)/25
for r in collector_boxes:v.append(rect(VX(r[0]),VY(r[1]+r[3]),r[2]/25,r[3]/25,'#f0dfbd'))
for label,path in [('P',principal_feed),('F',family_feed)]:
 for a,b in zip(path,path[1:]):v.append(line(VX(a[0]),VY(a[1]),VX(b[0]),VY(b[1]),'#287c7c'))
 v.append(txt(VX(path[0][0])+2,VY(path[0][1]),label,3.2))
for a,b in zip(d50_path,d50_path[1:]):v.append(line(VX(a[0]),VY(a[1]),VX(b[0]),VY(b[1]),'#466cb2'))
v += [f'<circle cx="{VX(10200)}" cy="{VY(6810)}" r="2" fill="#466cb2"/>',txt(VX(10200)-12,VY(6810)+6,'D50',2.8,'#466cb2')]
v += [line(VX(9300),VY(6500),VX(11582.5),VY(6500),'#596b70','2 1'),rect(VX(10680),VY(6585),9.6,6.8,'none','#a24d36'),txt(156,74,'Plant north wall / proposed new port',2.8),txt(156,84,'x10800 / y6500 / centre z2740',2.8)]
for i,label in enumerate(['P feed4472.5 at1:40:111.8125 fall.', 'F feed2510 at1:40:62.75 fall.', 'Shared stack entry centre z2682.5.', '400 route boxing, northern edge8160.', 'Underside2540: local560 ceiling cost.', '123 socket evidence;160 installed limit.', 'Fixed wall spool retained for renewal.', '200 renewal spool;250 retained tails.', '130 sleeve body is not release travel.', 'D50 first union A:10200/6810/z3000.']):v.append(txt(156,104+i*9,label,2.8))
v += [txt(16,227,'Chosen arch320 clear: spring2740 /crown2900 /215ring→3115 /55 below RC3170.',3),txt(16,237,'160square corners56.44 through170wall at1:40;200square22.77;240square fails. Fixed spool retained.',2.9),txt(16,247,'Principal port11432.5/8040 remains conditional; family feed requires its own fixture/frontage rewind.',2.9),txt(16,257,'No full-height stack passes through ground E containment. Source door arches avoided; new wall port needs STR.',2.9),txt(16,270,'Local dropped service boxing is the chosen development cost. Actual outlet geometry, fittings, boundary and operation remain unaccepted.',2.8,'#a14738')]
w=[txt(16,43,'G  PRINCIPAL COLLECTOR / DEVELOPED PROFILE · 1:20',3.3),txt(266,43,'H  NEW WALL PORT · 1:5',3.3)]
HX=lambda d:16+d/20; HZ=lambda z:54+(3500-z)/20
w += [rect(HX(0),HZ(3370),length(principal_feed)/20,10,'#bec8c2'),line(HX(0),HZ(3450),HX(length(principal_feed)),HZ(3450)),line(HX(0),HZ(2540),HX(length(principal_feed)),HZ(2540),'#aa7754','2 1')]
travel=0; prev=principal_feed[0]; profile=[[0,principal_start]]
for a,b in zip(principal_feed,principal_feed[1:]):
 travel+=abs(a[0]-b[0])+abs(a[1]-b[1]);profile.append([travel,principal_start-travel/40])
for a,b in zip(profile,profile[1:]):
 for dz in [-80,80]:w.append(line(HX(a[0]),HZ(a[1]+dz),HX(b[0]),HZ(b[1]+dz),'#327c7a'))
w += [line(HX(principal_to_wall),HZ(3115),HX(principal_to_wall),HZ(2580),'#9e584c'),txt(16,117,'160 installed design envelope, including actual123 socket control.',2.8),txt(16,126,'Start2794.3125 →fixed wall spool2740 →retained east stack2682.5.',2.8),txt(16,135,'RC soffit3170 stays. Removable local boxing underside2540.',2.8),txt(16,144,'Upper drop port and sealed tail stay during below-ceiling service.',2.8)]
CX=329; CY=140
w += [f'<path d="M{CX-75} {CY} A75 75 0 0 1 {CX+75} {CY} L{CX+32} {CY} A32 32 0 0 0 {CX-32} {CY} Z" fill="#d9c4a5" stroke="#6e665c" stroke-width=".4"/>',line(CX-32,CY,CX-32,CY+32),line(CX+32,CY,CX+32,CY+32),line(CX-32,CY+32,CX+32,CY+32),rect(CX-16,CY-16,32,32,'none','#2b7d7b'),f'<circle cx="{CX}" cy="{CY}" r="12.3" fill="none" stroke="#567fbd" stroke-width=".4"/>',line(254,54,404,54),txt(266,62,'RC soffit3170; arch extrados3115',2.7),txt(266,182,'320clear /160square /actual123socket',2.7),txt(266,191,'Corners56.44; bottom77.88 through wall.',2.7),txt(266,200,'200square fits22.77;240square fails.',2.7)]
for i,label in enumerate(['Inspection spool:200 atx10800/y6900–7100; retained250 tails6650–6900 and7100–7350.',
 'These avoid fixed wall north face6585 by65 and D50 junction start7400 by50.130 sleeve leaves120 gross in each tail.',
 'No actual release stroke is inferred.400/750 spools at this position clash with the new D50 branch or its parked sleeves.',
 'Independent supports at6625/7375; required20 axial width.300–360 clear underside access; controlled500 lowering.',
 'A600×800 handling-aid territory in the pantry is a requirement, not selected lifting equipment or floor-load proof.']):w.append(txt(16,217+i*10,label,2.8))
w += [txt(16,270,'Port/ring/abutments, actual fitting axes, hangers and reversible boundary reinstatement remain specific acceptance dependencies.',2.8,'#a14738')]
outputs={'.json':json.dumps(data,indent=2)+'\n','-duties.svg':page('B SERVICES / WHOLE-HOUSE DUTIES BEFORE THREE-BORE ACCEPTANCE',s),'-crossings.svg':page('B SERVICES / REAR CROSSING AND EAST BRANCH SECTION',t),'-renewal.svg':page('B SERVICES / REPEATABLE REAR INSPECTION WITHOUT FLOOR REMOVAL',u),'-collector.svg':page('B SERVICES / FINITE CONDITIONAL GRAVITY COLLECTOR',v),'-collector-section.svg':page('B SERVICES / CONNECTED PROFILE AND RETAINED WALL SPOOL',w)}
for suffix,content in outputs.items():
 path=BASE.parent/(BASE.name+suffix)
 if '--check' in sys.argv:
  assert path.read_text()==content,'Stale output: '+str(path)
 else:path.write_text(content)
print('B services: source duties retained; rear160 territory located;110 branch rejects80/55 bands; three-bore whole-house acceptance rejected')
