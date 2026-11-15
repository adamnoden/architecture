const storeys = ['GROUND', 'FIRST'] as const
export type StoreyId = typeof storeys[number]
export type StoreyObjectId = `${StoreyId}/${string}`
export type AssemblyId = `assembly/${string}`
type Point = readonly [number, number]
type Rectangle = { readonly x: number; readonly y: number; readonly width: number; readonly depth: number }
type AssemblyRole = 'envelope' | 'partition' | 'intermediate-floor'
type Domain = 'roof' | 'structure' | 'services' | 'installed-assemblies'
type DoorOperation =
  | { readonly leaves: 1; readonly swing: 'left' | 'right'; readonly hinge: 'low' | 'high' }
  | { readonly leaves: 2; readonly swing: 'left' | 'right'; readonly hinge: null }

interface OpeningPosition {
  readonly id: StoreyObjectId
  readonly hostWallId: StoreyObjectId
  readonly centreMm: number
  readonly widthMm: number
}
type Opening = OpeningPosition & (
  | { readonly kind: 'window' }
  | { readonly kind: 'door'; readonly operation: DoorOperation }
)

interface Storey {
  readonly elevationMm: number
  readonly rooms: readonly { readonly id: StoreyObjectId; readonly label: string; readonly boxes: readonly Rectangle[] }[]
  readonly partitions: readonly { readonly id: StoreyObjectId; readonly from: Point; readonly to: Point }[]
  readonly openings: readonly Opening[]
}

export interface DesignSnapshot {
  readonly schema: 'current-design/1'
  readonly units: 'mm'
  readonly datum: 'south-west-at-ground-floor'
  readonly source:
    | { readonly kind: 'georgian-layout-revision'; readonly id: 'RH-LAYOUT-REVISION-02'; readonly state: 'accepted-basis' }
    | { readonly kind: 'contrast-specimen'; readonly id: string; readonly state: 'candidate' }
  readonly envelope: { readonly widthMm: number; readonly depthMm: number; readonly court: Rectangle }
  readonly assemblyRefs: Readonly<Record<AssemblyRole, AssemblyId>>
  readonly assemblies: readonly {
    readonly id: AssemblyId
    readonly role: AssemblyRole
    readonly state: 'nominal-reservation'
    readonly depthMm: number
  }[]
  readonly storeys: Readonly<Record<StoreyId, Storey>>
  readonly coverage: Readonly<Record<Domain, { readonly state: 'outside-snapshot'; readonly reason: string }>>
}

const roles = ['envelope', 'partition', 'intermediate-floor'] as const
const domains = ['roof', 'structure', 'services', 'installed-assemblies'] as const
const keyPattern = /^[A-Za-z0-9_-]+$/

function invalid(path: string, problem: string): never {
  throw new TypeError(`${path}: ${problem}`)
}

function record(value: unknown, keys: readonly string[], path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
    invalid(path, 'expected a JSON object')
  }
  const object = value as Record<string, unknown>
  if (Object.keys(object).length !== keys.length || keys.some(key => !Object.hasOwn(object, key))) {
    invalid(path, `expected exactly ${keys.join(', ')}`)
  }
  return object
}

function member<const T extends readonly string[]>(value: unknown, choices: T, path: string): T[number] {
  if (typeof value !== 'string' || !choices.includes(value)) invalid(path, `expected ${choices.join(' or ')}`)
  return value
}

function finite(value: unknown, path: string, positive = false): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || Object.is(value, -0) || (positive && value <= 0)) {
    invalid(path, positive ? 'expected a positive finite number' : 'expected a finite number with canonical zero')
  }
  return value
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) invalid(path, 'expected a JSON array')
  return value
}

function nonempty(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) invalid(path, 'expected nonempty text')
  return value
}

function scopedId(value: unknown, scope: string, path: string): string {
  const id = nonempty(value, path)
  if (!id.startsWith(`${scope}/`) || !keyPattern.test(id.slice(scope.length + 1))) {
    invalid(path, `expected a stable ${scope}/ identifier`)
  }
  return id
}

function distinct(ids: Set<string>, id: string, path: string): void {
  if (ids.has(id)) invalid(path, `duplicate identifier ${id}`)
  ids.add(id)
}

