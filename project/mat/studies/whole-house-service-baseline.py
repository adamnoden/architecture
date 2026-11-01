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
fire=json.loads(fire_raw)['protectedRoute']
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
# Pod350 wide x600 projection x300 high. Fan procurement envelope250diam x300axial;
# no supplier model is claimed to fit or meet the curve/noise/material requirement.
extract=[]
for name,level,wall,at,q,minimum in [
 ('ground-WC',0,'south',9000,8,6),('utility',0,'east',900,8,8),
 ('kitchen',0,'north',11382.5,13,13),('rear-bath',1,'west',9300,12,8),
 ('family-bath',1,'east',5750,12,8),('principal-bath',1,'east',6750,12,8)]:
    ffl=level*3450;axis=ffl+2950
    if wall=='east': start=[10982.5,at,axis];end=[12000,at,axis];pod=[10982.5,at-175,600,350]
    elif wall=='west':start=[1017.5,at,axis];end=[0,at,axis];pod=[417.5,at-175,600,350]
    elif wall=='north':start=[at,10982.5,axis];end=[at,12000,axis];pod=[at-175,10982.5,350,600]
    else:start=[at,1017.5,axis];end=[at,0,axis];pod=[at-175,417.5,350,600]
    # Full terminal, not just tube, must preserve90% of125 duct area.
    extract.append({'id':name,'level':level,'wall':wall,'normalLps':q,'minimumHighComparator':minimum,
      'axis':axis,'path':[start,end],'ductClear':125,'formedWallTerritory':180,
      'ductVelocityMps':q/1000/(math.pi*.125**2/4),'podPlan':pod,
      'podZ':[ffl+2800,ffl+3100],'fanMaxBody':[250,300],
      'clearPanel':[300,400],'panelFrameOuter':[350,450],
      'maintenanceBelowPanelClearHeight':ffl+2700,
      'fanTask':'Complete250diam×300axial envelope lowers through300×400 clear aperture:25 lateral/50 axial reserve. Two independently supported duct ends retained; exact collars/tool/release length must fit600pod. No450hole cut in350box.',
      'requiredCurve':'Normal duty at40Pa pre-site screen (30duct/terminal allowance +10room/transfer); actual total resistance/wind and noise must be verified, not free-air rating',
      'requiredExternalTerminalFreeArea':.9*math.pi*125**2/4,
      'status':'Territory/compatibility envelope; lintel/core/support/fire/weather/acoustic/product fit not approved'})
principal=next(x for x in extract if x['id']=='principal-bath')
principal['podPlan']=[10982.5,6655,600,350]
principal['path']=[[10982.5,6830,6400],[11420,6830,6400],[11500,6750,6400],[12000,6750,6400]]
principal['windowRequirement']='HAD selected finite reservation: retain glazedheadFFL+2850 with fixedtop100 band/openingleafhead≤FFL+2750;50clear belowpodFFL+2800. Existing unspecified inwardleaf is NOT passed; actual OAS family/procurement/operation proof still required.'
principal['wallTerritorySouthAndWindowReserves']=[60,60]
assert sum(x['normalLps'] for x in extract)==65
assert all(x['normalLps']>=x['minimumHighComparator'] for x in extract)
# Windows: along-wall geometric clearance only; no inference about buried lintels.
for x in extract:
    axis=x['path'][-1][0] if x['wall'] in ['south','north'] else x['path'][-1][1]
    wall='outer-'+x['wall'];level='FIRST' if x['level'] else 'GROUND'
    intervals=[(o['centre']-o['width']/2,o['centre']+o['width']/2) for o in b['openings'][level] if o['wall']==wall]
    x['alongWallOpeningClearance']=min(max(lo-axis,axis-hi)-90 for lo,hi in intervals)
    assert x['alongWallOpeningClearance']>=0,x['id']

