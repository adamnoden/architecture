import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {compareLobbyDrain,lobbyDrainSectionSVG} from './incoming-water-lobby-drain.mjs';

const {lowSection,raisedSection,receiver}=compareLobbyDrain();

test('low floor sump clears concrete but crosses the reference mineral wall base',()=>{
  assert.equal(lowSection.disposition,'REJECT_UNCHANGED_MINERAL_BASE');
  assert.equal(lowSection.insideMineralBaseOverlapMM,80);
  assert(lowSection.outsideMineralBaseOverlapMM>92);
  assert(lowSection.aboveBeamAfterSettingMM>52);
  assert.equal(lowSection.capPlanReserveMM,245);
  assert.deepEqual(lowSection.crossfall.endReturnsToWallFacesMM,[28,28]);
  assert(lowSection.crossfall.remainingEastFallMM>5);
  assert.equal(lowSection.crossfall.creditedWaterStop,false);
});

test('raised drain misses the break but cannot receive the uncontained floor spill',()=>{
  assert.equal(raisedSection.insideMineralBaseOverlapMM,0);
  assert(raisedSection.clearanceAboveFinishedFloorAtEndMM>7);
  assert.equal(raisedSection.raisedTrayRimAbovePanRimMM,30);
  assert.equal(raisedSection.helpsFreeFloorOverflow,false);
  assert.equal(raisedSection.creditedPressureJetCapture,false);
});

test('an ideal unobstructed inlet has limited margin and belongs to an independent receiver',()=>{
  assert.equal(receiver.comparisonFlowLmin,30);
  assert(receiver.inletCases[0].controllingLmin>30);
  assert(receiver.inletCases[1].controllingLmin<17);
  assert.equal(receiver.inletCases[3].controllingLmin,0);
  assert(Math.abs(receiver.receivingLevels[0].maximumTrialReceivingWaterZ+197.94)<1e-8);
  assert(Math.abs(receiver.receivingLevels[1].maximumTrialReceivingWaterZ+62.94)<1e-8);
  assert.deepEqual(receiver.receiverCapacityLitres.map(x=>x.volumeWithoutLossLitres),[30,150,600]);
  assert.equal(receiver.siteReceivingWaterZ,null);
  assert.equal(receiver.roofOrPlantThresholdReceiverCredited,false);
  assert.equal(receiver.d2Credited,false);
});

test('section plate reproduces exactly from the selected input geometry',()=>{
  assert.equal(lobbyDrainSectionSVG(compareLobbyDrain()),readFileSync(new URL('./incoming-water-lobby-drain.svg',import.meta.url),'utf8'));
});
