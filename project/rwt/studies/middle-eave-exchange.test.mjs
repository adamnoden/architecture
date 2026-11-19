import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {compare,result as r} from './middle-eave-exchange.mjs';

test('both south drips transfer while each moving outlet stays over its retained neighbour',()=>{
  const b=r.bypass;
  assert.deepEqual(b.firstSecondaryThenPrimaryStroke,[20,40]);
  assert.ok(b.dryParkDripGap>=20 && b.leastLiveDripToEdge>=50);
  assert.ok(b.leastTailToNeighbourQ>=30 && b.sideEdgePlanGap>1100);
  assert.ok(b.lowerDripAboveLip>30 && b.upperTrayFrameOverCassette>19);
  assert.ok(compare({stroke:30}).bypass.leastLiveDripToEdge<0);
  assert.ok(compare({stroke:160}).bypass.leastTailToNeighbourQ<0);
  execFileSync(process.execPath,[fileURLToPath(new URL('./middle-eave-exchange.mjs',import.meta.url)),'--check']);
});

test('recover the aprons and completely clear the guards before lowering to the first rest',()=>{
  assert.ok(r.apron.overlapUnderCentre>10 && r.apron.clearanceUnderCentre>10);
  assert.equal(r.apron.minimumSweptFloorClearance,12.5);
  assert.ok(r.apron.undersideOverBlindEnd>10 && r.apron.parkedEndClearOfSeam>10);
  assert.ok(r.bypass.tailBeyondParkedApron>10);
  assert.ok(compare({apronPark:25}).apron.parkedEndClearOfSeam<0);
  const h=r.handling;
  assert.ok(h.nominalToNeighbourUnderside>=20 && h.aboveMidrail>10 && h.belowToprail>10 && h.pToGuardPost>10);
  assert.ok(compare({drop:200}).handling.nominalToNeighbourUnderside<0);
  assert.ok(compare({outward:400}).handling.restBodyToOutboardGuardFace<0);
  assert.ok(h.standToInnerGuard>10 && h.standToOuterGuard>0);
  assert.ok(r.stage.loadedLoweringToStand>0);
});

test('the positive ideal energy margins cannot bridge a failed open receiver',()=>{
  const w=r.water;
  assert.ok(w.grossReserveNormal>0 && w.grossReserveBypassAtOppositeEnd>0);
  assert.ok(w.blockedNeighbourSpillsBeforeApronReturn>0 && w.blockedNeighbourSpillsBeforeBypassReturn>130);
  assert.ok(r.stage.blindEndTopZ>r.stage.neighbourFrontSpill);
});
