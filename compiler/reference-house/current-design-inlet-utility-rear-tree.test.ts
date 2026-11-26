import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {readUtilityCurrentGeometrySource} from './current-design/inlet-utility-proof-source.js'
import {inletUtilityWetAssembly} from './current-design/inlet-utility-wet-assembly.js'
import {inletUtilityRearTree,admitUtilityRearTreeChoice,type UtilityRearTreeContext} from './current-design/inlet-utility-rear-tree.js'
const current=readUtilityCurrentGeometrySource(),choice=JSON.parse(JSON.stringify(current.choice)),context=current.rearTreeContext
const run=(c:unknown=choice,x:UtilityRearTreeContext=context)=>inletUtilityRearTree({choice:c,context:x})
const near=(a:number,b:number,e=1e-7)=>assert.ok(Math.abs(a-b)<e,String(a)+' != '+String(b))
test('current source is one shared rear header, complete oriented stops and factory reducing turn',()=>{
 const r=run(),d=choice.coldDistribution
 assert.equal(r.geometry.sharedHeaderCount,1)
 assert.equal(r.geometry.parts.filter(p=>p.id.startsWith('common/tube/')).length,d.commonPathMm.length-1)
 assert.equal(r.geometry.sinkNodeType,'factory22-in15-down-reducing90-not-a-capped-tee')
 assert.deepEqual(r.choice.terminalLocalMm,d.rearTree.sourceJoint.fixedFaceLocalMm)
 assert.equal(r.wholeTreeStripIsHistoricalStressControlOnly,true)
 assert.equal(choice.coldDistribution.frameRenewal.wholeAssembledFrameWithdrawalRequired,false)
 assert.equal(r.ordinaryBoltedMemberRenewalToolStabilityAndLoadProofAccepted,false)
 assert.equal(r.stock.frame40LegsAreCapacityProof,false)
 assert.equal(r.installedAcceptance,false)
})
test('full70mm port legs and115mm return fit metal; continuous mate jackets are not nonmate metal clashes',()=>{
 const r=run(),legs=r.geometry.checks.filter(q=>q.phase==='fitting-legs')
 near(legs.find(q=>q.id==='sink/feed/3')!.reserveMm,18)
 near(legs.find(q=>q.id==='sink/lower/1')!.reserveMm,18)
 near(legs.find(q=>q.id==='sink/lower/2')!.reserveMm,31)
 assert.ok(r.geometry.parts.some(p=>p.id==='sink/head-matched-union/moving-half'))
 assert.equal(r.geometry.sharedJoinedJacketOverlapIsNotMetalCollision,true)
 const headFrame=r.geometry.checks.find(q=>q.phase==='normal'&&q.id==='sink/head-matched-union/moving-half/IAS/frame/EW rail at y1350 / z850')
 assert.ok(headFrame);near(headFrame!.reserveMm,15.143593539448972)
 const previous=structuredClone(choice),d=previous.coldDistribution
 d.sink.pathToStopMm[1][2]=730;d.sink.pathToStopMm[2][2]=730;d.sink.pathToStopMm[3][2]=630;d.sink.stop.axisMm[2]=550;d.sink.pathFromStopToHeadMm[0][2]=470;d.sink.pathFromStopToHeadMm[1][2]=350;d.sink.pathFromStopToHeadMm[2][2]=350
 assert.ok(run(previous).geometry.failures.some(q=>q.phase==='normal'&&q.id.includes('source-prefab-bowl')))
})
test('actual frame and retained hot path falsify full-tree stress motions; no disconnected selfpass',()=>{
 const r=run()
 assert.ok(r.geometry.failures.length>0)
 assert.ok(r.geometry.failures.some(q=>q.id.includes('retained-H0-hot-terminal')&&q.phase==='north'))
 assert.equal(r.geometry.stripNecessary,false)
 assert.deepEqual(r.strip.diagonalAxialReleaseMm,[10,-10,0])
 assert.equal(r.strip.capsOnlyAfterCompletedLevelLowering,true)
 assert.equal(r.strip.washerStopAndHoseRetainedOnIndependentRest,true)
 assert.deepEqual(r.strip.offsetsMm.at(-1),[-400,2110,-210])
 const added=structuredClone(context);added.obstacles=[...added.obstacles,{id:'explicit-contradicting-current-obstacle',boxMm:[10840,560,900,100,100,100],presence:'always'}]
 assert.ok(run(choice,added).geometry.failures.some(q=>q.phase==='normal'&&q.id.includes('explicit-contradicting-current-obstacle')))
 assert.notEqual(run(choice,added).source.caseDigest,r.source.caseDigest)
})
test('rail and carry-bar phase controls stay explicit even though ordinary member renewal retains the tree',()=>{
 const old=structuredClone(choice);old.coldDistribution.rearTree.frontLowerRailRemovedBeforeNorthMovement=false;old.coldDistribution.rearTree.temporaryCarryBarInstalledOnlyAfterTreeParked=false
 const r=run(old)
 assert.ok(r.geometry.failures.some(q=>q.phase==='north'&&q.id.includes('EW rail at y1350 / z135')))
 assert.ok(r.geometry.failures.some(q=>q.phase==='north'&&q.id.includes('temporary carry bar')))
 assert.equal(r.wholeTreeStripIsHistoricalStressControlOnly,true)
})
test('whole controlled receiver includes main, tree and retained closed washer stop exactly once, excluding unbounded machine/head contents',()=>{
 const r=run()
 assert.ok(r.inventory.treeWaterGeometricUpperLitres>0)
 assert.ok(r.inventory.treeWaterGeometricUpperLitres<4)
 near(r.inventory.retainedClosedWasherStopBodyWaterUpperLitres,.882)
 near(r.inventory.mainPlusTreeAndRetainedStopUpperLitres,current.service.inventory.isolatedBranchConservativeCeilingL+r.inventory.treeWaterGeometricUpperLitres+.882)
 assert.ok(r.inventory.receiverReserveLitres>0)
 assert.equal(r.inventory.source740DrainEmptiesWholeTree,false)
 assert.equal(r.inventory.lowestSinkPathMm,300)
 assert.equal(r.inventory.sourceDrainMm,740)
 assert.equal(r.inventory.washerStopHoseMachineAndHotHeadWaterIncluded,false)
 assert.equal(r.inventory.actualNetworkExclusionAndControlledCaptureQualified,false)
 assert.ok(r.stock.remainingInsulationClampsHardwareDryBudgetKg>0)
 near(r.stock.referenceCapturedVerticalIncludingDynamicN,294.3)
 assert.equal(r.evidence.allDeclaredEvidencePresent,false)
})
test('normal pressure/wheel torque and zero-pressure60Nm tools are distinct from fully seized40K demand',()=>{
 const r=run()
 near(r.pressure.maximumWaterBoresMm.washer,20.3);near(r.pressure.maximumWaterBoresMm.sink,13.7)
 near(r.pressure.normalStopLossBar.washer,.1296);near(r.pressure.normalStopLossBar.sink,.09)
 assert.ok(r.pressure.pipeEndThrustN.washer>290);assert.ok(r.pressure.pipeEndThrustN.sink>130)
 assert.equal(r.pressure.normalWheelCoupleNm,10);assert.equal(r.pressure.coldZeroToolCoupleNm,60)
 near(r.thermalAndSupport.freeHeaderXMovementMm,.1836)
 near(r.thermalAndSupport.fullySeizedStraightStressMPa,74.8)
 assert.ok(r.thermalAndSupport.fullySeizedStraightAxialUpperN.washer>6000)
 assert.ok(r.thermalAndSupport.fullySeizedStraightAxialUpperN.sink>3000)
 assert.equal(r.thermalAndSupport.elasticLoopKernelExecuted,false)
 assert.equal(r.thermalAndSupport.actualReactionLawImplemented,false)
 assert.equal(r.pressure.actualPressureAndOppositeReactionQualified,false)
})
test('missing/mixed header, stopped-module endpoint fiction and unsupported settings reject without mutation',()=>{
 const before=JSON.stringify({choice,context}),bad=structuredClone(choice)
 bad.coldDistribution.commonPathMm[0][0]+=10
 assert.throws(()=>run(bad),/Unsupported/)
 const face=structuredClone(choice);face.coldDistribution.washer.pathToStopMm.at(-1)[1]+=10
 assert.throws(()=>run(face),/Unsupported/)
 assert.throws(()=>admitUtilityRearTreeChoice({}),/Unsupported/)
 assert.throws(()=>run(choice,{...context,settingEachMm:0}),/Unsupported/)
 run();assert.equal(JSON.stringify({choice,context}),before)
})

