import assert from 'node:assert/strict'
import test from 'node:test'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSourceEnvelopeCase,readLocalUtilityPocketSettings,runInletSourceEnvelopeCase} from './current-design/inlet-source-envelope.js'
import {derivePlantFittedFrame,inletSplitPlantBranch} from './current-design/inlet-split-plant-branch.js'
const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),
 current=runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,settings:readLocalUtilityPocketSettings()}),
 branch=current.joinedDirection.room.indoorRoutes.splitStationComparison.branchDevelopment.comparison!
const station=(r:ReturnType<typeof inletSplitPlantBranch>,role:string)=>{const found=r.incidentStations.stations.find(s=>s.role===role);assert.ok(found);return found}
test('actual high tee and low store cuts receive distinct geometric heads, never an invented common release rate',()=>{
 assert.equal(station(branch,'common-outlet-tee').localPointMm[2],2260)
 assert.equal(station(branch,'common-outlet-tee').outerTopMinusStationSignedMm,-610)
 assert.equal(station(branch,'common-outlet-tee').nonnegativeOuterTopGravityHeadComparisonMm,0)
 assert.equal(station(branch,'store-low-split').nonnegativeOuterTopGravityHeadComparisonMm,1130)
 assert.equal(station(branch,'store-factory-port').nonnegativeOuterTopGravityHeadComparisonMm,1270)
 assert.equal(station(branch,'cold-tree-interface').nonnegativeOuterTopGravityHeadComparisonMm,0)
 assert.equal(new Set(branch.incidentStations.stations.map(s=>s.id)).size,branch.incidentStations.stations.length)
 assert.ok(branch.incidentStations.stations.every(s=>s.actualMaximumReleaseLmin===null&&s.actualDrainableInventoryLitres===null&&!s.actualValveNonreturnAirAdmissionAndPressureStateKnown))
 assert.equal(branch.incidentStations.actualLiquidLevelKnown,false)
 assert.equal(branch.incidentStations.completeReleaseNetworkQualified,false)
 assert.ok(branch.incidentStations.unsupportedIncidentFamilies.includes('actual-store-hot-outlet-and-secondary-return-network'))
})
test('a coherent ground translation changes absolute origins while preserving local geometry and every head comparison',()=>{
 const i=structuredClone(branch.resolvedInput);i.groundFflMm=530
 i.fittedFrame=derivePlantFittedFrame({...i.fittedFrame.resolvedInput,groundFflMm:530,openingShiftMm:530})
 const shifted=inletSplitPlantBranch(i)
 assert.deepEqual(shifted.incidentStations.stations.map(s=>s.nonnegativeOuterTopGravityHeadComparisonMm),branch.incidentStations.stations.map(s=>s.nonnegativeOuterTopGravityHeadComparisonMm))
 for(const s of branch.incidentStations.stations){const after=shifted.incidentStations.stations.find(v=>v.id===s.id)!;assert.deepEqual(after.localPointMm,s.localPointMm);assert.deepEqual(after.absolutePointMm,s.absolutePointMm.map((v,k)=>v+(k===2?530:0)))}
 assert.equal(shifted.incidentStations.storeOuterEnvelopeTopAbsoluteMm,2180)
})
test('moving a real low separating face recomputes its own head and stable identity; missing actual connections reject',()=>{
 const i=structuredClone(branch.resolvedInput),points=i.choice.storeRemovableDropMm as unknown as number[][],terminal=i.choice.storeTerminalMm as unknown as number[][]
 points[points.length-1][2]+=100;terminal[0][2]+=100
 const moved=inletSplitPlantBranch(i),before=station(branch,'store-low-split'),after=station(moved,'store-low-split')
 assert.equal(after.id,before.id);assert.equal(after.localPointMm[2],620);assert.equal(after.nonnegativeOuterTopGravityHeadComparisonMm,1030)
 assert.deepEqual(station(moved,'store-factory-port'),station(branch,'store-factory-port'))
 const missing=structuredClone(branch.resolvedInput) as any;missing.choice.storePortTrialMm=null
 assert.throws(()=>inletSplitPlantBranch(missing),/Unsupported/)
 assert.equal(moved.fullBranchArrangementComplete,false)
})
test('source pressure changes retain actual station geometry and preserve the old full-height sensitivity as an explicitly unlocated adverse control',()=>{
 const changed=runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,settings:{...readLocalUtilityPocketSettings(),sourceMaximumTotalBar:10}}),
  after=changed.joinedDirection.room.indoorRoutes.splitStationComparison.branchDevelopment.comparison!,a=current.splitPlantRoom.comparison!,b=changed.splitPlantRoom.comparison!
 assert.deepEqual(after.incidentStations,branch.incidentStations)
 assert.equal(a.storedRelease.conditionalAdverse.actualIncidentStationPeak,false)
 assert.ok(Math.abs(a.storedRelease.conditionalAdverse.sourcePlusStoredLmin-1715.464014)<1e-6)
 assert.ok(b.storedRelease.conditionalAdverse.sourcePlusStoredLmin>a.storedRelease.conditionalAdverse.sourcePlusStoredLmin)
 assert.equal(a.storedRelease.conditionalAdverse.sourcePlusStoredDrainScreen,false)
 assert.deepEqual(a.storedRelease.actualIncidentStationInventory,branch.incidentStations)
 assert.equal(current.preSiteArrangementComplete,false)
})
