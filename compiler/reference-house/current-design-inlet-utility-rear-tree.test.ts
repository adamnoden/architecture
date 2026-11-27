import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {readUtilityCurrentGeometrySource} from './current-design/inlet-utility-proof-source.js'
import {deriveUtilityHotHead} from '../../project/had/studies/utility-hot-head.mjs'
import {inletUtilityMemberRenewal,inletUtilityRejectedGantryControl,utilityOrdinaryHeadPlanSvg,inletUtilityPortalCandidate,inletUtilityPortalFiniteRenewal} from './current-design/inlet-utility-member-renewal.js'
import {inletUtilityRoute} from './current-design/inlet-utility-route.js'
import {inletUtilityColdService} from './current-design/inlet-utility-service.js'
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
 assert.deepEqual(choice.coldDistribution.washer.floorOperatorXYMm,[10700,1795])
 assert.deepEqual(choice.coldDistribution.prefabSinkHead.floorOperatorXYMm,[11025,1775])
 assert.equal(run().geometry.normalNecessary,true)
})
test('new normal west washer/up spindle avoids the actual bowl and H0 arm; previous direct washer route is rejected',()=>{
 const r=run(),d=choice.coldDistribution
 assert.deepEqual(d.washer.stop.axisMm,[10800,1000,730])
 assert.equal(d.washer.stop.stemAboveAxisMm,130);assert.equal(d.washer.stop.stemWestMm,undefined)
 near(r.operation.tasks.find(v=>v.id==='washer')!.maximumGripReachMm,584.2302628245134)
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
 assert.equal(wet.hot.renewalGeometry.necessaryConditionalSpoolSweeps,wet.hot.capturePhase.computedHeadClearForSpool,JSON.stringify(wet.hot.renewalGeometry.failures))
 const shallow=structuredClone(choice);shallow.coldDistribution.hotService.receiverUsableMinimumL=5
 assert.equal(inletUtilityWetAssembly({source:current,choice:shallow}).hot.geometry.necessarySpecifiedGeometry,false)
})
const proofDir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
if(proofDir){mkdirSync(proofDir,{recursive:true});writeFileSync(join(proofDir,'current-utility-wet-assembly.json'),JSON.stringify(wet,null,2))}
console.info('UTILITY_WET_CURRENT '+JSON.stringify({scope:current.scope,currentSavedDocumentAdmitted:false,normal:wet.normal,coldInventory:wet.cold.inventory,stock:wet.cold.stock,hotInventory:wet.hot.inventory,hotReceiver:wet.hot.receiver,remaining:wet.renewal}))

