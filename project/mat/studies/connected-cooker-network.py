#!/usr/bin/env python3
"""Connected room/door/inlet compatibility screen, not installed air or heat proof."""
import hashlib,json,math,pathlib,sys
P=pathlib.Path(__file__).resolve().parent
def pinned(path,sha):
    raw=path.read_bytes();actual=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    assert actual==sha,(path,actual,sha)
    return json.loads(raw)
b=pinned(P/'whole-house-service-baseline.json','2d8f7243fb87d350763f2bca3d103b89b9d14b7d')
c=pinned(P/'cooker-capture-modes.json','8d64b4a4c63b9da580d632ad03236262f73e73b2')
h=pinned(P.parent.parent/'had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52')
assert b['air']['selectedNormalLps']==78 and len(b['supply'])==6
assert [(x['id'],x['measuredEquivalentAreaRequired']) for x in b['supply']]==[(x,15000) for x in ['study','living','bed2','bed3','bed4','principal']]
assert [(x['id'],x['normalLps']) for x in b['extract']]==[(x,13) for x in ['ground-WC','utility','kitchen','rear-bath','family-bath','principal-bath']]
assert b['air']['transfer']['minimumFinishedFreeArea']==7600
assert b['air']['fanChoice']['selectedDevelopmentFamily'].find('CF1')>=0
assert h['servicesInterface']['cooker']['makeupPoint']==[12000,8600,2400]
assert c['successorCompatibility']['proposedMakeup']['point']==[12000,8700,2400]
nodes=['study','living','bed2','bed3','bed4','principal','upperRing','hall','kitchen','guestWC','utility','rearBath','familyBath','principalBath']
vents=['study','living','bed2','bed3','bed4','principal']
extract=['guestWC','utility','kitchen','rearBath','familyBath','principalBath']
# One source-joined contracted topology: upper protected ring is a common node,
# not a free outdoor inlet. Actual living/kitchen OPEN arches have no separate
# door loss and are contracted into their adjacent excluded galleries. West/east
# classified crosses and bedroom/wet-room closed leaves remain distinct.
# Each 7600 is the inherited *required finished area*, not certified fire kit.
# 90000 on the open protected ring/stair is an intentionally generous
# pressure-loss control, not a measured area or an open protected boundary.
edges=[('study','hall',7600,'study E20 door'),
 ('living','hall',7600,'FD-WEST-CROSS after contracted open living arch'),
 ('bed2','upperRing',7600,'BED2 door'),('bed3','upperRing',7600,'BED3 door'),
 ('bed4','upperRing',7600,'BED4 door'),('principal','upperRing',7600,'PRINCIPAL door'),
 ('bed4','rearBath',7600,'rear ensuite door from BED4; normally-closed transfer proxy'),('upperRing','familyBath',7600,'FAMILY-BATH door'),
 ('principal','principalBath',7600,'principal ensuite door from PRINCIPAL; normally-closed transfer proxy'),
 ('upperRing','hall',90000,'open protected stair/galleries control'),
 ('hall','guestWC',7600,'guest WC door'),('hall','utility',7600,'protected plant E20 door; downstream utility open arch'),
 ('hall','kitchen',7600,'FD-EAST-CROSS before contracted open kitchen arch')]
