import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const study = name => JSON.parse(readFileSync(new URL(`./current-house-${name}.json`,import.meta.url)));
test('the actual closed foot loop rejects gross concrete dimensions',()=>{
  const k=study('outward-arch-kernel');
  assert.equal(k.footCell.cellNormal,74);
  assert.equal(k.footAdverseCell.cellNormal,54);
  assert.ok(k.oneKNmFootFlowNPerMM>2*k.rejectedGrossBoxFlowNPerMM);
  for(const row of k.kernel){
    assert.ok(row.strongLimitError<1e-5 && row.weakLimitError<1e-5);
    assert.ok(row.maximumSixComponentEquilibriumResidual<1e-5);
    assert.notEqual(row.actualCGGravity[3],0);
  }
});
test('widening alone is rejected after torsion is charged to the bending steel',()=>{
  const result=study('outward-arches');
  for(const control of result.controls){
    assert.equal(control.coupled.length,4);
    assert.equal(control.geometry.insideConcreteFace,140);
    assert.ok(Math.max(...control.coupled.map(row=>row.maximumSameStateActions.adverseRatio[0]))>1);
    assert.ok(Math.max(...control.coupled.map(row=>row.maximumSameStateActions.adverseLongitudinalRatio[0]))>.08);
    for(const row of control.coupled){
      assert.equal(row.memberWindowRecoveries,96*2*8*2*2*8);
      assert.ok(Object.values(row.governingStates).every(v=>[-1,1].includes(v[4]) && [-1,1].includes(v[5])));
      for (const bound of ['nominal', 'adverse']) {
        for (const [kind, ratio] of row.maximumSameStateActions[bound+'Ratio'].entries()) {
          const witness = row.governingStates[bound+'Ratio/'+kind];
          const [strong, weak, strongResistance, weakResistance] = witness.slice(8, 12);
          const end = witness.at(-1);
          assert.ok(end === 0 || end === 1);
          assert.ok(Math.abs(strong/strongResistance + weak/weakResistance - ratio) < 1e-10);
        }
      }
    }
  }
  assert.equal(result.admitted,false);
});

test('the fixed foot excludes uniform bar upsizing at both arch widths', () => {
  const script = fileURLToPath(new URL('./outward-arch-bar-limit.py', import.meta.url));
  const result = JSON.parse(execFileSync('python3', [script], {encoding: 'utf8'}));
  assert.equal(result.largestDiameterMm, 16.5);
  assert.equal(result.h20ClearMm, 18);
  assert.ok(result.h20FullYieldLengthMm - result.availableTailMm > 135);
  assert.deepEqual(result.bounds.map(row => row.widthMm), [160, 180]);
  for (const row of result.bounds) {
    assert.ok(row.interactionLowerBound > 1);
  }
});

test('only the two near-pier stations require the central bar in the 180 mm model', () => {
  const control = study('outward-arches').controls.find(c => c.geometry.normalWidthNominal === 180);
  const detail = study('central-arch-detail');
  const {cutStation, lastCreditedStation, stationCount} = detail;
  assert.ok(lastCreditedStation < cutStation && cutStation < stationCount - 1);
  const governing = Array(stationCount).fill(0);
  for (const row of control.coupled) {
    const p = row.centralH25Arch;
    assert.equal(p.freeTipStation, cutStation);
    assert.equal(p.lastCreditedStation, lastCreditedStation);
    assert.equal(p.adverseFourBarProfile.length, stationCount);
    assert.equal(p.adverseWithSupplementProfile.length, stationCount);
    assert.equal(Math.max(...p.adverseFourBarProfile), row.maximumSameStateActions.adverseRatio[0]);
    assert.equal(Math.max(...p.adverseWithSupplementProfile), p.governingEnds.adverse.ratio);
    assert.ok(p.governingEnds.adverse.ratio < 1);
    assert.deepEqual(p.adverseWithSupplementProfile.slice(lastCreditedStation + 1),
                     p.adverseFourBarProfile.slice(lastCreditedStation + 1));
    p.adverseFourBarProfile.forEach((ratio, i) => governing[i] = Math.max(governing[i], ratio));
  }
  assert.deepEqual(governing.flatMap((ratio, i) => ratio > 1 ? [i] : []), [0, 1]);
  const worst = Math.max(...control.coupled.map(r => r.centralH25Arch.nominalDatumSensitivity.radialOnly));
  const both = Math.max(...control.coupled.map(r => r.centralH25Arch.nominalDatumSensitivity.bothAxes));
  assert.ok(worst > 1 && both > worst);
  assert.ok(detail.baselineNominalSignedGapMm < 0 && detail.trialH20PlateauGapMm > 0);
  assert.ok(detail.nearBondLengthReserveMm > 0 && detail.nearBondLengthReserveMm < 5);
  assert.ok(detail.curveBondLengthReserveMm > 215);
  assert.ok(detail.nearH12At600GapMm > 0 && detail.nearH12At600GapMm < 5);
  assert.ok(detail.pierRevised.ratio < 1 && detail.historicalActionCount === 3072);
  assert.equal(detail.admitted, false);
});
