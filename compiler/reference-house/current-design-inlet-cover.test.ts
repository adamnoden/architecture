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

test('the model sustains a straight release and an offset first rest for each branch with the washer parked', async () => {
  const requests = await compile.readInletCoverCases()
  const [utility, plant] = await Promise.all(requests.map(({ cover }) => compile.inletCover(cover)))
  assert.deepEqual([utility.branch, plant.branch], ['utility', 'plant'])
  assert.deepEqual([utility.calculation.beyondFrontToTurnMm, plant.calculation.beyondFrontToTurnMm], [132, 167])
  assert.deepEqual([utility.calculation.frontBridgeAvailableMm, plant.calculation.frontBridgeAvailableMm], [43, 78])
  assert.deepEqual(utility.calculation.firstRest.boundsMm, { x: [9909, 10033], y: [670, 797] })
  assert.deepEqual(plant.calculation.firstRest.boundsMm, { x: [10332, 10456], y: [670, 832] })
  for (const result of [utility, plant]) {
    assert.equal(result.status, 'within-conditional-cover-screen')
    assert.equal(result.calculation.clearStationaryRiserMm, 84)
    assert.equal(result.calculation.parkedCarrierClearanceMm, 5)
    assert.equal(result.calculation.carrierTravelToContactMm, null)
    assert.equal(result.calculation.sideLandReserveMm, 3)
    assert.equal(result.calculation.receiverBearingReserveMm, 1)
    assert.equal(result.calculation.firstRest.captureQualified, false)
    assert.equal(result.evidence.wetClosure, 'unqualified')
    assert.match(result.source.gitBlob, /^[a-f\d]{40}$/)
  }
  assert.ok(utility.calculation.firstRest.boundsMm.x[1] < plant.calculation.firstRest.boundsMm.x[0])

  const exported = cli('--read-inlet-cover', design)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), requests)
  const compiled = cli('--inlet-cover', requests[0])
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.deepEqual(JSON.parse(compiled.stdout), JSON.parse(JSON.stringify(utility)))
})

test('an inline cover rest blocks the carrier and the installed washer blocks both side-transfer starts', async () => {
  const requests = await compile.readInletCoverCases()
  for (const [{ cover }, washerDeficit] of requests.map((request, i) => [request, [7, 42][i]] as const)) {
    const inline = await compile.inletCover({ ...cover, axialTravelMm: 84, sideTravelMm: 0 })
    assert.equal(inline.status, 'blocked')
    assert.equal(inline.calculation.carrierTravelToContactMm, 84)
    assert.ok(inline.diagnostics.some(({ code }) => code === 'FIRST_REST_OVERLAPS_CARRIER_CORRIDOR'))
    assert.equal(inline.diagnostics.some(({ code }) => code === 'RISER_STILL_ENGAGED'), false)

    const installed = await compile.inletCover({ ...cover, washer: 'installed' })
    assert.equal(installed.status, 'blocked')
    assert.equal(installed.calculation.washerAxialAvailableMm, 125)
    assert.equal(installed.calculation.washerTravelReserveMm, -washerDeficit)
    assert.ok(installed.diagnostics.some(({ code }) => code === 'WASHER_OBSTRUCTS_AXIAL_RELEASE'))

    const early = await compile.inletCover({ ...cover, axialTravelMm: cover.axialTravelMm - 5 })
    assert.equal(early.calculation.turnReserveMm, -5)
    assert.ok(early.diagnostics.some(({ code }) => code === 'TURN_CROSSES_RETAINED_FRONT'))
  }
})

test('side shift and bearing allowances show specific changed geometry and keep stale evidence excluded', async () => {
  const [{ cover }] = await compile.readInletCoverCases()
  const nominal = await compile.inletCover(cover)
  const tooNear = await compile.inletCover({ ...cover, sideTravelMm: cover.sideTravelMm + 10, receiverRailWidthMm: 12 })
  assert.equal(tooNear.status, 'blocked')
  assert.equal(tooNear.calculation.parkedCarrierClearanceMm, -5)
  assert.equal(tooNear.calculation.receiverBearingReserveMm, -1)
  assert.notEqual(tooNear.source.caseDigest, nominal.source.caseDigest)
  assert.notDeepEqual(tooNear.drawing.primitives, nominal.drawing.primitives)
  assert.equal(tooNear.source.removalCaseDigest, nominal.source.removalCaseDigest)
  const wide = await compile.inletCover({ ...cover, cheekMm: 25, minimumFrontBridgeMm: 44 })
  assert.equal(wide.calculation.sideLandReserveMm, -2)
  assert.deepEqual(wide.diagnostics.map(({ code }) => code),
    ['SIDE_LAND_OVERBOOKED', 'FRONT_BRIDGE_TOO_SHORT', 'FIRST_REST_OVERLAPS_CARRIER_CORRIDOR'])
  await assert.rejects(compile.inletCover({ ...cover, removalCaseDigest: 'other-removal' }), /source binding/)
  await assert.rejects(compile.inletCover({ ...cover, sideTravelMm: Number.MAX_VALUE }), /screened motion range/)
  await assert.rejects(compile.inletCover({ ...cover, anotherField: true }), /versioned south inlet cover case/)
})

