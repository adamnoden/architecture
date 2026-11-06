/** ONE current-source ordinary closed-metal control; not selected and not a generic drainage solver. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected,mouthFlow,mouthStage} from './selected-water-event.mjs';
const g=9.81,copper=8960;
export function control(){
 const s=readSelected(),v=s.model,r=v.renewal,q=v.hydraulicProbe.assignedInwardRoofAndCourtLps;
 const tube={product:'Lawton TX1593/TX1596 TableX hard copper',OD:159,wall:2,nominalID:155,
  declaredODTolerance:.2,declaredOutOfRound:.7,declaredWallToleranceFraction:.15,
  maximumOutsideScreen:159.9,minimumInscribedBoreScreen:153.5,
  interpretation:'Conservative simultaneous tolerance envelope, not a delivered inspection certificate. Product is not declared an assembled rainwater system.'};
 const axis=x=>-775-(x-7550)*50/4250,slope=50/4250,D=tube.minimumInscribedBoreScreen/1000;
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
 const flange={outsideEnvelope:260,axialEach:30,locationX:[7550,12250],
  status:'PROJECT connection reservation only; actual metal seal, compression, captive fasteners and top-access first release NOT solved. No centre flange or seal hidden below the gallery.'};
 return {identity:'RWT-UNADOPTED-CURRENT-E-CLOSED-CONTROL-2026-11-06',selectedSource:s.blob,selectedGeometryChanged:false,
  recommendation:'Develop this ONE closed159copper control before further65throat/tenpanel/open-transfer machinery. It is not falsified by the current900passage. Keep its real2200longer exterior renewal cost and unresolved actual end connections visible.',
  tube,
  retained:{quiet:-35,geometricCrest:15,houseBounds:[0,0,12000,12000],roofCourtAreaM2:60.0625,
   inwardRoofM2:47.8125,courtM2:12.25,structuralRoofDomainM2:144.15,
   fieldBeamUnderside:-630,nodeUnderside:-750,actualOpeningY:[6425,7375],minimumMovingClearanceEach:25,
   courtMouth:{planeX:6125,creditedIntervals:[[6950,7175],[7275,7375]],creditedWidth:325},
   catchCoverCount:5,plainCoverCount:5,coverPlanEach:[305,550]},
  collectingChange:{plan:[7040,6950,335,450],
   floorControl:[[7040,-171.96],[7175,-200],[7375,-180]],outletAxis:[7175,7000],verticalOutletID:155,
   coverTop:0,changedGutterCassetteBottom:-215,oldMinimumBottom:-200,
   changed:'Re-form ONLY the actual fourth/fifth north catch-cover gutter ends to drain to7175/7000/−200; the east tail falls WEST to this lower outlet. Captured top cover/gutter footprints stay305×550. No65throat, raised sill or un-drained depression; all points descend to the vertical outlet.',
   construction:'Small closed transition below the existing250wide receiving return replaces the free617.6mm hood plunge; continuous vent/rod access opens from the existing removed catch covers. Top connection/clip/braze and first release require actual source, not an assumed sealed overlap.'},
  intakeTurn:{verticalAxis:[7175,7000],fromZ:-200,toZ:-475,horizontalAxisAt:[7475,7000,-775],
   reservedBox:[7090,6905,-855,460,190,460],productComparator:{item:'Endex N18/89710,159',overall:[380,170,380],massKg:6.15,l1:303,z1:272,
    role:'Real factory size/braze-only comparator. Conservative460×190×460 reservation contains the listed380×170×380 box; the authoredR300 axis is NOT falsely identified as the factory centreline drawing.'},
   sourceJoin:'Factory l/z, sockets, exact braze engagement and rotation must bind before fixing the actual axis. No fitting or helper is allowed beyond X7550 into the first beam starting7650.'},
  carrier:{axis:[[7550,7000,axis(7550)],[12250,7000,axis(12250)]],length,flange,
   fullTubeMaximumOD:159.9,movingSledY:[6475,7325],supportSaddlesRelativeX:[250,2350,4450],
   supportBelowAxis:150,retainedRailBelowSled:100,flangeIsStructuralSupport:false,
   fieldMinimumCrownGap:-630-(axis(firstBeamStart)+159.9/2),movingSideReserves:[6475-6425,7375-7325],
   flangeWestToFirstBeamEW:7650-(7550+30),flangeEastBeyondOuterBeamEW:12250-30-12117.5,
   supportCases},
  terminal:{closedRoute:[[12250,7000,axis(12250)],[12650,7000,axis(12650)],[12950,7000,axis(12650)-300],[12950,7000,-1200]],
   reservedCartridge:[12225,6870,-1285,850,260,585],bendProductComparator:'Second N18-sized380×170×380 envelope inside an850long cartridge; exact socket/axis binding remains required.',
   orientation:'VERTICALLY DOWN at12950/7000/−1200',receiverBounds:[12500,6100,2000,1600],ordinaryMaximum:-1400,faultedMaximum:-1250,
   nearReceiverReserve:12950-159.9/2-12500,farReceiverReserve:14500-(12950+159.9/2),airGapOrdinary:200,airGapAtDeclaredFaultedMaximum:50,
   pad:[15300,8200,1000,800],padChange:'Old800square cartridge pad is too short for850 cartridge; allocate1000×800 on the explicitly extended deck.',
   status:'Changed terminal requires its actual support release, captured850 envelope, return/refit and receiver impact screen. Old550cartridge handling is NOT transferred.'},
  renewal:{onePiece:true,hiddenMiddleJoint:false,drawTranslation:4700,parkX:[12250,parkEnd],stage:[12250,8100,4900,1200],
   oldStage:[12250,8100,2700,1200],stageExtensionEW:2200,oldDeckEndX:16200,requiredDeckEndX:17150,deckExtensionEW:950,
   temporaryCradleX:[12900,16300],pipeParkCentreX:(12250+parkEnd)/2,handOver:[12250,9600,4900,1200],
   supportRule:'Use ONE independent temporary lower cradle pair; no stacked outer/inner body and no loaded upper bearer insertion. Proposed far cradle16300 lies beyond old16200 deck and requires the real950extension/support. Existing rack/gantry is not rated by this drawing.',
   ordered:['N intact/full-duty and all E weather controls tested; guard intact covers.',
    'Capture/remove the SAME five north catch covers and five plain covers before using existing stairs/platform. No new ten deep chute panels or55kg telescopic-staff apparatus is added.',
    'From isolated well/platform, expose and support inlet/drop connection; drain pipe, capture and separate the actual end connectors. A solved top first-release/retention path is still required; a pressure seal is not a support.',
    'Open all outboard covers. Capture/remove changed terminal cartridge and land on its1000×800pad BEFORE carrier draw.',
    'Draw one captured4700pipe+850sled EAST to12250..16950 at the same falling track level; retain end connection until parked capture established. No person stands below or beside the moving carrier in the portal.',
    'Lift1700 and transferN1800 into4900×1200 lower cradle territory; support at12900/16300, restrain, then detach rigging. Outgoing piece leaves before incoming occupies samepad.',
    'Reverse pipe motion; restore/test end connections and first-leak witness. Refit/test terminal while covers OPEN, then close covers. Restore catch covers/hood/entry and prove full E path before removing weather control.'],
   completeHandlerSweepProved:false},
  loads:{nominalTubeSheetKg:pipeSheet,fullBlockedTubeWaterKg:blockedWater,
   tubeOnlyWetKg:pipeSheet+blockedWater,excluded:'Flanges, solder/braze constituents,850sled/clamps/eyes, hopper/bends and rigging need their own actual signed masses; no50kg whole-handler claim follows from42kg bare pipe.',
   maximumTrackBottom:trackBottom,localGroundRequirementAtHeave300Construction50Ventilation150:-trackBottom+500,
   uniformD1800ProxyReserve:1800-(-trackBottom+500),retainedLocalCatchLow:-1188,
   groundDecision:'Local track clearance and retained flange-catch clearance remain separate. Neither a uniform exterior−1800 grade nor a new whole-house/front-approach replan is adopted; real groundwater/backwater/site access can reject the exterior extension.'},
  hydraulics,
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
 s+=`<path d="M${X(7175)} ${Z(-200)} V${Z(-475)} Q${X(7175)} ${Z(-775)} ${X(7475)} ${Z(-775)} L${X(12250)} ${Z(o.carrier.axis[1][2])}" stroke="#377f93" stroke-width="20" fill="none"/>`;
 s+=`<path d="M${X(12250)} ${Z(o.carrier.axis[1][2])} L${X(12650)} ${Z(o.terminal.closedRoute[1][2])} Q${X(12950)} ${Z(o.terminal.closedRoute[1][2])} ${X(12950)} ${Z(-1200)}" stroke="#377f93" stroke-width="18" fill="none"/>`;
 s+=`<path d="M${X(12250)} ${Z(o.carrier.axis[1][2])} L${X(16950)} ${Z(-775-(16950-7550)*50/4250)}" stroke="#ae7048" stroke-width="12" stroke-dasharray="8 5"/>`;
 s+=`<path d="M${X(6125)} ${Z(-950)} H${X(7650)} M${X(6125)} ${Z(-1800)} H${X(17150)}" stroke="#8c8a80" stroke-dasharray="5 4"/>`;
 s+=text(35,575,'Field underside−630; body crown gap66.2mm.159.9OD envelope;155nominal bore /153.5 conservative screen.')+text(35,605,'Vertical takeoff/bend remain inside well; terminal extends to12950/7000/−1200 inside E receiver.')+text(35,635,'Brown:4700draw→park12250..16950. New deck to17150; no cost-free reuse of old2500body park.')+text(35,665,'Uniform D1800 is a comparison. Actual local track/ground/catch clearance and real receiving water remain separate.');
 const px=x=>55+(x-6125)*.12,py=y=>980-(y-6300)*.08;
 s+=text(35,715,'Plan · actual900service passage and longer north receiving/handover field',22);
 s+=`<rect x="${px(6125)}" y="${py(7400)}" width="183" height="88" fill="#e7e1ce" stroke="#717d7a"/><rect x="${px(7550)}" y="${py(7375)}" width="${4700*.12}" height="${950*.08}" fill="#ded8ce" stroke="#717d7a"/>`;
 s+=`<path d="M${px(7550)} ${py(7000)} H${px(12250)}" stroke="#377f93" stroke-width="19"/>`;
 const stage=o.renewal.stage;s+=`<rect x="${px(stage[0])}" y="${py(stage[1]+stage[3])}" width="${stage[2]*.12}" height="${stage[3]*.08}" fill="#c4dbce" stroke="#597664"/>`;
 for(const a of o.renewal.temporaryCradleX)s+=`<path d="M${px(a)} ${py(8100)} V${py(9300)}" stroke="#896744" stroke-width="7"/>`;
 s+=text(35,1010,'Actual opening Y6425..7375;850gross moving sled Y6475..7325 leaves50each. No automatic new support rating.')+text(35,1040,'Drawn reference only: full blockage water≈88.7kg + bare tube≈41.5kg; all connections, sled/rigging and actual handling remain priced.',18);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=control();for(const[p,t]of[['closed-east-control.json',JSON.stringify(o,null,2)+'\n'],['closed-east-control.svg',renderControl(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),t);else fs.writeFileSync(path,t);
 }console.log('ONE unadopted current E closed control reproduced.');
}
