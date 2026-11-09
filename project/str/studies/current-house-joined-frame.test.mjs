import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const read = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const j = read('current-house-joined-foundation.json');
test('Each of the 52 signed-head states returns its actual source force and two first moments', () => {
  assert.equal(new Set(j.heads.map(h=>h.xy.join(','))).size,52);
  for (const [name, source] of Object.entries(j.named_source_totals)) {
    const got = [0,0,0];
    for(const h of j.heads){
      const [n,cx,cy] = h.named_N_Cx_Cy[name];
      got[0]+=n; got[1]+=n*h.xy[0]/1000+cx; got[2]+=n*h.xy[1]/1000+cy;
    }
    assert.ok(got.every((v,i)=>Math.abs(v-source[i])<.025), name);
  }
});
test('A captive court tie moves only with a balancing passive reaction and unchanged first moments', () => {
  for(const c of j.courtTies) {
    const t=c.threePointCoefficient;
    assert.ok(t>1 && c.signedRange[0]<0 && c.signedRange[1]===0);
    for(const i of [0,1]) assert.ok(Math.abs(t*c.newHold[i]+(1-t)*c.passiveBalance[i]-c.oldCorner[i])<1e-7);
    assert.ok(j.heads.find(x=>x.id===c.head));
  }
});
test('The larger roof and unselected pit retain separate failure controls', () => {
  const r=read('current-house-roof-route.json'), b=read('current-house-service-bay.json');
  assert.ok(r.crown['40pinCombined']>200/1.1 && r.crown['45pinCombined']<200/1.1);
  assert.ok(b.floor.M_V.every((v,i)=>v<b.floor.MR_VR[i]));
  assert.ok(b.cheeks.nominalMinimumClearToVerticalPileBars<25 && !b.admitted);
  assert.equal(j.admitted,false); // explicit comparison, never soil capacity
});

test('P32 needs independent head assembly and a two-bend west starter', () => {
  const script = fileURLToPath(new URL('./p32-court-hold.py', import.meta.url));
  execFileSync('python3', ['-B', script, '--check']);
  const {connector, cage, changedBeamLevers, admitted} = read('./p32-court-hold.json');
  assert.ok(connector.original.rotatingBarClearanceWithSixVertical < 2.5);
  assert.deepEqual(connector.candidate.imperforateBand, [-53, -27]);
  assert.ok(connector.singleM20ResistanceKN < connector.strippedComparisonKN);
  assert.ok(cage.straightYaw.bestP45VerticalClearMm < 25);
  assert.ok(cage.groups.westToP45.afterTwo5mmSetoutsLowerMm > 38);
  assert.ok(cage.groups.allP32ToTransplantedMats.afterTwo5mmSetoutsLowerMm > 25);
  assert.ok(changedBeamLevers.bottomNS.lossOfSteelCoupleKNm > 14);
  assert.equal(admitted, false);
});

test('independent east staff frame retains signed seats, four head actions and a clear shifted ladder', () => {
  execFileSync('python3',['-B',fileURLToPath(new URL('./east-service-platform.py', import.meta.url)),'--check']);
  const part=read('east-service-platform.json');
  assert.equal(part.bridgeDepth,450);
  assert.ok(part.panelContactUltimateKN[0]<-24 && part.panelContactUltimateKN[1]>33);
  assert.equal(part.foundation.newAxesXY.length,4);
  assert.ok(part.entry.oldCentredGap<0 && part.entry.newLowerGap>=25);
  assert.ok(part.possibleWaterKg>part.storageGrossUpperL);
  assert.equal(part.wholeMethodAccepted,false);
});


test('whole-house rewind rejects separated tips and moves the matching ground and first-floor corners together', () => {
  execFileSync('python3',['-B',fileURLToPath(new URL('./house-corner-rewind.py', import.meta.url)),'--check']);
  const r=read('house-corner-rewind.json');
  assert.equal(r.changes.length,16);
  assert.equal(r.oldGroundOpeningBelowJambMm,205);
  assert.ok(r.windowBarrier.oldSocketShifted>r.windowBarrier.oldToe);
  assert.ok(r.windowBarrier.oldSocketShifted<r.windowBarrier.newJamb[0]);
  assert.equal(r.principal.eastStripMm,655.5);
  assert.ok(r.roof.grossRiseAtNorthCap>373);
  assert.equal(r.adopted,false);
});