assert {x['id'] for x in b['air']['transfer']['doors']}.issuperset({'FD-WEST-CROSS','FD-EAST-CROSS','BED2','BED3','BED4','PRINCIPAL','STUDY'})
def flow(area,dp):return .61*area/1000*math.copysign(math.sqrt(2*abs(dp)/1.2),dp)
def solve(mask,kitchen_target=None):
    p={n:-4.5 for n in nodes}
    if kitchen_target is not None:p['kitchen']=kitchen_target
    duties={n:13+3*bool(mask&(1<<i)) for i,n in enumerate(extract)}
    def balance(n,v):
        r=flow(15000,-v) if n in vents else -duties[n] if n in extract else 0
        for a,z,area,_ in edges:
            if n==a:r-=flow(area,v-p[z])
            if n==z:r+=flow(area,p[a]-v)
        return r
    free=[n for n in nodes if n!='kitchen' or kitchen_target is None]
    for iterations in range(3000):
        change=0
        for n in nodes:
            if n=='kitchen' and kitchen_target is not None:continue
            lo,hi=-150.,150.
            for _ in range(52):
                mid=(lo+hi)/2
                if balance(n,mid)>0:lo=mid
                else:hi=mid
            v=(lo+hi)/2;change=max(change,abs(v-p[n]));p[n]=v
        if change<1e-10:break
    def residuals():return [balance(n,p[n]) for n in free]
    def linear(a,z):
        a=[row[:] for row in a];z=z[:];n=len(z)
        for j in range(n):
            pivot=max(range(j,n),key=lambda i:abs(a[i][j]))
            assert abs(a[pivot][j])>1e-12,(mask,j)
            a[j],a[pivot]=a[pivot],a[j];z[j],z[pivot]=z[pivot],z[j]
            for i in range(j+1,n):
                f=a[i][j]/a[j][j]
                for k in range(j,n):a[i][k]-=f*a[j][k]
                z[i]-=f*z[j]
        x=[0.]*n
        for j in range(n-1,-1,-1):x[j]=(z[j]-sum(a[j][k]*x[k] for k in range(j+1,n)))/a[j][j]
        return x
    for _ in range(80):
        f=residuals();err=max(abs(x) for x in f)
        if err<1e-7:break
        jac=[];eps=1e-5
        for col,n in enumerate(free):
            p[n]+=eps;f1=residuals();p[n]-=eps
            jac.append([(f1[i]-f[i])/eps for i in range(len(f))])
        step=linear([[jac[j][i] for j in range(len(f))] for i in range(len(f))],[-v for v in f])
        old=[p[n] for n in free]
        for damp in [1,.5,.25,.125,.0625,.03125,.015625,.0078125]:
            for n,v,s in zip(free,old,step):p[n]=v+damp*s
            if max(abs(x) for x in residuals())<err:break
        else:raise AssertionError(('Newton line search',mask,err))
    residual=max(abs(x) for x in residuals())
    assert residual<1e-6,(mask,residual)
    supply={n:flow(15000,-p[n]) for n in vents}
    transfer=flow(7600,p['hall']-p['kitchen'])
    return {'mask':mask,'localExtractLps':duties,'nodePa':p,'roomSupplyLps':supply,
      'totalHabitableInletLps':sum(supply.values()),'hallToKitchenLps':transfer,
      'maxMassResidualLps':residual,'iterations':iterations+1}
normal_off=solve(0)
boost_off=solve(63)
assert abs(normal_off['totalHabitableInletLps']-78)<1e-6
assert abs(boost_off['totalHabitableInletLps']-96)<1e-6
cases=[]
# Passive monotone branches mean raising any local fan duty cannot increase
# other-room pressure or reduce the hood's necessary direct makeup at fixed
# kitchen target. Compare the componentwise normal and all-boost endpoints;
# kitchen-only boost is an explicit intermediate control.
for mask in [0,4,63]:
    row=solve(mask,-4.5)
    row['cookerModes']={name:{'hoodLps':q,'requiredDirectMakeupLps':q+row['localExtractLps']['kitchen']-row['hallToKitchenLps'],
       'totalExteriorLps':row['totalHabitableInletLps']+q+row['localExtractLps']['kitchen']-row['hallToKitchenLps']}
       for name,q in [('publishedLow',125/3.6),('publishedBEP',160/3.6),('publishedHigh',224/3.6),('upperSensitivity',70)]}
    for m in row['cookerModes'].values():
        assert abs(m['totalExteriorLps']-sum(row['localExtractLps'].values())-m['hoodLps'])<1e-6
    cases.append(row)
