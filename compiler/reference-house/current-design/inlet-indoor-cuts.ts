/** Ordinary indoor isolation in the actual freed Utility west bay.
 * Project envelopes are NOT a factory assembly, material admission or a pipe-stress solve. */
import { segmentDistance, segmentBoxDistance, pointRectDistance } from '../../../project/had/studies/service-interface-geometry.mjs'

type Point = readonly [number, number, number]
type Plan = readonly [number, number, number, number]
type Box = readonly [number, number, number, number, number, number]
export type IndoorCutInputs = {
  roomPlanMm: Plan; washerPlanMm: Plan; washerHeightMm: number; washerFirstRestPlanMm: Plan
  maintenancePlanMm: Plan; maintenanceTopMm: number; nominalCeilingMm: number
  utilitySourcePathMm: readonly Point[]; plantSourcePathMm: readonly Point[]; plantTransferStartMm: Point
  bankXMm: number; bankYMm: number; utilityAxisZMm: number; plantAxisZMm: number
  utilityDutyLmin: number; plantDutyLmin: number; maximumTotalGaugeBar: number
}
export const indoorCutProductEvidence = {
  accessed: '2026-11-21',
  bellows: { model: 'Spirax Sarco BSA6T DN25 PN40, metal seat; on/off only',
    technicalRevision: 'TI-P137-18 CMGT Issue15, pp2,4,5,10,16; PDF SHA256 da348814a1f8c2a464bea0caac89a1310500a73c56c47df27787ebee6baac0ec',
    installationRevision: 'IM-P137-02 CMGT Issue18, sections3,6',
    technicalUrl: 'https://content.spiraxsarco.com/-/media/spiraxsarco/international/documents/en/ti/bsat_bsa-ti-p137-18-en.ashx?rev=97eb6d9d6bf84649a5291682e5f4b781',
    installationUrl: 'https://content.spiraxsarco.com/-/media/spiraxsarco/international/documents/en/im/bsa-im-p137-02-en.ashx?rev=e2301d3b866a411f90814a67b1ad645a',
    faceMm:160, axisToTopMm:217, wheelDiameterMm:125, approximateKg:6, fullOpenKvM3h:12,
    manufacturerPreferredStem:'vertical-up', permissibleOnOffDifferential:'limited to PMO; not the separate2bar throttling duty',
    actualPotableQualification:false, actualWholeConstituentQualification:false,
    knownConstituents:['stainless body/bonnet/seat/disc/bellows/stem','pressed-steel wheel','graphite packing','graphite/stainless bonnet gasket'],
    unresolvedConstituents:['graphite binder and gasket manufacture','supplied coatings and lubricants','specified maintenance grease/molybdenum compound','matching flange gaskets/tails'],
    excluded:'Optional R-PTFE soft seat; unavailable DN25 flat-disc BSA3 is not invented.' },
  ordinaryPotable: { model:'Pegler PB350EL28 DN25, item254245',
    url:'https://aalberts-ips.co.uk/products/item/254245/',
    listedCatalogueKg:.78, connectionLengthEachMm:49, declaredPressureBar:16,
    knownConstituents:['CW602N DZR brass','PTFE ball seats','FPM/FKM spindle seal','blue handle sleeve, composition undisclosed'],
    greaseFree:false, manufacturerPotableApplication:true,
    exact28MmCertificateVerified:false,
    certificateLimit:'Live NSF page lists PB35025420328mm but PB350EL only15/22mm; do not borrow that certification for254245.',
    defaultMaterialPolicyDisposition:'excluded without explicit owner exception; no exception proposed or approved',
    valveBodySelection:false },
  existingStop:{model:'Conex S70128', disposition:'Retain prior PTFE/EPDM adverse comparison; not selected by concealment or familiarity.'},
  decision:'Reserve an accessible two-cut bank with a bounded envelope; do not select the industrial valve merely because the ordinary potable alternative contains polymers. Actual product/material duty remains unresolved.'
} as const

const length=(a:Point,b:Point)=>Math.hypot(...a.map((v,i)=>v-b[i]))
const segments=(p:readonly Point[])=>p.slice(1).map((b,i)=>({a:p[i],b,index:i,lengthMm:length(p[i],b)}))
const planBox=(p:Plan,z:number,h:number):Box=>[p[0],p[1],z,p[2],p[3],h]
const finite=(a:readonly number[])=>a.every(Number.isFinite)

