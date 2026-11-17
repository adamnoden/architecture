import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const read = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const j = read('current-house-joined-foundation.json');
test('A straight north receiver needs new depth and a positive bypass around the retained port', () => {
  const source = fileURLToPath(new URL('./floor-portal-straight-receiver.py', import.meta.url));
  execFileSync('python3', ['-B', source, '.', '--check']);
  const result = read('floor-portal-straight-receiver.json');
  assert.equal(result.stacks.trialH28TouchingSharedSetting.minimumDepthMm, 220);
  assert.equal(result.stacks.trialH32TouchingIndependentSetting.minimumDepthMm, 234);
});
test('A west-wall gravity route can remove the slab port while holding the WC position', () => {
  const source = fileURLToPath(new URL('../../mat/studies/rear-wc-west-gravity.py', import.meta.url));
  execFileSync('python3', ['-B', source, '.', '--check']);
  const roofInterface = fileURLToPath(new URL('../../mat/studies/rear-wc-west-roof-interface.py', import.meta.url));
  execFileSync('python3', ['-B', roofInterface, '.', '--check']);
});
test('The separated north gravity seat and floor tooth reproduce their action and anchorage bounds', () => {
  const source = fileURLToPath(new URL('./floor-portal-bearing-toe.py', import.meta.url));
  execFileSync('python3', ['-B', source, '.', '--check']);
});
test('The diagonal collector preserves its section only with one jig and fails at the retained port', () => {
  const source = fileURLToPath(new URL('./floor-portal-monolithic-drag.py', import.meta.url));
  execFileSync('python3', ['-B', source, '.', '--check']);
});
test('The direct roof seat receipt reproduces its load and access comparisons', () => {
  const source = fileURLToPath(new URL('./floor-portal-direct-seat.py', import.meta.url));
  execFileSync('python3', ['-B', source, '--check']);
});
test('The permanent roof seat receipt reproduces fit, transfer and guide limits', () => {
  const source = fileURLToPath(new URL('./floor-portal-permanent-seat.py', import.meta.url));
  execFileSync('python3', ['-B', source, '--check']);
});
test('Hip diaphragm comparisons preserve all four fit clashes and the ring closure limits', () => {
  const source = fileURLToPath(new URL('./floor-portal-hip-diaphragms.py', import.meta.url));
  execFileSync('python3', ['-B', source, '--check']);
  const result = read('floor-portal-hip-diaphragms.json');
  assert.equal(result.originalClashes.length, 4);
  assert.equal(result.unchangedWebsWithRelocatedBars.centralMaximumCentresUpperBound, 2);
  assert.ok(result.translatedWebs.stations.every(row => row.reserveMm >= 2));
  assert.ok(result.translatedWebs.fullLidNodeWeightBeforeWebChangesKN > result.translatedWebs.originalNodeWeightLimitKN);
  assert.ok(result.fixedWebBottomReliefs.rows.every(row => row.lowerWeldInterruptedMm > 0));
  assert.equal(result.fixedWebBottomReliefs.rows.filter(row => row.optimisticBothFaceLowerStressMPa > 100).length, 3);
  assert.ok(result.fixedWebBottomReliefs.rows.filter(row => row.outboardReturnPlanOnly)
    .every(row => row.outboardReturnPlanOnly.minimumCentrelineReserveToAnyReservedSocketMm >= 8));
});
test('Finite heel lower groups distinguish eccentric return from centred groove', () => {
  const source = fileURLToPath(new URL('./floor-portal-heel-return.py', import.meta.url));
  execFileSync('python3', ['-B', source, '--check']);
  const result = read('floor-portal-heel-return.json');
  assert.ok(result.mirrorAtOtherControllingWeb.every(row => row.passingTrialCount === 0));
  assert.equal(result.extendedCentredGrooveComparator.length, 4);
  assert.ok(result.extendedCentredGrooveComparator.every(row => row.elasticPeakAtGroupEndsMPa < 100));
  assert.ok(Math.min(...result.extendedCentredGrooveComparator.map(row => row.equivalentTransverseForceLineErrorMm)) < 0.5);
});
test('The guide backing receipt reproduces pressure and cage bounds', () => {
  const source = fileURLToPath(new URL('./floor-portal-guide-backing.py', import.meta.url));
  execFileSync('python3', ['-B', source, '--check']);
});
test('The depth-rocking guide receipt reproduces contact and placement bounds', () => {
  const source = fileURLToPath(new URL('./floor-portal-guide-rocker.py', import.meta.url));
  execFileSync('python3', ['-B', source, '--check']);
});
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

test('paired two-storey portals conserve full-bay winds through the 52-head stripped foundation', () => {
  for (const source of ['reconciled-corner-portals.py','reconciled-house-interface.py']) {
    execFileSync('python3',['-B',fileURLToPath(new URL(source, import.meta.url)),'--check']);
  }
  const result = read('reconciled-corner-portals.json');
  const candidate = read('reconciled-house-interface.json');
  assert.equal(candidate.openingEdits.length, 16);
  assert.equal(candidate.adopted, false);
  for (const run of result.results) {
    assert.equal(run.strippedSignedFoundation.cases, 96 * 33);
    assert.equal(Object.keys(run.strippedSignedFoundation.heads).length, 52);
    assert.ok(run.strippedSignedFoundation.heads.P06.ranges[0][0] < -500);
  }
});
