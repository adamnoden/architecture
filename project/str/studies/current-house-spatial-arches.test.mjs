import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const study = name => JSON.parse(readFileSync(new URL(`./current-house-${name}.json`, import.meta.url)));
const spatial = study('spatial-arches');
const guard = study('guard-bracket');
const renewal = study('window-renewal');

test('every head retains its simultaneous shear and moments at both governing axial endpoints', () => {
  for (const [state, heads] of Object.entries(spatial.fullCardAtAxialMinMaxForEveryHead)) {
    assert.equal(Object.keys(heads).length, 52);
    for (const [name, witnesses] of Object.entries(heads)) {
      for (const [index, witness] of witnesses.entries()) {
        const key = [...witness.control.map(v => typeof v === 'boolean' ? (v ? 'True' : 'False') : v), state].join('/');
        const bounds = spatial.spatialHeadRanges[key][name];
        assert.equal(witness.card[0], bounds[0][index]);
        assert.ok(witness.card.every((v, axis) => v >= bounds[axis][0] && v <= bounds[axis][1]));
        assert.ok([1,-1].includes(witness.pointSign));
      }
    }
  }
  assert.equal(spatial.responseStates, 4*96*2*8*2*2*3);
  assert.equal(spatial.memberWindowRecoveries, spatial.responseStates/3*8);
});

test('a shared delivered cage must satisfy shear with torsion, sleeve spacing and the foot placing path', () => {
  const flow = Math.max(...spatial.results.flatMap(row => row.maxClosedLinkFlowNPerMM));
  const cage = spatial.linkDetail.sharedCage;
  const levels = cage.oppositeJambH6GlobalZ;
  assert.ok(flow > spatial.results[0].H6at75FlowResistance);
  assert.ok(flow < cage.H6AdverseResistanceNPerMM);
  for (const type of [0,1]) {
    const adverse = Math.max(...spatial.results.map(r => r.fiveInwardEachOppositeFace.maxClosedLinkFlowNPerMM[type]));
    assert.ok(adverse > cage.H6AdverseResistanceNPerMM);
  }
  assert.equal(Math.max(...levels.slice(1).map((value,index) => value-levels[index])),58);
  assert.deepEqual(study('jamb-placement').closedLinksGlobalZInFoot,levels.filter(z => z<=4000));
  const portDistance = Math.min(...cage.guardSleeveCentresGlobalZ.flatMap(z => levels.map(link => Math.abs(link-z))));
  assert.equal(portDistance-13-3-10,guard.new.formedSleeves.find(v=>v.side==='opposite').linkClearAfterTwo5);
});

test('a guard point on another window governs arch link flow in the released yaw control', () => {
  const open=spatial.results.find(row=>!row.allLowerBearings && !row.positiveFloorRoofYawJoin);
  const witness=open.closedLinkGoverningWitnesses[0];
  assert.notEqual(witness[1],witness[2]);
  assert.ok(open.flowByPointLocationNPerMM.remote[0]>open.flowByPointLocationNPerMM.direct[0]+5);
  for (const control of spatial.results) {
    assert.ok(control.sourceComparedEquilibriumResiduals.every(residual=>residual<0.002));
  }
});

test('the installed mass budget and accessed apertures retain their adverse controls', () => {
  const mass=guard.massPerWindowKg;
  assert.equal(mass.maximumProcurementMassRequirement,55);
  assert.equal(mass.sourceMatchedMeasuredDeliveryUpperBoundEstablished,false);
  assert.ok(mass.assembledStockAndNamedFittings>40);
  assert.ok(guard.new.deliveredPlateTrials.find(x=>x.nominal===24).passes===false);
  assert.ok(guard.new.positiveCoreReceiver.peakM16TensionKN>2*guard.new.historicalRowOnlyThroughboltPeakKN);
  const rear=renewal.temporaryBarrier.occupied.find(v=>v.face==='west' && v.centre===10200);
  assert.ok(rear.socketAccess.some(row=>row.furnitureAtFinishFace.includes('rear-cabinet')));
  assert.ok(renewal.capture.sameBladesBelowFrameFailBy>0);
  assert.ok(renewal.handling.signedWheelKN[0]<0);
});
