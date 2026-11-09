import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selection} from './receiver-selection.mjs';
import {plate,detail} from './receiver-plate.mjs';

const r=selection(), h=r.services, a=r.access, e=r.entrance;
test('the retained floor fails under the real walking deck and the regraded entrance carries the event',()=>{
  assert(e.oldGrade.adverse<3.45);
  assert(e.selected.next2>r.flow.rows[0].q);
  assert.deepEqual(e.selected.yr,[6630,7345]);
  assert.equal(e.selected.xRows*e.selected.yRows,738);
  assert.equal(e.selected.length,416);
  assert(Math.abs(e.selected.next2-e.converged.next2)<1e-6);
  assert.equal(a.originalNWestLip,-92);assert.equal(a.rampAt6800,-52);
  assert(a.gate[0].adapter<0&&a.gate[1].adapter>11);
});
test('the selected screen, faulted low site and independent dry high outlet share the same flow',()=>{
  const [normal,long]=r.flow.rows;
  assert.equal(long.screenHoleCount,135);
  assert(long.quiet>96&&long.quiet<97);
  assert(long.EcrestDryWithN>100&&normal.EcrestDryWithN>180);
  assert(long.impactWhenNClosed<r.limits.quiet);
  assert(long.impactWithHalfScreen>r.limits.quiet);
  assert(long.remaining>210);
  assert(r.flow.terminal.pairedUpper>10.9&&r.flow.terminal.pairedAir>10.9);
  assert.equal(r.flow.terminal.sideAfterSetout,40);
});
test('screens slide from below separate ledgers, with support metal included in the loaded plate',()=>{
  const k=a.plate.supportCentreY;
  r.composition.screenCassetteY.forEach(([y,Y],i)=>{
    const j=i+1;assert(y-k[j]-10-10>=7.5);assert(k[j+1]-10-Y-10>=7.5);
  });
  assert.equal(a.plate.pairedMaxSpan,285);assert(a.plate.bendMPa<155&&a.plate.deflectionMm<.44);
  assert(h.Nwork.terminal[2]<-150);
  assert(h.Nwork.remainingAroundR300>18&&h.Nwork.first90Allowance>45);
  assert.equal(a.corner.aisle,700);
  for(const c of a.corner.routes)assert(c.pairedClearToTower>=90&&c.eastToLadder>=260&&c.normalToLadder>=610);
});
test('the open station, original east aperture, caps, ties and two separate receiving sites are retained',()=>{
  assert.deepEqual(h.Ework.centres,[[7025,6750],[7025,7050]]);
  assert.deepEqual(h.Ework.platform,r.comparisons.occupiedLowReturn.actualPlatform);
  assert.equal(h.Ework.legAfterSetout,15);assert.equal(h.Ework.parkedSeparation,40);
  assert.equal(r.comparisons.occupiedLowReturn.southCupFarthest,95);
  assert(h.buried.ties.every(t=>t.pairedBelowSoffit>115));
  assert.deepEqual(a.northNearCaps.slice(0,3).map(c=>c.clear),[100,100,100]);
  assert.equal(h.buried.pairedRoofClearance,10);
  assert.equal(r.northSite.faultWater,-650);
  assert.equal(r.composition.tests.firstHarmfulLevel,null);
});
test('both drawings and current architectural record reproduce',()=>{
  const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
  assert.deepEqual(JSON.parse(read('receiver-selection.json')),r);
  assert.equal(read('receiver-selection.svg'),plate(r));assert.equal(read('receiver-service.svg'),detail(r));
});
