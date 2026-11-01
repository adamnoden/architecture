"""Finite pre-site services baseline, not product/engineering/material acceptance."""
from pathlib import Path
import hashlib, html, json, math, subprocess, sys

ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).with_suffix('')
HEAD='c83a06f26cf3b146d7cdc8254b4799f390508196'
PATH='project/had/studies/open-north-loggia.json'
BLOB='b15df3b374717d8b3a724900036525a5cd991d22'
try:raw=subprocess.check_output(['git','show',HEAD+':'+PATH],cwd=ROOT,stderr=subprocess.PIPE)
except subprocess.CalledProcessError:
 raise SystemExit('Missing immutable HAD input. Prepare explicitly: git fetch origin '+HEAD+'; then rerun. Do not substitute current geometry.')
assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==BLOB
b=json.loads(raw)
FIRE_HEAD='a324a50d047843603d6fc275c4062bc9d0c1cb90'
FIRE_BLOB='1412e628aa6b539664c8f5efd507595623cf2a21'
fire_raw=subprocess.check_output(['git','show',FIRE_HEAD+':'+PATH],cwd=ROOT)
assert hashlib.sha1(b'blob '+str(len(fire_raw)).encode()+b'\0'+fire_raw).hexdigest()==FIRE_BLOB
fire_house=json.loads(fire_raw)
fire=fire_house['protectedRoute']
shared_path=ROOT/'project/mat/studies/services-b-joined-inventory.json'
shared=json.loads(shared_path.read_text())['interfaces']['principalShowerDrop']
assert hashlib.sha256(json.dumps(shared,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()=='4c2494a8e86f88d38e313e726364e716e8ac58ed077ff12f341f96b4045ed400'

def length(p):return sum(math.dist(a,c) for a,c in zip(p,p[1:]))
def overlap(a,c):return min(a[0]+a[2],c[0]+c[2])>max(a[0],c[0]) and min(a[1]+a[3],c[1]+c[3])>max(a[1],c[1])
def area_union(rs):
    xs=sorted(set(x for r in rs for x in [r[0],r[0]+r[2]])); total=0
    for x,xx in zip(xs,xs[1:]):
        ys=sorted((r[1],r[1]+r[3]) for r in rs if r[0]<xx and r[0]+r[2]>x)
        end=-1e20; n=0
        for y,yy in ys:n+=max(0,yy-max(y,end));end=max(end,yy)
        total+=(xx-x)*n
    return total

# Conservative inside-envelope area includes internal walls, stairs and fixtures.
# It excludes the court including its wall thickness, the new weatherwall/notch,
# and the actual upper entrance void. It is NOT a certified net/TFA/SAP area.
inside=12000-2*b['envelope']; court_outer=3500+2*b['envelope']
ring=(inside**2-court_outer**2)/1e6
ground=ring-(7707.5-4292.5)*(11582.5-8167.5)/1e6
upper=ring-b['void'][2]*b['void'][3]/1e6
area=ground+upper
air={'basis':'Conservative geometric floor-area upper bound, not regulatory measured area',
 'groundM2':ground,'upperM2':upper,'totalM2':area,'oldBControlM2':2*ring-b['void'][2]*b['void'][3]/1e6,
 'clearHeightControl':3.1,'volumeControlM3':area*3.1,'bedrooms':4,'designOccupancyRange':[2,6],
 'floorCriterionLps':area*.3,'bedroomCriterionLps':37,'selectedNormalLps':65,
 'floorAreaLimitAtSelectedFlowM2':65/.3,'normalACHControl':65*3.6/(area*3.1),
 'status':'Author-selected pre-site targets. No actual household, measured air leakage, pollution, climate or commissioning result.'}
assert air['floorCriterionLps']<65 and air['oldBControlM2']*.3<65

# Each duct station is entirely in its wet room and its own outer wall.
# Pod500wide x650projection x300high. Real K125EC dimensional comparator is246
# diameter/203axial plus40x88 terminalbox;326x300 is a conservative wholefan bound.
# No supplier model is claimed to meet the curve/noise/material requirement yet.
extract=[]
for name,level,wall,at,q,minimum in [
 ('ground-WC',0,'south',9000,8,6),('utility',0,'east',900,8,8),
 ('kitchen',0,'north',11382.5,13,13),('rear-bath',1,'west',9300,12,8),
 ('family-bath',1,'east',5750,12,8),('principal-bath',1,'east',6750,12,8)]:
    ffl=level*3450;axis=ffl+2950
    face=11567.5 if level and wall=='east' else 11582.5
    if wall=='east': start=[face-650,at,axis];end=[12000,at,axis];pod=[face-650,at-250,650,500]
    elif wall=='west':start=[1067.5,at,axis];end=[0,at,axis];pod=[417.5,at-250,650,500]
    elif wall=='north':start=[at,10932.5,axis];end=[at,12000,axis];pod=[at-250,10932.5,500,650]
    else:start=[at,1067.5,axis];end=[at,0,axis];pod=[at-250,417.5,500,650]
    # Full terminal, not just tube, must preserve90% of125 duct area.
    extract.append({'id':name,'level':level,'wall':wall,'normalLps':q,'minimumHighComparator':minimum,
      'axis':axis,'path':[start,end],'ductClear':125,'exhaustRadialInsulation':50,
      'exhaustInsulatedOD':227,'formedWallTerritory':280,
      'ductVelocityMps':q/1000/(math.pi*.125**2/4),'podPlan':pod,
      'podZ':[ffl+2800,ffl+3100],'fanMaxBody':[326,300],
      'clearPanel':[400,450],'panelFrameOuter':[450,500],
      'maintenanceBelowPanelClearHeight':ffl+2700,
      'fanTask':'Whole326wide×300axial envelope lowers through400×450 clear aperture:37 lateral/75 axial reserve. Two independently supported duct ends retained; actual collars/tool/release length must fit650pod. Complete fan/terminalbox retained, no factory insulation stripped.',
      'comparatorReference':'fanDimensionComparator; dimensions never prove duty/noise/material or exactrelease',
      'requiredCurve':'Normal duty at40Pa pre-site screen (30duct/terminal allowance +10room/transfer); actual total resistance/wind and noise must be verified, not free-air rating',
      'requiredExternalTerminalFreeArea':.9*math.pi*125**2/4,
      'status':'Territory/compatibility envelope; lintel/core/support/fire/weather/acoustic/product fit not approved'})
principal=next(x for x in extract if x['id']=='principal-bath')
principal['podPlan']=[10917.5,7150,650,500]
principal['path']=[[10917.5,7400,6400],[11300,7400,6400],[11300,7400,6060],[12000,7400,6060]]
principal['descenderPlan']=[11237.5,7235,330,330]
principal['descenderZ']=[5880,6550]
principal['windowRequirement']='Chosen generous trial: retain totalheadFFL+2850, fixedinsulated uppercassette2370–2850 (480high), opening-leafhead≤2370.280full portcentrey7400/z2610. Actual archhead/mullion intrusion≤75 leaves25raw-geometricreserve; pod/descender finishedunderside2430 leaves60toleaf. Actual OAS family/thermal/fire/weather/operation still unearned.'
principal['cassette']={'band':[2370,2850],'port':[7400,2610,280],
 'actualGeneralArchControl':{'span':1000,'spring':2550,'crown':2850,'rise':300,
  'radius':1000**2/(8*300)+300/2,'centreZ':2850-(1000**2/(8*300)+300/2)},
 'rawHeadAndBottomClearance':100,'maximumActualHeadMullionIntrusion':75,'requiredFinalReserve':25,
 'scope':'Source general segmentalarch tested, not a matched timberframe; no masonrycut or raw-to-frame substitution.50mm exhaustinsulation included in225OD;280territory includes sleeve/seal requirement.'}
ac=principal['cassette']['actualGeneralArchControl']
assert abs(ac['radius']-(2610-ac['centreZ']+140)-100)<1e-8
assert 2610-140-2370==100
assert 2610+140+75+25==2850
principal['failedPierControl']={'oldCentre':6750,'availableBetweenWetFaceAndWindow':300,
 'old180BodyOnlyReserve':60,'full280Reserve':10,'minimumRequiredReserve':25,'pass':False}
wc_fan=next(x for x in extract if x['id']=='ground-WC')
wc_fan['podPlan']=[8600,417.5,500,650]
wc_fan['path']=[[8850,1067.5,2950],[8850,800,2950],[9000,650,2950],[9000,0,2950]]
kitchen_fan=next(x for x in extract if x['id']=='kitchen')
kitchen_fan['podPlan']=[9900,9950,500,650]
kitchen_fan['path']=[[10150,9950,2950],[10150,10150,3010],[10150,10750,3010],[11282.5,10750,3010],[11282.5,12000,3010]]
wc_fan['podPlan']=[7950,1300,500,650]
wc_fan['path']=[[8200,1600,2950],[8400,1600,3010],[8950,1600,3010],[8950,0,3010]]
utility_fan=next(x for x in extract if x['id']=='utility')
utility_fan['podPlan']=[10800,1650,650,500]
utility_fan['path']=[[10800,1900,2950],[11000,1900,3010],[11275,1900,3010],[11275,900,3010],[12000,900,3010]]
rear_fan=next(x for x in extract if x['id']=='rear-bath')
rear_fan['podPlan']=[1050,9150,650,500]
rear_fan['path']=[[1700,9400,6400],[750,9400,6400],[750,9300,6400],[0,9300,6400]]
family_fan=next(x for x in extract if x['id']=='family-bath')
family_fan['podPlan']=[10225,5200,650,500]
family_fan['path']=[[10875,5450,6400],[11275,5450,6400],[11275,5750,6400],[12000,5750,6400]]
principal['podPlan']=[10425,6650,650,500]
principal['path']=[[11075,6900,6400],[11275,6900,6400],[11275,7400,6400],[11275,7400,6060],[12000,7400,6060]]
for x in extract:
 x['fullRouteLengthMM']=length(x['path'])
 x['maintenancePlatformMaximum']=[700,700,400]
 x['platformStatus']='Complete rated stable workplatform includingfeet mustfit700square at≤400workingheight; actualload/guard/access/manufacturerproof required. No standingonpan/sink/counter or removalofretainedpipe/support.'
 x['ordinaryMode']='Poweredfan continuous; no occupied floorprojection below2800pod, exceptprincipaldescenderunderside2430. Mirrors/cisterns/appliances mustremainbelow the declared ceilingboundaries.'
platforms={'ground-WC':[7850,1300,700,700],'utility':[10700,1550,700,700],
 'kitchen':[9850,10000,700,700],'rear-bath':[1050,9200,700,700],
 'family-bath':[10200,5025,700,700],'principal-bath':[10400,6650,700,700]}
for x in extract:x['maintenancePlatformPlan']=platforms[x['id']]
for x in [wc_fan,utility_fan,kitchen_fan]:
 x['raisedExhaustSection']={'axis':3010,'insulatedOD':227,'bottomBeforePanel':2896.5,'panel':20,
 'finishedUnderside':2876.5,'windowRawHeadControl':2850,'windowClear':26.5,
 'topBeforeSupport':3123.5,'supportTerritory':20,'actualGroundRCsoffit':3170,'supportToRCreserve':26.5,
 'scope':'Explicit localceiling/framingcutout belowknownRC3170; notfreeunprovedattic.60riseafterfan mustfitactualturn/collar envelope; no windowleaf crossingbelowrawhead.'}
for x in extract:
 assert x['clearPanel'][0]>=x['fanMaxBody'][0]+50
 assert x['clearPanel'][1]>=x['fanMaxBody'][1]+100
 assert x['panelFrameOuter'][0]<=500 and x['panelFrameOuter'][1]<=650
assert sum(x['normalLps'] for x in extract)==65
assert all(x['normalLps']>=x['minimumHighComparator'] for x in extract)
# Windows: along-wall geometric clearance only; no inference about buried lintels.
for x in extract:
    axis=x['path'][-1][0] if x['wall'] in ['south','north'] else x['path'][-1][1]
    wall='outer-'+x['wall'];level='FIRST' if x['level'] else 'GROUND'
    intervals=[(o['centre']-o['width']/2,o['centre']+o['width']/2) for o in b['openings'][level] if o['wall']==wall]
    x['alongWallOpeningClearance']=min(max(lo-axis,axis-hi)-140 for lo,hi in intervals)
    if x['id']!='principal-bath':assert x['alongWallOpeningClearance']>=25,x['id']
    else:x['alongWallOpeningClearanceStatus']='Insideexistingwindowbyintent; cassetteproof replacespiercheck, not a new masonrybore.'

supplies=[]
for name,level,wall,at in [('study',0,'west',2700),('living',0,'north',2675),
 ('bed2',1,'south',2850),('bed3',1,'south',9150),('bed4',1,'north',4800),('principal',1,'north',11150)]:
    point=([at,0] if wall=='south' else [at,12000] if wall=='north' else [0,at])+[level*3450+2950]
    supplies.append({'id':name,'level':level,'wall':wall,'point':point,'measuredEquivalentAreaRequired':10000,
      'formedWallTerritory':220,'metalTerminalEnvelope':[350,350,100],
      'status':'Measured equivalent area, weather, draught and noise data required; geometric screen free area is not equivalent area'})
# EA orifice screening uses explicitly declared Cd/rho, not a tested vent curve.
def flow(ea,dp):return .61*ea/1e6*math.sqrt(2*dp/1.2)*1000
air['backgroundAreaMM2']=sum(x['measuredEquivalentAreaRequired'] for x in supplies)
air['orificeScreen']={'Cd':.61,'airDensity':1.2,'backgroundFlowAt2PaLps':flow(60000,2),
 'minimumSix4000EAFlowAt2PaLps':flow(24000,2),'one7600TransferAt3_5PaLps':flow(7600,3.5),
 'one3000TransferAt3_5PaLps':flow(3000,3.5),'notATestedCurve':True}
assert flow(60000,2)>65 and flow(24000,2)<65
assert flow(7600,3.5)>65/6 and flow(3000,3.5)<65/6
air['transfer']={'normalRequirement':'Every normally closed door on a supply-to-extract path must preserve the design transfer flow, including BOTH bedroom and wet-room doors where in series.',
 'minimumFinishedFreeArea':7600,'screenPerDoorPressurePa':3.5,'backgroundScreenPressurePa':2,
 'twoDoorPathScreenDepressionPa':10,'fireDoorRequirement':'Specific classified E20+ doorset with approved threshold/transfer arrangement at the required area; Sa requirements may invalidate this simple gap. No site cutting, seal deletion or blanket10mm permission.',
 'acceptance':'Not earned until the actual fire/door assembly and measured installed room pressures match. Narrow gap negative control fails.'}
def pressure(q,ea=7600):return .5*1.2*(q/1000/(.61*ea/1e6))**2
air['transfer']['fireSource']={'head':FIRE_HEAD,'jsonBlob':FIRE_BLOB,'interface':'protectedRoute only; primary room/furniture baseline remains frozen c83 plus declared rewinds'}
air['transfer']['doors']=fire['doors']
air['transfer']['normalFlowNetworkLps']={
 'eachHabitableSupplyScreen':65/6,'BED2_toRing':65/6,'BED3_toRing':65/6,
 'ringToBED4andRearBath':12-65/6,'ringToPrincipalAndBath':12-65/6,
 'ringToFamilyBath':12,'upperRingDownStair':2*65/6-2*(12-65/6)-12,
 'studyToProtectedHall':65/6,'livingViaWestCrossToHall':65/6,
 'hallToGuestWC':8,'hallViaPlantAndUtilityDoors':8,'hallViaEastCrossToKitchen':13}
assert abs(air['transfer']['normalFlowNetworkLps']['upperRingDownStair']+2*65/6-29)<1e-8
air['transfer']['worstIndividualNormalDoorScreenPa']=pressure(13)
air['transfer']['normalDoorScreenLimitPa']=5
assert pressure(13)<5
air['transfer']['worstTwoDoorAndBackgroundScreenPa']=pressure(65/6)+pressure(13)+2
assert air['transfer']['worstTwoDoorAndBackgroundScreenPa']<10.1

# Sourced F/L documents control only their stated methodology; these are authored
# thermal sensitivities. They are neither site weather nor room heat-loss design.
thermal=[]
for fabric in [80,140,220]:
 for dt in [20,25,30]:
    ventilation=1.2*65
    thermal.append({'fabricPlusInfiltrationWK':fabric,'deltaTK':dt,
      'MEVkW':(fabric+ventilation)*dt/1000,'MVHR70percentControlKW':(fabric+.3*ventilation)*dt/1000,
      'MVHRVentOnlySavingKW':.7*ventilation*dt/1000})
heat={'selectedArchitecture':'Outdoor R290 monobloc, separated frost-protected primary, indoor plate exchanger, direct weather-compensated radiators; DHW priority. No underfloor polymer tube.',
 'designCompatibilityDutyKW':8,'designPoint':'Outdoor−3 / indoor20 / emitter45flow40return, authored procurement requirement not actual site weather or manufacturer output',
 'waterFlowAt8KW_5K_Lps':8/(4.18*5),'maximumFabricPlusInfiltrationWKAtDelta25':8000/25-78,
 'thermalSensitivity':thermal,'noAnnualEnergyOrCOPClaim':True,
 'failureRule':'If actual room-by-room loss, design climate, defrost/primary-separation loss or hot-water recovery exceeds the stated duty, resize plant/emitters or change fabric/ventilation before selection.8kW is not a remembered7kW label.',
 'emitterRequirement':'Declared room outputs at45/40/20, not50K catalogue watts; exact radiator size/weight/support and window/furniture clearance must be matched.',
 'outdoorStation':{'body':[14500,3900,1100,600],'maxHeight':1600,'replacementPad':[14000,3300,2300,1800],
    'reservedClearSite':[13000,2500,5500,4200],'airDischarge':'east; no walkway, boundary or drain accepted from this abstract site reservation',
    'hydraulicPath':[[14500,4200,-800],[12500,4200,-800],[12500,4300,300],[12000,4300,300],[11000,4300,300]],
    'frost':'Select manufacturer-supported separated primary and specified propylene-glycol mixture for local minimum temperature/power loss; no reliance on powered dewatering or continuous electric trace alone.',
    'condensate':'Own frost-safe gravity receiver outside protective zone/house dryness system; actual receiving ground/outfall qualification required. Not admitted to gardenloggia or foul pipe by assumption.'}}
assert heat['waterFlowAt8KW_5K_Lps']<.4
heat['fluidFlowBoundary']={'secondaryWaterTargetLps':.4,'primaryGlycolTargetLps':.5,
 'primaryRequiredHeatCapacityKJkgKAtWorkingTemperature':3.2,'primaryRequiredDensityKgLMinimum':1,
 'primaryRequiredFreezeProtectionC':-15,
 'status':'Property/flow procurement limits, NOT asserted actualfluid/site data.8/(4.18×5) iswatersecondary only, not44%glycol. Actualfluid concentration/temperature/viscosity, HXloss, pumpcurve/minflow andsitefreeze condition mustmatch orresize.'}
heat['roomOutputCompatibilityBudgetsKW']={'study':.8,'living':1.2,'kitchenDining':1.,'bed2':.6,'bed3':.6,'bed4':.8,'principal':.8,'rearBath':.3,'familyBath':.3,'principalBath':.3,'guestWC':.15,'utility':.35,'plant':.2,'protectedCirculation':.6}
assert abs(sum(heat['roomOutputCompatibilityBudgetsKW'].values())-8)<1e-9
heat['emitterMatchingBoundary']='14 explicit room/circulation output requirements at45/40/20. These areallocated8kW compatibility budgets, not roomheatlosses or14provedradiatorfit. Selectedradiator fulldepth/valve/bracket/mass andoccupied/window/task clearance mustmatch actualHADroomfields; no automaticfloorheating fallback.'
insulation={'selectedInternalRadialThickness':25,'maximumThermalConductivity':.035,
 'basis':'L2026Table3.4 thickness20 for nominalID≤25/24 for≤100 atlambda≤.035, applies only if that edition/route is appropriate.25selected is an evidenced performance choice, not removal to fit. Exterior primary retains50 and whole freeze/weather system.',
 'old50RadialPipeControl':'Earlier unsourced50radial allowance yields132/132/122/82/115 bodies; five cannot fit300×250 with25edge/interpipe reserve. Rejected band, not nominal pass.',
 'pipeBodiesAndInsulatedOD':{'heat32':84,'hot22':74,'cold22':74,'return15':67},
 'internalBandClear':[320,260],'jacketThicknessEachSide':1,
 'sectionCentres':[{'id':n,'xy':[x,y],'diameter':d} for n,x,y,d in [
 ('heat-flow',67,67,84),('heat-return',205,67,84),('hot',62,189,74),('cold',161,189,74),('return',256.5,189,67)]],
 'notAdmitted':'Actual insulation binder/facing/jacket seams, coldvapour/dewpoint, bends, firestops andwhole systemheatloss. No polymerfoam exemption.'}
for p in insulation['sectionCentres']:
 x,y=p['xy'];r=p['diameter']/2
 assert min(x-r,320-x-r,y-r,260-y-r)>=25
for i,p in enumerate(insulation['sectionCentres']):
 for q in insulation['sectionCentres'][i+1:]:assert math.dist(p['xy'],q['xy'])-(p['diameter']+q['diameter'])/2>=25
insulation['radialConductionUpperScreenWperM']={}
for d,dt in [(32,25),(22,40),(15,40)]:
 insulation['radialConductionUpperScreenWperM'][str(d)]=2*math.pi*.035*dt/math.log((d/2+25)/(d/2))

plant={'cylinder':{'selectedNominalLitres':300,'comparison':'Vaillant2024 non-plumbed heat-pump cylinder300L:595diam x1745h, empty67.6kg/filled356.8kg. Insulation50 composition still needs declaration.',
 'body':[9537.5,3952.5,595,595],'station':[9485,3900,700,700],
 'workingEast':[10185,3900,900,700],'height':1745,'requiredTopService':500,
 'replacementCentrePath':[[9835,4250],[10500,4250],[10500,4600],[12500,4600]],
 'handlingRadius':425,'removedDryMassComparator':67.6,'filledSupportLoadBeforeAccessoriesKN':356.8*9.81/1000,
 'doorRaw':[3900,5300],'requiredFinishedClearWidth':1000,'requiredFinishedClearHeight':2300,
 'trolleyRequirement':'Matched rated trolley/handling method, drained cylinder and removable connections; filled apparatus is never lifted. No human lifting capacity invented.',
 'materialAlternative':'Factory-engineered copper/unvented heat-pump cylinder with demountable mineral insulation is a supplier design requirement, not authorised modification of a certified foam cylinder; bespoke copper capability alone proves no insulation approval.'},
 'controlsHydraulics':[11282.5,5550,300,650],
 'controlsMaximumHeight':2300,
 'primaryBuffer':{'requiredUsableAlwaysConnectedLitres':100,'station':[9800,5550,650,650],
  'maximumBodyHeight':1600,'nominalVolumeNotUsableProof':True,
  'reason':'Separated primary cannot borrow unproved radiator volume across plateHX fordefrost.100usable is an authorselected compatibility target, not a claimed universal supplierminimum.',
  'control':'Always-connected usable volume, guaranteed minimum flow and both HX pumps during defrost; valve/check/bypass states must preserve it. Exact chosen unit determines actual minimum and usable port arrangement.',
  'replacementCentrePath':[[10125,5875],[10700,5875],[10700,4600],[12500,4600]],
  'handlingRadius':425,'mass':'Unknown matched vessel/primaryfluid mass; no handlifting assumption. Drain/isolatelocaldevice only aftersafe shutdown.',
  'material':'Second pressure vessel, insulation, expansion/safety/valves and primaryfluid add real residuals; none omitted as partofheatpump.'},
 'riserGross':[9400,4700,550,700],
 'formedOpeningProposal':[9440,4760,465,545],
 'failedBodyOnlyOpening':[9460,4760,450,540],
 'cabinetBasis':'Westface corrected to actualwetfinish9400; new550×700 territory ends5400 before bathroomdoor5450. No800×1200 growth over door. Actual frame thickness/clear aperture still must match.',
 'proposedServices':[{'id':n,'centre':[x,y],'outerEnvelope':d} for n,x,y,d in [
   ('H-flow',9540,4855,84),('H-return',9740,4855,84),('cold',9830,5050,74),
   ('hot',9540,5075,74),('hot-return',9700,5050,67),('soil-comparator',9800,5200,160)]],
 'supportTaskEnvelope':230,
 'openingStatus':'New trimmed-opening structural proposal, not permission to drill, not inherited three-bore acceptance. Complete230 clamp/tool envelopes are above/below slab and used one at a time, not six floor circles. Old south100plinths overlap the opening40: real rim/frame feet MUST be redesigned before fit acceptance; no support removed for service. Exact seals/fire/weather/vapour boundaries remain independent.'}
r=plant['formedOpeningProposal']
for p in plant['proposedServices']:
 x,y=p['centre'];rad=p['outerEnvelope']/2
 p['openingEdgeReserve']=min(x-rad-r[0],r[0]+r[2]-x-rad,y-rad-r[1],r[1]+r[3]-y-rad)
 assert p['openingEdgeReserve']>=25
for i,p in enumerate(plant['proposedServices']):
 for q in plant['proposedServices'][i+1:]:assert math.dist(p['centre'],q['centre'])>(p['outerEnvelope']+q['outerEnvelope'])/2
for a,c in zip(plant['cylinder']['replacementCentrePath'],plant['cylinder']['replacementCentrePath'][1:]):
 swept=[min(a[0],c[0])-425,min(a[1],c[1])-425,abs(a[0]-c[0])+850,abs(a[1]-c[1])+850]
 assert not overlap(swept,plant['riserGross'])
assert 4250-425>3785 and 4250+425<4700
plant['cylinder']['initialReplacementMarginToRiser']=4700-4250-425
assert 1745+500<3100 and 2*425<1000
for a,c in zip(plant['primaryBuffer']['replacementCentrePath'],plant['primaryBuffer']['replacementCentrePath'][1:]):
 swept=[min(a[0],c[0])-425,min(a[1],c[1])-425,abs(a[0]-c[0])+850,abs(a[1]-c[1])+850]
 for fixed in [plant['riserGross'],plant['cylinder']['station'],plant['controlsHydraulics']]:assert not overlap(swept,fixed)
plant['architecturalRewinds']=['Delete unselected Q350 comparison body, not an installed accepted MVHR; put bufferinthisrealplantterritory.','Hydrauliccontrols mountedEwall, not a floorblock over buffer trolley path.','No floor-level eastsoil crossbar: highlevelbranch exitsEaty5700 beforedownstack.']

# Complete routing tree at declared high level. Every wall/floor intersection is
# a proposal to be designed, never a hidden permission or automated fit pass.
# Ground north connection is deliberately absent: it would cross the outdoor loggia.
trunks=[
 {'id':'ground-front-west','level':0,'path':[[9800,5000],[10350,5000],[10350,3200],[8500,3200],[8500,3500],[3500,3500],[3390,3500],[3390,5000],[3500,5000],[3500,8500],[3500,9200]],'duties':['heat','cold','hot','hot-return'],'axisZ':2945},
 {'id':'ground-rear-east','level':0,'path':[[8500,3500],[8691.25,3500],[8691.25,5000],[8700,5000],[8700,8500],[10500,8500],[10500,10800]],'duties':['heat','cold','hot','hot-return'],'axisZ':2945},
 {'id':'upper-front-west','level':1,'path':[[9800,5000],[9800,5900],[8500,5900],[8500,3500],[3500,3500],[3500,8500],[3550,8500],[3550,10800],[1800,10800],[1800,10000]],'duties':['heat','cold','hot','hot-return'],'axisZ':6395},
 {'id':'upper-rear-east','level':1,'path':[[8500,5900],[8700,5900],[8700,8700],[10350,8700],[10350,7900],[11200,7900],[11200,7200]],'duties':['heat','cold','hot','hot-return'],'axisZ':6395},
 {'id':'upper-bed4','level':1,'path':[[3550,10800],[4500,10800],[4500,9150]],'duties':['heat'],'axisZ':6395},
 {'id':'upper-bed2','level':1,'path':[[3500,3500],[3900,3500],[3900,2300]],'duties':['heat'],'axisZ':6395},
 {'id':'upper-bed3','level':1,'path':[[8500,3500],[8700,3500],[8700,2300]],'duties':['heat'],'axisZ':6395},
 {'id':'ground-study','level':0,'path':[[3500,3500],[1800,3500],[1800,2800],[2500,2800],[2500,2500]],'duties':['heat'],'axisZ':2945},
 {'id':'ground-WC-branch','level':0,'path':[[8500,3500],[8100,3500],[8100,1800],[8500,1800]],'duties':['heat','cold','hot'],'axisZ':2945},
 {'id':'ground-utility','level':0,'path':[[10350,3200],[10700,3200],[10700,2200],[11200,2200],[11200,1800]],'duties':['heat','cold','hot'],'axisZ':2945},
 {'id':'upper-family-wet','level':1,'path':[[9800,5000],[11200,5000]],'duties':['heat','cold','hot'],'axisZ':6395},
 {'id':'upper-principal-wet','level':1,'path':[[11200,7200],[11200,7000]],'duties':['heat','cold','hot','hot-return'],'axisZ':6395},
]
gates=[
 {'id':'FD-WEST-CROSS','level':0,'xy':[3390,4250],'orientation':'y','rough':[2947.5,3832.5]},
 {'id':'FD-EAST-CROSS','level':0,'xy':[8691.25,4250],'orientation':'y','rough':[8241.25,9141.25]},
 {'id':'PLANT','level':0,'xy':[9300,3200],'orientation':'x','rough':[2750,3650]},
 {'id':'plant-intermediate','level':0,'xy':[10350,3700],'orientation':'y','rough':[9650,11050]},
 {'id':'utility-north','level':0,'xy':[10700,2550],'orientation':'y','rough':[10250,11150]},
 {'id':'STUDY','level':0,'xy':[1800,3247.5],'orientation':'y','rough':[1350,2250]},
 {'id':'GUEST-WC','level':0,'xy':[8100,2650],'orientation':'y','rough':[7650,8550]},
 {'id':'kitchen-arch','level':0,'xy':[8700,8290],'orientation':'y','rough':[8250,9150]},
 {'id':'FAMILY-BATH','level':1,'xy':[9300,5900],'orientation':'x','rough':[5450,6350]},
 {'id':'BED2','level':1,'xy':[3900,2650],'orientation':'y','rough':[3450,4350]},
 {'id':'BED3','level':1,'xy':[8700,2650],'orientation':'y','rough':[8250,9150]},
 {'id':'BED4','level':1,'xy':[3550,8852.5],'orientation':'y','rough':[3100,4000]},
 {'id':'rear-ensuite','level':1,'xy':[2902.5,10800],'orientation':'x','rough':[10350,11250]},
 {'id':'PRINCIPAL','level':1,'xy':[8700,8290],'orientation':'y','rough':[8250,9150]},
 {'id':'principal-ensuite','level':1,'xy':[10350,8290],'orientation':'y','rough':[9900,10800]},
]
for g in gates:
 local=2500;g['bandWidth']=320;g['bandHeight']=260
 g['completeDoorAssemblyMaximum']=2250;g['trimAllowance']=70
 g['bandZ']=[g['level']*3450+2370,g['level']*3450+2630]
 g['panelThickness']=20;g['finishedUnderside']=g['bandZ'][0]-20
 g['clearAboveAssemblyAndTrim']=g['finishedUnderside']-g['level']*3450-2250-70
 g['ceilingLossFrom3100']=3100-2350
 at=g['xy'][0 if g['orientation']=='y' else 1]
 g['roughSideReserves']=[at-160-g['rough'][0],g['rough'][1]-at-160]
 assert min(g['roughSideReserves'])>=100 and g['clearAboveAssemblyAndTrim']==30
 g['requiredIntradosMinimum']=g['level']*3450+2680
 g['scope']='Explicit lower crossover through independent classified upperclosure, not archcore. Actual intrados≥2680 across320 on BOTHfaces; support/fire/weather/thermal details unearned. Door2250+70trim stays below2350 finishedcover by30.750 local ceiling cost is real.'

for t in trunks:
 t['lengthMM']=length(t['path']);t['ordinaryBand']=[320,260]
 t['section']='Metal demountable cover, pipe independently fixed; heat/hot insulation and cold vapour jacket kept separate; electrical tray separate.'
 if not t['level']:
  for a,c in zip(t['path'],t['path'][1:]):
   swept=[min(a[0],c[0])-150,min(a[1],c[1])-150,abs(a[0]-c[0])+300,abs(a[1]-c[1])+300]
   assert not overlap(swept,[4800,7750,2400,4250]),'Outdoor loggia crossed'
assert overlap([3500,8350,5000,300],[4800,7750,2400,4250]) # rejected former north-ring shortcut

fixtures=[
 ('guest-WC',0,4,[8700,600],['cold','soil']),('guest-basin',0,1,[7450,600],['cold','hot','waste']),
 ('utility-sink-PROPOSED',0,1,[11000,1100],['cold','hot','waste']),('washer-PROPOSED',0,1,[10300,1100],['cold','waste','power']),
 ('kitchen-sink',0,1,[8700,10982.5],['cold','hot','waste']),
 ('principal-WC',1,1,[10972.5,7412.5],['cold','soil']),('principal-basin',1,1,[9400,7600],['cold','hot','waste']),
 ('principal-shower',1,1,[9400,6600],['cold','hot','waste']),('family-WC',1,1,[11022.5,5900],['cold','soil']),
 ('family-basin',1,1,[9800,6195],['cold','hot','waste']),('family-bath',1,1,[9460,3785],['cold','hot','waste']),
 ('rear-WC',1,1,[717.5,11000],['cold','soil']),('rear-basin',1,1,[1000,8937.5],['cold','hot','waste']),
 ('rear-shower',1,1,[1817.5,8937.5],['cold','hot','waste'])]
# One guest pan, not the four-house WC total copied into that fixture row.
fixtures[0]=('guest-WC',0,1,[8700,600],['cold','soil'])
fixtures=[(n,l,c,([10777.5,5750] if n=='family-WC' else [11227.5,5200] if n=='family-basin' else [9460,3800] if n=='family-bath' else [10950,700] if n=='utility-sink-PROPOSED' else [10050,700] if n=='washer-PROPOSED' else p),d) for n,l,c,p,d in fixtures]
assert len(fixtures)==14 and sum('hot' in r[4] for r in fixtures)==9
schedule=[{'id':n,'level':l,'count':c,'sourceOrProposedXY':p,'duties':d} for n,l,c,p,d in fixtures]

# Connect the water distribution to each functional endpoint. Endpoints are
# explicit required valve/service territories, not asserted product outlet axes.
branches={
 'guest-WC':([[8500,1800],[8900,1800],[8900,650]],300),
 'guest-basin':([[8500,1800],[7650,1800],[7650,700]],600),
 'utility-sink-PROPOSED':([[11200,1800],[11250,1800],[11250,1050]],600),
 'washer-PROPOSED':([[11200,1800],[10800,1800],[10800,1250]],750),
 'kitchen-sink':([[10500,10800],[9150,10800],[9150,11282.5]],600),
 'principal-WC':([[11200,7200],[11200,8040],[11432.5,8040]],500),
 'principal-basin':([[11200,7200],[10500,7200],[10500,7800],[9570,7800]],600),
 'principal-shower':([[11200,7200],[10500,7200],[10500,7050],[9450,7050]],1100),
 'family-WC':([[11200,5000],[11452.5,5000],[11452.5,5927.5]],500),
 'family-basin':([[11200,5000],[11400,5000],[11400,5400]],600),
 'family-bath':([[11200,5000],[11200,4100]],600),
 'rear-WC':([[1800,10000],[1200,10000],[1200,11177.5],[650,11177.5]],300),
 'rear-basin':([[1800,10000],[1200,10000],[1200,9000]],600),
 'rear-shower':([[1800,10000],[2300,10000],[2300,8975]],1100),
}
for s in schedule:
 p,z=branches[s['id']];s['waterBranchPlan']=p;s['valveAxisZ']=s['level']*3450+z
 s['waterBranchLengthIncludingDropMM']=length(p)+2945-z
 s['requiredValveWorkTerritory']=[200,200,300]
 s['endpointStatus']='Design service/valve axis with200mm local work field, NOT actual apparatus inlet. Local final tube/connector must join the selected fixture without inaccessible fabric.'
 s['surfaceDrop']='Exposed metallic/supported tube or demountable service chase; no structural chase cut. Maximum100mm local projection is an explicit room/shower loss, not hidden in the wall.'
 assert p[0] in [v for t in trunks for v in t['path']]+[[1800,10000],[11200,5000]]

crossings=[]
for t in trunks:
 for a,c in zip(t['path'],t['path'][1:]):
  for w in b['upperWalls' if t['level'] else 'groundWalls']+([] if t['level'] else [w for w in fire_house['groundWalls'] if w['id'].startswith('protected-')]):
   (x,y),(xx,yy)=w['a'],w['b'];point=None
   if y==yy and a[0]==c[0] and min(a[1],c[1])<y<max(a[1],c[1]) and x<=a[0]<=xx:point=[a[0],y]
   if x==xx and a[1]==c[1] and min(a[0],c[0])<x<max(a[0],c[0]) and y<=a[1]<=yy:point=[x,a[1]]
   if point:
    along=point[0] if y==yy else point[1]
    crossings.append({'route':t['id'],'level':t['level'],'wall':w['id'],'point':point+[t['axisZ']],
      'planInsideExistingAperture':any(lo<=along<=hi for lo,hi in w['holes']),
 'requiredServiceTerritory':[320,260],
      'status':'Wall-body/lintel/support and actual fire-boundary design enquiry. Plan doorway alignment never proves a high-level pipe port.'})

def gate_on_segment(g,a,c):
 x,y=g['xy']
 return ((a[0]==c[0]==x and min(a[1],c[1])<y<max(a[1],c[1])) or
  (a[1]==c[1]==y and min(a[0],c[0])<x<max(a[0],c[0])))
for t in trunks:
 profiles=[]
 for a,c in zip(t['path'],t['path'][1:]):
  normal=t['axisZ'];low=t['level']*3450+2500
  profiles.append(a+[normal]);distance=math.dist(a,c)
  for g in sorted([g for g in gates if g['level']==t['level'] and gate_on_segment(g,a,c)],key=lambda g:math.dist(a,g['xy'])):
   at=math.dist(a,g['xy']);before=max(0,at-250);after=min(distance,at+250)
   def atdistance(v,z):return [a[0]+(c[0]-a[0])*v/distance,a[1]+(c[1]-a[1])*v/distance,z]
   profiles.extend([atdistance(before,normal),atdistance(before,low),g['xy']+[low],atdistance(after,low)])
   if after<distance:profiles.append(atdistance(after,normal))
  profiles.append(c+[normal if not any(gate_on_segment(g,a,c) and distance-math.dist(a,g['xy'])<250 for g in gates if g['level']==t['level']) else low])
 t['selected3DProfile']=profiles;t['profileLengthMM']=length(profiles)
 t['profileRule']='Real local drop/rise at each listed aperture; when segment ends within250 ofwall, low profile remains at endpoint. No imaginary2925corethrougharch. Connections at all shoulders must preserve one continuous supported pipe.'
for x in crossings:
 matches=[g for g in gates if g['level']==x['level'] and math.dist(g['xy'],x['point'][:2])<1e-6]
 if matches:x['selectedCrossover']=matches[0]['id'];x['point'][2]=x['level']*3450+2500

rewinds={'familyWetRoom':{'status':'Shared MAT/IAS/HAD trial only; no selected pan/outlet/door or port acceptance.',
 'eastWetFace':11567.5,'southWetFace':3800,'northWetFaceControl':6400,
 'WC':[10777.5,5750,560,355],'basin':[11227.5,5200,340,450],'bath':[9460,3800,1700,700],
 'eastBand':[11337.5,5750,230,355],'column':[11297.5,6135,270,265],
 'port':[11432.5,6260,160],'aboveFloorTerminalSupportEnvelope':200,
 'columnReserves':{'terminalX':[35,35],'terminalY':[25,40],'floorBoreX':[55,55],'floorBoreY':[45,60]},
 'lowBranchAxisX':11452.5,'lowBranchNominalBodyMaximum':160,'lowBranchBackProjectionMaximum':205,
 'lowBranchRequirement':'Fullbackprojection module frompanback11337.5 ends≤11542.5,25toEwet. Nominal160alone neverprovesbend/socket/supportfit; portaxis11432.5is20westoflowbranchaxis. Actualmodulemustbridgeoffset.',
 'withdrawalBoundary':'200terminal/support abovefloor isdemountable andneverpassesthrough160bore; plain110tail andqualifiedfloorsealretained. Columntask mayrequirepanwithdrawal; actualfront-releasepan/connector andfirsttoolaccessmustbeearned, not assumedrearreach.',
 'failed180ColumnControl':{'footprint':[11342.5,6180,180,180],'port':[11432.5,6270,160],'sideReserve10IsNot25':True},
 'groundCollectorControl':[[11432.5,6260,2749.8125],[10800,6260,2734],[10800,5200,2707.5],[9800,5200,2682.5]],
 'branchLengthMM':2692.5,'fallAt1in40':67.3125,
 'door':'Existing5450–6350rough; IAS owns actual mechanicaldelayed-action762leaf/825frame withcontinuousfirst2degree handwithdrawal, notpoweredoperator/stationarydwell.27dryreturntrial putsroomsidehost9397; actualmatchedjoint/door source stillpendingfreeze.'},
 'utility':{'status':'New functional proposal, not recovered existing HAD fixtures or admitted final appliance/door operation.',
 'washer':[10050,700,650,700],'sink':[10950,700,600,700],'rearServiceChase':[10050,450,1500,250],
 'valveBay':[10700,700,250,700],'electricalStation':[9385,1750,300,650],
 'electricalWorkingField':[9685,1750,1000,650],'PVinverter':[9400,417.5,500,250],
 'PVworkingField':[9400,667.5,600,1000],
 'working':'Washer/sink front at1400, floor task field to2000. Washer valve10800/1250 is450 from front bodycentre10800/1700, not inaccessible behind appliance. Utility door must be checked in actual open/closed modes; no sink-use pass under an untested inward900leaf. Cu/inverter work fields do not intersect proposed fixed appliance bodies.'}}
for work in ['electricalWorkingField','PVworkingField']:
 for fixed in ['washer','sink']:assert not overlap(rewinds['utility'][work],rewinds['utility'][fixed])
family=rewinds['familyWetRoom'];col=family['column'];px,py,pd=family['port']
for d in [pd,family['aboveFloorTerminalSupportEnvelope']]:
 assert min(px-d/2-col[0],col[0]+col[2]-px-d/2,py-d/2-col[1],col[1]+col[3]-py-d/2)>=25
assert not overlap(family['WC'],col) and not overlap(family['basin'],family['WC'])
assert family['WC'][1]-(family['basin'][1]+family['basin'][3])==100

sink={'status':'One-wayrequired interface forIAS sink firstrelease in27dryfinish trial; actual apparatus/frame/joints not admitted.',
 'station':[8700,10970.5,900,600],'maximumRemovedHeight':1000,'initialLift':20,'retainedStudHeight':15,'retainedBodyTopMaximum':475,'movingUpperLowPointAfterLiftMinimum':495,'maximumCaptureStroke':15,'captureReserveAfterLift':5,'noLowTransverseFrameRail':True,
 'studs':[[x,y] for x in [8765,9535] for y in [11070.5,11470.5]],
 'frontAccessPlan':[8950,10970.5,400,150],'frontAccessZ':[400,550],
 'operatorCentre':[9150,10650],'unions':[
  {'id':'cold','axis':[9025,11045.5,475],'axisDirection':[0,0,1],'maximumDiameter':80,'maximumAxial':100},
  {'id':'hot','axis':[9130,11045.5,475],'axisDirection':[0,0,1],'maximumDiameter':80,'maximumAxial':100},
  {'id':'waste','axis':[9275,11045.5,475],'axisDirection':[0,0,1],'maximumDiameter':100,'maximumAxial':100}],
 'sequence':'Isolate/drain; accessibletrue-uniondisengagement FIRST; independentlysupported retainedpipes capped.20lift thenSwithdrawal ofstation doesnot liftpipe/support/floorseal. Retained trap staysbelowunion; no movingtrap below495. No rearhiddenrelease assumed.',
 'wasteRequiredRoute':[[9275,11045.5,475],[9275,11045.5,300],[9275,12000,276.1375],[9275,12450,-1980]],
 'actualSupplierRequired':'Bothpressureunions andwastetrap/union mustbe compatiblewithsame release sequence, material, hygiene andgravity duty; nominalmetal/diameter isnot a completepartpass.'}
for u in sink['unions']:
 x,y,z=u['axis'];r=u['maximumDiameter']/2;a=u['maximumAxial']/2;box=sink['frontAccessPlan']
 assert min(x-r-box[0],box[0]+box[2]-x-r,y-r-box[1],box[1]+box[3]-y-r,z-a-400,550-z-a)>=25
 u['planReachFromOperator']=math.dist([x,y],sink['operatorCentre'])
 assert u['planReachFromOperator']<415
assert sink['initialLift']-sink['retainedStudHeight']==5
sink['retainedTrap']='Trap isfixedbelowwasteunion; movingstation tail terminatesat475 before20lift and≥495after. Actual trap/waterseal/cleanout mustfit below475; no movingPtrap sweptthroughfixedpipe.'
sink['retainedFeed']={'verticalCornerColumn':[11425,11188,145,224],
 'coldPath':[[10500,10800,2945],[11487,10800,2945],[11487,11250,2945],[11487,11250,212],[9025,11250,212],[9025,11045.5,212],[9025,11045.5,425]],
 'hotPath':[[10500,10800,2945],[11487,10800,2945],[11487,11350,2945],[11487,11350,212],[9130,11350,212],[9130,11045.5,212],[9130,11045.5,425]],
 'tube':22,'radialInsulation':25,'metalJacketEachSide':1,'fullStraightOD':74,
 'completeCrossingSupportEnvelopeZ':[150,274],
 'rigEnvelopeBeforeLiftZ':[0,100],'rigEnvelopeAfterLiftZ':[0,120],
 'minimumRigClearance':30,'crossingTrackX':[9370,9470],'crossingY':[11250,11350],
 'supports':'Independentlyretainedfloor/wall supports. No bracket within trackcrossingX9370–9470; nearestsupportX9290(max100wide) ends9340,30clear. Nextsupport9800;510span requiresactualsupplier/capacitycheck. Pipe/supportsnevermove with station.',
 'frameRequirement':'No lowfronttransverse rail orsidebrace crossing fixedfeedbands below475. Top/highbraced900stationmustearn actualstiffness/anchorcapacity; no drawnexistingbrace silentlyremoved.',
 'cookerRequirement':'Built-in COMPACT455high oven over350accessibleplinth, not freestandingfullfloor chassis. Water/support envelope≤274;20deckunder330 leaves56clear. Exactoven/hobventilation/electricalseparation required.'}
sink['cookingStationRewind']={'footprint':[10750,10970.5,600,600],'top':900,'plinth':350,
 'ovenComparator':'BoschCMG7241.1:455h×594w×548d; underworktop niche460+4/min550depth withventilationcutout. Reference only, nomaterial/productapproval.',
 'ovenBodyZ':[350,805],'hobComparator':'BoschPUE611BB5E:51h×592w×522d;4.6kW, min16worktop, manufacturer ventilationpaths retained.',
 'hobBodyZ':[849,900],'bodyGap':44,'worktopToOvenFrontTop':95,
 'status':'Dimensionallyconstructive samebrandcompactcomparison, notcompleteinstallationapproval. Actualrear/frontventilation,heatresistantcarcass,powerisolations,fitandsafetyinstructionsnotwaived. Fullsize600ovenfails this350plinthcase.'}
assert 150-120==30 and 330-274==56 and 849-805==44
rewinds['kitchenSinkStation']=sink

# A serviceplatform cannot silently stand on the retained toilet, bath or worktop.
for e in extract:
 furniture=dict(b['upperFurniture' if e['level'] else 'groundFurniture'])
 if e['level']:
  for k in ['family-WC','family-basin','family-bath1700','family-service-cabinet']:furniture.pop(k,None)
  furniture.update({'family-WC':family['WC'],'family-basin':family['basin'],'family-bath':family['bath'],'family-column':family['column'],'selected-riser':plant['riserGross']})
 else:
  furniture.pop('Q350-body',None);furniture.pop('north-sink-station',None)
  furniture.update({'sink-station':sink['station'],'washer':rewinds['utility']['washer'],'utility-sink':rewinds['utility']['sink'],'CU':rewinds['utility']['electricalStation'],'inverter':rewinds['utility']['PVinverter']})
 work=e['maintenancePlatformPlan'];margins=[]
 for name,f in furniture.items():
  assert not overlap(work,f),e['id']+' platformhits '+name
  dx=max(f[0]-work[0]-work[2],work[0]-f[0]-f[2],0);dy=max(f[1]-work[1]-work[3],work[1]-f[1]-f[3],0)
  margins.append((math.hypot(dx,dy),name))
 e['platformMinimumFurnitureReserve'],e['platformClosestFurniture']=min(margins)
 assert e['platformMinimumFurnitureReserve']>=25
 e['doorMode']='Roomdoor closed before deployingplatform where required; firstopening/closing/carrying and actualframe mustqualify separately. No furnituremoved and no standingonfixtures is credited bythis platformtest.'

east_exit={'path':[[9800,5200,2682.5],[10800,5200,2657.5],[10800,5700,2645],[12000,5700,2615]],
 'lengthMM':2700,'fallAt1in40':67.5,'formedWallTerritory':200,'faceFlashingTerritory':300,
 'externalDownstackBodyTerritory':[12000,5550,450,300],
 'doorControl':{'axis':4600,'roughWidth':1400,'ringThicknessControl':215,
  'allHeightRingEnvelope':[3685,5515],'holeToRingControlReserve':5600-5515,'flashingToRingControlReserve':5550-5515},
 'nextWindowControl':{'axis':7400,'roughWidth':1000,'ringThicknessControl':215,'allHeightRingEnvelope':[6685,8115]},
 'source':'Current HAD Eopeningrecord checked for ALLwindows/door.215ring is an explicit profile-control awaiting STR/HAD actual inner/weather ring, NOT asserted whole exterior recipe.',
 'grade':{'trialExterior':-1300,'requiredReceiverEnvelopeCrownAtOrBelow':-1900,'axisOf160OuterEnvelope':-1980,
  'crownCoverControl':600,'actualHydraulicInvert':'Unknown until actual carrier/internaldiameter/receiver geometry and site datum; outerenvelope bottom is not hydraulicinvert.'},
 'renewal':'Outside fixed brackets and boundary sleeve retained; separately isolated supported removable cleanout/straight lengths,350jointrelease territory. External scaffold/lift required, not attic access. Exact part length/mass/connector/fastener and facade work field unproved.'}
assert length(east_exit['path'])>2700 # actual3Dslope length exceedsplanlength
assert east_exit['path'][0][2]-east_exit['path'][-1][2]==2700/40
assert east_exit['doorControl']['holeToRingControlReserve']==85
assert east_exit['doorControl']['flashingToRingControlReserve']==35

hot={'architecture':'One300L60°C heat-pump-compatible unvented store; demand/timed hot-return loop, no continuously heated uninsulated loop.',
 'designDHWRangeLitres40CPerPersonDay':[30,50],'occupancyRange':[2,6],
 'deliveredDailyRangeLitres40C':[60,300],'idealMixedLitres40CFrom300L60C_CW10C':300*(60-10)/(40-10),
 'idealReheatKWhFrom10to60':300*50*4.186/3600,
 'reheatHoursAt4kWNet':300*50*4.186/3600/4,
 'recoveryRule':'4kW net coil duty is a declared requirement, not actual heat-pump output at60°C. DHW priority pauses room heating; actual draw sequence/coil/defrost/hygiene/standing losses must fit, or capacity/control changes.',
 'deadLegControl':'Require at most3L unrecirculated terminal volume and at most30s warm-up at6L/min after demand-loop readiness. No rule that3L itself proves hygiene.',
 'simpleUnreturned22mm_20ID_15mLitres':math.pi*.020**2/4*15*1000,
 'selected15mm_13ID_3mBranchLitres':math.pi*.013**2/4*3*1000,
 'returnRoute':'Four parallel demand-balanced loops:groundfront-west,groundrear-east,upperfront-west,upperprincipalwet; each hot main returns on a separate15mm tube following the same declared indoor tree toplant. One returnpump with four balancing/check/isolation stations. This adds actual seals/pump and heatloss; no hidden gravity return.',
 'hygieneScald':'Temperature-control case uses60°C store/return surveillance and local thermostatic mixing at bath/showers; competent design must bind actual temperatures, safe outlets and post-stagnation operation. HSE guidance used as design reference, not asserted private-home legal duty.',
 'safetyDischarge':{'valveToTundishMaxMM':600,'tundish':'Visible accessible inplant working strip, lower than relief valve',
   'route':[[10200,4250,1200],[10800,4250,1200],[10800,4250,800],[12000,4250,750]],
   'selection':'Copper/metal gravity discharge to visible safe external termination outside circulation; actual D1/D2 sizing, vertical leg, resistance and scald containment per matched vessel/G3 design. Not connected invisibly to foul or rainwater.'}}
assert hot['simpleUnreturned22mm_20ID_15mLitres']>3
assert hot['selected15mm_13ID_3mBranchLitres']<.5
hot['loops']=[{'route':n,'separateReturnPath':list(reversed(next(t['path'] for t in trunks if t['id']==n))),
 'returnAxisZ':next(t['axisZ'] for t in trunks if t['id']==n),'independentlySupported':True}
 for n in ['ground-front-west','ground-rear-east','upper-front-west','upper-rear-east']]
for t in trunks:
 if t['id'] in [x['route'] for x in hot['loops']] and 'hot-return' not in t['duties']:t['duties'].append('hot-return')
for s in schedule:
 if 'hot' in s['duties']:
  s['terminalDeadLegLitresAt13mmID']=math.pi*.013**2/4*s['waterBranchLengthIncludingDropMM']
  s['idealFlushSecondsAt6Lmin']=s['terminalDeadLegLitresAt13mmID']*10
  assert s['terminalDeadLegLitresAt13mmID']<3 and s['idealFlushSecondsAt6Lmin']<30
hot['maximumTerminalDeadLegLitresAt13mmID']=max(s.get('terminalDeadLegLitresAt13mmID',0) for s in schedule)

# Each entry owns a real decision, physical route and renewal boundary. Network
# capacities are not inferred from these coordinates.
other=[
 {'id':'incoming-water','count':1,'path':[[12000,1000,500],[11200,1000,500],[11200,4300,500],[10400,4300,500]],'decision':'Service pressure/quality and meter/backflow selection; accessible isolator, drain and actual utility supply. No polymer-free network-pipe claim.'},
 {'id':'foul-ground-WC','count':1,'path':[[8900,650,180],[8900,0,163.75],[8900,-450,-1980]],'decision':'Required compatible horizontalpan outlet abovefloor to own southwall sleeve; no new groundfloor bore.650planat1:40. Actual pan firstrelease and complete connector≤182.5rear axialterritory required; no guessed outlet. Outside receiving invert/site connection unproved.'},
 {'id':'foul-utility','count':2,'path':[[10700,600,650],[10700,600,250],[12000,600,217.5],[12450,600,-1980]],'decision':'Washerstandpipe andsink trapped branch join accessible rear250chase andeastwall exit ABOVEfloor; no routingthroughappliance chassis.32.5fall on1300plan. Exact trap/hose/branch/outside carrier and workplate required.'},
 {'id':'foul-kitchen','count':1,'path':[[9150,11282.5,400],[9150,12000,382.0625],[9150,12450,-1980]],'decision':'Accessible sinktrap/cleanout to northwall abovefloor,17.9375fall on717.5plan. No branch through groundloggia/hiddenwaterbox. Actual site receiving crown/diameter/invert mustmatch.'},
 {'id':'rear-soil','count':1,'path':[[567.5,11177.5,7800],[567.5,11177.5,200],[0,11177.5,185.8125],[-450,11177.5,-1980]],'decision':'Merged R01 upper sanitaryport remains conditional; abovefloor westexit avoidsanothergroundbore. Actual roof intersection/termination must be raised above nearbyopenings/roof;7800 is a reservation, not roofheight fact.'},
 {'id':'east-soil','count':1,'path':east_exit['path']+[[12450,5700,-1980]],'decision':'Highlevel eastwall exit at5700 avoidsplantdoor/foot-levelcrossbar; ALLouterarches/flashing andvisibleexternalstack mustqualify. No hidden groundfloor stack or additionalfloorbore assumed.'},
 {'id':'rainwater-interface','count':'RWT-owned','path':[],'decision':'Copper roof/loggia receivers and independent exceedance route stay MAT/RWT owners. No sanitary, condensate or safety discharge assumed to share their receiver.'},
 {'id':'power-incoming','count':1,'path':[[12000,2200,1500],[9685,2200,1500]],'decision':'Meter/metalconsumer-unit onutility westface9385/1750/300×650, separate1000depth workingfield9685/1750. Utility-side cabinet/washing-machine layout must retain clear serviceface. Utility capacity/earthing/bonding/RCD/overcurrent and actual circuits by certified design.'},
 {'id':'power-distribution','count':'Functional circuit groups, not final circuit count','path':[[11200,1500,2925],[11200,5000,2925],[9800,5000,2925]],'decision':'Separate metal drytray follows declared indoor tree; own sealed floor aperture/tray supports, not tied to hotpipes. Mineral-insulated cable investigated, but terminations/controls/flex tails remain certified residuals; cable sizing and fire survival not invented.'},
 {'id':'cooking-power','count':1,'path':[[11200,1500,2925],[11200,10800,2925],[11100,11200,900]],'decision':'Electric cooking, accessible isolation and separate hood/control/makeup duty. No gas supply selected.'},
 {'id':'laundry-refrigeration','count':2,'path':[],'decision':'One washer reserve10050/700/650×700(requiredactualbody≤600wide) and fridge10932.5/9025; accessible isolated appliance tails. Washer is new proposal; manufacturer withdrawal/hose/workplate dimensions required, not built into structure.'},
 {'id':'lighting-controls-data','count':'All occupied rooms, circulation andplant','path':[],'decision':'Drytray branches drop to inspectable metal face stations; actual circuit/accessory count follows electrical layout. Wired controls, no mandatory cloud/radio. Data/fire-alarm isolation and earthing separate, no implied certified polymer-free circuits.'},
 {'id':'fire-detection','count':'Whole-house alarm layout to fire strategy','path':[],'decision':'Protected stair/ring and every habitable/wet risk zone scheduled for actual compliant detector design; no device locations or grade/category invented. Certified alarm internals/backup power are explicit residue; do not delete to satisfy materials.'},
 {'id':'purge-overheating','count':6,'path':[],'decision':'Every habitable room retains actual operablewindow task; openings/noise/security/fall protection and orientation/climate/shading must prove purge/overheating.65L/s winterventilation is not cooling and no cooling duty is silently omitted.'},
]

residues=[
 {'id':'MEV-fans','quantity':'6 complete replaceable stations','location':'Six outer-wall wet-room pods','known':'Systemair K comparator has glass-reinforced polyamide impeller despite metal casing. Motor varnish, insulation, terminalbox/electronics/grommets and clamps need exact bill.',
 'alternative':'No-powered natural/intermittent fails intended airtight simple case; centralMEV/MVHR add distribution. Metal impeller fan may reduce one residue but is not presumed performance-compatible.',
 'replacement':'Isolate electrically, independently support both duct ends, open400×450clear panel, release actual demountable joints and lower complete≤326×300fan into clear room workzone; fixed wall sleeve/weather seal remains.37/75clear task reserve is design requirement, not matched-kit proof.',
 'proposal':'No exception yet; exact fan revision, constituents/quantity, duty/noise/curve and replacement instructions must precede any narrow owner request.'},
 {'id':'heat-pump','quantity':'1 outdoor monobloc + indoor hydraulic controls/plateHX/2circulation functions','location':'Externalstation andplant serviceface','known':'Certified compressor oil may be PAG; electrical insulation, PCBs, seals, pump internals, antivibration feet and flexible joints remain. R290 itself is a refrigerant, not proof of no polymers.',
 'alternative':'Directelectric removes refrigeration/hydraulics but increases delivered-electric demand; combustion adds fuel/flue/CO and is not selected. No safety/control parts altered.',
 'replacement':'Outdoor body exits directly to2300×1800 pad then site vehicle/lifting route; indoor unit to plantreplacementdoor. Exact mass/lift/clearance and freeze fluid declaration required.',
 'proposal':'Apparatus-only exception candidate, never approved by selecting this architecture; no polymer jacket/tube blanket exception.'},
 {'id':'DHW-vessel','quantity':'1×300L DHWvessel +1×100L usableprimarybuffer; standardDHWcomparison50mm insulation','location':'Plant700square station','known':'Factory foam chemistry/cladding/valves/immersion/thermostat/seals unknown in dimension brochure.67.6kg dry/356.8kg filled comparison; no metal-only admission.',
 'alternative':'Require factory-engineered demountable mineral insulated pressure-vessel variant; bespoke copper capability is not evidence of approved replacement insulation. Openvented alternative needs a real head/tank/pressure solution, unavailable in unproved attic.',
 'replacement':'Drain andisolate; disconnect accessible eastserviceface;425radius uprighttrolley path to1000clear replacementdoor; no supporting floor/seals removed.',
 'proposal':'Do not request whole-cylinder foam exception before the evidenced nonfoam engineered variant is resolved. Exact proprietary safety residues separately bounded.'},
 {'id':'water-waste-joints','quantity':'14cold endpoints/9hot endpoints/4WCs/3bathing outlets/2sinks/washer; actual joint count unresolved','location':'Valvefaces, traps, panconnectors, cylinder and retained crossings','known':'Matched seals, valve seats, TMVs, pump/check/backflow and expansion diaphragms commonly synthetic; exact required kits not selected. Metal tube is not complete assembly.',
 'alternative':'Copper solder/mechanical joints where appropriate; vitreous fixtures/clay/iron or metal sanitary carriers with actual compatible joints. No failedmatched PP waste replaced by an invented metal seal.',
 'replacement':'Localisolation/drain/cleanout at each terminal; merged lower shower interface and separate75stem stripping requirement retained exactly.',
 'proposal':'Product-by-product seal/valve exceptions only after exact kit and alternative testing; none approved.'},
 {'id':'electrical-fire-controls','quantity':'1consumer station + each final circuit/terminal/alarm/actuator; exact count unselected','location':'Drytray, inspectable metalface stations and apparatus','known':'Certified insulation/encapsulation/sleeves/flexes/RCDs/alarms and backup batteries remain in scope. Firestops/door-transfer and makeupdamper seals may add residues.',
 'alternative':'Mineral-insulated metallic routes and metalfaces reduce concealed polymers; not proof that certified terminations can be rebuilt or seals omitted.',
 'replacement':'Accessible isolated complete accessory/device exchange; no embedding as permanent fabric. Fireboundary remains closed by matched retained system.',
 'proposal':'Narrow exact certified accessory exceptions with installed extent/inspection interval; no generic electrical or fire exemption.'},
]
pv={'selection':'4kWp grid-connected roofPV, no battery; proposed8×500W modules. A declared compatibility package, not an actual roof/yield design.',
 'reason':'Future L2026 renewable generation duty is not silently treated as optional. Applicability/transition and reasonable site output must be assessed.',
 'modules':8,'moduleRequiredWp':500,'maximumModuleMM':[2200,1150,50],
 'arrayRequirements':[{'id':n,'modules':4,'grossSinglePlaneTerritoryMM':[3400,5630],
   'projectionReservation':r,'scope':'Actual inclination/hip/valley/wind/fire/setback/fixing/maintenance plane must be earned; this is a required roof interface, not an existing proved plane.'}
   for n,r in [('east',[8400,3200,3400,5630]),('west',[200,3200,3400,5630])]],
 'DCRequiredRoutes':[[[10000,6000,7200],[10000,5000,6350],[10000,5000,2925],[11200,2200,2925],[9650,650,1600]],
   [[2000,6000,7200],[3500,6000,6350],[3500,3500,6350],[8500,3500,6350],[10000,5000,6350]]],
 'inverterRequiredEnvelope':[9400,417.5,500,250],'inverterWorkingField':[9400,667.5,600,1000],
 'access':'Groundutility inverter isolation/terminal service; roof modules from externally engineered scaffold/lift and retained roofanchors, not loftstairs or standing on modules. Roof cable sleeves/firestop and metal weather flashing remain independent of cable replacement.',
 'electrical':'Matched certified module/inverter/isolator/protection/earthing system; exact cable voltage/current/string topology, rapidshutdown/firestrategy and distribution capacity are unselected. No annual yield, grid export or HP offset claimed.',
 'residue':'8 module encapsulation/backsheet/junction assemblies plus DC insulation/connectors and1 inverter/control assembly; exact chemistry/mass/length/replacement warranty unknown, never glass/aluminium-only claim.',
 'alternative':'Omit battery/optimisers unless shading/safety proves need. Groundarray is a separate actual site redesign, not a free fallback. No permission to remove module encapsulation/connector insulation.'}
other.append({'id':'PV-generation','count':8,'path':pv['DCRequiredRoutes'][0],
 'decision':'4kWp conditional roof requirement and utility inverter; roofplane/source, solar access, fixation/fire/cable/renewal and actual output must converge before selected apparatus. No energy-offset credit from nameplate.'})
residues.append({'id':'PV','quantity':'8 modules +1inverter + matched DC cable/connectors/isolators','location':'Required roof planes and accessibleutility station',
 'known':pv['residue'],'alternative':pv['alternative'],'replacement':pv['access'],
 'proposal':'Exact certified system residuals after roof/material comparison; no owner exception approved.'})

result={'status':'Constructive provisional whole-house service baseline; no accepted apparatus, materials, fire route, site loading or commissioning.',
 'basis':{'HADHead':HEAD,'HADPath':PATH,'HADBlob':BLOB,'HADStatus':b['status'],
  'mergedInterfaceMain':'546c98f93a3dccbfe48119bd2e92117b6e2d766f','units':'mm, local proposed groundFFL0; first3450; all z use one datum'},
 'selection':'Local continuousMEV + background vents + separate cooker capture +8kW compatibility monobloc/radiators +300L hotwater.',
 'air':air,'extract':extract,'supply':supplies,
 'cooker':{'extractPoint':[11200,12000,2400],'duct':160,'exhaustRadialInsulation':50,'metalJacketEachSide':1,'fullInsulatedOD':262,'formedWallTerritory':320,'minimumCaptureLps':30,'makeupPoint':[12000,8600,2400],
   'makeupFormedTerritory':280,'makeupRequirement':'Dedicated measured30L/s at5Pa, pressure-controlled/interlocked opening, normally closed. Separate from65L/s background; no open-window chore or recirculation-onlyhood credit.',
   'hood':'600wide spans600hob; actual capture, grease cleanout, motor/controls/residues and classified cooking/fire relationship required.'},
 'heat':heat,'pipeCrossovers':gates,'interfaces':{'familyWetRoom':rewinds['familyWetRoom'],'kitchenSinkStation':sink},'rewinds':rewinds,'eastFoulExit':east_exit,'PV':pv,'pipeInsulation':insulation,'hotWater':hot,'plant':plant,'trunks':trunks,'wallCrossingEnquiries':crossings,'fixtures':schedule,'otherDuties':other,'residues':residues,
 'notAdmitted':['Every exterior core/lintel/thermal/gas/weather junction','Riser trimmed RC opening and upper connections','Specific protected-door transfer and pipe/cable firestops','Exact emitters/pumps/fittings and measured performance','Actual mains, site climate, network/outfall/pressure/noise/pollution and power','Owner-approved polymer exceptions; none created'],
 'reproduction':'Python standard library. If frozen HAD object is absent, explicitly git fetch origin c83a06f26cf3b146d7cdc8254b4799f390508196; verify fullblob. No synthetic merge parent or geometry substitution. Geometry tests distinguish finite reservations from engineering acceptance.'}

def esc(s):return html.escape(str(s))
def text(x,y,s,size=3):return f'<text x="{x}" y="{y}" font-size="{size}" font-family="Arial">{esc(s)}</text>'
def rect(x,y,w,h,stroke='#777',fill='none',sw=.35):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def plan(level,ox,oy):
 s=[];sc=.01
 def box(r,col,fill='none'):return rect(ox+r[0]*sc,oy+r[1]*sc,r[2]*sc,r[3]*sc,col,fill)
 s.append(box([0,0,12000,12000],'#555'))
 s.append(box([3832.5,3832.5,4335,4335],'#777','#e5ebe3'))
 if not level:s.append(box([4800,7750,2400,4250],'#1b8995','#dceef1'))
 for w in b['upperWalls' if level else 'groundWalls']:
  (x,y),(xx,yy)=w['a'],w['b'];r=[x,y-w['t']/2,xx-x,w['t']] if y==yy else [x-w['t']/2,y,w['t'],yy-y]
  s.append(box(r,'#bbb','#ddd'))
 furniture=dict(b['upperFurniture' if level else 'groundFurniture'])
 if level:
  for k in ['family-WC','family-basin','family-bath1700','family-service-cabinet']:furniture.pop(k,None)
  furniture.update({'family-WC':family['WC'],'family-basin':family['basin'],'family-bath':family['bath'],'family-column':family['column'],'riser':plant['riserGross']})
 else:
  for k in ['Q350-body','north-sink-station','north-cooking-station']:furniture.pop(k,None)
  furniture.update({'sink':sink['station'],'cooker':sink['cookingStationRewind']['footprint'],'washer':rewinds['utility']['washer'],'utilitysink':rewinds['utility']['sink'],'primarybuffer':plant['primaryBuffer']['station'],'hydraulics':plant['controlsHydraulics']})
 for n,r in furniture.items():s.append(box(r,'#b8b1a4'))
 if not level:
  s.append(box(fire['geometry']['groundStairEastWall']['finished'],'#69458a','#eee4f3'))
  for d in fire['doors'][:2]:s.append(box(d['closed'],'#69458a','#eee4f3'))
 for g in gates:
  if g['level']!=level:continue
  x,y=g['xy'];s.append(f'<circle cx="{ox+x*sc}" cy="{oy+y*sc}" r="1.8" fill="#d59b20"/>')
 for e in extract:
  if e['level']!=level:continue
  s.append(box(e['maintenancePlatformPlan'],'#3f8a55'))
  pts=' '.join(f'{ox+x*sc},{oy+y*sc}' for x,y,z in e['path'])
  s.append(f'<polyline points="{pts}" stroke="#9c223b" stroke-width=".55" fill="none"/>')
 for t in trunks:
  if t['level']!=level:continue
  pts=' '.join(f'{ox+x*sc},{oy+y*sc}' for x,y in t['path'])
  s.append(f'<polyline points="{pts}" stroke="#a24515" stroke-width=".9" fill="none"/>')
 for e in extract:
  if e['level']!=level:continue
  s.append(box(e['podPlan'],'#9c223b','#ffd5db'))
  x,y=e['path'][-1][:2];s.append(f'<circle cx="{ox+x*sc}" cy="{oy+y*sc}" r="1.7" fill="#9c223b"/>')
  s.append(text(ox+x*sc+2,oy+y*sc+1,e['id'],2.1))
 for a in supplies:
  if a['level']!=level:continue
  x,y=a['point'][:2];s.append(f'<circle cx="{ox+x*sc}" cy="{oy+y*sc}" r="1.7" fill="#146884"/>')
  s.append(text(ox+x*sc+2,oy+y*sc+1,a['id'],2.1))
 s.append(text(ox,oy-5,'FIRST / ordinary pipe axes6395' if level else 'GROUND / ordinary pipe axes2945',3.4))
 return ''.join(s)
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fffdf7"/>'
svg+=text(15,17,'ONE WHOLE-HOUSE SERVICE BASELINE / PROVISIONAL LOGGIA',5)
svg+=text(15,26,'Local continuous extract / actual outer-wall territories / high-level water and heating tree / no free attic',3)
svg+=plan(0,20,45)+plan(1,205,45)
notes=[
 'RED: six local extract paths/pods. BLUE: six supplies. BROWN: water/heat tree. GOLD: lower crossings. GREEN:700workbases.',
 '65L/s normal total; separate30L/s cooker capture + dedicated makeup. Four bedrooms / design occupancy2–6, not household facts.',
 f'Area upper-bound {area:.3f}m²;0.3criterion {area*.3:.3f}L/s. Interior walls/stairs included; not certified SAP/net area.',
 'Violet: protected groundstair wall/crossdoors. No ventilation duct enters protected ring; actual transfer/firedoor still mustmatch.',
 'Ground north shortcut REJECTED: outdoor loggia is not an indoor pipe corridor. Each wall/floor penetration needs actual support/seal.',
 'Pipe trees show connected design territories; fixture branches, radiator output/dimensions, fire crossing and renewal are conditional.',
 'Outdoor8kW compatibility plant and300L store are pre-site requirements; current product labels do not prove cold-weather duty.',
 'No apparatus or synthetic-polymer exception approved. Metal cases do not remove impellers, seals, insulation or electronics.',
 'HADc83 roomsource + a324 protectedinterface + explicit27finish/fixture rewinds. Unqualified, incomplete development checkpoint.'
]
for i,n in enumerate(notes):svg+=text(15,190+i*9,n,2.85)
svg+=text(15,285,'All dimensions mm / groundFFL0 / first3450. Reservations are not construction permissions. 1 November2026',2.7)+'</svg>\n'
outputs={BASE.with_suffix('.json'):json.dumps(result,indent=2,ensure_ascii=False)+'\n',BASE.with_suffix('.svg'):svg}
for p,s in outputs.items():
 if '--check' in sys.argv:
  assert p.read_text()==s,'Stale '+str(p)
 else:p.write_text(s)
print(json.dumps({'floorUpperBoundM2':area,'normalLps':65,'fixtures':len(schedule),'localExtractStations':len(extract),'conditional':True}))
