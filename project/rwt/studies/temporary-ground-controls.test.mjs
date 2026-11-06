import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {twoPath,renderTwoPath} from './temporary-two-path-control.mjs';
import {groundService,renderGround} from './ground-high-eave-control.mjs';
test('actual temporarypipe hole and fabricated offset do not inherit old nominal fit',()=>{
 const o=twoPath();assert.equal(o.actualCourtPassage.nominalRadialReserve,13.049999999999997);
 assert(o.actualCourtPassage.rejected159RadialReserve<.1);assert.equal(o.actualCourtPassage.qualifiedFlashing,false);
 const b=o.offset.two45;assert.equal(o.offset.oldTwo90Fit,false);assert.equal(b.requiredPortDrop,465);
 assert.equal(b.additionalDropAgainstOld300,165);assert.equal(b.engagement,35);
 assert(Math.abs(b.connectingTubeCut-(b.betweenPortFaces+2*b.engagement))<1e-10);
 assert(b.candidatePorts.every((p,i)=>i===0||p[2]<b.candidatePorts[i-1][2]));
});
test('regraded loggia pipe only claims loggia duty and preserves phased operator exclusion and failures',()=>{
 const o=twoPath(),p=o.longPipe;assert(p.insideInvertNorth>p.insideInvertSouth);
 assert(p.minimumStraightGapBelowPrimary>0&&p.minimumStraightGapBelowPrimary<12);
 assert(p.lateralReserve>80&&p.lateralReserve<84);assert.equal(p.crewBodyMaximumX,6650);
 assert.equal(p.normalStandingHeadPass,false);
 assert(o.hydraulics[0].passesLoggiaOnlyScreen&&o.hydraulics[1].passesLoggiaOnlyScreen);
 assert.equal(o.hydraulics[2].passesLoggiaOnlyScreen,false,'Halfdiameter0.83165 must retain actual0.8352 failure');
 assert(Math.abs(o.northOverflow.loggiaOnlyDutyLps-.8352)<1e-12);
 assert.equal(o.states.find(s=>s.state==='N LONG OPEN').combinedEBackupDutyLps,4.43895);
 assert(o.states.every(s=>s.admission!==true));assert.equal(o.accepted,false);
 assert.equal(o.courtCollectorRewind.actualNewBranchAndSupportQualified,false);
 assert.equal(o.northOverflow.actualChamberOutletAndJunctionQualified,false);
 assert.equal(o.qualifiedFirstHarm,null);
});
test('ground reach does not certify actual neck, secondary layer, noise or receiver release',()=>{
 const o=groundService();assert(o.geometry.requiredStraightLine<6000);
 assert(o.geometry.nominalSixMetreReserve<40,'Jointoverlap/neckattachment can consume this nominal reserve');
 assert.equal(o.machine.poles.currentListedKgEach,.316);assert.deepEqual(o.machine.neck.listedEnvelope,[300,240,60]);
 assert.equal(o.machine.neck.actualCentrelineAndToolTip,null);assert.equal(o.machine.nominalPowerDivVoltageA,13.75);
 assert(o.geometry.primaryHem.z>o.geometry.secondaryDrip.z&&o.geometry.secondaryDrip.z>o.geometry.sharedReceiver.back);
 assert(o.tasks.find(t=>t.task==='Rare receiver release/renewal').status.startsWith('FAIL'));
 assert.equal(o.quietAccepted,false);assert.equal(o.physicalHandlingAccepted,false);assert.equal(o.accepted,false);
 assert.equal(o.qualifiedFirstHarm,null);assert(o.geometry.machineToOperatorWestGap>0&&o.geometry.ordinaryBodySouthOfWell>0);
});
test('both focused controls reproduce their located drawings and source values',()=>{
 for(const [name,o,render]of [['temporary-two-path-control',twoPath(),renderTwoPath],['ground-high-eave-control',groundService(),renderGround]]){
  assert.equal(fs.readFileSync(`project/rwt/studies/${name}.json`,'utf8'),JSON.stringify(o,null,2)+'\n');
  assert.equal(fs.readFileSync(`project/rwt/studies/${name}.svg`,'utf8'),render(o));
 }
});
