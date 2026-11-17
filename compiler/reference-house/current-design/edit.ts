import { admitDesignSnapshot, lookupDesignWall, type AssemblyId, type DesignSnapshot, type StoreyId, type StoreyObjectId } from './snapshot.js'

type Point = readonly [number, number]
type EntityId = StoreyObjectId | AssemblyId
type Field = 'widthMm' | 'centreMm' | 'depthMm' | 'from' | 'to'
type FieldValue = number | Point

export interface EditBase {
  readonly sessionId: string
  readonly revision: number
}

export interface FieldReference {
  readonly objectId: EntityId
  readonly field: Field
}

interface Change extends FieldReference {
  readonly before: FieldValue
  readonly after: FieldValue
}

export interface EditConsumer {
  readonly id: string
  readonly kind: 'view' | 'evidence'
  readonly dependsOn: readonly FieldReference[]
}

interface HistoryEntry {
  readonly before: DesignSnapshot
  readonly after: DesignSnapshot
  readonly changes: readonly Change[]
}

export interface EditorState extends EditBase {
  readonly design: DesignSnapshot
  readonly undo: readonly HistoryEntry[]
  readonly redo: readonly HistoryEntry[]
}

interface HostedOpeningRef {
  readonly level: StoreyId
  readonly openingId: StoreyObjectId
  readonly hostWallId: StoreyObjectId
}

export type EditOperation =
  | (HostedOpeningRef & { readonly kind: 'resize-opening'; readonly widthMm: number })
  | (HostedOpeningRef & { readonly kind: 'move-opening'; readonly centreMm: number })
  | { readonly kind: 'move-wall'; readonly level: StoreyId; readonly wallId: StoreyObjectId; readonly coordinateMm: number }
  | { readonly kind: 'set-assembly-depth'; readonly assemblyId: AssemblyId; readonly depthMm: number }

export interface EditTransaction {
  readonly schema: 'current-design-edit/1'
  readonly units: 'mm'
  readonly base: EditBase
  readonly operations: readonly EditOperation[]
}

type ErrorCode = 'invalid-transaction' | 'unsupported-operation' | 'stale-base' | 'missing-opening' | 'host-mismatch'
  | 'missing-wall' | 'unsupported-topology' | 'missing-assembly' | 'geometry-invalid' | 'history-empty'

class Rejection extends Error {
  constructor(readonly code: ErrorCode, message: string, readonly objectIds: readonly EntityId[] = []) { super(message) }
}

type Effect = { readonly consumerId: string; readonly action: 'recompute' | 'stale'; readonly input: Change }

type EditResult =
  | { readonly status: 'applied'; readonly state: EditorState; readonly effects: readonly Effect[] }
  | { readonly status: 'rejected'; readonly state: EditorState; readonly diagnostic: Readonly<{
    code: ErrorCode; severity: 'error'; message: string; objectIds: readonly EntityId[]; base: EditBase
  }> }

function newSession(design: DesignSnapshot, sessionId: string): EditorState {
  if (!sessionId.trim()) throw new TypeError('A distinct edit session ID is required')
  return { sessionId, revision: 0, design, undo: [], redo: [] }
}

/** Fork an admitted document into a candidate with its own source ID. */
export function beginDesignEdit(input: unknown, sessionId: string, draftId: string) {
  const source = admitDesignSnapshot(input)
  if (source.source.id === draftId) throw new TypeError('Choose a new draft source ID')
  return newSession(admitDesignSnapshot({ ...source, source: { kind: 'contrast-specimen', id: draftId, state: 'candidate' } }), sessionId)
}

/** Persist the candidate document. A loaded document starts a fresh edit session. */
export function saveDesignDraft(state: EditorState) {
  return JSON.stringify({ schema: 'current-design-draft/1', design: state.design })
}

export function loadDesignDraft(json: string, sessionId: string) {
  return newSession(admitSavedDesignDraft(JSON.parse(json)), sessionId)
}

export function admitSavedDesignDraft(saved: unknown) {
  if (!isRecord(saved, ['schema', 'design']) || saved.schema !== 'current-design-draft/1') {
    throw new TypeError('Unknown saved draft format')
  }
  const design = admitDesignSnapshot(saved.design)
  if (design.source.state !== 'candidate') throw new TypeError('Saved drafts require candidate scope')
  return design
}

export function editBase({ sessionId, revision }: EditBase): EditBase {
  return { sessionId, revision }
}

export function sameEditBase(a: EditBase, b: EditBase) {
  return a.sessionId === b.sessionId && a.revision === b.revision
}

function assertBase(state: EditorState, base: EditBase) {
  if (!sameEditBase(state, base)) throw new Rejection('stale-base', 'Request belongs to a different edit revision')
}

function rejected(state: EditorState, error: Rejection): EditResult {
  const { code, message, objectIds } = error
  return { status: 'rejected', state, diagnostic: { code, severity: 'error', message, objectIds, base: editBase(state) } }
}

