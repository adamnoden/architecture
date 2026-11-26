import test from 'node:test'
import assert from 'node:assert/strict'
import {applyEngineeringEdit,beginEngineeringEdit,engineeringBase,replayEngineeringEdit,editableStoreDrainId} from './current-design/engineering-edit.js'
import {readFileSync} from 'node:fs'
import {admitStoreDrainChoice,storeDrainCargoDemand,inletStoreDrain} from './current-design/inlet-store-drain.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSourceEnvelopeCase,runInletSourceEnvelopeCase,readLocalUtilityPocketSettings} from './current-design/inlet-source-envelope.js'
import {readGroundSectionCase,runGroundSectionCase} from './current-design/structural-ground.js'
const resolved=readCurrentDesignResolution(),choice=admitStoreDrainChoice(JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-store-drain-candidate.json',import.meta.url),'utf8')))
const cylinderWorkingFieldLocalMm=JSON.parse(readFileSync(new URL('../../project/had/studies/current-house-services.json',import.meta.url),'utf8')).plant.cylinder.workingEast as readonly[number,number,number,number]
let plant:Parameters<typeof inletStoreDrain>[0]['plant']
test.before(()=>{
 const request=readInletSourceEnvelopeCase(resolved),ground=runGroundSectionCase(resolved,readGroundSectionCase(resolved).ground),r=runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,settings:readLocalUtilityPocketSettings()},ground)
 assert.ok(r.splitPlantRoom.comparison);plant=r.splitPlantRoom.comparison
})
test('source-bound factory lowest-point drain/capped cock and preattached continuation clear actual cold state',()=>{
 const r=inletStoreDrain({choice,plant,cylinderWorkingFieldLocalMm})
 assert.equal(r.geometry.necessaryKnownGeometry,true);assert.equal(r.geometry.necessaryRemovalKnownGeometry,true);assert.equal(r.receiving.necessaryColdReceiverGeometry,true)
 assert.equal(r.coldEnergy.outerTopAbsoluteMm-r.coldEnergy.outerTopLocalMm,530)
 assert.equal(r.coldEnergy.actualOpenExitAbsoluteMm,468);assert.equal(r.coldEnergy.gravityHeadMm,1712)
 assert.ok(Math.abs(r.coldEnergy.maximumLmin-17.47923766191087)<1e-10)
 assert.ok(r.receiving.independentAirGapAfterTwoSettingsMm>44)
 assert.ok(r.geometry.reachMm<650)
 assert.equal(r.proposal.continuationAttachedBeforeCockOpening,true)
 assert.equal(r.proposal.closedCockAndMetalCap,true)
 assert.equal(r.factoryDesign.ordinaryColdTerminalUnchanged,true);assert.equal(r.factoryDesign.requiredContinuousFallMm,10);assert.equal(r.finiteInventory.necessaryFactoryResidualRequirement,true);assert.ok(r.finiteInventory.maximumCargoResidualWaterKg<2);assert.equal(r.cargoInterface.necessaryLowProfileBlankGeometry,true)
 assert.equal(r.finiteInventory.emptyForCargoPhysicallyProved,false)
 assert.ok(Math.abs(r.finiteInventory.outerCylindricalEnvelopeUpperLitres-748.5158656443042)<1e-9)
 assert.equal(r.finiteInventory.minimumUsableOrCatalogueLitresUsedAsMaximum,false)
 assert.equal(r.coldEnergy.chargedPressureOrThermalFailureQualified,false)
 assert.equal(r.installedAcceptance,false)
 assert.equal(storeDrainCargoDemand(choice).completeColdCargoDesignCeilingKg,252);assert.ok(Math.abs(storeDrainCargoDemand(choice).oneWheelActionIncludingDynamicN-3708.18)<1e-9)
 assert.ok(r.supportComparison.necessaryColdGravityComparison);assert.ok(Math.abs(r.supportComparison.referenceForceClosureN)<1e-8)
})
test('actual low port, residual, retained blank, air gap and missing or forged source controls reject without changing source duty',()=>{
 const base=inletStoreDrain({choice,plant,cylinderWorkingFieldLocalMm}),wide=inletStoreDrain({choice:{...choice,restrictionMaximumBoreMm:13},plant,cylinderWorkingFieldLocalMm}),low=inletStoreDrain({choice:{...choice,continuationAbovePanMm:100},plant,cylinderWorkingFieldLocalMm})
 assert.throws(()=>inletStoreDrain({choice:{...choice,factoryPortAxisZMm:100},plant,cylinderWorkingFieldLocalMm}),/Bends consume/)
 const residual=inletStoreDrain({choice:{...choice,maximumPickupAboveLowPointMm:20},plant,cylinderWorkingFieldLocalMm});assert.equal(residual.finiteInventory.necessaryFactoryResidualRequirement,false)
 const bigBoss=inletStoreDrain({choice:{...choice,retainedBossAndCapProjectionMm:40},plant,cylinderWorkingFieldLocalMm});assert.equal(bigBoss.cargoInterface.necessaryLowProfileBlankGeometry,false)
 assert.throws(()=>admitStoreDrainChoice({...choice,factoryPortAxisZMm:200}))
 const noNorth=inletStoreDrain({choice:{...choice,removalNorthShiftMm:0},plant,cylinderWorkingFieldLocalMm});assert.equal(noNorth.geometry.necessaryRemovalKnownGeometry,false)
 assert.equal(low.receiving.necessaryColdReceiverGeometry,false)
 assert.ok(wide.receiving.independentAirGapAfterTwoSettingsMm<base.receiving.independentAirGapAfterTwoSettingsMm)
 assert.ok(wide.coldEnergy.maximumLmin>base.coldEnergy.maximumLmin)
 assert.deepEqual(wide.factoryDesign.newDedicatedPortLocalMm,base.factoryDesign.newDedicatedPortLocalMm)
 assert.throws(()=>admitStoreDrainChoice({...choice,maximumColdTemperatureC:90}))
 assert.throws(()=>admitStoreDrainChoice({...choice,maximumVerifiedResidualGaugeBar:9}))
 const sparse={...choice};delete (sparse as Partial<typeof choice>).restrictionMaximumBoreMm
 assert.throws(()=>admitStoreDrainChoice(sparse))
 const mixed=structuredClone(plant);if(mixed.ground)mixed.ground.ffl+=20
 assert.throws(()=>inletStoreDrain({choice,plant:mixed,cylinderWorkingFieldLocalMm}),/mixed|modified/)
})
test('complete saved inlet choice propagates drain edits and keeps existing source, split-room and roof controls unchanged',async()=>{
 const {readEngineeringDocument,compileEngineeringDocument}=await import('./current-design/engineering-document.js'),{readGeorgianDesignSnapshot}=await import('./current-design/georgian-source.js'),
  request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),start=await readEngineeringDocument(readGeorgianDesignSnapshot()),doc={...start,stages:{roofPitch:{pitchDeg:42},groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom,storeDrain:choice}}},
  before=await compileEngineeringDocument(doc),edited=structuredClone(doc)
 edited.stages.inletSourceEnvelope.storeDrain.restrictionMaximumBoreMm=6
 const state=beginEngineeringEdit(doc,'store-drain-test'),editedState=applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-store-drain-field',assemblyId:editableStoreDrainId,inputId:'restrictionMaximumBoreMm',value:6}})
 assert.equal(editedState.status,'applied');if(editedState.status!=='applied')throw Error('Atomic drain edit required')
 assert.deepEqual(editedState.state.document,edited)
 const undone=replayEngineeringEdit(editedState.state,engineeringBase(editedState.state),'undo');assert.equal(undone.status,'applied');if(undone.status==='applied')assert.deepEqual(undone.state.document,doc)
 assert.equal(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'kg',base:engineeringBase(state),operation:{kind:'set-store-drain-field',assemblyId:editableStoreDrainId,inputId:'restrictionMaximumBoreMm',value:6}}).status,'rejected')

 const after=await compileEngineeringDocument(edited),a=before.engineering.inletSourceEnvelope!,b=after.engineering.inletSourceEnvelope!
 assert.equal(a.storeDrain.state,'cold-maintenance-drawdown-comparison');assert.equal(b.storeDrain.state,'cold-maintenance-drawdown-comparison')
 if(a.storeDrain.state!=='cold-maintenance-drawdown-comparison'||b.storeDrain.state!=='cold-maintenance-drawdown-comparison')throw Error('Saved drain stage required')
 assert.ok(Math.abs(b.storeDrain.comparison.coldEnergy.maximumLmin/a.storeDrain.comparison.coldEnergy.maximumLmin-.5625)<1e-12)
 assert.deepEqual(a.bound,b.bound);assert.deepEqual(a.splitPlantRoom,b.splitPlantRoom);assert.deepEqual(before.engineering.roofPitch,after.engineering.roofPitch)
 assert.notEqual(a.storeDrain.comparison.source.caseDigest,b.storeDrain.comparison.source.caseDigest)
 assert.ok(Math.abs(a.storeDrain.comparison.cargoApplication.appliedWheelN-3708.18)<1e-9)
 const gravity=a.knownGravityInventory.groups.find(g=>g.id==='HAD/plant/factory-drain-reference');assert.ok(gravity);assert.ok(Math.abs(gravity.rows.reduce((n,r)=>n+(r.massKg??0),0)-8.759872)<1e-9);assert.ok(gravity.rows.every(r=>r.eligibleForNativeSTRTransfer===false));assert.equal(gravity.unlocated.length,1)
 const pa=a.splitPlantRoom.comparison!;if(pa.state!=='unadopted-threshold-drainage-successor')throw Error('Actual cargo room required')
 assert.equal(pa.choice.bridgeThicknessMm,31);assert.equal(pa.choice.clearHeightMm,138);assert.ok(pa.bridge!.adverseSpanOnlyStripScreen)
 assert.ok(pa.bridge!.removablePieces.pieces.every(p=>p.completeBudgetKg<=15))
 const heavier=structuredClone(doc);heavier.stages.inletSourceEnvelope.storeDrain.maximumCompleteDryCargoKg=280
 const challenged=await compileEngineeringDocument(heavier),cp=challenged.engineering.inletSourceEnvelope!.splitPlantRoom.comparison!
 if(cp.state!=='unadopted-threshold-drainage-successor')throw Error('Actual challenged cargo room required')
 assert.equal(cp.bridge!.adverseSpanOnlyStripScreen,false)
 assert.deepEqual(challenged.engineering.inletSourceEnvelope!.bound,a.bound)

 const absent=structuredClone(doc);delete (absent.stages.inletSourceEnvelope as Partial<typeof absent.stages.inletSourceEnvelope>).storeDrain
 const omitted=await compileEngineeringDocument(absent);assert.equal(omitted.engineering.inletSourceEnvelope!.storeDrain.state,'not-requested')
})
