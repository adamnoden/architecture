import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build,readSelected,mouthFlow,mouthStage,manningFlow,receiverThrow} from './selected-water-event.mjs';

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
 const s=readSelected(),t=s.model.model.northNormalRoute.terminal;
 const full=receiverThrow(3.60375,t,100);
 assert.equal(full.receiverNearEdgeGapMm,100);
 assert(!full.idealReachesNearEdge);
 // A named geometry correction is visibly different; don't weaken the current-source result.
 const candidate=structuredClone(t);candidate.receiver.bounds[1]=13450;
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
 assert.equal(o.receivers.east.receivingFootprint,null);
 assert.deepEqual(JSON.parse(fs.readFileSync('project/rwt/studies/selected-water-event.json','utf8')),o,'Committed event output must reproduce in canonical RWT health');
});
