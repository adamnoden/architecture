import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import type { savedUpperRoofBearingCase } from './structural-upper-bearing.js'
import { readFloorSectionCuts, recoverFloorSectionCuts, type FloorBendingField } from './structural-floor-cuts.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/floor_section_model.py'
const adapterPath = 'compiler/reference-house/current-design/structural-floor-section.ts'
const cutsPath = 'compiler/reference-house/current-design/structural-floor-cuts.ts'
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const six = (v: unknown): v is number[] => Array.isArray(v) && v.length === 6 && v.every(finite)
export const floorSectionStageFields = ['thicknessMm', 'wetSupport', 'sectionCuts'] as const

/** Inspect declared source centrelines; absent service envelopes never earn fit. */
export function inspectFloorServiceRoutes(routes: readonly (readonly (readonly number[])[])[], cells: readonly (readonly number[])[], soffit: number, top: number,
  additionalSolids: readonly { readonly id: string; readonly boxXYZMm: readonly number[] }[] = []) {
  if (!Array.isArray(routes) || !Array.isArray(cells) || !cells.length || !finite(soffit) || !finite(top) || top <= soffit
    || cells.some(r => !Array.isArray(r) || r.length !== 4 || r.some(v => !finite(v)) || r[2]! <= r[0]! || r[3]! <= r[1]!)) {
    throw new Error('Unsupported actual floor material or declared service geometry')
  }
  const clip = (p: readonly number[], q: readonly number[], box: readonly number[]) => {
    let lo = 0, hi = 1
    for (let a = 0; a < 3; a++) {
      const d = q[a]! - p[a]!
      if (d === 0) { if (p[a]! < box[a]! || p[a]! > box[a+3]!) return undefined }
      else {
        const ends = [(box[a]! - p[a]!) / d, (box[a+3]! - p[a]!) / d].sort((a, b) => a-b)
        lo = Math.max(lo, ends[0]!); hi = Math.min(hi, ends[1]!)
      }
    }
    return hi-lo > 1e-10 ? [lo, hi] as const : undefined
  }
  const conflicts: { routeIndex: number; segmentIndex: number; intervalXYZMm: number[][]; preExistingAt200Mm: boolean }[] = []
  if (!Array.isArray(additionalSolids) || new Set(additionalSolids.map(row => row.id)).size !== additionalSolids.length
    || additionalSolids.some(row => typeof row.id !== 'string' || !row.id || !Array.isArray(row.boxXYZMm) || row.boxXYZMm.length !== 6
      || row.boxXYZMm.some((v: unknown) => !finite(v)) || [0,1,2].some(a => row.boxXYZMm[a+3]! <= row.boxXYZMm[a]!))) throw new Error('Unsupported additional structural material solids')
  const additionalMaterialConflicts: { routeIndex: number; segmentIndex: number; solidId: string; intervalXYZMm: number[][] }[] = []
  routes.forEach((route: readonly (readonly number[])[], routeIndex: number) => {
    if (!Array.isArray(route) || route.some((p: readonly number[]) => !Array.isArray(p) || p.length !== 3 || p.some((v: number) => !finite(v)))) throw new Error('Unsupported declared service route geometry')
    for (let segmentIndex = 0; segmentIndex < route.length-1; segmentIndex++) {
      const p: readonly number[] = route[segmentIndex]!, q: readonly number[] = route[segmentIndex+1]!
      if (p.every((v, a) => v === q[a])) continue
      for (const solid of additionalSolids) {
        const interval = clip(p, q, solid.boxXYZMm)
        if (interval) additionalMaterialConflicts.push({ routeIndex, segmentIndex, solidId: solid.id,
          intervalXYZMm: interval.map(t => p.map((v,a) => v+t*(q[a]!-v))) })
      }
      const ranges = cells.flatMap(r => {
        const interval = clip(p, q, [r[0]!, r[1]!, soffit, r[2]!, r[3]!, top])
        return interval ? [interval] : []
      }).sort((a, b) => a[0]-b[0])
      const merged: number[][] = []
      for (const [lo, hi] of ranges) {
        const last = merged.at(-1)
        if (last && lo <= last[1]!+1e-10) last[1] = Math.max(last[1]!, hi)
        else merged.push([lo, hi])
      }
      for (const interval of merged) {
        const at = (t: number) => p.map((v, a) => v + t*(q[a]!-v))
        const before = cells.some(r => {
          const old = clip(p, q, [r[0]!, r[1]!, soffit, r[2]!, r[3]!, Math.min(top, 3370)])
          return old && Math.min(old[1], interval[1]!) - Math.max(old[0], interval[0]!) > 1e-10
        })
        conflicts.push({ routeIndex, segmentIndex, intervalXYZMm: [at(interval[0]!), at(interval[1]!)], preExistingAt200Mm: before })
      }
    }
  })
  return { schema: 'str-declared-floor-service-intersection/1' as const, conflicts, additionalMaterialConflicts,
    additionalStructuralSolids: additionalSolids,
    completeServiceEnvelopesAvailable: false as const, serviceFitAccepted: false as const,
    scope: 'Source centrelines against actual known-domain plate cells and explicitly supplied beam/post solids. No tube, insulation, support, sleeve, fire or removal envelope is inferred; no hole is added.' }
}
type NativeCase = Record<string, unknown> & { sourceSHA256: Record<string, string>; bearingCase: unknown }
type NativeResult = {
  schema: string; sourceSHA256: Record<string, string>; request: unknown
  nativeVertical: { native: { caseId: string; heads: { id: string; reactionKN_KNm: number[] }[]; equilibriumResidualKN_KNm: number[] }; [key: string]: unknown }
  floorSection: { thicknessMm: number; topZMm: number; midplaneZMm: number; sourceGravityResidualKN_KNm: number[]; sourcePressureResidualKN_KNm: number[]; sourceUpperMaterialResidualKN_KNm: number[]; [key: string]: unknown }
  drawings: Record<string, string>; [key: string]: unknown
}

