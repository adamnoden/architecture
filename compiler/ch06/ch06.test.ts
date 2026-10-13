import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { runCalculationCheck } from '../calculation-slice/compile.js'
import type {
  CalculationCheckInput,
  CalculationInputValue,
  CalculationMethod,
  CalculationUnit
} from '../calculation-slice/model.js'
import {
  areAdjacent,
  boxesIntersect,
  containsBox,
  isValidBox,
  overlapArea,
  type Box2D
} from '../core/geometry.js'
import { BOX_GEOMETRY_EPSILON } from '../core/numeric.js'
import { deriveServiceTopology } from '../service-slice/derive.js'
import type { ServiceTopologySource } from '../service-slice/model.js'

const createDeterministicRandom = (seed: number) => {
  let state = seed >>> 0
  return (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x1_0000_0000
  }
}

const randomInteger = (next: () => number, min: number, max: number): number =>
  min + Math.floor(next() * (max - min + 1))

const randomBox = (next: () => number): Box2D => ({
  kind: 'box2d',
  x: randomInteger(next, -10_000, 10_000),
  y: randomInteger(next, -10_000, 10_000),
  width: randomInteger(next, 1, 2_000),
  height: randomInteger(next, 1, 2_000)
})

const translateBox = (box: Box2D, dx: number, dy: number): Box2D => ({
  ...box,
  x: box.x + dx,
  y: box.y + dy
})

const permutations = <T>(items: readonly T[]): T[][] => {
  if (items.length <= 1) return [[...items]]
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((tail) => [item, ...tail])
  )
}

const authority: CalculationMethod['authority'] = {
  kind: 'statutory-guidance',
  jurisdiction: 'test',
  documentTitle: 'CH-06 synthetic method',
  edition: '1',
  paragraph: '1',
  sourceUrl: 'https://example.invalid/ch06',
  sourceCheckedOn: '2026-10-13'
}

const syntheticMethod = (): CalculationMethod => ({
  id: 'CH06-SYNTHETIC',
  version: '1',
  title: 'CH-06 synthetic aggregation method',
  authority,
  applicability: { domain: 'ch06' },
  criteria: [
    {
      id: 'RANGE',
      inputKey: 'range',
      label: 'Range',
      kind: 'inclusive-range',
      unit: 'mm',
      min: 10,
      max: 20,
      authorityRef: 'synthetic:range'
    },
    {
      id: 'MAX-MM',
      inputKey: 'maxMm',
      label: 'Maximum mm',
      kind: 'maximum',
      unit: 'mm',
      max: 30,
      authorityRef: 'synthetic:max-mm'
    },
    {
      id: 'MAX-DEG',
      inputKey: 'maxDeg',
      label: 'Maximum degrees',
      kind: 'maximum',
      unit: 'deg',
      max: 40,
      authorityRef: 'synthetic:max-deg'
    }
  ],
  claim: 'Synthetic CH-06 calculation-kernel test only.',
  nonClaims: ['architectural meaning']
})

type EvidenceState = 'pass' | 'fail' | 'missing' | 'non-finite' | 'wrong-unit'

const evidenceValue = (
  state: EvidenceState,
  unit: CalculationUnit,
  passValue: number,
  failValue: number,
  id: string
): CalculationInputValue | undefined => {
  if (state === 'missing') return undefined
  return {
    value: state === 'non-finite' ? Number.NaN : state === 'fail' ? failValue : passValue,
    unit: state === 'wrong-unit' ? (unit === 'mm' ? 'deg' : 'mm') : unit,
    sourceIds: [id]
  }
}

const syntheticInput = (states: readonly EvidenceState[]): CalculationCheckInput => {
  const entries = [
    ['range', evidenceValue(states[0], 'mm', 15, 9, 'SRC-RANGE')],
    ['maxMm', evidenceValue(states[1], 'mm', 25, 31, 'SRC-MAX-MM')],
    ['maxDeg', evidenceValue(states[2], 'deg', 35, 41, 'SRC-MAX-DEG')]
  ] as const

  return {
    id: 'CH06-INPUT',
    context: { domain: 'ch06' },
    values: Object.fromEntries(entries.filter((entry) => entry[1] !== undefined)) as Record<
      string,
      CalculationInputValue
    >
  }
}

const expectedAggregate = (states: readonly EvidenceState[]) => {
  if (states.some((state) => state === 'missing' || state === 'non-finite' || state === 'wrong-unit')) {
    return 'UNSUPPORTED' as const
  }
  if (states.some((state) => state === 'fail')) return 'FAIL' as const
  return 'PASS' as const
}

