#!/usr/bin/env python3
"""A pinned, connected assisted-makeup challenger; no product admission."""
import contextlib, functools, hashlib, io, json, math, pathlib, runpy, sys

P=pathlib.Path(__file__).resolve().parent
def read(path, sha):
    raw=path.read_bytes()
    actual=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    assert actual==sha,(str(path),actual,sha)
    return json.loads(raw) if path.suffix=='.json' else None

n=read(P/'connected-cooker-network.json','50af6c4734488210e4d0dec8d7b8f4d4d3a9e3c0')
c=read(P/'constructive-cooker-system.json','8f7a448a2bbf8de7311ea0ccc4b6d01eebe208ae')
legacy=read(P/'cooker-capture-modes.json','8d64b4a4c63b9da580d632ad03236262f73e73b2')
assert legacy['pressure']['targetRoomDepressionMaximumPa']==5
assert 'pressure below−5Pa beyond5s' in legacy['controls']['fault']
b=read(P/'whole-house-service-baseline.json','2d8f7243fb87d350763f2bca3d103b89b9d14b7d')
h=read(P.parent.parent/'had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52')
read(P/'connected-cooker-network.py','f99d727872069e35b74c7d80c7b19fe384f85c9e')
argv=sys.argv[:]
try:
    sys.argv=['connected-cooker-network.py','--check']
    with contextlib.redirect_stdout(io.StringIO()): model=runpy.run_path(str(P/'connected-cooker-network.py'))
finally: sys.argv=argv
model['solve']=functools.lru_cache(maxsize=None)(model['solve'])

def joined(mask,hood,target=-4):
    row=model['solve'](mask,target if hood else None)
    direct=hood+row['localExtractLps']['kitchen']-row['hallToKitchenLps'] if hood else 0
    total=sum(row['roomSupplyLps'].values())+direct
    assert abs(total-sum(row['localExtractLps'].values())-hood)<1e-5
    return {'mask':mask,'hoodLps':hood,'kitchenPa':row['nodePa']['kitchen'],
        'habitableInletsLps':sum(row['roomSupplyLps'].values()),'directMakeupLps':direct,
        'outsideLps':total,'roomInletsLps':row['roomSupplyLps'],
        'maximumNodeResidualLps':row['maxMassResidualLps'],
        'mostNegativeRoomPa':min(row['nodePa'].values())}

states={key:joined(mask,hood) for key,mask,hood in [('normalOff',0,0),('boostOff',63,0),
    ('normalHoodBEP',0,160/3.6),('normalHood70',0,70),('boostHood70',63,70)]}
pressureSensitivity={str(target):{
    'normal':joined(0,70,target),'allBoost':joined(63,70,target)}
    for target in (-4,-4.5,-5,-10)}
assert abs(states['normalOff']['outsideLps']-78)<1e-6
assert abs(states['boostOff']['outsideLps']-96)<1e-6
assert abs(states['normalHood70']['outsideLps']-148)<1e-6
assert abs(states['boostHood70']['outsideLps']-166)<1e-6
assert abs(states['boostHood70']['directMakeupLps']-83.114891)<.00001

# Gross Ø250 cartridge sensitivity: the terminal free fraction is of gross
# area; K2 and 0.6m Darcy .03 are authored placeholders, not a fan curve.
q=states['boostHood70']['directMakeupLps']/1000
area=math.pi*.25**2/4
intake=[]
for fraction in (.75,.5,.375):
    terminal=(q/(.61*fraction*area))**2*1.2/2
    duct=(2+.03*.6/.25)*(q/area)**2*1.2/2
    intake.append({'freeFractionGross':fraction,'terminalPa':terminal,'authoredDuctPa':duct,
        'totalPlaceholderPa':terminal+duct,'fanPressureBeyondKitchenDepressionPa':terminal+duct-4})
assert intake[0]['fanPressureBeyondKitchenDepressionPa']>0

# Full external dimensions are not furnished: these candidate boxes therefore
# remain *maximum procurement constraints*, including insulation and motors.
port={'selectedHADCentreY':8600,'proposedSuccessorCentreY':8700,'proposedFaceMM':[8450,8950],
      'maximumCandidateInsulatedFanPlanMM':[10800,8500,228,436],
      'maximumCandidateShutterPlanMM':[11200,8500,100,436],
      'maximumCandidateServiceBoxMM':[10750,8450,820.5,500],
      'maximumCandidateFloorLiftMM':[10550,8375,800,600],
      'candidateOperatorCentreMM':[10200,8750], 'operatorRadiusMM':300}
old=n['fourHundredFirstRelease']['inheritedPlatformMM'];storage=h['groundFurniture']['cold-storage']
def overlap(a,z):return a[0]<z[0]+z[2] and a[0]+a[2]>z[0] and a[1]<z[1]+z[3] and a[1]+a[3]>z[1]
assert old==[10145.5,8467.5,750,1100]
assert storage==[10920.5,9025,650,650]
assert overlap(old,port['maximumCandidateFloorLiftMM'])
assert not overlap(port['maximumCandidateFloorLiftMM'],storage)
assert storage[1]-(port['maximumCandidateFloorLiftMM'][1]+600)==50
assert storage[1]-port['proposedFaceMM'][1]==75
for k in ('maximumCandidateInsulatedFanPlanMM','maximumCandidateShutterPlanMM','maximumCandidateFloorLiftMM'):
    for name,box in h['groundFurniture'].items():
        assert not overlap(port[k],box),(k,name)
