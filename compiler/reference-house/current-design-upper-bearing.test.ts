import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readUpperRoofBearingCase, runUpperRoofBearingCase } from './current-design/structural-upper-bearing.js'

const predecessor = JSON.parse(readFileSync(new URL('../../project/str/studies/masonry-frame-a-proof.json', import.meta.url), 'utf8'))
const numerical = predecessor.authoredNumericalCase
const vertical = numerical.verticalCase, house = vertical.monolithicCase.houseCase, joined = house.joinedCase
const pick = (value: Record<string, unknown>, fields: readonly string[]) => Object.fromEntries(fields.map(key => [key, value[key]]))

function authoredStages() {
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

function assertAcyclic(rows: readonly { stage: string; dependsOn: readonly string[] }[]) {
  const map = new Map(rows.map(row => [row.stage, row])), visited = new Set<string>(), active = new Set<string>()
  function visit(id: string) {
    if (visited.has(id) || !map.has(id)) return
    assert.ok(!active.has(id), `Actual compiler dependency cycle at ${id}`)
    active.add(id); for (const next of map.get(id)!.dependsOn) visit(next)
    active.delete(id); visited.add(id)
  }
  for (const row of rows) visit(row.stage)
}

test('one saved current document executes the new upper bearing method through API, public CLI, real edit and reversal', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...source, stages: { ...authoredStages(), roofPitch: source.stages.roofPitch } }
  const baselineBundle = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const baseline = baselineBundle.engineering.upperRoofBearing
  assert.ok(baseline)
  assert.equal(baselineBundle.engineering.masonryFrame, undefined, 'The predecessor solve must be skipped, rather than mixed into this result')
  assert.equal(baseline.native.heads.length, 52)
  assert.equal(baseline.upperMasonry.allIntermediateRoofTensionRemoved, true)
  assert.equal(baseline.upperMasonry.finiteFootprintPressureAndRotationQualified, false)
  assert.equal(baseline.evidence.candidateAccepted, false)
  assert.ok(baseline.upperMasonry.seats.every(row => row.contactCompressionKN >= -1e-7))
  const inventory = baseline.upperMasonry.inventory as {
    bodyBoxes: { boxXYZMm: number[] }[]; padBoxes: { boxXYZMm: number[] }[]; excludedActualRCBoxesXYZMm: number[][]
  }
  const actualUpstands = baseline.vertical.northUpstandStrips as {
    rectangleXYMm: number[]; centroidZMm: number; depthMm: number
  }[]
  assert.equal(actualUpstands.length, 2)
  const expectedRC = actualUpstands.map(row => [row.rectangleXYMm[0]!, row.rectangleXYMm[1]!, row.centroidZMm-row.depthMm/2,
    row.rectangleXYMm[2]!, row.rectangleXYMm[3]!, row.centroidZMm+row.depthMm/2])
  assert.deepEqual(inventory.excludedActualRCBoxesXYZMm, expectedRC)
  for (const body of [...inventory.bodyBoxes, ...inventory.padBoxes]) for (const rc of expectedRC) {
    const volume = [0, 1, 2].reduce((v, axis) => v * Math.max(0, Math.min(body.boxXYZMm[axis+3]!, rc[axis+3]!)
      - Math.max(body.boxXYZMm[axis]!, rc[axis]!)), 1)
    assert.equal(volume, 0, 'Ordinary upper masonry/pads cannot occupy an actual north RC upstand')
  }
  assert.ok(baselineBundle.manifest.find(row => row.stage === 'upperRoofBearing')?.dependsOn.includes('stages.masonryFrame'))
  assert.equal(baselineBundle.manifest.find(row => row.stage === 'selectedWaterEvent')?.applicability?.controllingStage, 'upperRoofBearing')
  assert.equal(baselineBundle.manifest.find(row => row.stage === 'roofPitch')?.applicability?.controllingStage, 'upperRoofBearing')
  assertAcyclic(baselineBundle.manifest)
  const changedDocument = structuredClone(document)
  changedDocument.stages.upperRoofBearing = { masonryUnitWeightKNPerM3: 18 }
  const changedBundle = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(changedDocument), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
  })) as typeof baselineBundle
  const changed = changedBundle.engineering.upperRoofBearing
  assert.ok(changed)
  const oldInventory = baseline.upperMasonry.inventory as { masonryPhysicalGKN: number }
  const newInventory = changed.upperMasonry.inventory as { masonryPhysicalGKN: number }
  assert.ok(Math.abs(newInventory.masonryPhysicalGKN - .9 * oldInventory.masonryPhysicalGKN) < 1e-7)
  assert.notDeepEqual(changed.native.heads, baseline.native.heads)
  assert.notEqual(changed.roofSvg, baseline.roofSvg)
  assert.notEqual(changed.floorSvg, baseline.floorSvg)
  assert.notEqual(changedBundle.documentIdentity.digest, baselineBundle.documentIdentity.digest)
  assert.deepEqual(changedBundle.plans, JSON.parse(JSON.stringify(baselineBundle.plans)), 'The serialized nominal plans remain an explicit unrelated control')
  assertAcyclic(changedBundle.manifest)
  const restored = (await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))).engineering.upperRoofBearing
  assert.ok(restored)
  for (let i = 0; i < 52; i++) for (let axis = 0; axis < 6; axis++) {
    assert.ok(Math.abs(restored.native.heads[i]!.reactionKN_KNm[axis]! - baseline.native.heads[i]!.reactionKN_KNm[axis]!) < 1e-6)
  }
  assert.equal(restored.roofSvg, baseline.roofSvg)
})

test('saved bearing rejects extra floors/derived sources, missing owner inputs and stale bindings before a solve', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { upperRoofBearing: {} } }), /sole saved masonryFrame/)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { ...authoredStages(), upperRoofBearing: { sourceSHA256: {} } } }), /Unknown upper roof bearing/)
  const resolved = readCurrentDesignResolution(), request = readUpperRoofBearingCase(resolved).bearing
  assert.throws(() => runUpperRoofBearingCase(resolved, { ...request, planDigest: 'stale' }), /Stale or malformed/)
  const missing = structuredClone(request)
  ;(missing.comparison.seats as unknown[]).pop()
  assert.throws(() => runUpperRoofBearingCase(resolved, missing), /eighteen stable roof bearing IDs/)
})
