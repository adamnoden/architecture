import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/rc_portal_monolithic.py'
const adapterPath = 'compiler/reference-house/current-design/structural-rc-floor.ts'
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const exact = (value: unknown, keys: readonly string[], label: string): Record<string, unknown> => {
  if (!record(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Expected exact ${label} fields without derived sources or approvals`)
  }
  return value
}
const same = (left: unknown, right: unknown) => sha256SemanticFingerprint(left) === sha256SemanticFingerprint(right)
const comparisonFields = ['schema', 'sourceSHA256', 'houseCase', 'jointMode', 'waterControl', 'barGeometry', 'use'] as const
const portalFields = ['gridLaw', 'frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm'] as const
const contactFields = ['portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder', 'portalDPCNormalSubdivisions', 'portalDPCInsetMm'] as const
export const joinedRcFloorStageFields = ['caseId', 'portal', 'geometry', ...contactFields,
  'coreAxialWidthMm', 'northUpstandWidthMm', 'physicalGFactor', 'includeExternalGMAXQ'] as const
type Bound = Record<string, unknown> & { sourceSHA256: Readonly<Record<string, string>> }
type Joined = Bound & { portal: Bound; floor: Bound }
type NativeCase = Bound & { houseCase: Bound & { joinedCase: Joined; boundary: Record<string, unknown> } }
type Six = readonly [number, number, number, number, number, number]
type NativeResult = {
  schema: string
  sourceSHA256: Readonly<Record<string, string>>
  request: unknown
  native: { heads: readonly { id: string; reactionKN_KNm: Six }[]; equilibriumResidualKN_KNm: Six;
    monolithicRCBridgeMembers: readonly Record<string, unknown>[]; barrierDuties: readonly Record<string, unknown>[]; [key: string]: unknown }
  schedule: Readonly<Record<string, unknown>>
  floor: Readonly<Record<string, unknown>>
  diagnostics: readonly unknown[]
  drawings: { 'floor.svg': string; 'barrier.svg': string }
  unresolvedReceivingPorts: readonly { id: string }[]
  completeReceivingPaths: number
  candidateAccepted: boolean
  installedAcceptance: boolean
  roofAdoption: boolean
  completeHouseProof: boolean
  waterControlAccepted: boolean
  thermalAccepted: boolean
  ownerAppearanceApproval: boolean
}

function currentBinding(resolved: CurrentDesignResolution) {
  if (resolved.design.source.kind !== 'georgian-layout-revision'
    || !resolved.disciplineBindings.some(binding => binding.id === 'str-conditional-interface')) {
    throw new Error('The joined RC floor requires the admitted current structural source')
  }
  const comparison = exact(JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'],
    { encoding: 'utf8' })), comparisonFields, 'native joined RC floor') as NativeCase
  if (comparison.schema !== 'str-monolithic-rc-portal-case/1' || !record(comparison.sourceSHA256)
    || Object.keys(comparison.sourceSHA256).length !== 30 || !record(comparison.houseCase)
    || !record(comparison.houseCase.joinedCase) || !record(comparison.houseCase.joinedCase.portal)
    || !record(comparison.houseCase.joinedCase.floor)) {
    throw new Error('The joined RC floor native source inventory or schema changed; integrate it explicitly')
  }
  const inputs = Object.fromEntries([...Object.keys(comparison.sourceSHA256), adapterPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    const owners = resolved.disciplineBindings.flatMap(binding => binding.identities[path] ? [binding.identities[path]] : [])
    if (!owners.length || owners.some(value => value !== blob)
      || (path !== adapterPath && comparison.sourceSHA256[path] !== createHash('sha256').update(bytes).digest('hex'))) {
      throw new Error(`Stale or missing current joined RC floor source: ${path}`)
    }
    return [path, blob]
  }))
  const grid: { heads: readonly { id: string }[] } = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8'))
  const headIds = grid.heads.map(head => head.id)
  if (headIds.length !== 52 || new Set(headIds).size !== 52) throw new Error('The joined RC floor requires the actual 52 named heads')
  return { comparison, inputs, headIds, planDigest: sha256SemanticFingerprint(resolved.design),
    bindingDigest: sha256SemanticFingerprint({ disciplines: resolved.disciplineBindings, inputs }) }
}

export function readJoinedRcFloorCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return { schema: 'str-current-rc-floor-request/1' as const, design: resolved.design,
    joined: { schema: 'str-current-rc-floor-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison, caseId: 'RC-CONTINUOUS-REFERENCE' } }
}

export function savedJoinedRcFloorCase(request: ReturnType<typeof readJoinedRcFloorCase>['joined'],
  settings: Readonly<Record<string, unknown>>, sharedFloor: unknown) {
  if (!record(sharedFloor)) throw new Error('The joined RC floor requires the explicit shared distributed-floor stage')
  if (Object.keys(settings).some(key => !(joinedRcFloorStageFields as readonly string[]).includes(key))) {
    throw new Error('Joined RC floor settings cannot supply another floor, sources or derived approval')
  }
  const portal = settings.portal ?? {}
  if (!record(portal) || Object.keys(portal).some(key => !(portalFields as readonly string[]).includes(key))) {
    throw new Error('Joined RC portal settings accept only authored laws and section controls')
  }
  const house = request.comparison.houseCase
  const joined = house.joinedCase
  return { ...request, caseId: settings.caseId ?? request.caseId,
    comparison: { ...request.comparison, houseCase: { ...house,
      coreAxialWidthMm: settings.coreAxialWidthMm ?? house.coreAxialWidthMm,
      northUpstandWidthMm: settings.northUpstandWidthMm ?? house.northUpstandWidthMm,
      boundary: { ...house.boundary,
        physicalGFactor: settings.physicalGFactor ?? house.boundary.physicalGFactor,
        includeExternalGMAXQ: settings.includeExternalGMAXQ ?? house.boundary.includeExternalGMAXQ },
      joinedCase: { ...joined, ...Object.fromEntries(contactFields.filter(key => Object.hasOwn(settings, key)).map(key => [key, settings[key]])),
        geometry: settings.geometry ?? joined.geometry, portal: { ...joined.portal, ...portal }, floor: sharedFloor } } } }
}

export function runJoinedRcFloorCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  const request = exact(input, ['schema', 'planDigest', 'bindingDigest', 'comparison', 'caseId'], 'current joined RC floor case')
  if (request.schema !== 'str-current-rc-floor-case/1' || request.planDigest !== current.planDigest
    || request.bindingDigest !== current.bindingDigest) throw new Error('Stale joined RC floor design or method binding')
  const comparison = exact(request.comparison, comparisonFields, 'native joined RC comparison')
  for (const key of ['sourceSHA256', 'schema', 'jointMode', 'waterControl', 'barGeometry', 'use']) {
    if (!same(comparison[key], current.comparison[key])) throw new Error('The joined RC floor cannot replace its source identity or proof scope')
  }
  if (typeof request.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(request.caseId)) {
    throw new Error('The joined RC floor requires a stable case ID')
  }
  const house = comparison.houseCase
  if (!record(house) || !record(house.joinedCase)) throw new Error('The joined RC house and floor are unavailable')
  const joined = house.joinedCase
  for (const [actual, expected] of [[house, current.comparison.houseCase], [joined, current.comparison.houseCase.joinedCase],
    [joined.portal, current.comparison.houseCase.joinedCase.portal], [joined.floor, current.comparison.houseCase.joinedCase.floor]]) {
    if (!record(actual) || !record(expected) || !same(actual.sourceSHA256, expected.sourceSHA256)) {
      throw new Error('The joined RC floor cannot replace nested source identities')
    }
  }
  const output: NativeResult = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ case: comparison, name: request.caseId }), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  const six = (value: unknown): value is Six => Array.isArray(value) && value.length === 6
    && value.every(component => typeof component === 'number' && Number.isFinite(component))
  const receiving = current.comparison.houseCase.joinedCase.floor.receivingLaws
  if (!record(receiving) || !record(receiving.intermediateSupports)) throw new Error('The actual intermediate receiving catalogue is unavailable')
  const receivingIds = Object.keys(receiving.intermediateSupports)
  if (output.schema !== 'str-monolithic-rc-portal-result/1' || !same(output.sourceSHA256, current.comparison.sourceSHA256)
    || !same(output.request, comparison) || output.native?.caseId !== request.caseId
    || output.candidateAccepted !== false || output.installedAcceptance !== false || output.roofAdoption !== false
    || output.completeHouseProof !== false || output.waterControlAccepted !== false || output.thermalAccepted !== false
    || output.ownerAppearanceApproval !== false || output.completeReceivingPaths !== 0
    || !Array.isArray(output.native?.heads) || output.native.heads.length !== 52
    || new Set(output.native.heads.map(head => head.id)).size !== 52
    || current.headIds.some(id => !output.native.heads.some(head => head.id === id))
    || output.native.heads.some(head => !six(head.reactionKN_KNm)) || !six(output.native.equilibriumResidualKN_KNm)
    || !Array.isArray(output.native.monolithicRCBridgeMembers) || output.native.monolithicRCBridgeMembers.length !== 4
    || !Array.isArray(output.native.barrierDuties) || output.native.barrierDuties.length !== 4
    || !Array.isArray(output.unresolvedReceivingPorts) || output.unresolvedReceivingPorts.length !== receivingIds.length
    || new Set(output.unresolvedReceivingPorts.map(port => port.id)).size !== receivingIds.length
    || receivingIds.some(id => !output.unresolvedReceivingPorts.some(port => port.id === id))
    || !output.drawings?.['floor.svg']?.startsWith('<svg') || !output.drawings?.['barrier.svg']?.startsWith('<svg')) {
    throw new Error('The joined RC floor result differs from the actual source, heads or unearned acceptance boundary')
  }
  return { status: 'computed-comparison' as const,
    source: { planDigest: current.planDigest, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(request) },
    method: { id: 'str-current-joined-rc-floor/1', path: methodPath, inputs: current.inputs },
    native: output.native, schedule: output.schedule, floor: output.floor, floorSvg: output.drawings['floor.svg'], barrierSvg: output.drawings['barrier.svg'],
    unresolvedReceivingPorts: output.unresolvedReceivingPorts, diagnostics: output.diagnostics,
    evidence: { state: 'unqualified-joined-rc-floor-comparison' as const, installedAcceptance: false as const,
      candidateAccepted: false as const, completeHouseProof: false as const,
      scope: 'Actual native floor pressure and open-portal load replacement, 290/200 RC candidate, four finite 20mm RC continuity members and 52 heads. This source0-ground diagnostic is not the raised ground/service candidate. Actual barrier material, four rod seals, thermal/moisture continuity, developed reinforcement, local load introduction, L ties, full gravity/vertical slab and roof remain unqualified.' } }
}
