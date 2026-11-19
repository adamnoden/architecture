import { sha256DplSemanticFingerprint } from './identity-order.js'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { describe, test } from 'node:test'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { evaluateCandidateConformance } from './conformance.js'
import type { CandidateConformanceFinding, DeploymentCandidateInput } from './model.js'

type Point = readonly [number, number]
type Json = any

const UNIT_VECTOR_TOLERANCE = 5e-9
const COORDINATE_TOLERANCE_M = 5e-8
const SOURCE_CROSSCHECK_TOLERANCE_M = 1e-6
const BEARING_TOLERANCE_DEG = 1e-7
const AUTHORED_FFL_PRECISION_M = 0.01

const rootUrl = (path: string): URL => new URL(`../../${path}`, import.meta.url)
const readBytes = (path: string): Promise<Buffer> => readFile(rootUrl(path))
const readJson = async <T = Json>(path: string): Promise<T> =>
  JSON.parse((await readBytes(path)).toString('utf8')) as T

const gitBlobSha = async (path: string): Promise<string> => {
  const bytes = await readBytes(path)
  return createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex')
}

const sha256Text = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]]
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]]
const scale = (a: Point, factor: number): Point => [a[0] * factor, a[1] * factor]
const dot = (a: Point, b: Point): number => a[0] * b[0] + a[1] * b[1]
const cross = (a: Point, b: Point): number => a[0] * b[1] - a[1] * b[0]
const magnitude = (a: Point): number => Math.hypot(a[0], a[1])
const normalise = (a: Point): Point => {
  const length = magnitude(a)
  return [a[0] / length, a[1] / length]
}

const bearingDeg = (vector: Point): number =>
  Math.atan2(vector[1], vector[0]) * 180 / Math.PI

const angleDeltaDeg = (left: number, right: number): number => {
  let delta = left - right
  while (delta <= -180) delta += 360
  while (delta > 180) delta -= 360
  return delta
}

