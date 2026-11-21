import { admitDesignSnapshot, type DesignSnapshot } from './snapshot.js'
import { sameEditBase, type EditBase } from './edit.js'

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
export const editableRoofId = 'MAT/ring-roof-field'
export const editableFloorSectionId = 'STR/current-floor-section'
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
    } else if (record(operation) && operation.kind === 'set-floor-section-thickness') {
      const current = state.document.stages.floorSection
      if (transaction.units !== 'mm' || !exact(operation, ['kind', 'assemblyId', 'thicknessMm'])
        || operation.assemblyId !== editableFloorSectionId || typeof operation.thicknessMm !== 'number'
        || !Number.isFinite(operation.thicknessMm) || operation.thicknessMm < 200 || operation.thicknessMm > 250
        || !exact(current, ['thicknessMm']) || typeof current.thicknessMm !== 'number') {
        throw new TypeError('An existing explicit STR/current-floor-section with supported thickness 200..250 mm is required')
      }
      if (operation.thicknessMm === current.thicknessMm) return { status: 'applied', state }
      stages = { ...state.document.stages, floorSection: { thicknessMm: operation.thicknessMm } }
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
