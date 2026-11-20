import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { exactSegmentBoxDistance, finiteBends } from '../../../project/had/studies/incoming-water-geometry.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createSectionPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './inlet-sill-insert.js'
import type { CurrentDesignResolution } from './resolve.js'

const root = 'project/had/studies/'
const geometryPath = root + 'incoming-water-geometry.mjs'
const underSillPath = root + 'south-inlet-under-sill.json'
const cellsPath = root + 'south-inlet-wet-box.json'
const reliefPath = root + 'south-inlet-relief.json'
const servicesPath = root + 'current-house-services.json'
const washerPath = 'project/ias/studies/utility-first-release.json'
const nativeMethodPath = root + 'south-inlet-wet-box.mjs'
const branchIds = ['utility', 'plant'] as const
type BranchId = typeof branchIds[number]
type Point = readonly [number, number, number]
type Rect = readonly [number, number, number, number]
type Box = readonly [number, number, number, number, number, number]
type Cell = {
  readonly id: BranchId
  readonly case: { plan: readonly (readonly [number, number])[]; sideLimitsX: readonly [number, number]; frontY: number; roofZ: number; permanentLowerTroughLipZ: number }
  readonly baffle: { x: readonly [number, number]; y: readonly [number, number] }
  readonly access: {
    splitCollarODMM: number; originalFixedFrontRailAfterSettingMM: number
    upperCutZ: number; requiredDrawMM: number; outsideRelease: Point; parkedRiserY: number
    releasedSpoolOutline: { x: readonly [number, number]; radiusBeforeBulkhead: number }
  }
}
const readiness = ['endsIsolatedAndDrained', 'connectionsDisengaged', 'subjectFrontAndTargetRemoved',
  'siblingClosureRetained', 'occupiedAndElectricalAccessExcluded'] as const
type RemovalCase = {
  readonly schema: 'had-inlet-removal-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly insertCaseDigest: string
  readonly branch: BranchId
  readonly drawMm: number
  readonly roofAccess: 'split-collar' | 'clear-strip-comparison'
  readonly washer: 'installed' | 'restrained-first-rest'
  readonly utilityTaperRemoved: boolean | null
  readonly preparation: Readonly<Record<typeof readiness[number], boolean>>
}
const fabricationSettingMm = 5
const clearanceSettingMm = 10
const round = (value: number) => Number(value.toFixed(4))
const records = (value: unknown, keys: readonly string[]): value is Readonly<Record<string, unknown>> =>
  !!value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))