const serviceFixture = (): ServiceTopologySource => ({
  fixtureId: 'CH06-SERVICE',
  planFixtureId: 'CH06-PLAN',
  structuralFixtureId: 'CH06-STRUCTURE',
  protectedPrimaryFreeSpaceIds: [],
  nodes: [
    {
      id: 'A',
      kind: 'plant',
      label: 'A',
      hostSpaceIds: [],
      requiredAccessKinds: [],
      provisional: false
    },
    {
      id: 'B',
      kind: 'distribution-hub',
      label: 'B',
      hostSpaceIds: [],
      requiredAccessKinds: [],
      provisional: false
    },
    {
      id: 'C',
      kind: 'terminal',
      label: 'C',
      hostSpaceIds: [],
      requiredAccessKinds: [],
      provisional: false
    }
  ],
  routes: [
    {
      id: 'AB',
      networkId: 'N',
      serviceClass: 'domestic-water',
      fromNodeId: 'A',
      toNodeId: 'B',
      role: 'distribution',
      hostSpaceIds: [],
      crossingIds: [],
      primaryInfrastructure: false,
      structuralInteraction: 'none',
      provisional: false
    },
    {
      id: 'BC',
      networkId: 'N',
      serviceClass: 'domestic-water',
      fromNodeId: 'B',
      toNodeId: 'C',
      role: 'distribution',
      hostSpaceIds: [],
      crossingIds: [],
      primaryInfrastructure: false,
      structuralInteraction: 'none',
      provisional: false
    }
  ],
  networks: [
    {
      id: 'N',
      label: 'Network',
      serviceClasses: ['domestic-water'],
      requiredNodeIds: ['A', 'C'],
      routeIds: ['AB', 'BC']
    }
  ],
  crossings: [],
  access: []
})

describe('CH-06 geometry laws', () => {
  test('deterministically attacks symmetry, containment, overlap bounds and translation invariance', () => {
    const next = createDeterministicRandom(0x484b_0006)

    for (let caseIndex = 0; caseIndex < 512; caseIndex += 1) {
      const a = randomBox(next)
      const b = randomBox(next)
      const dx = randomInteger(next, -5_000, 5_000)
      const dy = randomInteger(next, -5_000, 5_000)
      const translatedA = translateBox(a, dx, dy)
      const translatedB = translateBox(b, dx, dy)
      const overlap = overlapArea(a, b)

      assert.equal(isValidBox(a), true, `case ${caseIndex}: generated box A should be valid`)
      assert.equal(isValidBox(b), true, `case ${caseIndex}: generated box B should be valid`)
      assert.equal(overlap, overlapArea(b, a), `case ${caseIndex}: overlap symmetry`)
      assert.equal(boxesIntersect(a, b), boxesIntersect(b, a), `case ${caseIndex}: intersection symmetry`)
      assert.equal(areAdjacent(a, b), areAdjacent(b, a), `case ${caseIndex}: adjacency symmetry`)
      assert.equal(containsBox(a, a), true, `case ${caseIndex}: self-containment`)
      assert.ok(overlap >= 0, `case ${caseIndex}: overlap cannot be negative`)
      assert.ok(
        overlap <= Math.min(a.width * a.height, b.width * b.height),
        `case ${caseIndex}: overlap cannot exceed either box area`
      )
      if (overlap > 0) assert.equal(boxesIntersect(a, b), true, `case ${caseIndex}: positive overlap implies intersection`)
      if (areAdjacent(a, b)) assert.equal(boxesIntersect(a, b), true, `case ${caseIndex}: adjacency implies intersection`)

      assert.equal(overlapArea(translatedA, translatedB), overlap, `case ${caseIndex}: translated overlap`)
      assert.equal(
        boxesIntersect(translatedA, translatedB),
        boxesIntersect(a, b),
        `case ${caseIndex}: translated intersection`
      )
      assert.equal(
        areAdjacent(translatedA, translatedB),
        areAdjacent(a, b),
        `case ${caseIndex}: translated adjacency`
      )
      assert.equal(
        containsBox(translatedA, translatedA),
        containsBox(a, a),
        `case ${caseIndex}: translated containment`
      )
    }
  })

  test('pins the box-geometry tolerance boundary without changing its value', () => {
    const a: Box2D = { kind: 'box2d', x: 0, y: 0, width: 10, height: 10 }
    const within = { ...a, x: 10 + BOX_GEOMETRY_EPSILON / 2 }
    const outside = { ...a, x: 10 + BOX_GEOMETRY_EPSILON * 2 }
    const containedWithin = { ...a, x: -BOX_GEOMETRY_EPSILON / 2 }
    const containedOutside = { ...a, x: -BOX_GEOMETRY_EPSILON * 2 }

    assert.equal(boxesIntersect(a, within), true)
    assert.equal(areAdjacent(a, within), true)
    assert.equal(boxesIntersect(a, outside), false)
    assert.equal(areAdjacent(a, outside), false)
    assert.equal(containsBox(a, containedWithin), true)
    assert.equal(containsBox(a, containedOutside), false)
  })
})