supplies=[]
for name,level,wall,at in [('study',0,'west',2700),('living',0,'west',11150),
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
insulation={'selectedInternalRadialThickness':25,'maximumThermalConductivity':.035,
 'basis':'L2026Table3.4 thickness20 for nominalID≤25/24 for≤100 atlambda≤.035, applies only if that edition/route is appropriate.25selected is an evidenced performance choice, not removal to fit. Exterior primary retains50 and whole freeze/weather system.',
 'old50RadialPipeControl':'Earlier unsourced50radial allowance yields132/132/122/82/115 bodies; five cannot fit300×250 with25edge/interpipe reserve. Rejected band, not nominal pass.',
 'pipeBodiesAndInsulatedOD':{'heat32':82,'hot22':72,'cold22':72,'return15':65},
 'internalBandClear':[310,250],
 'sectionCentres':[{'id':n,'xy':[x,y],'diameter':d} for n,x,y,d in [
 ('heat-flow',66,66,82),('heat-return',200,66,82),('hot',61,184,72),('cold',158,184,72),('return',251.5,184,65)]],
 'notAdmitted':'Actual insulation binder/facing/jacket seams, coldvapour/dewpoint, bends, firestops andwhole systemheatloss. No polymerfoam exemption.'}
for p in insulation['sectionCentres']:
 x,y=p['xy'];r=p['diameter']/2
 assert min(x-r,310-x-r,y-r,250-y-r)>=25
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
 'controlsHydraulics':[10400,5550,1000,650],
 'riserGross':[9400,4700,550,700],
 'formedOpeningProposal':[9440,4760,465,545],
 'failedBodyOnlyOpening':[9460,4760,450,540],
 'cabinetBasis':'Westface corrected to actualwetfinish9400; new550×700 territory ends5400 before bathroomdoor5450. No800×1200 growth over door. Actual frame thickness/clear aperture still must match.',
 'proposedServices':[{'id':n,'centre':[x,y],'outerEnvelope':d} for n,x,y,d in [
   ('H-flow',9540,4855,82),('H-return',9740,4855,82),('cold',9830,5050,72),
   ('hot',9540,5075,72),('hot-return',9700,5050,65),('soil-comparator',9800,5200,160)]],
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

# Complete routing tree at declared high level. Every wall/floor intersection is
# a proposal to be designed, never a hidden permission or automated fit pass.
# Ground north connection is deliberately absent: it would cross the outdoor loggia.
trunks=[
 {'id':'ground-front-west','level':0,'path':[[9800,5000],[8500,5000],[8500,3500],[3500,3500],[3500,8500],[3500,9200]],'duties':['heat','cold','hot','hot-return'],'axisZ':2925},
 {'id':'ground-rear-east','level':0,'path':[[9800,5000],[10500,5000],[10500,8500],[10500,10800]],'duties':['heat','cold','hot'],'axisZ':2925},
 {'id':'upper-front-west','level':1,'path':[[9800,5000],[8500,5000],[8500,3500],[3500,3500],[3500,8500],[1800,8500],[1800,10000]],'duties':['heat','cold','hot','hot-return'],'axisZ':6375},
 {'id':'upper-rear-east','level':1,'path':[[9800,5000],[10500,5000],[10500,8500],[10500,9000]],'duties':['heat','cold','hot'],'axisZ':6375},
 {'id':'upper-bed4','level':1,'path':[[3500,8500],[4500,8500],[4500,9150]],'duties':['heat'],'axisZ':6375},
 {'id':'upper-bed2','level':1,'path':[[3500,3500],[2500,3500],[2500,2500]],'duties':['heat'],'axisZ':6375},
 {'id':'upper-bed3','level':1,'path':[[8500,3500],[8500,2500]],'duties':['heat'],'axisZ':6375},
 {'id':'ground-study','level':0,'path':[[3500,3500],[2500,3500],[2500,2500]],'duties':['heat'],'axisZ':2925},
 {'id':'ground-WC-branch','level':0,'path':[[8500,3500],[8500,1800]],'duties':['heat','cold','hot'],'axisZ':2925},
 {'id':'ground-utility','level':0,'path':[[10500,5000],[11200,5000],[11200,1800]],'duties':['heat','cold','hot'],'axisZ':2925},
 {'id':'upper-family-wet','level':1,'path':[[10500,5000],[11200,5000]],'duties':['heat','cold','hot'],'axisZ':6375},
 {'id':'upper-principal-wet','level':1,'path':[[10500,5000],[11200,5000],[11200,7200]],'duties':['heat','cold','hot'],'axisZ':6375},
]
for t in trunks:
 t['lengthMM']=length(t['path']);t['ordinaryBand']=[310,250]
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
assert len(fixtures)==14 and sum('hot' in r[4] for r in fixtures)==9
schedule=[{'id':n,'level':l,'count':c,'sourceOrProposedXY':p,'duties':d} for n,l,c,p,d in fixtures]

# Connect the water distribution to each functional endpoint. Endpoints are
# explicit required valve/service territories, not asserted product outlet axes.
branches={
 'guest-WC':([[8500,1800],[8900,1800],[8900,650]],300),
 'guest-basin':([[8500,1800],[7650,1800],[7650,700]],600),
 'utility-sink-PROPOSED':([[11200,1800],[11150,1800],[11150,1300]],600),
 'washer-PROPOSED':([[11200,1800],[10600,1800],[10600,1400]],750),
 'kitchen-sink':([[10500,10800],[9150,10800],[9150,11282.5]],600),
 'principal-WC':([[11200,7200],[11200,8040],[11432.5,8040]],500),
 'principal-basin':([[11200,7200],[10500,7200],[10500,7800],[9570,7800]],600),
 'principal-shower':([[11200,7200],[10500,7200],[10500,7050],[9450,7050]],1100),
 'family-WC':([[11200,5000],[11200,6077.5]],500),
 'family-basin':([[11200,5000],[11200,6200],[10000,6200]],600),
 'family-bath':([[11200,5000],[11200,4100]],600),
 'rear-WC':([[1800,10000],[1200,10000],[1200,11177.5],[650,11177.5]],300),
 'rear-basin':([[1800,10000],[1200,10000],[1200,9000]],600),
 'rear-shower':([[1800,10000],[2300,10000],[2300,8975]],1100),
}
for s in schedule:
 p,z=branches[s['id']];s['waterBranchPlan']=p;s['valveAxisZ']=s['level']*3450+z
 s['waterBranchLengthIncludingDropMM']=length(p)+2925-z
 s['requiredValveWorkTerritory']=[200,200,300]
 s['endpointStatus']='Design service/valve axis with200mm local work field, NOT actual apparatus inlet. Local final tube/connector must join the selected fixture without inaccessible fabric.'
 s['surfaceDrop']='Exposed metallic/supported tube or demountable service chase; no structural chase cut. Maximum100mm local projection is an explicit room/shower loss, not hidden in the wall.'
 assert p[0] in [t['path'][-1] for t in trunks]+[[1800,10000],[11200,5000]]

crossings=[]
for t in trunks:
 for a,c in zip(t['path'],t['path'][1:]):
  for w in b['upperWalls' if t['level'] else 'groundWalls']:
   (x,y),(xx,yy)=w['a'],w['b'];point=None
   if y==yy and a[0]==c[0] and min(a[1],c[1])<y<max(a[1],c[1]) and x<=a[0]<=xx:point=[a[0],y]
   if x==xx and a[1]==c[1] and min(a[0],c[0])<x<max(a[0],c[0]) and y<=a[1]<=yy:point=[x,a[1]]
   if point:
    along=point[0] if y==yy else point[1]
    crossings.append({'route':t['id'],'level':t['level'],'wall':w['id'],'point':point+[t['axisZ']],
      'planInsideExistingAperture':any(lo<=along<=hi for lo,hi in w['holes']),
 'requiredServiceTerritory':[310,250],
      'status':'Wall-body/lintel/support and actual fire-boundary design enquiry. Plan doorway alignment never proves a high-level pipe port.'})

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
 for n in ['ground-front-west','ground-rear-east','upper-front-west','upper-principal-wet']]
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
 {'id':'foul-ground-WC','count':1,'path':[[8900,925,150],[8900,925,-500],[12000,925,-600]],'decision':'Own formedgroundport, retained supports and gravity outfall; groundbeam/cap/solum checked before permission. Grade/invert/site connection unproved.'},
 {'id':'foul-utility','count':2,'path':[[10800,1400,400],[10800,1400,-450],[12000,1400,-500]],'decision':'Sink/washer trapped branches to accessible foul inspection, not strainer. Gravity falls and actual trap connector seals to match selected appliances.'},
 {'id':'foul-kitchen','count':1,'path':[[9150,11282.5,400],[9150,11282.5,-450],[9150,12000,-500]],'decision':'Accessible sink trap/cleanout; no branch through ground loggia or hidden waterbox.'},
 {'id':'rear-soil','count':1,'path':[[567.5,11177.5,7800],[567.5,11177.5,-450],[0,11177.5,-550]],'decision':'Merged R01 sanitary port remains only conditional; actual roof intersection/termination must be raised above adjacent openings and roof, not fixed by7800 reservation.'},
 {'id':'east-soil','count':1,'path':[[9800,5200,7800],[9800,5200,2682.5],[9800,5200,-450],[12000,5200,-550]],'decision':'Merged high-level principal/family collector interface retained; vertical soil/vent body above collector is a proposed riser territory, not extra waste capacity. Roof terminal still conditional.'},
 {'id':'rainwater-interface','count':'RWT-owned','path':[],'decision':'Copper roof/loggia receivers and independent exceedance route stay MAT/RWT owners. No sanitary, condensate or safety discharge assumed to share their receiver.'},
 {'id':'power-incoming','count':1,'path':[[12000,1500,1500],[11200,1500,1500]],'decision':'Meter/metalconsumer-unit station inutility, accessible1000mm workingdepth. Utility-side cabinet/washing-machine layout must retain clear serviceface. Utility capacity/earthing/bonding/RCD/overcurrent and actual circuits by certified design.'},
 {'id':'power-distribution','count':'Functional circuit groups, not final circuit count','path':[[11200,1500,2925],[11200,5000,2925],[9800,5000,2925]],'decision':'Separate metal drytray follows declared indoor tree; own sealed floor aperture/tray supports, not tied to hotpipes. Mineral-insulated cable investigated, but terminations/controls/flex tails remain certified residuals; cable sizing and fire survival not invented.'},
 {'id':'cooking-power','count':1,'path':[[11200,1500,2925],[11200,10800,2925],[11100,11200,900]],'decision':'Electric cooking, accessible isolation and separate hood/control/makeup duty. No gas supply selected.'},
 {'id':'laundry-refrigeration','count':2,'path':[],'decision':'One washer at10300/1100 and fridge at10932.5/9025; accessible isolated appliance tails. Washer is new proposal; manufacturer withdrawal/hose/workplate dimensions required, not built into structure.'},
 {'id':'lighting-controls-data','count':'All occupied rooms, circulation andplant','path':[],'decision':'Drytray branches drop to inspectable metal face stations; actual circuit/accessory count follows electrical layout. Wired controls, no mandatory cloud/radio. Data/fire-alarm isolation and earthing separate, no implied certified polymer-free circuits.'},
 {'id':'fire-detection','count':'Whole-house alarm layout to fire strategy','path':[],'decision':'Protected stair/ring and every habitable/wet risk zone scheduled for actual compliant detector design; no device locations or grade/category invented. Certified alarm internals/backup power are explicit residue; do not delete to satisfy materials.'},
 {'id':'purge-overheating','count':6,'path':[],'decision':'Every habitable room retains actual operablewindow task; openings/noise/security/fall protection and orientation/climate/shading must prove purge/overheating.65L/s winterventilation is not cooling and no cooling duty is silently omitted.'},
]