function isRecord(input: unknown, keys: readonly string[]): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && Object.getPrototypeOf(input) === Object.prototype
    && Object.keys(input).length === keys.length && keys.every(key => Object.hasOwn(input, key))
}

function isBase(input: unknown): input is EditBase {
  return isRecord(input, ['sessionId', 'revision']) && typeof input.sessionId === 'string' && input.sessionId.trim().length > 0
    && typeof input.revision === 'number' && Number.isSafeInteger(input.revision) && input.revision >= 0
}

function isLevel(value: unknown): value is StoreyId {
  return value === 'GROUND' || value === 'FIRST'
}

function isId(value: unknown, scope: string): value is string {
  return typeof value === 'string' && value.startsWith(scope + '/') && /^[A-Za-z0-9_-]+$/.test(value.slice(scope.length + 1))
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)
}

function parseOperation(input: unknown): EditOperation {
  const kind = input && typeof input === 'object' && 'kind' in input ? input.kind : undefined
  switch (kind) {
    case 'resize-opening':
    case 'move-opening': {
      const field = kind === 'resize-opening' ? 'widthMm' : 'centreMm'
      if (isRecord(input, ['kind', 'level', 'openingId', 'hostWallId', field]) && isLevel(input.level)
        && isId(input.openingId, input.level) && isId(input.hostWallId, input.level)
        && isFiniteNumber(input[field]) && (kind !== 'resize-opening' || input[field] > 0)) return input as unknown as EditOperation
      break
    }
    case 'move-wall':
      if (isRecord(input, ['kind', 'level', 'wallId', 'coordinateMm']) && isLevel(input.level)
        && isId(input.wallId, input.level) && isFiniteNumber(input.coordinateMm)) return input as unknown as EditOperation
      break
    case 'set-assembly-depth':
      if (isRecord(input, ['kind', 'assemblyId', 'depthMm']) && isId(input.assemblyId, 'assembly')
        && isFiniteNumber(input.depthMm) && input.depthMm > 0) return input as unknown as EditOperation
      break
    default:
      throw new Rejection('unsupported-operation', 'Editor does not support this operation')
  }
  throw new Rejection('invalid-transaction', 'Edit has invalid fields, identifiers or millimetre values')
}

function affected(changes: readonly Change[], consumers: readonly EditConsumer[]): Effect[] {
  return consumers.flatMap(consumer => changes
    .filter(change => consumer.dependsOn.some(input => input.objectId === change.objectId && input.field === change.field))
    .map(input => ({ consumerId: consumer.id, action: consumer.kind === 'view' ? 'recompute' : 'stale', input })))
}

function updateStorey(design: DesignSnapshot, level: StoreyId, value: DesignSnapshot['storeys'][StoreyId]) {
  return { ...design, storeys: { ...design.storeys, [level]: value } }
}

function rect(a: Point, b: Point) {
  return { x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]) }
}

function meets(a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) {
  return a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1
}

function moveWall(design: DesignSnapshot, edit: Extract<EditOperation, { kind: 'move-wall' }>, changes: Change[]) {
  const { level, wallId, coordinateMm } = edit
  const storey = design.storeys[level]
  const wall = storey.partitions.find(item => item.id === wallId)
  if (!wall) {
    try { lookupDesignWall(design, level, wallId) } catch { throw new Rejection('missing-wall', 'Wall was not found on this storey', [wallId]) }
    throw new Rejection('unsupported-topology', 'Envelope and court hosts remain fixed in this editor', [wallId])
  }
  const normal = wall.from[0] === wall.to[0] ? 0 : 1
  if (wall.from[normal] === coordinateMm) return design
  const translate = ([x, y]: Point): Point => normal === 0 ? [coordinateMm, y] : [x, coordinateMm]
  const from = translate(wall.from)
  const to = translate(wall.to)
  const sweep = rect(wall.from, to)
  const { widthMm, depthMm, court } = design.envelope
  const courtBox = rect([court.x, court.y], [court.x + court.width, court.y + court.depth])
  if (sweep.x0 <= 0 || sweep.y0 <= 0 || sweep.x1 >= widthMm || sweep.y1 >= depthMm || meets(sweep, courtBox)
    || storey.partitions.some(other => other.id !== wallId && meets(sweep, rect(other.from, other.to)))) {
    throw new Rejection('unsupported-topology', 'Only free-standing translations with a clear swept path are supported', [wallId])
  }
  changes.push({ objectId: wallId, field: 'from', before: wall.from, after: from }, { objectId: wallId, field: 'to', before: wall.to, after: to })
  return updateStorey(design, level, { ...storey, partitions: storey.partitions.map(item => item.id === wallId ? { ...item, from, to } : item) })
}

