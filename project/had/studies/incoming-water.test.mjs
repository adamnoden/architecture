import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {finiteBends} from './incoming-water-geometry.mjs';
import {deriveIncomingWaterStudy,incomingWaterText} from './incoming-water.mjs';
import {deriveCurrentHouse} from './current-house.mjs';

const study=deriveIncomingWaterStudy();
test('finite bends represent a real quarter-circle and reject impossible tangent lengths',()=>{
  const r=finiteBends([[0,0,0],[100,0,0],[100,100,0]],25);
  assert.equal(r.bends[0].angleDeg,90);
  assert(Math.abs(r.bends[0].tangent-25)<1e-10);
  assert(r.path.every(p=>p.every(Number.isFinite)));
  // The arc is centred at(75,25), tangent at(75,0) and(100,25).
  for(const p of r.path.slice(1,-1))assert(Math.abs(Math.hypot(p[0]-75,p[1]-25)-25)<1e-10);
  assert(r.hausdorffError<.001);
  assert.throws(()=>finiteBends([[0,0,0],[10,0,0],[10,10,0]],25),/consume leg/);
  assert.throws(()=>finiteBends([[0,0,0],[10,0,0],[0,0,0]],25),/reversal/);
  assert.throws(()=>finiteBends([[0,0,0],[10,0,0],[10,10,0]],-1),/positive/);
});

test('current-source adverse controls defeat the inherited small-cylinder and utility proofs',()=>{
  assert.equal(study.inheritedInlet.totalLengthInsideRequiredEnvelopeMM,200);
  assert(study.bridge.rejectedOldSeatGapMM<-34);
  assert.equal(study.bridge.rejectedOldLowBridgeOrdinaryBodyGapMM,-337);
  assert.equal(study.utility.rejected.oldLowTailInsidePlatform,true);
  assert.equal(study.utility.rejected.oldUpperBranchInsidePod,true);
  assert.equal(study.utility.rejected.capAt950AxisToLiftedFrameMM,8);
});

test('full insulation and finite bends clear named utility bodies but do not earn terminal adoption',()=>{
  assert.equal(study.utility.pipeR,37);
  assert.equal(study.utility.bendRadius,75);
  for(const row of Object.values(study.utility.gapsMM))for(const gap of Object.values(row))assert(gap>25);
  assert(study.utility.hotColdGapMM>25);
  assert(study.utility.gapsMM.cold.fanWithSupports<29,'Do not hide the narrow setting reserve');
  assert.equal(study.utility.capSweeps.frame.gapMM,58);
  assert.equal(study.utility.capSweeps.carrier.gapMM,113);
  assert.equal(study.terminal.status,'NOT_ADOPTED');
  assert(study.terminal.gapsMM.coldWasher.some(x=>x.gapMM<0&&x.obstacle==='valve reaction arm'));
  assert(study.terminal.adverse.some(x=>x.includes('reachable')));
});

test('the higher bridge preserves a bounded ordinary path and uses continuous motion minima',()=>{
  assert.equal(study.bridge.crown,2150);
  assert.equal(study.bridge.ordinaryBody.pipeUndersideGapMM,113);
  assert(study.bridge.ordinaryBody.westLegGapMM>30);
  assert(Math.abs(study.bridge.ordinaryBody.eastPierGapMM-35)<1e-8);
  assert.equal(study.bridge.motion.finishedPanelUndersideZ,2350);
  assert.equal(study.bridge.motion.liftedCrownGapMM,78);
  assert(Math.abs(study.bridge.motion.westCaseGapMM-43)<1e-9);
  assert(Math.abs(study.bridge.motion.eastHeatGapMM-41)<1e-9);
  assert.equal(study.bridge.motion.westMinimumAtFraction,.025);
  assert.equal(study.bridge.motion.eastMinimumAtFraction,.17);
  assert.equal(study.bridge.status,'OBJECT_PATH_ONLY');
  assert.match(study.bridge.firstRestTrial.status,/NOT_ACCEPTED/);
});

test('front utility breaks include a reaction key, real tool thickness, hands and the larger captured head',()=>{
  const t=study.utilitySuccessor;
  assert.deepEqual(t.breaks.map(b=>b.point),[[11110,1275,595],[11300,1275,595]]);
  assert.equal(t.unionMadeZ[1],625);
  for(const c of t.tool.checks){
    assert(c.toolGapLowerMM>25);assert(c.handGapLowerMM>25);assert(c.armGapLowerMM>25);
    assert(c.otherUnionGapLowerMM>25);assert(c.maxReachUpperMM<650);
  }
  assert.equal(t.reactionSupport.verticalKeyToolGapMM,31.6);
  assert(t.reactionSupport.minimumNonContact.every(x=>x.gapMM>=25));
  assert(t.reactionSupport.preliminaryForceCase.combinedBendingStressNmm2<50);
  assert(t.reactionSupport.preliminaryForceCase.tipDeflectionMM<1);
  assert.equal(t.head.completeHeight,700);
  assert.equal(t.head.retainedBelowRim,350);
  assert(t.head.minimumSweeps.every(x=>x.gapMM>=25));
  assert(t.hotIsolation.reachMM<400);
  assert.equal(t.hotIsolation.handToOwnPipeMM,48);
  assert.equal(t.controlledDrain.minimumFixedGapMM,25);
  assert.equal(t.controlledDrain.grossCuboidUpperLitres,12);
  assert.equal(t.controlledDrain.requiredNetLitres,10);
  assert.match(t.controlledDrain.noCredit,/unattended burst/);
});

test('development cannot silently adopt a route or release the existing house blocker',()=>{
  const house=deriveCurrentHouse();
  assert.equal(study.adoption.adopted,false);
  assert.equal(study.status,'IN_PROGRESS_NOT_ADOPTED');
  for(const s of[house.model.architecturalServices,house.model.servicesInterface])
    assert.equal(s.otherServiceDuties.find(x=>x.id==='incoming-water').status,'REJECTED_RETAINED_ROUTE');
  assert(house.model.currentAdoptionBlockers.some(x=>x.includes('Incoming-water REWIND')));
  assert.equal(readFileSync(new URL('incoming-water.json',import.meta.url),'utf8'),incomingWaterText(study));
});
