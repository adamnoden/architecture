import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {inletUtilityRearTree,admitUtilityRearTreeChoice,type UtilityRearTreeContext} from './current-design/inlet-utility-rear-tree.js'
const json=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const choice=json('project/had/studies/inlet-utility-compact-route.json'),services=json('project/had/studies/current-house-services.json'),ias=json('project/ias/studies/utility-host-revised-route.json'),wide=json('project/had/studies/utility-wide-capture.json'),water=json('project/had/studies/water-replan.json').model
type B=readonly[number,number,number,number,number,number]
const sourceShift=services.utility.sink[0]-choice.coldDistribution.prefabSinkHead.topPlanMm[0]
const frames=Object.entries(ias.geometry.frame).map(([id,value])=>{
 const b=[...(value as number[])];b[0]-=sourceShift
 if(id==='temporary carry bar')b[0]+=5*Math.ceil(Math.max(0,services.utility.washerReservation[0]+services.utility.washerReservation[2]+30-b[0])/5)
 return{id:'IAS/frame/'+id,boxMm:b as unknown as B,presence:(id==='temporary carry bar'?'carry-bar-after-park':id==='EW rail at y1350 / z135'?'front-lower-rail':'always') as 'always'|'front-lower-rail'|'carry-bar-after-park'}
})
const north=water.groundWalls.find((w:{id:string})=>w.id==='utility-north'),plant=water.groundWalls.find((w:{id:string})=>w.id==='plant-intermediate-arch'),west=services.utility.electricalStation[0],east=12000-429.5,finish=water.internalArchControls.actualRadialFinish
const context:UtilityRearTreeContext={
 bindingDigest:sha256SemanticFingerprint({frame:ias.geometry.frame,sourceShift,services:services.utility,hot:wide.hot,north,plant}),
 maximumGaugeBar:9.2,settingEachMm:10,jacketRadialMm:26,floorMm:0,ceilingMm:3100,mainOnlyInventoryUpperLitres:12.00639465,
 obstacles:[...frames,
  {id:'source-washer-home',boxMm:[services.utility.washer[0],services.utility.washer[1],0,services.utility.washer[2],services.utility.washer[3],json('project/ias/studies/utility-first-release.json').native.height],presence:'always'},
  //489.5 is the declared source rear-face fixture; no native force/height join.
  {id:'source-rear-finished-face',boxMm:[west,0,0,east-west,489.5,3100],presence:'always'},
  {id:'source-east-face',boxMm:[east,0,0,500,4000,3100],presence:'always'},
  {id:'source-utility-north-west-jamb',boxMm:[west,north.finishedFaces[0],0,north.holes[0][0]+finish-west,north.finishedFaces[1]-north.finishedFaces[0],3100],presence:'always'},
  {id:'source-utility-north-east-jamb',boxMm:[north.holes[0][1]-finish,north.finishedFaces[0],0,east-north.holes[0][1]+finish,north.finishedFaces[1]-north.finishedFaces[0],3100],presence:'always'},
  {id:'source-Plant-south-face',boxMm:[west,plant.finishedFaces[0],0,east-west,194,3100],presence:'always'}],
 // Actual old terminal retains its25mm source cover; new hot spool is owned
 // separately and must be injected after its owning current method executes.
 retainedPaths:[{id:'retained-H0-hot-terminal',pointsMm:wide.hot.terminal,radiusWithSupportsMm:25},{id:'retained-H0-hot-backbone',pointsMm:wide.hot.backbone,radiusWithSupportsMm:37}],
 evidence:{lodgeUAndMainZero:false,sourceDrainVerified:false,washerClosedHoseOnPositiveRest:false,headHotH0AndColdZeroHeadRemoved:false,lowPocketCapturedAndCapped:false,matchedUnionReleaseVerified:false,frontRailRemoved:false,carryBarTimingVerified:false,independentLoadedCaptureAndParkRestVerified:false},
 support:{normalWheelCoupleNm:10,coldMaintenanceToolCoupleNm:60,handlingDynamicFactor:1.5,declaredSlideTravelMm:null,actualReactionLawImplemented:false}
}
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
 near(r.inventory.mainPlusTreeAndRetainedStopUpperLitres,context.mainOnlyInventoryUpperLitres+r.inventory.treeWaterGeometricUpperLitres+.882)
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
 near(r.thermalAndSupport.freeHeaderXMovementMm,.204)
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
console.info('UTILITY_REAR_TREE_OBSERVER '+JSON.stringify({scope:'Source-read pure frame/hot fixture. No native force case, assembled-tree ordinary renewal or actual support acceptance.',summary:{normal:run().geometry.normalNecessary,strip:run().geometry.stripNecessary,water:run().inventory,stock:run().stock},failures:run().geometry.failures}))
