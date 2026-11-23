import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {inletIndoorRoutes,type IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
import {inletBankReceiver} from './current-design/inlet-bank-receiver.js'
const receipt=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-source-envelope.results.json',import.meta.url),'utf8')),
 room=receipt.joinedDirection.room,cuts=room.indoorCuts,r=room.indoorRoutes,bank=room.bankReceiver,
 source=JSON.parse(readFileSync(new URL('../../project/had/studies/south-inlet-under-sill.json',import.meta.url),'utf8')),
 input:IndoorRoutesInput={roomPlanMm:r.roomPlanMm,bankMm:[cuts.authoredChoices.bankXMm,cuts.authoredChoices.bankYMm],
  utilityAxisZMm:cuts.authoredChoices.utilityAxisZMm,plantAxisZMm:cuts.authoredChoices.plantAxisZMm,
  ...r.authoredRouteGeometry,utilitySourcePathMm:source.branches[0].coordinates,plantSourcePathMm:source.branches[1].coordinates,
  plantTransferMm:receipt.joinedDirection.transfer.pathMm,groundFflMm:cuts.groundStage.fflMm,ceilingMm:3100,
  utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,
  maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,
  networkAllowancesBar:[receipt.settings.utilityNetworkLossBar,receipt.settings.plantNetworkLossBar],
  comparison:r.authoredComparison,obstacles:r.checkedObstacles},
 run=(routes=inletIndoorRoutes(input),settings=bank.settings)=>inletBankReceiver({routes,cuts,wallCoreYMm:bank.datum.wallCoreYMm,settings})
test('finite clamps retain their local duties but actual route/operation collisions reject the bank',()=>{
 const b=run()
 assert.equal(b.necessaryRouteOperationAndClampEnvelopeScreen,false)
 assert.ok(b.diagnostics.includes('INLET_ROUTE_ORDINARY_ARM_COLLISION'))
 assert.ok(b.diagnostics.includes('INLET_ROUTE_VALVE_BODY_OR_STEM_COLLISION'))
 assert.equal(b.receivers.length,4)
 assert.ok(b.receivers.every(v=>v.stripAfterTwoSettingsMm>8.48&&v.toolAfterTwoSettingsMm>3.48))
 assert.ok(b.receivers.every(v=>v.ordinaryFullArmAfterSettingMm>5.88))
 assert.ok(b.receivers.every(v=>v.occupiedMaintenanceToolConflict.reserveMm<0),'Planned installation cannot be relabelled as ordinary occupied-field access')
 assert.equal(b.installation.maintenanceFieldRetained,true)
 assert.equal(b.actualMaterialProductToolAndCarrierSelected,false)
 assert.equal(b.actualPierTransferQualified,false)
 assert.equal(b.actualCoupledThermalAndPressureReactionSolved,false)
 assert.equal(b.nativeStructuralActionsAdopted,false)
 assert.equal(b.wholeOccupiedArrangementComplete,false)
 assert.equal(run(undefined,{...bank.settings,toolAxialMm:50}).necessaryRouteOperationAndClampEnvelopeScreen,false)
 assert.equal(run(undefined,{...bank.settings,clampWidthMm:300}).necessaryRouteOperationAndClampEnvelopeScreen,false)
 assert.throws(()=>run(undefined,{...bank.settings,clampHeightMm:NaN}),/Unsupported/)
 assert.throws(()=>run(undefined,{...bank.settings,clampHeightMm:0}),/Unsupported/)
})
test('mass sensitivities change source and ideal receiver wrenches, while geometry and source pressure are unchanged',()=>{
 const before=inletIndoorRoutes(input),after=inletIndoorRoutes({...input,comparison:{...input.comparison,jacketDensityKgM3:4000}}),a=run(before),b=run(after)
 assert.equal(after.narrowCopperWaterAndNominalValveSubtotalKg,before.narrowCopperWaterAndNominalValveSubtotalKg)
 assert.equal(after.insulationAndJacketInventory.jacketVolumeM3,before.insulationAndJacketInventory.jacketVolumeM3)
 assert.equal(after.insulationAndJacketInventory.jacketDensityReferenceKg,before.insulationAndJacketInventory.jacketDensityReferenceKg/2)
 assert.deepEqual(after.paths.map(p=>p.pointsMm),before.paths.map(p=>p.pointsMm))
 assert.deepEqual(b.receivers,a.receivers)
 assert.ok(b.reactions[0].localReferenceGravityN<a.reactions[0].localReferenceGravityN)
 for(const control of [a,b])assert.ok(control.guideGravity.closureN_Nm.every(v=>Math.abs(v)<1e-8))
 assert.ok(a.guideGravity.rows.every(row=>!row.actualReceiverQualified))
 assert.equal(a.guideGravity.distinctUnqualifiedPointCount,30)
 assert.equal(a.lockedStraight1700NClampRejected,true)
 assert.ok(a.reactions.every(v=>v.cases.some(c=>c.ratioToPublished1700NClampReference>5)))
 assert.throws(()=>inletIndoorRoutes({...input,comparison:{...input.comparison,jacketDensityKgM3:0}}),/Unsupported/)
 assert.equal(before.otherInstalledStockMassKg,null)
})
test('saved datum translates every force origin; source-pressure force and independent gravity closure remain physical',()=>{
 const local=inletIndoorRoutes(input),raised=inletIndoorRoutes({...input,groundFflMm:530})
 for(let k=0;k<local.paths.length;k++)for(let j=0;j<local.paths[k].corners.length;j++){
  const a=local.paths[k].corners[j],b=raised.paths[k].corners[j]
  assert.deepEqual(a.fullPressureComparisonForceN,b.fullPressureComparisonForceN)
  assert.equal(b.absoluteOriginMm[2]-a.absoluteOriginMm[2],530)
 }
 const translated=inletBankReceiver({routes:raised,cuts:{...cuts,groundStage:{...cuts.groundStage,fflMm:530}},wallCoreYMm:bank.datum.wallCoreYMm,settings:bank.settings})
 assert.ok(translated.guideGravity.closureN_Nm.every(v=>Math.abs(v)<1e-8))
 assert.equal(translated.receivers[0].absoluteOriginMm[2]-run().receivers[0].absoluteOriginMm[2],530)
 assert.deepEqual(translated.reactions.map(v=>v.cases),run().reactions.map(v=>v.cases),'Absolute pipe and core origins translate together; local reference wrench remains unchanged')
})