const member=inletUtilityMemberRenewal({source:current,wet})
test('ordinary member renewal derives460/510mm bolted cuts from actual40mm leg faces and preserves made water',()=>{
 assert.deepEqual([...new Set(member.members.map(v=>v.cutLengthMm))].sort(),[460,510])
 assert.equal(member.members.length,8)
 assert.equal(member.wholeAssembledFrameWithdrawalRequired,false)
 assert.equal(member.coldTreeOrSourceUnionOpenedForDryMemberRenewal,false)
 assert.equal(member.drawnRailEndsNeedActualBoltedJointRedesign,false)
 assert.equal(member.actualBoltedRailJointResistanceQualified,false)
 assert.equal(member.tools.requiredRailEndInterfaces,16)
 assert.equal(member.tools.authoredJointGeometryInterfaces,16)
 assert.equal(member.tools.geometricallyClearJointInterfaces,16)
 assert.equal(member.tools.firstFrontUpperRailToolCases,68)
 assert.equal(member.tools.authoredAndProvedRailEndInterfaces,0)
 assert.equal(member.tools.allMemberToolAndExtractionInterfacesRequiredForThisCount,true)
 assert.equal(member.ordinaryMemberRenewalAccepted,false)
 assert.equal(member.currentSavedDocumentAdmitted,false)
 near(member.railComparison.extremeFibreMPa,72.85714285714286)
 near(member.retiredClearSpanComparison.extremeFibreMPa,80)
 assert.equal(member.railComparison.sectionJointAndLoadPathQualified,false)
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
 assert.ok(a.interfaces.every(q=>q.boltsPerInterface===2&&!q.seatTravelsWithCapturedRail))
 assert.deepEqual([...new Set(a.interfaces.map(q=>Math.max(q.proposedMemberCutBoxMm[3],q.proposedMemberCutBoxMm[4])))].sort(),[460,510])
 assert.equal(a.controls.firstLiftMm,65);assert.equal(a.controls.southClearanceMm,0)
 assert.equal(a.controls.liftMm,380);assert.equal(a.controls.westTransferMm,800)
 assert.equal(a.controls.restTopMm,1080)
 assert.equal(a.sourceDigest,member.ordinaryCapture.sourceDigest)
 assert.equal(a.sourceBoundCapturePhase.sourceDigest,a.sourceDigest)
 assert.ok(a.sourceBoundCapturePhase.captureGeometryChecks.length>0)
 assert.ok(a.sourceBoundCapturePhase.gravityChecks.length>0)
 near(a.demand.fullHeadDynamicN,choice.coldDistribution.frameRenewal.headCapture.maximumCapturedWetHeadKg*9.81*1.5)
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
 assert.equal(wet.ordinaryCapture.controls.wholeHeadWestParkRequiredForOrdinaryRenewal,false)
 assert.equal(wet.hot.capturePhase.sourceDigest,phase.sourceDigest)
 const blocked=structuredClone(current)
 blocked.rearTreeContext.obstacles=[...blocked.rearTreeContext.obstacles,{id:'explicit-blocked-capture-foot',boxMm:[10940,815,0,50,50,200],presence:'always'}]
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

test('actual head board consists of two factory solids and exposes the rejected600mm solid-board control',()=>{
 const h=choice.coldDistribution.prefabSinkHead
 assert.deepEqual(h.topSolidPlansMm,[[10915,740,540,600],[10855,740,60,540]])
 assert.equal(context.obstacles.filter(q=>q.id.startsWith('current-prefab-board/')).length,2)
 const prior=structuredClone(choice);prior.coldDistribution.prefabSinkHead.topSolidPlansMm=[h.topPlanMm]
 const rejected=inletUtilityWetAssembly({source:current,choice:prior})
 assert.equal(rejected.normal.necessaryKnownGeometry,false)
 assert.ok(rejected.normal.headFailures.some(q=>q.id.includes('head/board/')&&q.id.includes('retained-H0-hot-terminal')))
 assert.equal(wet.normal.necessaryKnownGeometry,true,JSON.stringify(wet.normal))
})
test('current low fork380 stroke and completed member knockdown replace the actual failed overhead gantry',()=>{
 const r=wet.ordinaryCapture,old=inletUtilityRejectedGantryControl({source:current,wet})
 assert.equal(r.mode,'fork');assert.equal(old.mode,'gantry')
 assert.ok(old.geometryFailures.some(q=>q.id.includes('active-main')))
 assert.equal(r.controls.fork!.minimumIMM4,52000)
 assert.ok(r.forkReference.deflectionMm>0&&r.forkReference.deflectionMm<6)
 assert.ok(r.movingFrameBlockedControl.some(q=>q.reserveMm<0))
 assert.equal(r.controls.fullDryFrameKnockedDownWhileHeadCapturedBeforeWestMovement,true)
 assert.equal(r.exactMemberWebsToolSocketsSpannerArcsAndExtractionQualified,false)
 assert.equal(r.demand.frictionHorizontalResistanceCreditedN,0)
 assert.equal(r.demand.unbalancedHorizontalDemandWithoutPositiveFloorReceiverN,200)
 assert.equal(r.ordinaryRenewalAccepted,false)
})
test('high1550 main and actual vent share one source; old1500 is an explicit narrow quantity control',()=>{
 assert.equal(Math.max(...current.route.paths[1].virtualPointsMm.map(p=>p[2])),1550)
 assert.ok(current.service.normalPermanentEnvelopes.some(q=>q.id==='utility/service/high-vent-control'&&q.boxMm[2]>=1566))
 near(current.service.drain.pipeHighPointGravityHeadMm,1130)
 near(current.service.drain.maximumCountedWetVentEnvelopeTopMm,1682)
 near(current.service.drain.maximumVentedGravityHeadMm,1262)
 const old=structuredClone(choice)
 for(const p of old.downstreamVirtualCornersMm)if(p[2]===1550)p[2]=1500
 const priorRoute=inletUtilityRoute({choice:old,input:current.input,cuts:current.cuts,retained:current.retained})
 const priorService=inletUtilityColdService({route:priorRoute,choice:old.coldService,roomMm:current.input.roomPlanMm,washerReservationMm:current.services.utility.washerReservation,washerBodyMm:current.services.utility.washer,washerHeightMm:context.obstacles.find(q=>q.id==='source-washer-home')!.boxMm[5],maximumGaugeBar:current.input.maximumGaugeBar,input:current.input,retained:current.retained,host:current.host})
 near(priorService.drain.pipeHighPointGravityHeadMm,1080)
 near(priorService.drain.maximumVentedGravityHeadMm,1212)
 assert.ok(current.route.quantities.referenceWaterKg>priorRoute.quantities.referenceWaterKg)
 assert.ok(current.service.inventory.isolatedBranchConservativeCeilingL>priorService.inventory.isolatedBranchConservativeCeilingL)
 assert.notDeepEqual(current.route.paths,priorRoute.paths)
})
test('explicit spool-side32mm half and head-side counterpart preserve the narrow35mm control',()=>{
 near(wet.hot.headFirstRelease.headFirstUpMm,65)
 near(wet.hot.geometry.checks.find(q=>q.id==='hot/upper-face-clearance-after-head-lift-and-spool-up')!.reserveMm,35)
 const old=structuredClone(choice);old.coldDistribution.hotService.headInitialLiftMm=35
 near(inletUtilityWetAssembly({source:current,choice:old}).hot.geometry.checks.find(q=>q.id==='hot/upper-face-clearance-after-head-lift-and-spool-up')!.reserveMm,5)
})

test('finite pinned braces and real trolley foot/worker sources never supply invented floor resistance',()=>{
 const r=wet.ordinaryCapture
 assert.equal(r.temporaryBracing.source.members.length,3)
 assert.ok(r.temporaryBracing.demands.every(q=>q.eulerPinnedN>q.axialComparisonN))
 assert.equal(r.temporaryBracing.actualPinSleeveHSSWallAndFloorResistanceQualified,false)
 assert.deepEqual(r.controls.postsXYMm,[[10975,840],[10975,1450],[11260,840],[11260,1450]])
 assert.equal(r.controls.rollingOperator!.maximumBodyHeightMm,800)
 assert.equal(r.controls.rollingOperator!.bodyRadiusMm,300)
 assert.ok(r.rollingOperator.checks.some(q=>q.phase==='rolling-body'))
 assert.ok(r.rollingOperator.checks.some(q=>q.phase==='rolling-arm'))
 assert.equal(r.rollingOperator.actualHumanForceAndCasterRollingQualified,false)
 assert.equal(r.demand.actualFloorContactReactionsMaterialBucklingAndStabilityAccepted,false)
 const picture=utilityOrdinaryHeadPlanSvg(r)
 assert.match(picture,/data-part="head\/board\/0"/);assert.match(picture,/data-part="head\/board\/1"/)
 assert.match(picture,/qualification incomplete/)
})
if(proofDir)writeFileSync(join(proofDir,'current-utility-component-renewal.svg'),utilityOrdinaryHeadPlanSvg(wet.ordinaryCapture))

test('static head work owns visible waste isolation, finite inventory, actual cap join and top-access tools',()=>{
 const a=wet.ordinaryCapture,w=a.waste
 assert.equal(a.controls.method,'static-floor-seated-head-capture')
 assert.equal(a.controls.wholeHeadWestParkRequiredForOrdinaryRenewal,false)
 assert.deepEqual(a.controls.fork!.axisXMm,[11110])
 const forkWaste=a.sourceBoundCapturePhase.captureGeometryChecks.filter(q=>q.id.startsWith('capture/fork/')&&q.id.includes('/waste/'))
 assert.ok(forkWaste.length>0)
 assert.ok(forkWaste.every(q=>q.reserveMm>=0),JSON.stringify(forkWaste.filter(q=>q.reserveMm<0)))
 assert.ok(a.rejectedWholeHeadMotion.failures.length>0)
 assert.deepEqual(w.actualCapAxisMm,[10795,1295,125])
 assert.ok(w.parts.some(q=>q.id==='waste/complete-backfeed-cut'))
 assert.ok(w.inventory.allExternalBareBoxesAndPipeOuterCylindersUpperL<w.inventory.receiverVerifiedMinimumL)
 assert.ok(w.inventory.receiverInnerGrossCeilingL>w.inventory.receiverVerifiedMinimumL)
 assert.ok(w.tools.some(q=>q.minimumAngleDegrees>25))
 assert.equal(w.actualBackfeedValveSealToolsStrainerSupportAndCapPhysicalMatchQualified,false)
 assert.equal(a.ordinaryRenewalAccepted,false)
})
test('actual1040 spout lips and900 rim meet the two-bore screen; false50nom/30net control fails',()=>{
 assert.deepEqual(wet.ordinaryCapture.airGap.netLipToFloodRimMm,[120,120])
 assert.deepEqual(wet.ordinaryCapture.airGap.requiredTwoOutletBoresMm,[30.2,30.2])
 assert.equal(wet.ordinaryCapture.airGap.sinkReservoirBackfeedGeometricallyExcluded,true)
 const low=structuredClone(choice);for(const p of low.coldDistribution.prefabSinkHead.spoutOutletsMm)p[2]=950
 const rejected=inletUtilityWetAssembly({source:current,choice:low})
 assert.ok(rejected.ordinaryCapture.airGap.checks.some(q=>q.reserveMm<0))
 assert.equal(rejected.ordinaryCapture.airGap.sinkReservoirBackfeedGeometricallyExcluded,false)
 assert.equal(rejected.normal.necessaryKnownGeometry,false)
})

test('old11160 NS fork physically strikes the actual strainer;11110 clears without moving waste',()=>{
 const old=structuredClone(choice);old.coldDistribution.frameRenewal.headCapture.fork.axisXMm=[11160]
 const r=inletUtilityWetAssembly({source:current,choice:old}).ordinaryCapture
 assert.ok(r.geometryFailures.some(q=>q.id==='capture/fork/11160/waste/head-underflange'&&q.reserveMm< -33))
 const selected=wet.ordinaryCapture.sourceBoundCapturePhase.captureGeometryChecks.find(q=>q.id==='capture/fork/11110/waste/head-underflange')!
 assert.ok(selected.reserveMm>0,JSON.stringify(selected))
 const prior=structuredClone(choice),hc=prior.coldDistribution.frameRenewal.headCapture
 hc.maximumCapturedWetHeadKg=30;hc.headCGPlanDesignMm=[11125,1005,65,85];hc.headTrackYMm=[860,1120];hc.liftingEyesMm=hc.liftingEyesMm.map((q:readonly[number,number,number])=>q[1]===1140?[q[0],1120,q[2]]:q)
 Object.assign(hc.fork,{maximumCapturedWetHeadKg:30,minimumIMM4:45000,minimumTorsionalJMm4:65000,minimumClosedWallMm:4,meanClosedAreaMm2:676,minimumAreaMM2:400})
 const oldReference=inletUtilityWetAssembly({source:current,choice:prior}).ordinaryCapture
 near(oldReference.forkReference.torsionalMomentNmm,44145)
 assert.ok(oldReference.sourceBoundCapturePhase.referenceBeamStressMPa>96&&oldReference.sourceBoundCapturePhase.referenceBeamStressMPa<97)
 near(oldReference.sourceBoundCapturePhase.captureGeometryChecks.find(q=>q.id==='capture/fork/11110/waste/head-underflange')!.reserveMm,4.425243005181347,1e-6)
})

test('sixteen actual gravity seats replace hanging plates and physically clear the finite cut frame',()=>{
 const a=wet.ordinaryCapture,j=choice.coldDistribution.frameRenewal.memberJointDesign
 assert.equal(j.connectionMethod,'gravity-seat-upward-M8-into-reinforced-captive-rail-boss')
 assert.equal(a.interfaces.length,16)
 assert.ok(a.interfaces.every(q=>q.seatBearingLengthMm===75&&q.receiverPlateMm===null))
 assert.ok(a.interfaces.every(q=>q.boltAxisMm[2]===1&&q.bossBoxesMm.length===2))
 assert.ok(a.hardware.filter(q=>q.id.includes('/upward-bolt-head/')).length===32)
 assert.ok(a.hardware.filter(q=>q.id.includes('/captive-reinforced-boss/')).length===32)
 assert.equal(a.candidateFrame.filter(q=>q.id.includes(' rail ')).length,8)
 const rows=a.checks.filter(q=>q.phase==='temporary-and-end-hardware'&&!q.id.startsWith('capture/'))
 assert.ok(rows.length>0)
 assert.ok(rows.every(q=>q.reserveMm>=0),JSON.stringify(rows.filter(q=>q.reserveMm<0)))
 assert.ok(a.retiredCentrelineSeatControl.failures.some(q=>q.reserveMm===-15))
 assert.ok(a.jointReference.full2000NseatRootStressMPa<200/1.5)
 assert.deepEqual(a.geometryFailures,[])
 assert.deepEqual(a.frontUpperRailTools.failures,[])
 assert.equal(a.jointReference.actualWeldHSSLocalWallAndBoltResistanceAccepted,false)
 assert.equal(a.ordinaryRenewalAccepted,false)
})

test('actual permanent frame joints bound the shallow waste receiver and every retained formed waste part',()=>{
 const a=wet.ordinaryCapture
 assert.deepEqual(choice.coldDistribution.wasteService.receiverOuterMm,[11000,1140,0,400,400,70])
 near(a.waste.inventory.receiverInnerGrossCeilingL,10.349856)
 const joined=a.checks.filter(q=>q.phase==='permanent-joint-versus-waste'||q.phase==='drain-before-capture-actual-frame-joints')
 assert.ok(joined.length>0)
 assert.ok(joined.every(q=>q.reserveMm>=0),JSON.stringify(joined.filter(q=>q.reserveMm<0)))
 const old=structuredClone(choice);old.coldDistribution.wasteService.receiverOuterMm=[11040,1200,0,360,340,90]
 const rejected=inletUtilityWetAssembly({source:current,choice:old}).ordinaryCapture
 assert.ok(rejected.geometryFailures.some(q=>q.phase==='drain-before-capture-actual-frame-joints'&&q.reserveMm<0))
})

test('first front-upper release uses full upward socket and north ratchet with both hands clear of retained hot and cold',()=>{
 const t=wet.ordinaryCapture.frontUpperRailTools
 assert.equal(t.tasks.length,68)
 assert.ok(t.tasks.every(q=>q.workingGripMm[1]>=1523&&q.steadyGripMm[1]>=1485))
 assert.ok(t.tasks.every(q=>q.socketMm[0][0]===q.socketMm[1][0]&&q.socketMm[0][1]===q.socketMm[1][1]))
 assert.deepEqual(t.failures,[])
 assert.ok(wet.ordinaryCapture.waste.checks.some(q=>q.id.startsWith('waste/bin-before-fork/raw-host-frame/leg ')))
 const clearComparison=member.members.map(q=>q.cutLengthMm+2*choice.coldDistribution.frameRenewal.memberJointDesign.memberEndGapMm)
 assert.deepEqual([...new Set(clearComparison)].sort(),[510,560])
})

test('a west ratchet swing is a real rejected control against the still-present waste dry rod',()=>{
 const west=structuredClone(choice);west.coldDistribution.frameRenewal.memberJointDesign.ratchetWorkingSectorDegrees=[-15,0]
 const r=inletUtilityWetAssembly({source:current,choice:west}).ordinaryCapture
 assert.ok(r.frontUpperRailTools.failures.some(q=>q.id.includes('/waste/drain-dry-extension/')))
 assert.notEqual(r.sourceDigest,wet.ordinaryCapture.sourceDigest)
})

const portal=inletUtilityPortalCandidate({source:current,wet,capture:wet.ordinaryCapture})
console.info('UTILITY_PORTAL_NORMAL '+JSON.stringify({geometryFailures:portal.geometryFailures,coldFailures:portal.candidateColdFailures,bearing:portal.normalBearing,mass:portal.mass,headRelease:portal.headRelease,legacy:portal.legacyCage,duties:portal.demandedInterfaces}))
if(proofDir)writeFileSync(join(proofDir,'current-utility-portal-candidate.json'),JSON.stringify(portal,null,2))
test('selected complete side portals carry actual matched head ribs without either front tie',()=>{
 assert.equal(choice.coldDistribution.frameRenewal.portalDesign.frontUpperAndLowerTiesIncluded,false)
 assert.equal(portal.parts.filter(q=>q.id.includes('/leg/')).length,4)
 assert.equal(portal.parts.filter(q=>q.id.endsWith('/side-upper')).length,2)
 assert.ok(portal.parts.some(q=>q.id==='portal/rear/lower-tie'))
 assert.ok(portal.parts.every(q=>!q.id.includes('front-tie')))
 assert.deepEqual(portal.geometryFailures,[])
 assert.equal(portal.candidateColdNormal,true,JSON.stringify(portal.candidateColdFailures))
 assert.equal(portal.normalBearing.necessary,true)
 assert.ok(portal.normalBearing.minimumHorizontalOverlapMm>=10)
 assert.ok(portal.normalBearing.reactionChecks.every(q=>q.reserveN>=-1e-7))
 assert.ok(portal.legacyCage.upperRails.some(q=>q.id.includes('y1350')&&q.minimumNarrowBearingNominalMm===5))
 assert.equal(portal.normalGravityCapacityAccepted,false)
 assert.equal(portal.ordinaryRenewalAccepted,false)
})
test('all factory side ribs, clips, steel sheet and retained head water fit the propagated36kg condition',()=>{
 assert.ok(portal.mass.headSteelUpperKg>15)
 assert.ok(portal.mass.completeHeadWetUpperKg>20)
 assert.ok(portal.mass.captureMassReserveKg>0)
 assert.equal(wet.ordinaryCapture.controls.maximumCapturedWetHeadKg,36)
 near(wet.ordinaryCapture.demand.fullHeadDynamicN,529.74)
 assert.ok(wet.ordinaryCapture.forkReference.deflectionMm<6)
 assert.ok(portal.mass.frameSteelUpperKg>15)
 near(portal.demandedInterfaces.frontEdgeRearPairUpliftBeforeDeadWeightN,250)
 assert.equal(portal.demandedInterfaces.frictionCreditedN,0)
 assert.equal(portal.normalBearing.actualFactoryHeadSheetBowlWeldAndMatchedBoltsQualified,false)
})

test('normal and raised-head stability use the actual highest head part and both settings',()=>{
 near(portal.demandedInterfaces.normalHeightAfterTwoSettingsMm,1158)
 near(portal.demandedInterfaces.requiredFloorMomentNmm,231600)
 near(portal.demandedInterfaces.capturedHeadHeightAfterTwoSettingsMm,1460)
 near(portal.demandedInterfaces.capturedHeadHorizontalMomentNmm,292000)
 const capped=structuredClone(choice);capped.coldDistribution.frameRenewal.portalDesign.normalForceHeightMm=870
 assert.throws(()=>inletUtilityPortalCandidate({source:current,wet:{...wet,choice:capped},capture:wet.ordinaryCapture}),/full occupied head action height/)
})

test('actual bounded head stock determines CG and exposes pressure-body water separately from the bowl',()=>{
 const b=portal.mass.cgStockBounds
 assert.equal(b.withinDeclaredSourceBox,true,JSON.stringify(b))
 assert.equal(b.factoryHeadMeasuredAndQualified,false)
 for(const v of b.pressureBodiesWaterCeilingByPillarL)near(v,.672)
 assert.deepEqual(b.pressureBodyComponentIds,['U/head-cold-pillar','P/head-hot-pillar'])
 near(b.capturedHeadOuterWaterCeilingL,1.544)
 near(b.bowlResidualDuringCaptureCeilingL,.2)
 assert.ok(b.minimumModeledHeadSteelKg>13)
 assert.deepEqual(wet.ordinaryCapture.controls.headCGPlanDesignMm,[11125,1000,65,110])
 assert.ok(wet.ordinaryCapture.controls.liftingEyesMm.some(p=>p[0]===11220))
 near(wet.ordinaryCapture.forkReference.torsionalMomentNmm,52974)
 assert.ok(wet.ordinaryCapture.forkReference.totalElasticEnvelopeCoverMm>5.5&&wet.ordinaryCapture.forkReference.totalElasticEnvelopeCoverMm<6)
 const a=wet.ordinaryCapture,q=a.controls.fork!
 near(a.sourceBoundCapturePhase.referenceBeamStressMPa,Math.hypot(a.demand.fullHeadDynamicN*(q.rootYMm-q.rearTipYMm)*q.depthMm/(2*q.minimumIMM4),Math.sqrt(3)*a.forkReference.torsionalShearMPa))
 assert.ok(a.sourceBoundCapturePhase.referenceBeamStressMPa<a.sourceBoundCapturePhase.referenceAllowableMPa)
})

test('exact steel brace members leave actual cold paths clear; filled-bay boxes remain a rejected calculation control',()=>{
 assert.equal(portal.braceObstacleRepresentation,'exact-members')
 assert.equal(portal.candidateColdNormal,true,JSON.stringify(portal.candidateColdFailures))
 const filled=inletUtilityPortalCandidate({source:current,wet,capture:wet.ordinaryCapture,braceObstacleRepresentation:'filled-bay-control'})
 assert.ok(filled.candidateColdFailures.some(q=>q.id.includes('rear/diagonal/')&&q.reserveMm< -100))
 assert.ok(filled.candidateColdFailures.some(q=>q.id.includes('washer/stop-body')&&q.reserveMm<0))
 assert.notEqual(filled.sourceDigest,portal.sourceDigest)
})
test('unilateral corner reactions are bounded by equilibrium without equal-stiffness or strict-positive assumptions',()=>{
 const a=portal.normalBearing
 assert.equal(a.unilateralReactionCases.length,8)
 assert.ok(a.unilateralCornerReactionBoundsN.some(q=>Math.abs(q.minimumN)<1e-7))
 for(const q of a.unilateralReactionCases){
  near(q.reactionsN.reduce((s,v)=>s+v,0),a.dynamicHeadN)
  assert.ok(q.reactionsN.every(v=>v>=-1e-7))
 }
 assert.equal(a.actualIndividualLegReactionsQualified,false)
 assert.equal(a.actualFactoryHeadSheetBowlWeldAndMatchedBoltsQualified,false)
})
test('same pressure-device parts expose compound envelopes instead of silently adding or reusing an80mm prism',()=>{
 for(const q of portal.mass.cgStockBounds.pressureDevicePartsByPillar){
  assert.equal(q.parts.length,3)
  near(q.sumOuterBoxVolumesL,.672)
  assert.deepEqual(q.axisAlignedEnclosingBoxMm.slice(3),[60,190,240])
  assert.equal(q.fitsAnyOrthogonal80by80by300Box,false)
  assert.equal(q.arbitraryObliqueDeviceFitProved,false)
 }
})

const portalFinite=inletUtilityPortalFiniteRenewal({source:current,wet,capture:wet.ordinaryCapture,portal})
console.info('UTILITY_PORTAL_FINITE '+JSON.stringify({components:portalFinite.components,geometryFailures:portalFinite.geometryFailures,receiver:portalFinite.receiver,toolFailures:portalFinite.toolFailures,open:portalFinite.specificOpenGates}))
if(proofDir)writeFileSync(join(proofDir,'current-utility-portal-finite-renewal.json'),JSON.stringify(portalFinite,null,2))
test('same portal case owns11 current L/frontleg/brace components and the actual source notched RC receiver datum',()=>{
 assert.equal(portalFinite.components.length,11)
 assert.equal(portalFinite.components.filter(q=>q.id.endsWith('/welded-L')).length,2)
 assert.equal(portalFinite.components.filter(q=>q.id.includes('/leg-assembly/')).length,2)
 assert.equal(portalFinite.components.filter(q=>q.id.includes('/side-brace/')).length,4)
 assert.equal(portalFinite.receiver.sourceContextDigest,current.candidateFloorPocket.bindingDigest)
 assert.deepEqual(portalFinite.receiver.rcLocalMm,[-560,-360])
 assert.ok(portalFinite.receiver.parts.some(q=>q.role==='structural-corbel-no-glass-bearing'))
 assert.ok(portalFinite.receiver.parts.some(q=>q.role==='cast-RC-anchor'))
 assert.equal(portalFinite.receiver.frictionResistanceCreditedN,0)
 assert.equal(portalFinite.receiver.actualRCBreakoutRebarWeldWaterproofAirAndPointThermalJoinAccepted,false)
 assert.equal(portalFinite.ordinaryRenewalAccepted,false)
 assert.deepEqual(portalFinite.toolFailures,[],JSON.stringify(portalFinite.toolFailures))
 assert.ok(portalFinite.specificOpenGates.length>0)
})

test('finite phase ledger replaces detached originals by actual parked steel before the next release',()=>{
 assert.equal(portalFinite.phaseState.length,11)
 assert.deepEqual(portalFinite.phaseState[0].removedOriginalIds,[])
 for(const q of portalFinite.phaseState.filter(q=>!q.componentId.startsWith('portal/rear/'))){
  assert.ok(q.removedOriginalIds.includes('portal/rear/lower-tie'))
  assert.equal(q.parkedObstacleIds.filter(id=>id.startsWith('parked/portal/rear/')).length,3)
 }
 assert.ok(portalFinite.phaseState[4].parkedObstacleIds.some(id=>id.startsWith('parked/portal/0/')))
 for(const q of portalFinite.finalParkedParts)assert.ok(portalFinite.checks.some(c=>c.obstacleId===q.id)||q.id.startsWith('parked/portal/1/'))
})

test('receiver containment counts exact disjoint RC coverage and exposes outside area without a fabricated distance',()=>{
 const footprints=portalFinite.receiver.footprintChecks
 assert.equal(footprints.length,20)
 for(const q of footprints){
  assert.equal(q.contained,true,JSON.stringify(q))
  assert.equal(q.status,'contained')
  near(q.missingAreaMm2,0)
  near(q.coveredAreaMm2,q.probeAreaMm2)
  assert.equal('reserveMm' in q,false)
 }
 const rejectedChoice=JSON.parse(JSON.stringify(wet.choice))
 rejectedChoice.coldDistribution.frameRenewal.portalDesign.finiteRenewal.normalReceiverInwardOffsetMm=0
 const outside=inletUtilityPortalFiniteRenewal({source:current,wet:{...wet,choice:rejectedChoice},capture:wet.ordinaryCapture,portal})
 const missed=outside.receiver.footprintChecks.filter(q=>!q.contained)
 assert.ok(missed.length>0)
 for(const q of missed){
  assert.ok(q.missingAreaMm2>0)
  assert.equal(q.status,'outside-actual-RC')
  near(q.coveredAreaMm2+q.missingAreaMm2,q.probeAreaMm2)
  assert.ok(outside.receiver.geometryFailures.some(f=>f.id===q.id))
 }
})

test('front top-driven bolts release the captured head without a rear operator or dowel uplift fiction',()=>{
 const a=portal.headRelease
 assert.equal(portal.headMountRepresentation,'front-top-bolts')
 assert.equal(a.toolTasks.length,4)
 assert.equal(a.necessaryTools,true,JSON.stringify(a.toolFailures))
 assert.equal(a.reference.referenceNecessary,true,JSON.stringify(a.reference))
 assert.equal(a.reference.rearDowelUpliftResistanceCreditedN,0)
 assert.ok(a.reference.sideRibNetIMM4<a.reference.sideRibGrossIMM4)
 assert.ok(a.reference.fullOneSideFrontReactionUpperN>2000)
 assert.ok(a.reference.boltTensionUpperEachN>2000)
 assert.ok(a.rearDowelClearanceAfterFirstLiftMm>0)
 assert.equal(a.actualPhysicalFastenerSheetWeldAndSupportQualified,false)
 assert.equal(a.fullyRemovedHeadOrRearOperatorRequired,false)
 const old=inletUtilityPortalCandidate({source:current,wet,capture:wet.ordinaryCapture,headMountRepresentation:'legacy-cross-clips-control'})
 assert.ok(old.headRelease.oldCrossBoltReaches.some(q=>q.reachReserveMm< -300))
 assert.equal(old.headRelease.necessaryTools,false)
 assert.notEqual(old.sourceDigest,portal.sourceDigest)
})

test('finite diagonal sweeps use actual covered capsules; filled bays remain rejected calculation controls',()=>{
 assert.equal(portalFinite.movingBraceRepresentation,'exact-sampled-capsules')
 assert.ok(portalFinite.samplingProofs.length>0)
 assert.ok(portalFinite.samplingProofs.every(q=>q.chordCoverMm>=0&&q.maximumStepMm<=5+1e-7),JSON.stringify(portalFinite.samplingProofs.filter(q=>q.maximumStepMm>5+1e-7)))
 assert.ok(portalFinite.checks.some(q=>q.movingPrimitiveId==='portal/0/side-brace/0'))
 const filled=inletUtilityPortalFiniteRenewal({source:current,wet,capture:wet.ordinaryCapture,portal,movingBraceRepresentation:'filled-bay-control'})
 const isRearFeed=(q:{componentId:string;phase:string;obstacleId:string})=>q.componentId==='portal/rear/diagonal/0'&&q.phase==='captured-rear-member-to-south-plane'&&q.obstacleId==='cold/sink/feed/tube/1'
 assert.ok(filled.geometryFailures.some(q=>isRearFeed(q)&&q.reserveMm< -100))
 assert.equal(portalFinite.geometryFailures.some(isRearFeed),false,JSON.stringify(portalFinite.geometryFailures.filter(isRearFeed)))
 assert.notEqual(filled.sourceDigest,portalFinite.sourceDigest)
 // Head compression has a real face contact, independent of the captive-block void.
 assert.equal(portal.normalBearing.contactDatum.headRibBottomMm,850)
 assert.equal(portal.normalBearing.contactDatum.NSBeamTopMm,850)
 assert.equal(portal.normalBearing.contactDatum.threadBlockToHeadBossVoidMm,6)
 assert.equal(portal.normalBearing.contactDatum.boltCompressionColumnCredited,false)
 assert.equal(portal.normalBearing.contactDatum.localBeamWallCaptiveBlockWeldAndThreadQualified,false)
})

test('flat socket has6.5mm head engagement; inward two-hand ratchet clears the actual retained H0 vertical',()=>{
 const a=portal.headRelease
 assert.equal(a.socketRepresentation,'flat-ended')
 assert.equal(a.toolRepresentation,'inward-ratchet')
 for(const q of a.toolTasks){near(q.socketHeadEngagementMm,6.5);assert.equal(q.mainGripsMm.length,16);assert.equal(q.steadyGripsMm.length,16)}
 assert.deepEqual(a.toolFailures,[],JSON.stringify(a.toolFailures))
 const capsule=inletUtilityPortalCandidate({source:current,wet,capture:wet.ordinaryCapture,headSocketRepresentation:'capsule-control'})
 assert.ok(capsule.headRelease.toolFailures.some(q=>q.id.includes('/socket/head/load-pedestal/')&&q.reserveMm< -5))
 const axis=inletUtilityPortalCandidate({source:current,wet,capture:wet.ordinaryCapture,headToolRepresentation:'bare-axis-arm-control',headShoulderRepresentation:'old-low-shoulder-control'})
 assert.ok(axis.headRelease.toolFailures.some(q=>q.id.includes('retained-H0-hot-backbone/4')&&q.reserveMm< -9))
 assert.notEqual(axis.sourceDigest,portal.sourceDigest)
 assert.notEqual(capsule.sourceDigest,portal.sourceDigest)
})

test('rear members move west below the cold feed before raising; the old high route is a real collision control',()=>{
 assert.equal(portalFinite.rearRouteOrder,'west-before-up')
 assert.equal(portalFinite.geometryFailures.some(q=>q.componentId.startsWith('portal/rear/')&&q.obstacleId==='cold/sink/feed/tube/1'),false,JSON.stringify(portalFinite.geometryFailures.filter(q=>q.componentId.startsWith('portal/rear/')&&q.obstacleId==='cold/sink/feed/tube/1')))
 const previous=structuredClone(choice)
 Object.assign(previous.coldDistribution.frameRenewal.portalDesign.finiteRenewal,{rearRotationCentreXMm:10730,rearRotationCentreZMm:1100,rearParkLevelsMm:[1050,1150,1250]})
 const high=inletUtilityPortalFiniteRenewal({source:current,wet:{...wet,choice:previous},capture:wet.ordinaryCapture,portal,rearRouteOrder:'old-up-before-west-control'})
 assert.ok(high.geometryFailures.some(q=>q.componentId==='portal/rear/lower-tie'&&q.phase==='rear-member-up-before-west-control'&&q.obstacleId==='cold/sink/feed/tube/1'&&q.reserveMm< -150))
 assert.notEqual(high.sourceDigest,portalFinite.sourceDigest)
 assert.equal(portalFinite.ordinaryRenewalAccepted,false)
})

test('standing bolt-tool arms clear the retained supporting column; low union posture remains a failed bolt control',()=>{
 assert.deepEqual(portal.headRelease.operatorShoulderMm,[11140,1680,1350])
 assert.deepEqual(wet.ordinaryCapture.controls.normalWorkingShoulderMm,[11140,1690,1150])
 assert.deepEqual(portal.headRelease.toolFailures,[],JSON.stringify(portal.headRelease.toolFailures))
 const low=inletUtilityPortalCandidate({source:current,wet,capture:wet.ordinaryCapture,headShoulderRepresentation:'old-low-shoulder-control'})
 assert.ok(low.headRelease.toolFailures.some(q=>q.id.includes('capture/lift-column/11110')&&q.reserveMm< -13))
 assert.notEqual(low.sourceDigest,portal.sourceDigest)
})

test('welded L subassemblies retain normal bearing and expose16 new renewable interfaces',()=>{
 const a=portalFinite.independentMemberDesign
 assert.equal(a.representation,'welded-L-members')
 assert.equal(a.jointInterfaces.length,16)
 assert.equal(new Set(a.jointInterfaces.map(q=>q.id)).size,16)
 assert.ok(a.jointInterfaces.every(q=>q.actualEndHardwareGeometryAndToolsQualified===false))
 assert.deepEqual(a.remainingNormalFramePartIds,[])
 assert.equal(a.normalGeometryChangedByThisRenewalSplit,false)
 assert.equal(a.normalHeadAndWaterMustRemainIndependentlySupported,true)
 assert.equal(a.actualRearJointApproachHandReleaseAndPositiveCaptureToolGeometryImplemented,false)
 assert.equal(a.actualIndependentPositiveParkReceiversImplemented,false)
 assert.equal(a.actualWholeRenewalAccepted,false)
 assert.ok(a.requiredMemberCaptureCapacityKg<a.availableAuthoredMemberToolPayloadKg)
 assert.ok(a.crewRetreatChecks.some(q=>q.id.startsWith('brace-held-at220/body-retreat/')))
 assert.ok(a.fixedBaseReference.combinedStressMPa<200/1.5)
 assert.ok(a.fixedBaseReference.gravityUpperEachN<a.fixedBaseReference.eulerFixedFreeN/3)
 assert.equal(a.fixedBaseReference.actualReceiverJointAndTemporaryStabilityAccepted,false)
 const whole=inletUtilityPortalFiniteRenewal({source:current,wet,capture:wet.ordinaryCapture,portal,sideRemovalRepresentation:'whole-unit-control'})
 assert.equal(whole.components.length,5)
 assert.ok(whole.geometryFailures.some(q=>q.componentId==='portal/side-unit/0'&&q.obstacleId==='cold/washer/stop-body'))
 assert.notEqual(whole.sourceDigest,portalFinite.sourceDigest)
})

test('actual L caps and counted welds carry a source-bound reference; all new handling and local proofs remain unqualified',()=>{
 const a=portalFinite.weldedLDesign
 assert.equal(a.members.length,2)
 near(a.normalHeadBearingPlaneUnchangedMm,850)
 assert.equal(a.rearPostTopIsActualCapBottom,true)
 assert.equal(portal.parts.filter(q=>q.id.includes('/post-cap/')).length,4)
 assert.equal(portal.parts.filter(q=>q.id.includes('/rear-weld/')).length,8)
 assert.equal(a.weld.effectiveBaseWallLimitedThroatMm,3)
 assert.ok(a.weld.referenceVonMisesMPa<a.weld.referenceAllowableMPa,JSON.stringify(a.weld))
 assert.ok(a.weld.capConservativeOneWayStressMPa<a.weld.referenceAllowableMPa)
 assert.ok(a.weld.postCapWeldReferenceVonMisesMPa<a.weld.referenceAllowableMPa)
 assert.equal(a.weld.postCapFullPenetrationEffectiveWallMm,3)
 assert.equal(a.weld.actualWeldFatigueHSSLocalWallCapAndMaterialQualified,false)
 for(const q of a.members){
  assert.ok(q.modeledSteelUpperKg>4)
  assert.ok(q.countedFilletUpperKg>0)
  assert.ok(q.countedPostCapGrooveWeldUpperKg>0)
  assert.ok(q.maximumCapturedKg>q.modeledSteelUpperKg)
  assert.equal(q.withinPayloadRequirement,true,JSON.stringify(q))
  assert.equal(q.stockCGBounds.length,3)
  assert.ok(q.stockCGBounds.every(b=>Number.isFinite(b.minimumMm)&&b.maximumMm>=b.minimumMm))
  assert.ok(q.frontSignedVerticalReactionEnvelopeN[0]<=0)
  assert.equal(q.requiresClosedPositiveClamps,true)
  assert.equal(q.gravityFrictionCreditedN,0)
  assert.ok(q.memberHandlingCoupleUpperNmm>0)
  assert.deepEqual(q.clampGeometryFailures,[],JSON.stringify(q.clampGeometryFailures))
  assert.equal(q.actualJawScrewSwingAntiRollMemberLocalWallAndToolGeometryQualified,false)
 }
 assert.equal(a.ordinaryRenewalAccepted,false)
 const prior13=inletUtilityPortalFiniteRenewal({source:current,wet,capture:wet.ordinaryCapture,portal,sideRemovalRepresentation:'independent-members'})
 assert.equal(prior13.components.length,13)
 assert.equal(prior13.independentMemberDesign.old13MemberModeRequiresCuttingWeldedLs,true)
 assert.equal(prior13.ordinaryRenewalAccepted,false)
})
test('only the actual joined front seat receives monotone upward contact treatment; penetration remains a failure',()=>{
 assert.ok(portalFinite.separatingSeatContacts.length>0)
 for(const q of portalFinite.separatingSeatContacts){
  assert.ok(q.componentId.endsWith('/welded-L'))
  assert.ok(q.targetPartId.endsWith('/leg/1')||q.targetPartId.endsWith('/post-cap/1')||q.targetPartId.includes('/post-cap-weld/1/'))
  assert.ok(q.physicalClearanceMm>=-1e-7)
  assert.equal(q.settingAllowanceAppliedMm,0)
 }
 const invalid={...portal,parts:portal.parts.map(q=>{
  if(q.id!=='portal/0/post-cap/1')return q
  const b=[...q.boxMm];b[2]+=1
  return{...q,boxMm:b as unknown as typeof q.boxMm}
 })}
 const bad=inletUtilityPortalFiniteRenewal({source:current,wet,capture:wet.ordinaryCapture,portal:invalid})
 assert.ok(bad.geometryFailures.some(q=>q.componentId==='portal/0/welded-L'&&q.obstacleId==='portal/0/post-cap/1'&&q.reserveMm< -20))
 assert.equal(bad.separatingSeatContacts.some(q=>q.componentId==='portal/0/welded-L'),false)
 assert.notEqual(bad.sourceDigest,portalFinite.sourceDigest)
 const foreign=portalFinite.checks.filter(q=>q.intentionalSeparatingSeatContact)
 assert.ok(foreign.every(q=>q.obstacleId.includes('/leg/1')||q.obstacleId.includes('/post-cap/1')||q.obstacleId.includes('/post-cap-weld/1/')))
})

test('L40UP/S80 includes both positive clamp envelopes and every actual live-service obstacle',()=>{
 assert.equal(portalFinite.memberCaptureEnvelopes.length,4)
 assert.ok(portalFinite.components.filter(q=>q.id.endsWith('/welded-L')).every(q=>q.phases.includes('captured-welded-L-south-park')))
 const service=portalFinite.checks.filter(q=>q.componentId.endsWith('/welded-L')&&(q.obstacleId.startsWith('cold/')||q.obstacleId.startsWith('U/hot/')||q.obstacleId.startsWith('HAD/utility-route/')))
 assert.ok(service.length>0)
 assert.ok(service.every(q=>q.reserveMm>=-1e-7),JSON.stringify(service.filter(q=>q.reserveMm< -1e-7)))
 assert.ok(portalFinite.checks.some(q=>q.movingPrimitiveId?.startsWith('capture-clamp/portal/')))
 assert.equal(portalFinite.independentMemberDesign.actualWholeRenewalAccepted,false)
})

test('actual crew retreat and positive-clamp interference remain in the main finite failure ledger',()=>{
 const crew=portalFinite.independentMemberDesign.crewRetreatFailures
 assert.equal(portalFinite.geometryFailures.filter(q=>q.componentId==='crew/brace-retreat').length,crew.length)
 for(const q of crew)assert.ok(portalFinite.geometryFailures.some(v=>v.obstacleId===q.id&&v.reserveMm===q.reserveMm))
 for(const m of portalFinite.weldedLDesign.members)for(const q of m.clampGeometryFailures)assert.ok(portalFinite.geometryFailures.some(v=>v.componentId===m.componentId&&v.obstacleId===q.id))
})
