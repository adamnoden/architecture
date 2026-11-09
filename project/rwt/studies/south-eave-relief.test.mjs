import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {relief} from './south-eave-relief.mjs';

const r=relief();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7);

test('a fixed header stays wallward of the full middle cassette throughout its drop and outward draw',()=>{
  assert.deepEqual(r.movingQ,[-450,-100]);
  assert.deepEqual(r.q,[-90,-10]);
  assert.equal(r.movingDryGap,10);
  assert.equal(r.wallDryGap,10);
  assert.ok(r.guardQ<r.movingQ[0]);
  assert.ok(r.wallY-r.q[0]<r.standSouthY);
  assert.equal(r.minimumWindowHeadGap,33.5);
  assert.equal(r.windowJambGap,75);
  assert.deepEqual(r.mouths,[[4375,4775],[7225,7625]]);
  execFileSync(process.execPath,[fileURLToPath(new URL('./south-eave-relief.mjs',import.meta.url)),'--check']);
});

test('one roof/court stress dose and one surviving leader in each reversed trial',()=>{
  assert.deepEqual(r.directions.map(d=>[d.blocked,d.healthy]),[[4500,7500],[7500,4500]]);
  for(const d of r.directions) {
    assert.equal(d.testFlow,3.60375);
    assert.equal(d.maximumEndStage,6340);
    assert.ok(d.donorMouth[0]<d.blocked && d.blocked<d.donorMouth[1]);
    assert.ok(d.healthyBox[0]<d.healthy && d.healthy<d.healthyBox[1]);
  }
  assert.equal(r.longest,3125);
  near(r.lateral.length,200);
  assert.ok(r.lateral.outletInvert+r.lateral.depth<r.lateral.bossHeadMax);
  assert.ok(r.outletStageMax-r.lateral.requiredBoxHead>11);
  near(r.control.velocity**2,9.81*r.control.depth/1000);
  assert.equal(r.width,77);
  assert.ok(r.donorReserve>3.7 && r.donorReserve<3.8);
  assert.ok(r.scupperAirGap>28 && r.scupperAirGap<28.1);
  near(r.maxEnergy,r.crown+r.adverse+r.control.depth+r.control.velocityHead+r.friction+r.minor);
  near(r.sill-r.adverse-r.scupperAirGap,r.maxEnergy);
  // Supplying the whole event to a half-width mouth defeats the same donor limit.
  const narrowerDepth=r.gate.depth*Math.cbrt(4);
  assert.ok(r.sill+r.adverse+2*narrowerDepth+r.approachLoss>r.ceiling);
  // Drowned outlet or an unqualified loss budget cannot inherit this result.
  assert.ok(r.endBed-r.adverse-r.outletStageMax>=10);
  assert.ok(r.maxEnergy+2*r.control.velocityHead>r.sill-r.adverse);
});