test('the installed filler and formed vent are screened separately from the opened cover sweep', async () => {
  const [{ cover: utility }, { cover: plant }] = await compile.readInletCoverCases()
  const west = await compile.inletCover(utility)
  const east = await compile.inletCover(plant)
  assert.equal(west.status, 'within-conditional-cover-screen')
  assert.equal(west.installedClosure.status, 'blocked')
  assert.equal(west.installedClosure.clearance.installedCoverToCellSideAfterSettingMm, -45)
  assert.equal(east.installedClosure.clearance.installedCoverToCellSideAfterSettingMm, 18)
  assert.equal(east.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm, -1.39)
  assert.equal(east.installedClosure.clearance.collarRadialSealLandAfterSettingMm, 2)
  assert.deepEqual(east.installedClosure.diagnostics, ['COLLAR_RADIAL_SEAL_LAND_SHORT', 'WALL_RETURN_INTERCEPTS_FORMED_VENT'])

  const closure = { notchLapMm: 10, collarSealLandMm: 4, collarOutsideDiameterMm: 92, wallReturnDepthMm: 10 }
  const refit = await compile.inletCover({ ...plant, closure })
  assert.equal(refit.installedClosure.status, 'within-conditional-closure-fit')
  assert.equal(refit.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm, 0.61)
  assert.equal(refit.installedClosure.clearance.collarInsideFillerAfterSettingMm, 1)
  assert.equal(refit.installedClosure.wetClosureQualified, false)
  assert.equal(refit.installedClosure.splitFillerReleaseQualified, false)
  assert.deepEqual((await compile.inletCover({ ...utility, closure })).installedClosure.diagnostics,
    ['RECTANGULAR_COVER_EXCEEDS_INSTALLED_CELL_PLAN'])
  await assert.rejects(compile.inletCover({ ...plant, closure: { ...closure, notchLapMm: 0 } }), /closure comparison/)
  await assert.rejects(compile.inletCover({ ...plant, closure: null }), /closure comparison/)
})

test('a rounded Utility lid proves the shape and declares the axial withdrawal stages without inventing a qualified seal', async () => {
  const [{ cover: utility }, { cover: plant }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 10, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true }
  const attempted = await compile.inletCover({ ...utility, closure })
  const taper = attempted.installedClosure.roundedTaper
  assert.ok(taper)
  assert.equal(taper.centreToTaperMm, 54.402)
  assert.equal(taper.maximumConcentricLapAfterSettingMm, 7.402)
  assert.equal(taper.minimumConcentricLapForCollarMm, 9)
  assert.equal(taper.fillerToTaperAfterSettingMm, -2.598)
  assert.deepEqual(attempted.installedClosure.diagnostics, ['ROUND_FILLER_INTERSECTS_TAPER'])
  assert.equal(attempted.roundedRelease?.status, 'within-declared-rounded-release-screen')
  assert.equal(attempted.roundedRelease?.assembledCandidateStatus, 'blocked')
  assert.equal(attempted.roundedRelease?.axialStrokeToClearRiserMm, 84)
  assert.equal(attempted.roundedRelease?.axialStrokeBeforeSideTransferMm, 132)
  assert.equal(attempted.drawing.primitives.filter(item => item.id.startsWith('rounded-outer-closed-')).length, 5)
  assert.equal(attempted.drawing.primitives.filter(item => item.id.startsWith('rounded-notch-arc-')).length, 16)

  const narrowLap = await compile.inletCover({ ...utility, closure: { ...closure, notchLapMm: 7 } })
  assert.ok(narrowLap.installedClosure.diagnostics.includes('COLLAR_EXCEEDS_FILLER'))
  const reducedLand = { ...closure, notchLapMm: 7, collarSealLandMm: 2, collarOutsideDiameterMm: 88 }
  const conditional = await compile.inletCover({ ...utility, closure: reducedLand })
  assert.equal(conditional.installedClosure.roundedTaper?.fillerToTaperAfterSettingMm, 0.402)
  assert.equal(conditional.roundedRelease?.assembledCandidateStatus, 'within-conditional-fit-and-withdrawal')
  assert.equal(conditional.roundedRelease?.captureQualified, false)
  assert.equal(conditional.roundedRelease?.splitFillerWithdrawalQualified, false)

  const locked = await compile.inletCover({ ...utility, closure: {
    ...reducedLand, taperDetached: false, fillerAndCollarClear: false,
  } })
  assert.equal(locked.roundedRelease?.assembledCandidateStatus, 'blocked')
  assert.deepEqual(locked.roundedRelease?.diagnostics, ['FILLER_AND_COLLAR_REMAIN_ENGAGED', 'UTILITY_TAPER_REMAINS_ATTACHED'])
  await assert.rejects(compile.inletCover({ ...plant, closure }), /rounded Utility taper/)
})
