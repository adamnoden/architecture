import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PROJECT_DESIGN_CONSTRAINTS } from '../../../project/design-constraints.js'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { createSectionPaperProjection } from '../../publication-drawing/projection.js'
import type { CurrentDesignResolution } from './resolve.js'

const repository = new URL('../../../', import.meta.url)
const methodPath = 'project/mat/studies/ring-roof-pitch-case.py'
const housePath = 'project/had/studies/water-replan.json'
const productPath = 'project/mat/studies/ring-roof-family-sources.json'
const inputs = [methodPath, housePath, productPath, 'project/design-constraints.ts', 'project/mat/studies/ring-roof-family.json',
  'project/mat/studies/ring-roof-family.py', 'project/mat/studies/ring_roof_family_figure.py'] as const
const roofId = 'MAT/ring-roof-field'
const read = (path: string) => readFileSync(new URL(path, repository))

function resolveRoofPitch(resolved: CurrentDesignResolution, reader: typeof read) {
  const binding = resolved.disciplineBindings.find(item => item.id === 'mat-roof-pitch-reference')
  if (!binding) throw new Error('The roof pitch case requires an applicable current MAT roof source')
  const observed = Object.fromEntries(inputs.map(path => {
    const bytes = reader(path)
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (binding.identities[path] !== blob) throw new Error(`Stale roof method, product or source binding: ${path}`)
    return [path, { bytes, blob }]
  }))
  const { model } = JSON.parse(observed[housePath].bytes.toString('utf8'))
  return { binding, observed, referencePitch: model.roofDevelopment.pitch as number }
}

interface RoofPitchCase {
  readonly schema: 'mat-roof-pitch-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly roofId: typeof roofId
  readonly pitchDeg: number
}

interface Stock {
  readonly rowsPerFace: number
  readonly gauge: number
  readonly headlap: number
  readonly lappedSlateM2: number
}
interface RoofSection {
  readonly pitchDeg: number
  readonly fieldSectionQZMm: readonly (readonly [number, number])[]
  readonly roofSlopeAreaM2: number
  readonly planCatchmentM2: number
  readonly slateStockComparisons: Readonly<Record<'moderate' | 'severe', Readonly<Record<'outer' | 'court', Stock>>>>
}
interface RoofResponse {
  readonly schema: 'mat-ring-roof-pitch-result/1'
  readonly referencePitchDeg: number
  readonly referenceFieldSectionQZMm: RoofSection['fieldSectionQZMm']
  readonly comparison: RoofSection
}

export function readRoofPitchCase(resolved: CurrentDesignResolution) {
  const { binding, referencePitch } = resolveRoofPitch(resolved, read)
  const roof: RoofPitchCase = { schema: 'mat-roof-pitch-case/1', planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest, roofId, pitchDeg: referencePitch }
  return { schema: 'mat-roof-pitch-request/1' as const, design: resolved.design, roof }
}

