import { mouthFlow, mouthStage } from '../../../project/rwt/studies/selected-water-event.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import type { CurrentDesignResolution } from './resolve.js'
import { readBoundSelectedWaterEvent } from './selected-water-event.js'

type Interval = readonly [number, number]
interface CourtIntakeCase {
  readonly schema: 'rwt-court-intake-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly port: { readonly id: 'east-court-west-intake'; readonly xMm: number }
  readonly route: { readonly intervalsYMm: readonly Interval[] }
  readonly quietStageMm: number
  readonly lossK: number
}

type Reference = ReturnType<typeof readReference>

function readReference(resolved: CurrentDesignResolution) {
  const { house, binding, method } = readBoundSelectedWaterEvent(resolved)
  const west = house.model.renewal.courtCollector.actualOpenEntries.west
  return {
    planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest,
    method,
    west,
    quietStageMm: house.model.model.firstWetReference.permittedQuietStage,
    assignedFlowLps: house.model.hydraulicProbe.assignedInwardRoofAndCourtLps,
  }
}

function createCase(reference: Reference): CourtIntakeCase {
  return {
    schema: 'rwt-court-intake-case/1',
    planDigest: reference.planDigest,
    bindingDigest: reference.bindingDigest,
    port: { id: 'east-court-west-intake', xMm: reference.west.planeX },
    route: { intervalsYMm: reference.west.creditedIntervals },
    quietStageMm: reference.quietStageMm,
    lossK: 1,
  }
}

export function readCourtIntakeCase(resolved: CurrentDesignResolution) {
  return { schema: 'rwt-court-intake-request/1' as const, design: resolved.design, intake: createCase(readReference(resolved)) }
}

function record(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value) ||
    Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Invalid ${label} fields`)
  }
  return value as Record<string, unknown>
}

function admitCase(value: unknown, reference: Reference): CourtIntakeCase {
  const input = record(value, ['schema', 'planDigest', 'bindingDigest', 'port', 'route', 'quietStageMm', 'lossK'], 'court intake case')
  if (input.schema !== 'rwt-court-intake-case/1') throw new Error('Unknown court intake case schema')
  if (input.planDigest !== reference.planDigest || input.bindingDigest !== reference.bindingDigest) {
    throw new Error('Stale court intake case source binding')
  }

  const port = record(input.port, ['id', 'xMm'], 'port')
  if (port.id !== 'east-court-west-intake' || port.xMm !== reference.west.planeX) {
    throw new Error('Port relocation is outside the native selected intake method')
  }
  const route = record(input.route, ['intervalsYMm'], 'route')
  if (!Array.isArray(route.intervalsYMm)) throw new Error('The route requires explicit credited intervals')
  let previousEnd = -Infinity
  for (const interval of route.intervalsYMm) {
    if (!Array.isArray(interval) || interval.length !== 2 || !interval.every(Number.isFinite)) {
      throw new Error('An intake interval requires two finite Y coordinates')
    }
    const [a, b] = interval
    if (a >= b || a < previousEnd || !reference.west.creditedIntervals.some(([lo, hi]) => a >= lo && b <= hi)) {
      throw new Error('Intake intervals may narrow the source apertures and must be ordered and disjoint')
    }
    previousEnd = b
  }
  if (typeof input.quietStageMm !== 'number' || !Number.isFinite(input.quietStageMm) || input.quietStageMm > reference.quietStageMm) {
    throw new Error('A trial quiet stage must be finite and at or below the source allocation')
  }
  // The selected event explicitly evaluates these loss sensitivities at its actual mouth.
  if (typeof input.lossK !== 'number' || ![0, 0.5, 1, 1.5, 2].includes(input.lossK)) {
    throw new Error('Use one of the owning RWT event loss sensitivities')
  }
  return input as unknown as CourtIntakeCase
}

function intakeDrawing(intake: CourtIntakeCase, reference: Reference): DrawingSceneV2 {
  const [lo, hi] = reference.west.y
  const x = intake.port.xMm
  const scaleDenominator = 10
  const projection = createPlanPaperProjection({
    scaleDenominator,
    modelBounds: { x, y: lo, width: 1, height: hi - lo },
    paperOrigin: { x: 15, y: 10 },
  })
  const primitives: DrawingSceneV2['primitives'] = []
  for (const [family, intervals] of [
    ['source-aperture', reference.west.creditedIntervals],
    ['trial-aperture', intake.route.intervalsYMm],
  ] as const) {
    for (const [index, [a, b]] of intervals.entries()) {
      primitives.push({
        kind: 'line', id: `${family}-${index}`,
        a: projection.point(x, a), b: projection.point(x, b),
        role: family === 'source-aperture' ? 'secondary' : 'primary',
        metadata: { port: intake.port.id, xMm: x, lowYMm: a, highYMm: b,
          planDigest: reference.planDigest, bindingDigest: reference.bindingDigest },
      })
    }
  }
  return {
    viewId: 'RWT-E-WEST-INTAKE-DIAGRAM', sourceId: intake.port.id,
    title: 'East diversion intake · credited and trial opening',
    description: 'Plan slice at the actual intake plane. The trial overlay cannot locate a new flow path.',
    widthMm: 30, heightMm: 20 + projection.length(hi - lo), scaleDenominator, primitives,
  }
}

export function runCourtIntakeCase(resolved: CurrentDesignResolution, input: unknown) {
  const reference = readReference(resolved)
  const intake = admitCase(input, reference)
  const { quietStageMm, lossK, port } = intake
  const intervals = intake.route.intervalsYMm
  const widthMm = intervals.reduce((total, [a, b]) => total + (b - a), 0)
  const capacityAtQuietLps = mouthFlow(quietStageMm, intervals, { lossK })
  const withinQuietSensitivity = capacityAtQuietLps >= reference.assignedFlowLps
  const requiredStageMm = withinQuietSensitivity ? mouthStage(reference.assignedFlowLps, intervals, { lossK }) : null
  const status = widthMm === 0 ? 'blocked' : withinQuietSensitivity ? 'within-quiet-sensitivity' : 'exceeds-quiet-sensitivity'
  return {
    schema: 'rwt-court-intake-result/1' as const,
    status,
    source: { planDigest: reference.planDigest, bindingDigest: reference.bindingDigest, caseDigest: sha256SemanticFingerprint(intake) },
    method: { ...reference.method, entryPoints: ['mouthFlow', 'mouthStage'] as const },
    calculation: { port, widthMm, quietStageMm, lossK, assignedFlowLps: reference.assignedFlowLps,
      capacityAtQuietLps, remainingCapacityLps: capacityAtQuietLps - reference.assignedFlowLps, requiredStageMm },
    drawing: intakeDrawing(intake, reference),
    diagnostics: [{
      portId: port.id,
      code: 'INSTALLED_ADMISSION_OUTSIDE_SCOPE',
      message: 'Native critical-section sensitivity only. Actual losses, first wetting, installed flow and site reception remain open.',
    }],
  }
}
