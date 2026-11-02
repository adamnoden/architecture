"""Finite pre-site services baseline, not product/engineering/material acceptance."""
from pathlib import Path
import hashlib, html, json, math, subprocess, sys

ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).with_suffix('')
HEAD='068e33ae52bbaa5ab0c3e3551350400e958e4033'
PATH='project/had/studies/open-north-loggia.json'
BLOB='5f5dd336be7cdadfd83cb869fb8257fad6b5b273'
try:raw=subprocess.check_output(['git','show',HEAD+':'+PATH],cwd=ROOT,stderr=subprocess.PIPE)
except subprocess.CalledProcessError:
 raise SystemExit('Missing immutable HAD input. Prepare explicitly: git fetch origin '+HEAD+'; then rerun. Do not substitute current geometry.')
assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==BLOB
b=json.loads(raw)
FIRE_HEAD=HEAD
FIRE_BLOB=BLOB
fire_raw=subprocess.check_output(['git','show',FIRE_HEAD+':'+PATH],cwd=ROOT)
assert hashlib.sha1(b'blob '+str(len(fire_raw)).encode()+b'\0'+fire_raw).hexdigest()==FIRE_BLOB
fire_house=json.loads(fire_raw)
REWIND_HEAD=HEAD
REWIND_BLOB=BLOB
rwraw=subprocess.check_output(['git','show',REWIND_HEAD+':'+PATH],cwd=ROOT)
assert hashlib.sha1(b'blob '+str(len(rwraw)).encode()+b'\0'+rwraw).hexdigest()==REWIND_BLOB
rwhouse=json.loads(rwraw)

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
 'floorCriterionLps':area*.3,'bedroomCriterionLps':37,'selectedNormalLps':78,
 'floorAreaLimitAtSelectedFlowM2':78/.3,'normalACHControl':78*3.6/(area*3.1),
 'status':'Author-selected pre-site targets. No actual household, measured air leakage, pollution, climate or commissioning result.'}
assert air['floorCriterionLps']<78 and air['oldBControlM2']*.3<78

# Each duct station is entirely in its wet room and its own outer wall.
# Pod500wide x650projection x300high. Real K125EC dimensional comparator is246
# diameter/203axial plus40x88 terminalbox;326x300 is a conservative wholefan bound.
# HISTORICAL K125 geometry control only. Current bounded Titon selection is air.fanChoice below; no material or installed duty acceptance follows.
extract=[]
for name,level,wall,at,q,minimum in [
 ('ground-WC',0,'south',9000,13,6),('utility',0,'east',900,13,8),
 ('kitchen',0,'north',11382.5,13,13),('rear-bath',1,'west',9300,13,8),
 ('family-bath',1,'east',5750,13,8),('principal-bath',1,'east',6750,13,8)]:
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
      'requiredCurve':'Chosen Titon ducted13L/s direction with20Pa backpressure evidence. Complete normal resistance screen below20Pa;40Pa old arbitraryallowance is superseded, not proven by free-air rating',
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
 x['maintenancePlatformWorkingHeightRange']=[700,1100]
 x['platformStatus']='Qualifiedadjustablesteps/workplatform inclfeet/guards/stabilisers mustfitactualfloorfield, withperson-specificworkingheight700..1100. Old700square/H400 control cannotreach2800face andisREJECTED. Stability/load/access/fullworker/toolreach areactualequipment/physicalmatchingrequirements, notprovedbyanuniversal600sphere. No standingonpan/sink/counter orremovedfixedsupport.'
 x['ordinaryMode']='Poweredfan continuous; no occupied floorprojection below2800pod, exceptprincipaldescenderunderside2430. Mirrors/cisterns/appliances mustremainbelow the declared ceilingboundaries.'
platforms={'ground-WC':[7715,1050,750,1100],'utility':[10245,1525,1100,750],
 'kitchen':[9750,9850,1100,750],'rear-bath':[650,9250,1100,750],
 'family-bath':[10100,4875,1100,750],'principal-bath':[10333.75,6625,1000,750]}
for x in extract:
 x['maintenancePlatformPlan']=platforms[x['id']]
 x['workerEquipmentRequirement']={'target':'Actualqualifiedadjustableequipment/person/task combination, notuniversalanthropometry','maximumHeadTopLocal':2750,'ceilingFaceLocal':2800,'requiredTaskContactLocal':[2800,2900],'conditions':'Allfeet/guards/stabilisersinsidefloorfield; maintainactualdoor/egress/access; actualworkerhead/torso/arms/tools/loads/stabilityandtransfer reviewedforselectedequipment. H400cannotearnthisrouteandisrejected.'}
for x in [wc_fan,utility_fan,kitchen_fan]:
 x['raisedExhaustSection']={'axis':3010,'insulatedOD':227,'bottomBeforePanel':2896.5,'panel':20,
 'finishedUnderside':2876.5,'windowRawHeadControl':2850,'windowClear':26.5,
 'topBeforeSupport':3123.5,'supportTerritory':20,'actualGroundRCsoffit':3170,'supportToRCreserve':26.5,
 'scope':'Explicit localceiling/framingcutout belowknownRC3170; notfreeunprovedattic.60riseafterfan mustfitactualturn/collar envelope; no windowleaf crossingbelowrawhead.'}
for x in extract:
 assert x['clearPanel'][0]>=x['fanMaxBody'][0]+50
 assert x['clearPanel'][1]>=x['fanMaxBody'][1]+100
 assert x['panelFrameOuter'][0]<=500 and x['panelFrameOuter'][1]<=650
assert sum(x['normalLps'] for x in extract)==78
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
for name,level,wall,at in [('study',0,'west',2700),('living',0,'west',9200),
 ('bed2',1,'south',2850),('bed3',1,'south',9150),('bed4',1,'north',4800),('principal',1,'north',11150)]:
    point=([at,0] if wall=='south' else [at,12000] if wall=='north' else [0,at])+[level*3450+2850]
    supplies.append({'id':name,'level':level,'wall':wall,'point':point,'measuredEquivalentAreaRequired':15000,
      'formedWallTerritory':360,'metalTerminalEnvelope':[400,400,100],'clearDuct':200,'radialInsulation':50,'metalJacketEachSide':1,'fullInsulatedOD':302,'wallHoleRadialReserve':29,'faceTopLocal':3050,'ceilingClearance':50,
      'status':'Measured equivalent area, weather, draught and noise data required; geometric screen free area is not equivalent area'})
# EA orifice screening uses explicitly declared Cd/rho, not a tested vent curve.
def flow(ea,dp):return .61*ea/1e6*math.sqrt(2*dp/1.2)*1000
air['backgroundAreaMM2']=sum(x['measuredEquivalentAreaRequired'] for x in supplies)
air['orificeScreen']={'Cd':.61,'airDensity':1.2,'backgroundFlowAt2PaLps':flow(90000,2),
 'minimumSix4000EAFlowAt2PaLps':flow(24000,2),'one7600TransferAt3_5PaLps':flow(7600,3.5),
 'one3000TransferAt3_5PaLps':flow(3000,3.5),'notATestedCurve':True}
assert flow(90000,2)>78 and flow(24000,2)<78
assert flow(7600,5)>78/6 and flow(3000,5)<78/6
air['transfer']={'normalRequirement':'Every normally closed door on a supply-to-extract path must preserve the design transfer flow, including BOTH bedroom and wet-room doors where in series.',
 'minimumFinishedFreeArea':7600,'screenPerDoorPressurePa':5,'backgroundScreenPressurePa':2,
 'twoDoorPathScreenDepressionPa':10,'fireDoorRequirement':'Specific classified E20+ doorset with approved threshold/transfer arrangement at the required area; Sa requirements may invalidate this simple gap. No site cutting, seal deletion or blanket10mm permission.',
 'acceptance':'Not earned until the actual fire/door assembly and measured installed room pressures match. Narrow gap negative control fails.'}
def pressure(q,ea=7600):return .5*1.2*(q/1000/(.61*ea/1e6))**2
air['transfer']['fireSource']={'head':FIRE_HEAD,'jsonBlob':FIRE_BLOB,'interface':'protectedRoute only; Room/furniture/protected geometry share the same immutable068e33 input plus declared services rewinds'}
air['transfer']['doors']=fire['doors']
air['transfer']['normalFlowNetworkLps']={'eachHabitableSupplyScreen':13,'BED2_toRing':13,'BED3_toRing':13,'ringToBED4andRearBath':0,'ringToPrincipalAndBath':0,'ringToFamilyBath':13,'upperRingDownStair':13,'studyToProtectedHall':13,'livingViaWestCrossToHall':13,'hallToGuestWC':13,'hallViaPlantAndUtilityDoors':13,'hallViaEastCrossToKitchen':13}
assert 4*13-3*13==13 and 13+2*13==3*13
background_dp=pressure(78,90000)
air['transfer']['worstIndividualNormalDoorScreenPa']=pressure(13)
air['transfer']['normalDoorScreenLimitPa']=5
assert pressure(13)<5
air['transfer']['worstTwoDoorAndBackgroundScreenPa']=2*pressure(13)+background_dp
air['transfer']['backgroundScreenPressurePa']=background_dp
air['transfer']['twoDoorPathScreenDepressionPa']=2*pressure(13)+background_dp
fan_choice={'selectedDevelopmentFamily':'Titon Ultimate TP640Hi, continuous13L/s each, CF1 explicitly enabled (defaultCF0 is not sufficient). Six normal targets78L/s; boost16L/s moisture response separately commissioned.',
 'source':'https://products.titon.com/product/titon-ultimate-dmev/',
 'manual':'https://products.titon.com/wp-content/uploads/2026/03/DO5841.pdf',
 'publishedDuctedReference':{'flowLps':13,'powerW':1.89,'SFP':.15,'noiseDBAAt3m':28,'volumeReductionAt20PaPercent':1,'testBasis':'BRE SAP10 Consp10 rigidduct; noise100mmround PCDBV2.0:2013. Power/noise reference and20Pa reduction are distinct published quantities, not invented coincident readings.'},
 'fullBody':{'diameter':195,'projection':45,'tail':71,'weightKg':.5},
 'renewal':'Fan mounted to demountable pod underside with195body inside400clear hatch; disconnectelectrical afterisolation; removefascia/4topretainingfixings, supportbody, disconnectactualductcoupling then lowerwhole116deepunit. Fixedduct/supports/weatherseal retained. No inlineductfan substitution claimed.',
 'fixingRequirement':'Fan centre≥200fromadjacentwall; suppliedIPX4EPDM gasket retained/compressed≥1.5 inallinstallations. Actualceilingfixingpack not assumed suitable. No removal of gasket toclaimmetal-only.',
 'condensate':'Ceilingmode requiresindividuallyaccessible condensatetrap dischargingoutside; inclinedhorizontal duct awayfromfan; no trap connectedtosanitaryline byassumption. Reserve15drain alongsideownouterwalloutlet, inspectfromsamehatch.',
 'residues':'ABS body/impeller, EPDMIPX4 gasket, PCB/sensor/DCmotor/wire insulation andactualductcoupling/trap seals remain installed; proposalonly, noownerexception.',
 'failureBounds':'K125 curve212m3/h413Pa83W iswrongduty, noaffinity/noise admission. DEXA10013Lfreeflow1.8W isnot40Paproof. DEXA150Hcurve about15Paat13L hasinsufficientwindreserve forold40Pascreen; notchosen.',
 'powerAcceptanceCeilingW':3.9,'SFPDevelopmentCeiling':.3,'noiseDuty':'Published28dBA@3m ductedreference; wetroomdesign≤45dBA andadjacentbedroom≤30. Requirecompletecross-roomattenuation≥10dB atreferenceplusdistance/reverberationmargin; actualinstalled noise/CFpower measured, not claimed fromfreefieldreference.'}
