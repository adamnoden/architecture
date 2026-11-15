import { readFileSync } from 'node:fs'
import { scheduleText } from '../../../project/had/studies/current-house.mjs'
import { developGroundWCCondensate, readGroundWCCondensate } from '../../../project/had/studies/occupied-condensate-port.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { readBoundOccupiedServices } from './occupied-services.js'
import type { CurrentDesignResolution } from './resolve.js'

const portId = 'ground-WC-condensate'
const methodPath = 'project/had/studies/occupied-condensate-port.mjs'
const read = (path: string): object => JSON.parse(readFileSync(new URL('../../../' + path, import.meta.url), 'utf8'))
const shiftLimitMm = 100
const geometryMinimumMm = 25
const floorEpsilon = 1e-8
const round = (value: number) => Math.round(value * 100) / 100

interface CondensateCase {
  readonly schema: 'had-condensate-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly portId: typeof portId
  readonly portLevelMm: number
}

type DiagnosticCode = 'OUTWARD_FALL_REVERSED' | 'FORMED_PORT_CLEARANCE' | 'RAIN_FACE_CLEARANCE' |
  'DRAIN_TO_EXHAUST_CLEARANCE' | 'SOCKET_REACH_EXCEEDED' | 'BLANK_TOOL_REACH_EXCEEDED' |
  'CARTRIDGE_GUARD_CLEARANCE' | 'ASSEMBLED_OPERATION_UNQUALIFIED'

type ResultGeometry = ReturnType<typeof developGroundWCCondensate>

export function readOccupiedCondensateCase(resolved: CurrentDesignResolution) {
  const { house, binding } = readBoundOccupiedServices(resolved)
  const condensate: CondensateCase = {
    schema: 'had-condensate-case/1',
    planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest,
    portId,
    portLevelMm: readGroundWCCondensate(house).point[2],
  }
  return { schema: 'had-condensate-request/1' as const, design: resolved.design, condensate }
}

function admitCase(input: unknown, binding: ReturnType<typeof readBoundOccupiedServices>['binding'], sourceLevel: number) {
  const keys = ['schema', 'planDigest', 'bindingDigest', 'portId', 'portLevelMm']
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== keys.length ||
    keys.some(key => !Object.hasOwn(input, key))) throw new Error('Expected an explicit occupied condensate case')
  const value = input as CondensateCase
  if (value.schema !== 'had-condensate-case/1' || value.portId !== portId) {
    throw new Error('Only the selected ground WC condensate level has an applicable method')
  }
  if (value.planDigest !== binding.applicability.planDigest || value.bindingDigest !== binding.digest) {
    throw new Error('Stale occupied condensate case source binding')
  }
  if (!Number.isFinite(value.portLevelMm) || Math.abs(value.portLevelMm - sourceLevel) > shiftLimitMm) {
    throw new Error('The supported condensate trial is within 100 mm of the selected level')
  }
  return value
}

function section({ reference, port }: ResultGeometry, bindingDigest: string): DrawingSceneV2 {
  const floor = reference.point[2] - 140
  const width = Math.max(...reference.route.map(point => point[1]))
  const height = 280
  const scaleDenominator = 10
  const projection = createPlanPaperProjection({ scaleDenominator, modelBounds: { x: 0, y: floor, width, height },
    paperOrigin: { x: 12, y: 12 } })
  const primitives: DrawingSceneV2['primitives'] = [{
    kind: 'line', id: 'south-wall', a: projection.point(reference.point[1], floor),
    b: projection.point(reference.point[1], floor + height), role: 'secondary', dash: 'provisional',
  }]
  for (const [id, geometry] of [['selected', reference], ['trial', port]] as const) {
    const role = id === 'selected' ? 'secondary' : 'primary'
    for (const [i, end] of geometry.route.slice(1).entries()) {
      const start = geometry.route[i]
      primitives.push({
        kind: 'line', id: id + '-drain-' + i,
        a: projection.point(start[1], start[2]), b: projection.point(end[1], end[2]),
        role, ...(id === 'selected' ? { dash: 'provisional' as const } : {}),
        metadata: { portId, bindingDigest, fromZMm: start[2], toZMm: end[2] },
      })
    }
    const [, y, z] = geometry.point
    primitives.push({
      kind: 'line', id: id + '-formed-sleeve', a: projection.point(y, z - geometry.radius),
      b: projection.point(y, z + geometry.radius), role, metadata: { portId, bindingDigest, levelMm: z },
    })
  }
  const baseline = projection.point(120, reference.point[2])
  primitives.push(
    { kind: 'text', id: 'selected-level', x: baseline.x, y: baseline.y - 3,
      value: 'Selected Z' + reference.point[2], role: 'label' },
    { kind: 'text', id: 'trial-level', x: baseline.x, y: projection.point(120, port.point[2]).y + 5,
      value: 'Trial Z' + port.point[2], role: 'label' },
    { kind: 'text', id: 'wall-label', x: 12, y: 44, value: 'South wall', role: 'label' },
  )
  return { viewId: 'HAD-GROUND-WC-CONDENSATE-SECTION', sourceId: portId, title: 'Ground WC condensate · south wall section',
    description: 'Selected and trial axes in room-normal section. The wall port and cartridge move with their gravity tail.',
    scaleDenominator, widthMm: projection.length(width) + 24, heightMm: projection.length(height) + 24, primitives }
}