function currentBinding(resolved: CurrentDesignResolution) {
  const owner = resolved.disciplineBindings.find(row => row.id === 'str-masonry-frame-comparison')
  if (resolved.design.source.kind !== 'georgian-layout-revision' || !owner) throw new Error('Floor section requires the admitted current masonry-frame source')
  const comparison = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })) as NativeCase
  if (comparison.schema !== 'str-coupled-floor-section-case/1' || !record(comparison.sourceSHA256)
    || Object.keys(comparison.sourceSHA256).length !== 57) throw new Error('Floor-section source contract changed; integrate explicitly')
  const inputs = Object.fromEntries([...Object.keys(comparison.sourceSHA256), adapterPath, cutsPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (owner.identities[path] !== blob || (Object.hasOwn(comparison.sourceSHA256, path)
      && comparison.sourceSHA256[path] !== createHash('sha256').update(bytes).digest('hex'))) throw new Error(`Stale or missing floor-section source: ${path}`)
    return [path, blob]
  }))
  return { comparison, inputs, planDigest: sha256SemanticFingerprint(resolved.design), bindingDigest: sha256SemanticFingerprint({ owner, inputs }) }
}

export function readFloorSectionCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return { schema: 'str-current-floor-section-request/1' as const, design: resolved.design,
    section: { schema: 'str-current-floor-section-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison, sectionCuts: [], caseId: 'FLOOR-SECTION' } }
}

/** A section edit reuses the sole saved floor, frame, roof and seat inputs. */
export function savedFloorSectionCase(request: ReturnType<typeof readFloorSectionCase>['section'],
  settings: Readonly<Record<string, unknown>>, upper: ReturnType<typeof savedUpperRoofBearingCase>) {
  if (Object.keys(settings).some(key => !(floorSectionStageFields as readonly string[]).includes(key))
    || !finite(settings.thicknessMm) || settings.thicknessMm < 200 || settings.thicknessMm > 250
    || (settings.wetSupport !== undefined && settings.wetSupport !== null && !record(settings.wetSupport))) {
    throw new Error('Explicit finite floor-section thickness 200..250 mm required; no duplicate floor or derived approval')
  }
  return { ...request, caseId: upper.caseId, sectionCuts: readFloorSectionCuts(settings.sectionCuts ?? []),
    comparison: { ...request.comparison, bearingCase: upper.comparison, thicknessMm: settings.thicknessMm, wetSupport: settings.wetSupport ?? null } }
}

export function runFloorSectionCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  if (!record(input) || !same(Object.keys(input).sort(), ['schema', 'planDigest', 'bindingDigest', 'comparison', 'sectionCuts', 'caseId'].sort())
    || input.schema !== 'str-current-floor-section-case/1' || input.planDigest !== current.planDigest || input.bindingDigest !== current.bindingDigest
    || !record(input.comparison) || !same(Object.keys(input.comparison).sort(), Object.keys(current.comparison).sort())
    || !same(input.comparison.sourceSHA256, current.comparison.sourceSHA256) || input.comparison.schema !== current.comparison.schema
    || input.comparison.use !== current.comparison.use || typeof input.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(input.caseId)) {
    throw new Error('Stale or malformed floor-section request or binding')
  }
  const sectionCuts = readFloorSectionCuts(input.sectionCuts)
  const output = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ case: input.comparison, name: input.caseId }), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  })) as NativeResult
  const vertical = output.nativeVertical, section = output.floorSection
  const grid = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8')) as { heads: { id: string }[] }
  if (output.schema !== 'str-coupled-floor-section-result/1' || !same(output.sourceSHA256, current.comparison.sourceSHA256)
    || !same(output.request, input.comparison) || !record(vertical) || !record(vertical.native) || vertical.native.caseId !== input.caseId
    || !Array.isArray(vertical.native.heads) || vertical.native.heads.length !== 52 || new Set(vertical.native.heads.map(h => h.id)).size !== 52
    || grid.heads.some(row => !vertical.native.heads.some(h => h.id === row.id)) || vertical.native.heads.some(h => !six(h.reactionKN_KNm))
    || !six(vertical.native.equilibriumResidualKN_KNm) || vertical.native.equilibriumResidualKN_KNm.some(v => Math.abs(v) > 1e-5)
    || !record(section) || section.thicknessMm !== input.comparison.thicknessMm || section.topZMm !== 3170 + section.thicknessMm
    || section.midplaneZMm !== 3170 + section.thicknessMm / 2
    || [section.sourceGravityResidualKN_KNm, section.sourcePressureResidualKN_KNm, section.sourceUpperMaterialResidualKN_KNm].some(row => !six(row) || row.some(v => Math.abs(v) > 1e-6))
    || output.candidateAccepted !== false || output.completeHouseProof !== false
    || !record(output.drawings) || !output.drawings['floor-section-floor.svg']?.startsWith('<svg')) {
    throw new Error('Floor-section result lost current source, actual datums, 52-head balance or explicit proof limits')
  }
  const wet = output.seatedWetSupport
  if (input.comparison.wetSupport !== null && input.comparison.wetSupport !== undefined) {
    if (!record(wet) || !same(wet.settings, input.comparison.wetSupport)
      || wet.physicalAcceptance !== false || wet.candidateAccepted !== false
      || wet.momentFixityAtBearingsCredited !== false || wet.frictionOrHorizontalBearingRestraintCredited !== false
      || wet.beamCageAccepted !== false || wet.columnCageAccepted !== false
      || wet.padMaterialAndRotationAccepted !== false || wet.localGridCapJointAccepted !== false
      || !record(wet.plateAttachmentAudit) || wet.plateAttachmentAudit.allPlateAttachmentsAtRealBeamNodes !== true
      || wet.plateAttachmentAudit.physicalBeamElementCutsAvailable !== true || wet.plateAttachmentAudit.completePhysicalBeamDemandEnvelopeAvailable !== false
      || !Array.isArray(wet.plateAttachmentAudit.missingAttachmentCoordinatesYMm) || wet.plateAttachmentAudit.missingAttachmentCoordinatesYMm.length !== 0
      || !six(wet.sourceMaterialWrenchResidualKN_KNm) || wet.sourceMaterialWrenchResidualKN_KNm.some(v => Math.abs(v) > 1e-6)
      || !Array.isArray(wet.posts) || wet.posts.length !== 2 || !Array.isArray(wet.contactFibres) || wet.contactFibres.length < 8
      || wet.contactFibres.some((row: unknown) => !record(row) || !finite(row.normalCompressionKN) || row.normalCompressionKN < -1e-7)
      || section.finishStairServiceEvidenceApplicable !== false) {
      throw new Error('Actual seated wet support lost authored geometry, source wrench, unilateral contact or explicit acceptance limits')
    }
  } else if (wet !== undefined) throw new Error('An unauthored wet support appeared in the current floor result')
  const services = JSON.parse(readFileSync(new URL('project/mat/studies/whole-house-service-baseline.json', root), 'utf8')) as {
    PV: { DCRequiredRoutes: number[][][] }
  }
  if (!record(services.PV) || !Array.isArray(services.PV.DCRequiredRoutes) || !record(vertical.plate)) {
    throw new Error('Missing actual PV route or physical floor material contract')
  }
  const additionalSolids: { id: string; boxXYZMm: number[] }[] = []
  if (record(wet)) {
    const settings = input.comparison.wetSupport as Record<string, unknown>
    const x = settings.beamAxisXMm as number, width = settings.beamWidthMm as number
    additionalSolids.push({ id: 'STR/wet-wall-support/beam', boxXYZMm: [x-width/2, settings.beamSouthEndYMm as number,
      (settings.beamTopZMm as number)-(settings.beamDepthMm as number), x+width/2, settings.beamNorthEndYMm as number, settings.beamTopZMm as number] })
    for (const [i, post] of (wet.posts as Record<string, unknown>[]).entries()) {
      const r = post.rectangleXYMm as number[]
      additionalSolids.push({ id: `STR/wet-wall-support/post/${i}`, boxXYZMm: [r[0]!,r[1]!,post.physicalBottomZMm as number,r[2]!,r[3]!,post.physicalTopZMm as number] })
    }
  }
  const servicePenetrations = { ...inspectFloorServiceRoutes(services.PV.DCRequiredRoutes,
    vertical.plate.cellsXYMm as number[][], 3170, section.topZMm, additionalSolids),
    sourcePath: 'project/mat/studies/whole-house-service-baseline.json', sourceObject: 'PV.DCRequiredRoutes' }
  return { status: 'computed-comparison' as const,
    source: { planDigest: current.planDigest, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(input) },
    method: { id: 'str-current-floor-section/1', path: methodPath, inputs: current.inputs },
    native: vertical.native, vertical, floorSection: section, upperMasonry: output.upperMasonry,
    mass: output.mass, plateBending: output.plateBending, sectionCuts: recoverFloorSectionCuts(output.plateBending as FloorBendingField, sectionCuts), floorReinforcement: output.floorReinforcement,
    roofCoupling: output.roofCoupling, ...(output.seatedWetSupport ? { seatedWetSupport: output.seatedWetSupport } : {}), drawings: output.drawings, floorSvg: output.drawings['floor-section-floor.svg'],
    servicePenetrations, diagnostics: output.diagnostics, evidence: { state: 'unselected-actual-section-replacement' as const,
      candidateAccepted: false as const, completeHouseProof: false as const, installedAcceptance: false as const,
      scope: 'Actual plate and membrane reassembly, work maps, upper body starts, self-weight and recovery at the authored thickness. Finish, FFL, stairs, services, aerodynamic tributaries, local stress convergence, reinforcement and joints remain unqualified.' } }
}
