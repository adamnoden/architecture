import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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
