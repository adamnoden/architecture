import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { renderReferenceHouseDrawings } from '../reference-house/drawings.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { renderStructuralTopologySvg } from '../structure-slice/drawing.js'

type ChBaseline = {
  artefacts: Record<string, { path: string; gitBlobSha1: string }>
}

type CoaBaseline = {
  manifestVersion: string
  programmeGate: string
  legacyHashAuthority: string
  canonicalCompileSurface: string
  authority: {
    computationalMaturity: string
    referenceHouseMaturity: string
    technicalProofBoundaryChanged: boolean
  }
  legacyArtefacts: Array<{
    id: string
    path: string
    format: string
    classes: string[]
  }>
  preservation: {
    legacyArtefactsMustRemainByteIdentical: boolean
    successorsUseNewPaths: boolean
    successorsConsumeCanonicalSinglePassResult: boolean
    semanticRuntimeMayDependOnOutputLayer: boolean
    outputMayInventMissingGeometry: boolean
  }
}

const ch = JSON.parse(readFileSync('compiler/ch00/reference-house-baseline.json', 'utf8')) as ChBaseline
const coa = JSON.parse(readFileSync('compiler/coa00/output-baseline.json', 'utf8')) as CoaBaseline

describe('COA-00 output baseline and audit', () => {
  const source = createReferenceHouseSource()
  const result = compileReferenceHouseSystem(source)

  test('keeps CH as the sole legacy artefact hash authority', () => {
    assert.equal(coa.manifestVersion, 'COA00-1')
    assert.equal(coa.programmeGate, 'COA-00')
    assert.equal(coa.legacyHashAuthority, 'compiler/ch00/reference-house-baseline.json')
    assert.equal(coa.authority.computationalMaturity, 'M4')
    assert.equal(coa.authority.referenceHouseMaturity, 'M3')
    assert.equal(coa.authority.technicalProofBoundaryChanged, false)

    const inventoried = Object.fromEntries(coa.legacyArtefacts.map((item) => [item.id, item.path]))
    const frozen = Object.fromEntries(Object.entries(ch.artefacts).map(([id, item]) => [id, item.path]))
    assert.deepEqual(inventoried, frozen)

    for (const item of coa.legacyArtefacts) {
      assert.equal(item.format, 'svg')
      assert.ok(item.classes.includes('HISTORICAL_EVIDENCE'))
    }
  })

  test('records the canonical single-pass system as the successor source', () => {
    assert.equal(
      coa.canonicalCompileSurface,
      'createReferenceHouseSource() -> compileReferenceHouseSystem(source)'
    )
    assert.equal(result.status, 'PASS')
    assert.equal(coa.preservation.legacyArtefactsMustRemainByteIdentical, true)
    assert.equal(coa.preservation.successorsUseNewPaths, true)
    assert.equal(coa.preservation.successorsConsumeCanonicalSinglePassResult, true)
    assert.equal(coa.preservation.semanticRuntimeMayDependOnOutputLayer, false)
    assert.equal(coa.preservation.outputMayInventMissingGeometry, false)
  })

  test('reproduces the hidden-relationship audit against the frozen RH-C1 renderer', () => {
    assert.ok(source.qualitativeOpeningRelationships.length > 0)
    assert.ok(source.requiredAdjacencies.length > 0)

    const drawings = renderReferenceHouseDrawings(result.house)
    const plans = `${drawings.groundFloor}\n${drawings.firstFloor}`

    for (const relationship of source.qualitativeOpeningRelationships) {
      assert.equal(plans.includes(relationship.id), false)
    }
    for (const adjacency of source.requiredAdjacencies) {
      assert.equal(plans.includes(adjacency.id), false)
    }
    assert.equal(plans.toLowerCase().includes('north arrow'), false)
    assert.equal(plans.includes('A–A'), false)
  })

  test('reproduces the RH-C2 projection mismatch and directional span glyph', () => {
    const svg = renderStructuralTopologySvg(
      result.structure,
      result.plan,
      'Reference House — RH-C2 structural topology'
    )
    const south = result.structure.derived.spanFields.find((field) => field.id === 'F-S')
    assert.ok(south)

    const match = svg.match(/data-entity="F-S"[\s\S]*?<rect x="[^"]+" y="([^"]+)"/)
    assert.ok(match)
    const renderedY = Number(match[1])
    const northUpY = result.plan.derived.shell.depth - (south.bounds.y + south.bounds.height)

    assert.equal(renderedY, south.bounds.y)
    assert.notEqual(renderedY, northUpY)
    assert.match(svg, /marker-end="url\(#arrow\)"/)
    assert.doesNotMatch(svg, /marker-start="url\(#arrow\)"/)
  })
})