assert port['maximumCandidateFloorLiftMM'][0]-(port['candidateOperatorCentreMM'][0]+300)==50

# Room allocation carries the old 950W as other local heat, never fabric or
# cooking credit. State-specific whole-house energy counts exterior air once.
heat={}
for name,s in states.items():
    kelvin=30
    heat[name]={'physicalWholeHouseW':(220+1.2*s['outsideLps'])*kelvin,
        'conservativeKitchenW':950*kelvin/25+1.2*kelvin*s['directMakeupLps']}
assert abs(heat['boostHood70']['physicalWholeHouseW']-12576)<1e-6
novy_hood=618/3.6 # official 6910 boost; no speed is waived
novy=joined(63,novy_hood)
novy_case={'model':'Novy 6910 plus source-compatible 990036 I/O, architectural replacement comparison only',
    'publishedBoostM3h':618,'publishedBoostLps':novy_hood,
    'allLocalBoostAtMinus4Pa':novy,
    '30KWholeHousePhysicalW':(220+1.2*novy['outsideLps'])*30,
    '30KKitchenConservativeW':1140+36*novy['directMakeupLps']}
assert abs(novy_case['30KWholeHousePhysicalW']-16236)<1e-5
assert novy_case['30KKitchenConservativeW']>7500
nomold=2866.8;nomnew=2441
emitter={str(flow):nomold*((flow-25)/50)**1.32+nomnew*((flow-25)/50)**1.34
         for flow in (65,70)} # 10K radiator water drop, room20: mean excess=flow-25
assert emitter['65']<heat['boostHood70']['conservativeKitchenW']<emitter['70']
plant={'requiredNetAt30KBoostW':12576,'14kWNetArithmeticMarginW':1424,
       'waterSecondaryLpsAt14kW10K':14/(4.18*10),
       'glycolPrimaryLpsAt14kW10K':14/(3.2*10),
       'waterSecondaryLpsAt14kW5K':14/(4.18*5),
       'glycolPrimaryLpsAt14kW5K':14/(3.2*5),
       'requiredPrimarySupplyC':'greater than 70C secondary flow by actual HX approach; source A-10/W>70 net14kW after defrost required'}
# A real compact OEM family with supply-air tempering: every published speed,
# every 6-fan mask, cold design point and low line voltage. Published airflow is
# an EN61591 comparison load, NOT a claimed installed hood operating point.
oem_sources={
 'hood':'https://middleby-cdn.com/specsheets/810_35_TechnicalFile_en_2024_09_02_10_29_03.pdf',
 'windowInput':'https://middleby-cdn.com/installations_instructions/810_v35_MA1_I.pdf',
 'valveOutput':'https://middleby-cdn.com/installations_instructions/990030_110060_GA1_LR.pdf',
 'heater':'https://veab.com/en/customer%20files/files/brochures/cv-gb-vici.pdf',
 'heaterInstructions':'https://veab.com/en/customer%20files/files/manuals/173656-01-manual-cv-o-se-en-de-fr-nl-fi-web.pdf',
 'filter':'https://shop.systemair.com/upload/assets/INSTALLATION__OPERATION_AND_MAINTENANCE_INSTRUCTION_FILTER_CASSETTE_004_EN.PDF',
 'reducer':'https://www.lindab.co.uk/globalassets/commerce/lindabwebproductsdoc/assets/production/nge5ytfhmgqtnjdmny00njdkltkyntctn2nmodninzk3mjy3/5250737225389875375/rcu-datasheet-global.pdf',
 'shutter':'https://itsolution.lindab.com/lindabwebproductsdoc/assets/production/ZDE3OTFkYjQtNGI0MC00NTBmLWJkMjgtZjdmZTI5ZDQ2M2Uz/5249546583833160992/dtbcu.pdf',
 'actuator':'https://www.belimo.com/mam/general-documents/datasheets/en-gb/belimo_LF24_datasheet_en-gb.pdf',
 'positionAccessory':'https://www.belimo.com/mam/general-documents/datasheets/en-gb/belimo_S2A-F_datasheet_en-gb.pdf',
 'NovyWindowManualMirror':'https://device.report/m/726fcc763197b25f7705aecc6be2129d42933a4da143f5e7c9290f39f1dc1400.pdf',
 'filterChange':'https://www.systemair.com/en-hk/products/fans/accessories/mechanical-accessories/filter-cassettes/fgr',
 'fanCard':'https://docs.planning.org.uk/20251224/54/T7BK5SKBJGP00/9quyf95v263jppq1.pdf',
 'pressureSensor':'https://www.halstrup-walcher.de/assets/products/measurement-technology/P26/data-sheet-P26.pdf'}
