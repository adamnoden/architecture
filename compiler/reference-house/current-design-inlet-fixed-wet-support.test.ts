import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSillInsertCase,runInletSillInsertCase} from './current-design/inlet-sill-insert.js'
import {readInletFaultCase,runInletFaultCase} from './current-design/inlet-fault.js'
import {compileFixedInletCandidate,readFixedInletSettings} from './current-design/inlet-fixed-entry.js'
import {compareFixedInletWetSupport} from './current-design/inlet-fixed-wet-support.js'

function current(overrides:Partial<ReturnType<typeof readFixedInletSettings>>={}){
  const resolved=readCurrentDesignResolution(),insertCase=readInletSillInsertCase(resolved).insert
  const insert=runInletSillInsertCase(resolved,insertCase),faultCase=readInletFaultCase(resolved,insertCase).fault
  const fault=runInletFaultCase(resolved,faultCase,insertCase)
  const candidate=compileFixedInletCandidate(resolved,{...readFixedInletSettings(),riserYMm:600,controlHoodEastAllowanceMm:60,...overrides},{insert,faultCase,fault})
  const read=(path:string)=>readFileSync(new URL('../../'+path,import.meta.url),'utf8')
  const sources={wetCellsText:read('project/had/studies/south-inlet-wet-box.json'),servicesText:read('project/had/studies/current-house-services.json'),portalText:read('project/str/studies/floor-portal-interface-review.json')}
  return {candidate,sources,result:compareFixedInletWetSupport(candidate,sources)}
}

test('real clear bore and wall expose the old Utility collision without changing admitted lower hydraulics',()=>{
  const {candidate,result}=current(),utility=result.branches[0]
  assert.equal(utility.collar.clearBoreMm,76)
  assert.equal(utility.collar.outerDiameterMm,82)
  assert.equal(utility.collar.old76FootprintAfterLinerAnd5Mm,1.338663)
  assert.equal(utility.collar.actual82BodyAfterLinerAnd5Mm,-1.661337)
  assert.equal(utility.collar.flared82BodyAfterLinerAnd5Mm,37)
  assert.equal(utility.collar.frontDryFlangeToFlaredRoofAfter2LinerAnd5Mm,7)
  assert.equal(utility.collar.idealHeadAtSourceFlowMm,48.118653)
  assert.ok(utility.collar.additionalLossBudgetK>1.26)
  assert.ok(utility.collar.aboveSourceDryLimitMm>20)
  assert.equal(utility.floor.waterSideFloorZMm,candidate.branches[0].fault.inheritedLowerReliefAndIndependentReceiver.geometry.lowerInvertZMm)
  assert.equal(utility.currentSourceGeometryAdopted,false)
  assert.equal(utility.collar.fittedCdSeamAndSprayQualified,false)
  assert.ok(result.diagnostics.includes('utility:CURRENT_CLEAR_THROAT_BODY_INTERCEPTS_CELL'))
})

test('riser and actual hood edits recompute body fit and stock while the source hydraulic floor remains fixed',()=>{
  const before=current(),rear=current({riserYMm:595}),narrow=current({controlHoodEastAllowanceMm:55})
  assert.ok(rear.result.branches[0].collar.actual82BodyAfterLinerAnd5Mm>0)
  assert.notEqual(rear.result.source.candidateCaseDigest,before.result.source.candidateCaseDigest)
  assert.deepEqual(rear.result.source.inputs,before.result.source.inputs)
  assert.equal(rear.result.branches[0].floor.waterSideFloorZMm,before.result.branches[0].floor.waterSideFloorZMm)
  assert.equal(rear.result.branches[0].collar.idealHeadAtSourceFlowMm,before.result.branches[0].collar.idealHeadAtSourceFlowMm)
  assert.ok(narrow.result.quantities.representedSteelUpperKg<before.result.quantities.representedSteelUpperKg)
  assert.equal(narrow.result.branches[0].collar.outerDiameterMm,82)
})