for e in extract:
 v=e['ductVelocityMps'];dyn=.5*1.2*v*v;L=length(e['path'])/1000
 ductloss=dyn*(7+.025*L/.125)
 total=2*pressure(13)+background_dp+ductloss
 e['normalResistanceScreen']={'tubeLengthM':L,'airDensity':1.2,'DarcyFactorAllowance':.025,'sumKCompleteMaximum':7,'includes':'Allactualbends,grilles,100to125transition,condensatetrap andconnectioncollars combined; not7percomponent. Actualmatching isrequired.','ductTerminalPa':ductloss,'twoDoorAndBackgroundPa':2*pressure(13)+background_dp,'totalPa':total,'backpressureEvidencePa':20,'reservePa':20-total}
 assert total<20,e['id']
 e['selectedFanReference']='air.fanChoice';e['normalLps']=13
 e['ceilingTrapDrainTerritoryDiameter']=40
 end=e['path'][-1]; dp=list(end); dp[1 if e['wall'] in ['east','west'] else 0]+=200
 e['ceilingTrapDrainPort']={'centre':dp,'formedDiameter':40,'maximumDrainOD':15,'separateFromMainHole':True,'scope':'Additionalauthoredouterwallsleeve; HADfullopening/arch/weatherprofilecheckpending. Noannularsealborrowedfrom280mainport; nofoul/rainreceiverassumed.'}
 e['ceilingFixingCentreMinimumToWall']=200
 e['actualFamilyBody']=[195,116]
air['fanChoice']=fan_choice
air['transfer']['utilityNorthBoundaryRequirement']={'role':'OPENARCH, notaclosedutilitytransferdoor','rough':[10250,11150],'axisY':2550,'zone':'Sharedexcludedplant/utilityservicezone;protectedPlantE20doorremains.','architecturalCost':'Lossutility/plantacousticprivacy;explicitHADauthoredfunctionalcondition, notdeletedfire/privateclosure.','failure':'Ifutilitygetsaclosedleaf, three-doorcontrolappliesandreplan/rebalancefanperformance; noautomatictwo-doorPASS.'}
air['transfer']['normalFlowNetworkLps']['hallViaPlantDoorAndUtilityOpenArch']=air['transfer']['normalFlowNetworkLps'].pop('hallViaPlantAndUtilityDoors')
utility_screen=next(e for e in extract if e['id']=='utility')['normalResistanceScreen']
air['transfer']['failedThreeClosedDoorControl']={'extraDoorFlow':13,'extraDoorPa':pressure(13),'totalPaWithoutSecondaryFront':utility_screen['totalPa']+pressure(13),'withMetalFrontPa':utility_screen['totalPa']+pressure(13)+2,'comparisonLimitPa':20,'status':'FAILEDclosedleafcontrol;selectedutilityOPENARCHremovesthisthirdresistance, actual20Patestremainsdistinctfromnominalpower/noise.'}
assert air['transfer']['failedThreeClosedDoorControl']['totalPaWithoutSecondaryFront']>20

fan_choice['separateMetalServiceFrontTrial']={'status':'Geometricallycredible boundedsecondaryfront; manufacturer-permissibleconfiguration NOTestablishedbycurrentmanual. NoOEMfascia/gasket/control removed ormodified.',
 'metalPanel':[400,450],'minimumNetFreeAreaAfterBaffles':18000,'centralOpaqueDiscMinimumDiameter':200,'OEMFaceMinimumGap':15,'OEMFasciaBottomLocal':2815,'OEMMountPlaneLocal':2860,'OEMTailTopLocal':2931,'separateFrontInnerPlaneLocal':2800,
 'minimumPeripheralApproachArea':math.pi*195*15,'additionalLossMaximumPa':2,
 'manufacturingRequirement':'Independentremovableallmetalfront withbaffledlouvers preventsnormaldirectviewofABSface; maintainnetfreearea afteropaque200disc/baffles. FullOEMfascia staysfittedduringoperation/commissioning; no coverclipped orsealedtoOEMbody.',
 'ductConnectionRequirement':'Exact100spigot/socket/elbow/125transition mustconnectmount2860/tail2931 toductaxis2950 withcompleteinsulatedtop≤3100 (groundraisedruns useexplicitknownRCcutout).100clearhood trialwasrejectedbecauseitraisesupperelbowabovesoffit; nofreeuppervoid.',
 'release':'Removeindependentlyretainedmetalfront FIRST; intactOEMfascia/4topfixings/electricalconnection becomeaccessible. Complete195diam116deepunit stillpasses400clearopening; retainfixedductsupports/seals. Actualtool/socketwithdrawal strokesmustfitpod.',
 'policyOutcome':'ConcealmentdoesnotexemptretainedABS/EPDM/PCB/motorinsulation. IfOEMconfigurationpermission/intakepressure/connectionstackcannotmatch, omitsecondaryfront anddeclareactualvisibleABSfascia asunapprovedownerexceptionproposal; nevercallwhiteplasticacceptablebydefault.'}
assert fan_choice['separateMetalServiceFrontTrial']['minimumPeripheralApproachArea']>.9*math.pi*100**2/4
for e in extract:
 e['normalResistanceScreen']['includingMetalFrontTrialPa']=e['normalResistanceScreen']['totalPa']+2
 assert e['normalResistanceScreen']['includingMetalFrontTrialPa']<20


# Sourced F/L documents control only their stated methodology; these are authored
# thermal sensitivities. They are neither site weather nor room heat-loss design.
thermal=[]
for fabric in [80,140,220]:
 for dt in [20,25,30]:
    ventilation=1.2*78
    thermal.append({'fabricPlusInfiltrationWK':fabric,'deltaTK':dt,
      'MEVkW':(fabric+ventilation)*dt/1000,'MVHR70percentControlKW':(fabric+.3*ventilation)*dt/1000,
      'MVHRVentOnlySavingKW':.7*ventilation*dt/1000})