describe('CH-06 calculation-kernel laws', () => {
  test('aggregate status obeys UNSUPPORTED > FAIL > PASS for every evidence-state combination and criterion order', () => {
    const states: EvidenceState[] = ['pass', 'fail', 'missing', 'non-finite', 'wrong-unit']
    const method = syntheticMethod()
    const criterionOrders = permutations(method.criteria)

    for (const a of states) {
      for (const b of states) {
        for (const c of states) {
          const evidenceStates = [a, b, c] as const
          const expected = expectedAggregate(evidenceStates)
          const input = syntheticInput(evidenceStates)

          for (const criteria of criterionOrders) {
            const result = runCalculationCheck({ ...method, criteria }, input)
            assert.equal(result.status, expected, `${evidenceStates.join('/')} under criterion permutation`)
          }
        }
      }
    }
  })

  test('generated inclusive ranges and maxima accept exact boundaries and reject values immediately beyond them', () => {
    const next = createDeterministicRandom(0x4341_4c43)

    for (let caseIndex = 0; caseIndex < 256; caseIndex += 1) {
      const min = randomInteger(next, -1_000, 1_000)
      const span = randomInteger(next, 1, 1_000)
      const max = min + span
      const method: CalculationMethod = {
        ...syntheticMethod(),
        criteria: [
          {
            id: 'GENERATED-RANGE',
            inputKey: 'value',
            label: 'Generated range',
            kind: 'inclusive-range',
            unit: 'mm',
            min,
            max,
            authorityRef: 'synthetic:generated-range'
          }
        ]
      }
      const input = (value: number): CalculationCheckInput => ({
        id: `GENERATED-${caseIndex}`,
        context: { domain: 'ch06' },
        values: { value: { value, unit: 'mm', sourceIds: ['GENERATED'] } }
      })

      assert.equal(runCalculationCheck(method, input(min)).status, 'PASS')
      assert.equal(runCalculationCheck(method, input(max)).status, 'PASS')
      assert.equal(runCalculationCheck(method, input(min - 1)).status, 'FAIL')
      assert.equal(runCalculationCheck(method, input(max + 1)).status, 'FAIL')

      const maximumMethod: CalculationMethod = {
        ...method,
        criteria: [
          {
            id: 'GENERATED-MAX',
            inputKey: 'value',
            label: 'Generated maximum',
            kind: 'maximum',
            unit: 'mm',
            max,
            authorityRef: 'synthetic:generated-max'
          }
        ]
      }
      assert.equal(runCalculationCheck(maximumMethod, input(max)).status, 'PASS')
      assert.equal(runCalculationCheck(maximumMethod, input(max + 1)).status, 'FAIL')
    }
  })
})

describe('CH-06 service-connectivity metamorphic laws', () => {
  test('semantically irrelevant collection and network-member order does not change derived topology', () => {
    const canonical = serviceFixture()
    const permuted = structuredClone(canonical)
    permuted.nodes.reverse()
    permuted.routes.reverse()
    permuted.networks[0].requiredNodeIds.reverse()
    permuted.networks[0].routeIds.reverse()

    assert.deepEqual(deriveServiceTopology(permuted), deriveServiceTopology(canonical))
    assert.equal(deriveServiceTopology(canonical).networks[0].connected, true)
  })

  test('removing either required bridge disconnects the bounded network', () => {
    for (const bridgeId of ['AB', 'BC']) {
      const source = serviceFixture()
      source.routes = source.routes.filter((route) => route.id !== bridgeId)

      assert.equal(
        deriveServiceTopology(source).networks[0].connected,
        false,
        `removing bridge ${bridgeId} should disconnect A from C`
      )
    }
  })

  test('excluding an existing bridge from the network route set also disconnects the bounded network', () => {
    for (const bridgeId of ['AB', 'BC']) {
      const source = serviceFixture()
      source.networks[0].routeIds = source.networks[0].routeIds.filter((routeId) => routeId !== bridgeId)

      assert.equal(
        deriveServiceTopology(source).networks[0].connected,
        false,
        `excluding bridge ${bridgeId} should disconnect A from C`
      )
    }
  })
})
