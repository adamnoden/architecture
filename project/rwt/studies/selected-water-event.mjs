/** One selected-house event investigation. Sensitivities are not calibrated coefficients. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const path='project/had/studies/water-replan.json';
const expectedBlob='f7324121f59cc5f1707ea47640dd2b20c26b9bbb';
const g=9.81;
export function readSelected(){
 const raw=fs.readFileSync(path,'utf8');
 const blob=crypto.createHash('sha1').update(`blob ${Buffer.byteLength(raw)}\0`).update(raw).digest('hex');
 assert.equal(blob,expectedBlob,'Selected HAD changed: rebind actual event geometry, not only this hash');
 return {path,blob,model:JSON.parse(raw)};
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
 const normalTerminal=m.northNormalRoute.terminal;
 const terminalCases=[10,25,40,75,100].map(d=>receiverThrow(q,normalTerminal,d));
 const shield=v.renewal.shield,entryBed=e.catchCover.gutterBedEnds[1],bodyBed=shield.clearOutlet.z[0];
 const dropMm=entryBed-bodyBed,impactSpeed=Math.sqrt(2*g*dropMm/1000),impactDepth=q/1000/(.6*impactSpeed);
 const fr=impactSpeed/Math.sqrt(g*impactDepth),conjugate=impactDepth/2*(Math.sqrt(1+8*fr*fr)-1);
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
 return {identity:'RWT-06-SELECTED-WATER-EVENT-2026-11-06',source:{path:source.path,blob:source.blob,startingMain:'8ab19d48ef16abaff39e7f49a3801d5dc5f65521'},
  status:'NOT ADMITTED: bounded calculations and adverse cases, not a full installed event proof',
  duty:{areaM2:v.hydraulicProbe.catchment.combinedM2,syntheticRainfallMmPerHour:216,flowLps:q,quietStageMm:quiet,
   protectedGeometricCrestMm:15,splashAllocationMm:25,toleranceAllocationMm:25,qualifiedFirstHarmMm:null},
  inlet:{gradedIntervals:intervals,effectiveLengthMm:325,idealCriticalCoefficient:Math.sqrt(g)/(1.5**1.5),
   idealCriticalCapacityAtQuietLps:atQuiet,maxAdditionalKAtCleanQuiet:kMax,
   maxWidthLossFractionAtK1:1-q/mouthFlow(quiet,intervals,{lossK:1}),lossCases:losses,
   boundary:'Extra K and width losses are explicit sensitivities, not inferred actual values, manufacturer ratings or an empirical lower bound. Critical-flow reduction requires a free, connected approach and no downstream submergence.'},
  events:event,
  normalCrossbody:{hydraulicTrialDepthMm:n.crossIntake.hydraulicTrialDepth,coverMinimumGapMm:n.crossIntake.grossDepthBelowCoverMinimum,
   cleanTrialCapacityLps:1000*manningFlow(.25,.04,.02,.01),
   roughnessSensitivity:[.015,.02,.025,.03].map(roughness=>({roughness,...channelAtFlow(q,.25,roughness,.01)}))},
  eastDrop:{dropMm,idealImpactVelocityMps:impactSpeed,idealIncomingDepthMm:impactDepth*1000,idealConjugateDepthMm:conjugate*1000,
   depthBudgetMm:100,qualifiedSplashEnvelope:null,
   boundary:'Ideal full-width free-fall and rectangular momentum jump only. Actual250-side-notch turn/width, deflector, jet distribution, jump location, air entrainment, waves and vulnerable material wetting are NOT established.'},
  receivers:{north:{terminal:normalTerminal,trajectoryCases:terminalCases,
    finding:'Named terminal is100mm short of receiver near edge. No actual supported nozzle/chute or required jet envelope binds the landing. Do not claim the200mm vertical gap establishes reception.'},
   east:{activeReceiverMaximumMm:v.passage.outerReceivingWaterMaximumTrial,
    carrierEndX:v.renewal.pieces.find(p=>p.id==='outer').bodyX[1],
    receivingFootprint:null,landingVelocityEnvelope:null,
    finding:'A receiving-water level is authored, but the selected active E source has no located receiving footprint/nozzle/landing-splash envelope. Distinct compass direction/low level is not complete harmless reception.'},
   maintenance:{maximumMm:v.passage.maintenanceTrackReceivingWaterMaximumTrial,invertMm:v.renewal.maintenanceCatchDrain.outlet[2],
    finding:'Local catch is not a full-duty path; capacity and actual exterior reception require their own evidence.'}},
  maintenance,
  eventDisposition:[
   {state:'N mouth/normal route disabled, E receiver available',result:'UNPROVEN full event',reason:'Loss budget quantified; actual approach/capture/hood losses and first wetting remain unbound.'},
   {state:'E route disabled, N receiver available',result:'UNPROVEN full event',reason:'N clean uniform section is not actual intake/terminal acceptance; reception gap remains.'},
   {state:'N unavailable and E K=1 plus25% effective width loss',result:'FAIL allocated quiet-stage sensitivity',reason:'This explicit adverse sensitivity exceeds quiet stage; it is not a calibrated physical obstruction claim.'},
   {state:'Common external water disables both gravity receivers',result:'REJECT site/state applicability',reason:'No pump, warning or timely repair receives independent escape credit.'}
  ],
  claimCeiling:{hydraulicAdmission:false,firstHarmQualified:false,physicalEventPerformed:false,siteAccepted:false,
   action:'Bind/calibrate actual entry and capture losses, terminal/receiver landings and first-wetting envelope on this source. Return any geometric correction to HAD/MAT owners; never silently edit selected geometry.'},
  sources:[
   {url:'https://www.usbr.gov/tsc/techreferences/mands/wmm/chap02_13.html',accessed:'2026-11-06',scope:'Critical-section specific energy; empirical corrections for curvature, friction and velocity distribution.'},
   {url:'https://www.usbr.gov/tsc/techreferences/mands/wmm/chap07_03.html',accessed:'2026-11-06',scope:'Crest classification, approach, contraction and submergence; no calibration for this house.'},
   {url:'https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/7.0/modeling-pipe-networks/pipe-minor-losses',accessed:'2026-11-06',scope:'K times local velocity head and separate angled/plunging losses; NOT imported coefficients for the open house inlet.'}
  ]};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const out=JSON.stringify(build(),null,2)+'\n',target='project/rwt/studies/selected-water-event.json';
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),out,'Selected event output stale');
 else fs.writeFileSync(target,out);
 console.log('Selected source event reproduced; hydraulic admission remains false.');
}