export function inletIndoorCuts(i:IndoorCutInputs) {
  if(![i.roomPlanMm,i.washerPlanMm,i.washerFirstRestPlanMm,i.maintenancePlanMm].every(p=>p.length===4&&finite(p)&&p[2]>0&&p[3]>0)
    ||!finite([i.bankXMm,i.bankYMm,i.utilityAxisZMm,i.plantAxisZMm,i.nominalCeilingMm,i.utilityDutyLmin,i.plantDutyLmin,i.maximumTotalGaugeBar])
    ||i.utilitySourcePathMm.length!==7||i.plantSourcePathMm.length!==16
    ||![...i.utilitySourcePathMm,...i.plantSourcePathMm,i.plantTransferStartMm].every(p=>p.length===3&&finite(p))
    ||i.utilityAxisZMm<700||i.plantAxisZMm>1800||i.plantAxisZMm<=i.utilityAxisZMm
    ||i.maximumTotalGaugeBar<=0||i.maximumTotalGaugeBar>10||i.utilityDutyLmin<18||i.plantDutyLmin<44)
    throw new Error('Unsupported actual occupied-room indoor-cut input')
  const [west,south,width,depth]=i.roomPlanMm,east=west+width,north=south+depth,
    x=i.bankXMm,y=i.bankYMm,setting=10,pipeOD=28.1,metalWallMinimum=1.02,jacketR=(pipeOD+50+2)/2,
    // Authored envelope:160 face; each side68 tail +10 flange working separation +42 elbow take-off.
    // These dimensions reserve a challenge, not a matched EPDM press adaptor or free pipe flex.
    halfSpan=80+68+10+42,westLeg=x-halfSpan,eastLeg=x+halfSpan,
    utilitySource=i.utilitySourcePathMm[5],plantSource=i.plantSourcePathMm[5],
    utilityEnd=i.utilitySourcePathMm[6],uSouth=y-375,pSouth=y-225,
    utilityReturnTop=2850,plantReturnTop=2910,plantIncomingZ=2475,
    utilityReturnDrop=utilityEnd[0]-140,
    routes=[{id:'utility',axisZMm:i.utilityAxisZMm,dutyLmin:i.utilityDutyLmin,
      points:[utilitySource,[westLeg,utilitySource[1],utilitySource[2]],[westLeg,uSouth,utilitySource[2]],
        [westLeg,uSouth,i.utilityAxisZMm],[westLeg,y,i.utilityAxisZMm],[eastLeg,y,i.utilityAxisZMm],
        [eastLeg,uSouth,i.utilityAxisZMm],[eastLeg,uSouth,utilityReturnTop],
        [utilityReturnDrop,uSouth,utilityReturnTop],[utilityReturnDrop,uSouth,utilityEnd[2]],
        [utilityReturnDrop,utilityEnd[1],utilityEnd[2]],utilityEnd] as Point[]},
      {id:'plant',axisZMm:i.plantAxisZMm,dutyLmin:i.plantDutyLmin,
      points:[plantSource,[plantSource[0],plantSource[1],plantIncomingZ],
        [i.plantTransferStartMm[0],plantSource[1],plantIncomingZ],[i.plantTransferStartMm[0],utilitySource[1],plantIncomingZ],
        [westLeg,utilitySource[1],plantIncomingZ],[westLeg,pSouth,plantIncomingZ],
        [westLeg,pSouth,i.plantAxisZMm],[westLeg,y,i.plantAxisZMm],[eastLeg,y,i.plantAxisZMm],
        [eastLeg,pSouth,i.plantAxisZMm],[eastLeg,pSouth,plantReturnTop],
        [eastLeg,i.plantTransferStartMm[1],plantReturnTop],[i.plantTransferStartMm[0],i.plantTransferStartMm[1],plantReturnTop],i.plantTransferStartMm] as Point[]}],
    operator=[x+70,y+375] as const,renewalOperator=[x+70,y+225] as const,
    operatorR=300,shoulderZ=1450,armRadius=30,reach=650,
    obstacles=[{id:'washer',box:planBox(i.washerPlanMm,0,i.washerHeightMm)},
      {id:'washer-first-rest',box:planBox(i.washerFirstRestPlanMm,0,i.washerHeightMm)},
      {id:'complete-utility-maintenance',box:planBox(i.maintenancePlanMm,0,i.maintenanceTopMm)}],
    bodyChecks=[operator,renewalOperator].map((p,index)=>({id:index?'cold-renewal':'ordinary-close',centreXYMm:p,
      afterSettingMm:{west:p[0]-west-operatorR-setting,east:east-p[0]-operatorR-setting,
        south:p[1]-south-operatorR-setting,north:north-p[1]-operatorR-setting,
        washer:pointRectDistance(p,i.washerPlanMm)-operatorR-setting,
        washerFirstRest:pointRectDistance(p,i.washerFirstRestPlanMm)-operatorR-setting,
        maintenance:pointRectDistance(p,i.maintenancePlanMm)-operatorR-setting}})),
    valves=routes.map(r=>{
      const z=r.axisZMm,body:Box=[x-80,y-80,z-80,160,160,297],
        //217 is axis-to-top (manufacturer drawing visually inspected); wheel-centre position remains unqualified.
        // The project reserves wheel centres137..217 above the axis and checks both extremes.
        grips=[137,217].flatMap(h=>[30,60,90,120,150].map(deg=>{
          const a=deg*Math.PI/180,p:Point=[x+62.5*Math.cos(a),y+62.5*Math.sin(a),z+h],s:Point=[...operator,shoulderZ]
          return{angleDeg:deg,wheelAboveAxisMm:h,pointMm:p,reachMm:length(s,p),
            obstacleAfterArmAndSettingMm:Math.min(...obstacles.map(o=>segmentBoxDistance(s,p,o.box)))-armRadius-setting}
        })),
        withdrawalMm=275,withdrawn:Box=[body[0],body[1]-withdrawalMm,body[2],body[3],body[4]+withdrawalMm,body[5]],
        withdrawals=obstacles.map(o=>({id:o.id,afterSettingMm:Math.hypot(...[0,1,2].map(k=>Math.max(o.box[k]-withdrawn[k]-withdrawn[k+3],withdrawn[k]-o.box[k]-o.box[k+3],0)))-setting}))
      return{id:'HAD/indoor-cut/'+r.id,branch:r.id,centreMm:[x,y,z],bodyEnvelopeMm:body,
        fullTailElbowAxisSpanMm:2*halfSpan,wheelAboveAxisComparisonMm:[137,217],grips,
        maximumGripReachMm:Math.max(...grips.map(g=>g.reachMm)),
        firstMovement:{kind:'whole-valve-south-withdrawal-after-cold-tail-cut-and-supported-flange-release',translationMm:[0,-withdrawalMm,0],sweptBodyMm:withdrawn,
          firstRestCentreMm:[x,y-withdrawalMm,z],perObstacle:withdrawals,
          inPlaceBonnetWithdrawalClaimed:false,zeroRetreatOrPipeFlexCredited:false,
          requiredTailReleaseEachMm:10,tailReleaseMechanismQualified:false,
          sequence:['Close independent Lodge cut and house-side/store sources; drain both directions and prove atmospheric pressure.',
            'Independently retain fixed pipe, each flange half and complete valve; remove insulation and support cold-cut tails before severing.',
            'Create two actual10mm face release movements with supported disconnected tails; never pull retained pipe or pretend a stopped coupling is a union.',
            'Release all bolts and seals, support the whole valve on capture, translate275mm south to an independent positive first rest; sibling branch stays supported.',
            'Renew at the rest/bench, replace exact seals/tails and reinstate with matched cold connections; flush, pressure-test, inspect and dry before charging.'],
          actualToolsCuttingDeburringJointingAndLoadedCaptureQualified:false},
        nominalEmptyValveComparatorKg:6,actualCompletedPayloadKg:null,
        fullyOpenValveLossBar:(r.dutyLmin*.06/12)**2,
        pressureThrustAtClearBoreN:i.maximumTotalGaugeBar*1e5*Math.PI*((pipeOD-2*metalWallMinimum)/1000)**2/4}
    }),
    routeChecks=routes.map(r=>{
      const ss=segments(r.points),corners=r.points.slice(1,-1),
        obstacle=obstacles.map(o=>({id:o.id,pipeAfterSettingMm:Math.min(...ss.map(s=>segmentBoxDistance(s.a,s.b,o.box)))-jacketR-setting,
          cornerAfterSettingMm:Math.min(...corners.map(p=>segmentBoxDistance(p,p,o.box)))-jacketR-42-setting})),
        inside=ss.flatMap(s=>[s.a,s.b]).map(p=>Math.min(p[0]-west,east-p[0],p[1]-south,north-p[1],p[2],i.nominalCeilingMm-p[2])-jacketR-setting)
      return{id:r.id,pathMm:r.points,centrelineLengthMm:ss.reduce((n,s)=>n+s.lengthMm,0),
        shortestLegMm:Math.min(...ss.map(s=>s.lengthMm)),minimumStraightCornerTakeoffReserveMm:Math.min(...ss.map(s=>s.lengthMm))-84,
        minimumWallFloorCeilingPipeAfterSettingMm:Math.min(...inside),obstacle,
        joints:'All corners are actual bounded factory-elbow/tail interfaces;42mm take-off is a PROJECT envelope, not a substitute R75 or R98 bend approval.',
        fullPipeInsulationJacketMm:2*jacketR,actualFactoryFittingInsulationSupportAndRenewalQualified:false}
    }),
    pair=segments(routes[0].points).flatMap(a=>segments(routes[1].points).map(b=>({utilitySegment:a.index,plantSegment:b.index,
      pipeAfterTwoSettingsMm:segmentDistance(a.a,a.b,b.a,b.b)-2*jacketR-2*setting}))).sort((a,b)=>a.pipeAfterTwoSettingsMm-b.pipeAfterTwoSettingsMm),
    failures=[...bodyChecks.flatMap(b=>Object.entries(b.afterSettingMm).filter(([,v])=>v<0).map(([k])=>b.id+'/'+k)),
      ...valves.filter(v=>v.maximumGripReachMm>reach||v.grips.some(g=>g.obstacleAfterArmAndSettingMm<0)).map(v=>v.id+'/reach'),
      ...routeChecks.filter(r=>r.minimumWallFloorCeilingPipeAfterSettingMm<0||r.minimumStraightCornerTakeoffReserveMm<0||r.obstacle.some(o=>o.pipeAfterSettingMm<0||o.cornerAfterSettingMm<0)).map(r=>r.id+'/route'),
      ...(pair[0].pipeAfterTwoSettingsMm<0?['independent-route-collision']:[])]
  return{schema:'had-ordinary-indoor-cuts/1',state:'unadopted-occupied-bank-comparison',datum:'Source occupied house nominal groundFFL0; no raised530 ground translation or sourceSTR load admission.',
    productEvidence:indoorCutProductEvidence,roomPlanMm:i.roomPlanMm,authored:{bankXMm:x,bankYMm:y,utilityAxisZMm:i.utilityAxisZMm,plantAxisZMm:i.plantAxisZMm},
    operator:{bodyRadiusMm:operatorR,shoulderZMm:shoulderZ,armCapsuleRadiusMm:armRadius,reachLimitMm:reach,bodyChecks,
      wheelUse:'North30..150degree grip sector with repeated release/regrip; no single360degree arm sweep or physical strength guarantee.'},valves,routeChecks,nearestIndependentRoute:pair[0],
    topology:{utility:['Lodge/U','retained Utility source splice','independent indoor U cut','retained cold terminal','washer and separate cold pillar tap'],
      plant:['Lodge/P','retained Plant source splice','independent indoor P cut','candidate Plant transfer','Plant/cold tree/store'],
      noSharedIndoorHeader:true,oldUtilityDirectVerticalMustBeRemoved:[utilitySource,utilityEnd],
      oldPlantContinuationMustBeRemoved:i.plantSourcePathMm.slice(5),
      noBackfeedProtectionInvented:true,plantHotSideStoreIsolationStillRequired:true,
      sourceFaultEnvelopeChanged:false,storedReleaseLimitedByTheseValves:false,actualPlantDownstreamTreeConnectionQualified:false},
    support:{loadPath:'Separate pipe/valve receivers on actual service-spine masonry; no pan, walking cover, washer, sink or shield-frame support credited.',
      pipeColdJointsAndFixedSlidingGuidesQualified:false,actualMasonryReceiversAndResistanceQualified:false,
      valveMinimumReferenceGravityN:12*9.81,completeDeadLoadKg:null,
      thermalDomainC:[0,40],copperExpansionMmPerMAt40K:.017*40,
      fullyRestrainedStraightCopperAxialReferenceN:117200*Math.PI/4*(28.1**2-(28.1-2*1.02)**2)*.000017*40,
      thermalComparison:'Free expansion and completely locked straight-tube references are distinct; actual elbows/guides/anchors require pipe flexibility and contact analysis.',
      loadedRestAndTemporaryEquipmentFloorActionsQualified:false},
    necessaryEnvelopeScreen:failures.length===0,diagnostics:failures,
    connectedWasherRestAccessQualified:false,westStandingPointIsNotAnApproachOrEscapePath:true,
    fullOrdinaryIsolationArrangementQualified:false,selectedProduct:false,installedAcceptance:false}
}