fan_node={'ground-WC':'guestWC','utility':'utility','kitchen':'kitchen','rear-bath':'rearBath','family-bath':'familyBath','principal-bath':'principalBath'}
fan_screens=[]
for label,row,mask in [('normalHoodOff',normal_off,0),('allBoostHoodOff',boost_off,63),
                       ('normalHoodOn',cases[0],0),('allBoostHoodOn',cases[-1],63)]:
    vals=[]
    for e in b['extract']:
        q=13+3*bool(mask&(1<<extract.index(fan_node[e['id']])))
        duct=e['normalResistanceScreen']['ductTerminalPa']*(q/13)**2
        vals.append({'id':e['id'],'roomDepressionPa':-row['nodePa'][fan_node[e['id']]],
          'authoredScaledDuctPa':duct,'roomPlusDuctPa':-row['nodePa'][fan_node[e['id']]]+duct})
    fan_screens.append({'state':label,'rows':vals,'maximumPa':max(x['roomPlusDuctPa'] for x in vals),
      'qualification':'20Pa published normal backpressure evidence is not a16L/s boost curve. K/Darcy scaled duct is authored sensitivity, not measured configured pressure.'})
full_300=c['successorCompatibility']['pressureNetwork']['governing']['fullOpenMakeupAt4_5PaLps']
def full_flow(d,free_fraction=.75):
    a=math.pi*(d/1000)**2/4
    k=1/(.61*free_fraction*a)**2+(2+.03*.6/(d/1000))/a**2
    return 1000*math.sqrt(2*4.5/(1.2*k))
assert abs(full_flow(300)-full_300)<1e-8
port_controls=[]
for bore,centre,formed,face in [(300,8700,450,500),(350,8725,500,550),(400,8750,550,600)]:
    assert bore+2*(50+1)+48<=formed
    assert centre-face/2==8450 and 8450-8424.5==25.5
    assert centre+face/2<=9050
    rings=[]
    for o in h['openings']['GROUND']:
        if o['wall']!='outer-east':continue
        lo=o['centre']-o['width']/2-215;hi=o['centre']+o['width']/2+215
        reserve=max(lo-(centre+formed/2),(centre-formed/2)-hi)
        assert reserve>=25,(bore,o['id'],reserve)
        rings.append({'id':o['id'],'completeArchRingHorizontalReserveMM':reserve})
    port_controls.append({'clearBoreMM':bore,'centreY':centre,'formedTerritoryMM':formed,
      'completeInsulatedJacketODMM':bore+102,'faceMM':face,'rearJunctionFaceReserveMM':25.5,
      'cleanFullOpenAtMinus4_5PaLps':full_flow(bore),'archRingChecks':rings,
      'condition':'Along-wall screen only; complete terminal, damper cartridge, platform, structural/rebar/weather/acoustic/thermal/fire and first release remain unjoined.'})
release=c['interfaces']['makeupFirstRelease']
assert release['innerBox']==[11170.5,8450,400,500]
assert release['equipmentTerritory']==[10145.5,8467.5,750,1100]
assert h['groundFurniture']['cold-storage']==[10920.5,9025,650,650]
def overlap(a,z):return a[0]<z[0]+z[2] and a[0]+a[2]>z[0] and a[1]<z[1]+z[3] and a[1]+a[3]>z[1]
# These are maximum *candidate* equipment envelopes, not the dimensions of a
# qualified product. The 502 body is already larger than the inherited box.
body=[11020.5,8499,550,502]  # 550 axial depth is a required maximum to qualify
withdrawn=[10670.5,8499,550,502]
floor_lift=[10550,8375,750,626]
old_platform=release['equipmentTerritory']
storage=h['groundFurniture']['cold-storage']
assert not overlap(body,storage) and body[1]+body[3]==9001
assert storage[1]-(body[1]+body[3])==24
assert overlap(floor_lift,old_platform) and not overlap(floor_lift,storage)
assert overlap(floor_lift,withdrawn)
assert storage[1]-(floor_lift[1]+floor_lift[3])==24
assert not overlap([10200-300,8750-300,600,600],floor_lift)
assert floor_lift[0]-(10200+300)==50
for name,box in h['groundFurniture'].items():
    assert not overlap(floor_lift,box),('floor lift versus furniture',name)
    cx,cy=10200,8750;x,y,w,d=box
    assert math.hypot(max(x-cx,cx-x-w,0),max(y-cy,cy-y-d,0))>=300,('operator versus furniture',name)