heat={'selectedArchitecture':'Outdoor R290 monobloc, separated frost-protected primary, indoor plate exchanger, direct weather-compensated radiators; DHW priority. No underfloor polymer tube.',
 'designCompatibilityDutyKW':8,'designPoint':'Outdoor−3 / indoor20 / emitter45flow40return, authored procurement requirement not actual site weather or manufacturer output',
 'waterFlowAt8KW_5K_Lps':8/(4.18*5),'maximumFabricPlusInfiltrationWKAtDelta25':8000/25-93.6,
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
# Concrete conventional emitter comparison at conservative22K correction.
# 45/40/20 has arithmetic22.5K; using22K factor.342 avoids upwardinterpolation.
heat['roomOutputCompatibilityBudgetsKW']['living']=1.25
heat['roomOutputCompatibilityBudgetsKW']['kitchenDining']=.95
assert abs(sum(heat['roomOutputCompatibilityBudgetsKW'].values())-8)<1e-9
emitters=[]
for name,room,level,L,r,z,branch,notes in [
 ('study-W','study',0,1000,[429.5,1250,200,1150],100,[[2500,2500],[750,2500],[750,1150],[500,1150]],'SelectedWESTunit; desk55Eto655. South1800body2580/765, Westbody754.5/2724. Drop1150Sof1800window, notglazing. Sradcontrolblockedactualwindowbodyandrejected.'),
 ('living-W','living',0,800,[429.5,9800,200,950],100,[[3500,9200],[2200,9200],[2200,9550],[550,9550]],'WESTunitSofR01cabinet10800. Drop9550Sof10200window; actualpairedtube159territorymuststaySof9700rawedge. SofaA650Eparkbeforeunhang. OriginalN1blockedsoleR01passageandisrejected.'),
 ('living-N2','living',0,800,[3102.5,11370.5,950,200],100,[[3500,9200],[4200,9200],[4200,11200],[4100,11200],[4100,11500]],'25afterfull18receiver3077.5; drop4100solidNpierbefore4262.5returnbase. Actualopeningarch/profileforhighfeedmustmatch; nolatentcorecut.'),
 ('kitchen-E','kitchenDining',0,1200,[11370.5,9700,200,1350],100,[[10500,10800],[11200,10800],[11200,11050],[11470.5,11050]],'Requiredroomallocation.95 notsiteheatloss;10200windowdropisnorthofwindowat11050. Fullvalve/dropmuststaySofcornerpost11188.'),
 ('bed2-S','bed2',1,800,[3425,429.5,950,200],100,[[3900,2300],[3200,2300],[3200,550],[3425,550]],'DropX3200solidpier betweenS1800/3900openings; lowfeedunderwindow. WardrobeY1017.5remains.'),
 ('bed3-S','bed3',1,800,[7625,429.5,950,200],100,[[8700,2300],[7500,2300],[7500,550],[7625,550]],'DropX7500solidpier; noverticalpipeatwindow8100.'),
 ('bed4-N','bed4',1,900,[3102.5,11370.5,1050,200],100,[[4500,9150],[4800,9150],[4800,11200],[4100,11200],[4100,11500]],'SelectedH700xL900afterfull18receiver;25left/110right. Cillunderside900for800top+50lift+50reserve. Drop4100replacesfailed4300returnroute; actualfullarchscreenrequired.'),
 ('principal-N','principal',1,1000,[9625,11370.5,1150,200],100,[[10350,8700],[10800,8700],[10800,11200],[11100,11200],[11100,11500],[10775,11500]],'Drop11100solidNpier beyond10200window; notthroughbedhead orwindowglass.'),
 ('rear-N','rearBath',1,500,[2100,11367.5,650,200],100,[[1800,10800],[2405,10800],[2405,11500]],'Smallradclearsactual2775.5beam/wetfaceby25.5; drop2405solidNpier. WCbody1589.5/11177.5 remainsclear.'),
 ('family-E','familyBath',1,500,[11367.5,4525,200,650],100,[[11200,5000],[11200,4550],[11467.5,4550]],'25northofbathend4500/25southofbasin5200; actualwindow/bodytaskmustretain600body.'),
 ('principal-E-high','principalBath',1,500,[11367.5,6775,200,650],1400,[[11200,7000],[11467.5,7000]],'Highmount1400..2000 explicitlyavoidsWCbodyfloorcircle; actualpan/cisternheight≤1250required. Topserviceusesseparate200highplatform11000/6900/400square, notstandingonpan.'),
 ('utility-E','utility',0,500,[11370.5,1778,200,650],100,[[11200,1800],[11200,2400],[11470.5,2400]],'Cillunderside≥800required; occupiedsinkbody11045.5/1725 clearsfullradiator25X. FanplatformshiftedW.'),
 ('plant-N','plant',0,400,[9422,6203,550,200],100,[[9800,5000],[10500,5000],[10500,6300],[9697,6300]],'Nwall6403/Wdry9397; fullradiator25fromWcorner. Roundbufferrelocationand150maxfrontunhangrequired; noerasedQ350/riser/cylinder/controls.'),
 ('protected-G','protectedCirculation',0,400,[3500,2747.5,550,200],100,[[3500,3500],[3750,3500],[3750,2847.5]],'Nface study-cloak-north; exactHADconditionalsolidwall; protectedroute600body/doortrim mustremain.'),
 ('protected-F','protectedCirculation',1,400,[8180,4400,200,550],100,[[8500,5900],[8500,4400],[8280,4400]],'CourtEactualdryface8179.5;0.5setoutnominal, noairtightlayermissing. Complete200depth+18wetspinebaseleaves805routewidth,600bodywith102.5each. SolidwallbeforeactualcourtEwindow6200.'),
 ('guest-WC-E','guestWC',0,400,[9003,1900,200,550],100,[[8500,1800],[8900,1800],[9103,1900]],'Actual27service-spineface9203. Front-facingWCbody8900/1550clear50Ytoemitter; notoldfreewall9300.'),
]:
 room_target=22 if room in ['rearBath','familyBath','principalBath','guestWC'] else 20
 factor=.302 if room_target==22 else .342
 body_height=700 if name=='bed4-N' else 600
 nominal=2441 if name=='bed4-N' else 2389*(L/1000)
 dry_per_m=60.77 if body_height==700 else 52.5
 water_per_m=11.37 if body_height==700 else 9.8
 n_coeff=1.34 if body_height==700 else 1.32
 assert factor<=(((45+40)/2-room_target)/50)**n_coeff
 output=nominal*factor
 item={'id':name,'room':room,'level':level,'family':'StelradCompactK3H'+str(body_height),'length':L,'bodyHeight':body_height,'completePlanWithValvesAndBrackets':r,'bottomLocal':z,'topLocal':z+body_height,'nominalDelta50W':nominal,'roomTargetC':room_target,'conservativeCorrectionFactor':factor,'screenOutputW':output,'nCoefficient':n_coeff,'dryMassKg':dry_per_m*L/1000,'filledMassKg':(dry_per_m+water_per_m)*L/1000,'pressurePairBranchPlan':branch,'upperBranchAxisLocal':2945,'notes':notes}
 item['renewal']={'isolate':'Bothlocalaccessiblevalves isolate/drainbeforeunionrelease. Retainedwallpair capped/supported; nofloorseal touched. Exactvalve/connector match isrequired.','requiredLift':50,'requiredFrontPull':150 if room=='plant' else 200,'cillUndersideMinimumIfUnderWindow':900 if name=='bed4-N' else 800,'cillReserveAfterLift':50,'requiredDrawnSillTopIfUnderWindow':950 if name=='bed4-N' else 850,'maximumCompleteCillThickness':50,'handling':f'{body_height}high×{L}longselectedbody;drainfirst;drybody{dry_per_m*L/1000:.3f}kgplusactualvalves/clipsrequiresqualifiedmechanicalhandlingandfixings—notinventedhumanlifting.'}
 emitters.append(item)
heat['emitterSchedule']=emitters
heat['emitterEvidence']={'technical':'https://www.stelradprofessional.com/wp-content/uploads/2019/12/28968_Compact_K3_Web.pdf','correction':'https://www.stelrad.ie/wp-content/uploads/2021/10/Stelrad-Correction-Factor-Oct-21.pdf','actualMountedDepth':180,'completeDepthAllowance':200,'valveEndAllowanceEachSide':75,'dryKgPerM':52.5,'waterLPerM':9.8,'nCoefficient':1.32,'scope':'ActualK3lowtemperature/mass/profilecomparison; exactpaint/coating/plasticbracketclips/valves andhumiditycompatibility remainunadmitted. No strippingfactoryfinish. Capacityscreen isagainstauthored8kWroomallocation, notsiteheatloss.'}
heat['emitterRemainingInternal']=['BindfinalHADrepairedsource, actualwindowcillunderside800/setoutandfullbodycheck; noactualapparatusorfixingadmission.']
for room in set(x['room'] for x in emitters):
 assert sum(x['screenOutputW'] for x in emitters if x['room']==room)>=heat['roomOutputCompatibilityBudgetsKW'][room]*1000,room

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
 'controlsHydraulics':[11270.5,5550,300,650],
 'controlsMaximumHeight':2300,
 'primaryBuffer':{'requiredUsableAlwaysConnectedLitres':100,'stationRewind':'Relocatedfrom9800/5550afterfiniteemittercoordination; oldQ350isretireduninstalledcomparison, notsilentlyremovedsupport.','station':[10025,5525,650,650],'completeRoundBodyMaximumDiameter':600,'completeRoundBodyIncludes':'Allinsulation/feet/supports/collarsandretainedfittingsfit600round;650stationincludes25edgeclear. No barevesselnominalsubstitution.',
  'maximumBodyHeight':1600,'nominalVolumeNotUsableProof':True,
  'reason':'Separated primary cannot borrow unproved radiator volume across plateHX fordefrost.100usable is an authorselected compatibility target, not a claimed universal supplierminimum.',
  'control':'Always-connected usable volume, guaranteed minimum flow and both HX pumps during defrost; valve/check/bypass states must preserve it. Exact chosen unit determines actual minimum and usable port arrangement.',
  'replacementCentrePath':[[10350,5850],[10700,5850],[10700,4600],[12500,4600]],
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
plant['emitterJoin']={'radComplete':[9422,6203,550,200],'radRoutineBody':[9725,5878,300],'radAfter150PullBody':[9725,5728,300],'controlsBody':[10945.5,6078,300],'bufferFrontServiceBody':[10350,5200,300],'bufferPortFaceRequirement':'Southfaceaccessiblevalves/instrumentation600..1600, drainlowerwithqualifiedkneelingtask; nohiddenrearserviceassumed.','failed200Pull':'Operatorneeded5678wouldintersectretainedriser; chosen≤150requiresactualunhang/socketmatch. Nofixedsupportdeleted.'}
round_centre=[10350,5850];round_radius=300
for key in ['radRoutineBody','radAfter150PullBody','controlsBody','bufferFrontServiceBody']:
 x,y,r=plant['emitterJoin'][key]
 assert math.dist([x,y],round_centre)-r-round_radius>=25,key
 assert y+r<=6403-25,key
plant['emitterJoin']['radToBufferBodyReserve']=math.dist([9725,5878],round_centre)-600
plant['emitterJoin']['controlsToBufferBodyReserve']=math.dist([10945.5,6078],round_centre)-600
plant['emitterJoin']['frontServiceToBufferReserve']=650-600
for a,c in zip(plant['primaryBuffer']['replacementCentrePath'],plant['primaryBuffer']['replacementCentrePath'][1:]):
 swept=[min(a[0],c[0])-425,min(a[1],c[1])-425,abs(a[0]-c[0])+850,abs(a[1]-c[1])+850]
 rr=plant['emitterJoin']['radComplete'];dx=max(rr[0]-max(a[0],c[0]),min(a[0],c[0])-rr[0]-rr[2],0);dy=max(rr[1]-max(a[1],c[1]),min(a[1],c[1])-rr[1]-rr[3],0)
 assert math.hypot(dx,dy)-425>=25

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
 ('rear-WC',1,1,[729.5,11000],['cold','soil']),('rear-basin',1,1,[1000,8937.5],['cold','hot','waste']),
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
 'valveBay':[10700,700,250,700],'electricalStation':[9397,1750,300,650],
 'electricalWorkingField':[9697,1750,1000,650],'PVinverter':[9400,429.5,500,250],
 'PVworkingField':[9400,679.5,600,1000],
 'working':'Washer/sink front at1400, floor task field to2000. Washer valve10800/1250 is450 from front bodycentre10800/1700, not inaccessible behind appliance. Utility door must be checked in actual open/closed modes; no sink-use pass under an untested inward900leaf. Cu/inverter work fields do not intersect proposed fixed appliance bodies.'}}
for work in ['electricalWorkingField','PVworkingField']:
 for fixed in ['washer','sink']:assert not overlap(rewinds['utility'][work],rewinds['utility'][fixed])
rewinds['rearSource27']={'groundStackCabinet':[429.5,10800,300,750],'upperCabinet':[429.5,10800,300,750],'lowBox':[429.5,9937.5,150,862.5],'panBack':729.5,'retainedFloorPort':[567.5,11177.5,160],'portEdgeReserves':[58,82],'requiredBackProjection':162,'status':'Explicit12east finish correction from417.5 to429.5; floorport unchanged. Old merged pan withdrawal witness must be repeated against shifted cabinet/pan; no automatic pass.'}
rear_tray_target=[1802.5,8952.5,1000,1000]
family=rewinds['familyWetRoom'];col=family['column'];px,py,pd=family['port']
for d in [pd,family['aboveFloorTerminalSupportEnvelope']]:
 assert min(px-d/2-col[0],col[0]+col[2]-px-d/2,py-d/2-col[1],col[1]+col[3]-py-d/2)>=25
assert not overlap(family['WC'],col) and not overlap(family['basin'],family['WC'])
assert family['WC'][1]-(family['basin'][1]+family['basin'][3])==100

