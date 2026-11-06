import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build,readSelected,mouthFlow,mouthStage,manningFlow,receiverThrow,receivingProjection,render} from './selected-water-event.mjs';

test('actual selected mouth has a finite loss/obstruction budget, not the copied ideal-weir pass',()=>{
 const out=build(),i=out.inlet,q=out.duty.flowLps;
 assert.equal(i.effectiveLengthMm,325);
 assert(i.maxAdditionalKAtCleanQuiet>1.3&&i.maxAdditionalKAtCleanQuiet<1.5);
 assert(i.lossCases.find(x=>x.lossK===1&&x.remainingFraction===1).satisfiesAllocatedQuietStage);
 assert(!i.lossCases.find(x=>x.lossK===1.5&&x.remainingFraction===1).satisfiesAllocatedQuietStage);
 assert(!i.lossCases.find(x=>x.lossK===1&&x.remainingFraction===.75).satisfiesAllocatedQuietStage);
 assert.equal(out.claimCeiling.hydraulicAdmission,false);
 assert.equal(out.duty.qualifiedFirstHarmMm,null);
 const intervals=i.gradedIntervals;
 assert(mouthFlow(-35,intervals,{lossK:1})<mouthFlow(-35,intervals));
 assert(mouthStage(q,intervals,{lossK:1})>mouthStage(q,intervals));
 assert(mouthStage(q,[[7275,7375]])>-35,'Losing the larger actual interval must not silently retain full duty');
});

test('energy-derived coefficient follows critical energy conservation and catches unit/width substitution',()=>{
 const out=build();
 assert(Math.abs(out.inlet.idealCriticalCoefficient-Math.sqrt(9.81)*(2/3)**1.5)<1e-12);
 assert(manningFlow(.6,.02,.02,50/4250)>0);
 assert.throws(()=>mouthFlow(-35,[[7400,6950]]));
 assert.throws(()=>mouthFlow(-35,[[6950,7175]],{remainingFraction:1.1}));
 assert(mouthFlow(-35,[[6950,7175],[7275,7375]])<mouthFlow(-35,[[6950,7400]]),'Actual guard shadows must reduce capacity');
});

test('a vertical air gap cannot replace the receiver plan landing',()=>{
 const s=readSelected(),t=s.model.model.northNormalRoute.historicalTerminal;
 const full=receiverThrow(3.60375,t,100);
 assert.equal(full.receiverNearEdgeGapMm,100);
 assert(!full.idealReachesNearEdge);
 // A named geometry correction is visibly different; don't weaken the current-source result.
 const candidate=s.model.model.northNormalRoute.terminal;
 assert(receiverThrow(3.60375,candidate,100).idealReachesNearEdge);
 assert.equal(t.receiver.bounds[1],13650);
});

test('both maintenance states preserve actual phase and separate receiving requirements',()=>{
 const o=build();
 assert.equal(o.maintenance.northShortModulesUnavailable.phase.loggiaPipePresent,false);
 assert.equal(o.maintenance.northShortModulesUnavailable.phase.longLinerIntact,true);
 assert.equal(o.maintenance.northLongLinerUnavailable.phase.loggiaPipePresent,true);
 assert.equal(o.maintenance.northLongLinerUnavailable.canopyPipe.receivingMaximum,-800);
 assert.equal(o.maintenance.eastUnavailable.intact,'N full duty');
 assert.deepEqual(o.receivers.east.receivingFootprint,[12500,6100,2000,1600]);
 assert.deepEqual(JSON.parse(fs.readFileSync('project/rwt/studies/selected-water-event.json','utf8')),o,'Committed event output must reproduce in canonical RWT health');
 assert.equal(fs.readFileSync('project/rwt/studies/selected-water-event.svg','utf8'),render(o));
});

test('actual receiver projections and rail clearance do not borrow the historical vertical-gap pass',()=>{
 const o=build(),e=o.receivers.east;
 assert(e.landingVelocityEnvelope.containedGeometricEnvelope);
 assert(e.landingVelocityEnvelope.margins.downstream>700);
 assert.equal(o.receivers.north.verticalDischargeMarginsMm.south,50);
 assert(!receivingProjection([12750,6900,-1200],[12500,6100,500,1600],15,-1400,600).containedGeometricEnvelope);
 const source=readSelected(),bad=structuredClone(source);
 bad.model.renewal.activeOutlet.terminal.grossPlan[1]=6500;
 bad.model.model.rwtReceivingInterface.east.terminal.grossPlan[1]=6500;
 assert.throws(()=>build(bad),/cuts longitudinal rails/);
});

test('outlet cartridge handling preserves open-cover and reinstatement-before-closure order',()=>{
 const s=readSelected(),o=build(s);
 assert(o.receivers.east.removal.releaseToolCases.every(t=>t.actualShaftLengthMm<=2300&&t.referenceGripReachMm<600&&t.headToPanRimMm>25));
 assert(o.receivers.east.removal.clearanceAboveEmptyRackForkMm>=200);
 for(const mutate of [
  a=>{a.model.renewal.selectedSequence=a.model.renewal.joint.sequence;},
  a=>{const x=a.model.renewal.selectedSequence;x.push(x.splice(x.length-2,1)[0]);}
 ]){const bad=structuredClone(s);mutate(bad);assert.throws(()=>build(bad),/closed covers|MAT state/);}
});

test('actual250 entry cannot borrow unearned uniform600 spread',()=>{
 const d=build().eastDrop,c=w=>d.widthCases.find(x=>x.widthMm===w);
 assert.equal(d.entryWidthMm,250);
 assert(c(250).idealConjugateDepthMm>99&&c(250).nominalDepthReserveMm<1);
 assert(c(200).nominalDepthReserveMm<0);
 assert(c(600).idealConjugateDepthMm<65);
 assert(c(250).idealConjugateDepthMm>c(600).idealConjugateDepthMm);
 assert.equal(d.qualifiedSplashEnvelope,null);
});

test('nominated spill edges do not imply that all receiver rims are below faulted water',()=>{
 const o=build();
 for(const r of o.receiverBlockedOutletScreens){
  const d=r.directedSpillBoundary;
  assert.equal(r.directionProved,false);assert.equal(d.directionProved,false);
  assert.equal(d.allRimsAtNominatedLowSpillLevelRejected,true);
  assert.equal(d.nonSpillBoundaries.length,3);
  assert(d.nonSpillBoundaries.every(e=>e.crestMustBeStrictlyAboveFaultedWaterZ===r.spill.maximumFaultedReceiverWater));
  assert.equal(d.additionalWaveSplashMovementToleranceMm,null);
  assert(d.nonSpillBoundaries.every(e=>e.crestMustBeStrictlyAboveFaultedWaterZ>d.nominatedLowSpillEdge[0][2]));
  assert.equal(d.physicalContainmentAccepted,false);assert.equal(d.siteAccepted,false);
 }
});
