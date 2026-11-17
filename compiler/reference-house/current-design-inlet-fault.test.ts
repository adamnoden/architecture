import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const compile = prepareCurrentDesignCompile(design)
const cli = (mode: string, input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
  { input: JSON.stringify(input), encoding: 'utf8' })
const nominal = async () => {
  const request = await compile.readInletFaultCase()
  return { request, result: await compile.inletFault(request.fault) }
}

test('the blocked-mouth cases replay the native hydraulic comparison at the two actual sill assemblies', async () => {
  const { request, result } = await nominal()
  assert.equal(result.source.nativeReplay, true)
  assert.equal(result.host.candidateCentreXMm, 9900)
  assert.match(result.method.gitBlob, /^[a-f0-9]{40}$/)
  assert.equal(result.evidence.candidateOnly, true)
  assert.equal(result.evidence.installedPressureAssessment, 'unavailable')
  assert.deepEqual(result.branchCases.map(branch => branch.status), ['within-conditional-open-flow', 'within-conditional-open-flow'])
  const [utility, plant] = result.branchCases
  assert.equal(utility.calculation!.headMm, 139.2521)
  assert.equal(utility.calculation!.wetStageZMm, 322.5438)
  assert.equal(plant.calculation!.wetStageZMm, 422.5438)
  assert.equal(utility.calculation!.dryReserveMm, 10.7479)
  assert.equal(plant.calculation!.receiverFreeDropReserveMm, 11.0126)
  assert.equal(utility.calculation!.upperMouthAboveBoxStageMm, 62.8462)
  assert.equal(plant.calculation!.upperMouthAboveBoxStageMm, 82.8462)
  assert.equal(utility.calculation!.reverseSleeve.reserveToAirLimitMM, 13.2775)
  assert.equal(plant.calculation!.highVentAboveBoxStageMm, 224.4562)
  assert.ok(result.branchCases.every(branch => branch.normalSleeve === 'outside-mouth-blocked' &&
    branch.installedPressureAssessment === 'unavailable'))

  const exported = cli('--read-inlet-fault', design)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), request)
  const compiled = cli('--inlet-fault', request)
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.deepEqual(JSON.parse(compiled.stdout), result)
})

test('increased entrance loss and bed obstruction consume the real dry reserve without affecting the sibling', async () => {
  const { request: { fault }, result: baseline } = await nominal()
  const loss = await compile.inletFault({ ...fault, branches: { ...fault.branches,
    utility: { ...fault.branches.utility, entranceLossK: 2 },
  } })
  const [utility, plant] = loss.branchCases
  assert.equal(utility.status, 'blocked')
  assert.equal(utility.calculation!.dryReserveMm, -1.8242)
  assert.equal(utility.calculation!.receiverFreeDropReserveMm, baseline.branchCases[0].calculation!.receiverFreeDropReserveMm)
  assert.ok(utility.diagnostic.some(entry => entry.code === 'TROUGH_DRY_RESERVE'))
  assert.deepEqual(plant, baseline.branchCases[1])
  assert.equal(loss.source.nativeReplay, false)
  assert.equal(loss.source.insertCaseDigest, baseline.source.insertCaseDigest)
  assert.notEqual(loss.source.caseDigest, baseline.source.caseDigest)
  const stage = loss.drawing.primitives.find(primitive => primitive.id === 'utility-box-stage')
  assert.equal(stage?.metadata?.fromZmm, utility.calculation!.wetStageZMm)

  const obstruction = await compile.inletFault({ ...fault, branches: { ...fault.branches,
    utility: { ...fault.branches.utility, reliefBedMm: 45 },
  } })
  assert.ok(obstruction.branchCases[0].calculation!.criticalReliefDepthMm > baseline.branchCases[0].calculation!.criticalReliefDepthMm)
  assert.equal(obstruction.branchCases[0].status, 'blocked')
  assert.deepEqual(obstruction.branchCases[1], baseline.branchCases[1])
})

test('imposed tailwater applies to just the affected receiver, and loss of either open path withholds water-stage evidence', async () => {
  const { request: { fault }, result: baseline } = await nominal()
  const trapped = await compile.inletFault({ ...fault, branches: { ...fault.branches,
    plant: { ...fault.branches.plant, receiverTailwaterZMm: 165 },
  } })
  assert.deepEqual(trapped.branchCases[0], baseline.branchCases[0])
  const plant = trapped.branchCases[1]
  assert.equal(plant.status, 'blocked')
  assert.equal(plant.calculation!.receiverFreeDropReserveMm, -6.6667)
  assert.equal(plant.calculation!.receiverBoundary, 'imposed-level-discharge-unproved')
  assert.ok(plant.diagnostic.some(entry => entry.code === 'RECEIVER_FREE_DROP'))

  const imposed = await compile.inletFault({ ...fault, branches: { ...fault.branches,
    plant: { ...fault.branches.plant, receiverTailwaterZMm: 152 },
  } })
  assert.equal(imposed.branchCases[1].status, 'receiver-boundary-unproved')
  assert.ok(imposed.branchCases[1].calculation!.receiverFreeDropReserveMm > 0)

  for (const [key, code] of [['highHoodOpen', 'HOOD_UNAVAILABLE'], ['lowerReliefOpen', 'RELIEF_UNAVAILABLE']] as const) {
    const unavailable = await compile.inletFault({ ...fault, branches: { ...fault.branches,
      utility: { ...fault.branches.utility, [key]: false },
    } })
    assert.equal(unavailable.branchCases[0].status, 'no-passive-path')
    assert.equal(unavailable.branchCases[0].calculation, null)
    assert.ok(unavailable.branchCases[0].diagnostic.some(entry => entry.code === code))
    assert.equal(unavailable.drawing.primitives.some(primitive => primitive.id === 'utility-box-stage'), false)
    assert.deepEqual(unavailable.branchCases[1], baseline.branchCases[1])
  }
})

test('stale sill geometry, unsupported inputs and unbound candidate plans cannot replay a fault envelope', async () => {
  const { fault } = await compile.readInletFaultCase()
  await assert.rejects(compile.inletFault({ ...fault, insertCaseDigest: 'other-insert' }), /source binding/)
  await assert.rejects(compile.inletFault({ ...fault, branches: { utility: fault.branches.utility } }), /two independent branches/)
  await assert.rejects(compile.inletFault({ ...fault, branches: { ...fault.branches,
    plant: { ...fault.branches.plant, flowLmin: 500 },
  } }), /plant fault inputs exceed/)
  const specimen = prepareCurrentDesignCompile({
    ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-NO-HAD-FAULT', state: 'candidate' },
  })
  await assert.rejects(specimen.inletFault(fault), /applicable HAD relief and STR sill bindings/)
})
