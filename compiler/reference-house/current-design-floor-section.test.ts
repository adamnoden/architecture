import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { beginEngineeringEdit, applyEngineeringEdit, replayEngineeringEdit, saveEngineeringEdit, engineeringBase,
  engineeringTicket, currentEngineeringReply, editableFloorSectionId } from './current-design/engineering-edit.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readFloorSectionCase, runFloorSectionCase } from './current-design/structural-floor-section.js'

const predecessor = JSON.parse(readFileSync(new URL('../../project/str/studies/masonry-frame-a-proof.json', import.meta.url), 'utf8'))
const numerical = predecessor.authoredNumericalCase
const vertical = numerical.verticalCase, house = vertical.monolithicCase.houseCase, joined = house.joinedCase
const pick = (value: Record<string, unknown>, fields: readonly string[]) => Object.fromEntries(fields.map(key => [key, value[key]]))

function authoredStages(): { distributedFloor: Record<string, unknown>; masonryFrame: Record<string, unknown>; upperRoofBearing: Record<string, unknown> } {
  return {
    distributedFloor: { ...pick(joined.floor, ['cornerWidthsMm', 'memberLaw', 'jointLaw', 'membraneLaw', 'edgeBand', 'maxPitchMm', 'boundaryCase', 'receivingLaws', 'use']),
      edits: structuredClone(joined.floor.componentCase.edits) },
    masonryFrame: { ...pick(joined, ['geometry', 'portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder', 'portalDPCNormalSubdivisions', 'portalDPCInsetMm']),
      portal: pick(joined.portal, ['frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm']),
      caseId: 'SAVED-UPPER-BEARING', coreAxialWidthMm: house.coreAxialWidthMm, northUpstandWidthMm: house.northUpstandWidthMm,
      physicalGFactor: house.boundary.physicalGFactor, includeExternalGMAXQ: house.boundary.includeExternalGMAXQ,
      ...pick(vertical, ['plateLaw', 'bearingLaw', 'maxPitchMm', 'bearingQuadratureOrder', 'freshUniformLiveKPa']),
      ...pick(numerical, ['masonrySeatProjectionMm', 'masonryUnitWeightKNM3', 'abutmentSlices', 'foundationWeight', 'courtCornerClosure',
        'floorReinforcement', 'lowerCoreBodies', 'lowerLWeight', 'roofCoupling', 'straightFrameCage']) },
    upperRoofBearing: {},
  }
}

