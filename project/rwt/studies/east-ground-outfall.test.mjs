import test from 'node:test';
import assert from 'node:assert/strict';
import { eastGround, lane } from './east-ground-outfall.mjs';

const { wet, crew, alternative } = eastGround();
test('two physically distinct mouths stay inside the original directed spill corridor', () => {
  assert.deepEqual(wet.basin, [12500, 6100, 2000, 1600]);
  assert.deepEqual([wet.start,wet.end,wet.crest,wet.bed,wet.endBed,wet.tail], [14500,16000,-1300,-1650,-1725,-1600]);
  assert.deepEqual(wet.high, [6125,7225]);
  assert.deepEqual(wet.low, [7275,7675]);
  assert.equal(wet.staticResidual, 50);
  assert.deepEqual(wet.upstreamLip, [12750,6900,-1200]);
  assert.deepEqual(wet.northExit, [4250,15150,1500,1500]);
});
test('whole events remain separate, low-channel occlusion changes control, fault bypass has limited head', () => {
  assert.deepEqual(wet.flows.map(f => f.flowLps), [3.60375,4.43895]);
  for (const f of wet.flows) {
    assert.equal(f.low[0].control, f.low[0].tailEnergy);
    assert.ok(f.low[1].control > f.low[1].tailEnergy);
    assert.ok(f.ordinaryReserve > 149 && f.faultReserve > 7 && f.downstreamSeparation > 270);
  }
  assert.ok(wet.flows[1].faultReserve < 7.5);
  const moreBlocked = lane(4.43895, 400, wet.bed, wet.endBed, wet.tail, 1500);
  assert.ok(wet.crest + 5 + 2 * moreBlocked.yc > -1250);
});
test('200-square baseplate cuts the retained staff strip; moved rack clears it', () => {
  assert.deepEqual(crew.station,[13100,7800,0]);
  assert.deepEqual([crew.southEdge,crew.northEdge,crew.originalPlateReserve,crew.newPlateReserve], [7450,8100,-25,50]);
  assert.equal(crew.clearReserveEach,25);
  assert.equal(crew.newTransfer,1875);
  assert.equal(crew.stageToHandover,225);
  assert.ok(crew.refuge[0] - crew.radius > 14950);
  assert.equal(crew.footEnd,21900);
  assert.equal(crew.groundZ,-1800);
  assert.ok(crew.deckEnd > wet.end);
  assert.equal(crew.groundSwap[0],crew.cargoLift[0]+crew.cargoLift[2]);
  assert.ok(crew.stairY[1] < crew.groundSwap[1]);
  assert.equal(crew.stairY[0] - (wet.basin[1]+wet.basin[3]),650);
});
test('joining the southern option to the unholed plant dock conceals both tips', () => {
  assert.equal(alternative.overlapM2,2.16);
  assert.deepEqual(alternative.tipDepths,[850,705]);
  assert.equal(alternative.parkedClearX,10);
  assert.equal(eastGround().siteAccepted,false);
});
