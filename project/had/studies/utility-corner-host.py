"""Compiler-consumed Utility host geometry at the actual native SE return.
Reuse existing IAS members/sweep/body methods; never solve the finite house.
"""
from __future__ import annotations
import copy,hashlib,importlib.util,json,math,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def calculate(request):
    sources={}
    def read(path):
        raw=(ROOT/path).read_bytes();sources[path]=hashlib.sha256(raw).hexdigest();return json.loads(raw)
    path=ROOT/'project/ias/studies/utility-host-revised-route.py'
    spec=importlib.util.spec_from_file_location('actual_utility_host',path);host=importlib.util.module_from_spec(spec);spec.loader.exec_module(host)
    sources['project/ias/studies/utility-host-revised-route.py']=hashlib.sha256(path.read_bytes()).hexdigest()
    base=read('project/ias/studies/utility-host-revised-route.json');house=read('project/had/studies/water-replan.json')['model'];actual=read('project/had/studies/current-house-services.json')['utility']
    native=request['geometry'];lining=request['liningThicknessMm']
    if native['cornerId']!='SE' or native['caseAccepted'] is not False or not 140<=native['widthMm']<=240 or lining!=27:raise ValueError('Same native SE geometry and bound27mm lining required')
    core=[[r[0]-lining,r[1]-lining,r[2]+lining,r[3]+lining] for r in native['rectanglesXYMm']];east=min(r[0] for r in core if r[3]>1000)
    seats=base['floorAndWall']['seatPlan'];shift=5*math.ceil(max(0,max(r[0]+r[2] for r in seats)-east+20)/5)
    move=lambda b,x=-shift,y=0:host.shifted(b,[x,y,0])
    geo=base['geometry'];frame={k:move(v) for k,v in geo['frame'].items()};washer=actual['washerReservation'];bar=frame['temporary carry bar']
    bar_extra=5*math.ceil(max(0,washer[0]+washer[2]+30-bar[0])/5);frame['temporary carry bar']=move(bar,bar_extra)
    carrier={k:move(v) for k,v in geo['carrier'].items()}
    inlet=read('project/had/studies/south-inlet-under-sill.json');terminal=next(b for b in inlet['branches'] if b['id']=='utility')['coordinates'][-1]
    if request['waterTerminalLocalMm']!=terminal or terminal[1]!=1250 or terminal[2]!=1000:raise ValueError('Actual fixed Utility downstream terminal required')
    water_shift=10800-terminal[0]
    for key in ('lower pipe arm','middle pipe arm','valve reaction arm'):
        b=geo['carrier'][key];carrier[key]=[b[0]-water_shift,b[1],b[2],b[3]+water_shift-shift,b[4],b[5]]
    carrier['water fitting and cap domain']=move(geo['carrier']['water fitting and cap domain'],-water_shift)
    temporary=copy.deepcopy(geo['temporarySupport']);temporary['upper pipe restraint beam'][0]-=water_shift;temporary['upper pipe restraint beam'][3]+=water_shift
    receiver=temporary['lower receiving beam'];receiver[0]-=shift;receiver[3]+=shift
    temporary['wall restraint beam'][3]=east-temporary['wall restraint beam'][0];temporary['retained wall connection domain'][0]=east-15

    profile=request.get('carrierChoice');carrier_engineering=None
    if profile is not None:
        if profile.get('schema')!='had-utility-cold-carrier/1' or profile.get('postSectionMm')!=[40,40,5] or profile.get('frameLegSectionMm')!=[40,40,5] or profile.get('mastSectionMm')!=[50,50,5]:raise ValueError('Actual40mm carrier/frame and50mm mast sections required')
        if any(not isinstance(profile.get(k),(int,float)) or not math.isfinite(profile[k]) or profile[k]<=0 for k in ('minimumPostIMm4','minimumPostAreaMm2','minimumFrameLegIMm4','minimumMastIMm4','postHeightMm','maximumCompleteCapturedKg','toolCoupleNm','maximumMovementMm','stressCeilingMpa')):raise ValueError('Finite actual member/capture design domain required')
        post_x=terminal[0]+profile['postOffsetFromTerminalXYMm'][0];post_y=terminal[1]+profile['postOffsetFromTerminalXYMm'][1]
        carrier['compact carrier post']=[post_x,post_y,profile['postBottomMm'],40,40,profile['postHeightMm']]
        for key in ('lower pipe arm','middle pipe arm','valve reaction arm'):
            arm=carrier[key]
            carrier[key]=[arm[0],post_y+25,arm[2],arm[3],20,20]
            carrier[key+'/actual NS knee']=[terminal[0]-10,post_y+35,arm[2],20,terminal[1]-post_y-25,20]
        temporary['lower receiving beam']=profile['receiverBoxMm']
        temporary['mast base']=profile['mastBaseMm']
        temporary['mast']=[profile['mastPlanMm'][0],profile['mastPlanMm'][1],6,50,50,profile['mastTopMm']-6]
        temporary['upper pipe restraint beam']=[terminal[0],1235,profile['upperBeamBottomMm'],profile['mastPlanMm'][0]+25-terminal[0],30,40]
        # Real RC contact is behind27mm renewable lining; the wall brace uses
        # a separate diagonal leg into the declared within-core plate territory.
        core_x=min(r[0] for r in native['rectanglesXYMm'] if r[3]>1000)
        temporary['wall restraint beam']=[profile['mastPlanMm'][0]+25,1135,profile['upperBeamBottomMm'],core_x-profile['mastPlanMm'][0]-25,130,30]
        temporary['actual core plate']=[core_x-8,profile['corePlateYMm'][0],profile['upperBeamBottomMm']-25,8,profile['corePlateYMm'][1]-profile['corePlateYMm'][0],100]
        temporary['wall brace NS return']=[core_x-30,profile['corePlateYMm'][0]+25,profile['upperBeamBottomMm'],30,1135-profile['corePlateYMm'][0],30]
        del temporary['retained wall connection domain']
        E=193000.;I=profile['minimumPostIMm4'];If=profile['minimumFrameLegIMm4'];A=profile['minimumPostAreaMm2']
        pressure=request.get('maximumGaugeBar',9.2);bore=22.1-2*.9
        H=pressure*1e5*math.pi*(bore/1000)**2/4;V=profile['maximumCompleteCapturedKg']*9.81;M=profile['toolCoupleNm']*1000
        lp=450.;lf=300.;ecc=175.
        joint_moment=H*lp+V*ecc+M
        dp=H*lp**3/(3*E*I)+(V*ecc+M)*lp**2/(2*E*I)
        df=H*lf**3/(3*E*If)+joint_moment*lf**2/(2*E*If)
        rotation=H*lf**2/(2*E*If)+joint_moment*lf/(E*If)
        move_bound=dp+df+rotation*lp
        stress=max((H*750+V*ecc+M)*20/If+V/A,joint_moment*20/I+V/A)
        sharp_I=(40**4-30**4)/12;sharp_A=40**2-30**2
        mass=sharp_A/1e6*profile['postHeightMm']/1000*8000
        carrier_engineering={'schema':'had-actual40-carrier-preliminary-member/1','profile':profile,'actualCarrierOuterMm':[40,40],'wallMm':5,'actualPostSharpIdealIMm4':sharp_I,'minimumRequiredIMm4':I,'actualPostSharpIdealAreaMm2':sharp_A,'minimumRequiredAreaMm2':A,'postNominalSharpSectionMassKg':mass,'maximumGaugeBar':pressure,'maximumPressureThrustN':H,'capturedGravityN':V,'fullCouplingToolCoupleNm':profile['toolCoupleNm'],'postAndSingleFrameLegSerialMovementBoundMm':move_bound,'maximumCombinedMemberStressMpa':stress,'necessaryPreliminaryMemberScreen':I<=sharp_I and If<=sharp_I and A<=sharp_A and move_bound<=profile['maximumMovementMm'] and stress<=profile['stressCeilingMpa'],'actualJointAnchorAndCastReceiverCapacitiesAccepted':False,'normalGravitySeatAndMountRemovedBeforeDrop':True,'actualCapturedScrewJackRequired':{'strokeMm':profile['temporaryCapturedJackStrokeMm'],'ratedMinimumN':profile['temporaryCapturedJackRatedN'],'initialSupportTopMm':profile['postBottomMm'],'finalSupportTopMm':profile['postBottomMm']-profile['temporaryCapturedJackStrokeMm'],'pressureAndEnergyZeroBeforeLowering':True,'actualProductAndMountingQualified':False},'original20Geometry40ComparisonTransferred':False,'nativeActionsAdopted':False}

    receiver=temporary['lower receiving beam']
    pipes={'retained upper water and cap domain':move(geo['retainedPipes']['retained upper water and cap domain'],-water_shift),'retained accessible waste cap domain':move(geo['retainedPipes']['retained accessible waste cap domain'],-shift,20 if shift else 0)}
    pads=copy.deepcopy(geo['firstRestPads']);stored=copy.deepcopy(geo['smallPartsReceiverDomain']);states=base['states'];carrier_states=states['carrier'];frame_states=copy.deepcopy(states['frame']);west=200-shift
    if west<0:raise ValueError('Existing first rest cannot be reached from this compacted host')
    frame_states[-2][0]=-west;frame_states[-1][0]=-west
    if profile is not None:carrier_states=[[0,0,0],[0,0,-profile['temporaryCapturedJackStrokeMm']],[265,0,-profile['temporaryCapturedJackStrokeMm']]]
    parked={k:host.shifted(v,carrier_states[-1]) for k,v in carrier.items()}
    foreign={k:[v[0],v[1],0,v[2],v[3],3500] for k,v in house['groundFurniture'].items() if k not in ('service-utility-sink','service-utility-valveBay')};foreign['service-utility-washer']=[*washer[:2],0,*washer[2:],3500]
    for key,box in house['fixedObstacles']['GROUND']:foreign[key]=[*box[:2],0,*box[2:],3500]
    for key in ('stair','court'):
        box=house[key];foreign[key]=[*box[:2],0,*box[2:],3500]
    for index,r in enumerate(core):foreign['actual-SE-lining/'+str(index)]=[r[0],r[1],0,r[2]-r[0],r[3]-r[1],3500]
    foreign['east wall']=[11570.5,0,0,500,2500,3500];foreign['north wall']=[9300,2453,0,2700,194,3500]
    other_temp={k:v for k,v in temporary.items() if k!='lower receiving beam'};carrier_foreign=foreign|frame|pipes|pads|stored|other_temp;static=foreign|temporary|pipes|parked|stored
    carrier_check=host.minimum_sweep(carrier,carrier_states,carrier_foreign);frame_check=host.minimum_sweep(frame,frame_states,static);cap_check=host.minimum_sweep(frame,frame_states,{'low waste cap':pipes['retained accessible waste cap domain']});pad_approach=host.minimum_sweep(frame,frame_states[:-1],pads)
    pad_check=min((host.box_gap(pad,o),name,key) for name,pad in pads.items() for key,o in static.items());post_sweep=host.sweep(carrier['compact carrier post'],*carrier_states[1:])
    supported=post_sweep[2]==receiver[2]+receiver[5] and all(receiver[i]<=post_sweep[i] and post_sweep[i]+post_sweep[i+3]<=receiver[i]+receiver[i+3] for i in (0,1))
    no_receiver_interpenetration=all(not host.overlaps_interior(host.sweep(v,a,b),receiver) for a,b in zip(carrier_states,carrier_states[1:]) for v in carrier.values())
    grips_shift=-shift+bar_extra;crew_paths=[[[path[0][0]+grips_shift,1725],[path[0][0]+grips_shift,2075],[path[0][0]+grips_shift-west,2075]] for path in states['crew']];crew=host.crew_checks(crew_paths,frame,static|pads)
    grip_reach=[max(math.dist([x+grips_shift,1725,1050],[grip+grips_shift,1350,780+rise]) for rise in (0,35)) for x,grip in [(10395,10800),(11045,11495)]]
    carrier_grip_point=[post_x+20,post_y+40,700] if profile is not None else [10915-shift,1225,700]
    carrier_grip=max(math.dist([11045+grips_shift,1725,profile['carrierGuideShoulderHeightMm'] if profile is not None else 1000],host.shifted(carrier_grip_point,offset)) for offset in carrier_states)
    seat_plans=[[r[0]-shift,*r[1:]] for r in seats];seat_core_reserve=min(east-(r[0]+r[2])-20 for r in seat_plans);sink=move([*actual['sink'][:2],0,*actual['sink'][2:],900]);south=max(r[3] for r in core if r[2]-r[0]>500)
    branch=[10050,south+20.5,east-20.5-10050,1400-south-20.5];chase=[branch[0],branch[1],branch[2],700-branch[1]]
    internal_carrier_gap=host.box_gap(carrier['compact carrier post'],carrier['water fitting and cap domain']);terminal_in_cap=all(pipes['retained upper water and cap domain'][i]<=terminal[i]<=pipes['retained upper water and cap domain'][i]+pipes['retained upper water and cap domain'][i+3] for i in (0,1,2))
    good=internal_carrier_gap>=25 and terminal_in_cap and min(carrier_check['clearance'],frame_check['clearance'],pad_check[0],cap_check['clearance'])>=25 and pad_approach['clearance']>=5 and min(min(c['stationaryClearance'][0],c['relativeFrameClearance'][0]) for c in crew)>=25 and max(*grip_reach,carrier_grip)<650 and supported and no_receiver_interpenetration and seat_core_reserve>=0
    utility_join=None
    if 'utilityMainEnvelopes' in request:
        members=request['utilityMainEnvelopes']
        if not isinstance(members,list) or not members or len(members)>512:raise ValueError('Actual finite Utility main member envelopes required')
        main={}
        for row in members:
            if not isinstance(row,dict) or set(row)!=set(('id','boxMm')) or not isinstance(row['id'],str) or not row['id'] or row['id'] in main:raise ValueError('Actual unique Utility main member identity required')
            box=row['boxMm']
            if not isinstance(box,list) or len(box)!=6 or any(type(v) not in (int,float) or not math.isfinite(v) for v in box) or any(v<=0 for v in box[3:]):raise ValueError('Actual Utility main envelope required')
            main[row['id']]=box
        main_frame=host.minimum_sweep(frame,frame_states,main);main_carrier=host.minimum_sweep(carrier,carrier_states,main);main_crew=host.crew_checks(crew_paths,frame,main)
        nominal=min(main_frame['clearance'],main_carrier['clearance'],*(min(c['stationaryClearance'][0],c['relativeFrameClearance'][0]) for c in main_crew))
        utility_join={'actualMainEnvelopes':members,'frame':main_frame,'carrier':main_carrier,'crew':main_crew,
                      'minimumNominalGapMm':nominal,'afterTwoIndependent10mmSettingsMm':nominal-20,'afterExistingIAS25mmProjectGapMm':nominal-25,
                      'necessaryKnownNominalGeometry':nominal>=25 and nominal>=20,
                      'basis':'Same existing IAS box/sweep/person methods; full pipe jackets and chord covers supplied by the executed Utility route.25mm is the existing IAS project gap, not a new universal rule.',
                      'actualConnectionsAndCompleteInstalledHandlingAccepted':False}
    return {'schema':'had-utility-corner-host-result/1','actualCarrierEngineering':carrier_engineering,'independentUtilityMainJoin':utility_join,'sourceSHA256':sources,'nativeCornerGeometry':native,'sinkShiftWestMm':shift,'carryBarAdditionalEastMm':bar_extra,'fixedExistingFirstRestPreserved':True,'westDrawMm':west,
            'geometry':{'frame':frame,'carrier':carrier,'parkedCarrier':parked,'temporarySupport':temporary,'retainedPipes':pipes,'firstRestPads':pads,'smallPartsReceiverDomain':stored,'retainedObstacles':foreign},'states':{'carrier':carrier_states,'frame':frame_states,'crew':crew_paths},
            'checks':{'carrier':carrier_check,'frame':frame_check,'wasteCap':cap_check,'padApproach':pad_approach,'pads':pad_check,'carrierContinuouslySupported':supported,'receiverInterpenetrationAbsent':no_receiver_interpenetration,'crew':crew,'maxShoulderToFrameGrip':grip_reach,'maxShoulderToCarrierGrip':carrier_grip,'seatCoreReserveAfterTwoSettingsMm':seat_core_reserve,'internalCarrierBodyGapMm':internal_carrier_gap,'actualUtilityTerminalInRetainedCapDomain':terminal_in_cap},
            'revisedUtility':{'sink':[*sink[:2],*sink[3:5]],'seatPlan':seat_plans,'rearServiceChase':chase,'acquiredBranchFloor':branch,'actualUtilityTerminalLocalMm':terminal,'waterConnectionAxis':[10800-water_shift,1250,750],'retainedWasteCap':pipes['retained accessible waste cap domain'],'localWasherStopRetired':True,'ordinaryIsolation':'Use the actual independently operable Utility house cut; verify cold source/upper energy isolation before washer or host work. No live-sibling credit.','wholeRoomEnvelopeChanged':False},
            'necessaryGeometryComparisons':good,'legacyRenewalEvidenceApplicable':False,'physicalHandlingPressureMaterialAndSupportAccepted':False,
            'retainedLimits':['Actual matched connections/length, caps, captive disconnection and full first-release join require the named assembly.','Actual masses/centres, grips and loaded restraint remain unqualified.','Old750mm washer-stop operation and235mm valveBay/rack are retired; no live-sibling credit.','No prior mechanical, thermal, material or pressure approval is transferred.']}

if __name__=='__main__':json.dump(calculate(json.load(sys.stdin)),sys.stdout,allow_nan=False)
