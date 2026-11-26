import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {readUtilityCurrentGeometrySource} from './current-design/inlet-utility-proof-source.js'
import {deriveUtilityHotHead} from '../../project/had/studies/utility-hot-head.mjs'
import {inletUtilityMemberRenewal} from './current-design/inlet-utility-member-renewal.js'
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
test('real H0 body rejects prior operator feet and accepts the current bounded stance change',()=>{
 const prior=structuredClone(choice)
 prior.coldDistribution.washer.floorOperatorXYMm=[10700,1725]
 prior.coldDistribution.prefabSinkHead.floorOperatorXYMm=[11025,1725]
 const rejected=run(prior).geometry.failures
 assert.ok(rejected.some(q=>q.phase==='operation'&&q.id==='washer/body/actual-hot-H0-body'&&q.reserveMm<0))
 assert.ok(rejected.some(q=>q.phase==='operation'&&q.id==='sink/body/actual-hot-H0-body'&&q.reserveMm<0))
 assert.deepEqual(choice.coldDistribution.washer.floorOperatorXYMm,[10700,1800])
 assert.deepEqual(choice.coldDistribution.prefabSinkHead.floorOperatorXYMm,[11025,1775])
 assert.equal(run().geometry.normalNecessary,true)
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
 assert.deepEqual(wet.choice.coldDistribution.prefabSinkHead.hotPortMm,[11300,1260,820])
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
 assert.equal(wet.hot.renewalGeometry.necessaryConditionalSpoolSweeps,wet.hot.capturePhase.computedHeadAtIndependentRest,JSON.stringify(wet.hot.renewalGeometry.failures))
 const shallow=structuredClone(choice);shallow.coldDistribution.hotService.receiverUsableMinimumL=5
 assert.equal(inletUtilityWetAssembly({source:current,choice:shallow}).hot.geometry.necessarySpecifiedGeometry,false)
})
const proofDir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
if(proofDir){mkdirSync(proofDir,{recursive:true});writeFileSync(join(proofDir,'current-utility-wet-assembly.json'),JSON.stringify(wet,null,2))}
console.info('UTILITY_WET_CURRENT '+JSON.stringify({scope:current.scope,currentSavedDocumentAdmitted:false,normal:wet.normal,coldInventory:wet.cold.inventory,stock:wet.cold.stock,hotInventory:wet.hot.inventory,hotReceiver:wet.hot.receiver,remaining:wet.renewal}))

