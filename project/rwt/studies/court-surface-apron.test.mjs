import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {compareSurfaceApron} from './court-surface-apron.mjs';

const near=(a,b,epsilon=1e-8)=>assert(Math.abs(a-b)<epsilon,`${a} != ${b}`);

test('full open surface relief leaves no dry exit through the existing loggia envelope',()=>{
 const d=compareSurfaceApron(),s=d.selected;
 assert.deepEqual(s.loggiaGross,[4800,7750,2400,4250]);
 assert.deepEqual(s.dryStripsGrossMm,[25,75,100]);
 assert.equal(s.maxSingleGrossDryStripMm,100);
 near(s.loggiaGrossWidthMm,2400);
 near(s.normalGrossWidthMm,400);
 near(s.reliefGrossWidthMm,1800);
 near(s.normalToReliefGapMm,75);
 near(s.chuteGrossWidthMm,600);
 near(s.widthReductionMm,1200);
 assert.equal(d.hypothetical.widthAndDryPathConflict,true);
 assert(!Object.hasOwn(d,'safePedestrianExitAccepted'));
});

test('positive apron landing overlap has a footprint and an unlanded water-level discontinuity',()=>{
 const d=compareSurfaceApron(),a=d.hypothetical;
 near(d.selected.receiverFrontYmm,13650);
 near(d.selected.chuteBestCaseLipYmm,13550);
 near(a.nominalLandingOverlapMm,300);
 near(a.targetLipYmm,13950);
 near(a.runFromGuardMm,750);
 near(a.extraBeyondSelectedChuteMm,400);
 near(a.footprintGrossM2,1.35);
 near(a.assumedSurfaceSlope,.01);
 near(a.startLevelMm,-152.5);
 near(a.endLevelMm,-160);
 near(a.authoredReceiverWaterLevelMm,-800);
 near(a.terminalDropToAuthoredReceiverWaterMm,640);
 near(a.retainedNormalTerminalPlanGapMm,100);
 assert.match(a.status,/Comparison only/);
});

test('pinching 1800 to 600 cannot borrow the full-width gentle-slope proof',()=>{
 const f=compareSurfaceApron().flowComparison;
 near(f.intensityMmPerHour,216);
 near(f.fullDutyLitresPerSecond,3.60375);
 near(f.idealConstantOnePercentWideDepthMm,10.5116403311734);
 near(f.idealConstantOnePercentPinchedDepthMm,20.775821076123123);
 assert(f.idealConstantOnePercentPinchedDepthMm>f.idealConstantOnePercentWideDepthMm);
 assert.match(f.scope,/NOT a chute capacity/);
 assert(!Object.hasOwn(f,'chuteCapacityApproved'));
});

test('selected source changes invalidate the finite loggia/apron comparison',()=>{
 const wrongPlan=structuredClone(readInputs());
 wrongPlan.house.model.loggia.clear[2]=2700;
 assert.throws(()=>compareSurfaceApron(wrongPlan),/Expected values|deep-equal|2700/);
 const wrongChannel=structuredClone(readInputs());
 wrongChannel.house.model.outdoorWaterTerritories.relief[2]=600;
 assert.throws(()=>compareSurfaceApron(wrongChannel));
 const movedReceiver=structuredClone(readInputs());
 movedReceiver.envelope.model.terminals.relief.receiver.bounds[1]=13550;
 assert.throws(()=>compareSurfaceApron(movedReceiver),/outlet\/receiver plan alignment changed/);
});
