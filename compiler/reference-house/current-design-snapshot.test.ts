import assert from 'node:assert/strict'
import test from 'node:test'
import { createRevisionPlan, layoutRevision, revisionOpenings } from './georgian/layout-revision.js'
import { readGeorgianDesignSnapshot, requireGeorgianDesignBasis } from './current-design/georgian-source.js'
import { readCurrentDesignResolution, resolveCurrentDesign } from './current-design/resolve.js'
import { admitDesignSnapshot, type DesignSnapshot } from './current-design/snapshot.js'

const specimen = {
  schema: 'current-design/1',
  units: 'mm',
  datum: 'south-west-at-ground-floor',
  source: { kind: 'contrast-specimen', id: 'SPECIMEN-OFF-CENTRE-COURT', state: 'candidate' },
  envelope: { widthMm: 8600, depthMm: 10200, court: { x: 2200, y: 4400, width: 2800, depth: 2350 } },
  assemblyRefs: {
    envelope: 'assembly/SPECIMEN-EXT',
    partition: 'assembly/SPECIMEN-INT',
    'intermediate-floor': 'assembly/SPECIMEN-FLOOR',
  },
  assemblies: [
    { id: 'assembly/SPECIMEN-EXT', role: 'envelope', state: 'nominal-reservation', depthMm: 390 },
    { id: 'assembly/SPECIMEN-INT', role: 'partition', state: 'nominal-reservation', depthMm: 105 },
    { id: 'assembly/SPECIMEN-FLOOR', role: 'intermediate-floor', state: 'nominal-reservation', depthMm: 310 },
  ],
  storeys: {
    GROUND: {
      elevationMm: 0,
      rooms: [{ id: 'GROUND/workroom', label: 'Workroom', boxes: [{ x: 0, y: 0, width: 2600, depth: 3000 }] }],
      partitions: [{ id: 'GROUND/workroom-east', from: [2600, 0], to: [2600, 3000] }],
      openings: [
        { id: 'GROUND/workroom-window', kind: 'window', hostWallId: 'GROUND/outer-south', centreMm: 1100, widthMm: 760 },
        { id: 'GROUND/workroom-door', kind: 'door', hostWallId: 'GROUND/workroom-east', centreMm: 1800, widthMm: 825,
          operation: { leaves: 1, swing: 'right', hinge: 'high' } },
      ],
    },
    FIRST: {
      elevationMm: 2980,
      rooms: [{ id: 'FIRST/studio', label: 'Studio', boxes: [{ x: 0, y: 0, width: 2400, depth: 3100 }] }],
      partitions: [],
      openings: [{ id: 'FIRST/studio-window', kind: 'window', hostWallId: 'FIRST/court-north', centreMm: 3600, widthMm: 895 }],
    },
  },
  coverage: {
    roof: { state: 'outside-snapshot', reason: 'Specimen does not supply a roof.' },
    structure: { state: 'outside-snapshot', reason: 'Specimen does not supply loads or spans.' },
    services: { state: 'outside-snapshot', reason: 'Specimen does not supply equipment.' },
    'installed-assemblies': { state: 'outside-snapshot', reason: 'Specimen depths are reservations.' },
  },
} satisfies DesignSnapshot

function decode(json: string) {
  return admitDesignSnapshot(JSON.parse(json))
}

test('the Georgian adapter projects the actual layout and stable source object IDs', () => {
  const model = readGeorgianDesignSnapshot()
  assert.equal(model.source.id, layoutRevision.id)
  assert.equal(model.envelope.widthMm, layoutRevision.shell)
  assert.deepEqual(model.envelope.court, layoutRevision.court)
  for (const level of ['GROUND', 'FIRST'] as const) {
    const storey = model.storeys[level]
    assert.deepEqual(storey.partitions.map(wall => [wall.id, wall.from, wall.to]),
      layoutRevision.partitions[level].map(wall => [`${level}/${wall.id}`, wall.a, wall.b]))
    assert.deepEqual(storey.rooms.map(room => [room.id, room.boxes]),
      layoutRevision.rooms[level].map(room => [`${level}/${room.id}`, room.boxes]))
    assert.deepEqual(storey.openings.map(o => [o.id, o.hostWallId, o.centreMm, o.widthMm]),
      revisionOpenings(level).map(o => [`${level}/${o.id}`, `${level}/${o.wall}`, o.centre, o.width]))
  }
  assert.equal(model.coverage.services.state, 'outside-snapshot')
  assert.deepEqual(decode(JSON.stringify(model)), model)
  assert.deepEqual(readGeorgianDesignSnapshot(), model)
})

test('a non-square specimen round-trips, and admission preserves supplied geometry and leaves unrelated objects equal', () => {
  const model = admitDesignSnapshot(specimen)
  assert.deepEqual(decode(JSON.stringify(model)), specimen)
  const changed = structuredClone(specimen)
  changed.storeys.GROUND.openings[0].widthMm = 920
  changed.storeys.GROUND.partitions[0].from[0] = 2900
  changed.storeys.GROUND.partitions[0].to[0] = 2900
  const moved = admitDesignSnapshot(changed)
  assert.equal(moved.source.state, 'candidate')
  assert.equal(moved.storeys.GROUND.openings[0].widthMm, 920)
  assert.equal(moved.storeys.GROUND.partitions[0].from[0], 2900)
  assert.deepEqual(moved.storeys.FIRST, model.storeys.FIRST)
  assert.deepEqual(moved.envelope, model.envelope)
  assert.equal(model.storeys.GROUND.openings[0].widthMm, 760)
  changed.storeys.GROUND.openings[0].widthMm = 500
  assert.equal(moved.storeys.GROUND.openings[0].widthMm, 920)
})