hood_speeds=[205,333,399,534]
selected_makeup=next(port for port in h['exteriorPortGeometry'] if port['id']=='cooker-makeup')
assert selected_makeup['p']==[12000,8600,2400]
# 2x3 kW at 230 V; resistance-only low-line screen. No credit for thermal
# overvoltage, cooking gain, demand diversity, hidden boost cap or OEM bypass.
low_line_w=6000*.9**2
new_emitter_55=nomold*(30/50)**1.32+nomnew*(30/50)**1.34
compact_modes=[]
for speed in hood_speeds:
    rows=[]
    for mask in range(64):
        air=joined(mask,speed/3.6)
        direct=air['directMakeupLps']
        ideal_temper=1.2*direct*30
        electric=min(ideal_temper,low_line_w)
        kitchen=1140+ideal_temper-electric
        total=(220+1.2*air['outsideLps'])*30
        rows.append({'mask':mask,'directMakeupLps':direct,
          'outsideLps':air['outsideLps'],'minimumRoomPa':air['mostNegativeRoomPa'],
          'heaterVelocityMps':direct/1000/(math.pi*.2**2/4),'250mmTrainVelocityMps':direct/1000/area,'ideal20CSupplyHeaterW':ideal_temper,
          'lowLineAvailableHeaterW':electric,
          'lowLineSupplyC':-10+electric/(1.2*direct),
          'remainingKitchenW':kitchen,'physicalWholeHouseW':total,
          'netHydronicW':total-electric,'massResidualLps':air['maximumNodeResidualLps']})
    compact_modes.append({'hoodM3h':speed,'rows':rows})
all_compact=[r for mode in compact_modes for r in mode['rows']]
assert len(all_compact)==256
assert min(r['heaterVelocityMps'] for r in all_compact)>1.5
assert max(r['massResidualLps'] for r in all_compact)<1e-5
assert max(r['remainingKitchenW'] for r in all_compact)<new_emitter_55
assert max(r['netHydronicW'] for r in all_compact)<14000
assert 6000>max(r['ideal20CSupplyHeaterW'] for r in all_compact)>low_line_w
# No same-hood no-tempering or one-heater-failed RUN is credited.
peak=max(all_compact,key=lambda r:r['remainingKitchenW'])
one_heater_fault_kitchen=1140+peak['ideal20CSupplyHeaterW']-low_line_w/2
assert one_heater_fault_kitchen>new_emitter_55

# Full straight train, east-to-west from the PROPOSED 8700/2400 successor.
# Exact OEM heater body includes its 82mm box; the 500-wide carrier is wholly noncombustible; 100mm clearance to
# any adjacent combustible remains a separate installed-material constraint.
# Fan/shutter/silencer/terminal complete lengths are procurement constraints,
# never manufactured product dimensions or a qualified resistance curve.
train=[
 {'id':'sleeve-and-weather-boundary','x':[11570.5,12000],'kind':'retained boundary; modified centre requires owning rewind'},
 {'id':'DTBCU250-LF24-shutter-and-actuator','x':[11320.5,11570.5],'kind':'OEM100ductbody/230motor axial/105motor width/135abovebody;250complete allocation, S2A-F/shaft/couplings still to join'},
 {'id':'Systemair-FGR250-filter','x':[11200,11450],'kind':'OEM239overallaxial/123body/302x297transverse/280filterwithdrawal;250axial allocation includes11mm connection reserve'},
 {'id':'EC-fan-and-terminal-box','x':[10950,11200],'kind':'K250ECsileo78585 actual202axial/336diam/249spigots/40boxprojection/88boxwidth/3.9kg;250axial436transverse allocation, actual FK clamp/bracket/tools unqualified'},
 {'id':'Lindab-RCU250-200-reducer','x':[10800,10950],'kind':'OEM42body/0.46kg;150overall connection allocation, real insertion/coupling must join'},
 {'id':'straight-before-heater1','x':[10400,10800],'kind':'400mm clear 2D of200; no filter/bend/damper/reducer'},
 {'id':'VEAB-CV20-30-1-ViCi-QOL-1','x':[10025,10400],'kind':'OEM375 axial/200bore/278box-axial-length/82box-projection; side box'},
 {'id':'straight-between-heaters','x':[9625,10025],'kind':'400mm clear 2D'},
 {'id':'VEAB-CV20-30-1-ViCi-QOL-2','x':[9250,9625],'kind':'OEM375 axial/200bore/278box-axial-length/82box-projection; side box'},
 {'id':'straight-after-heater2','x':[8850,9250],'kind':'400mm clear 2D'},
 {'id':'Lindab-RCU200-250-reducer','x':[8700,8850],'kind':'same actual250/200body used in expansion direction; loss distinct from contraction'},
 {'id':'silencer','x':[8200,8700],'kind':'complete500axial procurement constraint; no performance credited'},
 {'id':'contact-protective-supply-diffuser','x':[7900,8200],'kind':'300axial procurement constraint; direction north into kitchen'}]