const assertNear = (actual: number, expected: number, tolerance: number, label: string): void => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`
  )
}

const assertPointNear = (actual: Point, expected: Point, tolerance: number, label: string): void => {
  assertNear(actual[0], expected[0], tolerance, `${label} easting`)
  assertNear(actual[1], expected[1], tolerance, `${label} northing`)
}

const pointInPolygon = (point: Point, closedPolygon: readonly Point[]): boolean => {
  let inside = false
  const count = closedPolygon.length - 1
  for (let i = 0, j = count - 1; i < count; j = i++) {
    const a = closedPolygon[i]
    const b = closedPolygon[j]
    const crossesRay =
      (a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    if (crossesRay) inside = !inside
  }
  return inside
}

const orientation = (a: Point, b: Point, c: Point): number =>
  cross(subtract(b, a), subtract(c, a))

const segmentsIntersect = (a: Point, b: Point, c: Point, d: Point): boolean => {
  const abC = orientation(a, b, c)
  const abD = orientation(a, b, d)
  const cdA = orientation(c, d, a)
  const cdB = orientation(c, d, b)
  return abC * abD < 0 && cdA * cdB < 0
}

const pointSegmentDistance = (point: Point, a: Point, b: Point): number => {
  const ab = subtract(b, a)
  const denominator = dot(ab, ab)
  const t = denominator === 0
    ? 0
    : Math.max(0, Math.min(1, dot(subtract(point, a), ab) / denominator))
  return magnitude(subtract(point, add(a, scale(ab, t))))
}

const segmentDistance = (a: Point, b: Point, c: Point, d: Point): number => {
  if (segmentsIntersect(a, b, c, d)) return 0
  return Math.min(
    pointSegmentDistance(a, c, d),
    pointSegmentDistance(b, c, d),
    pointSegmentDistance(c, a, b),
    pointSegmentDistance(d, a, b)
  )
}

const minimumBoundaryDistance = (
  footprint: readonly Point[],
  polygon: readonly Point[]
): number => {
  let minimum = Number.POSITIVE_INFINITY
  for (let i = 0; i < footprint.length - 1; i += 1) {
    for (let j = 0; j < polygon.length - 1; j += 1) {
      minimum = Math.min(
        minimum,
        segmentDistance(footprint[i], footprint[i + 1], polygon[j], polygon[j + 1])
      )
    }
  }
  return minimum
}

const polygonAreaAndCentroid = (closedPolygon: readonly Point[]): {
  area: number
  centroid: Point
} => {
  const origin = closedPolygon[0]
  const local = closedPolygon.map((point): Point => subtract(point, origin))
  let twiceArea = 0
  let centroidXNumerator = 0
  let centroidYNumerator = 0

  for (let i = 0; i < local.length - 1; i += 1) {
    const a = local[i]
    const b = local[i + 1]
    const term = cross(a, b)
    twiceArea += term
    centroidXNumerator += (a[0] + b[0]) * term
    centroidYNumerator += (a[1] + b[1]) * term
  }

  const signedArea = twiceArea / 2
  const localCentroid: Point = [
    centroidXNumerator / (6 * signedArea),
    centroidYNumerator / (6 * signedArea)
  ]
  return {
    area: Math.abs(signedArea),
    centroid: add(origin, localCentroid)
  }
}

const finding = (
  findings: readonly CandidateConformanceFinding[],
  clauseId: string
): CandidateConformanceFinding => {
  const match = findings.find((item) => item.clauseId === clauseId)
  assert.ok(match, `Expected candidate finding ${clauseId}`)
  return match
}

const candidatePath = 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json'
const titlePath = 'project/dpl/sites/dpl-t-control-004-lennard-road-title-boundary.json'
const elevationPath = 'project/dpl/sites/dpl-t-control-004-lennard-road-elevation.json'
const streetPath = 'project/dpl/sites/dpl-t-control-004-lennard-road-street-access.json'
const analysisPath = 'project/dpl/sites/dpl-t-control-004-lennard-road-analysis-bng-v01.json'
const verificationPath = 'project/dpl/sites/dpl-t-control-004-lennard-road-verification-v01.json'
const referenceHousePath = 'compiler/reference-house/fixture.ts'
const referenceOutputPath = 'docs/reference-house/generated/output-manifest.json'
// Exact pre-CCR bytes, not a claim about the original T4 capture date.
const historicalOutput = {
  path: 'compiler/dpl/fixtures/lennard-pre-ccr-reference-output-manifest.json',
  sourceCommit: 'c7d994a962be3d17d19ad85bd397f20d872d6817',
  sourcePath: referenceOutputPath,
  gitBlobSha: '46e48b0426c3d57579b3b5b79709ffdf62457bb2'
} as const

describe('DPL-T4 deterministic Lennard authored-candidate verification', () => {
  test('preserves the pinned historical manifest without treating it as current compile applicability', async () => {
    const candidate = await readJson(candidatePath)
    const historical = await readJson(historicalOutput.path)
    const current = await readJson(referenceOutputPath)
    assert.equal(await gitBlobSha(historicalOutput.path), historicalOutput.gitBlobSha)
    assert.equal(historical.sourceCompile.fingerprint, candidate.referenceHouse.sourceCompile.fingerprint)
    assert.equal(current.sourceCompile.fingerprint,
      compileReferenceHouseSystem(createReferenceHouseSource()).identity.compile.fingerprint)
    assert.notEqual(current.sourceCompile.fingerprint, candidate.referenceHouse.sourceCompile.fingerprint,
      'The historical candidate requires revalidation before claiming current compile applicability')
  })

  test('fails closed on source identity and reproduces the authored rigid site geometry', async () => {
    const candidate = await readJson(candidatePath)
    const title = await readJson(titlePath)
    const elevation = await readJson(elevationPath)
    const street = await readJson(streetPath)
    const analysis = await readJson(analysisPath)
    const outputManifest = await readJson(historicalOutput.path)
    assert.equal(await gitBlobSha(historicalOutput.path), historicalOutput.gitBlobSha)

    assert.equal(await gitBlobSha(referenceHousePath), candidate.referenceHouse.sourceGitBlobSha)
    assert.equal(await gitBlobSha(titlePath), candidate.evidencePins.titleBoundary.gitBlobSha)
    assert.equal(await gitBlobSha(elevationPath), candidate.evidencePins.elevation.gitBlobSha)
    assert.equal(await gitBlobSha(streetPath), candidate.evidencePins.streetAccess.gitBlobSha)
    assert.equal(
      outputManifest.sourceCompile.fingerprint,
      candidate.referenceHouse.sourceCompile.fingerprint
    )
    assert.equal(outputManifest.status, 'PASS')

    assert.equal(analysis.source.gitBlobSha, candidate.evidencePins.titleBoundary.gitBlobSha)
    assert.equal(analysis.source.hmlrReference, title.source.reference)
    assert.equal(sha256Text(title.geometry.wkt), analysis.source.sourceWktSha256)
    assert.equal(title.source.sourceJsonSha256, candidate.evidencePins.titleBoundary.sourceJsonSha256)
    assert.equal(elevation.extraction.rasterSha256, candidate.evidencePins.elevation.rasterSha256)

    const polygon = analysis.polygonBngM as Point[]
    const polygonMeasure = polygonAreaAndCentroid(polygon)
    assertNear(
      polygonMeasure.area,
      analysis.crossChecks.derivedAreaSquareMetres,
      SOURCE_CROSSCHECK_TOLERANCE_M,
      'derived BNG polygon area'
    )
    assertPointNear(
      polygonMeasure.centroid,
      analysis.crossChecks.expectedParcelCentroidBngM,
      SOURCE_CROSSCHECK_TOLERANCE_M,
      'derived BNG polygon centroid'
    )
    assertPointNear(
      polygonMeasure.centroid,
      elevation.parcelMask.parcelCentroidBng,
      SOURCE_CROSSCHECK_TOLERANCE_M,
      'EA parcel-mask/title centroid composition'
    )

    const transform = candidate.placement.rigidTransform
    const origin = transform.modelOriginBngM as Point
    const xUnit = transform.modelXUnitBng as Point
    const yUnit = transform.modelYUnitBng as Point

    // The stored authored vectors are decimal coordinates, not exact symbolic trig values.
    // Prove rigid geometry to their stated numeric precision without pretending nanometre exactness.
    assertNear(magnitude(xUnit), 1, UNIT_VECTOR_TOLERANCE, 'model +X unit length')
    assertNear(magnitude(yUnit), 1, UNIT_VECTOR_TOLERANCE, 'model +Y unit length')
    assertNear(dot(xUnit, yUnit), 0, UNIT_VECTOR_TOLERANCE, 'model axes orthogonality')
    assertNear(cross(xUnit, yUnit), 1, UNIT_VECTOR_TOLERANCE, 'unmirrored rigid-transform determinant')

    const shellWidthM = candidate.referenceHouse.boundedConformanceFacts.shellWidthMm / 1000
    const shellDepthM = candidate.referenceHouse.boundedConformanceFacts.shellDepthMm / 1000
    const derivedFootprint: Point[] = [
      origin,
      add(origin, scale(xUnit, shellWidthM)),
      add(add(origin, scale(xUnit, shellWidthM)), scale(yUnit, shellDepthM)),
      add(origin, scale(yUnit, shellDepthM)),
      origin
    ]
    const authoredFootprint = candidate.placement.footprintBngM as Point[]
    assert.equal(authoredFootprint.length, derivedFootprint.length)
    derivedFootprint.forEach((point, index) => {
      assertPointNear(point, authoredFootprint[index], COORDINATE_TOLERANCE_M, `footprint vertex ${index}`)
    })

    for (const point of derivedFootprint.slice(0, -1)) {
      assert.equal(pointInPolygon(point, polygon), true, `Footprint vertex ${point.join(',')} must be contained`)
    }
    const clearance = minimumBoundaryDistance(derivedFootprint, polygon)
    assertNear(
      clearance,
      candidate.placement.screeningFitEvidence.minimumBoundaryClearanceM,
      SOURCE_CROSSCHECK_TOLERANCE_M,
      'minimum title-index boundary clearance'
    )
    assert.equal(candidate.placement.screeningFitEvidence.containedByAdmittedTitleIndexPolygon, true)

    const frontageStart = street.controlledGeometryComposition.southWestBoundarySegmentBng.start as Point
    const frontageEnd = street.controlledGeometryComposition.southWestBoundarySegmentBng.end as Point
    assertPointNear(
      frontageStart,
      analysis.crossChecks.expectedFrontageSegmentBngM.start,
      COORDINATE_TOLERANCE_M,
      'frontage start'
    )
    assertPointNear(
      frontageEnd,
      analysis.crossChecks.expectedFrontageSegmentBngM.end,
      COORDINATE_TOLERANCE_M,
      'frontage end'
    )

    const frontageUnit = normalise(subtract(frontageEnd, frontageStart))
    const frontageBearing = bearingDeg(frontageUnit)
    const frontBearing = bearingDeg(xUnit)
    assertNear(
      frontageBearing,
      candidate.placement.streetRelationship.screeningFrontageSegmentBearingDegFromBngEasting,
      BEARING_TOLERANCE_DEG,
      'frontage bearing'
    )
    assertNear(
      frontBearing,
      candidate.placement.streetRelationship.authoredFrontBearingDegFromBngEasting,
      BEARING_TOLERANCE_DEG,
      'Reference House front bearing'
    )
    assertNear(
      angleDeltaDeg(frontBearing, frontageBearing),
      candidate.placement.streetRelationship.authoredFrontSkewDegFromScreeningFrontage,
      BEARING_TOLERANCE_DEG,
      'authored front skew'
    )

    const frontageMidpoint: Point = scale(add(frontageStart, frontageEnd), 0.5)
    const inwardNormal: Point = [-frontageUnit[1], frontageUnit[0]]
    const construction = candidate.placement.streetRelationship.frontCentreConstruction
    const constructedFrontCentre = add(
      add(frontageMidpoint, scale(frontageUnit, construction.alongFrontageOffsetM)),
      scale(inwardNormal, construction.inwardNormalSetbackM)
    )
    const transformFrontCentre = add(origin, scale(xUnit, shellWidthM / 2))
    assertPointNear(
      constructedFrontCentre,
      construction.frontCentreBngM,
      COORDINATE_TOLERANCE_M,
      'authored front-centre construction'
    )
    assertPointNear(
      transformFrontCentre,
      construction.frontCentreBngM,
      COORDINATE_TOLERANCE_M,
      'transform front centre'
    )

    assert.equal(candidate.verticalDatum.datum, 'ODN')
    const rawFfl =
      elevation.parcelMask.centroidSampleMetresODN + candidate.verticalDatum.authoredBasis.authoredScreeningRaiseM
    const roundedFfl =
      Math.round(rawFfl / AUTHORED_FFL_PRECISION_M) * AUTHORED_FFL_PRECISION_M
    assertNear(
      candidate.verticalDatum.groundFflM,
      roundedFfl,
      Number.EPSILON * 100,
      'authored screening FFL rounded to 0.01 m'
    )
  })

  test('replays bounded DPL-12B conformance and reproduces the frozen T4 result fingerprint', async () => {
    const candidate = await readJson(candidatePath)
    const analysis = await readJson(analysisPath)
    const verification = await readJson(verificationPath)
    const source = createReferenceHouseSource()

    assert.equal(await gitBlobSha(referenceHousePath), candidate.referenceHouse.sourceGitBlobSha)
    const currentReferenceFingerprint = referenceHouseSourceFingerprint(source)

    const input: DeploymentCandidateInput = {
      id: candidate.candidateId,
      revision: candidate.revision,
      authoredSource: {
        id: candidatePath,
        revision: candidate.revision
      },
      referenceHouseSourceFingerprint: currentReferenceFingerprint,
      facts: candidate.referenceHouse.boundedConformanceFacts,
      variantSelections: candidate.referenceHouse.variantSelections,
      siteInterfaceResponseRefs: candidate.siteInterfaceResponses.refs
    }
    const conformance = evaluateCandidateConformance(input, source)
    assert.equal(conformance.referenceRevisionMatches, true)

    for (const clauseId of ['RH-I02', 'RH-PROT-01', 'RH-PROT-04', 'RH-PROT-06', 'RH-V02']) {
      assert.equal(finding(conformance.findings, clauseId).result, 'CONFORMS', clauseId)
    }
    for (const clauseId of ['RH-SI02', 'RH-SI05']) {
      const item = finding(conformance.findings, clauseId)
      assert.equal(item.result, 'OPEN', clauseId)
      assert.equal(item.checkKind, 'EXTERNAL_OR_UNMODELLED', clauseId)
    }

    const runtimePayload = {
      schema: 'dpl.lennardCandidateVerificationResult.v1',
      packet: 'DPL-T4',
      controlId: candidate.controlId,
      candidate: {
        id: candidate.candidateId,
        revision: candidate.revision
      },
      result: 'VERIFIED_BOUNDED_CANDIDATE_READY_FOR_NEXT_DPL_GATE',
      sourceIdentity: {
        referenceHouseSourceGitBlobSha: candidate.referenceHouse.sourceGitBlobSha,
        referenceHouseCompileFingerprint: candidate.referenceHouse.sourceCompile.fingerprint,
        titleBoundaryGitBlobSha: candidate.evidencePins.titleBoundary.gitBlobSha,
        elevationGitBlobSha: candidate.evidencePins.elevation.gitBlobSha,
        streetAccessGitBlobSha: candidate.evidencePins.streetAccess.gitBlobSha,
        analysisGeometryRevision: analysis.revision,
        analysisSourceWktSha256: analysis.source.sourceWktSha256
      },
      geometry: {
        shellWidthM: candidate.referenceHouse.boundedConformanceFacts.shellWidthMm / 1000,
        shellDepthM: candidate.referenceHouse.boundedConformanceFacts.shellDepthMm / 1000,
        handedness: candidate.referenceHouse.handedness,
        rigidTransform: 'PASS',
        screeningContainment: candidate.placement.screeningFitEvidence.containedByAdmittedTitleIndexPolygon,
        minimumBoundaryClearanceM: candidate.placement.screeningFitEvidence.minimumBoundaryClearanceM,
        frontageBearingDegFromBngEasting: candidate.placement.streetRelationship.screeningFrontageSegmentBearingDegFromBngEasting,
        frontBearingDegFromBngEasting: candidate.placement.streetRelationship.authoredFrontBearingDegFromBngEasting,
        frontSkewDeg: candidate.placement.streetRelationship.authoredFrontSkewDegFromScreeningFrontage,
        groundFflM: candidate.verticalDatum.groundFflM
      },
      conformance: {
        'RH-I02': finding(conformance.findings, 'RH-I02').result,
        'RH-PROT-01': finding(conformance.findings, 'RH-PROT-01').result,
        'RH-PROT-04': finding(conformance.findings, 'RH-PROT-04').result,
        'RH-PROT-06': finding(conformance.findings, 'RH-PROT-06').result,
        'RH-V02': finding(conformance.findings, 'RH-V02').result,
        'RH-SI02': finding(conformance.findings, 'RH-SI02').result,
        'RH-SI05': finding(conformance.findings, 'RH-SI05').result
      },
      proofBoundary: {
        wholeSiteCompatibilityConclusion: 'NOT_ADMITTED',
        wholeSiteIncompatibilityConclusion: 'NOT_ADMITTED',
        routeSearch: 'NOT_IMPLEMENTED',
        planningAcceptability: 'NOT_PROVED',
        legalTitleBoundary: 'UNRESOLVED',
        measuredTopographicSurvey: 'NOT_ACQUIRED',
        dpl16: 'HELD'
      }
    }

    assert.deepEqual(runtimePayload, verification.payload)
    assert.equal(
      sha256DplSemanticFingerprint(runtimePayload),
      verification.resultFingerprint
    )
    assert.equal(
      verification.resultFingerprint,
      '0fafa462472370e54d5e1e3aba40e88cb594e8aafb877e0c687af0e5c5fc96dc'
    )
    assert.equal(Object.prototype.hasOwnProperty.call(runtimePayload, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(runtimePayload, 'deploymentConclusion'), false)
  })
})
