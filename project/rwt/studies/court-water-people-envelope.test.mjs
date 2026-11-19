import test from 'node:test';
import assert from 'node:assert/strict';
import { readInputs } from './open-loggia-event.mjs';
import { compareCourtWaterAndPeople } from './court-water-people-envelope.mjs';

const near=(a,b,e=1e-8)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);

test('the selected 2400 portal has only 100 mm maximum separate unused edge',()=>{
  const v=compareCourtWaterAndPeople(),s=v.selected;
  near(s.throatMm,2400);
  near(s.courtGrossMm,3500);
  near(s.originalRoughPortalMm,2960);
  near(s.originalPortalFinishLossMm,560);
  near(s.normalGrossMm,400);
  near(s.existingSeparatorMm,75);
  near(s.selectedReliefMm,1800);
  assert.deepEqual(s.originalGrossDryStripsMm,[25,75,100]);
  near(s.actualLargestUnusedEdgeGrossMm,100);
  assert.equal(typeof v.inputBlobs.had,'string');
  assert.equal(typeof v.inputBlobs.mat,'string');
});

test('independent 1200 gross pedestrian lane does not fit BOTH present water routes',()=>{
  const v=compareCourtWaterAndPeople(),s=v.simultaneousTrial;
  near(s.dryGrossTrialMm,1200);
  near(s.secondWetDrySeparatorMm,75);
  near(s.requiredFinishedThroatMm,3550);
  near(s.exceedsSelectedThroatMm,1150);
  near(s.exceedsEntireCourtGrossMm,50);
  near(s.nominalRoughPortalIfOld560FinishLossContinuedMm,4110);
  near(s.nominalRoughPortalOverCourtGrossMm,610);
  assert(s.noFitWithinSelectedHouse);
  assert.match(s.description,/NEW 75 gross wet\/dry separator/);
  assert.match(v.hardFaults.join(' '),/BEFORE piers/);
});

test('outward-roof 600-wide full-length relief is only a tight gross width proposition',()=>{
  const v=compareCourtWaterAndPeople(),o=v.outwardRoofOnlyTrial;
  near(o.futureReliefGrossMm,600);
  near(o.requiredFinishedThroatMm,2350);
  near(o.remainingUnallocatedGrossMm,50);
  near(o.with900GrossDryTrial.dryGrossMm,900);
  near(o.with900GrossDryTrial.requiredFinishedThroatMm,2050);
  near(o.with900GrossDryTrial.remainingUnallocatedGrossMm,350);
  near(o.divertedRoofCatchmentM2,47.8125);
  near(o.displacedRoofLoadToExteriorLitresPerSecondAt216,2.86875);
  assert.match(o.notPresentSource,/terminal contraction/);
  assert(o.sourceRoofStillInward);
  assert(o.positiveIdealHeadNotWaterSafety);
});

test('current roof failure still defeats 600 relief ideal 60 mm dam screen',()=>{
  const v=compareCourtWaterAndPeople(),c=v.outwardRoofOnlyTrial.courtLoadBeforeAndAfter;
  near(c.current.litresPerSecond,3.60375);
  near(c.outwardOnlyCounterfactual.litresPerSecond,.735);
  near(c.current.idealSeparationToUnqualifiedJoinWith60MmDamMm,-3.152818109936934);
  near(c.outwardOnlyCounterfactual.idealSeparationToUnqualifiedJoinWith60MmDamMm,11.97782160029027);
  assert(c.current.idealSeparationToUnqualifiedJoinWith60MmDamMm<0);
  assert(c.outwardOnlyCounterfactual.idealSeparationToUnqualifiedJoinWith60MmDamMm>0);
  assert(c.current.idealUniformDepthOnOnePercentMm>
    c.outwardOnlyCounterfactual.idealUniformDepthOnOnePercentMm);
  assert.match(v.hardFaults.join(' '),/common north-mouth obstruction/);
  assert(!Object.hasOwn(v,'acceptedDryRoute'));
  assert.match(v.decision,/RWT-06 remains planned/);
});

test('changed selected source geometry refuses an inherited width or load conclusion',()=>{
  const wider=structuredClone(readInputs());
  wider.house.model.loggia.clear[2]=2600;
  assert.throws(()=>compareCourtWaterAndPeople(wider));
  const currentRelief=structuredClone(readInputs());
  currentRelief.envelope.model.protectedWater.relief.minimumClearWidth=1200;
  assert.throws(()=>compareCourtWaterAndPeople(currentRelief));
  const alteredArch=structuredClone(readInputs());
  alteredArch.house.model.insulatedPortal.rawSpan=3010;
  assert.throws(()=>compareCourtWaterAndPeople(alteredArch));
});
