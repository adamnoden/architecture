/** One selected-house event investigation. Sensitivities are not calibrated coefficients. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const path='project/had/studies/water-replan.json';
const expectedBlob='6f089df104fe85c028978892e7f6b63f862e3237';
const g=9.81;
export function readSelected(){
 const raw=fs.readFileSync(path,'utf8');
 const blob=crypto.createHash('sha1').update(`blob ${Buffer.byteLength(raw)}\0`).update(raw).digest('hex');
 assert.equal(blob,expectedBlob,'Selected HAD changed: rebind actual event geometry, not only this hash');
 const model=JSON.parse(raw),pan=model.model.southCourtThresholdReference.pan;
 assert.deepEqual(pan.bodyEnvelope.dimensions,[1796,420,131.5],'Merged integral pan body was lost during RWT proposal reconciliation');
 assert.deepEqual(pan.fallY,[[4090,-45],[4450,-55]]);assert.equal(pan.rear.crestZ,15);
 return {path,blob,model,authority:'Composed HAD consumer for this result; canonicalMain metadata records INTEGRATION BASELINE4fef04ad/HAD265ac194. Only conditional receiver/garden/maintenance refinements are integrated; separate construction comparisons and hydraulic/physical/site acceptance remain unadopted/unaccepted',canonicalMain:'4fef04ad7a82a149903aa077af04f95b3a392294',canonicalMainHadBlob:'265ac19420f1b1fa6bba41dd859d7ee758187d6b'};
}
const floor=y=>-30-(y-5750)*.04;
export function mouthFlow(stageMm,intervals,{lossK=0,remainingFraction=1}={}){
 assert(lossK>=0&&remainingFraction>=0&&remainingFraction<=1);
 // q=sqrt(g)*yc^(3/2); H=yc+Vcrit²/(2g)+K*Vcrit²/(2g)=(1.5+.5K)yc.
 // Integrate over the ACTUAL graded intervals. K is referenced to critical-section velocity.
 const coefficient=Math.sqrt(g)/(1.5+.5*lossK)**1.5;
 return remainingFraction*intervals.reduce((q,[a,b])=>{
  assert(b>a);const ha=Math.max(0,(stageMm-floor(a))/1000),hb=Math.max(0,(stageMm-floor(b))/1000);
  return q+1000*coefficient/(.04*2.5)*(hb**2.5-ha**2.5);
 },0);
}
function rootIncreasing(fn,target,lo,hi){
 assert(fn(lo)<=target&&fn(hi)>=target,'Target outside bounded monotonic domain');
 for(let i=0;i<90;i++){const mid=(lo+hi)/2;if(fn(mid)<target)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
export function mouthStage(qLps,intervals,options={}){
 return rootIncreasing(z=>mouthFlow(z,intervals,options),qLps,-200,100);
}
export function manningFlow(width,depth,n,slope){
 assert(width>0&&depth>=0&&n>0&&slope>0);
 const area=width*depth,r=depth===0?0:area/(width+2*depth);
 return area*r**(2/3)*Math.sqrt(slope)/n;
}
export function channelAtFlow(qLps,width,n,slope){
 const y=rootIncreasing(d=>manningFlow(width,d,n,slope),qLps/1000,0,1),v=qLps/1000/(width*y);
 return {depthMm:1000*y,velocityMps:v,velocityHeadMm:1000*v*v/(2*g),froude:v/Math.sqrt(g*y),
  role:'Uniform rectangular-flow sensitivity only; no inlet, bend, jump, tailwater or splash qualification'};
}
export function receiverThrow(qLps,terminal,depthMm){
 const b=terminal.closedDownroute.clear[0]/1000,drop=(terminal.closedDownroute.outlet-terminal.receiver.nominalWaterPlane)/1000;
 assert(drop>0&&depthMm>0);
 const speed=qLps/1000/(b*depthMm/1000),flight=Math.sqrt(2*drop/g),throwMm=1000*speed*flight;
 const gap=terminal.receiver.bounds[1]-terminal.endY;
 return {depthMm,horizontalVelocityMps:speed,idealThrowMm:throwMm,receiverNearEdgeGapMm:gap,
  idealReachesNearEdge:throwMm>=gap,
  assumption:'Horizontal jet at named terminal end; neglect air resistance and losses. Actual orientation/depth not bound. Vertical discharge has zero horizontal throw.'};
}
export function receivingProjection(point,bounds,headMm,waterMm,streamWidthMm){
 assert(headMm>=point[2]&&point[2]>waterMm);
 // Every horizontal/downward outlet angle is bounded by a loss-free horizontal
 // jet supplied with the entire declared upstream energy head.
 const vmax=Math.sqrt(2*g*(headMm-point[2])/1000),range=1000*vmax*Math.sqrt(2*(point[2]-waterMm)/1000/g);
 const margins={upstream:point[0]-bounds[0],downstream:bounds[0]+bounds[2]-point[0]-range,
  south:point[1]-streamWidthMm/2-bounds[1],north:bounds[1]+bounds[3]-point[1]-streamWidthMm/2};
 return {point,bounds,maximumSpeedMps:vmax,maximumIdealHorizontalThrowMm:range,margins,
  containedGeometricEnvelope:Object.values(margins).every(x=>x>=0),
  boundary:'Still-air vertical-to-downward-E jet envelope under declared upstream energy head; NOT impact splash, roof-jet energy, wind or upward/ejected jets.'};
}
export function build(source=readSelected()){
 const v=source.model,m=v.model,n=m.northNormalRoute.normal,e=v.renewal.courtCollector.actualOpenEntries;
 assert.equal(m.selection.decision,'SELECT joined architectural-development reference');
 assert.equal(e.west.planeX,6125);assert.deepEqual(e.west.creditedIntervals,[[6950,7175],[7275,7375]]);
 assert.equal(e.north.creditedWidth,0);assert.equal(m.firstWetReference.permittedQuietStage,-35);
 assert.equal(m.firstWetReference.limitingLocatedJoin.z,15);assert.equal(m.firstWetReference.qualifiedFirstSusceptibleZ,null);
 const intervals=e.west.creditedIntervals,quiet=m.firstWetReference.permittedQuietStage;
 const q=v.hydraulicProbe.assignedInwardRoofAndCourtLps;assert.equal(q,3.60375);
 const atQuiet=mouthFlow(quiet,intervals),kMax=3*((atQuiet/q)**(2/3)-1);
 const losses=[0,.5,1,1.5,2].flatMap(lossK=>[1,.75,.5].map(remainingFraction=>{
  const stage=mouthStage(q,intervals,{lossK,remainingFraction});
  return {lossK,remainingFraction,capacityAtQuietLps:mouthFlow(quiet,intervals,{lossK,remainingFraction}),
   requiredStageMm:stage,quietReserveMm:quiet-stage,geometricCrestSeparationMm:15-stage,
   satisfiesAllocatedQuietStage:stage<=quiet};
 }));
 const event=[72,144,216].map(rainfallMmPerHour=>{
  const flowLps=rainfallMmPerHour*v.hydraulicProbe.catchment.combinedM2/3600;
  return {rainfallMmPerHour,flowLps,tenMinuteVolumeL:flowLps*600,
   eastIdealStageMm:mouthStage(flowLps,intervals),eastK1StageMm:mouthStage(flowLps,intervals,{lossK:1}),
   northUniform:channelAtFlow(flowLps,.25,.02,.01),eastUniform:channelAtFlow(flowLps,.6,.02,50/4250)};
 });
 const normalTerminal=m.northNormalRoute.terminal,historicalTerminal=m.northNormalRoute.historicalTerminal;
 const terminalCases=[10,25,40,75,100].map(d=>receiverThrow(q,historicalTerminal,d));
 const iface=m.rwtReceivingInterface,ei=iface.east;
 assert.deepEqual(normalTerminal.receiver.bounds,iface.north.receiverBounds);
 assert.deepEqual(v.renewal.activeOutlet,ei);
 assert.equal(v.passage.outerReceivingWaterMaximumTrial,ei.maximumWater);
 const interfaceRaw=fs.readFileSync(iface.source.path,'utf8');
 assert.equal(crypto.createHash('sha1').update(`blob ${Buffer.byteLength(interfaceRaw)}\0`).update(interfaceRaw).digest('hex'),iface.source.blob);
 const ep=receivingProjection(ei.terminal.farLip,ei.receiverBounds,15,ei.maximumWater,ei.terminal.waterClear);
 assert(ep.containedGeometricEnvelope,'Actual active E ideal projection leaves its receiver');
 const np={south:iface.north.outlet[1]-50-iface.north.receiverBounds[1],
  north:iface.north.receiverBounds[1]+iface.north.receiverBounds[3]-iface.north.outlet[1]-50,
  west:iface.north.outlet[0]-125-iface.north.receiverBounds[0],east:iface.north.receiverBounds[0]+iface.north.receiverBounds[2]-iface.north.outlet[0]-125};
 assert(Object.values(np).every(x=>x>0),'Normal vertical discharge does not land within actual N receiver');
 const nozz=ei.terminal,rail=v.renewal.joint.railReference;
 const outerPiece=v.renewal.pieces.find(p=>p.id==='outer');
 assert.deepEqual(nozz.bed[0],outerPiece.bedEnds.at(-1),'RWT terminal misses actual outer body outlet');
 assert.equal(nozz.grossPlan[3],nozz.waterClear+2*nozz.sheetBudget+2*nozz.outwardFlangeEach);
 assert(nozz.grossPlan[1]>rail.axesY[0]+rail.sectionNS/2&&nozz.grossPlan[1]+nozz.grossPlan[3]<rail.axesY[1]-rail.sectionNS/2,'E outlet cartridge cuts longitudinal rails');
 const st=ei.maintenance.stage,platform=v.renewal.servicePlatform;
 assert(st[0]>=platform[0]&&st[1]>=platform[1]&&st[0]+st[2]<=platform[0]+platform[2]&&st[1]+st[3]<=platform[1]+platform[3]);
 assert(st[0]>v.renewal.handoverPad[0]+v.renewal.handoverPad[2]&&st[0]>v.renewal.storagePad[0]+v.renewal.storagePad[2]);
 assert(nozz.bed.at(-1)[1]+ei.maintenance.capturedLift>v.renewal.joint.handling.postTop,'Outlet cartridge strikes empty rack during transfer');
 const rel=ei.maintenance.supportRelease,headZ=ei.bodyOutlet[2]+rel.headZRelativeBodyOutlet;
 const releaseTools=rel.y.map((yy,i)=>{
  const top=rel.upperShaftEnds[i],length=Math.hypot(top[0]-rel.headX,top[1]-yy,top[2]-headZ);
  assert(length<=rel.maximumToolLength);
  const reach=Math.hypot(rel.operator[0]-top[0]-rel.leverRadiusEW,rel.operator[1]-top[1],rel.shoulderZ-top[2]);
  assert(reach<rel.reach&&rel.operator[1]-rel.bodyRadius>v.renewal.outboardTrackClearY[1]);
  const fraction=(rel.headX-nozz.bed[0][0])/(nozz.bed[1][0]-nozz.bed[0][0]);
  const panRim=nozz.bed[0][1]+fraction*(nozz.bed[1][1]-nozz.bed[0][1])+nozz.sideHeight;
  assert(headZ-rel.headCube/2>panRim,'Outlet release tool head cuts actual descending pan');
  return {head:[rel.headX,yy,headZ],upperEnd:top,actualShaftLengthMm:length,referenceGripReachMm:reach,
   headToPanRimMm:headZ-rel.headCube/2-panRim,operatorNorthOfOpenBayMm:rel.operator[1]-rel.bodyRadius-v.renewal.outboardTrackClearY[1]};
 });
 const matSequence=v.renewal.joint.sequence,terminalSteps=ei.maintenance.sequence;
 const expectedSequence=[...terminalSteps.slice(0,1),...matSequence.slice(0,4),...terminalSteps.slice(1,2),...matSequence.slice(4,-1),...terminalSteps.slice(3),matSequence.at(-1).replace('Reopen E only after tests.','Reopen E only after tests AND reinstatement/testing of the RWT outlet cartridge.')];
 assert.deepEqual(v.renewal.selectedSequence,expectedSequence,'Outlet cartridge is lifted/refitted through closed covers or MAT state lost');
 const sourceApproachLength=e.approach.plan[2]/1000;
 const approach=intervals.map(([a,b])=>{
  const width=(b-a)/1000,depth=(quiet-floor((a+b)/2))/1000;
  const flow=mouthFlow(quiet,[[a,b]])/1000,velocity=flow/(width*depth),radius=width*depth/(width+2*depth);
  return {interval:[a,b],lengthMm:sourceApproachLength*1000,meanAvailableDepthMm:depth*1000,idealApproachVelocityMps:velocity,
   frictionSensitivity:[.02,.03,.04].map(roughness=>({roughness,headMm:1000*roughness**2*velocity**2/radius**(4/3)*sourceApproachLength})),
   boundary:'Actual100 approach length, quasi-uniform equivalent rectangle; roughness authored, not calibrated. Separation/lateral turn are not floor friction.'};
 });
 const shield=v.renewal.shield,entryBed=e.catchCover.gutterBedEnds[1],bodyBed=shield.clearOutlet.z[0];
 const dropMm=entryBed-bodyBed,impactSpeed=Math.sqrt(2*g*dropMm/1000);
 // Same-width rectangular momentum scenarios; no unearned lateral spread or located jump.
 const widthCases=[250,200,600].map(widthMm=>{
  const depth=q/1000/(widthMm/1000*impactSpeed),fr=impactSpeed/Math.sqrt(g*depth);
  const conjugate=depth/2*(Math.sqrt(1+8*fr*fr)-1)*1000;
  return {widthMm,idealIncomingDepthMm:depth*1000,froude:fr,idealConjugateDepthMm:conjugate,
   nominalDepthReserveMm:100-conjugate,role:widthMm===250?'Actual entry width, no earned spread':widthMm===200?'Explicit narrowed-stream sensitivity':'Unproven full600 spread comparison only'};
 });
 const rain=m.maintenanceRainReference;
 const maintenance={
  eastUnavailable:{intact:'N full duty',roofRegions:rain.eastMaintenance.roof.regions,
   divertedTo:rain.eastMaintenance.downpipe,weatherEnclosure:rain.eastMaintenance.weatherEnclosure.closedBundVertices,
   qualification:'Erect and test enclosure before release. Skirt/corner/window/portal wind-driven leakage and actual temporary-work/weather operating limits remain unbound.'},
  northShortModulesUnavailable:{intact:'E full duty; N long liner remains intact',phase:rain.northMaintenance.phaseControls.shortModules,
   courtPipe:rain.northMaintenance.courtRoof.pipe,thresholdBypass:rain.northMaintenance.thresholdBypass,
   qualification:'Court interception/pipe and threshold bypass precede short removal. Verify assigned roof jets are actually intercepted; no simultaneous long-liner removal.'},
  northLongLinerUnavailable:{intact:'E full duty; short modules reinstated',phase:rain.northMaintenance.phaseControls.longLiner,
   canopyPipe:rain.northMaintenance.loggiaRoof.pipe,
   qualification:'Loggia roof installed after short crew exits. Its separate receiver must remain available; actual drainage head/losses/impact and installed weather envelope remain unbound.'}
 };
 return {identity:'RWT-06-SELECTED-WATER-EVENT-2026-11-06',source:{path:source.path,blob:source.blob,startingMain:'8ab19d48ef16abaff39e7f49a3801d5dc5f65521',authority:source.authority,canonicalMain:source.canonicalMain,canonicalMainHadBlob:source.canonicalMainHadBlob},
  status:'NOT ADMITTED: bounded calculations and adverse cases, not a full installed event proof',
  duty:{areaM2:v.hydraulicProbe.catchment.combinedM2,syntheticRainfallMmPerHour:216,flowLps:q,quietStageMm:quiet,
   protectedGeometricCrestMm:15,splashAllocationMm:25,toleranceAllocationMm:25,qualifiedFirstHarmMm:null},
  inlet:{gradedIntervals:intervals,effectiveLengthMm:325,idealCriticalCoefficient:Math.sqrt(g)/(1.5**1.5),
   idealCriticalCapacityAtQuietLps:atQuiet,maxAdditionalKAtCleanQuiet:kMax,
   maxWidthLossFractionAtK1:1-q/mouthFlow(quiet,intervals,{lossK:1}),lossCases:losses,
   actualApproachFriction:approach,
   lossPlacement:[
    {location:'100mm court approach / under-ramp passage to x6125',method:'Source-length quasi-uniform friction sensitivity above',unbound:'Lateral convergence, detailed roughness and local contraction; do not attach all remote downstream losses to this crest.'},
    {location:'Freefall edge to catch floor−150..−180',method:'Source drop and contained gutter profile; no pressure connection if nappe remains free',unbound:'Capture efficiency, wind, side contraction and gutter backwater to the lip.'},
    {location:'Catch north return /250 hood side opening /617.6mm shaft drop',method:'Separate momentum and section screen',unbound:'Turn/plunge loss, air, actual jump, jet distribution and first-wet splash. Not the same velocity reference as inlet K.'},
    {location:'600wide E carrier / removable terminal chute',method:'Uniform-depth comparison plus full receiver projection',unbound:'Actual nonuniform profile, carried sediment, flange/capture details and terminal impact.'}
   ],
   boundary:'Extra K and width losses are explicit sensitivities, not inferred actual values, manufacturer ratings or an empirical lower bound. Critical-flow reduction requires a free, connected approach and no downstream submergence.'},
  events:event,
  normalCrossbody:{hydraulicTrialDepthMm:n.crossIntake.hydraulicTrialDepth,coverMinimumGapMm:n.crossIntake.grossDepthBelowCoverMinimum,
   cleanTrialCapacityLps:1000*manningFlow(.25,.04,.02,.01),
   roughnessSensitivity:[.015,.02,.025,.03].map(roughness=>({roughness,...channelAtFlow(q,.25,roughness,.01)}))},
  eastDrop:{dropMm,idealImpactVelocityMps:impactSpeed,entryWidthMm:250,widthCases,
   depthBudgetMm:100,qualifiedSplashEnvelope:null,
   boundary:'Ideal same-width free-fall/rectangular momentum scenarios only; actual250 entry has no defined250-to600 spreader. No actual jump location, turn, air, waves or first-wetting envelope is established. Positive nominal reserve is not capture admission.'},
  receivers:{interface:{source:iface.source,identity:iface.identity,siteAccepted:false},
   historicalNorth:{terminal:historicalTerminal,trajectoryCases:terminalCases,
    finding:'Preserved negative: former terminal is100mm short of receiver near edge; vertical air gap alone did not establish reception.'},
   north:{terminal:normalTerminal,verticalDischargeMarginsMm:np,
    finding:'Current RWT footprint starts13450: unchanged13550 exit centre is100 inside; entire250×100 vertical jet is50 inside. Reserved impact/splash/terrain limits are not physical qualification.'},
   east:{activeReceiverMaximumMm:v.passage.outerReceivingWaterMaximumTrial,
    carrierEndX:v.renewal.pieces.find(p=>p.id==='outer').bodyX[1],
    receivingFootprint:ei.receiverBounds,retainedStructuralPenetrations:ei.retainedStructuralPenetrations,terminal:nozz,landingVelocityEnvelope:ep,
    removal:{sequence:terminalSteps,releaseToolCases:releaseTools,stage:st,lift:ei.maintenance.capturedLift,
     lowestLiftedPointMm:nozz.bed.at(-1)[1]+ei.maintenance.capturedLift,
     clearanceAboveEmptyRackForkMm:nozz.bed.at(-1)[1]+ei.maintenance.capturedLift-v.renewal.joint.handling.postTop},
    finding:'Actual removable600clear descending cartridge and2000×1600 receiver now have contained ideal projection. The new required maximum water−1400 is a stricter conditional site limit, not a surveyed fact or admitted splash envelope.'},
   maintenance:{maximumMm:v.passage.maintenanceTrackReceivingWaterMaximumTrial,invertMm:v.renewal.maintenanceCatchDrain.outlet[2],
    finding:'Local catch is not a full-duty path; capacity and actual exterior reception require their own evidence.'}},
  receiverBlockedOutletScreens:[['north',iface.north],['east',iface.east]].map(([name,r])=>{
   const s=r.blockedOutletSpill,crest=s.edge[0][2];
   return {receiver:name,spill:s,directedSpillBoundary:r.directedSpillBoundary,directionProved:false,fullDutyLps:q,cases:[1,.5].map(f=>{
    const idealHead=1000*(q/1000/(Math.sqrt(g)/(1.5**1.5)*(s.clearWidth/1000)*f))**(2/3);
    const stage=crest+idealHead,exit=name==='north'?r.outlet[2]:r.terminal.farLip[2];
    return {remainingWidthFraction:f,idealHeadMm:idealHead,idealStageMm:stage,belowDeclaredFaultMaximum:stage<=s.maximumFaultedReceiverWater,
     airGapBelowActiveExitMm:exit-stage};
   }),boundary:'Necessary ideal nominated-edge screen ONLY; direction is CONDITIONAL. Other three retaining/terrain boundaries must exceed faulted water plus unqualified wave/splash/movement/tolerance allowance. A50lower all-rim crest is REJECTED because it spills sideways too. Actual continuing terrain, roughness, obstructions, erosion, retaining works and impact remain site/RWT conditions.'};
  }),
  maintenance,
  eventDisposition:[
   {state:'N mouth/normal route disabled, E receiver available',result:'UNPROVEN full event',reason:'Loss budget quantified; actual approach/capture/hood losses and first wetting remain unbound.'},
   {state:'E route disabled, N receiver available',result:'UNPROVEN full event',reason:'Current N landing corrected; clean uniform section is not actual graded intake/loss/first-wetting acceptance.'},
   {state:'N unavailable and E K=1 plus25% effective width loss',result:'FAIL allocated quiet-stage sensitivity',reason:'This explicit adverse sensitivity exceeds quiet stage; it is not a calibrated physical obstruction claim.'},
   {state:'Common external water disables both gravity receivers',result:'REJECT site/state applicability',reason:'No pump, warning or timely repair receives independent escape credit.'}
  ],
  claimCeiling:{hydraulicAdmission:false,firstHarmQualified:false,physicalEventPerformed:false,siteAccepted:false,
   action:'Bind actual placed entry/capture losses and first-wetting envelope. Current receiver interface is consumed by HAD; verify temporary cartridge handling and stricter head/terrain/impact conditions before use.'},
  sources:[
   {url:'https://www.usbr.gov/tsc/techreferences/mands/wmm/chap02_13.html',accessed:'2026-11-06',scope:'Critical-section specific energy; empirical corrections for curvature, friction and velocity distribution.'},
   {url:'https://www.usbr.gov/tsc/techreferences/mands/wmm/chap07_03.html',accessed:'2026-11-06',scope:'Crest classification, approach, contraction and submergence; no calibration for this house.'},
   {url:'https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/6.2/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/applications-of-the-momentum-equation',accessed:'2026-11-06',scope:'Hydrostatic momentum balance for rapidly varying flow; rectangular sequent-depth scenario is not actual jump location or splash qualification.'},
   {url:'https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/7.0/modeling-pipe-networks/pipe-minor-losses',accessed:'2026-11-06',scope:'K times local velocity head and separate angled/plunging losses; NOT imported coefficients for the open house inlet.'}
  ]};
}
export function render(out){
 const nr=out.receivers.north.terminal.receiver.bounds,er=out.receivers.east.receivingFootprint;
 const x=a=>55+a*.035,y=a=>710-a*.035;
 const r=(p,c)=>`<rect x="${x(p[0])}" y="${y(p[1]+p[3])}" width="${p[2]*.035}" height="${p[3]*.035}" fill="${c}" stroke="#53616a"/>`;
 const t=(a,b,s,size=15)=>`<text x="${a}" y="${b}" font-size="${size}">${s}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000"><rect width="100%" height="100%" fill="#fcfaf5"/><g font-family="sans-serif" fill="#24333a">';
 s+=t(35,35,'Selected-house receiving interface and event limits',24)+t(35,64,'RWT project reference: geometry and conditional hydraulic bounds, not physical/site admission');
 s+=r([0,0,12000,12000],'#e7e3da')+r([4250,4250,3500,3500],'#f8f2df');
 s+=r([4875,7750,250,5800],'#79b4cc')+r([7750,6600,4500,600],'#79b4cc');
 s+=r(nr,'#8ebaa4')+r(er,'#8ebaa4');
 for(const q of out.receiverBlockedOutletScreens)s+=r(q.spill.requiredContinuation,'#d2e1c0');
 s+=r(out.receivers.east.terminal.grossPlan,'#d5ac71');
 s+=t(60,745,'Plan: blue actual carriers; green receiver; pale green required passive continuation.');
 s+=t(60,772,'N original receiver started100 past exit; current full jet has50 near-edge setback.');
 s+=t(60,799,'E removable cartridge descends BETWEEN rails. It leaves before module withdrawal.');
 s+=t(60,826,'No shared pipe/basin; spill direction needs higher OTHER boundaries. All-rim low crests FAIL.');
 const px=a=>770+(a-12000)*.14,pz=a=>325-a*.19;
 s+=t(760,115,'E longitudinal section / receiver projection',20);
 s+=`<path d="M${px(12000)} ${pz(0)} H${px(16000)}" stroke="#59666e" stroke-width="3"/>`;
 const bed=out.receivers.east.terminal.bed;
 s+=`<path d="M${px(bed[0][0])} ${pz(bed[0][1])} L${px(bed[1][0])} ${pz(bed[1][1])}" fill="none" stroke="#98642d" stroke-width="5"/>`;
 s+=`<path d="M${px(er[0])} ${pz(-1400)} H${px(er[0]+er[2])}" stroke="#287b9b" stroke-width="3"/>`;
 s+=`<path d="M${px(12750)} ${pz(-1200)} V${pz(-1400)}" stroke="#287b9b" stroke-dasharray="5 4"/>`;
 s+=t(760,185,'Cartridge bed−852.94 → −1200 / catch maximum−1400');
 s+=t(760,215,'600 stream +500 side reservations; no calibrated splash claim.');
 s+=t(760,245,`Worst ideal horizontal throw ${out.receivers.east.landingVelocityEnvelope.maximumIdealHorizontalThrowMm.toFixed(1)} mm`);
 s+=t(760,275,'uses all head from geometric15; roof-jet/wind energy is excluded.');
 s+=t(760,650,'Actual entry-loss placement',20);
 s+=t(760,682,'100 approach: floor-friction sensitivities0.51..3.36 mm.');
 s+=t(760,713,'Actual325 contraction is separate from floor friction.');
 s+=t(760,744,'250 entry: ideal jump99.10 /100 depth, no earned600 spread.');
 s+=t(760,775,'K1 leaves4.43 mm allocated quiet-stage reserve.');
 s+=t(760,806,'K1 +25% width loss exceeds the quiet allocation.');
 s+=t(760,837,'Sensitivities are not assigned actual K or a rating.');
 s+=t(35,915,'No actual plot, disposal, qualified first harm, installed seal, splash/capture rating or physical event is claimed.',17);
 s+=t(35,948,'Maintain N during E work; stage short/long N work separately; restore outlet cartridge before E admission.',17);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const out=build(),outputs=new Map([['project/rwt/studies/selected-water-event.json',JSON.stringify(out,null,2)+'\n'],['project/rwt/studies/selected-water-event.svg',render(out)]]);
 for(const[target,content]of outputs){
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),content,'Selected event output stale: '+target);
  else fs.writeFileSync(target,content);
 }
 console.log('Selected source event reproduced; hydraulic admission remains false.');
}