function readReference(resolved: CurrentDesignResolution, insertCase?: unknown) {
  const binding = resolved.disciplineBindings.find(entry => entry.id === 'had-inlet-south-removal')
  if (!binding) throw new Error('The south inlet removal requires an applicable HAD inlet and utility layout')
  const paths = [geometryPath, underSillPath, cellsPath, reliefPath, servicesPath, nativeMethodPath, washerPath]
  const observed = new Map(paths.map(path => {
    const bytes = readFileSync(new URL('../../../' + path, import.meta.url))
    const gitBlob = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
    if (gitBlob !== binding.identities[path]) throw new Error('Stale south inlet removal source: ' + path)
    return [path, { bytes, gitBlob }]
  }))
  const json = <T>(path: string): T => JSON.parse(observed.get(path)!.bytes.toString('utf8'))
  const insert = runInletSillInsertCase(resolved, insertCase === undefined ? readInletSillInsertCase(resolved).insert : insertCase)
  if (insert.status !== 'within-conditional-screen') {
    throw new Error(`The selected sill insert blocks carrier removal: ${insert.diagnostics.map(item => item.code).join(', ')}`)
  }
  const underSill = json<{ branches: { id: BranchId; coordinates: Point[] }[] }>(underSillPath)
  const cells = json<{ branches: Cell[] }>(cellsPath)
  const { throughWallRupture: { preferredWideBore: sleeve } } = json<{
    throughWallRupture: { preferredWideBore: { cleanBoreMM: number; carrierEnvelopeODMM: number } }
  }>(reliefPath)
  const { utility, selectedServiceInterfaces } = json<{
    utility: { washer: Rect; washerFirstRest: Rect }
    selectedServiceInterfaces?: { purge: { room: string; body: readonly [number, number]; bodyRadiusMM: number }[] }
  }>(servicesPath)
  const { native: washer } = json<{ native: { width: number; closedDepth: number; height: number } }>(washerPath)
  if (![washer.width, washer.closedDepth, washer.height].every(value => Number.isFinite(value) && value > 0) ||
      [utility.washer, utility.washerFirstRest].some(([, , width, depth]) => width !== washer.width || depth !== washer.closedDepth)) {
    throw new Error('The HAD washer placements no longer match the bound IAS release envelope')
  }
  const branches = branchIds.map((id, index) => {
    const native = underSill.branches.find(branch => branch.id === id)
    const cell = cells.branches.find(branch => branch.id === id)
    const upper = insert.calculation.bores.find(bore => bore.id === id + '-pressure')
    const vent = insert.calculation.vents[index]
    if (!native || !cell || !upper || !vent || native.coordinates.length < 4 || sleeve.cleanBoreMM >= upper.formedReserveODMM) {
      throw new Error('Missing south inlet removal geometry for ' + id)
    }
    const [outer, inner] = upper.axis
    const { access } = cell
    const riserY = access.parkedRiserY - access.requiredDrawMM
    const wallPoint = native.coordinates[1]
    const [west, east] = access.releasedSpoolOutline.x
    const bareRadiusMm = access.releasedSpoolOutline.radiusBeforeBulkhead
    if (wallPoint[0] !== inner[0] || wallPoint[1] !== inner[1] || access.outsideRelease[0] !== inner[0] ||
        west + east !== 2 * inner[0] || bareRadiusMm * 2 !== sleeve.carrierEnvelopeODMM) {
      throw new Error('The released carrier no longer matches the conditional sleeve for ' + id)
    }
    const jacketRadiusMm = (east - west) / 2
    const cut = [inner[0], riserY, access.upperCutZ] as const
    const elbow = [inner[0], riserY, wallPoint[2]] as const
    const jacket = finiteBends([wallPoint, elbow, cut])
    return { id, cell, cut, jacket, jacketRadiusMm, bareRadiusMm, wallPoint, outer, inner, vent }
  })
  const preparation = Object.fromEntries(readiness.map(key => [key, true])) as RemovalCase['preparation']
  const cases = branches.map(({ id, cell }): RemovalCase => ({
    schema: 'had-inlet-removal-case/1', planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest, insertCaseDigest: insert.source.caseDigest, branch: id,
    drawMm: cell.access.requiredDrawMM, roofAccess: 'split-collar', washer: 'restrained-first-rest',
    utilityTaperRemoved: id === 'utility' ? true : null, preparation,
  }))
  const method = { id: 'HAD-SOUTH-INLET-REMOVAL/1', gitBlob: binding.identities['compiler/reference-house/current-design/inlet-removal.ts'],
    inputs: Object.fromEntries([...observed].map(([path, file]) => [path, file.gitBlob])) }
  return { cases, branches, method, utility, washer, sleeve, host: insert.host,
    utilityPurge: selectedServiceInterfaces?.purge.find(entry => entry.room === 'utility') }
}

export function readInletRemovalCases(resolved: CurrentDesignResolution, insertCase?: unknown) {
  return readReference(resolved, insertCase).cases.map(removal => ({
    schema: 'had-inlet-removal-request/1' as const, design: resolved.design, removal,
  }))
}

function sweptGap(path: readonly (readonly number[])[], box: Box, drawMm: number, radiusMm: number, arcErrorMm = 0) {
  const [x, y, z, width, depth, height] = box
  const inverse: Box = [x, y - drawMm, z, width, depth + drawMm, height]
  return round(Math.min(...path.slice(1).map((end, index) => exactSegmentBoxDistance(path[index], end, inverse)))
    - radiusMm - arcErrorMm)
}

function sleeveReserve(branch: ReturnType<typeof readReference>['branches'][number], drawMm: number, sleeveRadiusMm: number) {
  const { outer, inner, wallPoint, bareRadiusMm, cell: { access: { outsideRelease } } } = branch
  const [, insideY] = inner
  const [, outsideY] = outer
  const carrierSlope = (wallPoint[2] - outsideRelease[2]) / (insideY - outsideRelease[1])
  const sleeveSlope = (inner[2] - outer[2]) / (insideY - outsideY)
  const ys = [outsideRelease[1], wallPoint[1], outsideY, outsideY - drawMm, insideY - drawMm]
  const offsets = ys.flatMap(y => {
    if (y < outsideRelease[1] || y > insideY) return []
    const low = Math.max(0, outsideY - y)
    const high = Math.min(drawMm, insideY - y)
    if (low > high) return []
    return [low, high].map(move => Math.abs(outsideRelease[2] + (y - outsideRelease[1]) * carrierSlope -
      outer[2] - (y + move - outsideY) * sleeveSlope))
  })
  return round(sleeveRadiusMm - bareRadiusMm - fabricationSettingMm - Math.max(...offsets))
}