release_screen={'inheritedBoxMM':release['innerBox'],'inheritedPlatformMM':old_platform,
 'candidateBodyMaximumPlanMM':body,'candidateWithdrawnPlanMM':withdrawn,
 'candidateFloorLiftMaximumPlanMM':floor_lift,'operatorDiscPlanCentreMM':[10200,8750],
 'operatorDiscRadiusMM':300,'liftToOperatorPlanGapMM':50,
 'northColdStorageGapMM':24,'inheritedPlatformVersusFloorLiftCollision':True,
 'bodyVersusInheritedBoxCannotFit':True,
 'bodyCentreZMM':2400,'completeBodyVerticalBandMM':[2149,2651],
 'requiredStagedRoute':'With module fixed, isolate and prove safe; establish independently rated structural suspension and support connected spool/lead. From a separately qualified task position disconnect clamps and lead, cap and protect weather/thermal/acoustic/fire boundary. Transfer full module load to the independent suspension before removing the old platform. Enter the qualified floor lift (plan no larger than the stated candidate), translate the supported complete body350mm west without relying on hood or duct, cradle and lower to an actual exit route. Renew seals, controls and screen as complete replaceable constituents; reassemble and test.',
 'gate':'No real 400 modulating cartridge, full axial/actuator/tool envelope, rated support/lift/attachment, loads and human access, vertical lowering sweep, cold-storage height, structural/rebar and complete boundary detail is proved. The24mm storage gap and old-platform collision reject an unstaged drop-in assembly. Product or occurrence redesign is required if any complete envelope exceeds this conditional maximum.'}
worst=max(cases,key=lambda r:r['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'])
assert worst['mask']==63
terminal_sensitivity={str(d):{str(f):full_flow(d,f) for f in [.75,.5,.375]} for d in [300,350,400]}
boost_required=worst['cookerModes']['upperSensitivity']['requiredDirectMakeupLps']
assert terminal_sensitivity['300']['0.75']<boost_required
assert terminal_sensitivity['350']['0.5']<boost_required
assert terminal_sensitivity['400']['0.5']>boost_required
assert terminal_sensitivity['400']['0.375']<boost_required
nominal_old=2866.8;nominal_h700=2441
factor_old=(35/50)**1.32;factor_h700=(35/50)**1.34
candidate=[9675,11370.5,1050,200]
for name,box in h['groundFurniture'].items():
    x,y,w,d=box;a,z,cw,cd=candidate
    assert not (x<a+cw and x+w>a and y<z+cd and y+d>z),(name,box)
window=next(x for x in h['openings']['GROUND'] if x['id']=='north-window-4')
assert window['centre']==10200 and window['width']==1000 and window['sill']==1050
assert candidate[0]>=9700-25 and candidate[0]+candidate[2]<=10750-25
for name,box in h['groundFurniture'].items():
    x,y,w,d=box;a,z,cw,cd=candidate
    swept=[a,z-200,cw,cd+200]
    assert not (x<swept[0]+swept[2] and x+w>swept[0] and y<swept[1]+swept[3] and y+d>swept[1]),('renewal',name,box)
for name,box in h['groundFurniture'].items():
    x,y,w,d=box;cx,cy=10200,10800
    dx=max(x-cx,cx-x-w,0);dy=max(y-cy,cy-y-d,0)
    assert math.hypot(dx,dy)>=325,('handler',name,box)