residues=[
 {'id':'MEV-fans','quantity':'6 complete replaceable stations','location':'Six outer-wall wet-room pods','known':'Systemair K comparator has glass-reinforced polyamide impeller despite metal casing. Motor varnish, insulation, terminalbox/electronics/grommets and clamps need exact bill.',
 'alternative':'No-powered natural/intermittent fails intended airtight simple case; centralMEV/MVHR add distribution. Metal impeller fan may reduce one residue but is not presumed performance-compatible.',
 'replacement':'Isolate electrically, independently support both duct ends, open300×400clear panel, release actual demountable joints and lower complete≤250×300fan into clear room workzone; fixed wall sleeve/weather seal remains.25/50clear task reserve is design requirement, not matched-kit proof.',
 'proposal':'No exception yet; exact fan revision, constituents/quantity, duty/noise/curve and replacement instructions must precede any narrow owner request.'},
 {'id':'heat-pump','quantity':'1 outdoor monobloc + indoor hydraulic controls/plateHX/2circulation functions','location':'Externalstation andplant serviceface','known':'Certified compressor oil may be PAG; electrical insulation, PCBs, seals, pump internals, antivibration feet and flexible joints remain. R290 itself is a refrigerant, not proof of no polymers.',
 'alternative':'Directelectric removes refrigeration/hydraulics but increases delivered-electric demand; combustion adds fuel/flue/CO and is not selected. No safety/control parts altered.',
 'replacement':'Outdoor body exits directly to2300×1800 pad then site vehicle/lifting route; indoor unit to plantreplacementdoor. Exact mass/lift/clearance and freeze fluid declaration required.',
 'proposal':'Apparatus-only exception candidate, never approved by selecting this architecture; no polymer jacket/tube blanket exception.'},
 {'id':'DHW-vessel','quantity':'1×300L vessel; standard comparison50mm insulation','location':'Plant700square station','known':'Factory foam chemistry/cladding/valves/immersion/thermostat/seals unknown in dimension brochure.67.6kg dry/356.8kg filled comparison; no metal-only admission.',
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
 'cooker':{'extractPoint':[11100,12000,2400],'duct':160,'minimumCaptureLps':30,'makeupPoint':[12000,8600,2400],
   'makeupFormedTerritory':280,'makeupRequirement':'Dedicated measured30L/s at5Pa, pressure-controlled/interlocked opening, normally closed. Separate from65L/s background; no open-window chore or recirculation-onlyhood credit.',
   'hood':'600wide spans600hob; actual capture, grease cleanout, motor/controls/residues and classified cooking/fire relationship required.'},
 'heat':heat,'PV':pv,'pipeInsulation':insulation,'hotWater':hot,'plant':plant,'trunks':trunks,'wallCrossingEnquiries':crossings,'fixtures':schedule,'otherDuties':other,'residues':residues,
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
 for n,r in b['upperFurniture' if level else 'groundFurniture'].items():s.append(box(r,'#b8b1a4'))
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
 s.append(text(ox,oy-5,'FIRST / pipe axes6375' if level else 'GROUND / pipe axes2925',3.4))
 return ''.join(s)
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fffdf7"/>'
svg+=text(15,17,'ONE WHOLE-HOUSE SERVICE BASELINE / PROVISIONAL LOGGIA',5)
svg+=text(15,26,'Local continuous extract / actual outer-wall territories / high-level water and heating tree / no free attic',3)
svg+=plan(0,20,45)+plan(1,205,45)
notes=[
 'RED: six local wet-room extract pods. BLUE: six measured background supply terminals. BROWN: proposed pipe tree.',
 '65L/s normal total; separate30L/s cooker capture + dedicated makeup. Four bedrooms / design occupancy2–6, not household facts.',
 f'Area upper-bound {area:.3f}m²;0.3criterion {area*.3:.3f}L/s. Interior walls/stairs included; not certified SAP/net area.',
 'No ventilation duct enters protected stair/ring. Normal door-transfer/fire compatibility remains a real selected-assembly requirement.',
 'Ground north shortcut REJECTED: outdoor loggia is not an indoor pipe corridor. Each wall/floor penetration needs actual support/seal.',
 'Pipe trees show connected design territories; fixture branches, radiator output/dimensions, fire crossing and renewal are conditional.',
 'Outdoor8kW compatibility plant and300L store are pre-site requirements; current product labels do not prove cold-weather duty.',
 'No apparatus or synthetic-polymer exception approved. Metal cases do not remove impellers, seals, insulation or electronics.',
 'HADc83 / blob b15df3b3 frozen provisional source; newer protected geometry must be joined before final design selection.'
]
for i,n in enumerate(notes):svg+=text(15,190+i*9,n,2.85)
svg+=text(15,285,'All dimensions mm / groundFFL0 / first3450. Reservations are not construction permissions. 1 November2026',2.7)+'</svg>\n'
outputs={BASE.with_suffix('.json'):json.dumps(result,indent=2,ensure_ascii=False)+'\n',BASE.with_suffix('.svg'):svg}
for p,s in outputs.items():
 if '--check' in sys.argv:
  assert p.read_text()==s,'Stale '+str(p)
 else:p.write_text(s)
print(json.dumps({'floorUpperBoundM2':area,'normalLps':65,'fixtures':len(schedule),'localExtractStations':len(extract),'conditional':True}))
