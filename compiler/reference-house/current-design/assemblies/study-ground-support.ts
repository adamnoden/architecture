import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { stableJsonStringify } from '../../../core/identity.js'
import type { CurrentDesignResolution } from '../resolve.js'
import type { compileResolvedStudyAssembly } from './study-floor.js'

type Section = ReturnType<typeof compileResolvedStudyAssembly>['section']
type FloorStack = { readonly layers: readonly [number, number, number, number]; readonly z: readonly [number, number, number, number, number] }
type BoundaryReceipt = {
  readonly sources: { readonly HAD: { readonly path: string; readonly blob: string } }
  readonly actualFloor: { readonly stack: FloorStack; readonly slab: { readonly top: number; readonly bottom: number } }
}
type SourceIdentity = { readonly path: string; readonly gitBlob: string }
type SourceBytes = { readonly bytes: Buffer; readonly diagnostic?: never }
type SourceFailure = { readonly diagnostic: { readonly code: string; readonly path: string }; readonly bytes?: never }

const hadPath = 'project/had/studies/water-replan.json'
const matStackPath = 'project/mat/studies/loggia-envelope-section.json'
const matBoundary = { path: 'project/mat/studies/floor-pour-boundary.results.json', gitBlob: '5fba79b85589e03cc53fe224420ae5340b65c8b5' }
const floorId = 'GROUND/G-STUDY/floor'
const minimumFloatingCourseMm = 65
const separatorComparisonMm = 0.3
const floatingCourseComparator = {
  source: 'https://www.concrete.org.uk/fingertips/screeds-general/',
  scope: 'Lightly loaded conventional floating sand/cement screed with insulation firm enough for compaction.',
} as const
const readSource = (path: string) => readFileSync(new URL(`../../../../${path}`, import.meta.url))
const gitBlob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')

function readBoundSource({ path, gitBlob: expected }: SourceIdentity, read: typeof readSource): SourceBytes | SourceFailure {
  let bytes: Buffer
  try {
    bytes = read(path)
  } catch {
    return { diagnostic: { code: 'IAS_STUDY_GROUND_SOURCE_UNAVAILABLE', path } } as const
  }
  if (gitBlob(bytes) !== expected) return { diagnostic: { code: 'IAS_STUDY_GROUND_SOURCE_STALE', path } } as const
  return { bytes }
}

function validStack({ layers, z }: FloorStack) {
  return layers.length === 4 && z.length === 5 && z.every(Number.isFinite)
    && layers.every((layer, index) => layer > 0 && z[index] - z[index + 1] === layer)
}

export function compileStudyGroundSupport(resolved: CurrentDesignResolution, section: Section, deckLevelLossMm: number, read = readSource) {
  const hold = { disposition: 'withheld', held: 'Named bedding, separator, ordinary-course tolerance, above-glass support, uniform bearing and dry-to-wet edge.' } as const
  const withheld = (diagnostic: { readonly code: string; readonly path: string }) => ({
    ...hold, state: 'source-withheld' as const, diagnostics: [{ ...diagnostic, objectIds: [floorId] }],
  })
  const water = resolved.disciplineBindings.find(binding => binding.id === 'had-selected-water')
  const hadBlob = water?.identities[hadPath]
  const matStackBlob = water?.identities[matStackPath]
  if (!hadBlob || !matStackBlob) return withheld({ code: 'IAS_STUDY_GROUND_BINDING_UNAVAILABLE', path: hadBlob ? matStackPath : hadPath })
  const hadSource = { path: hadPath, gitBlob: hadBlob }
  const matSource = { path: matStackPath, gitBlob: matStackBlob }
  const had = readBoundSource(hadSource, read)
  const mat = readBoundSource(matSource, read)
  const boundary = readBoundSource(matBoundary, read)
  if (had.diagnostic) return withheld(had.diagnostic)
  if (mat.diagnostic) return withheld(mat.diagnostic)
  if (boundary.diagnostic) return withheld(boundary.diagnostic)

  const { floorJoin } = JSON.parse(mat.bytes.toString('utf8')) as { readonly floorJoin: FloorStack }
  const { model } = JSON.parse(had.bytes.toString('utf8')) as { model: { northNormalRoute: { floorJoin: FloorStack } } }
  const { sources, actualFloor } = JSON.parse(boundary.bytes.toString('utf8')) as BoundaryReceipt
  const { stack, slab } = actualFloor
  if (!validStack(stack) || stableJsonStringify(floorJoin) !== stableJsonStringify(stack)
    || stableJsonStringify(model.northNormalRoute.floorJoin) !== stableJsonStringify(stack)
    || sources.HAD.path !== hadPath || sources.HAD.blob !== hadBlob
    || slab.top !== stack.z[3] || slab.bottom !== stack.z[4]) {
    return withheld({ code: 'IAS_STUDY_GROUND_STACK_MISMATCH', path: matBoundary.path })
  }
  const [fflMm, matDeckTopMm, glassTopMm, rcTopMm, rcSoffitMm] = stack.z
  const [matFinishMm, matDistributionMm, cellularGlassMm, rcDepthMm] = stack.layers
  if (fflMm !== section.ffl || rcTopMm !== section.rcTop) {
    return withheld({ code: 'IAS_STUDY_GROUND_DATUM_MISMATCH', path: matBoundary.path })
  }
  const fullFinishDeckTopMm = fflMm - section.finishDepthMm
  const deckTopMm = fflMm - (section.wearFaceMm + section.beddingTerritoryMm)
  const actualCourseBeforeLevelToleranceMm = deckTopMm - glassTopMm - separatorComparisonMm
  const courseAfterDeckLevelLossMm = actualCourseBeforeLevelToleranceMm - deckLevelLossMm
  const exactRequiredDeckTop = glassTopMm + separatorComparisonMm + minimumFloatingCourseMm + deckLevelLossMm
  const requiredDeckTopBeforeLevelLossMm = Number(exactRequiredDeckTop.toFixed(3))
  const maximumFinishAndBeddingMm = Number((fflMm - exactRequiredDeckTop).toFixed(3))
  const diagnostics = courseAfterDeckLevelLossMm <= 0
    ? [{ code: 'IAS_STUDY_GROUND_DECK_AND_SEPARATOR_OVERLAP', objectIds: [floorId] }]
    : courseAfterDeckLevelLossMm < minimumFloatingCourseMm
    ? [{ code: 'IAS_STUDY_GROUND_COURSE_BELOW_COMPARATOR', objectIds: [floorId] }] : []
  return {
    state: 'geometry-comparison',
    method: 'IAS-STUDY-GROUND-SUPPORT-1',
    source: { bindingDigest: water.digest, had: hadSource, mat: matSource, comparison: matBoundary },
    fflMm, rcTopMm, rcSoffitMm, rcDepthMm, matDeckTopMm, matFinishMm, matDistributionMm,
    glassTopMm, cellularGlassMm, fullFinishDeckTopMm, deckTopIfDepthUnresolvedMovesToDeckMm: deckTopMm,
    minimumFloatingCourseMm, floatingCourseComparator, separatorComparisonMm, actualCourseBeforeLevelToleranceMm,
    marginToMinimumBeforeLevelToleranceMm: actualCourseBeforeLevelToleranceMm - minimumFloatingCourseMm,
    deckLevelLossMm, courseAfterDeckLevelLossMm,
    marginAfterDeckLevelLossMm: courseAfterDeckLevelLossMm - minimumFloatingCourseMm,
    requiredDeckTopBeforeLevelLossMm, maximumFinishAndBeddingMm, diagnostics,
    ...hold,
  } as const
}