test('malformed versions, source claims, units and unknown fields receive explicit rejection', () => {
  for (const [change, error] of [
    [{ schema: 'current-design/77' }, /design.schema/],
    [{ units: 'feet' }, /design.units/],
    [{ source: { ...specimen.source, state: 'accepted-basis' } }, /design.source.state/],
    [{ source: { kind: 'historical-fixture', id: 'RH-C1', state: 'accepted-basis' } }, /design.source.kind/],
    [{ misplacedGeometry: 123 }, /design: expected exactly/],
    [{ envelope: { ...specimen.envelope, widthMm: Infinity } }, /design.envelope.widthMm/],
  ] as const) {
    assert.throws(() => admitDesignSnapshot({ ...specimen, ...change }), error)
  }
})

test('invalid IDs, wrong assembly roles and malformed opening geometry are rejected', () => {
  const ground = specimen.storeys.GROUND
  const [window, door] = ground.openings
  const invalidGround = (level: unknown) => ({ ...specimen, storeys: { ...specimen.storeys, GROUND: level } })
  assert.throws(() => admitDesignSnapshot(invalidGround({ ...ground, openings: [window, window] })), /duplicate identifier/)
  for (const hostWallId of ['GROUND/missing-wall', 'GROUND/workroom', 'FIRST/outer-south']) {
    assert.throws(() => admitDesignSnapshot(invalidGround({ ...ground, openings: [{ ...window, hostWallId }] })), /hostWallId/)
  }
  assert.throws(() => admitDesignSnapshot({ ...specimen, assemblyRefs: { ...specimen.assemblyRefs, envelope: 'assembly/SPECIMEN-INT' } }),
    /unknown or incompatible assembly/)
  assert.throws(() => admitDesignSnapshot(invalidGround({ ...ground, openings: [{ ...window, widthMm: 9000 }] })), /crosses its host end/)
  assert.throws(() => admitDesignSnapshot(invalidGround({ ...ground, openings: [window, { ...window, id: 'GROUND/overlap' }] })), /overlaps another aperture/)
  assert.throws(() => admitDesignSnapshot(invalidGround({ ...ground, openings: [{ ...door, operation: { leaves: 2, swing: 'right', hinge: 'high' } }] })), /operation/)
})

test('explicit Georgian applicability links saved nominal openings to the native plan occurrence', () => {
  const saved = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  const supplied = requireGeorgianDesignBasis(saved)
  assert.deepEqual(supplied, saved)
  assert.notEqual(supplied, saved)
  for (const level of ['GROUND', 'FIRST'] as const) {
    const currentWidths = supplied.storeys[level].openings.map(opening => [opening.id, opening.widthMm])
    const nativeWidths = createRevisionPlan(level).openings.map(opening => {
      assert.equal(opening.width.kind, 'approximate')
      return [`${level}/${opening.id}`, opening.width.value]
    })
    assert.deepEqual(currentWidths, nativeWidths)
  }
})

test('a candidate and falsely attributed Georgian geometry cannot satisfy applicability', () => {
  assert.throws(() => requireGeorgianDesignBasis(specimen), /candidate snapshots require a separate applicability decision/)
  const wrong = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  wrong.storeys.FIRST.openings[0].widthMm -= 100
  assert.equal(admitDesignSnapshot(wrong).source.kind, 'georgian-layout-revision')
  assert.throws(() => requireGeorgianDesignBasis(wrong), /differs from the current Georgian layout inputs/)
})

test('the exact named house receives separately scoped source bindings', () => {
  const current = readCurrentDesignResolution()
  assert.equal(current.schema, 'current-design-resolution/1')
  assert.deepEqual(current.disciplineBindings.map(binding => [binding.id, binding.state]), [
    ['had-selected-water', 'selected-reference'],
    ['had-occupied-services', 'selected-reference'],
    ['str-conditional-interface', 'candidate-interface'],
    ['rwt-conditional-receiving', 'selected-reference'],
    ['mat-roof-pitch-reference', 'candidate-interface'],
    ['had-inlet-indoor-reference', 'candidate-interface'],
    ['had-inlet-south-development', 'candidate-interface'],
    ['had-inlet-south-sill-insert', 'candidate-interface'],
  ])
  for (const binding of current.disciplineBindings) {
    assert.equal(binding.applicability.sourceId, current.design.source.id)
    assert.deepEqual(binding.applicability.shellMm, [12000, 12000])
    assert.match(binding.digest, /^[0-9a-f]{64}$/)
    assert.match(binding.applicability.planDigest, /^[0-9a-f]{64}$/)
    assert.ok(Object.keys(binding.identities).length)
  }
  assert.deepEqual(resolveCurrentDesign(JSON.parse(JSON.stringify(current.design))), current)
})

test('a different plan gets no discipline binding, even if it keeps the accepted house label', () => {
  assert.deepEqual(resolveCurrentDesign(specimen).disciplineBindings, [])
  assert.throws(() => resolveCurrentDesign({ ...specimen, disciplineBindings: readCurrentDesignResolution().disciplineBindings }),
    /design: expected exactly/)
  const stale = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  stale.envelope.widthMm += 100
  assert.throws(() => resolveCurrentDesign(stale), /differs from the current Georgian layout inputs/)
})