# Reject the earlier120.5mm shutter slot:230mm LF motor alone exceeds it.
assert 230>120.5
for item in train[2:]:item['x']=[v-129.5 for v in item['x']]
for east,west in zip(train,train[1:]):assert east['x'][0]==west['x'][1]
carrier=[7770.5,8450,2100,3800,500,750] # x,y,z,dx,dy,dz
room=h['rooms']['kitchenDining']['bounds']
assert room[0]<carrier[0] and carrier[0]+carrier[3]<=room[0]+room[2]
assert room[1]<carrier[1] and carrier[1]+carrier[4]<room[1]+room[3]
assert carrier[2]+carrier[5]<h['sections']['firstFloorRC']['bottom']
assert carrier[1]-room[1]==25.5
assert h['sections']['firstFloorRC']['bottom']-(carrier[2]+carrier[5])==320
# The200mm heater side-box projects82mm:282mm bare asymmetric envelope.
# 50mm radial jacket gives300mm circle, but must NOT cover box/labels.
# Use436mm complete centred procurement envelope, not a278mm body width.
assert max(200+2*50,2*(200/2+82))<436<carrier[4]
release=[]
for name,xc in [('fan',11075),('heater1',10212.5),('heater2',9437.5)]:
    xc-=129.5
    lift=[xc-250,8450,500,550]
    operator=[xc-750,8750] # radius300;100mm clear to lift edge
    assert operator[0]-300>=room[0]
    assert operator[1]-300>=room[1]
    assert operator[0]+300<=lift[0]-100
    hits=[key for key,box in h['groundFurniture'].items() if overlap(lift,box)]
    assert not hits,(name,hits)
    assert storage[1]-(lift[1]+lift[3])==25
    release.append({'component':name,'supportedCradleFloorMM':lift,
       'operatorCentreMM':operator,'operatorRadiusMM':300,
       'nominalStandingToCradleMM':100,'floorFurnitureConflicts':hits,
       'scope':'Only plan and carrier height checked; actual rated cradle, independent supports, load, tools, cabling, clamps, strokes, body/handler and arch passage remain unqualified.'})