function applyOperation(design: DesignSnapshot, edit: EditOperation, changes: Change[]): DesignSnapshot {
  if (edit.kind === 'move-wall') return moveWall(design, edit, changes)
  if (edit.kind === 'set-assembly-depth') {
    const { assemblyId, depthMm } = edit
    const assembly = design.assemblies.find(item => item.id === assemblyId)
    if (!assembly) throw new Rejection('missing-assembly', 'Assembly was not found', [assemblyId])
    changes.push({ objectId: assemblyId, field: 'depthMm', before: assembly.depthMm, after: depthMm })
    return { ...design, assemblies: design.assemblies.map(item => item.id === assemblyId ? { ...item, depthMm } : item) }
  }

  const { level, openingId, hostWallId } = edit
  const storey = design.storeys[level]
  const opening = storey.openings.find(item => item.id === openingId)
  if (!opening) throw new Rejection('missing-opening', 'Opening was not found on this storey', [openingId])
  if (opening.hostWallId !== hostWallId) throw new Rejection('host-mismatch', 'Opening has a different host', [openingId, hostWallId])
  const field = edit.kind === 'move-opening' ? 'centreMm' : 'widthMm'
  const after = edit.kind === 'move-opening' ? edit.centreMm : edit.widthMm
  changes.push({ objectId: openingId, field, before: opening[field], after })
  return updateStorey(design, level, { ...storey, openings: storey.openings.map(item => item.id === openingId ? { ...item, [field]: after } : item) })
}

function netChanges(changes: readonly Change[]) {
  const net = new Map<string, Change>()
  for (const change of changes) {
    const key = change.objectId + ':' + change.field
    const earlier = net.get(key)
    net.set(key, earlier ? { ...change, before: earlier.before } : change)
  }
  return [...net.values()].filter(({ before, after }) => JSON.stringify(before) !== JSON.stringify(after))
}

export function applyDesignEdit(state: EditorState, input: unknown, consumers: readonly EditConsumer[]): EditResult {
  try {
    if (!isRecord(input, ['schema', 'units', 'base', 'operations']) || input.schema !== 'current-design-edit/1'
      || input.units !== 'mm' || !isBase(input.base) || !Array.isArray(input.operations) || !input.operations.length) {
      throw new Rejection('invalid-transaction', 'Expected a versioned, nonempty transaction in mm with a base revision')
    }
    assertBase(state, input.base)
    const operations = input.operations.map(parseOperation)
    const changes: Change[] = []
    let edited = state.design
    for (const operation of operations) edited = applyOperation(edited, operation, changes)
    try { edited = admitDesignSnapshot(edited) } catch (error) {
      throw new Rejection('geometry-invalid', error instanceof Error ? error.message : 'Geometry validation failed', [...new Set(changes.map(change => change.objectId))])
    }
    const net = netChanges(changes)
    if (!net.length) return { status: 'applied', state, effects: [] }
    const record = { before: state.design, after: edited, changes: net }
    return {
      status: 'applied', effects: affected(net, consumers),
      state: { ...state, revision: state.revision + 1, design: edited, undo: [...state.undo, record], redo: [] },
    }
  } catch (error) {
    if (error instanceof Rejection) return rejected(state, error)
    throw error
  }
}

export function replayDesignEdit(state: EditorState, base: EditBase, direction: 'undo' | 'redo', consumers: readonly EditConsumer[]): EditResult {
  if (!sameEditBase(state, base)) return rejected(state, new Rejection('stale-base', 'History request belongs to a different revision'))
  const record = state[direction].at(-1)
  if (!record) return rejected(state, new Rejection('history-empty', 'There is no edit to restore'))
  const undoing = direction === 'undo'
  const changes = undoing ? record.changes.map(change => ({ ...change, before: change.after, after: change.before })) : record.changes
  return {
    status: 'applied', effects: affected(changes, consumers),
    state: {
      ...state, revision: state.revision + 1, design: undoing ? record.before : record.after,
      undo: undoing ? state.undo.slice(0, -1) : [...state.undo, record],
      redo: undoing ? [...state.redo, record] : state.redo.slice(0, -1),
    },
  }
}

/** Cheap nominal geometry check. The editor retains a well-formed candidate with a finding. */
export function inspectDraftGeometry(state: EditorState) {
  const { design } = state
  const id = design.assemblyRefs['intermediate-floor']
  const floor = design.assemblies.find(item => item.id === id)!
  const nominalClearHeightMm = design.storeys.FIRST.elevationMm - floor.depthMm
  const diagnostics = nominalClearHeightMm <= 0 ? [{
    code: 'floor-reservation-consumes-storey', severity: 'error', base: editBase(state),
    input: { objectId: id, field: 'depthMm' }, nominalClearHeightMm,
    message: 'Intermediate floor reservation leaves zero or negative nominal ground-storey clear height',
  }] : []
  return { nominalClearHeightMm, diagnostics } as const
}
