import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { renderBoundaryTopologySvg } from '../boundary-slice/drawing.js'
import { renderReferenceHouseDrawings } from '../reference-house/drawings.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { renderServiceTopologySvg } from '../service-slice/drawing.js'
import { renderStructuralTopologySvg } from '../structure-slice/drawing.js'

type Manifest = {
  manifestVersion: string
  programmeGate: string
  semanticBaselineCommit: string
  handoffCommit: string
  computationalMaturity: string
  fixture: {
    id: string
    sourcePath: string
    sourceFingerprint: { algorithm: string; value: string }
  }
  statuses: Record<string, string>
  proofBoundaries: Record<string, unknown>
  diagnosticCodes: Record<string, string[]>
  derived: {
    shellMm: { width: number; depth: number }
    courtyardMm: { width: number; depth: number }
    floorZoneDepthMm: number
    planPlateAreaMm2: Record<string, number>
    structure: {
      spanFieldCount: number
      bearingOpeningCount: number
      grossFieldAreaMm2: number
    }
    services: {
      networkCount: number
      selectedCrossingIds: string[]
    }
    boundary: {
      systemCount: number
      carrierCount: number
      openingObligationCount: number
      serviceObligationCount: number
      drainageRouteCount: number
      roofCatchmentTotalMm2: number
      enclosedPlateAreaMm2: number
      courtyardOpenSkyAreaMm2: number
      wallPlanningStressThicknessMm: number
    }
    privateStair: {
      methodId: string
      methodVersion: string
      inputId: string
      criterionCount: number
      observed: {
        riseMm: number
        goingMm: number
        pitchDeg: number
        twoRPlusGMm: number
      }
    }
  }
  artefacts: Record<string, { path: string; gitBlobSha1: string }>
}

const manifest = JSON.parse(
  readFileSync('compiler/ch00/reference-house-baseline.json', 'utf8')
) as Manifest

const gitBlobSha1 = (content: string | Buffer): string => {
  const body = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
  return createHash('sha1')
    .update(`blob ${body.length}\0`)
    .update(body)
    .digest('hex')
}

const diagnosticCodes = (diagnostics: Array<{ code: string }>): string[] =>
  diagnostics.map((item) => item.code)

const criterionObserved = (
  criteria: Array<{ criterionId: string; observed?: number }>,
  id: string
): number => {
  const found = criteria.find((item) => item.criterionId === id)
  assert.ok(found, `Expected calculation criterion ${id}`)
  assert.notEqual(found.observed, undefined, `Expected ${id} to have an observed value`)
  return found.observed as number
}

