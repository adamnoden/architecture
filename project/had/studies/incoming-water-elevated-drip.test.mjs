import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {compareElevatedDrip} from './incoming-water-elevated-drip.mjs';

const result=compareElevatedDrip();

test('the above-pan drip witness preserves spout projection and needs a first drawer motion',()=>{
  assert.equal(result.reception.dripLapMM,25.5);
  assert.equal(result.reception.lowerHoodToPipeAfterSettingMM,3);
  assert.equal(result.reception.pressureJetCaptureCredited,false);
  assert.equal(result.pan.planOverlapMM,65);
  assert.equal(result.pan.verticalReserveAfterSettingMM,15);
  assert.equal(result.pan.plenumVerticalReserveAfterSettingMM,5);
  assert.equal(result.pan.shortPanDrawMM,75);
  assert.equal(result.pan.stagingStanceX,10800);
  assert(result.pan.spouts.every(s=>s.nearestBoxPlanGapMM>=100&&s.panRimClearanceUnchangedMM===125));
  assert.equal(result.pan.actualRemovalClearanceProved,false);
});

test('the off-axis independent terminal clears the gantry comparison without a site assumption',()=>{
  const outlet=result.independentOutlet;
  assert.equal(outlet.drainY,2975);
  assert.equal(outlet.sleeveSeparationAfterSettingMM,15);
  assert.equal(outlet.terminalX,13717.5);
  assert.equal(outlet.gantryWestClearMM,1357.5);
  assert.equal(outlet.selectedWetCorridorSouthY,6100);
  assert.equal(outlet.oldTerminalInsideGantry,true);
  assert(Math.abs(outlet.receivingMaximumZ-22.06)<1e-8);
  assert(outlet.clearClogCases[1].idealControllingLmin>30);
  assert(outlet.clearClogCases[2].idealControllingLmin<17);
  assert.equal(outlet.siteReceivingWaterZ,null);
  assert.equal(outlet.roofPlantThresholdD2Credit,false);
});

test('the fixed-axis combined sleeve has no liner allowance at support exit',()=>{
  const annulus=result.fixedAxisAnnulus;
  assert(annulus.linerAndSettingAllowanceAtWallExitMM<1);
  assert(annulus.linerAndSettingAllowanceAtSupportExitMM<0);
  assert(annulus.idealBareCorridorLmin<9);
});

test('receipt reproduces exactly on selected current-house inputs',()=>{
  assert.equal(JSON.stringify(result,null,2)+'\n',readFileSync(new URL('./incoming-water-elevated-drip.json',import.meta.url),'utf8'));
});
