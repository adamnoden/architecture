import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {plantTankedWalkingSurface,type PlantWalkControl} from './current-design/inlet-plant-tanked-walk.js'
const raw=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-plant-tanked-walk-candidate.json',import.meta.url),'utf8'))
const choice=raw as PlantWalkControl
// Source-geometry comparison only. Parent complete-room producer supplies its
// actual pan/input profile, source-stage and receivers; no native force result
// or current flooring replacement is inferred from this standalone fixture.
const input={choice,roomPlanMm:[9397,3797,2173.5,1983.5] as const,houseFflMm:530,initialWaterMm:438.37,maximumWaterMm:610,wheelN:3708.18,panMinimumMm:312.8,panMaximumMm:346.39,bridgeInnerXMm:11520.5,bridgeOuterXMm:12130,bridgePlateYMm:[4077.5,5122.5] as const,outfallRoofMaximumMm:482,sourceRoofAtExternalBeamMm:466,settingEachMm:10}
const run=(i:Parameters<typeof plantTankedWalkingSurface>[0]=input)=>plantTankedWalkingSurface(i)
const near=(a:number,b:number,e=1e-7)=>assert.ok(Math.abs(a-b)<e,String(a)+' != '+String(b))
test('actual bars, crossbars, rims, support posts and over-roof bridge derive from one controller',()=>{
 const r=run()
 assert.equal(r.walkingTopMm,630);assert.equal(r.bridgeTopMm,630)
 assert.equal(r.panels.length,42);assert.equal(r.bridgePieces.length,13)
 assert.ok(r.parts.length>1000)
 assert.ok(r.panels.every(p=>p.completeMassDesignUpperKg<=15))
 assert.ok(r.bridgePieces.every(p=>p.completeMassDesignUpperKg<=15))
 assert.ok(r.necessaryMemberComparisons,JSON.stringify(r.memberChecks.filter(c=>!c.necessary)))
 near(r.memberChecks.find(p=>p.id==='Plant/grate-single-bearing-bar')!.value!,93.7860525)
 near(r.memberChecks.find(p=>p.id==='Plant/bridge-plate-between-rails')!.value!,87.55425)
 assert.ok(r.memberChecks.find(p=>p.id==='Plant/bridge-rail-under-roof')!.necessary)
 assert.ok(r.memberChecks.find(p=>p.id==='Plant/external-cross-under-roof')!.necessary)
 assert.equal(r.loadPaths.allWheelOnOneBarAndBeam,true)
 assert.equal(r.actualRCPanSandwichBearingAndThermalBridgeAccepted,false)
 assert.equal(r.actualFabricationAndMaterialTemperaturePropertiesAccepted,false)
 assert.equal(r.actualCompleteInstallationAccepted,false)
 assert.equal(r.renewal.massLimitIsComparisonNotHumanQualification,true)
 assert.equal(r.renewal.actualToolAccessQuarterTurnAndFirstRestAccepted,false)
})
test('selected solid walking segments and stronger bridge include all deadweight and setting errors',()=>{
 const r=run()
 assert.equal(r.geometry.walkingRailSectionKind,'solid')
 assert.equal(r.geometry.wallParameterAppliesToWalkingRail,false)
 assert.equal(r.beamSegments.length,48)
 assert.ok(r.beamSegments.every(p=>p.completeMassDesignUpperKg<=8.5))
 assert.equal(r.geometry.actualSolidSegmentFirstRestAndToolProofAccepted,false)
 assert.equal(r.actualRHSLocalFaceAndBearingLawAccepted,false)
 near(r.deadLoadBounds.footCombinedN,6311.1677544)
 near(r.memberChecks.find(p=>p.id==='Plant/head-plate-cantilever')!.value!,75.6)
 near(r.memberChecks.find(p=>p.id==='Plant/grate-edge-wheel-and-dead')!.value!,99.26357936)
 near(r.memberChecks.find(p=>p.id==='Plant/bridge-cross-wheel-and-dead-deflection')!.value!,1.7272712111212698)
 assert.equal(r.deadLoadBounds.RHSFullOuterBoxMassUpper,true)
 assert.equal(r.deadLoadBounds.allDeadAtWorstPoint,true)
 assert.ok(r.memberChecks.filter(p=>p.id.includes('wheel-and-dead')).every(p=>p.necessary))
 const rhs=structuredClone(choice);rhs.walkingFrame.beamSectionKind='rhs'
 assert.equal(run({...input,choice:rhs}).memberChecks.find(p=>p.id==='Plant/walking-rail-local-face')!.necessary,false)
 const thin=structuredClone(choice);thin.bridge.railSectionWHtMm=[60,40,8]
 assert.equal(run({...input,choice:thin}).memberChecks.find(p=>p.id==='Plant/bridge-rail-local-face')!.necessary,false)
 const shallow=structuredClone(choice);shallow.bridge.crossBeamSectionWHtMm=[100,50,10]
 assert.equal(run({...input,choice:shallow}).memberChecks.find(p=>p.id==='Plant/bridge-cross-wheel-and-dead-deflection')!.necessary,false)
 const oldI=structuredClone(choice);oldI.bridge.minimumRailIMm4=200000
 assert.equal(run({...input,choice:oldI}).memberChecks.find(p=>p.id==='Plant/bridge-rail-wheel-and-dead')!.necessary,false)
 const zeroWall=structuredClone(choice);zeroWall.walkingFrame.beamSectionWHtMm=[40,40,0]
 near(run({...input,choice:zeroWall}).solidsIncrementUpperL,r.solidsIncrementUpperL)
})
test('true3D incremental displacement excludes dry crossbars and counts sealed RHS void conservatively',()=>{
 const r=run(),ledger=r.volumeLedger
 assert.equal(ledger.exactCrossBarIntersectionSubtractedMm3,0,'Crossbars620..630 lie wholly above the610 comparison water.')
 assert.equal(ledger.RHSVoidCountedAsSolid,true)
 assert.equal(ledger.closedDuctVoidCreditLitres,0)
 assert.equal(ledger.hardwareBelowWaterIncluded,true)
 near(r.solidsIncrementUpperL,96.471266)
 assert.ok(r.normalMassUpperKg>=r.referenceMetalKg)
 const lower=run({...input,panMinimumMm:302.8})
 near(lower.solidsIncrementUpperL,r.solidsIncrementUpperL)
 assert.ok(lower.normalMassUpperKg>r.normalMassUpperKg,'Longer below-water-bottom posts increase mass while adding no incremental displacement above438.37.')
 assert.equal(lower.geometry.actualPerFootPanContactNotInvented,true)
 const wet=run({...input,maximumWaterMm:625})
 assert.ok(wet.volumeLedger.exactCrossBarIntersectionSubtractedMm3>0)
 near(wet.solidsIncrementUpperL,(wet.volumeLedger.sumFullOuterClippedMm3-wet.volumeLedger.exactCrossBarIntersectionSubtractedMm3)/1e6+wet.volumeLedger.hardwareSolidSteelVolumeUpperL)
 assert.ok(wet.solidsIncrementUpperL>r.solidsIncrementUpperL)
})
test('real round/slot locators earn only matched-seat error credit; global20 remains in member bounds',()=>{
 const r=run(),q=r.geometry.matchedPanelSeat
 near(q.relativeErrorMm,2);near(q.minimumBearingMm,14.5);near(q.requiredFirstVerticalReleaseMm!,12)
 assert.ok(q.completeFitBudgetMm!==null&&q.completeFitBudgetMm<=2)
 assert.equal(q.oneRoundOneLongitudinalSlotRequired,true)
 assert.equal(q.locatorWeldsDoNotCutRHS,true)
 assert.equal(q.actualHardwareGeometryToolAndSlotQualificationAccepted,false)
 near(r.memberChecks.find(p=>p.id==='Plant/single-bar-end-bearing')!.value!,3708.18/(5*14.5))
 assert.equal(r.locators.length,r.panels.length)
 assert.ok(r.locators.every(p=>p.studWeldsDoNotDrillRHS&&p.positionsMm.length===2))
 assert.ok(r.geometry.bearingSpanWithSettingsMm>r.geometry.panelSizeMm[1])
 const unsupported=structuredClone(choice)
 delete unsupported.grating.maximumRelativeSeatErrorMm
 const rejected=run({...input,choice:unsupported})
 assert.equal(rejected.necessaryMemberComparisons,false)
 assert.equal(rejected.geometry.matchedPanelSeat.relativeErrorMm,20)
 assert.equal(rejected.geometry.matchedPanelSeat.requiredFirstVerticalReleaseMm,null)
 assert.equal(rejected.memberChecks.find(p=>p.id==='Plant/matched-panel-seat-fit')!.necessary,false)
})
test('a lighter shallow grate and an intruding roof are actual adverse cases',()=>{
 const small=structuredClone(choice)
 small.grating.bearingBarHeightMm=40;small.grating.rimHeightMm=40
 const challenged=run({...input,choice:small})
 assert.equal(challenged.necessaryMemberComparisons,false)
 assert.equal(challenged.memberChecks.find(p=>p.id==='Plant/grate-single-bearing-bar')!.necessary,false)
 assert.ok(challenged.panels.every(p=>p.completeMassDesignUpperKg<=15),'A15kg piece check does not establish load capacity.')
 const roof=run({...input,outfallRoofMaximumMm:540})
 assert.equal(roof.memberChecks.find(p=>p.id==='Plant/bridge-rail-under-roof')!.necessary,false)
 const heavy=run({...input,wheelN:5000})
 assert.equal(heavy.necessaryMemberComparisons,false)
})
test('room and load perturbations propagate, while unchanged bridge geometry remains identical',()=>{
 const before=JSON.stringify(input),a=run(),moved=run({...input,roomPlanMm:[9297,3797,2273.5,1983.5]})
 assert.notEqual(a.sourceDigest,moved.sourceDigest)
 assert.notEqual(a.normalMassUpperKg,moved.normalMassUpperKg)
 assert.notEqual(a.solidsIncrementUpperL,moved.solidsIncrementUpperL)
 assert.deepEqual(a.bridgePieces,moved.bridgePieces)
 assert.equal(a.bridgeTopMm,moved.bridgeTopMm)
 near(run().solidsIncrementUpperL,a.solidsIncrementUpperL)
 assert.equal(JSON.stringify(input),before)
 assert.throws(()=>run({...input,panMaximumMm:450}),/Actual bounded/)
 assert.throws(()=>run({...input,settingEachMm:0}),/Actual bounded/)
 assert.throws(()=>run({...input,sourceRoofAtExternalBeamMm:NaN}),/Actual bounded/)
})
console.info('PLANT_GRADED_WALK_SOURCE_COMPARISON '+JSON.stringify({scope:'Pure proposed steel/volume/member comparison; actual supports, tools, fabrication, currentsourcehouse integration and owner acceptance remain unearned.',result:{volumeUpperL:run().solidsIncrementUpperL,referenceMetalKg:run().referenceMetalKg,normalMassUpperKg:run().normalMassUpperKg,panelCount:run().panels.length,maxPanelKg:Math.max(...run().panels.map(p=>p.completeMassDesignUpperKg)),maxBridgePieceKg:Math.max(...run().bridgePieces.map(p=>p.completeMassDesignUpperKg)),memberFailures:run().memberChecks.filter(p=>!p.necessary)}}))