type EntryInputs={roomPlanMm:Plan;portalXMm:readonly[number,number];wallFacesYMm:readonly[number,number];
  jambFinishMm:number;shieldPlaneXMm:number;washerFirstRestMm:Plan;maintenancePlanMm:Plan;
  maintenanceTopMm:number;operatorXYZMm:Point;frameCoversMm:readonly Box[];bankXMm:number;bankYMm:number;
  utilityAxisZMm:number;plantAxisZMm:number;maintenanceShiftXMm:number;wheelInboardMm:number;
  utilityLmin:number;plantLmin:number;maximumGaugeBar:number}
const signedBoxGap=(a:Box,b:Box)=>{
  const gaps=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));
  return gaps.some(g=>g>0)?Math.hypot(...gaps.map(g=>Math.max(g,0))):Math.max(...gaps)
}
/** A doorway-operated alternative to the rejected west standing-point argument.
 * Its serialisable choices and source geometry are explicit; no incumbent fixture is silently moved. */
export function inletEntrySideCuts(i:EntryInputs){
  if(![i.roomPlanMm,i.portalXMm,i.wallFacesYMm,i.washerFirstRestMm,i.maintenancePlanMm,i.operatorXYZMm,...i.frameCoversMm].every(finite)
    ||!finite([i.bankXMm,i.bankYMm,i.utilityAxisZMm,i.plantAxisZMm,i.maintenanceShiftXMm,i.wheelInboardMm,i.maximumGaugeBar])
    ||i.portalXMm[1]<=i.portalXMm[0]||i.wallFacesYMm[1]<=i.wallFacesYMm[0]||i.wheelInboardMm<0||i.wheelInboardMm>80
    ||i.utilityAxisZMm<700||i.plantAxisZMm<=i.utilityAxisZMm||i.plantAxisZMm>2300||i.maximumGaugeBar<=0||i.maximumGaugeBar>10)
    throw Error('Unsupported entry-side indoor-cut envelope')
  const [west,south,width]=i.roomPlanMm,east=west+width,north=i.wallFacesYMm[0],setting=10,
    jamb=[i.portalXMm[0]+i.jambFinishMm,i.portalXMm[1]-i.jambFinishMm],
    // The same300mm body/650mm reach control is retained. This point is IN the open doorway,
    // reachable from the lobby without passing the washer first rest.
    body=i.operatorXYZMm,approach:Point[]=[[body[0],i.wallFacesYMm[1]+243,body[2]],body],bodyR=300,armR=30,
    leftWall:Box=[west,i.wallFacesYMm[0],0,jamb[0]-west,i.wallFacesYMm[1]-north,3100],
    rightWall:Box=[jamb[1],north,0,east-jamb[1],i.wallFacesYMm[1]-north,3100],
    sourceMaintenance=i.maintenancePlanMm,candidateMaintenance:Plan=[sourceMaintenance[0]+i.maintenanceShiftXMm,sourceMaintenance[1],sourceMaintenance[2],sourceMaintenance[3]],
    maintenanceBox=planBox(candidateMaintenance,0,i.maintenanceTopMm),sourceMaintenanceBox=planBox(sourceMaintenance,0,i.maintenanceTopMm),
    restBox=planBox(i.washerFirstRestMm,0,848),
    door={hingeMm:[jamb[0],i.wallFacesYMm[1]],leafWidthMm:jamb[1]-jamb[0],leafThicknessComparisonMm:60,
      openNorthBoxMm:[jamb[0]-30,i.wallFacesYMm[1],0,60,jamb[1]-jamb[0],2300] as Box,
      closedBoxMm:[jamb[0],i.wallFacesYMm[1]-30,0,jamb[1]-jamb[0],60,2300] as Box,
      actualWetDoorLeafFrameIronmongeryAndRatingsQualified:false},
    approachWalls=Math.min(...approach.slice(1).flatMap((p,k)=>[leftWall,rightWall,door.openNorthBoxMm].map(b=>segmentBoxDistance(approach[k],p,b))))-bodyR-setting,
    approachRest=Math.min(...approach.slice(1).map((p,k)=>segmentBoxDistance(approach[k],p,planBox(i.washerFirstRestMm,0,2000))))-bodyR-setting,
    // All-overlapping-height body/rest test deliberately retains a full-body proxy for path connectivity.
    approachShield=i.shieldPlaneXMm-body[0]-bodyR-setting,
    valves=[{id:'utility',z:i.utilityAxisZMm,q:i.utilityLmin},{id:'plant',z:i.plantAxisZMm,q:i.plantLmin}].map(v=>{
      const x=i.bankXMm,y=i.bankYMm,z=v.z,
        // DN25 PN40 flange115 + unchanged25mm insulation +1mm jacket each side.
        bodyBox:Box=[x-83.5,y-83.5,z-106,167,167,212],
        // B217 is the visually checked axis-to-outer-top dimension. Inboard wheel-plane width is
        // an authored admission envelope, not a factory dimension inferred by scaling the picture.
        stemBox:Box=[x-217,y-62.5,z-62.5,217,125,125],
        grips=[0,i.wheelInboardMm].flatMap(inboard=>[-15,0,15].map(deg=>{
          const a=deg*Math.PI/180,up=v.id==='utility'?1:-1,
            p:Point=[x-217+inboard,y+62.5*Math.sin(a),z+up*62.5*Math.cos(a)],
            wall=Math.min(...[leftWall,rightWall].map(w=>segmentBoxDistance(body,p,w)))-armR-setting,
            sourceRest=segmentBoxDistance(body,p,restBox)-armR-setting
          return{pointMm:p,inboardMm:inboard,regripAngleDeg:deg,reachMm:length(body,p),wallAfterArmSettingMm:wall,washerRestAfterArmSettingMm:sourceRest}
        })),
        coverGap=Math.min(...i.frameCoversMm.map(c=>Math.min(signedBoxGap(bodyBox,c),signedBoxGap(stemBox,c))))-setting,
        // Body replacement uses actual separate vertical10mm flange-release movements; the valve
        // then leaves west. Fixed tails do not flex and no stopped coupling becomes a union.
        withdrawnBody:Box=[x-217-275,y-83.5,z-106,300.5+275,167,212],
        sourceGap=Math.min(signedBoxGap(bodyBox,sourceMaintenanceBox),signedBoxGap(stemBox,sourceMaintenanceBox))-setting,
        candidateGap=Math.min(signedBoxGap(bodyBox,maintenanceBox),signedBoxGap(stemBox,maintenanceBox))-setting
      return{id:'HAD/entry-indoor-cut/'+v.id,branch:v.id,axisMm:[x,y,z],flowAxis:'vertical',stem:'horizontal-west',
        insulatedValveBodyEnvelopeMm:bodyBox,stemWheelEnvelopeMm:stemBox,
        tailElbowVirtualCornersMm:[[x,y,z-200],[x,y,z+200]],
        minimumSourceMaintenanceAfterSettingMm:sourceGap,minimumMovedMaintenanceAfterSettingMm:candidateGap,
        minimumFixedFrameCoverAfterSettingMm:coverGap,grips,maximumGripReachMm:Math.max(...grips.map(g=>g.reachMm)),
        wallNorthAfterSettingMm:north-y-83.5-setting,wallEastAfterSettingMm:east-x-83.5-setting,
        actualWheelCentreFitsAuthoredEnvelopeVerified:false,actualProductAndFactoryTailsSelected:false,
        fullyOpenKv12ComparisonLossBar:(v.q*.06/12)**2,
        branchHydraulicBudgetInterpretation:'Charge this valve, new pipe, bends and rise inside the existing network allowance; never add an invented fresh pressure budget or change the Lodge fault bound.',
        replacement:{releaseEachFlangeMm:10,firstTranslationMm:[-275,0,0],wholeValveSweepMm:withdrawnBody,
          firstRestAxisMm:[x-275,y,z],actualCaptureAndRestCapacityQualified:false,
          actualTailReleaseToolsAndReinstatementQualified:false,
          isolatedColdCutAndReplaceTailsRequired:true,zeroRetreatOrPipeFlexCredited:false,
          plannedRoomState:'Washer home, maintenance equipment absent; independent Lodge and store/house-side isolation, zero pressure, sibling support and AC/PV isolation as applicable. This is planned renewal, never manual fault-response credit.'},
        nominalValveKg:6,actualCompletedPayloadKg:null,actualGravityCentroidMm:null,
        knownGravityN:6*9.81,pressureCutClearBoreComparisonN:i.maximumGaugeBar*1e5*Math.PI*(.02606**2)/4,
        receivingPathQualified:false}
    }),
    bodyFailures=valves.flatMap(v=>[['maintenance',v.minimumMovedMaintenanceAfterSettingMm],['frame-cover',v.minimumFixedFrameCoverAfterSettingMm],['north',v.wallNorthAfterSettingMm],['east',v.wallEastAfterSettingMm]].filter(([,n])=>(n as number)<0).map(([k])=>v.branch+'/'+k)),
    reachFailures=valves.filter(v=>v.maximumGripReachMm>650||v.grips.some(g=>g.wallAfterArmSettingMm<0||g.washerRestAfterArmSettingMm<0)).map(v=>v.branch+'/ordinary-reach'),
    failures=[...bodyFailures,...reachFailures,...(approachWalls<0?['doorway-connected-body-route']:[]),...(approachRest<0?['occupied-washer-rest-approach']:[]),...(approachShield<0?['dry-shield-approach']:[])]
  return{schema:'had-entry-side-indoor-cuts/1',state:'unadopted-project-envelope',
    coordinateDatum:'Actual occupied house nominal groundFFL0; no530 translation or native structural input adoption.',
    authoredChoices:{bankXMm:i.bankXMm,bankYMm:i.bankYMm,utilityAxisZMm:i.utilityAxisZMm,plantAxisZMm:i.plantAxisZMm,maintenanceShiftXMm:i.maintenanceShiftXMm,wheelInboardMm:i.wheelInboardMm},
    exactRoomPlanMm:i.roomPlanMm,rawPortalXMm:i.portalXMm,finishedJambXMm:jamb,door,
    ordinaryOperator:{bodyRadiusMm:bodyR,armRadiusMm:armR,reachLimitMm:650,shoulderMm:body,approachMm:approach,
      connectedWallAndOpenLeafAfterSettingMm:approachWalls,occupiedWasherRestAfterSettingMm:approachRest,dryShieldAfterSettingMm:approachShield,
      passDoesNotProvideSourceFaultContainmentOrManualResponseTime:true,closedDoorControlClaimed:false,
      regrip:'Repeated30degree grip sector; physical grip/torque and wheel engagement remain unqualified.'},
    sourceMaintenancePlanMm:sourceMaintenance,candidateMaintenancePlanMm:candidateMaintenance,
    sameCompleteMaintenanceFieldSizePreserved:true,actualRelocatedRatedEquipmentAndHeadHandlingQualified:false,
    valves,productEvidence:indoorCutProductEvidence,
    majorShieldRenewal:'The current200mm opposed-nut/tool comparison can meet this bank. Remove/retain the affected isolated valve module on its independent receiver before major frame backing-plate work; actual all-part tool and capture sweeps remain required. Ordinary valve operation does not remove the shield.',
    sourceAndBackfeed:{twoIndependentBranchesRetained:true,noCommonHeaderOrInterconnection:true,sourceFaultAperturesAnd327LminEnvelopeChanged:false,
      houseSideStoreAndUpperNetworkReleaseBounded:false,permanentBypassAllowed:false},
    hydraulicAndThermal:{fullIndependentPipeReroutesAuthored:false,extraRunBendsElevationAndInstalledKvQualified:false,
      full25MmPipeInsulationAnd1MmJacketRetained:true,wholeBankFrostAndCondensationProofQualified:false},
    support:{newKnownValveGravityN:12*9.81,totalBankAndPipeMassKg:null,actualCentroidsAndWrenches:null,
      pressureThermalDeadAndTemporaryLoadReceiversQualified:false,
      path:'Independent metal valve/tail bearers → actual east-wall masonry receiver → its ground/grid/foundation path; no pan, shield, case, washer or floor-cover support credited.'},
    necessaryOrdinaryOperationEnvelopeScreen:failures.length===0,diagnostics:failures,
    selectedProduct:false,fullOccupiedArrangementComplete:false,installedAcceptance:false}
}