compact={'status':'Joined compact OEM/tempered-air development candidate; operation and adoption unqualified',
 'sources':oem_sources,'hood':'Novy810 version35; all205/333/399/534m3h modes retained; EN61591 loads not installed curves',
 'hoodBodyMM':[560,301,330],'hoodCutoutMM':[545,286],'hoodMassKg':9.8,
 'hoodMountingAboveInductionMM':[650,750],
 'OEMInput':'990033 manufacturer MA2 manual mirror p5 admits810>=v17 potentialfreecontact; p20 diagram OPEN=windowOPEN/hoodON, CLOSED=windowCLOSED/hoodOFF. Does not provide live-trip timing/coastdown or certify pressurecontroller application; open/broken interface wiring can resemble permissive.',
 'OEMOutput':'990030 V output230VAC; normally closed air-supply/exhaust valve opens on any extraction mode and closes when no extraction. No 990036 five-minute output semantics imported.',
 'heater':'2xVEAB CV20-30-1-ViCi-QOL; nominal3000W230V each; independent dual overheat and integrated flow sensing retained',
 'shutterFeedback':'Belimo LF24 datasheet2026-04-08:75s powered90degree stroke,<20s springreturnat-20..50C,5W/7VA; mechanical indication only. OEMaccessoryS2A-F datasheet2025-05-28 gives2SPDT/0.33kg/1mcable and LF compatibility. ActualLindabshaft/accessorygeometry/clearances and supplyrevision mustjoin; no electrical position proof credited untilthen.',
 'filterChangeCondition':'CurrentSystemairfamily rule min(initialcleanPa+50,3*initialcleanPa); older170Pa recommendation retained only historical comparator. Actualdirtyloss/flow/media notyetbound.',
 'fanActual':'K250ECsileo78585 manufacturer2025catalogue card:202axial/336diam/249spigots/40boxprojection/88boxdimension/3.9kg; bracket and fastclamps retained, not bare202box selection.',
 'heaterControllerCaveats':'Current manual limits below1.5m/s and cuts below0.7m/s. All modelled200mm heater modes exceed1.5m/s; previous250mm heater fails that full-power threshold. FGR250 filtration included, actual media/curve/contamination duty unqualified. Heater alarm not proven hood safety trip.',
 'designOutdoorC':-10,'nominalSupplyTargetC':20,'lowLineVoltageFraction':.9,
 'lowLineResistancePowerW':low_line_w,'nominalElectricalCurrentPerHeaterA':3000/230,
 'nominalElectricalEnergyKWhPerFullPowerHour':6,
 'nominalHeaterCircuitProposal':'Two separate permanently wired230V circuits; nominal13.043A each. Actual protective devices/cable derating/disconnection/earthing/load capacity and fan/hood/control plus cooking/DHW simultaneity unestablished.',
 '14kWNetSecondaryWaterLpsAt10K':14/(4.18*10),
 '14kWNetPrimaryGlycolLpsAt10K':14/(3.2*10),
 'maximumIdealAirHeatW':max(r['ideal20CSupplyHeaterW'] for r in all_compact),
 'maximumPhysicalWholeHouseW':max(r['physicalWholeHouseW'] for r in all_compact),
 'maximumLowLineKitchenW':max(r['remainingKitchenW'] for r in all_compact),
 'maximumLowLineNetHydronicW':max(r['netHydronicW'] for r in all_compact),
 'H600L1200plusNorthH700L900At55_45W':new_emitter_55,
 'singleHeaterFailureKitchenW':one_heater_fault_kitchen,
 'singleHeaterFailureDisposition':'Fails room emitter; hood inhibit/latch mandatory, no continued RUN credit',
 'hydronicCondition':'14kW net delivered at55/45 secondary after defrost/HX is a requirement, not a model-name capacity; primary actual approach, pump/flow/HX/pad must join source model',
 'all256Modes':compact_modes,
 'geometry':{'selectedHADPortMM':[12000,8600,2400],
   'proposedSuccessorPortMM':[12000,8700,2400],
   'proposalNeedsOwningHADRewind':True,'axisMM':{'y':8700,'z':2400},
   'bends':0,'reducers':2,'heaterBoreMM':200,'carrierMM':carrier,'trainEastToWest':train,
   'intakeFilter':'SystemairFGR250 upstreamfan; OEM239overallaxial/302x297cross/280withdrawal. Hatch upwards:baretop2548.5 plus280=2828.5; carrierroof2850 removable, RC3170. Insulation/ratedsupports/locking/tool/handling/accessheight and dirtypressure/media remain unqualified.',
   'minimumHeadroomBelowCarrierMM':2100,'ceilingReserveMM':320,
   'rearFinishedFaceReserveMM':25.5,'coldStoragePlanGapMM':75,
   'firstRelease':release,
   'mounting':'Independent all-component supports and lateral removable noncombustible casing; heater boxes face north for access, no covered rating plates/reset/cover. No joist/RC anchor capacity credited.'},
 'pressureBudget':{'proposedSensor':'HalstrupWalcherP26 +/-10Pa,0.2%FS, fast25ms T63, calibrated18..22C enclosure; candidate only',
   'referenceAndAccuracyPa':.3+.002*20,'temperatureCoefficientAllowancePa':.0003*20*2,
   'authoredTubingStaticErrorAllowancePa':.1,'authoredADCAllowancePa':.05,
   'authoredTrackingAllowancePa':.2,
   'remainingDynamicAllowancePa':1-(.3+.002*20+.0003*20*2+.1+.05+.2),
   'limits':'No measured tubing, whole-loop25ms, actuator/fan or hood coastdown proof. P26 zero-calibration interrupts measurement; requires source-qualified off-cycle calibration/drift bound or redundant measured architecture. Beck984 minimum1Pa error alone exhausts nominal margin and is excluded.'},
 'admissionBlockers':['Exact990033 live-inhibit timing/coastdown, wiring fault detection and controller application; polarity now sourced, do not energise hood externally',
   'Installedhood and fan curves across fullweather/fouling/modes plus filtration/silencer/valve losses',
   'VEAB actual output/control atallflows/lowline; fullpower threshold resolved by200mm heaters, annual/quarterly maintenance obligations',
   'P26 installed accuracy, fault detection, zeroing and full-loop/hood-stop transient budget',
   'All-parts geometry, filter, couplings and complete firstrelease/supports; HAD/STR port8700 rewinds',
   '55/45 allroom output, actual14kWnet plant/HX/pump/pad/sourceconditions and electricalservice/diversity',
   'All polymer/unknown materials remain unapproved; no exception or stripped seals']}
# Full task screen: a real podium comparator exposes furniture and body clashes.
# Its820x1450 footprint is the published41972 base, not an800-square proxy.
platform_events=[]
for event in release:
    x=event['supportedCradleFloorMM'][0]+250
    base=[x-410,9000,820,1450]
    hits=[key for key,box in h['groundFurniture'].items() if overlap(base,box)]
    platform_events.append({'component':event['component'],'baseMM':base,
        'selectedFurnitureConflicts':hits,'currentOccupiedRoomServicePass':not hits})
assert not any(e['currentOccupiedRoomServicePass'] for e in platform_events)
compact['maintenanceTask']={
 'platformSource':'https://www.zarges.com/uk/products/mobile-access-steps-with-platform-single-sided-access-with-aluminium-treads-and-platform/mobile-access-steps-with-platform-single-sided-access-with-aluminium-treads-and-platform-41971',
 'platformComparator':'Zarges41972 variant published base820x1450,deck960,mass31.8kg; fullguard/stair/transport drawing and load certificate must bind',
 'platformEvents':platform_events,'platformDeckMM':960,'authoredOperatorHeightMM':1750,
 'authoredHelmetClearanceMM':100,'standingHelmetTopMM':2810,
 'RCRoomHeadReserveMM':360,
 'oldUnderCarrierStandingTopMM':960+1750+100,
 'oldUnderCarrierCollisionMM':960+1750+100-2100,
 'toolComparator':'Bahco808050P manufacturer260mmoverall/40mmhandle/0.27kg; exactbit/fastener match and human grip unknown, retain50mm extra grip allocation',
 'toolSource':'https://www.bahco.com/int_en/1-4--ratcheting-bit-screwdriver-with-pistol-handle-pb_808050p_.html',
 'filterBareRiseMM':[2548.5,2828.5],
 'filterPlus100GripToolTopMM':2928.5,
 'fixedCarrierRoofConflictMM':2928.5-2850,
 'proposedRoofFirstMotion':'Independently support full500x500x50max panel; raise100 then slide550north before filter extraction. 50panel/100grip are procurement task maxima, not a selected casing product; source mass/support/fasteners/hoist missing.',
 'proposedRaisedPanelTopWith100GripMM':2850+100+50+100,
 'proposedRoofTaskToRCReserveMM':3170-(2850+100+50+100),
 'scope':'Current selected furniture fails side-platform access; furniture removal/park/carrying route not earned. Arm700/standing/platform/body/driver are explicit task screens, not human or lifting qualification. No complete firstrelease PASS.'}