function drawRoofPitch(native: RoofResponse, caseDigest: string): DrawingSceneV2 {
  const { comparison, referenceFieldSectionQZMm: reference, referencePitchDeg } = native
  const coordinates = comparison.fieldSectionQZMm
  const [firstQ] = coordinates[0]
  const [lastQ] = coordinates.at(-1)!
  const extrema = [...coordinates, ...reference].map(([, z]) => z)
  const emin = Math.min(...extrema)
  const emax = Math.max(...extrema)
  const scaleDenominator = 50
  const p = createSectionPaperProjection({ scaleDenominator,
    horizontalBounds: { min: firstQ, max: lastQ }, verticalBounds: { min: emin, max: emax }, paperOrigin: { x: 12, y: 22 } })
  const delta = coordinates[2][1] - reference[2][1]
  const level = (z: number) => z.toFixed(2)
  const datum = p.length(emax - emin) + 27
  const changed = referencePitchDeg !== comparison.pitchDeg
  const profile = (points: RoofSection['fieldSectionQZMm'], original: boolean) => points.slice(1).map(([q, z], i) => ({
    kind: 'line' as const, id: `${original ? 'reference' : 'trial'}-field-${i}`,
    role: original ? 'secondary' as const : 'primary' as const,
    ...(original ? { dash: 'provisional' as const } : {}),
    a: p.point(...points[i]), b: p.point(q, z), metadata: { roofId, caseDigest, endZMm: z },
  }))
  return {
    title: 'Ring roof field pitch comparison', description: 'The continuous field uses fixed wall level and plan axes.',
    viewId: 'MAT-RING-ROOF-PITCH', sourceId: roofId, scaleDenominator,
    widthMm: Math.max(134, p.length(lastQ - firstQ) + 24), heightMm: datum + 22,
    primitives: [
      { kind: 'text', id: 'trial-pitch', x: 12, y: 10, role: 'label',
        value: changed ? `Ring roof section · ${referencePitchDeg}° to ${comparison.pitchDeg}°` : `Ring roof section · ${referencePitchDeg}°` },
      ...(changed ? profile(reference, true) : []),
      ...profile(coordinates, false),
      { kind: 'text', id: 'reference-ridge', x: 12, y: datum + 7, role: 'note',
        value: changed ? `Dashed · current ridge Z${level(reference[2][1])} mm` : `Current ridge Z${level(reference[2][1])} mm` },
      ...(changed ? [{ kind: 'text' as const, id: 'trial-ridge', x: 12, y: datum + 14, role: 'note' as const,
        value: `Solid · trial ridge Z${level(coordinates[2][1])} mm · shift ${delta >= 0 ? '+' : ''}${level(delta)} mm` }] : []),
    ],
  }
}

export function runRoofPitchCase(resolved: CurrentDesignResolution, input: unknown, reader = read) {
  const { binding, observed, referencePitch } = resolveRoofPitch(resolved, reader)
  const keys = ['schema', 'planDigest', 'bindingDigest', 'roofId', 'pitchDeg']
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== keys.length
    || keys.some(key => !Object.hasOwn(input, key))) throw new TypeError('Expected an explicit versioned roof pitch case')
  const trial = input as RoofPitchCase
  if (trial.schema !== 'mat-roof-pitch-case/1' || trial.roofId !== roofId) throw new Error('Only the bound MAT roof field is supported')
  if (trial.planDigest !== binding.applicability.planDigest || trial.bindingDigest !== binding.digest) throw new Error('Stale roof pitch case binding')
  const minimum = PROJECT_DESIGN_CONSTRAINTS.roofs.currentCandidateMinimumPitchDeg
  if (!Number.isFinite(trial.pitchDeg) || trial.pitchDeg < minimum || trial.pitchDeg >= 45) {
    throw new Error(`Nominal pitch must be finite, at least ${minimum} degrees for the current house and below 45 degrees`)
  }
  const native: RoofResponse = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, repository))], {
    input: JSON.stringify({ schema: 'mat-ring-roof-pitch-case/1', pitchDeg: trial.pitchDeg }), encoding: 'utf8',
  }))
  if (native.schema !== 'mat-ring-roof-pitch-result/1' || native.referencePitchDeg !== referencePitch || native.comparison.pitchDeg !== trial.pitchDeg) {
    throw new Error('Native roof comparison does not match its case')
  }
  const caseDigest = sha256SemanticFingerprint(trial)
  return {
    schema: 'mat-roof-pitch-case-result/1' as const, status: 'nominal-comparison' as const,
    source: { planDigest: trial.planDigest, bindingDigest: trial.bindingDigest, caseDigest },
    method: { id: 'MAT-RING-ROOF-PITCH/1', path: methodPath, gitBlob: observed[methodPath].blob,
      inputs: Object.fromEntries(inputs.map(path => [path, observed[path].blob])) },
    schedule: native.comparison, drawing: drawRoofPitch(native, caseDigest),
    evidence: trial.pitchDeg === referencePitch
      ? { state: 'native-comparison-only', referencePitchDeg: referencePitch } as const
      : { state: 'withheld-for-pitch-change', referencePitchDeg: referencePitch,
        invalidated: ['MAT installed covering and headlap applicability', 'STR roof actions and stiffness',
          'RWT selected roof-water collection and movement'] } as const,
  }
}
