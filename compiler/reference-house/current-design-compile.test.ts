import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { createReferenceHouseSource } from './fixture.js'
import { createLayoutFamilyScene, layoutFamilySource } from './georgian/layout-family.js'
import { compileCurrentDesign, compileCurrentDesignBundle } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const cli = (args: string[], input?: string) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', ...args], { input, encoding: 'utf8' })

test('an explicit saved current document compiles into both native nominal plan scenes', () => {
  const design = readGeorgianDesignSnapshot()
  const result = compileCurrentDesign(JSON.parse(JSON.stringify(design)))
  assert.equal(result.status, 'NOMINAL_PLAN_ONLY')
  assert.equal(result.source.id, design.source.id)
  assert.equal(result.source.planDigest, sha256SemanticFingerprint(design))
  assert.equal(result.method.id, layoutFamilySource.id)
  for (const level of ['GROUND', 'FIRST'] as const) {
    assert.deepEqual(result.plans[level], createLayoutFamilyScene(level, 100))
  }
  assert.ok(result.disciplineBindings.every(binding => binding.applicability.planDigest === result.source.planDigest))
})

test('an edit cannot be compiled under a stale accepted-source identity', () => {
  const changed = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  changed.storeys.GROUND.openings[0].widthMm -= 100
  assert.throws(() => compileCurrentDesign(changed), /differs from the current Georgian layout inputs/)
})

test('a non-square contrast derives both plans and changes only the affected aperture scene', () => {
  const source = readGeorgianDesignSnapshot()
  const specimen = {
    ...source,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-ALT-WINDOW', state: 'candidate' },
    envelope: { widthMm: 8600, depthMm: 10200, court: { x: 2200, y: 4400, width: 2800, depth: 2350 } },
    storeys: {
      GROUND: {
        elevationMm: 0,
        rooms: [],
        partitions: [{ id: 'GROUND/workroom-east', from: [2600, 0], to: [2600, 3000] }],
        openings: [{ id: 'GROUND/workroom-window', hostWallId: 'GROUND/outer-south', kind: 'window',
          centreMm: 1100, widthMm: 760 }],
      },
      FIRST: {
        elevationMm: 2980,
        rooms: [],
        partitions: [],
        openings: [{ id: 'FIRST/studio-window', hostWallId: 'FIRST/court-north', kind: 'window',
          centreMm: 3600, widthMm: 895 }],
      },
    },
  }
  const before = compileCurrentDesign(specimen)
  const changed = structuredClone(specimen)
  changed.storeys.GROUND.openings[0].widthMm = 920
  const after = compileCurrentDesign(changed)

  assert.equal(after.status, 'CANDIDATE_NOMINAL_PLAN_ONLY')
  assert.equal(after.method.id, 'ORTHOGONAL-CANDIDATE-PLAN-1')
  assert.equal(after.source.planDigest, sha256SemanticFingerprint(changed))
  assert.notEqual(after.source.planDigest, before.source.planDigest)
  assert.deepEqual(after.disciplineBindings, [])
  assert.deepEqual(after.plans.FIRST, before.plans.FIRST)
  assert.equal(after.plans.GROUND.heightMm - after.plans.GROUND.widthMm, 16)
  assert.equal(after.plans.GROUND.sourceId, changed.source.id)
  assert.ok(after.plans.GROUND.primitives.every(primitive => primitive.kind !== 'text'))
  assert.equal(after.diagnostics[0].code, 'CANDIDATE_INTERPRETATION_LIMITS')

  function glazing(plan: typeof after.plans.GROUND, id: string) {
    const mark = plan.primitives.find(primitive => primitive.id === id)
    assert.ok(mark?.kind === 'line')
    return {
      span: Math.round(Math.hypot(mark.b.x - mark.a.x, mark.b.y - mark.a.y) * 100),
      midpoint: (mark.a.x + mark.b.x) / 2,
    }
  }
  const oldWindow = glazing(before.plans.GROUND, 'workroom-window-glazing-a')
  const newWindow = glazing(after.plans.GROUND, 'workroom-window-glazing-a')
  assert.deepEqual([oldWindow.span, newWindow.span], [760, 920])
  assert.equal(oldWindow.midpoint, newWindow.midpoint)
  assert.equal(glazing(after.plans.FIRST, 'studio-window-glazing-a').span, 895)
})

