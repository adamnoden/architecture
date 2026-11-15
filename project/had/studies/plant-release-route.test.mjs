import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {derivePlantReleaseRoute} from './plant-release-route.mjs';

test('east plant paths reject the inherited loaded throats and preserve separate relief',()=>{
  const route=derivePlantReleaseRoute();
  assert.equal(route.oldCase.fixedThroatMM,903);
  assert.equal(route.oldCase.maximumCompleteWidthMM,833);
  assert.equal(route.oldCase.oldCorridorDeficitMM,17);
  assert(route.oldCase.oldBufferDirectTurnExpansionMM<0);
  assert.deepEqual(route.cylinder.offsetFromVesselCentreMM,[18,-2]);
  assert.equal(route.cylinder.completeRadiusMM,415);
  assert.equal(route.buffer.completeRadiusMM,375);
  assert.equal(route.buffer.plan.liveExpansionEnvelope,29.41);
  assert.equal(route.buffer.plan.fixedP0,310.1);
  assert.equal(route.docking.gradeCases[0].heightCases[2].doorReserveSurplusMM,-10);
  assert.equal(route.docking.gradeCases[1].heightCases[1].gantryHeightSurplusMM,-140);
  assert.equal(route.buffer.maximumAdditionalHeightWith100DeckAtReferenceGantryMM,50);
  assert.deepEqual(route.docking.firstRest,[12590,4575]);
  assert.equal(route.docking.loadedHandoffQualified,false);
  assert.equal(readFileSync(new URL('./plant-release-route.json',import.meta.url),'utf8'),JSON.stringify(route,null,2)+'\n');
});