test('manual first cuts precede split-back removal and retain the physical tool and cold-grip qualifications',()=>{
  const {result}=current()
  assert.equal(result.sawPoses.length,8)
  for(const pose of result.sawPoses){
    assert.equal(pose.frameRearToClosedBackAfter5Mm,38)
    assert.equal(pose.siblingBareTubeAfter5Mm,81)
    assert.ok(pose.handReachMm<pose.reachLimitMm)
    assert.ok(pose.washerBodyAfter5Mm>0&&pose.inverterAfter5Mm>0)
    assert.equal(pose.actualFrameThicknessMeasured,false)
    assert.equal(pose.bladeDatumAndFrontFacingAttachmentQualified,false)
  }
  for(const branch of result.branches)for(const panel of branch.panels){
    assert.equal(panel.bareStubAfterReleaseAnd5Mm,11)
    assert.ok(panel.parkedWasherAfter5Mm>0&&panel.parkedInverterAfter5Mm>0)
    assert.equal(panel.structuralSectionPass,true)
    assert.equal(panel.stockIsMeasuredGross,false)
  }
  assert.equal(result.geometry.upperHook.afterLiftToPipeGuideArmAfter5Mm,2)
  assert.equal(result.geometry.upperPressurePipeExit.dimensionedClosure,null)
  assert.ok(result.diagnostics.includes('NO_LIVE_FAULT_OPEN_ACCESS_CLAIM'))
  assert.ok(result.diagnostics.includes('ACTUAL_UPPER_STUB_GRIP_AND_GROSS_PAYLOAD_UNQUALIFIED'))
})

test('wet-only constructive load path rejects the retained low chassis rather than importing pipe thrust or inventing jamb capacity',()=>{
  const {candidate,result}=current()
  assert.deepEqual(result.geometry.lowRailsMm,candidate.supportFrame.railBoxesMm)
  assert.equal(result.mechanics.pressurePipeEndAndThermalForcesApplied,false)
  assert.deepEqual(result.mechanics.jetNormEachN,[127.27922,127.27922])
  assert.deepEqual(result.mechanics.structuralActionEnvelopeEachN,[150,150])
  assert.ok(result.quantities.fullStructuralWaterUpperKg>40)
  assert.ok(result.mechanics.lowRailCombinedStressMpa>result.mechanics.allowableComparisonMpa)
  assert.ok(result.diagnostics.includes('WET_LOW_RAIL_STEEL_COMPARISON_FAILS'))
  assert.ok(result.diagnostics.includes('WET_JAMB_ISOLATED_CATALOGUE_SCREEN_FAILS'))
  for(const branch of result.branches){
    assert.ok(branch.localConnectionScreens.floorFull235p5SpanHydrostaticStressMpa<result.mechanics.allowableComparisonMpa)
    assert.ok(branch.normalSeats.every(s=>s.calculatedBendingMpa<result.mechanics.allowableComparisonMpa))
    assert.ok(branch.normalRetainers.every(s=>s.landingArmStressMpa<result.mechanics.allowableComparisonMpa))
    assert.ok(branch.floor.ribs.every(r=>r.remainingSeatDepthMm===40))
  }
  for(const jamb of result.mechanics.jambs){
    assert.ok(jamb.normalTensionBoundEachN>20000)
    assert.equal(jamb.actualGroupAndJambCapacityEstablished,false)
  }
  assert.equal(result.completeSupportCapacity,false)
  assert.equal(result.installedAcceptance,false)
  assert.equal(result.ownerAdoption,false)
})

test('actual source hashes reject mixed and absent enclosure context',()=>{
  const {candidate,sources}=current()
  assert.throws(()=>compareFixedInletWetSupport(candidate,{...sources,wetCellsText:sources.wetCellsText+'\n'}),/actual candidate source/)
  assert.throws(()=>compareFixedInletWetSupport({...candidate,source:{...candidate.source,inputs:{}}},sources),/actual candidate source/)
})