function rectangle(value: unknown, path: string, bounds: Point): Rectangle {
  const box = record(value, ['x', 'y', 'width', 'depth'], path)
  const x = finite(box.x, `${path}.x`)
  const y = finite(box.y, `${path}.y`)
  const width = finite(box.width, `${path}.width`, true)
  const depth = finite(box.depth, `${path}.depth`, true)
  if (x < 0 || y < 0 || x + width > bounds[0] || y + depth > bounds[1]) invalid(path, 'outside the envelope')
  return { x, y, width, depth }
}

function point(value: unknown, path: string, bounds: Point): Point {
  const coordinates = list(value, path)
  if (coordinates.length !== 2) invalid(path, 'expected two coordinates')
  const x = finite(coordinates[0], `${path}[0]`)
  const y = finite(coordinates[1], `${path}[1]`)
  if (x < 0 || y < 0 || x > bounds[0] || y > bounds[1]) invalid(path, 'outside the envelope')
  return [x, y]
}

function envelopeHosts(level: StoreyId, [width, depth]: Point, c: Rectangle) {
  const hosts = new Map<string, readonly [Point, Point]>()
  const add = (id: string, from: Point, to: Point) => hosts.set(`${level}/${id}`, [from, to])
  const x1 = c.x + c.width
  const y1 = c.y + c.depth
  add('outer-south', [0, 0], [width, 0])
  add('outer-east', [width, 0], [width, depth])
  add('outer-north', [width, depth], [0, depth])
  add('outer-west', [0, depth], [0, 0])
  add('court-south', [x1, c.y], [c.x, c.y])
  add('court-west', [c.x, c.y], [c.x, y1])
  add('court-north', [c.x, y1], [x1, y1])
  add('court-east', [x1, y1], [x1, c.y])
  return hosts
}

function validateStorey(value: unknown, level: StoreyId, bounds: Point, court: Rectangle): number {
  const storey = record(value, ['elevationMm', 'rooms', 'partitions', 'openings'], level)
  const elevation = finite(storey.elevationMm, `${level}.elevationMm`)
  const hosts = envelopeHosts(level, bounds, court)
  const ids = new Set(hosts.keys())
  for (const [index, item] of list(storey.rooms, `${level}.rooms`).entries()) {
    const path = `${level}.rooms[${index}]`
    const room = record(item, ['id', 'label', 'boxes'], path)
    distinct(ids, scopedId(room.id, level, `${path}.id`), `${path}.id`)
    nonempty(room.label, `${path}.label`)
    const boxes = list(room.boxes, `${path}.boxes`)
    if (!boxes.length) invalid(`${path}.boxes`, 'expected at least one reservation')
    for (const [boxIndex, box] of boxes.entries()) rectangle(box, `${path}.boxes[${boxIndex}]`, bounds)
  }
  for (const [index, item] of list(storey.partitions, `${level}.partitions`).entries()) {
    const path = `${level}.partitions[${index}]`
    const wall = record(item, ['id', 'from', 'to'], path)
    const id = scopedId(wall.id, level, `${path}.id`)
    distinct(ids, id, `${path}.id`)
    const from = point(wall.from, `${path}.from`, bounds)
    const to = point(wall.to, `${path}.to`, bounds)
    if ((from[0] === to[0]) === (from[1] === to[1])) invalid(path, 'expected a nonzero orthogonal wall')
    hosts.set(id, [from, to])
  }
  const intervals = new Map<string, Array<readonly [number, number]>>()
  for (const [index, item] of list(storey.openings, `${level}.openings`).entries()) {
    const path = `${level}.openings[${index}]`
    const kind = member((item as Opening | undefined)?.kind, ['window', 'door'], `${path}.kind`)
    const keys = ['id', 'hostWallId', 'kind', 'centreMm', 'widthMm']
    const opening = record(item, kind === 'door' ? [...keys, 'operation'] : keys, path)
    distinct(ids, scopedId(opening.id, level, `${path}.id`), `${path}.id`)
    const hostId = scopedId(opening.hostWallId, level, `${path}.hostWallId`)
    const host = hosts.get(hostId)
    if (!host) invalid(`${path}.hostWallId`, `unknown wall ${hostId}`)
    const [from, to] = host
    const axis = from[0] === to[0] ? 1 : 0
    const centre = finite(opening.centreMm, `${path}.centreMm`)
    const halfWidth = finite(opening.widthMm, `${path}.widthMm`, true) / 2
    const low = centre - halfWidth
    const high = centre + halfWidth
    if (low <= Math.min(from[axis], to[axis]) || high >= Math.max(from[axis], to[axis])) {
      invalid(path, 'opening crosses its host end')
    }
    const others = intervals.get(hostId) ?? []
    if (others.some(([left, right]) => low < right && high > left)) invalid(path, 'opening overlaps another aperture on its host')
    others.push([low, high])
    intervals.set(hostId, others)
    if (kind === 'door') {
      const opPath = `${path}.operation`
      const operation = record(opening.operation, ['leaves', 'swing', 'hinge'], opPath)
      member(operation.swing, ['left', 'right'], `${opPath}.swing`)
      if (operation.leaves === 1) member(operation.hinge, ['low', 'high'], `${opPath}.hinge`)
      else if (operation.leaves !== 2 || operation.hinge !== null) invalid(opPath, 'expected one leaf with a hinge or two leaves without a single hinge')
    }
  }
  return elevation
}

