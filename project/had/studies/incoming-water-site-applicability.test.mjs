import assert from 'node:assert/strict';
import test from 'node:test';
import {compareInletSite} from './incoming-water-site-applicability.mjs';

const completeTrial={landingGradeMM:-1800,siteWaterMM:-2000,requiredDryFreeboardMM:100,
  carrierHeightMM:2011,carrierMassKG:300,carrierProfileFits:true,
  dryRectangularField:[12000,19000,0,6100],fieldEvidenceComplete:true,
  matchedPlate:true,gantrySupport:true,gantryNativeCapture:true,liftNativeMatch:true};
const mode=(result,id)=>result.modes.find(m=>m.id===id);
const nearLevel=drop=>({...completeTrial,landingGradeMM:-26-drop});

test('site decision compares actual drop and carrier height without promoting unknown evidence',()=>{
  const absent=compareInletSite();
  assert.equal(absent.preferredInsideTrial,null);
  assert(absent.modes.every(m=>m.status==='EVIDENCE_MISSING'));
  assert.equal(absent.protectedEntry.status,'EVIDENCE_MISSING');
  assert.equal(compareInletSite({...completeTrial,carrierProfileFits:null}).preferredInsideTrial,null);
  const baseline=compareInletSite(completeTrial);
  assert.equal(baseline.preferredInsideTrial,'temporary-gantry');
  assert.equal(baseline.dropMM,1774);
  assert.equal(baseline.reference.gantryStrokeDropLimitMM,1850);
  assert.deepEqual(baseline.reference.gantryHeightDropLimitMM,{W9:1888,fullDoor:1599});
  assert.deepEqual(baseline.reference.fixedThroughMinimumDropsMM,[450,520]);
  assert.equal(mode(baseline,'fixed-through-ramp').endOfTrialX,18630);
  assert.equal(compareInletSite(nearLevel(5)).preferredInsideTrial,'level-bridge');
  assert.equal(compareInletSite(nearLevel(-5)).preferredInsideTrial,'level-bridge');
  assert.equal(mode(compareInletSite(nearLevel(6)),'level-bridge').status,'OUTSIDE_TRIAL');
  assert.equal(compareInletSite({...nearLevel(1850),siteWaterMM:-2300}).preferredInsideTrial,'temporary-gantry');
  assert.equal(compareInletSite({...nearLevel(1851),siteWaterMM:-2300}).preferredInsideTrial,'fixed-through-flush');
  assert.equal(compareInletSite({...completeTrial,carrierHeightMM:2300}).preferredInsideTrial,'fixed-through-flush');
  assert.equal(mode(compareInletSite(nearLevel(519)),'fixed-through-ramp').status,'OUTSIDE_TRIAL');
  assert.equal(mode(compareInletSite(nearLevel(520)),'fixed-through-ramp').status,'INSIDE_TRIAL_LIMITS');
});

test('wet overlap, loss of support and low dry freeboard defeat otherwise fitting levels',()=>{
  const wetTransfer=compareInletSite({...completeTrial,wetExclusions:[[15000,16600,2100,3200]],wetSetbackMM:0});
  assert.equal(mode(wetTransfer,'temporary-gantry').status,'OUTSIDE_TRIAL');
  assert.equal(wetTransfer.preferredInsideTrial,'fixed-through-flush');
  const shortField=compareInletSite({...completeTrial,dryRectangularField:[12000,17845,0,6100]});
  assert.equal(mode(shortField,'fixed-through-ramp').status,'OUTSIDE_TRIAL');
  const eastSpill=[[14500,18900,6100,7700]];
  assert.equal(mode(compareInletSite({...completeTrial,wetExclusions:eastSpill,wetSetbackMM:40}),'fixed-through-flush').status,'INSIDE_TRIAL_LIMITS');
  assert.equal(mode(compareInletSite({...completeTrial,wetExclusions:eastSpill,wetSetbackMM:41}),'fixed-through-flush').status,'OUTSIDE_TRIAL');
  assert.equal(mode(compareInletSite({...completeTrial,wetExclusions:eastSpill}),'fixed-through-flush').status,'EVIDENCE_MISSING');
  assert.equal(compareInletSite({...completeTrial,siteWaterMM:-1750}).preferredInsideTrial,null);
  assert.equal(compareInletSite({...completeTrial,gantrySupport:false}).preferredInsideTrial,'fixed-through-flush');
  assert.equal(mode(compareInletSite({...nearLevel(200),gantrySupport:false}),'fixed-through-flush').status,'OUTSIDE_TRIAL');
  assert.equal(compareInletSite({...nearLevel(200),gantrySupport:false}).preferredInsideTrial,null);
  assert.throws(()=>compareInletSite({dryRectangularField:[2,1,3,4]}),TypeError);
});

test('protected entry is independently surveyed and the owner cut cannot stand in for the provider cut',()=>{
  const input={...completeTrial,entryGradeMM:-1800,requiredEarthCoverMM:900,maximumProtectedRiseMM:3300,
    riserExcavationRadiusMM:250,entryEnclosureQualified:true,providerCutVerified:true};
  const result=compareInletSite(input);
  assert.equal(result.protectedEntry.protectedRiseMM,3300);
  assert.equal(result.protectedEntry.capRadiusBudgetMM,300);
  assert.equal(result.protectedEntry.ductRadiusMM,100);
  assert.equal(result.protectedEntry.status,'INSIDE_TRIAL_LIMITS');
  assert.equal(result.protectedEntry.controlledBatchLitres,5);
  assert.deepEqual(result.protectedEntry.cuts.at(-1).cuts,['provider upstream isolation']);
  assert.equal(compareInletSite({...input,riserExcavationRadiusMM:301}).protectedEntry.status,'OUTSIDE_TRIAL');
  assert.equal(compareInletSite({...input,entryGradeMM:-1801}).protectedEntry.status,'OUTSIDE_TRIAL');
  assert.equal(compareInletSite({...input,providerCutVerified:null}).protectedEntry.status,'EVIDENCE_MISSING');
  assert.equal(compareInletSite({...input,landingGradeMM:-26}).protectedEntry.protectedRiseMM,3300);
});