const wet=inletUtilityWetAssembly({source:current})
test('shared source adapter computes main inventory and joins current cold, actual H0 hot body and formed hot head',()=>{
 assert.equal(context.mainOnlyInventoryUpperLitres,current.service.inventory.isolatedBranchConservativeCeilingL)
 assert.equal(current.currentSavedDocumentAdmitted,false)
 assert.equal(wet.normal.necessaryKnownGeometry,true,JSON.stringify(wet.normal))
 assert.equal(wet.cold.geometry.normalNecessary,true)
 assert.equal(wet.hot.geometry.necessarySpecifiedGeometry,true)
 assert.ok(wet.normal.coldHotMinimum.reserveMm>17)
 assert.equal(wet.completeInstallationAccepted,false)
 assert.equal(wet.renewal.wholeColdTreeRemovalRequired,false)
 assert.equal(wet.renewal.actualIndependentWaterSupportsAndMemberToolsQualified,false)
})
test('new normal west washer/up spindle avoids the actual bowl and H0 arm; previous direct washer route is rejected',()=>{
 const r=run(),d=choice.coldDistribution
 assert.deepEqual(d.washer.stop.axisMm,[10800,1000,730])
 assert.equal(d.washer.stop.stemAboveAxisMm,130);assert.equal(d.washer.stop.stemWestMm,undefined)
 near(r.operation.tasks.find(v=>v.id==='washer')!.maximumGripReachMm,589.0358493534471)
 const old=structuredClone(choice)
 old.coldDistribution.washer.pathToStopMm=[[10980,600,950],[10980,600,730],[10980,910,730]]
 old.coldDistribution.washer.stop.axisMm=[10980,1000,730];delete old.coldDistribution.washer.stop.stemAboveAxisMm;old.coldDistribution.washer.stop.stemWestMm=130
 old.coldDistribution.washer.floorOperatorXYMm=[10800,1725];old.coldDistribution.washer.ordinaryShoulderMm=[10800,1500,1050]
 assert.equal(run(old).geometry.normalNecessary,false)
 assert.ok(run(old).geometry.failures.some(q=>q.phase==='normal'&&q.id.includes('source-prefab-bowl')))
})
test('full80mm hot union falsifies old11170 cold stop; thirty-west current geometry restores an actual diagonal reserve',()=>{
 const prior=structuredClone(choice),d=prior.coldDistribution
 d.commonPathMm.at(-1)[0]=11170;d.sinkTeeMm[0]=11170
 for(const p of d.sink.pathToStopMm)p[0]=11170
 d.sink.stop.axisMm[0]=11170
 for(const p of d.sink.pathFromStopToHeadMm)p[0]=p[0]===11140?11170:11055
 d.prefabSinkHead.coldPortMm[0]=11055;d.prefabSinkHead.pillarHandleMm[0][0]=11055;d.prefabSinkHead.spoutOutletsMm[0][0]=11055
 const rejected=inletUtilityWetAssembly({source:current,choice:prior})
 assert.equal(rejected.normal.necessaryKnownGeometry,false)
 assert.ok(rejected.normal.coldHotMinimum.reserveMm<0)
 assert.ok(wet.normal.coldHotMinimum.reserveMm>10)
 assert.equal(wet.hot.headFirstRelease.opposedAxialFacesNotReleasedBySpoolTranslationAlone,true)
})
test('formed hot spool has finite localH0 inventory and a separately bounded shallow receiver, not a store bound',()=>{
 assert.deepEqual(wet.hot.retained.terminal.at(-1),[11300,1275,595])
 assert.deepEqual(wet.choice.coldDistribution.prefabSinkHead.hotPortMm,[11300,1260,850])
 assert.ok(wet.hot.inventory.isolatedH0LowerBranchUpperL>7.5)
 assert.ok(wet.hot.inventory.isolatedH0LowerBranchUpperL<12)
 assert.equal(wet.hot.inventory.domesticStoreOrUpperNetworkIncluded,false)
 assert.equal(wet.hot.inventory.actualH0ClosureAndZeroPressureQualified,false)
 assert.equal(wet.hot.receiver.maximumPartialBatchL,5)
 assert.equal(wet.hot.receiver.actualNetCapacityAndHandlingQualified,false)
 assert.ok(wet.hot.receiver.innerGrossCeilingL>12)
 assert.equal(wet.hot.actualToolReactionAndHeadPickupAccepted,false)
 assert.ok(wet.hot.renewalGeometry.frontUpperRailStillPresentControl.some(q=>q.reserveMm<0))
 assert.equal(wet.hot.renewalGeometry.headFullRemovalToolAndTemporaryStabilityProofAccepted,false)
 assert.equal(wet.hot.renewalGeometry.necessaryConditionalSpoolSweeps,true,JSON.stringify(wet.hot.renewalGeometry.failures))
 const shallow=structuredClone(choice);shallow.coldDistribution.hotService.receiverUsableMinimumL=5
 assert.equal(inletUtilityWetAssembly({source:current,choice:shallow}).hot.geometry.necessarySpecifiedGeometry,false)
})
const proofDir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
if(proofDir){mkdirSync(proofDir,{recursive:true});writeFileSync(join(proofDir,'current-utility-wet-assembly.json'),JSON.stringify(wet,null,2))}
console.info('UTILITY_WET_CURRENT '+JSON.stringify({scope:current.scope,currentSavedDocumentAdmitted:false,normal:wet.normal,coldInventory:wet.cold.inventory,stock:wet.cold.stock,hotInventory:wet.hot.inventory,hotReceiver:wet.hot.receiver,remaining:wet.renewal}))
