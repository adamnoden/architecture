#!/usr/bin/env python3
"""A pinned, connected assisted-makeup challenger; no product admission."""
import contextlib, hashlib, io, json, math, pathlib, runpy, sys

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

def joined(mask,hood,target=-4):
    row=model['solve'](mask,target if hood else None)
    direct=hood+row['localExtractLps']['kitchen']-row['hallToKitchenLps'] if hood else 0
    total=sum(row['roomSupplyLps'].values())+direct
    assert abs(total-sum(row['localExtractLps'].values())-hood)<1e-5
    return {'mask':mask,'hoodLps':hood,'kitchenPa':row['nodePa']['kitchen'],
        'habitableInletsLps':sum(row['roomSupplyLps'].values()),'directMakeupLps':direct,
        'outsideLps':total,'roomInletsLps':row['roomSupplyLps'],
        'maximumNodeResidualLps':row['maxMassResidualLps']}

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
port={'existingHADCentreY':8700,'existingFaceMM':[8450,8950],
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
assert storage[1]-port['existingFaceMM'][1]==75
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
out={'status':'Connected assisted Ø250 minus-four nominal trial; actual control/OEM/kit/plant evidence fails selection. Minus-five and Novy replacement are explicit negative controls.',
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
     'OEMReplacementNegativeControl':novy_case,
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
