import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveWaterReplan, verifyServicesOccurrences } from './water-replan.mjs';

test('current replan authenticates the entire new Services source without weakening the historical selection', () => {
  const v = deriveWaterReplan();
  assert.equal(v.sources.services.blob, '3e934b29d9f328b41cb9bd2498184154090492c0');
  assert.equal(v.model.architecturalServices.eastWaterJoin.intermediateArch.finishedClearWidth, 1221);
  assert.deepEqual(v.model.groundFurniture['plant-primary-buffer-round-bounding600'], [10150, 5025, 600, 600]);
  assert.deepEqual(v.model.servicesInterface.emitters.find(e=>e.id==='plant-N').plan, [10980,3797,550,200]);
  assert.equal(v.model.servicesAuxiliaryProjection.sourceBlob, v.sources.services.blob);
  const bytes = readFileSync(new URL('../../mat/studies/whole-house-service-baseline.json', import.meta.url), 'utf8');
  for (const altered of [bytes.replace('"axisY": 3700', '"axisY": 3701'), bytes.replace('Proposed full Services', 'Unreviewed Services')]) {
    assert.notEqual(altered, bytes);
    assert.throws(() => deriveWaterReplan({servicesText: altered}), /Authenticate complete current Services source/);
  }
});

test('food storage is approached and opened with all actual chairs/table and the manual window retained', () => {
  const v=deriveWaterReplan(),p=v.model.pantryReplacement.proof;
  assert(p.pass&&p.approach.minimumReserve>=25);
  assert(p.drawerBodyPath.minimumReserve>=25);
  assert.equal(p.drawerToBodyMinimum,25);
  assert(p.maximumReferenceGripReach<=600);
  assert(p.windowPlanReach<=600&&p.windowApproach.minimumReserve>=25);
  assert.deepEqual(v.model.groundFurniture['low-food-larder'],[9650,11370.5,1000,200]);
  assert.equal(v.model.windowRequirements.find(w=>w.id==='kitchen10200').planReach,p.windowPlanReach);
  assert.equal(v.model.pantryReplacement.rejectedUpperCabinet.reason.includes('overlapped'),true);
});

test('east withdrawal clears the real supports and has a depressed track instead of a solid interfering deck', () => {
  const { bridge: b, renewal: r, groundEnvelope: g } = deriveWaterReplan();
  assert.deepEqual(b.localSupportBeamWidths, [600, 900]);
  assert.equal(b.supportAxesX[1] + b.localSupportBeamWidths[1] / 2, 9750);
  assert(b.supportAxesX[1] + b.localSupportBeamWidths[1] / 2 >= b.newEastWeatherWallX[1]);
  assert.equal(r.selectedParkX[0] - b.outerSupportReservation.fullX[1], 132.5);
  assert(r.hoistWorkingBox[0]>b.outerSupportReservation.fullX[1]);
  assert.equal(r.bodyX[1] - r.bodyX[0], r.length);
  assert.deepEqual(r.selectedParkX, r.bodyX.map(x => x + r.withdrawalTranslation));
  assert(r.withdrawalTrackEndLowestZ < r.operatorDeckZ);
  assert(g.fullSelectedTrackMinimumD > 1500);
  assert(g.routeLocalDTrial > g.fullSelectedTrackMinimumD);
  assert.equal(r.courtStagingPocketSelected, false);
  assert.equal(r.selectedWithdrawal, 'EAST');
});


test('current source authentication does not conceal stale actual scene occurrences', () => {
  const current=JSON.parse(readFileSync(new URL('../../mat/studies/whole-house-service-baseline.json',import.meta.url),'utf8'));
  const v=deriveWaterReplan();
  assert.deepEqual([v.model.servicesOccurrenceProof.emitters,v.model.servicesOccurrenceProof.extractTasks],[16,6]);
  for (const mutate of [
    model=>{model.groundFurniture['service-emitter-plant-N'][0]++;},
    model=>{const e=current.interfaces.architecturalServices.emitters.find(e=>e.level===1);model.upperFurniture['service-emitter-'+e.id][0]++;},
    model=>{model.servicesInterface.extract[0].platform[0]++;},
    model=>{model.servicesAuxiliaryProjection.fanMaintenance[0].doorMode+=' changed';},
    model=>{model.serviceMaintenanceFields[0].platform[0]++;}
  ]) {
    const model=structuredClone(v.model);mutate(model);
    assert.throws(()=>verifyServicesOccurrences(model,current),/drift/);
  }
});