function section(branch: ReturnType<typeof readReference>['branches'][number], trial: RemovalCase, slot: readonly [number, number],
  caseDigest: string): DrawingSceneV2 {
  const { cell, jacket, wallPoint, cut } = branch
  const parked = (point: readonly number[]) => [point[0], point[1] + trial.drawMm, point[2]]
  const scaleDenominator = 10
  const verticalBounds = { min: cell.case.permanentLowerTroughLipZ - 30, max: cut[2] + 100 }
  const horizontalBounds = { min: cell.access.outsideRelease[1] - 30, max: cut[1] + cell.access.requiredDrawMM + 80 }
  const project = createSectionPaperProjection({ scaleDenominator, horizontalBounds, verticalBounds, paperOrigin: { x: 12, y: 12 } })
  const primitives: DrawingSceneV2['primitives'] = []
  const line = (id: string, y0: number, z0: number, y1: number, z1: number, role: 'primary' | 'secondary', dash?: 'provisional') => {
    primitives.push({ kind: 'line', id, role, dash, a: project.point(y0, z0), b: project.point(y1, z1),
      metadata: { caseDigest, fromYmm: y0, fromZmm: z0, toYmm: y1, toZmm: z1 } })
  }
  const path = [cell.access.outsideRelease, ...jacket.path]
  for (const [name, route] of [['released-carrier', path], ['parked-carrier', path.map(parked)]] as const) {
    for (const [index, [, y, z]] of route.slice(1).entries()) {
      const [, fromY, fromZ] = route[index]
      line(name + '-' + index, fromY, fromZ, y, z, name === 'parked-carrier' ? 'primary' : 'secondary')
    }
  }
  const { permanentLowerTroughLipZ: lip, frontY, roofZ } = cell.case
  line('retained-trough-upstand', wallPoint[1], lip, frontY, lip, 'primary')
  const comparisonOpen = trial.roofAccess === 'clear-strip-comparison'
  line('wet-box-roof', wallPoint[1], roofZ, comparisonOpen ? slot[0] : frontY, roofZ, 'secondary')
  if (comparisonOpen && slot[1] < frontY) line('retained-roof-front', slot[1], roofZ, frontY, roofZ, 'secondary')
  line('required-roof-strip', slot[0], roofZ, slot[1], roofZ, 'primary', 'provisional')
  return {
    viewId: 'HAD-SOUTH-INLET-REMOVAL-' + trial.branch.toUpperCase(), sourceId: 'south-inlet-' + trial.branch,
    title: 'South inlet carrier draw', description: 'Selected branch Y/Z section. Lines project the released and translated carrier and the required continuous roof opening.',
    scaleDenominator, widthMm: 24 + project.length(horizontalBounds.max - horizontalBounds.min),
    heightMm: 24 + project.length(verticalBounds.max - verticalBounds.min), primitives,
  }
}