describe('CH-00 canonical Reference House semantic baseline', () => {
  const source = createReferenceHouseSource()
  const result = compileReferenceHouseSystem(source)
  const calculation = result.calculations.privateStairGeometry

  test('retains the frozen identity, statuses, proof boundaries and diagnostics', () => {
    assert.equal(manifest.manifestVersion, 'CH00-1')
    assert.equal(manifest.programmeGate, 'CH-00')
    assert.equal(manifest.computationalMaturity, 'M3')
    assert.equal(source.fixtureId, manifest.fixture.id)
    assert.equal(manifest.fixture.sourceFingerprint.algorithm, 'git-blob-sha1')
    assert.equal(
      gitBlobSha1(readFileSync(manifest.fixture.sourcePath)),
      manifest.fixture.sourceFingerprint.value
    )

    assert.deepEqual(
      {
        referenceHouse: result.house.status,
        plan: result.plan.status,
        structure: result.structure.status,
        services: result.services.status,
        boundary: result.boundary.status,
        privateStairGeometry: calculation.status,
        overall: result.status
      },
      manifest.statuses
    )

    assert.deepEqual(
      {
        rhC2: result.proof.structure,
        rhC3: result.proof.services,
        rhC4: result.proof.boundary,
        rhC5: result.proof.calculations
      },
      manifest.proofBoundaries
    )

    assert.deepEqual(
      {
        referenceHouse: diagnosticCodes(result.house.diagnostics),
        plan: diagnosticCodes(result.plan.diagnostics),
        structure: diagnosticCodes(result.structure.diagnostics),
        services: diagnosticCodes(result.services.diagnostics),
        boundary: diagnosticCodes(result.boundary.diagnostics),
        privateStairGeometry: diagnosticCodes(calculation.diagnostics)
      },
      manifest.diagnosticCodes
    )
  })

  test('retains selected high-value derived facts and counts', () => {
    const plateAreas = Object.fromEntries(
      result.plan.derived.plateAreas.map((item) => [item.levelId, item.area])
    )

    assert.deepEqual(
      { width: source.shell.width.value, depth: source.shell.depth.value },
      manifest.derived.shellMm
    )
    assert.deepEqual(
      { width: source.court.value.width, depth: source.court.value.depth },
      manifest.derived.courtyardMm
    )
    assert.equal(result.floorZoneDepth, manifest.derived.floorZoneDepthMm)
    assert.deepEqual(plateAreas, manifest.derived.planPlateAreaMm2)
    assert.deepEqual(
      {
        spanFieldCount: result.structure.derived.spanFields.length,
        bearingOpeningCount: result.structure.derived.bearingOpenings.length,
        grossFieldAreaMm2: result.structure.derived.grossFieldArea
      },
      manifest.derived.structure
    )
    assert.deepEqual(
      {
        networkCount: result.services.derived.networks.length,
        selectedCrossingIds: result.services.derived.selectedCrossingIds
      },
      manifest.derived.services
    )
    assert.deepEqual(
      {
        systemCount: result.boundary.derived.systems.length,
        carrierCount: result.boundary.derived.carriers.length,
        openingObligationCount: result.boundary.derived.openingObligations.length,
        serviceObligationCount: result.boundary.derived.serviceObligations.length,
        drainageRouteCount: result.boundary.derived.drainageRoutes.length,
        roofCatchmentTotalMm2: result.coordination.boundary.roofCatchmentTotal,
        enclosedPlateAreaMm2: result.coordination.boundary.enclosedPlateArea,
        courtyardOpenSkyAreaMm2: result.coordination.boundary.courtyardOpenSkyArea,
        wallPlanningStressThicknessMm: result.coordination.boundary.wallPlanningStressThicknessMm
      },
      manifest.derived.boundary
    )
    assert.deepEqual(
      {
        methodId: calculation.methodId,
        methodVersion: calculation.methodVersion,
        inputId: calculation.inputId,
        criterionCount: calculation.criteria.length,
        observed: {
          riseMm: criterionObserved(calculation.criteria, 'ADK-K1-PRIVATE-RISE'),
          goingMm: criterionObserved(calculation.criteria, 'ADK-K1-PRIVATE-GOING'),
          pitchDeg: criterionObserved(calculation.criteria, 'ADK-K1-PRIVATE-PITCH'),
          twoRPlusGMm: criterionObserved(calculation.criteria, 'ADK-K1-PRIVATE-2R+G')
        }
      },
      manifest.derived.privateStair
    )
  })

  test('retains committed generated artefact identity and exact downstream projections', () => {
    const c1 = renderReferenceHouseDrawings(result.house)
    const rendered: Record<string, string> = {
      rhc1GroundFloor: c1.groundFloor,
      rhc1FirstFloor: c1.firstFloor,
      rhc1PrincipalSection: c1.principalSection,
      rhc2StructuralTopology: renderStructuralTopologySvg(
        result.structure,
        result.plan,
        'Reference House — RH-C2 structural topology'
      ),
      rhc3ServiceTopology: renderServiceTopologySvg(result.services, 'RH-C3 service topology'),
      rhc4BoundaryTopology: renderBoundaryTopologySvg(
        result.boundary,
        'Reference House — RH-C4 envelope / boundary topology'
      )
    }

    for (const [key, expected] of Object.entries(manifest.artefacts)) {
      const committed = readFileSync(expected.path, 'utf8')
      assert.equal(gitBlobSha1(committed), expected.gitBlobSha1, `${key} committed hash drifted`)
      assert.equal(rendered[key], committed, `${key} no longer reproduces the committed artefact`)
      assert.equal(gitBlobSha1(rendered[key]), expected.gitBlobSha1, `${key} rendered hash drifted`)
    }
  })
})