sink={'status':'Draft interface: selecteddevelopment direction ishead-first disassembly, exactIAScontractpending. Whole-frameW/S/rig fields belowareREJECTED historicalcontrol, notadoptedhandlingproof; retainedunion/servicegeometryremaincompatibilitytargets.',
 'station':[8700,10970.5,900,600],'maximumRemovedHeight':1000,'initialLift':20,'retainedStudHeight':15,'retainedBodyTopMaximum':475,'movingUpperLowPointAfterLiftMinimum':495,'maximumCaptureStroke':15,'captureReserveAfterLift':5,'noLowTransverseFrameRail':True,
 'studs':[[x,y] for x in [8765,9535] for y in [11070.5,11470.5]],
 'frontAccessPlan':[8950,10875.5,400,150],'frontAccessZ':[400,550],
 'operatorCentre':[9500,10625],'unions':[
  {'id':'cold','axis':[9025,10950.5,475],'axisDirection':[0,0,1],'maximumDiameter':80,'maximumAxial':100},
  {'id':'hot','axis':[9130,10950.5,475],'axisDirection':[0,0,1],'maximumDiameter':80,'maximumAxial':100},
  {'id':'waste','axis':[9275,10950.5,475],'axisDirection':[0,0,1],'maximumDiameter':100,'maximumAxial':100}],
 'sequence':'Isolate/drain; accessibletrue-uniondisengagement FIRST; independentlysupported retainedpipes capped.20lift thenW600 andS600 withdrawal ofstation doesnot liftpipe/support/floorseal. Retained trap staysbelowunion; no movingtrap below495. No rearhiddenrelease assumed.',
 'wasteRequiredRoute':[[9275,10950.5,475],[9275,10950.5,300],[9275,12000,273.7625],[9275,12450,-1980]],
 'actualSupplierRequired':'Bothpressureunions andwastetrap/union mustbe compatiblewithsame release sequence, material, hygiene andgravity duty; nominalmetal/diameter isnot a completepartpass.'}
for u in sink['unions']:
 x,y,z=u['axis'];r=u['maximumDiameter']/2;a=u['maximumAxial']/2;box=sink['frontAccessPlan']
 assert min(x-r-box[0],box[0]+box[2]-x-r,y-r-box[1],box[1]+box[3]-y-r,z-a-400,550-z-a)>=25
 u['planReachFromOperator']=math.dist([x,y],sink['operatorCentre'])
 assert u['planReachFromOperator']<600
assert sink['initialLift']-sink['retainedStudHeight']==5
sink['handlingRequirement']={'movingHeadPlan':[900,670],'firstTranslation':[-600,0],'secondTranslation':[0,-600],'tableSource':{'head':REWIND_HEAD,'blob':REWIND_BLOB,'table':rwhouse['groundFurniture']['dining-table1200x800']},'tableInitialYRequired':9100,'tableFirstY':9000,'tableFinalY':9650,'ENchairPark':[10800,8475,500,500],'otherChairParks':[[7750,y,500,500] for y in [8600,9150,9700]],'status':'Narrow IAS coordination rewind; Actual0b2 table source pinned; full IAS sequence reproduction pending. No old chair parking or stale c83 table location credited.'}
sink['retainedTrap']='Trap isfixedbelowwasteunion; movingstation tail terminatesat475 before20lift and≥495after. Actual trap/waterseal/cleanout mustfit below475; no movingPtrap sweptthroughfixedpipe.'
sink['retainedFeed']={'verticalCornerColumn':[11425,11188,145,224],
 'coldPath':[[10500,10800,2945],[11487,10800,2945],[11487,11250,2945],[11487,11250,242],[9025,11250,242],[9025,10950.5,242],[9025,10950.5,425]],
 'hotPath':[[10500,10800,2945],[11487,10800,2945],[11487,11350,2945],[11487,11350,242],[9130,11350,242],[9130,10950.5,242],[9130,10950.5,425]],
 'tube':22,'radialInsulation':25,'metalJacketEachSide':1,'fullStraightOD':74,
 'completeCrossingSupportEnvelopeZ':[180,304],
 'rigEnvelopeBeforeLiftZ':[0,100],'rigEnvelopeAfterLiftZ':[0,140],
 'minimumRigClearance':40,'crossingTrackX':[9370,9470],'crossingY':[11250,11350],
 'supports':'Independentlyretainedfloor/wall supports. No bracket within trackcrossingX9370–9470; nearestsupportX9290(max100wide) ends9340,30clear. Nextsupport9800;510span requiresactualsupplier/capacitycheck. Pipe/supportsnevermove with station.',
 'frameRequirement':'No lowfronttransverse rail orsidebrace crossing fixedfeedbands below475. Top/highbraced900stationmustearn actualstiffness/anchorcapacity; no drawnexistingbrace silentlyremoved.',
 'cookerRequirement':'Built-in COMPACT455high oven over350accessibleplinth, not freestandingfullfloor chassis. Water/support envelope≤304;20deckunder330 leaves26clear. Exactoven/hobventilation/electricalseparation required.'}
sink['cookingStationRewind']={'footprint':[10750,10970.5,600,600],'top':900,'plinth':350,
 'ovenComparator':'BoschCMG7241.1:455h×594w×548d; underworktop niche460+4/min550depth withventilationcutout. Reference only, nomaterial/productapproval.',
 'ovenBodyZ':[350,805],'hobComparator':'BoschPUE611BB5E:51h×592w×522d;4.6kW, min16worktop, manufacturer ventilationpaths retained.',
 'hobBodyZ':[849,900],'bodyGap':44,'worktopToOvenFrontTop':95,
 'status':'Dimensionallyconstructive samebrandcompactcomparison, notcompleteinstallationapproval. Actualrear/frontventilation,heatresistantcarcass,powerisolations,fitandsafetyinstructionsnotwaived. Fullsize600ovenfails this350plinthcase.'}
assert sink['retainedFeed']['completeCrossingSupportEnvelopeZ'][0]-sink['retainedFeed']['rigEnvelopeAfterLiftZ'][1]==40
assert 330-sink['retainedFeed']['completeCrossingSupportEnvelopeZ'][1]==26 and 849-805==44
sink['selectedMethod']='HEAD-FIRST: fixedfloorframe/anchors/servicesstay; historicalwholeframeW/S/skates arenotselected.'
sink['headFirst']={'status':'INTERNAL CONTINUATION: sampled composite/operator research only; continuous/supportrecord incomplete. Selectedconditional target, notacceptedhandling. Noactualgrip/force/kit/table/framecapacityadmission.',
 'head':{'topPlan':sink['station'],'topZ':900,'returnDepth':30,'supportUndersideZ':870,'maximumMassKg':15,'bowlMinimumZ':600,'wholeCompositeMinimumZ':575,'bowlPlan':[8885,11050.5,530,440],'wingWidthEachSide':185,'retainedUnionBBodyInsideTop':True},
 'lowerA':sink['unions'],'upperB':[{'id':u['id'],'axis':[u['axis'][0],10985.5,625],'faceDirection':[0,-1,0],'maximumDiameter':u['maximumDiameter'],'northHeadHalfY':[10985.5,11035.5],'southSpoolHalfY':[10935.5,10985.5]} for u in sink['unions']],
 'firstSpoolRelease':{'phases':[[0,-20,0],[0,0,20]],'finalTranslation':[0,-20,20],'installedMovingLowestZ':475,'afterLowestZ':495,'retainedAHighestZ':475,'clearanceAfter':20,'maximumCapturedSpigotLengthAfterNutRelease':0,'requiredJoint':'Qualifiedflat-facezero-capture unions atBOTHorthogonalA/B. No radialnest/guide/cone remainsafterrelease. Two≤15capturedorthogonalseatswouldbindduringdiagonaltranslationandareREJECTED. Actualkitmustdemonstrateflatfacereleaseorroutefails.','storage':'Isolate/drain, releaseallnutsandsealadhesion, deliberatelyrenewfaceseals.20SfirstfreesB,then20UPfreesAwithZEROcapturednest. ThreesupportedspoolsstripFIRSTandparksealedonlabelledtray; fixedA/trap/pipe/legs cappedandsupported.'},
 'firstTask':{'bodyFloorCentre':[9550,10575],'bodyRadius':300,'shoulder':[9550,10775,625],'headRadius':150,'maximumHeadTop':875,'mode':'Qualifiedkneeling/stoopedtask, notstanding900verticalreach; exacthuman/forcesstillphysicalreview.'},
 'frame':{'fixed':True,'retainedFloorAnchors':sink['studs'],'frontRailZ':850,'frontRailMaximumMassKg':2,'frontRailRelease':'Support/unboltaccessiblefrontfastenersandhandcarrytoexactmaintenance-tablepark; rear/sides/highbracesremainstable. No hiddenrearbolts ormissingrail.','headFasteners':'FouraccessibleFRONTM6, rear15-highlocatingdowels, nohiddenrearfixings.'},
 'motion':{'initialUp':20,'initialSouth':40,'windowTrimProjection':18,'windowTrimReserve':22,'additionalUp':270,'totalUp':290,'bowlBottomAfterRaise':890,'sideFrameTop':850,'fixedPadsTop':870,'bowlToPadsClearance':20,'retainedBMinimumAfterRaise':865,'BToSideFrameClearance':15,'BNorthEndAfter40South':10995.5,'fixedPadSouthY':11010,'BPlanReserveToPad':14.5,'transferEast':950,'transferSouth':930.5,'thenCCWDegrees':90,'finalWest':1200,'completeHeadPlan':[900,600]},
 'operatorPhases':{'initial':[[8792.5,10650],[9507.5,10650]],'after40SouthY':10610,'shoulderZDuringAdditionalRaise':[1000,1200],'final':[[9610,9942.5],[9610,10657.5]],'continuation':'Continuouscomposite/worker/supportproofincomplete; numericcompatibilitytargetsnotphysicalacceptance.'},
 'grips':{'padDiameter':120,'padCentres':[[x,y] for x in [8792.5,9507.5] for y in [11060.5,11280.5]],'gripY':11145.5,'operatorSouthY':10650,'maximum3DReach':589.174,'maximumDeclaredReachScreen':600,'continuousBoundStatus':'Independentcontinuous/supportrecordnotyetcomplete; noacceptedphysicalevent','acceptance':'Actualqualifiedsurface/grips/twohandlers/force/stability/healthsafetyrequired; nohandliftingcapacityinvented.'},
 'tablePlacement':{'tableTopZ':750,'tableY':9650,'finalHeadCentre':[8900,10300],'finalTopPlan':[8600,9850,600,900],'finalBowlPlan':[8680,10035,440,530],'bearers':[[8600,9850,600,150,300],[8600,10600,600,150,300]],'bearerTopZ':1050,'carryReturnUndersideZ':1160,'carryTopZ':1190,'carryClearance':110,'lowerToSeat':110,'seatedTopZ':1080,'seatedReturnUndersideZ':1050,'seatedBowlBottomZ':780,'bowlToTableClearance':30,'bowlPlanReserveToEachBearer':35,'prestage':{'initialTableY':9100,'prestageTableY':9000,'initialSouthMove':100,'bearersBeforeNorthMove':[[8600,9200,600,150,300],[8600,9950,600,150,300]],'helperBeforeHandlers':[[8900,8675],[8900,10525]],'laterTablePushBodyPath':[[8900,8675],[8900,9325]],'laterNorthMove':650,'rule':'SecurebothwingbearersonEMPTYtableandhelperexitsBEFOREhandlersenter. AfterheadheldCCWintheEaisle,helperpushestable+securedlegs/bearers650N; nobodyclimbsonit.'},'supportAllocation':'BearerssupportEND/WINGreturnsoutsidebowl; bowlpassesBETWEEN, neverthroughbearers. LatebearerinstallationbehindfixedframeisREJECTED. Completeactualtable/supportcapacityandcontinuoushandlingeventunearned.'}}
