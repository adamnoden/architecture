import {readFiniteFloorContourSettings} from './structural-finite-floor-contour-settings.js'
import { admitDesignSnapshot, type DesignSnapshot } from './snapshot.js'
import { sameEditBase, type EditBase } from './edit.js'
import { readFloorSectionCuts } from './structural-floor-cuts.js'
import { admitStudyLightingCase } from './assemblies/study-lighting-case.js'

/** Transport envelope only. The engineering compiler owns stage/source admission. */
export interface EngineeringDocument {
  readonly schema: 'current-engineering-document/1'
  readonly design: DesignSnapshot
  readonly bindings: Readonly<Record<string, unknown>>
  readonly stages: Readonly<Record<string, unknown>> & { readonly roofPitch: { readonly pitchDeg: number } }
}
interface History { readonly before: EngineeringDocument; readonly after: EngineeringDocument }
export interface EngineeringEditorState extends EditBase {
  readonly document: EngineeringDocument
  readonly undo: readonly History[]
  readonly redo: readonly History[]
}
export interface EngineeringTicket {
  readonly base: EditBase
  readonly requestId: string
  readonly documentJson: string
}
export const editableInletBankId='HAD/indoor-isolation-bank'
export const editableInletBankFields=['indoorBankXMm','indoorUtilityAxisZMm','indoorTailOffsetMm','indoorUtilityReturnXMm','indoorWesternReturnXMm','pipeJacketDensityComparisonKgM3','pipeInsulationDensityComparisonKgM3'] as const
export const editableRoofId = 'MAT/ring-roof-field'
export const editableFloorSectionId = 'STR/current-floor-section'
export const editableWetSupportId = 'STR/wet-wall-support'
export const editableWetCageId = 'STR/wet-wall-support/reinforcement'
export const editableStudyLightingId = 'IAS/STUDY/service-corner'
function record(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && Object.getPrototypeOf(input) === Object.prototype
}
function exact(input: unknown, keys: readonly string[]): input is Record<string, unknown> {
  return record(input) && Object.keys(input).length === keys.length && keys.every(key => Object.hasOwn(input, key))
}
function finiteJson(input: unknown): string {
  return JSON.stringify(input, (_key, value: unknown) => {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError('Engineering inputs must be finite')
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !record(value)) throw new TypeError('Expected plain JSON data')
    if (['undefined', 'function', 'symbol', 'bigint'].includes(typeof value)) throw new TypeError('Expected finite JSON data')
    return value
  })
}
/** Checks the editable envelope; only a successful shared compile admits its sources. */
export function readEngineeringEditDocument(input: unknown): EngineeringDocument {
  if (!exact(input, ['schema', 'design', 'bindings', 'stages']) || input.schema !== 'current-engineering-document/1'
      || !record(input.bindings) || !record(input.stages)) throw new TypeError('Expected the shared engineering document')
  const design = admitDesignSnapshot(input.design)
  if (design.source.kind !== 'georgian-layout-revision') throw new TypeError('Engineering edits retain the admitted current design basis')
  if (!exact(input.stages.roofPitch, ['pitchDeg']) || typeof input.stages.roofPitch.pitchDeg !== 'number'
      || !Number.isFinite(input.stages.roofPitch.pitchDeg)) throw new TypeError('The document needs an explicit finite roof pitch')
  return JSON.parse(finiteJson(input)) as EngineeringDocument
}
export function beginEngineeringEdit(document: unknown, sessionId: string): EngineeringEditorState {
  if (!sessionId.trim()) throw new TypeError('A distinct edit session is required')
  return { sessionId, revision: 0, document: readEngineeringEditDocument(document), undo: [], redo: [] }
}
export function saveEngineeringEdit(state: EngineeringEditorState): string { return finiteJson(state.document) }
export function engineeringBase(state: EditBase): EditBase { return { sessionId: state.sessionId, revision: state.revision } }
type EditResult = { readonly status: 'applied'; readonly state: EngineeringEditorState }
  | { readonly status: 'rejected'; readonly state: EngineeringEditorState; readonly message: string }
