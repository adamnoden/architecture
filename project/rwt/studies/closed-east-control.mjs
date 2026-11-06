/** ONE current-source ordinary closed-metal control; not selected and not a generic drainage solver. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected,mouthFlow,mouthStage} from './selected-water-event.mjs';
const g=9.81,copper=8960;
export function mouthRewind(){
 const source=readSelected(),q=source.model.hydraulicProbe.assignedInwardRoofAndCourtLps;
 const ramp=source.model.model.courtEastWindow6850.cleaning.closedWalkingCoverReference.accessAdapter;
 const uniformRampUnderside=x=>ramp.courtEndZ+(x-ramp.plan[0])*(ramp.coverEndZ-ramp.courtEndZ)/ramp.plan[2]-ramp.deckThickness;
 const floor=y=>-30-(y-5750)*.04,remainingFraction=.75,lossK=1;
 const candidates=[550,600].map(northCoverLength=>{
  const grossSouth=7400-northCoverLength,wetSouth=grossSouth+11.5,intervals=[[wetSouth,7175],[7275,7375]];
  const cases=[.02,.03,.04].flatMap(n=>['upstream-depth','critical-depth'].map(depthRule=>{
   // Finite100mm actual approach, equivalent rectangle per actual credited interval.
   // These two prescribed depths expose dependence on where drawdown/localK occurs.
   // Neither depth rule solves a real rapidly varied entry or calibrates n/K.
   const atStage=z=>intervals.reduce((total,[a,b])=>{
    const width=(b-a)/1000*remainingFraction,upstreamDepth=(z-floor((a+b)/2))/1000;
    if(upstreamDepth<=0)return total;
    let lo=0,hi=mouthFlow(z,[[a,b]],{lossK,remainingFraction})/1000;
    for(let i=0;i<90;i++){
     const Q=(lo+hi)/2,depth=depthRule==='upstream-depth'?upstreamDepth:(Q*Q/(g*width*width))**(1/3);
     const velocity=Q/(width*depth),radius=width*depth/(width+2*depth),friction=1000*n*n*velocity*velocity/radius**(4/3)*.1;
     if(Q*1000<mouthFlow(z-friction,[[a,b]],{lossK,remainingFraction}))lo=Q;else hi=Q;
    }
    return total+(lo+hi)*500;
   },0);
   let lo=-60,hi=0;assert(atStage(lo)<q&&atStage(hi)>q);
   for(let i=0;i<90;i++){const z=(lo+hi)/2;if(atStage(z)<q)lo=z;else hi=z;}
   return {n,depthRule,quietCapacityLps:atStage(-35),requiredStageMm:(lo+hi)/2,quietReserveMm:-35-(lo+hi)/2};
  }));
  return {northCoverLength,southCoverLength:1100-northCoverLength,grossGutterY:[grossSouth,7400],
   wallMm:1.5,dryFlangeEachMm:10,wetGutterY:[wetSouth,7388.5],creditedIntervals:intervals,
   creditedWidth:7175-wetSouth+100,unchangedShadows:[[7175,7275],[7375,7400]],
   idealK1Remaining75CapacityLps:mouthFlow(-35,intervals,{lossK,remainingFraction}),
   idealK1Remaining75RequiredStageMm:mouthStage(q,intervals,{lossK,remainingFraction}),cases};
 });
 return {identity:'REJECTED finite600north/500south cover-boundary rewind',selectedGeometryChanged:false,accepted:false,
  source:source.blob,assignedLps:q,quiet:-35,catchmentUnchangedM2:60.0625,approachLengthMm:100,
  candidates,interpretation:'550 is the existing footprint with its dry strip used;600 is ONE further50mm boundary shift, not a selected enlargement. Constant upstream-depth and constant critical-depth friction are contrasting authored sensitivities, NOT rigorous installed bounds or actual hydraulic predictions. The latter retains an adverse failure; no physical pass follows from the former.',
  geometry:{well:[6125,6300,1525,1100],northCover:[305,600],southCover:[305,500],countEach:5,
   gateClearY:[6575,7225],capturedCrossingCentreY:6900,capturedCrossingY:[6600,7200],gateFrameReserves:[25,25],
   actualParkedWestLeafY:[7202.5,7242.5],parkedLeafReserve:2.5,weatherEntryY:[6550,7200],weatherEntryNorthReserve:0,
   disposition:'REJECTED as next control:600body at6900 has2.5 to real parked leaf and ZERO to weatherentry north, in addition to hydraulic uncertainty. Do not propagate600plans to HAD. Prefer a genuine collector/access recomposition using retained550covers.',
   change:'Keep ten covers and overallwell. Move north/south boundary6850→6800; widen wetpan/notch/offsetwestledge and low open guard extension to6800..7400. Wall/flange consumes11.5each; do not credit gross600 or hidden ramp/hinge/northfoot.',
   unchangedRamp:ramp.plan,declaredRampLipUnderside:ramp.lipUndersideZ,declaredRampQuietGap:20,hingeFoot:[6050,7197.5,50,50],
   rampProfileConflict:{uniformRampUndersideAtApproachStart:uniformRampUnderside(6025),uniformRampUndersideAtMouth:uniformRampUnderside(6125),
    uniformRampQuietCrossingX:ramp.plan[0]+(-35+ramp.deckThickness-ramp.courtEndZ)*ramp.plan[2]/(ramp.coverEndZ-ramp.courtEndZ),
    status:'Source also declares lipunderside−15. That requires a different longitudinal profile/landing. The under-ramp feed from beyond the purchased100mm strip and sidebeam is not proved by either mouth capacity screen. Preserve the contradiction; do not assume a calm reservoir across the whole west face.'},
   lowGuardInfillBottom:0,guardQuietGap:35,extraFloorFootCredited:false,
   windowBody:[7325,6850],windowRadius:300,windowBodyWest:7025,notchEast:6225,windowNotchEWGap:800,
   stairs:{plan:[6125,6600,600,600],candidateExplicitTreads:[[6125,6325,-260],[6325,6525,-440],[6525,6725,-620]],
    interpretation:'Explicit candidate reading of retained4×180rises/3×200goings; these solids were not already proved by the selected plan alone.',
    westPanMinimumUnderside:-151.5,firstTreadVerticalGap:108.5},
   coverMaximumLiftedTop:1700,rainRoofUnderside:1970,roofReserve:270,
   handling:'600grosscapturedplan leaves25each atgate, including ALL clips/retention within that envelope; no extra protrusion credit. More gutter/cover mass and actual strength, capture/release/transfer, neighbouringcovercrew and weather erection remain unproved. No handlift or old30kg budget pass is inherited.'},
  downstream:'The larger wetpan must be reprofiled to the one closed7175/7000outlet; neither extra rain area nor a second pipe is introduced. Shape, actual drawdown and localK/friction placement remain the finite inlet exit.',
  reconciliation:'Root review before any HAD adoption: water-replan owning westlip/approach/notch/gutter/guard, court-east-window ledges/covers/ramp, actual cover/handler masses, selected-water-event binding, dependent RWT drawings/values and applicable Services/STR/MAT references must regenerate together.'};
}
export function control(){
 const s=readSelected(),v=s.model,r=v.renewal,q=v.hydraulicProbe.assignedInwardRoofAndCourtLps;
 const tube={product:'Lawton TX1593/TX1596 TableX hard copper',OD:159,wall:2,nominalID:155,
  declaredODTolerance:.2,declaredOutOfRound:.7,declaredWallToleranceFraction:.15,
  maximumOutsideScreen:159.9,minimumInscribedBoreScreen:153.5,
  interpretation:'Conservative simultaneous tolerance envelope, not a delivered inspection certificate. Product is not declared an assembled rainwater system.'};
 const axis=x=>-775-(x-7550)*50/4250,slope=50/4250,D=tube.minimumInscribedBoreScreen/1000;
 const fittingAngle=Math.atan(slope),fittingCornerZ=axis(7175);
 const fittingHorizontal=[7175+303*Math.cos(fittingAngle),7000,fittingCornerZ-303*Math.sin(fittingAngle)];
 const fittingTop=[7175+303*Math.sin(fittingAngle),7000,fittingCornerZ+303*Math.cos(fittingAngle)];
 const collectorAxisX=7175+(-200-fittingCornerZ)*Math.tan(fittingAngle);
 const circle=(d,y)=>{const a=2*Math.acos(1-2*y/d),A=d*d*(a-Math.sin(a))/8,P=d*a/2;return{A,P,R:A/P,T:2*Math.sqrt(y*(d-y))};};
 const full=(d,n)=>Math.PI*d*d/4*(d/4)**(2/3)*Math.sqrt(slope)/n;
 const normal=(Q,n)=>{
  let a=1e-8,b=D/2;assert(Q<full(D,n)/2,'This finite half-full branch does not cover the assigned flow');
  for(let i=0;i<90;i++){const y=(a+b)/2,c=circle(D,y),f=c.A*c.R**(2/3)*Math.sqrt(slope)/n;if(f<Q)a=y;else b=y;}
  const y=(a+b)/2,c=circle(D,y),V=Q/c.A;
  return {depthMm:y*1000,velocityMps:V,froude:V/Math.sqrt(g*c.A/c.T),boundary:'Uniform ventilated partial circular branch below half full only; not a fitting, entry or surcharge rating.'};
 };
 const slowHeaderCounterexample=[72,144,216].map(rainfall=>{
  const total=rainfall*60.0625/3600,jet=Math.min(total,mouthFlow(-35,[[7275,7375]])),Q=jet/1000,b=.1,H=.265;
  let lo=1e-8,hi=(Q*Q/(g*b*b))**(1/3);for(let i=0;i<90;i++){const y=(lo+hi)/2,E=y+(Q/(b*y))**2/(2*g);if(E>H)lo=y;else hi=y;}
  const y=(lo+hi)/2,V=Q/(b*y),Fr=V/Math.sqrt(g*y),conjugate=y/2*(Math.sqrt(1+8*Fr*Fr)-1);
  const controlUpperDepth=1.5*((total/1000)**2/(g*.065**2))**(1/3);
  return {rainfall,totalLps:total,actualNorth100MaximumLps:jet,zeroLossInletDepthMm:y*1000,conjugateMm:conjugate*1000,
   clean65CriticalSpecificEnergyMm:controlUpperDepth*1000,optimisticTailwaterReserveMm:1000*(controlUpperDepth-conjugate),
   boundary:'Header bed−300 with quiet−35; control specific energy is an UPPER depth bound before upstream grade/velocity/turn loss. Negative reserve falsifies this slow-turn premise; positive reserve does not locate a jump.'};
 });
 const hydraulics={assignedLps:q,slowHeaderCounterexample,uniformCases:[.015,.02,.025].flatMap(n=>[1,.9,.75,.5].map(boreFraction=>({n,boreFraction,
   fullBoreGravityCapacityLps:1000*full(D*boreFraction,n),passesAssignedFullBoreScreen:1000*full(D*boreFraction,n)>q,
   boundary:'Equivalent clear DIAMETER sensitivity, not measured debris distribution or a justified blockage allowance.'}))),
  cleanPartialCases:[.015,.02,.025].map(n=>({n,...normal(q/1000,n)})),
  lossCases:[.02,.04,.08].flatMap(darcyF=>[0,5,10,20].map(totalK=>{
   const V=q/1000/(Math.PI*D*D/4),head=V*V/(2*g),loss=(darcyF*6/D+totalK)*head;
   return {darcyF,totalK,fullBoreVelocityMps:V,fullBoreVelocityHeadMm:head*1000,frictionAndLocalLossMm:loss*1000,
    sameLevelCarrierFallMm:axis(7550)-axis(12250),fallOnlyReserveMm:axis(7550)-axis(12250)-loss*1000,
    boundary:'6m full-bore Darcy/K sensitivity; no actual coefficient or priming/air/surcharge prediction.'};
  })),
  unchangedMouthCases:[0,1].flatMap(lossK=>[1,.75].map(remainingFraction=>({lossK,remainingFraction,
   requiredCourtStage:mouthStage(q,r.courtCollector.actualOpenEntries.west.creditedIntervals,{lossK,remainingFraction}),
   quietCapacityLps:mouthFlow(-35,r.courtCollector.actualOpenEntries.west.creditedIntervals,{lossK,remainingFraction})}))),
  pressureBoundaries:{quietCourtHead:-35,geometricJoin:15,qualifiedFirstSusceptible:null,
   staticHeadAtLowestInstalledInvertMm:15-(axis(12250)-D*1000/2),
   roofHeadNotDissipatedByAssumption:7100,maximumRoofHeadAtLowestInvertMm:7100-(axis(12250)-D*1000/2),
   limitation:'This closed route moves turns/jet impacts into a pressure/leakage boundary. Actual roof-to-court energy loss is not calibrated. Do not claim only25/75mm cover pressure or transfer a PN16 fitting label to the hopper, braze, flange or gasket.'}};
 const I=Math.PI/64*((158.1/1000)**4-((158.1-2*1.7)/1000)**4),Emod=55e9;
 const massPerM=copper*Math.PI/4*((.159)**2-(.155)**2),waterPerM=1000*Math.PI*.155**2/4;
 const supportCases=[2.1,4.2].map(L=>{
  const w=(massPerM+waterPerM)*g,rotation=w*L**3/(24*Emod*I),adverse=.003/L;
  return {spanMm:L*1000,elasticModulusHypothesisGPa:Emod/1e9,endpointDifferenceMm:3,
   rotationMmPerM:rotation*1000,residualDownhillMmPerM:1000*(slope-adverse-rotation),
   simplySupportedDeflectionMm:1000*5*w*L**4/(384*Emod*I),
   boundary:'Isolated simply supported copper tube under full uniform water/metal load; no skid point load, fitting, crush, fixation or support-movement acceptance.'};
 });
 const length=4700,parkEnd=12250+length,trackBottom=axis(parkEnd)-150-100,firstBeamStart=7650;
 const pipeSheet=massPerM*length/1000,blockedWater=waterPerM*length/1000;
 // A translating upstream flange, not the straight tube, governs first entry.
 const nativeMovingFlangeAxial=25,firstFlangeEntryTranslation=firstBeamStart-7550-nativeMovingFlangeAxial;
 const rotatedEntryTranslation=firstBeamStart-7550-nativeMovingFlangeAxial*Math.cos(fittingAngle)-285/2*Math.sin(fittingAngle);
 const movingFlangeClearance={catalogOD:285,axialScreen:nativeMovingFlangeAxial,firstBeamStart,
  boxScreen:'The installed2.5/first-entry3.382/translation75 are conservative AXIS-ALIGNED285×25 bounding-box comparisons, not exact tilted-disc kinematics.',
  rotatedDisc:{angleDegrees:fittingAngle*180/Math.PI,
   installedTopGap:-630-(-775+285/2*Math.cos(fittingAngle)),
   firstLeadingPointEntryTranslation:rotatedEntryTranslation,
   firstEntryTopGap:-630-(-775-nativeMovingFlangeAxial*Math.sin(fittingAngle)+285/2*Math.cos(fittingAngle)-rotatedEntryTranslation*slope)},
  installedTopGap:-630-(-775+285/2),firstEntryTranslation:firstFlangeEntryTranslation,
  sameLevelFirstEntryTopGap:-630-(-775-firstFlangeEntryTranslation*slope+285/2),
  minimumAuthoredMovingClearance:20,accepted:false,
  failure:'REJECTED same-level initial draw. The tube crown gap cannot be transferred to the285flange. Only2.51installed/3.67at exact rotated-disc first entry remains before tolerances, rail movement or tool/retention. No earned renewal method follows.'};
 const flange={product:'Endex N1FMGI159 item89719',catalogOutside:285,catalogAxial:20,catalogMassEachKg:7,
  brochureAxialA:25,brochureZa:2,brochureHoles:8,outsideEnvelope:320,axialEach:60,locationX:[7550,12250],
  source:'https://aalberts-ips.co.uk/products/item/89719/',
  catalogConflict:'Current item page20axial/CW617N/clamp metadata versus brochure25/Za2/steelouter+gunmetalinsert/brazed installation. Preserve both; no invented delivered drawing/material agreement.',
  wellGrossBottom:-775-160,wellFloorReserve:-775-160-(-950),
  massMovingPairKg:14,massFixedPairKg:14,
  status:'Actual285catalogue envelope replaces too-small260projectreservation.320×120 is a conservative PROJECT tool/bolt reservation, NOT a solved8bolt/retention first release. Both flange halves stay within joint-face-to-face4700 body length, with tube cut/engagement to suit; tool reservation is not extra movingbody length. Gasket/bolt/socket/braze and actual top release remain unqualified. No centre flange hidden below gallery.'};
 return {identity:'RWT-UNADOPTED-CURRENT-E-CLOSED-CONTROL-2026-11-06',selectedSource:s.blob,sourceAuthority:s.authority,canonicalMain:s.canonicalMain,canonicalMainHadBlob:s.canonicalMainHadBlob,startingMain:'80c0f94148ad11e3b2eaa83c52e28d06238993ed',selectedGeometryChanged:false,
  recommendation:'Retain ONE closed159copper control for development, but REJECT its original same-level first flange draw. Test one lowered local service bay and supported initial drop; keep real2200longer exterior renewal cost and unresolved actual end connections visible.',
  tube,
  retained:{quiet:-35,geometricCrest:15,houseBounds:[0,0,12000,12000],roofCourtAreaM2:60.0625,
   inwardRoofM2:47.8125,courtM2:12.25,structuralRoofDomainM2:144.15,
   fieldBeamUnderside:-630,nodeUnderside:-750,actualOpeningY:[6425,7375],minimumMovingClearanceEach:25,
   courtMouth:{planeX:6125,creditedIntervals:[[6950,7175],[7275,7375]],creditedWidth:325},
   catchCoverCount:5,plainCoverCount:5,coverPlanEach:[305,550]},
  collectingChange:{plan:[7040,6950,335,450],
   floorControl:[[7040,-171.96],[collectorAxisX,-200],[7375,-180]],outletAxis:[collectorAxisX,7000],verticalOutletID:155,
   outletShiftEW:collectorAxisX-7175,
   fittingAlignment:'Collector throat/closed closure moves6.713east to meet the native N18 inlet axis rotated with50/4250carrier fall; regenerate actual gutter fall/closure/cover supports before adoption. No vertical-to-tilted socket mismatch is concealed.',
   coverTop:0,changedGutterCassetteBottom:-215,oldMinimumBottom:-200,
   changed:'Re-form ONLY the actual fourth/fifth north catch-cover gutter ends to drain to7175/7000/−200; the east tail falls WEST to this lower outlet. Captured top cover/gutter footprints stay305×550. No65throat, raised sill or un-drained depression; all points descend to the vertical outlet.',
   construction:'Small closed transition below the existing250wide receiving return replaces the free617.6mm hood plunge; continuous vent/rod access opens from the existing removed catch covers. Top connection/clip/braze and first release require actual source, not an assumed sealed overlap.'},
  intakeTurn:{verticalAxis:[collectorAxisX,7000],fromZ:-200,toZ:fittingTop[2],horizontalAxisAt:fittingHorizontal,
   factoryPortBinding:{carrierFall:50/4250,rotationAboutYDegrees:fittingAngle*180/Math.PI,
    theoreticalPortAxisIntersection:[7175,7000,fittingCornerZ],verticalLeg:303,horizontalLeg:303,
    horizontalPort:fittingHorizontal,topPort:fittingTop,collectorPort:[collectorAxisX,7000,-200],
    pipeAxisAtHorizontalPort:axis(fittingHorizontal[0]),
    nativePortToFlangeFaceLength:(7550-fittingHorizontal[0])/Math.cos(fittingAngle),
    flangeFaceNormal:[Math.cos(fittingAngle),0,-Math.sin(fittingAngle)],
    role:'Rigid90degree native port-vector binding.303is catalogue l, not a factory bend radius; actual socket engagement/centreline/body drawing remains a named hold.',
    aboveBridgeTrialAxisZ:-149.95,aboveBridgeTopPortZ:153.05,quietStage:-35,
    aboveBridgeAccepted:false,reason:'Unrotated raised comparator already puts303topport153.05above walk0 and quiet−35; full warm floor/movingflange separately rejects retained raised route.'},
   reservedBox:[7090,6905,-855,460,190,460],productComparator:{item:'Endex N18/89710,159',overall:[380,170,380],massKg:6.15,l1:303,z1:272,
    role:'Real factory size/braze-only comparator. Conservative460×190×460 reservation contains the listed380×170×380 box; the authoredR300 axis is NOT falsely identified as the factory centreline drawing.'},
   sourceJoin:'Factory l/z, sockets, exact braze engagement and rotation must bind before fixing the actual axis. No fitting or helper is allowed beyond X7550 into the first beam starting7650.'},
  carrier:{axis:[[7550,7000,axis(7550)],[12250,7000,axis(12250)]],length,flange,
   fullTubeMaximumOD:159.9,movingSledY:[6475,7325],supportSaddlesRelativeX:[250,2350,4450],
   supportBelowAxis:150,retainedRailBelowSled:100,flangeIsStructuralSupport:false,
   fieldMinimumCrownGap:-630-(axis(firstBeamStart)+159.9/2),movingSideReserves:[6475-6425,7375-7325],
   flangeWestToFirstBeamEW:7650-(7550+flange.axialEach),flangeEastBeyondOuterBeamEW:12250-flange.axialEach-12117.5,
   supportCases,movingFlangeClearance},
  terminal:{closedRoute:[[12250,7000,axis(12250)],[12650,7000,axis(12650)],[12950,7000,axis(12650)-300],[12950,7000,-1200]],
   reservedCartridge:[12190,6840,-1285,910,320,615],bendProductComparator:'Second N18-sized380×170×380 envelope inside changed910long cartridge; exact socket/axis binding remains required.',
   orientation:'VERTICALLY DOWN at12950/7000/−1200',receiverBounds:[12500,6100,2000,1600],ordinaryMaximum:-1400,faultedMaximum:-1250,
   nearReceiverReserve:12950-159.9/2-12500,farReceiverReserve:14500-(12950+159.9/2),airGapOrdinary:200,airGapAtDeclaredFaultedMaximum:50,
   pad:[15300,8200,1100,800],padChange:'Real285flange and320toolreservation enlarge cartridge to910; allocate1100×800 on explicitly extended deck. Neither old800square nor early850/1000pad comparison is transferred.',
   status:'Changed terminal requires actual support release, captured910 envelope, return/refit and receiver impact screen. Old550cartridge handling is NOT transferred.'},
  renewal:{onePiece:true,hiddenMiddleJoint:false,drawTranslation:4700,parkX:[12250,parkEnd],stage:[12250,8100,4900,1200],
   oldStage:[12250,8100,2700,1200],stageExtensionEW:2200,oldDeckEndX:16200,requiredDeckEndX:17150,deckExtensionEW:950,
   temporaryCradleX:[12900,16300],pipeParkCentreX:(12250+parkEnd)/2,handOver:[12250,9600,4900,1200],
   supportRule:'Use ONE independent temporary lower cradle pair; no stacked outer/inner body and no loaded upper bearer insertion. Proposed far cradle16300 lies beyond old16200 deck and requires the real950extension/support. Existing rack/gantry is not rated by this drawing.',
   ordered:['N intact/full-duty and all E weather controls tested; guard intact covers.',
    'Capture/remove the SAME five north catch covers and five plain covers before using existing stairs/platform. No new ten deep chute panels or55kg telescopic-staff apparatus is added.',
    'From isolated well/platform, expose and support inlet/drop connection; drain pipe, capture and separate the actual end connectors. A solved top first-release/retention path is still required; a pressure seal is not a support.',
    'Open all outboard covers. Capture/remove changed terminal cartridge and land on its1100×800pad BEFORE carrier draw.',
    'HOLD: original same-level initial draw is REJECTED by moving285flange clearance. Earn the separate lowered-bay/supported-drop comparison before drawing one captured4700pipe+850sled EAST to12250..16950. No person stands below or beside moving carrier in the portal.',
    'Lift1700 and transferN1800 into4900×1200 lower cradle territory; support at12900/16300, restrain, then detach rigging. Outgoing piece leaves before incoming occupies samepad.',
    'Reverse pipe motion; restore/test end connections and first-leak witness. Refit/test terminal while covers OPEN, then close covers. Restore catch covers/hood/entry and prove full E path before removing weather control.'],
   completeHandlerSweepProved:false,
   aboveBridgeWholeControl:{accepted:false,sourceCommit:'5f56d58f5c2d4b7d65b712be10c39d274884b154',
    sourcePath:'project/str/studies/current-house-occupied-interfaces.json',sourceBlob:'c4b2261a7c62481b64617cca57b6b2baabec330e',
    requiredRecessForMovingFlangeBelowWarmFloor:352.89,
    finding:'REJECTED retained complete factory/fixed-floor control: all3spans checked by STR; tube-only recess omits285movingflange, native303port and real180warm buildup/RC200 floor.450bridge remains. No top-cage/floor replan accepted.'}},
  loads:{nominalTubeSheetKg:pipeSheet,fullBlockedTubeWaterKg:blockedWater,
   tubeOnlyWetKg:pipeSheet+blockedWater,movingTubeAndTwoCatalogFlangesDryKg:pipeSheet+14,movingTubeAndTwoCatalogFlangesWetKg:pipeSheet+blockedWater+14,
   fixedFlangePairKg:14,listedTwoBendsKg:12.3,
   excluded:'Solder/braze constituents, gasket/bolts,850sled/clamps/eyes, hopper and rigging need actual signed masses beyond tube+two7kg movingflanges. Fixedother14kg flange pair and12.3kg listedbends are separate. No50kg whole-handler claim follows from42kg bare pipe.',
   maximumTrackBottom:trackBottom,localGroundRequirementAtHeave300Construction50Ventilation150:-trackBottom+500,
   uniformD1800ProxyReserve:1800-(-trackBottom+500),retainedLocalCatchLow:-1188,
   groundDecision:'Local track clearance and retained flange-catch clearance remain separate. Neither a uniform exterior−1800 grade nor a new whole-house/front-approach replan is adopted; real groundwater/backwater/site access can reject the exterior extension.'},
  hydraulics,mouthRewind:mouthRewind(),
  ordinaryAccess:{inspection:'From existing opened court catch covers and downstream accessible terminal, inspect/rod the straight4700 bore in both directions; upstream drop bend has openable hopper access. No buried middle chamber or internal-room access hatch is added.',
   cleaning:'Actual rod section/head bend sweep, retained cleanout closure and safe isolated-state operation need source. Small bore carries a specific rodding/debris burden; the unchanged325mouth25%loss/K1 quiet-stage failure is retained.',
   leakage:'Continuous accessible/recoverable closed body and visible separate catch are required. The selected80 local leak drain is NOT full-duty backup and no invisible persistent leakage is accepted.'},
  accepted:false,qualifiedMaterial:false,qualifiedFirstHarm:null,physicalEventPerformed:false,siteAccepted:false,
  boundedExit:['Bind one actual end connector, vent/rod closure, retained supports and first release to the real source; rate metal/braze/seal/leak under the stated pressure/jet demands.',
   'Earn changed upstream two cover-gutter cassettes, vertical fitting axis and850terminal support/refit; do not borrow the old openpan cartridge pass.',
   'Complete real4700 lifting/export/incoming swept envelope and actual apparatus/forces on the2200longer pad; DPL/site can reject that land cost.',
   'Retain ordinary/high-eave inspection and renewal duties from finite-exit-map. This ground-carrier comparison does not close them.']};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
export function renderControl(o){
 const text=(x,y,t,n=18)=>`<text x="${x}" y="${y}" font-size="${n}">${esc(t)}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#253940">';
 s+=text(30,35,'UNADOPTED · one conventional closed copper E control',28)+text(30,65,'Current HAD900passage /450bridge retained. No65throat or new ten-panel chute/tool; exact end/handling/material proof still required.');
 const X=x=>55+(x-6125)*.12,Z=z=>230-z*.25;
 s+=text(35,110,'Longitudinal section · installed tube + one-piece parked position',22);
 s+=`<rect x="${X(7650)}" y="${Z(-180)}" width="${(12117.5-7650)*.12}" height="${450*.25}" fill="#d8d3c8" stroke="#726e62"/>`;
 s+=`<path d="M${X(7175)} ${Z(-200)} V${Z(o.intakeTurn.toZ)} Q${X(7175)} ${Z(o.intakeTurn.factoryPortBinding.theoreticalPortAxisIntersection[2])} ${X(o.intakeTurn.horizontalAxisAt[0])} ${Z(o.intakeTurn.horizontalAxisAt[2])} L${X(12250)} ${Z(o.carrier.axis[1][2])}" stroke="#377f93" stroke-width="20" fill="none"/>`;
 s+=`<path d="M${X(12250)} ${Z(o.carrier.axis[1][2])} L${X(12650)} ${Z(o.terminal.closedRoute[1][2])} Q${X(12950)} ${Z(o.terminal.closedRoute[1][2])} ${X(12950)} ${Z(-1200)}" stroke="#377f93" stroke-width="18" fill="none"/>`;
 for(const joint of o.carrier.flange.locationX){
  const axis=o.carrier.axis[0][2]-(joint-7550)*50/4250;
  s+=`<rect x="${X(joint-60)}" y="${Z(axis+160)}" width="14.4" height="80" fill="none" stroke="#a66d49" stroke-dasharray="3 2"/><rect x="${X(joint-10)}" y="${Z(axis+142.5)}" width="2.4" height="71.25" fill="#746e65"/>`;
 }
 s+=`<path d="M${X(12250)} ${Z(o.carrier.axis[1][2])} L${X(16950)} ${Z(-775-(16950-7550)*50/4250)}" stroke="#ae7048" stroke-width="12" stroke-dasharray="8 5"/>`;
 s+=`<path d="M${X(6125)} ${Z(-950)} H${X(7650)} M${X(6125)} ${Z(-1800)} H${X(17150)}" stroke="#8c8a80" stroke-dasharray="5 4"/>`;
 s+=text(35,545,'Grey:real285OD flanges; dashed320toolreserve atupstream ends−935, only15 abovefloor−950. Actual8bolt release unproved.')+text(35,575,'FAIL initial draw:rotated285flange gives2.51installed /3.67first-entry gap, NOT tube’s66.2mm gap.')+text(35,605,'Vertical takeoff/bend remain inside well; terminal extends to12950/7000/−1200 inside E receiver.')+text(35,635,'Brown:REJECTED same-level initial draw. A changed bay/support/release requires separate successor proof.')+text(35,665,'Uniform D1800 is a comparison. Actual local track/ground/catch clearance and real receiving water remain separate.');
 const px=x=>55+(x-6125)*.12,py=y=>980-(y-6300)*.08;
 s+=text(35,715,'Plan · actual900service passage and longer north receiving/handover field',22);
 s+=`<rect x="${px(6125)}" y="${py(7400)}" width="183" height="88" fill="#e7e1ce" stroke="#717d7a"/><rect x="${px(7550)}" y="${py(7375)}" width="${4700*.12}" height="${950*.08}" fill="#ded8ce" stroke="#717d7a"/>`;
 s+=`<path d="M${px(7550)} ${py(7000)} H${px(12250)}" stroke="#377f93" stroke-width="19"/>`;
 const stage=o.renewal.stage;s+=`<rect x="${px(stage[0])}" y="${py(stage[1]+stage[3])}" width="${stage[2]*.12}" height="${stage[3]*.08}" fill="#c4dbce" stroke="#597664"/>`;
 for(const a of o.renewal.temporaryCradleX)s+=`<path d="M${px(a)} ${py(8100)} V${py(9300)}" stroke="#896744" stroke-width="7"/>`;
 s+=text(35,1010,'Actual opening Y6425..7375;850gross moving sled Y6475..7325 leaves50each. No automatic new support rating.')+text(35,1040,'Tube41.54 +movingflanges14 +blockedwater88.69 =144.23kg BEFORE sled/rigging/bolts.910terminal requires1100×800pad.',18);
 return s+'</g></svg>\n';
}
export function renderMouth(o){
 const r=o.mouthRewind,c=r.candidates[1],x=X=>55+(X-5000)*.25,y=Y=>145+(7500-Y)*.28;
 const text=(X,Y,t,n=17)=>`<text x="${X}" y="${Y}" font-size="${n}">${esc(t)}</text>`;
 const rect=(p,fill,stroke='#576a6b')=>`<rect x="${x(p[0])}" y="${y(p[1]+p[3])}" width="${p[2]*.25}" height="${p[3]*.28}" fill="${fill}" stroke="${stroke}"/>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="900" viewBox="0 0 1250 900"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#253940">';
 s+=text(30,35,'REJECTED · finite600cover-boundary inlet rewind',27)+text(30,65,'600north /500south:no HAD change. Real parkedleaf2.5mm /weatherentry ZERO reserve; hydraulic sensitivity still fails.');
 s+=text(30,115,'Located plan · north is up',21);
 s+=rect(r.geometry.well,'#e7e1ce')+rect(r.geometry.unchangedRamp,'#d8ddd7');
 for(let i=0;i<5;i++){
  s+=rect([6125+i*305,6800,305,600],'#dce9e5');
  s+=rect([6125+i*305,6300,305,500],'#eee7d9');
 }
 s+=rect([6125,6811.5,1250,577],'none','#397d92');
 s+=`<path d="M${x(6125)} ${y(6850)} H${x(7650)}" stroke="#a66d49" stroke-dasharray="7 5"/>`;
 for(const[a,b]of c.creditedIntervals)s+=`<path d="M${x(6125)} ${y(a)} V${y(b)}" stroke="#28816c" stroke-width="9"/>`;
 for(const[a,b]of c.unchangedShadows)s+=`<path d="M${x(6125)} ${y(a)} V${y(b)}" stroke="#ad4c39" stroke-width="9"/>`;
 s+=rect([6125,6800,100,600],'none','#397d92')+rect([6125,6600,600,600],'none','#896b4a');
 s+=`<path d="M${x(6075)} ${y(6250)} V${y(6575)} M${x(6075)} ${y(7225)} V${y(7400)} H${x(7700)}" stroke="#746e65" stroke-width="5" fill="none"/>`;
 s+=rect([6050,7197.5,50,50],'#ad4c39');
 s+=`<circle cx="${x(7325)}" cy="${y(6850)}" r="${300*.25}" fill="none" stroke="#86719b" stroke-dasharray="6 4"/>`;
 s+=`<path d="M${x(7750)} ${y(6350)} V${y(7350)}" stroke="#6e87a1" stroke-width="6"/>`;
 s+=`<circle cx="${x(7175)}" cy="${y(7000)}" r="13" fill="#397d92"/>`;
 s+=text(820,155,'Actual wet edge6811.5..7388.5',19)+text(820,188,'Green:463.5 credited lip')+text(820,218,'Red:100ramp/25corner excluded')+text(820,248,'Dashed:old550cover boundary')+text(820,278,'Purple:R300window-cleaning body')+text(820,308,'Blue:one7175/7000outlet')+text(820,348,'650gate:600captured plan')+text(820,378,'25each only to naked FRAME')+text(820,408,'Actual leaf2.5 /weatherentry0:FAIL');
 s+=text(30,550,'Necessary hydraulic comparison · SAME K1 and25%loss retained',22);
 s+=text(30,585,'Existing550footprint, real walls/flanges:413.5clear; K1/25% gives3.712L/s before approach.');
 s+=text(30,615,'100mm approach /n.04 /upstream-depth rectangle reduces it to3.597L/s:FAIL versus3.60375.');
 s+=text(30,655,'One600candidate:463.5clear; K1/25% gives4.026L/s. With upstream-depth approach:3.904L/s,2.455mmreserve.');
 s+=text(30,685,'Same candidate at constant critical-depth approach:3.082L/s, requiredstage−30.640:FAIL.');
 s+=text(30,715,'Depth/local-loss placement and roughness are uncalibrated. These are contrasting sensitivities, not installed bounds.');
 s+=text(30,765,'Physical price:larger gutter/cover mass, ledge/notch/guard reprofiling, full retained capture/crew/weather sequence.');
 s+=text(30,795,'Candidate first stair tread−260 clears westpan underside−151.5 by108.5; actual support/fastener solids still required.');
 s+=text(30,825,'Ramp profile UNBOUND:declared−15 lip vsuniform74/1100underside−28.45 at6025 /−21.73 at6125; feed not proved.');
 s+=text(30,865,'Root review and coherent HAD/consumer regeneration precede any architectural adoption. RWT06 remains incomplete.',18);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=control();for(const[p,t]of[['closed-east-control.json',JSON.stringify(o,null,2)+'\n'],['closed-east-control.svg',renderControl(o)],['closed-mouth-rewind.svg',renderMouth(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),t);else fs.writeFileSync(path,t);
 }console.log('ONE unadopted current E closed control reproduced.');
}
