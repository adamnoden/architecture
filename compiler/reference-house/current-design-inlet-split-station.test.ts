import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {inletSplitPlantStationComparison,drawInletSplitPlantStation} from './current-design/inlet-indoor-cuts.js'
const room=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-source-envelope.results.json',import.meta.url),'utf8')).joinedDirection.room,
 split=room.indoorRoutes.splitStationComparison,normal=split.normal,
 input={reference:room.indoorCuts,choice:normal.choice,obstacles:normal.obstacles,cart:{pathMm:normal.cartPathMm,radiusMm:normal.cartRadiusMm},
  opposedPlateSouthFaceYMm:room.electricalScreen.supportFrame.connections.find((v:any)=>v.wallId==='plant-intermediate-arch').frontPlateMm[1],
  mainboardBoxMm:room.newMainboard.proposedGrossBoxMm,plantCoreYMm:normal.plantCoreYMm,roomPlanMm:normal.roomPlanMm,ceilingMm:room.electricalScreen.nominalClearHeightMm,groundFflMm:0}
test('separate Plant station clears normal approach and fixed cart plan with both settings; larger positioning fails visibly',()=>{
 assert.equal(normal.necessaryNormalAndColdModeStationGeometryScreen,true)
 assert.ok(Math.abs(normal.minBody.reserveMm-14)<1e-6)
 assert.ok(Math.abs(normal.maximumGripReachMm-597.1774980617946)<1e-6)
 assert.ok(normal.minimumArm.reserveMm>125.27)
 assert.ok(normal.cartChecks.every((v:any)=>v.reserveMm>46.49))
 assert.equal(normal.independentSettingsEachMm,10)
 assert.equal(normal.noOverheadCartClearanceCredit,true)
 assert.equal(normal.cartMaximumHeightKnown,false)
 const adverse=split.largerPositioningAdverse
 assert.equal(adverse.necessaryNormalAndColdModeStationGeometryScreen,false)
 assert.ok(Math.abs(adverse.minBody.reserveMm+6)<1e-6)
 assert.ok(adverse.diagnostics.includes('SPLIT_PLANT/ordinary-body'))
 assert.equal(normal.fullOccupiedArrangementComplete,false)
 assert.equal(normal.independentCompleteBranchesQualified,false)
 assert.equal(normal.sourceBackfeedAndStoredReleaseBounded,false)
 assert.equal(normal.actualToolsCaptureFirstRestAndReinstatementQualified,false)
 assert.equal(normal.modes.operatorAccessDuringCartTransitClaimed,false)
 assert.equal(normal.modes.closedToOpenDoorAndHardwareQualified,false)
 assert.equal(normal.modes.manualSourceFaultResponseCredited,false)
 assert.match(drawInletSplitPlantStation(normal),/No new pipe route or steel receiver drawn/)
})
test('actual mainboard blocks direct-height backing tools; real upper attachment comparisons and adverse position remain explicit',()=>{
 assert.ok(Math.abs(normal.directHeightBackingControl.mainboardReserveMm+139)<1e-6)
 assert.ok(normal.backingChecks.every((v:any)=>v.mainboardReserveMm>=125))
 const low=inletSplitPlantStationComparison({...input,choice:{...input.choice,mountCentresZMm:[1450,1700]}})
 assert.ok(low.diagnostics.includes('SPLIT_PLANT/opposed-backing-tool'))
 const north=inletSplitPlantStationComparison({...input,choice:{...input.choice,axisMm:[11360,4050,1450]}})
 assert.ok(north.cartChecks.some(v=>v.reserveMm<0))
 assert.ok(north.diagnostics.includes('SPLIT_PLANT/apparatus-cart'))
 for(const change of [{...input.choice,settingEachMm:0},{...input.choice,derivedPass:true},{...input.choice,axisMm:[NaN,4000,1450]}])
  assert.throws(()=>inletSplitPlantStationComparison({...input,choice:change}),/Unsupported/)
})
test('same nominal six-kilogram valve moves its actual reference origin; raised datum never silently changes the local fit',()=>{
 const a=inletSplitPlantStationComparison(input),b=inletSplitPlantStationComparison({...input,groundFflMm:530}),ref=input.reference.valves.find((v:any)=>v.branch==='plant')
 assert.equal(a.nominalValveOnlyGravity.kg,6)
 assert.deepEqual(b.absoluteValveAxisMm,[11360,4000,1980])
 assert.deepEqual(a.nominalValveOnlyGravity.wrenchN_Nm,b.nominalValveOnlyGravity.wrenchN_Nm)
 assert.deepEqual(a.bodyChecks,b.bodyChecks)
 const beforeMx=ref.axisMm[1]/1000*-ref.knownGravityN
 assert.ok(Math.abs(a.nominalValveOnlyGravity.wrenchN_Nm[3]-beforeMx+97.119)<1e-8)
 assert.equal(a.nominalValveOnlyGravity.actualFactoryCentroidKnown,false)
 assert.equal(a.pressureCutMagnitudeReferenceN,ref.pressureCutClearBoreComparisonN)
 assert.equal(a.nativeStructuralActionsAdopted,false)
 assert.equal(a.actualThermalReactionBoundN,null)
 assert.equal(a.fullPipeCarrierAndTemporaryMassKg,null)
})