const member=inletUtilityMemberRenewal({source:current,wet})
test('ordinary member renewal derives510/560mm cuts from actual40mm leg faces and preserves made water',()=>{
 assert.deepEqual([...new Set(member.members.map(v=>v.cutLengthMm))].sort(),[510,560])
 assert.equal(member.members.length,8)
 assert.equal(member.wholeAssembledFrameWithdrawalRequired,false)
 assert.equal(member.coldTreeOrSourceUnionOpenedForDryMemberRenewal,false)
 assert.equal(member.drawnRailEndsNeedActualBoltedJointRedesign,true)
 assert.equal(member.tools.requiredRailEndInterfaces,16)
 assert.equal(member.tools.authoredAndProvedRailEndInterfaces,0)
 assert.equal(member.ordinaryMemberRenewalAccepted,false)
 assert.equal(member.currentSavedDocumentAdmitted,false)
 near(member.railComparison.extremeFibreMPa,80)
 near(member.stability.requiredPositivePairHoldDownN.eastWest,316.3636363636364)
 near(member.stability.requiredPositivePairHoldDownN.northSouth,290)
 assert.equal(member.stability.deadweightRestoringCreditN,0)
})
test('independent wall receiver comparison retains full pressure and gravity without claiming clips or native wall capacity',()=>{
 assert.equal(member.normalIndependentWaterBeamCandidate.beams.length,3)
 for(const beam of member.normalIndependentWaterBeamCandidate.beams)near(beam.rearFaceYMm,489.5)
 assert.equal(current.input.roomPlanMm[1],429.5)
 assert.equal(member.normalIndependentWaterBeamCandidate.steelSectionDemandWithinAuthoredComparison,true)
 for(const demand of member.normalIndependentWaterBeamCandidate.demands){
  near(demand.gravityUpperN,294.3)
  assert.ok(demand.pressureEndThrustN>130)
  assert.equal(demand.actualWallReceiverAnchorsWeldClipAndRotationResistanceQualified,false)
 }
 assert.equal(member.normalIndependentWaterBeamCandidate.fullClampForkSlidesAndWallAnchorGeometryIncluded,false)
 assert.equal(member.normalIndependentWaterBeamCandidate.permanentWallSteelExcludedFromMoving20kgTree,true)
 assert.equal(member.actualIndependentWaterSupportAccepted,false)
 assert.equal(member.thermal.frictionCredited,false)
 assert.equal(member.thermal.actualBranchedTubeReactionLawImplemented,false)
 assert.equal(member.thermal.seizedGuideAndWhollyRestrainedStraightAdverseCaseRetained,true)
 assert.ok(member.thermal.freeHeaderXmm<member.thermal.declaredSlideTravelEachWayMm)
})
test('actual H0 body falsifies an injected member tool task; empty tool list never qualifies renewal',()=>{
 const h=current.rearTreeContext.obstacles.find(v=>v.id==='actual-hot-H0-body')!.boxMm
 const grip:readonly[number,number,number]=[h[0]+h[3]/2,h[1]+h[4]/2,h[2]+h[5]/2]
 const contradicted=inletUtilityMemberRenewal({source:current,wet,tools:[{
  id:'explicit-H0-tool-intersection',shoulderMm:[grip[0],grip[1]+250,grip[2]],gripMm:grip,
  toolSegmentMm:[[grip[0],grip[1]+100,grip[2]],grip],toolRadiusMm:10,intentionalTargetIds:[]
 }]})
 assert.ok(contradicted.tools.failures.some(v=>v.id.includes('/actual-hot-H0-body')))
 assert.notEqual(contradicted.sourceDigest,member.sourceDigest)
 assert.equal(contradicted.tools.actualSocketCounterholdBodyAndWithdrawalProofAccepted,false)
 assert.equal(member.head.fullCapturedHeadOrIndividualBowlPillarAndBoardRemovalProved,false)
 assert.equal(member.stability.actualBraceAnchorAndRemainingMemberProofAccepted,false)
})
if(proofDir)writeFileSync(join(proofDir,'current-utility-member-renewal.json'),JSON.stringify(member,null,2))
console.info('UTILITY_MEMBER_CURRENT '+JSON.stringify({sourceDigest:member.sourceDigest,ordinaryRenewalAccepted:member.ordinaryMemberRenewalAccepted,interfaces:member.ordinaryCapture.interfaces.length,captureGeometryFailures:member.ordinaryCapture.geometryFailures,earliestToolFailures:member.ordinaryCapture.earliestTools.failures}))

