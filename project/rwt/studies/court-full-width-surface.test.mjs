import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {compareOpenSurfaceRoute} from './court-full-width-surface.mjs';

const near=(a,b,epsilon=1e-8)=>assert(Math.abs(a-b)<epsilon,`${a} != ${b}`);

test('selected outdoor loggia already has a continuous 1 percent floor datum',()=>{
 const v=compareOpenSurfaceRoute(),d=v.selected,a=v.challenger;
 assert.deepEqual(d.footprint,[4800,7750,2400,4250]);
 near(d.courtMouthMm,-110);near(d.outerBoundaryMm,-152.5);
 near(d.nominalFallMm,42.5);near(d.slope,.01);
 near(d.firstHarmComparatorMm,-30);
 near(d.selectedNormalCarrierGrossMm,400);
 near(d.selectedBroadReliefMm,1800);
 near(d.selectedTerminalChuteWidthMm,600);
 assert.deepEqual(d.existingTerminalPlanGapsMm,{normal:100,relief:100});
 near(a.hypotheticalFullWidthMm,2400);
 near(a.additionalOutsideHouseRunMm,1200);
 near(a.hypotheticalContinuationEndMm,-164.5);
 near(a.unchangedAuthoredReceiverWaterMm,-800);
 near(a.elevationDiscontinuityToUnverifiedWaterMm,635.5);
 assert.match(a.arrangement,/Actual supporting\/weathering\/occupation/);
 assert(!Object.hasOwn(v,'acceptedFullWidthDrainage'));
});

test('full inward-roof failure must still be compared against direct court only',()=>{
 const v=compareOpenSurfaceRoute();
 const high=v.events.find(e=>e.intensityMmPerHour===216);
 near(high.cases.selectedInwardRoofFailure.catchmentM2,60.0625);
 near(high.cases.futureOutwardOnlyIntact.catchmentM2,12.25);
 near(high.cases.selectedInwardRoofFailure.litresPerSecond,3.60375);
 near(high.cases.futureOutwardOnlyIntact.litresPerSecond,.735);
 near(high.cases.selectedInwardRoofFailure.fullWidthUniformDepthMm,8.830060016696297);
 near(high.cases.futureOutwardOnlyIntact.fullWidthUniformDepthMm,3.3954748249957722);
 assert(high.cases.selectedInwardRoofFailure.fullWidthUniformDepthMm>
  high.cases.futureOutwardOnlyIntact.fullWidthUniformDepthMm);
 for(let i=1;i<v.events.length;i++){
  assert(v.events[i].cases.selectedInwardRoofFailure.litresPerSecond>
   v.events[i-1].cases.selectedInwardRoofFailure.litresPerSecond);
 }
 assert.equal(v.challenger.remainingRequirements.some(x=>x.includes('60.0625 m2 stress')),true);
});

test('even the widened mouth fails an obstruction or common receiving-water case',()=>{
 const v=compareOpenSurfaceRoute(),s=v.adverse.at216mmhFullRoofFailure;
 near(s.idealCrestEnergyMm,9.188201955935565);
 near(s.idealSeparationToUnqualifiedFirstHarmAt60MmDamMm,10.811798044064435);
 near(s.idealSeparationToUnqualifiedFirstHarmAt70MmDamMm,.8117980440644352);
 near(v.adverse.narrowed60DamJoinSeparationMm,-3.152818109936934);
 assert(v.adverse.narrowed60DamJoinSeparationMm<0);
 assert(v.adverse.commonReceivingFloodStillFails);
 assert(v.adverse.fullMouthDamStillFails);
 assert(v.adverse.realInletCapacityUnproved);
 assert(v.adverse.noSafeDetentionOrResponseTimeCredited);
 assert.equal(v.adverse.highCommonReceivingWaterAtUnqualifiedJoinMm,-30);
 assert.match(v.decision,/RWT-06 stays planned/);
});

test('normal-condition walking and full-event wetting must not be conflated',()=>{
 const v=compareOpenSurfaceRoute(),a=v.challenger;
 assert.match(a.arrangement,/accessible-in-normal-conditions/);
 assert(a.remainingRequirements.some(x=>x.includes('not treat a nominal walking surface as a dry flood escape')));
 assert(a.remainingRequirements.some(x=>x.includes('No full-width north passage survives a blanket')));
 assert(a.remainingRequirements.some(x=>x.includes('High-eave maintenance')));
 assert.match(v.authority,/not a hydraulic design/);
});

test('selected geometry and terminal source drift fail closed',()=>{
 const wide=structuredClone(readInputs());
 wide.house.model.loggia.clear[2]=2600;
 assert.throws(()=>compareOpenSurfaceRoute(wide));
 const altered=structuredClone(readInputs());
 altered.envelope.model.terminals.guardNorthY=13250;
 assert.throws(()=>compareOpenSurfaceRoute(altered));
 const lowered=structuredClone(readInputs());
 lowered.house.model.sections.waterLevels.loggiaNorth=-200;
 assert.throws(()=>compareOpenSurfaceRoute(lowered));
});