export function runInletRemovalCase(resolved: CurrentDesignResolution, input: unknown, insertCase?: unknown) {
  const reference = readReference(resolved, insertCase)
  const matching = reference.cases.find(entry => records(input, Object.keys(entry)) && entry.branch === input.branch)
  if (!matching || !records(input, Object.keys(matching)) || input.schema !== matching.schema ||
      !records(input.preparation, readiness) || readiness.some(key => typeof (input.preparation as Record<string, unknown>)[key] !== 'boolean')) {
    throw new Error('Expected a versioned south inlet removal case for one branch')
  }
  if (input.planDigest !== matching.planDigest || input.bindingDigest !== matching.bindingDigest ||
      input.insertCaseDigest !== matching.insertCaseDigest) throw new Error('Stale south inlet removal source binding')
  if (typeof input.drawMm !== 'number' || !Number.isFinite(input.drawMm) || input.drawMm < 0 || input.drawMm > matching.drawMm ||
      (input.roofAccess !== 'split-collar' && input.roofAccess !== 'clear-strip-comparison') ||
      (input.washer !== 'installed' && input.washer !== 'restrained-first-rest') ||
      (matching.branch === 'utility' ? typeof input.utilityTaperRemoved !== 'boolean' : input.utilityTaperRemoved !== null)) {
    throw new Error('South inlet removal inputs exceed the screened state or draw range')
  }
  const trial = input as RemovalCase
  const branch = reference.branches.find(entry => entry.id === trial.branch)!
  const { cell, cut, jacket, jacketRadiusMm, bareRadiusMm, wallPoint, vent } = branch
  const { frontY, sideLimitsX, permanentLowerTroughLipZ: lip } = cell.case
  const exteriorRelease = cell.access.outsideRelease
  const [x, startY] = cut
  const [, innerY] = wallPoint
  const requiredHalfSlotMm = jacketRadiusMm + fabricationSettingMm
  const slot = [startY - requiredHalfSlotMm, Math.min(frontY, startY + trial.drawMm + requiredHalfSlotMm)] as const
  const collarTravelMm = cell.access.splitCollarODMM / 2 - requiredHalfSlotMm
  const washer = trial.washer === 'installed' ? reference.utility.washer : reference.utility.washerFirstRest
  const box: Box = [washer[0], washer[1], 0, washer[2], washer[3], reference.washer.height]
  const lipBox: Box = [sideLimitsX[0], innerY, lip, sideLimitsX[1] - sideLimitsX[0], frontY - innerY, 0]
  const combinedGap = (obstacle: Box) => Math.min(
    sweptGap(jacket.path, obstacle, trial.drawMm, jacketRadiusMm, jacket.hausdorffError),
    sweptGap([exteriorRelease, wallPoint], obstacle, trial.drawMm, bareRadiusMm))
  const calculation = {
    drawMm: trial.drawMm,
    wetBox: { sideLimitsXMm: sideLimitsX, frontYMm: frontY, planMm: cell.case.plan,
      innerVentAxisMm: vent.axis[1], formedVentDiameterMm: vent.outerDiameterMM,
      utilityClosureNeighbors: trial.branch === 'utility' ? {
        baffle: cell.baffle && { x: cell.baffle.x, y: cell.baffle.y },
        purge: reference.utilityPurge && { body: reference.utilityPurge.body, bodyRadiusMM: reference.utilityPurge.bodyRadiusMM },
      } : null },
    washerEnvelopeMm: box,
    settingsMm: { fabrication: fabricationSettingMm, access: clearanceSettingMm },
    exteriorTipPastInsideFaceMm: round(exteriorRelease[1] + trial.drawMm - innerY),
    washerGapAfterSettingMm: round(combinedGap(box) - clearanceSettingMm),
    troughGapAfterSettingMm: round(combinedGap(lipBox) - fabricationSettingMm),
    sleeveRadialReserveAfterSettingMm: sleeveReserve(branch, trial.drawMm, reference.sleeve.cleanBoreMM / 2),
    roofStrip: { xMm: [x - requiredHalfSlotMm, x + requiredHalfSlotMm] as const, yMm: slot, zMm: cell.case.roofZ,
      widthMm: 2 * requiredHalfSlotMm, lengthMm: round(slot[1] - slot[0]), splitCollarTravelMm: collarTravelMm,
      boundSplitCollarOutsideDiameterMm: cell.access.splitCollarODMM, jacketOutsideDiameterMm: 2 * jacketRadiusMm },
    dryBreak: { xMm: x, yMm: startY, zMm: cut[2], fixedCompanionRetreatMm: null, guideAndFirstRestQualified: false },
  }
  const diagnostics = [
    ...readiness.filter(key => !trial.preparation[key]).map(key => ({ code: 'PREPARATION_MISSING', objectId: key })),
    ...([
      ['WALL_TIP_NOT_RELEASED', calculation.exteriorTipPastInsideFaceMm <= 0],
      ['WASHER_FIRST_REST_REQUIRED', trial.washer !== 'restrained-first-rest'],
      ['WASHER_SWEEP_INTERFERENCE', calculation.washerGapAfterSettingMm < 0],
      ['TROUGH_SWEEP_INTERFERENCE', calculation.troughGapAfterSettingMm < 0],
      ['SLEEVE_SWEEP_INTERFERENCE', calculation.sleeveRadialReserveAfterSettingMm < 0],
      ['FIXED_UTILITY_TAPER_INTERFERENCE', trial.branch === 'utility' && !trial.utilityTaperRemoved &&
        cell.access.originalFixedFrontRailAfterSettingMM < 0],
      ['ROOF_STRIP_REQUIRED', trial.roofAccess === 'split-collar' && trial.drawMm > collarTravelMm],
    ] as const).flatMap(([code, blocked]) => blocked ? [{ code, objectId: 'south-inlet-' + trial.branch }] : []),
  ]
  const caseDigest = sha256SemanticFingerprint(trial)
  return {
    schema: 'had-inlet-removal-result/1' as const, branch: trial.branch,
    status: diagnostics.length ? 'blocked' as const : 'within-conditional-draw-screen' as const,
    source: { planDigest: trial.planDigest, bindingDigest: trial.bindingDigest, insertCaseDigest: trial.insertCaseDigest, caseDigest },
    host: reference.host, method: reference.method, calculation, diagnostics, drawing: section(branch, trial, slot, caseDigest),
    evidence: { preparation: 'declared-scenario-only', installedRelease: 'unavailable',
      retainedClosureAndRoofStrip: 'unqualified', supportedDrawAndFirstRest: 'unqualified' },
  }
}