test('a semantic floor-section edit recompiles actual operators, datums, drawings and52heads through saved API/CLI and exact undo', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const stages = authoredStages()
  stages.masonryFrame.physicalGFactor = 1.35
  stages.masonryFrame.freshUniformLiveKPa = 2
  stages.masonryFrame.plateLaw = { ...vertical.plateLaw, unitWeightKNPerM3: 27 }
  stages.masonryFrame.floorReinforcement = { ...numerical.floorReinforcement, barDiameterMm: 16, pitchMm: 80 }
  const document = { ...source, stages: { ...stages, floorSection: { thicknessMm: 200 }, roofPitch: source.stages.roofPitch, studyRoomKit: source.stages.studyRoomKit } }
  const state = beginEngineeringEdit(document, 'actual-floor-section')
  const baselineBundle = await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(state)))
  const baseline = baselineBundle.engineering.floorSection!
  assert.ok(baseline)
  assert.equal(baselineBundle.engineering.upperRoofBearing, undefined)
  assert.equal(baselineBundle.engineering.masonryFrame, undefined)
  assert.equal(baseline.native.heads.length, 52)
  assert.equal(baseline.floorSection.topZMm, 3370)
  const operation = { kind: 'set-floor-section-thickness', assemblyId: editableFloorSectionId, thicknessMm: 250 }
  const edit = applyEngineeringEdit(state, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation })
  assert.equal(edit.status, 'applied')
  const changedBundle = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: saveEngineeringEdit(edit.state), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
  })) as typeof baselineBundle
  const changed = changedBundle.engineering.floorSection!
  assert.equal(changed.floorSection.topZMm, 3420)
  assert.equal(changed.floorSection.midplaneZMm, 3295)
  assert.equal(changed.floorSection.remainingSourceFinishDepthMm, 30)
  assert.equal(changed.floorSection.finishStairServiceEvidenceApplicable, false)
  assert.ok(Math.abs(Number(changed.floorSection.plateSelfGKN) / Number(baseline.floorSection.plateSelfGKN) - 1.25) < 1e-10)
  assert.equal(changed.floorSection.steelChordAxialRigidityKN, baseline.floorSection.steelChordAxialRigidityKN)
  assert.notDeepEqual(changed.native.heads, baseline.native.heads)
  assert.notEqual(changed.floorSvg, baseline.floorSvg)
  assert.ok(changed.floorSvg.includes('top3420 / centroid3295mm'))
  assert.notEqual(changedBundle.documentIdentity.digest, baselineBundle.documentIdentity.digest)
  assert.equal(changed.evidence.candidateAccepted, false)
  assert.equal(changed.evidence.completeHouseProof, false)
  assert.deepEqual(changedBundle.plans, JSON.parse(JSON.stringify(baselineBundle.plans)), 'Unadopted nominal plan remains explicit control')
  for (const stage of ['roofPitch', 'selectedWaterEvent', 'studyRoomKit']) {
    assert.equal(changedBundle.manifest.find(row => row.stage === stage)?.applicability?.controllingStage, 'floorSection')
  }
  const floorRow = changedBundle.manifest.find(row => row.stage === 'floorSection')!
  assert.ok(floorRow.dependsOn.includes('stages.upperRoofBearing'))
  assert.ok(!changedBundle.manifest.find(row => row.stage === 'distributedFloor')!.dependsOn.includes('floorSection'), 'No invalidation dependency cycle')
  const oldTicket = engineeringTicket(state, 'old-floor-result')
  assert.equal(currentEngineeringReply(edit.state, oldTicket, { ticket: oldTicket }), undefined)
  const undo = replayEngineeringEdit(edit.state, engineeringBase(edit.state), 'undo')
  assert.equal(undo.status, 'applied')
  assert.equal(saveEngineeringEdit(undo.state), saveEngineeringEdit(state))
  const restored = (await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(undo.state)))).engineering.floorSection!
  for (let i=0; i<52; i++) for (let a=0; a<6; a++) assert.ok(Math.abs(restored.native.heads[i]!.reactionKN_KNm[a]! - baseline.native.heads[i]!.reactionKN_KNm[a]!) < 1e-6)
  assert.equal(restored.floorSvg, baseline.floorSvg)
})

test('floor section rejects stale source, unsupported geometry, implicit stage creation and wrong semantic units before a solve', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { floorSection: { thicknessMm: 250 } } }), /sole saved upperRoofBearing/)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { ...authoredStages(), floorSection: { thicknessMm: 251 } } }), /200..250/)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { ...authoredStages(), floorSection: { thicknessMm: 250, sourceSHA256: {} } } }), /Unknown floor section/)
  const resolved=readCurrentDesignResolution(), request=readFloorSectionCase(resolved).section
  assert.throws(() => runFloorSectionCase(resolved, { ...request, bindingDigest: 'stale' }), /Stale or malformed/)
  const state=beginEngineeringEdit(source,'unsupported-floor')
  const operation={ kind:'set-floor-section-thickness', assemblyId:editableFloorSectionId, thicknessMm:250 }
  const transaction={ schema:'current-engineering-edit/1', units:'mm', base:engineeringBase(state), operation }
  assert.equal(applyEngineeringEdit(state,transaction).status,'rejected', 'A semantic edit cannot invent an unowned structural stage')
  const explicit=beginEngineeringEdit({...source,stages:{...source.stages,floorSection:{thicknessMm:200}}},'explicit-floor')
  for (const units of ['degrees','m']) assert.equal(applyEngineeringEdit(explicit,{...transaction,base:engineeringBase(explicit),units}).status,'rejected')
  assert.equal(applyEngineeringEdit(explicit,{...transaction,base:engineeringBase(explicit),operation:{...operation,thicknessMm:251}}).status,'rejected')
})