function assertSnapshot(value: unknown): asserts value is DesignSnapshot {
  const doc = record(value, ['schema', 'units', 'datum', 'source', 'envelope', 'assemblyRefs', 'assemblies', 'storeys', 'coverage'], 'design')
  member(doc.schema, ['current-design/1'], 'design.schema')
  member(doc.units, ['mm'], 'design.units')
  member(doc.datum, ['south-west-at-ground-floor'], 'design.datum')
  const source = record(doc.source, ['kind', 'id', 'state'], 'design.source')
  if (member(source.kind, ['georgian-layout-revision', 'contrast-specimen'], 'design.source.kind') === 'georgian-layout-revision') {
    member(source.id, ['RH-LAYOUT-REVISION-02'], 'design.source.id')
    member(source.state, ['accepted-basis'], 'design.source.state')
  } else {
    const id = nonempty(source.id, 'design.source.id')
    if (!id.startsWith('SPECIMEN-') || !keyPattern.test(id)) invalid('design.source.id', 'expected a distinct SPECIMEN- identifier')
    member(source.state, ['candidate'], 'design.source.state')
  }
  const env = record(doc.envelope, ['widthMm', 'depthMm', 'court'], 'design.envelope')
  const bounds: Point = [finite(env.widthMm, 'design.envelope.widthMm', true), finite(env.depthMm, 'design.envelope.depthMm', true)]
  const court = rectangle(env.court, 'design.envelope.court', bounds)
  if (court.x <= 0 || court.y <= 0 || court.x + court.width >= bounds[0] || court.y + court.depth >= bounds[1]) {
    invalid('design.envelope.court', 'expected a strictly internal court')
  }
  const assemblies = new Map<string, AssemblyRole>()
  const assemblyIds = new Set<string>()
  for (const [index, item] of list(doc.assemblies, 'design.assemblies').entries()) {
    const path = `design.assemblies[${index}]`
    const entry = record(item, ['id', 'role', 'state', 'depthMm'], path)
    const id = scopedId(entry.id, 'assembly', `${path}.id`)
    distinct(assemblyIds, id, `${path}.id`)
    assemblies.set(id, member(entry.role, roles, `${path}.role`))
    member(entry.state, ['nominal-reservation'], `${path}.state`)
    finite(entry.depthMm, `${path}.depthMm`, true)
  }
  const refs = record(doc.assemblyRefs, roles, 'design.assemblyRefs')
  for (const role of roles) {
    const path = `design.assemblyRefs.${role}`
    const id = scopedId(refs[role], 'assembly', path)
    if (assemblies.get(id) !== role) invalid(path, `unknown or incompatible assembly ${id}`)
  }
  const levels = record(doc.storeys, storeys, 'design.storeys')
  if (validateStorey(levels.GROUND, 'GROUND', bounds, court) !== 0) invalid('GROUND.elevationMm', 'expected the ground-floor datum')
  if (validateStorey(levels.FIRST, 'FIRST', bounds, court) <= 0) invalid('FIRST.elevationMm', 'expected an elevation above ground floor')
  const coverage = record(doc.coverage, domains, 'design.coverage')
  for (const domain of domains) {
    const path = `design.coverage.${domain}`
    const entry = record(coverage[domain], ['state', 'reason'], path)
    member(entry.state, ['outside-snapshot'], `${path}.state`)
    nonempty(entry.reason, `${path}.reason`)
  }
}

export function admitDesignSnapshot(value: unknown): DesignSnapshot {
  assertSnapshot(value)
  return structuredClone(value)
}
