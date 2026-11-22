/** Ordinary indoor isolation comparisons in the actual Utility room.
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
  utilityAxisZMm:number;plantAxisZMm:number;maintenanceShiftXMm:number;maintenanceShiftYMm:number;wheelInboardMm:number;
  utilityLmin:number;plantLmin:number;maximumGaugeBar:number;
  plantWall:{facesYMm:readonly[number,number];openingXMm:readonly[number,number]};
  retainedFurniture:Readonly<Record<string,Plan>>;protectedDoorOpenLeafMm:Plan;groundFflMm:number;doorHingeNorthOfWallMm:number}
const signedBoxGap=(a:Box,b:Box)=>{
  const gaps=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));
  return gaps.some(g=>g>0)?Math.hypot(...gaps.map(g=>Math.max(g,0))):Math.max(...gaps)
}
/** Continuous-event lower bounds: sampled relative speeds supply a Lipschitz
 * allowance, so a between-sample collision cannot hide behind a drawing. */
function wetDoorEvent(i:EntryInputs,jamb:readonly number[],paired:boolean){
  const y=i.wallFacesYMm[1]+i.doorHingeNorthOfWallMm,fullSpan=jamb[1]-jamb[0],meetingGap=paired?30:0,
    span=paired?(fullSpan-meetingGap)/2:fullSpan,step=Math.PI/1800,setting=10,bodyR=300,
    leafHalf=30,handleHalf=40,shoulderZ=1450,handleZ=1100,bodyX=10570,
    initialY=y+(paired?400:360),maxY=paired?3350:3780,travel=paired?450:850,
    wallHeight=3100,west=i.roomPlanMm[0],east=west+i.roomPlanMm[2],
    walls:Box[]=[
      [west,i.wallFacesYMm[0],0,jamb[0]-west,i.wallFacesYMm[1]-i.wallFacesYMm[0],wallHeight],
      [jamb[1],i.wallFacesYMm[0],0,east-jamb[1],i.wallFacesYMm[1]-i.wallFacesYMm[0],wallHeight],
      [west,i.plantWall.facesYMm[0],0,i.plantWall.openingXMm[0]+i.jambFinishMm-west,i.plantWall.facesYMm[1]-i.plantWall.facesYMm[0],wallHeight],
      [i.plantWall.openingXMm[1]-i.jambFinishMm,i.plantWall.facesYMm[0],0,east-i.plantWall.openingXMm[1]+i.jambFinishMm,i.plantWall.facesYMm[1]-i.plantWall.facesYMm[0],wallHeight]
    ],fixed=Object.entries(i.retainedFurniture).map(([id,p])=>({id,box:planBox(p,0,2000)})),
    protectedLeaf=planBox(i.protectedDoorOpenLeafMm,0,2000),restBox=planBox(i.washerFirstRestMm,0,848),
    hinge:Point=[jamb[0],y,0],parked:Box[]=[[jamb[0]-leafHalf,y,0,2*leafHalf,span,2300],
      ...(paired?[[jamb[1]-leafHalf,y,0,2*leafHalf,span,2300] as Box]:[])],
    phases=paired?[{id:'west-first',x:jamb[0],direction:1},{id:'east-second',x:jamb[1],direction:-1}]:[{id:'single',x:jamb[0],direction:1}],
    states=phases.flatMap((phase,phaseIndex)=>Array.from({length:901},(_,k)=>{
      const angle=k*step,h:Point=[phase.x,y,0],tip:Point=[phase.x+phase.direction*span*Math.cos(angle),y+span*Math.sin(angle),handleZ],
        handle:Point=[phase.x+phase.direction*(span-50)*Math.cos(angle),y+(span-50)*Math.sin(angle),handleZ],
        body:Point=[bodyX,Math.min(maxY,initialY+travel*Math.sin(angle)),shoulderZ],
        wall=Math.min(...walls.map(w=>segmentBoxDistance(body,body,w)))-bodyR-setting,
        furniture=Math.min(...fixed.map(f=>segmentBoxDistance([body[0],body[1],1000],[body[0],body[1],1000],f.box)))-bodyR-setting,
        leaf=segmentDistance([body[0],body[1],0],[body[0],body[1],0],[h[0],h[1],0],[tip[0],tip[1],0])-bodyR-leafHalf-setting,
        handleBody=Math.hypot(body[0]-handle[0],body[1]-handle[1])-bodyR-handleHalf-setting,
        protectedGap=segmentBoxDistance([h[0],h[1],1000],[tip[0],tip[1],1000],protectedLeaf)-leafHalf-setting,
        shield=i.shieldPlaneXMm-Math.max(h[0],tip[0])-leafHalf-setting,
        leafWalls=Math.min(...walls.map(w=>segmentBoxDistance([h[0],h[1],1000],[tip[0],tip[1],1000],w)))-leafHalf-setting,
        leafFurniture=Math.min(...fixed.map(f=>segmentBoxDistance([h[0],h[1],1000],[tip[0],tip[1],1000],f.box)))-leafHalf-setting,
        handleWalls=Math.min(...walls.map(w=>segmentBoxDistance(handle,handle,w)))-handleHalf-setting,
        rest=segmentBoxDistance([h[0],h[1],500],[tip[0],tip[1],500],restBox)-leafHalf-setting,
        sibling=paired?(phaseIndex===0
          ?segmentDistance([body[0],body[1],0],[body[0],body[1],0],[jamb[1]-span,y,0],[jamb[1],y,0])-bodyR-leafHalf-setting
          :segmentBoxDistance(body,body,parked[0])-bodyR-setting):Infinity
      return{phase:phase.id,angleDeg:k/10,hingeMm:h,bodyMm:body,handleMm:handle,tipMm:tip,reachMm:length(body,handle),wall,furniture,leaf,handleBody,protectedGap,shield,rest,leafWalls,leafFurniture,handleWalls,sibling}
    })),
    relativeError=(travel+Math.hypot(span,leafHalf))*step/2,bodyError=travel*step/2,leafError=Math.hypot(span,leafHalf)*step/2,
    minimum=(key:keyof typeof states[number],allowance:number)=>Math.min(...states.map(s=>s[key] as number))-allowance,
    bounds={wallBodyMm:minimum('wall',bodyError),fixedFurnitureBodyMm:minimum('furniture',bodyError),
      movingLeafBodyMm:minimum('leaf',relativeError),movingHandleBodyMm:minimum('handleBody',relativeError),
      parkedProtectedDoorMm:minimum('protectedGap',leafError),shieldMm:minimum('shield',leafError),
      occupiedWasherRestMm:minimum('rest',leafError),movingLeafWallMm:minimum('leafWalls',leafError),
      movingLeafFurnitureMm:minimum('leafFurniture',leafError),movingHandleWallMm:minimum('handleWalls',leafError),
      ...(paired?{stationarySiblingBodyMm:minimum('sibling',bodyError),
        // Full rectangular-leaf X extents; a capsule would incorrectly round their meeting ends.
        // West opens first against east CLOSED; east then opens against west PARKED.
        leafSiblingSeparatingXMm:Math.min(jamb[1]-span-jamb[0]-Math.hypot(span,leafHalf),
          jamb[1]-Math.hypot(span,leafHalf)-jamb[0]-leafHalf)-setting}:{}),
      maximumReachMm:Math.max(...states.map(s=>s.reachMm))+relativeError},
    after:Point[]=[states.at(-1)!.bodyMm,[bodyX,3250,shoulderZ],[i.operatorXYZMm[0],3200,shoulderZ],i.operatorXYZMm],
    approach:Point[]=[[9750,3200,shoulderZ],states[0].bodyMm],
    route=(path:Point[],parkedLeaves:Box[],rest:boolean)=>Math.min(...segments(path).flatMap(s=>[
      ...walls.map(w=>segmentBoxDistance(s.a,s.b,w)),
      ...fixed.map(f=>segmentBoxDistance([s.a[0],s.a[1],1000],[s.b[0],s.b[1],1000],f.box)),
      segmentBoxDistance(s.a,s.b,protectedLeaf),
      ...(rest?[segmentBoxDistance([s.a[0],s.a[1],1000],[s.b[0],s.b[1],1000],planBox(i.washerFirstRestMm,0,2000))]:[]),
      ...parkedLeaves.map(p=>segmentBoxDistance(s.a,s.b,p))
    ]))-bodyR-setting,
    beforeMm=route(approach,[],false),afterMm=route(after,parked,true),
    // Between phases the body reverses its central retreat with west parked/east still closed.
    phaseChangeMm=paired?Math.min(route([states[900].bodyMm,states[901].bodyMm],[parked[0]],true),initialY-y-bodyR-leafHalf-setting):null,
    diagnostics=[...Object.entries(bounds).filter(([k,v])=>k==='maximumReachMm'?v>650:v<0).map(([k])=>'wet-door/'+k),
      ...(beforeMm<0?['wet-door/connected-before']:[]),...(afterMm<0?['wet-door/connected-after']:[]),
      ...(phaseChangeMm!==null&&phaseChangeMm<0?['wet-door/connected-phase-change']:[])]
  return{id:'HAD/utility/wet-door',kind:paired?'paired-outward-north-west-then-east':'single-west-hinge-outward-north',hingeMm:hinge,
    rawOpeningMm:i.portalXMm[1]-i.portalXMm[0],finishedOpeningMm:fullSpan,projectLeafMm:[span,2300,60],
    leafCount:phases.length,meetingGapComparisonMm:meetingGap,meetingEdgesAstragalSealsAndHardwareQualified:false,
    hardwareProjectionComparisonMm:80,openingStopDeg:90,effectiveOpenClearComparisonMm:fullSpan-handleHalf*phases.length,
    no900FinishedClearClaim:true,openingClosingSamePathReversed:true,
    openingBodyAndHandleStates:states.filter((_s,k)=>k%50===0||k%901===900||k%901===0),continuousBoundsMm:bounds,
    sampling:{stepDeg:.1,executedStates:states.length,relativeSpeedUpperMmPerRadian:travel+Math.hypot(span,leafHalf),relativeDistanceAllowanceMm:relativeError},
    connectedBeforeMm:beforeMm,connectedAfterMm:afterMm,connectedPhaseChangeMm:phaseChangeMm,approachMm:approach,afterOpenPathMm:after,
    ordinaryBodyRmm:bodyR,ordinaryBodyTopMm:2000,reachLimitMm:650,parkedOpenLeafMm:parked[0],allParkedOpenLeavesMm:parked,
    assessmentScope:'Operator/handle and moving-leaf capsule checks against both actual wall openings, declared fixed furniture and occupied washer rest. Paired-leaf separation uses full rectangular X extents. Hinges/frame/seals and operating force remain unqualified.',
    hingeNorthOfWallMm:i.doorHingeNorthOfWallMm,hingeFrameProjectedLoadReceiverQualified:false,
    actualHingesJambReceiverMassAndResistanceQualified:false,actualWetSealsMeetingEdgesToeContainmentAndMaterialsQualified:false,
    noFloorTrackOrBuriedPocket:true,selectedAsDevelopmentDoor:false,
    necessaryDoorEventScreen:diagnostics.length===0,diagnostics,physicalDoorOrManualFaultResponseTimeQualified:false}
}
/** A doorway-operated alternative to the rejected west standing-point argument.
 * Its serialisable choices and source geometry are explicit; no incumbent fixture is silently moved. */
