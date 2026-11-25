import assert from'node:assert/strict'
import test from'node:test'
import{readCurrentDesignResolution}from'./current-design/resolve.js'
import{readInletSourceEnvelopeCase,runInletSourceEnvelopeCase}from'./current-design/inlet-source-envelope.js'
import{inletSplitPlantBranch}from'./current-design/inlet-split-plant-branch.js'
import{derivePlantReleaseProfiles}from'../../project/had/studies/plant-release-profiles.mjs'
const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),baseline=runInletSourceEnvelopeCase(resolved,request.sourceEnvelope),
 development=baseline.joinedDirection.room.indoorRoutes.splitStationComparison.branchDevelopment,result=development.comparison!
const minimum=(rows:readonly{reserveMm:number}[])=>Math.min(...rows.map(v=>v.reserveMm))
test('actual current stage joins source, valve, domestic tree and stored-water port without adopting rejected interfaces',()=>{
 assert.equal(development.state,'unadopted-current-source-branch-development');assert.equal(development.selected,false)
 assert.equal(result.connections.length,9);assert.equal(result.noUtilityColdHeaderOrPlantTransferThroughUtility,true)
 assert.equal(result.entryKind,'south-service-infill-within-existing-raw-arch');assert.deepEqual(result.sourceEntryInfillYMm,[3900,4050]);assert.equal(result.newMasonryHoleCredited,false)
 assert.ok(Math.abs(result.geometry.ingressBorePipePositionReserveMm-4.95)<1e-9);assert.equal(result.geometry.ingressInfillSideReserveMm,10)
 assert.ok(Math.abs(result.geometry.dropStoreReserveMm-13.378506179998157)<1e-8)
 assert.ok(minimum(result.geometry.roomBoundaryChecks)<-4.15);assert.ok(minimum(result.geometry.crossPathChecks)>56.19)
 assert.ok(minimum(result.geometry.goodsChecks)>76.48);assert.ok(minimum(result.geometry.arms)>76.26)
 for(const suffix of['finished-room-boundary','full-backbone-drop-cylinder-clearance'])assert.ok(result.diagnostics.includes('SPLIT_PLANT_BRANCH/'+suffix))
 assert.equal(result.fullBranchArrangementComplete,false);assert.equal(result.nativeStructuralActionsAdopted,false);assert.equal(result.selected,false)
})
test('pressure network exports every source/corner/valve/tee/outlet cut with conserved six-wrench balance and explicit known gravity',()=>{
 assert.ok(result.pressureNetworkEquilibriumResidualN_Nm.every(v=>Math.abs(v)<2e-9))
 assert.ok(result.pressureNodalWrenches.find(n=>n.id.endsWith('/common-outlet-tee'))!.wrenchN_Nm[0]>490)
 assert.ok(result.pressureNodalWrenches.some(n=>n.id.endsWith('/source-entry')));assert.ok(result.pressureNodalWrenches.some(n=>n.id.endsWith('/factory-port')));assert.ok(result.pressureNodalWrenches.some(n=>n.id.endsWith('/tree-interface')))
 assert.ok(Math.abs(result.referenceGravityResultantWrenchN_Nm[2]+(result.referenceStraightStockKg+result.knownValveKg)*9.81)<1e-10)
 assert.equal(result.actualValveGuideAndSupportReactionsN,null)
})
test('shared-stage source pressure and jacket edits recompute Plant actions while source duties and unrelated stock remain controlled',()=>{
 const changed=runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,settings:{...request.sourceEnvelope.settings,pipeJacketDensityComparisonKgM3:4000,sourceMaximumTotalBar:10}}),r=changed.joinedDirection.room.indoorRoutes.splitStationComparison.branchDevelopment.comparison!
 assert.deepEqual(r.geometry,result.geometry);assert.equal(r.paths[0].stock[0].referenceCopperKg,result.paths[0].stock[0].referenceCopperKg);assert.equal(r.paths[0].stock[0].referenceJacketKg,result.paths[0].stock[0].referenceJacketKg/2)
 assert.equal(r.resolvedInput.operating.plantDutyLmin,45);assert.equal(changed.branches[0].requiredDeliveryEachLmin,baseline.branches[0].requiredDeliveryEachLmin)
 assert.ok(r.pressureNodalWrenches.find(n=>n.id.endsWith('/common-outlet-tee'))!.wrenchN_Nm[0]>result.pressureNodalWrenches.find(n=>n.id.endsWith('/common-outlet-tee'))!.wrenchN_Nm[0])
})
test('cross-path routing and full-height adverse goods edits reject; local tee exemption never masks another path',()=>{
 const goods=structuredClone(result.resolvedInput);goods.goods[1].maximumCompleteHeightMm=3500
 assert.ok(inletSplitPlantBranch(goods).diagnostics.includes('SPLIT_PLANT_BRANCH/goods/actual-buffer-full-profile'))
 const crossing=structuredClone(result.resolvedInput);crossing.choice.treeFixedPathMm=[[11360,3975,2260],[11360,3800,2260],[10350,3800,2260],[10350,4200,2260],[10350,4200,2945],[10350,5000,2945]]
 assert.ok(inletSplitPlantBranch(crossing).diagnostics.includes('SPLIT_PLANT_BRANCH/cross-path-fixed-territory'))
 const ceiling=structuredClone(result.resolvedInput);ceiling.ceilingMm=2900
 assert.ok(inletSplitPlantBranch(ceiling).diagnostics.includes('SPLIT_PLANT_BRANCH/finished-room-boundary'))
})
test('strict geometry choices, current connected references, source identity and full insulation reject unsupported substitution',()=>{
 for(const mutate of[(x:any)=>x.choice.maximumGaugeBar=1,(x:any)=>x.retainedTreeInterfaceMm[0]++,(x:any)=>x.choice.sourceEntryMm[0]++,(x:any)=>x.envelope.backboneRadiusMm=37,(x:any)=>x.envelope.settingsEachMm=5,(x:any)=>x.sourceBindingDigest='']){
  const x=structuredClone(result.resolvedInput);mutate(x);assert.throws(()=>inletSplitPlantBranch(x),/Unsupported/)
 }
 const before=JSON.stringify(result.resolvedInput);inletSplitPlantBranch(result.resolvedInput);assert.equal(JSON.stringify(result.resolvedInput),before)
 assert.deepEqual(inletSplitPlantBranch(JSON.parse(JSON.stringify(result.resolvedInput))),inletSplitPlantBranch(result.resolvedInput))
})
test('infill-port perturbation can remove only its own necessary failure; full ground translation preserves local fit and shifts all pressure origins',()=>{
 const wider=structuredClone(result.resolvedInput);wider.choice.sourceEntryOpeningDiameterMm=125;wider.fittedFrame={...wider.fittedFrame,sourceOpeningDiameterMm:125}
 const r=inletSplitPlantBranch(wider);assert.ok(Math.abs(r.geometry.ingressBorePipePositionReserveMm-12.45)<1e-9);assert.equal(r.geometry.ingressInfillSideReserveMm,2.5)
 assert.ok(!r.diagnostics.includes('SPLIT_PLANT_BRANCH/service-infill-port-pipe-position-envelope'));assert.equal(r.fullBranchArrangementComplete,false)
 const shifted=inletSplitPlantBranch({...result.resolvedInput,groundFflMm:530});assert.deepEqual(shifted.geometry,result.geometry);assert.equal(shifted.referenceStraightStockKg,result.referenceStraightStockKg)
 result.paths[0].stock[0].absoluteOriginMm.forEach((v,k)=>assert.equal(shifted.paths[0].stock[0].absoluteOriginMm[k],v+(k===2?530:0)))
})
test('existing goods profile producer is reusable with actual room/buffer edits; no checked receipt is read by the current stage',()=>{
 const input={plant:{primaryBuffer:{station:[10125,5000,650,650]}},insideWestMm:9397,insideSouthMm:3797,openingHeightMm:2300},a=derivePlantReleaseProfiles(input),b=derivePlantReleaseProfiles({...input,insideWestMm:9447,openingHeightMm:2250})
 assert.equal(a.cylinder.pathMm[0][0]+50,b.cylinder.pathMm[0][0]);assert.equal(a.buffer.maximumCompleteHeightMm-50,b.buffer.maximumCompleteHeightMm);assert.equal(a.maximumHeightsAreDesignLimits,true);assert.equal(a.actualLoadedProfilesMeasuredOrFactoryQualified,false)
})