# Single exact SVG drawing: actual source bodies are solid, procurement/task
# maxima dashed. It deliberately shows the current maintenance failures.
from html import escape
sv=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
 '<rect width="420" height="297" fill="white"/>',
 '<style>text{font-family:Arial,sans-serif;fill:#172531} .b{font-weight:bold}.s{font-size:2.7px}.xs{font-size:2.2px}.n{font-size:3.5px}.dash{stroke-dasharray:2 1}</style>']
def txt(x,y,t,cls='s',fill=None):
    sv.append(f'<text x="{x:.3f}" y="{y:.3f}" class="{cls}"'+(f' style="fill:{fill}"' if fill else '')+'>'+escape(str(t))+'</text>')
def rect(x,y,w,d,fill='none',stroke='#536471',dash=False,opacity=1):
    sv.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{d:.3f}" fill="{fill}" stroke="{stroke}" stroke-width="0.35" opacity="{opacity}"'+(' class="dash"' if dash else '')+'/>')
def line(x,y,x2,y2,col='#536471',dash=False):
    sv.append(f'<path d="M{x:.3f},{y:.3f} L{x2:.3f},{y2:.3f}" stroke="{col}" stroke-width="0.4" fill="none"'+(' class="dash"' if dash else '')+'/>')
txt(12,10,'COMPACT COOKER + TEMPERED MAKEUP — ASSEMBLY / TASK SCREEN','n b')
txt(12,15,'Unaccepted development candidate • actual sources + explicit maxima • no physical fit, operation or material approval','s', '#a12d2d')
txt(12,20,'Pinned HAD selected port Y8600; successor Y8700 requires owning rewind. Dimensions mm. Drawn on A3 landscape.','s')
scale=.044
px=lambda x:12+(x-7719.5)*scale
py=lambda y:30+(11570.5-y)*scale
def planbox(b,fill='none',stroke='#536471',dash=False,opacity=1):rect(px(b[0]),py(b[1]+b[3]),b[2]*scale,b[3]*scale,fill,stroke,dash,opacity)
txt(12,27,'A  PLAN • north up • furniture stays selected','s b')
planbox(room,'#fafbfc','#263743')
for key,bx in h['groundFurniture'].items():
    if overlap(room,bx):
        planbox(bx,'#e4e8eb','#7f8a94')
        label={'north-cooking-station':'COOK','north-sink-station':'SINK','cold-storage':'COLD','dining-table1200x800':'TABLE','service-emitter-kitchen-E':'E RAD'}.get(key)
        if label:txt(px(bx[0])+1,py(bx[1]+bx[3])+3,label,'xs')
planbox(c['kitchenEmitterTrials']['900']['completePlanMM'],'#f8ce82','#b27b25',True)
txt(px(9700),py(11370.5)-1,'N RAD / cill duty unresolved','xs')
# Actual window spans projected onto room finished boundaries.
for lo,hi in [(7950,8650),(9700,10700)]:line(px(lo),py(11570.5),px(hi),py(11570.5),'#156b9a')
line(px(11570.5),py(9700),px(11570.5),py(10700),'#156b9a')
txt(px(11400),py(10400),'W3','xs')
for lo,hi in [(8250,9150),(10450,11350)]:line(px(lo),py(8424.5),px(hi),py(8424.5),'#13998c',True)
txt(13,175,'Rear open arches 900; upstream fire door is outside this local view.','xs')
planbox([carrier[0],carrier[1],carrier[3],carrier[4]],'#e9f3f8','#156b9a',True)
for i,item in enumerate(train[1:],1):
    lo,hi=item['x']; planbox([lo,8500,hi-lo,400],'#c7e4ed','#156b9a',False,.8)
    txt(px((lo+hi)/2)-1,py(8700),i,'xs')
for i,e in enumerate(platform_events):
    planbox(e['baseMM'],'none','#c03648',True)
    txt(px(e['baseMM'][0])+1,py(e['baseMM'][1]+e['baseMM'][3])+3,f'P{i+1} service FAIL','xs','#a12d2d')