for u in sink['headFirst']['upperB']:
 assert math.dist(u['axis'],sink['headFirst']['firstTask']['shoulder'])<600
for u in sink['unions']:
 assert math.dist(u['axis'],sink['headFirst']['firstTask']['shoulder'])<600
assert sink['headFirst']['tablePlacement']['seatedBowlBottomZ']-750==30
rewinds['kitchenSinkStation']=sink

# A serviceplatform cannot silently stand on the retained toilet, bath or worktop.
for e in extract:
 furniture=dict(b['upperFurniture' if e['level'] else 'groundFurniture'])
 if e['level']:
  for k in ['family-WC','family-basin','family-bath1700','family-service-cabinet']:furniture.pop(k,None)
  furniture.update({'rear-WC':[729.5,11000,560,355],'rear-cabinet':rewinds['rearSource27']['upperCabinet'],'rear-west-low-box':rewinds['rearSource27']['lowBox'],'rear-shower1000':rear_tray_target,'family-WC':family['WC'],'family-basin':family['basin'],'family-bath':family['bath'],'family-column':family['column'],'selected-riser':plant['riserGross']})
 else:
  furniture.pop('Q350-body',None);furniture.pop('north-sink-station',None)
  furniture.update({'sink-station':sink['station'],'washer':rewinds['utility']['washer'],'utility-sink':rewinds['utility']['sink'],'CU':rewinds['utility']['electricalStation'],'inverter':rewinds['utility']['PVinverter']})
 if e['id']=='kitchen':
  furniture['dining-chair-east-north']=[10800,8475,500,500];furniture['dining-chair-east-south']=[7750,10400,500,500]
  e['maintenanceFurniture']={'eastNorthChairPark':[10800,8475,500,500],'eastSouthChairPark':[7750,10400,500,500],'state':'Parktworigidchairsbeforeplatformerection; restoreaftercompletefanreassembly/testing/platformremoval. Actualotherchairs/table retained.'}
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
 {'id':'power-incoming','count':1,'path':[[12000,2200,1500],[9697,2200,1500]],'decision':'Meter/metalconsumer-unit onutility westface9397/1750/300×650, separate1000depth workingfield9697/1750. Utility-side cabinet/washing-machine layout must retain clear serviceface. Utility capacity/earthing/bonding/RCD/overcurrent and actual circuits by certified design.'},
 {'id':'power-distribution','count':'Functional circuit groups, not final circuit count','path':[[11200,1500,2925],[11200,5000,2925],[9800,5000,2925]],'decision':'Separate metal drytray follows declared indoor tree; own sealed floor aperture/tray supports, not tied to hotpipes. Mineral-insulated cable investigated, but terminations/controls/flex tails remain certified residuals; cable sizing and fire survival not invented.'},
 {'id':'cooking-power','count':1,'path':[[11200,1500,2925],[11200,10800,2925],[11100,11200,900]],'decision':'Electric cooking, accessible isolation and separate hood/control/makeup duty. No gas supply selected.'},
 {'id':'laundry-refrigeration','count':2,'path':[],'decision':'One washer reserve10050/700/650×700(requiredactualbody≤600wide) and fridge10920.5/9040; accessible isolated appliance tails. Washer is new proposal; manufacturer withdrawal/hose/workplate dimensions required, not built into structure.'},
 {'id':'lighting-controls-data','count':'All occupied rooms, circulation andplant','path':[],'decision':'Drytray branches drop to inspectable metal face stations; actual circuit/accessory count follows electrical layout. Wired controls, no mandatory cloud/radio. Data/fire-alarm isolation and earthing separate, no implied certified polymer-free circuits.'},
 {'id':'fire-detection','count':'Whole-house alarm layout to fire strategy','path':[],'decision':'Protected stair/ring and every habitable/wet risk zone scheduled for actual compliant detector design; no device locations or grade/category invented. Certified alarm internals/backup power are explicit residue; do not delete to satisfy materials.'},
 {'id':'purge-overheating','count':6,'path':[],'decision':'Every habitable room retains actual operablewindow task; openings/noise/security/fall protection and orientation/climate/shading must prove purge/overheating.65L/s winterventilation is not cooling and no cooling duty is silently omitted.'},
]

