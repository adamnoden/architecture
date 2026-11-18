import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const receipt = JSON.parse(readFileSync(new URL(
  '../../project/mat/studies/rear-wc-west-roof-interface.json', import.meta.url,
), 'utf8')).dryReturnComparison

test('the current compiler recomputes the low oblique dry return and its independent roof and head reservations', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  assert.deepEqual(request.vent.riserAxisXYMm, [775, 9090])
  const result = await compile.rearFoulVent(request.vent)
  assert.equal(result.status, 'computed-comparison')
  assert.deepEqual(result.comparison, receipt.lowObliqueReturn)
  assert.equal(result.comparison.state, 'bounded-dry-return-comparison')
  assert.equal(result.comparison.installedAcceptance, false)
  const { modelledOpenings, roofBoundary, siteOpenings, terminalCover, otherBuildingVentilation } =
    result.comparison.terminalApplicability
  assert.equal(modelledOpenings.state, 'passes')
  assert.equal(modelledOpenings.inventoryCount, 70)
  assert.equal(modelledOpenings.governingKnownOpening?.id, 'FIRST/west-window-3')
  assert.equal(modelledOpenings.governingKnownOpening?.heightReserveMm, 800)
  assert.equal(modelledOpenings.nearestModelledAirIntake?.id, 'living-supply')
  assert.ok((modelledOpenings.nearestModelledAirIntake?.comparisonDistanceMm ?? 0) > 3500)
  const northWindow = modelledOpenings.nearby.find(row => row.id === 'FIRST/north-window-0')
  assert.ok(northWindow)
  assert.ok(northWindow.axisDistanceMm > 3000 && northWindow.comparisonDistanceMm < 3000)
  for (const unresolved of [roofBoundary, siteOpenings, terminalCover, otherBuildingVentilation]) {
    assert.equal(unresolved.state, 'unresolved')
  }
  assert.ok(result.comparison.clearanceMm.westWindowRawPlan >= 25)
  assert.ok(result.comparison.clearanceMm.rearRadiatorAndCarrier >= 25)
  assert.equal(result.comparison.clearanceMm.westPurlinsCompleteFlashingPlan, 30)
  assert.ok(result.comparison.clearanceMm.headRenewalDeck > 390)
  assert.ok(result.comparison.hostAndRenewalUnresolved?.some(duty => duty.startsWith('NW port stays')))
  assert.equal(result.drawing?.viewId, 'MAT-REAR-FOUL-VENT-PLAN')
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, [
    '--import', 'tsx', 'scripts/compile-current-design.ts', '--rear-foul-vent', '-',
  ], { input: JSON.stringify(request), encoding: 'utf8' })), result)
})

test('the two rejected dry alternatives preserve the wet stack and both branch duties', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  const direct = await compile.rearFoulVent({ ...request.vent, riserAxisXYMm: [670, 9400] })
  assert.equal(direct.status, 'computed-comparison')
  assert.deepEqual(direct.comparison.failedChecks, receipt.directFormerAxis.failedChecks)
  assert.ok(direct.comparison.clearanceMm.rearBathExtractFullCollar < -148)
  assert.equal(direct.comparison.clearanceMm.westPurlinsCompleteFlashingPlan, -75)

  const high = await compile.rearFoulVent({
    ...request.vent, riserAxisXYMm: [775, 9140], wetStackAirTakeoffZMm: 5550,
  })
  assert.equal(high.status, 'computed-comparison')
  assert.deepEqual(high.comparison.failedChecks, receipt.highReturn.failedChecks)
  assert.ok(high.comparison.clearanceMm.rearBathExtractFullCollar >= 25)
  assert.ok(high.comparison.clearanceMm.headRenewalDeck < -106)
  for (const compared of [direct.comparison, high.comparison]) {
    assert.equal(compared.state, 'geometric-failure')
    assert.deepEqual(compared.wet, receipt.lowObliqueReturn.wet)
  }
})