for e in release:planbox(e['supportedCradleFloorMM'],'none','#9e4fa5',True)
# Roof-first motion in plan, only the local filter panel.
planbox([10950,8450,500,500],'none','#9e4fa5',True)
planbox([10950,9000,500,500],'none','#9e4fa5',True)
line(px(11370),py(8700),px(11370),py(9250),'#9e4fa5',True)
txt(12,181,'Solid grey: selected furniture. Red dashed: actual podium base at three tasks.','xs')
txt(12,185,'P1 cold-store clash; P2 chairs; P3 table/chairs. Furniture park/carry route UNPROVED.','xs','#a12d2d')
# Axial X/Z: all complete device bodies retained; no upper void assumed.
ax=lambda x:223+(x-7719.5)*scale
az=lambda z:172-z*scale
txt(223,27,'B  AXIAL SECTION • X / Z • axis2400','s b')
rect(ax(7719.5),az(3170),3851*scale,200*scale,'#c4cbd0')
txt(223,az(3170)-2,'RC underside3170 / anchors and support loads unqualified','xs')
rect(ax(carrier[0]),az(2850),carrier[3]*scale,750*scale,'none','#156b9a',True)
for i,item in enumerate(train[1:],1):
    lo,hi=item['x']; bore=200 if 'heater' in item['id'] or 'straight' in item['id'] else 250
    if 'silencer' in item['id']:bore=436
    rect(ax(lo),az(2400+bore/2),(hi-lo)*scale,bore*scale,'#d6eaf1','#156b9a',True)
    txt(ax((lo+hi)/2)-1,az(2400)-1,i,'xs')
# Actual motor/top, fan OD and terminal box, filter cross/body, heater boxes.
rect(ax(11330.5),az(2660),230*scale,135*scale,'#9fc4d5','#156b9a')
rect(ax(10845),az(2568),202*scale,336*scale,'#9fc4d5','#156b9a')
rect(ax(10845+60),az(2608),88*scale,40*scale,'#8cb6ca','#156b9a')
rect(ax(11070.5),az(2548.5),239*scale,297*scale,'#b8d5bf','#42794e')
for item in train:
    if item['id'].startswith('VEAB'):
        lo,hi=item['x'];rect(ax(lo),az(2500),375*scale,200*scale,'#ebce9f','#ae782a')
        # Boxes face north: cross-projection is indicated, not an invented top box.
        txt(ax(lo),az(2600),'side box82','xs')
# Independently supported cradle/hangers are demands, not rated products.
for xx in [8050,9300,10100,10900,11450]:line(ax(xx),az(2850),ax(xx),az(3170),'#a37122',True)
line(ax(7770.5),az(2100),ax(11570.5),az(2100),'#263743')
txt(223,177,'Dashed blue: complete procurement envelope. Gold: unqualified support demand.','xs')
txt(223,181,'Motor230 retained; actual fan202/336 + box40; filters239 overall; two heaters375.','xs')
txt(223,185,'Carrier3800 ×500 ×750. West plan reserve51; no clamp/tool/anchor PASS.','xs','#a12d2d')
# Y/Z section focused on filter service, with a full podium/operator body.
sy=.028
fx=lambda y:15+(y-8400)*sy
fz=lambda z:289-z*sy
txt(12,195,'C  FILTER / ROOF / HUMAN • Y / Z','s b')
rect(fx(8400),fz(3170),2300*sy,200*sy,'#c4cbd0')
rect(fx(8450),fz(2850),500*sy,750*sy,'none','#156b9a',True)
rect(fx(8551.5),fz(2548.5),297*sy,297*sy,'#b8d5bf','#42794e')
rect(fx(8551.5),fz(2828.5),297*sy,280*sy,'none','#9e4fa5',True)
rect(fx(8501.5),fz(2928.5),397*sy,100*sy,'none','#9e4fa5',True)
rect(fx(8450),fz(2850),500*sy,50*sy,'#d9bedb','#9e4fa5')
rect(fx(9000),fz(3000),500*sy,50*sy,'none','#9e4fa5',True)
line(fx(8700),fz(2850),fx(9250),fz(2950),'#9e4fa5',True)
rect(fx(9000),fz(960),1450*sy,960*sy,'none','#c03648',True)
line(fx(9000),fz(1960),fx(9800),fz(1960),'#c03648')
rect(fx(9200),fz(2710),350*sy,1750*sy,'#f5dddd','#a12d2d')
rect(fx(9200),fz(2810),350*sy,100*sy,'none','#a12d2d',True)
line(fx(9350),fz(2460),fx(8848.5),fz(2828.5),'#9e4fa5')
# Actual260mm screwdriver plus authored50mm grip clearance.
rect(fx(8950),fz(2460),310*sy,40*sy,'none','#a37122',True)
line(fx(8400),fz(0),fx(10700),fz(0),'#263743')
txt(82,204,'Filter:2548.5 +280 =2828.5','xs')
txt(82,208,'+100 grip/tool reaches2928.5','xs')
txt(82,212,'Fixed roof2850: FAIL78.5','xs','#a12d2d')
txt(82,218,'Proposed roof: support, lift100,','xs')
txt(82,222,'slide550 north; panel50 +100grip','xs')
txt(82,226,'top3100 <RC3170: only70 reserve','xs')
txt(82,232,'Podium:820×1450 / deck960','xs')
txt(82,236,'Operator1750 +helmet100','xs')
txt(82,240,'head2810; RC reserve360','xs')
txt(82,246,'Under carrier: collision710.','xs','#a12d2d')
txt(82,250,'Side base: furniture conflicts.','xs','#a12d2d')
txt(82,256,'Roof panel/support/hoist/load,','xs')
txt(82,260,'grip, tool/bit, platform full rails,','xs')
txt(82,264,'transport and human proof OPEN.','xs','#a12d2d')
# Compact legend and interpretation, separated from drawing geometry.
txt(223,195,'TRAIN KEY / PROOF BOUNDARY','s b')
for i,item in enumerate(train[1:],1):txt(223,200+i*4,f'{i:02d} '+item['id'].replace('VEAB-CV20-30-1-ViCi-QOL','CV20 heater').replace('Lindab-',''),'xs')
txt(223,255,'Actual bodies: OEM drawings. Maxima: assembly design demands.','xs')
txt(223,260,'P1/P2/P3 are alternative task positions, never simultaneous platforms.','xs')
txt(223,265,'No furniture is silently removed. No full service fit or operating PASS.','xs','#a12d2d')
txt(223,270,'No certification, product acceptance, polymer exception or HAD adoption.','xs','#a12d2d')
# North cill/radiator interface stays conditional, with no invented cill underside.
txt(146,198,'D  NORTH CILL / EMITTER','s b')
txt(146,203,'Selected sill1050; underside UNKNOWN','xs')
dz=lambda z:278-z*.04
line(146,dz(0),203,dz(0),'#263743')
line(190,dz(1050),190,dz(1800),'#156b9a')
line(180,dz(1050),203,dz(1050),'#156b9a')
rect(175,dz(800),8,700*.04,'#ebce9f','#ae782a',True)
rect(175,dz(850),8,50*.04,'none','#9e4fa5',True)
line(170,dz(900),203,dz(900),'#a12d2d',True)
txt(146,284,'H700 trial bottom100;50lift →850','xs')
txt(146,288,'Requires cill underside≥900; no join PASS','xs','#a12d2d')
compact['maintenanceTask']['northCill']={'selectedSillZ':1050,'actualUnderside':'unknown','radiatorTrialBottomZ':100,'radiatorBodyHeight':700,'upwardReleaseMM':50,'requiredCillUndersideMinimumZ':900,'scope':'Existing constructive trial requirement, no selected cill/valve/support/body admission.'}
txt(12,294,'Joined cooker study • generated with source-pinned network/HAD • source/result owns uncertainties • all dimensions mm','xs')
sv.append('</svg>')
drawing='\n'.join(sv)+'\n'
drawing_path=P/'joined-cooker-assembly.svg'
if '--check' in sys.argv:assert drawing_path.read_text()==drawing,'stale joined cooker assembly drawing'
else:drawing_path.write_text(drawing)