residues=[
 {'id':'MEV-fans','quantity':'6 complete replaceable stations','location':'Six outer-wall wet-room pods','known':'Selected development TitonUltimate has ABSbody/impeller, EPDMmandatoryIPX4gasket, PCB/sensor/DCmotor/wireinsulation; exactrevision and completeconstituentextent required. MetalcaseK comparator retainsreinforcedpolyamide andfails duty-specific evidence.',
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
 'inverterRequiredEnvelope':rewinds['utility']['PVinverter'],'inverterWorkingField':rewinds['utility']['PVworkingField'],
 'access':'Groundutility inverter isolation/terminal service; roof modules from externally engineered scaffold/lift and retained roofanchors, not loftstairs or standing on modules. Roof cable sleeves/firestop and metal weather flashing remain independent of cable replacement.',
 'electrical':'Matched certified module/inverter/isolator/protection/earthing system; exact cable voltage/current/string topology, rapidshutdown/firestrategy and distribution capacity are unselected. No annual yield, grid export or HP offset claimed.',
 'residue':'8 module encapsulation/backsheet/junction assemblies plus DC insulation/connectors and1 inverter/control assembly; exact chemistry/mass/length/replacement warranty unknown, never glass/aluminium-only claim.',
 'alternative':'Omit battery/optimisers unless shading/safety proves need. Groundarray is a separate actual site redesign, not a free fallback. No permission to remove module encapsulation/connector insulation.'}
other.append({'id':'PV-generation','count':8,'path':pv['DCRequiredRoutes'][0],
 'decision':'4kWp conditional roof requirement and utility inverter; roofplane/source, solar access, fixation/fire/cable/renewal and actual output must converge before selected apparatus. No energy-offset credit from nameplate.'})
residues.append({'id':'wall-emitters','quantity':str(len(emitters))+'completewallradiators/'+str(round(sum(e['length'] for e in emitters)/1000,2))+'bodymetres','location':'All14explicitroom/circulationduties','known':'Steelwaterwaysdo notqualifyfinish, paint/polyester/epoxy, plasticbracketclips, valveheads/seats/diaphragms orjointseals. Exactproductrevision/installedextentrequired.','dryMassComparisonKg':sum(e['dryMassKg'] for e in emitters),'filledMassComparisonKg':sum(e['filledMassKg'] for e in emitters),'alternative':'Bare/mineralfinishedmetalapprovedvariantorcompatibleallmetalcontrolsarecomparisonrequirements; nostrippingfactorycoating/valveseals.','replacement':'Isolate/drainlocalradiator; retainfixedwallpipepairandcaps; actual50up/200front(orplant150)unhangtarget, mechanicalhandlingandfixingloads.','proposal':'Noownerexceptionapproved; exactvisible/hiddenconstituentsandmanufacturer-permittedfinishmustbequalified.'})
residues.append({'id':'PV','quantity':'8 modules +1inverter + matched DC cable/connectors/isolators','location':'Required roof planes and accessibleutility station',
 'known':pv['residue'],'alternative':pv['alternative'],'replacement':pv['access'],
 'proposal':'Exact certified system residuals after roof/material comparison; no owner exception approved.'})

rear_drop={'status':'Constructive compatibility requirement for separate rear1000 tray, not actual matched outlet/support/union admission.',
 'port':[2122.5,9452.5,110],'trayDrainEvidence':{'selectedReference':'BetteUltra5940 WESTdrain; interiors auditedB2 nativeDW_0082','tray':rear_tray_target,'drainCentre':[2012.5,9452.5],'requiredTailOffset':[110,0],'requiredPlanOffsetMagnitude':110,'status':'Authored250x160connectionterritory cancontain offset, butactualB568outlet/elbow/support/seat/height/release mustmatch; not1000frameapprovalor900transfer.'},'clearSleeveInside':97,'maximumRenewableStem':75,
 'unionA':[2122.5,9452.5,2950],'turnT':[2122.5,9452.5,2777.375],'unionB':[2022.5,9452.5,2774.875],
 'branch':[[2122.5,9452.5,2777.375],[1750,9452.5,2768.0625],[1750,11177.5,2724.9375],[567.5,11177.5,2695.375]],
 'gradient':40,'maximumCompleteFittingOD':100,'supportDepth':25,'airReserve':25,'innerPanelTop':2595.375,'panelThickness':20,'finishedPanelUnderside':2575.375,
 'clearHatch':[1722.5,9052.5,800,800],'outerHatch':[1702.5,9032.5,840,840],
 'fixedBeamFinishedWestFace':2775.5,'fixedBeamSoffit':3005,
 'spoolMotion':[[50,0,-50],[0,0,-450]],'spoolMaximumTopBefore':3000,'spoolMaximumTopAfter':2500,'finalPanelClearance':75.375,
 'upperRenewal':{'temporaryClosure':'75stemwithdrawalopenspipe-to-sleevewater/air/fire/acousticboundary. Isolatewetuseandaffectedlowerzone; fitqualifiedremovabletemporaryclosuretoretainedsleeveuntilcompatiblesealsreinstated/tested. Fixedsleeve/flangealoneisnotclosedboundary.','tailBelowUpperFFL':500,'upwardStroke':550,'finalStemAboveFFL':50,'stripBeforeWithdrawal':'All A upper halves/nuts/clamps wider than75 must actually detach below before75stem passes97sleeve; ordinary lower renewal retains A upperhalf.'},
 'workingPlatformRequiredPlan':[1675,9150,1000,1250],'actualReceiverSource':{'head':REWIND_HEAD,'blob':REWIND_BLOB,'fixedObstacle':rwhouse['fixedObstacles']['GROUND'][0],'fullFinishEachSide':18,'reserveToPlatform':27.5},'actualTableSource':rwhouse['groundFurniture']['reading-side-table300'],'operatorShoulder':[2082.5,9677.5,2450],'headPlanRadius':150,'maximumHeadTop':2750,
 'toolContacts':[[2122.5,9552.5,2950],[2022.5,9512.5,2774.875]],
 'furnitureMaintenance':{'sourceHead':REWIND_HEAD,'sourceBlob':REWIND_BLOB,'familySofaBefore':rwhouse['groundFurniture']['family-sofa1900x750'],'familySofaPark':[2337.5,10450,1900,750],'northTranslation':650,'reserves':{'readingSofaToPlatform':25,'southReceiverToPlatform':27.5,'parkedSofaToPlatform':50,'northReceiverToParkedSofa':42.5,'weatherWallWith18TrimToSofa':25},'repeatableAction':'TranslatefamilysofaN650first; platformerectedafterthatmove. Restorefurniture/useonlyafterreassembly,completeboundary/sealreinstatementandtesting,platformremoval/panelclosure. Nofixedreceiver/beam/support removed.'},
 'boundary':'800 hatch is panel aperture, not a free vertical prism through retained beam. All A/T/B complete bodies/tool/spool stay west of2775.5. Upper tray drain/feet must match this authored port or this specific route fails; no automatic principal900 transfer. New formedport requires STR support proof; not drilling permission.'}
assert length([x[:2] for x in rear_drop['branch']])==3280
for a,c in zip(rear_drop['branch'],rear_drop['branch'][1:]):assert abs((a[2]-c[2])-math.dist(a[:2],c[:2])/40)<1e-8
assert max(math.dist(rear_drop['operatorShoulder'],x) for x in rear_drop['toolContacts'])<600
assert rear_drop['fixedBeamFinishedWestFace']-(rear_drop['operatorShoulder'][0]+rear_drop['headPlanRadius'])>=25
assert rear_drop['finishedPanelUnderside']-rear_drop['spoolMaximumTopAfter']>=25

sofa=rear_drop['furnitureMaintenance'];sofa['sweptRectangle']=[2337.5,9800,1900,1400]
sofa['pushingBodyCentrePath']=[[3000,9475],[3000,10125]];sofa['bodyRadius']=300
sofa['bodyToMovingSofaGap']=25;sofa['handReachToSofa']=325
for name,r in rwhouse['fixedObstacles']['GROUND']:
 expanded=[r[0]-18,r[1]-18,r[2]+36,r[3]+36]
 assert not overlap(sofa['sweptRectangle'],expanded),(name,'sofa')
 assert not overlap(rear_drop['workingPlatformRequiredPlan'],expanded),(name,'platform')
for name in ['reading-sofa1900x850','reading-side-table300','family-side-table300']:
 r=rwhouse['groundFurniture'][name]
 assert not overlap(sofa['sweptRectangle'],r),(name,'sofa')
 assert not overlap(rear_drop['workingPlatformRequiredPlan'],r),(name,'platform')
assert not overlap(rear_drop['workingPlatformRequiredPlan'],sofa['familySofaPark'])
for y in [9475+i*650/20 for i in range(21)]:
 for name,r in rwhouse['fixedObstacles']['GROUND']:
  rr=[r[0]-18,r[1]-18,r[2]+36,r[3]+36]
  nearest=[min(max(3000,rr[0]),rr[0]+rr[2]),min(max(y,rr[1]),rr[1]+rr[3])]
  assert math.dist([3000,y],nearest)>=325,(name,'pushbody')

sink['historicalWholeFrameControl']={'status':'REJECTED/INCOMPLETE control, never selectedhead-first contract','fields':{k:sink.pop(k) for k in ['maximumRemovedHeight','initialLift','retainedStudHeight','movingUpperLowPointAfterLiftMinimum','maximumCaptureStroke','captureReserveAfterLift','noLowTransverseFrameRail','operatorCentre','sequence','handlingRequirement']}}
sink['retainedTrap']='Trap/Afixedbelow475. UpperA→Bspoolsstrip/capbeforeheadmoves; headlowest600→620after20UP. No retainedtrap/pipe/frame/anchor moves.'
sink['frontAccessScope']='This400..550fieldservesLOWERAonly. UpperB625andspooltoolworkhasseparateheadFirst.firstTask; notanassertionthatBfitslowerAfield.'

bath_drop={'status':'Selectedconditionalordinary-rimconfigured-kitrequirement; noactualtrap/outlet/feet/STR/seal/handlingadmission.100plinth660rimcontrolrejectedforquality.',
 'primarySource':{'url':'https://files.cdn.kaldewei.com/data/sprachen/englisch/techdata/DB04_24-Sort_DB_UK-GBeng_BW_ADV_363-1_SANIFORM_PLUS_SANIFORM_PLUS_STAR.pdf','nativeModel':'363-1','fileSHA256':'564cfd7be4ad55cff857f1dae17bbfeb9b20d8b927c411b6d41c485b6411f76b','body':[9460,3800,1700,700],'selectedRim':560,'actualPermittedRimRange':[545,560],'depthIncludingWaste':410,'nativeWasteHoleLocalZ':150,'nativeWasteHole':[10850,4150,52],'nativeOverflowCentre':[11062,4150,497],'nativeFootAxes':[[10710,4150],[9970,4150]],'nativeFootWidthMaximum':380,'longitudinalFootExtent':'Notprovided; actualconfiguredsupportsmustpassthekeepoutwithoutalteringfactoryfeet.'},
 'port':{'centre':[10950,4150],'formedDiameter':110,'clearSleeveInside':97,'maximumPlainRenewableStem':75,'deliberateNativeHoleOffset':[100,0],'sealKeepoutDiameter':200,'maximumSleeveFlangeTopLocal':20,'scope':'100EoffsetisAUTHORREQUIREMENT, notnativeholeorprovenwastepart. STRformedopening/rebar/support/lining/sealqualificationrequired; nodrillingpermission.'},
 'upperConfiguredKit':{'completeBodyPlan':[10800,4050,300,300],'completeBodyZLocal':[40,150],'authoredFloorClearance':40,'minimumTo20HighFloorSeal':20,'waterSealMinimum':50,'minimumTrapBore':40,'trapImmediatelyAfterNativeWaste':True,'trapBodyAndOutletAreNotNominal100Fitting':True,'requiredTrapOutlet':[10850,4150,120],'upperFrontUnion':[10850,4250,117.5],'upperCarrierPlanXYZ':[[10850,4150,120],[10850,4250,117.5],[10950,4250,115],[10950,4150,112.5]],'maximumConnectorODInUpperEnvelope':60,'actualPartMatching':'The50sealtrap,40bore,nuts/seats/overflowinterfaces/threeplanbendsandturnsMUSTfitfull300x300x110bodyboundandactualbathunderside.120outletisdesigncompatibilitytarget, NOTKaldeweimeasurement. Anyconfiguredkitfailingboundsisrejected; nostrippedseal/bespokeapprovalinvented.',
 'support':'Independentretainedmetal/mineralsupportstoactualqualifiedfloor/framefixingsoutsideseal200keepoutandunmodifiedfactoryfeet. Supportsreachfloorintentionally;40clearanceisBODY/nuts/turns, notpretendedsupportlevitation. Actualfootlongitudinalextent/supportgeometryunproved.',
 'upperServicePanel':{'frontY':4500,'clearX':[10625,11125],'clearZLocal':[0,500],'requiredAccess':'Firstunion/trapcleanout/wasteandfull52overflowreleasefromFRONTorTOP, neverblindrearreach. Panelisnotarequiredfoot/supportremovedforaccess.'},
 'waterIsolationTargets':{'hot':[10800,4450,350],'cold':[10900,4450,350],'actualKitRequirement':'Accessiblefrontisolationandtrueunion, independentsupportedretainedsupply; actualtap/overflow/WCsystemcompatibilitynotassumed.'}},
 'lower':{'A':[10950,4150,3000],'T':[10950,4150,2737.5],'B':[10950,4250,2735],'route':[[10950,4150,2737.5],[10950,5200,2711.25],[10800,5200,2707.5]],'planLength':1200,'gradient':40,'maximumCompleteFittingOD':100,'supportDepth':25,'airReserve':25,'innerPanelTop':2607.5,'panelThickness':20,'finishedPanelUnderside':2587.5,'clearHatch':[10750,3950,400,400],'outerHatch':[10730,3930,440,440],'qualifiedEquipmentField':[10535,3900,1000,800],'fieldToMain320PipeBand':25,'fieldToEastDryFace':35.5,'fixedUpperTail':'Plainstemindependentlysupported. AllupperAhalves/nuts/clampswiderthan75muststripBEFORE75stemwithdrawalthrough97sleeve; sleeve/flangealoneisnotclosedboundary.','spoolRelease':{'requiredSeats':'Actualzero-captureflatfacesatorthogonalA/B; isolate/drain/releasenutsandadhesion/renewseals. Capturedspigotdiagonalreleaseisrejected.','phases':[[0,-20,0],[0,0,-20],[0,0,-450]],'movingTopBefore':3000,'movingTopAfter':2530,'finishedPanelClearance':57.5,'completeSpoolPlanBefore':[10900,4100,100,200],'completeSpoolPlanAfterSouth20':[10900,4080,100,200],'fixedParts':'UpperAhalf/retainedbranch/trap/sleeveandactualsupportsremainindependent; nofloororsupportremovedtopermitmotion.'}},
 'renewalSplit':{'ordinaryKit':'Openfrontpanel,isolatewater,disengageactualfront/topwaste/overflowandupperunionwithindependentsupport; noautomatic900trayproof.','wholeBath':'Removefulloverflowandrequiredfeet/kitonlypermanufacturer, supportdrained41kgBODYplusactualaccessories; actualstair/roomcarryandforcesareIASduty. Nohumanliftingcapacityinvented.','plainTail':'Afterseparatebody/kitreleaseandlowerAupperpartsstrip,550UPmoves−450tailendto+100; temporaryqualifiedclosureofopenedwater/air/fire/acousticannulusuntilcompatiblesealsreinstated/tested.','restore':'Ordinaryuseonlyafterreassembly,boundaryreinstatementandtests,panelclosure/equipmentremoval.'}}
for fixture in schedule:
 if fixture['id']=='family-bath':
  fixture['waterBranchPlan']=[[11200,5000],[11000,5000],[11000,4550],[11000,4450],[10800,4450]]
  fixture['valveAxisZ']=3450+350
  fixture['waterBranchLengthIncludingDropMM']=length(fixture['waterBranchPlan'])+6395-fixture['valveAxisZ']
  fixture['terminalDeadLegLitresAt13mmID']=math.pi*.013**2/4*(fixture['waterBranchLengthIncludingDropMM']/1000)*1000
  fixture['idealFlushSecondsAt6Lmin']=fixture['terminalDeadLegLitresAt13mmID']/.1
  fixture['actualFrontIsolationTargets']=bath_drop['upperConfiguredKit']['waterIsolationTargets']
  fixture['requiredValveWorkTerritory']=[500,200,400]
  fixture['endpointStatus']='Singlebathinterfacefrontisolationtargets, nottheobsolete11200/4100/600sidevalve. Actualupperbody/insulatedtails/facecontrolsandsupportsmustfitselectedbathprofileandfrontpanel; nohiddenrearconnectionorclaimedpartfit.'
  assert fixture['terminalDeadLegLitresAt13mmID']<3

for fixture in schedule:
 if fixture['id']=='kitchen-sink':
  old_keys=['waterBranchPlan','valveAxisZ','waterBranchLengthIncludingDropMM','terminalDeadLegLitresAt13mmID','idealFlushSecondsAt6Lmin']
  fixture['obsoleteDirectWaterControl']={'status':'RETIREDnotselected;doesnotfollowactualretainedfeed','record':{k:fixture[k] for k in old_keys}}
  feed=sink['retainedFeed'];hp=feed['hotPath'];cp=feed['coldPath']
  fixture['selectedWaterBranchXYZ']={'hot':hp,'cold':cp}
  fixture['waterBranchPlan']=[point[:2] for point in hp]
  fixture['waterBranchLengthIncludingDropMM']=length(hp)
  fixture['coldBranchLengthIncludingDropMM']=length(cp)
  fixture['valveAxisZ']=475;fixture['selectedFixedReceivingPipeEndpointZ']=hp[-1][2]
  fixture['terminalDeadLegLitresAt13mmID']=math.pi*.013**2/4*length(hp)
  fixture['coldBranchLitresAt13mmID']=math.pi*.013**2/4*length(cp)
  fixture['idealFlushSecondsAt6Lmin']=fixture['terminalDeadLegLitresAt13mmID']*10
  fixture['remaining3LVolumeBudgetForActualJointsHeadTapLitres']=3-fixture['terminalDeadLegLitresAt13mmID']
  fixture['endpointStatus']='ONEselectedretainedfeedfromactualXYZobjectviaeastcorner/lowZ242tofrontAreceivingpipe425/unionplane475. Volumesare13-IDpipecomparisonTO425only; actualjoint/spool/head/tapvolumeisnotzeroandmustfitremaining3Lbudget. OlddirectZ600routeisretired.'
  assert abs(length(hp)-7179.5)<1e-8 and abs(length(cp)-7084.5)<1e-8
hot['maximumTerminalDeadLegLitresAt13mmID']=max(f.get('terminalDeadLegLitresAt13mmID',0) for f in schedule)
hot['maximumIdealFlushSecondsAt6Lmin']=max(f.get('idealFlushSecondsAt6Lmin',0) for f in schedule)

assert bath_drop['primarySource']['selectedRim']-410==150
assert length([x[:2] for x in bath_drop['lower']['route']])==1200
for a,c in zip(bath_drop['lower']['route'],bath_drop['lower']['route'][1:]):assert abs(a[2]-c[2]-math.dist(a[:2],c[:2])/40)<1e-8
assert 2707.5-50-25-25-20==bath_drop['lower']['finishedPanelUnderside']

architecture_contract={'schemaVersion':1,'authority':'MAT-SERVICES numeric interface. HADconsumesonefixedcheckpoint; roomgeometrybasis is068e33+explicitrewinds, notreciprocalHADmetadatahash.',
 'emitters':[{k:e[k] for k in ['id','room','level','family','length','bodyHeight','completePlanWithValvesAndBrackets','bottomLocal','topLocal','pressurePairBranchPlan','renewal']} for e in emitters],
 'plant':{k:plant[k] for k in ['controlsHydraulics','controlsMaximumHeight','primaryBuffer','riserGross','formedOpeningProposal','emitterJoin']},
 'fanAccess':[{k:e[k] for k in ['id','level','podPlan','podZ','path','formedWallTerritory','ceilingTrapDrainPort','maintenancePlatformPlan','maintenancePlatformWorkingHeightRange','workerEquipmentRequirement']} for e in extract],
 'studyRewind':{'desk':[655,600,1600,700],'South1800Body':[2580,765],'West1800Body':[754.5,2724],'West1800Handle':[429.5,2220]},
 'livingWestRenewal':{'sofaBefore':[800,9000,850,1900],'sofaPark':[1450,9000,850,1900],'eastMove':650,'sweptRectangle':[800,9000,1500,1900],'pullingBodyCentrePath':[[1975,9450],[2625,9450]],'bodyRadius':300,'headRadius':150,'ordinaryWallGap':170.5,'parkedSofaBGap':37.5,'radiatorWorkingBody':[954.5,10200]},
 'familyBathDrop':bath_drop,'utility':rewinds['utility'],'kitchenStationPlan':sink['station'],'kitchenStationTopZ':900,'supply':supplies,'eastFoulExit':east_exit,'otherServiceDuties':other,
 'livingSupplyHostCorrection':{'oldNorth2675':'REJECTED:360holecrossesactualNorthRCreceiver','selectedPoint':[0,9200,2850],'formedHole':360,'face':400,'maintenanceField':[654.5,9000,750,1100],'sofaAEastMove':650,'radiatorToPlatformReserve':25,'parkedSofaToPlatformReserve':45.5},
 'sourceOrder':'Servicesownsvalues; HADimportsimmutableobject. Finalsourceequivalence comparesrelevantgeometryonly, excludingcommit-pinmetadata. NoHADcommitaddedasfakeparent.'}
assert len(architecture_contract['emitters'])==16
for name,r in rwhouse['fixedObstacles']['GROUND']:
 expanded=[r[0]-18,r[1]-18,r[2]+36,r[3]+36]
 assert not overlap(architecture_contract['livingWestRenewal']['sweptRectangle'],expanded)
assert architecture_contract['livingWestRenewal']['sofaPark'][0]+850+25<=rwhouse['groundFurniture']['family-sofa1900x750'][0]
def horizontal_body_reserve(path,radius,rect):
 a,c=path;assert a[1]==c[1]
 dx=max(rect[0]-max(a[0],c[0]),min(a[0],c[0])-rect[0]-rect[2],0)
 dy=max(rect[1]-a[1],a[1]-rect[1]-rect[3],0)
 return math.hypot(dx,dy)-radius
receiver=dict(rwhouse['fixedObstacles']['GROUND'])['wetBeamSouthReceiver'];receiver18=[receiver[0]-18,receiver[1]-18,receiver[2]+36,receiver[3]+36]
living_pull_witness={'selected9450Reserve':horizontal_body_reserve(architecture_contract['livingWestRenewal']['pullingBodyCentrePath'],300,receiver18),'failed9300Reserve':horizontal_body_reserve([[1975,9300],[2625,9300]],300,receiver18),'fixedReceiverFull18':receiver18,'SofaBReserve':horizontal_body_reserve(architecture_contract['livingWestRenewal']['pullingBodyCentrePath'],300,rwhouse['groundFurniture']['family-sofa1900x750'])}
assert living_pull_witness['selected9450Reserve']>=25 and living_pull_witness['SofaBReserve']>=25
assert living_pull_witness['failed9300Reserve']<0


result={'status':'Constructive provisional whole-house service baseline; no accepted apparatus, materials, fire route, site loading or commissioning.',
 'basis':{'HADHead':HEAD,'HADPath':PATH,'HADBlob':BLOB,'HADStatus':b['status'],
  'narrowObstacleFurnitureRewind':{'head':REWIND_HEAD,'blob':REWIND_BLOB,'scope':'Onlyactualgroundreceivers/table/reading+familysofas/side-tables used bynamed renewalchecks anddrawnplan; Room source is068e33 plus declaredservicesrewinds; no livegeometrysubstitution.'},'mergedInterfaceMain':'546c98f93a3dccbfe48119bd2e92117b6e2d766f','units':'mm, local proposed groundFFL0; first3450; all z use one datum'},
 'selection':'Local continuousMEV + background vents + separate cooker capture +8kW compatibility monobloc/radiators +300L hotwater.',
 'livingWestPullWitness':living_pull_witness,'air':air,'extract':extract,'supply':supplies,
 'cooker':{'extractPoint':[11200,12000,2400],'duct':160,'exhaustRadialInsulation':50,'metalJacketEachSide':1,'fullInsulatedOD':262,'formedWallTerritory':320,'minimumCaptureLps':30,'makeupPoint':[12000,8600,2400],
   'makeupFormedTerritory':280,'makeupRequirement':'Dedicated measured30L/s at5Pa, pressure-controlled/interlocked opening, normally closed. Separate from65L/s background; no open-window chore or recirculation-onlyhood credit.',
   'hood':'600wide spans600hob; actual capture, grease cleanout, motor/controls/residues and classified cooking/fire relationship required.'},
 'heat':heat,'pipeCrossovers':gates,'interfaces':{'architecturalServices':architecture_contract,'familyBathDrop':bath_drop,'familyWetRoom':rewinds['familyWetRoom'],'kitchenSinkStation':sink,'rearShowerDrop':rear_drop,'rearSource27':rewinds['rearSource27']},'rewinds':rewinds,'eastFoulExit':east_exit,'PV':pv,'pipeInsulation':insulation,'hotWater':hot,'plant':plant,'trunks':trunks,'wallCrossingEnquiries':crossings,'fixtures':schedule,'otherDuties':other,'residues':residues,
 'notAdmitted':['Every exterior core/lintel/thermal/gas/weather junction','Riser trimmed RC opening and upper connections','Specific protected-door transfer and pipe/cable firestops','Exact emitters/pumps/fittings and measured performance','Actual mains, site climate, network/outfall/pressure/noise/pollution and power','Owner-approved polymer exceptions; none created'],
 'reproduction':'Python standard library. If frozen HAD object is absent, explicitly git fetch origin 068e33ae52bbaa5ab0c3e3551350400e958e4033; verify fullblob. No synthetic merge parent or geometry substitution. Geometry tests distinguish finite reservations from engineering acceptance.'}

result['interfaces']['architecturalServices']['cooker']=result['cooker']

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
 if not level:furniture['study-desk']=[655,600,1600,700]
 if level:
  for k in ['family-WC','family-basin','family-bath1700','family-service-cabinet']:furniture.pop(k,None)
  furniture.update({'rear-WC':[729.5,11000,560,355],'rear-cabinet':rewinds['rearSource27']['upperCabinet'],'rear-west-low-box':rewinds['rearSource27']['lowBox'],'rear-shower1000':rear_tray_target,'family-WC':family['WC'],'family-basin':family['basin'],'family-bath':family['bath'],'family-column':family['column'],'riser':plant['riserGross']})
 else:
  for k in ['Q350-body','north-sink-station','north-cooking-station']:furniture.pop(k,None)
  for fk in ['dining-table1200x800','reading-side-table300','reading-sofa1900x850','family-sofa1900x750','family-side-table300']:furniture[fk]=rwhouse['groundFurniture'][fk]
  furniture['rear-stack']=rewinds['rearSource27']['groundStackCabinet']
  furniture.update({'sink':sink['station'],'cooker':sink['cookingStationRewind']['footprint'],'washer':rewinds['utility']['washer'],'utilitysink':rewinds['utility']['sink'],'primarybuffer':plant['primaryBuffer']['station'],'hydraulics':plant['controlsHydraulics'],'CU':rewinds['utility']['electricalStation'],'PVinverter':rewinds['utility']['PVinverter']})
 for n,r in furniture.items():s.append(box(r,'#b8b1a4'))
 if not level:s.append(f'<circle cx="{ox+10350*sc}" cy="{oy+5850*sc}" r="{300*sc}" stroke="#777" fill="none" stroke-width=".3"/>')
 for rad in emitters:
  if rad['level']==level:s.append(box(rad['completePlanWithValvesAndBrackets'],'#1a7c83','#d7eeee'))
 if level:
  bx,by=bath_drop['port']['centre'];s.append(f'<circle cx="{ox+bx*sc}" cy="{oy+by*sc}" r="{55*sc}" fill="none" stroke="#2062a0" stroke-width=".5"/>')
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
 'RED: six local extract paths/pods. BLUE: six supplies. BROWN: water/heat tree. GOLD: lower crossings. GREEN: qualified maintenance equipment fields.',
 '78L/s normal total; separate30L/s cooker capture + dedicated makeup. Four bedrooms / design occupancy2–6, not household facts.',
 f'Area upper-bound {area:.3f}m²;0.3criterion {area*.3:.3f}L/s. Interior walls/stairs included; not certified SAP/net area.',
 'Violet: protected groundstair wall/crossdoors. No ventilation duct enters protected ring; actual transfer/firedoor still mustmatch.',
 'Ground north shortcut REJECTED: outdoor loggia is not an indoor pipe corridor. Each wall/floor penetration needs actual support/seal.',
 'TEAL:16 complete emitter territories/14 duties. Thermal allocations and actual apparatus/body/renewal remain conditional.',
 'Outdoor8kW compatibility plant and300L store are pre-site requirements; current product labels do not prove cold-weather duty.',
 'No apparatus or synthetic-polymer exception approved. Metal cases do not remove impellers, seals, insulation or electronics.',
 'HAD068e33 geometry/protected interface + explicit services rewinds. Unqualified, incomplete development checkpoint.'
]
for i,n in enumerate(notes):svg+=text(15,190+i*9,n,2.85)
svg+=text(15,285,'All dimensions mm / groundFFL0 / first3450. Reservations are not construction permissions. 1 November2026',2.7)+'</svg>\n'
def detail_sheet():
 out='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">'+rect(0,0,420,297,'none','white')
 out+=text(12,13,'WHOLE-HOUSE SERVICES — TERMINAL RENEWAL INTERFACES',5)
 out+=text(12,21,'Conditional authored compatibility geometry; no component, support capacity, material or physical acceptance.',3)
 for x,y,w,h in [(10,28,190,150),(210,28,200,150),(10,186,190,100),(210,186,200,100)]:out+=rect(x,y,w,h,'#aaa')
 out+=text(15,36,'REAR1000: GROUND MAINTENANCE / UPPER TAIL PROJECTION',3.2)
 def box(r,c,fill='none'):
  return rect(15+(r[0]-780)*.04,43+(r[1]-8500)*.04,r[2]*.04,r[3]*.04,c,fill)
 out+='<defs><clipPath id="rearplan"><rect x="15" y="43" width="180" height="117"/></clipPath></defs><g clip-path="url(#rearplan)">'
 for n,r in rwhouse['fixedObstacles']['GROUND']:out+=box([r[0]-18,r[1]-18,r[2]+36,r[3]+36],'#7e46a0','#eadff1')
 out+=box(rwhouse['groundFurniture']['reading-sofa1900x850'],'#555','#ddd')
 out+=box(sofa['sweptRectangle'],'#999','#f4f4f4')+box(sofa['familySofaBefore'],'#777')+box(sofa['familySofaPark'],'#555','#ddd')
 out+=box(rear_drop['workingPlatformRequiredPlan'],'#26834f','#e5f2e8')
 out+=box(rear_drop['clearHatch'],'#2266a0')
 px,py=rear_drop['port'][:2];out+=f'<circle cx="{15+(px-780)*.04}" cy="{43+(py-8500)*.04}" r="2.2" stroke="#c44" fill="none"/>'
 out+='</g>'
 out+=text(15,168,'Purple fixed RC+18 trim; green platform1000×1250; blue800 hatch projection.',2.6)
 out+=text(15,174,'Sofa moves N650 first. Reserves25 /27.5 /42.5 /50; +Y(N) is down sheet.',2.6)
 out+=text(215,36,'REAR LOWER CONNECTION: ALL Z ON GROUND FFL0',3.2)
 def zz(z):return 160-(z-2400)*.1
 for z,label,col in [(3450,'Upper FFL3450','#777'),(3170,'RC soffit3170','#777'),(2950,'A vertical union2950','#c44'),(2777.375,'T2777.375 / B2774.875','#c44'),(2575.375,'Finished panel2575.375','#26834f')]:
  out+=f'<path d="M220 {zz(z)}H400" stroke="{col}" stroke-width=".3"/>'+text(292,zz(z)-1,label,2.6)
 x=255;out+=rect(x-5.5,zz(3450),11,zz(3170)-zz(3450),'#777')
 out+=rect(x-3.75,zz(3450),7.5,zz(2950)-zz(3450),'#c44')
 out+=rect(x-5,zz(3000),10,10,'#c44','#f6dddd')
 out+=f'<path d="M{x} {zz(2900)}V{zz(2777.375)}H{x-10}" fill="none" stroke="#c44" stroke-width="1"/>'
 out+=rect(x-15,zz(2824.875),10,10,'#c44','#f6dddd')
 out+=rect(235,zz(2595.375),50,2,'#26834f','#e5f2e8')
 out+=text(215,163,'50E+50down, then450down: spool top2500,75.375 below finished panel.',2.6)
 out+=text(215,170,'Full upper renewal strips >75 parts;75stem /97sleeve /550up. No assumed B568 fit.',2.6)
 out+=text(15,195,'FAN / SEPARATE METAL FRONT TRIAL',3.2)
 out+=rect(20,205,75,50,'#666')+rect(28,238,55,2,'#555','#aaa')
 out+=rect(42,225,25,13,'#777','#ddd')+rect(48,212,13,13,'#777','#ddd')
 out+=rect(27,242,57,1.5,'#333','#aaa')
 out+=text(102,209,'Untouched195Ø OEM face',2.8)+text(102,215,'45projection +71tail',2.8)
 out+=text(102,221,'15clear to metal front',2.8)+text(102,227,'400×450 service opening',2.8)
 out+=text(102,233,'≥18000 net louvre area',2.8)+text(102,239,'Added loss target≤2Pa',2.8)
 out+=text(15,261,'OEM CF1 + EPDM retained; secondary front permission/actual connection stack unproved.',2.6)
 out+=text(15,268,'If incompatible: visible ABS face is an explicit unapproved residue proposal.',2.6)
 out+=text(15,275,'Diagram is a dimension ledger; no hidden OEM casing/insulation removal.',2.6)
 out+=text(215,195,'SINK HEAD-FIRST / FIXED FRAME AND PIPES RETAINED',3.2)
 def sz(z):return 275-z*.05
 hh=sink['headFirst'];mm=hh['motion'];tt=hh['tablePlacement']
 for xx,top,bottom in [(225,hh['head']['topZ'],hh['head']['bowlMinimumZ']),(285,tt['carryTopZ'],mm['bowlBottomAfterRaise']),(345,tt['seatedTopZ'],tt['seatedBowlBottomZ'])]:
  out+=rect(xx+12,sz(top),21,(top-bottom)*.05,'#777','#ddd')
  out+=rect(xx,sz(top),12,30*.05,'#777','#ddd')+rect(xx+33,sz(top),12,30*.05,'#777','#ddd')
 out+=rect(225,sz(850),45,2,'#286ca0')
 out+=rect(217,sz(304),8,(304-180)*.05,'#286ca0','#deebf5')+text(230,265,'Fixed feed180–304',2.1)
 out+=rect(345,sz(1050),10,(1050-750)*.05,'#26834f','#e5f2e8')+rect(380,sz(1050),10,(1050-750)*.05,'#26834f','#e5f2e8')
 out+=rect(342,sz(750),51,1,'#555','#ddd')
 out+=text(225,225,'Installed900/600',2.5)+text(285,214,f"Carry{tt['carryTopZ']}/{mm['bowlBottomAfterRaise']}",2.5)+text(345,214,'Seat1080/780',2.5)
 out+=text(215,256,'A475 / B625 spools first: ZERO-capture flat faces,20S then20UP. Frame rail850 removes.',2.4)
 out+=text(215,271,'Head20UP/40S then270UP; fixedpipes≤475; bowl≥620 and Bparts≥595 after20UP.',2.4)
 out+=text(215,277,'Bearers support END/WING returns1050; bowl BETWEEN has35plan /30table clearance.',2.4)
 out+=text(215,284,'Actual kit, frame/table/support capacity, grips/forces and full handling event remain unearned.',2.4)
 return out+'</svg>\n'

outputs={BASE.with_suffix('.json'):json.dumps(result,indent=2,ensure_ascii=False)+'\n',BASE.with_suffix('.svg'):svg,BASE.with_name(BASE.name+'-interfaces').with_suffix('.svg'):detail_sheet()}
for p,s in outputs.items():
 if '--check' in sys.argv:
  assert p.read_text()==s,'Stale '+str(p)
 else:p.write_text(s)
print(json.dumps({'floorUpperBoundM2':area,'normalLps':78,'fixtures':len(schedule),'localExtractStations':len(extract),'conditional':True}))