function check(fit: ResultGeometry['fit']) {
  const checks: readonly [boolean, Exclude<DiagnosticCode, 'ASSEMBLED_OPERATION_UNQUALIFIED'>, string][] = [
    [fit.fall.every(leg => leg.fallMm > 0 && leg.fallMm + floorEpsilon >= .01 * leg.horizontalMm),
      'OUTWARD_FALL_REVERSED', 'Every leg must descend. Nonvertical legs retain at least 1:100.'],
    [fit.apertureMm >= geometryMinimumMm, 'FORMED_PORT_CLEARANCE', 'The complete hole clears the opening and structure by less than 25 mm.'],
    [fit.weatherFaceMm >= geometryMinimumMm, 'RAIN_FACE_CLEARANCE', 'The square weather face clears the opening and structure by less than 25 mm.'],
    [fit.drainToExhaustMm >= geometryMinimumMm, 'DRAIN_TO_EXHAUST_CLEARANCE', 'The insulated exhaust and independent condensate have less than 25 mm between them.'],
    [fit.roomToolMm <= fit.roomToolMaximumMm, 'SOCKET_REACH_EXCEEDED', 'The room-side cartridge release needs a socket reach beyond its source maximum.'],
    [fit.temporaryBlankToolMm <= fit.temporaryBlankToolMaximumMm, 'BLANK_TOOL_REACH_EXCEEDED', 'The temporary blank needs a tool reach beyond its source maximum.'],
    [fit.exteriorGuardMm >= geometryMinimumMm, 'CARTRIDGE_GUARD_CLEARANCE', 'The cartridge comes within 25 mm of the exterior stage guard.'],
  ]
  return checks.filter(([passed]) => !passed)
    .map(([, code, message]) => ({ objectId: portId, code, severity: 'blocking' as const, message }))
}

export function runOccupiedCondensateCase(resolved: CurrentDesignResolution, input: unknown) {
  const { house, binding } = readBoundOccupiedServices(resolved)
  const reference = readGroundWCCondensate(house)
  const request = admitCase(input, binding, reference.point[2])
  const result = developGroundWCCondensate(house, read('project/str/studies/reconciled-house-interface.json'),
    read('project/str/studies/current-house-arch-movement.json'), request.portLevelMm)
  const failures = check(result.fit)
  const schedule = scheduleText(result.trial)
  const nativeReplay = request.portLevelMm === reference.point[2]
  if (nativeReplay && schedule !== scheduleText(house)) {
    throw new Error('Reference occupied condensate replay differs from the native selected schedule')
  }
  const physical: {objectId: typeof portId; code: DiagnosticCode; severity: 'scope'; message: string} = {
    objectId: portId, code: 'ASSEMBLED_OPERATION_UNQUALIFIED', severity: 'scope',
    message: 'The selected fan and cartridge limits remain fixed. Installed seals, rain, frost, supports, condensate behaviour and the occupied exchange require qualification.',
  }
  return {
    schema: 'had-condensate-result/1' as const,
    status: failures.length ? 'blocked-geometry' as const : 'within-screened-geometry' as const,
    source: { planDigest: request.planDigest, bindingDigest: request.bindingDigest,
      caseDigest: sha256SemanticFingerprint(request), nativeReplay },
    method: { id: 'HAD-GROUND-WC-CONDENSATE/1', path: methodPath, gitBlob: binding.identities[methodPath],
      calls: ['serviceApertures', 'headMaintenance', 'pathSeparation', 'scheduleText'] as const },
    calculation: { ...result.fit, roomToolMm: round(result.fit.roomToolMm),
      route: result.port.route, port: { id: portId, point: result.port.point, formedDiameterMm: 2 * result.port.radius,
        weatherFaceWidthMm: result.port.faceWidth } },
    drawing: section(result, request.bindingDigest),
    trialSchedule: failures.length ? null : schedule,
    diagnostics: [...failures, physical],
  }
}