export function inletEntrySideCuts(i:EntryInputs){
  if(!i.plantWall||![i.plantWall.facesYMm,i.plantWall.openingXMm].every(p=>Array.isArray(p)&&p.length===2&&finite(p))
    ||!Array.isArray(i.protectedDoorOpenLeafMm)||!finite(i.protectedDoorOpenLeafMm)||!Number.isFinite(i.groundFflMm)||!Number.isFinite(i.doorHingeNorthOfWallMm)||i.doorHingeNorthOfWallMm < -30||i.doorHingeNorthOfWallMm>150
    ||![i.roomPlanMm,i.portalXMm,i.wallFacesYMm,i.washerFirstRestMm,i.maintenancePlanMm,i.operatorXYZMm,...i.frameCoversMm].every(finite)
    ||!finite([i.bankXMm,i.bankYMm,i.utilityAxisZMm,i.plantAxisZMm,i.maintenanceShiftXMm,i.maintenanceShiftYMm,i.wheelInboardMm,i.maximumGaugeBar])
    ||i.portalXMm[1]<=i.portalXMm[0]||i.wallFacesYMm[1]<=i.wallFacesYMm[0]||i.wheelInboardMm<0||i.wheelInboardMm>80
    ||i.utilityAxisZMm<700||i.plantAxisZMm<=i.utilityAxisZMm||i.plantAxisZMm>2300||i.maximumGaugeBar<=0||i.maximumGaugeBar>12)
    throw Error('Unsupported entry-side indoor-cut envelope')
  const [west,south,width]=i.roomPlanMm,east=west+width,north=i.wallFacesYMm[0],setting=10,
    jamb=[i.portalXMm[0]+i.jambFinishMm,i.portalXMm[1]-i.jambFinishMm],
    // The same300mm body/650mm reach control is retained. This point is IN the open doorway,
    // reachable from the lobby without passing the washer first rest.
    body=i.operatorXYZMm,approach:Point[]=[[body[0],i.wallFacesYMm[1]+243,body[2]],body],bodyR=300,armR=40,
    leftWall:Box=[west,i.wallFacesYMm[0],0,jamb[0]-west,i.wallFacesYMm[1]-north,3100],
    rightWall:Box=[jamb[1],north,0,east-jamb[1],i.wallFacesYMm[1]-north,3100],
    sourceMaintenance=i.maintenancePlanMm,candidateMaintenance:Plan=[sourceMaintenance[0]+i.maintenanceShiftXMm,sourceMaintenance[1]+i.maintenanceShiftYMm,sourceMaintenance[2],sourceMaintenance[3]],
    maintenanceBox=planBox(candidateMaintenance,0,i.maintenanceTopMm),sourceMaintenanceBox=planBox(sourceMaintenance,0,i.maintenanceTopMm),
    restBox=planBox(i.washerFirstRestMm,0,848),
    door=wetDoorEvent(i,jamb,true),
    singleLeaf=wetDoorEvent(i,jamb,false),
    approachWalls=Math.min(...approach.slice(1).flatMap((p,k)=>[leftWall,rightWall,...door.allParkedOpenLeavesMm].map(b=>segmentBoxDistance(approach[k],p,b))))-bodyR-setting,
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
    failures=[...bodyFailures,...reachFailures,...(approachWalls<0?['doorway-connected-body-route']:[]),...(approachRest<0?['occupied-washer-rest-approach']:[]),...(approachShield<0?['dry-shield-approach']:[]),...door.diagnostics]
  return{schema:'had-entry-side-indoor-cuts/2',state:'unadopted-project-envelope',
    coordinateDatum:'All geometry is relative to its actual occupied-groundFFL; the supplied saved ground stage maps explicit absolute coordinates without native structural adoption.',
    groundStage:{fflMm:i.groundFflMm,nominalSourceFflMm:0,absoluteValveAxesMm:valves.map(v=>[v.axisMm[0],v.axisMm[1],v.axisMm[2]+i.groundFflMm]),absoluteDoorHingeMm:[...door.hingeMm.slice(0,2),i.groundFflMm],adoptedInNativeStructure:false},
    authoredChoices:{bankXMm:i.bankXMm,bankYMm:i.bankYMm,utilityAxisZMm:i.utilityAxisZMm,plantAxisZMm:i.plantAxisZMm,maintenanceShiftXMm:i.maintenanceShiftXMm,maintenanceShiftYMm:i.maintenanceShiftYMm,wheelInboardMm:i.wheelInboardMm,doorHingeNorthOfWallMm:i.doorHingeNorthOfWallMm},
    exactRoomPlanMm:i.roomPlanMm,rawPortalXMm:i.portalXMm,finishedJambXMm:jamb,door,
    rejectedSingleLeafComparison:{hingeNorthOfWallMm:i.doorHingeNorthOfWallMm,continuousBoundsMm:singleLeaf.continuousBoundsMm,diagnostics:singleLeaf.diagnostics,selected:false},
    ordinaryOperator:{bodyRadiusMm:bodyR,armRadiusMm:armR,reachLimitMm:650,shoulderMm:body,approachMm:approach,
      connectedWallAndOpenLeafAfterSettingMm:approachWalls,occupiedWasherRestAfterSettingMm:approachRest,dryShieldAfterSettingMm:approachShield,
      passDoesNotProvideSourceFaultContainmentOrManualResponseTime:true,closedDoorControlClaimed:false,approachAssumesAlreadyOpenDoor:true,closedToOpenDoorOperatorRouteQualified:false,closedToOpenDoorGeometryScreen:door.necessaryDoorEventScreen,
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

/** Review view of the same executed comparison; pixels never own geometry. */
export function drawInletIndoorCuts(r:ReturnType<typeof inletEntrySideCuts>) {
  const room=r.exactRoomPlanMm,x0=room[0],y0=room[1],scale=.18,
    X=(x:number)=>45+(x-x0)*scale,Y=(y:number)=>720-(y-y0)*scale,
    rect=(p:readonly number[],fill:string,stroke='#625c50')=>`<rect x="${X(p[0])}" y="${Y(p[1]+p[3])}" width="${p[2]*scale}" height="${p[3]*scale}" fill="${fill}" stroke="${stroke}"/>`,
    line=(p:readonly (readonly number[])[],colour:string)=>`<polyline points="${p.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="3"/>`,
    text=(x:number,y:number,s:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`,
    hinge=r.door.hingeMm,tip=r.door.openingBodyAndHandleStates[0].tipMm,
    body=r.ordinaryOperator.shoulderMm
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1020" viewBox="0 0 1200 1020"><rect width="1200" height="1020" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">
${text(35,38,'Utility indoor isolation · one saved source-bound comparison',25)}
${text(35,72,'Unselected geometry. Door/reveal, full pipe routes, pressure/thermal supports and complete renewal remain open.')}
${rect(room,'#e2eae1')}${rect(r.sourceMaintenancePlanMm,'none','#b78e67')}${rect(r.candidateMaintenancePlanMm,'#ded3b5')}
${r.door.allParkedOpenLeavesMm.map(p=>rect([p[0],p[1],p[3],p[4]],'#9b7c54')).join('')}
${line([hinge,tip],'#a9865c')}${line(r.door.afterOpenPathMm,'#2e7c83')}${line(r.door.approachMm,'#496983')}
${r.door.openingBodyAndHandleStates.filter((_s,k)=>k%3===0).map(s=>`<circle cx="${X(s.bodyMm[0])}" cy="${Y(s.bodyMm[1])}" r="${300*scale}" fill="none" stroke="#9baeb0" stroke-width="1"/>`).join('')}
<circle cx="${X(body[0])}" cy="${Y(body[1])}" r="${300*scale}" fill="none" stroke="#25747c" stroke-width="3"/>
${r.valves.map(v=>`<circle cx="${X(v.axisMm[0])}" cy="${Y(v.axisMm[1])}" r="${83.5*scale}" fill="#bc9759" stroke="#755e38"/>${line([body,...v.grips.slice(0,1).map(g=>g.pointMm)],'#755e38')}`).join('')}
${text(505,150,`Geometry screen: ${r.necessaryOrdinaryOperationEnvelopeScreen?'within declared envelopes':'REJECTED'}`,20)}
${text(505,190,`Local bank XY ${r.authoredChoices.bankXMm}/${r.authoredChoices.bankYMm}mm.`)}
${text(505,230,`Valve local axes ${r.valves.map(v=>v.axisMm[2]).join(' / ')}mm above FFL.`)}
${text(505,270,`Saved ground FFL ${r.groundStage.fflMm}mm; absolute axes ${r.groundStage.absoluteValveAxesMm.map(p=>p[2]).join(' / ')}mm.`)}
${text(505,310,`Maximum reaches ${r.valves.map(v=>v.maximumGripReachMm.toFixed(2)).join(' / ')}mm; limit650.`)}
${text(505,350,`Complete field shift ${r.authoredChoices.maintenanceShiftXMm}/${r.authoredChoices.maintenanceShiftYMm}mm; size preserved.`)}
${text(505,390,`Finished opening ${r.door.finishedOpeningMm}mm; projected open-clear ${r.door.effectiveOpenClearComparisonMm}mm.`)}
${text(505,430,`Connected parked-leaf route reserve ${r.door.connectedAfterMm.toFixed(3)}mm.`)}
${text(505,470,'Conventional paired leaves; continuous sampled bound shown.')}
${text(505,510,'Actual frame/hinge/seals and support resistance unqualified.')}
${text(505,550,'Brown fields: original outline and moved full equipment field.')}
${text(505,590,'Blue paths/body circles: actual opening and cut approach.')}
${text(505,630,'Valve product/potable/whole-constituent admission unresolved.')}
${text(35,800,'Independent Utility20 / Plant45 L/min duties and Lodge restrictions remain. No source-fault response-time credit.',17)}
${text(35,840,'Two6kg valve references only:117.72N. Bank, pipe, pressure, thermal, capture and grid receivers remain unqualified.')}
${text(35,880,'Existing shield and shifted equipment field are retained candidates. No pan, shield or decorative cover supports the bank.')}
${text(35,920,'Ground translation is explicit geometry only; native structural forces and whole-house floor levels are not adopted.')}
${text(35,970,'HAD OPEN · common support, backfeed/store release, blocked/submerged drainage and occupied renewal remain unresolved.',17)}
</g></svg>`
}
