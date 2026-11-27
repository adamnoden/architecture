import test from 'node:test'
import assert from 'node:assert/strict'
import {readUtilityCurrentGeometrySource} from './current-design/inlet-utility-proof-source.js'
import {inletUtilityWetAssembly} from './current-design/inlet-utility-wet-assembly.js'
import {inletUtilityCBench,utilityBenchPlanCoverage} from './current-design/inlet-utility-c-bench.js'
const source=readUtilityCurrentGeometrySource()
const run=(choice:unknown=source.choice,normalConnectedJointRepresentation?:'source-matched-interfaces'|'independent20-control')=>{
 const wet=inletUtilityWetAssembly({source,choice})
 return inletUtilityCBench({source,wet,capture:wet.ordinaryCapture,normalConnectedJointRepresentation})
}
const current=run(),near=(a:number,b:number,e=1e-7)=>assert.ok(Math.abs(a-b)<=e,String(a)+' != '+String(b))
test('C-bench is one source candidate; old seven-brace failures and physical gates remain visible',()=>{
 assert.equal(current.schema,'had-utility-front-access-C-bench-observer/1')
 assert.equal(current.historicalSevenBrace.finiteFailureCount,35)
 assert.equal(current.historicalSevenBrace.ordinaryRenewalAccepted,false)
 assert.equal(current.currentSavedDocumentAdmitted,false)
 assert.equal(current.ordinaryRenewalAccepted,false)
 assert.equal(current.physicalInstallationAdmitted,false)
 assert.equal(current.stock.completeToolCaptureInstallationMassAccounted,false)
 assert.equal(current.loads.completeCommonReceiverWrenchDerived,false)
 assert.equal(current.finite.fullCFrameExtractionAndParkProved,false)
 assert.equal(current.finite.positiveCaptureAndParkToolsProved,false)
 assert.ok(current.missingInterfaces.length>=5)
 assert.equal(current.stock.legacyFrameOrReceiverMassBorrowed,false)
 assert.ok(current.parts.every(q=>q.massUpperKg>0&&q.centreMm.every(Number.isFinite)))
 assert.ok(current.parts.every(q=>!q.id.includes('brace')))
})
test('all20 receiver probes cover the actual expanded notched RC domain; old rectangle is not substituted',()=>{
 assert.equal(current.RC.coverage.length,20)
 assert.deepEqual(current.RC.coverageFailures,[])
 assert.equal(current.RC.rcTopLocalMm,-360)
 assert.equal(current.RC.rcBottomLocalMm,-560)
 assert.equal(current.RC.nativeForceOrFloorApprovalTransferred,false)
 assert.ok(current.RC.actualPlanRectanglesMm.length>1)
 const bad=structuredClone(source.choice) as any
 bad.coldDistribution.frameRenewal.portalDesign.cBench.frontRCPlateXOffsetsMm[1]=0
 const q=run(bad)
 assert.ok(q.RC.coverageFailures.some(v=>v.id.startsWith('front-receiver/1/')))
 assert.ok(q.RC.coverageFailures.every(v=>v.missingAreaMm2>0&&!v.contained))
})
test('coverage success is zero missing area, not a throw or fictional distance',()=>{
 const q=utilityBenchPlanCoverage([0,0,20,20],[[0,0,10,20],[10,0,20,20]])
 assert.equal(q.missingAreaMm2,0);assert.equal(q.contained,true)
 const outside=utilityBenchPlanCoverage([0,0,21,20],[[0,0,10,20],[10,0,20,20]])
 assert.equal(outside.missingAreaMm2,20);assert.equal(outside.contained,false)
 assert.throws(()=>utilityBenchPlanCoverage([0,0,20,20],[[0,0,15,20],[10,0,20,20]]),/disjoint/)
})
test('new rails blocks bolts and captured member mass replace the old15kg ceiling',()=>{
 const Cs=current.stock.captured.filter(q=>q.owner.startsWith('C/'))
 assert.equal(Cs.length,2)
 for(const C of Cs){
  near(C.stockUpperKg,17.572907003170368)
  near(C.totalCapturedUpperKg,19.572907003170368)
  assert.equal(C.capturedDesignCeilingDerivedKg,20)
  assert.ok(C.totalCapturedUpperKg>15)
  assert.ok(C.payloadReserveKg>0)
  assert.equal(C.captureClampEnvelopeAndActualPositiveHandlingQualified,false)
 }
 assert.ok(current.stock.fixedReceiverSteelUpperKg>0)
 assert.ok(current.stock.fixedReceiverWeldMassUpperKg>0)
 for(const b of current.stock.binStock){
  assert.ok(b.dryUpperKg>0);assert.ok(b.usableReserveLitres>=0)
  near(b.combinedBatchMassKg,b.dryUpperKg+5)
 }
})
test('normal C geometry and source head bearing use full actual wet obstacles and settings',()=>{
 console.log('UTILITY_C_BENCH_NORMAL',JSON.stringify({
  normalFailures:current.normalFailures,coldFailures:current.coldFailures,
  frameKg:current.stock.frameMassUpperKg,receiverKg:current.stock.fixedReceiverSteelUpperKg+current.stock.fixedReceiverWeldMassUpperKg,
  captured:current.stock.captured,RCFailures:current.RC.coverageFailures
 }))
 assert.deepEqual(current.normalFailures,[])
 assert.deepEqual(current.coldFailures,[])
 assert.equal(current.normalNecessary,true)
 assert.equal(current.normalBearing.datumMm,850)
 assert.equal(current.normalBearing.actualCapacityQualified,false)
})
test('connected cap/beam/head bolt uses its explicit kit bound; independent20 and a too-long bolt remain adverse',()=>{
 const old=run(source.choice,'independent20-control')
 assert.deepEqual(old.normalFailures.map(q=>q.reserveMm),[-10,-16,-10,-16])
 assert.ok(old.normalFailures.every(q=>q.id.includes('/head/mount-bolt/')))
 const bad=structuredClone(source.choice) as any
 bad.coldDistribution.frameRenewal.portalDesign.headRelease.boltLengthMm+=5
 const q=run(bad)
 assert.ok(q.normalFailures.some(v=>v.id.includes('/cap/head/mount-bolt/')&&v.reserveMm<0))
 assert.equal(q.ordinaryRenewalAccepted,false)
})
test('conditional signed receiver wrench uses unilateral rear contact and actual stock gravity',()=>{
 assert.equal(current.loads.signedDemandCases.length,48)
 assert.equal(current.loads.jointGravityIncludedAtBothActualMemberPlanExtrema,true)
 assert.equal(current.loads.normalFrameAndReceiverOwnStockWrenchesDerived,true)
 assert.equal(current.loads.frontEdgeSideAmplificationIncludes20mmXSettings,true)
 for(const q of current.loads.signedDemandCases){
  assert.ok(q.selected.admissible)
  assert.ok(q.selected.rearCompressionN>=-1e-7)
  assert.ok(q.selected.rearGapMm>=-1e-7)
  assert.ok(q.selected.residualN<1e-4)
  assert.ok(Object.values(q.frontRCWrench).every(Number.isFinite))
  assert.equal(q.actualDeliveredJointFixityQualified,false)
  assert.equal(q.actualReactionQualified,false)
 }
 console.log('UTILITY_C_BENCH_WRENCH',JSON.stringify({
  frontRC:current.loads.signedDemandCases.map(q=>({side:q.side,contact:q.selected.rearContact,rearN:q.selected.rearCompressionN,...q.frontRCWrench})),
  missing:current.missingInterfaces
 }))
 assert.equal(current.loads.actualRCOrJointCapacityAccepted,false)
 assert.equal(current.loads.unmodelledOutOfPlane200NCaseStillRequired,true)
})
test('rear pads are real gravity bearings with40K travel and no fictitious rear release bolt',()=>{
 near(current.thermal.freeRearBearingTravelMm,0.264)
 assert.ok(current.thermal.reserveMm>0)
 assert.equal(current.thermal.rearTensionCapacityCreditedN,0)
 assert.equal(current.thermal.rearHorizontalRestraintN,0)
 assert.equal(current.thermal.frictionResistanceCreditedN,0)
 assert.ok(!current.parts.some(q=>q.id.startsWith('rear-gravity-receiver/')&&q.boxMm[2]+q.boxMm[5]>0))
})
test('finite front leg moves NORTH on explicit bearing faces before lifting; whole extraction stays unproved',()=>{
 assert.deepEqual(current.finite.movements.map(q=>q.phase),[
  'front-leg-NORTH','front-leg-UP','C-UP','C-SOUTH',
  'front-leg-NORTH','front-leg-UP','C-UP','C-SOUTH'
 ])
 assert.ok(current.finite.movements.every(q=>q.maximumStepMm<=5+1e-9))
 console.log('UTILITY_C_BENCH_FINITE',JSON.stringify({
  firstReleaseNecessary:current.finite.firstReleaseNecessary,
  failureCount:current.finite.failures.length,
  failures:[...current.finite.failures.reduce((map,q)=>{const key=q.phase+'|'+q.id,old=map.get(key);if(!old||q.reserveMm<old.reserveMm)map.set(key,q);return map},new Map<string,typeof current.finite.failures[number]>()).values()],
  fullExtraction:current.finite.fullCFrameExtractionAndParkProved,
  tools:current.finite.positiveCaptureAndParkToolsProved
 }))
 assert.equal(current.finite.fullCFrameExtractionAndParkProved,false)
 assert.equal(current.finite.completeOrdinaryCrewJointReachProved,false)
})