test('the CLI reads the explicitly named source and refuses missing, malformed or wrong documents', () => {
  assert.throws(() => compileCurrentDesign(createReferenceHouseSource()), /design: expected exactly/)
  const exported = cli(['--read-georgian-source'])
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), readGeorgianDesignSnapshot())
  const compiled = cli(['-'], exported.stdout)
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.equal(JSON.parse(compiled.stdout).status, 'NOMINAL_PLAN_ONLY')
  const contrast = JSON.parse(exported.stdout)
  contrast.source = { kind: 'contrast-specimen', id: 'SPECIMEN-CLI', state: 'candidate' }
  const candidate = cli(['-'], JSON.stringify(contrast))
  assert.equal(candidate.status, 0, candidate.stderr)
  assert.equal(JSON.parse(candidate.stdout).status, 'CANDIDATE_NOMINAL_PLAN_ONLY')
  assert.deepEqual(JSON.parse(candidate.stdout).disciplineBindings, [])
  for (const [args, input] of [[[], undefined], [['-'], '{'], [['-'], '{"source":"RH-C1"}']] as const) {
    const rejected = cli([...args], input)
    assert.equal(rejected.status, 1)
    assert.equal(rejected.stdout, '')
    assert.ok(rejected.stderr.trim())
  }
})

test('the active bundle command returns both plan scenes and the native results from one source', async () => {
  const design = readGeorgianDesignSnapshot()
  const input = JSON.stringify(design)
  const command = cli(['--bundle', '-'], input)
  assert.equal(command.status, 0, command.stderr)
  const bundle = await compileCurrentDesignBundle(JSON.parse(input))
  assert.equal(command.stdout, JSON.stringify(bundle) + '\n')
  assert.equal(bundle.schema, 'current-design-bundle/1')
  assert.equal(bundle.source.planDigest, sha256SemanticFingerprint(design))
  assert.deepEqual(bundle.plans.source, bundle.source)
  for (const level of ['GROUND', 'FIRST'] as const) {
    assert.deepEqual(bundle.plans.plans[level], createLayoutFamilyScene(level, 100))
  }
  assert.deepEqual(bundle.plans.diagnostics[0].objects, [
    { kind: 'storey', id: 'GROUND' }, { kind: 'storey', id: 'FIRST' },
  ])

  assert.equal(bundle.occupiedServices.status, 'compiled')
  assert.equal(bundle.selectedWaterEvent.status, 'compiled')
  const checks = [
    [bundle.occupiedServices, bundle.occupiedServices.schedule, 'HAD-OCCUPIED-SERVICE-SCHEDULE',
      'had/studies/current-house-services.json', 'had-occupied-services'],
    [bundle.selectedWaterEvent, bundle.selectedWaterEvent.event, 'RWT-06-SELECTED-WATER-EVENT',
      'rwt/studies/selected-water-event.json', 'rwt-conditional-receiving'],
  ] as const
  for (const [domain, payload, method, path, bindingId] of checks) {
    assert.equal(domain.method.id, method)
    const binding = bundle.plans.disciplineBindings.find(value => value.id === bindingId)
    assert.ok(binding)
    assert.equal(domain.method.gitBlob, binding.identities[domain.method.sourcePath])
    assert.match(domain.method.gitBlob, /^[0-9a-f]{40}$/)
    assert.equal(domain.applicability.state, 'selected-reference')
    assert.equal(domain.source.planDigest, bundle.source.planDigest)
    assert.equal(payload, readFileSync(new URL(`../../project/${path}`, import.meta.url), 'utf8'))
  }
})

test('the same bundle command links unsupported discipline outputs to an edited candidate', async () => {
  const design = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  design.source = { kind: 'contrast-specimen', id: 'SPECIMEN-BUNDLE', state: 'candidate' }
  const before = await compileCurrentDesignBundle(design)
  design.storeys.GROUND.openings[0].widthMm -= 100
  const after = await compileCurrentDesignBundle(design)
  assert.equal(after.plans.status, 'CANDIDATE_NOMINAL_PLAN_ONLY')
  assert.notEqual(after.source.planDigest, before.source.planDigest)
  assert.notDeepEqual(after.plans.plans.GROUND, before.plans.plans.GROUND)
  assert.deepEqual(after.plans.plans.FIRST, before.plans.plans.FIRST)
  for (const [name, domain] of [
    ['occupied-services', after.occupiedServices], ['selected-water-event', after.selectedWaterEvent],
  ] as const) {
    assert.equal(domain.status, 'unavailable')
    assert.deepEqual(domain.diagnostics[0], {
      code: 'DOMAIN_REQUIRES_ACCEPTED_SOURCE',
      domain: name,
      message: 'This candidate does not carry an applicable selected discipline binding.',
      objects: [{ kind: 'design', id: 'SPECIMEN-BUNDLE' }],
    })
  }
})