export function applyEngineeringEdit(state: EngineeringEditorState, transaction: unknown): EditResult {
  try {
    if (!exact(transaction, ['schema', 'units', 'base', 'operation']) || transaction.schema !== 'current-engineering-edit/1'
        || !exact(transaction.base, ['sessionId', 'revision'])
        || !sameEditBase(state, transaction.base as unknown as EditBase)) throw new TypeError('Invalid transaction or stale edit revision')
    const operation = transaction.operation
    let stages: EngineeringDocument['stages']
    if (record(operation) && operation.kind === 'set-roof-pitch') {
      if (transaction.units !== 'degrees' || !exact(operation, ['kind', 'roofId', 'pitchDeg'])
        || operation.roofId !== editableRoofId || typeof operation.pitchDeg !== 'number' || !Number.isFinite(operation.pitchDeg)) {
        throw new TypeError('Expected a finite pitch for MAT/ring-roof-field; unsupported fields are not edited')
      }
      if (operation.pitchDeg === state.document.stages.roofPitch.pitchDeg) return { status: 'applied', state }
      stages = { ...state.document.stages, roofPitch: { pitchDeg: operation.pitchDeg } }
    } else if(record(operation)&&operation.kind==='set-inlet-bank-field'){
      const current=state.document.stages.inletSourceEnvelope
      if(!exact(operation,['kind','assemblyId','inputId','value'])||operation.assemblyId!==editableInletBankId
        ||!record(current)||typeof operation.inputId!=='string'||!(editableInletBankFields as readonly string[]).includes(operation.inputId)
        ||typeof operation.value!=='number'||!Number.isFinite(operation.value)
        ||transaction.units!==(operation.inputId.endsWith('KgM3')?'kg/m3':'mm'))throw new TypeError('Expected one finite supported input on an existing explicit inlet stage')
      if(current[operation.inputId]===operation.value)return{status:'applied',state}
      stages={...state.document.stages,inletSourceEnvelope:{...current,[operation.inputId]:operation.value}}
    } else if (record(operation) && operation.kind === 'set-lighting-service-depth') {
      const current = state.document.stages.studyLighting
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'totalDepthMm'])
        || operation.assemblyId !== editableStudyLightingId || !record(current) || !record(state.document.stages.studyRoomKit)) {
        throw new TypeError('An existing explicit Study lighting and room-kit stage is required')
      }
      const choice = admitStudyLightingCase({ schema: 'ias-study-lighting-case/1', units: 'mm', ...current, serviceTotalDepthMm: operation.totalDepthMm })
      if (choice.serviceTotalDepthMm === current.serviceTotalDepthMm) return { status: 'applied', state }
      stages = { ...state.document.stages, studyLighting: { ...current, serviceTotalDepthMm: choice.serviceTotalDepthMm } }
    } else if(record(operation)&&operation.kind==='set-floor-contour-comparison') {
      const current=state.document.stages.floorSection
      if(transaction.units!=='mm'||!exact(operation,['kind','assemblyId','settings'])||operation.assemblyId!==editableFloorSectionId
        ||!record(current))throw new TypeError('Existing actual floor section and explicit finite contour controls required')
      const controls=readFiniteFloorContourSettings(operation.settings)
      if(JSON.stringify(current.contourComponent)===JSON.stringify(controls))return{status:'applied',state}
      stages={...state.document.stages,floorSection:{...current,contourComponent:controls}}
    } else if (record(operation) && operation.kind === 'set-floor-section-thickness') {
      const current = state.document.stages.floorSection
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'thicknessMm'])
        || operation.assemblyId !== editableFloorSectionId || typeof operation.thicknessMm !== 'number'
        || !Number.isFinite(operation.thicknessMm) || operation.thicknessMm < 200 || operation.thicknessMm > 250
        || !record(current) || Object.keys(current).some(key => !['thicknessMm', 'wetSupport', 'sectionCuts', 'cageComparison'].includes(key)) || typeof current.thicknessMm !== 'number'
        || (current.wetSupport !== undefined && current.wetSupport !== null && operation.thicknessMm !== 200)) {
        throw new TypeError('An existing explicit STR/current-floor-section with supported thickness 200..250 mm is required')
      }
      if (operation.thicknessMm === current.thicknessMm) return { status: 'applied', state }
      stages = { ...state.document.stages, floorSection: { ...current, thicknessMm: operation.thicknessMm } }
    } else if (record(operation) && operation.kind === 'set-floor-section-cut') {
      const current = state.document.stages.floorSection
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'cutId', 'positionMm', 'intervalMm'])
        || operation.assemblyId !== editableFloorSectionId || typeof operation.cutId !== 'string'
        || !record(current)) throw new TypeError('An existing authored floor section cut and explicit mm geometry are required')
      const cuts = readFloorSectionCuts(current.sectionCuts)
      const index = cuts.findIndex(cut => cut.id === operation.cutId)
      if (index < 0) throw new TypeError('Unknown floor section cut; a semantic edit cannot invent an assessment section')
      const changed = readFloorSectionCuts(cuts.map((cut,i) => i === index ? { ...cut, positionMm: operation.positionMm, intervalMm: operation.intervalMm } : cut))
      if (JSON.stringify(changed) === JSON.stringify(cuts)) return { status: 'applied', state }
      stages = { ...state.document.stages, floorSection: { ...current, sectionCuts: changed } }
    } else if (record(operation) && operation.kind === 'set-wet-cage-top-level') {
      const current = state.document.stages.floorSection
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'postTopLevelRaiseMm'])
        || operation.assemblyId !== editableWetCageId || typeof operation.postTopLevelRaiseMm !== 'number'
        || !Number.isFinite(operation.postTopLevelRaiseMm) || operation.postTopLevelRaiseMm < 0 || operation.postTopLevelRaiseMm > 20
        || !record(current) || current.thicknessMm !== 200 || !record(current.wetSupport) || !record(current.cageComparison)
        || current.cageComparison.schema !== 'str-wet-support-cage-comparison/1'
        || typeof current.cageComparison.postTopLevelRaiseMm !== 'number' || !Number.isFinite(current.cageComparison.postTopLevelRaiseMm)) {
        throw new TypeError('An existing explicit wet cage and top-level comparison0..20mm are required')
      }
      if (operation.postTopLevelRaiseMm === current.cageComparison.postTopLevelRaiseMm) return { status: 'applied', state }
      stages = { ...state.document.stages, floorSection: { ...current,
        cageComparison: { ...current.cageComparison, postTopLevelRaiseMm: operation.postTopLevelRaiseMm } } }
    } else if (record(operation) && operation.kind === 'set-wet-cage-hook-tail') {
      const current = state.document.stages.floorSection
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'linkHookTailMm'])
        || operation.assemblyId !== editableWetCageId || typeof operation.linkHookTailMm !== 'number'
        || !Number.isFinite(operation.linkHookTailMm) || operation.linkHookTailMm < 80 || operation.linkHookTailMm > 120
        || !record(current) || current.thicknessMm !== 200 || !record(current.wetSupport) || !record(current.cageComparison)
        || current.cageComparison.schema !== 'str-wet-support-cage-comparison/1'
        || typeof current.cageComparison.linkHookTailMm !== 'number' || !Number.isFinite(current.cageComparison.linkHookTailMm)) {
        throw new TypeError('An existing explicit STR/wet-wall-support/reinforcement comparison and hook tail80..120mm are required')
      }
      if (operation.linkHookTailMm === current.cageComparison.linkHookTailMm) return { status: 'applied', state }
      stages = { ...state.document.stages, floorSection: { ...current,
        cageComparison: { ...current.cageComparison, linkHookTailMm: operation.linkHookTailMm } } }
    } else if(record(operation)&&operation.kind==='set-wet-bearing-width') {
      const current=state.document.stages.floorSection
      if(transaction.units!=='mm'||!exact(operation,['kind','assemblyId','widthMm'])||operation.assemblyId!==editableWetSupportId
        ||typeof operation.widthMm!=='number'||!Number.isFinite(operation.widthMm)||operation.widthMm<=0
        ||!record(current)||current.thicknessMm!==200||!record(current.wetSupport))throw new TypeError('Explicit RC200 seated support and positive pad width in mm required')
      const support=current.wetSupport,rectangles=support.receiverRectanglesXYMm,tol=support.combinedRelativePlacementToleranceMm,axis=support.beamAxisXMm
      if(!Array.isArray(rectangles)||rectangles.length!==2||rectangles.some(r=>!Array.isArray(r)||r.length!==4||r.some(v=>typeof v!=='number'||!Number.isFinite(v)))
        ||typeof tol!=='number'||!Number.isFinite(tol)||tol<0||typeof axis!=='number'||!Number.isFinite(axis)
        ||typeof support.beamWidthMm!=='number'||!Number.isFinite(support.beamWidthMm)||support.beamWidthMm<=0
        ||typeof support.padWidthMm!=='number'||!Number.isFinite(support.padWidthMm))throw new TypeError('Actual finite beam/post/pad geometry required')
      const half=operation.widthMm/2+tol
      if(operation.widthMm+2*tol>support.beamWidthMm||rectangles.some(r=>axis-half<r[0]||axis+half>r[2]))throw new TypeError('Complete relative-placement pad envelope leaves actual beam or post')
      if(operation.widthMm===support.padWidthMm)return{status:'applied',state}
      stages={...state.document.stages,floorSection:{...current,wetSupport:{...support,padWidthMm:operation.widthMm}}}
    } else if (record(operation) && operation.kind === 'set-wet-bearing-offset') {
      const current = state.document.stages.floorSection
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'receiverId', 'offsetMm'])
        || operation.assemblyId !== editableWetSupportId || (operation.receiverId !== 'south' && operation.receiverId !== 'north')
        || typeof operation.offsetMm !== 'number' || !Number.isFinite(operation.offsetMm)
        || !record(current) || current.thicknessMm !== 200 || !record(current.wetSupport)) throw new TypeError('An explicit current RC200 seated wet support and finite pad offset in mm are required')
      const support = current.wetSupport, index = operation.receiverId === 'south' ? 0 : 1
      const rectangles = support.receiverRectanglesXYMm, offsets = support.padCentreOffsetsYMm
      if (!Array.isArray(rectangles) || rectangles.length !== 2 || !Array.isArray(rectangles[index])
        || rectangles[index].length !== 4 || !rectangles[index].every((v: unknown) => typeof v === 'number' && Number.isFinite(v))
        || !Array.isArray(offsets) || offsets.length !== 2 || !offsets.every(v => typeof v === 'number' && Number.isFinite(v))
        || typeof support.padLengthMm !== 'number' || !Number.isFinite(support.padLengthMm) || support.padLengthMm <= 0
        || typeof support.combinedRelativePlacementToleranceMm !== 'number' || !Number.isFinite(support.combinedRelativePlacementToleranceMm) || support.combinedRelativePlacementToleranceMm < 0) throw new TypeError('Actual finite pad and source post geometry required')
      const rectangle = rectangles[index] as number[]
      const remaining = (rectangle[3]! - rectangle[1]! - support.padLengthMm) / 2 - support.combinedRelativePlacementToleranceMm
      if (remaining < 0 || Math.abs(operation.offsetMm) > remaining) throw new TypeError('Complete relative-placement pad envelope leaves its actual source post')
      if (typeof support.beamSouthEndYMm !== 'number' || !Number.isFinite(support.beamSouthEndYMm)
        || typeof support.beamNorthEndYMm !== 'number' || !Number.isFinite(support.beamNorthEndYMm)
        || support.beamNorthEndYMm <= support.beamSouthEndYMm) throw new TypeError('Actual finite wet-beam end coordinates required')
      const centre = (rectangle[1]! + rectangle[3]!) / 2 + operation.offsetMm
      const endReserve = support.padLengthMm / 2 + support.combinedRelativePlacementToleranceMm
      if (centre-endReserve < support.beamSouthEndYMm || centre+endReserve > support.beamNorthEndYMm) {
        throw new TypeError('Complete relative-placement pad envelope leaves its actual wet beam')
      }
      if (offsets[index] === operation.offsetMm) return { status: 'applied', state }
      const changed = [...offsets]; changed[index] = operation.offsetMm
      stages = { ...state.document.stages, floorSection: { ...current, wetSupport: { ...support, padCentreOffsetsYMm: changed } } }
    } else throw new TypeError('Unsupported engineering edit; no fields changed')
    const document = readEngineeringEditDocument({ ...state.document, stages })
    return { status: 'applied', state: { ...state, revision: state.revision + 1, document,
      undo: [...state.undo, { before: state.document, after: document }], redo: [] } }
  } catch (error) { return { status: 'rejected', state, message: error instanceof Error ? error.message : String(error) } }
}
export function replayEngineeringEdit(state: EngineeringEditorState, base: EditBase, direction: 'undo' | 'redo'): EditResult {
  if (!sameEditBase(state, base)) return { status: 'rejected', state, message: 'Stale edit revision' }
  const history = state[direction].at(-1)
  if (!history) return { status: 'rejected', state, message: `Nothing to ${direction}` }
  return { status: 'applied', state: { ...state, revision: state.revision + 1,
    document: direction === 'undo' ? history.before : history.after,
    undo: direction === 'undo' ? state.undo.slice(0, -1) : [...state.undo, history],
    redo: direction === 'redo' ? state.redo.slice(0, -1) : [...state.redo, history] } }
}
export function engineeringTicket(state: EngineeringEditorState, requestId: string): EngineeringTicket {
  return { base: engineeringBase(state), requestId, documentJson: saveEngineeringEdit(state) }
}
export function isEngineeringTicket(input: unknown): input is EngineeringTicket {
  return exact(input, ['base', 'requestId', 'documentJson']) && exact(input.base, ['sessionId', 'revision'])
    && typeof input.base.sessionId === 'string' && input.base.sessionId.trim().length > 0
    && Number.isSafeInteger(input.base.revision) && Number(input.base.revision) >= 0
    && typeof input.requestId === 'string' && input.requestId.trim().length > 0 && typeof input.documentJson === 'string'
}
/** A reply must identify both its live request and the exact authored document. */
export function currentEngineeringReply<T extends { readonly ticket: EngineeringTicket }>(
  state: EngineeringEditorState, active: EngineeringTicket | null, reply: T,
): T | undefined {
  return isEngineeringTicket(reply.ticket) && active && sameEditBase(state, active.base)
    && sameEditBase(active.base, reply.ticket.base) && active.requestId === reply.ticket.requestId
    && active.documentJson === reply.ticket.documentJson && active.documentJson === saveEngineeringEdit(state) ? reply : undefined
}