test('one source owns four floor-seated head captures, sixteen bolted ends and finite staged movement',()=>{
 const a=wet.ordinaryCapture
 assert.equal(a.hardware.filter(q=>q.id.startsWith('capture/leg/')).length,4)
 assert.equal(a.interfaces.length,16)
 assert.ok(a.interfaces.every(q=>q.boltsPerInterface===2&&q.seatTravelsWithCapturedRail))
 assert.deepEqual([...new Set(a.interfaces.map(q=>Math.max(q.proposedMemberCutBoxMm[3],q.proposedMemberCutBoxMm[4])))].sort(),[460,510])
 assert.equal(a.controls.firstLiftMm,35);assert.equal(a.controls.southClearanceMm,60)
 assert.equal(a.controls.liftMm,360);assert.equal(a.controls.westTransferMm,800)
 assert.equal(a.controls.restTopMm,1060)
 assert.equal(a.sourceDigest,member.ordinaryCapture.sourceDigest)
 assert.equal(a.sourceBoundCapturePhase.sourceDigest,a.sourceDigest)
 assert.ok(a.sourceBoundCapturePhase.captureGeometryChecks.length>0)
 assert.ok(a.sourceBoundCapturePhase.gravityChecks.length>0)
 near(a.demand.fullHeadDynamicN,294.3)
 assert.equal(a.demand.frictionHorizontalResistanceCreditedN,0)
 assert.equal(a.demand.unbalancedHorizontalDemandWithoutPositiveFloorReceiverN,200)
 assert.equal(a.ordinaryRenewalAccepted,false)
 assert.equal(a.exactMemberWebsToolSocketsSpannerArcsAndExtractionQualified,false)
 assert.ok(a.earliestTools.checks.filter(q=>q.id.includes('source-solid-board')).every(q=>q.reserveMm>=11-1e-7))
})
test('current hot rail guard consumes computed capture rows and digest; a naked boolean or unrelated digest cannot qualify it',()=>{
 const controls=choice.coldDistribution.hotService,head=choice.coldDistribution.prefabSinkHead,
  input={choice:controls,sourceHotVertices:current.actualHot.backbone,head,obstacles:context.obstacles,settingEachMm:10},
  missing=deriveUtilityHotHead(input),phase=wet.ordinaryCapture.sourceBoundCapturePhase,
  mismatched=deriveUtilityHotHead({...input,capturePhase:phase,captureBindingDigest:'unrelated-source'}),
  historical=deriveUtilityHotHead({...input,choice:{...controls,headCapturedBeforeFrontRailReleaseRequired:undefined,headFullyRemovedBeforeFrontRailReleaseRequired:true}})
 assert.equal(missing.capturePhase.computedNecessaryGravityCapture,false)
 assert.equal(mismatched.capturePhase.computedNecessaryGravityCapture,false)
 assert.ok(missing.renewalGeometry.failures.some(q=>q.id==='hot/source-bound-positive-head-capture-required'))
 assert.equal(historical.capturePhase.historicalFullHeadRemovedControl,true)
 assert.equal(wet.hot.capturePhase.historicalFullHeadRemovedControl,false)
 assert.equal(wet.hot.capturePhase.computedHeadAtIndependentRest,false)
 assert.ok(wet.hot.renewalGeometry.failures.some(q=>q.id==='hot/source-bound-complete-head-rest-required'))
 assert.equal(wet.hot.capturePhase.sourceDigest,phase.sourceDigest)
 const blocked=structuredClone(current)
 blocked.rearTreeContext.obstacles=[...blocked.rearTreeContext.obstacles,{id:'explicit-blocked-capture-foot',boxMm:[9920,680,0,60,60,200],presence:'always'}]
 const rejected=inletUtilityWetAssembly({source:blocked})
 assert.equal(rejected.hot.capturePhase.computedNecessaryGravityCapture,false)
 assert.ok(rejected.ordinaryCapture.geometryFailures.some(q=>q.id.includes('explicit-blocked-capture-foot')))
 assert.notEqual(rejected.ordinaryCapture.sourceDigest,wet.ordinaryCapture.sourceDigest)
})

test('lower820mm factory head unions clear actual board; full75mm S tails retain both half-unions and two settings',()=>{
 const d=choice.coldDistribution
 assert.deepEqual(d.prefabSinkHead.coldPortMm,[11025,1260,820])
 assert.deepEqual(d.sink.pathFromStopToHeadMm.at(-1),d.prefabSinkHead.coldPortMm)
 assert.deepEqual(d.hotService.virtualSpoolMm,[[11300,1275,595],[11300,1275,670],[11300,1260,745],[11300,1260,820]])
 const tail=wet.hot.geometry.checks.find(q=>q.id==='hot/head-straight-after-last-bend')!
 assert.ok(tail.reserveMm>15)
 const prior=structuredClone(choice),p=prior.coldDistribution
 p.prefabSinkHead.coldPortMm[2]=850;p.prefabSinkHead.hotPortMm[2]=850;p.sink.pathFromStopToHeadMm.at(-1)[2]=850;p.hotService.virtualSpoolMm[2][2]=775;p.hotService.virtualSpoolMm[3][2]=850
 const rejected=inletUtilityWetAssembly({source:current,choice:prior})
 assert.ok(rejected.ordinaryCapture.earliestTools.failures.some(q=>q.id.includes('/866/')&&q.id.includes('source-solid-board')&&q.reserveMm<=-19+1e-7))
 const short=structuredClone(choice);short.coldDistribution.hotService.virtualSpoolMm[2][2]=775
 assert.ok(inletUtilityWetAssembly({source:current,choice:short}).hot.geometry.failures.some(q=>q.id==='hot/head-straight-after-last-bend'&&q.reserveMm< -12))
})