out={'status':'Joined compact Novy810/tempered-air candidate plus inherited ERA trial and rejected6910 comparator; all256 modes enumerated, actual OEM/kit/control/plant admission unresolved.',
     'source':{'startingMain':'e93c643d36dfb0ee72a2bd2035899dfc5cc94f74',
      'networkBlob':'50af6c4734488210e4d0dec8d7b8f4d4d3a9e3c0',
      'constructiveBlob':'8f7a448a2bbf8de7311ea0ccc4b6d01eebe208ae',
      'HADBlob':'25faad2c4d40df2b7da7212f73808843a88d2f52'},
     'nominalTrialPa':-4,'inheritedProtection':{'maximumDepressionPa':5,'sustainedBelowMinus5Seconds':5,
       'minus5SetpointDisposition':'At trip boundary with no sensor/control/transient tolerance; rejected as selected RUN target.',
       'minus4Sensitivity':'Requires 83.115 L/s peak and independently qualified sensor accuracy/transient budget below five-second trip, not selected.',
       'minus10Disposition':'Incompatible with inherited trip without source-authored redesign and joined room/fan/capture/OEM proof.'},
     'states':states,'terminalSensitivity':intake,
     'pressureTargetSensitivity':pressureSensitivity,
     'OEMReplacementNegativeControl':novy_case,'compactTemperedCandidate':compact,
     'layoutMaximumProcurementEnvelopes':port,'heatAt30K':heat,
     'existingH600L1200PlusNewNorthH700L900W':emitter,'netPlantDuty':plant,
     'limits':'Assisted assembly fan curve at installed resistance, stop shutter motor/EPDM, exact all-parts geometry, hood interlock, sealed boundary and all-room output/HX/product/pad fit not established. No material exception, physical admission or selected HAD modification.'}
text=json.dumps(out,indent=2,ensure_ascii=False)+'\n'
path=P/'joined-cooker-system.json'
if '--check' in sys.argv:assert path.read_text()==text,'stale joined cooker system result'
else:path.write_text(text)
print(json.dumps({'normalDirect':states['normalHood70']['directMakeupLps'],
 'boostDirect':states['boostHood70']['directMakeupLps'],
 'boostWholeHouseW':heat['boostHood70']['physicalWholeHouseW'],
 'maxNodeResidual':max(s['maximumNodeResidualLps'] for s in states.values())}))