test('the west buried run checks both cover endpoints and the full direct plan envelope', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  const baseline = await compile.rearFoulVent(request.vent)
  assert.equal(baseline.status, 'computed-comparison')
  assert.deepEqual(baseline.buriedReceiving.failedChecks, ['MINIMUM_CROWN_COVER'])
  assert.ok(Math.abs(baseline.buriedReceiving.stackCoverMm - 555.4046) < 0.01)
  assert.ok(Math.abs(baseline.buriedReceiving.maximumHostAxisZMm + 2524.5954) < 0.01)
  const trial = {
    ...request.vent,
    buriedReceiving: { hostAxisXYZMm: [-450, 11177.5, -2530] as const, stackGradeZMm: -1800, hostGradeZMm: -1800 },
  }
  const deeper = await compile.rearFoulVent(trial)
  assert.equal(deeper.status, 'computed-comparison')
  assert.equal(deeper.buriedReceiving.state, 'bounded-direct-run-comparison')
  assert.equal(deeper.buriedReceiving.installedAcceptance, false)
  assert.deepEqual(deeper.comparison, baseline.comparison)
  assert.notEqual(deeper.source.caseDigest, baseline.source.caseDigest)
  const lowGrade = await compile.rearFoulVent({ ...trial, buriedReceiving: { ...trial.buriedReceiving, hostGradeZMm: -1880 } })
  assert.equal(lowGrade.status, 'computed-comparison')
  assert.ok(lowGrade.buriedReceiving.stackCoverMm > 600)
  assert.equal(lowGrade.buriedReceiving.hostCoverMm, 570)
  assert.deepEqual(lowGrade.buriedReceiving.failedChecks, ['MINIMUM_CROWN_COVER'])
  const inward = await compile.rearFoulVent({
    ...trial, buriedReceiving: { ...trial.buriedReceiving, hostAxisXYZMm: [-90, 11177.5, -2600] },
  })
  assert.equal(inward.status, 'computed-comparison')
  assert.deepEqual(inward.buriedReceiving.failedChecks, ['WEST_GIRDER_PLAN_CLEARANCE'])
  assert.equal(inward.buriedReceiving.westGirderClearanceMm, -7.5)
  await assert.rejects(compile.rearFoulVent({
    ...trial, buriedReceiving: { ...trial.buriedReceiving, hostAxisXYZMm: [-300, 9400, -2600] },
  }), /nonzero/)
})

test('a supported dry offset recomputes clearances, while missing tangent, stale and unbound cases fail closed', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  const moved = await compile.rearFoulVent({ ...request.vent, riserAxisXYMm: [775, 9085] })
  assert.equal(moved.status, 'computed-comparison')
  assert.equal(moved.comparison.state, 'bounded-dry-return-comparison')
  assert.ok(moved.comparison.clearanceMm.westWindowRawPlan > receipt.lowObliqueReturn.clearanceMm.westWindowRawPlan)
  assert.deepEqual(moved.comparison.wet, receipt.lowObliqueReturn.wet)

  const short = await compile.rearFoulVent({ ...request.vent, wetStackAirTakeoffZMm: 3650 })
  assert.equal(short.status, 'computed-comparison')
  assert.deepEqual(short.comparison.failedChecks, ['BEND_TANGENT_LENGTH'])
  await assert.rejects(compile.rearFoulVent({ ...request.vent, bindingDigest: 'stale' }), /source binding/)
  const candidate = prepareCurrentDesignCompile({
    ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-NO-OCCUPIED-FOUL-BASIS', state: 'candidate' },
    envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 10 },
  })
  assert.equal((await candidate.rearFoulVent(request.vent)).status, 'unavailable')
})

test('finite intake faces apply the horizontal edge and fail with insufficient height', () => {
  const cases = JSON.parse(execFileSync('python3', ['-B', '-c', `
from json import dumps
from runpy import run_path
m = run_path('project/mat/studies/rear-wc-west-roof-interface.py')
house = {
    'shell':12000, 'court':[4250,4250,3500,3500],
    'sections':{'groundFFL':0,'firstFFL':3450},
    'openings':{'GROUND':[{'id':'headless-test','kind':'door','wall':'outer-west','width':100,'centre':1200}]}
}
def case(along, architecture):
    intake = [{'id':'test-supply','wall':'outer-west','point':[0,along,7050],
               'width':200,'outerProjectionMaximumMM':100}]
    openings = m['terminal_opening_envelopes'](architecture, intake)
    return m['terminal_opening_check']([0,0,8000], openings, 95)
empty = {**house,'openings':{}}
court_face = [{'id':'court-supply','wall':'court-east','point':[7750,5000,7000],
               'width':200,'outerProjectionMaximumMM':100}]
court = m['terminal_opening_check']([4750,5000,8000],
                                    m['terminal_opening_envelopes'](empty,court_face),0)
print(dumps({
    'inside':case(3194, empty), 'edge':case(3195, empty),
    'outsideWithMissingHeight':case(3196, house), 'court':court,
}))
`], { encoding: 'utf8' }))
  assert.equal(cases.inside.state, 'fails')
  assert.equal(cases.inside.governingKnownOpening.kind, 'air-intake')
  assert.equal(cases.inside.governingKnownOpening.axisDistanceMm, 3094)
  assert.equal(cases.inside.governingKnownOpening.comparisonDistanceMm, 2999)
  assert.equal(cases.inside.governingKnownOpening.heightReserveMm, -50)
  assert.equal(cases.edge.state, 'passes')
  assert.deepEqual(cases.edge.nearby, [])
  assert.equal(cases.edge.nearestModelledAirIntake.comparisonDistanceMm, 3000)
  assert.equal(cases.outsideWithMissingHeight.state, 'unresolved')
  assert.deepEqual(cases.outsideWithMissingHeight.nearbyOpeningsWithoutHeight, ['GROUND/headless-test'])
  assert.equal(cases.outsideWithMissingHeight.governingKnownOpening, null)
  assert.equal(cases.outsideWithMissingHeight.nearestModelledAirIntake.comparisonDistanceMm, 3001)
  assert.equal(cases.court.nearby[0].axisDistanceMm, 2900)
  assert.equal(cases.court.nearby[0].heightReserveMm, 0)
})
