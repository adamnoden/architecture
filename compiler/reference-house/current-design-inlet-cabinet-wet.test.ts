import assert from 'node:assert/strict'
import test from 'node:test'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletCabinetCase,runInletCabinetCase} from './current-design/inlet-cabinet-copper.js'
const d=readCurrentDesignResolution(),request=readInletCabinetCase(d).cabinet
const solve=(settings={})=>runInletCabinetCase(d,{...request,settings:{...request.settings,...settings}})
test('raised graded permanent pans enable the independent sleeve fallback and require outward wall-spool renewal',()=>{
 const raised=solve(),low=solve({panLipRiseMm:0})
 for(const [i,pan] of raised.wetDuty.compartments.entries()){
  assert.equal(pan.pan.outletInvertZMm,Number((183.29166666666666+100*i).toFixed(6)))
  assert.ok(pan.pan.maximumFloorRiseMm>0&&pan.pan.maximumFloorRiseMm<25)
  assert.ok(pan.lowerRelief.insideDeclaredVentedHead&&pan.primaryReverseSleeve.insideDeclaredVentedHead)
  assert.equal(low.wetDuty.compartments[i].primaryReverseSleeve.insideDeclaredVentedHead,false)
  assert.ok(pan.renewal.inwardToPermanentPanFrontAfter5Mm<0)
  assert.ok(pan.renewal.outwardTubeBoreAfter5Mm>20)
  assert.equal(pan.renewal.outwardParkYmm[1],-100)
  assert.ok(pan.maximumBelowLipWaterKg>low.wetDuty.compartments[i].maximumBelowLipWaterKg)
  assert.equal(pan.cases.find(c=>c.id==='both-isolated-inward-wall-spool-renewal')?.status,'rejected-permanent-pan-front')
 }
 assert.ok(raised.quantities.retainedPanWaterUpperKg>low.quantities.retainedPanWaterUpperKg)
 assert.equal(raised.architecture.doors.length,4)
 assert.equal(new Set(raised.architecture.doors.map(p=>p.branch)).size,2)
 assert.ok(raised.architecture.doors.every(p=>!p.siblingFrontDisturbed&&p.bodyMm[2]>raised.wetDuty.compartments.find(c=>c.id===p.branch)!.pan.crestZMm))
 assert.ok(raised.wetDuty.feetGeometry.finishedBackAfter5Mm>=5&&raised.wetDuty.feetGeometry.independentPipeFeetAfterTwo5Mm>30)
})
test('the changed cabinet recomputes fault flow and pressure separately, retaining rejected tailwater and open-boundary cases',()=>{
 const base=solve(),lessFlow=solve({flowEachLmin:50}),lessPressure=solve({pressureBar:6})
 assert.equal(base.wetDuty.sourceEnvelope.benchmarkIsVerifiedMaximum,false)
 assert.ok(base.wetDuty.sourceEnvelope.sourceOnlyIdealFullBoreFlowLmin>1000)
 for(const [i,pan] of base.wetDuty.compartments.entries()){
  assert.ok(lessFlow.wetDuty.compartments[i].lowerRelief.waterZMm!<pan.lowerRelief.waterZMm!)
  assert.ok(lessFlow.wetDuty.compartments[i].receiver.openStageZMm<pan.receiver.openStageZMm)
  assert.deepEqual(lessPressure.wetDuty.compartments[i].lowerRelief,pan.lowerRelief)
  for(const id of ['primary-blocked-secondary-high','primary-blocked-secondary-submerged','both-passive-outlets-blocked','high-vent-blocked','source-fed-open-front'])assert.match(pan.cases.find(c=>c.id===id)!.status,/^rejected-/)
  assert.equal(pan.renewal.unknownHouseAndUpstreamInventoryNotZero,true)
  const full=pan.cases.find(c=>c.id==='source-only-full-bore-upper-sensitivity')!
  assert.match(full.status,/^rejected-/);assert.ok(full.receiverFreeDropAfter25AndSettingMm!<0)
  assert.equal(pan.jointFaults.filter(j=>j.insideCabinet).length,6)
  assert.ok(pan.jointFaults.filter(j=>j.insideCabinet).every(j=>j.boundingFaceImpacts.length===6&&!j.containmentEarned))
  assert.ok(pan.jointFaults.filter(j=>j.pointMm===null).every(j=>!j.insideCabinet&&!j.containmentEarned))
  assert.equal(pan.impact.status,'rejects-unribbed-front-strip')
 }
 const energy=base.wetDuty.sourceEnvelope
 assert.ok(Math.abs(energy.sourceOnlyIdealReflectedJetN-2*1000*(energy.sourceOnlyIdealFullBoreFlowLmin/60000)*Math.sqrt(2*9e5/1000))<1e-4)
 assert.ok(lessPressure.wetDuty.sourceEnvelope.factoredIdealFullBoreJetN<energy.factoredIdealFullBoreJetN)
 assert.equal(base.wetDuty.completeWetBoundary,false)
 assert.equal(base.wetDuty.completeOccupiedRenewal,false)
})
test('both branch faults add their real water and jet demands without buying counterweight or inventing anchor resistance',()=>{
 const r=solve(),cases=r.wetDuty.pairCases
 assert.equal(cases[2].representedFlowLmin,180)
 for(const key of ['jetNormSumFactoredN','waterGravityN','fourFootUpliftUpperEachBeforePryingN'] as const)assert.ok(Math.abs(cases[2].benchmark90FlowBound[key]-cases[0].benchmark90FlowBound[key]-cases[1].benchmark90FlowBound[key])<3e-6)
 assert.ok(cases.every(c=>c.sourceOnlyFullBoreSensitivity.fourFootUpliftUpperEachBeforePryingN>10*c.benchmark90FlowBound.fourFootUpliftUpperEachBeforePryingN))
 assert.ok(cases.every(c=>!c.independentDestinationsAndFloorResistanceQualified))
 assert.ok(r.wetDuty.ordinaryProxy.toCabinetAfter10Mm>10&&r.wetDuty.ordinaryProxy.toWasherAfter5Mm>=15)
 assert.ok(Math.max(...r.wetDuty.ordinaryProxy.leftFacingHandleReachProxyMm)<650)
 assert.equal(r.wetDuty.ordinaryProxy.actualGripPointHandAndClosedDoorControlQualified,false)
})