heat={'existingKitchenBudgetW':950,'existingEmitter60_50W':nominal_old*factor_old,
 'H700L900Delta50W':nominal_h700,'H700L900At60_50W':nominal_h700*factor_h700,
 'H700CorrectionExponent':1.34,'existingH600CorrectionExponent':1.32,
 'combinedAt60_50W':nominal_old*factor_old+nominal_h700*factor_h700,
 'combinedAt65_55W':nominal_old*(40/50)**1.32+nominal_h700*(40/50)**1.34,
 'H700CompletePlan':candidate,'bottomZ':100,'topZ':800,
 'cillUndersideMinimumFor50LiftPlus50Reserve':900,
 'dryMassKg':60.77*.9,'filledMassKg':(60.77+11.37)*.9,
 'renewal':'Complete body sweeps200south and50up without another HAD furniture overlap. R300 floor handler at10200/10800 has≥25 gap to every actual furniture box. Actual cill underside, valves, wall fixings, stable handling and IAS export still qualify.',
 'normalLocalAt70KitchenScreenW':950+30*cases[0]['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'],
 'allBoostAt70KitchenScreenW':950+30*worst['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'],
 'allBoostWholeHouseAt25KW':(220+1.2*(96+70))*25,
 'allBoostWholeHouseAt30KW':(220+1.2*(96+70))*30,
 'net12kWArithmeticMarginAllBoostW':12000-(220+1.2*(96+70))*25,
 'net12kWAt30KMarginW':12000-(220+1.2*(96+70))*30,
 'net14kWAt30KMarginW':14000-(220+1.2*(96+70))*30,
 'normalAt30KitchenScreenW':950*30/25+36*cases[0]['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'],
 'allBoostAt30KitchenScreenW':950*30/25+36*worst['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'],
 'combinedAt70_60W':nominal_old*(45/50)**1.32+nominal_h700*(45/50)**1.34,
 'waterAndGlycolFlowLps':{str(power):{'secondaryWater5K':power/(4.18*5),'primaryGlycol5K':power/(3.2*5),'secondaryWater10K':power/(4.18*10),'primaryGlycol10K':power/(3.2*10)} for power in [12,14]},
 'condition':'Inherited950W is an allocation, not measured room loss. 65/55 is an unselected higher-water-temperature comparison; net12kW delivered at that temperature after defrost/HX loss, all-room output and hydraulics need a new connected contract.'}
assert heat['allBoostAt70KitchenScreenW']>heat['combinedAt60_50W']
out={'status':'Connected equivalent-area failure screen; no topology/fire, product, installed airflow, thermal or material admission.',
 'source':{'startingMain':'50a3d1d77db9dbc5d1e4bcbe631e0154cee7430c','baseAir':['project/mat/studies/whole-house-service-baseline.json','2d8f7243fb87d350763f2bca3d103b89b9d14b7d'],'cookerSuccessor':['project/mat/studies/cooker-capture-modes.json','8d64b4a4c63b9da580d632ad03236262f73e73b2'],'HAD':['project/had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52']},
 'nodes':nodes,'edges':[{'from':a,'to':z,'finishedEquivalentAreaMM2':area,'sourceRole':role} for a,z,area,role in edges],
 'roomInletsMM2':{n:15000 for n in vents},'localMode':'Six Titon local fans each13 normal or authored16 boost. Mask bits order '+','.join(extract),
 'normalHoodOff':normal_off,'allBoostHoodOff':boost_off,'hoodOnAtKitchenMinus4_5Pa':cases,
 'localFanPressureScreens':fan_screens,
 'fullOpenAtMinus4_5PaLps':{str(d):full_flow(d) for d in [300,350,400]},'terminalFreeFractionSensitivityAtMinus4_5PaLps':terminal_sensitivity,'portControls':port_controls,
 'fourHundredFirstRelease':release_screen,'worstCase':worst,'heat':heat,
 'limits':'The actual living/kitchen open arches are contracted into adjacent excluded galleries, not assigned a closed-door loss. The open ring/stair 90000 control is generous, not measured. Rear/principal ensuite paths correctly join their bedrooms, with 7600 normally-closed transfer proxies; actual doors are not listed in HAD protectedRoute and their closure/flow roles need checking. The protected plant E20 door remains a7600 path even though utility beyond it is an open arch. This contracted room/arch topology is not an exact physical door inventory. Closed/fire door paths and individual15k EA terminals are source requirements, not certified product curves. Componentwise normal/all-boost exhaust endpoints bound intermediate boost modes in this monotone passive network; actual fan curves and control modes still need matching. 13L/s equal room share is preference, not statutory per-room minimum. Fan pressure/capture, acoustic/fire and material approvals require whole installed proof. No additional infiltration or cooking heat credited.'}
txt=json.dumps(out,indent=2,ensure_ascii=False)+'\n';target=P/'connected-cooker-network.json'
if '--check' in sys.argv:assert target.read_text()==txt,'stale connected cooker result'
else:target.write_text(txt)
print(json.dumps({'hoodOffNormalSupply':normal_off['totalHabitableInletLps'],
 'hoodOnNormalMakeup':cases[0]['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'],
 'hoodOnBoostMakeup':worst['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'],
 'full300':full_300,'maxResidual':max(r['maxMassResidualLps'] for r in cases)}))
